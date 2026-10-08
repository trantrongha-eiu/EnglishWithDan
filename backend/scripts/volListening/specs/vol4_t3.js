// Vol 4 – Test 3 (PDF "listening/test 3/test 3- up.pdf" p1–7; key xlsx sheet Test 3; audio test 3/01 Track 1.mp3, Track 2–4.mp3 —
// Track 4 cut after "half a minute to check" (10-minute silence follows)).
// Transcript: Whisper + Otter (Part N[ Cau …].pdf, P2/P3 split in two PDFs) written out with turns; gaps re-heard with wb.js.
// Source errors fixed: key Q1 "Southeast" → south-west (Whisper, wb.js and Otter all hear "I'm in the south-west");
// key typos Q35 "expectaction", Q39 "eassay writing"; paper typos Q14 "the pubic", Q17–20 option D "in only on".
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 4, test: 3,
  sections: [
    {
      part: 1, title: 'Homecare Cleaning Agency', audio: 'listening/test 3/01 Track 1.mp3', cover: 'house cleaning service | cleaner vacuum living room',
      transcript: `
Agent:
Good morning, Home Care Cleaning Agency.
Rose:
Oh, hello.
I'd like to arrange to have some cleaning done, please.
Agent:
Certainly.
Have you used our services before?
Rose:
No, I haven't.
But a friend of mine has often used your company and suggested I phone you.
Agent:
Oh, that's great.
I'll just take some details from you and then you can let me know exactly what you would like done.
Rose:
OK.
Agent:
First of all, what area are you in?
Rose:
I'm in the south-west.
Agent:
OK.
And are you interested in having a regular cleaner or is this a one-off clean?
Rose:
No.
I'd like to arrange to have someone come in once a week.
Agent:
Right.
Now, let's just get a bit of information about the house.
How many bedrooms does it have?
Rose:
Three.
Agent:
Are they all double bedrooms?
Rose:
Well, one of the bedrooms is quite small, so it's probably really two double rooms.
Agent:
Right.
Rose:
We have the small bedroom set up as an office.
Agent:
OK.
And just a standard kitchen, lounge, dining room and bathroom?
Rose:
Well, actually, we don't have a separate dining room.
It's a kitchen diner.
Then there's the lounge, and as well as that we have a family room.
Oh, and two bathrooms.
Agent:
OK.
That's all I need to know about the house itself.
Now, what we do is we offer a basic cleaning service and then you let us know about anything extra you'd like cleaned.
Rose:
Right.
And what does the basic service include?
Agent:
We clean all the floors and surfaces and do a basic clean in the kitchen and bathroom.
Rose:
OK, that sounds good.
And do you clean windows?
Agent:
Well, I'm afraid we don't do that.
Health and safety regulations.
But we do offer other special services.
We can put clean sheets on the beds, for example.
Rose:
Uh huh.
Agent:
Or we can clean out your fridge.
A lot of people like that done.
Rose:
I'm not so worried about that, but I would like the sheets changed.
Agent:
That's no problem.
We can do that.
What about the carpet?
As well as the standard vacuum, we can shampoo it if you want.
Rose:
Right.
We've got young children, so it gets pretty dirty.
I haven't had it done for six months.
Agent:
It really needs doing more often than that.
You can have it done every month if you like, but three months is what we usually recommend.
Rose:
That sounds good.
The only other thing is the washing.
Do you do laundry work?
Agent:
Yes, we do.
That's no problem.
What exactly would you like done?
Rose:
Well, it's no problem to put a load of washing in the machine.
I can do that, but I would like to have the ironing done.
Agent:
That's fine.
And would you like the washing put away in drawers or wardrobes?
Rose:
No, it's OK.
You can just leave everything out and fold it up.
Agent:
OK, right.
Now, I'll just set up an account for you and I'll take down some of your details.
First of all, what's your full name?
Rose:
It's Rose Kelly.
Agent:
And could I have your home address, please, Mrs Kelly?
Rose:
Yes, it's 48 Amyes Road.
That's A-M-Y-E-S.
And that's in Mount Eden.
Agent:
OK.
Now, what day of the week would you like the property cleaned?
Rose:
It doesn't really matter.
Not Monday, but any other day.
Agent:
OK, let's see.
We have a cleaner in your area later on Thursday, so shall we go for that day?
We could have someone there by about 9.30 in the morning.
Does that suit you?
Rose:
Yes, that's fine.
And do you charge an hourly rate or a total for the whole job?
Agent:
No, we charge by the hour.
It will work out to about $25 per hour.
Rose:
Oh, that's quite reasonable.
I thought it might be closer to $30.
And how long do you expect it to take?
Agent:
Well, you said the house isn't large, so I'd guess no more than three hours at the most.
We can occasionally finish a three-bedroom in two and a half, but that's probably not too realistic.
Rose:
Right, that sounds good.
Agent:
OK, that's lovely.
Thank you very much, and we'll have someone there next week.
Rose:
Thank you.`,
      groups: [
        note('Complete the form below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'HOMECARE CLEANING AGENCY – House Details', [
          'Customer referred by: friend',
          'Location: in the __Q1__',
          'Type of cleaning: regular',
          'Rooms:',
          '• two __Q2__ bedrooms',
          '(third bedroom used as __Q3__)',
          '• kitchen/diner',
          '• __Q4__',
          '• family room',
          '• two bathrooms',
        ], { 1: 'south-west/southwest/south west', 2: 'double', 3: 'an office/office', 4: 'lounge' }, 'Questions 1-4'),
        mc('Choose the correct letter, A, B or C.', [
          [5, 'Which extra service does the agency agree to provide?', ['changing the bed linen', 'washing the windows', 'cleaning the fridge'], 'A'],
          [6, 'What will be cleaned more thoroughly every three months?', ["the children's room", 'the carpet', 'the bathroom'], 'B'],
          [7, 'The woman would like the cleaners to', ['do the washing.', 'iron the clothes.', 'put the clothes away.'], 'B'],
        ], 'Questions 5-7'),
        note('Complete the form below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'HOMECARE CLEANING AGENCY – Customer Details', [
          'Name: Rose Kelly',
          'Address: 48 __Q8__ Road, Mount Eden',
          'Day of job: __Q9__',
          'Time: 9.30 am',
          'Cost per hour: $25',
          'Maximum length of job: __Q10__',
        ], { 8: 'Amyes', 9: 'Thursday', 10: '3 hours/three hours' }, 'Questions 8-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên hỏi khách ở khu vực nào.', t: ['First of all, what area are you in?', "I'm in the south-west."], p: 'Khách ở khu phía tây nam (key gốc ghi “Southeast” là sai so với băng) → south-west' },
        2: { v: 'Khi hỏi về các phòng ngủ.', t: "Well, one of the bedrooms is quite small, so it's probably really two double rooms.", p: 'Ba phòng ngủ nhưng một phòng nhỏ → thực ra là hai phòng đôi → double' },
        3: { v: 'Ngay sau đó, về phòng ngủ thứ ba.', t: 'We have the small bedroom set up as an office.', p: 'Phòng ngủ nhỏ được dùng làm văn phòng → an office' },
        4: { v: 'Khi kể các phòng còn lại.', t: ["Well, actually, we don't have a separate dining room.", "It's a kitchen diner.", "Then there's the lounge, and as well as that we have a family room."], p: 'Không có phòng ăn riêng (bẫy); ngoài bếp kiêm phòng ăn còn có phòng khách → lounge' },
        5: { v: 'Khi nói về dịch vụ thêm.', t: ["Well, I'm afraid we don't do that.", 'We can put clean sheets on the beds, for example.', "I'm not so worried about that, but I would like the sheets changed."], p: 'Không lau cửa sổ (B sai), khách không cần dọn tủ lạnh (C sai); đồng ý thay ga trải giường → A' },
        6: { v: 'Khi nói về thảm.', t: ['As well as the standard vacuum, we can shampoo it if you want.', 'You can have it done every month if you like, but three months is what we usually recommend.'], p: 'Thảm được giặt kỹ (shampoo) ba tháng một lần như đề xuất → B' },
        7: { v: 'Khi nói về giặt giũ.', t: ['Well, it\'s no problem to put a load of washing in the machine.', 'I can do that, but I would like to have the ironing done.'], p: 'Khách tự giặt (A sai), không cần cất quần áo (C sai); muốn được là ủi → B' },
        8: { v: 'Khi khách đọc địa chỉ.', t: ["Yes, it's 48 Amyes Road.", "That's A-M-Y-E-S."], p: 'Tên đường được đánh vần từng chữ → Amyes' },
        9: { v: 'Khi chọn ngày dọn dẹp.', t: ['Not Monday, but any other day.', 'We have a cleaner in your area later on Thursday, so shall we go for that day?', "Yes, that's fine."], p: 'Không phải thứ Hai (bẫy); chốt thứ Năm → Thursday' },
        10: { v: 'Cuối bài, khi hỏi mất bao lâu.', t: ["Well, you said the house isn't large, so I'd guess no more than three hours at the most.", "We can occasionally finish a three-bedroom in two and a half, but that's probably not too realistic."], p: '“No more than three hours at the most” = tối đa 3 giờ; 2,5 giờ là không thực tế (bẫy) → 3 hours' },
      },
    },
    {
      part: 2, title: 'Museum Tour', audio: 'listening/test 3/Track 2.mp3', cover: 'museum gallery tour | museum staircase hall',
      transcript: `
OK.
Well, first of all, I'll give you a bit of background to the museum and then tell you about some of the galleries.
You probably won't have time to see everything today, so what I recommend you do is go to the Egyptian room first, because it's everyone's favourite place and it gets very crowded with the school parties later in the day.
Oh, and I should mention that the photography gallery's undergoing refurbishment at the moment, so while that's definitely worth seeing, it'll have to wait for another time.
Now, the actual museum building itself is quite interesting.
It was designed by a local architect called William Craven in the 19th century, at a time when the city was developing rapidly, with new factories to cope with the expansion of the textile industry.
The museum's built in a very similar style to the railway station, which was constructed at around the same time.
That was designed by another architect, but William Craven did also provide the plans for the town hall, which was built just a few years later.
Construction of the museum began in 1888 with a large team of carpenters, stonemasons and builders.
Then, in recent years, it's been extensively refurbished.
The lovely big windows have been retained to let the daylight flood in, but the award-winning part of the project was the restoration of the area around the Central Hall.
In particular, the beautiful wrought iron staircase, which was brought back to its former glory.
Unfortunately, the museum's original tiled floor had to be replaced with new tiles of a similar design.
It was a very expensive project, and since we don't charge admission fees, we had to find other ways of funding it.
We did get some money from the Department of Culture at national level, but we had even more generous support from companies and industries here in the city, who were our main benefactors.
However, we do also depend on donations from people living in the area for the ongoing maintenance of the building.
So, how will the museum mainly be spending its money in the next five years?
We already work with schools and colleges, helping people get a better understanding of all the creative disciplines.
We consider the most important part of our work the restoration of the valuable historical objects we are lucky enough to have in our possession, and this will continue to be where the most funding is allocated.
Of course, it would be wonderful to purchase new objects for the museum, but we simply don't have the space at the moment.
Well, we do hope you enjoy your day today, but if you would like to learn more about our exhibits on display here, I suggest you come to one of the Saturday morning lectures, which are given every month by one of our team of experts.
Of course, you can pick up leaflets about the exhibits in most of the galleries too, but you'll only get a basic introduction from those.
We're also working to update our website so that it provides more background on the exhibits.
But that's still at the planning stage.
OK, now, let me just tell you a bit about what's on at the moment.
Well, we're very well known for our collection of 18th century paintings, both oils and watercolours.
Some of these are English landscapes and portraits, but we also have paintings by other European artists who were working during this period.
If you're interested in art that's a bit nearer home, the Farnley Collection is a set of drawings by Paul Farnley.
He was born in Ireland, but he came to work here in the city in the early 20th century and then made it his home.
He worked in a factory but spent his spare time drawing the buildings and urban landscape of the city, and his work has now been collected and displayed here.
On a more practical note, we have a display of kitchen appliances which might interest you.
These are the sorts of things you wouldn't normally expect to see in a museum.
There's an electric potato peeler from the 1970s which sold really well at the time, but no one's got one now.
There are lots of other similar appliances, which must have seemed like great ideas at the time, but which never took off.
You might also like to visit the Fashion Gallery.
This is an exhibition which is running for the next few weeks only and shows men's and women's fashion from 1900 to 2000, including some of the famous designers of the time.
OK, so if anyone's got any questions, follow me over...`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'What does the tour guide advise the visitors to do in the museum today?', ['see the most popular exhibits first', 'pay a brief visit to each gallery', 'go to the photography gallery last'], 'A'],
          [12, 'The museum was designed by William Craven, who also designed', ['a textile factory', 'the town hall', 'the railway station'], 'B'],
          [13, 'The museum won an award for the preservation of the', ['staircase', 'floor', 'windows'], 'A'],
          [14, 'Most of the money for the project came from', ['the public', 'the government', 'local businesses'], 'C'],
          [15, 'Over the next five years, the museum will invest mainly in', ['restoring existing collections.', 'developing educational programmes.', 'purchasing new objects for display.'], 'A'],
          [16, 'Visitors who are interested in learning more about the exhibits should', ["visit the museum's website", 'read the leaflets on display', 'attend the monthly lectures'], 'C'],
        ], 'Questions 11-16'),
        matching('What information does the guide give about each of the following collections?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 17-20.',
          ['has been shown in different museums', 'consists of work by a local resident', 'has exhibits from various countries', 'is only on temporary display', 'shows things that are no longer common', 'is on loan from a foreign museum'], [
            [17, '18th-century paintings', 'C'],
            [18, 'Farnley collection', 'B'],
            [19, 'kitchen appliances', 'E'],
            [20, 'fashion gallery', 'D'],
          ], { title: 'Information', groupTitle: 'Questions 17-20' }),
      ],
      expl: {
        11: { v: 'Đầu bài, lời khuyên của hướng dẫn viên.', t: "You probably won't have time to see everything today, so what I recommend you do is go to the Egyptian room first, because it's everyone's favourite place and it gets very crowded with the school parties later in the day.", p: 'Không đủ thời gian xem hết (B sai), phòng ảnh đang sửa (C sai); nên xem phòng Ai Cập (nơi ai cũng thích) trước → A' },
        12: { v: 'Khi nói về kiến trúc sư William Craven.', t: ["That was designed by another architect, but William Craven did also provide the plans for the town hall, which was built just a few years later."], p: 'Nhà ga do kiến trúc sư khác thiết kế (bẫy C); Craven còn thiết kế toà thị chính → B' },
        13: { v: 'Khi nói về dự án tu sửa.', t: ['but the award-winning part of the project was the restoration of the area around the Central Hall.', 'In particular, the beautiful wrought iron staircase, which was brought back to its former glory.'], p: 'Cửa sổ chỉ được giữ lại, sàn phải thay mới; phần đoạt giải là cầu thang sắt rèn được phục hồi → A' },
        14: { v: 'Khi nói về nguồn tiền cho dự án.', t: 'We did get some money from the Department of Culture at national level, but we had even more generous support from companies and industries here in the city, who were our main benefactors.', p: 'Chính phủ chỉ góp một phần; nhà tài trợ chính là các công ty địa phương; người dân chỉ góp cho bảo trì → C' },
        15: { v: 'Khi nói về chi tiêu trong 5 năm tới.', t: ['We consider the most important part of our work the restoration of the valuable historical objects we are lucky enough to have in our possession, and this will continue to be where the most funding is allocated.'], p: 'Giáo dục là việc đã làm (bẫy B), không có chỗ cho hiện vật mới (C sai); phần lớn kinh phí dành cho phục chế hiện vật sẵn có → A' },
        16: { v: 'Khi gợi ý cách tìm hiểu thêm về hiện vật.', t: 'I suggest you come to one of the Saturday morning lectures, which are given every month by one of our team of experts.', p: 'Tờ rơi chỉ giới thiệu cơ bản, website còn đang lên kế hoạch; nên dự buổi giảng hằng tháng → C' },
        17: { v: 'Khi giới thiệu bộ sưu tập tranh thế kỷ 18.', t: 'Some of these are English landscapes and portraits, but we also have paintings by other European artists who were working during this period.', p: 'Có tranh Anh và tranh của các họa sĩ châu Âu khác → hiện vật từ nhiều nước → C' },
        18: { v: 'Khi nói về bộ sưu tập Farnley.', t: ['He was born in Ireland, but he came to work here in the city in the early 20th century and then made it his home.'], p: 'Paul Farnley sinh ở Ireland nhưng định cư ở thành phố này → tác phẩm của một cư dân địa phương → B' },
        19: { v: 'Khi nói về đồ dùng nhà bếp.', t: ["There's an electric potato peeler from the 1970s which sold really well at the time, but no one's got one now."], p: 'Máy gọt khoai từng bán chạy nhưng nay không ai dùng → những thứ không còn phổ biến → E' },
        20: { v: 'Cuối bài, phòng thời trang.', t: 'This is an exhibition which is running for the next few weeks only', p: 'Triển lãm chỉ diễn ra vài tuần → trưng bày tạm thời → D' },
      },
    },
    {
      part: 3, title: 'Business Analysis Tools', audio: 'listening/test 3/Track 3.mp3', cover: 'business analysis meeting | SWOT analysis whiteboard',
      transcript: `
Tutor:
Hi, Frances.
Sam.
So, how did you go with applying the different theoretical business tools for the report I asked you to write?
Frances:
It was interesting and made us really focus on which tool was best to use when analysing a business.
Tutor:
Good.
So, tell me what you found out.
Sam:
We liked the theory behind PEST analysis.
That's political, economic, social and technological, although we're not sure if it was very applicable to our case.
Frances:
Some of the other groups had studies for which it worked really well and they said it was easy to use, but I felt it focused too much on the big picture and was unsuitable for our company.
Sam:
I agree.
On the other hand, I enjoyed using the drill-down method.
It was painstaking to do, and we seemed to be working on it for ages.
But the results were worth waiting for.
Tutor:
Yes, I liked the way it eventually broke down complex problems.
Frances:
Yes, I much preferred doing the PMI analysis.
It was so straightforward to break down into its three components: plus, minus and interesting implications.
You just needed to brainstorm these components and then write them up, fast and effective, and it didn't make your brain hurt doing it.
Sam:
I agree, and you don't need any special training at all.
Anyone can use it.
Tutor:
Hmm.
So, was there any tool that you thought was superior to the others?
Frances:
In my opinion, the one tool that is critical to business, especially for larger companies, is Pareto analysis.
If they apply Pareto analysis, they would see that by focusing on the critical 20% of their problems, they could generate 80% of the benefits.
This would allow them to work faster, and it also reduces their workload.
It's all about finding out what their basic problems are.
Sam:
I agree with Frances about Pareto, but my favourite was the SWOT analysis.
You know, looking at the company's strengths, weaknesses, opportunities and threats, as it can be used in so many different situations.
It works in large and small companies, and even down to departmental level.
It was great for our case study.
Tutor:
Yes, that's true.
OK, I've read your draft report, but can you tell me a bit more about that company you focused on?
Sam:
Well, the company we used in our study was a manufacturing company who have relied on distributors to take their product to the end user.
We did some analysis examining the possibility of them distributing their own products.
Frances:
We initially looked at their strengths.
The company, although it is small, is well known and has a very good reputation.
The management are very committed to increasing the company profits, and they are confident this move would be successful.
Tutor:
Right.
Frances:
And the company has quite a lot of staff who have previously worked for distribution companies, so the knowledge is already there.
That was something we didn't expect to find and is probably going to help them the most to achieve their goals.
Tutor:
I was quite impressed by some of the opportunities you detailed.
I did think you missed something quite pertinent to their future growth, however.
Sam:
What was that?
Tutor:
You didn't consider the potential for establishing an offshore division.
You talked about the company negotiating better terms with its suppliers.
Most of these are based abroad, and so if the company had a way of actually distributing the product there, this could be a tremendous opportunity and give them an edge over their competitors.
Sam:
That's a good point.
So what did you think about the threats we identified?
Tutor:
I thought you did a good job.
I was really pleased to see that you considered how the government's planned environmental policy could really affect the viability of this venture.
With this law being introduced next year, they might need to find new ways of using their existing technology.
It's easy to identify what your competitors are doing, but it's the bigger picture that often gets ignored.
So, Sam, what did you learn from this assignment?
Sam:
Heaps.
I guess I hadn't realised how much time it takes to ensure your company survives and profits.
It was great to study the different tools in books, but applying them in the real world was much harder than I thought.
It was a great learning experience.
Tutor:
I'm glad I could make your assignment relevant.
I'm basically happy with your report.
You've got the format correct, with the necessary headings, etc., and you've got sufficient details under the different headings.
Just remember to state whether or not you think the company should go ahead with a new venture.
But you've done a good job so far.`,
      groups: [
        matching('What are the characteristics of the following analysis methods?\nChoose FIVE answers from the box and write the correct letter, A-G, next to Questions 21-25.',
          ['it will save a lot of business time and effort', 'it is visualised', 'it does not fit our company', 'it will take too long', 'it is easy to use', 'it is difficult to apply', 'it is suitable for almost all sized companies'], [
            [21, 'PEST', 'C'],
            [22, 'Drill Down', 'D'],
            [23, 'PMI', 'E'],
            [24, 'Pareto', 'A'],
            [25, 'SWOT', 'G'],
          ], { title: 'Characteristics', groupTitle: 'Questions 21-25' }),
        mc('Choose the correct letter, A, B or C.', [
          [26, 'What does Frances consider as the best strength of the company?', ['reputation', 'experienced employees', 'management'], 'B'],
          [27, 'What factor did Sam overlook for the future growth of the company?', ['seek cheaper suppliers', 'set up an overseas office', 'compete with major competitors'], 'B'],
          [28, 'Which of the following can be the threat to a company?', ['increasing competition', 'outdated technology', 'new legislation'], 'C'],
          [29, 'What has Sam learned from the research?', ['using better tools', 'cost of a successful business', 'gap between reality and theory'], 'C'],
          [30, "What is the professor's suggestion for the report?", ['give a final determination', 'reorganise a clear structure', 'add more detailed information'], 'A'],
        ], 'Questions 26-30'),
      ],
      expl: {
        21: { v: 'Khi nói về phương pháp PEST.', t: "Some of the other groups had studies for which it worked really well and they said it was easy to use, but I felt it focused too much on the big picture and was unsuitable for our company.", p: '“Dễ dùng” là nhận xét của nhóm khác (bẫy E); với nhóm này PEST không phù hợp với công ty → C' },
        22: { v: 'Khi Sam nói về phương pháp drill-down.', t: ['It was painstaking to do, and we seemed to be working on it for ages.'], p: 'Làm rất vất vả, mất rất nhiều thời gian → D' },
        23: { v: 'Khi Frances nói về PMI.', t: ["It was so straightforward to break down into its three components: plus, minus and interesting implications.", "I agree, and you don't need any special training at all.", 'Anyone can use it.'], p: 'Rất đơn giản, không cần đào tạo, ai cũng dùng được → dễ sử dụng → E' },
        24: { v: 'Khi Frances nói về Pareto.', t: ['This would allow them to work faster, and it also reduces their workload.'], p: 'Làm nhanh hơn và giảm khối lượng công việc = tiết kiệm thời gian, công sức → A' },
        25: { v: 'Khi Sam nói về SWOT.', t: ['It works in large and small companies, and even down to departmental level.'], p: 'Dùng được cho công ty lớn, nhỏ, thậm chí cấp phòng ban → phù hợp mọi quy mô → G' },
        26: { v: 'Khi Frances nói về điểm mạnh của công ty.', t: ["And the company has quite a lot of staff who have previously worked for distribution companies, so the knowledge is already there.", "That was something we didn't expect to find and is probably going to help them the most to achieve their goals."], p: 'Uy tín và ban quản lý chỉ là điểm mạnh được kể trước; điều giúp ích nhiều nhất là đội ngũ nhân viên có kinh nghiệm phân phối → B' },
        27: { v: 'Khi giáo sư chỉ ra điều nhóm bỏ sót.', t: ['You didn\'t consider the potential for establishing an offshore division.'], p: '“Establishing an offshore division” = lập văn phòng ở nước ngoài; đàm phán với nhà cung cấp là việc nhóm đã viết → B' },
        28: { v: 'Khi nói về các mối đe doạ.', t: ["I was really pleased to see that you considered how the government's planned environmental policy could really affect the viability of this venture.", 'With this law being introduced next year, they might need to find new ways of using their existing technology.'], p: 'Chính sách môi trường/luật mới sắp áp dụng là mối đe doạ; công nghệ hiện có chỉ cần dùng theo cách mới (B sai) → C' },
        29: { v: 'Khi giáo sư hỏi Sam học được gì.', t: 'It was great to study the different tools in books, but applying them in the real world was much harder than I thought.', p: 'Lý thuyết trong sách khác xa áp dụng thực tế → khoảng cách giữa thực tế và lý thuyết → C' },
        30: { v: 'Cuối bài, góp ý của giáo sư.', t: ["You've got the format correct, with the necessary headings, etc., and you've got sufficient details under the different headings.", 'Just remember to state whether or not you think the company should go ahead with a new venture.'], p: 'Bố cục và chi tiết đã đủ (B, C sai); cần nêu kết luận công ty có nên thực hiện hay không → A' },
      },
    },
    {
      part: 4, title: 'Employment Survey on Graduates', audio: 'listening/test 3/Track 4.mp3', clip: [0, 268], cover: 'university graduates | graduation ceremony job',
      transcript: `
I'd like to give you a brief overview of a research project I've been working on as part of a team of four.
We wanted to get some data on what happens to students after they graduate and also find out how useful they felt their degree course was to them.
We focused on graduates from the course in Business Management, since this is one of the most popular and long-established courses.
We decided to use two different data-gathering methods.
We started off by emailing a brief questionnaire to all last year's graduates from that course, and then we selected a number of those who had replied, and with them we carried out phone interviews.
We'd originally intended to use face-to-face interviews, but didn't feel that would be practical.
And, in fact, we found this method provided a combination of wide coverage and depth, which is what we wanted.
So, what did we find?
Well, I suppose our most surprising finding was just how many graduates had gone on to work towards an additional qualification, rather than getting a job immediately.
That was 32%, almost a third.
Of the rest, a very small proportion were unemployed, just 4%, and all the rest were in employment.
More than half of them were in the public sector, with a sizeable minority in the private sector, and a small number in the not-for-profit sector.
We were also interested in the attitudes of those who were employed towards their work.
The majority said that their expectations had been fulfilled.
They were generally satisfied in terms of their salary and also happy with their prospects for career development, with very few of them feeling that they were in a dead-end job with no prospects of promotion.
For the second main part of our research, we wanted to get some feedback from the graduates on how useful they felt their degree course had been to them.
There were really three main skills which the graduates felt they'd gained from doing the course, and identified as having been the most valuable to them.
They highlighted the fact that they developed the ability to work as members of a team.
Another skill which they cited as valuable was that of personal organisation, things like meeting deadlines, time management and so on.
And finally, a lot of them said that what they'd learned about approaches to problem solving had been very useful.
We also asked them about which elements of the course had been least valuable to them.
To our surprise, the thing that was mentioned most often here was presentations.
They hadn't enjoyed having to give these as part of their course, nor had they found it useful having to listen to those given by their fellow students.
The reason given for this was that they felt they weren't trained how to do it properly.
And the second thing that got very negative feedback was work on essay writing.
Most people thought this was unnecessary and that it would have been better to work on report writing.
And finally, some respondents said that they would have liked more guidance on the best way to go about looking for a job, that the course could have done more to help them.
Finally, we asked if there were any skills...`,
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Employment Survey on Graduates', [
          '<strong>Overview</strong>',
          '- interviews from which subject: __Q31__',
          '- two research methods: email questionnaires and __Q32__',
          '<strong>Findings</strong>',
          '- 32% of students tended to acquire another __Q33__',
          '- only 4% were unemployed',
          '- most of the students work in the __Q34__ sector',
          '- majority are happy with: __Q35__',
          '<strong>Feedback</strong>',
          'Useful skills learned in college:',
          '- working as a __Q36__ member',
          '- personal organisation',
          '- __Q37__ ability',
          'Useless skills:',
          '- __Q38__ (lack of training)',
          '- advice on __Q39__ (unnecessary)',
          '- advice on finding a __Q40__ (not enough)',
        ], { 31: 'business management', 32: 'phone interviews/telephone interviews', 33: 'qualification', 34: 'public', 35: 'expectations', 36: 'team', 37: 'problem-solving/problem solving', 38: 'presentation/presentations', 39: 'essay writing', 40: 'job' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi giới thiệu nhóm sinh viên được khảo sát.', t: 'We focused on graduates from the course in Business Management, since this is one of the most popular and long-established courses.', p: 'Khảo sát sinh viên tốt nghiệp ngành Quản trị kinh doanh → business management' },
        32: { v: 'Khi nói về hai phương pháp thu thập dữ liệu.', t: ["We started off by emailing a brief questionnaire to all last year's graduates from that course, and then we selected a number of those who had replied, and with them we carried out phone interviews.", "We'd originally intended to use face-to-face interviews, but didn't feel that would be practical."], p: 'Phỏng vấn trực tiếp chỉ là dự định ban đầu (bẫy); phương pháp thứ hai là phỏng vấn qua điện thoại → phone interviews' },
        33: { v: 'Phát hiện bất ngờ nhất.', t: ['Well, I suppose our most surprising finding was just how many graduates had gone on to work towards an additional qualification, rather than getting a job immediately.', "That was 32%, almost a third."], p: '32% học tiếp để lấy thêm một bằng cấp → qualification' },
        34: { v: 'Khi nói về khu vực việc làm.', t: 'More than half of them were in the public sector, with a sizeable minority in the private sector, and a small number in the not-for-profit sector.', p: 'Hơn một nửa làm cho khu vực công; tư nhân chỉ là thiểu số → public' },
        35: { v: 'Khi nói về thái độ với công việc.', t: 'The majority said that their expectations had been fulfilled.', p: '“The majority” khớp với đề; đa số cho biết kỳ vọng của họ đã được đáp ứng → expectations' },
        36: { v: 'Kỹ năng hữu ích thứ nhất.', t: 'They highlighted the fact that they developed the ability to work as members of a team.', p: '“Work as members of a team” = working as a team member → team' },
        37: { v: 'Kỹ năng hữu ích thứ ba.', t: "And finally, a lot of them said that what they'd learned about approaches to problem solving had been very useful.", p: 'Sau kỹ năng tổ chức cá nhân là cách giải quyết vấn đề → problem-solving' },
        38: { v: 'Khi nói về phần ít giá trị nhất.', t: ['To our surprise, the thing that was mentioned most often here was presentations.', "The reason given for this was that they felt they weren't trained how to do it properly."], p: 'Thuyết trình bị chê vì không được đào tạo cách làm (lack of training) → presentations' },
        39: { v: 'Phần bị phản hồi tiêu cực thứ hai.', t: ['And the second thing that got very negative feedback was work on essay writing.', 'Most people thought this was unnecessary and that it would have been better to work on report writing.'], p: 'Viết luận bị cho là không cần thiết; viết báo cáo là điều họ muốn học hơn (bẫy) → essay writing' },
        40: { v: 'Cuối bài.', t: 'And finally, some respondents said that they would have liked more guidance on the best way to go about looking for a job, that the course could have done more to help them.', p: 'Muốn được hướng dẫn nhiều hơn về cách tìm việc → chưa đủ → job' },
      },
    },
  ],
};
