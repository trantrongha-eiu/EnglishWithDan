// Vol 5 – Test 6 (PDF "Listening/Test 6/Test 6- up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p6; audio Test 6/P1–P4 —
// P4 cut ~2 s after "45 seconds to check" (the end-of-test announcement and transfer time follow)).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns, wb.js for gaps) checked against
// "Transcripts & Keys/test 6- transcripts.pdf". P3: the student is "Cathy" in the introduction, "Kathy" on the paper → paper.
// Source errors fixed: key Q35 A → B ("this means that the natural habitat of local aquatic life is reduced"; nothing on the
// recording about water levels getting too high); paper Q33 "growin" → grow in, Q37 "20t century" → 20th.
const { note, mc, matching, map, short } = require('../vol_build');

module.exports = {
  vol: 5, test: 6,
  sections: [
    {
      part: 1, title: 'Volunteer Work Application', audio: 'Listening/Test 6/P1.mp3', cover: 'volunteer interview office | community volunteers',
      transcript: `
William:
Hello, Grace.
I'm William.
Thanks for coming in for this interview.
It's very important for us to meet our volunteers in person.
Grace:
I understand.
It's no problem at all.
William:
OK, let's get started.
What's the best phone number to contact you on?
Grace:
My mobile phone's probably best.
The number's 021 636 7189.
But I can't always answer it during the day.
I'll give you my email address as well.
I check it frequently.
William:
OK, I'll make a note that email's a good way to contact you.
What's the address?
Grace:
It's graceb@travel.co.nz.
I chose it when I was younger and I just haven't changed it since.
It's easy to remember.
William:
Now, do you have any particular qualifications, Grace?
Grace:
I'm a housewife now, but I used to be in teaching.
I trained for that and got my diploma, although I haven't done it for years.
Before having children, I worked as a bank teller.
William:
All right.
I need to find out when you'll be available during the week.
You said you have children.
Are they at school?
Grace:
Yes, both of them are.
So I can't start work before 8.15 in the morning or work past 3 o'clock in the afternoon.
William:
So you'd be looking for about four or five hours a day, say 9.15am to 2pm?
That gives you time to get to and from school to work.
Grace:
That's perfect.
It's important for me to be there for my children.
William:
Of course.
And are you looking to work Monday to Friday?
Grace:
Yes.
If it gets to be too much, I can rethink it later.
William:
Now, Grace, you obviously have a lot of work experience, but have you done any volunteer work before?
Grace:
Um, during the Rugby World Cup, there were many visitors who didn't know their way around or what they should see and do in Auckland City.
So I worked as a guide to help introduce the city to tourists.
I really enjoyed it.
William:
OK, good.
Have you done anything else?
Perhaps when you were at school or university?
Did you do any volunteer work there?
Grace:
When I was at university, the manager of a netball team asked me to be the coach and I did that.
William:
Great.
It sounds like you like your sports.
Grace:
I used to, but not so much nowadays.
William:
OK.
If not sports, do you have any other interests?
Grace:
Oh, yes.
I love to get out in my garden and I grow most of my own vegetables.
I love flowers and flower arranging.
But I don't suppose there's much volunteer work associated with those kinds of things.
William:
You'd be surprised.
Any other hobbies?
Grace:
Like most people, I guess, I like music.
Actually, I can play the guitar, but I haven't done much for a while, so I'm a bit rusty.
One day I'd like to have a go at the flute.
William:
OK.
That gives me a good idea of the type of work you might be interested in.
Ideally, it'd be something that combines your experience and your hobbies.
If you're interested in something outdoors, I have a position helping out on a farm.
That's just for a month.
It's not too physically demanding, though it does require you to be on your feet all day.
And it'd be nice as long as the weather is fine, but I imagine it could be uncomfortable in the rain or the heat.
In the past, we've had many positions working in community centres.
They've been working with the disabled or teens.
The position we have available now is with elderly men and women.
They have activities like flower arranging, music lessons, sing-alongs, things like that.
Grace:
Both of those sound great.
I'm really open to anything.
William:
That's nice to know.
Just a couple more questions.
Why do you want to do volunteer work?
Grace:
Well, now that both my children are in school, I'd like to make some friends as I've got the time on my hands.
Also, I like the idea of helping others.
William:
And last question.
How did you find our agency?
We aren't in the phone book.
Did a friend tell you about us?
Grace:
No, I was on my way to school the other day and I saw your advertisement at the supermarket.
William:
It's good to know someone sees those ads.
Thank you again for coming...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Volunteer work application form: Grace Brown', [
          'Mobile phone number: 021 636 7189',
          'Email address: graceb@__Q1__.co.nz',
          '<strong>Qualification</strong>',
          '• a diploma in __Q2__',
          '<strong>Agreed work hours</strong>',
          '• from __Q3__ am to 2pm Monday to Friday',
          '<strong>Volunteer work experience</strong>',
          '• a volunteer city __Q4__',
          '• a volunteer netball team __Q5__',
          '• at Rugby World Cup',
          '<strong>Hobbies</strong>',
          '• likes to work in her __Q6__',
          '• enjoys flower arranging',
          '• plays the __Q7__',
          '<strong>Type of work offered</strong>',
          '• working on a __Q8__ for a month',
          '• working in a community centre with elderly people',
          '<strong>Why is she interested in volunteering?</strong>',
          '• wants to have more __Q9__',
          '• wants to help others',
          '<strong>Where did she hear about the agency?</strong>',
          '• saw an advertisement at the __Q10__',
        ], { 1: 'travel', 2: 'teaching', 3: '9.15/9:15', 4: 'guide', 5: 'coach', 6: 'garden', 7: 'guitar', 8: 'farm', 9: 'friends', 10: 'supermarket' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi địa chỉ email.', t: "It's graceb@travel.co.nz.", p: 'Tên miền email là “travel” → travel' },
        2: { v: 'Khi hỏi bằng cấp.', t: ["I'm a housewife now, but I used to be in teaching.", 'I trained for that and got my diploma', 'Before having children, I worked as a bank teller.'], p: 'Thu ngân ngân hàng chỉ là công việc cũ (bẫy); bằng cấp về sư phạm → teaching' },
        3: { v: 'Khi bàn giờ làm việc.', t: ["So I can't start work before 8.15 in the morning or work past 3 o'clock in the afternoon.", "So you'd be looking for about four or five hours a day, say 9.15am to 2pm?", "That's perfect."], p: '8.15 là giờ sớm nhất có thể (bẫy); chốt 9.15 sáng đến 2 giờ chiều → 9.15' },
        4: { v: 'Khi hỏi kinh nghiệm tình nguyện.', t: 'So I worked as a guide to help introduce the city to tourists.', p: 'Làm hướng dẫn viên giới thiệu thành phố trong World Cup bóng bầu dục → guide' },
        5: { v: 'Khi nói về thời đại học.', t: 'When I was at university, the manager of a netball team asked me to be the coach and I did that.', p: 'Làm huấn luyện viên đội bóng lưới → coach' },
        6: { v: 'Khi hỏi sở thích.', t: 'I love to get out in my garden and I grow most of my own vegetables.', p: 'Thích làm việc trong vườn → garden' },
        7: { v: 'Khi nói về âm nhạc.', t: ['Actually, I can play the guitar, but I haven\'t done much for a while', "One day I'd like to have a go at the flute."], p: 'Sáo chỉ là dự định (bẫy); chơi được guitar → guitar' },
        8: { v: 'Khi William giới thiệu công việc.', t: ["If you're interested in something outdoors, I have a position helping out on a farm.", "That's just for a month."], p: 'Phụ giúp ở trang trại trong một tháng → farm' },
        9: { v: 'Khi hỏi vì sao muốn làm tình nguyện.', t: "Well, now that both my children are in school, I'd like to make some friends as I've got the time on my hands.", p: 'Muốn kết thêm bạn → friends' },
        10: { v: 'Câu hỏi cuối.', t: ['Did a friend tell you about us?', 'No, I was on my way to school the other day and I saw your advertisement at the supermarket.'], p: 'Không phải bạn bè giới thiệu (bẫy); thấy quảng cáo ở siêu thị → supermarket' },
      },
    },
    {
      part: 2, title: 'Strawberry Farm – Talk to New Employees', audio: 'Listening/Test 6/P2.mp3', cover: 'strawberry picking farm | strawberry field rows',
      transcript: `
Hello, my name's Peter Blakewell and I'm the owner of the strawberry farm.
All of you are starting work here next week, so I thought it would be helpful if I explained a bit about the farm and what you'll be doing.
Well, the farm operates all year round, but summer is when we open to the public and people come here to pick their own strawberries as a family activity.
It's also our busiest period, which is why we need you for the next few months.
Well, first up, what do you need to bring for a long day?
You'll be working outside a lot, so fill up your water bottles at home and have them with you at all times.
You'll come in for lunch around one o'clock.
We'll be putting sandwiches out for you.
And there's also short morning and afternoon breaks.
Gloves should be worn at all times.
You'll find them in the packing shed.
Just make sure they get returned, please.
Now, if for some reason you can't come into work, there's a procedure to follow.
There's no point phoning the office.
By the time someone picks up your message, it'll be too late to find a replacement.
You need to get hold of the duty manager.
Phone and speak to him directly, and he'll let your team leader know you're going to be off.
Before I forget, last year we had a problem with customers getting to the checkouts and not realising how much they have to pay per kilo for the strawberries.
But we've got signs with price lists all round the farm this year, so that's been dealt with.
One annoying thing is people taking baskets out of the shop and leaving them in the car park, or worse, taking them home.
They're expensive to replace, so please keep an eye on them.
If you're in the fields, no doubt you'll see people popping a couple of strawberries into their mouths, but we don't need to worry about this too much.
I should mention the benefits of working here.
For a start, you get to take home a good-sized carton of strawberries at no charge.
Your family members can also get 15% off the fruit they pick.
Discounts don't apply to the gift shop, I'm afraid.
Alright, let's look at the map you all have to give you an idea of the farm's layout.
We'll start with the staff room.
See the main building?
The entrance is at the bottom of your map.
Well, above the main building on the map is a row of three smaller buildings.
The staff room is the middle one.
If you need to go to administration, that's easy to find.
In the main building, you've got the three checkout desks in the bottom right-hand corner and the cafe in the top corner.
And the other large inside area is the shop.
So administration is the other room there.
It's in the top left-hand corner.
Some of you are working in the packing shed.
You see where the main building is, and then at the top of the map, there are the round water tanks, four of them.
The packing shed is the bigger of the two buildings, directly below the tanks on your map.
Not easy work, but at least you'll be in the shade.
If you're driving to work, you'll need to know where the staff car park is.
So that's to the left of the main building, the area nearest the bottom of the map.
Park there and then either use the front entrance or that little door on the left of the main building.
Right, let's talk about where the customers can and can't pick their own strawberries.
They're not allowed to enter the commercial growing areas, and you can see area one already marked on your map.
That means there are two sections where customers are allowed to pick their own fruit.
The section with strawberries that are ready to pick now, the ripe strawberries, that's the L-shaped section right at the top of the map on the left.
The unripe strawberries will be ready in about three weeks.
So that section, it's above Commercial Growing Area 1, and you can see it from the cafe.
OK, so does anyone have any questions about...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nTalk to new employees at a strawberry farm', [
          [11, 'What should employees bring to work?', ['gloves', 'lunch', 'water'], 'C'],
          [12, "If employees can't come to work one day, they should", ['contact the duty manager.', 'leave a phone message at the farm office.', 'call their team leader.'], 'A'],
          [13, 'One problem with customers that may occur now is that', ['they sometimes fail to return baskets.', 'they eat the fruit before paying.', 'they can be unsure about prices.'], 'A'],
          [14, 'One of the benefits of working at the strawberry farm is that', ["employees' friends are entitled to a small discount.", 'employees can have a quantity of fresh fruit for free.', "employees don't pay the full price for gift items in the shop."], 'B'],
        ], 'Questions 11-14'),
        map('Label the map below.\nWrite the correct letter, A-J, next to Questions 15-20.', [
          [15, 'Staff room', 'C'],
          [16, 'Administration', 'H'],
          [17, 'Packing shed', 'B'],
          [18, 'Staff car park', 'I'],
          [19, 'Ripe strawberries', 'A'],
          [20, 'Unripe strawberries', 'E'],
        ], { pdf: 'Listening/Test 6/Test 6- up.pdf', page: 3, box: [134, 186, 526, 508] }, 'Questions 15-20'),
      ],
      expl: {
        11: { v: 'Khi nói cần mang gì đi làm.', t: ['You\'ll be working outside a lot, so fill up your water bottles at home and have them with you at all times.', "We'll be putting sandwiches out for you.", "You'll find them in the packing shed."], p: 'Bữa trưa và găng tay được trang trại cung cấp (bẫy A, B); tự mang nước → C' },
        12: { v: 'Khi nói nếu không đi làm được.', t: ["There's no point phoning the office.", 'You need to get hold of the duty manager.', "Phone and speak to him directly, and he'll let your team leader know you're going to be off."], p: 'Gọi văn phòng vô ích, trưởng nhóm sẽ do quản lý báo (B, C sai); liên hệ quản lý trực → A' },
        13: { v: 'Khi nói vấn đề với khách hàng.', t: ["But we've got signs with price lists all round the farm this year, so that's been dealt with.", 'One annoying thing is people taking baskets out of the shop and leaving them in the car park, or worse, taking them home.'], p: 'Chuyện giá đã giải quyết, ăn thử dâu không đáng lo (B, C sai); khách mang giỏ đi không trả → A' },
        14: { v: 'Khi nói quyền lợi nhân viên.', t: ['For a start, you get to take home a good-sized carton of strawberries at no charge.', 'Your family members can also get 15% off the fruit they pick.', "Discounts don't apply to the gift shop, I'm afraid."], p: 'Giảm giá cho gia đình chứ không phải bạn bè, không giảm ở cửa hàng quà (A, C sai); được mang dâu về miễn phí → B' },
        15: { v: 'Khi bắt đầu xem bản đồ.', t: ['Well, above the main building on the map is a row of three smaller buildings.', 'The staff room is the middle one.'], p: 'Hàng ba toà nhỏ phía trên toà chính, phòng nhân viên ở giữa → C' },
        16: { v: 'Khi nói về phòng hành chính.', t: ['So administration is the other room there.', "It's in the top left-hand corner."], p: 'Phòng còn lại trong toà chính, ở góc trên bên trái → H' },
        17: { v: 'Khi nói về nhà đóng gói.', t: 'The packing shed is the bigger of the two buildings, directly below the tanks on your map.', p: 'Toà lớn hơn trong hai toà ngay dưới bốn bể nước → B' },
        18: { v: 'Khi nói về bãi đỗ xe nhân viên.', t: "So that's to the left of the main building, the area nearest the bottom of the map.", p: 'Bên trái toà chính, sát mép dưới bản đồ → I' },
        19: { v: 'Khi nói khu dâu chín.', t: "The section with strawberries that are ready to pick now, the ripe strawberries, that's the L-shaped section right at the top of the map on the left.", p: 'Khu hình chữ L ở trên cùng bên trái → A' },
        20: { v: 'Cuối bài, khu dâu chưa chín.', t: "So that section, it's above Commercial Growing Area 1, and you can see it from the cafe.", p: 'Phía trên Khu trồng thương mại 1, nhìn thấy từ quán cà phê → E' },
      },
    },
    {
      part: 3, title: "Kathy's Dissertation on Water Pumps", audio: 'Listening/Test 6/P3.MP3', cover: 'engineering student tutor meeting | water pump engineering',
      transcript: `
Tutor:
Hello, Kathy.
How's your dissertation on water pumps going?
Kathy:
Not too bad, thanks.
I'm getting on well with the literature review now, and my lab work's fine so far.
Tutor:
Oh, that's good.
Remember, you should aim to have your results section completed by the end of next month, so there's plenty of time to finalise the whole thing by the summer deadline.
Anyway, looks like you're on track.
I've been through your first chapter now and I was quite impressed.
Kathy:
Oh, that's a relief.
Tutor:
Well, sometimes your sentences are a little long and over-complex, but the overall structure of the piece is very clear.
I'd recommend you get a critical friend to go through it with you.
Then, once you've built in citations of other work in the field, I think it'll be pretty good.
Kathy:
Oh, thanks.
I was pleased I decided to focus on water pumps.
Tutor:
You seem to be testing an appropriate range of pump design.
Lots of students make the mistake of either restricting their range too much, or conversely, not narrowing it down enough.
You've managed to avoid those twin traps.
However, I think you'd get more convincing results if you took some additional measurements.
I've noted exactly what I mean on your work.
Kathy:
Yes, I thought that might be necessary, and I know I need to get down to some more library work, too.
Tutor:
Well, I don't think that's essential at the moment.
Kathy:
Oh, right.
So what do you suggest I do next?
Repeat my last experiment using different variables?
Tutor:
Well, you could have a word with James Higgins tomorrow.
He's coming here to give a lecture on hydraulics to the faculty, and it would be a great chance to have a chat with him, especially as your experimental work has drawn so heavily from his last article in the British Engineering Journal.
Kathy:
Oh, fantastic.
Tutor:
And you never know how successful a chat with him might turn out to be.
I got my first research post when I was a final year student and asked a visiting professor to explain what he meant in some article he'd written.
So I urge all my students to take any such opportunity that arises.
Kathy:
But times have changed.
People like that are too busy to talk to mere students these days.
Tutor:
I don't know about that.
Anyway, is there anything else I can help with?
Any practical information about layout, perhaps?
Kathy:
Well, I suppose I'm a bit unsure about how the bibliography should be presented.
Mind you, I can just check what's normally done in journal articles, so that's not something to bother you with.
I'd welcome some guidance, though, about what I should or shouldn't include in the appendices.
I know some things, some of my data tables or details of specs, perhaps, are not really needed in the main body of the text, and I'm likely to be pushed for words there.
Tutor:
OK, I can certainly help you with that.
But it will take a while, so can we deal with that next week?
I've got that solar panel seminar to go into in a few minutes.
There's plenty of work you can be carrying on with in the meantime.
Kathy:
Sure, that's no problem.
I think I'll go and investigate the latest version of the CAD software to see if it might help with my pump design experiments at all.
Tutor:
Before you go, though, I'd like quickly to run through what you should be doing over the next few months, not just for your dissertation, but also to help your chances of getting the research post you'd like.
Is that OK with you?
Kathy:
Yes, that would be really helpful.
Tutor:
Well, you certainly need to become a member of the Mechanical Engineers Society, and then you'll be able to go along to their meetings.
There, you must make a point of making yourself known to various people, like Professor Jones.
He's the current president and is very approachable.
Kathy:
OK, so I could do some networking there?
Tutor:
Exactly.
Also, I think you should try to set up some visits to industry.
Go to a lot of different workplaces just to see how things are done.
It's actually a very good way of making sure you're familiar with the cutting edge of what's going on.
Textbooks, even academic articles, sometimes lag behind industry.
Kathy:
That sounds really interesting.
Also, I'd love the chance to do a bit of work abroad for a while.
Tutor:
Well, that's actually the next thing I was going to recommend.
I'm sure we could set up a month for you in either the States or Canada, and that would be a great way to find out how things are done elsewhere.
Kathy:
That'd be good.
Thank you.
Tutor:
And the last thing I was going to suggest was that you could go to the European Water Engineering Conference being held in Spain in May.
Kathy:
I could even present my dissertation there?
Tutor:
Yes.
Kathy:
Oh, thank you so much.
That's all really helpful.
Tutor:
Good.`,
      groups: [
        mc("Choose the correct letter, A, B or C.\n\nKathy's dissertation on water pumps", [
          [21, "What part of Kathy's dissertation has the tutor just read?", ['her results section', 'her introductory chapter', 'her review of the literature'], 'B'],
          [22, "What did the tutor like about Kathy's work?", ['the organisation', 'the style of writing', 'the use of resources'], 'A'],
          [23, 'Kathy and the tutor agree that she needs to', ['do some more library research.', 'record more data.', 'narrow down her topic.'], 'B'],
          [24, 'Why does the tutor give an example from his own experience?', ['to show how successful he has become', 'to illustrate how times have changed', 'to encourage Kathy to do something similar'], 'C'],
          [25, 'Kathy would like the tutor to advise her on her', ['layout.', 'bibliography.', 'appendices.'], 'C'],
          [26, 'What is Kathy going to do next?', ['try out some software', 'go to a seminar', 'design a new type of pump'], 'A'],
        ], 'Questions 21-26'),
        matching('How will Kathy benefit from doing each of the following activities?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 27-30.',
          ['broadens practical experience of the field', 'chance to publicise own work', 'effective way of keeping up-to-date', 'looks good on a CV', 'provides useful access to resources', 'way to make useful contacts'], [
            [27, "going to Mechanical Engineers' Society meetings", 'F'],
            [28, 'visiting different workplaces', 'C'],
            [29, 'getting some work experience abroad', 'A'],
            [30, 'attending an international conference', 'B'],
          ], { title: 'Benefits', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, khi gia sư nhận xét.', t: ["I'm getting on well with the literature review now", "I've been through your first chapter now and I was quite impressed."], p: 'Tổng quan tài liệu Kathy đang viết, phần kết quả chưa xong (A, C sai); gia sư đã đọc chương đầu → chương mở đầu → B' },
        22: { v: 'Khi gia sư nhận xét chương đầu.', t: 'Well, sometimes your sentences are a little long and over-complex, but the overall structure of the piece is very clear.', p: 'Câu văn còn dài (B sai), chưa trích dẫn tài liệu (C sai); cấu trúc tổng thể rất rõ ràng → A' },
        23: { v: 'Khi bàn việc cần làm thêm.', t: ["However, I think you'd get more convincing results if you took some additional measurements.", 'Yes, I thought that might be necessary', "Well, I don't think that's essential at the moment."], p: 'Thư viện là không cần thiết lúc này, phạm vi đã hợp lý (A, C sai); cả hai đồng ý cần đo thêm số liệu → B' },
        24: { v: 'Khi gia sư kể kinh nghiệm bản thân.', t: ['I got my first research post when I was a final year student and asked a visiting professor to explain what he meant in some article he\'d written.', 'So I urge all my students to take any such opportunity that arises.'], p: '“Times have changed” là ý của Kathy (bẫy B); kể để khuyến khích Kathy nói chuyện với James Higgins → C' },
        25: { v: 'Khi gia sư hỏi về trình bày.', t: ["Mind you, I can just check what's normally done in journal articles, so that's not something to bother you with.", "I'd welcome some guidance, though, about what I should or shouldn't include in the appendices."], p: 'Thư mục tự tra cứu được (bẫy B); cần tư vấn về phụ lục → C' },
        26: { v: 'Cuối phần 1.', t: ["I've got that solar panel seminar to go into in a few minutes.", "I think I'll go and investigate the latest version of the CAD software to see if it might help with my pump design experiments at all."], p: 'Hội thảo là của gia sư (bẫy B); Kathy sẽ đi thử phần mềm CAD → A' },
        27: { v: 'Khi nói về Hội Kỹ sư Cơ khí.', t: ['There, you must make a point of making yourself known to various people, like Professor Jones.', 'OK, so I could do some networking there?', 'Exactly.'], p: 'Làm quen với nhiều người → mở rộng quan hệ → F' },
        28: { v: 'Khi nói về thăm các nơi làm việc.', t: ["It's actually a very good way of making sure you're familiar with the cutting edge of what's going on.", 'Textbooks, even academic articles, sometimes lag behind industry.'], p: 'Cách tốt để nắm bắt cái mới nhất → cập nhật → C' },
        29: { v: 'Khi nói về làm việc ở nước ngoài.', t: "I'm sure we could set up a month for you in either the States or Canada, and that would be a great way to find out how things are done elsewhere.", p: 'Tìm hiểu cách người ta làm ở nơi khác → mở rộng kinh nghiệm thực tế → A' },
        30: { v: 'Cuối bài, về hội nghị quốc tế.', t: ['And the last thing I was going to suggest was that you could go to the European Water Engineering Conference being held in Spain in May.', 'I could even present my dissertation there?', 'Yes.'], p: 'Có thể trình bày luận văn tại hội nghị → quảng bá công trình của mình → B' },
      },
    },
    {
      part: 4, title: 'American Salt Marshes', audio: 'Listening/Test 6/P4.mp3', clip: [0, 409], cover: 'salt marsh coast | horseshoe crab beach',
      transcript: `
Right.
This morning I want to give you a brief introduction to a different kind of habitat, American salt marshes.
And then we'll examine a particular inhabitant of the marsh, the horseshoe crab.
Okay, so what are the defining features of a salt marsh to begin with?
Well, salt marshes are found on the coast in various parts of the USA.
They are really areas between land and water.
Obviously, these are very wet areas, and the salinity, that's the amount of salt in the water, ranges from ocean strength to almost fresh, in other words, very low indeed.
And the salt marshes are affected by daily changes in sea levels.
The sea might wash in over them as frequently as twice a day, so the habitat is constantly changing.
The amount of salt in the water rises and falls, as does the depth and warmth of the water.
We'll be having a detailed look at the horseshoe crab in a moment, but marshes provide plentiful food for other creatures that feed there too, such as worms and shrimps.
This food comes in the form of plants that thrive there.
Interestingly enough, 200 years ago, the flow of water in marshland in the United States was controlled so that rice could be grown there.
Little is grown there today, but 15% of coastal marshes are enclosed artificially in order to attract wild birds to the area, and we'll be examining those too.
But before looking at the wildlife, there are a few political issues to make you aware of.
There are always controversial issues when humans decide to make changes to natural habitats.
During the past 20 years, many objections have been voiced to the building of artificial earth walls, or dikes, to use the correct term, on salt marshes to control the natural flow of seawater.
Since the walls restrict the movement of high volumes of water, this means that the natural habitat of local aquatic life is reduced.
And because the water is shallower, the temperature of the water may rise significantly during periods of low rainfall.
In addition, although the insects are very happy there, many people are unhappy with the dikes.
This isn't because they distract from the natural beauty of the landscape, but because their presence means it's more difficult for walkers, who appreciate the marshes, to go where they want.
There is controversy over the different values placed on the resources of the marshes.
Some people would like to see them used more fully for hunting, while others would like to see business permits granted to allow for further development.
Interestingly, in the mid-20th century, marshes were not thought of as valuable at all, and over half of the salt marshes in the USA were destroyed at that time.
In the main, this was due to filling the marshes to create more land for housing developments and to control the mosquito population.
However, state laws now do reflect the importance and growing appreciation of marshes, not only as natural habitats, but also because they provide a natural barrier against storm damage, and therefore limit the amount of land lost to the sea.
Right.
We'll be debating some of those issues in the seminars, but let's now turn our attention to the horseshoe crab, which is the focus of our study this morning.
Horseshoe crabs have changed very little in the last 350 million years.
I find them interesting in many ways because they are, in fact, distant relatives of the spider and not crabs at all.
They look quite dangerous.
In fact, they are absolutely harmless.
The horseshoe crab's main diet is one of shellfish, but they will eat worms too.
The crab places its food near its mouth, in the centre of its underside, where its legs are attached, and grinds and crushes it there.
It has five pairs of legs.
The female lays between 200 and 300 eggs and comes ashore to do that.
This process takes place in spring, before the sand heats up in the summer months.
Right, what I'm going to do now is show you some photos...`,
      groups: [
        short('Complete the sentences below.\nWrite ONE WORD ONLY for each answer.\n\nAmerican Salt Marshes', [
          [31, 'The salt content in marshes can be as high as that of the ______.', 'ocean'],
          [32, 'At different times of the day, there are changes in salinity and in the ______ and warmth of the water.', 'depth'],
          [33, 'Animals such as worms and shrimps feed on the ______ that grow in the marsh.', 'plants'],
          [34, 'Marshland in the US has been used in the past for ______ cultivation.', 'rice'],
        ], 'Questions 31-34'),
        mc('Choose the correct letter, A, B or C.', [
          [35, 'The speaker says that one result of erecting artificial walls in salt marshes is that', ['water levels can get too high.', 'wildlife has less space.', 'water quality is difficult to control.'], 'B'],
          [36, 'Some people have complained about the building of dikes because', ['access for walkers is reduced.', 'the insect population has increased.', 'the natural beauty of the area is affected.'], 'A'],
          [37, 'In the 20th century, a large proportion of marshes in America became', ['salt extraction sites.', 'residential areas.', 'protected insect reserves.'], 'B'],
          [38, 'There are now laws which help to prevent', ['the erosion of soil.', 'the building of more walls.', 'the extinction of sealife.'], 'A'],
        ], 'Questions 35-38'),
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'The Horseshoe Crab', [
          'Related to: spider',
          'Most common food: __Q39__',
          'Time of year when female lays eggs: __Q40__',
        ], { 39: 'shellfish', 40: 'spring' }, 'Questions 39-40'),
      ],
      expl: {
        31: { v: 'Khi nói đặc điểm của đầm muối.', t: "Obviously, these are very wet areas, and the salinity, that's the amount of salt in the water, ranges from ocean strength to almost fresh", p: 'Độ mặn có thể bằng nước đại dương → ocean' },
        32: { v: 'Khi nói về thay đổi hằng ngày.', t: 'The amount of salt in the water rises and falls, as does the depth and warmth of the water.', p: 'Thay đổi độ mặn, độ sâu và độ ấm của nước → depth' },
        33: { v: 'Khi nói về thức ăn trong đầm.', t: ['marshes provide plentiful food for other creatures that feed there too, such as worms and shrimps.', 'This food comes in the form of plants that thrive there.'], p: 'Thức ăn là các loài thực vật mọc ở đó → plants' },
        34: { v: 'Khi nói về quá khứ.', t: 'Interestingly enough, 200 years ago, the flow of water in marshland in the United States was controlled so that rice could be grown there.', p: 'Điều tiết nước để trồng lúa → rice' },
        35: { v: 'Khi nói về đê nhân tạo.', t: ['Since the walls restrict the movement of high volumes of water, this means that the natural habitat of local aquatic life is reduced.', 'And because the water is shallower, the temperature of the water may rise significantly during periods of low rainfall.'], p: 'Nước nông hơn chứ không dâng cao (A sai); môi trường sống của sinh vật dưới nước bị thu hẹp → B' },
        36: { v: 'Khi nói người dân phàn nàn về đê.', t: "This isn't because they distract from the natural beauty of the landscape, but because their presence means it's more difficult for walkers, who appreciate the marshes, to go where they want.", p: 'Không phải vì cảnh quan (C sai), côn trùng thì “rất vui” (B sai); người đi bộ khó đi lại → A' },
        37: { v: 'Khi nói về giữa thế kỷ 20.', t: 'In the main, this was due to filling the marshes to create more land for housing developments and to control the mosquito population.', p: 'Lấp đầm để lấy đất xây nhà → khu dân cư → B' },
        38: { v: 'Khi nói về luật hiện nay.', t: 'but also because they provide a natural barrier against storm damage, and therefore limit the amount of land lost to the sea.', p: 'Hạn chế đất bị biển lấy mất → chống xói mòn đất → A' },
        39: { v: 'Phần về sam biển.', t: "The horseshoe crab's main diet is one of shellfish, but they will eat worms too.", p: 'Giun chỉ là phụ (bẫy); thức ăn chính là động vật có vỏ → shellfish' },
        40: { v: 'Cuối bài.', t: 'This process takes place in spring, before the sand heats up in the summer months.', p: 'Đẻ trứng vào mùa xuân, mùa hè là bẫy → spring' },
      },
    },
  ],
};
