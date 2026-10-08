// Vol 4 – Test 9 (PDF "listening/test 9/listening- up.pdf" p1–6; key xlsx sheet Test 9; audio test 9/01–04.MP3 — 01 clipped
// from "Now turn to Section 1", 04 cut after "half a minute to check" (10-minute silence follows)).
// Transcript: P1 has no Otter PDF → Whisper (+ wb.js) only; P2–P4 Whisper + Otter (Part N Cau …pdf, split in two PDFs),
// written out with turns; gaps re-heard with wb.js.
// Source errors fixed: key Q29 "A" → B (Whisper + Otter: "I'm just amazed the management allowed it. I'm sure all the staff
// love to get away from their desks" — surprising, not unpopular); paper Q6 and Q9 lost their numbers (restored).
const { note, mc, multi, map } = require('../vol_build');

module.exports = {
  vol: 4, test: 9,
  sections: [
    {
      part: 1, title: 'Getting a Job with an Airline', audio: 'listening/test 9/01.MP3', clip: [41.8, 481], cover: 'cabin crew flight attendant | airplane cabin',
      transcript: `
Greg:
Hello?
Ellie:
Oh, hello.
This is Ellie Fisher.
We were at school together.
Greg:
Oh, hi Ellie.
How are you?
What are you doing these days?
Ellie:
Well, actually, I'm looking for a job and I was wondering about applying to an airline.
You know, looking after the passengers.
And I heard you're doing something like that.
Greg:
Yeah, I'm working as a cabin crew attendant.
Ellie:
Right.
So what does that involve?
Greg:
Well, you might have to give them the initial safety demonstration before take-off, for example.
You've probably seen that when you've made a journey by air.
Ellie:
Actually, I've never flown, but I'd love to.
That's why I'd like a job with an airline.
Greg:
Oh, right.
And during the flight, you'd also be going round to see if anyone wants to buy anything.
Ellie:
So I'd be dealing with money?
Greg:
That's right.
You'd be responsible for that.
And then, of course, you'd be serving meals and snacks and things.
Ellie:
OK.
So can anyone apply?
Greg:
Well, there are certain requirements.
You must be at least 19 years old, and there's also a minimum height, that's 168 centimetres.
That's to make sure you can reach the higher cupboards in the plane.
Ellie:
Right.
I'm 169 centimetres, I think.
What about qualifications?
Greg:
You need to show that you have a good level of English, that's written and spoken, and also maths.
Ellie:
OK.
Well, I passed my exams in both those subjects, fortunately.
Greg:
And it's an advantage if you can speak another language, although for cabin crew it's not essential.
Ellie:
I can speak Spanish.
I did that at school until I was 16.
Greg:
Excellent.
That'll be very useful.
Ellie:
And I'm pretty fit.
I don't have any medical problems.
Greg:
OK.
Oh, and can you swim?
Ellie:
Yes.
Greg:
Good, because that's another requirement.
Now, if you're accepted, you'll get a six-week training course.
Ellie:
Right.
Greg:
So that'll cover all aspects of the job, all the basic things you need to know, and then some special things, like what action to take if a passenger suddenly has some sort of illness while you're in the air, for example.
Ellie:
Right.
I suppose you can't always count on a doctor being on board.
Greg:
No.
And then you'll have to do a lot of work during the training on becoming aware of the variety of cultures that your passengers may come from and the implications of that.
Ellie:
That's really interesting, actually.
OK.
Well, I'd definitely like to apply.
Um, what airline do you actually work for?
Greg:
It's a small airline called Eurontas.
That's E-U-R-O-N-T-A-S.
Ellie:
Is that N or M in the middle?
Greg:
N for November.
Ellie:
OK.
Greg:
They're good people to work for.
Have a look at their website.
You can download the application form from there.
Ellie:
Right.
I don't have much in the way of experience, though.
Greg:
Well, what have you done since leaving school?
Ellie:
I worked in a supermarket for a bit, on the information desk.
I was helping deal with queries from customers.
Greg:
OK, put that down.
That's one of the most important aspects of the job, in fact.
Ellie:
Oh, right.
And last year, I also did some voluntary work as part of a team.
Should I put that down, too?
Greg:
Of course.
That's something else they'll be looking for, being able to work with others.
Ellie:
Right.
Greg:
And a lot of airlines expect you to pay for your own uniform, but the good thing about this airline is that they provide it for you.
Ellie:
Great!
Well, thanks so much, Greg.
I really...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Getting a job with an airline', [
          'Example – Job: cabin crew attendant',
          '<strong>Duties include</strong>',
          '• giving the safety demonstration',
          '• some responsibility for __Q1__ from sales during the flight',
          '• serving food',
          '<strong>Requirements</strong>',
          '• must be over age 19 and at least __Q2__ cm tall',
          '• basic academic requirements: English and __Q3__',
          '• at least one other __Q4__ is desirable',
          '• must be able to __Q5__',
          '<strong>Training will include</strong>',
          '• what to do in case of __Q6__ during a flight',
          '• awareness of different __Q7__',
          '<strong>Application</strong>',
          '• the airline is called __Q8__',
          '• can download application form from website',
          '• mention experience of:',
          '– dealing with questions from supermarket customers',
          '– working in a __Q9__ (voluntary work)',
          '<strong>Other information</strong>',
          "• you don't have to buy a __Q10__",
        ], { 1: 'money', 2: '168', 3: 'maths/math/mathematics', 4: 'language', 5: 'swim', 6: 'illness', 7: 'cultures', 8: 'Eurontas', 9: 'team', 10: 'uniform' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Greg kể các nhiệm vụ trên chuyến bay.', t: ["And during the flight, you'd also be going round to see if anyone wants to buy anything.", "So I'd be dealing with money?", "That's right.", "You'd be responsible for that."], p: 'Bán hàng trên chuyến bay → chịu trách nhiệm về tiền → money' },
        2: { v: 'Khi nói về yêu cầu chiều cao.', t: ["You must be at least 19 years old, and there's also a minimum height, that's 168 centimetres.", "I'm 169 centimetres, I think."], p: 'Chiều cao tối thiểu 168 cm; 169 là chiều cao của Ellie (bẫy) → 168' },
        3: { v: 'Khi hỏi về bằng cấp.', t: "You need to show that you have a good level of English, that's written and spoken, and also maths.", p: 'Ngoài tiếng Anh cần môn toán → maths' },
        4: { v: 'Ngay sau đó.', t: "And it's an advantage if you can speak another language, although for cabin crew it's not essential.", p: '“An advantage” = desirable; biết thêm một ngoại ngữ → language' },
        5: { v: 'Khi hỏi về thể lực.', t: ['Oh, and can you swim?', "Good, because that's another requirement."], p: 'Biết bơi là một yêu cầu bắt buộc → swim' },
        6: { v: 'Khi nói về khoá đào tạo.', t: 'like what action to take if a passenger suddenly has some sort of illness while you\'re in the air, for example.', p: 'Học cách xử lý khi hành khách bị ốm trên máy bay → illness' },
        7: { v: 'Ngay sau đó.', t: 'And then you\'ll have to do a lot of work during the training on becoming aware of the variety of cultures that your passengers may come from', p: '“Becoming aware of the variety of cultures” = awareness of different cultures → cultures' },
        8: { v: 'Khi Ellie hỏi tên hãng hàng không.', t: ["It's a small airline called Eurontas.", "That's E-U-R-O-N-T-A-S.", 'N for November.'], p: 'Tên hãng được đánh vần, chữ N (không phải M) → Eurontas' },
        9: { v: 'Khi nói về kinh nghiệm.', t: 'And last year, I also did some voluntary work as part of a team.', p: 'Công việc tình nguyện theo nhóm → working in a team → team' },
        10: { v: 'Cuối bài.', t: 'And a lot of airlines expect you to pay for your own uniform, but the good thing about this airline is that they provide it for you.', p: 'Hãng này cấp đồng phục → không phải tự mua → uniform' },
      },
    },
    {
      part: 2, title: 'Hospitality Scholarships in Scotland', audio: 'listening/test 9/02.MP3', cover: 'hotel reception staff | Scotland hotel hospitality',
      transcript: `
Hi, my name's Marie Cooper, and I'm here to tell you about the scholarships offered by the hospitality industry in Scotland.
The scholarship scheme supports people currently working in hotels, resorts and tourist attractions.
Each year, 100 people are selected to go and work in some of the leading hospitality organisations in the world.
This time last year, I was wondering whether to apply for a scholarship, and not sure if I had enough experience to be successful.
I needn't have worried.
The scholarship is open to people of all ages working full-time in the industry.
The only stipulation is that you need to have worked for three years in hospitality, not necessarily for the same organisation.
Of course, they're looking for ambitious people who want to get on, but who haven't had the chance to work in management or studied at college, so there are no minimum qualifications required.
And you're just as likely to be offered a scholarship if you work for a large fancy hotel in Edinburgh or a small family hotel in the Highlands.
As we all know, Scotland is famous for its fishing, golf, coastline and unspoilt countryside, which is why it's always been a popular destination for tourists from all over the world.
Something like 10% of people in Scotland depend on the Scottish hospitality industry for their income, so it's vital that it continues to attract large numbers of visitors each year.
The scholarships are a way of maintaining Scotland's reputation as a quality destination, so that visitors to Scotland continue to have a very positive experience.
I currently work at the Rock Hotel in Perth as a trainee manager, but I joined as a receptionist five years ago.
At the time, I was looking for work that fitted in with a young family, and I was lucky to get the perfect job for me, where I could take time off during the school holidays.
I realised soon after I started that I loved working with people and enjoyed working in a hotel environment.
Last year, I was lucky enough to be a scholarship winner.
The application process was actually quite simple.
I was worried I'd have to give a presentation in front of loads of people, but you just have to produce a report on your current place of employment, saying how you think you could make a difference there.
My manager at the Rock Hotel was very supportive and gave me time off to do the writing and the research.
Then all the winners were invited to an awards ceremony.
They were mostly working in different sorts of hotels, although a few were working at tourist attractions, and one was involved in the Edinburgh Festival.
I'd expected I'd be one of the youngest, but at least half the people were younger than me.
All the people I met couldn't believe their luck that they'd been successful, as it's not unusual to fail the first time.
I was sent to the Florida Beach Hotel.
Here, the emphasis is on customer service, making sure that staff are trained to give customers a really personal service, checking that guests are enjoying their stay, so they're encouraged to chat with them even if their job is just clearing tables.
Quite a different atmosphere to some hotels I know, where the emphasis is on efficiency, which can make the guests feel in the way.
One of the things we were encouraged to do while we were on our placements was to find out what people thought about visiting Scotland.
That was quite interesting.
Although everyone I spoke to knew a bit about Scotland, the majority had never considered a holiday there.
And of the people who were thinking of visiting Scotland, they were really only interested in visiting Edinburgh and St Andrews.
Anyway, on my return to the Rock Hotel, my manager asked me to introduce some improvements, and the first thing I did was to redraft our customer survey form to get guests' detailed opinions.
This used to be given to customers at the end of their stay, when they're in a rush to leave, so I decided it would be better to email them to customers at home, so they have more time to complete them.
It's another way of staying in contact with them, too.`,
      groups: [
        multi('Choose TWO letters, A-E.', 11, 'Which TWO kinds of people are the scholarships intended for?', ['people working as temporary staff', 'people with management experience', 'people straight from college', "people with at least three years' experience", 'people with or without qualifications'], ['D', 'E'], 'Questions 11-12'),
        multi('Choose TWO letters, A-E.', 13, 'Which TWO things does Marie say about the hospitality industry in Scotland?', ['It mainly attracts UK tourists.', 'It pays high wages.', 'It is very important for the Scottish economy.', 'It is highly regarded by visitors.', 'It is attracting a lot of investment.'], ['C', 'D'], 'Questions 13-14'),
        mc('Choose the correct letter, A, B or C.', [
          [15, 'Why did Marie start working at the Rock Hotel?', ['It was the only job available.', 'She needed a job with flexible working hours.', 'She wanted a job working with people.'], 'B'],
          [16, 'What did the scholarship application process involve?', ['giving a presentation', 'writing a report about the Rock Hotel', 'researching the role of hotel manager'], 'B'],
          [17, 'What does Marie say about the other winners she met?', ['They were not as old as she expected.', 'They were doing a variety of jobs in the hotel sector.', 'Most of them had applied for scholarships before.'], 'A'],
          [18, 'Marie says that at the Florida Beach Hotel, every member of staff', ['takes part in annual customer service training sessions.', 'is responsible for providing an efficient service.', 'is expected to interact with visitors.'], 'C'],
          [19, "What did Marie find out about people's attitude to visiting Scotland?", ['Most people would be interested in visiting it.', 'People knew a surprising amount about it.', 'People only wanted to see a limited number of places.'], 'C'],
          [20, 'What improvement has Marie introduced at the Rock Hotel?', ['getting better feedback from customers', 'providing more information for customers', 'making contact with more customers'], 'A'],
        ], 'Questions 15-20'),
      ],
      expl: {
        11: { v: 'Khi nói ai được nhận học bổng.', t: 'The only stipulation is that you need to have worked for three years in hospitality, not necessarily for the same organisation.', p: 'Điều kiện duy nhất: làm trong ngành 3 năm, toàn thời gian (A sai) → D' },
        12: { v: 'Như câu 11 (chọn 2 đáp án).', t: "but who haven't had the chance to work in management or studied at college, so there are no minimum qualifications required.", p: 'Dành cho người chưa làm quản lý/chưa học cao đẳng (B, C sai); không yêu cầu bằng cấp tối thiểu → có hay không có bằng cấp đều được → E' },
        13: { v: 'Khi nói về ngành du lịch – khách sạn ở Scotland.', t: "Something like 10% of people in Scotland depend on the Scottish hospitality industry for their income, so it's vital that it continues to attract large numbers of visitors each year.", p: 'Khoảng 10% người dân sống nhờ ngành này → rất quan trọng với kinh tế Scotland; khách đến từ khắp thế giới (A sai) → C' },
        14: { v: 'Như câu 13 (chọn 2 đáp án).', t: "The scholarships are a way of maintaining Scotland's reputation as a quality destination, so that visitors to Scotland continue to have a very positive experience.", p: 'Duy trì danh tiếng là điểm đến chất lượng → được du khách đánh giá cao → D' },
        15: { v: 'Khi Marie kể lý do vào làm ở Rock Hotel.', t: ['At the time, I was looking for work that fitted in with a young family, and I was lucky to get the perfect job for me, where I could take time off during the school holidays.', 'I realised soon after I started that I loved working with people'], p: 'Thích làm việc với con người là điều nhận ra sau khi vào làm (bẫy C); lý do là cần công việc linh hoạt cho gia đình có con nhỏ → B' },
        16: { v: 'Khi nói về quy trình nộp đơn.', t: "I was worried I'd have to give a presentation in front of loads of people, but you just have to produce a report on your current place of employment, saying how you think you could make a difference there.", p: 'Lo phải thuyết trình (bẫy A); thực ra chỉ cần viết báo cáo về nơi đang làm (Rock Hotel) → B' },
        17: { v: 'Khi kể về lễ trao giải.', t: "I'd expected I'd be one of the youngest, but at least half the people were younger than me.", p: 'Marie tưởng mình trẻ nhất nhưng một nửa trẻ hơn → họ không lớn tuổi như cô nghĩ; trượt lần đầu là chuyện thường chứ không phải đa số đã nộp trước (C sai) → A' },
        18: { v: 'Khi nói về Florida Beach Hotel.', t: "checking that guests are enjoying their stay, so they're encouraged to chat with them even if their job is just clearing tables.", p: 'Mọi nhân viên, kể cả người dọn bàn, đều được khuyến khích trò chuyện với khách; “efficiency” là của khách sạn khác (bẫy B) → C' },
        19: { v: 'Khi nói về khảo sát quan điểm về Scotland.', t: ['Although everyone I spoke to knew a bit about Scotland, the majority had never considered a holiday there.', 'And of the people who were thinking of visiting Scotland, they were really only interested in visiting Edinburgh and St Andrews.'], p: 'Chỉ biết sơ qua (B sai), đa số chưa từng nghĩ tới (A sai); người muốn đến chỉ quan tâm Edinburgh và St Andrews → C' },
        20: { v: 'Cuối bài, cải tiến ở Rock Hotel.', t: ["and the first thing I did was to redraft our customer survey form to get guests' detailed opinions.", 'so I decided it would be better to email them to customers at home, so they have more time to complete them.'], p: 'Sửa phiếu khảo sát, gửi email để khách có thời gian trả lời → nhận phản hồi tốt hơn; giữ liên lạc chỉ là lợi ích phụ (bẫy C) → A' },
      },
    },
    {
      part: 3, title: 'Education House', audio: 'listening/test 9/03.MP3', cover: 'green office building | eco building facade plants',
      transcript: `
Debbie:
Hi, John.
John:
Hi, Debbie.
Should we get ready for our presentation?
Debbie:
Yes.
Well, we have to give a presentation to our seminar group about Education House, the new government building that uses cooling, heating and water in an environmentally friendly way.
John:
Let's start with a diagram of the building, so the other students can see what it looks like.
Debbie:
Well, here's a very simplified diagram with symbols to represent key areas of the design.
Shall we look at it and see if we can explain the different processes?
John:
Yes.
Firstly, on the left-hand side of the roof, there's a cooling tower.
Debbie:
Yes.
This is where hot, stale air from inside the building rises naturally up a chimney.
There are exhaust fans mounted on the roof that push the air out.
John:
OK.
Moving along the top of the roof to the right-hand side, we have the weather station.
This monitors how cool the outside air is.
Once this is assessed, then the information is fed to computers, and these activate the necessary heating or cooling processes.
Debbie:
OK.
Let's talk now about the cooling processes.
On the right-hand side of the building, below the timber shutters, is the part they call the shower tower.
This is where water falls through a three-storey tube, sucking in air from outside as it falls.
The unusual thing about it is this fresh air actually helps to cool the building.
John:
Yes, it's amazing, really.
OK, below ground level, in the basement on the right-hand side, is a tank, which forms another part of the cooling process.
Debbie:
So the tank is full of small metal balls.
Water passes through this tank.
Each time it does this, the balls absorb the heat from the water, making it cooler without using any energy.
What shall we talk about next?
John:
Well, you see the balcony below the light shelf?
Debbie:
What happens there?
John:
Rainwater is fed down from the roof, and this is where it's used to water the plants that cover the outside wall.
Debbie:
What about the square above the light shelf?
It represents a window, doesn't it?
John:
Yes, that's important to point out, because the upper floor windows get more daylight than the lower floor ones.
The windows at the top of the building are smaller than those at the bottom.
This means energy is saved higher up in the building, because not as much heat is wasted through large windows.
Debbie:
Let's continue the presentation by giving our opinions on some of the features of the building.
Let's talk about what we thought was surprising about the building.
John:
Yes, it's not out of the ordinary in terms of size.
I mean, it's well under the height of the surrounding buildings.
Debbie:
Also, in the past, I think people would have been surprised by the vegetation on the facades, but that's become quite common now.
John:
That's right, but we both agreed that the access to the building through a shopping arcade is quite unusual.
Debbie:
Yes, the way in is behind a small cafe, which is not what you'd expect.
Now, should we mention the findings on staff productivity in the building?
John:
According to one article, the access to greenery and vegetation is increasing productivity by relieving stress.
Debbie:
Yes, I remember that article.
Researchers have been monitoring this for a couple of years now, so the results are clear.
But to be honest, I think it's pretty obvious that you feel calmer seeing greenery around you.
John:
Yes, we've been reading that in newspapers for ages, haven't we?
So I wouldn't bother to mention it.
Debbie:
OK.
So, we haven't mentioned the edge space yet.
You know, the place that's been marked for social interaction between workers, where you can have a coffee and a chat.
What are your thoughts about it?
John:
Well, I'm just amazed the management allowed it.
I'm sure all the staff love to get away from their desks.
I would.
I'm just not sure how much work I'd get done if I had an edge space to go to.
Debbie:
I agree.
OK, let's think about the water system now.
They want to supply 100% of their own non-drinking water needs by recycling water, and it looks like they are on target to complete this stage of the project by early next year.
John:
But, you know, I don't think the staff are going to respond well to this.
Debbie:
I agree.
People just don't like using too much recycled water, even though it's been proven to pose no health risks whatsoever.
Well, I've really enjoyed researching this building.`,
      groups: [
        map('Label the diagram below.\nChoose SIX answers from the box and write the correct letter, A-I, next to Questions 21-26.', [
          [21, 'Cooling Tower', 'F'],
          [22, 'Weather Station', 'G'],
          [23, 'Shower Tower', 'B'],
          [24, 'Tank', 'H'],
          [25, 'Balcony', 'E'],
          [26, 'Windows', 'C'],
        ], { pdf: 'listening/test 9/listening- up.pdf', page: 4, box: [120, 198, 505, 715] }, 'Questions 21-26'),
        mc('Choose the correct letter, A, B or C.', [
          [27, 'What do John and Debbie think will surprise visitors to the Education House building?', ['how high the building is', 'where the main entrance is', 'what is on the outside walls'], 'B'],
          [28, 'What is their reaction to the findings on staff productivity in the building?', ['They think the findings are predictable.', 'They believe more research should be done.', 'They suggest the findings are reported in the media.'], 'A'],
          [29, "What do they think about the 'edge space' in the building?", ['It might be unpopular with staff.', 'It is a surprising part of the design.', 'It is an area for managers.'], 'B'],
          [30, "What could be a problem for the building's water system?", ['the reaction of the staff', 'the completion date', 'the possible health hazards'], 'A'],
        ], 'Questions 27-30'),
      ],
      expl: {
        21: { v: 'Khi nói về tháp làm mát bên trái mái.', t: ['This is where hot, stale air from inside the building rises naturally up a chimney.', 'There are exhaust fans mounted on the roof that push the air out.'], p: 'Không khí nóng, cũ bốc lên và bị quạt đẩy ra ngoài → old air is removed → F' },
        22: { v: 'Khi nói về trạm thời tiết.', t: 'This monitors how cool the outside air is.', p: 'Theo dõi độ mát của không khí bên ngoài → kiểm tra nhiệt độ → G' },
        23: { v: 'Khi nói về “shower tower”.', t: ['This is where water falls through a three-storey tube, sucking in air from outside as it falls.', 'The unusual thing about it is this fresh air actually helps to cool the building.'], p: 'Nước rơi hút không khí ngoài trời vào → fresh air is pulled in → B' },
        24: { v: 'Khi nói về bể chứa dưới tầng hầm.', t: 'Each time it does this, the balls absorb the heat from the water, making it cooler without using any energy.', p: 'Bi kim loại hấp thụ nhiệt làm nước mát hơn → water temperature is reduced; bể không phải để chứa nước (bẫy I) → H' },
        25: { v: 'Khi nói về ban công.', t: "Rainwater is fed down from the roof, and this is where it's used to water the plants that cover the outside wall.", p: 'Nước mưa được dùng để tưới cây → rainwater is used → E' },
        26: { v: 'Khi nói về cửa sổ.', t: ['The windows at the top of the building are smaller than those at the bottom.', 'This means energy is saved higher up in the building, because not as much heat is wasted through large windows.'], p: 'Cửa sổ tầng trên nhỏ hơn → ít thất thoát nhiệt → heat loss is reduced → C' },
        27: { v: 'Khi bàn điều gây bất ngờ.', t: ["Yes, it's not out of the ordinary in terms of size.", "but that's become quite common now.", 'That\'s right, but we both agreed that the access to the building through a shopping arcade is quite unusual.'], p: 'Chiều cao bình thường (A sai), cây trên tường nay đã phổ biến (C sai); lối vào qua khu mua sắm, sau quán cà phê là bất ngờ → B' },
        28: { v: 'Khi bàn kết quả về năng suất nhân viên.', t: ["But to be honest, I think it's pretty obvious that you feel calmer seeing greenery around you.", "Yes, we've been reading that in newspapers for ages, haven't we?"], p: 'Kết quả đã rõ (B sai), báo chí viết từ lâu (C sai); hai bạn thấy điều đó hiển nhiên → dễ đoán → A' },
        29: { v: 'Khi bàn về “edge space”.', t: ["Well, I'm just amazed the management allowed it.", "I'm sure all the staff love to get away from their desks."], p: 'Nhân viên chắc chắn thích (A sai); John ngạc nhiên vì ban quản lý cho phép → một phần thiết kế gây bất ngờ → B (key gốc ghi A là sai)' },
        30: { v: 'Cuối bài, về hệ thống nước.', t: ["But, you know, I don't think the staff are going to respond well to this.", "People just don't like using too much recycled water, even though it's been proven to pose no health risks whatsoever."], p: 'Đúng tiến độ (B sai), đã chứng minh không nguy hại (C sai); vấn đề là phản ứng của nhân viên → A' },
      },
    },
    {
      part: 4, title: 'Textiles with Business Studies', audio: 'listening/test 9/04.MP3', clip: [0, 351], cover: 'textile design studio | knitted woven fabric',
      transcript: `
Thank you, first of all, for coming along to the University's Open Day, and in particular for coming to this talk to find out about our course in Textiles with Business Studies.
The cooperation between the Faculty of Arts and Architecture and the Business Faculty enables us to offer this undergraduate and integrated Master's course.
In the five years this course has been running, we've learned a lot, and it's become very popular.
Now, thanks to the Faculty of Engineering, we're also able to offer a really exciting opportunity to those who would like to further diversify and would like to carry their learning through into new disciplines.
Now, the aims of this course are firstly to create innovative and highly motivated textile practitioners within the disciplines of knitted textiles, an increasingly popular area, as you will have seen on the catwalks, printed and, of course, woven textiles.
Secondly, we also ensure that our students gain an in-depth knowledge and understanding of related business operations.
We make sure that our students have sufficient hands-on experience by arranging interesting and relevant work placements.
The focus of the integrated component of the work placement is the global market.
Our aim is to locate studio work in this increasingly important context.
Moving on to what we do in each year.
In the first year, students explore the three subject areas of textiles in rotation.
The emphasis for the first year is experimentation, and we ask for evidence of visual research, which must be supported by documentation and proposals for its application.
In year two, design and technical skills are related to the real world.
Unlike many other university textile courses these days, we give our students the opportunity to choose an extra module on the traditional processes of design, which gives a historical perspective on their work.
This can be done before introducing students to computer-aided design.
Students at this point, Year 2, decide if they intend to complete the course at Year 3 with a BA, or progress to Year 4 and conclude with a Master's in Design.
Students can also have tutorials if they feel they need help making this important decision.
This reflects our commitment to student support at all times.
Year three consolidates the knowledge gained, using a particular learning style.
It's called reflective practice.
That means you look back on what you've done and analyse it.
This helps and encourages deeper understanding.
Students produce a dissertation on a topic of their own choosing and a portfolio of their textile collection.
Also, to help underpin the commercial aspect of the course, we ask for a business plan.
On the subject of career opportunities, many graduates work directly within the textile business, with careers commonly found as stylists and retail managers.
However, it shouldn't be forgotten that there are many other exciting opportunities out there, for example, careers in journalism, for those with a flair for words, or trend forecasting, for those with their eye on the future.
We are certain that we shall see broader and more varied opportunities for our graduates.
If you like what you've heard today and are thinking of applying for the programme, and you'd like to talk to us further, please come back tomorrow.
You'll have the opportunity to do a brief interview where we'll be able to assess your aptitude for this subject area.
Many students who haven't studied related subjects may be surprised to find that they're quite well suited to our programme.
After that, of course, you'll need to go through the usual application procedures.`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Textiles with Business Studies', [
          '<strong>New development</strong>',
          '• Now possible to work with the __Q31__ Faculty to widen learning opportunities',
          '<strong>Aims of course</strong>',
          '• To cover three areas of textiles: knitted, __Q32__, woven',
          '• To focus on related business operations',
          '• Work placement: focus on studio work in the context of the __Q33__',
          '<strong>Course content</strong>',
          '<em>Year One: experimentation</em>',
          'Visual research with __Q34__ and suggestions for its application',
          '<em>Year Two: relating skills to the real world</em>',
          'Optional course: __Q35__ design processes',
          'Three- or four-year course? Students are offered __Q36__ to help them make their decision.',
          '<em>Year Three: consolidation</em>',
          'Learning style: __Q37__ practice',
          'Students produce: a dissertation, a portfolio, a __Q38__',
          '<strong>Career opportunities</strong>',
          'Within textile business – e.g. stylists, retail managers',
          'Further opportunities – jobs in __Q39__ and trend forecasting',
          'If interested – come back tomorrow for a short __Q40__',
        ], { 31: 'Engineering', 32: 'printed', 33: 'global market', 34: 'documentation', 35: 'traditional', 36: 'tutorials', 37: 'reflective', 38: 'business plan', 39: 'journalism', 40: 'interview' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần phát triển mới.', t: "Now, thanks to the Faculty of Engineering, we're also able to offer a really exciting opportunity to those who would like to further diversify", p: 'Khoa Nghệ thuật – Kiến trúc và Kinh doanh là hợp tác sẵn có (bẫy); điểm mới là khoa Kỹ thuật → Engineering' },
        32: { v: 'Mục tiêu khoá học.', t: 'within the disciplines of knitted textiles, an increasingly popular area, as you will have seen on the catwalks, printed and, of course, woven textiles.', p: 'Ba mảng: dệt kim, in và dệt thoi → printed' },
        33: { v: 'Khi nói về thực tập.', t: ['The focus of the integrated component of the work placement is the global market.', 'Our aim is to locate studio work in this increasingly important context.'], p: 'Đặt công việc xưởng trong bối cảnh thị trường toàn cầu → global market' },
        34: { v: 'Năm thứ nhất.', t: 'The emphasis for the first year is experimentation, and we ask for evidence of visual research, which must be supported by documentation and proposals for its application.', p: 'Nghiên cứu hình ảnh kèm tài liệu và đề xuất ứng dụng → documentation' },
        35: { v: 'Năm thứ hai, môn tự chọn.', t: 'we give our students the opportunity to choose an extra module on the traditional processes of design, which gives a historical perspective on their work.', p: 'Học phần tự chọn về quy trình thiết kế truyền thống; thiết kế bằng máy tính là phần học sau (bẫy) → traditional' },
        36: { v: 'Khi chọn học 3 hay 4 năm.', t: 'Students can also have tutorials if they feel they need help making this important decision.', p: 'Có các buổi hướng dẫn (tutorials) giúp quyết định → tutorials' },
        37: { v: 'Năm thứ ba.', t: ['Year three consolidates the knowledge gained, using a particular learning style.', "It's called reflective practice."], p: 'Phong cách học “thực hành phản tư” → reflective' },
        38: { v: 'Sản phẩm năm thứ ba.', t: 'Also, to help underpin the commercial aspect of the course, we ask for a business plan.', p: 'Ngoài luận văn và hồ sơ tác phẩm còn có kế hoạch kinh doanh → business plan' },
        39: { v: 'Cơ hội nghề nghiệp.', t: 'for example, careers in journalism, for those with a flair for words, or trend forecasting, for those with their eye on the future.', p: 'Ngoài ngành dệt may: báo chí và dự báo xu hướng → journalism' },
        40: { v: 'Cuối bài.', t: ["please come back tomorrow.", "You'll have the opportunity to do a brief interview where we'll be able to assess your aptitude for this subject area."], p: '“A brief interview” = buổi phỏng vấn ngắn ngày mai → interview' },
      },
    },
  ],
};
