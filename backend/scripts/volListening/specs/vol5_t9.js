// Vol 5 – Test 9 (PDF "Listening/Test 9/TEST 9- up.pdf" p1–6, has a text layer; key "Tổng hợp key Listening.pdf" p9; audio
// Test 9/P1–P4 — P1 clipped after "Now turn to part one" (the test introduction comes first)).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns) + the Otter text of "Transcripts & Keys/test 9- transcripts.pdf"
// (text layer) for the passages Whisper dropped.
// Source errors fixed: key Q19 "E" → F (the cafeteria is "at the junction of Park Road and Rennie's Drive, on the north side
// of Park Road" = F; E is the new car park, already Q16); paper Q13 "theatre;s" → theatre's.
const { note, mc, matching, map } = require('../vol_build');

module.exports = {
  vol: 5, test: 9,
  sections: [
    {
      part: 1, title: 'Hot Air Balloon Trip', audio: 'Listening/Test 9/P1.mp3', clip: [41, 475], cover: 'hot air balloon sunrise | hot air balloons autumn',
      transcript: `
Jason:
Good morning, Smart Travel, Jason speaking.
Woman:
Hi, good morning.
I saw your advert in today's paper about hot air balloon trips.
It sounds pretty exciting, and I wonder how much it costs?
Jason:
Well, the price may vary depending on the location, number of participants and add-ons.
A single ride may cost you up to £280 per person.
But if you choose group booking, there is a discount.
And the cheapest flight is £125 each for a group booking of at least 10 people.
Woman:
Oh, that's not too bad.
What do you mean by add-ons?
Jason:
They are optional items, like taking photos for you during the ride, champagne, and sit-down breakfast after the flight.
Upon completing the trip, we will provide each participant with a certificate.
And that is entirely free of charge.
Woman:
Can I book a ride over the phone?
Jason:
Yes, that's an option.
Reservations can be made one year ahead of your trip by telephone.
But to pick a specific date, you must book online.
A confirmation email will be sent to you right afterwards.
Woman:
How high can the balloons go?
Jason:
A hot air balloon's height is limited by the temperature of the air and how much fuel it can carry.
And the highest altitude ever recorded for a ride is 1,800 metres.
But most rides stay below 300 metres.
Woman:
Oh boy, that's impressive.
How long is a single ride?
Jason:
The average hot air balloon ride lasts about an hour.
The entire ballooning experience, which includes ground preparation, flight and post-flight packing up and celebration, may take two to three hours.
Woman:
And what time are the flights?
Jason:
Our flights generally meet about an hour before sunrise on the day.
You will be notified of the exact meeting time the evening before your flight.
Night flights are avoided due to weather conditions.
Woman:
Fair enough.
Which month do you recommend for a hot air balloon trip?
Jason:
Autumn is the best time of year to take the trip.
Not only can you see the changing hues of the trees from above, but it is a great way to spend time with the whole family before it gets too cold.
Woman:
I see.
Jason:
But please note that our flight may be cancelled, and you will be notified by phone the day before.
Woman:
Why is that?
Jason:
It can be quite dangerous to fly under bad weather conditions, like a thunderstorm.
So our experienced pilots will not go under such conditions.
Woman:
What should I wear for the ride?
Jason:
We suggest wearing comfortable clothing, like a jacket.
Multiple layers are always better.
Wearing a helmet for safety concerns is also a good idea.
Sandals are not permitted.
Woman:
Can children or older people participate?
Jason:
All children must be above the minimum age of nine years old, and they have to be accompanied by at least a parent or guardian.
However, an adult has no age limit as long as they meet the health requirements.
Woman:
What exactly are the health requirements?
Jason:
Participants must at least be in fair physical condition.
For example, they shall have no significant knee, hip or back problems and no recent surgeries or broken bones.
They must also stand unassisted for an hour during the flight.
It is the required position during the whole flight.
As the balloon comes to land, all passengers will need to adopt the landing position, with knees bent in front of them.
Woman:
Are those rides safe?
Jason:
Hot air balloon companies are required to have a commercial balloon pilot licence, and all our pilots go through rigorous training before they are allowed to fly.
It is a relatively gentle activity.
However, the impact of a balloon landing can vary drastically, depending on factors like wind speed.
Sometimes it is similar to the momentum of jumping off a small chair.
If you cannot jump off a small chair, speaking to your doctor before booking a balloon flight is best.
Woman:
Thank you very much.
I think that's all I need to know.
Jason:
Thanks for calling.
Goodbye.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Enquiries on Hot Air Balloon Trip', [
          'The lowest price: £__Q1__ per person',
          'Each participant will be given a free __Q2__ at the end of the flight',
          'The exact date can only be booked __Q3__',
          'The balloon can fly a maximum height of __Q4__ metres',
          'There are no flights at __Q5__',
          'The best time of year to go is in __Q6__',
          'Flights may be cancelled because of bad weather, e.g. __Q7__',
          'It is advised to wear a jacket and a __Q8__',
          'There is no __Q9__ restriction for adults',
          'Participants must be able to __Q10__ throughout the flight',
        ], { 1: '125', 2: 'certificate', 3: 'online', 4: '1800/1,800', 5: 'night', 6: 'autumn', 7: 'thunderstorm/thunderstorms', 8: 'helmet', 9: 'age', 10: 'stand' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi giá.', t: ['A single ride may cost you up to £280 per person.', 'And the cheapest flight is £125 each for a group booking of at least 10 people.'], p: '£280 là giá tối đa (bẫy); giá rẻ nhất là £125 mỗi người → 125' },
        2: { v: 'Khi nói về các dịch vụ thêm.', t: ['Upon completing the trip, we will provide each participant with a certificate.', 'And that is entirely free of charge.'], p: 'Ảnh, rượu, bữa sáng là dịch vụ trả thêm (bẫy); chứng nhận miễn phí → certificate' },
        3: { v: 'Khi hỏi cách đặt chỗ.', t: ['Reservations can be made one year ahead of your trip by telephone.', 'But to pick a specific date, you must book online.'], p: 'Gọi điện chỉ đặt chung (bẫy); chọn ngày cụ thể phải đặt trực tuyến → online' },
        4: { v: 'Khi hỏi bóng bay cao bao nhiêu.', t: ['And the highest altitude ever recorded for a ride is 1,800 metres.', 'But most rides stay below 300 metres.'], p: '300 m là độ cao thường gặp (bẫy); cao nhất là 1.800 m → 1800' },
        5: { v: 'Khi hỏi giờ bay.', t: 'Night flights are avoided due to weather conditions.', p: 'Không bay ban đêm → night' },
        6: { v: 'Khi hỏi tháng nên đi.', t: 'Autumn is the best time of year to take the trip.', p: 'Mùa thu là thời điểm đẹp nhất → autumn' },
        7: { v: 'Khi nói chuyến bay có thể bị huỷ.', t: "It can be quite dangerous to fly under bad weather conditions, like a thunderstorm.", p: 'Thời tiết xấu như giông bão → thunderstorm' },
        8: { v: 'Khi hỏi nên mặc gì.', t: ['We suggest wearing comfortable clothing, like a jacket.', 'Wearing a helmet for safety concerns is also a good idea.', 'Sandals are not permitted.'], p: 'Áo khoác (đã có trên đề) và mũ bảo hiểm; dép xăng-đan bị cấm (bẫy) → helmet' },
        9: { v: 'Khi hỏi về trẻ em và người lớn tuổi.', t: 'However, an adult has no age limit as long as they meet the health requirements.', p: 'Trẻ em phải trên 9 tuổi; người lớn không giới hạn tuổi → age' },
        10: { v: 'Khi hỏi yêu cầu sức khoẻ.', t: ['They must also stand unassisted for an hour during the flight.', 'It is the required position during the whole flight.'], p: 'Phải tự đứng suốt chuyến bay → stand' },
      },
    },
    {
      part: 2, title: 'Rivermead School: Facilities Open to the Public', audio: 'Listening/Test 9/P2.mp3', cover: 'school theatre stage | school campus building',
      transcript: `
What I'd like to do at this meeting is to tell you a bit about the facilities that Rivermead School offers people in the community.
I'd like to start by talking about the new theatre that we've just opened in our school.
Its mission is to maximise opportunities for local audiences to experience productions of the highest quality, amongst other things.
This will involve offering a place where professional drama companies in the area can perform.
But there'll also be opportunities to host national and international companies, both those which are up and coming and those which have already established a reputation.
Details of our first season's theatre programme are already online.
I hope you'll agree that it looks very exciting.
As well as music and dance, there'll be drama from modern writers, and there'll also be a high proportion of shows aimed at children and families.
You'll notice that there is one empty space in November.
That's because the Chinese State Acrobatic Troupe have had to cancel their visit, but hopefully we'll be able to announce a replacement very soon.
Now, we're often asked about the theatre's sources of funding.
Well, a limited amount of money will come from various government subsidies, but the bulk of the revenue will be generated by the sale of tickets, which is one reason why we'd be grateful for your help in promoting the work of the theatre.
In addition, there are opportunities for individuals to support the theatre on a regular basis through its sponsorship scheme.
The benefits to donors include access to rehearsals and to show previews.
But the new theatre isn't the only facility which is open to everyone.
The school also has a small museum.
This holds various objects that were found when the ground was excavated to lay the foundations for the building, as well as other historical objects.
Entrance to this is free.
We also have a state-of-the-art sports hall.
This is reserved for our students during term time, but anyone can use it in the school holidays.
And our cafeteria is worth a visit.
It has a varied menu, and it's open all day to visitors as well as staff and students.
Right.
I'll just point out some things on the map of the school campus I've given you.
First of all, the theatre.
That's opposite car park P2, on the south side.
You're not allowed to park anywhere except in the car parks.
There are two marked on your map, P1 and P2, but there's a new car park which has only just been completed, and that's at the most northern end of the campus.
Some people might want to consider coming by bus.
There's a good service from the city centre to the school, and the bus stops at the roundabout.
That's where it turns round to go back, so you have to get off there.
It doesn't go up as far as Park Road.
Then, to get to the sports hall, you take the right fork after the main entrance and just keep going past the classroom block.
You have to go straight across the roundabout, and it's further on, on the right-hand side of that road.
Then there's the cafeteria.
There are various ways to get there, because it's at the junction of Park Road and Rennie's Drive, on the north side of Park Road.
In nice weather, you can sit outside to eat and admire the view.
Then the museum is fairly central.
Just go left after the main entrance.
Take the first turning on the right, and when you reach a junction, the museum is facing you.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nRivermead School: facilities open to the public', [
          [11, "What is the main aim of the school's new theatre?", ['to gain an international reputation', 'to give local people access to good performances', 'to provide support for talented amateur actors'], 'B'],
          [12, "The first season's theatre programme will include", ['plays by modern writers', 'displays by Chinese acrobats', 'concerts performed by schoolchildren'], 'A'],
          [13, "Most of the theatre's funding will come from", ['sponsors', 'government grants', 'ticket sales'], 'C'],
          [14, 'Which facility at the school is open to the public on a limited basis only?', ['the sports hall', 'the museum', 'the cafeteria'], 'A'],
        ], 'Questions 11-14'),
        map('Label the map below.\nWrite the correct letter, A-J, next to Questions 15-20.', [
          [15, 'Theatre', 'C'],
          [16, 'New car park', 'E'],
          [17, 'Bus stop', 'G'],
          [18, 'Sports hall', 'H'],
          [19, 'Cafeteria', 'F'],
          [20, 'Museum', 'B'],
        ], { pdf: 'Listening/Test 9/TEST 9- up.pdf', page: 3, box: [124, 150, 470, 526] }, 'Questions 15-20'),
      ],
      expl: {
        11: { v: 'Khi giới thiệu nhà hát mới.', t: 'Its mission is to maximise opportunities for local audiences to experience productions of the highest quality, amongst other things.', p: 'Đoàn quốc tế chỉ là một phần (bẫy A); sứ mệnh là cho khán giả địa phương xem các vở chất lượng cao → B' },
        12: { v: 'Khi nói về chương trình mùa đầu.', t: ['As well as music and dance, there\'ll be drama from modern writers', "That's because the Chinese State Acrobatic Troupe have had to cancel their visit"], p: 'Đoàn xiếc Trung Quốc đã huỷ (bẫy B); có kịch của các tác giả hiện đại → A' },
        13: { v: 'Khi nói về nguồn tài chính.', t: 'Well, a limited amount of money will come from various government subsidies, but the bulk of the revenue will be generated by the sale of tickets', p: 'Trợ cấp nhà nước chỉ một phần nhỏ (bẫy B); phần lớn từ bán vé → C' },
        14: { v: 'Khi nói các tiện ích khác.', t: ['This is reserved for our students during term time, but anyone can use it in the school holidays.', "It has a varied menu, and it's open all day to visitors as well as staff and students."], p: 'Bảo tàng vào cửa tự do, căng-tin mở cả ngày (B, C sai); nhà thể thao chỉ mở cho công chúng vào kỳ nghỉ → A' },
        15: { v: 'Khi bắt đầu chỉ trên bản đồ.', t: ["That's opposite car park P2, on the south side."], p: 'Đối diện bãi xe P2, phía nam → C' },
        16: { v: 'Khi nói về bãi xe.', t: "but there's a new car park which has only just been completed, and that's at the most northern end of the campus.", p: 'Bãi xe mới ở cực bắc của khuôn viên → E' },
        17: { v: 'Khi nói về xe buýt.', t: ['and the bus stops at the roundabout.', "It doesn't go up as far as Park Road."], p: 'Trạm xe buýt ở vòng xuyến → G' },
        18: { v: 'Khi chỉ đường tới nhà thể thao.', t: ['Then, to get to the sports hall, you take the right fork after the main entrance and just keep going past the classroom block.', "You have to go straight across the roundabout, and it's further on, on the right-hand side of that road."], p: 'Rẽ phải, qua dãy lớp học, đi thẳng qua vòng xuyến, nằm bên phải con đường → H' },
        19: { v: 'Khi nói về căng-tin.', t: "There are various ways to get there, because it's at the junction of Park Road and Rennie's Drive, on the north side of Park Road.", p: 'Ở giao lộ Park Road và Rennie\'s Drive, phía bắc Park Road (D nằm phía nam) → F' },
        20: { v: 'Cuối bài, về bảo tàng.', t: ['Just go left after the main entrance.', 'Take the first turning on the right, and when you reach a junction, the museum is facing you.'], p: 'Rẽ trái sau cổng chính, rẽ phải đầu tiên, tới ngã ba thì bảo tàng ở ngay trước mặt → B' },
      },
    },
    {
      part: 3, title: "Professor Smith's Article on Online Courses", audio: 'Listening/Test 9/P3.mp3', cover: 'online course laptop student | students discussing article',
      transcript: `
Peter:
Lynne, I just finished reading Professor Smith's article about the benefits of online courses.
What are your thoughts on the article?
Lynne:
Hi, Peter.
When I read that article, it was clear to me that Professor Smith does not favour the traditional methods of classroom teaching.
Although I can certainly acknowledge that there are some advantages to online course, I would say that internet courses are not always the best means for teaching and learning.
Peter:
I think it's about time to revolutionise the old teaching style, though.
Lynne:
But I would hope that students consider the negatives of online learning before enrolling in online courses.
Peter:
This shouldn't be a big issue since online courses are so common these days.
At least, I won't struggle so much.
And Professor Smith points out that computer learning is well suited for some courses, especially the technical courses.
Lynne:
Unfortunately, that theory doesn't work for me.
Peter:
What a shame.
I got an A for that online computing course last year.
Anyway, next part is personal interaction.
I think the personal interaction offered by traditional teaching is overrated in the article and doesn't have much value.
I think it's a distraction and that time could be better spent on the subject matter of the course.
Lynne:
Oh, I disagree.
Strongly, Peter.
You're dismissing the benefits of face-to-face interaction between students and teachers in traditional classroom settings.
The article says that learning is a two-way street, and it's much easier for students to learn if they can ask questions and have discussions with their teachers.
Peter:
I'm still not sure about that.
But online courses can foster students' technological skills.
In learning the subject matter online, students will gain the technical know-how they'll need in their future endeavours.
Lynne:
I can't agree more.
What do you think Professor Smith means when he says online courses should be flexible in time?
Peter:
That's essential.
The point of learning online is to allow those who can't attend courses at fixed time.
Lynne:
I agree.
The second part of the article shares some thoughts about the use of internet on campus.
I'm kind of lost in that part.
Peter:
Well, I think what he's trying to say is that students are already accustomed to doing their research on the internet, although some people say computers could be better used for other purposes.
He emphasises that many teachers are already instructing students to use the computer as a research tool.
Lynne:
Thanks for clarifying that.
What about the next part saying that students are divided?
Do you know what that means?
Peter:
Well, it's certainly not that some students are afraid to use computers.
They're already well accustomed to that.
Lynne:
You're right about that.
Most students already use the internet as their primary source for news and information.
Peter:
Professor Smith probably intends to say that computers are not easily accessible and available to all students.
Lynne:
Yes, not all students can afford computers.
And as Professor Smith notes, with online courses, the student support system is already in place.
Instead of asking fellow students or the professor for assistance, students would be able to get any information they need online.
And this assistance would be available immediately.
Peter:
So, why do you think Professor Smith is recommending the use of computers as the school's main means of educating students?
Do you think he is interested in reducing some of the fees associated with traditional classroom courses?
Lynne:
I think it's all about the money.
He is promoting online courses simply because he thinks it will enable the school to make more money.
Peter:
I never thought of it that way.
Lynne:
Many schools already have limited space for classrooms.
If the school board wants to enrol more students, they can do that through distance learning mode.
Instead of recruiting more teachers, the same course resources can be sold to both online and offline students.
Plus, some computer companies are willing to financially support the schools that promote this type of learning.
Peter:
I see.
This is profitable in every sense.
Alright, now we'll have something to write about in the research paper.`,
      groups: [
        matching("Who agrees with the following statements in Professor Smith's article?\nWrite the correct letter, A, B or C, next to Questions 21-26.",
          ['Peter', 'Lynne', 'Both Peter and Lynne'], [
            [21, 'It brings teaching problems when based on old methods.', 'A'],
            [22, 'Students should be cautious about applying for an online course.', 'B'],
            [23, 'Computers can be applied to certain courses.', 'A'],
            [24, 'The opinion about personal contact is not helpful.', 'A'],
            [25, 'Online courses come with technological development.', 'C'],
            [26, 'Online courses should have more time flexibility.', 'C'],
          ], { reuse: true, groupTitle: 'Questions 21-26' }),
        mc('Choose the correct letter, A, B or C.', [
          [27, 'What does Professor Smith think of the usage of the Internet on campus?', ['The students depend heavily on the internet.', 'Schools could make better use of computers.', 'Teachers should encourage students to use computers.'], 'A'],
          [28, 'What\'s the meaning of Professor Smith\'s term "divided"?', ['Students tend to avoid using the computer.', "Students don't have access to the computer.", 'Students are encouraged to use other useful resources.'], 'B'],
          [29, 'What kind of help does Professor Smith think students should get?', ["classmates' help", 'online help', "teachers' help"], 'B'],
          [30, "What is Professor Smith's view on the purpose of introducing the computers in school?", ['for computer companies selling computers more easily', 'for cutting other fees', 'a simple way to make profit'], 'C'],
        ], 'Questions 27-30'),
      ],
      expl: {
        21: { v: 'Đầu bài, khi bàn về phương pháp truyền thống.', t: ["I think it's about time to revolutionise the old teaching style, though."], p: 'Lynne cho rằng học trực tuyến không phải lúc nào cũng tốt; Peter muốn cách mạng hoá lối dạy cũ → chỉ Peter → A' },
        22: { v: 'Ngay sau đó.', t: ['But I would hope that students consider the negatives of online learning before enrolling in online courses.', "This shouldn't be a big issue"], p: 'Lynne muốn sinh viên cân nhắc mặt trái trước khi đăng ký; Peter thấy không thành vấn đề → chỉ Lynne → B' },
        23: { v: 'Khi bàn học bằng máy tính hợp với một số môn.', t: ['And Professor Smith points out that computer learning is well suited for some courses, especially the technical courses.', "Unfortunately, that theory doesn't work for me."], p: 'Lynne nói không đúng với cô; Peter đạt điểm A môn tin học trực tuyến → chỉ Peter → A' },
        24: { v: 'Khi bàn tương tác trực tiếp.', t: ["I think the personal interaction offered by traditional teaching is overrated in the article and doesn't have much value.", 'Oh, I disagree.'], p: 'Peter cho rằng tương tác trực tiếp không có giá trị; Lynne phản đối mạnh → chỉ Peter → A' },
        25: { v: 'Khi bàn kỹ năng công nghệ.', t: ["But online courses can foster students' technological skills.", "I can't agree more."], p: 'Peter nêu, Lynne “hoàn toàn đồng ý” → cả hai → C' },
        26: { v: 'Khi bàn sự linh hoạt về thời gian.', t: ["The point of learning online is to allow those who can't attend courses at fixed time.", 'I agree.'], p: 'Peter giải thích, Lynne đồng ý → cả hai → C' },
        27: { v: 'Khi bàn phần thứ hai của bài báo.', t: ["Well, I think what he's trying to say is that students are already accustomed to doing their research on the internet, although some people say computers could be better used for other purposes."], p: 'Dùng máy tính tốt hơn là ý của người khác (bẫy B); sinh viên đã quen nghiên cứu trên mạng → phụ thuộc nhiều vào internet → A' },
        28: { v: 'Khi bàn từ “divided”.', t: ["Well, it's certainly not that some students are afraid to use computers.", 'Professor Smith probably intends to say that computers are not easily accessible and available to all students.'], p: 'Không phải sợ máy tính (A sai); không phải ai cũng có máy tính → B' },
        29: { v: 'Khi bàn hệ thống hỗ trợ sinh viên.', t: 'Instead of asking fellow students or the professor for assistance, students would be able to get any information they need online.', p: 'Thay vì hỏi bạn hay giáo sư (bẫy A, C), sinh viên được hỗ trợ trực tuyến → B' },
        30: { v: 'Cuối bài, về mục đích dùng máy tính.', t: ['Do you think he is interested in reducing some of the fees associated with traditional classroom courses?', "I think it's all about the money.", 'He is promoting online courses simply because he thinks it will enable the school to make more money.'], p: 'Giảm phí là câu hỏi của Peter (bẫy B); đơn giản là để trường kiếm thêm tiền → C' },
      },
    },
    {
      part: 4, title: 'Technology and Education', audio: 'Listening/Test 9/P4.mp3', cover: 'students using computers classroom | university e-learning',
      transcript: `
Hello, and welcome to today's seminar about education.
Education is a lifelong process.
There is no limit on when to start and stop.
And we have been using technology so much these days in each and every sector of our lives, including education.
Have we ever taken out a second to wonder if it's leaving a positive impact on our work, or it's just that we have been relying on it so much that we've become used to it?
Earlier, there was a lot of debate about technology in education amongst the faculty at our school.
Everyone had their own views.
At first, some believed that the use of email between students and teachers made them interact with each other less, and this was not a good thing.
But gradually, as technology was embraced by more educational institutes, they realised the importance of technology in education.
Technology and education are a great combination if used together with the right reason and vision.
Moreover, there is a strong relationship with the local economy when it comes to the effectiveness of the use of IT in education.
In the more developed areas, the schools and institutions have better access to more advanced technology, and the teachers are better trained to use the technology to improve the quality of their classes.
In contrast, in some less developed regions and remote areas where technology is not so common, the effectiveness can't be guaranteed.
However, wherever they are, the most common example for teachers using technology in education is the usage of computers in their teaching methods.
In most classrooms, you can see teachers using computers to present teaching notes and other materials.
This year, the IT School of Westbrook University has implemented a brand new education mode.
Since its implementation, both teachers and students have been praising this new mode.
It involves a kind of software which allows students, as well as teachers, to talk and discuss with each other more easily.
And they said they enjoy this way of communication.
Once more, the mode offers students a channel to post any work that they are proud of, whether it's a nice photograph that they take, a case study they do, a song they record, or even just a great idea they have.
So it gives them a chance to showcase their strength and build up their confidence.
Many students use this feature to show the best of themselves.
It also provides students an opportunity to choose what they learn on the internet, so they no longer have to sit in the classroom listening to something they are bored with.
And they don't have to wait all night trying to register for their favourite elective courses.
Compared with the traditional platform, it is more flexible.
The open source which the new mode provides is free for students to use when they are trying to look up online materials for their papers or researches.
And the data will not easily be found on the internet, because only registered users have access to the database.
By the way, all the materials are original works of teachers or scholars, so there is no need to worry about the quality of the content.
And with the overwhelming amount of unwanted information on the internet, this mode gives students a new search engine they can use on campus.
So, information like advertisements and sceptical sources will be filtered easily.
This is a perfect example of new solutions to new problems.
Apart from that, students can arrange their daily activities and improve their time management skills.
By simply ticking the boxes in the timetable online, they can set up their own starting time and their deadline for each assignment.
Based on statistics, the use of this function has a positive effect on the students who constantly procrastinate.
By the end of the first term, the number of students who asked for extension for their papers had decreased by 10%, which was quite an achievement.
Another feature that seems very creative to me is that students can help people who have questions or problems relating to their field of studies on a special platform.
They can even have some income by providing people with good solutions.
So, this new mode is making the most of the IT...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Technology and Education', [
          'Some people believed __Q31__ failed to help students interact with teachers',
          'IT in education develops a tight __Q32__ with local economy',
          'Computers are commonly used to develop teaching __Q33__',
          '<strong>The new mode in the IT School of Westbrook University</strong>',
          '• Students enjoy the __Q34__ with teachers.',
          '• New technology builds up greater __Q35__ for students',
          '• Compared with traditional teaching, the new way is more __Q36__',
          '• It offers students quality __Q37__',
          '• It is seen as new solutions to new __Q38__',
          '• It nurtures __Q39__ management skills',
          '• It also provides students a source of __Q40__',
        ], { 31: 'email/emails', 32: 'relationship', 33: 'methods', 34: 'communication', 35: 'confidence', 36: 'flexible', 37: 'materials', 38: 'problems', 39: 'time', 40: 'income' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về tranh luận ban đầu.', t: 'At first, some believed that the use of email between students and teachers made them interact with each other less, and this was not a good thing.', p: 'Dùng email khiến thầy trò ít tương tác hơn → email' },
        32: { v: 'Khi nói về kinh tế địa phương.', t: 'Moreover, there is a strong relationship with the local economy when it comes to the effectiveness of the use of IT in education.', p: '“A strong relationship” = mối liên hệ chặt chẽ → relationship' },
        33: { v: 'Khi nói ví dụ phổ biến nhất.', t: 'the most common example for teachers using technology in education is the usage of computers in their teaching methods.', p: 'Dùng máy tính trong phương pháp giảng dạy → methods' },
        34: { v: 'Khi giới thiệu mô hình mới ở Westbrook.', t: ['It involves a kind of software which allows students, as well as teachers, to talk and discuss with each other more easily.', 'And they said they enjoy this way of communication.'], p: 'Sinh viên thích cách giao tiếp này với giáo viên → communication' },
        35: { v: 'Khi nói về kênh đăng tác phẩm.', t: 'So it gives them a chance to showcase their strength and build up their confidence.', p: 'Giúp sinh viên xây dựng sự tự tin → confidence' },
        36: { v: 'Khi so sánh với nền tảng cũ.', t: 'Compared with the traditional platform, it is more flexible.', p: 'Linh hoạt hơn cách học truyền thống → flexible' },
        37: { v: 'Khi nói về nguồn mở.', t: 'By the way, all the materials are original works of teachers or scholars, so there is no need to worry about the quality of the content.', p: 'Tài liệu do giáo viên, học giả soạn nên chất lượng đảm bảo → materials' },
        38: { v: 'Khi nói về công cụ tìm kiếm.', t: 'This is a perfect example of new solutions to new problems.', p: 'Giải pháp mới cho vấn đề mới → problems' },
        39: { v: 'Khi nói về thời khoá biểu trực tuyến.', t: 'Apart from that, students can arrange their daily activities and improve their time management skills.', p: 'Rèn kỹ năng quản lý thời gian → time' },
        40: { v: 'Phần cuối.', t: 'They can even have some income by providing people with good solutions.', p: 'Có thể kiếm thu nhập khi giúp người khác → income' },
      },
    },
  ],
};
