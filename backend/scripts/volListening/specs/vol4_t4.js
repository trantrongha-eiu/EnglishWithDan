// Vol 4 – Test 4 (PDF "listening/test 4/listening- test 4.pdf" p1–6; key xlsx sheet Test 4; audio test 4/01 Track 1 (2).mp3,
// audio 2.mp3, audio 3.mp3, 04 Track 4 (6).wma — Track 1 clipped from "Now turn to Part 1", Track 4 cut after
// "one minute to check" (10-minute silence follows)).
// Transcript: Whisper + Otter (part 1.pdf, Part N.pdf) written out with turns; gaps re-heard with wb.js.
// P3 "Willows" is not Cam 18 T1 P3 although the xlsx keys look alike (that key sequence fits Q21–25/27–30 by chance).
// Source errors fixed: key Q17 "C" → A (the visitor centre has an exhibition on railway history "all over the world" and
// "a facility for hiring bikes"); key Q26 "A" → C ("I was not disappointed… you have both scored above the average");
// key Q10 44298611 also takes 044298611 (large-v3 twice: "044 2986 11"); paper Q22 repeated Q23's stem ("How did the
// students feel about the software?") → the stem its options answer; Q23 "fell" → feel.
// P2: the recording says "Amsden" where the paper and map have Elmsden → transcript follows the paper's name.
const { note, mc, multi, map } = require('../vol_build');

