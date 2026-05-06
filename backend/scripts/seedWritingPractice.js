/**
 * Seed script – Writing Practice exercises
 * Run: node backend/scripts/seedWritingPractice.js
 * (from repo root, with MONGO_URI in .env or environment)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const WPTopic   = require('../models/WPTopic');
const WPLesson  = require('../models/WPLesson');
const WPExercise = require('../models/WPExercise');

// ──────────────────────────────────────────────────────────────
//  TOPICS
// ──────────────────────────────────────────────────────────────
const TOPICS = [
  { key:'myself',      title:'Myself',      titleVi:'Bản thân',      category:'personal',  levels:['beginner','elementary'], orderIndex:1 },
  { key:'family',      title:'Family',      titleVi:'Gia đình',       category:'personal',  levels:['beginner','elementary'], orderIndex:2 },
  { key:'hobbies',     title:'Hobbies',     titleVi:'Sở thích',       category:'personal',  levels:['beginner','elementary'], orderIndex:3 },
  { key:'school',      title:'School',      titleVi:'Trường học',     category:'social',    levels:['beginner'],             orderIndex:4 },
  { key:'friends',     title:'Friends',     titleVi:'Bạn bè',         category:'social',    levels:['beginner'],             orderIndex:5 },
  { key:'food',        title:'Food',        titleVi:'Ẩm thực',        category:'social',    levels:['beginner'],             orderIndex:6 },
  { key:'technology',  title:'Technology',  titleVi:'Công nghệ',      category:'academic',  levels:['elementary'],           orderIndex:7 },
  { key:'travel',      title:'Travel',      titleVi:'Du lịch',        category:'social',    levels:['elementary'],           orderIndex:8 },
  { key:'environment', title:'Environment', titleVi:'Môi trường',     category:'academic',  levels:['intermediate'],         orderIndex:9 },
  { key:'health',      title:'Health',      titleVi:'Sức khỏe',       category:'academic',  levels:['intermediate'],         orderIndex:10 },
];

// ──────────────────────────────────────────────────────────────
//  LESSONS  (one per topic-level combination)
// ──────────────────────────────────────────────────────────────
const LESSONS = [
  // beginner
  { topicKey:'myself',  level:'beginner',      title:'Simple Sentences – Myself',       grammarFocus:'Present Simple, be verb',    lessonType:'sentence', difficulty:1, orderIndex:1 },
  { topicKey:'family',  level:'beginner',      title:'Simple Sentences – Family',       grammarFocus:'Present Simple, possessives',lessonType:'sentence', difficulty:1, orderIndex:2 },
  { topicKey:'hobbies', level:'beginner',      title:'Simple Sentences – Hobbies',      grammarFocus:'like + V-ing, frequency',    lessonType:'sentence', difficulty:1, orderIndex:3 },
  { topicKey:'school',  level:'beginner',      title:'Simple Sentences – School',       grammarFocus:'Present Simple, be + adj',   lessonType:'sentence', difficulty:1, orderIndex:4 },
  { topicKey:'friends', level:'beginner',      title:'Simple Sentences – Friends',      grammarFocus:'Present Simple, adjectives', lessonType:'sentence', difficulty:1, orderIndex:5 },
  { topicKey:'food',    level:'beginner',      title:'Simple Sentences – Food',         grammarFocus:'Present Simple, prepositions',lessonType:'sentence', difficulty:1, orderIndex:6 },
  // elementary
  { topicKey:'myself',     level:'elementary', title:'Expanded Sentences – Myself',     grammarFocus:'Frequency adverbs, because', lessonType:'sentence', difficulty:2, orderIndex:7 },
  { topicKey:'family',     level:'elementary', title:'Expanded Sentences – Family',     grammarFocus:'Conjunctions, purpose',      lessonType:'sentence', difficulty:2, orderIndex:8 },
  { topicKey:'hobbies',    level:'elementary', title:'Expanded Sentences – Hobbies',    grammarFocus:'because, so, expansion',     lessonType:'sentence', difficulty:2, orderIndex:9 },
  { topicKey:'technology', level:'elementary', title:'Sentences about Technology',      grammarFocus:'use + to V, purpose clause', lessonType:'sentence', difficulty:2, orderIndex:10 },
  { topicKey:'travel',     level:'elementary', title:'Sentences about Travel',          grammarFocus:'want to V, past simple',     lessonType:'sentence', difficulty:2, orderIndex:11 },
  // intermediate
  { topicKey:'environment', level:'intermediate', title:'Paragraphs – Environment',    grammarFocus:'Conditionals, not only…but also', lessonType:'paragraph', difficulty:3, orderIndex:12 },
  { topicKey:'health',      level:'intermediate', title:'Paragraphs – Health',         grammarFocus:'although, should, cause-effect',   lessonType:'paragraph', difficulty:3, orderIndex:13 },
];

// ──────────────────────────────────────────────────────────────
//  EXERCISES  (migrated from hardcoded array + expanded set)
// ──────────────────────────────────────────────────────────────
const RAW_EXERCISES = [
  // ─── BEGINNER – MYSELF ────────────────────────────────────
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + V + O (Present Simple)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi học tiếng Anh mỗi ngày.',
    hints:['study','English','every day'], sampleAnswer:'I study English every day.', orderIndex:1 },
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + be + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi là học sinh chăm chỉ.',
    hints:['am','hardworking','student'], sampleAnswer:'I am a hardworking student.', orderIndex:2 },
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + like + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích đọc sách.',
    hints:['like','reading','books'], sampleAnswer:'I like reading books.', orderIndex:3 },
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + V + O (Present Simple)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi sống ở Hà Nội.',
    hints:['live','in','Hanoi'], sampleAnswer:'I live in Hanoi.', orderIndex:4 },
  { topicKey:'myself', level:'beginner', type:'rearrange', grammarPoint:'S + have + O',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','have','many','hobbies'], sampleAnswer:'I have many hobbies.', orderIndex:5 },
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + be + adj + at + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi giỏi Toán.',
    hints:['good at','Math'], sampleAnswer:'I am good at Math.', orderIndex:6 },
  { topicKey:'myself', level:'beginner', type:'translation', grammarPoint:'S + V + O + every + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi tập thể dục mỗi buổi sáng.',
    hints:['exercise','every morning'], sampleAnswer:'I exercise every morning.', orderIndex:7 },
  { topicKey:'myself', level:'beginner', type:'fill_blank', grammarPoint:'Possessive adjectives',
    instruction:'Điền vào chỗ trống:', question:'___ name is Minh. [My / I / Me]',
    options:['My','I','Me'], blankAnswer:'My', sampleAnswer:'My name is Minh.', orderIndex:8 },

  // ─── BEGINNER – FAMILY ────────────────────────────────────
  { topicKey:'family', level:'beginner', type:'translation', grammarPoint:'There are / S + have + number + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Gia đình tôi có bốn người.',
    hints:['family','four','members'], sampleAnswer:'My family has four members.', orderIndex:1 },
  { topicKey:'family', level:'beginner', type:'translation', grammarPoint:'S + be + noun (job)',
    instruction:'Dịch sang tiếng Anh:', question:'Bố tôi là kỹ sư.',
    hints:['father','is','engineer'], sampleAnswer:'My father is an engineer.', orderIndex:2 },
  { topicKey:'family', level:'beginner', type:'translation', grammarPoint:'S + be + very + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Mẹ tôi rất chăm chỉ.',
    hints:['mother','very','hardworking'], sampleAnswer:'My mother is very hardworking.', orderIndex:3 },
  { topicKey:'family', level:'beginner', type:'translation', grammarPoint:'S + have + article + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có một người anh trai.',
    hints:['have','an','older brother'], sampleAnswer:'I have an older brother.', orderIndex:4 },
  { topicKey:'family', level:'beginner', type:'rearrange', grammarPoint:'S + V + adverb',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['We','usually','have','dinner','together'], sampleAnswer:'We usually have dinner together.', orderIndex:5 },
  { topicKey:'family', level:'beginner', type:'translation', grammarPoint:'S + be + very + adj + and + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Gia đình tôi rất ấm áp và hạnh phúc.',
    hints:['family','warm','happy'], sampleAnswer:'My family is very warm and happy.', orderIndex:6 },
  { topicKey:'family', level:'beginner', type:'fill_blank', grammarPoint:'Present Simple – 3rd person',
    instruction:'Điền vào chỗ trống:', question:'My sister ___ to school every day. [goes / go / going]',
    options:['goes','go','going'], blankAnswer:'goes', sampleAnswer:'My sister goes to school every day.', orderIndex:7 },

  // ─── BEGINNER – HOBBIES ───────────────────────────────────
  { topicKey:'hobbies', level:'beginner', type:'translation', grammarPoint:'My favorite + noun + be + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Sở thích yêu thích của tôi là chơi bóng đá.',
    hints:['favorite hobby','playing','football'], sampleAnswer:'My favorite hobby is playing football.', orderIndex:1 },
  { topicKey:'hobbies', level:'beginner', type:'translation', grammarPoint:'S + V + O + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi chơi bóng đá vào cuối tuần.',
    hints:['play','football','weekends'], sampleAnswer:'I play football on weekends.', orderIndex:2 },
  { topicKey:'hobbies', level:'beginner', type:'translation', grammarPoint:'S + like + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích nghe nhạc.',
    hints:['like','listening','music'], sampleAnswer:'I like listening to music.', orderIndex:3 },
  { topicKey:'hobbies', level:'beginner', type:'translation', grammarPoint:'V-ing + help + S + V',
    instruction:'Dịch sang tiếng Anh:', question:'Đọc sách giúp tôi thư giãn.',
    hints:['reading','helps','relax'], sampleAnswer:'Reading books helps me relax.', orderIndex:4 },
  { topicKey:'hobbies', level:'beginner', type:'rearrange', grammarPoint:'S + like + V-ing',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','like','playing','games','every','evening'], sampleAnswer:'I like playing games every evening.', orderIndex:5 },
  { topicKey:'hobbies', level:'beginner', type:'translation', grammarPoint:'S + enjoy + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích vẽ tranh vào cuối tuần.',
    hints:['enjoy','drawing','on weekends'], sampleAnswer:'I enjoy drawing on weekends.', orderIndex:6 },
  { topicKey:'hobbies', level:'beginner', type:'fill_blank', grammarPoint:'like + V-ing vs like + to V',
    instruction:'Điền vào chỗ trống:', question:'I like ___ to music. [listening / listen / listens]',
    options:['listening','listen','listens'], blankAnswer:'listening', sampleAnswer:'I like listening to music.', orderIndex:7 },

  // ─── BEGINNER – SCHOOL ────────────────────────────────────
  { topicKey:'school', level:'beginner', type:'translation', grammarPoint:'My favorite + noun + be + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Môn học yêu thích của tôi là Toán.',
    hints:['favorite subject','Math'], sampleAnswer:'My favorite subject is Math.', orderIndex:1 },
  { topicKey:'school', level:'beginner', type:'translation', grammarPoint:'S + be + very + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Giáo viên của tôi rất nhiệt tình.',
    hints:['teacher','enthusiastic'], sampleAnswer:'My teacher is very enthusiastic.', orderIndex:2 },
  { topicKey:'school', level:'beginner', type:'translation', grammarPoint:'S + have + adj + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có nhiều bạn bè ở trường.',
    hints:['have','many','friends','school'], sampleAnswer:'I have many friends at school.', orderIndex:3 },
  { topicKey:'school', level:'beginner', type:'fill_blank', grammarPoint:'Present Simple – 3rd person',
    instruction:'Điền vào chỗ trống:', question:'My teacher ___ very enthusiastic. [is / are / am]',
    options:['is','are','am'], blankAnswer:'is', sampleAnswer:'My teacher is very enthusiastic.', orderIndex:4 },
  { topicKey:'school', level:'beginner', type:'rearrange', grammarPoint:'S + have + adj + noun',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['My','school','has','a','large','library'], sampleAnswer:'My school has a large library.', orderIndex:5 },
  { topicKey:'school', level:'beginner', type:'translation', grammarPoint:'S + V + O + at school',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi học rất chăm chỉ ở trường.',
    hints:['study','very hard','at school'], sampleAnswer:'I study very hard at school.', orderIndex:6 },

  // ─── BEGINNER – FRIENDS ───────────────────────────────────
  { topicKey:'friends', level:'beginner', type:'translation', grammarPoint:'S + have + noun + named + name',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi có một người bạn thân tên là Minh.',
    hints:['close friend','named','Minh'], sampleAnswer:'I have a close friend named Minh.', orderIndex:1 },
  { topicKey:'friends', level:'beginner', type:'translation', grammarPoint:'S + V + together + time',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng tôi đi học cùng nhau mỗi ngày.',
    hints:['go to school','together','every day'], sampleAnswer:'We go to school together every day.', orderIndex:2 },
  { topicKey:'friends', level:'beginner', type:'translation', grammarPoint:'S + be + very + adj + and + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Bạn tôi rất vui tính và thân thiện.',
    hints:['friend','funny','friendly'], sampleAnswer:'My friend is very funny and friendly.', orderIndex:3 },
  { topicKey:'friends', level:'beginner', type:'translation', grammarPoint:'S + V + O + when',
    instruction:'Dịch sang tiếng Anh:', question:'Bạn bè giúp tôi khi tôi gặp khó khăn.',
    hints:['friends','help','difficulties'], sampleAnswer:'Friends help me when I have difficulties.', orderIndex:4 },
  { topicKey:'friends', level:'beginner', type:'fill_blank', grammarPoint:'S + be + adj + to + V',
    instruction:'Điền vào chỗ trống:', question:'I am very lucky ___ have many good friends. [to / for / of]',
    options:['to','for','of'], blankAnswer:'to', sampleAnswer:'I am very lucky to have many good friends.', orderIndex:5 },
  { topicKey:'friends', level:'beginner', type:'rearrange', grammarPoint:'S + always + V + O',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['We','always','help','each','other'], sampleAnswer:'We always help each other.', orderIndex:6 },

  // ─── BEGINNER – FOOD ──────────────────────────────────────
  { topicKey:'food', level:'beginner', type:'translation', grammarPoint:'My favorite + noun + be + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Món ăn yêu thích của tôi là phở.',
    hints:['favorite food','pho'], sampleAnswer:'My favorite food is pho.', orderIndex:1 },
  { topicKey:'food', level:'beginner', type:'translation', grammarPoint:'S + V + O + before + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi ăn sáng trước khi đi học.',
    hints:['have breakfast','before','going to school'], sampleAnswer:'I have breakfast before going to school.', orderIndex:2 },
  { topicKey:'food', level:'beginner', type:'translation', grammarPoint:'S + be + adj',
    instruction:'Dịch sang tiếng Anh:', question:'Phở rất ngon và bổ dưỡng.',
    hints:['pho','delicious','nutritious'], sampleAnswer:'Pho is very delicious and nutritious.', orderIndex:3 },
  { topicKey:'food', level:'beginner', type:'fill_blank', grammarPoint:'Preposition of place',
    instruction:'Điền vào chỗ trống:', question:'I usually have lunch ___ school. [at / in / on]',
    options:['at','in','on'], blankAnswer:'at', sampleAnswer:'I usually have lunch at school.', orderIndex:4 },
  { topicKey:'food', level:'beginner', type:'rearrange', grammarPoint:'S + like + V-ing + for + meal',
    instruction:'Sắp xếp thành câu đúng:', question:'Sắp xếp các từ thành câu hoàn chỉnh:',
    baseWords:['I','like','eating','pho','for','breakfast'], sampleAnswer:'I like eating pho for breakfast.', orderIndex:5 },
  { topicKey:'food', level:'beginner', type:'translation', grammarPoint:'S + V + O + with + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích ăn cơm với gia đình.',
    hints:['like eating','rice','with my family'], sampleAnswer:'I like eating rice with my family.', orderIndex:6 },

  // ─── ELEMENTARY – MYSELF ──────────────────────────────────
  { topicKey:'myself', level:'elementary', type:'translation', grammarPoint:'Frequency adverb (usually)',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thường học tiếng Anh vào buổi tối.',
    hints:['usually','study','in the evening'], sampleAnswer:'I usually study English in the evening.', orderIndex:1 },
  { topicKey:'myself', level:'elementary', type:'translation', grammarPoint:'S + V + O + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích đọc sách vì nó giúp tôi học từ mới.',
    hints:['because','helps','learn new words'], sampleAnswer:'I like reading books because it helps me learn new words.', orderIndex:2 },
  { topicKey:'myself', level:'elementary', type:'expand', grammarPoint:'Add frequency adverb + reason',
    instruction:'Mở rộng câu sau (thêm trạng từ + lý do):', question:'I study English.',
    baseText:'I study English.', hints:['usually / every day','in the evening','to improve / because'],
    sampleAnswer:'I usually study English every day because I want to improve my skills.', orderIndex:3 },
  { topicKey:'myself', level:'elementary', type:'fill_blank', grammarPoint:'Frequency adverbs',
    instruction:'Điền vào chỗ trống:', question:'I ___ go to bed before 11 pm. [usually / never / always]',
    options:['usually','rarely','never'], blankAnswer:'usually', sampleAnswer:'I usually go to bed before 11 pm.', orderIndex:4 },
  { topicKey:'myself', level:'elementary', type:'translation', grammarPoint:'S + want to + V + in the future',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi muốn trở thành kỹ sư trong tương lai.',
    hints:['want to','become','engineer','in the future'], sampleAnswer:'I want to become an engineer in the future.', orderIndex:5 },
  { topicKey:'myself', level:'elementary', type:'combine', grammarPoint:'Conjunction: because',
    instruction:'Nối hai câu dùng "because":', question:'I study hard. I want a good job.',
    sentences:['I study hard.','I want a good job.'], connector:'because',
    sampleAnswer:'I study hard because I want a good job.', orderIndex:6 },

  // ─── ELEMENTARY – FAMILY ──────────────────────────────────
  { topicKey:'family', level:'elementary', type:'translation', grammarPoint:'S + V + adv + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Bố tôi làm việc chăm chỉ để chăm sóc gia đình.',
    hints:['works hard','to take care of','family'], sampleAnswer:'My father works hard to take care of the family.', orderIndex:1 },
  { topicKey:'family', level:'elementary', type:'translation', grammarPoint:'S + love + O + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi yêu gia đình tôi vì họ luôn ủng hộ tôi.',
    hints:['love','because','always support'], sampleAnswer:'I love my family because they always support me.', orderIndex:2 },
  { topicKey:'family', level:'elementary', type:'combine', grammarPoint:'Conjunction: and',
    instruction:'Nối hai câu dùng "and":', question:'My mother is hardworking. She takes good care of us.',
    sentences:['My mother is hardworking.','She takes good care of us.'], connector:'and',
    sampleAnswer:'My mother is hardworking and she takes good care of us.', orderIndex:3 },
  { topicKey:'family', level:'elementary', type:'expand', grammarPoint:'Add adjective + reason',
    instruction:'Mở rộng câu sau:', question:'My family is happy.',
    baseText:'My family is happy.', hints:['always','because','together / support each other'],
    sampleAnswer:'My family is always happy because we support each other and spend time together.', orderIndex:4 },
  { topicKey:'family', level:'elementary', type:'translation', grammarPoint:'S + spend + time + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng tôi thường dành thời gian cùng nhau vào cuối tuần.',
    hints:['usually','spend time','together','on weekends'], sampleAnswer:'We usually spend time together on weekends.', orderIndex:5 },
  { topicKey:'family', level:'elementary', type:'translation', grammarPoint:'S + V + O + to + V (purpose)',
    instruction:'Dịch sang tiếng Anh:', question:'Mẹ tôi nấu ăn mỗi tối để chúng tôi ăn cùng nhau.',
    hints:['cooks every evening','so that','eat together'], sampleAnswer:'My mother cooks every evening so that we can eat together.', orderIndex:6 },

  // ─── ELEMENTARY – HOBBIES ─────────────────────────────────
  { topicKey:'hobbies', level:'elementary', type:'translation', grammarPoint:'Frequency adverb + S + V + with + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thường chơi bóng đá với bạn bè sau giờ học.',
    hints:['usually','after school','with my friends'], sampleAnswer:'I usually play football with my friends after school.', orderIndex:1 },
  { topicKey:'hobbies', level:'elementary', type:'translation', grammarPoint:'S + V + because + clause',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi thích nghe nhạc vì nó giúp tôi giảm stress.',
    hints:['because','helps','reduce stress'], sampleAnswer:'I like listening to music because it helps me reduce stress.', orderIndex:2 },
  { topicKey:'hobbies', level:'elementary', type:'expand', grammarPoint:'Add adjective + because clause',
    instruction:'Mở rộng câu sau:', question:'I like reading.',
    baseText:'I like reading.', hints:['interesting books','because','relax / learn new things'],
    sampleAnswer:'I like reading interesting books because they help me relax and learn new things.', orderIndex:3 },
  { topicKey:'hobbies', level:'elementary', type:'combine', grammarPoint:'Conjunction: so',
    instruction:'Nối hai câu dùng "so":', question:'I was tired. I went to bed early.',
    sentences:['I was tired.','I went to bed early.'], connector:'so',
    sampleAnswer:'I was tired, so I went to bed early.', orderIndex:4 },
  { topicKey:'hobbies', level:'elementary', type:'translation', grammarPoint:'S + be + passionate about + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi đam mê chơi đàn guitar.',
    hints:['passionate about','playing','guitar'], sampleAnswer:'I am passionate about playing the guitar.', orderIndex:5 },
  { topicKey:'hobbies', level:'elementary', type:'expand', grammarPoint:'Add time + reason',
    instruction:'Mở rộng câu sau:', question:'I play sport.',
    baseText:'I play sport.', hints:['every day / after school','because','healthy / relax'],
    sampleAnswer:'I play sport every day after school because it keeps me healthy and helps me relax.', orderIndex:6 },

  // ─── ELEMENTARY – TECHNOLOGY ──────────────────────────────
  { topicKey:'technology', level:'elementary', type:'translation', grammarPoint:'S + use + O + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi sử dụng điện thoại để học tiếng Anh.',
    hints:['use','phone','to study'], sampleAnswer:'I use my phone to study English.', orderIndex:1 },
  { topicKey:'technology', level:'elementary', type:'translation', grammarPoint:'S + help + O + V',
    instruction:'Dịch sang tiếng Anh:', question:'Internet giúp chúng ta học bất cứ điều gì.',
    hints:['internet','helps','learn anything'], sampleAnswer:'The internet helps us learn anything.', orderIndex:2 },
  { topicKey:'technology', level:'elementary', type:'translation', grammarPoint:'S + spend + time + on + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi dành nhiều thời gian trên mạng xã hội.',
    hints:['spend','a lot of time','social media'], sampleAnswer:'I spend a lot of time on social media.', orderIndex:3 },
  { topicKey:'technology', level:'elementary', type:'expand', grammarPoint:'Add purpose clause',
    instruction:'Mở rộng câu sau:', question:'I use a smartphone.',
    baseText:'I use a smartphone.', hints:['to stay connected / communicate','with friends','study online'],
    sampleAnswer:'I use a smartphone to stay connected with friends and study online.', orderIndex:4 },
  { topicKey:'technology', level:'elementary', type:'combine', grammarPoint:'Conjunction: but',
    instruction:'Nối hai câu dùng "but":', question:'The internet is useful. It can be addictive.',
    sentences:['The internet is useful.','It can be addictive.'], connector:'but',
    sampleAnswer:'The internet is useful, but it can be addictive.', orderIndex:5 },
  { topicKey:'technology', level:'elementary', type:'translation', grammarPoint:'S + can + V + easily',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng ta có thể dễ dàng tìm kiếm thông tin trên mạng.',
    hints:['can search','information','easily','on the internet'], sampleAnswer:'We can easily search for information on the internet.', orderIndex:6 },

  // ─── ELEMENTARY – TRAVEL ──────────────────────────────────
  { topicKey:'travel', level:'elementary', type:'translation', grammarPoint:'S + want to + V + someday',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi muốn đến thăm Nhật Bản một ngày nào đó.',
    hints:['want to','visit','Japan','someday'], sampleAnswer:'I want to visit Japan someday.', orderIndex:1 },
  { topicKey:'travel', level:'elementary', type:'translation', grammarPoint:'S + V + O + with + noun + last + time',
    instruction:'Dịch sang tiếng Anh:', question:'Tôi đã đi du lịch Đà Nẵng với gia đình vào mùa hè năm ngoái.',
    hints:['travelled','Da Nang','with my family','last summer'], sampleAnswer:'I travelled to Da Nang with my family last summer.', orderIndex:2 },
  { topicKey:'travel', level:'elementary', type:'expand', grammarPoint:'Add adjective + reason',
    instruction:'Mở rộng câu sau:', question:'I like travelling.',
    baseText:'I like travelling.', hints:['because','explore new places','experience different cultures'],
    sampleAnswer:'I like travelling because I can explore new places and experience different cultures.', orderIndex:3 },
  { topicKey:'travel', level:'elementary', type:'fill_blank', grammarPoint:'Preposition of time (in/on/at)',
    instruction:'Điền vào chỗ trống:', question:'We went to the beach ___ the summer. [in / on / at]',
    options:['in','on','at'], blankAnswer:'in', sampleAnswer:'We went to the beach in the summer.', orderIndex:4 },
  { topicKey:'travel', level:'elementary', type:'translation', grammarPoint:'S + be + one of the + superlative + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Hội An là một trong những thành phố đẹp nhất Việt Nam.',
    hints:['Hoi An','one of the most beautiful','cities','Vietnam'],
    sampleAnswer:'Hoi An is one of the most beautiful cities in Vietnam.', orderIndex:5 },
  { topicKey:'travel', level:'elementary', type:'combine', grammarPoint:'Conjunction: although',
    instruction:'Nối hai câu dùng "although":', question:'The trip was tiring. It was very enjoyable.',
    sentences:['The trip was tiring.','It was very enjoyable.'], connector:'although',
    sampleAnswer:'Although the trip was tiring, it was very enjoyable.', orderIndex:6 },

  // ─── INTERMEDIATE – ENVIRONMENT ───────────────────────────
  { topicKey:'environment', level:'intermediate', type:'translation', grammarPoint:'S + be + adj + noun (formal)',
    instruction:'Dịch sang tiếng Anh:', question:'Ô nhiễm môi trường là một vấn đề nghiêm trọng trên toàn thế giới.',
    hints:['environmental pollution','serious problem','worldwide'],
    sampleAnswer:'Environmental pollution is a serious problem worldwide.', orderIndex:1 },
  { topicKey:'environment', level:'intermediate', type:'translation', grammarPoint:'S + need to + V + to + V (purpose)',
    instruction:'Dịch sang tiếng Anh:', question:'Mỗi người cần hành động để bảo vệ môi trường.',
    hints:['everyone','take action','protect','environment'],
    sampleAnswer:'Everyone needs to take action to protect the environment.', orderIndex:2 },
  { topicKey:'environment', level:'intermediate', type:'combine', grammarPoint:'Conjunction: not only...but also',
    instruction:'Nối hai câu dùng "not only...but also":', question:'Pollution damages our health. It harms the ecosystem.',
    sentences:['Pollution damages our health.','It harms the ecosystem.'], connector:'not only...but also',
    sampleAnswer:'Pollution not only damages our health but also harms the ecosystem.', orderIndex:3 },
  { topicKey:'environment', level:'intermediate', type:'translation', grammarPoint:'If clause (conditional)',
    instruction:'Dịch sang tiếng Anh:', question:'Nếu chúng ta không hành động ngay bây giờ, hậu quả sẽ rất nghiêm trọng.',
    hints:['if we do not act','now','the consequences','very serious'],
    sampleAnswer:'If we do not act now, the consequences will be very serious.', orderIndex:4 },
  { topicKey:'environment', level:'intermediate', type:'expand', grammarPoint:'Develop with examples + result',
    instruction:'Mở rộng thành đoạn văn ngắn (2-3 câu):', question:'Recycling is important.',
    baseText:'Recycling is important.', hints:['For example','reduce waste','As a result','protect the environment'],
    sampleAnswer:'Recycling is important because it helps reduce waste. For example, recycling paper saves trees and water. As a result, we can protect the environment for future generations.',
    orderIndex:5 },
  { topicKey:'environment', level:'intermediate', type:'translation', grammarPoint:'S + should + V + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Mọi người nên sử dụng túi tái chế để giảm rác thải nhựa.',
    hints:['everyone','should use','reusable bags','reduce plastic waste'],
    sampleAnswer:'Everyone should use reusable bags to reduce plastic waste.', orderIndex:6 },

  // ─── INTERMEDIATE – HEALTH ────────────────────────────────
  { topicKey:'health', level:'intermediate', type:'translation', grammarPoint:'S + V + O + to + V (purpose)',
    instruction:'Dịch sang tiếng Anh:', question:'Tập thể dục thường xuyên giúp chúng ta duy trì sức khỏe tốt.',
    hints:['exercising regularly','helps','maintain good health'],
    sampleAnswer:'Exercising regularly helps us maintain good health.', orderIndex:1 },
  { topicKey:'health', level:'intermediate', type:'translation', grammarPoint:'S + should + V + instead of + V-ing',
    instruction:'Dịch sang tiếng Anh:', question:'Chúng ta nên ăn nhiều rau thay vì đồ ăn nhanh.',
    hints:['should eat','more vegetables','instead of','fast food'],
    sampleAnswer:'We should eat more vegetables instead of fast food.', orderIndex:2 },
  { topicKey:'health', level:'intermediate', type:'combine', grammarPoint:'Conjunction: although',
    instruction:'Nối hai câu dùng "although":', question:'Exercise takes time. It is essential for good health.',
    sentences:['Exercise takes time.','It is essential for good health.'], connector:'although',
    sampleAnswer:'Although exercise takes time, it is essential for good health.', orderIndex:3 },
  { topicKey:'health', level:'intermediate', type:'translation', grammarPoint:'S + be + crucial + for + noun',
    instruction:'Dịch sang tiếng Anh:', question:'Ngủ đủ giấc rất quan trọng đối với sức khỏe tinh thần.',
    hints:['getting enough sleep','crucial','mental health'],
    sampleAnswer:'Getting enough sleep is crucial for mental health.', orderIndex:4 },
  { topicKey:'health', level:'intermediate', type:'expand', grammarPoint:'Develop with cause + effect',
    instruction:'Mở rộng thành đoạn văn ngắn (2-3 câu):', question:'A healthy lifestyle is important.',
    baseText:'A healthy lifestyle is important.', hints:['For instance','eating well','exercising','As a result','feel more energetic'],
    sampleAnswer:'A healthy lifestyle is important for both the body and mind. For instance, eating well and exercising regularly can prevent many diseases. As a result, people feel more energetic and live longer.',
    orderIndex:5 },
  { topicKey:'health', level:'intermediate', type:'translation', grammarPoint:'S + need to + V + to + V',
    instruction:'Dịch sang tiếng Anh:', question:'Học sinh cần ngủ đủ giấc để học tốt hơn.',
    hints:['students','need to sleep','enough','to study better'],
    sampleAnswer:'Students need to sleep enough to study better.', orderIndex:6 },
];

// ──────────────────────────────────────────────────────────────
//  SEED FUNCTION
// ──────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // 1. Upsert topics
  for (const t of TOPICS) {
    await WPTopic.findOneAndUpdate({ key: t.key }, t, { upsert: true, new: true });
  }
  console.log(`✓ ${TOPICS.length} topics upserted`);

  // 2. Upsert lessons, collect {topicKey+level → lessonId} map
  const lessonMap = {};
  for (const l of LESSONS) {
    const doc = await WPLesson.findOneAndUpdate(
      { topicKey: l.topicKey, level: l.level },
      l,
      { upsert: true, new: true }
    );
    lessonMap[`${l.topicKey}:${l.level}`] = doc._id;
  }
  console.log(`✓ ${LESSONS.length} lessons upserted`);

  // 3. Upsert exercises
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
  console.log(`✓ ${count} exercises upserted`);

  console.log('\nSeed complete! Total:', count, 'exercises across', TOPICS.length, 'topics');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
