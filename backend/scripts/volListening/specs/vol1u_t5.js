// Vol 1 – Test 5 UPDATE (Vol 7 folder "Reading/các đề update web khác trên bản pdf": "VOL 1 TEST 5.pdf" = questions, text
// layer; "KEY + TRANSCRIPT.pdf" = key + timestamped transcript with speaker names; "Test 5 vol 1 audio.mp3" = the whole
// test, 29:13). All four parts differ from the old Vol 1 - Test 5 (New Guinea / Red Squirrels / Water Hyacinth /
// Nanotechnology) → thầy 2026-10-30: seed these four parts and point "Vol 1 - Test 5" at them (old parts stay as bài lẻ).
// Each part = a clip of the whole-test file, from the narrator's "Part N" to the end of its check pause.
// Transcript = the PDF's, written out below by web/vol1u/tx.js + gen.js (Narrator dropped, Vietnamese glosses "(…)"
// removed, timestamped pieces joined into sentences). Fixes: "Jeff" → Geoff (question paper), "Surface Paradise" →
// Surfers Paradise (form), "20- minute" → 20-minute. The PDF has no "Part Three." line (Part 3 starts at "Following
// instructions from their tutor"). Question paper: Q21 "Geo" → Geoff.
// Key = the PDF's KEY page, checked against the transcript: all correct.
const { note, table, mc, multi, matching } = require('../vol_build');

