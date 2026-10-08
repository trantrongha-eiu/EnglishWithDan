// Vol 2 – Test 9 (PDF "listening/test 9/Test 9.pdf" p1–6, key p7; audio test 9/part 1–4.mp3)
// Transcripts: Whisper + Otter merge; P1 and P3 written out (Otter's turns unusable; P1 plays the example first,
// kept once).
// Source notes: Q3 form says "James ___" but the recording says "Chase Packers … It should be Parkhurst" → "Chase".
// Q16–20 workshop names lost their first letter in the PDF ("estaurant Service") — restored.
const { note, mc, multi, map, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 9,
  sections: [
    {
      part: 1, title: 'Newspaper Photo Reprint Request', audio: 'listening/test 9/part 1.mp3', cover: 'newspaper photo | baseball player',
      transcript: `
Stephen:
Subscriber Services, this is Stephen.
May I help you?
Caller:
Good morning, Stephen.
I'm calling because I'd like to get a copy of a photo of my son that came out in the newspaper last week.
Stephen:
Sure, I can help you with that.
Do you have the exact date?
Caller:
Yes, it was last Monday.
That was March…
Stephen:
The 10th?
Caller:
Yes, that's the date.
Stephen:
OK, sure.
Just one moment, please.
Okay, I have the newspaper from that date on my computer screen.
Now, what section was it in?
Caller:
It was a feature story on local high school athletes.
Stephen:
Okay.
So local athletes are always on the back page.
Caller:
No, I don't remember it being at the back.
I clearly remember it being on the front.
Stephen:
Oh, you're right.
We just started doing those features there in the last several editions.
Which story was it?
Caller:
Student Athlete of the Month.
Oops, no, excuse me.
I'm sorry.
I mean week.
Stephen:
And that's your son, you said?
You must be very proud of him.
That's quite an accomplishment.
Ah, yes, here it is.
Chase Packers, baseball player.
Caller:
That's him.
But actually, the reporter got his surname wrong.
It should be Parkhurst.
That's P-A-R-K-H-U-R-S-T.
Stephen:
Okay, I'll make a note of that.
Now, I'm assuming this photo is just for your own use, not for additional reprinting.
Caller:
Reprinting?
Stephen:
Yes.
With copyright laws, you need to fill out an extra form if you're going to reprint the photo in another publication.
Caller:
Oh, I see.
No, it's not for business or commercial purposes or anything.
It's just for personal use.
I want everyone who visits our home to see it.
I'm so proud of him.
Stephen:
Of course.
Now, I don't know if you knew this, but even though the photo is in black and white in the paper, you can choose to get your reprint in colour.
Caller:
Oh, that's interesting.
He does look so distinguished in the black and white.
I like that.
Okay.
But, you know what?
I'll actually take the colour.
That way his uniform will really stand out.
Stephen:
Sure thing.
Okay, let's see here.
What else?
Oh, yes, of course.
Size.
What size would you like?
You can have the standard size or the wallet size.
Caller:
Um, no, not the small one.
These wallet-sized ones aren't helpful, as I'd like to frame it.
Stephen:
Just one?
Caller:
Well, can I get more than one?
Stephen:
Yes.
Extra copies of the same print are discounted.
50% if you order them at the same time.
Caller:
Well, they are quite expensive to begin with.
So, while I'd love a couple for the grandparents, I think I'll just stick with one.
No, no, no, I better get three.
It is a once in a lifetime thing, you know, what's a few extra dollars when it comes to memories?
Stephen:
Okay, so let me see here.
The total on that will be $80.
Would you like to add rush processing?
Caller:
I'd like them really fast.
Stephen:
Okay.
Rush processing will add $15 to your order.
Caller:
Oh, really?
Hmm.
That's quite expensive.
I do want to get them quickly, but I guess I can be patient, too.
So, uh, yeah, I'll just do normal processing.
Is it still pretty fast?
Stephen:
Usually about four to five business days.
Caller:
Oh, that's not bad at all.
So, let's see, is there anything else?
Stephen:
Just the payment.
Caller:
Yes, of course.
Can I pay you with a credit card?
Stephen:
Yes, sure.
We also take checks.
Caller:
Oh, that's convenient.
I'll do that then.
I really prefer to pay by check rather than use my credit card.
Stephen:
Now, when they arrive, would you like to pick them up in our office, or would you like us to send them to you?
Caller:
Ah, it's rather inconvenient for me to stop by.
Stephen:
I'll go ahead and mail them, then.
And that's no extra charge.
Caller:
Oh, good.
Stephen:
One last question, if you don't mind.
We routinely survey all our callers just to see how often they read the newspaper.
Caller:
For years and years we read the entire paper on a daily basis.
But now we're so busy, it seems we don't have time to read like we used to, except on weekends.
But still, yes, you can say we read it each day.
My husband still does, for sure.
Stephen:
Okay, thanks.
Now, ma'am, let's get your address.
`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Newspaper Photo Reprint Request Form', [
          'Example: Newspaper date: March 10th',
          'Newspaper page: the __Q1__ page',
          'Newspaper story: Student Athlete of the __Q2__',
          'Photo subject: Chase __Q3__',
          'Photo use: __Q4__',
          'Image type: __Q5__',
          'Size: Regular',
          'Quantity: Three',
          'Price: $ __Q6__',
          'Processing option: __Q7__',
          'Payment type: __Q8__',
          'Delivery method: __Q9__',
          'Reading frequency: every __Q10__',
        ], { 1: 'front', 2: 'week', 3: 'Parkhurst', 4: 'personal', 5: 'colour/color', 6: '80', 7: 'normal', 8: 'cheque/check', 9: 'mail', 10: 'day' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Stephen hỏi bài báo ở mục nào.', t: ['So local athletes are always on the back page.', 'I clearly remember it being on the front.'], p: 'Trang sau là đoán của Stephen (bẫy); người gọi nhớ rõ là trang nhất → front' },
        2: { v: 'Khi hỏi tên bài viết.', t: ['Student Athlete of the Month.', 'I mean week.'], p: '“Month” bị chính người gọi sửa lại → week' },
        3: { v: 'Khi nói tên người trong ảnh.', t: ['Chase Packers, baseball player.', 'It should be Parkhurst.', 'That\'s P-A-R-K-H-U-R-S-T.'], p: 'Báo in sai họ “Packers”; họ đúng được đánh vần → Parkhurst' },
        4: { v: 'Khi hỏi mục đích dùng ảnh.', t: ["No, it's not for business or commercial purposes or anything.", "It's just for personal use."], p: 'Không dùng cho kinh doanh, chỉ dùng cá nhân → personal' },
        5: { v: 'Khi hỏi loại ảnh.', t: ['He does look so distinguished in the black and white.', "I'll actually take the colour."], p: 'Thích ảnh đen trắng nhưng cuối cùng chọn ảnh màu → colour' },
        6: { v: 'Khi tính tiền.', t: 'The total on that will be $80.', p: 'Ba bản in tổng cộng $80; $15 là phí xử lý nhanh (bẫy) → 80' },
        7: { v: 'Khi hỏi xử lý nhanh.', t: "So, uh, yeah, I'll just do normal processing.", p: 'Xử lý nhanh tốn thêm $15 nên chọn xử lý bình thường → normal' },
        8: { v: 'Khi hỏi cách thanh toán.', t: 'I really prefer to pay by check rather than use my credit card.', p: 'Hỏi thẻ tín dụng trước (bẫy) nhưng chọn trả bằng séc → cheque' },
        9: { v: 'Khi hỏi cách nhận ảnh.', t: "I'll go ahead and mail them, then.", p: 'Đến lấy không tiện nên gửi qua bưu điện → mail' },
        10: { v: 'Câu khảo sát cuối.', t: 'But still, yes, you can say we read it each day.', p: 'Bận nên chỉ đọc nhiều cuối tuần (bẫy) nhưng vẫn đọc hằng ngày → day' },
      },
    },
    {
      part: 2, title: 'Hospitality Training Courses', audio: 'listening/test 9/part 2.mp3', cover: 'hotel reception | restaurant waiter service',
      fix: [
        ['This is a great way to learning cooking skills.', 'This is a great way to learn cooking skills.'], ["guests' a first impression are formed", "guests' first impressions are formed"],
        ['Now frankly, for the.\nFor those with', 'Now frankly, for those with'], ['block of classes on the northern side', 'block of classrooms on the northern side'],
        ['the first-in room on your left', 'the First Aid Room on your left'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'What has the speaker enjoyed most about working in hospitality?', ['the range of jobs available', 'the range of countries he has visited', 'the range of people he has worked with'], 'C'],
          [12, 'What point does the speaker make about kitchen assistants?', ['The long hours will not suit everyone.', 'Their work is sometimes quite boring.', 'The pay is not particularly good.'], 'A'],
          [13, 'According to the speaker, which job is sometimes undervalued?', ['porter', 'cleaner', 'dishwasher'], 'A'],
          [14, 'Experience in reception may help employees', ['to learn foreign languages.', 'to manage difficult situations successfully.', 'to get a better job eventually.'], 'C'],
          [15, 'The speaker says that interview skills', ['are particularly important in hospitality.', 'are easy to learn if you have some practice.', 'are understood better now than in the past.'], 'B'],
        ], 'Questions 11-15'),
        map('Label the plan below.\nWrite the correct letter, A-J, next to Questions 16-20.', [[16, 'Restaurant Service', 'J'], [17, 'Kitchen Hands', 'C'], [18, 'Porters, Cleaners, Dishwashers', 'B'], [19, 'Receptionists', 'E'], [20, 'Interview Skills', 'F']], { page: 3, box: [154, 194, 470, 540] }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Đầu bài, John giới thiệu bản thân.', t: "But what I've always loved is the incredible variety of workmates I've had over the years.", p: 'Nhiều loại việc và nhiều nước chỉ là trải nghiệm; điều anh yêu thích nhất là sự đa dạng đồng nghiệp → C' },
        12: { v: 'Khi nói về phụ bếp.', t: 'But be warned, kitchen assistants arrive at work first and leave last, so think hard about whether you can cope with the commitment.', p: 'Đến sớm nhất, về muộn nhất – giờ làm dài không hợp với mọi người → A' },
        13: { v: 'Khi nói về khuân vác, dọn phòng, rửa bát.', t: "A porter's role is more important than many people realize, because guests' first impressions are formed by the staff they meet on arrival.", p: '“More important than many people realize” = bị đánh giá thấp → A' },
        14: { v: 'Khi nói về lễ tân.', t: 'So having reception work on your CV or resume is often a good way of moving your career forward in the long run.', p: 'Làm lễ tân giúp thăng tiến sự nghiệp về lâu dài; xử lý áp lực là yêu cầu có sẵn chứ không học được trong lúc làm (loại B) → C' },
        15: { v: 'Khi nói về kỹ năng phỏng vấn.', t: "And the good thing is, it's not too difficult to develop these skills with a little training and rehearsal.", p: 'Bí quyết không đổi so với 20 năm trước (loại C); kỹ năng này dễ học nếu luyện tập → B' },
        16: { v: 'Phần sơ đồ, xưởng phục vụ nhà hàng.', t: ['So if you want to go to the workshop on restaurant service, go out of the hall and turn right.', "Walk along to the office, and it's the classroom immediately next door to that."], p: 'Ra khỏi hội trường rẽ phải, phòng ngay cạnh văn phòng → J' },
        17: { v: 'Xưởng phụ bếp.', t: ["Cross to the other side of the square, and you'll see a block of two classrooms.", 'You want the one on the left.'], p: 'Băng qua quảng trường tới dãy hai phòng, phòng bên trái → C' },
        18: { v: 'Xưởng khuân vác, dọn phòng, rửa bát.', t: ['You want to find a block of classrooms on the northern side of the college.', 'There\'s a long block of classrooms, and you want the one at the eastern end.'], p: 'Dãy dài phía bắc, phòng ở đầu phía đông → B' },
        19: { v: 'Xưởng lễ tân.', t: ["You'll come to the First Aid Room on your left, and it's the classroom directly opposite that."], p: 'Đi lên phía bắc giữa hai dãy phòng, phòng đối diện phòng sơ cứu → E' },
        20: { v: 'Xưởng kỹ năng phỏng vấn.', t: "You see that on the western side of the square, there's a single large classroom.", p: 'Phòng lớn duy nhất phía tây quảng trường → F' },
      },
    },
    {
      part: 3, title: 'Battery-powered Motorbike Presentation', audio: 'listening/test 9/part 3.mp3', cover: 'electric motorcycle | motorbike workshop',
      transcript: `
Man:
Hi, Sarah.
Shall we make a start on that presentation about our battery-powered motorbike project?
Sarah:
Yes, let's.
It'd be nice to do a good job for the University Open Day.
I think the teacher's right that it'll interest people thinking about coming here to study.
Man:
Well, they certainly should.
And at least it won't be assessed.
Sarah:
Yes, and I guess we should be proud our project was chosen rather than anything done by others in our class.
And our project is unusual, because people usually think of environmentally friendly vehicles as being relatively slow.
But our battery-powered motorbike can get up to 165 kilometres an hour, the same as lots of petrol-driven bikes.
Man:
And it has an efficiency of 90%, whereas ordinary bikes are far less.
They waste a huge amount of energy.
Sarah:
And our bike doesn't need a petrol tank or an exhaust system either.
So, markedly, the design is more straightforward and it's also lighter.
Man:
Anyway, it's going to be quite a challenge to prepare something interesting and appropriate for all the people who might come.
Sarah:
Well, time is certainly going to be an issue.
Man:
You mean in terms of how much we have to deal with in only 15 minutes?
Sarah:
Well, I was thinking more about the fact that the talk's next week, and we have a lot of other stuff on just now.
Man:
Absolutely.
So, how shall we organise things?
We could just do a short talk and allow most of the time for questions.
Sarah:
Well, it'd be good to allow plenty of time for those, but I think we need to present quite a lot, too.
We could start by showing a couple of minutes from the film of the race it took part in.
Man:
Brilliant!
I'm sure they'd love that.
Then we can talk about how we built and tested the motorbike and so on.
For example, one of us could talk through the project from the initial brief to prototype stage, and then the other take it on to testing and development.
Sarah:
Well, let's deal with that later.
It might be better to have just you or me doing the talking, but we don't need to decide just yet.
Man:
Okay, so what about the slides for our presentation?
Shall we work on the text for those now?
Well, we could just use keywords that help structure our talk.
Sarah:
How about using mainly visuals?
I took lots of photos as we went along, so it'd be easy to illustrate the progress of the project that way.
More interesting than diagrams.
And slides with lots of text can be boring.
Man:
Okay, right you are.
So, do you think we should discuss things with the lecturer before going much further?
We could do that this afternoon.
Sarah:
Wouldn't it be better to get a first draft done?
Then we've got something more concrete to discuss with him.
Man:
Sure, but I'd quite like a bit more input before we spend a lot of time preparing something that might not be what's needed.
Sarah:
Okay.
Why don't we have a word with Amish in the fourth year?
His tutor had him doing something similar last summer, so I'm sure he'd give us some useful pointers.
Man:
Great.
Let's do that after lunch.
Let's think a bit more about how the project went.
That might give us some ideas.
Okay.
Well, first, I'd say that writing the report was hard.
Sarah:
Yes, I was dreading having to write 80 pages in just a month.
But actually, it was harder making sure we didn't go over length.
Anyway, I never imagined we'd do it with a day to spare.
Man:
No, it was lucky your sister had time to proofread it.
She picked up on several careless mistakes, especially in the bibliography.
Sarah:
Yes, well, she works in publishing, so she's used to checking things.
I suppose it helped that we kept detailed notebooks throughout the year.
That was a chore, but worth it.
Man:
Yes, I didn't enjoy keeping mine up to date.
I actually found it really time-consuming, noting down all the adaptations we made to the design as we went along.
I hadn't anticipated that.
Sarah:
Me too.
And I thought the tutor could have given us a bit more advice at the beginning of the process.
Man:
That's right.
I liked doing the concept sketches.
For me, that was one of the best bits.
I've always enjoyed those initial stages of the design process.
Sarah:
I was relieved that the tutor picked up on that mistake we made in our aerodynamic sketches.
It would have been disastrous if that hadn't been picked up at an early stage.
Man:
Exactly.
Sarah:
Finding sponsors took quite some time, of course.
Man:
Yes, but we knew that'd be an issue, and I never expected it to be enjoyable.
Not like the actual hands-on project work.
The tutor certainly came into his own at that stage.
Sarah:
Yes, I never expected him to have such useful contacts in industry.
Good thing for us he did, though.
Man:
Right.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'The students are preparing the presentation', ['as part of their final assessment.', 'to attract potential future students.', 'to share their work with their classmates.'], 'B'],
          [22, 'What do the students say about the battery-powered motorbike in their project?', ['It is more efficient than ordinary motorbikes.', 'It is faster than ordinary motorbikes.', 'It is more complex than ordinary motorbikes.'], 'A'],
          [23, 'The students agree the presentation will be difficult because', ['they have a lot to cover in 15 minutes.', 'several different people are involved.', 'they do not have long to prepare it.'], 'C'],
          [24, 'The students decide to deal with the presentation by', ['each giving part of the talk.', 'opening with a short video clip.', 'allowing most of the time for the questions.'], 'B'],
          [25, 'What do the students agree to use in their slides?', ['photos of their project at its different stages', 'keywords reflecting the characteristics of the project', 'diagrams illustrating the process of the project'], 'A'],
          [26, 'What do the students decide to do that afternoon?', ['talk to a student in a different year', 'prepare a first draft of their slides', 'discuss their outline with a tutor'], 'A'],
        ], 'Questions 21-26'),
        matching('Which opinion is expressed by the students about each of the following aspects of the project?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 27-30.',
          ['It took longer than expected.', 'It was unexpectedly enjoyable.', 'A member of staff was surprisingly helpful.', "They benefited from a relative's help.", 'A member of staff identified one serious problem.', 'A different student made a careless mistake.'], [
            [27, 'writing the report', 'D'], [28, 'keeping a log book', 'A'], [29, 'doing the sketches', 'E'], [30, 'finding sponsors', 'C'],
          ], { title: 'Options', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, mục đích bài thuyết trình.', t: ["It'd be nice to do a good job for the University Open Day.", "I think the teacher's right that it'll interest people thinking about coming here to study.", 'And at least it won\'t be assessed.'], p: 'Không được chấm điểm (loại A); trình bày ở ngày hội trường để thu hút người muốn vào học → B' },
        22: { v: 'Khi nói về chiếc xe điện.', t: ['And it has an efficiency of 90%, whereas ordinary bikes are far less.', 'They waste a huge amount of energy.'], p: 'Tốc độ chỉ ngang xe xăng (loại B), thiết kế đơn giản hơn (loại C); hiệu suất 90% cao hơn hẳn → A' },
        23: { v: 'Khi bàn khó khăn của bài thuyết trình.', t: ['You mean in terms of how much we have to deal with in only 15 minutes?', "Well, I was thinking more about the fact that the talk's next week, and we have a lot of other stuff on just now."], p: '15 phút là đoán của bạn nam (bẫy A); Sarah nói vấn đề là tuần sau đã trình bày mà còn nhiều việc khác → C' },
        24: { v: 'Khi bàn cách tổ chức.', t: ['We could start by showing a couple of minutes from the film of the race it took part in.', 'Brilliant!'], p: 'Dành phần lớn thời gian hỏi đáp bị gạt đi, chia phần nói để sau; cả hai đồng ý mở đầu bằng đoạn phim ngắn → B' },
        25: { v: 'Khi bàn về slide.', t: ['How about using mainly visuals?', "I took lots of photos as we went along, so it'd be easy to illustrate the progress of the project that way.", 'Okay, right you are.'], p: 'Từ khoá là đề xuất bị thay, sơ đồ “less interesting”; dùng ảnh chụp các giai đoạn dự án → A' },
        26: { v: 'Khi bàn việc làm buổi chiều.', t: ['Why don\'t we have a word with Amish in the fourth year?', "Let's do that after lunch."], p: 'Gặp giảng viên và làm bản nháp đều bị gác lại; chiều nay hỏi Amish – sinh viên năm tư → A' },
        27: { v: 'Phần nhìn lại dự án: viết báo cáo.', t: ['No, it was lucky your sister had time to proofread it.', 'She picked up on several careless mistakes, especially in the bibliography.'], p: 'Chị gái Sarah đọc soát giúp – nhờ người thân → D' },
        28: { v: 'Ghi sổ nhật ký dự án.', t: ['I actually found it really time-consuming, noting down all the adaptations we made to the design as we went along.', "I hadn't anticipated that."], p: 'Tốn thời gian hơn dự tính → A' },
        29: { v: 'Vẽ phác thảo.', t: ['I was relieved that the tutor picked up on that mistake we made in our aerodynamic sketches.', "It would have been disastrous if that hadn't been picked up at an early stage."], p: 'Bạn nam vốn đã thích vẽ (không phải “bất ngờ thú vị”); gia sư phát hiện một lỗi nghiêm trọng → E' },
        30: { v: 'Tìm nhà tài trợ.', t: ['The tutor certainly came into his own at that stage.', 'Yes, I never expected him to have such useful contacts in industry.'], p: 'Gia sư bất ngờ có nhiều mối quen hữu ích → C' },
      },
    },
    {
      part: 4, title: 'The Development of the Telescope', audio: 'listening/test 9/part 4.mp3', cover: 'galileo telescope | old refracting telescope',
      fix: [
        ['Lieberhey', 'Lipperhey'], ["Liberhey's", "Lipperhey's"], ['Havarius', 'Hevelius'], ['his invention obvious potential', "his invention's obvious potential"],
        ['the length of the telescope.\nThe intensity of magnification', 'the length of the telescope, the intensity of magnification'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'The development of the telescope', [
          '<strong>Roger Bacon (1200s)</strong>',
          '• His invention assisted __Q31__ with sight problems when they were reading.',
          '<strong>Lipperhey</strong>',
          '• 1608: he put concave and convex lenses together to create the telescope.',
          '• The small telescope was first used in the __Q32__',
          '<strong>Galileo</strong>',
          '• 1609: he tried out different lenses to improve the telescope.',
          '• He started __Q33__ of the lenses he needed.',
          '• The Venetian government hoped to use this instrument for the __Q34__',
          '<strong>Galileo’s astronomical discoveries</strong>',
          'The Moon',
          '• he discovered its surface was mountainous',
          '• he worked out the height of the mountains by identifying spots that were __Q35__',
          '• he created __Q36__ of the moon’s surface',
          'Jupiter',
          '• he realised that the bodies orbiting Jupiter were not __Q37__ but moons',
          '<strong>Further development</strong>',
          '• Scientists discovered that increasing the telescope’s __Q38__ improved its power.',
          '• 1670: Hevelius built a telescope 43 metres long.',
          '– poor results: the telescope would move with the __Q39__',
          '– the problem was solved by attaching it to a __Q40__',
        ], { 31: 'researchers', 32: 'theatre/theater', 33: 'production', 34: 'army', 35: 'bright', 36: 'charts', 37: 'stars', 38: 'length', 39: 'wind', 40: 'building' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần Roger Bacon.', t: 'This proved to be a benefit mostly for researchers who until then had been forced to give up working while still relatively young because of impaired vision.', p: 'Kính lúp giúp các nhà nghiên cứu bị suy giảm thị lực → researchers' },
        32: { v: 'Phần Lipperhey.', t: 'It was so small that initially, people took it to the theatre for a better view of the stage.', p: 'Kính thiên văn nhỏ lúc đầu được mang vào nhà hát để xem sân khấu → theatre' },
        33: { v: 'Phần Galileo.', t: 'Galileo, therefore, decided that, to solve his problem, he would have to start the production of his own lenses.', p: 'Thấu kính của thợ kính không đủ mạnh nên ông tự sản xuất → production' },
        34: { v: 'Khi nói về chính quyền Venice.', t: 'The government of Venice were impressed by his invention\'s obvious potential, and envisioned the advantages this eyeglass could have for the army.', p: 'Chính quyền Venice thấy lợi ích cho quân đội → army' },
        35: { v: 'Phát hiện về Mặt Trăng.', t: 'Galileo also figured out how to estimate the altitude of the mountains on the moon by looking for bright spots in the dark areas.', p: 'Tìm những điểm sáng trong vùng tối để ước tính độ cao núi → bright' },
        36: { v: 'Ngay sau đó.', t: 'From these calculations, he was able to draw charts of the terrain and show the altitudes of the mountains.', p: 'Ông vẽ được bản đồ địa hình bề mặt Mặt Trăng → charts' },
        37: { v: 'Phát hiện về Sao Mộc.', t: 'However, by the fifteenth night, he realized that they were going around the planet in a daily orbit, and that in fact, they were moons not stars.', p: 'Những thiên thể quanh Sao Mộc là mặt trăng chứ không phải sao → stars' },
        38: { v: 'Phần phát triển sau này.', t: 'Scientists realized that when they increased the length of the telescope, the intensity of magnification improved significantly.', p: 'Tăng chiều dài ống kính thì độ phóng đại tăng → length' },
        39: { v: 'Khi nói về kính dài 43 m của Hevelius.', t: 'However, these telescopes were soon to prove useless for accurate observation, because the slightest wind caused the instrument to shift.', p: 'Chỉ một làn gió nhẹ cũng làm kính dịch chuyển → wind' },
        40: { v: 'Cách giải quyết.', t: 'Finally, in 1675, astronomers abandoned the tube telescope and instead mounted the telescope on a building.', p: 'Gắn kính lên một toà nhà để giữ ổn định → building' },
      },
    },
  ],
};
