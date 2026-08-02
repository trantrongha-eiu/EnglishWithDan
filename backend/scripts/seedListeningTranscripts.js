// Seeds the `transcript` field for Listening sections that don't have one
// yet. Sourced from published Cambridge IELTS 21 audioscripts (Tests 1-4,
// all 4 parts each — ieltstrainingonline.com), cross-checked sentence by
// sentence against every question's `correctAnswer` already stored in the
// DB (all 160 questions matched) before being written here.
//
// Each ListeningTest document owns its own embedded copy of every section
// (ListeningTest.sections[]), and there is also an independent standalone
// ListeningSection document per Part (the "Bài lẻ Listening" library) — the
// two collections are NOT linked by reference (see the header comment in
// seedListeningSectionsFromTests.js), so both must be updated to keep them
// in sync. Reuses that script's `sectionTitle()` helper to compute the
// standalone doc's title the same way it was originally created.
//
// Re-run safe: only saves a document if its transcript actually changed.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');
const { sectionTitle } = require('./seedListeningSectionsFromTests');

// Builds the "❓ Transcript\n<title>\nSpeaker:\n<line>\n..." format already
// used by existing transcripts in the DB (confirmed by inspecting a
// populated ListeningSection before writing this).
function fmt(title, turns) {
  const body = turns.map(([speaker, text]) => speaker ? `${speaker}:\n${text}` : text).join('\n');
  return `❓ Transcript\n${title}\n${body}`;
}

