// Vol 5 – Test 8 (PDF "Listening/Test 8/Test 8- up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p8; audio Test 8/P1 (2), P2 (2),
// P4 (3).mp3 — P1 clipped from "Now turn to part one" (the test introduction comes first)).
// P3 = bank "Music in Restaurants" (Vol 1 - Test 9 P3: same questions, same key 10/10).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns, wb.js for gaps) checked against
// "Transcripts & Keys/test 8- transcripts.pdf". P2: the island is "Moona" on the recording, "Muna" on the paper → paper;
// P1: the farm is "Lakeside Eco-farm" (once "Island Eco Farm" on the recording) → Lakeside.
const { note, table, mc } = require('../vol_build');

module.exports = {
  vol: 5, test: 8,
  sections: [
    {
      part: 1, title: 'Eco-farm Tour', audio: 'Listening/Test 8/P1 (2).mp3', clip: [30.5, 391], cover: 'eco farm log cabin forest | organic farm holiday',
      transcript: `
Mark:
Good afternoon.
Lakeside Eco-farm.
Mark speaking.
Helen:
Oh, good afternoon.
My name is Helen.
I was listening to a programme the other day and it said that you are a member of the Northern Hotel Group.
Mark:
Yes, that's correct.
Are you a member of the group?
Helen:
Yes, I am and I would like to find out about staying with you for a week during the school holidays.
Mark:
No problem, Helen.
May I have your full name?
Helen:
Helen Pennington.
That's P-E-N-N-I-N-G-T-O-N.
Mark:
Thank you, Helen.
And your email address?
Helen:
Helen123@email.com.
No dashes or underscores.
Oh, sorry, actually, it's probably better if I give you my work email address, which is more convenient for me.
That is helen123@greenfield.com and greenfield is one word.
Mark:
OK, and your home address?
Helen:
It is 66 Lake Road, Sheffield.
Mark:
May I ask where you heard about us?
You mentioned a programme.
Is it on TV or...?
Helen:
Actually, I heard about you on the radio and I thought it might be a good place to take my children during the summer holidays.
What kind of activities do you have?
Mark:
Well, here we have lodges in the woods, a couple of lakes, lots of activities and great food, so I'm sure your whole family will love it.
I can give you prices for all these, but first, could I have your membership number?
Helen:
Oh yes, I think it's UK765042GE, but I will just check.
It has been a while since I used it.
Just a moment.
Ah, actually it is UK765024EG.
Mark:
That's fine, thank you.
Helen:
Can you see my information on your system?
Mark:
Yes, I've found you.
So, regarding accommodation here at the eco-farm, for families, I recommend our family chalets, as they are large and suitable for both adults and children.
Helen:
Ah, OK, that sounds nice.
But a lodge is probably too big for us, and I don't think we have much time and energy for cleaning, so we would like to stay in a flat, preferably near the farm.
Mark:
I'm afraid there's no accommodation near the farm.
Would you want to be located near the lake?
It's got a great view.
Helen:
Actually, my daughter would prefer to stay in the forest if possible.
Mark:
That's fine.
We have some lovely log cabins with room for four people, which would suit your family.
Helen:
Yes, that's the kind of thing we want.
I hope you have a wide range of food available.
My husband is a meat eater, I like seafood and my children like organic food, including plenty of vegetables.
Mark:
Yes, we cater for all different types of diet, so you can get all of those preferences here, don't worry.
Helen:
Great.
So, what is the transport situation?
Can we get there by ferry or van, for instance?
Mark:
No, the best way is by train.
There's a regular service from Sheffield or there is a bike trail all the way here.
It generally takes about six hours to ride here from Sheffield.
Helen:
That sounds good, but it might be difficult with our luggage.
It's a pity you don't have vans or ferry boats.
But I think we will take the train.
So, what activities do you have there?
Mark:
We have a gardening course on planting flowers.
Would that be suitable?
Helen:
I was hoping for something a little more energetic to give us more exercise, a dance course, for example.
Mark:
Hmm, that is something guests requested in the past, but it's not something we are doing at the moment.
I will bear that in mind for the future, though.
Helen:
OK, that would be great.
I need to get back to work, so can you email me through the prices and all the details?
Mark:
Certainly.
I'll send all the details through to your work email address right now.
Helen:
Great, thank you.
Mark:
You're welcome, and we hope to see you here at Lakeside Eco-farm soon.
Helen:
Thanks, goodbye.`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Eco-farm Tour', [
          'Dates offered: 6-20 June',
          'Name: Helen __Q1__',
          'Email address: helen123@__Q2__.com',
          'Home address: __Q3__ Road, Sheffield',
          'Source of information: __Q4__',
          'Membership number: __Q5__',
        ], { 1: 'Pennington', 2: 'greenfield', 3: '66 Lake', 4: 'Radio/the radio', 5: 'UK765024EG' }, 'Questions 1-5'),
        table('Complete the table below.\nWrite ONE WORD ONLY for each answer.', ['', 'Recommendations', 'Customer preferences'], [
          ['Age', 'From 16 to 62', 'Children: 6 and 4'],
          ['Accommodation type', 'lodges', 'a __Q6__'],
          ['Accommodation location', 'Lakeside', 'Near the farm or in the __Q7__'],
          ['Food', 'A wide range of food', 'Meat, seafood, and __Q8__ food'],
          ['Transport', 'Train or __Q9__', 'Ferry and van'],
          ['Courses', 'Flower planting courses', 'Active courses (e.g. a __Q10__ course)'],
        ], { 6: 'flat', 7: 'forest', 8: 'organic', 9: 'bike/bicycle', 10: 'dance' }, 'Questions 6-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi họ tên.', t: ['Helen Pennington.', "That's P-E-N-N-I-N-G-T-O-N."], p: 'Họ được đánh vần P-E-N-N-I-N-G-T-O-N → Pennington' },
        2: { v: 'Khi hỏi email.', t: ["Oh, sorry, actually, it's probably better if I give you my work email address, which is more convenient for me.", 'That is helen123@greenfield.com and greenfield is one word.'], p: 'Email.com là địa chỉ cá nhân (bẫy); đổi sang email công việc → greenfield' },
        3: { v: 'Khi hỏi địa chỉ nhà.', t: 'It is 66 Lake Road, Sheffield.', p: 'Số nhà và tên đường → 66 Lake' },
        4: { v: 'Khi hỏi biết trang trại qua đâu.', t: ['Is it on TV or...?', 'Actually, I heard about you on the radio'], p: 'Không phải TV (bẫy); nghe qua đài phát thanh → Radio' },
        5: { v: 'Khi hỏi số thành viên.', t: ["Oh yes, I think it's UK765042GE, but I will just check.", 'Ah, actually it is UK765024EG.'], p: 'Số đầu tiên đọc sai (bẫy); sau khi kiểm tra là UK765024EG → UK765024EG' },
        6: { v: 'Khi bàn loại chỗ ở.', t: "But a lodge is probably too big for us, and I don't think we have much time and energy for cleaning, so we would like to stay in a flat, preferably near the farm.", p: 'Nhà gỗ quá rộng (bẫy); muốn ở căn hộ → flat' },
        7: { v: 'Khi bàn vị trí chỗ ở.', t: ['Would you want to be located near the lake?', 'Actually, my daughter would prefer to stay in the forest if possible.'], p: 'Gần hồ là gợi ý của Mark (bẫy); con gái muốn ở trong rừng → forest' },
        8: { v: 'Khi nói về đồ ăn.', t: 'My husband is a meat eater, I like seafood and my children like organic food, including plenty of vegetables.', p: 'Thịt, hải sản đã có trên đề; con thích đồ ăn hữu cơ → organic' },
        9: { v: 'Khi hỏi phương tiện đi lại.', t: ['No, the best way is by train.', "There's a regular service from Sheffield or there is a bike trail all the way here."], p: 'Đề xuất tàu hoả hoặc đạp xe theo đường mòn → bike' },
        10: { v: 'Khi hỏi các khoá học.', t: ['We have a gardening course on planting flowers.', 'I was hoping for something a little more energetic to give us more exercise, a dance course, for example.'], p: 'Khoá trồng hoa là đề xuất của trang trại; Helen muốn khoá vận động như khiêu vũ → dance' },
      },
    },
    {
      part: 2, title: 'Muna Island – Tips for Visitors', audio: 'Listening/Test 8/P2 (2).mp3', cover: 'island taxi street | tropical island bus',
      transcript: `
Hello everyone, I'm Hazel, the guide from Travel Light Agency.
Since we mentioned the trip to Muna Island in the last programme, we've received several online messages from those who have been there.
As a result, we've collected some helpful do's and don'ts for new visitors, which will hopefully help you to know the island better and enjoy your stay to the fullest.
The first suggestion is about tips.
Although tipping is required in most circumstances in Muna Island, the amount you should give differs significantly.
If you take a taxi, there is no set rate on how much you should leave to the driver.
Someone may give a generous tip if he thinks the service is fantastic.
It's up to you entirely.
However, if you go to the hairdresser or enjoy a meal in the restaurant and the bill comes with no service charge, a 10% tip is advisable.
Muna Island has got relatively good medical service.
If you get sick, the quickest way is to ask the hotel to arrange an English-speaking doctor for you.
But remember, it's not a complimentary service.
The other alternative is to visit the local clinic, and you have to prepare for the charge as well.
I should remind you that the medical service on the island can be pricey, so it's better to buy your insurance before you leave.
When you visit Muna Island, you'll see the notice nearly everywhere.
Tap water is safe to drink, but you might not get used to its weird taste because it contains minerals.
In this case, you can buy bottled water sold in every shop, but you'd better make sure the sealed lid is untouched, as the locals often put tap water into the bottle.
Then I'll focus on transportation in Muna Island.
The bus is the most commonly used means of transportation for local residents.
Although there aren't many bus lines, they're always on time.
However, some people complained that the road was so bumpy that they even got nausea and dizziness.
As a result, it's not a good choice if you want to sit peacefully and relax on the way.
And another thing is, before you jump on the bus, inquire of the driver about where the bus will go.
Unlike most cities, here in Muna Island, you cannot find the destination shown in front of the bus or at the bus stop.
Maybe you found the bus service is not so enjoyable.
In that case, you can always rent a car.
If you choose this way, I advise you to prepare well beforehand.
Although some taxi companies provide car rental services, many visitors sometimes find nobody answering the phone.
So leave this way when you are in a hurry.
It's wise to compare several car rental companies online beforehand, as the price may vary a lot.
Booking via hotel may be overcharged, as it contains a 10% commission, so it's also not advisable.
More importantly, don't forget to check with the company what the price covers in detail, like daily rental expenses, car insurance, commission, etc.
It usually includes unlimited mileage too, but fuel is excluded.
If you don't want to drive, a taxi is the quickest and most comfortable way, although few are available on Muna Island.
If you want to find a taxi quickly, it's not a good idea to reserve through the taxi company, as sometimes you'll have quite a wait, especially in the rush hour.
The easiest way is just waving your hands on the street to stop the taxi.
Otherwise, the driver will drive away directly after he drops off the guests.
Oh, another thing is, I have to remind you that there is no meter for taxis in Muna Island.
So before you jump in the taxi, you'd better negotiate with the driver about how much you're going to pay.
For example, if you take a taxi from the airport at night, it may cost you.
So confirm the price before you get in.
OK, that's all about the tips for Muna Island that I want to share today.
And are there any questions?`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nMuna Island', [
          [11, 'How much should visitors tip taxi drivers on the island?', ['as much as they feel right', 'no tip at all', '10% tip'], 'A'],
          [12, 'What is mentioned about the medical service on the island?', ['It will be charged.', 'Visitors should contact their insurance company.', 'Visitors have to find the hotel doctor.'], 'A'],
          [13, 'The tour guide says the tap water', ['contains no minerals.', 'is unsafe.', 'has an unusual taste.'], 'C'],
          [14, 'What point is made about bottled water?', ['It is expensive.', 'The bottle is not always sealed.', "It isn't sold everywhere."], 'B'],
          [15, 'What feature is mentioned about the bus on the island?', ['frequent', 'not punctual', 'not comfortable'], 'C'],
          [16, 'How can visitors know the destination of the bus on the island?', ['find it in front of the bus', 'check it with the driver', 'find it at the bus stop'], 'B'],
          [17, 'What does the tour guide advise visitors to do before renting a car?', ['find a taxi company', 'go to the hotel reception', 'compare the price in advance'], 'C'],
          [18, "When they rent a car, it's important for visitors to know", ['the mileage is limited.', 'what is included in the price.', 'fuel is included in the price.'], 'B'],
          [19, 'How can visitors find a taxi easily?', ['call the taxi company', 'look for a taxi in advance', 'stop a taxi on the street'], 'C'],
          [20, 'What is suggested by the tour guide about the taxi fee?', ['make sure no extra money is asked', 'check what is included in the fee', 'agree the price with the driver in advance'], 'C'],
        ], 'Questions 11-20'),
      ],
      expl: {
        11: { v: 'Khi nói về tiền boa.', t: ['If you take a taxi, there is no set rate on how much you should leave to the driver.', "It's up to you entirely."], p: '10% là cho tiệm tóc, nhà hàng (bẫy C); taxi thì tuỳ ý khách → A' },
        12: { v: 'Khi nói về dịch vụ y tế.', t: ["But remember, it's not a complimentary service.", 'The other alternative is to visit the local clinic, and you have to prepare for the charge as well.'], p: 'Bác sĩ khách sạn chỉ là một cách, bảo hiểm nên mua trước khi đi (B, C sai); dịch vụ y tế đều mất phí → A' },
        13: { v: 'Khi nói về nước máy.', t: "Tap water is safe to drink, but you might not get used to its weird taste because it contains minerals.", p: 'Nước an toàn, có khoáng chất (A, B sai); vị lạ → C' },
        14: { v: 'Khi nói về nước đóng chai.', t: "In this case, you can buy bottled water sold in every shop, but you'd better make sure the sealed lid is untouched, as the locals often put tap water into the bottle.", p: 'Bán ở mọi cửa hàng (C sai); người dân hay đổ nước máy vào chai → nắp không phải lúc nào cũng còn niêm phong → B' },
        15: { v: 'Khi nói về xe buýt.', t: ["Although there aren't many bus lines, they're always on time.", 'However, some people complained that the road was so bumpy that they even got nausea and dizziness.'], p: 'Ít tuyến nhưng luôn đúng giờ (A, B sai); đường xóc gây say → không thoải mái → C' },
        16: { v: 'Khi nói về điểm đến của xe buýt.', t: ['And another thing is, before you jump on the bus, inquire of the driver about where the bus will go.', 'you cannot find the destination shown in front of the bus or at the bus stop.'], p: 'Không ghi ở đầu xe hay trạm (A, C sai); hỏi tài xế → B' },
        17: { v: 'Khi nói về thuê xe.', t: ['Although some taxi companies provide car rental services, many visitors sometimes find nobody answering the phone.', "It's wise to compare several car rental companies online beforehand, as the price may vary a lot.", 'Booking via hotel may be overcharged'], p: 'Công ty taxi khó liên lạc, qua khách sạn bị tính thêm (A, B sai); so sánh giá trước → C' },
        18: { v: 'Khi nói điều quan trọng khi thuê xe.', t: ["More importantly, don't forget to check with the company what the price covers in detail", 'It usually includes unlimited mileage too, but fuel is excluded.'], p: 'Không giới hạn số km, không gồm xăng (A, C sai); cần biết giá gồm những gì → B' },
        19: { v: 'Khi nói cách bắt taxi.', t: ["If you want to find a taxi quickly, it's not a good idea to reserve through the taxi company", 'The easiest way is just waving your hands on the street to stop the taxi.'], p: 'Gọi công ty taxi phải chờ lâu (A sai); vẫy tay trên đường → C' },
        20: { v: 'Cuối bài, về giá taxi.', t: ['Oh, another thing is, I have to remind you that there is no meter for taxis in Muna Island.', "So before you jump in the taxi, you'd better negotiate with the driver about how much you're going to pay."], p: 'Taxi không có đồng hồ tính tiền; thoả thuận giá với tài xế trước → C' },
      },
    },
    { part: 3, reuse: '6ac5dc7e214135b4217b1f8f', title: 'Music in Restaurants' },
    {
      part: 4, title: 'Life on the International Space Station', audio: 'Listening/Test 8/P4 (3).mp3', cover: 'international space station | astronaut inside space station',
      transcript: `
For my presentation, I'm going to summarise the findings of a research project on life aboard the International Space Station in the early days of its operation, its teething problems as it were.
I'll start by giving a little background information.
The space station crew were essentially a constantly changing team of scientists from different countries who lived on the space station for several months at a time.
And they conducted a number of experiments, including some studies of living conditions in space, which is what I'm going to be looking at now.
So what was life like on board in the very confined conditions of the space station?
Well, the early impressions recorded by the astronauts were very different from what people had expected.
They'd expected that the air would smell stale or artificial, but the astronauts found that it was fresh.
So, that was one very positive finding.
And although they were in such a confined space, people worried that it would get very hot.
In fact, they found that it was very easy to turn the temperature up or down in order to keep it within a comfortable range.
The feedback on the food was also positive.
Astronauts on previous space stations had described the meals as boring.
But the International Space Station meals were praised for their variety.
So, that was another good piece of feedback.
And something which is taken for granted today, but was a key morale booster in those days, was communication between the space station and Earth, which the astronauts said was clear and reliable.
So, in the early days, it seems that the mood was overall very positive.
However, after a few days, the difficulties and frustrations became clearer.
Above all, the crew complained about the constant noise caused by the air filters, which used to rattle and buzz 24 hours a day, interrupting their sleep.
As well as that, the astronauts complained that the Velcro fasteners, which were positioned all over the station, didn't work well, and so a lot of the time objects weren't secure in the cabin but floated about.
A particularly serious problem was that the systems used on the space station had been developed in a number of different countries and they didn't always work well together.
For example, it was impossible to mix the water produced from different systems, because it contained different sorts of preservatives, and these reacted together and blocked the pipes.
Another problem was connected to repairs.
At the best of times, these took up an inordinate amount of time on the station, and the crew complained that many of the tools that they'd been provided with weren't suitable for the jobs they had to do.
So, they had to improvise, which meant that jobs took a lot longer than they needed to.
Another related problem was to do with access to equipment that needed maintaining.
Because the instructions on the equipment were often located in places where they were difficult to read, like on the back of equipment, it was often difficult or impossible to read them.
So, having identified these problems, the researchers came up with a number of suggestions about how conditions could be improved on subsequent missions.
First, it became clear that although there had been a great deal of consultation with the crews, the systems and equipment on the space station needed much more wide-ranging testing.
Then, the whole issue of language training came under review.
Astronauts from different countries had to be able to talk to the controllers on Earth and to understand them.
Now, although they had extensive language training, the astronauts sometimes had problems comprehending what was said because they weren't familiar with the accent of the speaker.
And this sometimes led to quite dangerous misunderstandings.
Finally, and this is the point I found most surprising, the researchers felt that the designers of the space station were paying too much attention to safety rather than considering operating issues.
That is, how the station could be run comfortably and smoothly.
And the recommendation was to make changes here at quite a fundamental level.
So, those were the main points I covered in the...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Life on the International Space Station', [
          '<strong>Background</strong>',
          '• Station was occupied by international teams of scientists over several months.',
          '• Research was done on living conditions.',
          '<strong>Early impressions</strong>',
          '• The air smelt __Q31__',
          '• The temperature was easy to adjust.',
          '• The food had enough __Q32__',
          '• __Q33__ was efficient',
          '<strong>Problems</strong>',
          '• Difficulties with air filters caused lack of __Q34__',
          '• It was difficult to keep cabin objects secure.',
          '• Systems were incompatible, e.g. there were problems when mixing __Q35__ because of the preservatives',
          '• The __Q36__ available were not always suitable for their purpose',
          '• It was difficult to access the __Q37__ for equipment maintenance',
          '<strong>Suggested improvements</strong>',
          '• Systems and equipment should undergo more extensive __Q38__',
          "• In language training, astronauts needed practice in understanding the controller's __Q39__",
          '• There should be less emphasis on __Q40__ and more on other issues',
        ], { 31: 'fresh', 32: 'variety', 33: 'communication/Communication', 34: 'sleep', 35: 'water', 36: 'tools', 37: 'instructions', 38: 'testing', 39: 'accent/accents', 40: 'safety' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần ấn tượng ban đầu.', t: "They'd expected that the air would smell stale or artificial, but the astronauts found that it was fresh.", p: 'Tưởng không khí sẽ ngột ngạt, nhân tạo (bẫy); thực tế rất trong lành → fresh' },
        32: { v: 'Khi nói về thức ăn.', t: ['Astronauts on previous space stations had described the meals as boring.', 'But the International Space Station meals were praised for their variety.'], p: 'Bữa ăn được khen vì đa dạng → variety' },
        33: { v: 'Khi nói điều giúp nâng tinh thần.', t: 'was communication between the space station and Earth, which the astronauts said was clear and reliable.', p: 'Liên lạc giữa trạm và Trái Đất rõ ràng, đáng tin cậy → communication' },
        34: { v: 'Khi chuyển sang các vấn đề.', t: 'Above all, the crew complained about the constant noise caused by the air filters, which used to rattle and buzz 24 hours a day, interrupting their sleep.', p: 'Tiếng ồn của bộ lọc khí làm gián đoạn giấc ngủ → sleep' },
        35: { v: 'Khi nói hệ thống không tương thích.', t: 'For example, it was impossible to mix the water produced from different systems, because it contained different sorts of preservatives', p: 'Không thể pha trộn nước từ các hệ thống khác nhau vì chất bảo quản → water' },
        36: { v: 'Khi nói về sửa chữa.', t: "and the crew complained that many of the tools that they'd been provided with weren't suitable for the jobs they had to do.", p: 'Dụng cụ được cấp không phù hợp với công việc → tools' },
        37: { v: 'Khi nói về bảo trì thiết bị.', t: 'Because the instructions on the equipment were often located in places where they were difficult to read', p: 'Hướng dẫn đặt ở chỗ khó đọc → instructions' },
        38: { v: 'Phần đề xuất cải thiện.', t: 'the systems and equipment on the space station needed much more wide-ranging testing.', p: 'Tham vấn đã nhiều (bẫy); cần thử nghiệm rộng hơn → testing' },
        39: { v: 'Khi nói về đào tạo ngôn ngữ.', t: "the astronauts sometimes had problems comprehending what was said because they weren't familiar with the accent of the speaker.", p: 'Không quen giọng của người nói → accent' },
        40: { v: 'Phần kết.', t: 'the researchers felt that the designers of the space station were paying too much attention to safety rather than considering operating issues.', p: 'Quá chú trọng an toàn mà xem nhẹ vận hành → safety' },
      },
    },
  ],
};
