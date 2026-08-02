// Same approach/format as seedListeningTranscripts.js (Cam 21) — sourced
// from published Cambridge IELTS 15 audioscripts (ieltstrainingonline.com),
// verified sentence by sentence against every question's correctAnswer
// already in the DB before being written here. Covers Cam 15 Tests 2-4
// (Test 1 already had transcripts).
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
  // ══════════════════════════ Cam 15 - Test 2 ══════════════════════════
  {
    testName: 'Cam 15 - Test 2', partNumber: 1,
    transcript: fmt('Town festival information', [
      ['Tim', "Good morning. You're through to the tourist information office, Tim speaking. How can I help you?"],
      ['Jean', "Oh hello. Could you give me some information about next month's festival, please? My family and I will be staying in the town that week."],
      ['Tim', 'Of course. Well it starts with a concert on the afternoon of the 17th.'],
      ['Jean', "Oh I heard about that. The orchestra and singers come from the USA, don't they?"],
      ['Tim', "They're from Canada. They're very popular over there. They're going to perform a number of well-known pieces that will appeal to children as well as adults."],
      ['Jean', 'That sounds good. My whole family are interested in music.'],
      ['Tim', "The next day, the 18th, there's a performance by a ballet company called Eustatis."],
      ['Jean', 'Sorry?'],
      ['Tim', "The name is spelt E-U-S-T-A-T-I-S. They appeared in last year's festival, and went down very well. Again, their programme is designed for all ages."],
      ['Jean', "Good. I expect we'll go to that. I hope there's going to be a play during the festival, a comedy, ideally."],
      ['Tim', "You're in luck! On the 19th and 20th a local amateur group are performing one written by a member of group. It's called Jemima. That'll be on in the town hall. They've already performed it two or three times. I haven't seen it myself, but the review in the local paper was very good."],
      ['Jean', 'And is it suitable for children?'],
      ['Tim', "Yes, in fact it's aimed more at children than at adults, so both performances are in the afternoon."],
      ['Jean', 'And what about dance? Will there by any performances?'],
      ['Tim', 'Yes, also on the 20th, but in the evening. A professional company is putting on a show of modern pieces, with electronic music by young composers.'],
      ['Jean', 'Uh-huh.'],
      ['Tim', "The show is about how people communicate, or fail to communicate, with each other, so it's got the rather strange name, Chat."],
      ['Jean', "I suppose that's because that's something we do both face to face and online."],
      ['Tim', "That's right."],
      ['Tim', "Now there are also some workshops and other activities. They'll all take place at least once every day, so everyone who wants to take part will have a chance."],
      ['Jean', "Good. We're particularly interested in cookery – you don't happen to have a cookery workshop, do you?"],
      ['Tim', "We certainly do. It's going to focus on how to make food part of a healthy lifestyle, and it'll show that even sweet things like cakes can contain much less sugar than they usually do."],
      ['Jean', "That might be worth going to. We're trying to encourage our children to cook."],
      ['Tim', "Another workshop is just for children, and that's on creating posters to reflect the history of the town. The aim is to make children aware of how both the town and people's lives have changed over the centuries. The results will be exhibited in the community centre. Then the other workshop is in toy-making, and that's for adults only."],
      ['Jean', "Oh, why's that?"],
      ['Tim', "Because it involves carpentry – participants will be making toys out of wood, so there'll be a lot of sharp chisels and other tools around."],
      ['Jean', 'It makes sense to keep children away from it.'],
      ['Tim', 'Exactly. Now let me tell you about some of the outdoor activities. There\'ll be supervised wild swimming …'],
      ['Jean', "Wild swimming? What's that?"],
      ['Tim', 'It just means swimming in natural waters, rather than a swimming pool.'],
      ['Jean', 'Oh OK. In a lake, for instance.'],
      ['Tim', "Yes, there's a beautiful one just outside the town, and that'll be the venue for the swimming. There'll be lifeguards on duty, so it's suitable for all ages. And finally, there'll be a walk in some nearby woods every day. The leader is an expert on insects. He'll show some that live in the woods, and how important they are for the environment. So there are going to be all sorts of different things to do during the festival."],
      ['Jean', 'There certainly are.'],
      ['Tim', "If you'd like to read about how the preparations for the festival are going, the festival organizer is keeping a blog. Just search online for the festival website, and you'll find it."],
      ['Jean', 'Well, thank you very much for all the information.'],
      ['Tim', "You're welcome. Goodbye."],
      ['Jean', 'Goodbye.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 2,
    transcript: fmt('Minster Park', [
      ['Woman', "I'm very pleased to welcome this evening's guest speaker, Mark Logan, who's going to tell us about the recent transformation of Minster Park. Over to you, Mark."],
      ['Mark', "Thank you. I'm sure you're all familiar with Minster Park. It's been a feature of the city for well over a century, and has been the responsibility of the city council for most of that time. What perhaps isn't so well known is the origin of the park: unlike many public parks that started in private ownership, as the garden of a large house, for instance, Minster was some waste land, which people living nearby started planting with flowers in 1892. It was unclear who actually owned the land, and this wasn't settled until 20 years later, when the council took possession of it."],
      ['Mark', "You may have noticed the statue near one of the entrances. It's of Diane Gosforth, who played a key role in the history of the park. Once the council had become the legal owner, it planned to sell the land for housing. Many local people wanted it to remain a place that everyone could go to, to enjoy the fresh air and natural environment – remember the park is in a densely populated residential area. Diane Gosforth was one of those people, and she organised petitions and demonstrations, which eventually made the council change its mind about the future of the land."],
      ['Mark', 'Soon after this the First World War broke out, in 1914, and most of the park was dug up and planted with vegetables, which were sold locally. At one stage the army considered taking in over for troop exercises and got as far as contacting the city council, then decided the park was too small to be of use. There were occasional public meetings during the war, in an area that had been retained as grass.'],
      ['Mark', "After the war, the park was turned back more or less to how it had been before 1914, and continued almost unchanged until recently. Plans for transforming it were drawn up at various times, most recently in 2013, though they were revised in 2015, before any work had started. The changes finally got going in 2016, and were finished on schedule last year."],
      ['Mark', "OK, let me tell you about some of the changes that have been made – and some things that have been retained. If you look at this map, you'll see the familiar outline of the park, with the river forming the northern boundary, and a gate in each of the other three walls. The statue of Diane Gosforth has been moved: it used to be close to the south gate, but it's now immediately to the north of the lily pond, almost in the centre of the park, which makes it much more visible."],
      ['Mark', "There's a new area of wooden sculptures, which are on the river bank, where the path from the east gate makes a sharp bend."],
      ['Mark', "There are two areas that are particularly intended for children. The playground has been enlarged and improved, and that's between the river and the path that leads from the pond to the river."],
      ['Mark', "Then there's a new maze, a circular series of paths, separated by low hedges. That's near the west gate – you go north from there towards the river and then turn left to reach it."],
      ['Mark', "There have been tennis courts in the park for many years, and they've been doubled, from four to eight. They're still in the south-west corner of the park, where there's a right-angle bend in the path."],
      ['Mark', "Something else I'd like to mention is the new fitness area. This is right next to the lily pond on the same side as the west gate."],
      ['Mark', "Now, as you're all gardeners, I'm sure you'll like to hear about the plants that have been chosen for the park."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 3,
    transcript: fmt('Display on Charles Dickens', [
      ['Cathy', "OK, Graham, so let's check we both know what we're supposed to be doing."],
      ['Graham', 'OK.'],
      ['Cathy', "So, for the university's open day, we have to plan a display on British life and literature in the mid-19th century."],
      ['Graham', "That's right. But we'll have some people to help us find the materials and set it up, remember – for the moment, we just need to plan it."],
      ['Cathy', "Good. So have you gathered who's expected to come and see the display? Is it for the people studying English, or students from other departments? I'm not clear about it."],
      ['Graham', "Nor me. That was how it used to be, but it didn't attract many people, so this year it's going to be part of an open day, to raise the university's profile. It'll be publicised in the city, to encourage people to come and find out something of what does on here, and it's included in the information that's sent to people who are considering applying to study here next year."],
      ['Cathy', 'Presumably some current students and lecturers will come?'],
      ['Graham', "I would imagine so, but we've been told to concentrate on the other categories of people."],
      ['Cathy', "Right. We don't have to cover the whole range of 19th-century literature, do we?"],
      ['Graham', "No, it's entirely up to us. I suggest just using Charles Dickens."],
      ['Cathy', "That's a good idea. Most people have heard of him, and have probably read some of his novels, or seen films based on them, so that's a good lead-in to life in his time."],
      ['Graham', "Exactly. And his novels show the awful conditions that most people had to live in, don't they: he wanted to shock people into doing something about it."],
      ['Cathy', 'Did he do any campaigning, other than writing?'],
      ['Graham', "Yes, he campaigned for education and other social reforms, and gave talks, but I'm inclined to ignore that and focus on the novels."],
      ['Cathy', 'Yes, I agree.'],
      ['Cathy', 'OK, so now shall we think about a topic linked to each novel?'],
      ['Graham', "Yes. I've printed out a list of Dicken's novels in the order they were published, in the hope you'd agree to focus on him!"],
      ['Cathy', "You're lucky I did agree! Let's have a look. OK, the first was The Pickwick Papers, published in 1836. It was very successful when it came out, wasn't it, and was adapted for the theatre straight away."],
      ['Graham', "There's an interesting point, though, that there's a character who keeps falling asleep, and that medical condition was named after the book – Pickwickian Syndrome."],
      ['Cathy', 'Oh, so why don\'t we use that as the topic, and include some quotations from the novel?'],
      ['Graham', "Right, Next is Oliver Twist. There's a lot in the novel about poverty. But maybe something less obvious …"],
      ['Cathy', "Well Oliver is taught how to steal, isn't he? We could use that to illustrate the fact that very few children went to school, particularly not poor children, so they learnt in other ways."],
      ['Graham', "Good idea. What's next?"],
      ['Cathy', "Maybe Nicholas Nickleby. Actually he taught in a really cruel school, didn't he?"],
      ['Graham', "That's right. But there's also the company of touring actors that Nicholas joins. We could do something on theatres and other amusements of the time. We don't want only the bad things, do we?"],
      ['Cathy', 'OK.'],
      ['Graham', "What about Martin Chuzzlewit? He goes to the USA, doesn't he?"],
      ['Cathy', 'Yes, and Dickens himself had been there a year before, and drew on his experience there in the novel.'],
      ['Graham', 'I wonder, though … The main theme is selfishness, so we could do something on social justice? No, too general, let\'s keep to your idea – I think it would work well.'],
      ['Cathy', "He wrote Bleak House next – that's my favourite of his novels."],
      ['Graham', 'Yes, mine too. His satire of the legal system is pretty powerful.'],
      ['Cathy', "That's true, but think about Esther, the heroine. As a child she lives with someone she doesn't know is her aunt, who treats her very badly. Then she's very happy living with her guardian, and he puts her in charge of the household. And at the end she gets married and her guardian gives her and her husband a house, where of course they're very happy."],
      ['Graham', 'Yes, I like that.'],
      ['Cathy', "What shall we take next? Little Dorrit? Old Mr Dorrit has been in a debtors' prison for years …"],
      ['Graham', "So was Dicken's father, wasn't he?"],
      ['Cathy', "That's right."],
      ['Graham', 'What about focusing on the part when Mr Dorrit inherits a fortune, and he starts pretending he\'s always been rich?'],
      ['Cathy', 'Good idea.'],
      ['Graham', "OK, so next we need to think about what materials we want to illustrate each issue. That's going to be quite hard."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 2', partNumber: 4,
    transcript: fmt('Agricultural programme in Mozambique', [
      [null, 'I\'m going to report on a case study of a programme which has been set up to help rural populations in Mozambique, a largely agricultural country in South-East Africa.'],
      [null, 'The programme worked with three communities in Chicualacuala district, near the Limpopo River. This is a dry and arid region, with unpredictable rainfall. Because of this, people in the area were unable to support themselves through agriculture and instead they used the forest as a means of providing themselves with an income, mainly by selling charcoal. However, this was not a sustainable way of living in the long term, as they were rapidly using up this resource.'],
      [null, 'To support agriculture in this dry region, the programme focused primarily on making use of existing water resources from the Limpopo River by setting up systems of irrigation, which would provide a dependable water supply for crops and animals. The programme worked closely with the district government in order to find the best way of implementing this. The region already had one farmers\' association, and it was decided to set up two more of these. These associations planned and carried out activities including water management, livestock breeding and agriculture, and it was notable that in general, women formed the majority of the workforce.'],
      [null, 'It was decided that in order to keep the crops safe from animals, both wild and domestic, special areas should be fenced off where the crops could be grown. The community was responsible for creating these fences, but the programme provided the necessary wire for making them.'],
      [null, 'Once the area had been fenced off, it could be cultivated. The land was dug, so that vegetables and cereals appropriate to the climate could be grown, and the programme provided the necessary seeds for this. The programme also provided pumps so that water could be brought from the river in pipes to the fields. However, the labour was all provided by local people, and they also provided and put up the posts that supported the fences around the fields.'],
      [null, 'Once the programme had been set up, its development was monitored carefully. The farmers were able to grow enough produce not just for their own needs, but also to sell. However, getting the produce to places where it could be marketed was sometimes a problem, as the farmers did not have access to transport, and this resulted in large amounts of produce, especially vegetables, being spoiled. This problem was discussed with the farmers\' associations and it was decided that in order to prevent food from being spoiled, the farmers needed to learn techniques for its preservation.'],
      [null, 'There was also an additional initiative that had not been originally planned, but which became a central feature of the programme. This was when farmers started to dig holes for tanks in the fenced-off areas and to fill these with water and use them for breeding fish – an important source of protein. After a time, another suggestion was made by local people which hadn\'t been part of the programme\'s original proposal, but which was also adopted later on. They decided to try setting up colonies of bees, which would provide honey both for their own consumption and to sell.'],
      [null, 'So what lessons can be learned from this programme? First of all, it tells us that in dry, arid regions, if there is access to a reliable source of water, there is great potential for the development of agriculture. In Chicualacuala, there was a marked improvement in agricultural production, which improved food security and benefited local people by providing them with both food and income. However, it\'s important to set realistic timelines for each phase of the programme, especially for its design, as mistakes made at this stage may be hard to correct later on.'],
      [null, 'The programme demonstrates that sustainable development is possible in areas where…'],
    ]),
  },

  // ══════════════════════════ Cam 15 - Test 3 ══════════════════════════
  {
    testName: 'Cam 15 - Test 3', partNumber: 1,
    transcript: fmt('Employment agency job discussion', [
      ['Sally', "Good morning. Thanks for coming in to see us here at the agency, Joe. I'm one of the agency representatives, and my name's Sally Baker."],
      ['Joe', "Hi Sally. I think we spoke on the phone, didn't we?"],
      ['Sally', "That's right, we did. So thank you for sending in your CV. We've had quite a careful look at it and I think we have two jobs that might be suitable for you."],
      ['Joe', 'OK.'],
      ['Sally', 'The first one is in a company based in North London. They\'re looking for an administrative assistant.'],
      ['Joe', 'OK. What sort of company is it?'],
      ['Sally', "They're called Home Solutions and they design and make furniture."],
      ['Joe', "Oh, I don't know much about that, but it sounds interesting."],
      ['Sally', "Yes, well as I said, they want someone in their office, and looking at your past experience it does look as if you fit quite a few of the requirements. So on your CV it appears you've done some data entry?"],
      ['Joe', 'Yes.'],
      ['Sally', "So that's one skill they want. Then they expect the person they appoint to attend meetings and take notes there …"],
      ['Joe', "OK. I've done that before, yes."],
      ['Sally', "And you'd need to be able to cope with general admin."],
      ['Joe', "Filling, and keeping records and so on? That should be OK. And in my last job I also had to manage the diary."],
      ['Sally', "Excellent. That's something they want here too. I'd suggest you add it to your CV – I don't think you mentioned that, did you?"],
      ['Joe', 'No.'],
      ['Sally', "So as far as the requirements go, they want good computer skills, of course, and they particularly mention spreadsheets."],
      ['Joe', 'That should be fine.'],
      ['Sally', "And interpersonal skills – which would be something they'd check with your references."],
      ['Joe', 'I think that should be OK, yes.'],
      ['Sally', "Then they mention that they want someone who is careful and takes care with details – just looking at your CV, I'd say you're probably alright there."],
      ['Joe', 'I think so, yes. Do they want any special experience?'],
      ['Sally', 'I think they wanted some experience of teleconferencing.'],
      ['Joe', "I've got three years' experience of that."],
      ['Sally', "let's see, yes, good. In fact they're only asking for at least one year, so that's great. So is that something that might interest you?"],
      ['Joe', "It is, yes. The only thing is, you said they were in North London so it would be quite a long commute for me."],
      ['Sally', 'OK.'],
      ['Sally', 'So the second position might suit you better as far as the location goes; that\'s for a warehouse assistant and that\'s in South London.'],
      ['Joe', 'Yes, that would be a lot closer.'],
      ['Sally', "And you've worked in a warehouse before, haven't you?"],
      ['Joe', 'Yes.'],
      ['Sally', "So as far as the responsibilities for this position go, they want someone who can manage the stock, obviously, and also deliveries."],
      ['Joe', "That should be OK. You've got to keep track of stuff, but I've always been quite good with numbers."],
      ['Sally', "Good, that's their first requirement. And they want someone who's computer literate, which we know you are."],
      ['Joe', 'Sure.'],
      ['Sally', "Then they mention organisational skills. They want someone who's well organised."],
      ['Joe', 'Yes, I think I am.'],
      ['Sally', 'And tidy?'],
      ['Joe', "Yes, they go together really, don't they?"],
      ['Sally', "Sure. Then the usual stuff; they want someone who can communicate well both orally and in writing."],
      ['Joe', "OK. And for the last warehouse job I had, one of the things I enjoyed most was being part of a team. I found that was really essential for the job."],
      ['Sally', "Excellent. Yes, they do mention that they want someone who's used to that, yes. Now when you were working in a warehouse last time, what sorts of items were you dealing with?"],
      ['Joe', 'It was mostly bathroom and kitchen equipment, sinks and stoves and fridges.'],
      ['Sally', "So you're OK moving heavy things?"],
      ['Joe', "Sure. I'm quite strong, and I've had the training."],
      ['Sally', "Good. Now as far as experience goes, they mention they want someone with a licence, and that you have experience of driving in London – so you can cope with the traffic and so on."],
      ['Joe', 'Yes, no problem.'],
      ['Sally', "And you've got experience of warehouse work … and the final thing they mention is customer service. I think looking at your CV you've OK there."],
      ['Joe', 'Right. So what about pay? Can you tell me a bit more about that, please …'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 2,
    transcript: fmt('Street Play Scheme', [
      ['Presenter', "My guest on the show today is Alice Riches who started the Street Play Scheme where she lives in Beechwood Road. For those of you that don't already know – Street Play involves local residents closing off their street for a few hours so that children have a chance to play in the street safely. She started it in her own street, Beechwood Road, and the idea caught on, and there are now Street Play Schemes all over the city. So when did you actually start the scheme, Alice?"],
      ['Alice', "Well, I first had the idea when my oldest child was still a toddler, so that's about six years ago now – but it took at least two years of campaigning before we were actually able to make it happen. So the scheme's been up and running for three years now. We'd love to be able to close our road for longer – for the whole weekend, from Saturday morning until Sunday evening, for example. At the moment it's just once a week. But when we started it was only once a month. But we're working on it."],
      ['Presenter', 'So what actually happens when Beechwood Road is closed?'],
      ['Alice', "We have volunteer wardens, mostly parents but some elderly residents too, who block off our road at either end. The council have provided special signs but there's always a volunteer there to explain what's happening to any motorists. Generally, they're fine about it – we've only had to get the police involved once or twice."],
      ['Alice', "Now I should explain that the road isn't completely closed to cars. But only residents' cars are allowed. If people really need to get in or out of Beechwood Road, it's not a problem – as long as they drive at under 20 kilometres per hour. But most people just decide not to use their cars during this time, or they park in another street. The wardens are only there to stop through traffic."],
      ['Presenter', 'So can anyone apply to get involved in Street Play?'],
      ['Alice', "Absolutely – we want to include all kids in the city – especially those who live on busy roads. It's here that demand is greatest. Obviously, there isn't such demand in wealthier areas where the children have access to parks or large gardens – or in the suburbs where there are usually more places for children to play outside."],
      ['Alice', "I'd recommend that anyone listening who likes the idea should just give it a go. We've been surprised by the positive reaction of residents all over the city. And that's not just parents. There are always a few who complain but they're a tiny minority. On the whole everyone is very supportive and say they're very happy to see children out on the street – even if it does get quite noisy."],
      ['Alice', "There have been so many benefits of Street Play for the kids. Parents really like the fact that the kids are getting fresh air instead of sitting staring at a computer screen, even if they're not doing anything particularly energetic. And of course it's great that kids can play with their friends outside without being supervised by their parents – but for me the biggest advantage is that kids develop confidence in themselves to be outside without their parents. The other really fantastic thing is that children get to know the adults in the street – it's like having a big extended family."],
      ['Presenter', 'It certainly does have a lot of benefits. I want to move on now and ask you about a related project in King Street.'],
      ['Alice', "Right. Well this was an experiment I was involved in where local residents decided to try and reduce the traffic along King Street, which is the busiest main road in our area, by persuading people not to use their cars for one day. We thought about making people pay more for parking – but we decided that would be really unpopular – so instead we just stopped people from parking on King Street but left the other car parks open."],
      ['Alice', "It was surprising how much of a difference all this made. As we'd predicted, air quality was significantly better but what I hadn't expected was how much quieter it would be – even with the buses still running. Of course everyone said they felt safer but we were actually amazed that sales in the shops went up considerably that day – we thought there'd be fewer people out shopping – not more."],
      ['Presenter', "That's really interesting so the fact that …"],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 3,
    transcript: fmt('Analysing newspaper items', [
      ['Hazel', 'Tom, could I ask you for some advice, please?'],
      ['Tom', 'Yes of course, if you think I can help. What\'s it about?'],
      ['Hazel', "It's my first media studies assignment, and I'm not sure how to go about it. You must have done it last year."],
      ['Tom', 'Is that the one comparing the coverage of a particular story in a range of newspapers?'],
      ['Hazel', "That's right."],
      ['Tom', 'Oh yes, I really enjoyed writing it.'],
      ['Hazel', 'So what sort of things do I need to compare?'],
      ['Tom', "Well, there are several things. For example, there's the question of which page of the newspaper the item appears on."],
      ['Hazel', "You mean, because there's a big difference between having it on the front page and the bottom of page ten, for instance?"],
      ['Tom', "Exactly. And that shows how important the editor thinks the story is. Then there's the size – how many column inches the story is given, how many columns it spreads over."],
      ['Hazel', 'And I suppose that includes the headline.'],
      ['Tom', "It certainly does. It's all part of attracting the reader's attention."],
      ['Hazel', "What about graphics – whether there's anything visual in addition to the text?"],
      ['Tom', "Yes, you need to consider those, too, because they can have a big effect on the reader's understanding of the story – sometimes a bigger effect than the text itself. Then you'll need to look at how the item is put together: what structure is it given? Bear in mind that not many people read beyond the first paragraph, so what has the journalist put at the beginning? And if, say, there are conflicting opinions about something, does one appear near the end, where people probably won't read it?"],
      ['Hazel', "And newspapers sometimes give wrong or misleading information, don't they? Either deliberately or by accident. Should I be looking at that, too?"],
      ['Tom', "Yes, if you can. Compare what's in different versions, and as far as possible, try and work out what's true and what isn't. And that relates to a very important point: what's the writer's purpose, or at least the most important one, if they have several. It may seem to be to inform the public, but often it's that they want to create fear, or controversy, or to make somebody look ridiculous."],
      ['Hazel', 'Gosh, I see what you mean. And I suppose the writer may make assumptions about the reader.'],
      ['Tom', "That's right – about their knowledge of the subject, their attitudes, and their level of education, which means writing so that the readers understand without feeling patronised. All of that will make a difference to how story is presented."],
      ['Hazel', 'Does it matter what type of story I write about?'],
      ['Tom', "No – national or international politics, the arts … Anything, as long as it's covered in two or three newspaper. Though of course it'll be easier and more fun if it's something you're interested in and know something about."],
      ['Hazel', "And on that basis a national news item would be worth analysing – I'm quite keen on politics, so I'll try and find a suitable topic. What did you choose for your analysis, Tom?"],
      ['Tom', "I was interested in how newspapers express their opinions explicitly, so I wanted to compare editorials in different papers, but when I started looking, I couldn't find two on the same topic that I felt like analysing."],
      ['Hazel', "In that case, I won't even bother to look."],
      ['Tom', "So in the end I chose a human interest story – a terribly emotional story about a young girl who was very ill, and lots of other people – mostly strangers – raised money so she could go abroad for treatment. Actually, I was surprised – some papers just wrote about how wonderful everyone was, but others considered the broader picture, like why treatment wasn't available here."],
      ['Hazel', "Hmm, I usually find stories like that raise quite strong feelings in me! I'll avoid that. Perhaps I'll choose an arts topic, like different reviews of a film, or something about funding for the arts – I'll think about that."],
      ['Tom', 'Yes, that might be interesting.'],
      ['Hazel', "OK, well thanks a lot for your help, Tom. It's been really useful."],
      ['Tom', 'You\'re welcome. Good luck with the assignment, Hazel.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 3', partNumber: 4,
    transcript: fmt('Early history of keeping clean', [
      [null, 'Nowadays, we use different products for personal cleanliness, laundry, dishwashing and household cleaning, but this is very much a 20th-century development.'],
      [null, 'The origins of cleanliness date back to prehistoric times. Since water is essential for life, the earliest people lived near water and knew something about its cleansing properties – at least that it rinsed mud off their hands.'],
      [null, "During the excavation of ancient Babylon, evidence was found that soapmaking was known as early as 2800 BC. Archaeologists discovered cylinders made of clay, with inscriptions on them saying that fats were boiled with askes. This is a method of making soap, though there's no reference to the purpose of this material."],
      [null, "The early Greeks bathed for aesthetic reasons and apparently didn't use soap. Instead, they cleaned their bodies with blocks of sand, pumice and ashes, then anointed themselves with oil, and scraped off the oil and dirt with a metal instrument known as a strigil. They also used oil mixed with ashes. Clothes were washed without soap in streams."],
      [null, "The ancient Germans and Gauls are also credited with discovering how to make a substance called 'soap', made of melted animal fat and ashes. They used this mixture to tint their hair red."],
      [null, 'Soap got its name, according to an ancient Roman legend, from Mount Sapo, where animals were sacrificed, leaving deposits of animal fat. Rain washed these deposits, along with wood ashes, down into the clay soil along the River Tiber. Women found that this mixture greatly reduced the effort required to wash their clothes.'],
      [null, 'As Roman civilisation advance, so did bathing. The first of the famous Roman baths, supplied with water from their aqueducts, was built around 312 BC. The baths were luxurious, and bathing became very popular. And by the second century AD, the Greek physician Galen recommended soap for both medicinal and cleaning purposes.'],
      [null, 'After the fall of Rome in 467 AD and the resulting decline in bathing habits, much of Europe felt the impact of filth on public health. This lack of personal cleanliness and related unsanitary living conditions were major factors in the outbreaks of disease in the Middle Ages, and especially the Black Death of the 14th century.'],
      [null, 'Nevertheless, soapmaking became an established craft in Europe, and associations of soapmakers guarded their trade secrets closely. Vegetable and animal oils were used with ashes of plants, along with perfume, apparently for the first time. Gradually more varieties of soap became available for shaving and shampooing, as well as bathing and laundering.'],
      [null, 'A major step toward large-scale commercial soapmaking occurred in 1791, when a French chemist, Nicholas Leblanc, patented a process for turning salt into soda ash, or sodium carbonate. Soda ash is the alkali obtained from ashes that combines with fat to form soap. The Leblanc process yielded quantities of good-quality, inexpensive soda ash.'],
      [null, 'Modern soapmaking was born some 20 years later, in the early 19th century, with the discovery by Michel Eugène Chevreul, another French chemist, of the chemical nature and relationship of fats, glycerine and fatty acids. His studies established the basis for both fat and soap chemistry, and soapmaking became a science. Further developments during the 19th century made it easier and cheaper to manufacture soap.'],
      [null, 'Until the 19th century, soap was regarded as a luxury item, and was heavily taxed in several countries. As it became more readily available, it became an everyday necessity, a development that was reinforced when the high tax was removed. Soap was then something ordinary people could afford, and cleanliness standards improved.'],
      [null, 'With this widespread use came the development of milder soaps for bathing and soaps for use in the washing machines that were available to consumers by the turn of the 20th century.'],
    ]),
  },

  // ══════════════════════════ Cam 15 - Test 4 ══════════════════════════
  {
    testName: 'Cam 15 - Test 4', partNumber: 1,
    transcript: fmt('Customer satisfaction survey', [
      ['Man', "Hello. Do you mind if I ask you some questions about your journey today? We're doing a customer satisfaction survey."],
      ['Sophie', "Yes. OK. I've got about ten minutes before my train home leaves. I'm on a day trip."],
      ['Man', 'Great. Thank you. So first of all, could you tell me your name?'],
      ['Sophie', "It's Sophie Bird."],
      ['Man', 'Thank you. And would you mind telling me what you do?'],
      ['Sophie', "I'm a journalist."],
      ['Man', 'Oh really? That must be interesting.'],
      ['Sophie', 'Yes. It is.'],
      ['Man', 'So was the reason for your visit here today work?'],
      ['Sophie', 'Actually, it\'s my day off. I came here to do some shopping.'],
      ['Man', 'On right.'],
      ['Sophie', 'But I do sometimes come here for work.'],
      ['Man', "OK. Now I'd like to ask some questions about your journey today, if that's OK."],
      ['Sophie', 'Yes. No problem.'],
      ['Man', "Right, so can you tell me which station you're travelling back to?"],
      ['Sophie', 'Staunfirth, where I live.'],
      ['Man', 'Can I just check the spelling? S-T-A-U-N-F-I-R-T-H?'],
      ['Sophie', "That's right."],
      ['Man', 'And you travelled from there this morning?'],
      ['Sophie', 'Yes.'],
      ['Man', "OK, good. Next, can I ask what kind of ticket you bought? I assume it wasn't a season ticket, as you don't travel every day."],
      ['Sophie', "That's right. No, I just got a normal return ticket. I don't have a rail card so I didn't get any discount. I keep meaning to get one because it's a lot cheaper."],
      ['Man', "Yes – you'd have saved 20% on your ticket today. So you paid the full price for your ticket?"],
      ['Sophie', 'I paid £23.70.'],
      ['Man', 'OK. Do you think that\'s good value for money?'],
      ['Sophie', "Not really. I think it's too much for a journey that only takes 45 minutes."],
      ['Man', "Yes, that's one of the main complaints we get. So, you didn't buy your ticket in advance?"],
      ['Sophie', "No. I know it's cheaper if you buy a week in advance but I didn't know I was coming then."],
      ['Man', "I know. You can't always plan ahead. So, did you buy it this morning?"],
      ['Sophie', 'No, it was yesterday.'],
      ['Man', 'Right. And do you usually buy your tickets at the station?'],
      ['Sophie', "Well, I do usually but the ticket office closes early and I hate using ticket machines. I think ticket offices should be open for longer hours. There's always a queue for the machines and they're often out of order."],
      ['Man', 'A lot of customers are saying the same thing.'],
      ['Sophie', 'So to answer your question … I got an e-ticket online.'],
      ['Man', "OK. Thank you. Now I'd like to ask you about your satisfaction with your journey. So what would you say you were most satisfied with today?"],
      ['Sophie', "Well, I like the wifi on the train. It's improved a lot. It makes it easier for me to work if I want to."],
      ['Man', "That's the first time today anyone's mentioned that. It's good to get some positive feedback on that."],
      ['Sophie', 'Mmm.'],
      ['Man', 'And, is there anything you weren\'t satisfied with?'],
      ['Sophie', 'Well, normally, the trains run on time and are pretty reliable but today there was a delay; the train was about 15 minutes behind schedule.'],
      ['Man', "OK. I'll put that down. Now I'd also like to ask about the facilities at this station. You've probably noticed that the whole station's been upgraded. What are you most satisfied with?"],
      ['Sophie', "I think the best thing is that they've improved the amount of information about train times etc. that's given to passengers – it's much clearer – before there was only one board and I couldn't always see it properly – which was frustrating."],
      ['Man', "That's good. And is there anything you're not satisfied with?"],
      ['Sophie', "Let's see … I think things have generally improved a lot. The trains are much more modern and I like the new café. But one thing is that there aren't enough places to sit down, especially on the platforms."],
      ['Man', "OK – so I'll put 'seating' down, shall I, as the thing you're least satisfied with?"],
      ['Sophie', 'Yes, OK.'],
      ['Man', "Can I ask your opinion about some of the other facilities? We'd like feedback on whether people are satisfied, dissatisfied or neither satisfied nor dissatisfied."],
      ['Sophie', 'OK.'],
      ['Man', 'What about the parking at the station?'],
      ['Sophie', "Well to be honest, I don't really have an opinion as I never use it."],
      ['Man', 'So, neither satisfied nor dissatisfied for that then.'],
      ['Sophie', 'Yes, I suppose so …'],
      ['Man', 'OK, and what about …?'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 2,
    transcript: fmt('Croft Valley Park', [
      [null, "As chair of the town council subcommittee on park facilities, I'd like to bring you up to date on some of the changes that have been made recently to the Croft Valley Park. So if you could just take a look at the map I handed out, let's begin with a general overview. So the basic arrangement of the park hasn't changed – it still has two gates, north and south, and a lake in the middle."],
      [null, 'The café continues to serve an assortment of drinks and snacks and is still in the same place, looking out over the lake and next to the old museum.'],
      [null, "We're hoping to change the location of the toilets, and bring them nearer to the centre of the park as they're a bit out of the way at present, near the adventure playground, in the corner of your map."],
      [null, "The formal gardens have been replanted and should be at their best in a month or two. They used to be behind the old museum, but we're now used the space near the south gate – between the park boundary and the path that goes past the lake towards the old museum."],
      [null, "We have a new outdoor gym for adults and children, which is already proving very popular. It's by the glass houses, just to the right of the path from the south gate. You have to look for it as it's a bit hidden in the trees."],
      [null, "One very successful introduction has been our skateboard ramp. It's in constant use during the evenings and holidays. It's near the old museum, at the end of a little path that leads off from the main path between the lake and the museum."],
      [null, "We've also introduced a new area for wild flowers, to attract bees and butterflies. It's on a bend in the path that goes round the east side of the lake, just south of the adventure playground."],
      [null, 'Now let me tell you a bit more about some of the changes to Croft Valley Park.'],
      [null, "One of our most exciting developments has been the adventure playground. We were aware that we had nowhere for children to let off steam, and decided to use our available funds to set up a completely new facility in a large space to the north of the park. It's open year-round, though it close early in the winter months, and entrance is completely free. Children can choose whatever activities they want to do, irrespective of their age, but we do ask adults not to leave them on their own there. There are plenty of seats where parents can relax and keep an eye on their children at the same time."],
      [null, 'Lastly, the glass houses. A huge amount of work has been done on them to repair the damage following the disastrous fire that recently destroyed their western side. Over £80,000 was spent on replacing the glass walls and the metal supports, as well as the plants that had been destroyed, although unfortunately the collection of tropical palm trees has proved too expensive to replace up to now. At present the glass houses are open from 10am to 3pm Mondays to Thursdays, and it\'s hoped to extend this to the weekend soon. We\'re grateful to all those who helped us by contributing their time and money to this achievement.'],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 3,
    transcript: fmt('Presentation about refrigeration', [
      ['Annie', "OK, Jack. Before we plan our presentation about refrigeration, let's discuss what we've discovered so far."],
      ['Jack', "Fine, Annie. Though I have to admit I haven't done much research yet."],
      ['Annie', "Nor me. But I found an interesting article about icehouses. I'd been some 18th- and 19th-century ones here in the UK, so I knew they were often built in a shady area or underground, close to lakes that might freeze in the winter. Then blocks of ice could be cut and stored in the icehouse. But I didn't realise that insulating the blocks with straw or sawdust meant they didn't melt for months. The ancient Romans had refrigeration, too."],
      ['Jack', "I didn't know that."],
      ['Annie', "Yes, pits were dug in the ground, and snow was imported from the mountains – even though they were at quite a distance. The snow was stored in the pits. Ice formed at the bottom of it. Both the ice and the snow were then sold. The ice cost more than the snow and my guess is that only the wealthy members of society could afford it."],
      ['Jack', "I wouldn't be surprised. I also came across an article about modern domestic fridges. Several different technologies are used, but they were too complex for me to understand."],
      ['Annie', 'You have to wonder what happens when people get rid of old ones.'],
      ['Jack', 'You mean because the gases in them are harmful for the environment?'],
      ['Annie', "Exactly. At least these are now plenty of organisations that will recycle most of the components safety, but of course some people just dump old fridges in the countryside."],
      ['Jack', "It's hard to see how they can be stopped unfortunately. In the UK we get rid of three million a year altogether!"],
      ['Annie', 'That sounds a lot, especially because fridges hardly ever break down.'],
      ['Jack', "That's right. In this country we keep domestic fridges for 11 years on average, and a lot last for 20 or more. So if you divide the cost by the number of years you can use a fridge, they're not expensive, compared with some household appliances."],
      ['Annie', "True. I suppose manufactures encourage people to spend more by making them different colours and designs. I'm sure when my parents bought their first fridge they had hardly any choice!"],
      ['Jack', "Yes, there's been quite a change."],
      ['Jack', "Right, let's make a list of topics to cover in our presentation, and decide who's going to do more research on them. Then later, we can get together and plan the next step."],
      ['Annie', "OK. How about starting with how useful refrigeration is, and the range of goods that are refrigerated nowadays? Because of course it's not just food and drinks."],
      ['Jack', 'No, I suppose flowers and medicines are refrigerated, too.'],
      ['Annie', 'And computers. I could do that, unless you particularly want to.'],
      ['Jack', "No, that's fine by me. What about the effects of refrigeration on people's health? After all, some of the chemicals used in the 19th century were pretty harmful, but there have been lots of benefits too, like always have access to fresh food. Do you fancy dealing with that?"],
      ['Annie', "I'm no terribly keen, to be honest."],
      ['Jack', 'Nor me. My mind just goes blank when I read anything about chemicals.'],
      ['Annie', 'Oh, all right then, I\'ll do you a favour. But you own me, Jack.'],
      ['Jack', 'What about the effects on food producers, like farmers in poorer countries being able to export their produce to developed countries? Something for you, maybe?'],
      ['Jack', "I don't mind. It should be quite interesting."],
      ['Annie', "I think we should also look at how refrigeration has helped whole cities – like Las Vegas, which couldn't exist without refrigeration because it's in the middle of a desert."],
      ['Jack', "Right. I had a quick look at an economics book in the library that's got a chapter about this sort of thing. I could give you the title, if you want to do this section."],
      ['Annie', 'Not particularly, to be honest. I find economics books pretty heavy going, as a rule.'],
      ['Jack', 'OK, leave it to me, then.'],
      ['Annie', 'Thanks. Then there\'s transport, and the difference that refrigerated trucks have made. I wouldn\'t mind having a go at that.'],
      ['Jack', 'Don\'t forget trains, too. I read something about milk and butter being transported in refrigerated railroad cars in the USA, right back in the 1840s.'],
      ['Annie', "I hadn't thought of trains. Thanks."],
      ['Jack', "Shall we have a separate section on domestic fridges? After all, they're something everyone's familiar with."],
      ['Annie', "What about splitting it into two? You could investigate 19th- and 20th-century fridges, and I'll concentrate on what's available these days, and how manufacturers differentiate their products from those of their competitors."],
      ['Jack', "OK, that'd suit me."],
    ]),
  },
  {
    testName: 'Cam 15 - Test 4', partNumber: 4,
    transcript: fmt('How the Industrial Revolution affected life in Britain', [
      [null, "Hi everyone, in this session I'll be presenting my research about the social history of Britain during the Industrial Revolution. I particularly looked at how ordinary lives were affected by changes that happened at that time. This was a time that saw the beginning of a new phenomenon; consumerism – where buying and selling goods became a major part of ordinary people's lives."],
      [null, "In fact, it was in the 19th century that the quantity and quality of people's possessions was used as an indication of the wealth of the country. Before this, the vast majority of people had very few possessions, but all that was changed by the Industrial Revolution. This was the era from the mid-18th to the late 19th century, when improvements in how goods were made as well as in technology triggered massive social changes that transformed life for just about everybody in several key areas."],
      [null, "First let's look at manufacturing. When it comes to manufacturing, we tend to think of the Industrial Revolution in images of steam engines and coal. And it's true that the Industrial Revolution couldn't have taken place at all if it weren't for these new sources of power. They marked an important shift away from the traditional watermills and windmills that had dominated before this. The most advanced industry for much of the 19th century was textiles. This meant that fashionable fabrics, and lace and ribbons were made available to everyone."],
      [null, 'Before the Industrial Revolution, most people made goods to sell in small workshops, often in their own homes. But enormous new machines were now being created that could produce the goods faster and on a larger scale, and these required a lot more space. So large factories were built, replacing the workshops, and forcing workers to travel to work. In fact, large numbers of people migrated from villages into towns as a result.'],
      [null, "As well as manufacturing, there were new technologies in transport, contributing to the growth of consumerism. The horse-drawn stagecoaches and carts of the 18th century, which carried very few people and good, and travelled slowly along poorly surfaced roads, were gradually replaced by the numerous canals that were constructed. These were particularly important for the transportation of goods. The canals gradually fell out of use, though, as railways were developed, becoming the main way of moving goods and people from one end of the country to the other. And the goods they moved weren't just coal, iron, clothes, and so on – significantly, they included newspapers, which meant that thousands of people were not only more knowledgeable about what was going on in the country, but could also read about what was available in the shops. And that encouraged them to buy more. so faster forms of transport resulted in distribution becoming far more efficient – goods could now be sold all over the country, instead of just in the local market."],
      [null, "The third main area that saw changes that contributed to consumerism was retailing. The number and quality of shops grew rapidly, and in particular, small shops suffered as customers flocked to the growing number of department stores – a form of retailing that was new in the 19th century. The entrepreneurs who opened these found new ways to stock them with goods, and to attract customers: for instance, improved lighting inside greatly increased the visibility of the goods for sale. Another development that made goods more visible from outside resulted from the use of plate glass, which made it possible for windows to be much larger than previously. New ways of promoting goods were introduced, too. Previously, the focus had been on informing potential customers about the availability of goods; now there was an explosion in advertising trying to persuade people to go shopping."],
      [null, "Flanders claims that one of the great effects of the Industrial Revolution was that it created choice. All sorts of things that had previously been luxuries – from sugar to cutlery – became conveniences, and before long they'd turned into necessities: life without sugar or cutlery was unimaginable. Rather like mobile phones these days!"],
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
      console.log(`[SeedListeningTranscriptsCam15] WARNING: standalone ListeningSection not found for "${title}" (Part ${partNumber}) — skipped.`);
      sectionNotFound++;
      continue;
    }
    if (section.transcript !== transcript) {
      section.transcript = transcript;
      await section.save();
      updatedSections++;
    }
  }
  console.log(`\n[SeedListeningTranscriptsCam15] Done. ListeningTest sections updated=${updatedTests}, ListeningSection docs updated=${updatedSections}, standalone-not-found=${sectionNotFound} (out of ${TARGETS.length} targets).`);
}

if (require.main === module) {
  (async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
      await runSeed();
    } finally {
      await mongoose.disconnect();
    }
  })().catch(e => { console.error('[SeedListeningTranscriptsCam15] FAILED', e); process.exit(1); });
}

module.exports = { runSeed, TARGETS };