const TARGETS = [
  // ══════════════════════════ Cam 21 - Test 1 ══════════════════════════
  {
    testName: 'Cam 21 - Test 1', partNumber: 1,
    transcript: fmt('Oyster Bay Sailing Club', [
      ['Woman', 'Hello, Oyster Bay Sailing Club. How can I help you?'],
      ['Man', "Oh hi. I'd like to find out about sailing courses for beginners."],
      ['Woman', 'No problem. Is it for yourself?'],
      ['Man', "Yes. I had a look online but I'm not sure which course would be best."],
      ['Woman', 'OK. Well you might be interested in our Taster Days?'],
      ['Man', 'Possibly.'],
      ['Woman', "So these are for people who've never sailed before – it's basically an introduction to sailing to find out whether you enjoy it and want to carry on with it."],
      ['Man', 'And how much is that?'],
      ['Woman', "It's £120 for the day, but it's reduced to £110 each if there are two of you."],
      ['Man', 'No, it would just be me.'],
      ['Woman', "Oh that's fine. You'd be in a small group, usually about eight people but no more than ten – and everyone's always very friendly."],
      ['Man', 'Uh huh. And are there any other suitable courses?'],
      ['Woman', 'The other option is the Level 1 course. These are two-day weekend courses and we run those all year round.'],
      ['Man', 'OK. And what do you learn on that course?'],
      ['Woman', 'This is a mix of theory and practical skills. So you learn about things like the weather, which is obviously really important, and also the tides, as well as learning basic sailing skills. You go out into the harbour in special training dinghies for beginners, two people in each dinghy and an instructor. He or she will make sure you understand everything you need to know about safety.'],
      ['Man', 'It sounds like hard work!'],
      ['Woman', "Yes, but you'll have a lot of fun too."],
      ['Man', 'And the cost of that one is...?'],
      ['Woman', "£200. But it's a bit cheaper if you decide to join the club. There's a discount for members."],
      ['Man', "Well, I'm not sure about that yet."],
      ['Woman', "You've got plenty of time to decide."],
      ['Man', 'And does the cost include everything?'],
      ['Woman', "Yes, everything's included and you also get a really good dictionary explaining all the sailing terminology. A lot of people struggle with this at first. It's got lots of pictures, so I'm sure you'd find it really helpful. And on completion of the course you get a certificate. Then you're ready to move on to the Level 2 course."],
      ['Man', 'Sounds good.'],
      ['Woman', "I think that's all the info you need for now. Just a couple of general things. For example, it's really important that you know how to swim."],
      ['Man', "Yes, I'm pretty confident in the water."],
      ['Woman', "Great. The other thing I should tell you is that we provide wetsuits and life jackets but you need to bring swimming trunks and some old trainers."],
      ['Man', 'And a towel?'],
      ['Woman', 'Yes definitely. And you might want to bring your own toiletries, things like shampoo.'],
      ['Man', 'OK. What about food and drink? Do I need to bring that or is there a café at the club?'],
      ['Woman', "Yes, you can get sandwiches, cakes and snacks there. The food's pretty reasonable."],
      ['Man', "OK good. Well I think I'm interested in the Level 1 course. But I know absolutely nothing about sailing so is there anything I can do to prepare myself a bit?"],
      ['Woman', "I recommend you watch some videos we use for training. They're available online. I can send you the link. They'll give you an idea of what to expect."],
      ['Man', "Perfect, thanks. That would be very helpful. Oh and just one other thing - I'll be cycling to the club and will need somewhere to put valuables. I'm just wondering if there are lockers for people to use?"],
      ['Woman', 'Yes, there are plenty in the changing rooms.'],
      ['Man', 'Great. OK well could you book me onto...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 2,
    transcript: fmt('Working as a makeup trainee', [
      [null, "Hello and welcome to the film making podcast. In this week's episode, Claire Lemarre talks to us about how to become a makeup artist. Claire's been working as a makeup artist in the film industry for over 20 years and has lots of useful advice about how to get started."],
      [null, "Thanks Ian. Well, before you can become a makeup artist on films you have to spend about 2 years working as a makeup trainee."],
      [null, "A good place to get your first job would be on a low budget short film. Of course, this means that you'll be working for free. But it's often worth it for the experience. Make sure your transport costs are covered — and remember, there's very unlikely to be any catering provided, so bring plenty of food."],
      [null, "If you're lucky, you might start out on a big budget film where you'll get the most useful experience. On productions like this, makeup and hair styling are separate departments – so you won't need to bring your curling tongs! But you're likely to get the opportunity to work with a range of age groups, as well as different ethnicities. Doing makeup for special effects is highly specialised, so don't expect to be offered any practical experience in that."],
      [null, "One problem with working in the makeup department is that it's a high-pressure environment. There are very few times when you'll be bored or have nothing to do. It can be stressful but you'll see that the top makeup artists are very professional – even when they're having to work with directors who are impatient, or unhappy with the makeup artist's work. Follow your supervisor's lead and try to remain calm at all times."],
      [null, "I've worked with many very famous actors over the years. At first, I found it overwhelming and could hardly speak, I was so in awe. That's preferable, by the way, to becoming too excited and asking for selfies. Now meeting the talent is just a normal part of the job and to be honest most actors don't look that special without all the makeup!"],
      [null, "Every makeup trainee will need a makeup kit, which they'll be expected to have with them at all times. Just the essentials will do for the kinds of tasks you'll be given – it won't be anything complicated. It's worth looking at what the other makeup artists have in their kits – but whatever you do, don't borrow anything without asking first."],
      [null, "It's very important to build your portfolio. You should take photos of all the work you do and ideally show the different stages of makeup application if you can. But remember you'll need to get approval from the makeup designer in charge of the department. As you'll be sending your portfolio digitally, you won't need to get photos printed."],
      [null, "So what does a makeup trainee actually do? You need to think about whether you're the right kind of person to do the job and whether you'd enjoy it. So, to give you some idea, here are some of the things you might be required to do."],
      [null, "You may be asked to help prep an actor ready for makeup. Some actors will arrive having already cleansed and moisturized their skin. But sometimes you'll need to step in and get this done without wasting any time, otherwise the makeup artist will get behind schedule."],
      [null, "Trainees play a useful role in continuity. It will be your responsibility to take photos, log them digitally and print out a hard copy to put in each actor's file. This information needs to be kept in good order as a reshoot can mean replicating makeup months later."],
      [null, "General duties mean doing anything from getting the teas and coffees to putting on a wash. Having a positive attitude and being willing to do whatever is asked of you will help you get your next film job."],
      [null, "You won't be asked to apply makeup to any of the principal cast, only the extras. If there are dozens of extras involved you'll need to keep up a swift pace and not spend too long on each person. It takes quite a lot of confidence to be able to do this well."],
      [null, 'OK now about terms and conditions...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 3,
    transcript: fmt('Ocean biodiversity discussion', [
      ['Phil', "That lecture from the visiting speaker yesterday was good, wasn't it?"],
      ['Lucy', "Yeah. I learned a lot from her about ocean biodiversity. I've already done some reading on it, and I did an assignment on some of the problems associated with it last year, but I especially liked the way her lecture focused on more long-term issues."],
      ['Phil', "Yes, things that aren't currently receiving widespread attention but are likely to be important in the future. That impressed me too. It wasn't exactly a feel-good conclusion because it's hard to see any real solution for a lot of the problems."],
      ['Lucy', 'No, though she did point to where policy changes could be made to protect our marine and coastal environments.'],
      ['Phil', "Mm. But that's just at a national level. The examples she gave were at a more global level, and they really made it clear to me just how wide-ranging the threats to ocean biodiversity are."],
      ['Lucy', 'Yes, me too.'],
      ['Phil', "The research project she described was impressive, wasn't it? I'd have thought it was quite unusual to have so many experts working together."],
      ['Lucy', "Yeah, and from such different backgrounds. Must have been a really exciting team to work with. I'd heard of a couple of them before – they were involved in research way back in 2009 warning about the dangers of ocean pollution."],
      ['Phil', "But now people are much more aware of that, aren't they?"],
      ['Lucy', 'I suppose so.'],
      ['Phil', "Another thing about the research is that the team members came from all round the world. Though I suppose that's not unusual nowadays, now everyone can work remotely."],
      ['Lucy', "Right. I liked the way she didn't bombard us with figures – I mean, they were available, but she focused more on the general points they indicated."],
      ['Phil', 'Mm. And the description of improvements in systems used for tracking marine animals and things like robots were really interesting.'],
      ['Lucy', 'Yes, and her description of how robotics can be used to investigate threats to biodiversity.'],
      ['Phil', 'Absolutely.'],
      ['Phil', "While you're here, can we talk about the list of resources we have to evaluate for the seminar tomorrow. I've had a look at them all, but it's been a bit of a rush."],
      ['Lucy', 'Yeah. What did you think of that article on invasive lionfish? The one claiming they were expanding their habitat throughout the Mediterranean Sea.'],
      ['Phil', "Well, the writer went on about how dangerous they were in environmental terms, which is probably true, but he didn't really provide much information to explain why."],
      ['Lucy', 'I know what you mean.'],
      ['Phil', 'I watched the documentary on microplastics, at least I started to, but then I found it was made ten years ago so I gave up.'],
      ['Lucy', "I watched to the end but you're right, it was showing its age. People had hardly heard of microplastics then, whereas now everyone knows about them and how dangerous they are."],
      ['Phil', 'Yeah. Did you listen to the podcast on ocean pollution?'],
      ['Lucy', "Mm. I didn't get anything out of it though. Most of it was stating the obvious."],
      ['Phil', 'Yes, it mentioned pesticides and plastic and things, and it clearly made the point that they were a bad thing, but everybody knows that anyway. Did you read that book on coastal ecosystems?'],
      ['Lucy', "The one by John Harper? Yes, I found it hard going at first, it went into a lot of detail about things like the effects of offshore windfarms and fish farms, but actually I ended up with a much better understanding of the issues."],
      ['Phil', 'Yes, I agree and I thought it was a well-written summary of those. And the diagrams helped a lot too.'],
      ['Lucy', "The article on metal toxicity was way above my head, I didn't know anything about how metals from industrial emissions react in the ocean... and I still don't understand it."],
      ['Phil', "I gave up reading after the first chapter – I just couldn't follow it."],
      ['Lucy', 'That podcast on floating marine cities was interesting, though it presented a rather one-sided picture, I thought.'],
      ['Phil', 'Yes, it focused on how this would benefit people and ignored the effects on the environment.'],
      ['Lucy', 'But anyway, shall we...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 1', partNumber: 4,
    transcript: fmt('Sources of rubber', [
      [null, "Much of the world now lives in an industrial civilisation. But this has only become possible because we have the necessary natural resources. There are three types of natural resource without which industry could not exist. One of these is metal – without that we'd have no machines and no transportation. Another is fossil fuels, which we need to power those machines. But there's a third resource that's essential to connect the different parts of a machine together with belts and pipes and shock absorbers, and that is rubber. It's now used in over 40,000 products, from waterproof footwear to surgical gloves."],
      [null, "At present, we have two types of rubber in common use. One is natural rubber, which nearly all comes from the Pará rubber tree. This was originally native to Brazil, but is now cultivated on plantations in South-East Asia. Recently, however, concern's been growing that supplies may soon be insufficient for the world's needs. So what exactly is limiting the supply of natural rubber?"],
      [null, "Well, for one thing, rubber trees don't just spring up overnight. It can take eight to ten years for a tree to start producing rubber, so cultivating them's a slow process. And this leads to another problem. With most crops, farmers don't have to think very far ahead, so they can easily change what crop they produce, or how much of a crop they produce, if they find the demand for that crop is rising or falling. But if you have to plant eight or ten years ahead, that's much harder. And also the rubber tree's very choosy about where it grows. It needs the right temperature, the right amount of rainfall, and the right altitude – not too high and not too low. The result is that it can't be grown in the northern or southern parts of the globe, only around the equator. Another problem is that the rubber is basically extracted in the same way as it's been done for hundreds of years, and that's by hand, by making small cuts in the trunk of the tree, and putting a little cup there to catch the latex, as the rubber is called. It's very labour-intensive. And it's not just the initial production that's limiting supplies. With other resources such as water and glass, when we've finished using them we can recycle them, but although this is also possible with rubber, it's very difficult, so that also reduces the amount we have available."],
      [null, "And in the last few years, there have been new threats to the supply of natural rubber. One problem is linked to the fact that nearly all the rubber trees in South-East Asia are descended from just a small number of seeds brought from Brazil in the nineteenth century. This means that there's very little genetic diversity among the trees, which in turn makes them very vulnerable to disease. The most dangerous threat is a fungus, which destroyed large numbers of rubber trees in Brazil, and which could cause devastation to plantations worldwide. Another problem is that farmers in South-East Asia are increasingly turning to the cultivation of palm oil, which is easier and more profitable for them. And finally, in recent years South-East Asia, like other parts of the world, has been repeatedly hit by extreme types of weather, and this looks likely to continue in the future."],
      [null, "However, as well as using natural rubber, it's also possible to make rubber synthetically. This works very well for some purposes, for example, making engine parts, or silicone pots and pans used for cooking. But compared with natural rubber, it's not anything like as strong, and this means it can't replace natural rubber in other products. For example, while a mixture of natural rubber and synthetic rubber works well in car tyres, only natural rubber can stand up to the extreme speeds of aircraft tyres during take-off and landing."],
      [null, "So for some time, scientists have been looking for alternative sources of natural rubber. One that's been known about for some time seems initially to be a rather unlikely source. It's a wild plant with yellow flowers that we normally regard as a weed when we see it in our gardens. But when it's pulled up and its roots cut open, they're found to contain rubber."],
      [null, "Now, compared to the rubber tree, dandelions produce relatively small amounts of rubber, but unlike rubber trees, they're very adaptable. They'll grow in all sorts of places, and they don't need rich soil. So at present there are several projects underway investigating the possibility of using dandelions as a source of rubber."],
      [null, 'Another possibility is a desert shrub grown in Mexico and Texas...'],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 2 ══════════════════════════
  {
    testName: 'Cam 21 - Test 2', partNumber: 1,
    transcript: fmt('One-day classes at Steynford College', [
      ['Man', 'Hello, Steynford College external course registration, can I help you?'],
      ['Woman', "Yeah, I'm ringing to find out about one-day classes next year. I got a leaflet about them in the post but I lost it, and I understand some of the classes are filling up fast, so I might need to book quite soon if I want to go ahead."],
      ['Man', 'Sure. Can you remember which one you were considering?'],
      ['Woman', 'There were a few actually. I remember there was one on how to make Vietnamese food that sounded good. I think that was on the 13th of January. It cost about 60 pounds.'],
      ['Man', "Yes, you're right about the date, but it's 59 pounds actually. It's a very popular class, and among other things the teacher explains how Vietnamese food includes lots of different herbs. I'm afraid that all the places are taken at present, but I can put you on the waiting list if you want?"],
      ['Woman', "No, that's OK. I'm quite interested in the bread making class. That's in March sometime, isn't it?"],
      ['Man', 'Yeah, the 20th of March. Would you like to register for that?'],
      ['Woman', "I'm not sure. How much is it?"],
      ['Man', "The actual cost is £48 but then there's an extra charge as well as that for the ingredients – I'm not sure how much that is, no more than twenty pounds I think."],
      ['Woman', 'So what sorts of things do they make in the class?'],
      ['Man', "Oh, various types of bread; I think they make white bread and then they make sourdough, that seems to be very fashionable at present, and they learn how to make pizza, which is apparently really good."],
      ['Woman', "Well I'd definitely be interested in that, but there were also a few other classes that sounded interesting. I think there was one on face massage? I'd love to learn how to do that."],
      ['Man', "Yeah, that's on the 23rd of February and it costs just £35 for the day. The teacher's great, the type of massage done is a traditional technique used in India and she actually did her training there. The massage is meant to relax you and get rid of lines and wrinkles. You practise it on yourself so you have to take a mirror to the class, so you can see what you're doing."],
      ['Woman', 'OK.'],
      ['Woman', 'And I think there was a class in candle making?'],
      ['Man', "Yes that's sometime in April, I think. Let me check... yes, it's on the 6th. It was on the 23rd of January but they had to change the date. It's just £52. That's a popular course too. I think one reason why people like it is because the candles are all made out of natural products. It's filling up fast but there's still a few places left."],
      ['Woman', 'Yes one of my friends did that class. She said the candles make really good presents. In fact she gave me one.'],
      ['Man', "By the way, have you heard about the class on silk painting? That's being held on the 18th of May. You learn how to create designs on silk fabric and colour them using special dyes. Apparently people can produce beautiful artworks that way, either to put on the wall as a picture or to use for something like a scarf. It's £67.50, which is really good value I think – there's a similar class I've seen that was £110."],
      ['Woman', 'That sounds interesting. Would I need to bring the silk?'],
      ['Man', "No, the only thing is everyone has to bring something to protect their clothing, like an apron if you've got one, or a shirt that you don't use any more, because the dye can really stain your clothes."],
      ['Woman', "Right. Then the last class I was considering was a bit different, that was on DIY for beginners. I'd like to learn how to do household repairs. Are there any places left on that?"],
      ['Man', "That's on the 24th of February – yes, there are a few places. It's a bit more expensive – it's £125 – but it's a very popular class. You learn how to use an electric drill and a saw."],
      ['Woman', "Yeah, that would be really useful, and I even need to learn how to use a hammer because I always end up hitting my fingers."],
      ['Man', "Yes, you'll do that too. And when you've learned how to use the basic tools, you do a practical job which is fixing a shelf to a wall."],
      ['Woman', "Great. Just what I need to know. Right, well I'd like to enrol for that and also for..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 2,
    transcript: fmt('Coastal walks and Melby Coal Mine', [
      [null, 'Here is some information about history and nature walks in the region. They can be completed in less than a day and also be combined with a visit to Melby, a former coal mine now open to the public.'],
      [null, "The Marsden Coastal Walk is suitable for all the family as there are no strenuous climbs. The route begins at Marsden harbour, where there are hourly ferries to and from the beautiful Hooker Island, a great place for fishing. The walk covers part of the coastal path trail. As there are clear signposts all along the way, you don't even need to take a map. At one point, the route goes inland slightly and passes a castle built in the 1400s near to a now-vanished market town. The castle's now just a pile of stones but it's a great place to take photos, and fascinating information boards show what it once looked like. If you set off early, you can be back in time for midday."],
      [null, "The Melby Heritage Walk is a great place to take photos, especially of the night sky. At certain times of the year, people come here from far and wide. They climb to the top of the valley and take pictures of the stars. In the daytime, it's completely different. As you hike through the dense woods in the valley bottom, the only things you'll hear are the sound of your own footsteps. At the highest point, you can stop to take in the views, and those with lots of energy can climb the tower that's situated where there was once a seventeenth century hunting lodge. The route continues along the tops of the hills and brings you back down to the starting point – the car park at Melby Coal Mine."],
      [null, 'Melby Coal Mine has been open to the public for twenty years and has won awards for its visitor experience. Many of the buildings around the mine are still standing and have been converted into display areas.'],
      [null, "Firstly, there's an exhibition showing the history of the mine, with many original black and white photos. To see that, you go from the car park, via a covered walkway to the Main Visitor Centre. Go through the ticket office to an area where there are lockers to leave heavy bags in, and where you can borrow raincoats. Beyond that room is the exhibition."],
      [null, "There's a small bathhouse where miners used to wash after their shift underground. You can see that in the building directly to the north of the engine house. The boiler has gone from there now, but there are lines of tin baths on the stone floor."],
      [null, "There's a display of early mining tools from the days before mechanisation. You can find that in a small L-shaped building in the middle of the northern boundary of the site. It's incredible to think how miners were able to use hand implements to cut through rock."],
      [null, 'The vehicle shed, where you can find wagons of different sizes, along with some of the hi-tech cutting machines that were in use until the mine closed, is in the southwest corner of the site, and can be accessed via a covered walkway.'],
      [null, 'There is a field with ponies, which are always popular with children, on the north-eastern boundary of the site, not approached via a covered walkway.'],
      [null, 'The other building to mention is the education centre. This is where school groups go when they visit the mine, but it\'s also accessible to the public as it contains a library and small gift shop. The centre is connected to the ticket office via a short section of covered walkway.'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 3,
    transcript: fmt('Food safety and food fraud discussion', [
      ['Tutor', "Thanks for coming along, Nadia and Fergus. So this is a chance for you to give us some feedback about different aspects of your course. What would you like to begin with?"],
      ['Nadia', "I've enjoyed the sessions on food safety. There was some information there that I found really surprising, although some was stuff I knew already, like the rise in rates of obesity."],
      ['Fergus', "Yeah, that's been in the news a lot. But I hadn't realised that unsafe food causes more than 200 different diseases."],
      ['Nadia', "No, I'd no idea it was that many. And speaking of diseases, I knew resistance to antibiotics is on the increase, but I didn't know why..."],
      ['Fergus', '...that it\'s partly because when animals are treated with antibiotics then consumed by humans, the antibiotics get into the food chain. I had no idea about that either.'],
      ['Nadia', "Then the sessions provided a lot of information about plastic pollution from food packaging in the ocean, but I think that most of us were already aware of that."],
      ['Fergus', "Yeah. But I thought we could have done more on how much food is thrown away unnecessarily through fear of it being out of date, that was only mentioned in passing."],
      ['Tutor', 'OK, I\'ll bear that in mind. What did you think about the sessions from visiting lecturers, Fergus?'],
      ['Fergus', 'For me the most interesting one was about that project to prevent companies giving incorrect information to consumers about food.'],
      ['Tutor', 'Ah, food fraud, yes.'],
      ['Fergus', 'I thought it was really good to address a problem that\'s faced by so many different groups – people with special religious rules, as well as vegetarians and vegans.'],
      ['Nadia', 'And those with allergies.'],
      ['Fergus', 'Yeah. And another thing, we\'ve had effective ways of analysing DNA for some time now and these can easily be applied to analysing food. But what the researchers succeeded in doing was to ensure that these tests were carried out at different stages in the food\'s journey from the producer to the consumer.'],
      ['Nadia', 'So they knew that the food actually came from the place it was supposed to, and had the ingredients it was meant to.'],
      ['Fergus', 'Exactly. So customers can be confident about what they buy.'],
      ['Nadia', 'And the researchers had a good system for publicising their findings too.'],
      ['Fergus', 'Well, I thought there were some problems with that, actually.'],
      ['Tutor', 'OK. And do you have any recommendations for new topics that we could include in the course?'],
      ['Nadia', "Well, I'm interested in how crop yields can be increased without damaging the environment."],
      ['Fergus', "But we've already done quite a bit on that – but not so much on the seafood industry, where stocks are in danger of being overexploited as a food source unless we can find ways of keeping stocks up."],
      ['Nadia', "Yes, that'd be a good topic. And I'm interested in the idea of a personalised approach to diet, now we have the technology to analyse exactly what individuals need."],
      ['Fergus', 'That sounds more like a medical topic than food science.'],
      ['Nadia', 'OK. What about sessions on the variety of food and eating habits around the world? That\'s very relevant nowadays.'],
      ['Fergus', 'Yes, I think the whole class would be interested in that.'],
      ['Nadia', 'Then there\'s technological stuff, things like 3D printing of food and smart packaging.'],
      ['Fergus', 'Mmm – maybe too specialist.'],
      ['Tutor', "Now, I'm particularly interested in your project – the one where you developed a new food product. So talk me through the stages... first you had to decide on your initial aim."],
      ['Fergus', "We decided we wanted to create something people could eat on the go rather than in a restaurant."],
      ['Nadia', "Yeah so we chose falafel, which was originally a Middle Eastern snack."],
      ['Fergus', "We made up our minds about that pretty quickly. I know some students found it a lot harder to choose, and wasted a lot of time."],
      ['Nadia', "Then we had to do the literature review. We hadn't done one of these before so the handout with advice for the project was very useful here."],
      ['Fergus', "Yes, especially the advice on how to present the information. Then product development, actually deciding what we'd use to make the falafel, and for me the interesting thing about that was that we wanted it to be something a bit different from an ordinary falafel."],
      ['Nadia', "We really made the right choice when we finally decided to use jackfruit, even though it wasn't something that either of us had ever tasted before."],
      ['Fergus', "Yeah, like the name tells you, it's a fruit but actually it's really good in savoury dishes. The product production, working out how to make the falafel, was harder than I expected because I'd never made them before."],
      ['Nadia', "It was mostly trial and error. We started off with the basic recipe and then experimented and when it went wrong..."],
      ['Fergus', '...which it did a lot of the time...'],
      ['Nadia', '...we just moved on and kept adapting it and in the end it turned out fine and we had a lot of fun.'],
      ['Fergus', 'We did!'],
      ['Tutor', 'Thank you. Well, your project was a very good...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 2', partNumber: 4,
    transcript: fmt('Challenges facing the cruise ship industry', [
      [null, "For my presentation today I'm going to talk about some of the issues facing the cruise ship industry and then some ways these can be addressed. The cruise ship industry has partly been responsible for the effects of overtourism in recent decades. Overtourism occurs in places where excessive numbers of tourists cause significant problems. Pollution, for example, is among the greatest threats to many popular tourist destinations."],
      [null, "Of course, for many places it's a difficult balance to achieve. They want to promote their city or island as a desirable tourist destination, but at the same time, are unable to cope with thousands of cruise ship passengers on a daily basis. The trouble is, excessive tourism is destroying the beauty spots and places of interest that people come to visit. Several cities, such as Barcelona, have responded by imposing a tax which all visitors to the city from cruise ships have to pay. But as it's only a couple of euros, many green campaigners think it won't deter enough people to make any difference."],
      [null, "Bruges is another city which became impossible to navigate at times because of the huge numbers of cruise passengers arriving on day trips from the port of Zeebrugge. The city was becoming like a 'theme park', with shops only catering for tourists, selling chocolate, which Belgium is famous for, and other souvenirs. The local council took action to limit cruise passengers to a more manageable level."],
      [null, 'Dubrovnik had to limit the numbers of cruise ships after it became extremely popular as a cruise ship destination when it featured in a hugely successful TV series. What it does now is control the timing of all cruise ship entries to the city\'s port. However, many people feel this measure does not go far enough.'],
      [null, "Cruise ships may be unpopular in some of their destinations but they also have an image problem. They've always been perceived as a safe holiday for the elderly, with not much on offer for families or young couples. A recent survey showed that cost is also a major factor in putting younger groups off going on a cruise. But what they don't realise is that compared to other types of package holidays, cruises can actually be good value, as all activities and drinks are often included. And another perception is that cruises have lots of rules about what to wear and how to behave. But these days, most cruises are no longer very formal and behind the times."],
      [null, 'So what solutions are there for cruise lines to overcome some of these problems? How can they appeal to younger customers? Well one selling point is that cruise ships are becoming more sustainable. New ships are built with hybrid engines with large batteries which means ships do not have to keep their engines running while docked.'],
      [null, "Cruise lines are also designing ships specially for those in the age range of 21 to 45. The décor in these feels contemporary and there are a range of activities on board that you wouldn't find on a more traditional cruise. There's even a boxing ring on one ship, and most offer diving expeditions. But there's also a huge focus on well-being with a variety of sessions of different kinds."],
      [null, 'Food is always a very important part of any cruise and cruise ships have had to radically update their menus to suit the tastes of their younger customers. Vegan dishes are standard, for example. The restaurants on board have also gone paperless with menus available on screen.'],
      [null, 'Unlike older generations who went on cruises largely to get away from everything, younger people expect to be able to keep in touch with friends and family. Many people going on longer cruises also spend time working, so companies have to guarantee wifi that can be relied upon at all times.'],
      [null, 'My grandparents used to love looking through cruise brochures, even when they weren\'t planning on going on a cruise. Until very recently TV ads for cruises always felt dated and aimed at retirees. Cruise lines have been slow to adopt the power of social media but that\'s all changing. Leading cruise lines now employ top agencies to produce first rate videos for social media channels.'],
      [null, 'It will be interesting to see whether...'],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 3 ══════════════════════════
  {
    testName: 'Cam 21 - Test 3', partNumber: 1,
    transcript: fmt('Ferry to Shetland Islands', [
      ['Tammy', 'You know when you went to the Shetland Islands last year, Paul? Did you go by ferry or did you fly?'],
      ['Paul', 'We went by ferry, Tammy. I prefer driving to flying – the journey feels like part of the holiday.'],
      ['Tammy', 'Mmm. Which ferry company did you use?'],
      ['Paul', "There's only one – it's called Northern Ferries. The ferries all leave from Aberdeen."],
      ['Tammy', 'How frequent are they?'],
      ['Paul', "The service is pretty limited – there's only one ferry leaving every evening in summer anyway, seven days a week – I'm not sure about the winter months. They may only run on four or five days then."],
      ['Tammy', 'OK. So it\'s an overnight trip. I quite like that idea. Leaving at night and waking up as you arrive on the island. Can you remember how much you paid for your tickets?'],
      ['Paul', 'They were really cheap and four people and a car worked out at just under £250.'],
      ['Tammy', 'Really? I was expecting it to be more like £400 during the peak season.'],
      ['Paul', "So was I. It's great value. It's a good idea to book in advance because I think they get booked up quite quickly – especially during the school holidays."],
      ['Tammy', "Yes, I suppose so. I'm just not 100% sure of our plans yet. What if I had to cancel?"],
      ['Paul', "That could be a problem. I don't think it's their policy to give refunds – just a voucher – which you can use at a later date. But you have to cancel a month in advance to get that."],
      ['Tammy', 'Right. Well we need to make up our minds quickly then.'],
      ['Paul', "You'd want to book a cabin too. We booked too late to get a cabin with a window. They're more expensive but much nicer than the inner cabins. You don't have to book a cabin at all but I think it's worth paying for. They also have luxury cabins, which are only for two people and have a TV – but I wouldn't bother with those."],
      ['Tammy', 'No, I agree.'],
      ['Paul', 'The only other thing I can think of is to make sure you bring snacks for the kids. The selection on board is quite limited and not that healthy either.'],
      ['Tammy', 'Mmm. What about wifi on board? Is that any good?'],
      ['Paul', "Not really. So it's best to bring some books for them."],
      ['Tammy', "OK. We may need to bring the dog if I can't get anyone to look after him."],
      ['Paul', "We brought ours and it was fine. The kennels on board are OK – they're quite big – you just need to provide a blanket."],
      ['Tammy', 'Uhuh. Sounds good.'],
      ['Paul', 'It was all very easy really – and it was quite an adventure for the kids. They loved being on the sea at night and in the morning keeping a lookout for dolphins – we saw loads.'],
      ['Tammy', 'Oh, the kids would love that!'],
      ['Paul', 'One other thing. We arrived in Aberdeen hours before the ferry was due to leave so we decided to go somewhere else rather than hang around at the port for so long.'],
      ['Tammy', 'Where did you go?'],
      ['Paul', 'Drum Castle.'],
      ['Tammy', "I've never heard of it. Is that spelt like the instrument?"],
      ['Paul', "Yeah. It's really worth visiting. It's got an impressive tower and beautiful gardens and ancient woodland."],
      ['Tammy', 'Sounds lovely. Does it have a restaurant?'],
      ['Paul', "It's only got a coffee shop – no restaurant. We looked up restaurants in the area and found an Italian one in a village nearby. I can check the name of it for you if you're interested."],
      ['Tammy', 'Oh thanks Paul that would be...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 2,
    transcript: fmt('Advice for street food businesses', [
      [null, "Good evening everyone. My name's Jon and I run Veg Out, a street food business selling vegan food. Since 2012 I've been travelling all around the country cooking vegan food in my converted van and selling it at all kinds of outdoor events. I'm here to give you some advice based on my experience."],
      [null, "The good news is that there's never been a better time to start your own street food business. Street food continues to grow in popularity. I think there are a couple of reasons for this. The first is that street food is a reaction against fast food. Street food ranges from high quality burgers to vegan curries and everything in between. But while fast food is cheap and easy to find, it's not particularly good for you. It's also the same everywhere. What you get with street food on the other hand is something different. People like the idea of trying something they can't get anywhere else. They also like seeing food prepared and which hasn't come straight out of a freezer."],
      [null, "You need to think about the best place to sell your street food. People always think music festivals are an obvious place to start but the cost of renting a space can be huge. And there's always a lot of competition. Food markets, on the other hand, are great because customers are always really interested in food and give great feedback. And if you can get a spot in your local park – fantastic. Usually very relaxed but with lots of customers passing by. Once you get established you'll start getting asked to do parties – which can be really challenging but lots of fun. Having street food at weddings has become quite fashionable too – but you need to really know what you're doing as everything needs to be perfect."],
      [null, "Setting up a street food business costs a lot less than opening a restaurant or café but you'll have to buy some basic equipment. I'd try to get things like hobs and fridges second hand if you can. You can replace them with better quality stuff if your business takes off. Renting is another option but you'll end up spending more money rather than saving it."],
      [null, "You've probably got a good idea about the food you're planning to sell. I expect you've done some research to find out if anyone else is selling a similar product. And you'll have thought about any possible allergies to nuts or eggs etc. But there's one thing people don't always think about and that's how you're going to serve it. On a plate? In a bag? Will you provide a fork? Will it all be easily recyclable or reusable? It's got to be easy to eat and look attractive or customers won't come back."],
      [null, 'Once you get started, you should be prepared for things to go wrong. Every business faces problems and here are a few examples from street food businesses that I know.'],
      [null, 'My friends who run Thai Basil started by juggling their street food business with their day jobs in a restaurant. Their work-life balance was non-existent as they were working til midnight in the restaurant all week and then took their food truck to markets on their days off.'],
      [null, 'The owners of Basque found it was hard to make a profit because the price of fish – essential for some of their dishes – was so high. And it was hard to charge customers a lot more for those dishes. So they had to stop focussing on fish dishes and include more vegetarian food.'],
      [null, "The owners of Lou's kitchen were making salads to order from their van and some of their dishes were quite complicated. At one of their first events they ended up with people standing in a long queue for more than 15 minutes – and many of them lost patience. So make sure whatever you offer can be served quickly and efficiently."],
      [null, "The owners of Chip Chop had found a perfect venue near a beach where there weren't any other street food trucks. But what they hadn't realised was that they'd need a special licence – which individual businesses don't need at markets or festivals. It was a complicated process and in the end they gave up."],
      [null, "So I hope that's given you a flavour of..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 3,
    transcript: fmt('Ethical and sustainable fashion discussion', [
      ['Maddy', 'Shall we go through our research for our sustainable fashion project?'],
      ['Ryan', "Good idea. I think I've done enough reading now."],
      ['Maddy', "Me too. I've learnt such a lot about what sustainability actually means."],
      ['Ryan', "Mmm, same for me with ethical fashion. I didn't really appreciate the difference between that and sustainable fashion before doing this research."],
      ['Maddy', "I know – most people use these terms interchangeably – but in fact the difference is quite distinct. Sustainable relates to the environment and ethical relates more to the way workers or animals are treated."],
      ['Ryan', "I totally understand why people get confused, though. There are so many other terms used – like 'eco-friendly', which is actually quite meaningless."],
      ['Maddy', "And the way companies use these terms when describing their products doesn't help. They're often deliberately vague, and don't provide enough information about how their products are made."],
      ['Ryan', 'Yes.'],
      ['Maddy', "It was interesting to read about the debates surrounding wool production and how ethical and sustainable that is. It's generally considered to be sustainable because it's a natural product."],
      ['Ryan', "And it also lasts a long time and can be recycled. All very positive. But I wasn't convinced by the argument that wool production is sustainable because it doesn't use many chemicals – what about all the fungicides and insecticides used in sheep farming?"],
      ['Maddy', "Good point. And I couldn't find any evidence for the claim about sheep farming being better for the environment than cattle farming."],
      ['Ryan', "No – they're both really bad. I read different reports about how unethical it is to even shear sheep. Some people say it's cruel but as long as the sheep are kept in good condition I can't see anything wrong with it."],
      ['Maddy', 'Me neither.'],
      ['Ryan', 'Shall we talk about some of the semi-synthetic new fabrics now?'],
      ['Maddy', "OK, let's do that."],
      ['Ryan', "Let's start with Lyocell, I've been reading about that."],
      ['Maddy', "Yeah, that's the one produced from the pulp of eucalyptus trees, isn't it?"],
      ['Ryan', "Yes, and what happens with that is really impressive. Over 99% of dissolving agents used in the manufacturing process are used again."],
      ['Maddy', "Yeah. Now, there are a few semi-synthetic fabrics that I'd never heard of. Like Cupro, for example."],
      ['Ryan', "Made from byproducts of the cotton industry to create a kind of vegan silk. But I'm not sure how sustainable this really is as there are so many reports of pollution caused by the manufacturing process."],
      ['Maddy', "Mmm. It doesn't compare favourably with all the other sustainable fabrics we've looked at, no."],
      ['Ryan', "Bamboo is one fabric we're all familiar with. But I didn't know that it was only organic bamboo that's truly sustainable."],
      ['Maddy', "Me neither. Apparently, the manufacturing process for a significant proportion of bamboo is chemically quite intensive – which obviously can be quite damaging."],
      ['Ryan', 'EcoVero is an example of a semi-synthetic fabric which is becoming really popular.'],
      ['Maddy', "Probably because manufacturing causes 50 percent fewer emissions and takes up half as much energy as conventional fabrics. That saves production costs as well as being better for the environment."],
      ['Ryan', "That's true. I think demand for cork will continue to grow. It works really well in vegan shoes and bags."],
      ['Maddy', "Mmm and it's the only fabric that's fundamentally sustainable – the cork trees it comes from are renewable and the product itself is both recyclable and biodegradable – which is unique."],
      ['Ryan', 'And the harvesting process is actually good for the trees. There are no downsides to using this source at all.'],
      ['Maddy', 'Hemp is another really good sustainable fabric from a natural source.'],
      ['Ryan', "Yes. Did you know that clothes made from hemp protect the wearer from the sun and it's also antibacterial?"],
      ['Maddy', "No, I didn't. But I did read that it's quite hard to grow, so perhaps that's why it's not as common as you'd think."],
      ['Ryan', "I'm sure that'll change."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 3', partNumber: 4,
    transcript: fmt('Invasive species', [
      [null, "Today I'm going to talk about invasive species. Let me start by saying what an invasive species is and what it's not. Invasive species are any animal or plant that is introduced into an environment by humans, and which is then harmful to that environment. It's important to be clear that not all introduced species are invasive. Many introduced – or non-native – species thrive in new areas without posing any threat."],
      [null, "In some cases, invasive species have changed the natural world beyond recognition, so let's look at the different ways they can be problematic. First of all, invasive species may eat native species, or sometimes they may bring a disease with them, which native species have never faced before and therefore have no defences against. Often the invasive species breed very quickly – which further adds to the problem of native species losing their sources of food. Species invasions are one of the biggest causes of damage in an ecosystem, actually putting its survival at risk."],
      [null, "So, how do invasive species spread? Without a doubt, the biggest cause is human activity. This could be intentional, or it could be accidental, such as when people who've been on holiday in another country come back with, say, the seeds of plants on their clothes or shoes. Plants and animals, especially insects, arrive in or on the cargo of ships, and then escape into their new 'home'. But sometimes humans deliberately move animals and plants around the world, for example to use them to control pests on farms, or to be pets. This can go very wrong if those animals and plants move into wild settings and start breeding or begin growing in ways that weren't predicted."],
      [null, "Let's now look at an example of an invasive species here in Australia: Rhinella marina is a species of toad that was deliberately introduced from Hawaii in 1935 as a form of biological control. It was hoped that the toads would eat the grey-backed beetles responsible for destroying crops of sugar on many of the plantations. At first, just a handful of toads were released by scientists into Queensland, but this number soon grew as other states followed suit. Within two years, 62,000 young toads had been released into the wild. The toads did nothing to protect the plantations, but they did reproduce rapidly and could soon be found all over the northern half of the country. The toads are poisonous at every stage of their life cycle, and anything that eats them will die."],
      [null, "My second example regarding invasive species is the United Kingdom. Actually, there are more than three-thousand invasive species there, including some that are extremely common. Some invasive plants, such as Japanese knotweed, have had a devastating impact on parts of the UK. Gardeners in the nineteenth century considered it a beautiful ornamental plant – which it is, when it's kept under control – but it soon spread into the countryside and remains a problem even to this day as it's so hard to eradicate. Another invasive plant is rhododendrons, which can be found in UK parks and woodlands. Their introduction dates back to 1763, but they're now seen as harmful because they block out so much light that native wild flowers can't grow beneath them."],
      [null, "And then there are grey squirrels, which are one invasive species almost everyone in the UK will have come across. They were brought to the UK from North America and introduced to private estates around the 1870s but are now found everywhere, from forests to city squares. Grey squirrels have outcompeted the smaller, native red squirrels. They both eat the same food, and the grey squirrels carry a type of virus that is deadly to the red squirrels. Red squirrel populations have collapsed, and there are only a handful of sites left in the UK where they're found."],
      [null, "An important question for ecologists worldwide is, what can we do to tackle the problem of invasive species? The first step in controlling invasive species is learning about the behaviour of new species coming into the country. Monitoring is an important part of this, so that we can know if the new species begins to have a negative impact in its new environment. One effective way to keep track of invasive species is to create a database for the whole country. That way, all relevant authorities and agencies can share important information and take whatever action's needed. But the public also have a vital role to play in this process. They should be encouraged to photograph harmful species – because this helps with identification – and then to report when and where these were observed. But it's important to tell people not to destroy or even touch what they've found."],
      [null, "Now, I'm going to move on to..."],
    ]),
  },

  // ══════════════════════════ Cam 21 - Test 4 ══════════════════════════
  {
    testName: 'Cam 21 - Test 4', partNumber: 1,
    transcript: fmt('Survey about shopping in Broadbeach', [
      ['Woman', "Good morning. I'm doing a survey of shoppers in Broadbeach. Would you have a few minutes to spare to answer some questions?"],
      ['Man', 'Oh...erm...yes, I guess that would be ok.'],
      ['Woman', "Thank you very much. Everybody seems so busy today."],
      ['Man', "Well actually I don't have loads of time, so..."],
      ['Woman', "Oh yes, of course. It really won't take long. Could I start by taking your name please?"],
      ['Man', "Martyn Leigh. Martyn's with a Y."],
      ['Woman', 'And is your family name spelt L-double-E?'],
      ['Man', "It's L-E-I-G-H."],
      ['Woman', "Thank you. We don't actually publish your name or details. It just makes it easier for me to identify people when I look at all the results at the end."],
      ['Man', 'I see.'],
      ['Woman', 'And can I ask, how did you get into town today?'],
      ['Man', "Well, normally I catch the bus, but I'm on my motorbike today because I'm going to work later."],
      ['Woman', "And could you tell me what you're doing this morning, I mean, the reason for your trip into town?"],
      ['Man', "I've just been to the hairdresser. You see, I have a job interview at the council in a few days."],
      ['Woman', 'Oh really! Well, good luck with that.'],
      ['Man', "Thanks a lot. And now I'm on my way to buy a suit that I can wear to the interview. I don't actually own one at the moment!"],
      ['Woman', "OK. Is that everything you're planning to do in town?"],
      ['Man', "Yeah. Well, I've got to go and pick up my laptop. It broke a couple of days ago so I took it to the shop to get it fixed. They had to order a spare part, but apparently it's ready for collection now. I can't wait to get it back."],
      ['Woman', "I'm sure. I hate it when my technology breaks down. ...One more thing, it's Saturday today – is that when you like to do your shopping?"],
      ['Man', "Well it's more a question of when I'm free. If I'm free on a Monday, that's when I choose to come into town. The shops are less busy then, which I always prefer."],
      ['Woman', "So, I'd like to ask you a few more questions to get your views about shopping in Broadbeach, if that's ok."],
      ['Man', 'Sure. What would you like to know specifically?'],
      ['Woman', 'What would you say you like best about the shops here?'],
      ['Man', "I'd probably say it's the service you get wherever you go."],
      ['Woman', 'OK. And what do you think about the range of shops in Broadbeach?'],
      ['Man', 'Oh you can get almost anything you want here.'],
      ['Woman', "And what about recent changes? What do you like and dislike about them? For example, there are a lot of new coffee shops now, are you enjoying them?"],
      ['Man', "No, there are too many of them. It's a shame as those places could be occupied by other kinds of shops."],
      ['Woman', 'What would you like to see instead?'],
      ['Man', "Well, I think we have enough clothing shops. But there's only one place that sells books at the moment. It'd be nice to have a choice, you know."],
      ['Woman', 'Right. And have you been to the new shopping centre outside Broadbeach yet, Martyn?'],
      ['Man', "Yes, once or twice. It's not that far from where I live."],
      ['Woman', "It's a very modern-looking building, isn't it?"],
      ['Man', "Yes, and it's lovely. The glass roof is certainly impressive. But my favourite thing is the plants they've put around the building. They're amazing, and so big already."],
      ['Woman', 'And what about the entertainment facilities? Have you used any of them yet? Like the new cinema?'],
      ['Man', "Nah, not yet. I can't see any advantage in having it there because the one in town is actually bigger."],
      ['Woman', 'OK, well thank you so much for...'],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 2,
    transcript: fmt('Business exhibition podcast', [
      [null, "Hello and welcome to this podcast telling you about our annual business exhibition. This year, as always, it will be full of the very best speakers, features and innovations."],
      [null, "Let me start by reading some feedback from James Craig, who's exhibited with us for the past two years. James says, 'I'm director of a company called TalkCon, which is an office phone system. The first year we exhibited, we had a stand in the Business Village, where we made a lot of useful contacts. We also used the Breakout area where people could sit down and relax, and try out our products, and due to popular request we used that again last year. Last year we also sponsored the innovative Business Connections Zone where people could leave their contact details on a board to contact other companies, and that also effectively raised our corporate profile. We're hoping that in the coming exhibition we'll also have a presence in the Digital Marketing centre, which is clearly a key area for our company. And also maybe have our own Talkcon Zone, at some stage.'"],
      [null, "The exhibition's open from 8am to 11pm and there's a range of special events for you to enjoy in the evening."],
      [null, "As well as a unique chance to publicise your company, businesses who exhibit with us can claim discounts on a number of popular brands, including major high street fashion and jewellery outlets, as well as grocery chains. Discounts available range from 3.5% up to an amazing 15%, so you can save a lot of money. In fact, the average saving made by each exhibitor came to over £400! The scheme is available to every member of your organisation so this is a benefit that really does have something for you all."],
      [null, "Now let me tell you about some of our keynote speakers for this year's exhibition."],
      [null, "Jim Clowrie started off selling vegetables from a small plot, then opened a small café. Rather to his surprise this became a bit of a sensation, and in a remarkably short time he had opened an amazing 76 restaurants worldwide. He'll be telling you how it all happened, and how it changed his life."],
      [null, "David France will be giving an inspirational talk about how as a business-minded teenager he managed to set up his own company, and even to be the first person under 18 to get a business bank account. David's company has gone from strength to strength but he isn't just interested in making money – he also makes regular donations to organisations helping those in need both in the UK and elsewhere in the world."],
      [null, "Oliver Stanton was born and educated in the UK, and then went to Malaysia where he set up a rubber-wood furniture business. He then built log houses in the mountains in Japan before moving to Hong Kong to set up a digital marketing business. After that he moved back to the UK with his wife Saiphin, and together they opened a Thai café. He'll be telling you about what he discovered during his travels around the world about business practices in different cultures."],
      [null, "Francesca Heptonstall is a broadcaster and businesswoman who's known for her down-to-earth attitude. After winning a top job in a TV contest, she launched a number of online deal sites. Her main business interest is in technology, but she's also passionate about helping people gain employment and organises an annual jobs fair, so she'll be concentrating on this in her talk."],
      [null, "Salman Khan is the Chief Executive of QBF Enterprises, and has turned around this business from a major publishing business to one of the UK's largest digital marketing service providers. He'll be talking about the need for flexibility to cope with new directions in today's business world."],
      [null, "Finally, Annie Craven is a consultant and coach who works with people to create lasting changes in their business and life. Her session will offer an interactive look at different obstacles in people's own lives, not just in business. She also looks at how you can overcome them, whether you're starting out in business or at the top of your game."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 3,
    transcript: fmt('Presentation on houses of the future', [
      ['Mia', "You know that joint presentation we've got to do this semester, Leo?"],
      ['Leo', 'On houses of the future?'],
      ['Mia', "That's right. I'm a bit concerned – are we meant to come up with creative new suggestions for these houses?"],
      ['Leo', "I don't think so. It's more a matter of reporting and evaluating possible developments. But we mustn't be too general, we've got to support our points by referring to specific cases. So that'll need a lot of work."],
      ['Mia', "I'm afraid so. When's it got to be done by?"],
      ['Leo', "In about 6 weeks, so that's not too much of a rush."],
      ['Mia', "Good. We'd better decide now what type of housing we're going to focus on."],
      ['Leo', 'How about housing for different generations living together?'],
      ['Mia', 'We could do. Or accommodation for one person?'],
      ['Leo', "I think someone else is doing that. I was wondering about housing for the elderly? That's likely to become more important."],
      ['Mia', "Yeah that's true. But I think your suggestion about intergenerational living might be more interesting – let's go with that."],
      ['Leo', "OK. Now I think the future demand is mainly going to be for accommodation in urban areas. So one way of meeting that demand might be to use existing commercial buildings and adapt them to form accommodation..."],
      ['Mia', "...or come up with original ways of organising space so that people can live in smaller homes. But I think the solution is to design multi-storey apartment blocks."],
      ['Leo', 'Building up rather than out, yes.'],
      ['Mia', 'Let\'s think of some specific developments for houses of the future.'],
      ['Leo', 'OK. How about increased use of roof space on high-rise buildings for gardens.'],
      ['Mia', "Yes. In fact it doesn't have to be high-rise, you can do it on a one-storey building in a suburb, but it would greatly improve how you feel if you live in an urban high-rise."],
      ['Leo', "Especially if you don't have a balcony."],
      ['Mia', "Yes. I think homes of the future will all need access to a shared working space, somewhere in the same building or group of houses, where people can go and work instead of just having a laptop on the kitchen table."],
      ['Leo', "Yes, so they aren't having to travel to an office but can still interact with others. That's often how new ideas get generated – by chatting to someone from a different profession."],
      ['Mia', "Yeah. I read about a type of design where the internal walls of an apartment are moveable, so the space can be adapted over time as people's needs change."],
      ['Leo', "Like when children leave school and start working but still continue to live with their parents for many years? Or when an elderly relative moves in with the family... it would mean they could still have their own space, specially designed for their needs."],
      ['Mia', "Yes. Have you heard about those smart bathroom mirrors which can monitor people's health? They recognise signs of illness and contact a doctor automatically?"],
      ['Leo', "Hmm, not so sure they're a good idea."],
      ['Mia', "Nor am I. People might worry about conditions which aren't serious at all."],
      ['Leo', "What about transport? Wouldn't it be good if there were bike sheds with charging points, so people could store their electric bikes securely and charge them up at the same time."],
      ['Mia', 'Yes. That would encourage more people to cycle, instead of using their car. Much better for the planet.'],
      ['Leo', 'I read about one housing development where cars had to be left just outside it, so the centre was all a pedestrianised area. Great for families with children.'],
      ['Mia', "Maybe. But what if you're disabled or elderly, and can't walk far? It wouldn't be so good for people like that."],
      ['Leo', 'No.'],
      ['Mia', "I saw a scheme for communal vegetable plots, where neighbours could decide what to grow together. That'd be a great way for older people to get to know one another, especially if they're no longer going out to work."],
      ['Leo', "Yes, doing something together's always more enjoyable, isn't it? Do you think..."],
    ]),
  },
  {
    testName: 'Cam 21 - Test 4', partNumber: 4,
    transcript: fmt('Music therapy for surgical patients', [
      [null, "Today's lecture is about studies that look at how music therapy can be used to help patients who undergo surgery. Now, most people undergo a surgical procedure at some point in their lives. And more than fifty-one million operations are performed annually in the USA. But there's no escaping the fact that most patients feel uncomfortable following surgery. They may have difficulty mobilising, and even sitting up in bed can feel too much. They may also be negatively affected by having their routine disturbed, you know, like if they can't do the things they normally do, or have to devote a lot of time to appointments such as physiotherapy, to aid their recovery."],
      [null, "Currently, the main strategy for improving recovery is medication to control pain, and this can be administered to patients in the short, medium or longer term, depending on the extent of their surgery. But music is still not an everyday part of the post-surgical phase, despite a wealth of relevant studies supporting its potential in recovery."],
      [null, "Earlier this year, a research team set out to assess all the available evidence so that they could highlight the potential for music in surgical recovery. They identified nearly a hundred trials involving a total of seven thousand patients who were played recorded music as part of their post-operative care. The researchers then looked at what impact the music had on the patients. They discovered that patients who had been played music reported feeling happier and more satisfied in the post-operative phase, and the length of their stay was shorter than for patients who had not listened to any music."],
      [null, "The researchers also explored the patients' choice of music, and their findings showed that a wide variety of music styles was evident. However, a common factor was that the chosen music had a calming quality. Some of the patients listened to music with headphones, but it was quiet enough not to prevent them from being able to communicate with nurses and other staff. More often though, the mode of delivery was by what are known as music pillows. These broadcast sound that is only audible to the person lying on them. The research involved testing music before, during or after operations or a combination. Some patients listened to the music just once a day, while others had several episodes a day."],
      [null, "When asked to report their experience of listening to music, surgical patients said that either they had no feelings of anxiety at any point, or those feelings were only slight. Patients who hadn't listened to music, on the other hand, reported higher levels of dissatisfaction. This feedback from all of the patients was then cross-checked against their medical notes. And in every case, those who were given music to listen to didn't need as much medication to ease their pain as those patients who weren't played music. The type of music, patient choice and timing, before, during or after the surgery didn't make much difference. And it even worked when patients were played music under general anaesthetic, although the positive effects were greater when patients were awake."],
      [null, "All the evidence suggests that music has a positive effect on post-operative patients, but it's not entirely clear how or why this is the case. A lot of people listen to music in daily life as a way to relax and forget their problems, but the researchers came to the conclusion that it worked on patients by distraction. I suppose it was something familiar and gave them something they could control."],
      [null, "The researchers say there is now sufficient research to demonstrate that music should be available to all patients undergoing operations. They say patients should be able to choose what they'd like to listen to, and if they prefer, recordings taken from nature can be just as good as music. Surgical teams may prefer patients to listen to music before the procedure or as soon as they arrive back onto the ward. Clearly, there's more to learn about this area, and the team now plan to focus their next research on the most appropriate volume to play the music at. And I look forward to reading the results of their study."],
    ]),
  },
];

async function runSeed() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS) {
    const { testName, partNumber, transcript } = target;

    // 1) Embedded copy on ListeningTest.sections[]
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    // 2) Standalone ListeningSection ("Bài lẻ Listening" library) — same
    // title-resolution logic used when these docs were first created.
    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscripts] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped, only the ListeningTest copy was updated.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscripts] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningTranscripts] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
