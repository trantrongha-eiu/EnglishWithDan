// Vol 5 – Test 4 (PDF "Listening/Test 4/TEST 4_up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p4; audio Test 4/P2, p3, P4).
// P1 = bank "Booking Flights" (Actual Test 7 P1: Bakewell Travel, Sarah Carter, same key 10/10).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns) checked against "Transcripts & Keys/test 4- transcript.pdf".
// Paper P4 is numbered "Questions 1–10" (copied from a single-part practice paper, "Version: 08412") → 31–40 here.
// P2: the club is "Creton" on the paper (recording/Otter "Cretan"/"cretin") → transcript follows the paper.
const { note, mc, multi, matching } = require('../vol_build');

module.exports = {
  vol: 5, test: 4,
  sections: [
    { part: 1, reuse: '6a53d1e85c459ab074ceb10c', title: 'Booking Flights' },
    {
      part: 2, title: 'Annual Running Competition', audio: 'Listening/Test 4/P2.mp3', cover: 'running race start line | town fun run runners',
      transcript: `
Good morning, everyone.
I'm Dave, the manager of Creton Running Sports Club.
Today, I'll tell you something about the running competition, which will be held next month.
As we know, the annual run is one of the most popular events in our town, and it attracts young and old every year.
This year, we will continue the tradition, but there'll be some small adjustments.
First, about the date.
The exact time of the run is still on the first Saturday of May, but we'll inform you in advance if it's to be delayed due to bad weather.
The run used to start at the park, which is being refurbished at the moment, so this time all the runners are expected to gather in front of the castle and start from there.
The actual run begins at 9am, but the runners start arriving at about 8.45, so some of you might have to get up early that morning if you live far away.
Someone has asked how long you'll be required to run.
In the past few years, the runners have had to complete the distance of five miles.
But most people want to do a bit more than that, so we will lengthen it to seven miles this time.
Some of you might not be sure whether you can run that far, so you'd better start doing a bit of training.
I'm excited to tell you that this year we've got the sponsorship from a big company who has promised to cover all the competition expenses, including the prize for the champion.
The runner with the shortest time will be awarded sports equipment worth about £1,000.
Each runner will be timed from the starting point till the end.
When you cross the finish line marked on the ground of the station, you'll be given a barcode and you should take this to one of the run volunteers who will scan it.
Then you can get your time on the computer immediately and the volunteers will collect all the results.
If you are interested in the run, I suggest you register as soon as possible.
The deadline is next Sunday.
However, I should tell you this year you can't enrol through the internet but have to go to the town hall and give all the personal information and sign your name.
It doesn't cost anything to register.
As I've just said, all the costs related to the competition will be paid by our sponsor.
As for the age limit, you have to be at least 16, and the top limit is now 70, though you need to obtain a health certificate from your doctor if you're over 60 years old.
If you do come and participate in the run, I definitely recommend that you should prepare an extra pair of shoes, as last year one of the runners got something wrong with his shoes during the running and had to give up halfway through the competition.
Besides, a jacket will also be advisable, so you don't catch a cold after sweating a lot during the running.
There is no need to worry about snacks or drinks, as every runner will be supplied with chocolates and bottled water.
To prepare for this annual running competition, our club is going to organise a training class for all the participants.
In the class, an experienced trainer will teach you the professional steps on how to do a running competition, like warming up before running.
For those who plan to do training by yourselves, there are some suggestions for you.
First, don't just do morning jogging with your dog.
Remember that you're going to compete with others.
I know some people like to exercise in groups, but it's more effective to run with your friend who can be your rival and stimulate your potential.
Then I suggest you make a record of your running time.
It can show whether you've made any progress day by day.
What's more, you'd better get used to different roads and paths in the countryside or village, as you won't just be running on level ground during the competition.
By the way, you don't have to run in all kinds of weather.
As I've just said, our competition is going to be held in good weather.
Well, that's all the details about the running competition.
If you have any other questions, please call our club at 8345 6234.
Anyone who is interested in the run, just get started.`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Annual Running Competition – Creton Running Sports Club', [
          'Starting point: at the __Q11__ this year',
          'Distance: __Q12__',
          'Prize: __Q13__ for the winner',
          'Finishing point: at the __Q14__',
          'Registration site: at the __Q15__',
          'Age limit: people who are under __Q16__ are not allowed',
          'Need to bring: a __Q17__ and spare shoes',
        ], { 11: 'castle', 12: '7 miles/seven miles/7', 13: 'sports equipment', 14: 'station', 15: 'town hall', 16: '16/sixteen', 17: 'jacket' }, 'Questions 11-17'),
        multi('Choose THREE letters, A-G.', 18, 'Which THREE of the following are given as the training advice by the speaker?', ['be careful of dogs', 'compete with a friend', 'run under all weather conditions', 'warm up before running', 'compete in groups', 'time yourself', 'run on various types of roads and paths'], ['B', 'F', 'G'], 'Questions 18-20'),
      ],
      expl: {
        11: { v: 'Khi nói về điểm xuất phát năm nay.', t: 'The run used to start at the park, which is being refurbished at the moment, so this time all the runners are expected to gather in front of the castle and start from there.', p: 'Công viên đang sửa (bẫy); năm nay xuất phát trước lâu đài → castle' },
        12: { v: 'Khi nói về quãng đường.', t: ['In the past few years, the runners have had to complete the distance of five miles.', 'But most people want to do a bit more than that, so we will lengthen it to seven miles this time.'], p: '5 dặm là mấy năm trước (bẫy); năm nay kéo dài thành 7 dặm → 7 miles' },
        13: { v: 'Khi nói về giải thưởng.', t: 'The runner with the shortest time will be awarded sports equipment worth about £1,000.', p: 'Người về nhất nhận dụng cụ thể thao trị giá khoảng £1.000 → sports equipment' },
        14: { v: 'Khi nói về vạch đích.', t: "When you cross the finish line marked on the ground of the station, you'll be given a barcode", p: 'Vạch đích kẻ trên sân nhà ga → station' },
        15: { v: 'Khi nói về đăng ký.', t: "However, I should tell you this year you can't enrol through the internet but have to go to the town hall and give all the personal information and sign your name.", p: 'Không đăng ký qua mạng (bẫy); phải tới toà thị chính → town hall' },
        16: { v: 'Khi nói về giới hạn tuổi.', t: 'As for the age limit, you have to be at least 16, and the top limit is now 70', p: 'Phải từ 16 tuổi trở lên → dưới 16 không được tham gia; 70, 60 là bẫy → 16' },
        17: { v: 'Khi nói nên mang theo gì.', t: ["Besides, a jacket will also be advisable, so you don't catch a cold after sweating a lot during the running.", 'There is no need to worry about snacks or drinks'], p: 'Giày dự phòng đã có trên đề, đồ ăn uống được phát (bẫy); nên mang áo khoác → jacket' },
        18: { v: 'Phần lời khuyên tự tập luyện.', t: ["First, don't just do morning jogging with your dog.", "I know some people like to exercise in groups, but it's more effective to run with your friend who can be your rival and stimulate your potential."], p: 'Không nói cẩn thận với chó (A sai), tập nhóm kém hiệu quả (E sai); chạy với bạn làm đối thủ → B' },
        19: { v: 'Như câu 18 (chọn 3 đáp án).', t: ['Then I suggest you make a record of your running time.', "It can show whether you've made any progress day by day."], p: 'Ghi lại thời gian chạy → tự bấm giờ → F' },
        20: { v: 'Như câu 18 (chọn 3 đáp án).', t: ["What's more, you'd better get used to different roads and paths in the countryside or village", "By the way, you don't have to run in all kinds of weather."], p: 'Không cần chạy mọi thời tiết (C sai); khởi động là việc của lớp huấn luyện, không phải lời khuyên tự tập (D sai); làm quen nhiều loại đường → G' },
      },
    },
    {
      part: 3, title: 'Choosing Selective Courses', audio: 'Listening/Test 4/p3.mp3', cover: 'university students choosing courses | course registration laptop',
      transcript: `
Rick:
Hey, Nina, have you chosen a selective course yet?
Nina:
Not really, Rick.
I haven't made up my mind yet.
What about you?
Rick:
Me either.
We have to decide as soon as possible, though.
Nina:
Why?
Today's not the final day for choosing selective courses, is it?
Rick:
No, but they'll be booked up very soon.
Actually, some courses are already full.
Nina:
Really?
That's too bad.
Well, I was thinking of taking a language course.
What do you think?
Rick:
Yes, you can do that.
You can choose all courses on the school website except mathematics, since it's a required course for all students.
By the way, I think business course is a good choice.
Nina:
Yeah, it's not bad.
I think it's going to be quite helpful after we graduate.
Rick:
I think so.
Guess what?
I wanted to choose information statistics.
Nina:
Why?
Rick:
It's related to our major, so I think it's very useful for us.
I mean, we will have an advantage in job hunting.
But the bad thing is, it's in the morning, so we have to skip other classes in order to take it.
Nina:
That's not good.
We need to find an alternative that is more convenient for us.
Rick:
I know, it's a shame.
Nina, I think we need to get to know the courses more before choosing them.
Otherwise, we may end up studying something that's either boring or useless.
Nina:
You are right.
Maybe we can look online to see if there's information about it.
We could also ask our parents for advice.
Rick:
I don't think that's going to help much.
People have all kinds of opinions online.
We wouldn't know which one to listen to.
And our parents probably don't know much about our field.
I think the best way is asking the former students who have taken the class themselves.
They can tell us how they thought about it from their own experience.
Nina:
Oh, yes, they know it better than anyone, just like how much we know the art design class.
Rick:
Yes, before we took it last year, many people said on the internet that it was quite confusing, but it turned out to be quite easy and helpful, right?
Nina:
Mm-hmm.
It didn't let us down.
I definitely value the course.
Design is an important skill in today's world.
Well, whatever course we want to choose, there are still things I need to figure out.
Rick:
What do you mean?
Do you mean things like the time of the courses?
Nina:
Since it's the first time we can choose selective courses, I need to know how to register.
I think there will be instruction on our school website for registration.
I'll let you know.
Rick:
You are so considerate, Nina.
I think that's necessary.
We need to make sure we can register as soon as we make up our mind.
Nina:
The courses we studied last semester were quite interesting.
Maybe we could get some inspiration from those courses.
Do you think so?
Rick:
Well, yeah, some of them were quite fun for me, such as metallurgy, though there were quite a lot of terms to remember.
Nina:
But there's also a lot of useful information about it on the internet, which made things easier.
Rick:
That's right.
I can refer to many things when I was working on the paper.
Nina:
And the professor in Fluid Mechanics was really patient.
His explanation was crystal clear, so students had no difficulty understanding it.
Rick:
Yes, that's true.
I was good at this course.
What do you think of computing?
Nina:
I think it was kind of boring in the beginning.
Do you think so?
Rick:
That's exactly how I felt.
There are a lot of numbers to deal with, but thankfully it got more interesting when the course went on.
Nina:
Right.
Because later we could relate the theories to real-life examples.
Rick:
Exactly.
Another course that I think was really practical is Energy Economy.
Nina:
Oh, yes.
There are a lot of practical works in the course.
What we learned can come in handy in our future jobs.
Rick:
We should make the decision based on our own experience and preference.
Nina:
Yeah.
Anyway, we really need to hurry up.
Rick:
I'm sure we can reach a conclusion today.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Why should they choose a selective course immediately?', ["It's the final day.", 'It will be full very soon.', "They don't have time later on."], 'B'],
          [22, 'What is the compulsory course for all students?', ['Language course', 'Business study', 'Mathematics'], 'C'],
          [23, 'What does Rick think of the course Information Statistics?', ["It's useful.", "It's convenient to take.", 'It involves a lot of work.'], 'A'],
          [24, 'What will they do before choosing the selective courses?', ['consult the students about the teaching quality', 'look online about the related information', 'ask their parents for suggestions'], 'A'],
          [25, 'How did they feel about the art design class?', ['surprising', 'confusing', 'valuable'], 'C'],
          [26, 'What does Nina want to make sure about selective courses?', ['How they register the course', 'When the course will take place', 'Amount of work to be done online'], 'A'],
        ], 'Questions 21-26'),
        matching('What do they think of each of the following courses?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 27-30.',
          ['became more engaging', "Professor's notes were detailed", 'involved a lot of practical work', "Professor's explanation was clear", 'useful material online', 'harder than expected'], [
            [27, 'Metallurgy', 'E'],
            [28, 'Fluid mechanics', 'D'],
            [29, 'Computing', 'A'],
            [30, 'Energy economy', 'C'],
          ], { groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, khi Rick nói phải quyết định sớm.', t: ["Today's not the final day for choosing selective courses, is it?", "No, but they'll be booked up very soon."], p: 'Hôm nay không phải ngày cuối (A sai); các khoá sẽ sớm kín chỗ → B' },
        22: { v: 'Khi Nina định học ngôn ngữ.', t: "You can choose all courses on the school website except mathematics, since it's a required course for all students.", p: 'Toán là môn bắt buộc với mọi sinh viên → C' },
        23: { v: 'Khi Rick nói về Information Statistics.', t: ["It's related to our major, so I think it's very useful for us.", "But the bad thing is, it's in the morning, so we have to skip other classes in order to take it."], p: 'Học buổi sáng nên không tiện (B sai); Rick thấy môn này rất hữu ích → A' },
        24: { v: 'Khi bàn tìm hiểu các khoá học.', t: ["People have all kinds of opinions online.", "And our parents probably don't know much about our field.", 'I think the best way is asking the former students who have taken the class themselves.'], p: 'Trên mạng ý kiến lẫn lộn, bố mẹ không rành (B, C sai); hỏi sinh viên khoá trước → A' },
        25: { v: 'Khi nhắc lại lớp thiết kế mỹ thuật.', t: ['many people said on the internet that it was quite confusing, but it turned out to be quite easy and helpful, right?', 'I definitely value the course.'], p: '“Confusing” là lời đồn trên mạng (bẫy B); họ thấy khoá học rất đáng giá → C' },
        26: { v: 'Khi Nina nói còn điều cần tìm hiểu.', t: ['Do you mean things like the time of the courses?', 'Since it\'s the first time we can choose selective courses, I need to know how to register.'], p: 'Thời gian học là đoán của Rick (bẫy B); Nina cần biết cách đăng ký → A' },
        27: { v: 'Khi nhắc lại môn luyện kim.', t: ['such as metallurgy, though there were quite a lot of terms to remember.', "But there's also a lot of useful information about it on the internet, which made things easier."], p: 'Nhiều thuật ngữ nhưng có nhiều tài liệu hữu ích trên mạng → E' },
        28: { v: 'Khi nói về cơ học chất lưu.', t: 'His explanation was crystal clear, so students had no difficulty understanding it.', p: 'Giáo sư giảng giải rất rõ ràng → D' },
        29: { v: 'Khi nói về môn tin học.', t: ['I think it was kind of boring in the beginning.', 'There are a lot of numbers to deal with, but thankfully it got more interesting when the course went on.'], p: 'Lúc đầu chán, càng học càng thú vị → trở nên hấp dẫn hơn → A' },
        30: { v: 'Khi nói về kinh tế năng lượng.', t: ['Another course that I think was really practical is Energy Economy.', 'There are a lot of practical works in the course.'], p: 'Có rất nhiều bài thực hành → C' },
      },
    },
    {
      part: 4, title: 'Boar and Red Deer', audio: 'Listening/Test 4/P4.mp3', cover: 'wild boar forest | red deer stag',
      transcript: `
Good morning.
My name's Jim Robinson and today we're going to look at the control of wild animals, specifically wild boar.
Now, boar have been natural inhabitants of Western Europe for thousands of years, but in recent years, there has been a surge in boar activity that poses a real threat.
Boars are not currently on the protected animals list, which is perhaps why there has been a spike in their breeding activity.
Boars are an indigenous species and are particularly plentiful in rural France and the Bavarian uplands of Germany.
Boar hunting is a European tradition that goes back to Roman times and became particularly popular among courtiers during the Middle Ages.
Even during the 20th century, boar hunting was seen as an integral part of rural life.
The decline in boar hunting has obviously led to a rise in the boar populations of Europe, and the situation has reached a critical point, with boar posing a critical threat to the environment.
Proponents of boar hunting cite this factor as a major reason why boar populations should be contained.
Boar also pose a threat to humans too, with countless reports of people being injured during boar attacks.
The origins of the wild boar have roots in Germanic, and this perhaps explains their prevalence in Germany.
The problems with the boar population in Germany have ramifications for the rest of Europe, as boar packs migrate towards Central and Eastern Europe.
One of the main issues that is of great concern is the transmission of diseases that infect other species.
Dairy farmers in France are particularly concerned as many of them have seen their herds depleted by infections.
The methods for containing boar populations have been looked at in great detail and numerous options are available.
One is to encourage more boar hunting in wild regions, such as mountains and forests.
Hunters would be given licences to hunt, either for food or sport.
Of course, boar do pose a threat to human life, so this possibility must be looked at with caution.
One method that must be ruled out is poison, as legislation has been introduced prohibiting this.
Such methods were tried with rabbits in the 1960s, and this had a disastrous impact on the food chain.
The introduction of natural predators into the ecosystem is also an option that can't be considered.
The only known predators of boar in the world are wild cats, like lions and tigers.
Obviously, there's no way such animals can be allowed to roam the mountains and forests of Europe.
Given the threat that boars pose to humans, it is imperative that forest-dwelling boar are kept well away from people in cities.
This is absolutely essential as human safety must be the main priority of policymakers.
By the 11th century, boars in several European countries were becoming increasingly rare in Great Britain.
King Charles attempted to reintroduce boars in the New Forest area of the country.
Yet the entire population was almost wiped out during the battles of the English Civil War, when roaming soldiers hunted them for food.
During the 1980s, wild boar rearing was encouraged and boar populations began to rise again.
By the 1990s, there was a huge rise in the number of boar across England, due in large part to the species no longer being forced to live in captivity.
Many boar have broken free from farms across England and are breeding at a rapid rate.
Aside from their environmental threat, boars also pose a problem for farmers growing crops and vegetables.
Other species such as red deer are a threat to farm produce like grain and potatoes.
But boars certainly present the most serious risk.
The damage done to the farming industry is estimated to cost millions of pounds, and insurance payments as a result of this have spiked in the last decade.
Red deer are predominantly confined to forest areas, and it is unusual to see them outside their habitats during the summer months.
However, as the weather gets colder, they can be seen looking for food around local villages and fields.
Red deer have their origins in Asia and are a ruminant species, which means they have a stomach that consists of four compartments, much like cows.
They are slaughtered for food and their meat is sold as venison and is increasingly popular among consumers.
There are nine subspecies of red deer, with three of them on the endangered species list.
The deer population doesn't pose the same threat as the boar population, but it certainly needs to be addressed.
Forest areas are their main habitats, and they are now breeding at a much higher rate than in previous years.
Of course, deer are an important part of the food chain and are an important part of the hunting traditions of the UK, so it is important that their population is kept stable for this reason.
Though the real concern is the problems that deer present for farmers, who have seen their crops suffer in devastating ways.
Protection needs to be offered and many farmers report building large perimeter fences around their fields to keep deer out, which costs them a huge amount of money.
Government funding is so far inadequate to offer the protection farmers need, but ways are being looked at to provide subsidies through other means.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Boar and Red Deer', [
          '<strong>Boar</strong>',
          '• Boar is not a __Q31__ species.',
          '• Their number should be controlled as a result of their damage to the __Q32__',
          '• They also spread __Q33__',
          '• Law was passed regarding banning use of __Q34__ in killing boars.',
          '• Measures should be taken to keep the boars in the __Q35__ away from people in urban areas.',
          '• The early 1990s witnessed a significant population rise of boars due to their escape from __Q36__',
          '<strong>Red Deer</strong>',
          '• Red deer can also damage agricultural produce, such as grain and __Q37__',
          '• In winter the red deer come out to the villages for __Q38__',
          '• The number of deer keep stable for __Q39__',
          '• Deer can have a devastating effect on the local __Q40__',
        ], { 31: 'protected', 32: 'environment', 33: 'diseases/disease', 34: 'poison', 35: 'forest/forests', 36: 'captivity', 37: 'potatoes', 38: 'food', 39: 'hunting', 40: 'crops' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài.', t: 'Boars are not currently on the protected animals list, which is perhaps why there has been a spike in their breeding activity.', p: 'Lợn rừng không nằm trong danh sách động vật được bảo vệ → protected' },
        32: { v: 'Khi nói vì sao cần kiểm soát số lượng.', t: ['with boar posing a critical threat to the environment.', 'Proponents of boar hunting cite this factor as a major reason why boar populations should be contained.'], p: 'Mối đe doạ nghiêm trọng với môi trường là lý do chính phải kiểm soát → environment' },
        33: { v: 'Khi nói mối lo ngại chính.', t: 'One of the main issues that is of great concern is the transmission of diseases that infect other species.', p: 'Lây truyền bệnh sang loài khác → diseases' },
        34: { v: 'Khi nói các cách kiểm soát.', t: 'One method that must be ruled out is poison, as legislation has been introduced prohibiting this.', p: 'Luật cấm dùng thuốc độc → poison' },
        35: { v: 'Khi nói về an toàn của con người.', t: 'it is imperative that forest-dwelling boar are kept well away from people in cities.', p: 'Lợn rừng sống trong rừng phải được giữ xa người ở thành phố → forest' },
        36: { v: 'Khi nói về những năm 1990.', t: 'By the 1990s, there was a huge rise in the number of boar across England, due in large part to the species no longer being forced to live in captivity.', p: 'Không còn bị nuôi nhốt, nhiều con thoát khỏi trang trại → captivity' },
        37: { v: 'Khi chuyển sang hươu đỏ.', t: 'Other species such as red deer are a threat to farm produce like grain and potatoes.', p: 'Ngũ cốc (đã có trên đề) và khoai tây → potatoes' },
        38: { v: 'Khi nói tập tính mùa đông.', t: 'However, as the weather gets colder, they can be seen looking for food around local villages and fields.', p: 'Trời lạnh, hươu ra quanh làng tìm thức ăn → food' },
        39: { v: 'Khi nói vì sao cần giữ số lượng ổn định.', t: 'Of course, deer are an important part of the food chain and are an important part of the hunting traditions of the UK, so it is important that their population is kept stable for this reason.', p: 'Giữ ổn định vì truyền thống săn bắn của Anh → hunting' },
        40: { v: 'Cuối bài.', t: 'Though the real concern is the problems that deer present for farmers, who have seen their crops suffer in devastating ways.', p: 'Mùa màng của nông dân bị tàn phá nặng nề → crops' },
      },
    },
  ],
};
