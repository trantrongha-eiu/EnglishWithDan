// Vol 6 – Test 6 (PDF "Lis/L-TEST 6.pdf" p1–6, headed "Test 6-1"; key "Lis/L-key.pdf" p6; audio "Lis/Audio Lis/Test 6/P1 - , P2,
// P3 , P4.mp3"). Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// P1 plays its example first and then the whole conversation → transcript keeps the full version only.
// P2 = bank "The Elmsden Way Cycle Route" (Vol 4 - Test 4 P2): same recording (6-gram 0.79) and same questions → reused. The
// Vol 6 key Q16 "A" (very busy) is wrong: the station "was closed in the 1950s… ready for trains to start using it again
// earlier this year" = re-opened recently (C), as in the bank.
// P4 is a different recording from bank "Tracking Crocodiles in Queensland" (other speaker, other notes) → seeded.
// Transcript: Whisper large-v3 (its segments break at turn changes) checked against turbo + pitch; turbo has no P4.
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 6, test: 6,
  sections: [
    {
      part: 1, title: 'A Residence Survey', audio: 'Lis/Audio Lis/Test 6/P1 - .mp3', cover: 'street survey interview questionnaire | young man city interview',
      transcript: `
Interviewer:
Excuse me?
Lee:
Yes?
Interviewer:
I was wondering if you could spare a few minutes to do a questionnaire on your residency here in the north.
It won't take long.
Lee:
No, that's fine.
Interviewer:
Lovely.
First of all, may I get some information about yourself?
Lee:
OK.
Interviewer:
May I know your name and age?
Lee:
My name's Lee and I'm 19 years old now.
Interviewer:
Great.
And could I ask what your job is?
Are you a student?
Lee:
Actually, I'm going to continue my study in business management next month, but at the moment, I'm a salesman by profession.
Interviewer:
Oh, right.
And how long have you been living here in the north?
Lee:
Well, I have been in this city since I was three years old, but my family and I had lived in the East for seven years at first.
Now I am 19, so I have spent about nine years living here till now.
Interviewer:
Great.
Which part of the northern area do you live in?
Lee:
I live in Spring Park.
Have you heard of it?
Interviewer:
Yes, of course.
So, what about your accommodation?
Do you live in a house or a flat or something similar?
Lee:
I used to live with my family in a big house, and now I'm living in an apartment with two of my friends who are my colleagues as well.
Interviewer:
Oh, right.
And one more question.
What means of transport will you take when you need to go somewhere?
Lee:
Um, if it's not too far away, I'd prefer to go on foot or by bicycle.
If there is a long way to go, I take the train or sometimes a cab.
I rarely take buses because I think the most important things to keep in mind are time and comfort.
Interviewer:
Great.
Thanks.
Now, let's go to the second part of my questionnaire.
I'd like you to tell me, how often do you dine out?
Is it once a week or several times a year?
Lee:
I'm afraid neither of those options agree with me.
I don't often go out for dinner, maybe once a month.
Every week just seems too often for me.
Interviewer:
OK, then where do you usually go for recreation?
Lee:
I often go to places that other people go to.
I sometimes go clubbing after work.
You know, there are some fantastic clubs nearby.
Interviewer:
And if you do not have to work during the day, will you go for a show or something?
Lee:
You know, there is a newly built theatre that opened last month in Spring Park, but I rarely go there because it's too expensive.
I prefer to go to the cinema to see some of the latest movies.
Interviewer:
Do you like doing sports?
And what is your main form of exercise?
Lee:
I like swimming and I go to the gym occasionally, but I spend most of my spare time sailing.
Interviewer:
All right.
Last question.
Have you taken any part-time courses?
Lee:
Yes, because I'm really keen on cartoons.
I'm doing a Japanese course during the weekends, but I'm still a beginner.
Interviewer:
Wow, what a special language.
Most people I know would like to learn Spanish or Latin.
You must be brilliant.
Well, thank you very much for your time.
Lee:
No problem.
Bye.`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'A Residence Survey', [
          'Example: Age of the interviewee: <u>19</u>',
          'Current occupation: __Q1__',
          'Length of living in the north: __Q2__',
          'Exact living area: __Q3__',
          'Type of accommodation: a shared __Q4__',
          'Means of transport:',
          '   private: walking and bicycles',
          '   public: __Q5__ and taxi',
        ], { 1: 'salesman', 2: '9 years/nine years', 3: 'Spring Park', 4: 'apartment', 5: 'train/trains' }, 'Questions 1-5'),
        note('Complete the notes below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', '', [
          'Frequency of eating out: __Q6__',
          'Places for entertainment: __Q7__',
          'Other free time activity: go to the __Q8__',
          'Preferred exercises:',
          '   – go swimming',
          '   – go to the gym',
          '   – go __Q9__',
          'Part-time course: __Q10__',
        ], { 6: 'once a month', 7: 'clubs/nightclubs', 8: 'cinema', 9: 'sailing', 10: 'Japanese/a Japanese course/Japanese course' }, 'Questions 6-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi công việc của Lee.', t: "Actually, I'm going to continue my study in business management next month, but at the moment, I'm a salesman by profession.", p: 'Tháng sau mới đi học quản trị kinh doanh (bẫy student); hiện tại là nhân viên bán hàng → salesman' },
        2: { v: 'Khi hỏi sống ở miền Bắc bao lâu.', t: ['Well, I have been in this city since I was three years old, but my family and I had lived in the East for seven years at first.', 'Now I am 19, so I have spent about nine years living here till now.'], p: '7 năm là ở miền Đông (bẫy); đến nay sống ở đây khoảng 9 năm → 9 years' },
        3: { v: 'Khi hỏi sống ở khu nào.', t: 'I live in Spring Park.', p: 'Sống ở khu Spring Park → Spring Park' },
        4: { v: 'Khi hỏi về chỗ ở.', t: "I used to live with my family in a big house, and now I'm living in an apartment with two of my friends who are my colleagues as well.", p: 'Nhà lớn là trước đây (bẫy house); giờ ở chung căn hộ với hai người bạn → a shared apartment → apartment' },
        5: { v: 'Khi hỏi phương tiện đi lại.', t: ['If there is a long way to go, I take the train or sometimes a cab.', 'I rarely take buses'], p: 'Hiếm khi đi xe buýt (bẫy bus); phương tiện công cộng là tàu và taxi (cab) → train' },
        6: { v: 'Khi hỏi tần suất ăn ngoài.', t: ["I'm afraid neither of those options agree with me.", "I don't often go out for dinner, maybe once a month."], p: 'Không phải mỗi tuần hay vài lần một năm (bẫy); khoảng một lần mỗi tháng → once a month' },
        7: { v: 'Khi hỏi nơi giải trí.', t: ['I sometimes go clubbing after work.', 'You know, there are some fantastic clubs nearby.'], p: 'Thường đi câu lạc bộ đêm sau giờ làm → clubs' },
        8: { v: 'Khi hỏi có đi xem biểu diễn không.', t: ["You know, there is a newly built theatre that opened last month in Spring Park, but I rarely go there because it's too expensive.", 'I prefer to go to the cinema to see some of the latest movies.'], p: 'Hiếm khi đến nhà hát vì đắt (bẫy theatre); thích đi rạp chiếu phim → cinema' },
        9: { v: 'Khi hỏi môn thể thao.', t: 'I like swimming and I go to the gym occasionally, but I spend most of my spare time sailing.', p: 'Bơi và gym đã có trên đề; phần lớn thời gian rảnh đi chèo thuyền buồm → go sailing → sailing' },
        10: { v: 'Khi hỏi khoá học bán thời gian.', t: ["I'm doing a Japanese course during the weekends, but I'm still a beginner.", 'Most people I know would like to learn Spanish or Latin.'], p: 'Tây Ban Nha, Latin là người khác học (bẫy); Lee học khoá tiếng Nhật cuối tuần → Japanese' },
      },
    },
    { part: 2, reuse: '6ac731291f45cf3630a45c63', title: 'The Elmsden Way Cycle Route' },
    {
      part: 3, title: 'Taking Part in Archaeological Excavations', audio: 'Lis/Audio Lis/Test 6/P3 .mp3', cover: 'archaeological excavation trench | archaeology students dig site',
      transcript: `
May:
Hi, Tomas.
Did you have a good time in Turkey?
Tomas:
Hi, May.
I had a great time.
But I have to say, although I've always been keen on being an archaeologist, before I went on an excavation, I used to find some of the things we did in class totally mystifying.
May:
Me too.
Before I did my trip to Egypt, I was often irritated at not being able to picture exactly what the lecturers meant.
They were always so excited about everything.
Tomas:
Yeah.
We did a lot of practical stuff on the excavation, which I really needed.
Was it harder than you expected?
May:
Yes, mostly.
I learned a lot more about the rules of archaeology.
I was really taken aback by how precise you have to be with your data collection and recording.
I took loads of photographs and they proved very useful, and the drawing went well, too.
Tomas:
Yes, I think I'm quite good with the camera.
I'm minded about the recording, though.
I had no idea it would take so much time.
Did you find anything particularly interesting when you were digging?
May:
I did, actually.
I had to dig a trench in part of the site.
Interestingly, there weren't any bits of pottery there like you would expect to find, but I did get out some pieces of cloth and what looked like one or two silver beads.
But our team leader said that they weren't.
They were probably lead weights for weaving.
What about you?
Tomas:
I didn't find anything myself, but quite a few of the other students did.
What I enjoyed was trying to identify what crops the people who had once lived in the area had grown.
They seemed to have had a much better diet than I expected.
Fish and wheat as well as oats, honey and fruit.
Lots of different things.
May:
Yes, it's amazing, isn't it?
And from measuring the bones in one of the sites, we found that the people were actually taller and had better teeth than the people who live in the area today.
Tomas:
Probably due to less carbohydrates.
How were the people you had to work with?
My team was great.
They were made up of people my age from all over the world.
It was good to work with them.
Lots of fun, and they taught me a lot.
It was tough for us all, though, getting up at dawn every day and being out until late afternoon.
May:
Oh, that's true enough.
We were all exhausted, and I'd like to have an international team next time.
Mine was mainly made up of English and Americans.
I enjoyed the field school, but everyone was much more experienced and older than I was.
It was a bit scary.
Tomas:
You know there's going to be a question about the excavation projects in our test next week.
Should we just run through it for practice?
May:
Good idea.
Our team leader was very strict about following the right procedure.
He used to say, never excavate anything if you're not sure it's worth excavating.
Now, I think that when you've decided where to excavate, you go to the site hut and get whatever tools you need, then clean the area so you know exactly how big it's going to be.
Tomas:
Right.
May:
Okay.
And you need to make sure you can remember what the site looks like before you begin digging.
Tomas:
I think photos are probably best for that, rather than drawings at this stage.
May:
I agree.
You then attach them to a record sheet, which you get from the team leader, remembering to put in the site code, unit number, and time.
So much red tape.
You seem to spend half the time marking rather than digging.
Tomas:
That's true.
I think you then have to draw up a detailed plan of where you're digging and then measure the limits.
May:
And this is all before you actually start digging.
Okay, so far so good.
Now you can start with the trowel.
But first you have to get soil samples and you keep them for further analysis.
Anything that you don't think is useful, you leave in place on the site.
Tomas:
Yes, and if you make any finds, that is, any object you retrieve, including animal bone, stone, as well as artefacts, they should all be registered and labelled.
May:
And then you put them in a plastic bag and return them to the site hut.
Tomas:
That's right.
And remember to leave the tools and site hut as you would expect to find them.
May:
Ha!
Looks like we've learned something after all.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nTaking part in archaeological excavations', [
          [21, 'How did Tomas and May both feel about parts of their studies before going on their excavations?', ['They lacked motivation.', 'They were enthusiastic.', 'They were confused.'], 'C'],
          [22, 'What surprised Tomas and May most when they were excavating?', ['how important photography was', 'how careful you had to be with your records', 'how many rules there were to follow'], 'B'],
          [23, 'What did May find that was particularly interesting?', ['some fabric', 'some pieces of pots', 'some jewellery'], 'A'],
          [24, 'What did Tomas and May both find surprising about the people they were studying?', ['The food they ate was very varied.', 'Their main activity was fishing.', 'They were not as tall as people today.'], 'A'],
          [25, 'What do Tomas and May both say about the people they worked with?', ['They came from a variety of countries.', 'They worked really hard.', 'They were young and enthusiastic.'], 'B'],
        ], 'Questions 21-25'),
        matching('Complete the flow chart below.\nChoose FIVE answers from the box and write the correct letter, A-I, next to Questions 26-30.',
          ['some soil samples', 'some photographs', 'objects to team leader', 'labels on objects', 'a record sheet', 'a unit number', 'further analysis of objects', 'tools from the site hut', 'a comprehensive plan'], [
            [26, 'Take ________ and clean the area', 'H'],
            [27, '(Take photos of the site to be excavated →) Ask your team leader for ________', 'E'],
            [28, 'Make ________ of the site and measure the levels', 'I'],
            [29, 'Take ________', 'A'],
            [30, 'Register and put ________ (→ Put in site hut together with tools)', 'D'],
          ], { title: 'Excavation Projects Next Week', groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, khi hai bạn nói về việc học trước chuyến khai quật.', t: ["before I went on an excavation, I used to find some of the things we did in class totally mystifying.", 'Me too.', 'Before I did my trip to Egypt, I was often irritated at not being able to picture exactly what the lecturers meant.'], p: 'Các giảng viên mới là người hào hứng (bẫy B); cả hai thấy khó hiểu, không hình dung được giảng viên muốn nói gì → bối rối → C' },
        22: { v: 'Khi hỏi chuyến đi có khó hơn dự kiến không.', t: ['I was really taken aback by how precise you have to be with your data collection and recording.', 'I had no idea it would take so much time.'], p: 'Ảnh chụp chỉ là hữu ích (bẫy A), học thêm quy tắc không phải điều bất ngờ nhất (bẫy C); cả hai bất ngờ về việc ghi chép phải tỉ mỉ, tốn thời gian → B' },
        23: { v: 'Khi May kể đã tìm thấy gì.', t: ["Interestingly, there weren't any bits of pottery there like you would expect to find, but I did get out some pieces of cloth and what looked like one or two silver beads.", "But our team leader said that they weren't."], p: 'Không có mảnh gốm (bẫy B), "hạt bạc" hoá ra không phải trang sức (bẫy C); tìm được mấy mảnh vải → vải → A' },
        24: { v: 'Khi nói về những người từng sống ở đó.', t: ['They seemed to have had a much better diet than I expected.', 'Fish and wheat as well as oats, honey and fruit.', 'Lots of different things.', "Yes, it's amazing, isn't it?"], p: 'Cá chỉ là một món (bẫy B), họ cao hơn người ngày nay (bẫy C); cả hai ngạc nhiên vì đồ ăn rất phong phú → A' },
        25: { v: 'Khi nói về những người cùng làm việc.', t: ["It was tough for us all, though, getting up at dawn every day and being out until late afternoon.", "Oh, that's true enough.", 'We were all exhausted'], p: 'Chỉ đội của Tomas đến từ nhiều nước (bẫy A), đội của May lớn tuổi hơn (bẫy C); cả hai đều nói dậy từ sáng sớm, làm tới chiều, kiệt sức → làm việc rất vất vả → B' },
        26: { v: 'Khi May bắt đầu ôn quy trình.', t: "Now, I think that when you've decided where to excavate, you go to the site hut and get whatever tools you need, then clean the area so you know exactly how big it's going to be.", p: 'Lấy dụng cụ từ lán rồi dọn khu vực → dụng cụ từ lán công trường → H' },
        27: { v: 'Sau bước chụp ảnh khu vực.', t: 'You then attach them to a record sheet, which you get from the team leader, remembering to put in the site code, unit number, and time.', p: 'Phiếu ghi chép lấy từ trưởng nhóm; unit number chỉ là thông tin ghi vào phiếu (bẫy F) → a record sheet → E' },
        28: { v: 'Ngay sau đó.', t: "I think you then have to draw up a detailed plan of where you're digging and then measure the limits.", p: 'Vẽ sơ đồ chi tiết khu đào rồi đo giới hạn → a comprehensive plan → I' },
        29: { v: 'Khi bắt đầu đào bằng bay.', t: 'But first you have to get soil samples and you keep them for further analysis.', p: 'Phân tích thêm là việc làm sau với mẫu (bẫy G); phải lấy mẫu đất → A' },
        30: { v: 'Khi nói về các hiện vật tìm được.', t: 'Yes, and if you make any finds, that is, any object you retrieve, including animal bone, stone, as well as artefacts, they should all be registered and labelled.', p: 'Hiện vật được đăng ký và dán nhãn, rồi mang về lán (không giao trưởng nhóm – bẫy C) → labels on objects → D' },
      },
    },
    {
      part: 4, title: 'Crocodile Study', audio: 'Lis/Audio Lis/Test 6/P4.mp3', cover: 'saltwater crocodile river | crocodile Northern Territory Australia',
      transcript: `
Hello everybody.
I just arrived back from my field trip and Professor Martin has asked me to tell you about it today in our research forum.
As many of you know already, my dissertation relates to crocodile behaviour.
My specialty is the saltwater crocodile, which is much larger than the freshwater crocodile.
I've just come back from the Northern Territory, where I've been part of a groundbreaking study observing crocodile movements.
Ah, it's not the only time crocodile movements have been followed, but this study is unique because we tracked crocodiles using a satellite.
Up until now, studies like this one have only been able to track crocodile movements using radio.
Not only was this method more stressful for the animal, which had to be caught several times, but it was also not very reliable, as the signal was often lost.
So, you might be wondering why we chose to track crocodiles.
Well, crocodile attacks on people and livestock are rare, but when they do happen, the government believes that the problem crocodile should be relocated rather than killed.
But can we be sure that the crocodile won't simply return to the place where it came from?
So we designed a study to try to answer these questions.
We wanted to establish, firstly, how far crocodiles can travel over a period of time.
The second thing that we wanted to know was how easy is it for crocodiles to navigate?
Could they find their own way home again if they were moved to another location?
Of course, the biggest challenge when observing crocodiles is that they are very secretive animals.
They stay well away from people if they can, which makes them really difficult to follow.
I'll give you some information about the design of the study now.
There were three crocodiles in our study, all from the Northern Territory, and measuring between three and four and a half metres in length.
The crocodiles were captured, measured and tagged, and then taken by helicopter to new locations up to 400 kilometres away from where they were found.
We were then able to use the tracking data to monitor their movements.
We used a specially designed transmitter which we attached to each animal's head.
The transmitter collected the data and relayed it back to us.
The results of our study were quite astounding.
After they were released, each crocodile remained in the release site for some weeks, making random movements around the site each day.
But then, they each swam home, travelling by the most direct route.
These crocodiles showed remarkable navigational skills and stamina to swim such long voyages.
So, what conclusions did we draw from this?
Well, we proved that crocodiles are clearly capable of making marathon swims to find their way home.
This meant that the current policy should be reconsidered.
You might be wondering how the crocodiles managed to get home.
We concluded that they used factors such as sight and smell, as well as their position to the sun, to point their way.
It's a little-known fact that crocodiles are more closely related to birds than they are to any other reptile.
So, we believe it's possible that they use the same system to negotiate long journeys.
Now that the study has been completed...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Crocodile Study', [
          '<strong>Background</strong>',
          'Type of crocodile studied: crocodiles found in salt water',
          'Location of study: Northern Territory, Australia',
          'Significance of study: unique because it was the first time a __Q31__ had been used to track crocodiles',
          'Previous studies:',
          '   – done using __Q32__',
          '   – stressful method, also unreliable due to loss of the __Q33__',
          'Reasons for study: the management of crocodiles by the government may not be effective',
          'Research questions:',
          '   – How far can crocodiles travel?',
          '   – How easily can crocodiles __Q34__?',
          'Challenge: crocodiles are difficult to observe because they avoid __Q35__',
          '<strong>Details of study</strong>',
          'Number of crocodiles involved: three',
          'Method: crocodiles were measured and tagged, then relocated using a __Q36__',
          "Monitoring: scientists got data from a transmitter located on the crocodile's __Q37__",
          '<strong>Results of study</strong>',
          'Each crocodile',
          '   – first stayed at the site for a few weeks, moving in a random way',
          '   – then took the most __Q38__ way home',
          '<strong>Conclusions</strong>',
          'A change in policy is needed.',
          'When travelling long distances, crocodiles may use',
          '   i) their own senses and the position of the __Q39__',
          '   ii) a similar system to __Q40__',
        ], { 31: 'satellite', 32: 'radio', 33: 'signal', 34: 'navigate', 35: 'people', 36: 'helicopter', 37: 'head', 38: 'direct', 39: 'sun', 40: 'birds' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói ý nghĩa của nghiên cứu.', t: "Ah, it's not the only time crocodile movements have been followed, but this study is unique because we tracked crocodiles using a satellite.", p: 'Lần đầu theo dõi cá sấu bằng vệ tinh → satellite' },
        32: { v: 'Khi nói các nghiên cứu trước.', t: 'Up until now, studies like this one have only been able to track crocodile movements using radio.', p: 'Trước đây chỉ dùng sóng radio → radio' },
        33: { v: 'Ngay sau đó.', t: 'Not only was this method more stressful for the animal, which had to be caught several times, but it was also not very reliable, as the signal was often lost.', p: 'Không đáng tin vì thường mất tín hiệu → signal' },
        34: { v: 'Khi nêu câu hỏi nghiên cứu.', t: 'The second thing that we wanted to know was how easy is it for crocodiles to navigate?', p: 'Cá sấu định hướng dễ đến mức nào → navigate' },
        35: { v: 'Khi nói thách thức khi quan sát.', t: 'They stay well away from people if they can, which makes them really difficult to follow.', p: 'Chúng tránh xa con người → avoid people → people' },
        36: { v: 'Khi mô tả cách làm.', t: 'The crocodiles were captured, measured and tagged, and then taken by helicopter to new locations up to 400 kilometres away from where they were found.', p: 'Được chở bằng trực thăng đến nơi mới → helicopter' },
        37: { v: 'Khi nói về thiết bị theo dõi.', t: "We used a specially designed transmitter which we attached to each animal's head.", p: 'Máy phát gắn trên đầu mỗi con → head' },
        38: { v: 'Khi nói kết quả.', t: 'But then, they each swam home, travelling by the most direct route.', p: 'Bơi về nhà theo đường thẳng nhất → most direct way → direct' },
        39: { v: 'Khi nói cách cá sấu tìm đường.', t: 'We concluded that they used factors such as sight and smell, as well as their position to the sun, to point their way.', p: 'Thị giác, khứu giác (giác quan) và vị trí so với mặt trời → sun' },
        40: { v: 'Cuối bài.', t: ["It's a little-known fact that crocodiles are more closely related to birds than they are to any other reptile.", "So, we believe it's possible that they use the same system to negotiate long journeys."], p: 'Cá sấu gần với chim nên có thể dùng cùng hệ thống định hướng → birds' },
      },
    },
  ],
};
