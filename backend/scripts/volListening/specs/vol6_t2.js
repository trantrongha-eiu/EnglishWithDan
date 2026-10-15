// Vol 6 – Test 2 (PDF "Lis/L-TEST 2.pdf" p1–6; key "Lis/L-key.pdf" p2; audio "Lis/Audio Lis/Test 2/S1, S2-, S3, S4- .mp3").
// Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// S1 opens with the whole-test introduction (0–41 s) → clip from "Part 1". S4 carries 10 min of transfer silence → clip.
// Transcript: Whisper turbo (sentences + pitch for turns) checked against large-v3; P3 86–113 s re-heard with wb.js.
// Source errors: key Q33 "eroison" → erosion, Q39 "wildife" → wildlife (typos). Key Q5 accepts the date forms.
// Key Q23–30 printed A B C E C D A D does not fit this paper/recording → by the recording C A D B A F C E: Q23 "keep most
// Māori terminology out of the presentation" (not "of interest to international students"), Q24 "I wouldn't go into the
// technical side… look at the impact… on the people's lives", Q25 "make sure we know who the writers were" (authors), etc.
const { note, mc, matching, map } = require('../vol_build');

module.exports = {
  vol: 6, test: 2,
  sections: [
    {
      part: 1, title: 'Booking a Residential Workshop', audio: 'Lis/Audio Lis/Test 2/S1.mp3', clip: [41, 406], cover: 'drama workshop actors rehearsal | theatre workshop stage',
      transcript: `
Receptionist:
Hello, Creative Centre.
Jan:
Hello there.
I'm phoning to book a place on your next two-day drama workshop.
Receptionist:
OK.
Let me just check.
Um... yes, we've still got room on that course.
Jan:
Great.
Receptionist:
Can I have your full name?
Jan:
Yes, it's Jan Creswick.
That's C-R-E-S-W-I-C-K.
Receptionist:
Thanks, Jan.
And are you coming on your own?
Jan:
Yes.
Receptionist:
And have you done any of our courses before?
Jan:
Yes, I did one a couple of years ago.
Receptionist:
Great.
So you may be on our computer records.
Which course did you do?
Jan:
The writing for the theatre course.
Receptionist:
OK.
Right.
Yes, here we are.
Oh, so that's 20 Gregory Avenue.
Jan:
Gregory Place, actually.
Receptionist:
OK.
I'll correct that on the computer.
Uh-huh.
And can I ask if you work?
Jan:
Yes, I want to be an actor, but I'm working as a waitress at the moment.
After this course, who knows?
Receptionist:
Right, back to the paperwork.
So, we're enrolling you on the two-day course that starts tomorrow, the 30th of May.
Oh, uh, sorry, no, on the 13th of June.
I meant the one starting in two weeks.
Is that still all right?
Jan:
Oh, that's fine.
Can you tell me something about accommodation?
Receptionist:
Yes.
People usually come the evening before the course starts.
The cost of the course includes accommodation for two nights.
Jan:
Well, I'll make sure I'm there in good time so I can meet the others that evening and settle in.
Is 5.30 too early to arrive?
Receptionist:
No, that's fine.
And you'll finish no later than 5 o'clock on the last day.
Jan:
Right.
Receptionist:
Okay.
Right, just a few other things.
Any dietary information we should know?
All the food is provided and we use organic produce as often as we can.
Jan:
Oh, that sounds great.
But I don't eat anything that's made from milk.
I know that can be difficult.
Receptionist:
Oh, it's not a problem.
What about meat?
Do you eat that?
Jan:
I don't eat much of it, but that's fine.
You don't need to note that.
Receptionist:
Sure?
Jan:
Yes.
Hey, I am really looking forward to this.
Receptionist:
Great.
I don't know if you know this, but we may divide into two groups in the afternoon if we have more than 16 people on the course.
If we do that, there'll be a choice of doing comic or what we call classic work.
Jan:
Oh, I'd always go with comedy.
I'm much more interested in that.
Receptionist:
Now, how did you find out about this course?
Was it the adverts in the Sunday newspaper?
Jan:
No.
In fact, I looked for drama courses on the internet and I saw that you were doing one.
When I read about it, I just thought, hey, why not?
Receptionist:
OK.
Jan:
I saw that you send out some pre-course material.
Receptionist:
Yes.
Jan:
I don't have much time to read any of the books you're recommending, but I'd be grateful for your leaflet, the one you mentioned in your publicity.
Receptionist:
Sure.
I'll put a copy in the post to you.
Jan:
Thanks a lot.
I can't wait.
Receptionist:
Wait till you see what we have in...`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Booking a residential workshop', [
          'Course required: drama workshop',
          'Full name of participant: Jan __Q1__',
          'Previous course attended: Writing for the __Q2__',
          'Address: 20, Gregory __Q3__',
          'Current occupation: __Q4__',
          'Date chosen course begins: __Q5__',
          'Estimated arrival time: __Q6__ pm',
          'Special dietary requests: no __Q7__ products',
          'Preferred afternoon course: __Q8__ work',
          'First source of course information: __Q9__',
          'Pre-course material requested: the __Q10__ mentioned in the publicity',
        ], { 1: 'Creswick', 2: 'theatre/theater', 3: 'Place', 4: 'waitress', 5: '13th June/13 June/June 13/June 13th/13th of June', 6: '5.30/5:30', 7: 'milk', 8: 'comic', 9: 'internet/the internet', 10: 'leaflet' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi lễ tân hỏi họ tên đầy đủ.', t: ["Yes, it's Jan Creswick.", "That's C-R-E-S-W-I-C-K."], p: 'Tên được đánh vần C-R-E-S-W-I-C-K → Creswick' },
        2: { v: 'Khi hỏi khoá học đã tham gia trước đây.', t: ['Which course did you do?', 'The writing for the theatre course.'], p: 'Khoá viết cho sân khấu → theatre' },
        3: { v: 'Khi lễ tân đọc địa chỉ trên máy.', t: ["Oh, so that's 20 Gregory Avenue.", 'Gregory Place, actually.'], p: 'Hồ sơ ghi Avenue nhưng Jan sửa lại (bẫy Avenue) → Place' },
        4: { v: 'Khi hỏi Jan có đi làm không.', t: "Yes, I want to be an actor, but I'm working as a waitress at the moment.", p: 'Muốn làm diễn viên (bẫy actor) nhưng hiện là nhân viên phục vụ bàn → waitress' },
        5: { v: 'Khi chốt ngày khoá học bắt đầu.', t: ["So, we're enrolling you on the two-day course that starts tomorrow, the 30th of May.", 'Oh, uh, sorry, no, on the 13th of June.'], p: 'Ngày 30/5 bị nói nhầm rồi sửa lại (bẫy) → 13th June' },
        6: { v: 'Khi hỏi giờ đến.', t: 'Is 5.30 too early to arrive?', p: 'Jan định đến lúc 5.30 chiều; 5 giờ là giờ kết thúc ngày cuối (bẫy) → 5.30' },
        7: { v: 'Khi hỏi về chế độ ăn.', t: ["But I don't eat anything that's made from milk.", "I don't eat much of it, but that's fine.", "You don't need to note that."], p: 'Thịt thì không cần ghi chú (bẫy meat); không ăn đồ làm từ sữa → no milk products → milk' },
        8: { v: 'Khi nói về lớp buổi chiều.', t: ["If we do that, there'll be a choice of doing comic or what we call classic work.", "Oh, I'd always go with comedy."], p: 'Chọn hài kịch → comic work → comic' },
        9: { v: 'Khi hỏi biết khoá học từ đâu.', t: ['Was it the adverts in the Sunday newspaper?', 'No.', 'In fact, I looked for drama courses on the internet and I saw that you were doing one.'], p: 'Không phải quảng cáo báo Chủ nhật (bẫy); tìm thấy trên mạng → internet' },
        10: { v: 'Khi nói về tài liệu trước khoá học.', t: "I don't have much time to read any of the books you're recommending, but I'd be grateful for your leaflet, the one you mentioned in your publicity.", p: 'Không đọc sách (bẫy books); muốn nhận tờ rơi được nhắc trong quảng cáo → leaflet' },
      },
    },
    {
      part: 2, title: "Working at Parson's Fruit Farm", audio: 'Lis/Audio Lis/Test 2/S2-.mp3', cover: 'fruit picking orchard workers | apple orchard harvest',
      transcript: `
Well, hello everyone and welcome to Parson's Fruit Farm.
It's good to see a mix of so many different nationalities who have all come here on their working holidays.
I'm sure you're going to enjoy working on our farm.
First of all, just a few words about accommodation.
I know that some of you have pitched your tents down at the campground, but are looking for something more comfortable.
So one option is the motel.
It's located very conveniently, just a few minutes away, and they often do reduce rates if you're staying long term.
And then the backpackers' hostel is always very popular, though it can be busy at this time of year.
OK, so the work itself.
This summer the weather's been pretty mixed.
We've had a bit of everything, and the forecasts have always been wrong.
So, some of the apples and pears aren't in great condition.
That said, this season's been better than some we've had recently, and the autumn looks like it's going to be great, so we should have ideal conditions for the harvest.
So, there are a number of different jobs to do.
Most of you will be fruit picking.
We'll give all the fruit pickers gloves to wear to protect your fingers so you won't hurt yourselves.
We'll also be looking for some tractor drivers.
Their job is to collect the full baskets of fruit and take them to the shed.
I should say, in this country, anyone is allowed to drive a tractor on farmland once they're 13, rather than 18, as in some countries.
However, we do have certain rules that are specific to our farm.
You don't need to have done farm work before, but here you must have a relevant document or permit from your country that allows you to operate this type of vehicle.
Then there are also lots of jobs working inside the shed.
This involves sorting the fruit and cleaning it if necessary.
There's a lot of heavy machinery in the shed, so when that's operating, you must wear your ear protection.
The big advantage is the shed's fully air conditioned, so it's a pleasant environment regardless of what the weather's doing outside.
Alright, well, whatever job you do, I'll just give you some final advice.
When you're picking the fruit, sometimes you can break off a small branch.
That's not something you need to be worried about.
It'll grow back.
Also, remember to have snacks and use your water bottles often.
People get exhausted quickly during harvest time.
And if you've got a mobile or cell, keep it with you at all times, in case there's an emergency.
All right.
I'd like to quickly go over where everything is located.
So look at your maps of Parson's Fruit Farm and find the main yard.
It's towards the bottom of your maps.
That really is the centre of the farm.
OK, the first place I'll mention is the workshop.
This is close to the main yard.
But you actually have to leave the yard to get into it.
So you need to take the road that goes out to the orchards and you access the workshop from there.
Then, the lunchroom.
On the north side of the map, there's a road that curves sharply round to the left.
Halfway round this bend, you'll find the entrance to the lunchroom.
It's a pretty place, next to the river and also beside a little wood.
You also need to be able to find the farm office.
So, if you look at the main yard, you'll see there's a number of different buildings located around it.
And the farm office is the smallest one.
It's on the south side.
Obviously, the first aid room is important.
Now, this is close to the main yard, so it's quick to get there.
And it's actually more or less in the middle of your maps.
That little building that's attached to the farmhouse.
Then the store shed.
From the main yard, take the road heading north.
Go past the farmhouse and turn right.
The store is down that road.
If you come to the vegetable gardens, you've gone too far.
Now the other thing is, the farmhouse is further than you'd expect.`,
      groups: [
        mc("Choose the correct letter, A, B or C.\n\nWorking at Parson's Fruit Farm", [
          [11, 'What does the manager say about accommodation?', ["The backpackers' hostel is full.", 'The motel is close to the farm.', 'The campground is cheap.'], 'B'],
          [12, 'The weather this summer has been', ['perfect for growing fruit.', 'worse than last year.', 'hard to predict accurately.'], 'C'],
          [13, 'The manager says that tractor drivers', ['require an appropriate licence.', 'need previous orchard experience.', 'must be over 18 years old.'], 'A'],
          [14, 'Working inside the shed', ['may be rather hot.', 'can be noisy at times.', 'will often be dirty.'], 'B'],
          [15, 'What final advice does the manager give?', ['Eat and drink regularly.', 'Try not to damage the trees.', 'Leave your phones in a secure location.'], 'A'],
        ], 'Questions 11-15'),
        map('Label the map below.\nWrite the correct letter, A-I, next to Questions 16-20.', [
          [16, 'Workshop', 'G'],
          [17, 'Lunchroom', 'B'],
          [18, 'Farm Office', 'H'],
          [19, 'First Aid Room', 'F'],
          [20, 'Store Shed', 'D'],
        ], { pdf: 'Lis/L-TEST 2.pdf', page: 3, box: [150, 585, 1478, 1566] }, "Questions 16-20 – Parson's Fruit Farm"),
      ],
      expl: {
        11: { v: 'Khi nói về chỗ ở.', t: ['So one option is the motel.', "It's located very conveniently, just a few minutes away, and they often do reduce rates if you're staying long term."], p: 'Hostel chỉ đông chứ không nói là kín chỗ (bẫy A); khu cắm trại không nói rẻ (bẫy C); motel ở rất gần, chỉ vài phút → B' },
        12: { v: 'Khi nói về thời tiết mùa hè.', t: ["We've had a bit of everything, and the forecasts have always been wrong."], p: 'Mùa này tốt hơn vài năm gần đây (bẫy B); dự báo luôn sai → khó dự đoán chính xác → C' },
        13: { v: 'Khi nói về người lái máy kéo.', t: ["I should say, in this country, anyone is allowed to drive a tractor on farmland once they're 13, rather than 18, as in some countries.", "You don't need to have done farm work before, but here you must have a relevant document or permit from your country that allows you to operate this type of vehicle."], p: '18 tuổi là quy định ở nước khác (bẫy C), không cần kinh nghiệm (bẫy B); phải có giấy phép lái phù hợp → A' },
        14: { v: 'Khi nói về việc trong nhà kho.', t: ["There's a lot of heavy machinery in the shed, so when that's operating, you must wear your ear protection.", "The big advantage is the shed's fully air conditioned"], p: 'Có điều hoà nên không nóng (bẫy A); máy móc nặng phải đeo bảo vệ tai → có lúc ồn → B' },
        15: { v: 'Khi đưa lời khuyên cuối.', t: ['Also, remember to have snacks and use your water bottles often.', 'People get exhausted quickly during harvest time.'], p: 'Gãy cành nhỏ không sao (bẫy B), điện thoại phải luôn mang theo (bẫy C); nhớ ăn vặt và uống nước thường xuyên → A' },
        16: { v: 'Khi chỉ đường đến xưởng.', t: ['But you actually have to leave the yard to get into it.', 'So you need to take the road that goes out to the orchards and you access the workshop from there.'], p: 'Gần sân chính nhưng vào từ con đường ra vườn cây (phía tây) → toà G cạnh đường "to Orchards" → G' },
        17: { v: 'Khi chỉ đường đến phòng ăn trưa.', t: ['On the north side of the map, there\'s a road that curves sharply round to the left.', 'Halfway round this bend, you\'ll find the entrance to the lunchroom.', "It's a pretty place, next to the river and also beside a little wood."], p: 'Ở khúc cua phía bắc, cạnh sông và một rừng cây nhỏ → B' },
        18: { v: 'Khi chỉ văn phòng trang trại.', t: ['And the farm office is the smallest one.', "It's on the south side."], p: 'Toà nhỏ nhất quanh sân chính, phía nam → H' },
        19: { v: 'Khi chỉ phòng sơ cứu.', t: ["And it's actually more or less in the middle of your maps.", "That little building that's attached to the farmhouse."], p: 'Toà nhỏ gắn liền với nhà trang trại, gần giữa bản đồ → F' },
        20: { v: 'Khi chỉ nhà kho chứa đồ.', t: ['From the main yard, take the road heading north.', 'Go past the farmhouse and turn right.', 'The store is down that road.', "If you come to the vegetable gardens, you've gone too far."], p: 'Đi lên phía bắc qua nhà trang trại rồi rẽ phải, cuối con đường (gần sông, trước vườn rau) → D' },
      },
    },
    {
      part: 3, title: 'Stone Point: a New Zealand Historical Site', audio: 'Lis/Audio Lis/Test 2/S3.mp3', cover: 'volcanic cone harbour New Zealand | historic fort tunnels',
      transcript: `
Liz:
Hi Scott, here are my notes.
Scott:
Let's sort this presentation out then.
The first thing I found out about Stone Point is it's an extinct volcanic cone.
You probably know that already, being a New Zealander.
Liz:
Yes, and there are two other cones nearby, which also overlook the harbour.
Scott:
Right.
Liz:
Yeah, the first settlers of New Zealand, the Māori, sailed to New Zealand thousands of years after these volcanoes erupted.
I think the tutor allocated us this topic, though, because of Stone Point's significant historical role.
It's been used by both Māori and European settlers as a place to shelter from attack or launch an attack for centuries.
Scott:
Yeah, and the fact it was an ideal place for building a village, it would have been quite a sheltered spot.
Liz:
I suppose the Māori settled there because they thought the volcanic soil would help their crops grow.
Scott:
Well, they would have realised the benefits of the soil after a few good harvests, but initially the fishing opportunities would have been the attraction.
Liz:
You're right.
Scott:
Actually, I also read that Māori regard Stone Point as taonga.
I believe that means a treasured thing.
Liz:
Wow, your Māori vocabulary is improving, Scott.
We do have to deal with Stone Point's cultural value for Māori.
That's still part of its historical significance.
But we need to keep most Māori terminology out of the presentation, otherwise a lot of the international students won't be able to follow us.
Scott:
That's a shame.
I'm sure they'd be interested.
I mean, I am.
But, yeah, we wouldn't be able to explain it in the time allowed, so I guess we have to stick to English.
Anyway, European migrants turned Stone Point into a lookout point for ships.
Then it became a fort, an army base in the late 1880s, and then, during the World Wars, the fort was modernised again.
Liz:
It's also been a public park sometimes.
Scott:
I'd prefer to devote more of the presentation to the military use of Stone Point.
There are some great websites about the engines they installed.
Liz:
Sorry, I wouldn't go into the technical side if I were you.
If you start describing mechanical stuff, people will switch off.
I think it's more interesting to look at the impact Stone Point had on the people's lives at the time.
I mean, for example, there were about 25 years when they used local prisoners to build the tunnels and the underground ruins.
They lived there too.
Scott:
Yeah, I guess, if we can find some first-hand accounts.
Liz:
OK, so let's make a checklist of things to do.
For the early Māori inhabitation section, we have to look at the material we've used again and make sure we know who the writers were and when they wrote it.
Scott:
Yes, that needs work.
And for the part about Stone Point being used as a lookout point, I'm sure we can locate some drawings of how Stone Point looked then and the kind of ships coming in.
Liz:
Nice.
And what else?
We haven't got a lot of detail for the reconstruction of the fort.
We should add some more information about what it was the prisoners were adding to it.
Scott:
OK, I'll do that bit too.
Liz:
So I'll deal with the section regarding the modernisation that happened in the 1930s and 40s.
I mean, that's the bit where we have the most visible evidence of historic buildings.
I'll ring the Department of Conservation and see if they'll agree to let me film the site.
Maybe allow me access to some of the tunnels the public don't see.
Scott:
OK.
For the 1950s onwards, could you also arrange a meeting with someone from the Department of Conservation to ask them about their restoration work?
Liz:
I could try.
Oh, and just about its use as a public park today.
Where is the boundary exactly?
Does it go all the way to the beach?
Scott:
Not sure.
I'll check that out.
Liz:
Great.
I suppose it would finish off the presentation nicely if we explained the future plans for the site.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nStone Point: a New Zealand historical site', [
          [21, 'According to Liz, Stone Point played a key role in local history because', ['it was used for defence or attack purposes.', 'it was the landing point for the first Māori settlers.', 'it was developed as a commercial port.'], 'A'],
          [22, 'Scott and Liz agree that Māori originally chose to inhabit Stone Point because of', ['its rich soil.', 'the supply of fish.', 'available building materials.'], 'B'],
          [23, 'Scott and Liz agree that using Māori terminology in their presentation', ['will be of interest to international students.', 'is required as a component of their research.', 'would be best avoided.'], 'C'],
          [24, 'When Scott mentions the engines at Stone Point, Liz advises him to', ['focus on the human aspect instead.', 'check the accuracy of specific dates.', 'explain complex technical language.'], 'A'],
        ], 'Questions 21-24'),
        matching('What do Liz and Scott agree they must do for each of the following sections of their presentation on Stone Point?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.',
          ['provide further description', 'find images', 'set up an interview', "check authors' details", 'check the exact location', 'obtain official permission', 'be more objective', 'reduce it in length'], [
            [25, 'Early Māori inhabitation of Stone Point', 'D'],
            [26, 'The use of Stone Point as a lookout point', 'B'],
            [27, 'The reconstruction of the fort', 'A'],
            [28, 'Modernisation of the fort in the 1930s–40s', 'F'],
            [29, 'Uses of Stone Point from the 1950s to the present day', 'C'],
            [30, 'The use of Stone Point as a public park', 'E'],
          ], { title: 'Things to do', groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Liz nói vì sao được giao chủ đề này.', t: ["I think the tutor allocated us this topic, though, because of Stone Point's significant historical role.", "It's been used by both Māori and European settlers as a place to shelter from attack or launch an attack for centuries."], p: 'Người Māori đến sau khi núi lửa phun hàng nghìn năm, không nói đây là nơi đổ bộ đầu tiên (bẫy B); nơi trú ẩn khi bị tấn công hoặc để tấn công → phòng thủ hoặc tấn công → A' },
        22: { v: 'Khi bàn vì sao người Māori định cư ở đây.', t: ["I suppose the Māori settled there because they thought the volcanic soil would help their crops grow.", 'Well, they would have realised the benefits of the soil after a few good harvests, but initially the fishing opportunities would have been the attraction.', "You're right."], p: 'Liz đoán là đất núi lửa (bẫy A) nhưng Scott nói ban đầu là nhờ đánh cá và Liz đồng ý → nguồn cá → B' },
        23: { v: 'Khi nói về thuật ngữ Māori.', t: ["But we need to keep most Māori terminology out of the presentation, otherwise a lot of the international students won't be able to follow us.", "But, yeah, we wouldn't be able to explain it in the time allowed, so I guess we have to stick to English."], p: 'Scott thấy tiếc nhưng cũng đồng ý chỉ dùng tiếng Anh → nên tránh dùng → C' },
        24: { v: 'Khi Scott nhắc đến các động cơ.', t: ["Sorry, I wouldn't go into the technical side if I were you.", "I think it's more interesting to look at the impact Stone Point had on the people's lives at the time."], p: 'Không nên đi vào kỹ thuật (bẫy C); nên nói về ảnh hưởng tới cuộc sống con người → tập trung vào khía cạnh con người → A' },
        25: { v: 'Khi lập danh sách việc cần làm, phần người Māori thời đầu.', t: "For the early Māori inhabitation section, we have to look at the material we've used again and make sure we know who the writers were and when they wrote it.", p: 'Phải biết ai là tác giả và viết khi nào → kiểm tra thông tin tác giả → D' },
        26: { v: 'Phần Stone Point làm điểm quan sát.', t: "And for the part about Stone Point being used as a lookout point, I'm sure we can locate some drawings of how Stone Point looked then and the kind of ships coming in.", p: 'Tìm tranh vẽ Stone Point và tàu thuyền thời đó → tìm hình ảnh → B' },
        27: { v: 'Phần xây dựng lại pháo đài.', t: ["We haven't got a lot of detail for the reconstruction of the fort.", 'We should add some more information about what it was the prisoners were adding to it.'], p: 'Chưa có nhiều chi tiết, cần thêm thông tin → mô tả thêm → A' },
        28: { v: 'Phần hiện đại hoá những năm 1930–40.', t: "I'll ring the Department of Conservation and see if they'll agree to let me film the site.", p: 'Gọi cơ quan bảo tồn xin cho quay phim khu vực → xin phép chính thức → F' },
        29: { v: 'Phần từ những năm 1950 đến nay.', t: 'For the 1950s onwards, could you also arrange a meeting with someone from the Department of Conservation to ask them about their restoration work?', p: 'Sắp xếp gặp người của cơ quan bảo tồn để hỏi → sắp xếp một cuộc phỏng vấn → C' },
        30: { v: 'Phần công viên công cộng.', t: ['Where is the boundary exactly?', 'Does it go all the way to the beach?', "I'll check that out."], p: 'Ranh giới chính xác ở đâu, có ra tới bãi biển không → kiểm tra vị trí chính xác → E' },
      },
    },
    {
      part: 4, title: 'Jatropha: a New Biofuel', audio: 'Lis/Audio Lis/Test 2/S4- .mp3', clip: [0, 428], cover: 'jatropha plant seeds | biofuel plantation',
      transcript: `
Good afternoon.
As you know, the world is running out of fossil fuels, that is crude oil, coal and natural gas.
As an alternative, certain plants are now being considered as biofuels, which are fuels made from organic plant material.
These are possible sources of energy once the fossil fuels have gone forever.
Well, one such plant goes by the name of jatropha.
It was first a native of Central America, and it's now found across the world.
A few things that make this plant especially attractive is that it can survive in very poor quality, infertile soil, as it does, for example, alongside train tracks in India, on the line between Mumbai and Delhi.
And for up to three years, it's resistant to drought.
That's right, it can do without rain for that long.
And even if it's not actually a plant that people can eat, it's still worth having it on your land, as it prevents erosion.
And we looked at the dangerous consequences of that in a previous lecture.
Furthermore, jatropha seeds can be slowly distilled to produce diesel oil, and it's this kind of fuel, of course, that's of interest to scientists and power companies.
After processing, the seeds can yield up to four times the oil that soybean can, and ten times the amount compared to corn.
So you can see why it's causing such interest.
And not much is wasted in the processing procedure either.
After the oil has been extracted from the seeds, the residue is processed into biomass, which can run power stations, which in turn can provide electricity for thousands of local homes.
Also, whereas our fossil fuels cannot be replaced, the energy produced by biofuels, such as jatropha, is renewable.
It's not going to run out because the plants just go on growing.
There's no doubt that it is a remarkable plant, and one that has been very beneficial to man.
In various African communities, it's been used to operate water pumps and refrigerate medicines.
It can be used to produce candles, or as a fencing plant to keep some animals enclosed, and some animals out.
It can also treat a number of health problems.
For example, the boiled leaves can do much to relieve the suffering of people with malaria, and some jatropha species have seeds which are used to treat digestion problems.
Anyway, that's not what the European corporations who are buying vast amounts of land for jatropha plantations are focusing on.
They claim that people who are dependent on rural economies will benefit from growing jatropha and that it will help them bring an end to poverty by providing a long-term local industry.
They also point out that few or no modifications would be necessary in modern diesel engines since they were originally designed to run on biofuels such as peanut oil and ethanol anyway.
Of course, when the plants are burnt, they release carbon dioxide, but they absorb great amounts when they're growing, making them a considerably greener alternative to fossil fuels.
But not everyone shares the excitement over jatropha, nor other biofuels.
In Western Australia, jatropha has in fact been banned since the seeds of some species are toxic, and it only takes three or four to kill a person, and animals are also very vulnerable.
Furthermore, sceptics also point out that as there are many species of jatropha, its oil productivity is unreliable.
Aside from this, critics of jatropha and other biofuels claim that farmers now have a strong economic incentive to grow them rather than food crops.
Poor countries would be particularly affected because they would have to rely on imported foods to survive, and people would end up having to pay greatly inflated prices for basic foods.
There's also the concern over environmental damage.
In order to provide land for palm oil or sugarcane plantations, for instance, companies are cutting down vast areas of rainforest which can never be replaced, and this in turn results in the disappearance of wildlife which depended on that habitat.
You can also imagine that such deforestation makes a considerable contribution to global warming.
Furthermore, opponents also reject the idea that biofuels are a carbon-neutral source of energy.`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Jatropha: a new biofuel', [
          '<strong>Plant facts</strong>',
          'The plant jatropha',
          '• is originally from Central America',
          '• can grow in poor __Q31__',
          '• can survive __Q32__ for several years',
          '• can stop __Q33__ of land',
          'Its seeds',
          '• can be used to produce diesel oil',
          '• produce far more fuel than soybean or __Q34__',
          '• leave a residue after processing – used to make electricity',
          '• produce energy which is renewable, unlike fossil fuels',
          '<strong>Uses of jatropha in Africa</strong>',
          '• for water pumps and fridges',
          '• made into __Q35__',
          '• used as fencing',
          '• the __Q36__ are boiled and used to treat malaria',
          '• for problems with __Q37__',
          "<strong>European companies' claims about jatropha</strong>",
          '• It could help stop poverty among rural populations',
          '• It could be used in current diesel engines',
          '• The plants use up lots of __Q38__',
          '<strong>Problems with jatropha</strong>',
          '• some seeds are toxic to people and animals',
          '• unreliable oil productivity',
          '<strong>Other criticisms of biofuels</strong>',
          'Widespread production of biofuels could result in',
          '• high food prices in poor countries',
          '• environmental damage caused by loss of rainforest and __Q39__',
          '• adding to the problem of __Q40__',
        ], { 31: 'soil/infertile soil', 32: 'drought', 33: 'erosion', 34: 'corn', 35: 'candles', 36: 'leaves', 37: 'digestion', 38: 'carbon dioxide/CO2', 39: 'wildlife', 40: 'global warming' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nêu điểm hấp dẫn của cây.', t: 'A few things that make this plant especially attractive is that it can survive in very poor quality, infertile soil', p: 'Sống được ở đất cằn, kém chất lượng → poor soil → soil' },
        32: { v: 'Ngay sau đó.', t: ["And for up to three years, it's resistant to drought.", "That's right, it can do without rain for that long."], p: 'Chịu được hạn hán tới ba năm → drought' },
        33: { v: 'Khi nói lợi ích với đất đai.', t: "And even if it's not actually a plant that people can eat, it's still worth having it on your land, as it prevents erosion.", p: 'Prevents erosion = stop erosion of land → erosion' },
        34: { v: 'Khi so sánh lượng dầu từ hạt.', t: 'After processing, the seeds can yield up to four times the oil that soybean can, and ten times the amount compared to corn.', p: 'Gấp 4 lần đậu nành và 10 lần ngô → corn' },
        35: { v: 'Khi nói công dụng ở châu Phi.', t: 'It can be used to produce candles, or as a fencing plant to keep some animals enclosed, and some animals out.', p: 'Dùng để làm nến → made into candles → candles' },
        36: { v: 'Khi nói công dụng chữa bệnh.', t: 'For example, the boiled leaves can do much to relieve the suffering of people with malaria', p: 'Lá đun sôi dùng chữa sốt rét → leaves' },
        37: { v: 'Ngay sau đó.', t: 'and some jatropha species have seeds which are used to treat digestion problems.', p: 'Hạt dùng chữa các vấn đề tiêu hoá → digestion' },
        38: { v: 'Khi nói tuyên bố của các công ty châu Âu.', t: "Of course, when the plants are burnt, they release carbon dioxide, but they absorb great amounts when they're growing, making them a considerably greener alternative to fossil fuels.", p: 'Khi lớn cây hấp thụ (use up) lượng lớn CO2 → carbon dioxide' },
        39: { v: 'Khi nói tác hại môi trường.', t: 'companies are cutting down vast areas of rainforest which can never be replaced, and this in turn results in the disappearance of wildlife which depended on that habitat.', p: 'Mất rừng mưa và sự biến mất của động vật hoang dã → wildlife' },
        40: { v: 'Ngay sau đó.', t: 'You can also imagine that such deforestation makes a considerable contribution to global warming.', p: 'Phá rừng góp phần đáng kể vào sự nóng lên toàn cầu → global warming' },
      },
    },
  ],
};
