// Vol 4 – Test 8 (PDF "listening/test 8/test 8.pdf" p1–6; key xlsx sheet Test 8; audio test 8/P1–P4.mp3 — P1 clipped from
// "Now turn to Part 1", P4 cut after "one minute to check" (10-minute silence follows)).
// Transcript: Whisper + Otter (Part N[ Cau …].pdf, P2/P3 split in two PDFs) written out with turns; gaps re-heard with wb.js.
const { note, short, mc, map, matching } = require('../vol_build');

module.exports = {
  vol: 4, test: 8,
  sections: [
    {
      part: 1, title: 'Post Office Package Delivery', audio: 'listening/test 8/P1.mp3', clip: [40.3, 339], cover: 'post office parcel counter | package delivery',
      transcript: `
Clerk:
Hello, can I help you?
Peter:
Yes, I'd like to send this package to the USA urgently, but I'm not sure what the best way of sending it is.
Clerk:
Well, first of all, when does it need to get there?
Peter:
Well, it's Tuesday today.
It's absolutely got to be there by Friday.
Ideally, I'd like it to be there by Thursday, but I realise that might be difficult.
Clerk:
OK.
Well, there's Courier Post, but that takes four working days, so that would be next Monday.
Or a slightly more expensive service called International Express, which will get there in three working days.
Peter:
OK.
I'll use that then.
It's really got to be there as quickly as possible.
Clerk:
OK.
Can I just take some details from you for the form?
First of all, what's your name?
Peter:
Peter White.
Clerk:
And your address?
Peter:
14 Mountain Road.
Clerk:
And where's that?
Peter:
That's in Lakeview.
Clerk:
OK.
Now, who are you sending the package to?
Peter:
Anna Hillman.
That's H-I-L-L-M-A-N.
Clerk:
And what's the address?
Peter:
Apartment 228, North Building, Upper Park Avenue.
Clerk:
And what city is that in?
Peter:
New York.
Clerk:
Now, I need a description of the contents of the package, just so customs know what's being sent.
Peter:
I'm sending books.
Clerk:
How many are you sending?
I need to give the number.
Peter:
There are six in total.
Clerk:
Right.
And is there anything else in the package?
Peter:
Yes, some photographs.
Clerk:
OK.
Now, would you like to insure the contents?
Peter:
It might be a good idea.
Clerk:
All right.
Now, can we just weigh the package and I'll tell you how much it's going to cost.
Peter:
Here you are.
It's heavy.
Clerk:
It's just over four kilos, so let's see, that's going to be $98 altogether.
Peter:
Will I be able to get a receipt with that?
Clerk:
Yes, of course.
Now, if the package gets lost, you should contact us as soon as possible.
It's very unusual for anything to go missing, but just in case, your receipt has an ID code on it, which we will need to be able to trace the package.
Peter:
Right.
So will I also need to bring in the receipt and the delivery form to you if it does get lost?
Clerk:
No, you can just give us a call with the ID code.
OK.
Now, is there anything else I can help you with?
Peter:
No, that's all.
And thanks for your help.`,
      groups: [
        note('Complete the form below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Post Office – Package Delivery Form', [
          'Country of destination: USA',
          'Package to reach destination by: __Q1__ at latest',
          'Service selected: __Q2__ Express',
          '<strong>Sender</strong>',
          'Name: Peter White',
          'Address: __Q3__',
          'Suburb: Lakeview',
          '<strong>Delivery to</strong>',
          'Name: Anna __Q4__',
          'Address: Apartment 228, __Q5__',
          'Upper __Q6__',
          'New York',
          'Contents: __Q7__',
          '__Q8__',
        ], { 1: 'Friday', 2: 'International', 3: '14 Mountain Road', 4: 'Hillman', 5: 'North Building', 6: 'Park Avenue', 7: '6 books/six books/books', 8: 'photographs/(some) photographs' }, 'Questions 1-8'),
        short('Answer the questions below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', [
          [9, 'What is the total cost of sending the package? $______', '98'],
          [10, 'What is required in order to find a lost package?', 'ID code/an ID code/the ID code'],
        ], 'Questions 9-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi gói hàng cần đến khi nào.', t: ["It's absolutely got to be there by Friday.", "Ideally, I'd like it to be there by Thursday, but I realise that might be difficult."], p: 'Thứ Năm chỉ là mong muốn (bẫy); chậm nhất phải đến vào thứ Sáu → Friday' },
        2: { v: 'Khi chọn dịch vụ gửi.', t: ['Well, there\'s Courier Post, but that takes four working days, so that would be next Monday.', 'Or a slightly more expensive service called International Express, which will get there in three working days.', "I'll use that then."], p: 'Courier Post mất 4 ngày (trễ); chọn International Express → International' },
        3: { v: 'Khi hỏi địa chỉ người gửi.', t: ['And your address?', '14 Mountain Road.'], p: 'Địa chỉ Peter; Lakeview là khu (suburb) → 14 Mountain Road' },
        4: { v: 'Khi hỏi tên người nhận.', t: ['Anna Hillman.', "That's H-I-L-L-M-A-N."], p: 'Họ được đánh vần → Hillman' },
        5: { v: 'Khi đọc địa chỉ người nhận.', t: 'Apartment 228, North Building, Upper Park Avenue.', p: 'Sau “Apartment 228” là tên toà nhà → North Building' },
        6: { v: 'Như câu 5.', t: 'Apartment 228, North Building, Upper Park Avenue.', p: 'Sau “Upper” là tên đường → Park Avenue' },
        7: { v: 'Khi mô tả đồ trong gói.', t: ["I'm sending books.", 'There are six in total.'], p: 'Gửi sáu cuốn sách → 6 books' },
        8: { v: 'Ngay sau đó.', t: ['And is there anything else in the package?', 'Yes, some photographs.'], p: 'Ngoài sách còn có ảnh → photographs' },
        9: { v: 'Khi cân gói hàng.', t: "It's just over four kilos, so let's see, that's going to be $98 altogether.", p: '4 kg là cân nặng (bẫy); tổng chi phí 98 đô → 98' },
        10: { v: 'Cuối bài, khi nói về hàng thất lạc.', t: ["your receipt has an ID code on it, which we will need to be able to trace the package.", 'No, you can just give us a call with the ID code.'], p: 'Không cần mang hoá đơn hay phiếu gửi; chỉ cần mã ID trên hoá đơn để tìm gói → ID code' },
      },
    },
    {
      part: 2, title: 'The Montana Resort Hotel', audio: 'listening/test 8/P2.mp3', cover: 'mountain resort hotel | hotel golf course lake',
      transcript: `
Well, let's get started.
I want to thank you all for coming along to the opening of the Montana Resort Hotel.
My name's Rob Schaefer, and I'm the general manager here.
We're very glad so many of you have come along to see the beautiful facilities we have here at the hotel.
We feel we're exceptionally located, convenient for the city but far enough from the flight path to and from the airport, so that guests won't be disturbed and will be able to recharge their batteries in these uniquely peaceful surroundings.
Firstly, the guest rooms.
What we call the standard rooms are about 80 square feet, very spacious.
These come with one king-size bed or with two double beds, and a refrigerator.
And as far as price goes, they go up to $210 per room.
But at the lower end of the range, you can get one for just $145.
So these are very suitable for our more price-conscious guests.
Then there are deluxe suites.
These have a separate living room, as well as the bedroom.
The bedrooms are slightly larger than the standard rooms, with huge windows, and each one has a balcony where you can sit out and enjoy the views, either of the golf course or the mountains, depending which way the room is facing.
We welcome families at the hotel.
Extra beds for your room can be provided for young children at no extra cost, and that's true even in the summer.
Also, we have some rooms that adjoin one another, with a door connecting them.
We expect that these will attract parents who want to be able to check that their children are safe easily.
All our guests can benefit from the fine dining opportunities in the hotel.
In the grill room, guests can watch the flames fly as food is sizzled by the restaurant's master chefs, while the Pantheon restaurant has facilities for intimate dining or large dinners, and a live jazz band that spices up the evenings from Thursday to Saturday.
Finally, the Montana Cafe is open 24-7 for anything from a coffee or a sandwich to a more substantial meal.
Now let's have a look at our outdoor facilities.
So here at the main entrance to the hotel, we're looking north, straight down Peak Road.
You'll see a few horses in the nearby field, and the first building on our right is the barn where the horses are kept.
We have 12 of them, and they've all been trained here, so they know the terrain.
Beyond that, you can just see the lake.
The road bends around past that, and just on that corner, between the road and the lakeside, there are a couple of tennis courts.
It's a beautiful setting for a game, I'm sure you'll agree.
Then, looking on the left side of Peak Road, there's a road that leads off it that's called Valley Avenue.
And on this side of Valley Avenue, just past that patch of trees, there's a building with a flat roof.
And that's our Olympic-size swimming pool.
This has 12 lanes, and there's also a baby pool for children.
The Montana Golf Course is the jewel of our outdoor facilities, though.
You can see part of it on the far side of Valley Avenue, and it spreads off west for a pretty long way.
It's an 18-hole course with beautiful landscaping.
We expect lots of golfers to stay, and one of our aims is to host a professional golf tournament.
The last building I want to point out is the office of the Outdoor Facilities Manager.
It's in its own building, just opposite where Valley Avenue turns off Peak Road.
OK, so if you'd like to follow me...`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'Rob says the hotel is exceptional because of', ['its easy access to the airport.', 'its unpolluted setting.', 'its quiet location.'], 'C'],
          [12, 'What is the price range for a standard room?', ['$80-$145', '$145-$210', '$210-$285'], 'B'],
          [13, 'All the bedrooms in the deluxe suites have', ['windows on two sides.', 'mountain views.', 'a balcony.'], 'C'],
          [14, 'The hotel encourages families to stay by offering', ['rooms with connecting doors.', 'childcare facilities.', 'discounts at certain times of the year.'], 'A'],
          [15, 'What does Rob say visitors can do in the Grill Room?', ['listen to live music', 'have a full meal or a snack', 'see their food being cooked'], 'C'],
        ], 'Questions 11-15'),
        map("Label the map below.\nWrite the correct letter, A-H, next to Questions 16-20.\n\nHotel's outdoor facilities", [
          [16, 'Barn for horses', 'D'],
          [17, 'Tennis courts', 'B'],
          [18, 'Swimming pool', 'F'],
          [19, 'Golf course', 'H'],
          [20, "Outdoor Facilities Manager's office", 'C'],
        ], { pdf: 'listening/test 8/test 8.pdf', page: 3, box: [95, 185, 420, 460] }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi Rob nói về vị trí khách sạn.', t: "We feel we're exceptionally located, convenient for the city but far enough from the flight path to and from the airport, so that guests won't be disturbed and will be able to recharge their batteries in these uniquely peaceful surroundings.", p: 'Nhắc sân bay chỉ để nói xa đường bay (bẫy A); điểm đặc biệt là khung cảnh yên tĩnh → C' },
        12: { v: 'Khi nói giá phòng tiêu chuẩn.', t: ['And as far as price goes, they go up to $210 per room.', 'But at the lower end of the range, you can get one for just $145.'], p: 'Giá từ $145 đến $210; 80 là diện tích (bẫy A) → B' },
        13: { v: 'Khi nói về phòng suite cao cấp.', t: 'The bedrooms are slightly larger than the standard rooms, with huge windows, and each one has a balcony where you can sit out and enjoy the views, either of the golf course or the mountains, depending which way the room is facing.', p: '“Each one has a balcony” = tất cả đều có ban công; view núi tuỳ hướng phòng (B sai) → C' },
        14: { v: 'Khi nói về gia đình.', t: ['Also, we have some rooms that adjoin one another, with a door connecting them.', 'We expect that these will attract parents who want to be able to check that their children are safe easily.'], p: 'Giường phụ miễn phí cả mùa hè (không phải giảm giá theo mùa – C sai); phòng thông nhau thu hút phụ huynh → A' },
        15: { v: 'Khi nói về Grill Room.', t: "In the grill room, guests can watch the flames fly as food is sizzled by the restaurant's master chefs", p: 'Nhạc jazz là ở nhà hàng Pantheon, đồ ăn nhẹ ở Montana Cafe (bẫy); ở Grill Room khách xem đầu bếp nấu → C' },
        16: { v: 'Khi đứng ở cổng chính nhìn về hướng bắc.', t: "You'll see a few horses in the nearby field, and the first building on our right is the barn where the horses are kept.", p: 'Toà nhà đầu tiên bên phải đường Peak Road → D' },
        17: { v: 'Khi nói về hồ.', t: 'The road bends around past that, and just on that corner, between the road and the lakeside, there are a couple of tennis courts.', p: 'Ở góc cua giữa con đường và bờ hồ → B' },
        18: { v: 'Khi nói về Valley Avenue.', t: ["And on this side of Valley Avenue, just past that patch of trees, there's a building with a flat roof.", "And that's our Olympic-size swimming pool."], p: 'Phía bên này (phía nam) Valley Avenue, ngay sau hàng cây → F' },
        19: { v: 'Khi nói về sân golf.', t: 'You can see part of it on the far side of Valley Avenue, and it spreads off west for a pretty long way.', p: 'Ở phía bên kia (phía bắc) Valley Avenue, trải về phía tây → H' },
        20: { v: 'Cuối bài, văn phòng quản lý.', t: "It's in its own building, just opposite where Valley Avenue turns off Peak Road.", p: 'Đối diện chỗ Valley Avenue rẽ ra khỏi Peak Road → C' },
      },
    },
    {
      part: 3, title: 'Oral History Project', audio: 'listening/test 8/P3.mp3', cover: 'oral history interview recorder | football team old photo',
      transcript: `
Tutor:
Thanks, Mike, for dropping by.
I've read the proposal for your project, which is an oral history of the local football team, particularly the time around 1983 when they won the league championship.
But first, how do you define oral history?
Mike:
Well, in fact, I use the definition you gave us last year in our research methodology class.
I found the handout in my file.
The definition says that oral histories are planned interviews or conversations about some aspect of the past which is considered historically or socially important.
The interviews are with people who took part in whatever it's about, so there'll be a record which historians can use later for all those academic articles they write.
And although history textbooks are mostly about famous people and important events, oral history can be about ordinary people doing ordinary things.
Oral history really seems to have started in the States.
Tutor:
You're right.
In fact, the first modern oral history interviews were done by a historian in New York.
By that time, audio technology had improved so much that it was fairly easy to record those interviews.
Mike:
I was also interested in how the Internet has contributed to oral history studies.
Tutor:
Yes, it means that lots of people can access the material, and that's great.
Also, the interactive nature of the better websites means that more students get interested in oral history.
Mike:
But from what I've read, the real contribution of the internet is that the recording of the interviews will be preserved forever.
In the old days, the tapes would just wear out, and after some years, you couldn't really use them, but not now.
Tutor:
You're right, of course.
Anyhow, let's move on to the subject of your project.
Why did you decide to study a sports team?
Mike:
Well, actually, I don't even like football very much, and some of my friends think I'm crazy to go for that subject, but my dad is a huge fan and he might be able to help me.
Tutor:
Hmm.
And how did you find out background about the team?
You talked to the team manager, I assume?
Mike:
Yes, I did manage to track him down, and I looked at all the old news stories about the team in the town newspaper office.
That was where I got the most helpful information.
I had high hopes that the local library would have lots of stuff, but they don't keep many records for more than ten years.
Tutor:
I know that you managed to locate ten of the original eighteen members of the team using an old-fashioned method, didn't you?
Not a website or anything, just the telephone directory.
Mike:
Yes, I didn't even need to use the local team's records.
Tutor:
OK, now, I've read your proposal carefully.
Overall, your plans seem excellent, but I want to discuss how you might improve them.
Mike:
Great.
Tutor:
I've read through the list of questions you've drafted.
I felt most of them are rather complex to be processed as oral questions.
You don't have too many, which is good, but you should try to do something about that problem.
Mike:
Right.
I'll work on them.
Tutor:
And the time you've allotted for each interview.
Actually, I think you may have scheduled too much time for each.
You want them to be tight, not going on and on.
That makes for better results.
Mike:
I can change the schedule.
One thing I'm nervous about is the recording equipment I use.
I've got an old recorder.
It runs without making too much noise, and it isn't complicated, but it sometimes just doesn't seem to work.
It stopped during an interview I tried out with my dad.
Tutor:
Well, the important thing is just be ready if anything happens.
Take some spare batteries, or even an extra recorder.
Now, I'm a little concerned with the subjects you've chosen to cover.
The topics seem quite general, not very specific.
For example, why did they like playing for this team?
You need to talk about more exact things and feelings.
That way, your results will be more valuable.
Mike:
I'll try to refine them.
And, you know, the plan for my report seems to be just to report back more or less what the players say, what happened, when, what they each did and so on.
But I'm not sure about that.
Tutor:
Yes.
Although your outline seems long enough, change it to indicate that you plan to include your own evaluation of the data you get from your interviewees.
Anyhow, best of luck on your project.
I look forward to seeing the results.
Mike:
Thanks for your help.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What source did Mike use for his definition?', ['a history textbook', 'an academic article', 'a lecture handout'], 'C'],
          [22, 'According to Mike and his tutor, what is the most important contribution of the internet to oral history?', ['the permanent preservation of recordings', 'an increase in student interest', 'wide access to the interviews by the public'], 'A'],
          [23, 'Mike says he chose his particular topic because', ['he is a football fan.', 'his father loves football.', 'his friends encouraged him.'], 'B'],
          [24, 'What does Mike say was his best source of information about the team?', ['doing research in the local newspaper archives', 'speaking to the team manager', 'looking at materials in the local library'], 'A'],
          [25, 'How did Mike find the former players he has arranged to interview?', ['on the internet', 'in the team records', 'in the phone book'], 'C'],
        ], 'Questions 21-25'),
        matching('What problems with the following aspects of the proposed interviews do the speakers identify?\nChoose FIVE answers from the box and write the correct letter, A-H, next to Questions 26-30.',
          ['too unreliable', 'too short', 'too noisy', 'too long', 'too formal', 'too factual', 'too complicated', 'too vague'], [
            [26, 'Questions drafted', 'G'],
            [27, 'Time allotted', 'D'],
            [28, 'Recording equipment used', 'A'],
            [29, 'Subjects chosen', 'H'],
            [30, 'Proposed report', 'F'],
          ], { title: 'Problems', groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Khi gia sư hỏi Mike định nghĩa lịch sử truyền miệng.', t: ['Well, in fact, I use the definition you gave us last year in our research methodology class.', 'I found the handout in my file.'], p: 'Định nghĩa lấy từ tài liệu phát trong lớp phương pháp nghiên cứu; sách giáo khoa, bài báo học thuật chỉ được nhắc (bẫy) → C' },
        22: { v: 'Khi bàn đóng góp của Internet.', t: ['But from what I\'ve read, the real contribution of the internet is that the recording of the interviews will be preserved forever.', "You're right, of course."], p: 'Nhiều người truy cập, nhiều sinh viên hứng thú chỉ là lợi ích phụ; đóng góp thật sự là bản ghi được lưu giữ mãi mãi, gia sư đồng ý → A' },
        23: { v: 'Khi hỏi vì sao chọn đề tài đội bóng.', t: "Well, actually, I don't even like football very much, and some of my friends think I'm crazy to go for that subject, but my dad is a huge fan and he might be able to help me.", p: 'Mike không thích bóng đá, bạn bè cho là điên rồ; lý do là bố rất mê bóng đá → B' },
        24: { v: 'Khi hỏi nguồn thông tin về đội bóng.', t: ['I looked at all the old news stories about the team in the town newspaper office.', 'That was where I got the most helpful information.'], p: 'Gặp được quản lý đội, thư viện không lưu quá 10 năm; nguồn hữu ích nhất là tin cũ ở toà báo → A' },
        25: { v: 'Khi nói cách tìm các cựu cầu thủ.', t: ['Not a website or anything, just the telephone directory.', "Yes, I didn't even need to use the local team's records."], p: 'Không dùng website hay hồ sơ đội bóng; tìm trong danh bạ điện thoại → C' },
        26: { v: 'Khi gia sư góp ý về câu hỏi.', t: 'I felt most of them are rather complex to be processed as oral questions.', p: 'Số lượng không nhiều nhưng câu hỏi quá phức tạp để hỏi miệng → G' },
        27: { v: 'Khi góp ý về thời lượng.', t: 'Actually, I think you may have scheduled too much time for each.', p: 'Thời gian mỗi buổi phỏng vấn quá dài → D' },
        28: { v: 'Khi Mike nói về máy ghi âm.', t: ["It runs without making too much noise, and it isn't complicated, but it sometimes just doesn't seem to work.", 'It stopped during an interview I tried out with my dad.'], p: 'Không ồn, không phức tạp (bẫy C, G) nhưng đôi khi không chạy → không đáng tin cậy → A' },
        29: { v: 'Khi góp ý về chủ đề.', t: ['The topics seem quite general, not very specific.'], p: 'Chủ đề quá chung chung, không cụ thể → mơ hồ → H' },
        30: { v: 'Cuối bài, về kế hoạch báo cáo.', t: ['And, you know, the plan for my report seems to be just to report back more or less what the players say, what happened, when, what they each did and so on.', 'Although your outline seems long enough, change it to indicate that you plan to include your own evaluation of the data you get from your interviewees.'], p: 'Đủ dài (B sai); chỉ thuật lại sự việc, cần thêm đánh giá riêng → quá thiên về dữ kiện → F' },
      },
    },
    {
      part: 4, title: 'Plant Behaviour', audio: 'listening/test 8/P4.mp3', clip: [0, 407], cover: 'dodder plant parasite | sea rocket plant beach',
      transcript: `
Good morning, everyone.
In the last few weeks, we looked at ways in which different types of animals use their senses.
And today, I'm going to introduce the topic of plant behaviour.
And we'll look at the reasons why ideas about plants have been changing in the last few years.
So, up until fairly recently, plants' lack of eyes or ears or noses or mouths made them less interesting to many members of the public compared to animal species.
And even by scientists, they were generally regarded as organisms which were essentially passive.
However, in the last 20 years or so, evidence has started to emerge that plants can sense their surroundings in quite sophisticated ways.
But because scientific attitudes towards plants and their capabilities had been fixed for such a long time, this evidence has been met with some disbelief.
So, let's look at some of these recent findings that are starting to change the way some scientists view plant life.
It all began with a Canadian study that looked at a species of plant known as the Great Lakes sea rocket.
This is a wild plant which grows on beaches.
In appearance, it's perfectly ordinary, with little purple flowers and a long stalk.
But actually, the plant is far from ordinary.
Normally, when the sea rocket detects other plants growing nearby, it quickly grows additional roots.
This is so it can compete with these other plants for the available nutrients in the soil, by soaking up as many of them as possible.
But scientists found that the sea rocket doesn't do that when the surrounding plants are related to it.
And as even animals sometimes find this type of recognition difficult, such a finding was very unexpected.
It was an ability that was previously unheard of in any other plant.
Since then, it's been suggested that two other plants may have a similar ability.
These are sagebrush and thorn apple.
It's been claimed that these plants can recognise the characteristics of their neighbours by sensing properties of the light that is reflected from them.
The reason they are able to do this is that all plant species are slightly different to each other in this respect.
So, each plant species has what you could call its own signature.
Sagebrush and thorn apple are able to recognise these.
But scientists point out that this behaviour is very different to the way that animals sense things.
Another type of plant which can sense things in its surroundings is the dodder plant.
This plant is different to most other species because it doesn't have the ability to make sugar by converting nutrients from the soil.
This means that, as soon as the dodder has sprouted from a seed, it needs to find another plant in order to survive.
In other words, it's a parasite.
Dodders infest a variety of food crops around the world, as they wrap themselves like string around their target plants, and the effect can be devastating for farmers.
It's particularly damaging to alfalfa, as well as to potatoes and different varieties of citrus.
At first, scientists were puzzled as to how the dodder knows which plants to prey on.
But now, they've found that the plant can identify a suitable host by sensing the chemicals that other plants release into the soil and air.
What really surprised researchers was how extremely quickly and accurately the dodder identifies a possible host.
They used time-lapse videos to study the mechanism and saw from these that when the dodder is trying to check out its environment, it rotates in a circle and then, without touching any other plants, it heads directly towards its selected host.
It could sense reliably which type of plant it would grow best on.
Scientists who were working on the project reported that the dodder sprout resembled a worm as it moved towards the other plant.
Well, those are some examples of the new discoveries about plant characteristics.
So which direction is plant science likely to go in next?
Many of the phenomena related to plant behaviour that I've just described are now quite easy to observe, using up-to-date equipment.
So, gradually, scientists are accepting the fact that plants are more capable than we used to believe.
But although such plant behaviour is often obvious to some scientists...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Plant Behaviour', [
          '<strong>Changing ideas</strong>',
          '• Scientists once thought of plants as being __Q31__ organisms',
          '• Now there is evidence that this is not true',
          '<strong>Recent studies</strong>',
          '<em>Great Lakes sea rocket</em>',
          '• Found on __Q32__',
          '• When near other plants, it normally produces extra __Q33__ to compete for nutrients.',
          '• However, it behaves differently if it is related to the other plants',
          '<em>Sagebrush and thornapple</em>',
          '• Recognise surrounding plants by the type of __Q34__ that they reflect',
          '• Identification is possible because all plants have a particular __Q35__',
          '<em>Dodder plant</em>',
          '• Is unable to produce __Q36__',
          '• Needs to feed off another plant to survive',
          "• Affects farmers' crops, e.g. alfalfa, __Q37__ and citrus",
          "• Identifies suitable 'hosts' by detecting the __Q38__ they give off",
          '• Moves in a __Q39__ to check the environment, then grows towards the most suitable host',
          '<strong>Plant science</strong>',
          '• Use of modern __Q40__ provides evidence of plant behaviour',
        ], { 31: 'passive', 32: 'beaches/beach', 33: 'roots', 34: 'light', 35: 'signature', 36: 'sugar', 37: 'potatoes', 38: 'chemicals', 39: 'circle', 40: 'equipment' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần thay đổi quan niệm.', t: 'And even by scientists, they were generally regarded as organisms which were essentially passive.', p: 'Các nhà khoa học từng coi thực vật là sinh vật thụ động → passive' },
        32: { v: 'Khi giới thiệu cây sea rocket.', t: 'This is a wild plant which grows on beaches.', p: 'Cây mọc trên bãi biển → beaches' },
        33: { v: 'Khi nói phản ứng của sea rocket.', t: ['Normally, when the sea rocket detects other plants growing nearby, it quickly grows additional roots.', 'This is so it can compete with these other plants for the available nutrients in the soil'], p: '“Grows additional roots” = mọc thêm rễ để tranh dinh dưỡng → roots' },
        34: { v: 'Khi nói về sagebrush và thorn apple.', t: "It's been claimed that these plants can recognise the characteristics of their neighbours by sensing properties of the light that is reflected from them.", p: 'Nhận biết cây xung quanh qua đặc tính của ánh sáng phản xạ → light' },
        35: { v: 'Ngay sau đó.', t: 'So, each plant species has what you could call its own signature.', p: 'Mỗi loài có “chữ ký” riêng → signature' },
        36: { v: 'Khi giới thiệu cây tơ hồng (dodder).', t: "This plant is different to most other species because it doesn't have the ability to make sugar by converting nutrients from the soil.", p: 'Không tự tạo được đường từ dinh dưỡng trong đất → sugar' },
        37: { v: 'Khi nói về tác hại với cây trồng.', t: "It's particularly damaging to alfalfa, as well as to potatoes and different varieties of citrus.", p: 'Cỏ linh lăng, khoai tây và các loại cam quýt → potatoes' },
        38: { v: 'Khi nói cách tìm vật chủ.', t: "But now, they've found that the plant can identify a suitable host by sensing the chemicals that other plants release into the soil and air.", p: '“Chemicals that other plants release” = các chất hoá học cây khác tiết ra → chemicals' },
        39: { v: 'Khi mô tả video tua nhanh.', t: 'when the dodder is trying to check out its environment, it rotates in a circle', p: 'Xoay theo vòng tròn để dò môi trường; giống con giun chỉ là so sánh (bẫy) → circle' },
        40: { v: 'Cuối bài, hướng đi của khoa học thực vật.', t: "Many of the phenomena related to plant behaviour that I've just described are now quite easy to observe, using up-to-date equipment.", p: '“Up-to-date equipment” = thiết bị hiện đại → equipment' },
      },
    },
  ],
};
