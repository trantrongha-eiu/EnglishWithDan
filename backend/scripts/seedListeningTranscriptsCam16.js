// Same approach/format as seedListeningTranscripts.js (Cam 21) — sourced
// from published Cambridge IELTS 16 audioscripts (ieltstrainingonline.com),
// verified sentence by sentence against every question's correctAnswer
// already in the DB before being written here.
//
// NOTE — pre-existing DB data bug found (not fixed here, out of scope for
// a transcript-only pass; flagged to the user separately): Cam 16 - Test 2
// Part 2, questions 12 and 13 have their correctAnswer values swapped.
// Q12 ("What is planned with regard to the lower school?") is stored as A
// but independently verified (transcript + external answer key) to be B.
// Q13 ("The catering has been changed because of") is stored as B but
// verified to be A. Every other question in this file was confirmed
// correct against the transcript.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ListeningTest = require('../models/ListeningTest');
const ListeningSection = require('../models/ListeningSection');
const { sectionTitle } = require('./seedListeningSectionsFromTests');

function fmt(title, turns) {
  const body = turns.map(([speaker, text]) => speaker ? `${speaker}:\n${text}` : text).join('\n');
  return `❓ Transcript\n${title}\n${body}`;
}

const TARGETS = [
  // ══════════════════════════ Cam 16 - Test 1 ══════════════════════════
  {
    testName: 'Cam 16 - Test 1', partNumber: 1,
    transcript: fmt("Children's Engineering Workshops", [
      ['Sarah', "Hello. Children's Engineering Workshops."],
      ['Father', 'Oh hello. I wanted some information about the workshops in the school holidays.'],
      ['Sarah', 'Sure.'],
      ['Father', "I have two daughters who are interested. The younger one's Lydia, she's four - do you take children as young as that?"],
      ['Sarah', 'Yes, our Tiny Engineers workshop is for four to five-year-olds.'],
      ['Father', 'What sorts of activities do they do?'],
      ['Sarah', "All sorts. For example, they work together to design a special cover that goes round an egg, so that when it's inside they can drop it from a height and it doesn't break. Well, sometimes it does break but that's part of the fun!"],
      ['Father', 'Right. And Lydia loves building things. Is there any opportunity for her to do that?'],
      ['Sarah', "Well, they have a competition to see who can make the highest tower. You'd be amazed how high they can go."],
      ['Father', 'Right.'],
      ['Sarah', "But they're learning all the time as well as having fun. For example, one thing they do is to design and build a car that's attached to a balloon, and the force of the air in that actually powers the car and makes it move along. They go really fast too."],
      ['Father', 'OK, well, all this sounds perfect.'],
      ['Father', "Now Carly, that's my older daughter, has just had her seventh birthday, so presumably she'd be in a different group?"],
      ['Sarah', "Yes, she'd be in the Junior Engineers. That's for children from six to eight."],
      ['Father', 'And do they do the same sorts of activities?'],
      ['Sarah', "Some are the same, but a bit more advanced. So they work out how to build model vehicles, things like cars and trucks, but also how to construct animals using the same sorts of material and technique, and then they learn how they can program them and make them move."],
      ['Father', 'So they learn a bit of coding?'],
      ['Sarah', "They do. They pick it up really quickly. We're there to help if they need it, but they learn from one another too."],
      ['Father', 'Right. And do they have competition too?'],
      ['Sarah', "Yes, with the Junior Engineers, it's to use recycled materials like card and wood to build a bridge, and the longest one gets a prize."],
      ['Father', "That sounds fun. I wouldn't mind doing that myself!"],
      ['Sarah', "Then they have something a bit different, which is to think up an idea for a five-minute movie and then film it, using special animation software. You'd be amazed what they come up with."],
      ['Father', "And of course, that's something they can put on their phone and take home to show all their friends."],
      ['Sarah', 'Exactly. And then they also build a robot in the shape of a human, and they decorate it and program it so that it can move its arms and legs.'],
      ['Father', 'Perfect. So, is it the same price as the Tiny Engineers?'],
      ['Sarah', "It's just a bit more: £50 for the five weeks."],
      ['Father', 'And are the classes on a Monday, too?'],
      ['Sarah', "They used to be, but we found it didn't give our staff enough time to clear up after the first workshop, so we moved them to Wednesdays. The classes are held in the morning from ten to eleven."],
      ['Father', 'OK. That\'s better for me actually. And what about the location? Where exactly are the workshops held?'],
      ['Sarah', "They're in building 10A - there's a big sign on the door, you can't miss it, and that's in Fradstone Industrial Estate."],
      ['Father', 'Sorry?'],
      ['Sarah', 'Fradstone - that\'s F-R-A-D-S-T-O-N-E.'],
      ['Father', "And that's in Grasford, isn't it?"],
      ['Sarah', 'Yes, up past the station.'],
      ['Father', 'And will I have any parking problems there?'],
      ['Sarah', "No, there's always plenty available. So would you like to enrol Lydia and Carly now?"],
      ['Father', 'OK.'],
      ['Sarah', 'So can I have your full name …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 2,
    transcript: fmt("Stevenson's work experience induction", [
      [null, "Good morning, everyone, and welcome to Stevenson's, one of the country's major manufacturers of metal goods. Thank you for choosing us for your two weeks of work experience. My name is Julia Simmons, and since the beginning of this year I've been the managing director."],
      [null, "Stevenson's is quite an old company. Like me, the founder, Ronald Stevenson, went into the steel industry when he left school - that was in 1923. He set up this company when he finished his apprenticeship, in 1926, although he actually started making plans two years earlier, in 1924. He was a very determined young man!"],
      [null, "Stevenson's long-term plan was to manufacture components for the machine tools industry - although in fact that never came about - and for the automotive industry, that is, cars and lorries. However, there was a delay of five years before that happened, because shortly before the company went into production, Stevenson was given the opportunity to make goods for hospitals and other players in the healthcare industry, so that's what we did for the first five years."],
      [null, "Over the years, we've expanded the premises considerably - we were lucky that the site is big enough, so moving to a new location has never been necessary. However, the layout is far from ideal for modern machinery and production methods, so we intend to carry out major refurbishment of this site over the next five years."],
      [null, "I'd better give you some idea of what you'll be doing during your two weeks with us, so you know what to expect. Most mornings you'll have a presentation from one of the managers, to learn about their department, starting this morning with research and development. And you'll all spend some time in each department, observing what's going on and talking to people - as long as you don't stop them from doing their work altogether! In the past, a teacher from your school has come in at the end of each week to find out how the group were getting on, but your school isn't able to arrange that this year."],
      [null, "OK, now I'll briefly help you to orientate yourselves around the site. As you can see, we're in the reception area, which we try to make attractive and welcoming to visitors. There's a corridor running left from here, and if you go along that, the door facing you at the end is the entrance to the coffee room. This looks out onto the main road on one side, and some trees on the other, and that'll be where you meet each morning."],
      [null, "The factory is the very big room on the far side of the site. Next to it is the warehouse, which can be accessed by lorries going up the road to the turning area at the end. You can get to the warehouse by crossing to the far side of the courtyard, and then the door is on your right."],
      [null, "Somewhere you'll be keen to find is the staff canteen. This is right next to reception. I can confidently say that the food's very good, but the view isn't. The windows on one side look onto a corridor and courtyard, which aren't very attractive at all, and on the other onto the access road, which isn't much better."],
      [null, "You'll be using the meeting room quite often, and you'll find it by walking along the corridor to the left of the courtyard, and continuing along it to the end. The meeting room is the last one on the right, and I'm afraid there's no natural daylight in the room."],
      [null, "Then you'll need to know where some of the offices are. The human resources department is all the front of this building, so you head to the left along the corridor from reception, and it's the second room you come to. It looks out onto the main road."],
      [null, "And finally, the boardroom, where you'll be meeting sometimes. That has quite a pleasant view, as it looks out on to the trees. Go along the corridor past the courtyard, right to the end. The boardroom is on the left, next to the factory."],
      [null, 'OK, now are there any questions before we …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 3,
    transcript: fmt('Art project on birds in painting', [
      ['Jess', 'How are you getting on with your art project, Tom?'],
      ['Tom', "OK. Like, they gave us the theme of birds to base our project on, and I'm not really all that interested in wildlife. But I'm starting to get into it. I've pretty well finished the introductory stage."],
      ['Jess', "So have I. When they gave us all those handouts with details of books and websites to look at, I was really put off, but the more I read, the more interested I got."],
      ['Tom', 'Me too. I found I could research so many different aspects of birds in art - colour, movement, texture. So I was looking forward to the Bird Park visit.'],
      ['Jess', 'What a letdown! It poured with rain and we hardly saw a single bird. Much less use than the trip to the Natural History Museum.'],
      ['Tom', 'Yeah, I liked all the stuff about evolution there. The workshop sessions with Dr Fletcher were good too, especially the brainstorming sessions.'],
      ['Jess', "I missed those because I was ill. I wish we could've seen the projects last year's students did."],
      ['Tom', "Mm. I suppose they want us to do our own thing, not copy."],
      ['Jess', 'Have you drafted your proposal yet?'],
      ['Tom', "Yes, but I haven't handed it in. I need to amend some parts. I've realised the notes from my research are almost all just descriptions, I haven't actually evaluated anything. So I'll have to fix that."],
      ['Jess', 'Oh, I didn\'t know we had to do that. I\'ll have to look at that too. Did you do a timeline for the project?'],
      ['Tom', 'Yes, and a mind map.'],
      ['Jess', 'Yeah, so did I. I quite enjoyed that. But it was hard having to explain the basis for my decisions in my action plan.'],
      ['Tom', 'What?'],
      ['Jess', 'You know, give a rationale.'],
      ['Tom', "I didn't realise we had to do that. OK, I can add it now. And I've done the video diary presentation, and worked out what I want my outcome to be in the project."],
      ['Jess', "Someone told me it's best not to be too precise about your actual outcome at this stage, so you have more scope to explore your ideas later on. So I'm going to do back to my proposal to make it a bit more vague."],
      ['Tom', "Really? OK, I'll change that too then."],
      ['Tom', "One part of the project, I'm unsure about is where we choose some paintings of birds and say what they mean to us. Like, I chose a painting of a falcon by Landseer. I like it because the bird's standing there with his head turned to one side, but he seems to be staring straight at you. But I can't just say it's a bit scary, can I?"],
      ['Jess', "You could talk about the possible danger suggested by the bird's look."],
      ['Tom', 'Oh, OK.'],
      ['Jess', "There's a picture of a fish hawk by Audubon I like. It's swooping over the water with a fish in its talons, and with great black wings which take up most of the picture."],
      ['Tom', 'So you could discuss it in relation to predators and food chains?'],
      ['Jess', 'Well actually I think I\'ll concentrate on the impression of rapid motion it gives.'],
      ['Tom', 'Right.'],
      ['Jess', "Do you know that picture of a kingfisher by van Gosh - it's perching on a reed growing near a stream."],
      ['Tom', "Yes, it's got these beautiful blue and red and black shades."],
      ['Jess', "Mm hm. I've actually chosen it because I saw a real kingfisher once when I was litter, I was out walking with my grandfather, and I've never forgotten it."],
      ['Tom', 'So we can use a personal link?'],
      ['Jess', 'Sure.'],
      ['Tom', "OK. There's a portrait called William Wells. I can't remember the artist but it's a middle-aged man who's just shot a bird. And his expression, and the way he's holding the bird in his hand suggests he's not sure about what he's done. To me it's about how ambiguous people are in the way they exploit the natural world."],
      ['Jess', "Interesting. There's Gauguin's picture Vairumati. He did it in Tahiti. It's a woman with a white bird behind her that is eating a lizard, and what I'm interested in is what idea this bird refers to. Apparently, it's a reference to the never-ending cycle of existence."],
      ['Tom', "Wow. I chose a portrait of a little boy, Giovanni de Medici. He's holding a tiny bird in one fist. I like the way he's holding it carefully so he doesn't hurt it."],
      ['Jess', 'Ah right.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 1', partNumber: 4,
    transcript: fmt('Stoicism', [
      [null, 'Ancient philosophy is not just about talking or lecturing, or even reading long, dense books. In fact, it is something people have used throughout history - to solve their problems and to achieve their greatest triumphs.'],
      [null, "Specifically, I am referring to Stoicism, which, in my opinion, is the most practical of all philosophies and therefore the most appealing. Stoicism was founded in Ancient Greece by Zeno of Citium in the early 3rd century BC, but was practised by the likes of Epictetus, Cato, Seneca and Marcus Aurelius. Amazingly, we still have access to these ideas, despite the fact that the most famous Stoics never wrote anything down for publication. Cato definitely didn't. Marcus Aurelius never intended his Meditations to be anything but personal. Seneca's letters were, well, letters and Epictetus' thoughts come to us by way of a note-taking student."],
      [null, 'Stoic principles were based on the idea that its followers could have an unshakable happiness in this life and the key to achieving this was virtue. The road to virtue, in turn, lay in understanding that destructive emotions, like anger and jealousy, are under our conscious control - they don\'t have to control us, because we can learn to control them. In the words of Epictetus: "external events I cannot control, but the choices I make with regard to them, I do control".'],
      [null, 'The modern day philosopher and writer Nassim Nicholas Taleb defines a Stoic as someone who has a different perspective on experience which most of us would see as wholly negative; a Stoic "transforms fear into caution, pain into transformation, mistakes into initiation and desire into undertaking". Using this definition as a model, we can see that throughout the centuries Stoicism has been practised in more recent history by kings, presidents, artists, writers and entrepreneurs.'],
      [null, 'The founding fathers of the United States were inspired by the philosophy. George Washington was introduced to Stoicism by his neighbours at age seventeen, and later, put on a play based on the life of Cato to inspire his men. Thomas Jefferson kept a copy of Seneca beside his bed.'],
      [null, 'Writers and artists have also been inspired by the stoics. Eugène Delacroix, the renowned French Romantic artist (known best for his painting Liberty Leading the People) was an ardent Stoic, referring to it as his "consoling religion".'],
      [null, "The economist Adam Smith's theories on capitalism were significantly influenced by the Stoicism that he studied as a schoolboy, under a teacher who had translated Marcus Aurelius' works."],
      [null, "Today's political leaders are no different, with many finding their inspiration from the ancient texts. Former US president Bill Clinton rereads Marcus Aurelius every single year, and many have compared former President Obama's calm leadership style to that of Cato. Wen Jiabao, the former prime minister of China, claims that Meditations is one of two books he travels with and that he has read it more than one hundred times over the course of his life."],
      [null, "Stoicism had a profound influence on Albert Ellis, who invented Cognitive Behaviour Therapy, which is used to help people manage their problems by changing the way that they think and behave. It's most commonly used to treat depression. The idea is that we can take control of our lives by challenging the irrational belief that create our faulty thinking, symptoms and behaviours by using logic instead."],
      [null, 'Stoicism has also become popular in the world of business. Stoic principles can build the resilience and state of mind required to overcome setbacks because Stoics teach turning obstacles into opportunity. A lesson every business entrepreneur needs to learn.'],
      [null, "I would argue that study Stoicism is as relevant today as it was 2,000 years ago, thanks to its brilliant insights into how to lead a good life. At the very root of the thinking, there is a very simple way of living - control what you can and accept what you can't. This is not as easy as it sounds and will require considerable practice - it can take a lifetime to master. The Stoics also believed the most important foundation for a good and happy life is not money, fame, power or pleasure, but having a disciplined and principled character - something which seems to resonate with many people today."],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 2 ══════════════════════════
  {
    testName: 'Cam 16 - Test 2', partNumber: 1,
    transcript: fmt('Picturerep photo digitising service', [
      ['Employee', 'Hello, Picturerep. Can I help you?'],
      ['Woman', "Oh, hi. I saw your advertisement about copying pictures to disk and I'd like a bit more information about what you do."],
      ['Employee', 'Sure. What would you like to know?'],
      ['Woman', "Well, I've got a box full of old family photos that's been up in the attic for years, some of them must be 50 or 60 years old, and I'd like to get them converted to digital format."],
      ['Employee', 'Sure, we can do that for you.'],
      ['Woman', 'Right. And what about size? The photos are all sorts of sizes - are there any restrictions?'],
      ['Employee', 'Well the maximum size of photo we can do with our normal services is 30 centimetres. And each picture must be a least 4 centimetres, that\'s the minimum we can cope with.'],
      ['Woman', 'That should be fine. And some of them are in a frame - should I take them out before I send them?'],
      ['Employee', "Yes please, we can't copy them otherwise. And also the photos must all be separate, they mustn't be stuck into an album."],
      ['Woman', "OK, that's not a problem. So can you give me an idea of how much this will cost? I've got about 360 photos I think."],
      ['Employee', 'We charge £195 for 300 to 400 photos for the basic service.'],
      ['Woman', 'OK. And does that include the disk?'],
      ['Employee', 'Yes, one disk - but you can get extra ones for £5 each.'],
      ['Woman', "That's good. So do I need to pay when I send you the photos?"],
      ['Employee', "No, we won't need anything until we've actually copied the pictures. Then we'll let you know how much it is, and once we've received the payment, we'll send the parcel off to you."],
      ['Woman', 'Right.'],
      ['Employee', "Is there anything else you'd like to ask about our services?"],
      ['Woman', "Yes. I've roughly sorted out the photos into groups, according to what they're about - so can you keep them in those groups when you copy them?"],
      ['Employee', "Sure. We'll save each group in a different folder on the disk and if you like, you can suggest a name for each folder."],
      ['Woman', "So I could have one called 'Grandparents' for instance?"],
      ['Employee', 'Exactly.'],
      ['Woman', 'And do you do anything besides scan the photos? Like, can you make any improvements?'],
      ['Employee', 'Yes, in the standard service each photo is checked, and we can sometimes touch up the colour a bit, or improve the contrast - that can make a big difference.'],
      ['Woman', "OK. And some of the photos are actually quite fragile - they won't get damaged in the process, will they?"],
      ['Employee', "No, if any look particularly fragile, we'd do them by hand. We do realise how precious these old photos can be."],
      ['Woman', 'Sure.'],
      ['Employee', "And another thing is we can make changes to a photo if you want - so if you want to remove an object from a photo, or maybe alter the background, we can do that."],
      ['Woman', "Really? I might be interested in that. I'll have a look through the photos and see. Oh, and talking of fixing photos - I've got a few that aren't properly in focus. Can you do anything to make that better?"],
      ['Employee', "No, I'm afraid that's one thing we can't do."],
      ['Woman', 'OK.'],
      ['Employee', 'Any other information I can give you?'],
      ['Woman', 'Er … oh, how long will it all take?'],
      ['Employee', 'We aim to get the copying done in ten days.'],
      ['Woman', "Fine. Right, well I'll get the photos packed up in a box and post them off to you."],
      ['Employee', "Right. If you've got a strong cardboard box, that's best. We've found that plastic ones sometimes break in the post."],
      ['Woman', 'OK. Right, thanks for your help. Bye.'],
      ['Employee', 'Bye.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 2,
    transcript: fmt('Dartfield House school changes', [
      [null, "Good morning and thank you for coming here today. I'd like to bring you up to date with changes in the school that will affect your children."],
      [null, 'As you know, the school buildings date from various times: some from the 1970s, some from the last five years, and of course Dartfield House is over a century old. It was commissioned by a businessman. Neville Richards, and intended as his family home, but he died before it was completed. His heir chose to sell it to the local council, who turned it into offices. A later plan to convert it into a tourist information centre didn\'t come about, through lack of money, and instead it formed the nucleus of this school when it opened 40 years ago.'],
      [null, "The school has grown as the local population has increased, and I can now give you some news about the lower school site, which is separated from the main site by a road. Planning permission has been granted for development of both sites. The lower school will move to new buildings that will be constructed on the main site. Developers will construct houses on the existing lower school site. Work on the new school buildings should start within the next few months."],
      [null, "A more imminent change concerns the catering facilities and the canteen. The canteen is always very busy throughout the lunch period - in fact it's often full to capacity, because a lot of our pupils like the food that's on offer there. But there's only one serving point, so most pupils have to wait a considerable time to be served. This is obviously unsatisfactory, as they may have hardly finished their lunch before afternoon lessons start."],
      [null, "So we've had a new Food Hall built, and this will come into use next week. It'll have several serving areas, and I'll give you more details about those in a minute, but one thing we ask you to do, to help in the smooth running of the Food Hall, is to discuss with your children each morning which type of food they want to eat that day, so they can go straight to the relevant serving point. There won't be any junk food - everything on offer will be healthy - and there's no change to the current system of paying for lunches by topping up your child's electronic payment card online."],
      [null, "You may be wondering what will happen to the old canteen. We'll still have tables and chairs in there, and pupils can eat food from the Food Hall or lunch they've brought from home. Eventually we may use part of the canteen for storage, but first we'll see how many pupils go in there at lunchtime."],
      [null, 'OK, back to the serving points in the Food Hall, which will all have side dishes, desserts and drinks on sale, as well as main courses.'],
      [null, "One serving point we call World Adventures. This will serve a different country's cuisine each day, maybe Chinese one day and Lebanese the next. The menus will be planned for a week at a time, so pupils will know what's going to be available the whole of the week."],
      [null, "Street Life is also international, with food from three particular cultures. We'll ask pupils to make suggestions, so perhaps sometimes there'll be food from Thailand, Ethiopia and Mexico, and then one of them will be replaced by Jamaican food for a week or two."],
      [null, "The Speedy Italian serving point will cater particularly for the many pupils who don't eat meat or fish: they can be sure that all the food served there is suitable for them. There'll be plenty of variety, so they shouldn't get bored with the food."],
      [null, "OK, that's all on the new Food Hall. Now after-school lessons. There are very popular with pupils, particularly swimming - in fact there's a waiting list for lessons. Cycling is another favourite, and I'm delighted that dozens of pupils make use of the chance to learn to ride in off-road conditions. It means that more and more cycle to and from school every day. As you know, we have a well-equipped performance centre, and we're going to start drama classes in there, too. Pupils will be able to join in just for fun or work up to taking part in a play - we hope to put on at least one a year. We already teach a number of pupils to use the sound and lighting systems in the centre. And a former pupil has given a magnificent grand piano to the school, so a few pupils will be able to learn at the school instead of going to the local college, as many of them do at the moment."],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 3,
    transcript: fmt('Assignment on sleep and dreams', [
      ['Susie', 'So Luke, for our next psychology assignment we have to do something on sleep and dreams.'],
      ['Luke', "Right. I've just read an article suggesting why we tend to forget most of our dreams soon after we wake up. I mean, most of my dreams aren't that interesting anyway, but what it said was that if we remembered everything, we might get mixed up about what actually happened and what we dreamed. So it's a sort of protection. I hadn't heard that idea before. I'd always assumed that it was just that we didn't have room in our memories for all that stuff."],
      ['Susie', 'Me too. What do you think about the idea that our dreams may predict the future?'],
      ['Luke', "It's a belief that you get all over the world."],
      ['Susie', "Yeah, lots of people have a story of it happening to them, but the explanation I've read is that for each dream that comes true, we have thousands that don't, but we don't notice those, we don't even remember them. We just remember the ones where something in the real world, like a view or an action, happens to trigger a dream memory."],
      ['Luke', "Right. So it's just a coincidence really. Something else I read about is what they call segmented sleeping. That's a theory that hundreds of years ago, people used to get up in the middle of the night and have a chat or something to eat, then go back to bed. So I tried it myself."],
      ['Susie', 'Why?'],
      ['Luke', "Well it's meant to make you more creative. I don't know why. But I gave it up after a week. It just didn't fit in with my lifestyle."],
      ['Susie', "But most pre-school children have a short sleep in the day don't they? There was an experiment some students did here last term to see at what age kids should stop having naps. But they didn't really find an answer. They spent a lot of time working out the most appropriate methodology, but the results didn't seem to show any obvious patterns."],
      ['Luke', "Right. Anyway, let's think about our assignment. Last time I had problems with the final stage, where we had to describe and justify how successful we thought we'd been. I struggled a bit with the action plan too."],
      ['Susie', 'I was OK with the planning, but I got marked down for the self-assessment as well. And I had big problems with the statistical stuff, that\'s where I really lost marks.'],
      ['Luke', 'Right.'],
      ['Susie', 'So shall we plan what we have to do for this assignment?'],
      ['Luke', 'OK.'],
      ['Susie', "First, we have to decide on our research question. So how about 'Is there a relationship between hours of sleep and number of dreams?'"],
      ['Luke', 'OK. Then we need to think about who we\'ll do they study on. About 12 people?'],
      ['Susie', 'Right. And shall we use other psychology students?'],
      ['Luke', 'Let\'s use people from a different department. What about history?'],
      ['Susie', 'Yes, they might have interesting dreams! Or literature students?'],
      ['Luke', "I don't really know any."],
      ['Susie', 'OK, forget that idea. Then we have to think about our methodology. So we could use observation, but that doesn\'t seem appropriate.'],
      ['Luke', 'No. it needs to be self-reporting I think. And we could ask them to answer questions online.'],
      ['Susie', "But in this case, paper might be better as they'll be doing it straight after they wake up … in fact while they're still half-asleep."],
      ['Luke', "Right. And we'll have to check the ethical guidelines for this sort of research."],
      ['Susie', 'Mm, because our experiment involves humans, so there are special regulations.'],
      ['Luke', "Yes, I had a look at those for another assignment I did. There's a whole section on risk assessment, and another section on making sure they aren't put under any unnecessary stress."],
      ['Susie', "Let's hope they don't have any bad dreams!"],
      ['Luke', 'Yeah.'],
      ['Susie', "Then when we've collected all our data we have to analyse it and calculate the correlation between our two variables, that's time sleeping and number of dreams and then present our results visually in a graph."],
      ['Luke', "Right. And the final thing is to think about our research and evaluate it. So that seems quite straightforward."],
      ['Susie', 'Yeah. So now let\'s …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 2', partNumber: 4,
    transcript: fmt('Health benefits of dance', [
      [null, "Dancing is something that humans do when they want to have a good time. It's a universal response to music, found in all cultures. But what's only been discovered recently is that dancing not only makes us feel good, it's also extremely good for our health."],
      [null, 'Dancing, like other forms of exercise, releases hormones, such as dopamine, which make us feel relaxed and happy. And it also reduces feelings of stress or anxiety.'],
      [null, 'Dancing is also a sociable activity, which is another reason it makes us feel good.'],
      [null, "One study compared people's enjoyment of dancing at home in front of a video with dancing in a group in a studio."],
      [null, 'The people dancing in a group reported feeling happier, whereas those dancing alone did not.'],
      [null, 'In another experiment, university researchers at York and Sheffield took a group of students and sent each of them into a lab where music was played for five minutes. Each had to choose from three options: to sit and listen quietly to the music, to cycle on an exercise bike while they listened, or to get up and dance. All were given cognitive tasks to perform before and after. The result showed that those who chose to dance showed much more creativity when doing problem-solving tasks.'],
      [null, 'Doctor Lovatt at the University of Hertfordshire believes dance could be a very useful way to help people suffering from mental health problems. He thinks dance should be prescribed as therapy to help people overcome issues such as depression.'],
      [null, "It's well established that dance is a good way of encouraging adolescent girls to take exercise but what about older people? Studies have shown that there are enormous benefits for people in their sixties and beyond. One of the great things about dance is that there are no barriers to participation. Anyone can have a go, even those whose standard of fitness is quite low."],
      [null, "Dance can be especially beneficial for older adults who can't run or do more intense workouts, or for those who don't want to. One 2015 study found that even a gently dance workout helps to promote a healthy heart. And there's plenty of evidence which suggests that dancing lowers the risk of falls, which could result in a broken hip, for example, by helping people to improve their balance."],
      [null, "There are some less obvious benefits of dance for older people too. One thing I hadn't realised before researching this topic was that dance isn't just a physical challenge. It also requires a lot of concentration because you need to remember different steps and routines. For older people, this kind of activity is especially important because it forces their brain to process things more quickly and to retain more information."],
      [null, 'Current research also shows that dance promotes a general sense of well-being in older participants, which can last up to a week after a class. Participants report feeling less tired and having greater motivation to be more active and do daily activities such as gardening or walking to the shops or a park.'],
      [null, 'Ballroom or country dancing, both popular with older people, have to be done in groups. They require collaboration and often involve touching a dance partner, all of which encourages interaction on the dance floor. This helps to develop new relationships and can reduce older people\'s sense of isolation, which is a huge problem in many countries.'],
      [null, "I also looked at the benefits of Zumba. Fifteen million people in 180 countries now regularly take a Zumba class, an aerobic workout based on Latin American dance moves. John Porcari, a professor of exercise and sport science at the University of Wisconsin, analysed a group of women who were Zumba regulars and found that a class lasting 40 minutes burns about 370 calories. This is similar to moderately intense exercises like step aerobics or kickboxing."],
      [null, 'A study in the American Journal of Health Behavior showed that when women with obesity did Zumba three times a week for 16 weeks, they lost an average of 1.2 kilos and lowered their percentage of body fat by 1%. More importantly, the women enjoyed the class so much that they made it a habit and continued to attend classes at least once a week - very unusual for an aerobic exercise programme.'],
      [null, "Dance is never going to compete with high-intensity workouts when it comes to physical fitness gains, but its popularity is likely to keep on rising because it's such a fun way to keep fit."],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 3 ══════════════════════════
  {
    testName: 'Cam 16 - Test 3', partNumber: 1,
    transcript: fmt('Junior Cycle Camp enquiry', [
      ['Jake', 'Hello, Junior Cycle camp, Jake speaking.'],
      ['Woman', "Hi. I'm calling for some information about the cycle camp - I'm thinking of sending my son."],
      ['Jake', "Great. Well, it's held every weekday morning over the summer vacation and we focus on basic cycling skills and safety. We have eight levels for children from three years upwards. How old's your son?"],
      ['Woman', "Charlie? He's seven. He can ride a bike, but he needs a little more training before he's safe to go on the road."],
      ['Jake', "He'd probably be best in Level 5. They start off practising on the site here, and we aim to get them riding on the road, but first they're taken to ride in the park, away from the traffic."],
      ['Woman', 'Right. And can you tell me a bit about the instructors?'],
      ['Jake', "Well, all our staff wear different coloured shirts. So, we have three supervisors, and they have red shirts. They support the instructors, and they also stand in for me if I'm not around. Then the instructors themselves are in blue shirts, and one of these is responsible for each class."],
      ['Woman', 'OK.'],
      ['Jake', "In order to be accepted, all our instructors have to submit a reference from someone who's seen them work with children - like if they've worked as a babysitter, for example. Then they have to complete our training course, including how to do lesson plans, and generally care for the well-being of the kids in their class. They do a great job, I have to say."],
      ['Woman', "Right. And tell me a bit about the classes. What size will Charlie's class be?"],
      ['Jake', "We have a limit of eight children in each class, so their instructor really gets to know them well. They're out riding most of the time but they have quiet times too, where their instructor might tell them a story that's got something to do with cycling, or get them to play a game together. It's a lot of fun."],
      ['Woman', "It must be. Now, what happens if there's rain? Do the classes still run?"],
      ['Jake', "Oh yes. We don't let that put us off - we just put on our waterproofs and keep cycling."],
      ['Woman', 'And is there anything special Charlie should bring along with him?'],
      ['Jake', "Well, maybe some spare clothes, especially if the weather's not so good. And a snack for break time."],
      ['Woman', 'How about a drink?'],
      ['Jake', 'No, we\'ll provide that. And make sure he has shoes, not sandals.'],
      ['Woman', 'Sure. And just at present Charlie has to take medication every few hours, so I\'ll make sure he has that.'],
      ['Jake', "Absolutely. Just give us details of when he has to take it and we'll make sure he does."],
      ['Woman', 'Thanks.'],
      ['Jake', "Now, there are a few things you should know about Day 1 of the camp. The classes normally start at 9.30 every morning, but on Day 1 you should aim to get Charlie here by 9.20. The finishing time will be 12.30 as usual. We need the additional time because there are a few extra things to do. The most important is that we have a very careful check to make sure that every child's helmet fits properly. If it doesn't fit, we'll try to adjust it, or we'll find him another one - but he must wear it all the time he's on the bike."],
      ['Woman', 'Of course.'],
      ['Jake', "Then after that, all the instructors will be waiting to meet their classes, and they'll meet up in the tent - you can't miss it. And each instructor will take their class away and get started."],
      ['Woman', 'OK. Well that all sounds good. Now can you tell me how much the camp costs a week?'],
      ['Jake', "One hundred ninety-nine dollars. We've managed to keep the price more or less the same as last year - it was one hundred ninety then. But the places are filling up quite quickly."],
      ['Woman', 'Right. OK, well I\'d like to book for …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 2,
    transcript: fmt('Careers in agriculture and horticulture', [
      [null, "Hello everyone. My name's Megan Baker and I'm a recruitment consultant at AVT Recruitment specialists."],
      [null, "Now, our company specialises in positions that involve working in the agriculture and horticulture sectors, so that's fresh food production, garden and park maintenance and so on. And these sectors do provide some very special career opportunities. For a start, they often offer opportunities for those who don't want to be stuck with a 40-hour week, but need to juggle work with other responsibilities such as child care - and this is very important for many of our recruits. Some people like working in a rural setting, surrounded by plants and trees instead of buildings, although we can't guarantee that. But there are certainly health benefits, especially in jobs where you're not sitting all day looking at a screen - a big plus for many people. Salaries can sometimes be good too, although there's a lot of variety here. And you may have the opportunity in some types of jobs for travel overseas, although that obviously depends on the job, and not everyone is keen to do it."],
      [null, "Of course, working outdoors does have its challenges. It's fine in summer, but can be extremely unpleasant when it's cold and windy. You may need to be pretty fit for some jobs, though with modern technology that's not as important as it once was. And standards of health and safety are much higher now than they used to be, so there are fewer work-related accidents. But if you like a lively city environment surrounded by lots of people, these jobs are probably not for you - they're often in pretty remote areas. And some people worry about finding a suitable place to live, but in our experience, this usually turns out fine."],
      [null, 'Now let me tell you about some of the exciting jobs that we have on our books right now.'],
      [null, "One is for a fresh food commercial manager. Our client here is a very large fresh food producer supplying a range of top supermarkets. They operate in a very fast-paced environment with low profit margins - the staff there work hard, but they play hard as well, so if you've a sociable personality this may be for you."],
      [null, 'We have an exciting post as an agronomist advising farmers on issues such as crop nutrition, protection against pests, and the latest legislation on farming and agricultural practices. There are good opportunities for the right person to quickly make their way up the career ladder, but a deep knowledge of the agricultural sector is expected of applicants.'],
      [null, 'A leading supermarket is looking for a fresh produce buyer who is available for a 12-month maternity cover contract. You need to have experience in administration, planning and buying in the fresh produce industry, and in return will receive a very competitive salary.'],
      [null, 'We have also received a request for a sales manager for a chain of garden centres. You will be visiting centres in the region to ensure their high levels of customer service are maintained. This post is only suitable for someone who is prepared to live in the region.'],
      [null, "There is also a vacancy for a tree technician to carry out tree cutting, forestry and conservation work. Candidates must have a clean driving licence and have training in safety procedures. A year's experience would be preferred but the company might be prepared to consider someone who has just completed an appropriate training course."],
      [null, 'Finally, we have a position for a farm worker. This will involve a wide range of farm duties including crop sowing and harvesting, machine maintenance and animal care. Perks of the job include the possibility of renting a small cottage on the estate, and the chance to earn a competitive salary. A driving licence and tractor driving experience are essential.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 3,
    transcript: fmt('Presentation on diet and obesity', [
      ['Adam', 'OK Rosie, shall we try to get some ideas together for our presentation on diet and obesity?'],
      ['Rosie', 'Sure.'],
      ['Adam', 'I can talk about the experiment I did to see if people can tell the difference between real sugar and artificial sweeteners.'],
      ['Rosie', 'Where you have people drinks with either sugar or artificial sweeteners and they had to say which they thought it was?'],
      ['Adam', "Yeah. It took me ages to decide exactly how I'd organise it, especially how I could make sure that people didn't know which drink I was giving them. It was hard to keep track of it all, especially as I had so many people doing it - I had to make sure I kept a proper record of what each person had had."],
      ['Rosie', 'So could most people tell the difference?'],
      ['Adam', "Yeah - I hadn't thought they would be able to, but most people could."],
      ['Rosie', "Then there's that experiment I did measuring the fat content of nuts, to see if the nutritional information given on the packet was accurate."],
      ['Adam', 'The one where you ground up the nuts and mixed them with a chemical to absorb the fat?'],
      ['Rosie', "Yes. My results were a bit problematic - the fat content for that type of nut seemed much lower than it said on the package. But I reckon the package information was right. I think I should probably have ground up the nuts more than I did. It's possible that the scales for weighing the fat weren't accurate enough, too. I'd really like to try the experiment again some time."],
      ['Adam', 'So what can we say about helping people to lose weight? There\'s a lot we could say about what restaurants could do to reduce obesity. I read that the items at the start of a menu and the items at the end of a menu are much more likely to be chosen than the items in the middle. So, if you put the low-calorie items at the beginning and end of the menu, people will probably go for the food with fewer calories, without even realising what they\'re doing.'],
      ['Rosie', 'I think food manufacturers could do more to encourage healthy eating.'],
      ['Adam', 'How?'],
      ['Rosie', "Well, when manufacturers put calorie counts of a food on the label, they're sometimes really confusing and I suspect they do it on purpose. Because food that's high in calories tastes better, and so they'll sell more."],
      ['Adam', "Yeah, so if you look at the amount of calories in a pizza, they'll give you the calories per quarter pizza and you think, oh that's not too bad. But who's going to eat a quarter pizza?"],
      ['Rosie', 'Exactly.'],
      ['Adam', 'I suppose another approach to this problem is to get people to exercise more.'],
      ['Rosie', 'Right. In England, the current guidelines are for at least 30 minutes of brisk walking, five days a week. Now when you ask them, about 40% of men and 30% of women say they do this, but when you objectively measure the amount of walking they do with motion sensors, you find that only 6% of men and 4% of women do the recommended amount of exercise.'],
      ['Adam', 'Mm, so you can see why obesity is growing.'],
      ['Rosie', 'So how can people be encouraged to take more exercise?'],
      ['Adam', "Well, for example, think of the location of stairs station. If people reach the stairs before they reach the escalator when they're leaving the station, they're more likely to take the stairs. And if you increase the width of the stairs, you'll get more people using them at the same time. It's an unconscious process and influenced by minor modifications in their environment."],
      ['Rosie', "Right. And it might not be a big change, but if it happens every day, it all adds up."],
      ['Adam', "Yes. But actually, I'm not sure if we should be talking about exercise in our presentation."],
      ['Rosie', "Well, we've done quite a bit of reading about it."],
      ['Adam', "I know, but it's going to mean we have a very wide focus, and our tutor did say that we need to focus on causes and solutions in terms of nutrition."],
      ['Rosie', "I suppose so. And we've got plenty of information about that. OK, well that will be simpler."],
      ['Adam', "So what shall we do now? We've still got half an hour before our next lecture."],
      ['Rosie', "Let's think about what we're going to include and what will go where. Then we can decide what slides we need."],
      ['Adam', 'OK, fine.'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 3', partNumber: 4,
    transcript: fmt('Hand knitting', [
      [null, "Good morning everyone. So today we're going to look at an important creative activity and that's hand knitting. Ancient knitted garments have been found in many different countries, showing that knitting is a global activity with a long history."],
      [null, "When someone says the word 'knitting' we might well picture an elderly person - a grandmother perhaps - sitting by the fire knitting garments for themselves or other members of the family. It's a homely image, but one that may lead you to feel that knitting is an activity of the past - and, indeed, during the previous decade, it was one of the skills that was predicted to vanish from everyday life. For although humans have sewn and knitted their own clothing for a very long time, many of these craft-based skills went into decline when industrial machines took over - mainly because they were no longer passed down from one generation to another. However, that's all changing and interest in knitting classes in many countries is actually rising, as more and more people are seeking formal instruction in the skill. With that trend, we're also seeing an increase in the sales figures for knitting equipment."],
      [null, "So why do people want to be taught to knit at a time when a machine can readily do the job for them? The answer is that knitting, as a handicraft, has numerous benefits for those doing it. Let's consider what some of these might be. While many people knitted garments in the past because they couldn't afford to buy clothes, it's still true today that knitting can be helpful if you're experiencing economic hardship. If you have several children who all need warm winter clothes, knitting may save you a lot of money. And the results of knitting your own clothes can be very rewarding, even though the skills you need to get going are really quite basic and the financial outlay is minimal."],
      [null, "But the more significant benefits in today's world are to do with well-being. In a world where it's estimated that we spend up to nine hours a day online, doing something with our hands that is craft-based makes us feel good. It releases us from the stress of a technological, fast-paced life."],
      [null, "Now, let's look back a bit to early knitting activities. In fact, no one really knows when knitting first began, but archaeological remains have disclosed plenty of information for us to think about."],
      [null, "One of the interesting things about knitting is that the earliest pieces of clothing that have been found suggest that most of the items produced were round rather than flat. Discoveries from the 3rd and 4th centuries in Egypt show that things like socks and gloves, that were needed to keep hands and feet warm, were knitted in one piece using four or five needles. That's very different from most knitting patterns today, which only require two. What's more, the very first needles people used were hand carved out of wood and other natural materials, like bone, whereas today's needles are largely made of steel or plastic and make that characteristic clicking sound when someone's using them. Ancient people knitted using yarns made from linen, hemp, cotton and wool, and these were often very rough on the skin. The spinning wheel, which allowed people to make finer yarns and produce much greater quantities of them, led to the dominance of wool in the knitting industry - often favoured for its warmth."],
      [null, "Another interesting fact about knitting is that because it was practised in so many parts of the world for so many purposes, regional differences in style developed. This visual identity has allowed researchers to match bits of knitted clothing that have been unearthed over time to the region from which the wearer came or the job that he or she did."],
      [null, "As I've mentioned, knitting offered people from poor communities a way of making extra money while doing other tasks. For many centuries, it seems, men, women and children took every opportunity to knit, for example, while watching over sheep, walking to market or riding in boats. So, let's move on to take a …"],
    ]),
  },

  // ══════════════════════════ Cam 16 - Test 4 ══════════════════════════
  {
    testName: 'Cam 16 - Test 4', partNumber: 1,
    transcript: fmt('Holiday cottage rental', [
      ['Shirley', 'Hello?'],
      ['Tom', 'Oh hello. I was hoping to speak to Jack Fitzgerald about renting a cottage.'],
      ['Shirley', "I'm his wife, Shirley, and we own the cottages together, so I'm sure I can help you."],
      ['Tom', "Great. My name's Tom. Some friends of ours rented Granary Cottage from you last year, and they thought it was great. So my wife and I are hoping to come in May for a week."],
      ['Shirley', 'What date did you have in mind?'],
      ['Tom', 'The week beginning the 14th, if possible.'],
      ['Shirley', "I'll just check … I'm sorry, Tom, it's already booked that week. It's free the week beginning the 28th, though, for seven nights. In fact, that's the only time you could have it in May."],
      ['Tom', 'Oh. Well, we could manage that, I think. We\'d just need to change a couple of things. How much would it cost?'],
      ['Shirley', "That's the beginning of high season, so it'd be £550 for the week."],
      ['Tom', "Ah. That's a bit more than we wanted to pay, I'm afraid. We've budgeted up to £500 for accommodation."],
      ['Shirley', "Well, we've just finished converting another building into a cottage, which we're calling Chervil Cottage."],
      ['Tom', 'Sorry? What was that again?'],
      ['Shirley', 'Chervil. C-H-E-R-V for Victor I-L.'],
      ['Tom', "Oh, that's a herb, isn't it?"],
      ['Shirley', "That's right. It grows fairly wild around here. You could have that for the week you want for £480."],
      ['Tom', 'OK. So could you tell me something about it, please?'],
      ['Shirley', "Of course. The building was built as a garage. It's a little smaller than Granary Cottage."],
      ['Tom', 'So that must sleep two people, as well?'],
      ['Shirley', "That's right. There's a double bedroom."],
      ['Tom', 'Does it have a garden?'],
      ['Shirley', "Yes, you get to it from the living room through French doors, and we provide two deckchairs. We hope to build a patio in the near future, but I wouldn't like to guarantee it'll be finished by May."],
      ['Tom', 'OK.'],
      ['Shirley', "The front door opens onto the old farmyard, and parking isn't a problem - there's plenty of room at the front for that. There are some trees and potted plants there."],
      ['Tom', "What about facilities in the cottage? It has standard things like a cooker and fridge, I presume."],
      ['Shirley', "In the kitchen area there's a fridge-freezer and we've just put in an electric cooker."],
      ['Tom', 'Is there a washing machine?'],
      ['Shirley', "Yes. There's also a TV in the living room, which plays DVDs too. The bathroom is too small for a bath, so there's a shower instead. I think a lot of people prefer that nowadays, anyway."],
      ['Tom', "It's more environmentally friendly, isn't it? Unless you spend half the day in it!"],
      ['Shirley', 'Exactly.'],
      ['Tom', "What about heating? It sometimes gets quite cool at that time of year."],
      ['Shirley', "There's central heating, and if you want to light a fire, there's a stove. We can provide all the wood you need for it. It smells so much nicer than coal, and it makes the room very cosy - we've got one in our own house."],
      ['Tom', 'That sounds very pleasant. Perhaps we should come in the winter, to make the most of it!'],
      ['Shirley', "Yes, we find we don't want to go out when we've got the fire burning. There are some attractive views from the cottage, which I haven't mentioned. There's a famous stone bridge - it's one of the oldest in the region, and you can see it from the living room. It isn't far away. The bedroom window looks in the opposite direction, and has a lovely view of the hills and the monument at the top."],
      ['Tom', "Well, that all sounds perfect. I'd like to book it, please. Would you want a deposit?"],
      ['Shirley', "Yes, we ask for thirty percent to secure your booking, so that'll be, um, £144."],
      ['Tom', 'And when would you like the rest of the money?'],
      ['Shirley', "You're coming in May, so the last day of March, please."],
      ['Tom', 'Fine.'],
      ['Shirley', 'Excellent. Could I just take your details …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 2,
    transcript: fmt('Local council report on traffic and highways', [
      ['Chairperson', 'Right. Next on the agenda we have traffic and highways. Councillor Thornton.'],
      ['Councillor Thornton', "Thank you. Well, we now have the results of the survey carried out last month about traffic and road transport in the town. People were generally satisfied with the state of the roads. There were one or two complaints about potholes which will be addressed, but a significant number of people complained about the increasing number of heavy vehicles using our local roads to avoid traffic elsewhere. We'd expected more complaints by commuters about the reduction in the train service, but it doesn't seem to have affected people too much. The cycle path that runs alongside the river is very well used by both cyclists and pedestrians since the surface was improved last year, but overtaking can be a problem so we're going to add a bit on the side to make it wider. At some stage, we'd like to extend the path so that it goes all the way through the town, but that won't be happening in the immediate future."],
      ['Councillor Thornton', "The plans to have a pedestrian crossing next to the Post Office have unfortunately had to be put on hold for the time being. We'd budgeted for this to be done this financial year, but then there were rumours that the Post Office was going to move, which would have meant there wasn't really a need for a crossing. Now they've confirmed that they're staying where they are, but the Highways Department have told us that it would be dangerous to have a pedestrian crossing where we'd originally planned it as there's a bend in the road there. So that'll need some more thought."],
      ['Councillor Thornton', "On Station Road near the station and level crossing, drivers can face quite long waits if the level crossing's closed, and we've now got signs up requesting them not to leave their engines running at that time. This means pedestrians waiting on the pavement to cross the railway line don't have to breathe in car fumes. We've had some problems with cyclists leaving their bikes chained to the railings outside the ticket office, but the station has agreed to provide bike racks there."],
      ['Chairperson', "So next on the agenda is 'Proposals for improvements to the recreation ground'. Councillor Thornton again."],
      ['Councillor Thornton', "Well, since we managed to extend the recreation ground, we've spent some time talking to local people about how it could be made a more attractive and useful space. If you have a look at the map up on the screen, you can see the river up in the north, and the Community Hall near the entrance from the road. At present, cars can park between the Community Hall and that line of trees to the east, but this is quite dangerous for pedestrians so we're suggesting a new car park on the opposite side of the Community Hall, right next to it. We also have a new location for the cricket pitch. As we've now purchased additional space to the east of the recreation ground, beyond the trees, we plan to move it away from its current location, which is rather near the road, into this new area beyond the line of trees. This means there's less danger of stray balls hitting cars or pedestrians."],
      ['Councillor Thornton', "We've got plans for a children's playground which will be accessible by a footpath from the Community Hall and will be alongside the river. We'd originally thought of having it close to the road, but we think this will be a more attractive location."],
      ['Councillor Thornton', "The skateboard ramp is very popular with both younger and older children - we had considered moving this up towards the river, but in the end we decided to have it in the southeast corner near the road. The pavilion is very well used at present by both football players and cricketers. It will stay where it is now - to the left of the line of trees and near to the river - handy for both the football and cricket pitches. And finally, we'll be getting a new notice board for local information, and that will be directly on people's right as they go from the road into the recreation ground."],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 3,
    transcript: fmt('City bike-sharing schemes', [
      ['Jake', "Now that we've done all the research into bike-sharing schemes in cities around the world, we need to think about how we're going to organise our report."],
      ['Amy', "Right. I think we should start by talking about the benefits. I mean it's great that so many cities have introduced these schemes where anyone can pick up a bike from dozens of different locations and hire it for a few hours. It makes riding a bike very convenient for people."],
      ['Jake', 'Yes, but the costs can add up and that puts people on low incomes off in some places.'],
      ['Amy', "I suppose so, but if it means more people in general are cycling rather than driving, then because they're increasing the amount of physical activity they do, it's good for their health"],
      ['Jake', "OK. But isn't that of less importance? I mean, doesn't the impact of reduced emissions on air pollution have a more significant effect on people's health?"],
      ['Amy', 'Certainly, in some cities bike-sharing had made a big contribution to that. And also helped to cut the number of cars on the road significantly.'],
      ['Jake', 'Which is the main point.'],
      ['Amy', "Exactly. But I'd say it's had less of an impact on noise pollution because there are still loads of buses and lorries around."],
      ['Jake', 'Right.'],
      ['Amy', 'Shall we quickly discuss the recommendations we\'re going to make?'],
      ['Jake', 'In order to ensure bike-sharing schemes are successful?'],
      ['Amy', 'Yes.'],
      ['Jake', "OK. Well, while I think it's nice to have really state-of-the art bikes with things like GPS, I wouldn't say they're absolutely necessary."],
      ['Amy', "But some technical things are really important - like a fully functional app - so people can make payments and book bikes easily. Places which haven't invested in that have really struggled."],
      ['Jake', "Good point … Some people say there shouldn't be competing companies offering separate bike-sharing schemes, but in some really big cities, competition's beneficial and anyway one company might not be able to manage the whole thing."],
      ['Amy', "Right. Deciding how much to invest is a big question. Cities which have opened loads of new bike lanes at the same time as introducing bike-sharing schemes have generally been more successful - but there are examples of successful schemes where this hasn't happened … What does matter though - is having a big publicity campaign."],
      ['Jake', "Definitely. If people don't know how to use the scheme or don't understand its benefits, they won't use it. People need a lot of persuasion to stop using their cars."],
      ['Amy', 'Shall we look at some examples now? And say what we think is good or bad about them.'],
      ['Jake', 'I suppose we should start with Amsterdam as this was one of the first cities to have a bike-sharing scheme.'],
      ['Amy', "Yes. There was already a strong culture of cycling here. In a way it's strange that there was such a demand for bike-sharing because you'd have thought most people would have used their own bikes."],
      ['Jake', "And yet it's one of the best-used schemes … Dublin's an interesting example of a success story."],
      ['Amy', "It must be because the public transport system's quite limited."],
      ['Jake', "Not really - there's no underground, but there are trams and a good bus network. I'd say price has a lot to do with it. It's one of the cheapest schemes in Europe to join."],
      ['Amy', "But the buses are really slow - anyway the weather certainly can't be a factor!"],
      ['Jake', "No - definitely not. The London scheme's been quite successful"],
      ['Amy', "Yes - it's been a really good thing for the city. The bikes are popular and the whole system is well maintained but it isn't expanding quickly enough."],
      ['Jake', "Basically, not enough's been spent on increasing the number of cycle lanes. Hopefully that'll change."],
      ['Amy', 'Yes. Now what about outside Europe?'],
      ['Jake', 'Well bike-sharing schemes have taken off in places like Buenos Aires.'],
      ['Amy', "Mmm. They built a huge network of cycle lanes to support the introduction of the scheme there, didn't they? It attracted huge numbers of cyclists where previously there were hardly any."],
      ['Jake', 'An example of good planning.'],
      ['Amy', 'Absolutely. New York is a good example of how not to introduce a scheme. When they launched it, it was more than ten times the price of most other schemes.'],
      ['Jake', 'More than it costs to take a taxi, Crazy. I think the organisers lacked vision and ambition there.'],
      ['Amy', "I think so too. Sydney would be a good example to use. I would have expected it to have grown pretty quickly here."],
      ['Jake', "Yes. I can't quite work out why it hasn't been an instant success like some of the others. It's a shame really."],
      ['Amy', 'I know. OK so now we\'ve thought about …'],
    ]),
  },
  {
    testName: 'Cam 16 - Test 4', partNumber: 4,
    transcript: fmt('The extinction of the dodo bird', [
      [null, "One of the most famous cases of extinction is that of a bird known as the dodo. In fact there's even a saying in English, 'as dead as the dodo', used to refer to something which no longer exists. But for many centuries the dodo was alive and well, although it could only be found in one place, the island of Mauritius in the Indian Ocean. It was a very large bird, about one metre tall, and over the centuries it had lost the ability to fly, but it survived happily under the trees that covered the island."],
      [null, "Then in the year 1507 the first Portuguese ships stopped at the island. The sailors were carrying spices back to Europe, and found the island a convenient stopping place where they could stock up with food and water for the rest of the voyage, but they didn't settle on Mauritius. However, in 1638 the Dutch arrived and set up a colony there. These first human inhabitants of the island found the dodo birds a convenient source of meat, although not everyone liked the taste."],
      [null, "It's hard to get an accurate description of what the dodo actually looked like. We do have some written records from sailors, and a few pictures, but we don't know how reliable these are. The best-known picture is a Dutch painting in which the bird appears to be extremely fat, but this may not be accurate - an Indian painting done at the same time shows a much thinner bird."],
      [null, "Although attempts were made to preserve the bodies of some of the birds, no complete specimen survives. In the early 17th century four dried parts of a bird were known to exist - of these, three have disappeared, so only one example of soft tissue from the dodo survives, a dodo head. Bones have also found, but there's only one complete skeleton in existence."],
      [null, "This single dodo skeleton has recently been the subject of scientific research which suggests that many of the earlier beliefs about dodos may have been incorrect. For example, early accounts of the birds mention how slow and clumsy it was, but scientists now believe the bird's strong knee joints would have made it capable of movement which was not slow, but actually quite fast. In fact, one 17th century sailor wrote that he found the birds hard to catch. It's true that the dodo's small wings wouldn't have allowed it to leave the ground, but the scientists suggest that these were probably employed for balance while going over uneven ground. Another group of scientists carried out analysis of the dodo's skull. They found that the reports of the lack of intelligence of the dodo were not borne out by their research, which suggested the bird's brain was not small, but average in size. In fact, in relation to its body size, it was similar to that of the pigeon, which is known to be a highly intelligent bird. The researchers also found that the structure of the bird's skull suggested that one sense which was particularly well-developed was that of smell. So the dodo may also have been particularly good at locating ripe fruit and other food in the island's thick vegetation."],
      [null, "So it looks as if the dodo was better able to survive and defend itself than was originally believed. Yet less than 200 years after Europeans first arrived on the island, they had become extinct. So what was the reason for this? For a long time, it was believed that the dodos were hunted to extinction, but scientists now believe the situation was more complicated than this. Another factor may have been the new species brought to the island by the sailors. These included dogs, which would have been a threat to the dodos, and also monkeys, which ate the fruit that was the main part of the dodos' diet. These were brought to the island deliberately, but the ships also brought another type of creature - rats, which came to land from the ships and rapidly overran the island. These upset the ecology of the island, not just the dodos but other species too. However, they were a particular danger to the dodos because they consumed their eggs, and since each dodo only laid one at a time, this probably had a devastating effect on populations."],
      [null, "However, we now think that probably the main cause of the birds' extinction was not the introduction of non-native species, but the introduction of agriculture. This meant that the forest that has once covered all the island, and that had provided a perfect home for the dodo, was cut down so that crops such as sugar could be grown. So although the dodo had survived for thousands of years, suddenly it was gone."],
    ]),
  },
];

async function runSeed() {
  let updatedTests = 0, updatedSections = 0, sectionNotFound = 0;
  for (const target of TARGETS) {
    const { testName, partNumber, transcript } = target;
    const test = await ListeningTest.findOne({ name: testName });
    if (!test) throw new Error(`ListeningTest not found: "${testName}"`);
    const embedded = test.sections.find(s => s.partNumber === partNumber);
    if (!embedded) throw new Error(`Part ${partNumber} not found on ListeningTest "${testName}"`);
    if (embedded.transcript !== transcript) {
      embedded.transcript = transcript;
      await test.save();
      updatedTests++;
    }

    const title = sectionTitle(testName, embedded);
    const section = await ListeningSection.findOne({ title, partNumber });
    if (!section) {
      console.log(`[SeedListeningTranscriptsCam16] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscriptsCam16] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningTranscriptsCam16] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
