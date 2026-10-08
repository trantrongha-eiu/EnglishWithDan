// Vol 4 – Test 10 (PDF "listening/test 10/listening- up.pdf" p1–6; key xlsx sheet Test 10; audio test 10/0N Track N (…).wma —
// Track 1 clipped from "Now turn to Section 1", Track 4 cut after "half a minute to check" (10-minute silence follows)).
// Transcript: Whisper + Otter (01-Track-1-_11_.pdf, 02-Track-2-_11_.pdf, Track 3.pdf, 04-Track-4-_11_ - Part.pdf) written
// out with turns; gaps re-heard with wb.js. P1: the example (played first) is dropped. Paper typos in the Q27–30 box
// ("regular sleeping pat", "weight red") restored.
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 4, test: 10,
  sections: [
    {
      part: 1, title: 'Second-hand Cars', audio: 'listening/test 10/01 Track 1 (11).wma', clip: [41.7, 448], cover: 'used car dealership | second hand cars lot',
      transcript: `
Salesman:
Hello.
Customer:
I heard your advert on the radio about the sale you're having, and I wanted to find out about your cars.
Salesman:
Well, you've called the right place.
So, how much do you want to spend?
Customer:
I'd like to spend about $4,000, but definitely no more than $4,300.
Salesman:
OK.
For that price, we've got some nice cars.
I've got a lovely Noda.
Do you know that model?
Customer:
Yes.
What colour is it?
I know it sounds unimportant, but there are certain colours I don't want.
Salesman:
Well, this one is silver.
Customer:
That's good, because I don't want a dark colour, like black, as they get too hot in summer.
So is it in good condition?
Salesman:
It's just had a state-of-the-art stereo put in, and although one light is damaged, we'd repair that for you if you decided to buy it.
Customer:
Oh, that's good of you.
Salesman:
I've also got a Comina.
It's a white one.
It's slightly more expensive than the Noda, but it's a good car.
I know it quite well, because it was owned by our manager here, so I used to get to drive it quite a bit.
Customer:
The Comina is OK, but it's a little on the big side.
Salesman:
Well, how about a Telsta?
They're smaller, but not too small.
We've got an orange one of those.
Actually, what kind of model were you after?
This one's an automatic.
Customer:
Great.
They are so much easier to drive than the manual model, although I'm fine with either.
Salesman:
And another good feature is that the previous owner only replaced its tyres last month.
Customer:
That will save some money, and anything to do with the wheels is so important for safety.
It might be worth a look.
Salesman:
OK.
Now, let's look at what else we've got in your price range.
How about an Abrada?
It's a red one.
It's the newest of the cars for sale in your bracket.
Customer:
How old is it?
I doubt I could afford anything less than ten years old.
Salesman:
Well, you might be surprised.
There was only one previous owner, and they had it eight years.
All the others are at least nine years old.
Customer:
Hmm.
Now that's a possibility.
OK.
Well, I'm interested in a couple of those.
Could I come and take a look at them?
Salesman:
Sure.
We're open seven days a week.
Do you know where we are?
Customer:
I think so.
You're on Station Road in Mitchell, right?
I usually go past your place when I'm on the bus.
Salesman:
That's right.
You can't miss us.
What day would suit you?
Don't leave it too long, as these cars are likely to go quickly at these prices.
Customer:
Well, I couldn't get there before Wednesday, and even that might be pushing it.
Salesman:
How does Thursday sound?
Customer:
Sounds good.
Salesman:
I usually don't work then or Fridays, but I am this week.
Customer:
That's good.
I'd prefer to deal with you.
Salesman:
OK, so would 9.30 in the morning be OK?
Customer:
No worries.
Salesman:
When you arrive, ask for Gerald Smith.
That's G-E-R-A-L-D.
Customer:
OK.
Salesman:
Now, will you be coming by car or public transport?
Customer:
I'll probably come with my dad in his car.
He knows all about this sort of thing.
Salesman:
Well, you should be able to park at the supermarket.
Parking can be a bit hard with all the businesses around here and all our cars out the front.
Customer:
Great.
Now, is there anything I need to bring with me?
Salesman:
Hmm.
Let me think.
If you want to take the car for a test drive, you'll need to have identification with you.
I mean, otherwise you could just drive off in it and never come back.
Customer:
OK, that's easy.
Salesman:
Perfect.
See you later this week.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Second-hand Cars', [
          'Example – Maximum price: $4300',
          '<strong>Cars available</strong>',
          '<em>Noda</em> (silver)',
          '• One __Q1__ is broken',
          '<em>Comina</em> (white)',
          '• Used to belong to the __Q2__',
          '<em>Telsta</em> (orange)',
          "• It's an __Q3__ model",
          '• Has got new __Q4__',
          '<em>Abrada</em> (red)',
          '• Only __Q5__ years old',
          '<strong>Other information</strong>',
          'Garage address: __Q6__ Road, Mitchell',
          'Day/Time: on __Q7__ at 9.30 am',
          'Ask for: __Q8__ Smith',
          'Parking available: outside the __Q9__',
          'What to bring: __Q10__ (for a test drive)',
        ], { 1: 'light', 2: 'manager', 3: 'automatic', 4: 'tyres/tires', 5: '8/eight', 6: 'Station', 7: 'Thursday', 8: 'Gerald', 9: 'supermarket', 10: 'identification/ID' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nói về xe Noda màu bạc.', t: "It's just had a state-of-the-art stereo put in, and although one light is damaged, we'd repair that for you if you decided to buy it.", p: 'Dàn âm thanh mới lắp (bẫy); một chiếc đèn bị hỏng → light' },
        2: { v: 'Khi nói về xe Comina màu trắng.', t: 'I know it quite well, because it was owned by our manager here, so I used to get to drive it quite a bit.', p: 'Xe từng thuộc về người quản lý → manager' },
        3: { v: 'Khi nói về xe Telsta màu cam.', t: ['Actually, what kind of model were you after?', "This one's an automatic."], p: 'Đây là mẫu số tự động; xe số sàn chỉ được so sánh (bẫy) → automatic' },
        4: { v: 'Ngay sau đó.', t: 'And another good feature is that the previous owner only replaced its tyres last month.', p: 'Chủ cũ vừa thay lốp tháng trước → có lốp mới → tyres' },
        5: { v: 'Khi nói về xe Abrada màu đỏ.', t: ['There was only one previous owner, and they had it eight years.', 'All the others are at least nine years old.'], p: '10 năm là mức khách nghĩ mình mua được, 9 năm là các xe khác (bẫy); Abrada chỉ 8 năm tuổi → 8' },
        6: { v: 'Khi hỏi địa chỉ cửa hàng.', t: "You're on Station Road in Mitchell, right?", p: 'Địa chỉ ở đường Station, Mitchell → Station' },
        7: { v: 'Khi hẹn ngày đến xem xe.', t: ["Well, I couldn't get there before Wednesday, and even that might be pushing it.", 'How does Thursday sound?', 'Sounds good.'], p: 'Thứ Tư có thể không kịp (bẫy); chốt thứ Năm → Thursday' },
        8: { v: 'Khi dặn hỏi gặp ai.', t: ['When you arrive, ask for Gerald Smith.', "That's G-E-R-A-L-D."], p: 'Tên được đánh vần G-E-R-A-L-D → Gerald' },
        9: { v: 'Khi nói chỗ đỗ xe.', t: 'Well, you should be able to park at the supermarket.', p: 'Đỗ xe ở siêu thị (trước cửa hàng chật vì nhiều xe) → supermarket' },
        10: { v: 'Cuối bài, những gì cần mang theo.', t: "If you want to take the car for a test drive, you'll need to have identification with you.", p: 'Muốn lái thử phải mang giấy tờ tuỳ thân → identification' },
      },
    },
    {
      part: 2, title: 'The Middletown Urban Farming Scheme', audio: 'listening/test 10/02 Track 2 (11).wma', cover: 'urban farming garden city | community vegetable garden',
      transcript: `
I'm Chris Butler, and I'm the chairperson of the Middletown Urban Farming Scheme, or MUFS for short, a highly successful programme which encourages city dwellers to grow their own fruit and vegetables, to become city farmers, if you will.
Who started MUFS?
Well, the idea of urban farming has been around for quite a while, particularly among town planners.
But it was actually a group of Middletown business people, including myself, who decided to create what became MUFS.
University agriculture specialists got involved later.
Now, initially, the aim was not some eco-friendly goal of reducing CO2 emissions caused by the transport of food from farm to dinner plate.
It was simply to maximise the utilisation of the vacant or idle land that lies within the city.
Of course, later, we realised that an additional benefit might be a healthier diet for local people.
Let me tell you a bit about the groups that have joined the scheme.
We've got any number of schools involved, and loads of corporate employees, so our message seems to have been well received there.
But for next year, we're going to concentrate on getting various community centres, like those for senior citizens, to join, because so far they've been somewhat slow to take up the scheme.
Now, the core committee of the MUFS is a group of dedicated gardeners.
They probably won't be familiar with your specific plot of land.
They're mostly amateurs, but they are the people who know the ins and outs of gardening, and they'll be happy to sit down with any MUFS member and make some hands-on suggestions about gardening.
But don't expect them to know the answers to technical questions, like the Latin names of plants.
The MUFS are keen to support members who are physically disabled.
We're looking at the possibility of providing specially adapted gardening tools on loan to members who can't cope with regular tools.
That's not happening yet.
But we do have some window boxes, as well as larger containers, which we can distribute free of charge to these members, although they will have to provide their own soil and compost themselves.
I'm especially proud of the work we've done with the local schools, both grade school level and high schools.
The teachers say that they knew the scheme would be of some practical use in science classes, like biology.
Despite the original hopes of some, the fruit and vegetable plots haven't provided cheaper lunches for their students.
But what they didn't anticipate was the change in attitude that the scheme has created amongst their students.
They say the students have become much more conscious of their surrounding environment.
They want to keep it neat and tidy.
Now, a number of local organisations and businesses provide our members with free goods and services.
Let me go through some of them.
The city hospital, as you might expect, has to provide thousands of meals for its patients.
So the manager of its kitchen runs a course for our members on how to use vegetables in a huge variety of dishes.
The local government found it had a large glass building, which the Parks Department used to start off flower seeds and young plants during the winter, and they agreed to allow our members to use this free of charge to get their own little seedlings off to a good start.
Another thing.
The university has agreed that if members send them a sample of their soil, they will do a series of tests on it to indicate what kind of plants will grow best, and what types of fertiliser and nutrients would be best to use.
And just to make sure our members know what's good for them, a supermarket is offering a series of classes on how to lose weight and stay healthy by having a sensible diet.
Now, let's talk about the practicalities.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'Who founded the Middletown Urban Farming Scheme?', ['university specialists', 'business people', 'town planners'], 'B'],
          [12, 'What was the original reason for starting the MUFS?', ['to encourage more efficient land use', 'to help lessen CO2 emissions', "to improve people's eating habits"], 'A'],
          [13, 'For the coming year, the MUFS will focus on recruiting members from', ['schools.', 'companies.', 'community centres.'], 'C'],
          [14, 'What kind of information is available from members of the MUFS committee?', ['practical gardening tips', 'plant science', 'location of local garden sites'], 'A'],
          [15, 'What are provided by the MUFS for the physically disabled?', ['soil and compost', 'containers for plants', 'gardening tools'], 'B'],
          [16, 'According to school teachers, what has been an unexpected advantage of the MUFS?', ['its usefulness as an aid for teaching science', 'its contribution to reducing costs of school meals', 'its help in encouraging community pride among students'], 'C'],
        ], 'Questions 11-16'),
        matching('What free goods or services are offered by each of the following providers?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 17-20.',
          ['fertilisers', 'cooking lessons', 'advice on soil', 'eat-to-keep-fit course', 'use of a greenhouse', 'market stalls'], [
            [17, 'city hospital', 'B'],
            [18, 'local government', 'E'],
            [19, 'university', 'C'],
            [20, 'supermarket', 'D'],
          ], { title: 'Free goods or services', groupTitle: 'Questions 17-20' }),
      ],
      expl: {
        11: { v: 'Khi nói ai sáng lập MUFS.', t: ['But it was actually a group of Middletown business people, including myself, who decided to create what became MUFS.', 'University agriculture specialists got involved later.'], p: 'Ý tưởng phổ biến với nhà quy hoạch, chuyên gia đại học tham gia sau (bẫy); người lập ra là doanh nhân → B' },
        12: { v: 'Khi nói mục đích ban đầu.', t: ['Now, initially, the aim was not some eco-friendly goal of reducing CO2 emissions caused by the transport of food from farm to dinner plate.', 'It was simply to maximise the utilisation of the vacant or idle land that lies within the city.'], p: 'Không phải giảm CO2; ăn uống lành mạnh là lợi ích phát hiện sau; mục đích là tận dụng đất trống → A' },
        13: { v: 'Khi nói về kế hoạch năm tới.', t: "But for next year, we're going to concentrate on getting various community centres, like those for senior citizens, to join", p: 'Trường học, công ty đã tham gia nhiều; năm tới tập trung vào các trung tâm cộng đồng → C' },
        14: { v: 'Khi nói về ban điều hành.', t: ["and they'll be happy to sit down with any MUFS member and make some hands-on suggestions about gardening.", "But don't expect them to know the answers to technical questions, like the Latin names of plants."], p: 'Không rành câu hỏi kỹ thuật, không biết mảnh đất cụ thể; họ đưa lời khuyên làm vườn thực tế → A' },
        15: { v: 'Khi nói về hỗ trợ người khuyết tật.', t: ["That's not happening yet.", 'But we do have some window boxes, as well as larger containers, which we can distribute free of charge to these members, although they will have to provide their own soil and compost themselves.'], p: 'Dụng cụ chuyên dụng chưa có, đất và phân phải tự lo; MUFS phát chậu, thùng trồng cây → B' },
        16: { v: 'Khi nói về các trường học.', t: ["But what they didn't anticipate was the change in attitude that the scheme has created amongst their students.", 'They say the students have become much more conscious of their surrounding environment.'], p: 'Ích cho môn khoa học là điều đã biết, bữa trưa không rẻ hơn; điều bất ngờ là học sinh có ý thức giữ gìn môi trường xung quanh → C' },
        17: { v: 'Khi nói về bệnh viện thành phố.', t: 'So the manager of its kitchen runs a course for our members on how to use vegetables in a huge variety of dishes.', p: 'Quản lý bếp mở khoá dạy dùng rau củ nấu nhiều món → cooking lessons → B' },
        18: { v: 'Khi nói về chính quyền địa phương.', t: 'The local government found it had a large glass building, which the Parks Department used to start off flower seeds and young plants during the winter, and they agreed to allow our members to use this free of charge', p: '“A large glass building” để ươm cây = nhà kính → E' },
        19: { v: 'Khi nói về trường đại học.', t: 'The university has agreed that if members send them a sample of their soil, they will do a series of tests on it to indicate what kind of plants will grow best', p: 'Kiểm tra mẫu đất và tư vấn; phân bón chỉ được nhắc trong lời khuyên (bẫy A) → C' },
        20: { v: 'Cuối bài, siêu thị.', t: 'a supermarket is offering a series of classes on how to lose weight and stay healthy by having a sensible diet.', p: 'Lớp học giảm cân, giữ sức khoẻ bằng ăn uống hợp lý → eat-to-keep-fit course → D' },
      },
    },
    {
      part: 3, title: 'Walking and Creativity', audio: 'listening/test 10/03 Track 3 (13).wma', cover: 'walking in park thinking | hiking mountains',
      transcript: `
Katie:
Hi, Daniel.
Daniel:
Katie, you look as if you're off somewhere.
Katie:
Yes, I was just heading out for a walk.
Daniel:
Funny.
I was just reading an article about some research that's been done on the effects of walking on creativity.
Katie:
Sounds interesting.
Daniel:
I've always found walking helped me think, but this article confirms that everybody can benefit.
Katie:
Oh, tell me more.
Daniel:
OK, but I may even do some more research on it at some point, so don't pinch my idea.
Katie:
Promise.
Daniel:
Well, in the experiments, the researchers tested participants' creativity by comparing how many ideas they thought of while they were walking compared to while they were doing other activities.
Katie:
What, like listening to music?
Daniel:
Nothing like that.
But they did analyse the ideas participants came up with when sitting, both outdoors and inside.
What I found surprising was that they didn't compare walking to other forms of exercise, like running, for example.
Katie:
Right.
So what was the difference between the experiments?
Daniel:
Well, in each one, the activities were put together in different ways.
Several of the experiments specifically focused on the ability of participants to come up with new ideas.
Then the final experiment was a control test of sorts.
Katie:
Oh, right.
Daniel:
In one experiment, participants had to think of unusual uses for three everyday objects within a time limit.
Katie:
OK.
Daniel:
And then there was an experiment with words.
Katie:
What did they ask them to do?
Daniel:
Compare words in unusual ways.
For example, the word sweet.
If participants simply said sweet as sugar, that wasn't creative.
But an answer like sweet as a cat with honey on its paws was.
Katie:
OK.
I can see why they'd ask them to do that.
Daniel:
Really?
I just don't see how the experiment is fair.
Katie:
Why?
Because the conclusions are based only on the researcher's opinion?
Daniel:
I think it's more that anyone who'd studied language would be at an advantage.
Katie:
OK.
Was there an experiment about focused thinking?
Daniel:
Yeah, there was.
It aimed to find out if walking helped focused thinking.
Though I wasn't sure that I agreed with their findings.
They decided that walking doesn't help this type of thinking.
Katie:
What evidence did they have?
Daniel:
Well, that's it.
I don't think there was enough evidence to support their conclusions, even if their methods were sound.
Katie:
Well, I'd certainly hesitate before making such a bold statement.
Still, it's a first step, isn't it?
Daniel:
I suppose to move forward with this, they'll need to test other ways people keep fit, like swimming.
Katie:
That would be useful, but personally I'd like to know more about the fundamental reason for the effect on people's creativity.
Daniel:
That would be good.
Then it could be applied more widely in work, for example.
Katie:
Again, that's secondary, really.
But how would you test walking if you wanted to assess its physical benefits?
Daniel:
Well, firstly, I'd like to know more about the benefits of different situations.
Katie:
What about the effect of footwear?
Daniel:
Hadn't thought of that.
Katie:
Well, I've read that shoes with thinner soles were found to be better for people's joints.
It even made the skeletal structure tougher.
Daniel:
Interesting.
Was that because they lost weight?
Katie:
Not as far as I'm aware.
Daniel:
And then there's walking in the mountains.
Katie:
Walking in the mountains.
Hmm.
I think I've read something about that.
Doesn't altitude help people regulate their sleep patterns?
Daniel:
It's more that it improves your vision.
Katie:
It must be those breathtaking views.
Daniel:
Yeah.
And what about the effect that walking has for elderly people?
Katie:
Better balance, by any chance?
Daniel:
More than that.
It had a positive effect by helping them maintain their body clock's natural rhythm, both when going to bed and waking up.
Katie:
Right.
And what about the effect of walking long distances?
Daniel:
Well, a person needs to find the balance between their optimum speed and their natural breathing pattern.
Once they're synchronised, they can just keep on going for much longer periods than they could before.
Katie:
Mmm.
I can see how that would work.
But anyway...`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Daniel mentions the research about walking and creativity to Katie because', ['she has read it too.', 'what she says reminds him of it.', 'he thinks she might like to do similar research.'], 'B'],
          [22, "In the experiments, researchers compared participants' creativity when walking and when", ['sitting.', 'running.', 'listening to music.'], 'A'],
          [23, 'Daniel says that in each experiment, there was a different', ['type of control group.', 'pattern of activities.', 'way of selecting participants.'], 'B'],
          [24, 'Daniel thinks the experiment with words is', ['biased in favour of certain people.', 'a good indicator of creativity.', 'open to personal interpretation.'], 'A'],
          [25, "What is Katie and Daniel's attitude to the experiment on focused thinking?", ['They are doubtful about its aims.', 'They are confused by its methods.', 'They are cautious about its conclusions.'], 'C'],
          [26, 'Katie thinks that the best way forward is to consider', ['whether other types of exercise affect creativity.', 'the cause of the improvement in creativity.', 'how the results can be applied to creativity in real life.'], 'B'],
        ], 'Questions 21-26'),
        matching('What is the main physical benefit of each of the following walking situations?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 27-30.',
          ['improved balance', 'greater stamina', 'better eyesight', 'lower blood pressure', 'regular sleeping patterns', 'stronger bones', 'weight reduction'], [
            [27, 'walking with thin-soled footwear', 'F'],
            [28, 'walking in the mountains', 'C'],
            [29, 'walking for the elderly', 'E'],
            [30, 'walking long distances', 'B'],
          ], { title: 'Physical benefits', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài.', t: ['Yes, I was just heading out for a walk.', 'Funny.', "I was just reading an article about some research that's been done on the effects of walking on creativity."], p: 'Katie nói sắp đi dạo khiến Daniel nhớ tới bài báo về đi bộ; muốn tự nghiên cứu là ý của Daniel (bẫy C) → B' },
        22: { v: 'Khi Daniel kể về các thí nghiệm.', t: ['What, like listening to music?', 'Nothing like that.', 'But they did analyse the ideas participants came up with when sitting, both outdoors and inside.'], p: 'Không so với nghe nhạc, cũng không so với chạy; so sánh với lúc ngồi → A' },
        23: { v: 'Khi Katie hỏi sự khác nhau giữa các thí nghiệm.', t: 'Well, in each one, the activities were put together in different ways.', p: 'Mỗi thí nghiệm sắp xếp các hoạt động theo cách khác nhau → pattern of activities → B' },
        24: { v: 'Khi bàn thí nghiệm về từ ngữ.', t: ["I just don't see how the experiment is fair.", "I think it's more that anyone who'd studied language would be at an advantage."], p: '“Dựa vào ý kiến người nghiên cứu” là phỏng đoán của Katie (bẫy C); Daniel cho rằng người học ngôn ngữ được lợi → thiên vị một số người → A' },
        25: { v: 'Khi bàn thí nghiệm về tư duy tập trung.', t: ["I don't think there was enough evidence to support their conclusions, even if their methods were sound.", "Well, I'd certainly hesitate before making such a bold statement."], p: 'Phương pháp hợp lý (B sai); cả hai e dè với kết luận vì thiếu bằng chứng → C' },
        26: { v: 'Khi bàn hướng đi tiếp theo.', t: ["That would be useful, but personally I'd like to know more about the fundamental reason for the effect on people's creativity.", "Again, that's secondary, really."], p: 'Thử môn khác như bơi là ý Daniel (bẫy A), áp dụng vào công việc bị Katie cho là thứ yếu (C); Katie muốn biết nguyên nhân gốc rễ → B' },
        27: { v: 'Khi nói về giày đế mỏng.', t: ["Well, I've read that shoes with thinner soles were found to be better for people's joints.", 'It even made the skeletal structure tougher.', 'Not as far as I\'m aware.'], p: 'Hệ xương chắc khoẻ hơn; không phải do giảm cân (bẫy G) → stronger bones → F' },
        28: { v: 'Khi nói về đi bộ trên núi.', t: ['Doesn\'t altitude help people regulate their sleep patterns?', "It's more that it improves your vision."], p: 'Điều hoà giấc ngủ là phỏng đoán của Katie (bẫy E); thực ra cải thiện thị lực → C' },
        29: { v: 'Khi nói về người cao tuổi.', t: ['Better balance, by any chance?', 'More than that.', "It had a positive effect by helping them maintain their body clock's natural rhythm, both when going to bed and waking up."], p: 'Thăng bằng là phỏng đoán (bẫy A); giúp duy trì nhịp sinh học khi ngủ và thức → regular sleeping patterns → E' },
        30: { v: 'Cuối bài, đi bộ đường dài.', t: ["Once they're synchronised, they can just keep on going for much longer periods than they could before."], p: 'Đi được lâu hơn nhiều so với trước → sức bền tốt hơn → B' },
      },
    },
    {
      part: 4, title: 'Gamification', audio: 'listening/test 10/04 Track 4 (11).wma', clip: [0, 317], cover: 'game controller points badges | piano staircase',
      transcript: `
Today, we're going to look at how the phenomenon known as gamification has really exploded in recent years.
So, what exactly is gamification?
It has been defined as the use of games thinking and mechanics in non-game situations, such as for business.
Up to now, its most common function has been marketing.
It is extremely popular with big companies, but as we'll see, it also has many other uses.
Gamification techniques work on our natural desire for competition.
One way they do this is by providing a reward, for example, badges or points, or providing a type of virtual currency.
But don't be fooled into thinking the concept is a novel one.
Just think of the frequent flyer incentive schemes that were initiated by airlines to try and retain customers.
In fact, it's been around for years.
However, it has become more prolific with advances in technology.
So how is gamification being used?
Well, it is seen as an excellent way of obtaining almost instantaneous feedback through common social media sites.
However, there are other areas where it is increasingly being used, in particular as a means of trying to convince people through fun activities to alter their behaviour.
Another use is in education or training in the workplace, especially when it is just not feasible to train people on the real thing.
Good examples of this are the aircraft simulators used by pilots, or the urban simulators used by town planners.
So let's look at a few examples of the successful implementation of gamification.
One perhaps surprising use of gamification has been in official campaigns by governments and authorities, who have quickly seen its potential.
In Australia, the government developed a smartphone app called My Fit Buddy, whose aim was to help people get off the sofa and exercise.
The app provided plenty of motivational content to ensure people got the encouragement they needed to increase their levels of activity.
Overseas, in one city, instead of just punishing the drivers caught driving too fast, a local authority conducted a trial where they rewarded good drivers with free entries into a draw.
The trial was so successful that it resulted in a 22% reduction in speeding.
Gamification is also playing its part in helping people make healthy choices.
In an attempt to get commuters to walk instead of using the escalators in an underground station, the staircase next to it was transformed into a piano.
It had a touchpad underneath which played notes as people stepped on it.
When it was in use, almost everyone opted to use the stairs instead of the escalator.
Another example is a medical research company in Australia.
They realised the potential of gamification to help the elderly recover much more quickly from accidents.
When the elderly fall, the most common injury is not to the arm or the leg, but to the hand.
So they took an already popular computer game which involved people smashing fruit and adapted it so patients could practise their fine motor skills in a fun way.
Now, there are a number of things to consider when using gamification.
First of all, there is no way it can work unless it is fun.
In fact, without that element, it could have the complete opposite effect on the consumer.
In addition, as companies are often obtaining a lot more personal information and data on their customers this way, they should always be mindful of their legal obligations in terms of legislation relating to privacy.
So now, it's over to you to think of other examples of gamification that you might have come across.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Gamification', [
          '<strong>What is it?</strong>',
          '• The use of gaming techniques in non-game situations',
          '• In business, it is frequently used for __Q31__',
          "• Uses people's desire to win a reward",
          '• Not a new idea, e.g. incentive schemes were first used by __Q32__',
          '<strong>Uses</strong>',
          '• To get online __Q33__ quickly',
          '• To persuade people to change their __Q34__',
          '• For training purposes, e.g. simulators used by __Q35__ and town planners',
          '<strong>Successful examples</strong>',
          '<em>Official campaigns</em>',
          '– Australian government: to encourage people to __Q36__ more',
          '– overseas local authority: to reward drivers for not speeding',
          '<em>Health</em>',
          '– a staircase at a station that worked like a __Q37__',
          '– a game that helps recovery when old people hurt their __Q38__ in a fall',
          '<strong>Things to consider</strong>',
          "• It's important for gamification to be __Q39__",
          '• Need to think about the laws regarding __Q40__',
        ], { 31: 'marketing', 32: 'airlines/airline', 33: 'feedback', 34: 'behaviour/behavior', 35: 'pilots', 36: 'exercise', 37: 'piano', 38: 'hand/hands', 39: 'fun', 40: 'privacy' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần định nghĩa.', t: 'Up to now, its most common function has been marketing.', p: '“Most common function” = frequently used for → marketing' },
        32: { v: 'Khi nói đây không phải ý tưởng mới.', t: ["But don't be fooled into thinking the concept is a novel one.", 'Just think of the frequent flyer incentive schemes that were initiated by airlines to try and retain customers.'], p: 'Chương trình khách hàng thường xuyên do các hãng hàng không khởi xướng → airlines' },
        33: { v: 'Phần ứng dụng.', t: 'Well, it is seen as an excellent way of obtaining almost instantaneous feedback through common social media sites.', p: '“Almost instantaneous feedback through social media” = lấy phản hồi trực tuyến nhanh → feedback' },
        34: { v: 'Ngay sau đó.', t: 'in particular as a means of trying to convince people through fun activities to alter their behaviour.', p: '“Convince… to alter their behaviour” = persuade people to change their behaviour → behaviour' },
        35: { v: 'Khi nói về đào tạo.', t: 'Good examples of this are the aircraft simulators used by pilots, or the urban simulators used by town planners.', p: 'Mô phỏng máy bay dành cho phi công → pilots' },
        36: { v: 'Ví dụ chính phủ Úc.', t: 'In Australia, the government developed a smartphone app called My Fit Buddy, whose aim was to help people get off the sofa and exercise.', p: 'Ứng dụng khuyến khích mọi người rời sofa để tập thể dục → exercise' },
        37: { v: 'Ví dụ về sức khoẻ.', t: 'In an attempt to get commuters to walk instead of using the escalators in an underground station, the staircase next to it was transformed into a piano.', p: 'Cầu thang được biến thành cây đàn piano → piano' },
        38: { v: 'Ví dụ công ty nghiên cứu y khoa.', t: 'When the elderly fall, the most common injury is not to the arm or the leg, but to the hand.', p: 'Không phải tay hay chân mà là bàn tay → hand' },
        39: { v: 'Những điều cần cân nhắc.', t: 'First of all, there is no way it can work unless it is fun.', p: 'Chỉ hiệu quả khi vui → fun' },
        40: { v: 'Cuối bài.', t: 'they should always be mindful of their legal obligations in terms of legislation relating to privacy.', p: 'Nghĩa vụ pháp lý về luật quyền riêng tư → privacy' },
      },
    },
  ],
};
