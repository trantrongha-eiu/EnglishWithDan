// Vol 6 – Test 1 (PDF "Lis/L-TEST 1.pdf" p1–6; key "Lis/L-key.pdf" p1; audio "Lis/Audio Lis/Test 1/S1–S4 (1).mp3").
// Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// P1 = bank "Sailing Courses for Children" (Vol 5 - Test 3 P1): same form, same key 10/10 → reused.
// Transcript: Whisper turbo (sentences + pitch for turns) checked against large-v3; large-v3 drops P2 226–300 s and
// P4 261–283 s, turbo invents "Well, it's £15 a day." at P2 323 s (prompt leak) → large-v3 text there.
// P3: two women (tutor, Fiona) + Daniel — turns by pitch and content. S4 carries 10 min of answer-transfer silence → clip.
// Source errors fixed: key Q24 C (positions to defend) → A — the recording: "use an issue that the students already have
// strong opinions about. Then some people will be happy to speak in support of it and others to oppose it" (sides are
// chosen, not given) = a topic that really involves them.
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 6, test: 1,
  sections: [
    { part: 1, reuse: '6ac77be9c00e3ae23ccffd5e', title: 'Sailing Courses for Children' },
    {
      part: 2, title: 'Working for Johnson Jones', audio: 'Lis/Audio Lis/Test 1/S2 (1).mp3', cover: 'department store recruitment fair | retail staff department store',
      transcript: `
Good morning.
My name's Mark Bergin.
I'm a Human Resources Manager at Johnson Jones, and I'm here to tell you about what it's like working for one of the country's best employers.
The company has 225 department stores and owns a further 150 supermarkets.
At our latest store opening, we had over 9,000 applicants for 750 posts.
So, why do so many people want to work for us?
Well, the first thing that attracts them isn't so much the salary, although that is a little above average, it's the idea of getting a massive 25% off everything from washing machines to designer handbags.
People are prepared to put in long hours to get those kinds of perks.
Johnson Jones has been going strong for nearly 150 years and has outlived many of its strongest competitors.
Of course, this has something to do with the high-quality products that we sell and our motto, Better for Less, which means customers know they're getting good value for money.
But we're not alone in that.
Where we are different is in our approach to making a profit.
Other companies think in the short term, whereas we always take a more strategic view, looking three or five years ahead.
The company isn't owned by a family or shareholders.
It's a partnership, which means it's owned by its full-time employees, who are all partners and have a share in the company.
In return for the very generous benefits they get, they're expected to put in extra effort and take an active role in running the company.
This means they're involved in things like making decisions about pension contributions, for example.
Another very attractive reason for working for us is the annual bonus, which we get as a percentage of our salary.
Last year it was 15%, about two months' salary, which is pretty standard.
It can go down to 8%, but that's unusual, and a couple of times it's even been above 20%.
Some people use it to pay off loans, others save it for a deposit on a house.
The most popular benefit for partners are the subsidised holiday centres, which are owned by the company.
Once a year, partners can book in for up to two weeks.
It's for anyone, from cleaners to directors, with a minimum of three months' service.
After six months' service, partners are entitled to a further subsidy on the cost of their stay.
Let me just give you an idea of what's on offer at the holiday centres.
The Grange, which is the largest of the holiday centres, is used for conferences by the company, and the board of directors always have their annual meeting there.
It's all very informal, not like a normal conference centre.
Meadow House is located in Kent, which is famous for its apples and other fruit, and it's a large country house.
What's unusual about it is that, unlike other hotels, you have access to the kitchen, so it feels more like staying with a friend.
Coombe Manor is a working farm.
There are loads of cows and sheep, none of which actually end up on our supermarket shelves.
It's a paradise for kids, as there's plenty of space to run wild and also an indoor pool.
You can choose to stay in cottages or camp by the lake.
The Barn is where I recently celebrated my 25th wedding anniversary.
You can rent the whole place out for a large group of up to 40 friends.
We got all our food delivered from the nearest Johnson Jones supermarket, so there was no cooking to be done.
Perfect.
All that was missing was the spa, which should be opening next year.
The Stable is often hard to get into because it's so popular.
That's partly because it's right on the beach with beautiful sea views and only an hour by train from London.
Ideal for weekends.
The company Sailing Club is located there, which was started by the company's founder in 1885.
So, I'm sure you'll all agree that there really is...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nWorking for Johnson Jones', [
          [11, 'What does Mark say first attracts people to working for Johnson Jones?', ['the pay', 'the staff discount', 'the working hours'], 'B'],
          [12, "Mark says the company is one of the country's most successful retailers because it", ['is focused on long-term planning.', 'provides excellent customer service.', 'offers value for money.'], 'A'],
          [13, 'Mark says that because Johnson Jones is a partnership, the staff', ['are better trained.', 'have better job security.', 'are given more responsibility.'], 'C'],
          [14, 'What is the typical annual bonus that partners receive?', ['8%', '15%', '20%'], 'B'],
          [15, 'To qualify for the leisure and holiday facilities, partners must have worked for the company for', ['one year.', 'six months.', 'three months.'], 'C'],
        ], 'Questions 11-15'),
        matching('What information is given about each of the following staff holiday centres?\nChoose FIVE answers from the box and write the correct letter, A-G, next to Questions 16-20.',
          ['available for celebrations and parties', 'suitable for families with children', 'regularly used by senior management', "also supplies food to the company's supermarkets", 'spa facilities available', "similar to being in someone's home", 'good for short breaks'], [
            [16, 'The Grange', 'C'],
            [17, 'Meadow House', 'F'],
            [18, 'Coombe Manor', 'B'],
            [19, 'The Barn', 'A'],
            [20, 'The Stable', 'G'],
          ], { title: 'Information', groupTitle: 'Questions 16-20' }),
      ],
      expl: {
        11: { v: 'Khi Mark giải thích vì sao nhiều người muốn làm cho công ty.', t: "Well, the first thing that attracts them isn't so much the salary, although that is a little above average, it's the idea of getting a massive 25% off everything from washing machines to designer handbags.", p: 'Lương chỉ cao hơn trung bình chút, không phải điều thu hút đầu tiên (bẫy A); điều thu hút là được giảm giá 25% mọi món hàng → giảm giá cho nhân viên → B' },
        12: { v: 'Khi nói vì sao công ty tồn tại gần 150 năm.', t: ["But we're not alone in that.", 'Where we are different is in our approach to making a profit.', 'Other companies think in the short term, whereas we always take a more strategic view, looking three or five years ahead.'], p: 'Hàng tốt giá hợp lý thì công ty khác cũng có (bẫy C); điểm khác biệt là luôn nhìn xa 3–5 năm → tập trung vào kế hoạch dài hạn → A' },
        13: { v: 'Khi giải thích mô hình partnership.', t: "In return for the very generous benefits they get, they're expected to put in extra effort and take an active role in running the company.", p: 'Nhân viên là partner phải tham gia tích cực vào việc điều hành công ty (vd. quyết định đóng lương hưu) → được giao nhiều trách nhiệm hơn → C' },
        14: { v: 'Khi nói về tiền thưởng hằng năm.', t: ["Last year it was 15%, about two months' salary, which is pretty standard.", "It can go down to 8%, but that's unusual, and a couple of times it's even been above 20%."], p: '8% là hiếm, trên 20% chỉ vài lần (bẫy A, C); 15% là mức thông thường (pretty standard = typical) → B' },
        15: { v: 'Khi nói về các khu nghỉ dưỡng của công ty.', t: ["It's for anyone, from cleaners to directors, with a minimum of three months' service.", "After six months' service, partners are entitled to a further subsidy on the cost of their stay."], p: 'Sáu tháng là để được hỗ trợ thêm chi phí (bẫy B); điều kiện tối thiểu để được dùng là ba tháng làm việc → C' },
        16: { v: 'Khi giới thiệu The Grange.', t: 'The Grange, which is the largest of the holiday centres, is used for conferences by the company, and the board of directors always have their annual meeting there.', p: 'Hội đồng quản trị luôn họp thường niên ở đây → thường được ban lãnh đạo cấp cao sử dụng → C' },
        17: { v: 'Khi giới thiệu Meadow House.', t: "What's unusual about it is that, unlike other hotels, you have access to the kitchen, so it feels more like staying with a friend.", p: 'Được dùng bếp, cảm giác như ở nhà một người bạn → giống như ở nhà ai đó → F' },
        18: { v: 'Khi giới thiệu Coombe Manor.', t: ['There are loads of cows and sheep, none of which actually end up on our supermarket shelves.', "It's a paradise for kids, as there's plenty of space to run wild and also an indoor pool."], p: 'Gia súc ở trang trại KHÔNG được cung cấp cho siêu thị (bẫy D); đây là thiên đường cho trẻ em → hợp với gia đình có con nhỏ → B' },
        19: { v: 'Khi Mark kể về The Barn.', t: ['The Barn is where I recently celebrated my 25th wedding anniversary.', 'You can rent the whole place out for a large group of up to 40 friends.'], p: 'Thức ăn được giao TỪ siêu thị chứ không cung cấp cho siêu thị, spa thì năm sau mới mở (bẫy D, E); Mark tổ chức kỷ niệm ngày cưới ở đây, thuê được cho nhóm 40 người → dành cho lễ kỷ niệm và tiệc → A' },
        20: { v: 'Khi giới thiệu The Stable.', t: ["That's partly because it's right on the beach with beautiful sea views and only an hour by train from London.", 'Ideal for weekends.'], p: 'Chỉ cách London một giờ tàu, lý tưởng cho cuối tuần → tốt cho các kỳ nghỉ ngắn → G' },
      },
    },
    {
      part: 3, title: 'Organising a Debate', audio: 'Lis/Audio Lis/Test 1/S3 (1).mp3', clip: [0, 372], cover: 'university students debate | students discussion seminar',
      transcript: `
Tutor:
Right, now you wanted to organise a formal discussion of some sort in the class, is that right, Daniel?
Daniel:
Yes, we thought it would be really good to end our psychology course with a formal debate, you know, where there's a statement and people argue for or against it.
Tutor:
Good idea.
Where did the enthusiasm come from?
Have either of you organised debates before, Fiona?
Fiona:
No, but one of my friends did in his last year at secondary school, and he says he got a lot out of doing it.
And I know they have debates in lots of other departments here at the university.
Tutor:
I see.
So what do you think the students, you and the others, would get out of this?
Fiona:
Well, a debate will encourage people to study all sides of the subject matter.
And I also think listening to other people's ideas can have a focusing effect on your own.
Sometimes you kind of don't know what you truly believe until you hear something you disagree with.
Tutor:
OK, what about the topic for the debate?
Daniel:
We've got three to choose from.
We'll show you in a minute to check they're OK.
At first, we thought we'd ask the other students to suggest something, but we were afraid we'd get 30 different topics.
So instead, we brainstormed some, just the two of us, then made a shortlist, and we'll get them to vote for the one they like best.
Tutor:
Right.
Daniel:
But the thing is, if people don't know how debates work, they could feel at a disadvantage.
I mean, it wouldn't affect their grades or anything, but it could put them off.
Fiona:
So we thought we should have a meeting beforehand to make sure everyone's clear about what's involved in a debate and how to prepare for it.
Tutor:
I think that's a good idea.
Fiona:
And we thought we could establish some key points of a successful debate there, like that debates are effective methods for considering an issue, and that you need to understand both sides of an argument in order to support one side effectively.
We think it'll be best if we can use an issue that the students already have strong opinions about.
Daniel:
Then some people will be happy to speak in support of it and others to oppose it.
Tutor:
Right.
What else do you want to do at the meeting?
Daniel:
Well, we've got to think about how people will do the background research for the debate.
We could organise everyone into two teams.
That should save time for the main speakers.
They won't have to do it on their own.
And we'll need to decide on some rules, like how long each person speaks for, and to select a chair for the debate, someone who's really confident.
Tutor:
Fine.
Now, I think you should have some sort of follow-up to the debate.
After it's over, I'd like you to get everyone to write a short essay, focusing on what they gain from participating in it.
And in turn, that can feed into the work we've been doing on learning and motivation.
Fiona:
But would you be willing to read them and report back?
I mean, give some feedback on them.
Tutor:
I wouldn't have made the suggestion if I wasn't.
Fiona:
Thanks.
Tutor:
OK, now let's think a bit more about the meeting.
You need to decide exactly how you'll introduce the students to different features of a debate.
Daniel:
Well, first of all, we need to inform everyone about what actually happens at a debate, the procedures and so on.
We could talk about that and write the main information on the board.
Fiona:
Or instead of that, we could make a summary of the main stages and hand that out.
Daniel:
Then talk it through.
Yes, OK, that's better.
Fiona:
OK, but we do need to talk about body language as well.
Tutor:
Yes, that's a very important tool.
I've got an interesting article on that with some good diagrams of techniques for things like eye contact.
I'll make some copies for you to give out.
Fiona:
Great.
Daniel:
Then we need to think about where people will find the information on the debate topic, so they'll need to know where to look for the information.
We could compile a list of sources, textbooks and articles and so on.
Fiona:
We could, but couldn't people offer their own suggestions and advice on that at the meeting instead?
Tutor:
Yes, get everyone involved.
Right.
Fiona:
What about preparation for asking and answering questions?
We could try to demonstrate that, but I'm not sure how.
Daniel:
Maybe we could put up a list of points on the board, then discuss them.
Fiona:
Yes, that sounds better.
Thanks.
Tutor:
OK, well, let's meet up again.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nOrganising a debate', [
          [21, 'Why is Fiona keen to organise a debate?', ['She has attended debates in other departments.', 'She organised debates while at secondary school.', 'She has talked about debating with a friend.'], 'C'],
          [22, 'Fiona says that an advantage of debating is that it can', ['help students to form opinions.', "improve students' listening skills.", "develop students' self-confidence."], 'A'],
          [23, 'How will the debate topic be selected?', ['Daniel and Fiona will ask the lecturer to choose one from a list.', "The other students will select one of Daniel and Fiona's suggestions.", 'Daniel and Fiona will collect suggestions from the other students.'], 'B'],
          [24, 'Daniel and Fiona think one key to a successful debate is for students to', ['have a topic that really involves them.', 'plan their speech carefully.', 'be given positions to defend.'], 'A'],
          [25, 'Daniel thinks it would be good for the students to be in two teams because it would', ['give everyone a chance to speak.', 'help students with less confidence.', 'share out the preparation required.'], 'C'],
          [26, 'What does the lecturer agree to do after the debate?', ["make comments on students' written work", 'help Daniel and Fiona to write a report', 'set the students an essay on a different topic'], 'A'],
        ], 'Questions 21-26'),
        matching('What will Daniel and Fiona do at the meeting to help students with debate?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 27-30.',
          ['ask for suggestions', 'give a handout of key points', 'write on the board', 'provide a photocopy of an article', 'recommend a textbook', 'give a demonstration'], [
            [27, 'understanding debating procedures', 'B'],
            [28, 'using body language', 'D'],
            [29, 'accessing resources', 'A'],
            [30, 'asking and answering questions', 'C'],
          ], { title: 'Actions at the meeting', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi giảng viên hỏi Fiona đã từng tổ chức tranh biện chưa.', t: 'No, but one of my friends did in his last year at secondary school, and he says he got a lot out of doing it.', p: 'Người tổ chức ở trường cấp 3 là bạn của Fiona (bẫy B); các khoa khác có tranh biện nhưng Fiona không nói đã dự (bẫy A); cô nghe bạn kể lợi ích của việc tranh biện → đã nói chuyện về tranh biện với một người bạn → C' },
        22: { v: 'Khi giảng viên hỏi sinh viên được lợi gì.', t: ["And I also think listening to other people's ideas can have a focusing effect on your own.", "Sometimes you kind of don't know what you truly believe until you hear something you disagree with."], p: 'Nghe ý kiến người khác giúp mình biết mình thật sự nghĩ gì → giúp sinh viên hình thành quan điểm → A' },
        23: { v: 'Khi bàn về chủ đề tranh biện.', t: ["At first, we thought we'd ask the other students to suggest something, but we were afraid we'd get 30 different topics.", "So instead, we brainstormed some, just the two of us, then made a shortlist, and we'll get them to vote for the one they like best."], p: 'Ý định thu thập đề xuất từ các bạn đã bị bỏ (bẫy C); hai bạn tự lập danh sách rồi cho cả lớp bình chọn → các sinh viên khác chọn một trong các đề xuất của Daniel và Fiona → B' },
        24: { v: 'Khi nói về các điểm chính của một buổi tranh biện thành công.', t: ["We think it'll be best if we can use an issue that the students already have strong opinions about.", 'Then some people will be happy to speak in support of it and others to oppose it.'], p: 'Chọn vấn đề sinh viên đã có quan điểm mạnh → chủ đề khiến họ thật sự quan tâm → A' },
        25: { v: 'Khi Daniel nói về việc tìm tư liệu.', t: ['We could organise everyone into two teams.', 'That should save time for the main speakers.', "They won't have to do it on their own."], p: 'Chia hai đội để người nói chính không phải tự làm hết phần chuẩn bị → chia sẻ phần chuẩn bị cần thiết → C' },
        26: { v: 'Khi giảng viên đề nghị viết bài luận sau buổi tranh biện.', t: ['But would you be willing to read them and report back?', 'I mean, give some feedback on them.', "I wouldn't have made the suggestion if I wasn't."], p: 'Bài luận là về chính buổi tranh biện, không phải chủ đề khác (bẫy C); giảng viên đồng ý đọc và nhận xét bài viết của sinh viên → A' },
        27: { v: 'Khi bàn cách giới thiệu quy trình tranh biện.', t: ['We could talk about that and write the main information on the board.', 'Or instead of that, we could make a summary of the main stages and hand that out.', "Yes, OK, that's better."], p: 'Viết lên bảng bị thay thế (bẫy C); chọn tóm tắt các bước chính và phát cho mọi người → phát tài liệu các điểm chính → B' },
        28: { v: 'Khi nói về ngôn ngữ cơ thể.', t: ["I've got an interesting article on that with some good diagrams of techniques for things like eye contact.", "I'll make some copies for you to give out."], p: 'Giảng viên photo bài báo để hai bạn phát cho lớp → cung cấp bản photo một bài báo → D' },
        29: { v: 'Khi bàn chỗ tìm thông tin về chủ đề.', t: ['We could compile a list of sources, textbooks and articles and so on.', "We could, but couldn't people offer their own suggestions and advice on that at the meeting instead?", 'Yes, get everyone involved.'], p: 'Lập danh sách sách báo bị bác (bẫy E); để mọi người tự đưa ra gợi ý tại buổi gặp → xin ý kiến đề xuất → A' },
        30: { v: 'Khi bàn cách chuẩn bị hỏi và trả lời câu hỏi.', t: ["We could try to demonstrate that, but I'm not sure how.", 'Maybe we could put up a list of points on the board, then discuss them.', 'Yes, that sounds better.'], p: 'Làm mẫu thì không biết làm thế nào (bẫy F); ghi danh sách các điểm lên bảng rồi thảo luận → viết lên bảng → C' },
      },
    },
    {
      part: 4, title: 'Crisis Communication Theory', audio: 'Lis/Audio Lis/Test 1/S4 (1).mp3', clip: [0, 487], cover: 'press conference crisis | company spokesperson press',
      transcript: `
Today, I want to talk about how organisations can respond to a crisis, which happens when a serious problem occurs suddenly and must be dealt with quickly.
I will talk about a theory that tells crisis managers how to communicate in different kinds of crises.
Some people ask why we need theory in crisis communication.
Isn't logic the answer?
Yes, it is sometimes.
But organisations often handle crisis communication badly.
What we find is that, in reality, much of the advice that organisations receive on how to respond to a crisis is just a guess.
Theory and research allow us to take those suggestions and test them.
Then managers can be given advice based on actual evidence of what works and what doesn't.
The crisis theory has categorised three general types of crises.
One type is a crisis where the organisation is a victim and has very little responsibility.
For example, this kind of crisis could be caused by a rumour.
The second kind is accidental.
There isn't much responsibility because there are other outside factors that contributed to it.
And the third one, and the most difficult to actually manage, is a preventable crisis.
In this kind of crisis, those affected believe strongly that a mistake was made within the organisation.
The type of crisis is important because the more people think the organisation is responsible for the crisis, the angrier they become at the organisation.
The theory begins by suggesting a two-part basic response that can be used in all kinds of crisis.
The first part is to provide information to those affected so that they can protect themselves from further harm.
Many crises pose a risk to people.
For example, if there is a chemical release, people might have to evacuate an area.
Or, if there's a product which could be harmful, people need to be told about it, so they don't buy it, or so, if they have bought it, they can return it.
The second part of the basic response is to communicate the action the organisation is planning in order to prevent another crisis.
This is important because those affected by a crisis are often concerned that it is going to happen again.
Beyond this, crisis managers also have other tools to shape how people think about the crisis.
Crisis managers can use several strategies to do this.
One strategy is to diminish the crisis.
If crisis managers have proof which is convincing, they can argue that a crisis is not as bad as people think.
If they can argue this successfully, the harmful effects are reduced.
Another way to shape thinking is to give excuses which emphasise a lack of intent.
Therefore, people will see the crisis as an accident.
This is important because an accidental crisis is much easier to manage than an intentional crisis.
Crisis managers can also protect the organisation's reputation when there is a major crisis.
Their first goal is to reduce the negative opinions generated by the crisis.
This can be done by presenting new positive facts and figures about the organisation, or by reminding people of past good works done by the organisation.
Rebuild strategies are useful for preventable crises or when there has been a series of accidental crises, as these crises present a severe threat to the perceived reliability of the organisation.
For example, a crisis where the organisation is clearly at fault or broke a law can be very damaging and can result in loss of business.
Rebuild strategies can also be used to reduce the impact of the crisis.
To do this, crisis managers say and do things to benefit those affected by the crisis.
The reputation of the organisation can also be protected in practical ways.
The problem can sometimes be addressed by offering an apology to those affected by the crisis.
This may be sufficient action when the problem is relatively minor.
However, if the crisis is very severe, the most common strategy is to offer compensation to those affected.
So, to summarise, crisis communication theory is interesting to managers as it gives positive guidance on how to respond.
It can help them figure out which strategy...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Crisis Communication Theory', [
          '<strong>Why do we need theory?</strong>',
          '• Some people think using __Q31__ is better than theory',
          '• But a lot of advice is simply a __Q32__',
          '<strong>Types of crisis</strong>',
          '• The organisation can be a victim – e.g. due to a __Q33__',
          '• Crisis can be accidental – caused by external factors',
          '• Crisis can be preventable – resulting from a __Q34__ in the organisation',
          '<strong>Suggested response for all crises</strong>',
          '• Give information to prevent any more damage',
          '• Communicate what __Q35__ is to be taken',
          "<strong>Strategies to influence people's thinking</strong>",
          '• Diminish the crisis',
          '   – provide __Q36__ that the crisis is not so bad',
          '• Give excuses for the crisis',
          '   – highlight that it was not intentional',
          "<strong>Protecting the organisation's reputation</strong>",
          '• Initial objective is to lessen __Q37__ opinions',
          '• Rebuild strategies are important when:',
          "   – there is a serious __Q38__ to the organisation's reputation",
          '   – the impact of the crisis needs lessening',
          '• Things can be improved by providing an __Q39__',
          '   – In serious cases, __Q40__ is usually offered',
        ], { 31: 'logic', 32: 'guess', 33: 'rumour/rumor', 34: 'mistake', 35: 'action', 36: 'proof', 37: 'negative', 38: 'threat', 39: 'apology', 40: 'compensation' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi đặt câu hỏi vì sao cần lý thuyết.', t: ['Some people ask why we need theory in crisis communication.', "Isn't logic the answer?"], p: 'Có người cho rằng dùng logic là đủ thay cho lý thuyết → logic' },
        32: { v: 'Ngay sau đó.', t: 'What we find is that, in reality, much of the advice that organisations receive on how to respond to a crisis is just a guess.', p: 'Nhiều lời khuyên thực ra chỉ là phỏng đoán → guess' },
        33: { v: 'Khi nói về loại khủng hoảng thứ nhất.', t: ['One type is a crisis where the organisation is a victim and has very little responsibility.', 'For example, this kind of crisis could be caused by a rumour.'], p: 'Tổ chức là nạn nhân, ví dụ do một tin đồn → rumour' },
        34: { v: 'Khi nói về khủng hoảng có thể phòng tránh.', t: 'In this kind of crisis, those affected believe strongly that a mistake was made within the organisation.', p: 'Do một sai lầm trong nội bộ tổ chức → mistake' },
        35: { v: 'Khi nói phần thứ hai của phản hồi cơ bản.', t: 'The second part of the basic response is to communicate the action the organisation is planning in order to prevent another crisis.', p: 'Thông báo hành động tổ chức định thực hiện → action' },
        36: { v: 'Khi nói chiến lược làm giảm nhẹ khủng hoảng.', t: 'If crisis managers have proof which is convincing, they can argue that a crisis is not as bad as people think.', p: 'Đưa ra bằng chứng thuyết phục rằng khủng hoảng không tệ như mọi người nghĩ → proof' },
        37: { v: 'Khi nói về bảo vệ danh tiếng.', t: 'Their first goal is to reduce the negative opinions generated by the crisis.', p: 'Mục tiêu đầu tiên (initial objective) là giảm (lessen) các ý kiến tiêu cực → negative' },
        38: { v: 'Khi nói khi nào cần chiến lược tái thiết.', t: 'Rebuild strategies are useful for preventable crises or when there has been a series of accidental crises, as these crises present a severe threat to the perceived reliability of the organisation.', p: 'Severe threat = serious threat đối với uy tín của tổ chức → threat' },
        39: { v: 'Khi nói các cách thực tế bảo vệ danh tiếng.', t: 'The problem can sometimes be addressed by offering an apology to those affected by the crisis.', p: 'Đưa ra lời xin lỗi với những người bị ảnh hưởng → apology' },
        40: { v: 'Ngay sau đó.', t: 'However, if the crisis is very severe, the most common strategy is to offer compensation to those affected.', p: 'Trường hợp nghiêm trọng thường đưa ra bồi thường → compensation' },
      },
    },
  ],
};
