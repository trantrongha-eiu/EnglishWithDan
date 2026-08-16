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
    { question: "Which town or city do you live in now?", sampleAnswer:
      "I currently live in a fairly large city, in a district that's pretty central and convenient. I chose the area mainly because it's close to my workplace, so I don't waste hours commuting every day. It can get quite crowded and noisy at times, especially during rush hour, but overall it suits my lifestyle well." },
    { question: "Are there any things you don't like about your area?", sampleAnswer:
      "Yes, there are a couple of things that bother me. The traffic noise is probably the biggest one, since my apartment faces a fairly busy road. It gets especially bad in the early morning when delivery trucks start rolling through, so I've had to get used to sleeping with earplugs." },
    { question: "Do you think you will continue to live there for a long time?", sampleAnswer:
      "I'd say probably not, at least not permanently. The area is convenient for now because it's close to my job, but it's quite expensive and a bit cramped for what I'm paying. Once my situation changes, I'd like to move somewhere with more space, maybe a bit further from the city centre." },
    { question: "What are some changes in the area recently?", sampleAnswer:
      "Quite a lot has changed recently, actually. A new shopping mall opened just down the road last year, which has made the area much livelier. They've also redone the local park, adding proper walking paths and better lighting, so it feels safer to go out in the evening now." },
    { question: "Do you live in a house or an apartment?", sampleAnswer:
      "I live in an apartment, on the tenth floor of a fairly modern building. I chose an apartment over a house mainly for practical reasons — it's easier to maintain and closer to the city centre. The only downside is that it's fairly compact, so storage space is always a bit of a challenge." },
    { question: "What is your favourite room in your home?", sampleAnswer:
      "Without question, it's the living room. It has a large window that lets in a lot of natural light, which makes it feel much bigger than it actually is. That's where I spend most of my evenings, whether I'm watching a film or just relaxing after work." },
    { question: "What things make your home pleasant to live in?", sampleAnswer:
      "A few things really make a difference for me. Good natural light is probably the main one, since it makes the whole space feel warmer and more welcoming. I've also filled it with a few plants, which somehow makes even a small apartment feel a lot cosier." },
    { question: "Are the people in your neighbourhood nice and friendly?", sampleAnswer:
      "Generally, yes, I'd say they're quite friendly. We often exchange a quick greeting in the lift or the hallway, even if we don't really socialise beyond that. Once, when I locked myself out, one of my neighbours actually let me wait at their place until a locksmith arrived, which I really appreciated." },
    { question: "Do you know any of your neighbours?", sampleAnswer:
      "I know a few of them, mainly the ones living on my floor. We're not particularly close, but we're friendly enough to chat briefly if we run into each other. There's one elderly couple next door who I check in on occasionally, just to see how they're doing." },
    { question: "Do you know any famous people in your area?", sampleAnswer:
      "Not that I'm aware of, to be honest. My area is fairly residential, so it's mostly made up of regular families and working professionals rather than anyone well-known. I did hear once that a local news presenter lives somewhere nearby, but I've never actually run into them." }
  ]},
  { topic: "Work / Study", questions: [
    { question: "What kind of work do you do?", sampleAnswer:
      "I work as a marketing executive for a small tech company. My main responsibility is managing social media campaigns and analysing how well they perform. It's quite a varied role, so no two days really look the same, which I enjoy." },
    { question: "What do you find most interesting about your work?", sampleAnswer:
      "Honestly, the most interesting part is seeing a campaign actually connect with people. There's something really satisfying about coming up with an idea and then watching the engagement numbers go up because of it. I also like that the industry changes so fast, so I'm constantly learning new tools." },
    { question: "Which is more important to you – the people you work with or the work you do?", sampleAnswer:
      "For me, it's probably the people. Even if the tasks themselves are interesting, a stressful or unfriendly team can make the whole experience miserable. I'm lucky that my current colleagues are supportive, which honestly makes even the busy days feel manageable." },
    { question: "Do you work best in the morning or the afternoon?", sampleAnswer:
      "Definitely in the morning. My concentration is at its sharpest right after I've had breakfast and a coffee, so I try to tackle the most demanding tasks then. By mid-afternoon, my energy usually dips, so I save simpler tasks like emails for later in the day." },
    { question: "What do you study?", sampleAnswer:
      "I'm currently studying business administration at university. I chose it because it's quite broad and keeps a lot of career paths open for later. Right now I'm in my third year, focusing mostly on marketing and finance modules." },
    { question: "What do you find most interesting about your studies?", sampleAnswer:
      "Probably the case studies we analyse in class. We look at real companies and figure out what they did right or wrong, which feels a lot more practical than just memorising theory. It's also where I get to apply what I've learned to actual, real-world problems." },
    { question: "Which is more important to you – the teachers or the other students on your course?", sampleAnswer:
      "I'd say the teachers, mainly because a good lecturer can completely change how well you understand a subject. That said, my classmates matter a lot too — we regularly study together before exams, and honestly, explaining a topic to someone else often helps me understand it better myself." },
    { question: "How much time do you spend studying every week?", sampleAnswer:
      "On average, probably around fifteen hours outside of class. It varies a lot though — during exam periods, that number can easily double, since I end up spending most weekends in the library. Normal weeks are much more relaxed, maybe just a couple of hours after each class." },
    { question: "How do you usually travel to the city where you study?", sampleAnswer:
      "I usually take the train, since my university is about an hour away from where I live. It's not the fastest option, but it's reliable, and I can get some reading done during the journey. On rare occasions when I've got heavy equipment to bring, I'll drive instead." },
    { question: "Do you study best in the morning or the afternoon?", sampleAnswer:
      "Definitely the morning, especially right after breakfast. My mind feels much clearer then, so I try to review the toughest material during that window. By the afternoon, I'm usually more tired, so I switch to lighter tasks like organising notes." },
    { question: "Have you always wanted to study this subject / these subjects?", sampleAnswer:
      "Not really, actually. When I was younger, I was much more interested in something completely different, like graphic design. It wasn't until high school, after taking an economics class, that I realised business was something I was genuinely good at and enjoyed." }
  ]},
  // ── Specific topics ──
  { topic: "Food", questions: [
    { question: "What was your favourite food when you were a child?", sampleAnswer:
      "As a kid, I was absolutely obsessed with fried chicken. My mum used to make it every Sunday, and I'd always ask for seconds even when I was already full. I think it reminds me so much of home that I still crave it occasionally now." },
    { question: "Has the kind of food you like changed as you've got older?", sampleAnswer:
      "Definitely, yes. I used to eat mostly fried and sugary food without thinking twice about it, but now I'm much more conscious of eating vegetables and lighter meals. I think it's partly because I feel the effects of unhealthy eating much more now than I did as a teenager." },
    { question: "Do you eat different food at different times of the year?", sampleAnswer:
      "To some extent, yes. In summer I tend to eat lighter meals like salads and fresh fruit because it's simply too hot for anything heavy. In winter, though, I crave warm, hearty dishes like soups and stews, mainly for comfort." },
    { question: "Do you like to eat with others?", sampleAnswer:
      "I do, quite a lot actually. Meals just feel more enjoyable when there's conversation involved rather than eating alone in silence. Every Friday, a few of my friends and I get together for dinner, and it's honestly become one of the highlights of my week." },
    { question: "In your country, is it very important to eat with other people?", sampleAnswer:
      "Yes, it's a fairly big part of the culture where I'm from. Family dinners are treated as an important daily ritual, not just a way to get food. Even for something as simple as a birthday, people will gather the whole family around the table rather than just eating separately." }
  ]},
  { topic: "Pets and animals", questions: [
    { question: "Did you want to have a pet when you were a child?", sampleAnswer:
      "Yes, more than anything, actually. I used to beg my parents for a dog every year around my birthday. They finally gave in when I turned ten, and I remember being completely overjoyed." },
    { question: "Would you like to have pets in the future?", sampleAnswer:
      "Definitely. Once I have more space and a stable routine, I'd love to get a cat. I like the idea of having a companion around, and cats are relatively low-maintenance compared to other pets, which suits my busy lifestyle." },
    { question: "Where do you prefer to keep your pet, indoors or outdoors?", sampleAnswer:
      "Indoors, without a doubt. It's safer, especially in busy cities where there's a lot of traffic. My childhood dog actually got lost once after slipping out through the gate, so ever since then I've been very cautious about letting pets roam outside unsupervised." },
    { question: "Do you see many birds and animals where you live?", sampleAnswer:
      "A fair amount, actually, mostly because there's a park close to my apartment. In the mornings you can hear birds quite clearly, and I sometimes spot squirrels running along the fences. It's a nice bit of nature in an otherwise fairly urban area." },
    { question: "Have you ever been to a zoo?", sampleAnswer:
      "Yes, several times, mostly as a child on school trips. The one memory that really stands out is seeing the elephants up close for the first time — I remember being amazed at how enormous they actually were. I haven't been back as an adult, but I'd happily go again." },
    { question: "What kind of animals is famous in your country?", sampleAnswer:
      "I'd say water buffalo are pretty iconic where I'm from, especially in rural, farming areas. They're closely tied to traditional agriculture, so you'll often see them featured in old paintings or folk stories. Even people living in cities still recognise them as a symbol of the countryside." }
  ]},
  { topic: "Typing", questions: [
    { question: "How often do you type on a keyboard?", sampleAnswer:
      "Pretty much every day, to be honest. Between work emails, reports, and messaging friends, I'm probably typing for at least a few hours daily. It's become such a habit that I barely notice I'm doing it anymore." },
    { question: "Did you learn how to type at school when you were younger?", sampleAnswer:
      "Not formally, no. We had basic computer classes, but nobody actually taught us proper typing technique. I mostly picked it up myself through trial and error, just from using computers so often for schoolwork." },
    { question: "When did you learn how to type on a keyboard?", sampleAnswer:
      "I'd say around the age of twelve, when my family got our first home computer. I started off using just two fingers, which was painfully slow. Over the years of chatting online with friends, I gradually got faster without even really trying." },
    { question: "Which do you find easier: typing on a keyboard or writing by hand?", sampleAnswer:
      "Typing, without question. My handwriting has actually gotten worse over the years from lack of practice, whereas typing lets me get my thoughts down much faster. The only time I still prefer handwriting is for quick personal notes, since it feels a bit more natural." },
    { question: "Do you like to improve your typing skills?", sampleAnswer:
      "I wouldn't mind, honestly. My speed is decent, but my accuracy could definitely be better, especially when I'm typing quickly under pressure. I've thought about trying one of those online typing games to practise, though I haven't gotten around to it yet." }
  ]},
  { topic: "Stage of life", questions: [
    { question: "Are you satisfied with your age now?", sampleAnswer:
      "Yes, I'd say I am. I feel like I've got enough independence to make my own decisions, but I'm still young enough to take risks without too much to lose. If anything, I feel like this stage of life has the best balance of freedom and opportunity." },
    { question: "What did you enjoy most about your childhood?", sampleAnswer:
      "Probably the lack of responsibility, if I'm honest. I could spend an entire afternoon playing outside with the neighbourhood kids without a single worry. Looking back, I really took that carefree freedom for granted at the time." },
    { question: "What's the most important thing you've done so far?", sampleAnswer:
      "I'd probably say moving away from home to study at university. It forced me to become a lot more independent, from managing my own finances to just cooking basic meals for myself. It was daunting at first, but it ended up being one of the best decisions I've made." },
    { question: "At what age do you think people enjoy their lives most?", sampleAnswer:
      "I'd guess somewhere in their late twenties. By that point, most people have a bit more financial stability than in their early twenties, but they're usually not yet weighed down by heavier responsibilities like raising children. It feels like a good middle ground between freedom and stability." },
    { question: "What do you want to do five years later?", sampleAnswer:
      "Ideally, I'd like to be settled into a stable career, maybe even in a leadership position by then. I'd also love to have travelled to a few more countries by that point. Right now it feels far off, but I know the next five years will go by faster than I expect." }
  ]},
  { topic: "Long walk", questions: [
    { question: "Did you go for long walks when you were a child?", sampleAnswer:
      "Occasionally, yes, mostly with my grandfather on weekends. He loved walking through the local park and pointing out different plants and birds along the way. Those walks are actually some of my fondest childhood memories now." },
    { question: "How often do you walk to the shops now?", sampleAnswer:
      "Fairly often, actually, maybe two or three times a week. There's a small convenience store just a five-minute walk from my apartment, so it's usually quicker than driving. Plus, it gives me a nice little excuse to get some fresh air." },
    { question: "Are there many parks near where you live?", sampleAnswer:
      "Yes, there's actually a decent-sized one about ten minutes from my place. It's got a proper walking path around a small lake, which makes it a popular spot, especially in the evenings. I try to go there for a walk at least once a week." },
    { question: "Do people enjoy walking in parks in your country?", sampleAnswer:
      "Yes, very much so, especially older generations. It's quite common to see groups of retirees doing morning walks together in local parks, almost like a social ritual. Younger people tend to go more for exercise, often with earphones in listening to music or podcasts." },
    { question: "Where would you want to go for a long walk if you have a chance?", sampleAnswer:
      "I'd love to walk along a coastal trail somewhere, maybe in Vietnam or Italy. There's something really appealing about having the ocean right beside you as you walk. I imagine it would be incredibly relaxing compared to the noisy city streets I usually walk through." }
  ]},
  { topic: "Reading carefully", questions: [
    { question: "What kinds of things do you have to read carefully in your language?", sampleAnswer:
      "Legal or official documents, definitely, like contracts or bank paperwork. The wording in those can be quite dense, so missing even a small detail could actually cause problems later. I usually end up reading those kinds of documents two or three times just to be safe." },
    { question: "Do you like to read things carefully or quickly in daily life?", sampleAnswer:
      "It really depends on what it is. For casual things like social media posts, I tend to skim quickly since they're rarely important. But for anything work-related, like an email from my manager, I make sure to read every line carefully so I don't miss instructions." },
    { question: "Do you read things more carefully on paper or on a screen?", sampleAnswer:
      "Definitely on paper. I find that I retain information much better when I'm reading a physical page, maybe because there are fewer distractions like notifications popping up. On a screen, I tend to skim without even realising it." },
    { question: "Why do you think some people don't read messages very carefully?", sampleAnswer:
      "I think it mostly comes down to being busy or distracted. People are often multitasking, checking messages while doing something else, so it's easy to just glance at the first line and assume the rest. Honestly, I've made that mistake myself and ended up replying to the wrong thing." }
  ]},
  { topic: "Morning Routine", questions: [
    { question: "Do you get up early in the morning?", sampleAnswer:
      "Yes, usually around six thirty. I like having a bit of quiet time before the rest of the day gets hectic, so I use that early window to have a proper breakfast and plan out my tasks. It also means I avoid the worst of the morning traffic." },
    { question: "Did you get up early in the morning when you were younger?", sampleAnswer:
      "Definitely not. As a teenager, I'd sleep in until the last possible minute before school, especially on weekends. My parents constantly had to nag me to get out of bed, which honestly used to annoy me a lot at the time." },
    { question: "What do you do every morning?", sampleAnswer:
      "My routine is pretty simple, actually. I wake up, have a quick shower, and then eat breakfast while checking my emails for anything urgent. If I have time, I'll also go for a short walk before heading to work." },
    { question: "What's your favourite morning of the week?", sampleAnswer:
      "Saturday, without a doubt. There's no rush to get anywhere, so I can take my time making a proper breakfast instead of just grabbing something quick. It's honestly the only morning I actually look forward to." }
  ]},
  { topic: "Gifts", questions: [
    { question: "What kinds of gifts do you like to receive?", sampleAnswer:
      "I generally prefer practical gifts over decorative ones, things I'll actually use day to day. For instance, my sister once gave me a really nice backpack, and I still use it constantly for work. Anything thoughtful like that means a lot more to me than something purely symbolic." },
    { question: "What kinds of gifts did you like when you were younger?", sampleAnswer:
      "As a kid, toys were basically all I cared about, especially action figures. I remember being ecstatic one Christmas when I finally got the toy set I'd been asking for all year. Looking back, it seems so simple, but at the time it felt like the best gift ever." },
    { question: "Have you received any gifts recently?", sampleAnswer:
      "Yes, actually, just last month for my birthday. A close friend got me a nice pair of headphones, which was perfect timing since my old ones had just broken. It was a small gesture, but it really showed she'd been paying attention to what I needed." },
    { question: "Do you enjoy giving people gifts?", sampleAnswer:
      "I do, quite a lot actually. There's something really satisfying about picking out something that suits a person perfectly and then seeing their reaction when they open it. I usually start thinking about gift ideas weeks in advance so I don't just settle for something generic." },
    { question: "Do you think buying gifts online is a good idea?", sampleAnswer:
      "For the most part, yes. It's convenient, and you often get access to a much wider range of options than in local shops. That said, I've occasionally been disappointed when the item looked different in person than in the photos, so I'm a bit more careful now about checking reviews first." }
  ]},
  { topic: "Team sport", questions: [
    { question: "Have you ever played a sport in a team?", sampleAnswer:
      "Yes, I played football for my school team for a couple of years. It taught me a lot about communication, since you really can't succeed alone in a team sport. I still occasionally play casually with friends on weekends now." },
    { question: "Is your sport team famous?", sampleAnswer:
      "Not particularly, no, it was just a school team, so it was pretty small-scale. We did win a regional tournament once though, which felt like a huge achievement at the time, even if nobody outside our school really noticed." },
    { question: "Are team sports popular in your country?", sampleAnswer:
      "Yes, extremely, especially football. Almost every neighbourhood has some kind of local pitch where people gather to play in the evenings. During major international tournaments, it practically becomes a national event, with everyone glued to the television." },
    { question: "Would you like to try a new team sport in the future?", sampleAnswer:
      "I'd actually love to try volleyball at some point. A few of my colleagues play it regularly and always seem to have a great time. I think it looks like a good mix of exercise and social interaction, which really appeals to me." },
    { question: "Do you enjoy watching team sports?", sampleAnswer:
      "Yes, especially football, it's probably my favourite thing to watch on weekends. There's something really exciting about the unpredictability of a live match, especially in the final few minutes. I usually watch with friends, which makes the experience even better." }
  ]},
  { topic: "Building", questions: [
    { question: "What is the tallest building in your city?", sampleAnswer:
      "I believe it's a skyscraper in the financial district, though I honestly don't know its exact height. It's become a bit of a landmark, actually, since you can see it from almost anywhere in the city." },
    { question: "Are there many tall buildings where you live?", sampleAnswer:
      "A fair few, yes, especially in the city centre. My own neighbourhood is a bit quieter though, mostly low-rise apartments and houses. It's a nice contrast, actually — you get the convenience of the city without feeling completely surrounded by concrete." },
    { question: "Have you ever taken a photo of a building?", sampleAnswer:
      "Yes, quite often actually, usually when I'm travelling somewhere new. I remember taking dozens of photos of an old cathedral on a trip last year because the architecture was so intricate. I think buildings with a lot of history make for the most interesting photos." },
    { question: "What kind of building would you like to live in?", sampleAnswer:
      "Honestly, I'd love to live in an old, renovated building with a lot of character, like exposed brick walls and high ceilings. Modern apartments feel a bit too uniform for my taste. There's something appealing about a space that has actual history behind it." },
    { question: "Is there a famous building that you would like to have a visit?", sampleAnswer:
      "Yes, I'd really love to visit the Sydney Opera House someday. I've seen countless photos of it, but I imagine seeing that curved roof design in person must be a completely different experience. It's definitely on my travel bucket list." }
  ]},
  { topic: "Travelling", questions: [
    { question: "When you're travelling, do you usually look at the view?", sampleAnswer:
      "Yes, definitely, especially on long journeys like train rides. I find it really relaxing to just watch the scenery change outside the window instead of being on my phone the whole time. It's one of the small pleasures of travelling that I always look forward to." },
    { question: "Did you ever travel to a faraway place when you were a child?", sampleAnswer:
      "Yes, once, my family took a trip abroad when I was around eight. I don't remember every detail, but I do vividly remember being amazed by how different the food and buildings looked compared to home. It was probably what first got me interested in travelling." },
    { question: "Do you prefer to look at mountain views or ocean views?", sampleAnswer:
      "I'd probably say ocean views, honestly. There's something incredibly calming about watching waves roll in, especially at sunset. Mountains are beautiful too, but the ocean just has a way of instantly putting me at ease." },
    { question: "When you see a beautiful view, do you like to take a photo of it?", sampleAnswer:
      "Almost always, yes, it's practically automatic at this point. I like having the photo as a way to look back and remember the moment later, even if the picture never quite captures how it actually felt in person. My camera roll is honestly full of scenery shots." },
    { question: "Would you like to hang a beautiful view picture on the wall at home?", sampleAnswer:
      "Yes, actually, I already have one — a photo I took of a sunset during a beach trip a couple of years ago. It's hanging right above my desk, so I see it every day while I'm working, which honestly makes the room feel a lot calmer." }
  ]},
  { topic: "Free time activities", questions: [
    { question: "What's your favourite free-time activity when you were a child?", sampleAnswer:
      "Drawing, without question. I used to spend hours after school just sketching random things, from cartoon characters to whatever I saw around the house. My parents actually kept a few of those old drawings, which is fun to look back on now." },
    { question: "What activities do you enjoy doing in your free time now?", sampleAnswer:
      "These days, I mostly enjoy reading and going to the gym. Reading helps me unwind after a stressful day, while exercising gives me a bit of an energy boost. Between the two, I feel like I get a good balance of relaxation and activity." },
    { question: "Do you prefer to do free-time activities alone or with other people?", sampleAnswer:
      "It really depends on my mood, honestly. After a socially draining week, I'll usually want some alone time, maybe just reading at home. But other times, especially on weekends, I'd much rather be out doing something with friends." },
    { question: "Is there an activity you would like to try in the future?", sampleAnswer:
      "Yes, I'd love to try rock climbing at some point. A few colleagues of mine go regularly and always talk about how much of a workout it is. It looks intimidating, but I think that's exactly what makes it appealing to me." }
  ]},
  { topic: "Memory", questions: [
    { question: "Do you think it easy to remember people's names?", sampleAnswer:
      "Not particularly, no, I actually struggle with that quite a bit. I can usually remember a person's face perfectly, but their name just seems to slip away within minutes of meeting them. It's honestly a bit embarrassing sometimes when I have to awkwardly ask again." },
    { question: "Do you remember things easily when you're studying or working?", sampleAnswer:
      "It depends a lot on the subject, to be honest. If it's something that genuinely interests me, the information tends to stick without much effort. But for dry, technical material, I usually need to go over it multiple times before it actually sinks in." },
    { question: "Would you like to have a better memory?", sampleAnswer:
      "Definitely, yes. It would honestly save me so much time, especially when studying for exams, since I wouldn't have to review the same material over and over. I've even tried a few memory techniques online, though I haven't been consistent enough to really see the benefits." },
    { question: "Have you forgotten something that was very important?", sampleAnswer:
      "Yes, unfortunately, I once completely forgot a close friend's birthday. I felt terrible about it afterwards, especially since she'd remembered mine just weeks earlier. Ever since then, I've started setting reminders on my phone for anything important." }
  ]},
  { topic: "Singing", questions: [
    { question: "Did you like singing when you were a child?", sampleAnswer:
      "Yes, quite a lot, actually. I used to sing along to cartoons and children's songs constantly, much to my parents' amusement. I wasn't particularly good at it, but I definitely enjoyed it." },
    { question: "Do you like singing now?", sampleAnswer:
      "Occasionally, yes, though mostly just for fun rather than seriously. I'll sing along in the car or in the shower when nobody's around to judge me. I'd never do it in front of an audience though, since I'm honestly not that confident in my voice." },
    { question: "Will you sing in the car?", sampleAnswer:
      "Yes, all the time, actually, especially on long drives. It helps pass the time and keeps me energised, particularly if I'm feeling a bit sleepy at the wheel. My friends usually join in too when we're travelling together, so it turns into a bit of a group sing-along." },
    { question: "Do you like listening to other people sing?", sampleAnswer:
      "Yes, definitely, especially live performances. There's something about hearing someone sing in person, with all the little imperfections, that feels much more genuine than a studio recording. I went to a small local gig last year and honestly found it more enjoyable than most big concerts I've been to." },
    { question: "How well did you sing?", sampleAnswer:
      "Honestly, not very well at all. I was always a bit off-key, no matter how hard I tried in music class. My teacher was kind enough not to say anything directly, but I could tell singing just wasn't one of my strengths." },
    { question: "Did you take music lessons?", sampleAnswer:
      "I did briefly, actually, piano lessons for about two years as a child. I ended up quitting because I found the practice quite tedious at that age. Looking back, I sort of regret not sticking with it longer." }
  ]},
  { topic: "Music", questions: [
    { question: "Do you like music?", sampleAnswer:
      "Yes, a lot, honestly it's a big part of my everyday life. I have it playing almost constantly, whether I'm working, commuting, or just relaxing at home. I genuinely think a day feels incomplete without at least some music in the background." },
    { question: "What kinds of music do you listen to?", sampleAnswer:
      "Mostly pop and indie, though it really depends on my mood. When I need to focus on work, I'll switch to something more instrumental, like lo-fi beats. I like having a bit of variety rather than sticking to just one genre." },
    { question: "Do you prefer sad or happy music?", sampleAnswer:
      "It depends on the situation, honestly. When I'm feeling low, I actually gravitate towards sad songs, since they somehow feel more comforting in that moment. But generally, day to day, I prefer upbeat, happy music because it keeps my energy up." },
    { question: "Does happy music make you feel more excited?", sampleAnswer:
      "Yes, definitely, it has an almost instant effect on my mood. If I'm feeling sluggish in the morning, putting on an upbeat playlist genuinely helps me feel more awake and motivated. It's honestly one of the easiest ways I know to boost my energy." },
    { question: "Is it easy to learn music?", sampleAnswer:
      "Not really, no, I think it takes a lot of patience and consistent practice. I tried learning guitar a few years ago and found even basic chords surprisingly difficult at first. It does get easier over time, but the early stages can be quite frustrating." },
    { question: "Do you learn music lessons at school?", sampleAnswer:
      "We had some basic music classes, yes, mostly just learning to read simple notes and sing as a group. It wasn't very in-depth though, more of an introduction than proper training. Anyone who wanted to get seriously good had to take private lessons outside of school." }
  ]},
  { topic: "Watch", questions: [
    { question: "Do you wear a watch in your daily life?", sampleAnswer:
      "Not really, no, I mostly just use my phone to check the time these days. I used to wear one a few years back, but I found it a bit unnecessary once smartphones became so widespread. I still own one, though, for more formal occasions." },
    { question: "What kind of watch do you have?", sampleAnswer:
      "I have a fairly simple analogue watch with a leather strap. It was actually a gift from my father when I graduated, so it has a bit of sentimental value beyond just telling the time. I only really wear it for special occasions now." },
    { question: "Has anyone ever given you a watch as a gift?", sampleAnswer:
      "Yes, actually, my father gave me one as a graduation present. It wasn't particularly expensive, but the gesture meant a lot to me at the time. I still keep it safely stored, even though I don't wear it often." },
    { question: "What kind of watch do the people around you like to wear?", sampleAnswer:
      "Smartwatches seem to be the trend among my friends now, mainly for tracking fitness and notifications. A few older relatives still prefer traditional analogue watches though, mostly for their classic, timeless look. It's an interesting generational split, honestly." }
  ]},
  { topic: "Parks and Gardens", questions: [
    { question: "What kind of parks and gardens did you like when you were a child?", sampleAnswer:
      "I mostly liked parks with playgrounds, obviously, ones with swings and slides. There was a small park near my childhood home that I visited almost every weekend. It wasn't particularly fancy, but it holds a lot of nostalgic value for me now." },
    { question: "Do you enjoy visiting parks and gardens now?", sampleAnswer:
      "Yes, quite a lot, actually, though for different reasons than as a kid. Now I mainly go for the peace and quiet, usually for a walk or to read a book outdoors. It's a nice way to get some fresh air away from the busy city." },
    { question: "Do you think there should be more parks and gardens in your city?", sampleAnswer:
      "Definitely, yes. Green spaces genuinely improve people's wellbeing, especially in a busy, concrete-heavy city like mine. My own neighbourhood only has one small park, so it always gets overcrowded on weekends when the weather's nice." },
    { question: "Is there a famous park or garden that you want to visit?", sampleAnswer:
      "Yes, I've always wanted to visit Central Park in New York. I've seen it in so many films that it almost feels familiar already, even though I've never actually been. I imagine walking through it in person would be a completely different experience." },
    { question: "Was there a park near your home that you liked to go to when you were a child?", sampleAnswer:
      "Yes, there was a small one just around the corner from my house. My friends and I used to meet there almost every afternoon after school. It's actually still there today, though it looks quite different now after some renovations." },
    { question: "What did you do there?", sampleAnswer:
      "Mostly just played simple games like tag or football with the other neighbourhood kids. Sometimes we'd just sit on the swings and chat for hours about nothing in particular. Looking back, those simple afternoons were honestly some of the happiest moments of my childhood." }
  ]},
  { topic: "Tidiness", questions: [
    { question: "Were you a tidy person when you were a child?", sampleAnswer:
      "Not really, no, my room was almost always a mess. My mum used to constantly nag me to clean it up, but I just didn't see the point back then. It wasn't until I moved out on my own that I actually started caring about tidiness." },
    { question: "Are you a tidy person now?", sampleAnswer:
      "Yes, surprisingly, much more than I used to be. Living alone forced me to develop better habits, since there was no one else to clean up after me. I now make my bed and tidy my desk every morning before starting my day." },
    { question: "What do you think of those who don't care about tidiness?", sampleAnswer:
      "I try not to judge too harshly, since I used to be exactly the same way. That said, I do think a cluttered space can quietly add to someone's stress without them even realising it. I definitely feel calmer and more focused now that my own space is tidier." },
    { question: "What do you think of untidy people?", sampleAnswer:
      "I don't think it necessarily reflects a person's character, honestly, it's more just a habit or a busy schedule. Some of the most organised and successful people I know actually have fairly messy desks. So I try not to judge based on that alone." },
    { question: "What do you think of people who are overly tidy?", sampleAnswer:
      "I think it can go a bit too far sometimes, honestly. I have a friend who gets visibly anxious if even one thing is slightly out of place, which seems exhausting to maintain constantly. A reasonable level of tidiness is healthy, but obsessing over it doesn't seem worth the stress." }
  ]},
  { topic: "Headphones", questions: [
    { question: "How often do you wear headphones?", sampleAnswer:
      "Pretty much every day, especially during my commute to work. It helps me tune out the noise on the train and focus on a podcast or some music instead. I'd honestly find the commute far more tedious without them." },
    { question: "Do you think headphones are useful?", sampleAnswer:
      "Definitely, yes, they're honestly one of the most useful gadgets I own. They let me enjoy music or calls privately without disturbing the people around me. I especially rely on them while working, since noise-cancelling ones help me concentrate in a busy office." },
    { question: "Are headphones popular in your country?", sampleAnswer:
      "Yes, extremely, especially among younger people. It's rare to see someone commuting on public transport without a pair in. Wireless earbuds in particular have become incredibly common over the past few years." },
    { question: "In what situations should people not wear headphones?", sampleAnswer:
      "I think while crossing the road or cycling, definitely, since it can be genuinely dangerous not to hear approaching traffic. I also think it's a bit rude to wear them during a conversation with someone. Basically, any situation where being aware of your surroundings really matters." }
  ]},
  { topic: "Websites", questions: [
    { question: "Do you usually use websites?", sampleAnswer:
      "Yes, constantly, honestly, probably every hour I'm awake. Between work research and just browsing for news, I'm on some website or another almost all day. It's become such second nature that I barely think about it." },
    { question: "Which website do you usually use?", sampleAnswer:
      "I'd say YouTube, mainly for entertainment and learning new skills. I've actually picked up quite a few practical things from tutorials there, from cooking to basic home repairs. It's honestly become one of my main sources of information these days." },
    { question: "Do you prefer to search for information through websites or books?", sampleAnswer:
      "Websites, definitely, mainly because of how quick and convenient they are. If I need an answer to something, I can usually find it within seconds through a search engine. Books are great for deeper, more reliable knowledge, but they're just not as practical for quick questions." },
    { question: "Do you want to create your own website in the future?", sampleAnswer:
      "Yes, actually, I've thought about building a personal blog at some point. I'd like somewhere to share my travel experiences and maybe some photography. I just haven't found the time to actually learn the technical side of building one yet." }
  ]},
  { topic: "Telling Jokes", questions: [
    { question: "Do you like to tell jokes?", sampleAnswer:
      "Occasionally, yes, though I wouldn't say I'm particularly skilled at it. I enjoy making people laugh, especially close friends who get my sense of humour. My timing isn't always great though, so the jokes don't always land the way I intend." },
    { question: "Do you often joke with your friends?", sampleAnswer:
      "Yes, constantly, actually, it's a big part of how we interact. We're always teasing each other about something, usually in a light-hearted, harmless way. I think that kind of humour is honestly what keeps our friendship feeling so relaxed." },
    { question: "Do you have friends who love telling jokes?", sampleAnswer:
      "Yes, definitely, one of my closest friends is practically the group comedian. He always seems to have a joke ready for almost any situation, even ones that really shouldn't be funny. He's honestly the reason our group chats are never boring." },
    { question: "What are some common comedy shows in your country?", sampleAnswer:
      "There are quite a few popular stand-up comedy specials that circulate online, mostly from local comedians talking about everyday life. Sitcoms are pretty common too, usually revolving around family or workplace situations. Comedy that pokes fun at daily struggles tends to resonate the most with people here." },
    { question: "Do you like being joked about?", sampleAnswer:
      "It depends on the joke, honestly. If it's light-hearted and clearly meant in good fun, I don't mind at all and usually laugh along. But if it touches on something more sensitive, I'll admit it can sting a little, even if it wasn't meant seriously." }
  ]},
  { topic: "Science", questions: [
    { question: "Did you study science when you were at primary/elementary school?", sampleAnswer:
      "Yes, we had basic science classes, mostly covering simple topics like plants and the human body. It wasn't particularly advanced, more just an introduction to get us curious. I actually remember really enjoying the simple experiments we did in class." },
    { question: "Do you think everyone should study science at school?", sampleAnswer:
      "Yes, at least at a basic level. Understanding how the world works practically helps with everyday decisions, from nutrition to understanding the news. Not everyone needs to become a scientist, but a basic scientific understanding is genuinely useful for daily life." },
    { question: "How does knowing about science help you in your everyday life?", sampleAnswer:
      "It helps quite a bit, honestly, especially with understanding health-related news. For example, understanding roughly how vaccines or nutrition work helps me make more informed decisions rather than just believing whatever I read online. It also just satisfies my general curiosity about how things work." },
    { question: "Did you learn much about science at school?", sampleAnswer:
      "Yes, quite a bit, actually, especially in secondary school where it became a core subject. We covered biology, chemistry, and physics separately, each with its own set of practical experiments. Chemistry was probably my favourite, mainly because of how hands-on the lab sessions were." },
    { question: "How do you learn about science in daily life?", sampleAnswer:
      "Mostly through documentaries and online videos these days. I follow a few science channels that break down complicated topics into much simpler, more digestible explanations. It's a nice way to keep learning without it feeling like a school assignment." }
  ]},
  { topic: "Teachers", questions: [
    { question: "Do you have a favorite teacher?", sampleAnswer:
      "Yes, actually, my high school English teacher. She had this way of making even boring topics genuinely interesting, mostly through her enthusiasm. I honestly credit her for why I still enjoy reading today." },
    { question: "Which teacher do you prefer, the one from primary school or the one from junior high school?", sampleAnswer:
      "I'd probably say my primary school teacher, honestly. She was incredibly patient and nurturing, which really mattered at that age when everything felt new and a bit scary. Junior high teachers felt a lot stricter and less personal in comparison." },
    { question: "Do you still keep in touch with your former teachers?", sampleAnswer:
      "Only with one, actually, my old English teacher I mentioned earlier. We occasionally message each other around holidays or exam results season. It's nice being able to update her on how my life's turned out since graduating." },
    { question: "Is it easy to remember your teachers in elementary school?", sampleAnswer:
      "Somewhat, yes, though the memories are honestly a bit hazy now. I remember their general personalities more clearly than specific details, like which ones were strict and which were more relaxed. My homeroom teacher especially stands out, mostly because I had her for two years straight." },
    { question: "Did you want to be a teacher when you were young?", sampleAnswer:
      "Briefly, actually, around the age of eight or nine. I used to play pretend teacher with my stuffed animals as students, which is embarrassing to admit now. That phase didn't last very long though, since my interests shifted completely by the time I reached secondary school." },
    { question: "Do you think teachers are different now than when your parents were at school?", sampleAnswer:
      "Yes, quite significantly, based on what my parents describe. They mention their teachers were much stricter, sometimes even using physical punishment, which is basically unheard of now. Teaching today seems to focus a lot more on encouragement rather than fear." }
  ]},
  { topic: "Social Media", questions: [
    { question: "Do your friends and family use social media?", sampleAnswer:
      "Yes, pretty much all of them, honestly, across every age group. Even my grandparents have started using it recently, mainly to keep up with family photos. It's become such a normal part of daily communication now." },
    { question: "Do you think people in your country find social media useful?", sampleAnswer:
      "Yes, generally, especially for staying connected with friends and family who live far away. A lot of small businesses also rely heavily on it for marketing these days. That said, plenty of people would probably also admit it can be a bit of a time-waster." },
    { question: "Do you spend too much time on social media?", sampleAnswer:
      "Probably, if I'm being honest. I'll often check my phone without even realising, and before I know it, twenty minutes have disappeared scrolling. I've actually started using screen time limits recently just to keep myself in check." },
    { question: "When did you start using social media?", sampleAnswer:
      "Around the age of thirteen, I think, mostly to keep up with what my classmates were posting. My parents were fairly strict about it at first, only allowing limited use. Looking back, I probably started a bit too young, honestly." }
  ]},
  { topic: "Cars", questions: [
    { question: "Would you like to be the driver or the passenger?", sampleAnswer:
      "I'd actually prefer being the passenger, honestly. It lets me relax and enjoy the scenery without having to focus on the road. Driving stresses me out a little, especially in heavy city traffic." },
    { question: "Is there a lot of cars on the roads in your city?", sampleAnswer:
      "Yes, way too many, especially during rush hour. The roads near my apartment get completely jammed every morning and evening. It's actually one of the main reasons I prefer taking public transport instead." },
    { question: "Do you want to own a very expensive car?", sampleAnswer:
      "Not particularly, no, I've never really cared much about car brands. As long as it's reliable and gets me from point A to B comfortably, that's honestly enough for me. I'd rather spend that kind of money on travelling instead." }
  ]},
  { topic: "Clothes", questions: [
    { question: "What kind of clothes do you like to wear?", sampleAnswer:
      "Mostly casual and comfortable clothing, like jeans and simple t-shirts. I'm not particularly into fashion trends, so I tend to stick with practical basics that go with almost anything. Comfort matters far more to me than looking stylish." },
    { question: "Do you wear different clothes on the weekend?", sampleAnswer:
      "Yes, definitely, weekends are a lot more relaxed. During the week I have to dress fairly smart for work, but on weekends I basically live in tracksuits or hoodies. It's honestly a nice contrast after five days of formal clothing." }
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
    { question: "Do you often go shopping?", sampleAnswer:
      "Not particularly often, actually, maybe once every couple of weeks. I mostly shop for necessities rather than for fun. I do occasionally treat myself, but it's usually a planned purchase rather than an impulsive one." },
    { question: "Do you prefer online or offline shopping?", sampleAnswer:
      "Online, mostly, purely for the convenience. I can compare prices across different sites without leaving my apartment, which saves a lot of time. That said, for clothes specifically, I still prefer shopping in person so I can try things on first." },
    { question: "Do you compare prices before making a purchase?", sampleAnswer:
      "Yes, almost always, especially for anything above a certain amount. I've been caught out before paying more than necessary just because I didn't bother checking elsewhere. Now I usually check at least two or three different sites before deciding." }
  ]},
  { topic: "Quiet Places", questions: [
    { question: "Do you like quiet or noisy places?", sampleAnswer:
      "Personally, I much prefer quiet places. I find that I think more clearly and feel less stressed when my environment is calm. After a long day at school or work, the last thing I want is to be in a loud, crowded place. I usually gravitate towards parks, libraries, or quiet cafés where I can decompress without feeling overstimulated. That said, I do enjoy a lively atmosphere occasionally, like at a live music event or a family gathering." },
    { question: "Would you go to quiet or noisy places on weekends?", sampleAnswer:
      "On weekends, I almost always choose quiet places. The week is usually so busy and stimulating that by the time the weekend arrives, I really crave some peace. I might go for a walk in a park, visit a quiet café, or just stay at home and read. I find that having this quiet downtime makes me much more productive and positive at the start of the next week." },
    { question: "Are there any quiet places near where you live?", sampleAnswer:
      "Yes, fortunately there are. There's a small park about ten minutes from my house that I visit quite regularly. Even though the surrounding area is fairly busy, the park itself has a lovely calm atmosphere — you can hear birds and feel a gentle breeze, which is a nice contrast to the traffic noise outside. There's also a local library nearby that's a great place to study in complete silence." }
  ]},
  { topic: "Public Places", questions: [
    { question: "Have you ever talked with someone you don't know in a public place?", sampleAnswer:
      "Yes, actually. I remember once I was waiting for the bus and the person next to me spontaneously started chatting about how delayed the service was. We ended up having quite a pleasant conversation for about twenty minutes. It was one of those rare interactions with a complete stranger that actually leaves you feeling good about people in general. I think those kinds of spontaneous connections are quite special, even if they're brief." },
    { question: "Do you wear headphones in public places?", sampleAnswer:
      "Yes, quite regularly actually. I usually put on headphones when I'm commuting or in a crowded public space like a shopping mall. It helps me block out the surrounding noise and creates a little bubble of personal space, which I find quite comforting. I mostly listen to music or podcasts during my commute. I'm aware that it makes me less approachable, but I think in busy urban environments it's become a perfectly normal and socially accepted thing to do." },
    { question: "Do you like going to public places?", sampleAnswer:
      "It depends on my mood and the type of place. I enjoy visiting parks, museums, and local markets because they have an interesting energy without being overwhelmingly crowded. I'm less fond of very busy places like shopping malls during peak hours — the noise and congestion can be quite draining. Overall, I think public spaces are an important part of city life; they give communities a shared space to connect and interact." }
  ]},
  { topic: "Space Travel", questions: [
    { question: "Have you ever learnt anything about space and the stars when you were at school?", sampleAnswer:
      "Yes, a little, mostly in basic science classes about the solar system. We learned the names of the planets and some simple facts about the moon. It wasn't very in-depth, but it definitely sparked some curiosity in me." },
    { question: "Would you like to know more about space and the stars?", sampleAnswer:
      "Yes, absolutely, it's honestly a subject I find endlessly fascinating. There's something humbling about realising how vast the universe actually is compared to our daily lives. I occasionally watch documentaries just to learn a bit more whenever I get the chance." },
    { question: "Do you like science-fiction movies set in space?", sampleAnswer:
      "Yes, quite a lot, actually. I especially enjoy films that try to portray space travel somewhat realistically rather than pure fantasy. Interstellar is probably my favourite, mainly because of how it blends real science with an emotional story." },
    { question: "Do you want to go into outer space in the future?", sampleAnswer:
      "Honestly, yes, if it ever became affordable and safe enough for regular people. The idea of seeing Earth from that far away sounds like an absolutely life-changing experience. For now though, it still feels more like a distant dream than a realistic plan." }
  ]},
  { topic: "Feeling bored", questions: [
    { question: "Do you often feel bored?", sampleAnswer:
      "Not really, no, I usually manage to keep myself occupied with something. Between work and hobbies, my schedule tends to be fairly full. On the rare occasion I do feel bored, it's usually late at night when there's genuinely nothing left to do." },
    { question: "Did you ever find school boring when you were a child?", sampleAnswer:
      "Yes, honestly, quite often, especially during subjects I wasn't interested in, like history. I remember constantly watching the clock during those classes, waiting for them to end. Subjects like art or PE, though, always went by much faster." },
    { question: "What sort of things do you find most boring now?", sampleAnswer:
      "Repetitive administrative tasks at work, definitely, like filling out the same kind of paperwork over and over. It requires just enough attention that I can't fully zone out, but not enough to actually be engaging. I usually try to get those tasks done first thing to get them out of the way." },
    { question: "What do you do to stop yourself feeling bored?", sampleAnswer:
      "I usually turn to reading or watching something on my phone. If I have more time, I'll go for a walk instead, since getting outside genuinely helps clear my head. Honestly, even just tidying up my apartment is enough to distract me sometimes." }
  ]},
  { topic: "Dream and ambition", questions: [
    { question: "When you were a child, what job did you dream of doing?", sampleAnswer:
      "I actually wanted to be an astronaut, like a lot of kids do. I was completely fascinated by space at the time, mostly from watching documentaries. Obviously that dream faded as I got older and more realistic about my interests." },
    { question: "Do you think you are an ambitious person?", sampleAnswer:
      "To some extent, yes, though maybe not in an overly aggressive way. I do set fairly high goals for myself, especially with my career, but I try to balance that with actually enjoying the present. I'd rather make steady progress than burn out chasing something too fast." },
    { question: "What kind of job do you want to do in the future?", sampleAnswer:
      "Ideally, I'd like to move into a managerial position within my field eventually. I enjoy the work I do now, but I'd also like more responsibility and the chance to mentor others. It feels like a natural next step for where I want my career to go." },
    { question: "Do you have any dreams or hopes for your life?", sampleAnswer:
      "Yes, quite a few, actually. Career-wise, I'd love to reach a comfortable, stable position within the next several years. On a more personal level, I'd also love to travel to at least a dozen more countries before I settle down completely." }
  ]},
  { topic: "Talking to elderly people", questions: [
    { question: "Do you often talk to elderly people?", sampleAnswer:
      "Fairly often, actually, mainly my grandparents, who I visit most weekends. We usually just chat over tea about how the week's been. I also occasionally talk to elderly neighbours when I see them out walking." },
    { question: "Do you enjoy spending time with elderly people?", sampleAnswer:
      "Yes, quite a lot, honestly. They tend to have really interesting stories and perspectives from their own lives that you just don't get from people your own age. My grandfather in particular has some fascinating stories from when he was younger." },
    { question: "How do you feel about getting old?", sampleAnswer:
      "Honestly, a little anxious, if I'm being truthful, mainly about health issues that can come with age. That said, I also think there are genuine benefits, like having more wisdom and being less stressed about small things. I try to focus more on the positive side of it." }
  ]},
  { topic: "Mirrors", questions: [
    { question: "Do you like looking at yourself in the mirror? How often?", sampleAnswer:
      "Not particularly, honestly, just the usual amount, like when I'm getting ready in the morning. I'm not someone who checks their appearance constantly throughout the day. A quick glance before leaving the house is usually enough for me." },
    { question: "Have you ever bought mirrors?", sampleAnswer:
      "Yes, actually, a small one for my bedroom wall a couple of years ago. I needed one mainly for practical reasons, like checking my outfit before heading out. It also happens to make the room look a bit bigger, which was a nice bonus." },
    { question: "Do you usually take a mirror with you?", sampleAnswer:
      "Not a physical one, no, but I suppose my phone's front camera basically works the same way. I'll occasionally check it if I need to quickly fix my hair while out. It's honestly become such a common substitute that carrying an actual mirror feels unnecessary now." },
    { question: "Would you use mirrors to decorate your room?", sampleAnswer:
      "Yes, actually, I already have a couple placed strategically around my apartment. Aside from being functional, they help make the smaller rooms feel more open and bright. A well-placed mirror can genuinely change how spacious a room feels." }
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

  // updateOne + $set/$setOnInsert instead of replaceOne: a full replaceOne
  // wipes sampleAnswer back to the seed's own default (empty for most
  // questions) on every server restart, silently destroying anything
  // Gemini generated on demand (services/speakingService.js's cache-aside)
  // or a bulk-generation script wrote afterwards — sampleAnswer must only
  // ever be set here on first insert, never overwritten on an existing doc.
  const ops = docs.map(d => {
    const { sampleAnswer, ...rest } = d;
    return {
      updateOne: {
        filter: { topic: d.topic, part: d.part, question: d.question },
        update: { $set: rest, $setOnInsert: { sampleAnswer: sampleAnswer || '' } },
        upsert: true
      }
    };
  });

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
