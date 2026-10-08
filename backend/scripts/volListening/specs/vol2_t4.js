// Vol 2 – Test 4 (PDF "listening/test 4/Test 4.pdf" p1–7, key p8 — the PDF's own heading says "TEST 1"; audio test 4/Part 1–4.mp3)
// Transcripts: Whisper + Otter merge; P1 written out from Whisper (+ wb.js for the passage Whisper dropped) — the
// folder's "p1.pdf" is Test 3's Part 1 (International Club), not this recording.
// Source notes: Q1 key "swimming pool" breaks ONE WORD → "pool" accepted too. Q5–7 instruction said "NO MORE THAN
// THREE WORDS AND" (→ "THREE WORDS AND/OR A NUMBER"). Q19 was printed "9". Q8–10 options had "histoty".
const { note, table, mc, matching, short } = require('../vol_build');

module.exports = {
  vol: 2, test: 4,
  sections: [
    {
      part: 1, title: 'Apartments in Arillas', audio: 'listening/test 4/Part 1.mp3', cover: 'Corfu apartments | greek island holiday',
      transcript: `
Receptionist:
Greek Island Holidays.
Can I help you?
Tourist:
Yes, I hope so.
I have a friend who's just come back from Corfu, and she's recommended some apartments in Arillas.
She thought they might be on your list.
Receptionist:
Arillas.
Um, let me check.
Can you give me the names?
Tourist:
Yes.
The first is Rose Garden Apartments.
Could you tell me a little bit of information about the apartments, its features and prices, for instance?
Receptionist:
Well, at Rose Garden they have a huge parking lot, and it is free parking.
So it can be very convenient for some big families who drive there to spend holidays.
Tourist:
Oh, that's great.
Our whole family will be going.
Receptionist:
And there's a big swimming pool inside which can accommodate over 50 people.
We are thinking of replacing it into an aquarium, but it's still in discussion.
Tourist:
That sounds exciting.
What about the cost?
Receptionist:
$219.
Tourist:
That seems reasonable.
I'm just jotting down some notes.
Now the second one my friend mentioned was called Blue Bay.
Receptionist:
Blue Bay?
Oh yes, in fact that's very popular and it has some special features.
Tourist:
Really?
Receptionist:
The main attraction is the large man-made lake, and it's only around a kilometre from some shops.
Tourist:
Is it much more expensive than the first one?
Receptionist:
Actually, it's $50 cheaper than the first one.
That's mainly because they don't have a parking lot there.
Moreover, we plan to install a lift, but we are currently short of funds, so we don't have it at the moment, and this apartment isn't really suitable for those with disabilities.
Tourist:
Right.
Now there are just two more apartments on the list.
The third one is Sunshade Apartments.
Receptionist:
This one is on top of a hill with a huge parking lot.
Each room used to have a nice kitchen, but we have turned it into a beautiful garden since our customers don't cook much and they have shared barbecue facilities.
Tourist:
Sounds great.
Receptionist:
Yes, it is well equipped.
Tourist:
How much does it cost?
Receptionist:
$490.
Tourist:
I don't think that would be within our budget, unfortunately.
And the last one sounds a bit expensive too.
The Grand Apartments.
Receptionist:
That one is quite reasonable.
There's no parking lot, but parking on the street requires no charge.
Many teenagers and businessmen have come here to spend their summer holiday.
But children make the biggest part of our customers.
There is a huge painting room for them.
Tourist:
Sounds lovely.
Okay, I will think about which one to book with my family.
Receptionist:
That's fine.
We've got plenty of apartments here when you come.
Is there anything else you need to know about accommodation?
Tourist:
Oh, actually, could you tell me some more details about Arillas in general?
Receptionist:
Sure.
What would you like to know?
Tourist:
Well, my friend told me that Arillas was pretty, but I don't know what the best way is to see the town.
Receptionist:
Well, if you want to enjoy the scenery, then the Blue City Bus is recommended.
Just a second while I check.
Ah, that one is a business route, mainly for commuters.
The green one is a double-decker which offers a nicer view.
Tourist:
I also heard that the Ferry Boat Trip is quite popular.
Receptionist:
Yes, if you want to immerse yourself in the magnificent sea views, then the ferry boat trip is a must.
The trip used to last 35 minutes, but we made it a little bit longer to 50 minutes, in response to our customers' demands.
A 30-minute seafood dinner is included in this trip.
Tourist:
Okay, and one more question.
I like riding bikes.
Can I rent a bike and cycle around the town?
Receptionist:
Of course.
There is a mall on Main Street and a bike hire is located behind it.
Tourist:
OK, I have made a note of that.
Receptionist:
Furthermore, I'd like to suggest three famous museums from which you can learn native history and culture.
Tourist:
That sounds fun.
Receptionist:
Okay, the first one has an exhibition of the interior design, as well as some famous paintings and sculptures.
Some of the paintings are donated by some well-known scientists.
Tourist:
That's great.
Receptionist:
Yeah, the second one is about something that is familiar to us, but actually most people don't know much about it, which is fizzy drinks or soda.
The visitors will be shown the history of some famous products in this industry and how they are produced.
It's interesting to know that some products have been taken to space before.
Tourist:
Wow, I would like to go there.
Receptionist:
Yes, you should.
And the last one is about some special phenomena outside the planet where we live.
Some experts are there to unveil the mystery if the visitors have any questions.
Various machines and equipment are displayed inside.
You can't miss it.
Are there any more questions for now?
Tourist:
No, that is all.
Receptionist:
I hope you have a happy journey.
Tourist:
Thank you.
`,
      groups: [
        table('Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', ['Apartments', 'Parking', 'Additional information'], [
          ['Rose Garden Apartments', 'Example: free parking lot', 'a large __Q1__'],
          ['Blue Bay', 'no parking lot', 'man-made lake, no __Q2__'],
          ['Sunshade Apartments', 'huge parking lot', 'No __Q3__ in the room'],
          ['Grand Apartments', 'no charge on street', 'most guests are __Q4__'],
        ], { 1: 'swimming pool/pool', 2: 'lift', 3: 'kitchen', 4: 'children' }, 'Questions 1-4'),
        short('Answer the questions below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', [
          [5, 'What colour is the bus that the woman should take?', 'green'],
          [6, 'How long is the ferry boat trip?', '50 minutes/fifty minutes'],
          [7, 'Where is the bike hire?', 'behind the mall/behind a mall'],
        ], 'Questions 5-7'),
        matching('What is the theme of each of the following museums?\nWrite the correct letter, A-E, next to Questions 8-10.',
          ['Earth science', 'Astronomy science', 'Modern industrial history', 'Decoration and art', 'Soft drink manufacturing'], [
            [8, 'Museum 1', 'D'], [9, 'Museum 2', 'E'], [10, 'Museum 3', 'B'],
          ], { groupTitle: 'Questions 8-10' }),
      ],
      expl: {
        1: { v: 'Khi nói về căn hộ Rose Garden.', t: ['And there\'s a big swimming pool inside which can accommodate over 50 people.', "We are thinking of replacing it into an aquarium, but it's still in discussion."], p: 'Bể cá chỉ là dự định (bẫy); hiện có một hồ bơi lớn → swimming pool (đề giới hạn một từ: pool)' },
        2: { v: 'Khi nói về căn hộ Blue Bay.', t: 'Moreover, we plan to install a lift, but we are currently short of funds, so we don\'t have it at the moment', p: 'Định lắp thang máy nhưng thiếu tiền nên hiện chưa có → lift' },
        3: { v: 'Khi nói về căn hộ Sunshade.', t: 'Each room used to have a nice kitchen, but we have turned it into a beautiful garden since our customers don\'t cook much', p: 'Bếp trong phòng đã bị chuyển thành vườn → không còn bếp → kitchen' },
        4: { v: 'Khi nói về căn hộ Grand.', t: ['Many teenagers and businessmen have come here to spend their summer holiday.', 'But children make the biggest part of our customers.'], p: 'Thanh thiếu niên và doanh nhân là bẫy; trẻ em chiếm phần lớn khách → children' },
        5: { v: 'Khi hỏi cách ngắm cảnh thị trấn.', t: ['Ah, that one is a business route, mainly for commuters.', 'The green one is a double-decker which offers a nicer view.'], p: 'Xe buýt xanh dương là tuyến cho người đi làm (bẫy); xe xanh lá hai tầng ngắm cảnh đẹp hơn → green' },
        6: { v: 'Khi hỏi về chuyến phà.', t: "The trip used to last 35 minutes, but we made it a little bit longer to 50 minutes, in response to our customers' demands.", p: '35 phút là thời gian cũ, 30 phút là bữa tối (bẫy); hiện là 50 phút → 50 minutes' },
        7: { v: 'Khi hỏi thuê xe đạp.', t: 'There is a mall on Main Street and a bike hire is located behind it.', p: 'Chỗ thuê xe nằm phía sau trung tâm thương mại → behind the mall' },
        8: { v: 'Khi giới thiệu bảo tàng thứ nhất.', t: 'Okay, the first one has an exhibition of the interior design, as well as some famous paintings and sculptures.', p: 'Thiết kế nội thất, tranh và tượng = trang trí và nghệ thuật; “scientists” chỉ là người tặng tranh (bẫy) → D' },
        9: { v: 'Bảo tàng thứ hai.', t: ['which is fizzy drinks or soda.', 'The visitors will be shown the history of some famous products in this industry and how they are produced.'], p: 'Nước có ga – lịch sử và cách sản xuất = sản xuất nước ngọt → E' },
        10: { v: 'Bảo tàng thứ ba.', t: 'And the last one is about some special phenomena outside the planet where we live.', p: 'Hiện tượng bên ngoài hành tinh = thiên văn học → B' },
      },
    },
    {
      part: 2, title: 'Aspen Ski Resort', audio: 'listening/test 4/Part 2.mp3', cover: 'ski resort slopes | skiers mountain',
      fix: [
        ['playing Driving golf', 'playing golf'], ['downhill skiing.\nThe first British', 'downhill skiing, the first British'],
        ['visit the.\nGreat Waters Brewing.\nBut it is under', 'visit the Great Waters Brewing Company, but it is under'],
        ['Edinburgh region', 'Edimore region'], ['The Edinburgh Nature Museum', 'The Edimore Nature Museum'],
        ["at 7pm.\nOn.\nMay the 18th in the Resorts Conference", "at 7pm on May the 18th in the Resort's Conference"],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, "What is the speaker's profession?", ['a travel agent', 'an actor', 'a journalist'], 'B'],
          [12, 'Why does he love travelling?', ['He watched documentaries as a child.', "He is influenced by his parents' passion.", 'His parents are geographers.'], 'B'],
          [13, 'When was the first British ski resort established?', ['1920s', '1930s', '1960s'], 'C'],
          [14, 'Which activity is offered by a school in the other town?', ['skydiving', 'playing golf', 'visiting a brewery'], 'A'],
          [15, 'What does the speaker recommend in Edimore region?', ['a hot spring', 'a museum', 'a local market'], 'B'],
          [16, 'What program will be available soon?', ['Landscape of UK', 'Mountain Walking in Europe', 'Wildlife around the World'], 'A'],
        ], 'Questions 11-16'),
        matching('Which feature does each of the following skiing locations have?\nWrite the correct letter, A-G, next to Questions 17-20.',
          ['A well-known ski school', 'Suitable for beginners', 'Olympic champion training location', 'Would-be Olympic rink', 'Good ski facilities', 'Popular for many years', 'Childcare provided'], [
            [17, 'Lakeside', 'F'], [18, 'Petersburg', 'C'], [19, 'Winterton', 'B'], [20, 'Al Slopes', 'G'],
          ], { title: 'Features', groupTitle: 'Questions 17-20' }),
      ],
      expl: {
        11: { v: 'Đầu bài, người nói tự giới thiệu.', t: ['I first discovered this fantastic resort when it was recommended to me by a journalist who was interviewing me.', "Now, when I don't have acting jobs to do, I would come here and relax."], p: 'Nhà báo và đại lý du lịch là người khác (bẫy); “acting jobs” cho thấy anh là diễn viên → B' },
        12: { v: 'Khi nói vì sao yêu du lịch.', t: 'Their passion kept affecting me, and eventually, I realised that travelling has been something I love for a long time.', p: 'Bố mẹ là nhà địa lý và xem phim tài liệu chỉ là bối cảnh; lý do là niềm đam mê của bố mẹ ảnh hưởng đến anh → B' },
        13: { v: 'Phần lịch sử khu nghỉ dưỡng.', t: ['In the 1960s, with the increasing popularity of downhill skiing, the first British ski resort appeared.'], p: '1920s, 1930s là thời kỳ nghỉ hè (bẫy); khu trượt tuyết đầu tiên của Anh xuất hiện vào thập niên 1960 → C' },
        14: { v: 'Khi nói về các hoạt động khác.', t: 'Also, many of our visitors take advantage of skydiving activities offered by a skydiving school, but the school is located in another town', p: 'Trường nhảy dù nằm ở thị trấn khác; golf và nhà máy bia ở gần khu nghỉ (bẫy) → A' },
        15: { v: 'Khi nói về vùng Edimore.', t: ['However, the price of having a hot spa there is quite high this season.', 'The Edimore Nature Museum is a great alternative.'], p: 'Suối nước nóng đắt, chợ đóng cửa tuần này; người nói giới thiệu bảo tàng thiên nhiên → B' },
        16: { v: 'Khi nói về chương trình giải trí hằng tháng.', t: ['Previous programmes have featured mountain walking in Europe and wildlife around the world.', "The upcoming entertainment programme, which will take place at 7pm on May the 18th in the Resort's Conference Centre, will be about the landscape of the United Kingdom."], p: 'Leo núi châu Âu và động vật hoang dã là chương trình cũ (bẫy); sắp tới là cảnh quan Vương quốc Anh → A' },
        17: { v: 'Phần các khu trượt tuyết khác.', t: ['Lakeside is the oldest of the area resorts.', 'Its popularity barely decreases over the years, and it was recently renovated.'], p: 'Trường trượt tuyết mới mở chưa nổi tiếng (bẫy A); Lakeside được ưa chuộng nhiều năm → F' },
        18: { v: 'Khu Petersburg.', t: ['Petersburg is well known as a training site for skiing teams.', "It's the home training base for Olympic champion Billy Randolph."], p: 'Nơi tập luyện của nhà vô địch Olympic → C' },
        19: { v: 'Khu Winterton.', t: 'Winterton is a resort that is well known as a place for inexperienced skiers.', p: '“Inexperienced skiers” = người mới bắt đầu; không cần thiết bị tốt (loại E) → B' },
        20: { v: 'Khu Al Slopes.', t: "They have a certified staff that will care for your kids while you're on the slopes.", p: 'Có nhân viên trông trẻ trong khi bố mẹ trượt tuyết → G' },
      },
    },
    {
      part: 3, title: 'Nursing Programme Feedback', audio: 'listening/test 4/Part 3.mp3', cover: 'nursing students classroom | nurse training',
      speakers: { 1: 'Helen', 2: 'Tutor', 3: 'Paul' },
      fix: [
        ['Helen:\nHelen and, Paul,\nTutor:\nCongratulations to you both for doing so well, the past semester.', 'Tutor:\nHelen and Paul, congratulations to you both for doing so well the past semester.'],
        ['What about\nTutor:\nYou, Paul.\nWhat do you think of the programme.', 'Tutor:\nWhat about you, Paul?\nWhat do you think of the programme?'],
        ['group projects, prepare', 'group projects prepare'], ["I've thus manage", "I've thus managed"],
        ['How do you feel about that?\nAt first,\nHelen:\nWe felt', 'How do you feel about that?\nHelen:\nAt first, we felt'],
        ["Well, that's 1\nHelen:\nTrue.", "Helen:\nWell, that's true."], ['I I have poor memory', 'I have a poor memory'],
        ["That's true?", "That's true."], ["trying to get straight.\nA's on my transcript.\nI made I've read tons of notes", "trying to get straight A's on my transcript.\nI made tons of notes"],
        ['I stress myself out', 'I stressed myself out'],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'How old are the students of the nursing program?', ['They are teenagers.', 'They are in their twenties.', 'They belong to different age groups.'], 'C'],
          [22, 'What do the speakers say about the group project?', ['It helps to improve relationships among different classmates.', 'It helps to develop problem-solving skills.', 'It provides a supportive learning environment.'], 'A'],
          [23, 'Which part of the program surprised Paul?', ["There's a number of essays to write.", "There's a lot of practical work.", "There's an internship provided."], 'A'],
          [24, 'What do they feel about learning law?', ['It is essential training.', 'It is too theoretical.', 'It takes up too much time.'], 'A'],
        ], 'Questions 21-24'),
        matching('What are the suggestions offered by the speakers?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.',
          ['get feedback from teaching staff', 'do more reading', 'get help from school supporting staff', 'get help for nursing problems', 'manage time properly', 'be well prepared', 'review the notes regularly', "don't set unrealistic goals"], [
            [25, 'Essays', 'E'], [26, 'Lectures', 'G'], [27, 'Research', 'C'], [28, 'Online forum', 'A'], [29, 'Placement tests', 'B'], [30, 'Freshmen', 'H'],
          ], { groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Helen nói điều gây ấn tượng.', t: ['But as I stepped into the classroom, for the first time, I was surprised by the diversity.', 'Most were in their 20s but there were also those in the 30s or even 40s.'], p: 'Phần lớn ở tuổi 20 nhưng có cả 30, 40 – tức nhiều nhóm tuổi khác nhau → C' },
        22: { v: 'Khi Paul nói về dự án nhóm.', t: ['More importantly, stronger links were established between the group members.', "Because of the project, we've all become good friends."], p: 'Điểm quan trọng nhất là gắn kết các thành viên, trở thành bạn tốt → A' },
        23: { v: 'Khi Paul nói điều làm anh bất ngờ.', t: 'However, I was amazed by the amount of written assignments since I thought the course should have focused more on practice-oriented learning.', p: '“Amazed by the amount of written assignments” = ngạc nhiên vì nhiều bài viết; thực tập là điều anh thích (bẫy C) → A' },
        24: { v: 'Khi gia sư hỏi về môn luật.', t: ['We felt that learning law is kind of redundant and too time-consuming.', 'After a few sessions, we realise that it is necessary in dealing with future medical disputes.'], p: 'Lúc đầu thấy tốn thời gian (bẫy C), sau nhận ra là cần thiết → A' },
        25: { v: 'Phần lời khuyên, về bài luận.', t: ['What bothers me most is handing in essays on time.', 'I almost missed the deadline once because there were three essays due within the same week, so rationalising your time is critical.'], p: 'Sắp xếp thời gian hợp lý để nộp bài đúng hạn → E' },
        26: { v: 'Về bài giảng.', t: 'I have a poor memory, so I kept making notes and revisiting them on a regular basis.', p: 'Ghi chép và xem lại thường xuyên → G' },
        27: { v: 'Về nghiên cứu.', t: 'Fortunately, when I was digging up reference materials at the library, I sought help from the librarian.', p: 'Nhờ thủ thư (nhân viên hỗ trợ của trường) → C' },
        28: { v: 'Về diễn đàn trực tuyến.', t: 'It is where the students post academic problems that they come across and get support from the faculty members.', p: '“Faculty members” = đội ngũ giảng dạy; nhận phản hồi từ giảng viên → A' },
        29: { v: 'Về bài kiểm tra xếp lớp.', t: ["Some of my classmates didn't do so well during the placement tests.", 'I feel that background reading is necessary.'], p: 'Cần đọc thêm kiến thức nền → B' },
        30: { v: 'Lời khuyên cho sinh viên năm nhất.', t: 'After consulting my advisor, I found it important to set realistic goals.', p: 'Đặt mục tiêu thực tế = đừng đặt mục tiêu viển vông → H' },
      },
    },
    {
      part: 4, title: 'How Our Dinner Affects the Environment', audio: 'listening/test 4/Part 4.mp3', cover: 'cattle farm | food packaging waste',
      fix: [
        ['While.\n', ''], ['how we produce.\nThe food, we can find', 'how we produce the food, we can find'],
        ['Therefore.\nThe use of our food across', 'Therefore, the transportation of our food across'],
        ['a collection Dinner practices.\nIt is also a process of negotiation of push and pull', 'a collection of practices.\nIt is also a process of negotiation, a push and pull'],
        ['our future generations.\nWe should adopt', 'our future generations, we should adopt'],
      ],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Dinner Affects the Environment', [
          '<strong>Food industry</strong>',
          '• The amount of CO2 from producing our daily meals is the same as that from __Q31__',
          '• The process of making 100g __Q32__ beans can result in 140g CO2.',
          '• The __Q33__ production process contributes to climate-warming emissions.',
          '• Scientists are working on reducing the impact of the __Q34__ process.',
          '• Packaging needs __Q35__ as well as water and other resources for production.',
          '• Long distance __Q36__ leads to more pollution.',
          '• Due to the damage of __Q37__ the total amount of CO2 increases greatly.',
          '<strong>Agriculture</strong>',
          '• Livestock are either kept on farms or on a __Q38__ in different parts of the world.',
          '• In animal agriculture, __Q39__ is required constantly.',
          '• Some agricultural activities like __Q40__ are unlikely to be changed.',
        ], { 31: 'driving', 32: 'coffee', 33: 'meat', 34: 'cooking', 35: 'energy', 36: 'transportation/transport', 37: 'forests', 38: 'mountain', 39: 'food', 40: 'fishing' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài giảng, phần số liệu.', t: 'According to statistics, the carbon dioxide emissions from the production of the food people consume every day are almost the same as the emissions we make when we are driving.', p: 'Lượng CO2 từ sản xuất bữa ăn hằng ngày gần bằng khi lái xe → driving' },
        32: { v: 'Ví dụ cụ thể thứ nhất.', t: 'The cultivation and processing of 100 grams of coffee beans are responsible for 140 grams of carbon dioxide.', p: '100g hạt cà phê tạo ra 140g CO2 → coffee' },
        33: { v: 'Khi nói về sản xuất thịt.', t: ['Some of the environmental effects are associated with meat production.', 'The popular red meat requires 28 times more land to produce than chicken, 11 times more water, and results in 5 times more climate-warming emissions.'], p: 'Sản xuất thịt đỏ thải nhiều khí làm ấm khí hậu → meat' },
        34: { v: 'Khi nói về nấu nướng.', t: ['According to another research, cooking process also causes greenhouse gas emissions.', 'Scientists now are working on how to best minimize its impact.'], p: 'Các nhà khoa học tìm cách giảm tác động của quá trình nấu ăn → cooking' },
        35: { v: 'Khi nói về bao bì.', t: 'Another problem that we cannot neglect is the packaging of food products, as packaging takes a lot of energy, water and other natural resources to produce.', p: 'Sản xuất bao bì tốn năng lượng, nước và tài nguyên → energy' },
        36: { v: 'Khi nói về thực phẩm từ nơi xa.', t: 'Therefore, the transportation of our food across long distances contributes to air and water pollution.', p: 'Vận chuyển thực phẩm đường dài gây ô nhiễm → transportation' },
        37: { v: 'Khi nói về nhu cầu đất canh tác.', t: ['Hundreds and even thousands of forests have been cut down.', 'It had a devastating effect on the climate, because forests can absorb greenhouse gases.'], p: 'Rừng bị chặt phá nên lượng khí nhà kính tăng mạnh → forests' },
        38: { v: 'Phần nông nghiệp, cách nuôi gia súc.', t: 'In most countries, cows and other livestock are kept on the farms, while in some countries, they are kept in a restricted area on a mountain.', p: 'Gia súc được nuôi ở trang trại hoặc khu giới hạn trên núi → mountain' },
        39: { v: 'Khi nói về chăn nuôi.', t: 'And for animal agriculture, the problem can be more serious because the livestock need food all the time.', p: '“All the time” = constantly; gia súc luôn cần thức ăn → food' },
        40: { v: 'Phần nông nghiệp bền vững.', t: 'Crop growers may change their food production methods to prevent pollution although some other areas of agriculture are very hard to change, such as fishing.', p: 'Một số lĩnh vực rất khó thay đổi, như đánh bắt cá → fishing' },
      },
    },
  ],
};
