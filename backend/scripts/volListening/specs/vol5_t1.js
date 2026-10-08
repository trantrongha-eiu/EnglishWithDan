// Vol 5 – Test 1 (PDF "Listening/Test 1/Test 1- up.pdf" p1–7; key "Tổng hợp key Listening.pdf" p1; audio Test 1/P1–P4.mp3 —
// P4 cut after "one minute to check" (10-minute transfer silence follows)).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns) checked against the scanned Otter text
// "Transcripts & Keys/test 1- vol 5- trans.pdf". P4: the company is "Melectra" on the recording, "Molectra" on the paper →
// transcript follows the paper.
const { note, mc, multi, matching } = require('../vol_build');

module.exports = {
  vol: 5, test: 1,
  sections: [
    {
      part: 1, title: 'Campsites', audio: 'Listening/Test 1/P1.mp3', cover: 'family campsite tents | camping holiday lake',
      transcript: `
Man:
Shall we have a look at this information about campsites and then perhaps we can choose where to go on holiday?
Woman:
Yes.
My children are very excited about our two families going away together again this year.
Shall we look at Westerly Campsite first?
Man:
Yes.
It says it's most suitable for children under 12 years old, so that should be fine for us.
Your daughter's just 11, isn't she?
Woman:
Yes, that's right.
Man:
Now, where is the Westerly Campsite?
Is it the one next to a lake?
Woman:
That's another one.
This one's by the sea.
Perfect.
Man:
Yes, that's a good place to go in the summer when the weather's hot.
Woman:
This brochure says that most children who go to Westerly Campsite love the animals they can see there.
There's a special area where they can go and feed them.
Man:
We might see some interesting birds, too.
Oh, and look, it says a farmer comes every day and you can buy eggs from him.
Woman:
Great for breakfast.
I wonder if he sells other things, like cheese, but it's not mentioned.
Man:
I don't know.
I think they grow a lot of fruit in that area, so he might sell that.
Woman:
Another thing I like about this campsite is that they let you make a fire.
We could cook some sausages and sing songs around it in the evenings.
And perhaps it would be a good way to meet other families there, too.
Man:
Great.
Woman:
And it isn't too expensive.
Man:
£6 per adult per night, £3 per child.
But wait, families of four can get it for £15.75 a night.
Woman:
That works out even cheaper.
Let's look at a couple of other campsites before we decide.
Man:
Yes, let's look at Snetton Forest Campsite.
It's even cheaper.
£5 per adult, and children under 10 are free.
They say it's a very good place if you're keen on fishing, and they even give you tips on where to go to have the best chance of catching some.
Woman:
I prefer walking or hiking, and so do the rest of my family, so I'm not sure that will attract us that much.
Oh, look, it says you can rent a bike to go around the forest.
I'd do that.
And your children would like that too, wouldn't they?
Man:
Absolutely.
We could all go somewhere and have a picnic.
Look, this is interesting too.
At Snetton, they get all the children together to play football.
Your children would love that.
And your husband, Mike, plays too, doesn't he?
Woman:
Yes, that sounds good.
Well, Mike's more into tennis, actually, but I'm sure he'd be happy to be a referee if they needed one.
Here's some information about Trent Valley Campsite.
I've heard about this one.
There's a festival near the campsite in June and it's really busy, so they say for families it's better in July when it's a bit quieter.
Man:
Well, that would be just right for us because we have to go in the school summer holidays.
Let's look at what it says about it.
Oh, look, it's quite a long way to the nearest village.
Eight kilometres.
It's too far to walk.
Woman:
But this one has got an open-air pool, which we'd all love in the summer.
And they have a little shop where you can buy basic things like bread and milk.
Man:
That's really useful.
Woman:
And there's lots to do there.
Man:
I think on Saturday nights...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Campsites', [
          '<strong>Westerly Campsite</strong>',
          'Campsite for families with children under 12',
          'Location: near the __Q1__',
          'Special attraction for children: the __Q2__',
          'A local farmer sells __Q3__',
          'Campers are allowed to have a __Q4__',
          'Cost per night: £__Q5__ for a family',
          '<strong>Snetton Forest Campsite</strong>',
          'Cost per night: £5 per adult (children free)',
          'Recommended for people who like __Q6__',
          'Campers can hire a __Q7__',
          'Activity organised for children: __Q8__',
          '<strong>Trent Valley Campsite</strong>',
          'Better month for families to go: __Q9__',
          'Has an outdoor __Q10__',
        ], { 1: 'sea', 2: 'animals', 3: 'eggs', 4: 'fire', 5: '15.75', 6: 'fishing', 7: 'bike/bicycle', 8: 'football', 9: 'July', 10: 'pool' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi Westerly Campsite ở đâu.', t: ['Is it the one next to a lake?', "That's another one.", "This one's by the sea."], p: 'Khu cạnh hồ là khu khác (bẫy); Westerly nằm cạnh biển → sea' },
        2: { v: 'Khi đọc tờ quảng cáo về Westerly.', t: ['This brochure says that most children who go to Westerly Campsite love the animals they can see there.', "There's a special area where they can go and feed them."], p: 'Trẻ em rất thích các con vật, có khu riêng để cho chúng ăn → animals' },
        3: { v: 'Khi nói về người nông dân.', t: ['Oh, and look, it says a farmer comes every day and you can buy eggs from him.', "I wonder if he sells other things, like cheese, but it's not mentioned."], p: 'Phô mai không được nhắc tới, trái cây chỉ là đoán (bẫy); chắc chắn bán trứng → eggs' },
        4: { v: 'Khi nói điều được phép ở khu cắm trại.', t: 'Another thing I like about this campsite is that they let you make a fire.', p: '“They let you make a fire” = được phép đốt lửa → fire' },
        5: { v: 'Khi nói giá một đêm.', t: ['£6 per adult per night, £3 per child.', 'But wait, families of four can get it for £15.75 a night.'], p: '£6/£3 là giá theo người (bẫy); giá cho gia đình 4 người là £15.75 → 15.75' },
        6: { v: 'Khi chuyển sang Snetton Forest Campsite.', t: "They say it's a very good place if you're keen on fishing, and they even give you tips on where to go to have the best chance of catching some.", p: 'Nơi rất tốt cho người thích câu cá → fishing' },
        7: { v: 'Ngay sau đó.', t: ['I prefer walking or hiking, and so do the rest of my family', 'Oh, look, it says you can rent a bike to go around the forest.'], p: 'Đi bộ là sở thích của người nói (bẫy); có thể thuê xe đạp (rent = hire) → bike' },
        8: { v: 'Khi nói hoạt động cho trẻ em ở Snetton.', t: ['At Snetton, they get all the children together to play football.', "Well, Mike's more into tennis, actually"], p: 'Quần vợt là sở thích của Mike (bẫy); trại tổ chức cho trẻ chơi bóng đá → football' },
        9: { v: 'Khi chuyển sang Trent Valley Campsite.', t: "There's a festival near the campsite in June and it's really busy, so they say for families it's better in July when it's a bit quieter.", p: 'Tháng 6 đông vì lễ hội (bẫy); cho gia đình thì tháng 7 tốt hơn → July' },
        10: { v: 'Khi nói tiện ích của Trent Valley.', t: "But this one has got an open-air pool, which we'd all love in the summer.", p: '“Open-air pool” = hồ bơi ngoài trời → pool' },
      },
    },
    {
      part: 2, title: 'Starting a Business – Advice from Arthur Jones', audio: 'Listening/Test 1/P2.mp3', cover: 'small business owner | radio studio microphone',
      transcript: `
Good evening.
My name is Arthur Jones.
I'm very glad to have this opportunity to speak to you over the radio.
The host asked me to give a talk about my experience of starting my own business.
I can't say my business is successful, but there are some things that I want to share with you, which I think will be helpful if you want to start your own company.
I've talked to many young people, and they told me that they are afraid of making mistakes when they start their business.
What I want to say is that mistakes are very common, especially when you do something new.
Mistakes can actually show you where you need to improve, so you can take actions about them and use the chance to learn new methods.
This is a very important attitude you should have.
Besides, most mistakes are not that fatal.
Don't be too anxious when they occur.
Next, I want to go on to talk about self-confidence, which is quite important in achieving business success.
Being self-confident means that you can have faith in yourself and what you do.
Self-confidence can be gained through hard work, even playing sports.
However, sometimes self-confidence may make you ignore problems and even cause failure.
Business leaders should remain calm and not take impulsive actions.
I know that when people start their business, they have confusions.
They don't know how they can be more professional.
They read business journals or watch related videos, but these don't seem to help sometimes.
My suggestion is that, instead of aimlessly trying many new things, they should always be committed to their goal.
As long as they stick to it, they will not be easily distracted or confused by other things, and they are sure to get better.
We will all meet difficulties, especially at the beginning.
We can't always rely on ourselves to solve all the problems.
I had a problem with marketing earlier this year.
Luckily, I found an expert to help me deal with it.
So there's always a way, but we should know how and when to seek help from these people.
Business leaders have different kinds of styles.
Some are very good at public speaking, others are very down-to-earth and have strong executive skills.
But in general, they should be able to win the respect from their employees so that they can carry out their orders more easily.
There are times when a company might face risks.
During such times, leaders will need to take prompt actions and they can't always plan for the distant future.
Leaders should analyse and deal with the risks with caution.
If they bear this in mind, there is always a way out.
At the beginning of my business, I experimented with quite a few strategies, hoping to find out the best solution for my business.
Here is what I found.
At first, my company wanted to work out prices for the products and make them realistic.
However, prices are always changing, so they can't be fixed.
Another thing I always keep in mind is that leaders must stay committed to their jobs.
Without enough commitment, you may easily give up when problems happen.
I have some friends whose businesses didn't survive during difficult times.
It wasn't because they were stupid, it was just a lack of commitment.
I can't always be sure that my products or services are better than my competitors', but I pay attention to details and try to improve all the little things, as they can actually make a big difference.
You might worry that you don't have a very clear and sophisticated business strategy.
Personally, I don't think it's a problem, because you will be changing them all the time anyway.
In terms of support, at any stage, we do need support from others to back up our business.
The support can really make a difference.
Before I started my business, my family helped me a lot, both financially and mentally.
There were also people who gave me advice on how to run businesses successfully.
However, these advice and ideas were not so practical to me, so I didn't really use them.
Looking back, I felt lucky that I followed my own way of thinking.
Also, I was short of funds back then, and I loaned money from the bank to start my company.
I was grateful for that.
That's what I want to share in today's programme.
If you have any questions for me, please send it to my email, which is...`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'What is the most important attitude towards making mistakes according to Arthur?', ['Mistakes are inevitable.', 'Mistakes can be a chance to learn.', 'Mistakes can cause serious consequences.'], 'B'],
          [12, "What's true about self-confidence according to Arthur?", ['Self-confidence sometimes leads to failure.', 'It means being ambitious with what you do.', 'Self-confidence can be gained through reading.'], 'A'],
          [13, 'What advice does Arthur give to new business leaders?', ['Read business journals.', 'Try new things.', 'Keep their aims.'], 'C'],
          [14, 'How does Arthur deal with difficult problems?', ['Ask for advice from friends.', 'Seek help from experts.', 'Try to get advice from books.'], 'B'],
          [15, "What's the common quality of leaders?", ['Have good public speaking skills.', 'Solve all problems skilfully.', 'Be respected by the workforce.'], 'C'],
          [16, 'How should companies take risks?', ['Deal with them carefully.', 'Be financially advantageous.', 'Think in the long run.'], 'A'],
        ], 'Questions 11-16'),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO factors are important when starting a business?', ['fix realistic prices', "create products better than the competitors'", 'be committed', 'pay attention to detail', 'apply complete strategy'], ['C', 'D'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO kinds of support are important for Arthur?', ['family support', 'good business advice with new ideas', 'support of the bank loan', "friends' support", 'governmental funding'], ['A', 'C'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Khi nói về nỗi sợ mắc lỗi.', t: ['Mistakes can actually show you where you need to improve, so you can take actions about them and use the chance to learn new methods.', 'This is a very important attitude you should have.'], p: 'Lỗi rất phổ biến chỉ là nhận xét (bẫy A); thái độ quan trọng là xem lỗi là cơ hội học hỏi → B' },
        12: { v: 'Khi nói về sự tự tin.', t: ['Self-confidence can be gained through hard work, even playing sports.', 'However, sometimes self-confidence may make you ignore problems and even cause failure.'], p: 'Tự tin có được nhờ làm việc chăm chỉ, chơi thể thao – không phải đọc sách (bẫy C); đôi khi tự tin gây thất bại → A' },
        13: { v: 'Khi khuyên người mới khởi nghiệp.', t: ['They read business journals or watch related videos, but these don\'t seem to help sometimes.', 'My suggestion is that, instead of aimlessly trying many new things, they should always be committed to their goal.'], p: 'Đọc tạp chí không giúp ích, thử nhiều thứ mới bị phản đối (bẫy A, B); nên kiên định với mục tiêu → C' },
        14: { v: 'Khi kể về khó khăn với marketing.', t: ['I had a problem with marketing earlier this year.', 'Luckily, I found an expert to help me deal with it.'], p: 'Tìm một chuyên gia giúp giải quyết → B' },
        15: { v: 'Khi nói về phong cách lãnh đạo.', t: ['Some are very good at public speaking, others are very down-to-earth and have strong executive skills.', 'But in general, they should be able to win the respect from their employees so that they can carry out their orders more easily.'], p: 'Nói trước đám đông chỉ là phong cách của một số người (bẫy A); điểm chung là được nhân viên tôn trọng → C' },
        16: { v: 'Khi nói về rủi ro.', t: ["During such times, leaders will need to take prompt actions and they can't always plan for the distant future.", 'Leaders should analyse and deal with the risks with caution.'], p: 'Không thể lúc nào cũng tính chuyện lâu dài (bẫy C); phải xử lý rủi ro một cách thận trọng → A' },
        17: { v: 'Khi nói về những gì đã thử khi khởi nghiệp.', t: ["However, prices are always changing, so they can't be fixed.", 'Another thing I always keep in mind is that leaders must stay committed to their jobs.'], p: 'Giá không cố định được (A sai); lãnh đạo phải luôn tận tâm với công việc → C' },
        18: { v: 'Như câu 17 (chọn 2 đáp án).', t: ["I can't always be sure that my products or services are better than my competitors', but I pay attention to details and try to improve all the little things", "Personally, I don't think it's a problem, because you will be changing them all the time anyway."], p: 'Không chắc sản phẩm tốt hơn đối thủ (B sai), chiến lược hoàn chỉnh không cần thiết (E sai); chú ý đến chi tiết → D' },
        19: { v: 'Khi nói về sự hỗ trợ.', t: ['Before I started my business, my family helped me a lot, both financially and mentally.', "However, these advice and ideas were not so practical to me, so I didn't really use them."], p: 'Lời khuyên không thực tế nên không dùng (B sai); gia đình giúp đỡ rất nhiều → A' },
        20: { v: 'Như câu 19 (chọn 2 đáp án).', t: ['Also, I was short of funds back then, and I loaned money from the bank to start my company.', 'I was grateful for that.'], p: 'Vay tiền ngân hàng để mở công ty và rất biết ơn → khoản vay ngân hàng → C' },
      },
    },
    {
      part: 3, title: 'Dolphin Presentation', audio: 'Listening/Test 1/P3.mp3', cover: 'dolphins swimming ocean | dolphin pod new zealand',
      transcript: `
Fran:
Hi, Mark.
Thanks for coming around.
Mark:
Hi, Fran.
No problem.
We need to try and get this presentation finished.
Fran:
Mark, let's start with the way dolphins make sounds.
Mark:
Well, we all know that dolphins make clicking noises to communicate.
Fran:
Yes, they have tongues and larynxes, as humans do.
But what's really strange about the dolphin is that the sounds are focused through an extraordinary organ called the melon, which most other sea mammals don't have.
Mark:
So shall I take over from there and speak about the different dolphin types?
I want to share what we found out about those rare dolphins that are special just to New Zealand in particular.
Fran:
Yeah, great.
Put the emphasis on them.
The rarest of all is the Hector's dolphin, isn't it?
They are endangered, aren't they?
I think that's mainly because so many of them get tangled up in fishing gear, especially gillnets, and die.
I know that some conservationists are worried about the impact of the tourism industry on dolphin numbers, but I don't think that's a problem yet here.
Also, remember that this species has a very long reproductive cycle, so their numbers don't get replenished quickly.
Mark:
Yeah, that's really sad.
But at least the New Zealand government established a sanctuary for them, didn't it?
The fishing industry was against it, but I remember reading that the general public were very supportive of the decision.
It was a consequence of a study done by some marine biologists.
Having a protected breeding area has made a big difference to the dolphin population already.
Fran:
Yeah, I think their numbers have swelled to over 7,000 in total, with a tiny group of just 89 living down off Southland, nearly 2,000 living near Christchurch on the east coast, and the biggest group surviving off the west coast.
It's pretty wild country over there, so I guess there aren't as many tourists and fishermen to disturb them.
Mark:
OK, so how do you suggest I structure my part of the talk?
Fran:
Well, you could start with the common dolphin, which inhabits the whole of the sea around New Zealand.
And once you've covered everything to do with them, feeding and so on, you could go on to the more unusual types.
The dusky dolphin is especially interesting because you know how all the dolphins travel in small social groups called pods?
Well, the dusky dolphins travel in pods as big as 800 members.
Mark:
And I think the duskies like to travel along beside fishing and tourist boats, don't they?
Whereas the Hector's dolphins are different in that they prefer to go in the wake of boats, that is, coming along in the rear.
Fran:
Yeah, they do.
But they also dive down deep to avoid fast boats.
Mark:
Oh, let's not forget the Maui, because they are endangered too, aren't they?
There are only 150 of them left, and they inhabit only the western coastal waters off the North Island of New Zealand.
Fran:
Yeah, it's a pity.
They also face problems because of their tiny size.
Hmm.
Now, the orca is actually a dolphin too, right?
Mark:
Yes, surprisingly.
So I'll include that in my talk.
People call them killer whales, but in fact they're not whales.
They're a huge and very fierce type of dolphin.
In New Zealand, Kaikoura in the South Island is the best place to spot orcas swimming by, so people mistakenly think that's where they live.
But actually, orcas cover vast distances.
Fran:
Let's not forget to mention the bottlenose.
It's bigger than nearly all the other dolphins, even the common dolphin.
Mark:
Oh, but still not as big as the orca, right?
Fran:
That's right.
Well, I think that's our presentation done now.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nDolphin presentation', [
          [21, "What is the students' purpose in mentioning the way dolphins make sounds?", ['to show comparison with human speech', "to show the unusual anatomy of a dolphin's head", 'to show recent developments in understanding the meaning of the sounds'], 'B'],
          [22, "According to Fran, Hector's dolphins are unaffected by", ['tourist numbers.', 'the threat from fishing nets.', 'their slow breeding rate.'], 'A'],
          [23, 'The New Zealand Government set up a marine sanctuary', ['because of public pressure.', 'as a result of scientific research.', 'to protect a dolphin feeding ground.'], 'B'],
          [24, "Where is the largest population of Hector's dolphins in New Zealand?", ['the east coast', 'Southland', 'the west coast'], 'C'],
        ], 'Questions 21-24'),
        matching('Which special characteristic does each of the following types of dolphin have?\nWrite the correct letter, A-H, next to Questions 25-30.',
          ['swim along behind boats', 'swim in unusually large groups', "live along New Zealand's entire coastline", 'swim beneath slow-moving boats', 'tend to be solitary', "live only off New Zealand's northwest coast", 'are the second largest dolphin species in New Zealand', 'are seen mostly in Kaikoura'], [
            [25, 'Common dolphins', 'C'],
            [26, 'Dusky dolphins', 'B'],
            [27, "Hector's dolphins", 'A'],
            [28, "Maui's dolphins", 'F'],
            [29, 'Orcas', 'H'],
            [30, 'Bottle-nose dolphins', 'G'],
          ], { title: 'Special characteristics', groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi bắt đầu nói về cách cá heo phát ra âm thanh.', t: ['Yes, they have tongues and larynxes, as humans do.', "But what's really strange about the dolphin is that the sounds are focused through an extraordinary organ called the melon, which most other sea mammals don't have."], p: 'Điểm giống người chỉ là ý phụ (bẫy A); trọng tâm là cơ quan “melon” kỳ lạ ở đầu cá heo → giải phẫu khác thường → B' },
        22: { v: "Khi Fran nói về cá heo Hector's.", t: ['I think that\'s mainly because so many of them get tangled up in fishing gear, especially gillnets, and die.', "I know that some conservationists are worried about the impact of the tourism industry on dolphin numbers, but I don't think that's a problem yet here."], p: 'Lưới đánh cá và chu kỳ sinh sản dài đều là mối đe doạ; du lịch “chưa phải vấn đề” → không bị ảnh hưởng bởi số khách du lịch → A' },
        23: { v: 'Khi nói về khu bảo tồn của chính phủ.', t: ['The fishing industry was against it, but I remember reading that the general public were very supportive of the decision.', 'It was a consequence of a study done by some marine biologists.'], p: 'Công chúng chỉ ủng hộ (bẫy A); khu bảo tồn là kết quả của một nghiên cứu của các nhà sinh vật biển → B' },
        24: { v: "Khi nói số lượng cá heo Hector's.", t: 'with a tiny group of just 89 living down off Southland, nearly 2,000 living near Christchurch on the east coast, and the biggest group surviving off the west coast.', p: 'Southland 89 con, bờ đông gần 2.000 con; nhóm lớn nhất ở bờ tây → C' },
        25: { v: 'Khi Fran gợi ý mở đầu bằng cá heo thường.', t: 'Well, you could start with the common dolphin, which inhabits the whole of the sea around New Zealand.', p: 'Sống ở toàn bộ vùng biển quanh New Zealand → dọc toàn bộ bờ biển → C' },
        26: { v: 'Khi nói về cá heo dusky.', t: ['The dusky dolphin is especially interesting because you know how all the dolphins travel in small social groups called pods?', 'Well, the dusky dolphins travel in pods as big as 800 members.'], p: 'Đàn tới 800 con, khác hẳn các đàn nhỏ thường thấy → nhóm lớn bất thường → B' },
        27: { v: "Khi Mark so sánh cá heo Hector's với dusky.", t: "Whereas the Hector's dolphins are different in that they prefer to go in the wake of boats, that is, coming along in the rear.", p: '“In the wake of boats … coming along in the rear” = bơi theo phía sau tàu → A' },
        28: { v: 'Khi nói về cá heo Maui.', t: 'There are only 150 of them left, and they inhabit only the western coastal waters off the North Island of New Zealand.', p: 'Chỉ sống ở vùng biển phía tây của Đảo Bắc → chỉ ở bờ tây bắc New Zealand → F' },
        29: { v: 'Khi nói về cá voi sát thủ (orca).', t: ["In New Zealand, Kaikoura in the South Island is the best place to spot orcas swimming by, so people mistakenly think that's where they live.", 'But actually, orcas cover vast distances.'], p: 'Kaikoura là nơi dễ nhìn thấy orca nhất → thường được thấy ở Kaikoura → H' },
        30: { v: 'Cuối bài, về cá heo mũi chai.', t: ["It's bigger than nearly all the other dolphins, even the common dolphin.", 'Oh, but still not as big as the orca, right?', "That's right."], p: 'Lớn hơn mọi loài khác trừ orca → lớn thứ hai → G' },
      },
    },
    {
      part: 4, title: 'Recycling Tyres in Australia', audio: 'Listening/Test 1/P4.mp3', clip: [0, 434], cover: 'old tyres recycling pile | scrap tires',
      transcript: `
Good afternoon.
I'm the Managing Director of Molectra Technologies, and we're involved in recycling tyres from vehicles such as cars and trucks.
This might not sound new or exciting, but the method we use is quite radical compared to traditional tyre recycling methods.
We strongly believe that the business of recycling tyres is crucial, as amazingly, every month in Australia alone, the number of old tyres that are discarded exceeds 1.5 million.
And when you look at the figure globally, it is a staggering 1.2 billion each year.
For decades, various recycling methods have been trialled with varying degrees of success.
In some cases, the solution was as bad as the problem.
Incinerating tyres, for example, generates toxic fumes which are harmful to the environment.
Breaking up whole tyres is energy intensive and produces a contaminated product with very little value.
As a result, there was little incentive to get into the business because there was no profit in it.
And yet, a tyre is made up of so many valuable components, and it is for this reason that we started trying out new recycling methods.
In the end, our factory came up with a much improved system for recycling old tyres.
The Molectra process is different for a number of reasons.
Firstly, it is a lot cheaper to run because our machines are much more compact in comparison to traditional systems.
This, in turn, reduces energy consumption.
The wear and tear on the shredding equipment, which cuts up the tyres, is also reduced, as the tyres fed through them have already been softened.
Costs are reduced by over 30% using our system.
And, significantly, our machines can handle a tyre of any size, from the smallest bicycle or wheelbarrow right up to the largest earth-moving truck.
Most other processes can only handle car tyres.
Our technology has proven to work, and we have won many awards, including the Australian Museum's Eureka Award, and last year on a national TV programme, we were chosen as the invention of the year.
Winning that certainly opened many doors for us, with interest coming from 27 countries around the world, including the United States and China.
To cope with the demand, we will soon have 10 more factories which will operate 24 hours a day just to stabilise the current stockpile.
We are passionate about taking this process further, and so we have chosen to dedicate 5% of every dollar we make to research.
In this way, we can ensure we are always the best in the business.
So, let's look at the process we use, what we extract from the tyre in each stage of the process, and the uses that those materials can be put to.
The first step of the process mechanically extracts the steel wires from the rim of the tyre.
This high-quality wire can be cut into small pellets suitable for sandblasting shots.
Next, after the tyres have been sliced into a number of segments depending on tyre diameter, they are chemically treated.
This chemical treatment is essential as it removes dirt from the rubber prior to the rest of the process.
The cleaning process also softens the tyres, making them easier to chop up.
In the next stage, the fibre cords contained in the tyre segments are separated from the rubber using rollers.
The fibres, which can include nylon and rayon, can be used as a reinforcement for concrete, or they can be used to form plastic panels.
Then, the rubber is cut up into very small pieces known as crumb rubber.
For a tyre weighing 10 kilograms, Molectra can recover 7.5 kilograms of crumb rubber that can be used to manufacture a range of rubber products, such as asphalt, used in road making.
It is also used as insulation in buildings, or something simple like tiles for the floor.
Alternatively, any or all of this crumb rubber can continue through to the final stage.
This final stage involves our patented MolectraVac machine, which uses industrial microwave energy.
This changes the remaining rubber into hydrocarbon, which can be used to make three different products.
We can cheaply produce activated carbon, which is usually quite expensive to make from new materials.
It's used for treating water, as well as being an integral part of air filters.
Secondly, as the carbon produced is very pure, in fact it's over 97.4% pure, we can crush it to form something called carbon black, which is used in the manufacture of batteries and also ink.
Our process is very flexible, and we can alter the quantity of each of the three products depending on demand.
Finally, we can even use the hydrocarbon to make oil.
And we use this to generate electricity to power our own machines.
It certainly helps to keep the costs down.
And that's just about it.
So if there are any questions...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Recycling Tyres in Australia', [
          '<strong>Background</strong>',
          'More than 1.5 million tyres dumped in Australia per __Q31__',
          'Previous recycling attempts failed because:',
          '• there were pollution problems – smoke from burning',
          "• recycling companies didn't make any __Q32__",
          "<strong>Advantages of Molectra's process</strong>",
          '• More economical because smaller machines are used',
          '• Less maintenance – tyres softened before shredding',
          '• No limit on the __Q33__ of tyres recycled',
          '<strong>The Future</strong>',
          '• Ten more factories being built',
          '• Plans to spend 5% of income each year on __Q34__',
        ], { 31: 'month', 32: 'profit', 33: 'size', 34: 'research' }, 'Questions 31-34'),
        note('Complete the flow-chart below.\nWrite ONE WORD ONLY for each answer.', 'Recycling Tyres', [
          '<strong>Process → Possible uses</strong>',
          'Removal of steel __Q35__ from tyre rim → steel pellets used in industry',
          '↓',
          'Chemicals applied to get rid of __Q36__ and soften rubber',
          '↓',
          'Fibres, e.g. nylon, removed → strengthening concrete; sheets made of __Q37__',
          '↓',
          'Tyres cut up into crumb rubber → asphalt for roads; insulation; __Q38__ tiles',
          '↓',
          'The MolectraVac machine microwaves rubber into hydrocarbon →',
          'i) used for activated carbon: __Q39__ treatment; air filtration',
          'ii) used for carbon black: batteries; __Q40__',
          'iii) oil used for electricity',
        ], { 35: 'wires/wire', 36: 'dirt', 37: 'plastic', 38: 'floor', 39: 'water', 40: 'ink' }, 'Questions 35-40'),
      ],
      expl: {
        31: { v: 'Phần mở đầu, về số lốp xe bị thải bỏ.', t: ['every month in Australia alone, the number of old tyres that are discarded exceeds 1.5 million.', 'And when you look at the figure globally, it is a staggering 1.2 billion each year.'], p: '“Each year” là con số toàn cầu (bẫy); ở Úc là hơn 1,5 triệu mỗi tháng → month' },
        32: { v: 'Khi nói vì sao các cách tái chế cũ thất bại.', t: 'As a result, there was little incentive to get into the business because there was no profit in it.', p: 'Không có lợi nhuận nên chẳng ai muốn làm → profit' },
        33: { v: 'Khi nói ưu điểm của quy trình Molectra.', t: ['And, significantly, our machines can handle a tyre of any size, from the smallest bicycle or wheelbarrow right up to the largest earth-moving truck.', 'Most other processes can only handle car tyres.'], p: 'Xử lý được lốp mọi kích cỡ → không giới hạn kích cỡ → size' },
        34: { v: 'Khi nói kế hoạch tương lai.', t: 'We are passionate about taking this process further, and so we have chosen to dedicate 5% of every dollar we make to research.', p: '5% mỗi đồng kiếm được dành cho nghiên cứu → research' },
        35: { v: 'Bước đầu tiên của quy trình.', t: 'The first step of the process mechanically extracts the steel wires from the rim of the tyre.', p: 'Tách dây thép khỏi vành lốp → wires' },
        36: { v: 'Bước xử lý hoá chất.', t: 'This chemical treatment is essential as it removes dirt from the rubber prior to the rest of the process.', p: 'Hoá chất loại bỏ bụi bẩn khỏi cao su → dirt' },
        37: { v: 'Bước tách sợi.', t: 'The fibres, which can include nylon and rayon, can be used as a reinforcement for concrete, or they can be used to form plastic panels.', p: 'Gia cố bê tông (đã có trên đề) hoặc làm tấm nhựa → plastic' },
        38: { v: 'Khi nói công dụng của cao su vụn.', t: 'It is also used as insulation in buildings, or something simple like tiles for the floor.', p: 'Gạch lát sàn → floor tiles → floor' },
        39: { v: 'Bước cuối, về than hoạt tính.', t: "It's used for treating water, as well as being an integral part of air filters.", p: 'Dùng để xử lý nước (lọc không khí đã có trên đề) → water treatment → water' },
        40: { v: 'Khi nói về muội than (carbon black).', t: 'we can crush it to form something called carbon black, which is used in the manufacture of batteries and also ink.', p: 'Dùng sản xuất pin (đã có trên đề) và mực → ink' },
      },
    },
  ],
};
