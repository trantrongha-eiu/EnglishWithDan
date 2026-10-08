// Vol 2 – Test 10 (PDF "listening/test 10/Test 10.pdf" p1–6, key p7; audio test 10/section 1–4.mp3)
// Transcripts: Whisper + Otter merge (+ wb.js for prices and a passage Whisper replaced with a made-up line);
// P1 and P3 written out (P1 plays the example first — kept once; Otter's turns unusable). Choir name as printed in
// the questions: Blackvale (Whisper "Black Bell"), Mitchelstown.
// Source notes: Q1–10 heading "Write ONE WORD AND/OR A NUMBER" kept; Q15 key B (Blackvale donates to charities).
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 2, test: 10,
  sections: [
    {
      part: 1, title: 'Theatre Booking', audio: 'listening/test 10/section 1.mp3', cover: 'theatre seats circle | theatre auditorium',
      transcript: `
Clerk:
Good morning, Corn Market Theatre.
Fenella:
Oh, good morning.
I'd like to ask about making a booking for the performance of Pirates.
Clerk:
Yes, of course.
What day?
Fenella:
I'd like to make a booking for the afternoon performance on December the 8th.
Clerk:
I'll just check on the computer.
Good news, you're booking well ahead of time, so there are lots of seats available for that performance.
Fenella:
Great.
Clerk:
Now, if I can just start by taking a few details.
Fenella:
Yes, of course.
Clerk:
What's your name, please?
Fenella:
It's Fenella Bittens.
B-I-double T-E-N-S.
Clerk:
Now, can I take a contact number?
Fenella:
It's 07796 892 326.
Clerk:
Lovely.
So, how many tickets would you like?
Fenella:
Twenty, please.
Clerk:
So, that's a group booking.
Fenella:
Does that mean I get a discount?
Clerk:
Yes.
Are they all for adults?
Fenella:
Actually, only three are adults.
Clerk:
Right.
So, you get a discount of 10% on those tickets, which makes it £23 per person.
All the tickets are the same price wherever you sit.
Fenella:
And the rest are all under 16.
Clerk:
OK, so instead of £15 per person, that'll be £12.50.
Fenella:
Oh, that's good.
Clerk:
Would you like to sit in the stalls?
Fenella:
I'd prefer the circle, if that's possible.
Clerk:
Well, I can give you 20 more or less together.
Really nice seats on the middle row.
Fenella:
No, I think we'd need to be right at the back, actually.
Clerk:
That's no problem.
There are plenty of seats there.
Fenella:
That's good, because we have one child who's a wheelchair user.
Clerk:
Right.
Well, we have very good arrangements for our disabled customers.
Fenella:
Well, the main thing is we want to be able to get to the lift easily.
Clerk:
That won't be any problem.
I'll put you in for more or less the whole row.
Fenella:
Good.
Now, would it be possible to pay for the tickets by credit card?
Clerk:
No problem.
Do you want me to send you the tickets or pick them up from the box office at the theatre?
Fenella:
Parking's so difficult near the theatre in the daytime.
Clerk:
Well, we've now got an arrangement that you can pick up tickets in the library.
Fenella:
That sounds good.
Clerk:
Fine.
I'll make a note that you'll do that.
Fenella:
Great.
Now, I read in a brochure that you can also order theatre meals.
Clerk:
That's right.
With such a large party, it's probably a good idea if you order what you want in advance.
Fenella:
Well, I've got a good idea about what everyone would like.
Could you put me through to the café?
Clerk:
Well, if you want, I can take down the order now.
Fenella:
That'd be great.
Thanks.
Clerk:
No problem.
Fenella:
Well, we've got a few children in the group who are vegetarian.
Clerk:
OK, I'll make a note of that.
Fenella:
And I wanted to check if you do any hot dishes, like pasta, for example.
Clerk:
I'm afraid not, but we do have pizzas, though.
Fenella:
Even better.
Let's go for those for all of us.
Cheese and tomato.
Clerk:
Fine.
And what would everyone like to drink?
`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Theatre booking', [
          'Example: Booking for Pirates',
          'Date: 8th December (afternoon)',
          'Name: Fenella __Q1__',
          'Contact number: 07796892326',
          '<strong>Booking details</strong>',
          'Type of booking: __Q2__ with discount',
          '• tickets: 3 adults at __Q3__ pounds each',
          '• children under 16 at __Q4__ pounds each',
          '• requires seats on the __Q5__ row of the circle',
          '• one person uses a __Q6__',
          '• need to have good access to the __Q7__',
          'Will collect the tickets from the __Q8__',
          '<strong>Meals</strong>',
          'Several people are __Q9__',
          'Food: __Q10__ (cheese and tomato)',
        ], { 1: 'Bittens', 2: 'group', 3: '23', 4: '12.50/12.5', 5: 'back', 6: 'wheelchair/wheel chair', 7: 'lift', 8: 'library', 9: 'vegetarian/vegetarians', 10: 'pizza/pizzas' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi tên.', t: ["It's Fenella Bittens.", 'B-I-double T-E-N-S.'], p: 'Họ được đánh vần, có hai chữ T → Bittens' },
        2: { v: 'Khi đặt 20 vé.', t: ["So, that's a group booking.", 'Does that mean I get a discount?'], p: '20 vé = đặt theo nhóm, được giảm giá → group' },
        3: { v: 'Khi tính giá vé người lớn.', t: 'So, you get a discount of 10% on those tickets, which makes it £23 per person.', p: 'Sau khi giảm 10%, vé người lớn còn £23 → 23' },
        4: { v: 'Khi tính giá vé trẻ em.', t: "OK, so instead of £15 per person, that'll be £12.50.", p: '£15 là giá gốc (bẫy); vé trẻ dưới 16 tuổi còn £12.50 → 12.50' },
        5: { v: 'Khi chọn chỗ ngồi.', t: ['Really nice seats on the middle row.', "No, I think we'd need to be right at the back, actually."], p: 'Hàng giữa là gợi ý của nhân viên (bẫy); khách cần hàng cuối → back' },
        6: { v: 'Ngay sau đó, lý do ngồi hàng cuối.', t: "That's good, because we have one child who's a wheelchair user.", p: 'Một em dùng xe lăn → wheelchair' },
        7: { v: 'Khi nói về lối đi.', t: 'Well, the main thing is we want to be able to get to the lift easily.', p: 'Cần đến thang máy dễ dàng → lift' },
        8: { v: 'Khi bàn cách nhận vé.', t: ["Parking's so difficult near the theatre in the daytime.", "Well, we've now got an arrangement that you can pick up tickets in the library."], p: 'Quầy vé ở nhà hát khó đỗ xe (bẫy); nhận vé ở thư viện → library' },
        9: { v: 'Phần đặt đồ ăn.', t: "Well, we've got a few children in the group who are vegetarian.", p: 'Vài em ăn chay → vegetarian' },
        10: { v: 'Ngay sau đó.', t: ["I'm afraid not, but we do have pizzas, though.", 'Cheese and tomato.'], p: 'Không có mì ống (bẫy); chọn pizza phô mai cà chua → pizza' },
      },
    },
    {
      part: 2, title: 'Joining a Local Choir', audio: 'listening/test 10/section 2.mp3', cover: 'choir singing | choir rehearsal',
      fix: [
        ['the Black Bell Male Voice Choir', 'the Blackvale Male Voice Choir'], ['Black Bell', 'Blackvale'], ['Blackbell', 'Blackvale'],
        ['Mitchell Town Choir', 'Mitchelstown Choir'], ['Mitchellstown', 'Mitchelstown'], ['the Caroline singers', 'the Caroline Singers'],
        ['Countermail Voice Choir Award', 'County Male Voice Choir Award'], ['performs its functions', 'performs at functions'],
        ['Start your own choir.\nAt work.', 'Start your own choir at work.'], ['a big networking opportunities', 'big networking opportunities'],
        ['completely different, that thereafter.', "completely different, that they're after."],
        ['encourage their employees to know what you doing I like to know what you doing.', 'encourage their employees to set up choirs at work because it can help to create a healthier working atmosphere.'],
        ['with just five people that\'s now risen to 19', "with just five people, and that's now risen to 19"],
        ['And for our regular spot', 'Presenter:\nAnd for our regular spot'], ['local choirs.\nThank you.\nWell, feeling', 'local choirs.\nSamuel:\nThank you.\nWell, feeling'],
      ],
      groups: [
        matching('Which choir does each of the following statements apply to?\nWrite the correct letter, A, B or C, next to Questions 11-15.',
          ['Mitchelstown Choir', 'The Blackvale Male Voice Choir', 'The Caroline Singers'], [
            [11, 'They specialise in a particular type of music.', 'C'],
            [12, 'They organise social events.', 'A'],
            [13, 'They have recently won a competition.', 'B'],
            [14, 'They have recently recorded their first CD.', 'A'],
            [15, 'They participate in charity events.', 'B'],
          ], { reuse: true, groupTitle: 'Questions 11-15' }),
        mc('Choose the correct letter, A, B or C.', [
          [16, 'Elizabeth Arnold thinks people join a choir at work because it gives them a chance to', ['have a break from work.', 'improve their singing.', 'make business contacts.'], 'A'],
          [17, 'How does a company benefit from setting up a choir?', ['improved relationships between co-workers', 'less sick leave taken by employees', 'increased commitment to the company'], 'A'],
          [18, 'How many members does the John White choir have?', ['5', '12', '19'], 'C'],
          [19, 'When does the choir have their rehearsals?', ['before work', 'at lunch-time', 'after work'], 'B'],
          [20, 'How does the company support the choir?', ['by providing concert clothes', 'by funding social events', 'by paying for singing classes'], 'C'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi nói về thể loại nhạc của từng dàn hợp xướng.', t: ['Blackvale caters for most musical taste, as it has a hugely varied repertoire, as does Mitchelstown.', 'If you\'re after a more classical feel the Caroline Singers tend to focus on madrigals.'], p: 'Hai dàn kia hát đủ thể loại; Caroline Singers chuyên madrigal → C' },
        12: { v: 'Khi nói về hoạt động giao lưu.', t: ['If you want to meet people who share an interest in music Mitchelstown Choir is a good place to start.', 'Apart from their own performances, they also arrange group visits to see operas and attend music festivals.'], p: 'Mitchelstown tổ chức đi xem opera, lễ hội âm nhạc – hoạt động xã hội → A' },
        13: { v: 'Khi nói về giải thưởng.', t: ['Mitchelstown are hoping to get to the final at the Melody Competition in Atlanta.', 'And Blackvale are the current holders of the County Male Voice Choir Award'], p: 'Mitchelstown mới chỉ hy vọng vào chung kết (bẫy); Blackvale đang giữ giải → B' },
        14: { v: 'Khi nói về đĩa CD.', t: 'Mitchelstown has just joined Blackvale and Caroline Singers as recording artists for their first CD, due in shops in December.', p: 'Hai dàn kia đã thu âm trước; Mitchelstown vừa có đĩa đầu tiên → A' },
        15: { v: 'Khi nói về gây quỹ từ thiện.', t: 'Mitchelstown regularly performs at functions helping the disabled and the elderly, while Blackvale donates a percentage of its profits to certain local charities.', p: 'Theo key của đề: Blackvale góp một phần lợi nhuận cho các tổ chức từ thiện địa phương → B' },
        16: { v: 'Khi Elizabeth Arnold nói lý do mọi người tham gia.', t: ["She said that, while the thought of big networking opportunities might be at the back of some people's mind, it's having the opportunity to switch off and focus on something completely different, that they're after."], p: 'Kết nối công việc chỉ là ý phụ (bẫy C); điều họ muốn là được “switch off” khỏi công việc → A' },
        17: { v: 'Khi nói lợi ích cho công ty.', t: ['Companies like John White encourage their employees to set up choirs at work because it can help to create a healthier working atmosphere.', 'For example, people who previously didn\'t get on can find they have something in common.'], p: 'Những người trước đây không hợp nhau tìm được điểm chung – cải thiện quan hệ đồng nghiệp → A' },
        18: { v: 'Khi nói số thành viên.', t: "They started off four years ago with just five people, and that's now risen to 19 while their average attendance at rehearsals is 12.", p: '5 là lúc mới lập, 12 là số người đi tập trung bình; hiện có 19 thành viên → C' },
        19: { v: 'Khi nói giờ tập.', t: ['At John White, they found the middle of the day works best because not everyone works the same hours.', 'So, scheduling early morning rehearsals can be problematic.'], p: '“The middle of the day” = giờ nghỉ trưa → B' },
        20: { v: 'Khi nói công ty hỗ trợ ra sao.', t: 'Although members pay a joining fee to cover the cost of refreshments at parties and wear special concert shirts, the company organizes regular sessions with a professional vocal coach free of charge to members of the choir.', p: 'Thành viên tự trả tiền tiệc và áo (bẫy A, B); công ty trả tiền huấn luyện viên thanh nhạc → C' },
      },
    },
    {
      part: 3, title: 'Tourism Research', audio: 'listening/test 10/Section 3.mp3', cover: 'tourists survey | mexican folk dance',
      transcript: `
Mike:
Hi, Eva.
Is this a good time for us to look at our research project?
Our tutor told us to keep the focus narrow.
So what about we go for why people choose to go to certain places and attractions and leave the rest out?
Eva:
You're right.
Otherwise, we'll have far too much information to cope with.
OK, so what about the survey?
Mike:
Well, I've looked through the ideas we had for questions for it and I think it's not clear how we use the word area.
Sometimes it seems to mean a place, other times the field of our research, and even tourist attraction, in some cases.
Eva:
Oh, I think that's my fault.
I typed out our notes.
Mike:
Oh, it's probably best to use it for place, in the sense of province or whatever.
Eva:
Yes, I think so.
You know, we decided to concentrate on culture and tourism.
I wonder if we're really saying culture in the same way as most people do because on our list of places to carry out our surveys, I see you've put the Round Music Festival, which is contemporary music.
I thought we were going to be looking at more traditional forms of culture.
Mike:
That would be confirming these old-fashioned ideas that culture has to be something that's at least 100 years old.
Eva:
But that is what most people think.
Mike:
Well, let's not get into an argument about that right now.
Let's think about the number of completed questionnaires we need.
In total, how many questionnaires do you think we have to get?
100?
200?
And over how many different events?
Eva:
Hmm.
Our tutor said we should have at least 200.
Otherwise, the information won't actually mean that much.
And I think it's not practical to try to go to more than about five events.
We've got to get the first draft in by the end of February.
Mike:
And do you think we should interview everybody or just tourists?
Eva:
Hmm, because presumably, there'd be local people, domestic tourists and international tourists at some events.
Mike:
In fact, the more I think about it, the more I think we should just go for the tourists, but from overseas as well as national.
I'm sure we'd be able to provide more interesting results if we did that.
Eva:
Right.
Mike:
There's one thing that worries me, though.
Eva:
What's that?
Mike:
We said it's important to get some background on the people who answer our questions, like, what's their job, what they thought about the event?
But the idea of asking people how old they are?
Eva:
Hmm.
We can just ask them to tick a box with an age in it and tell them they don't have to do it if they don't want to.
We could write in our own estimate when we've finished.
Mike:
Are you sure that would be okay?
Is that OK?
Eva:
Yes, it's not the most crucial piece of information they're giving.
We're going to have a lot of facts and figures to present.
Have you any preference for putting them into a pie chart, a table, or a graph?
Mike:
Tables are easy to do, but I read that most people find pie charts visually stimulating.
I hate reading graphs, because unless they're quite big, you don't get exact figures.
Eva:
Pie chart sounds good.
How are we going to divide up the work?
Mike:
If it's okay with you, I'd like us to meet as often as possible to look at what we've each written up.
But we should do the actual writing on our own.
Eva:
OK.
Would this be a good time to discuss our introduction?
An overview of tourism around the world looking at different tourist attractions in different countries?
Mike:
But there are so many to choose from, though, so let's narrow it down.
Eva:
Absolutely.
I found out that Mexico celebrates the fact that it produces a huge number of varieties of chillies and people flock to this special event to taste dishes using them.
Mike:
A lot of people think of Mexico as being the best place to see fantastic museums.
Eva:
That's true, but let's take a different tack.
What about Greece?
One of the world's most famous countries for tourists.
Mike:
Yes, and I think we should go for the ruins in this case.
The temples and theatres and so on, rather than the food.
Eva:
And for Britain, instead of focusing on the countryside and parks, I'd like to find out more about why people go to see plays and musicals.
Is it because there's such a good choice?
Mike:
Hmm, interesting point.
And for India, instead of concentrating on the temples or the game parks, we could mention all the different folk dances.
Every region has its own, and they don't just perform them at festivals.
They're part of everyday life.
Eva:
Okay, we've got more than enough.
Let's draft the introduction.
`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'Mike suggests they use the word "area" to mean', ['geographical location.', 'tourist site.', 'research field.'], 'A'],
          [22, 'According to Eva, most people believe that culture', ['refers to long-established events and places.', 'includes modern forms of art and entertainment.', 'is becoming less linked to particular regions.'], 'A'],
          [23, 'Why should they carry out about 200 surveys?', ['to provide information about a range of events', 'to be able to meet the deadline', 'to get valid results'], 'C'],
          [24, 'Which groups of people do they decide to interview?', ['domestic tourists and local residents', 'local residents and international tourists', 'international and domestic tourists'], 'C'],
          [25, 'Mike expresses concern at having to ask about', ['the amount of money a person has spent', "a person's age", "a person's occupation"], 'B'],
          [26, 'Which form will their results be presented in?', ['a table', 'a pie chart', 'a graph'], 'B'],
        ], 'Questions 21-26'),
        matching('Which tourist attraction will be highlighted in each of the following countries?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 27-30.',
          ['ancient buildings', 'contemporary art gallery', 'food festival', 'museums displaying traditional objects', 'national parks', 'theatre performances', 'traditional dances'], [
            [27, 'Mexico', 'C'], [28, 'Greece', 'A'], [29, 'Britain', 'F'], [30, 'India', 'G'],
          ], { title: 'Tourist Attractions', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi bàn cách dùng từ “area”.', t: "Oh, it's probably best to use it for place, in the sense of province or whatever.", p: 'Lĩnh vực nghiên cứu và điểm du lịch chỉ là nghĩa đang bị dùng lẫn; Mike đề nghị dùng với nghĩa nơi chốn, vùng → A' },
        22: { v: 'Khi Eva nói về khái niệm văn hoá.', t: ["That would be confirming these old-fashioned ideas that culture has to be something that's at least 100 years old.", 'But that is what most people think.'], p: 'Eva cho rằng đa số nghĩ văn hoá phải lâu đời (ít nhất 100 năm) → A' },
        23: { v: 'Khi bàn số phiếu khảo sát.', t: ['Our tutor said we should have at least 200.', "Otherwise, the information won't actually mean that much."], p: 'Ít hơn 200 phiếu thì thông tin không có ý nghĩa = cần để kết quả đáng tin; hạn nộp tháng Hai là ý khác (bẫy B) → C' },
        24: { v: 'Khi bàn đối tượng phỏng vấn.', t: 'In fact, the more I think about it, the more I think we should just go for the tourists, but from overseas as well as national.', p: 'Chỉ phỏng vấn khách du lịch, cả nước ngoài lẫn trong nước; bỏ người dân địa phương → C' },
        25: { v: 'Khi Mike nói điều làm anh lo.', t: ["There's one thing that worries me, though.", 'But the idea of asking people how old they are?'], p: 'Nghề nghiệp vẫn được coi là quan trọng (loại C); Mike lo việc hỏi tuổi → B' },
        26: { v: 'Khi bàn cách trình bày số liệu.', t: ['Tables are easy to do, but I read that most people find pie charts visually stimulating.', 'Pie chart sounds good.'], p: 'Bảng dễ làm nhưng biểu đồ tròn hấp dẫn hơn, đồ thị khó đọc; cả hai chọn biểu đồ tròn → B' },
        27: { v: 'Phần giới thiệu điểm du lịch: Mexico.', t: ['I found out that Mexico celebrates the fact that it produces a huge number of varieties of chillies and people flock to this special event to taste dishes using them.', "That's true, but let's take a different tack."], p: 'Bảo tàng là ý bị gạt đi (bẫy D); nhấn mạnh lễ hội ẩm thực ớt → C' },
        28: { v: 'Greece.', t: ['Yes, and I think we should go for the ruins in this case.', 'The temples and theatres and so on, rather than the food.'], p: 'Tàn tích đền đài cổ = công trình cổ; không chọn ẩm thực → A' },
        29: { v: 'Britain.', t: "And for Britain, instead of focusing on the countryside and parks, I'd like to find out more about why people go to see plays and musicals.", p: 'Không chọn công viên (bẫy E); nhấn mạnh kịch và nhạc kịch → F' },
        30: { v: 'India.', t: 'And for India, instead of concentrating on the temples or the game parks, we could mention all the different folk dances.', p: 'Không chọn đền hay khu bảo tồn; nhấn mạnh các điệu múa dân gian → G' },
      },
    },
    {
      part: 4, title: 'Working as a Patent Attorney', audio: 'listening/test 10/section 4.mp3', cover: 'patent drawing | lawyer office documents',
      fix: [['as you tend to sit in I not sure if you aware of this but I been working in front of a computer for most of the day.', 'as you tend to sit in front of a computer for most of the day.']],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Working as a Patent Attorney', [
          '<strong>Getting a patent</strong>',
          '• Nowadays most patents are applied for by a __Q31__',
          '• The invention has to be __Q32__ in order to be patented.',
          '• A detailed __Q33__ of the invention is required.',
          '<strong>Requirements</strong>',
          '• Academic qualifications, e.g. chemistry or __Q34__',
          '• People with very good __Q35__',
          '• Knowledge of a different __Q36__ (desirable)',
          '<strong>Advantages of the job</strong>',
          '• Interesting – uses a range of expertise',
          '• Good __Q37__',
          '<strong>Disadvantages of the job</strong>',
          '• Sometimes quite __Q38__',
          '• Location is inflexible',
          '<strong>Possible places of work</strong>',
          '• Large __Q39__ organisations',
          '• Private practices',
          '• __Q40__ departments',
        ], { 31: 'company', 32: 'original', 33: 'description', 34: 'engineering', 35: 'communication skills/communication', 36: 'language', 37: 'salary', 38: 'lonely', 39: 'industrial', 40: 'government' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần xin cấp bằng sáng chế.', t: 'A patent is granted by the government, to inventors, or more usually these days to a company.', p: 'Ngày nay bằng sáng chế thường được cấp cho một công ty → company' },
        32: { v: 'Ngay sau đó.', t: 'The likelihood of getting a patent is dependent on whether the invention is original or not.', p: 'Phát minh phải nguyên bản (original) mới được cấp → original' },
        33: { v: 'Khi nói hồ sơ cần có.', t: 'In order to get the patent, we need to produce a full description of the invention.', p: 'Cần bản mô tả đầy đủ phát minh → description' },
        34: { v: 'Phần yêu cầu, bằng cấp.', t: 'Often people have studied chemistry or, alternatively, engineering.', p: 'Thường học hoá học hoặc kỹ thuật → engineering' },
        35: { v: 'Phần yêu cầu về con người.', t: 'They want employees who have excellent communication skills.', p: 'Cần kỹ năng giao tiếp xuất sắc → communication skills' },
        36: { v: 'Khi nói về ngoại ngữ.', t: "So if you can understand a foreign language, that's a great asset.", p: 'Biết một ngoại ngữ là lợi thế → language' },
        37: { v: 'Phần ưu điểm.', t: 'after that, you can earn a high salary, which compares very well with other similar professions.', p: 'Mất 4–6 năm để đủ tư cách nhưng sau đó lương cao → salary' },
        38: { v: 'Phần nhược điểm.', t: 'It can be rather lonely, as you tend to sit in front of a computer for most of the day.', p: 'Công việc khá cô đơn vì ngồi máy tính cả ngày → lonely' },
        39: { v: 'Phần nơi làm việc.', t: ['Well, many people work in industrial companies.', 'The big ones have their own patent departments.'], p: 'Các công ty công nghiệp lớn có phòng sáng chế riêng → industrial' },
        40: { v: 'Nơi làm việc cuối.', t: "Finally, it's possible to get a job in various government offices.", p: 'Có thể làm ở các văn phòng chính phủ → government' },
      },
    },
  ],
};
