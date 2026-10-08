// Vol 5 – Test 5 (PDF "Listening/Test 5/Test 5- up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p5; audio Test 5/P1 (2), P2 (2),
// P3 (3), P4 (3).mp3). P1 plays its example first and then the whole conversation → transcript keeps the full version only.
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns, wb.js for gaps) checked against
// "Transcripts & Keys/test 5- transcripts.pdf".
// Source errors fixed: key Q3 "dividing" → diving ("What about diving?"); key Q34–37 "risk, hurt, interaction, obligation" belong
// to another version of the notes → keys follow this paper + recording: 34 interaction, 35 obligation, 36 process, 37 cooperation;
// paper "Advances" → Advanced.
const { note, mc, matching, map, short } = require('../vol_build');

module.exports = {
  vol: 5, test: 5,
  sections: [
    {
      part: 1, title: 'Swimming Lessons', audio: 'Listening/Test 5/P1 (2).mp3', cover: 'swimming lesson pool | adult swimming class',
      transcript: `
Woman:
Hello, City Swim School.
Man:
Oh, hello.
I wanted to ask about swimming lessons.
That's in a class, not individual.
Woman:
Right.
Well, we do group lessons at various levels.
To start off with, we have what we call the Water Babies class.
That's for babies of three months and over.
Man:
Really?
As young as that?
Woman:
Yes, that's really the best time to start.
Man:
Right.
Well, we do have a baby, so I'll make a note of that.
What do they actually do in the lessons?
Woman:
Well, the main aim is just to familiarise them with the water so they feel at ease there.
They get the children to enjoy themselves.
They have lots of toys and things they can use to play with in the water.
Man:
Right.
And how much do the lessons cost?
Woman:
They're held on Tuesday mornings and each lesson costs £3.80.
It's not really a course as such.
Man:
OK.
Well, I'll talk to my wife about that.
But I was actually ringing about lessons for me.
Woman:
OK.
So, are you a beginner?
Man:
Not exactly, but I'm not very good.
Woman:
Well, the beginners' classes are really for people who don't have any experience of swimming.
They aim to teach you techniques for breathing in the water, and they get you to do things like put your head underwater and open your eyes.
Man:
OK, I can do that.
Woman:
And by the end of the course, they aim to have you swimming five metres.
Man:
I think I can probably just about do that.
Woman:
OK, so you'd be better in the intermediate class then.
That's where you learn the main swimming strokes.
Front stroke, back stroke and so on.
Man:
What about diving?
Woman:
Yes, they'd teach you how to do that.
And you'd also do some underwater swimming.
Man:
Not with a tank or anything?
Woman:
Oh no, not scuba.
Just ordinary underwater swimming.
And in the intermediate course you also look at water safety, both in the pool and when swimming in other places.
Man:
OK.
Well, that sounds the right level for me, I think.
So, how much does that cost?
Woman:
£61 for a course.
That's ten lessons.
Man:
Can you tell me a bit more about the class?
How many people would there be in it?
Woman:
Well, the intermediate class is usually around eight to ten.
That's what we aim at.
Though occasionally it might go up to twelve.
Man:
OK, that sounds quite a reasonable size, not too many.
And the class is for adults, is it?
Woman:
Yes.
Man:
OK, and just out of interest, is there an advanced class?
Woman:
Yes, they focus on developing more efficient swimming techniques and on working on your speed, and they also prepare you for competitive swimming.
Man:
OK, now I think I'd want to start with the intermediate one, really.
Now, is there anything special I need to know?
Woman:
Well, the classes are on Tuesdays and the first lesson is on January the 13th, so you need to register before then.
January the 8th is the latest, but it's filling up quickly, so I'd do it straight away.
You can pick up a form here, or get one off the internet.
And classes are at 7.30pm.
Man:
Right.
Then I just roll up with my swimming trunks.
Do I have to bring my own towel?
Woman:
That's right.
We provide all participants with a swimming hat, though.
Man:
Oh.
I don't usually wear one.
Woman:
Well, we do insist on it, actually.
It helps the instructor to identify you, apart from anything else.
Oh, and don't forget you need a 20p coin for the locker.
Man:
Oh, OK.
Right, well, I've been meaning to do this for ages.
I really need to get some more exercise, and everyone says swimming is good for your health.
Woman:
Yes, and a lot of people find it improves their confidence, too.
And of course it could save your life, or even someone else's.
Man:
That's right.
OK, well, thanks very much.
Goodbye.
Woman:
Goodbye.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Swimming Lessons – Classes available', [
          'Example: Water <u>Babies</u>',
          '• For babies of three months upwards',
          '• Focus: water familiarisation using __Q1__',
          '• Cost: £3.80 per lesson',
          '<strong>Beginners</strong>',
          '• For people with no experience of swimming',
          '• Focus: __Q2__ techniques; opening the eyes underwater; swimming five metres',
          '<strong>Intermediate</strong>',
          '• Focus: learning main swimming strokes',
          '• introduction to __Q3__',
          '• swimming underwater',
          '• __Q4__ in the water',
          '• Cost: £61 per course',
          '• Other information: maximum of 12 pupils per class; class is for __Q5__',
          '<strong>Advanced</strong>',
          '• Focus: more efficient techniques; improving __Q6__; competitions',
          '<strong>Other information</strong>',
          '• Date when Intermediate course begins: Tuesday __Q7__ (need to register soon)',
          '• Time: 7.30 p.m.',
          '• Participants will be provided with a swimming __Q8__',
          '• Bring change for the __Q9__',
          '<strong>Benefits of swimming</strong>',
          '• Health benefits',
          '• Improvement in __Q10__',
          '• Could save a life',
        ], { 1: 'toys', 2: 'breathing', 3: 'diving', 4: 'safety', 5: 'adults', 6: 'speed', 7: '13th January/13 January/January 13th/January 13', 8: 'hat', 9: 'locker', 10: 'confidence' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi lớp Water Babies làm gì.', t: 'They have lots of toys and things they can use to play with in the water.', p: 'Làm quen với nước bằng đồ chơi → toys' },
        2: { v: 'Khi nói về lớp cho người mới.', t: 'They aim to teach you techniques for breathing in the water', p: 'Dạy kỹ thuật thở trong nước → breathing' },
        3: { v: 'Khi nói về lớp trung cấp.', t: ['What about diving?', "Yes, they'd teach you how to do that."], p: 'Lớp trung cấp có dạy lặn (nhảy cầu) → diving' },
        4: { v: 'Ngay sau đó.', t: 'And in the intermediate course you also look at water safety, both in the pool and when swimming in other places.', p: 'An toàn dưới nước → safety' },
        5: { v: 'Khi hỏi về lớp học.', t: ['And the class is for adults, is it?', 'Yes.'], p: 'Lớp dành cho người lớn → adults' },
        6: { v: 'Khi hỏi về lớp nâng cao.', t: 'Yes, they focus on developing more efficient swimming techniques and on working on your speed, and they also prepare you for competitive swimming.', p: 'Cải thiện tốc độ → speed' },
        7: { v: 'Khi hỏi ngày bắt đầu.', t: ['Well, the classes are on Tuesdays and the first lesson is on January the 13th, so you need to register before then.', "January the 8th is the latest"], p: 'Ngày 8/1 là hạn đăng ký (bẫy); buổi đầu tiên là 13/1 → 13th January' },
        8: { v: 'Khi hỏi cần mang gì.', t: ['Do I have to bring my own towel?', "That's right.", 'We provide all participants with a swimming hat, though.'], p: 'Khăn phải tự mang (bẫy); trường phát mũ bơi → hat' },
        9: { v: 'Ngay sau đó.', t: "Oh, and don't forget you need a 20p coin for the locker.", p: 'Cần đồng xu 20p cho tủ khoá → locker' },
        10: { v: 'Cuối bài, về lợi ích của bơi.', t: 'Yes, and a lot of people find it improves their confidence, too.', p: 'Sức khoẻ đã có trên đề; bơi giúp tăng sự tự tin → confidence' },
      },
    },
    {
      part: 2, title: 'Campus Facilities and Dormitories', audio: 'Listening/Test 5/P2 (2).mp3', cover: 'university campus map | student dormitory building',
      transcript: `
Hello everyone, and welcome to the University of New South Wales.
The first thing I'd like to do at today's orientation session is get you all oriented.
That means tell you the location of some useful facilities and services.
So, first of all, take out the maps we gave you all as you came in the door.
The map is the big yellow sheet of paper.
As you can see on the map, north is at the top, south at the bottom, etc.
Which way is north?
Well, look through that window on my left, your right.
See the rising sun?
That would have to be east.
So, north must be directly behind me.
Now, we're at the campus main gate.
The recreational facilities are on my right hand, and its opposite is the student centre.
No questions?
Good.
Pretty easy, right?
OK.
Did everyone eat breakfast at the student food service this morning?
Was the food good?
Yes, yes, I am joking.
I've eaten there too.
So, after a meal like that, you must be eager to go to a doctor, right?
Well, I have good news for you.
The Student Health Centre is located about half a kilometre straight north of here.
Look on your maps.
You see the street on the east side of this building, Ned Kelly Avenue?
Just follow that about 500 metres and the health centre will be on your left at the 3rd cross street.
Now, I know you all just got here, so you must be wondering how to tell your folks you've arrived safely, how much you miss the dog and how you already need more money.
If you don't have an iPhone, you probably are wondering where to find a computer.
Well, I have good news.
If you go straight out of its door and walk down the Garden Street, you'll see the internet unit on your left side, just next to the gym.
The hours are posted on the door and the computers are free, but you must bring your student ID card with you.
Like I tell everyone, if you need help with anything, you can probably find it right here in the student centre.
Do you see the four buildings there between the student centre and the library?
Those are the dormitories.
The men's dorms are the two on the south, the women's the two on the north.
OK, I'm sorry to have to tell you, but the university has been doing a lot of repairs and remodelling and it's not all done yet.
So there may be some small problems with your dorm rooms.
Maybe the window doesn't open.
Maybe an air conditioner is missing or does not work.
If there are any problems, you can go to the complaint office, which is right beside the teaching building between the Parker Street and the Crammer Street.
Just tell them your problem and they should have it fixed by the time you graduate in four years.
I'm joking, but please be patient.
There are a lot of little things they need to take care of.
Tired of the school food?
No?
Give it a week.
Or maybe you just need a place to get coffee in the wee hours of the night during one of those marathon study sessions.
Either way, you definitely have to check out the little cafe just past the women's dormitories.
They've got free Wi-Fi, so a lot of students saddle up with coffee and a bagel for hours on end to get work done.
As for the dorm rooms, I have some bad news and some good news.
The bad news is the rooms are small and you'll probably be sharing space with at least three other students.
The good news is that each room has its own bathroom.
What's good about sharing a bathroom with three strangers?
Hmm, good question.
OK, call it bad news and worse news.
Hey, maybe try this for good news.
Each dorm has a kitchen.
If you want to make snacks or meals, you can do it there.
You can buy food containers at any campus convenience store so you can store your food in the kitchen.
But a word of warning, you should definitely write your name on your food containers.
Sad to say, there are food thieves among your fellow students.
Speaking of thieves, a word about security.
I mean, this is Australia and we do get drunken bushrangers wandering onto campus.
Each of you will be given a key for your dorm room.
Don't lose it.
You have to pay for any replacement and fill out a bunch of papers too.
Red tape, huh?
Your key does not work for the front door of your dorm, however.
To the right of each door, there's a keypad with numbers.
When you move in, they will tell you the code you use to enter the door.
Please do not tell the code to people who do not live in the dorm.
Let's see, have I forgotten anything?
Oh yes, most of you are not rich, correct?
So when your clothes get dirty, you can't just throw them away and buy new ones.
That means you have to learn to do laundry.
Or, men, that means you have to hurry up and get married.
If you decide to wash those clothes and not get married, there are laundries in each dorm.
Where?
Oh, I almost forgot to tell you.
The laundry for each dorm is in the basement.
Some real good news this time if you're a student.
It is free.
You do have to buy your own soap, however.
The laundry closes, by the by, at 11.30.
And now that I've mentioned 11.30, please remember, the dorm doors are locked at 11.30pm.
Your code will not work.
If you want to get in, you'll have to call the night watchman.
Don't worry, you can get that number at the dorm office.
Yes, the dorm office and the complaint office are the same office.
Alright then, before we continue, are there any questions?`,
      groups: [
        map('Listen to the directions and match the places in Questions 11-15 to the appropriate place among A-E on the map.', [
          [11, 'Student Centre', 'E'],
          [12, 'Health Centre', 'A'],
          [13, 'Internet Unit', 'B'],
          [14, 'Complaint Office', 'D'],
          [15, 'Café', 'C'],
        ], { pdf: 'Listening/Test 5/Test 5- up.pdf', page: 2, box: [88, 168, 522, 572] }, 'Questions 11-15'),
        short('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', [
          [16, "Students in a room don't need to share a ______ with ones in other rooms.", 'bathroom'],
          [17, 'Everyone has to write down his name on the ______.', 'food containers/food container'],
          [18, 'All the students use a ______ to enter the door.', 'code'],
          [19, 'If you want to wash your clothes, go to the laundry room which is located in the ______.', 'basement'],
          [20, 'The dormitory closes at ______ every night.', '11.30/11:30/11.30 pm/11:30 pm'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi đứng ở cổng chính.', t: "The recreational facilities are on my right hand, and its opposite is the student centre.", p: 'Đối diện khu giải trí ở cổng chính → E' },
        12: { v: 'Khi nói về trung tâm y tế.', t: ['The Student Health Centre is located about half a kilometre straight north of here.', 'Just follow that about 500 metres and the health centre will be on your left at the 3rd cross street.'], p: 'Đi thẳng lên phía bắc theo Ned Kelly Avenue, bên trái ở giao lộ thứ ba → A' },
        13: { v: 'Khi nói về chỗ dùng máy tính.', t: "If you go straight out of its door and walk down the Garden Street, you'll see the internet unit on your left side, just next to the gym.", p: 'Ngay cạnh phòng gym → B' },
        14: { v: 'Khi nói về phòng khiếu nại.', t: 'If there are any problems, you can go to the complaint office, which is right beside the teaching building between the Parker Street and the Crammer Street.', p: 'Sát toà giảng đường, giữa phố Parker và phố Crammer → D' },
        15: { v: 'Khi nói về quán cà phê.', t: ['The men\'s dorms are the two on the south, the women\'s the two on the north.', 'Either way, you definitely have to check out the little cafe just past the women\'s dormitories.'], p: 'Ký túc nữ ở phía bắc; quán nằm ngay sau ký túc nữ → C' },
        16: { v: 'Khi nói về phòng ký túc.', t: ["The bad news is the rooms are small and you'll probably be sharing space with at least three other students.", 'The good news is that each room has its own bathroom.'], p: 'Mỗi phòng có phòng tắm riêng → không dùng chung với phòng khác → bathroom' },
        17: { v: 'Khi nói về bếp.', t: 'But a word of warning, you should definitely write your name on your food containers.', p: 'Phải ghi tên lên hộp đựng thức ăn → food containers' },
        18: { v: 'Khi nói về an ninh.', t: ['Your key does not work for the front door of your dorm, however.', 'When you move in, they will tell you the code you use to enter the door.'], p: 'Chìa khoá không mở cửa chính (bẫy); dùng mã số để vào → code' },
        19: { v: 'Khi nói về giặt đồ.', t: 'The laundry for each dorm is in the basement.', p: 'Phòng giặt ở tầng hầm → basement' },
        20: { v: 'Cuối bài.', t: 'And now that I\'ve mentioned 11.30, please remember, the dorm doors are locked at 11.30pm.', p: 'Cửa ký túc khoá lúc 11h30 tối → 11.30' },
      },
    },
    {
      part: 3, title: 'Choosing an Internship', audio: 'Listening/Test 5/P3 (3).mp3', cover: 'students discussing internship | intern office laptop',
      transcript: `
Peter:
Hi, Shona.
Shona:
Hi, Peter.
Have you made up your mind about which internship programme to apply for?
Peter:
Yes, pretty much.
Shona:
I'm entirely at a loss.
I mean, there are so many good ones.
Can you give me some tips?
Peter:
Sure.
Shona:
What is your top priority when weighing up these programmes?
Peter:
Well, I guess I'd go for ones that can help me with the skill set I lack for my future career.
I still need a lot of practical training in dealing with statistics.
But keep in mind that you don't want to set your goal too grand, like drawing up a business plan.
You might end up nowhere.
Shona:
I see.
So I want to learn how to organise ideas and present them.
Peter:
Good.
Now you've nailed step one.
Shona:
Now what?
Peter:
You must also consider your strengths for a suitable internship programme.
Otherwise, you might get rejected or end up with one that you are incapable of doing.
Shona:
But I have no idea what I'm good at.
Peter:
Communicate with people around you or whom you've worked with.
That's what I did.
I thought I was a good team leader.
But many people I've worked with for various projects mentioned something else.
They admire that I could work around the clock to finish projects on time.
And indeed, I'm more focused and perform better when I'm pushed for time.
Shona:
Good point.
So what do you plan to do next?
Peter:
I'll visit the careers officer to help me with the school application form.
You know, the one we have to submit before applying to companies.
Shona:
But it is unnecessary to fill it in.
It's only optional.
Peter:
Really?
I'm glad I heard from you.
Then I'll ask the careers officer to look at my personal statement and give me some tips on polishing it up.
Shona:
Don't you need help with your CV?
Peter:
No, I'm good.
I have already learned to write it in class.
Shona:
That's good.
So what kind of company did you choose?
Peter:
I've decided to apply for an IT company.
Shona:
Why is that?
Peter:
Well, even though I've learned how the IT industry developed in the past from different lectures, I know nothing about its latest trends.
I'm prepared to work in an IT company and fill in the information gap.
Shona:
I see.
What do you plan to do next term?
Peter:
I think I'll stick to most of the optional modules I've chosen.
But regarding the language sessions, I'm doing poorly in Japanese.
I'd better drop it before wasting more time.
I think I'll learn Spanish instead.
Shona:
Oh, I learned Spanish for a year.
I think you'll find it interesting.
Do you know what job opportunities these companies offer interns?
Peter:
I've searched online and browsed some of the schemes.
Do you know SAIC?
Shona:
Yes, I heard they offer internship positions dealing with customer interaction management, but I'm not quite sure what that means.
Peter:
Well, the position offers the chance to become fully aware of customer value and keep in touch with customers to keep them highly engaged and satisfied.
These include activities such as PR, communications, marketing and customer service.
Shona:
Sounds like loads of work to do.
What about Gemini Technologies?
Peter:
It's an IT consulting company.
Although many employees say it's stressful working there, I want to apply for this one.
Shona:
Why is that?
Peter:
Actually, the company provides service to improve software architecture.
But that's pretty demanding as a team of software engineers has to provide detailed analysis and suggestions for required changes before the deadline.
As an observer and participant of a particular project, an intern can learn how to work to a strict deadline.
Shona:
That's not my area of expertise, but I'm sure you'll excel at this.
Peter:
I certainly do hope so.
Have you checked out Deloitte?
Shona:
Of course, that's a renowned accounting firm, and thus its internships offer excellent learning experiences in this regard.
You know, things like examining a company's financial statements, the income statement, balance sheet and cash flow statement.
I want to give it a try, but I might get rejected, so I need a backup plan.
Have you read anything about Kearney?
Peter:
Yes, it is another consulting firm.
It provides opportunities to reach out to other business partners and pay attention to networking.
Shona:
Well, that sounds interesting.
Peter:
I'm thinking about Vortex, but I haven't got anything useful from its website.
Shona:
I worked there last summer.
It's an international company with headquarters in Spain, so most of the managers there speak Spanish.
Thanks to the internship experience, I became fluent in it.
Peter:
Right.
That's not for me.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What skills does Peter want to learn?', ['how to organise ideas', 'how to handle data', 'how to write a business proposal'], 'B'],
          [22, "What is Peter's main strength?", ['he is a good leader', 'he can work long hours', 'he can communicate well with many people'], 'B'],
          [23, 'What will the careers officer help Peter with?', ['CV', 'personal statement', 'school application form'], 'B'],
          [24, 'Why did Peter choose the IT business?', ['to update his knowledge in the area', 'to be good at presentations', 'to prepare himself for lectures'], 'A'],
          [25, 'What will Peter do for the next term?', ['continue with the same language', 'change to another language', 'discontinue the language course'], 'B'],
        ], 'Questions 21-25'),
        matching('What job opportunities are the following companies offering?\nChoose FIVE answers from the box and write the correct letter, A-G, next to Questions 26-30.',
          ['make business contacts', 'understand customer relations', 'learn time management', 'use a foreign language', 'travel to another country', 'receive financial training', 'learn project management'], [
            [26, 'SAIC', 'B'],
            [27, 'Gemini Technologies', 'C'],
            [28, 'Deloitte', 'F'],
            [29, 'Kearney', 'A'],
            [30, 'Vortex', 'D'],
          ], { title: 'Job opportunities', groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Khi Peter nói ưu tiên hàng đầu.', t: ['I still need a lot of practical training in dealing with statistics.', "But keep in mind that you don't want to set your goal too grand, like drawing up a business plan."], p: 'Sắp xếp ý tưởng là của Shona, kế hoạch kinh doanh là quá tầm (bẫy A, C); Peter cần học xử lý số liệu thống kê → B' },
        22: { v: 'Khi Peter nói về điểm mạnh.', t: ['I thought I was a good team leader.', 'They admire that I could work around the clock to finish projects on time.'], p: 'Lãnh đạo nhóm chỉ là Peter tự nghĩ (bẫy A); mọi người khen anh làm việc ngày đêm → B' },
        23: { v: 'Khi Peter nói về cán bộ hướng nghiệp.', t: ['But it is unnecessary to fill it in.', 'Then I\'ll ask the careers officer to look at my personal statement and give me some tips on polishing it up.', 'No, I\'m good.'], p: 'Đơn của trường không bắt buộc, CV đã biết viết (A, C sai); nhờ xem bài tự giới thiệu → B' },
        24: { v: 'Khi hỏi vì sao chọn công ty IT.', t: ['I know nothing about its latest trends.', "I'm prepared to work in an IT company and fill in the information gap."], p: 'Chỉ biết lịch sử ngành qua bài giảng, muốn cập nhật xu hướng mới → A' },
        25: { v: 'Khi hỏi về học kỳ tới.', t: ["I'd better drop it before wasting more time.", "I think I'll learn Spanish instead."], p: 'Bỏ tiếng Nhật, chuyển sang tiếng Tây Ban Nha → B' },
        26: { v: 'Khi nói về SAIC.', t: 'Well, the position offers the chance to become fully aware of customer value and keep in touch with customers to keep them highly engaged and satisfied.', p: 'Hiểu giá trị khách hàng, giữ liên lạc với khách → hiểu quan hệ khách hàng → B' },
        27: { v: 'Khi nói về Gemini Technologies.', t: 'As an observer and participant of a particular project, an intern can learn how to work to a strict deadline.', p: 'Học cách làm việc theo hạn chót gắt gao → quản lý thời gian → C' },
        28: { v: 'Khi nói về Deloitte.', t: "You know, things like examining a company's financial statements, the income statement, balance sheet and cash flow statement.", p: 'Học phân tích báo cáo tài chính → được đào tạo tài chính → F' },
        29: { v: 'Khi nói về Kearney.', t: 'It provides opportunities to reach out to other business partners and pay attention to networking.', p: 'Tiếp cận đối tác, xây dựng mạng lưới → tạo quan hệ kinh doanh → A' },
        30: { v: 'Cuối bài, về Vortex.', t: ["It's an international company with headquarters in Spain, so most of the managers there speak Spanish.", 'Thanks to the internship experience, I became fluent in it.'], p: 'Trụ sở ở Tây Ban Nha nhưng không nói đi nước ngoài (bẫy E); dùng tiếng Tây Ban Nha tới mức thành thạo → D' },
      },
    },
    {
      part: 4, title: 'Economics and Trust', audio: 'Listening/Test 5/P4 (3).mp3', cover: 'handshake trust | people shaking hands business',
      transcript: `
The development of trust is an essential social tool, allowing people to form productive and meaningful relationships, both at a professional and personal level.
Trust is indispensable in friendship, love, families and organisations and plays a key role in economic exchange and politics.
Much recent evidence indicates that trust contributes to economic, political and social success.
When we make contacts with strangers, such as doing business with the clients who we meet for the first time, our trust in them can only rely on their kindness.
So, from our own judgment or the comments from other people, we can have a rough idea if the stranger is trustworthy.
Trust is important because it is the basis around which all human relationships evolve.
Without trust, there can be no relationship.
Trust can come naturally, or it can be manifested.
If you find trust of this magnitude in life, then you are lucky.
Also, you can always count on them to protect through all, if not most, of life's perils.
Trust is important because, if you don't trust someone, then they are not available.
Believe it or not, reducing the chance of suffering from poverty is to understand trust, because when you trust other people, you can have more support and resources.
However, our ability to trust others varies from individual to individual, just like different people's ability of recognising a person's face is not the same.
Bonds of trust are also extremely fragile.
A single act of betrayal, such as a marital affair, can instantly erase years of trustworthy behaviour.
The consequences of such breaches in confidence can be disastrous, and not only for a relationship.
The study demonstrates how oxytocin can facilitate social interactions after trust has been violated, by potentially lowering defence mechanisms associated with social risks and by overcoming negative feedback that is important for adapting behaviour in the future.
Luckily, oxytocin in our body has the ability to inspire trust in and among people.
This chemical is released whenever interaction happens between people.
To study social interactions, economists and more recently neuroscientists take advantage of a simple experiment.
Two participants play the so-called trust game.
The first participant is faced with the decision to keep a sum of money or share it with the second participant, who has no obligation to give the money back.
He would get more money if the second person returns it.
In this game, the first person is left with an important social dilemma, to trust or not to trust.
Although it is more profitable to trust, doing so leaves the investor at risk of betrayal.
Trust is not something that naturally occurs when two people meet for the first time.
It involves a process.
One person has to show the quality of being trustworthy to the other person.
This can be achieved by certain behaviours and communication.
Therefore, trust is conditional.
People should not take it for granted.
Oxytocin does not only exist in human beings.
Animals also have this gift and it can be seen when they have cooperation with each other.
Oxytocin in monkeys, for example, allows them to work together to find food and to fight against enemies.
In the Nash Equilibrium's game theory, the first participant will make the best decision he can, with no expectations that the second participant would change his decision.
The second participant will do the same.
So, the outcome depends on the decision of the other person.
This game is similar to the one we just talked about.
The oxytocin level doesn't stay the same in a person's body.
Studies have found that people who are under a lot of stress would have higher levels of oxytocin.
Oxytocin causes a substantial increase in trust among humans, thereby greatly increasing the benefits from social interactions.
It's also noted that the effect of oxytocin on trust is not due to a general increase in the readiness to bear risks.
On the contrary, oxytocin specifically affects an individual's willingness to accept social risks arising through interpersonal interactions.
To sum up, oxytocin is like a kind of social glue that is helpful in social bonding.
Further research is needed to explore oxytocin and trust and how this hormone can be used to strengthen our trust in others and even treat mental disorders that specifically relate to deficiencies in social behaviour.
Next we're going to talk about...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Economics and Trust', [
          "Trust relies on the stranger's __Q31__",
          'The understanding of trust can reduce __Q32__',
          '<strong>How to measure trust</strong>',
          "• People's ability of recognising a person's __Q33__",
          '• Oxytocin will be released when __Q34__ occurs',
          '<strong>Experiments: two participants</strong>',
          '• The first participant decides whether to lend the money or not.',
          '• The second participant has no __Q35__ to return the money',
          '• Trust involves a __Q36__ – so it is conditional.',
          '• If animals have __Q37__ they will be seen to have oxytocin',
          '<strong>Nash equilibrium:</strong>',
          '• Participants have no __Q38__ that the other person would change his or her decision.',
          '• People under stress have __Q39__ levels of oxytocin.',
          '• Oxytocin is a social __Q40__',
        ], { 31: 'kindness', 32: 'poverty', 33: 'face', 34: 'interaction', 35: 'obligation', 36: 'process', 37: 'cooperation', 38: 'expectation/expectations', 39: 'higher', 40: 'glue' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về tiếp xúc với người lạ.', t: 'When we make contacts with strangers, such as doing business with the clients who we meet for the first time, our trust in them can only rely on their kindness.', p: 'Niềm tin vào người lạ chỉ dựa vào lòng tốt của họ → kindness' },
        32: { v: 'Khi nói vì sao niềm tin quan trọng.', t: 'Believe it or not, reducing the chance of suffering from poverty is to understand trust, because when you trust other people, you can have more support and resources.', p: 'Hiểu về niềm tin giúp giảm nguy cơ nghèo đói → poverty' },
        33: { v: 'Khi nói khả năng tin người khác nhau ở mỗi người.', t: "just like different people's ability of recognising a person's face is not the same.", p: 'Giống như khả năng nhận diện khuôn mặt → face' },
        34: { v: 'Khi nói về oxytocin.', t: 'This chemical is released whenever interaction happens between people.', p: 'Được tiết ra khi có tương tác giữa người với người → interaction' },
        35: { v: 'Khi mô tả trò chơi niềm tin.', t: 'The first participant is faced with the decision to keep a sum of money or share it with the second participant, who has no obligation to give the money back.', p: 'Người thứ hai không có nghĩa vụ trả lại tiền → obligation' },
        36: { v: 'Khi nói niềm tin có điều kiện.', t: ['It involves a process.', 'Therefore, trust is conditional.'], p: 'Niềm tin cần một quá trình nên có điều kiện → process' },
        37: { v: 'Khi nói oxytocin ở động vật.', t: 'Animals also have this gift and it can be seen when they have cooperation with each other.', p: 'Thấy rõ khi động vật hợp tác với nhau → cooperation' },
        38: { v: 'Phần cân bằng Nash.', t: 'the first participant will make the best decision he can, with no expectations that the second participant would change his decision.', p: 'Không kỳ vọng người kia đổi quyết định → expectation' },
        39: { v: 'Khi nói mức oxytocin thay đổi.', t: 'Studies have found that people who are under a lot of stress would have higher levels of oxytocin.', p: 'Người bị căng thẳng có mức oxytocin cao hơn → higher' },
        40: { v: 'Phần kết luận.', t: 'To sum up, oxytocin is like a kind of social glue that is helpful in social bonding.', p: 'Oxytocin như một loại “keo” xã hội → glue' },
      },
    },
  ],
};