module.exports = {
  vol: 4, test: 4,
  sections: [
    {
      part: 1, title: 'Rooms to Hire for Parties', audio: 'listening/test 4/01 Track 1 (2).mp3', clip: [40.1, 459], cover: 'hotel function room party | birthday party buffet',
      transcript: `
Agent:
Good morning, the Function Company.
Can I help you?
Customer:
Hi.
A friend told me that you can arrange rooms for hire, for parties and things like that.
Agent:
That's right.
We have about ten hotels on our list and we hire out function rooms on their behalf.
Are you having a party?
Customer:
Yes, it's for my birthday, my 21st.
Agent:
OK.
First of all, can you tell me how many people you're inviting?
Customer:
I'm not sure yet.
It depends on the cost.
Agent:
OK.
Well, the Exchange Hotel might be a good choice for you.
They have a room which will seat up to 45 and will take 65 people standing.
Are you going to have a meal or just a buffet?
Customer:
Er, I think a buffet.
It doesn't have to be a sit-down meal.
I don't know the Exchange Hotel.
Can you tell me a bit more about it?
Agent:
Well, it was built about 150 years ago.
We regularly arrange parties there.
They have a room for hire on the fifth floor.
It's not the most central hotel, but it's very easy for people to find.
It's very popular for wedding parties, so I'll have to check if it's available.
Customer:
OK.
Is the room nice?
Have you seen it?
Agent:
I have.
It's quite big and very light, but the best thing is that it has a wonderful view.
On a fine evening, you can see for miles.
Customer:
Sounds good.
How much is it?
Agent:
It's £32 a head.
That includes the hire of the room and the standard buffet, but not drinks.
And you have to have at least 35 guests.
Customer:
Well, that won't be a problem.
We're likely to be more than that.
Can you tell me when it's available?
Agent:
I can check that for you.
Which dates are you looking at?
Customer:
Er, ideally the middle to end of April.
Weekends.
Agent:
Let me see.
Erm, they can do any Saturday in April, but not Fridays or Sundays.
Customer:
OK.
But if I want something bigger, what would you recommend?
Agent:
There's the Limerick Hotel.
Customer:
How do you spell that?
I'm taking notes.
Agent:
It's L-I-M-E-R-I-C-K.
There's a large room there which seats up to 75 people, or there's room for 125 standing.
Customer:
Oh, I expect we'll be standing.
Where is it?
Agent:
It's in the business district, so public transport's good.
It's got a large car park, too, though.
The room's on the ground floor, and it's recently been refurbished.
Customer:
Is there a garden we could use if we're on the ground floor?
Agent:
There's a small one that would be available.
Customer:
Sounds nice, especially if it's a warm evening.
And the cost?
Agent:
The buffet is £36 per person.
Shall I check availability in April for you?
Customer:
Yes, please.
Agent:
OK.
You said weekends, didn't you?
Customer:
Yes.
Agent:
No Fridays again, and it's not free on the first Saturday, that's the 6th, but it's free on the 13th and 20th.
Customer:
I think the first hotel looks best for me, but I need two or three days to think about it.
Agent:
OK.
Well, if I take your booking today, I can hold it for a week.
So if you want to change your mind or have a look at other possible hotels, we can do that.
To confirm the booking, I then need a deposit of 35%.
You pay the other 65% ten days before the party.
Customer:
OK.
And when do I have to confirm numbers?
Agent:
The number of guests needs to be confirmed five days before the party, and you also have to decide which menu you want then.
Customer:
That sounds OK.
I'll ring you on Monday.
Is this your direct line?
368207?
Agent:
I'll be out of the office on Monday, but you can call me on my mobile phone on 044 2986 11.
Customer:
All right.
I've got all that.
I'll ring you back later.
Thanks.
Agent:
Bye then.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Rooms to hire for parties', [
          '<strong>The Exchange Hotel</strong>',
          '• number of seated guests possible: 45',
          '• room on the __Q1__ floor',
          'large, bright room with a good __Q2__',
          '• cost: £32 with buffet per person (minimum number of people: __Q3__)',
          '• available any __Q4__ in April',
          '<strong>The __Q5__ Hotel</strong>',
          '• large room (seats 75)',
          '• in the __Q6__ area of the city',
          '• room on ground floor with a small __Q7__ for guests to use',
          '• cost: £36 with buffet per person',
          '• available: 13th and 20th April',
          '<strong>Booking information</strong>',
          'Bookings held for a __Q8__',
          'Final payment of __Q9__ % required 10 days before booking',
          'Need to confirm guests and menu 5 days in advance',
          'To book, phone __Q10__ on Monday',
        ], { 1: 'fifth/5th', 2: 'view', 3: '35', 4: 'Saturday', 5: 'Limerick', 6: 'business', 7: 'garden', 8: 'week', 9: '65', 10: '044298611/044 2986 11/44298611' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên giới thiệu khách sạn Exchange.', t: 'They have a room for hire on the fifth floor.', p: 'Phòng cho thuê ở tầng năm; 150 năm là tuổi của khách sạn (bẫy) → fifth' },
        2: { v: 'Khi khách hỏi căn phòng có đẹp không.', t: "It's quite big and very light, but the best thing is that it has a wonderful view.", p: '“Big and very light” = large, bright; điều tuyệt nhất là có tầm nhìn đẹp → view' },
        3: { v: 'Khi nói về giá.', t: ["It's £32 a head.", 'And you have to have at least 35 guests.'], p: '“At least 35 guests” = số khách tối thiểu; 45 là số ghế, 65 là số khách đứng (bẫy) → 35' },
        4: { v: 'Khi kiểm tra lịch trống tháng Tư.', t: 'Erm, they can do any Saturday in April, but not Fridays or Sundays.', p: 'Trống mọi thứ Bảy, không có thứ Sáu và Chủ nhật → Saturday' },
        5: { v: 'Khi khách muốn phòng lớn hơn.', t: ["There's the Limerick Hotel.", "It's L-I-M-E-R-I-C-K."], p: 'Tên khách sạn được đánh vần → Limerick' },
        6: { v: 'Khi khách hỏi khách sạn ở đâu.', t: "It's in the business district, so public transport's good.", p: '“Business district” = khu thương mại của thành phố → business' },
        7: { v: 'Khi hỏi về khu vườn.', t: ["Is there a garden we could use if we're on the ground floor?", "There's a small one that would be available."], p: 'Có một khu vườn nhỏ khách được dùng → garden' },
        8: { v: 'Phần thông tin đặt phòng.', t: 'Well, if I take your booking today, I can hold it for a week.', p: 'Hai, ba ngày là thời gian khách muốn suy nghĩ (bẫy); đặt chỗ được giữ một tuần → week' },
        9: { v: 'Khi nói về thanh toán.', t: ['To confirm the booking, I then need a deposit of 35%.', 'You pay the other 65% ten days before the party.'], p: '35% là tiền cọc (bẫy); 65% còn lại trả trước bữa tiệc 10 ngày → 65' },
        10: { v: 'Cuối bài, khi khách định gọi lại vào thứ Hai.', t: ["Is this your direct line?", "I'll be out of the office on Monday, but you can call me on my mobile phone on 044 2986 11."], p: '368207 là số máy bàn, thứ Hai nhân viên vắng (bẫy); gọi số di động → 044298611' },
      },
    },
    {
      part: 2, title: 'The Elmsden Way Cycle Route', audio: 'listening/test 4/audio 2.mp3', cover: 'cycle path countryside | cyclists railway station',
      transcript: `
Welcome to our holiday special.
Today I'll be talking about a new cycle route in this area called the Elmsden Way.
It's well signposted, so you can see exactly where to go.
And it's an easy route with no steep hills.
It's 35 kilometres long, from Elmsden to Lowington, and consists partly of cycle paths and partly roads.
Let me outline the route briefly, starting at Elmsden Railway Station.
The first part is a cycle path running eastwards, roughly parallel to the rail track.
Almost immediately, the railway curves away and goes around the southern side of a little lake, but the cycle path takes the northern route around the lake.
Keep your eyes open for the swans that nest there.
The path then joins the road, and the next landmark is a group of massive rocks which tower over the countryside.
You will see them to the east of the road, just before the road goes under the railway.
They are very impressive.
Soon you'll come to a fork in the road, where you're going to leave the road and head off towards the river.
But if you want to make a detour to Colleen Nature Reserve, go straight on instead of leaving the road here.
Continuing along the cycle path, you'll reach the River Cleve.
The cycle path follows the river southwards.
After a bit, you'll see the Ashington China Factory, which closed in 1962.
When you get there, there's a bridge over the river, and you carry on with Langton Forest to the south and farmland to the north.
The route ends at Langton Village, where you'll find a railway station.
So you can either catch the train here or cycle back to Elmsden.
One point to remember when you're cycling on the Elmsden Way is that you should keep your eyes open for sheep, which occasionally stray onto the cycle path from adjoining fields.
So be careful to avoid accidents.
The path is well constructed, so it's not affected by wet or muddy conditions.
There might be the odd car or tractor when you're cycling on roads, but most traffic has been diverted to the main road that bypasses the whole area.
Now, a bit more about some of the places you'll see.
The starting point, Elmsden Station, was quite busy in the early 20th century, with services to several major cities.
But it was closed in the 1950s.
And actually, a small company was set up to turn it into a sort of railway museum, maintaining it in the style of the 1950s.
And the station was ready for trains to start using it again earlier this year.
It's only used by a few local trains, though.
There's a visitor centre at the station which has a small exhibition about the history of railway transport all over the world, and a facility for hiring bikes if you don't have one of your own.
There's also a small shop just across the road from the station that sells refreshments.
As I said, you can cycle to Langton and return to Elmsden by train, or the other way around, because you can take your cycle on the train.
There's no need to book.
There's plenty of room and no extra charge.
However, the service is very limited, and the trains between these two places don't run on weekdays.
If you want to see the River Elm, there's a footpath from Elmsden Station, and you can safely leave your bike in the car park there.
Leave yourself plenty of time, though.
Going down's easy, but the climb up is very steep, so the walk back up to the top can take quite a while.
But it's worth the effort.
The scenery is wonderful, and the footpath runs right next to the river, down to a waterfall.
Finally, if you'd like to do some more cycling in the area, there are lots of other cycle paths.
We'll be talking on the radio about them, and you'll be able to get full details in the Saturday edition of the local paper.
The National Cycle Network also has some details on their website, although I have to say they don't have many local ones yet.
But that may change.
So we'll be telling you more about...`,
      groups: [
        map('Label the map below.\nWrite the correct letter, A-I, next to Questions 11-14.', [
          [11, 'Rocks', 'B'],
          [12, 'Colleen Nature Reserve', 'E'],
          [13, 'Ashington China Factory', 'F'],
          [14, 'Langton Forest', 'I'],
        ], { pdf: 'listening/test 4/listening- test 4.pdf', page: 2, box: [82, 196, 512, 509] }, 'Questions 11-14'),
        mc('Choose the correct letter, A, B or C.', [
          [15, 'What kind of warning does the speaker give to cyclists?', ['There may be traffic jams.', 'Avoid wet cycle paths.', 'There may be animals in the way.'], 'C'],
          [16, 'The starting point of Elmsden station is', ['very busy.', 'more modern.', 're-opened recently.'], 'C'],
          [17, "What can people do at the visitor's centre?", ['rent a bike', 'buy refreshments', 'learn local history'], 'A'],
          [18, 'To commute between Langton and Elmsden by train, you need to', ['book in advance.', 'go on weekends.', 'pay additional charges.'], 'B'],
          [19, 'What should you be aware of when visiting River Elm?', ['It takes a long time.', 'The waterfall is inaccessible.', 'Go by bike.'], 'A'],
          [20, 'Where can you get the information if you want to join the local route?', ['the local newspaper', 'the station website', 'national cycling network'], 'A'],
        ], 'Questions 15-20'),
      ],
      expl: {
        11: { v: 'Khi mô tả lộ trình sau hồ.', t: ['The path then joins the road, and the next landmark is a group of massive rocks which tower over the countryside.', 'You will see them to the east of the road, just before the road goes under the railway.'], p: 'Phía đông con đường, ngay trước chỗ đường chui dưới đường ray → B' },
        12: { v: 'Khi đến ngã ba.', t: ["Soon you'll come to a fork in the road, where you're going to leave the road and head off towards the river.", 'But if you want to make a detour to Colleen Nature Reserve, go straight on instead of leaving the road here.'], p: 'Lộ trình rẽ về phía sông; muốn tới khu bảo tồn thì đi thẳng tiếp theo con đường (về phía nam) → E' },
        13: { v: 'Khi đi dọc sông Cleve.', t: ['The cycle path follows the river southwards.', "After a bit, you'll see the Ashington China Factory, which closed in 1962.", "When you get there, there's a bridge over the river"], p: 'Đi theo sông về phía nam, nhà máy nằm ngay chỗ cầu bắc qua sông → F' },
        14: { v: 'Sau khi qua cầu.', t: 'you carry on with Langton Forest to the south and farmland to the north.', p: 'Rừng ở phía nam con đường (đất nông nghiệp ở phía bắc – H) → I' },
        15: { v: 'Khi nói điều cần lưu ý trên đường.', t: ['you should keep your eyes open for sheep, which occasionally stray onto the cycle path from adjoining fields.', 'So be careful to avoid accidents.'], p: 'Đường không bị ảnh hưởng khi ướt (B sai), xe cộ đã chuyển sang đường chính (A sai); cảnh báo cừu đi lạc vào đường → C' },
        16: { v: 'Khi nói về ga Elmsden.', t: ['But it was closed in the 1950s.', 'And the station was ready for trains to start using it again earlier this year.'], p: 'Từng đông đúc đầu thế kỷ 20 (bẫy A), giữ phong cách thập niên 1950 (B sai); vừa mở lại đầu năm nay → C' },
        17: { v: 'Khi nói về trung tâm du khách.', t: "There's a visitor centre at the station which has a small exhibition about the history of railway transport all over the world, and a facility for hiring bikes if you don't have one of your own.", p: 'Triển lãm về lịch sử đường sắt toàn thế giới, không phải địa phương (C sai); đồ uống bán ở cửa hàng bên kia đường (B sai); có chỗ thuê xe đạp → A (key gốc ghi C là sai)' },
        18: { v: 'Khi nói về tàu giữa Langton và Elmsden.', t: ["There's no need to book.", "There's plenty of room and no extra charge.", "However, the service is very limited, and the trains between these two places don't run on weekdays."], p: 'Không cần đặt trước, không thu thêm phí; tàu không chạy ngày thường → phải đi cuối tuần → B' },
        19: { v: 'Khi nói về sông Elm.', t: ['Leave yourself plenty of time, though.', 'Going down\'s easy, but the climb up is very steep, so the walk back up to the top can take quite a while.'], p: 'Phải dành nhiều thời gian vì leo lên rất dốc; xe đạp để lại bãi xe (C sai), lối đi xuống tận thác (B sai) → A' },
        20: { v: 'Cuối bài, về các tuyến khác.', t: ["We'll be talking on the radio about them, and you'll be able to get full details in the Saturday edition of the local paper.", "The National Cycle Network also has some details on their website, although I have to say they don't have many local ones yet."], p: 'Thông tin đầy đủ trên báo địa phương số thứ Bảy; Mạng lưới đạp xe quốc gia chưa có nhiều tuyến địa phương (bẫy C) → A' },
      },
    },
    {
      part: 3, title: 'Willows Furniture Company', audio: 'listening/test 4/audio 3.mp3', cover: 'furniture showroom bookcase | furniture design computer',
      transcript: `
Professor:
Hello, Tom and Bella.
Thanks for coming in today to talk about the key case studies that will help you to understand your classwork better.
Now, I hope you've read the notes I gave you last week on the furniture company Willows, as this will be the focus of our discussion today.
Let's begin.
Who can tell me what the current focus of the company's business is?
Tom:
The company used to be very large, with many retail outlets across the country.
However, since the recession, there have been fewer people spending money on furniture, and so the company was forced to close all of its outlets, and now only operates online.
Professor:
Well done, Tom.
Bella, can you add anything?
Bella:
Willows used to produce a very large number of products, such as tables, chairs and light fittings.
However, through market research, they realised that most of their profit was made from the sale of bookcases, so they now specialise in this one product.
Professor:
Very good.
Does anyone know how our department began its contact with Willows?
Tom:
Did you contact the company, Professor?
Professor:
No, Tom, it wasn't through me.
Our headmaster saw an article that the manager had written in the newspaper and became very interested in the company.
He contacted Willows and arranged for a student to work there full-time during the summer.
Yes, exactly.
Does anyone know what the student thought of their time working at Willows?
Bella:
Yes, he is a friend of ours.
He worked as a member of the design team, creating technical drawings of the furniture using a computer.
There was a special software that he used, which he said had a bad interface and was very difficult to predict.
However, it was very efficient and helpful for quickly drawing up furniture designs.
Professor:
How interesting!
Tom:
Yes, it was.
We both visited him whilst he was working there, and he showed us around.
Unfortunately, visitors were not allowed to access the IT department, but it was great to chat with his colleagues.
Professor:
Did you meet his manager?
Bella:
His manager is a very busy man, so he didn't have time to meet with us.
However, we were allowed to inspect the accounts, which really helped us to understand the effects of the software on the company.
Professor:
Well, what an exciting experience!
Now, before I forget, next week I'll be conducting face-to-face interviews with each of you to prepare for job interviews.
Bella:
Can we do it as a group?
Professor:
I'm afraid not, Bella.
I want to give each of you my undivided attention, and there will be too much disturbance if I interview you all together.
Plus, it will be more realistic if I interview you alone.
Tom:
Have you finished writing the feedback on our exam results, Professor?
Professor:
Yes, I have, Tom.
And I must say that I was not disappointed.
I am glad to say that your performance has dramatically increased since you began attending this after-school club, and you have both scored above the average.
If you continue to work hard, your results should soon improve significantly.
Now, back to our discussion about Willows.
Can anyone tell me what business decisions might benefit the company?
Tom:
A new system would definitely benefit Willows.
Their system is very outdated.
Bella:
I don't think it would help them to gain more profit.
However, the system is capable of doing the work of hundreds of people.
This would, therefore, significantly lower labour costs.
Tom:
I agree.
Unfortunately, unless they also replace the machinery in their workshop, the new system won't reduce the production time.
Bella:
That is a shame.
If they can't reduce their production time, they won't be able to increase sales.
The answer is to hire more staff in order to increase the efficiency of the production line.
Professor:
Yes, you have both made interesting points.
Now for one final question before we finish this week's session.
How will new clients be affected by the new system?
Tom:
Unfortunately, the new system does not allow clients to connect to the Willows system from home, so they are unable to access their work online.
This also means that the system presents no opportunity to attract more contacts, since clients are unable to view it from their homes.
Professor:
Yes, that's true.
However, it could definitely benefit clients who visit the showroom.
The system is very interactive and allows clients to easily browse the furniture catalogue, which will save them a lot of time.
Bella:
It's a shame that staff are still needed to guide clients through the online system, as it means that no savings can be made in labour costs.
Tom:
I think the major benefit of the new system is that it enables staff to design the furniture in front of the client, which allows them to get a lot more involved in the design.
Professor:
Bravo!
You've both contributed fantastic points to our conversation.
That concludes our session for today.
I'll see you next week.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What field is Willows currently focused on?', ['specialising in one product', 'making a variety of products', 'adding a lot of retail outlets'], 'A'],
          [22, 'How did the department begin its contact with Willows?', ['The professor contacted the company.', 'An article was read in a newspaper.', 'A student worked there part-time during the vacations.'], 'B'],
          [23, 'How did the student feel about the software?', ["It's not easy to predict.", "It's slow for drawing designs.", 'It had a good interface.'], 'A'],
          [24, 'How did the students find out about the effects of the software on the company?', ['They went to the IT department.', 'They talked with the manager.', 'They inspected the accounts.'], 'C'],
          [25, 'The reason why the students have a face-to-face interview alone is that', ['they could prepare for exams.', 'there will be less disturbance.', "it's less realistic."], 'B'],
          [26, 'How did the two students perform in the exam?', ['very disappointing', 'significantly good', 'above the average'], 'C'],
        ], 'Questions 21-26'),
        multi('Choose TWO letters, A-E.', 27, 'In which TWO ways will the new system affect the company?', ['gain more profit', 'employ more new staff', 'increase sales', 'reduce production time', 'cut labour costs'], ['B', 'E'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO effects will the new system have on new clients?', ['getting more involved in the design', 'obtaining more contacts', 'linking at home to do online work', 'wasting less time', 'decreasing labour costs'], ['A', 'D'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi giáo sư hỏi trọng tâm hiện nay của công ty.', t: 'However, through market research, they realised that most of their profit was made from the sale of bookcases, so they now specialise in this one product.', p: 'Trước đây làm nhiều sản phẩm, có nhiều cửa hàng (bẫy B, C); nay chỉ chuyên một sản phẩm là giá sách → A' },
        22: { v: 'Khi hỏi khoa bắt đầu liên hệ với Willows thế nào.', t: ['No, Tom, it wasn\'t through me.', 'Our headmaster saw an article that the manager had written in the newspaper and became very interested in the company.'], p: 'Không phải giáo sư liên hệ (A sai), sinh viên làm toàn thời gian mùa hè (C sai); khởi đầu từ bài báo hiệu trưởng đọc được → B' },
        23: { v: 'Khi kể nhận xét của người bạn về phần mềm.', t: ['There was a special software that he used, which he said had a bad interface and was very difficult to predict.', 'However, it was very efficient and helpful for quickly drawing up furniture designs.'], p: 'Giao diện tệ (C sai), vẽ nhanh (B sai); rất khó đoán → A' },
        24: { v: 'Khi kể chuyến tham quan công ty.', t: ['Unfortunately, visitors were not allowed to access the IT department', 'However, we were allowed to inspect the accounts, which really helped us to understand the effects of the software on the company.'], p: 'Không vào được phòng IT, không gặp được quản lý; xem sổ sách kế toán mới hiểu tác động của phần mềm → C' },
        25: { v: 'Khi Bella hỏi có thể phỏng vấn theo nhóm không.', t: ["I want to give each of you my undivided attention, and there will be too much disturbance if I interview you all together.", 'Plus, it will be more realistic if I interview you alone.'], p: 'Phỏng vấn riêng để chuẩn bị cho phỏng vấn xin việc (không phải thi), thực tế hơn (C sai); chung nhóm sẽ bị xao nhãng → ít bị làm phiền hơn → B' },
        26: { v: 'Khi giáo sư nhận xét kết quả thi.', t: ['And I must say that I was not disappointed.', 'and you have both scored above the average.', 'If you continue to work hard, your results should soon improve significantly.'], p: '“Not disappointed” loại A; “improve significantly” là kỳ vọng tương lai (bẫy B); hiện tại cả hai đạt trên mức trung bình → C (key gốc ghi A là sai)' },
        27: { v: 'Khi bàn tác động của hệ thống mới tới công ty.', t: ["I don't think it would help them to gain more profit.", "Unfortunately, unless they also replace the machinery in their workshop, the new system won't reduce the production time.", 'The answer is to hire more staff in order to increase the efficiency of the production line.'], p: 'Không tăng lợi nhuận (A), không giảm thời gian sản xuất (D) nên không tăng doanh số (C); công ty sẽ cần thuê thêm nhân viên → B' },
        28: { v: 'Như câu 27 (chọn 2 đáp án).', t: ['However, the system is capable of doing the work of hundreds of people.', 'This would, therefore, significantly lower labour costs.'], p: 'Hệ thống làm việc của hàng trăm người → giảm mạnh chi phí nhân công → E' },
        29: { v: 'Khi bàn tác động tới khách hàng mới.', t: 'I think the major benefit of the new system is that it enables staff to design the furniture in front of the client, which allows them to get a lot more involved in the design.', p: 'Nhân viên thiết kế ngay trước mặt khách → khách tham gia nhiều hơn vào thiết kế → A' },
        30: { v: 'Như câu 29 (chọn 2 đáp án).', t: ['The system is very interactive and allows clients to easily browse the furniture catalogue, which will save them a lot of time.'], p: 'Không kết nối từ nhà được (C), không thêm liên hệ (B), không giảm chi phí nhân công (E); khách tiết kiệm nhiều thời gian → D' },
      },
    },
    {
      part: 4, title: 'Photic Sneezing', audio: 'listening/test 4/04 Track 4 (6).wma', clip: [0, 316.5], cover: 'sneezing sunlight | bright sun sky',
      transcript: `
Welcome to this lecture in the Health Sciences, intended to inspire you and get you thinking about your research project.
Today, I want to show you how even ordinary human behaviour like sneezing, which normally happens when you get a cold, may be worth studying.
Have you ever been walking outside when a bright shaft of sunlight hits you between the eyes?
The reaction of some people is immediate.
An unpleasant prickling in the nose, an increase in their breathing rate, and an uncontrollable watering of the eyes.
Then, almost as quickly, they sneeze and gain relief.
This may happen every time they go into the sun.
This so-called photic, or light, sneeze is a reflex, which means it can't be controlled, and it's very common.
Anything between one in ten and one in three people might be affected.
In fact, a sneeze is triggered by an irritation of some sort in the linings of the nostrils.
The result is a cascade of reactions, beginning with the stimulation of the nerve endings all over the face, and generating an explosive expulsion of air at up to 95 miles an hour, like an extremely localised personal hurricane.
The body's coordination of such reactions is complicated, and belongs to the subconscious control hardware that regulates other things, for example, tears in the eyes.
People have been interested in the phenomenon of photic sneezing for thousands of years.
The Greek philosopher Aristotle asked: why does the sun prompt us to sneeze, whereas the heat of a fire does not?
A partial answer came 2,000 years later, when the English philosopher Francis Bacon showed that his photic sneeze had nothing to do with heat.
If he closed his eyes when going into the sun, he didn't sneeze, even though the heat was still there.
Henry Everett, a consultant psychiatrist at Johns Hopkins University Hospital in Baltimore, was the first to make a systematic attempt to understand the condition.
Noting in 1964 that 30% of the staff employed in the medical department were photic sneezers, Everett did some further investigation.
He found that while 80% of sneezers reported other sneezers among their relatives, only 20% of non-sneezers did.
Now, there are factors that are certain indicators of a photic sneeze.
First of all, those with the condition almost always sneeze a set number of times on exposure to light.
In addition to this, the sneeze depends on a contrast in visible brightness, such as when the sun moves out from behind a cloud.
And the sneezing fit won't be repeated immediately.
The body needs time before it can be recharged.
So if you go back into a darkened space and then immediately re-enter bright light, you will not sneeze again.
Now, on to possible applications of research in this area.
The photic sneeze had long been overlooked because its effects are generally less than serious, although the government did once study it as a risk factor for pilots.
Yet work on such a simple disorder might lead to important discoveries on more acute conditions, such as migraine or epilepsy, which are also caused by crossed wires in the nervous system.
That is why I encourage you to select something similar for your first investigative medical project.
It could be the beginning of something even more useful.
Now, let's talk about the project timetable.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Photic sneezing', [
          '<strong>Background</strong>',
          'Some people react to sunlight by:',
          '• a prickle in the nose',
          '• faster __Q31__',
          '• watery eyes',
          '(relieved by a sneeze)',
          "This 'photic' sneeze cannot be controlled and is a __Q32__ reflex.",
          '<strong>Sneezing in general</strong>',
          '• A sneeze is caused by some kind of irritation in the nose.',
          '• Nerve endings in the __Q33__ are stimulated, leading to an explosion of air.',
          '• It is co-ordinated by the same mechanism that controls the production of __Q34__',
          '<strong>Research into photic sneezing</strong>',
          'The condition has been known for thousands of years.',
          'Aristotle: Why does the sun cause sneezing while a __Q35__ does not?',
          'Bacon showed the cause was light.',
          'Everett found 80% of photic sneezers shared the habit with __Q36__',
          '<strong>Indicators</strong>',
          'Photic sneezers usually produce the same __Q37__ of sneezes.',
          'The reaction is caused by a __Q38__ in brightness.',
          'The sneeze takes __Q39__ to recharge.',
          '<strong>Application</strong>',
          'The condition was often ignored apart from some research on photic sneezing among __Q40__',
          'But studying it may result in breakthroughs for more serious conditions.',
        ], { 31: 'breathing', 32: 'common', 33: 'face', 34: 'tears', 35: 'fire', 36: 'relatives', 37: 'number', 38: 'contrast', 39: 'time', 40: 'pilots' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi mô tả phản ứng với ánh nắng.', t: 'An unpleasant prickling in the nose, an increase in their breathing rate, and an uncontrollable watering of the eyes.', p: '“An increase in their breathing rate” = faster breathing → breathing' },
        32: { v: 'Khi định nghĩa hắt hơi do ánh sáng.', t: "This so-called photic, or light, sneeze is a reflex, which means it can't be controlled, and it's very common.", p: 'Là phản xạ không kiểm soát được và rất phổ biến → common' },
        33: { v: 'Khi nói về hắt hơi nói chung.', t: 'The result is a cascade of reactions, beginning with the stimulation of the nerve endings all over the face', p: 'Đầu dây thần kinh khắp mặt bị kích thích; lỗ mũi là nơi gây kích ứng (bẫy) → face' },
        34: { v: 'Khi nói về cơ chế điều phối.', t: "The body's coordination of such reactions is complicated, and belongs to the subconscious control hardware that regulates other things, for example, tears in the eyes.", p: 'Cùng cơ chế điều khiển việc tiết nước mắt → tears' },
        35: { v: 'Câu hỏi của Aristotle.', t: 'why does the sun prompt us to sneeze, whereas the heat of a fire does not?', p: 'So sánh mặt trời với hơi nóng của lửa → fire' },
        36: { v: 'Nghiên cứu của Everett.', t: 'He found that while 80% of sneezers reported other sneezers among their relatives, only 20% of non-sneezers did.', p: '80% người hắt hơi có người thân cũng vậy; 30% là tỉ lệ nhân viên (bẫy) → relatives' },
        37: { v: 'Dấu hiệu thứ nhất.', t: 'First of all, those with the condition almost always sneeze a set number of times on exposure to light.', p: '“A set number of times” = cùng một số lần hắt hơi → number' },
        38: { v: 'Dấu hiệu thứ hai.', t: 'In addition to this, the sneeze depends on a contrast in visible brightness, such as when the sun moves out from behind a cloud.', p: 'Phụ thuộc vào sự tương phản độ sáng → contrast' },
        39: { v: 'Dấu hiệu thứ ba.', t: ["And the sneezing fit won't be repeated immediately.", 'The body needs time before it can be recharged.'], p: 'Cơ thể cần thời gian để “nạp lại” → time' },
        40: { v: 'Phần ứng dụng.', t: 'The photic sneeze had long been overlooked because its effects are generally less than serious, although the government did once study it as a risk factor for pilots.', p: 'Bị bỏ qua, trừ một nghiên cứu của chính phủ coi đây là rủi ro với phi công → pilots' },
      },
    },
  ],
};