module.exports = {
  vol: '1u', test: 5,
  sections: [
    {
      part: 1, title: 'Gym Membership Form', audio: 'Test 5 vol 1 audio.mp3', clip: [41, 399.5], cover: 'gym fitness weights | gym treadmill',
      transcript: `
Staff:
Good morning.
Can I help you?
Jean:
Yes, actually.
I'm interested in joining your gym.
So I thought I'd come and find out about your membership options.
Staff:
Why don't you take a seat and I'll just get the form and a pen.
Jean:
Thanks.
Staff:
Now, your full name, please?
Jean:
It's Jean Simpson.
Staff:
Right, Jean.
Is that Simpson with a P?
Jean:
Yes.
Staff:
Right, Jean.
Date of birth?
Jean:
The 24th of August, 1979.
Staff:
And where do you live?
Jean:
70 Fox Lane.
Staff:
Is that Fox as in the animal?
Jean:
Yes.
And it's Surfers Paradise, 4167.
Staff:
Do you have a home phone number, Jean?
Jean:
Yes, it's 3378 4150.
Staff:
Great.
Now that we have that information, I'll tell you about the membership plans we offer, and you can select a payment option that suits you.
Jean:
That sounds good.
Staff:
Our two most popular payment options are yearly and monthly.
The yearly membership fee works out as being about $11 per week.
On the monthly plan, you pay slightly more each week.
By the way, this month, with both of these options, we're offering a free gym outfit.
Jean:
That's great.
I think I'll go for the yearly option.
The initial outlay is more, but I'm mostly interested in getting in shape, and that option will help keep me coming, even if I don't like it.
I should be fit by the end.
Staff:
Fair enough.
The yearly option it is then.
Have you got any questions or concerns?
Jean:
Yes.
I'm going away for a month and I won't be able to come to the gym during that time.
Staff:
Lots of people have this problem when they go on holiday.
We can just suspend your gym membership for that month.
Jean:
That's a relief.
It won't be until July, and it's for work actually, but next year I'm going overseas to my friend's wedding, so can I suspend my membership for a couple of weeks then as well?
Staff:
No problem.
Just tell us about that closer to the date of your departure.
I'll tell you about the facilities we offer here.
We offer a range of group fitness classes such as body step, body tone and body balance.
Jean:
They all sound very interesting, but I can't see myself ever going to a class.
Staff:
Well, if that's not an option, perhaps you should try some general weight training exercises in the gym.
Our instructors are fully trained and very good at helping new members to feel comfortable.
Everybody is encouraged to go at their own pace.
Jean:
I like the sound of that.
I wouldn't have to get fit first, would I?
I could just start straight away?
Staff:
That's right.
Let me tell you about the other services we offer.
Are you interested in doing any water-based training?
Jean:
Mmm...
Staff:
Well, we have an Olympic-sized swimming pool where you can do aqua aerobics classes.
That's group exercise in the swimming pool, or we can develop a personal swimming plan to suit your needs.
Jean:
Aqua aerobics doesn't really appeal to me.
I'm really not very keen on fixed classes, but working on my own swimming regime would be okay in a few months when I'm a bit fitter, I suppose.
Staff:
Fine.
We also have a sauna where you can relax after a strong workout.
Jean:
That's not my idea of relaxing.
Saunas are just too hot for me.
Staff:
Many people feel that way, I must say.
One other facility we offer is our child-minding service.
It's available to our members at $5 per child.
Jean:
Well, my husband will be working at home for the first few months, so he'll be able to look after the baby when I'm exercising.
But once he goes back to work, I'll probably be using that service.
Staff:
Right.
If you don't have any questions, let's finalize things.
We can arrange payment and make an entry key for you to use whenever you come to the gym.
`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Gym Membership Form', [
          '<strong>Personal Details</strong>',
          'Name: Jean Simpson',
          'Date of birth: __Q1__',
          'Address: 70, __Q2__ Lane, Surfers Paradise, 4167',
          'Home phone: 33784150',
        ], { 1: '24th August/24 August/24th of August/24th August 1979/24 August 1979', 2: 'Fox' }, 'Questions 1-2'),
        mc('Choose the correct letter, A, B or C.', [
          [3, 'What is Jean’s reason for choosing the yearly payment option?', ['to save money', 'to get a free gift', 'to become fitter'], 'C'],
          [4, 'What is Jean doing in July this year?', ['going on holiday', 'travelling for business', 'getting married'], 'B'],
        ], 'Questions 3-4'),
        matching('How does Jean feel about the facilities listed below?\nChoose the correct letter, A, B or C.',
          ['She might be interested in the future.', 'She is interested now.', 'She is not interested at all.'],
          [[5, 'group fitness class', 'C'], [6, 'general weight training', 'B'], [7, 'group fitness in the pool', 'C'],
            [8, 'swimming', 'A'], [9, 'sauna', 'C'], [10, 'child minding', 'A']], { reuse: true, groupTitle: 'Questions 5-10' }),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi ngày sinh.', t: 'The 24th of August, 1979.', p: 'Jean sinh ngày 24 tháng 8 năm 1979 → 24th August' },
        2: { v: 'Khi nhân viên hỏi địa chỉ.', t: ['70 Fox Lane.', 'Is that Fox as in the animal?'], p: 'Địa chỉ 70 Fox Lane, “Fox” như tên con cáo → Fox' },
        3: { v: 'Khi Jean chọn gói trả theo năm.', t: "The initial outlay is more, but I'm mostly interested in getting in shape, and that option will help keep me coming, even if I don't like it.", p: 'Gói năm tốn hơn lúc đầu (không phải để tiết kiệm, loại A); quà tặng có ở cả hai gói (loại B); cô chọn vì muốn lấy lại vóc dáng, giữ động lực đến tập → C' },
        4: { v: 'Khi Jean hỏi về việc tạm dừng thẻ.', t: "It won't be until July, and it's for work actually", p: 'Tháng 7 cô đi công tác (đi đám cưới bạn là năm sau, loại C; không phải đi nghỉ, loại A) → B' },
        5: { v: 'Khi nhân viên giới thiệu các lớp tập nhóm.', t: "They all sound very interesting, but I can't see myself ever going to a class.", p: '“can’t see myself ever going” = không bao giờ đi → hoàn toàn không quan tâm → C' },
        6: { v: 'Khi nhân viên gợi ý tập tạ.', t: ['I like the sound of that.', 'I could just start straight away?'], p: 'Cô thích và có thể bắt đầu ngay → quan tâm bây giờ → B' },
        7: { v: 'Khi nói về aqua aerobics (tập nhóm dưới nước).', t: "Aqua aerobics doesn't really appeal to me.", p: 'Aqua aerobics = group exercise in the swimming pool; cô không hứng thú, không thích lớp cố định → C' },
        8: { v: 'Khi nói về kế hoạch bơi cá nhân.', t: "but working on my own swimming regime would be okay in a few months when I'm a bit fitter, I suppose.", p: '“in a few months” = vài tháng nữa mới bơi → có thể quan tâm trong tương lai → A' },
        9: { v: 'Khi nói về phòng tắm hơi.', t: ["That's not my idea of relaxing.", 'Saunas are just too hot for me.'], p: 'Phòng xông hơi quá nóng với cô, không phải cách thư giãn của cô → C' },
        10: { v: 'Khi nói về dịch vụ trông trẻ.', t: ["so he'll be able to look after the baby when I'm exercising.", "But once he goes back to work, I'll probably be using that service."], p: 'Hiện chồng trông con; khi anh đi làm lại cô sẽ dùng dịch vụ → tương lai → A' },
      },
    },
    {
      part: 2, title: 'Spring Festival', audio: 'Test 5 vol 1 audio.mp3', clip: [399.5, 783], cover: 'fireworks display lake | hot air balloons festival',
      transcript: `
Host:
I have in the studio with me Mary Smith from Yorktown Tourism, who is here to tell us about some of the events happening in our state capital over the next three weeks at the Spring Festival.
So, Mary, what can we expect to see?
Mary:
Well, it's such an exciting time to be in Yorktown.
To kick off the Spring Festival, there will be a huge firework display down by the lake, starting at 9:00 p.m. this Saturday, the 4th of September.
Over 10,000 fireworks will be set off, all choreographed to music and broadcast simultaneously here on Radio Yorkie.
You should get there early if you want to get close to the action.
So, bring along a picnic and a blanket, as it could get chilly in the evening.
One of the things that attracts visitors to the festival from all over the country is the amazing collection of flowers on show in Central Park throughout the festival.
Special buses will run from the town centre to the show at 20-minute intervals for those of you who prefer to take public transport.
If you're interested in seeing the latest in cars, from the fastest to the most expensive, then head over to the motor show at the exhibition center from the 10th to the 15th of September.
It'll be open daily from 9:00 a.m. until 10:00 p.m.
so you can even pop there after work.
Do you like photography?
Then go along to Grow Your Imagination, an exhibition of photographs of famous gardens, which will be held at the Art Gallery from the 11th to the 19th of September.
Come and be inspired by some of the world's most beautiful gardens.
I've had a sneak preview of some of the photographs, and they are magnificent.
If music is more your scene, then you should come and hear the Australian Philharmonic Orchestra performing Swing in Spring at the concert hall on Friday the 17th and Saturday the 18th of September.
It's a celebration of dance music from the 1940s and 50s.
There'll be three performances, both evening start at 7:00 p.m., and a matinee performance at 2:30 on the Saturday.
So, get your dancing shoes on and head there.
It's guaranteed to get your feet tapping.
Those are just a few of the attractions on offer.
But for something a little different, you could try Balloons Down Under, which is the largest gathering of hot air balloons in the Southern Hemisphere.
It's well worth it, because there'll be over 25 balloons of all shapes and sizes, which is a truly amazing sight.
I'm also happy to announce that one lucky person will get the chance to go up in one of these balloons absolutely free.
That's the prize in our special Spring Festival competition.
It'd normally cost you $200.
So, it's not a bad prize, eh?
I'm sure you all want a chance to win, so you'll need to fill out the entry form in today's edition of the Yorktown News.
Don't forget to include your phone number, and send it to Radio Yorkie.
Make sure your entry reaches us by 5:00 p.m. on Thursday, the 9th of September.
Then to see if you've won, just check out the festival's website on Saturday, the 11th of September, where we'll publish the name of the lucky winner.
It's such a fantastic prize, so hurry up and get your entry in.
So there you have it.
Just a few of the special events happening here in Yorktown over the Spring Festival.
And if you'd like any more details about the festival,
`,
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
          ['Event', 'Location', 'Date and Time', 'Other Information'], [
            ['Firework display', 'Near the __Q11__', '4 September<br>9 p.m.', 'Pack a __Q12__ and blanket'],
            ['Display of __Q13__', 'Central Park', 'Daily', 'Buses run from the town centre every __Q14__ minutes'],
            ['The __Q15__ Show', 'Exhibition Centre', '10-15 September<br>9 a.m. - 10 p.m.', ''],
            ['‘Grow Your Imagination’', 'In the __Q16__', '11-19 September', ''],
            ['‘Swing in Spring’', 'In the __Q17__', '17 & 18 September', 'Saturday matinee performance at __Q18__'],
          ], { 11: 'lake', 12: 'picnic', 13: 'flowers', 14: '20/twenty', 15: 'Motor/motor', 16: 'art gallery', 17: 'concert hall', 18: '2.30 PM/2:30 PM/2:30/2.30/2.30 p.m./2:30 p.m.' }, 'Questions 11-18'),
        mc('Choose the correct letter, A, B or C.', [
          [19, 'In the Spring Festival competition, you can win', ['a family pass to ‘Balloons Down Under’', 'a cheque for $200', 'a flight in a hot air balloon'], 'C'],
          [20, 'You can get an entry form for the competition from', ['the radio station', 'the newspaper', 'the Festival’s website'], 'B'],
        ], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Sự kiện đầu tiên: bắn pháo hoa.', t: 'there will be a huge firework display down by the lake, starting at 9:00 p.m. this Saturday, the 4th of September.', p: '“down by the lake” = gần hồ → lake' },
        12: { v: 'Ngay sau đó.', t: 'So, bring along a picnic and a blanket, as it could get chilly in the evening.', p: '“bring along” = pack; mang đồ dã ngoại và chăn → picnic' },
        13: { v: 'Sự kiện ở Central Park.', t: 'is the amazing collection of flowers on show in Central Park throughout the festival.', p: '“collection of flowers on show” = trưng bày hoa → flowers' },
        14: { v: 'Ngay sau đó, về xe buýt.', t: 'Special buses will run from the town centre to the show at 20-minute intervals', p: '“at 20-minute intervals” = cứ 20 phút một chuyến → 20' },
        15: { v: 'Sự kiện ở Exhibition Centre.', t: 'then head over to the motor show at the exhibition center from the 10th to the 15th of September.', p: 'Triển lãm xe hơi = motor show → Motor' },
        16: { v: 'Triển lãm ảnh Grow Your Imagination.', t: 'which will be held at the Art Gallery from the 11th to the 19th of September.', p: 'Tổ chức tại phòng trưng bày nghệ thuật → art gallery' },
        17: { v: 'Buổi hòa nhạc Swing in Spring.', t: 'performing Swing in Spring at the concert hall on Friday the 17th and Saturday the 18th of September.', p: 'Biểu diễn ở phòng hòa nhạc → concert hall' },
        18: { v: 'Ngay sau đó, về suất chiều.', t: 'and a matinee performance at 2:30 on the Saturday.', p: 'Suất diễn chiều thứ Bảy lúc 2 giờ 30 → 2.30 PM' },
        19: { v: 'Phần cuộc thi Spring Festival.', t: ['one lucky person will get the chance to go up in one of these balloons absolutely free.', "That's the prize in our special Spring Festival competition.", "It'd normally cost you $200."], p: 'Giải thưởng là một chuyến bay khinh khí cầu miễn phí; $200 chỉ là giá bình thường (bẫy B) → C' },
        20: { v: 'Ngay sau đó, về phiếu dự thi.', t: "so you'll need to fill out the entry form in today's edition of the Yorktown News.", p: 'Phiếu dự thi có trong số báo Yorktown News hôm nay; gửi về đài (bẫy A), xem kết quả trên website (bẫy C) → B' },
      },
    },
    {
      part: 3, title: 'Feedback on Journalism Course and Work Placements', audio: 'Test 5 vol 1 audio.mp3', clip: [783, 1179.8], cover: 'journalism newsroom | press conference',
      transcript: `
Tutor:
Okay, for the next task, I'd like you to work in pairs and review your journalism course and discuss how you think it might be improved.
After that, I'd like you to discuss and evaluate the work placement you've just completed.
Christine:
Okay, well, Geoff, I'd say we both enjoyed studying about current problems and concerns nationally and locally in the course.
That was really well covered.
Geoff:
Right.
Christine:
I'll tell you what.
I really got a lot out of the techniques of writing module, which I managed to apply in our placement.
What I took away from that module was how to organize my written work.
Geoff:
That was useful.
Christine:
But I must admit, when my work colleagues asked me to explain grammar to them, I was hopeless.
Geoff:
I guess I was a bit better at that.
I was looking forward to the part of the module on writing summaries, but unfortunately, we never got to that.
Christine:
But Geoff, you found the module on interviewing techniques particularly useful in the placement, didn't you?
Did it help when you were writing press releases for the government?
Geoff:
I never had to conduct interviews for that, but I did have to interview people for the in-house newsletter, so it came in handy there.
When the manager asked me to get background information for her, it was always just from written material, though.
Christine:
Let's talk a bit about the module we had on online journalism.
Do you think they could add anything to that course to make it better for the placements?
I was really disappointed that there wasn't more in the module about how writing materials to be used online differ from, say, newspaper writing in terms of vocabulary, structure and so on.
Geoff:
That was a shame.
I did get a lot out of the practical work we did on dealing with online questions from the public.
Christine:
And the technical stuff on web design was just about right.
Geoff:
Before we started our placements, the tutor asked us to read the book Government and the Press.
I liked it, and since it was published just this year, it was quite current.
But it dealt with national affairs and wasn't applicable locally.
Christine:
I thought it was a good book and practical, but not much help for local government.
Geoff:
No, that's why I didn't use it at all.
Christine:
So let's talk about our experience of actually doing the work placement.
For example, what did you think of the manager in the public relations department?
Geoff:
Well, she actually didn't seem to know a lot about our journalism course.
Christine:
Even though she had obviously thought a lot about how to use us best for the placement.
Geoff:
But actually, she was extremely busy, and I didn't see much of her.
Christine:
Me neither.
But one of her great strengths seemed to be in getting people to carry out what she asked them to do.
Her assistant actually supervised us in our daily activities, and he was brilliant.
But the manager had actually been recruited recently from outside, and she didn't know many people in local government or the press.
Geoff:
True.
Christine:
Now, of all your duties, which did you dislike most?
I found it hard when colleagues asked me to edit their writing.
Geoff:
Yes, it was hard criticizing them.
I didn't mind writing policy documents for the manager, or articles for the in-house newsletter, which was actually pretty easy.
Christine:
And I enjoyed going online to look up things for the manager, but when we had to give speeches to students in town, that was agony.
I'm always nervous standing in front of an audience.
Geoff:
Oh, me too.
Christine:
Okay.
Now, our written report of the work placement is due in about 10 days.
What do you think we need to do to finish it?
Geoff:
Well, we've already put together the government papers to attach to the report, and we've each provided a detailed description of our jobs.
We have to complete the academic bibliography, which I think we've both been putting off.
Christine:
For sure.
Geoff:
But we finished the recommendations for improving the program, so that leaves the introduction, which we're meeting this week to draft.
Christine:
And that'll be it.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.\nFeedback on journalism course and work experience placements', [
          [21, 'Which part of the Techniques of Writing module did both Geoff and Christine find helpful?', ['structuring their writing', 'understanding grammatical rules', 'developing summarising skills'], 'A'],
          [22, 'Geoff says that the Interviewing Techniques module was useful for', ['preparing government press releases', 'doing background research for his department manager', 'gathering material for the in-house newsletter'], 'C'],
          [23, 'What addition to the Online Journalism module does Christine suggest?', ['technical help with web design', 'practice in special online writing styles', 'advice on dealing with customer questions'], 'B'],
          [24, 'Geoff thought that the book Government and the Press was', ['irrelevant to his needs', 'quite out of date', 'very theoretical'], 'A'],
        ], 'Questions 21-24'),
        multi('Choose TWO letters, A-E.', 25, 'Which TWO things do the students say about the public relations department manager?',
          ['She was very good at delegating responsibilities.', 'She was readily accessible to the students.', 'She had lots of useful contacts in government.', 'She was familiar with the students’ journalism course.', 'She had carefully prepared for their placement.'], ['A', 'E'], 'Questions 25-26'),
        multi('Choose TWO letters, A-E.', 27, 'Which TWO tasks in their work experience did the students dislike most?',
          ['drafting policy documents', 'editing colleagues’ written material', 'giving talks to local students', 'researching issues for the department manager', 'writing articles for the newsletter'], ['B', 'C'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO things must the students do together before finishing their placement report?',
          ['finalise their bibliography', 'decide on a series of recommendations', 'collect the documents they will include', 'write an introductory section', 'complete the descriptions of their jobs'], ['A', 'D'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi nói về module Techniques of Writing.', t: ['What I took away from that module was how to organize my written work.', 'That was useful.'], p: 'Cả hai thấy phần sắp xếp bài viết hữu ích; ngữ pháp Christine không giỏi (loại B), phần viết tóm tắt chưa học tới (loại C) → A' },
        22: { v: 'Khi nói về module Interviewing Techniques.', t: 'but I did have to interview people for the in-house newsletter, so it came in handy there.', p: 'Thông cáo báo chí không cần phỏng vấn (loại A), tìm thông tin nền chỉ từ tài liệu viết (loại B); kỹ năng phỏng vấn có ích cho bản tin nội bộ → C' },
        23: { v: 'Khi nói về module Online Journalism.', t: "I was really disappointed that there wasn't more in the module about how writing materials to be used online differ from, say, newspaper writing in terms of vocabulary, structure and so on.", p: 'Christine muốn học thêm cách viết riêng cho môi trường online; phần thiết kế web đã vừa đủ (loại A), phần trả lời câu hỏi công chúng Geoff thấy hay (loại C) → B' },
        24: { v: 'Khi nói về cuốn Government and the Press.', t: ["But it dealt with national affairs and wasn't applicable locally.", "No, that's why I didn't use it at all."], p: 'Sách mới xuất bản năm nay (loại B), thực tế (loại C) nhưng chỉ về vấn đề quốc gia, không áp dụng được ở địa phương → không liên quan tới nhu cầu của anh → A' },
        25: { v: 'Khi nói về trưởng phòng quan hệ công chúng.', t: 'But one of her great strengths seemed to be in getting people to carry out what she asked them to do.', p: 'Giỏi khiến người khác làm việc bà giao = giỏi phân công trách nhiệm → A' },
        26: { v: 'Như câu 25 (chọn 2 đáp án).', t: 'Even though she had obviously thought a lot about how to use us best for the placement.', p: 'Bà đã suy nghĩ kỹ cách dùng sinh viên trong đợt thực tập = chuẩn bị kỹ; bà rất bận (loại B), không biết nhiều về khóa học (loại D), ít quen biết trong chính quyền (loại C) → E' },
        27: { v: 'Khi nói về công việc không thích nhất.', t: ['I found it hard when colleagues asked me to edit their writing.', 'Yes, it was hard criticizing them.'], p: 'Cả hai thấy khó khi sửa bài của đồng nghiệp → B' },
        28: { v: 'Như câu 27 (chọn 2 đáp án).', t: ['but when we had to give speeches to students in town, that was agony.', 'Oh, me too.'], p: 'Nói chuyện trước học sinh trong thị trấn là cực hình với cả hai; viết văn bản chính sách, bài bản tin (loại A, E) và tra cứu cho trưởng phòng (loại D) thì không ngại → C' },
        29: { v: 'Khi nói về việc hoàn thành báo cáo.', t: "We have to complete the academic bibliography, which I think we've both been putting off.", p: 'Tài liệu đính kèm và mô tả công việc đã xong (loại C, E); danh mục tài liệu tham khảo còn phải hoàn thành → A' },
        30: { v: 'Như câu 29 (chọn 2 đáp án).', t: "But we finished the recommendations for improving the program, so that leaves the introduction, which we're meeting this week to draft.", p: 'Các đề xuất đã xong (loại B); còn phần mở đầu, tuần này gặp nhau để viết → D' },
      },
    },
    {
      part: 4, title: 'Seed Banks', audio: 'Test 5 vol 1 audio.mp3', clip: [1179.8, 1566], cover: 'seed bank vault | seeds collection jars',
      transcript: `
Speaker:
Hello.
Today, there are nearly 2,000 seed banks in the world.
Seed banks are places where seeds from millions of different plants are stored to keep them safe for the future.
Today, I'd like to tell you a little bit about seed banks and how and why they are used.
So, let's look at some history and we'll start in ancient Mesopotamia around 8,000 BC.
This was when the ancient Mesopotamians started to practice agriculture.
They were the first to do so, as far as we know.
Every year, they would harvest their crops for food, but they also used some of these crops to make clothing.
As well as this, they also collected the seeds, so they would have crops for the following year or years.
Thanks to archaeologists, we now know how these seeds were stored.
When examining ancient settlements in Mesopotamia, archaeologists found the precious seeds underground, stored in baskets.
After much examination, they concluded that in order to protect the seeds, they were combined with large quantities of ash from old fires before being buried.
Archaeologists wanted to establish why seeds were buried underground, and concluded the most likely threat was posed by animals who might have found them a good food source.
Today, there are many more reasons why we need to protect seeds, and that's why we have sophisticated facilities like seed banks.
Seed banks provide a type of insurance against the very damaging effects that climate change is bringing to the natural world.
Extreme weather events like floods can wipe out entire crops.
Seed banks are also necessary because they can help to reduce the crop losses that can result if a disease occurs in a certain type of plant.
Importantly too, seed banks allow scientists to discover how different plants can be used in the production of medicine.
Many plants have healing properties that we are only just now beginning to understand, and having banks of seeds means that we will, hopefully, always have them around to study and use.
Scientists need to be able to identify the plants and maintain accurate records.
For this reason, each sample collected is then assigned a special code, which scientists around the world can recognize.
The seeds need, of course, to be cleaned.
There are many different ways of doing this.
Whichever technique is used, this process occurs in an environmentally controlled room in which the temperature is kept constant.
Furthermore, the humidity is strictly monitored to make sure it doesn't change too much.
All of this helps to ensure the quality of the specimen.
The seeds need then to be stored in a safe environment.
To do this, scientists freeze the seeds at very low temperatures, about minus 20 degrees Celsius.
Then the scientists place these frozen seeds in specially designed airtight canisters.
And they do this in order to protect the seeds from contamination, something we really don't want.
One thing that might surprise you about seed banks is that they don't just contain edible plants.
Scientists also include plants that are known to be poisonous, and which can cause sickness, as these plants might one day be useful.
Although governments have financed the setting up of some of these seed banks, they're expensive to run, and many require ongoing donations from the public to help support them.
Okay, let me now tell you...
`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Seed Banks', [
          '<strong>Ancient Mesopotamia</strong>',
          '• 8000 BC: crops were gathered to prepare food, produce __Q31__ and to provide seeds',
          '• Archaeologists discovered that seeds were placed in baskets and buried underground',
          '• Seeds were mixed with __Q32__ before being buried',
          '• Storing seeds underground meant that no __Q33__ could eat them',
          '<strong>Seed banks today</strong>',
          '• They protect seeds from natural disasters such as __Q34__',
          '• They protect certain plant crops',
          '• They allow for research into __Q35__ that can be made from plants',
          '<strong>The samples:</strong>',
          '• are given an individual __Q36__ for identification purposes',
          '• are cleaned in a room with controlled temperature and __Q37__',
          '• are frozen and stored in containers to prevent __Q38__',
          '• even include species of plant that are __Q39__ to people',
          '• __Q40__ from individuals are often needed to maintain seed banks',
        ], { 31: 'clothing', 32: 'ash', 33: 'animals', 34: 'floods', 35: 'medicine', 36: 'code', 37: 'humidity', 38: 'contamination', 39: 'poisonous', 40: 'Donations/donations' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần lịch sử ở Lưỡng Hà cổ đại.', t: 'Every year, they would harvest their crops for food, but they also used some of these crops to make clothing.', p: 'Ngoài làm thức ăn, họ dùng cây trồng để làm quần áo → clothing' },
        32: { v: 'Khi nói về cách cất giữ hạt giống.', t: 'they were combined with large quantities of ash from old fires before being buried.', p: '“combined with” = mixed with; trộn với tro từ đống lửa cũ → ash' },
        33: { v: 'Ngay sau đó, lý do chôn hạt dưới đất.', t: 'concluded the most likely threat was posed by animals who might have found them a good food source.', p: 'Mối đe dọa lớn nhất là động vật ăn hạt → animals' },
        34: { v: 'Phần ngân hàng hạt giống ngày nay.', t: 'Extreme weather events like floods can wipe out entire crops.', p: 'Thời tiết cực đoan như lũ lụt có thể xóa sổ cả vụ mùa → floods' },
        35: { v: 'Ngay sau đó.', t: 'seed banks allow scientists to discover how different plants can be used in the production of medicine.', p: 'Nhà khoa học nghiên cứu cách dùng cây để sản xuất thuốc → medicine' },
        36: { v: 'Khi nói về việc nhận diện mẫu.', t: 'For this reason, each sample collected is then assigned a special code, which scientists around the world can recognize.', p: '“assigned a special code” = được gán một mã riêng để nhận diện → code' },
        37: { v: 'Khi nói về việc làm sạch hạt.', t: "Furthermore, the humidity is strictly monitored to make sure it doesn't change too much.", p: 'Phòng giữ nhiệt độ ổn định và kiểm soát chặt độ ẩm → humidity' },
        38: { v: 'Khi nói về việc bảo quản.', t: "And they do this in order to protect the seeds from contamination, something we really don't want.", p: 'Hộp kín khí giúp hạt không bị nhiễm bẩn → contamination' },
        39: { v: 'Khi nói về điều bất ngờ của ngân hàng hạt giống.', t: 'Scientists also include plants that are known to be poisonous, and which can cause sickness, as these plants might one day be useful.', p: 'Họ lưu cả những cây được biết là có độc → poisonous' },
        40: { v: 'Cuối bài, về kinh phí.', t: 'and many require ongoing donations from the public to help support them.', p: 'Nhiều ngân hàng hạt giống cần sự quyên góp liên tục của công chúng → Donations' },
      },
    },
  ],
};
