// Vol 4 – Test 2 (PDF "listening/test 2/test 2- listening (2).pdf" p1–6; key xlsx sheet Test 2; audio test 2/Track 1–4.mp3 —
// Track 1 clipped from "Now turn to Section 1", Track 4 cut after "half a minute to check" (10-minute silence follows)).
// Transcript: P1–P2 Whisper + Otter (Part N.pdf) written out with turns, gaps re-heard with wb.js; P4 = the bank's
// "Biomass Fuel" transcript (same recording, checked against Whisper).
// P3 = bank "Aims of the geography lesson" (Actual Test 2 P3): same recording and questions → reused. The xlsx key Q23
// "D" is wrong — "Neither of us was too dominant, and we supported each other" rules out teacher coordination; the bank
// key B (student grouping: "organizing the children in sets of six didn't work very well") stands.
// P4 is another question set on the bank's "Biomass Fuel" recording (bank: waste/cleaner/size…, here cost/store/powder…)
// → seeded as its own section. xlsx key Q35 "electrcity/energy" → electricity (ONE WORD; "energy" is not what is said).
const { note, table, map, mc } = require('../vol_build');

module.exports = {
  vol: 4, test: 2,
  sections: [
    {
      part: 1, title: 'Holiday on Jackson Island', audio: 'listening/test 2/Track 1.mp3', clip: [39.1, 441], cover: 'island beach holiday | snowboarding mountain',
      transcript: `
John:
Hi, Anna.
How was your holiday to Jackson Island?
Anna:
It was good.
There's quite a lot to see.
It's quite a big island, really.
John:
Yeah, I was thinking of going in the summer.
So where would you recommend going on the island?
Anna:
Well, the capital, of course, Camford.
I stayed there with my cousin.
John:
What did you do there?
Anna:
Well, actually, I spent most of my time there shopping.
John:
So has it got good shopping centres?
Anna:
Yes, but they're the same as at home, really.
So I did all my shopping in the market, which is great.
John:
What kinds of things are good to buy there?
Anna:
Everything, but bags and shoes especially.
Just make sure you've got cash with you, as most of the stalls don't take credit cards.
John:
OK, that's good to know.
Where else did you go?
Anna:
Well, my cousin and I went to Newtown.
She said it was famous for its modern architecture.
We only had half a day there, so we took a bus tour around the town.
But if I were you, I'd give the bus tour a miss.
Unless you know a lot about architecture, the buildings all look the same.
There's a museum, though.
That's supposed to be good.
You might like that.
John:
OK, I'll give it a go.
Anna:
Then after that, we headed for Golden Beach because we were going to meet up with an old friend that I hadn't seen for years, but we had to stay in a caravan as the hotels were all booked up.
John:
Is it as pretty as it looks in the brochures?
Anna:
Yes, it's very picturesque.
We did some sailing on the most beautiful blue sea.
It was so clear that you could see the bottom even quite far out to sea.
That part of the trip was great and I'd have liked to have stayed even longer.
I'd suggest staying there for a minimum of four days if I were you.
We had two days there and it wasn't nearly enough.
John:
Sounds great.
I'll put that on my must-do list.
Was that the end of your trip?
Anna:
No.
After Golden Beach, we drove into the centre of the island, to White Mountain.
John:
White as in the colour?
Anna:
Yes.
The island's great because you can go from the beaches up to the snowy mountain in a couple of hours.
We took a tent because we were going to camp, but the weather was so cold, in fact, it was snowing when I was there, that we stopped in a motel instead.
John:
Did you go skiing then?
Anna:
No, but we tried snowboarding and it was harder than it looked.
It looks so easy when you see other people doing it, but it took me ages to get the hang of it.
I wish I'd had some lessons, but you had to make your bookings in advance.
John:
OK, I'll look into that.
Thanks.
So, are there any other tips or advice you could give me?
Anna:
I don't know.
Let me think.
Oh, one place you should try to visit is this very quaint cafe which is at the foot of the mountain.
It has the best cakes ever.
It's worth going there just for them.
John:
I'll have to try those.
So, what other advice would you give?
Anna:
Oh, let me think.
We didn't really have any problems.
John:
Well, how did you get around when you were there?
Anna:
We wanted to get a motorbike at first.
They're very cheap to hire and great fun to ride as the roads are very good.
But it turned out not to be a good idea because the weather is so changeable.
You'd be much better off in a car.
There are plenty of places where you can hire them and the roads are well signposted so you won't get lost.
John:
And presumably, I can get a map when I get there?
Anna:
Well, you can, but they are expensive.
It'd be better to get one here before you go.
John:
Great.
That's been really useful.
Thank you.`,
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.\n\nHoliday on Jackson Island',
          ['Place', "Anna's accommodation", 'Things Anna did', "Anna's recommendation"], [
            ['Camford', 'with cousin (example)', 'went shopping in the market', 'need to take __Q1__'],
            ['Newtown', '', 'bus tour', 'visit the __Q2__'],
            ['Golden Beach', 'in a __Q3__', '__Q4__', 'Stay for at least __Q5__'],
            ['__Q6__', 'in a motel', 'went __Q7__', 'book some lessons in advance'],
          ], { 1: 'cash', 2: 'museum', 3: 'caravan', 4: 'sailing', 5: 'four days/4 days', 6: 'White Mountain', 7: 'snowboarding' }, 'Questions 1-7'),
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'More Advice', [
          '• Try the __Q8__ at the cafe on the mountain.',
          '• Hire a __Q9__',
          '• Buy a __Q10__ before the holiday',
        ], { 8: 'cakes', 9: 'car', 10: 'map/maps' }, 'Questions 8-10'),
      ],
      expl: {
        1: { v: 'Khi Anna kể về việc mua sắm ở chợ Camford.', t: "Just make sure you've got cash with you, as most of the stalls don't take credit cards.", p: 'Phần lớn sạp không nhận thẻ tín dụng → cần mang tiền mặt → cash' },
        2: { v: 'Khi nói về Newtown.', t: ["But if I were you, I'd give the bus tour a miss.", "There's a museum, though.", "That's supposed to be good."], p: 'Anna khuyên bỏ qua tour xe buýt (bẫy); nên đi bảo tàng → museum' },
        3: { v: 'Khi Anna kể về Golden Beach.', t: 'but we had to stay in a caravan as the hotels were all booked up.', p: 'Khách sạn kín chỗ nên phải ở xe nhà lưu động → caravan' },
        4: { v: 'Ngay sau đó, việc Anna làm ở Golden Beach.', t: 'We did some sailing on the most beautiful blue sea.', p: 'Họ đi thuyền buồm trên biển xanh → sailing' },
        5: { v: 'Khi Anna đưa lời khuyên về thời gian ở lại.', t: ["I'd suggest staying there for a minimum of four days if I were you.", "We had two days there and it wasn't nearly enough."], p: '“Minimum of four days” = at least four days; hai ngày là thời gian Anna đã ở (bẫy) → four days' },
        6: { v: 'Khi Anna kể điểm đến cuối cùng.', t: 'After Golden Beach, we drove into the centre of the island, to White Mountain.', p: 'Nơi cuối cùng (ở motel) là White Mountain → White Mountain' },
        7: { v: 'Khi John hỏi Anna có trượt tuyết không.', t: 'No, but we tried snowboarding and it was harder than it looked.', p: 'Không trượt tuyết (bẫy) mà thử trượt ván tuyết → snowboarding' },
        8: { v: 'Khi Anna gợi ý quán cà phê dưới chân núi.', t: 'It has the best cakes ever.', p: 'Quán có bánh ngọt ngon nhất → nên thử bánh → cakes' },
        9: { v: 'Khi John hỏi cách đi lại.', t: ['But it turned out not to be a good idea because the weather is so changeable.', "You'd be much better off in a car."], p: 'Xe máy không hợp vì thời tiết thất thường (bẫy); nên thuê ô tô → car' },
        10: { v: 'Cuối bài, khi hỏi về bản đồ.', t: ['Well, you can, but they are expensive.', "It'd be better to get one here before you go."], p: '“One” = a map; bản đồ ở đảo đắt nên mua trước khi đi → map' },
      },
    },
    {
      part: 2, title: 'Grampic Arts Campus', audio: 'listening/test 2/Track 2.mp3', cover: 'arts campus building | art workshop weekend',
      transcript: `
Welcome to Grampic Arts Campus for our annual Residential Arts Weekend.
I'm Bob Grain, Director of the Programme.
It's a large campus, it's quite easy to get lost, so I'm going to give you a quick overview of the most important places here.
Right, I'm glad you all found your way here to reception.
First, a word about parking.
We do have a free temporary car park here, and for those of you coming by bike, the bike sheds aren't far from reception.
You'll see them on your left as you walk down South Lane towards the residential rooms.
Now, dinner is in the dining room at 7.30.
If you need something to eat now, the snack shop is still open.
The quickest way to get there is to leave here, go straight through the office, they won't mind, the ornamental ponds in front of you and the snack shop is the building on your left.
The fitness facilities are even better this year.
We've outgrown the old fitness rooms, which were next to the office.
To find the new fitness rooms from here, walk up to North Road.
They're at the end in the last block next to the dining room.
Now, your bedrooms are quite near.
You can see the single rooms in the tall block to the far left of us across South Lane.
Couples and families are in our family rooms, right next door to them.
I'm afraid there aren't any TVs in the rooms.
We ask you to keep the noise down, please.
We have a TV room.
You can probably see it from here.
It's right opposite us in the big red building.
But there are gaps in our timetables for some extra options.
You may have this information in your brochure, but there have been some changes.
Firstly, the drama option.
I'm afraid our theatre and practice rooms here are being refurbished and are out of use.
We decided against using our sports hall, and instead we're going to use our lecture rooms, which we've converted into a theatre for the weekend.
There are also changes to the photography option.
This year, this option isn't open to everyone.
We decided, for practical reasons, to reserve it for beginners with no previous experience.
Let me remind you that you don't need any special equipment.
That's provided.
The tutors have said that, unfortunately, they can't accept parents with children, because that proved too disruptive last time.
But if you're over 18, that's fine.
On to the writing option.
Previous courses looked at starting your novel.
This year, we wondered about focusing on the techniques of writing different types of poetry.
However, as a result of many requests, we've decided the workshop will concentrate on helping each participant write one or more short stories.
Poetry may be some future time.
Now, music.
The brochure says you'll go to a concert.
That's a misprint.
Instead, you'll be writing and putting on your own performance, a concert for yourselves.
Unfortunately, the singing tutor is ill.
It's too late to replace her, so we've had to cancel singing lessons.
Apologies for that.
Finally, the creche.
This is available for all families on the programme, and there are still some places left.
I'm sure you'll be pleased to know that the charge for this hasn't increased since last year.
Lunch is included, but of course parents are welcome to collect their children and spend the lunch break with them.
May I remind you that any fees for this service must be settled in full at the end of the last day.
So, has anybody got any questions?`,
      groups: [
        map('Label the map below.\nWrite the correct letter, A-H, next to Questions 11-15.', [
          [11, 'Bike sheds', 'G'],
          [12, 'Snack shop', 'E'],
          [13, 'Fitness rooms', 'A'],
          [14, 'Family rooms', 'F'],
          [15, 'TV room', 'H'],
        ], { pdf: 'listening/test 2/test 2- listening (2).pdf', page: 2, box: [95, 238, 508, 612] }, 'Questions 11-15'),
        mc('Choose the correct letter, A, B or C.', [
          [16, 'The drama option takes place', ['in the theatre.', 'in the sports hall.', 'in the lecture rooms.'], 'C'],
          [17, 'The photography option is reserved for', ['people new to photography.', 'people with special equipment.', 'parents and children.'], 'A'],
          [18, 'The writing option will focus on', ['poetry techniques.', 'short stories.', 'starting a novel.'], 'B'],
          [19, 'The music option involves', ['singing classes.', 'going to a concert.', 'giving a performance.'], 'C'],
          [20, 'What information is given about the creche?', ['It costs the same as last year.', 'Lunch costs extra.', 'Parents must pay in advance.'], 'A'],
        ], 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi nói về nhà để xe đạp (đứng ở Reception).', t: ['the bike sheds aren\'t far from reception.', "You'll see them on your left as you walk down South Lane towards the residential rooms."], p: 'Từ Reception đi dọc South Lane, nhà xe nằm bên trái, gần lễ tân → ô G' },
        12: { v: 'Khi chỉ đường đến cửa hàng đồ ăn nhẹ.', t: "The quickest way to get there is to leave here, go straight through the office, they won't mind, the ornamental ponds in front of you and the snack shop is the building on your left.", p: 'Đi thẳng qua Office lên phía bắc, ao ở trước mặt, cửa hàng là toà nhà bên trái ao → E' },
        13: { v: 'Khi nói về phòng tập thể dục mới.', t: ['To find the new fitness rooms from here, walk up to North Road.', "They're at the end in the last block next to the dining room."], p: 'Phòng cũ cạnh Office (bẫy); phòng mới ở dãy cuối trên North Road, cạnh Dining room → A' },
        14: { v: 'Khi nói về phòng ngủ.', t: ['You can see the single rooms in the tall block to the far left of us across South Lane.', 'Couples and families are in our family rooms, right next door to them.'], p: 'Phòng gia đình ngay sát phòng đơn (Single rooms) → F' },
        15: { v: 'Khi nói về phòng TV.', t: "It's right opposite us in the big red building.", p: 'Ngay đối diện Reception, bên kia South Lane → H' },
        16: { v: 'Khi nói về môn kịch.', t: "We decided against using our sports hall, and instead we're going to use our lecture rooms, which we've converted into a theatre for the weekend.", p: 'Nhà hát đang sửa, không dùng nhà thi đấu; dùng các phòng giảng đường → C' },
        17: { v: 'Khi nói về môn nhiếp ảnh.', t: 'We decided, for practical reasons, to reserve it for beginners with no previous experience.', p: '“Beginners with no previous experience” = people new to photography; không cần thiết bị riêng, không nhận phụ huynh kèm con → A' },
        18: { v: 'Khi nói về môn viết.', t: "However, as a result of many requests, we've decided the workshop will concentrate on helping each participant write one or more short stories.", p: 'Tiểu thuyết là khoá trước, thơ chỉ là dự định (bẫy); năm nay tập trung truyện ngắn → B' },
        19: { v: 'Khi nói về môn âm nhạc.', t: ["The brochure says you'll go to a concert.", "That's a misprint.", "Instead, you'll be writing and putting on your own performance, a concert for yourselves."], p: 'Đi xem hoà nhạc là in nhầm, lớp hát bị huỷ; học viên tự biểu diễn → C' },
        20: { v: 'Cuối bài, về nhà trẻ.', t: ["I'm sure you'll be pleased to know that the charge for this hasn't increased since last year.", 'Lunch is included'], p: 'Phí không tăng so với năm ngoái; bữa trưa đã bao gồm (B sai), trả vào cuối ngày cuối (C sai) → A' },
      },
    },
    { part: 3, reuse: '6a43fbfbe56e021a6ea6b49f', title: 'Aims of the geography lesson' },
    {
      part: 4, title: 'Biomass Briquettes', audio: 'listening/test 2/Track 4.mp3', clip: [6.5, 347], cover: 'biomass briquettes fuel | sawdust pellets',
      transcript: `
Good afternoon, everyone.
In this course, we've been discussing the principles of sustainable development, and now we're going to look at some of the ways in which these principles are being put into practice.
Today, I'm going to talk about the use of biomass.
And for those of you who don't know what biomass is, it's plant material, usually agricultural waste, such as sawdust or straw.
And briquettes made out of biomass are used as fuel, either in the home or in industry.
I'll start with the benefits.
Using briquettes has a financial benefit because they make use of waste products as raw materials, so there isn't any cost involved for that.
Another advantage is convenience.
Handling briquettes is cleaner than handling materials like wood or charcoal.
Also, briquettes are less trouble to store because they're a uniform size and shape.
Right.
Let's look briefly now at how these briquettes are made.
There are two basic methods of manufacture.
The first method uses machinery.
At the initial stage, all the loose plant material is ground into a powder and then mixed with other materials.
Next, a machine compresses the biomass mixture, and that process raises the temperature and causes it to melt.
The machine forces the biomass mixture out through rectangular or circular holes.
Then, as the pressure decreases, the mixture cools and becomes solid again, and that's how the briquettes are formed.
It's important to point out that with this method, electricity is essential to operate the machinery, and the exact amount you need depends on the type of biomass you use.
But generally, the amount required is only 3% to 9% of the energy that's produced by the briquettes when they are burnt.
The second method involves making briquettes by hand.
This method is suitable when the biomass is mainly composed of material that doesn't melt, like paper.
The biomass is made into a paste by adding water, and in addition, something sticky, such as starch.
This mixture is then shaped, using either a simple metal press or bare hands.
So where is biomass fuel used, and how extensively?
Well, it's difficult to obtain detailed figures, but it's been used for several years in Europe and the USA, mainly for agriculture.
And since 2000, there's been a rapid increase in the production and use of briquettes made out of wood waste.
I can give you a ballpark figure: in 2010, about 5 million tonnes were used in Europe.
Some of these had to be imported from the USA.
Moving further east, both India and China have been producing biomass briquettes since the 1990s.
Detailed figures are hard to come by, but in China, in 2002, the number of factories producing biomass briquettes had increased to approximately 600, and production is still growing.
I don't have information about Africa in general, but I can give you an example of one company in Uganda which is producing briquettes.
Most of the company's customers are public institutions like schools and universities that provide hot meals for their students.
The other main users are businesses that need a source of heat for producing their products.
OK.
Well, how viable are biomass fuels like these in economic terms, and what is likely to happen in the future?
Well, the answer depends partly on the price of the fuels that they replace, and that varies from place to place.
But in general, the demand for biomass fuels is almost certain to grow, and that can only benefit the environment.
Let's turn now to another facet of...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Biomass fuel', [
          '• Biomass is waste plant material, e.g. sawdust, straw.',
          '• Biomass briquettes can be used as domestic or industrial fuel.',
          '<strong>Benefits of biomass briquettes</strong>',
          '• Financial: no __Q31__ for materials',
          '• Convenience: clean and easy to handle and __Q32__',
          '<strong>Production by machine</strong>',
          '• Biomass is first converted to a __Q33__. Then other substances are added.',
          '• The machine expels the mixture through __Q34__ of different shapes.',
          '• N.B. Only a relatively small amount of __Q35__ is needed to operate the machine.',
          '<strong>Production by hand</strong>',
          '• Biomass is mixed with water and sticky material, e.g. __Q36__, and then pressed into shape.',
          '<strong>Current use</strong>',
          '<em>Europe and the USA</em>',
          '• Briquettes have been in use for some time for __Q37__',
          '• The use of briquettes made from wood has increased rapidly.',
          '<em>India and China</em>',
          '• 1990s: briquette manufacture began.',
          '• 2002: China had about 600 __Q38__',
          '<em>Uganda</em>',
          '• Customers are mainly public institutions or __Q39__',
          '<strong>Prospects for biomass fuel</strong>',
          '• The __Q40__ is likely to increase',
        ], { 31: 'cost', 32: 'store', 33: 'powder', 34: 'holes', 35: 'electricity', 36: 'starch', 37: 'agriculture', 38: 'factories', 39: 'businesses', 40: 'demand' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Lợi ích về tài chính.', t: 'Using briquettes has a financial benefit because they make use of waste products as raw materials, so there isn\'t any cost involved for that.', p: 'Nguyên liệu là phế phẩm nên không tốn chi phí → no cost for materials → cost' },
        32: { v: 'Lợi ích về sự tiện lợi.', t: ['Handling briquettes is cleaner than handling materials like wood or charcoal.', "Also, briquettes are less trouble to store because they're a uniform size and shape."], p: '“Cleaner” đã có trong câu; ý còn lại: dễ cất trữ vì kích thước đồng đều → store' },
        33: { v: 'Phương pháp dùng máy, bước đầu.', t: 'At the initial stage, all the loose plant material is ground into a powder and then mixed with other materials.', p: 'Nguyên liệu được nghiền thành bột rồi mới trộn thêm chất khác → powder' },
        34: { v: 'Khi máy ép hỗn hợp ra ngoài.', t: 'The machine forces the biomass mixture out through rectangular or circular holes.', p: '“Rectangular or circular holes” = lỗ có hình dạng khác nhau → holes' },
        35: { v: 'Lưu ý về năng lượng vận hành máy.', t: ["It's important to point out that with this method, electricity is essential to operate the machinery", "But generally, the amount required is only 3% to 9% of the energy that's produced by the briquettes when they are burnt."], p: 'Cần điện để chạy máy, nhưng lượng điện chỉ 3–9% năng lượng tạo ra = tương đối ít → electricity' },
        36: { v: 'Phương pháp làm bằng tay.', t: 'The biomass is made into a paste by adding water, and in addition, something sticky, such as starch.', p: '“Something sticky, such as starch” = chất dính, ví dụ tinh bột → starch' },
        37: { v: 'Tình hình sử dụng ở châu Âu và Mỹ.', t: "Well, it's difficult to obtain detailed figures, but it's been used for several years in Europe and the USA, mainly for agriculture.", p: '“Used for several years… mainly for agriculture” = in use for some time for agriculture → agriculture' },
        38: { v: 'Tình hình ở Trung Quốc.', t: 'but in China, in 2002, the number of factories producing biomass briquettes had increased to approximately 600', p: 'Năm 2002 Trung Quốc có khoảng 600 nhà máy → factories' },
        39: { v: 'Ví dụ công ty ở Uganda.', t: ["Most of the company's customers are public institutions like schools and universities that provide hot meals for their students.", 'The other main users are businesses that need a source of heat for producing their products.'], p: 'Khách hàng chính: các cơ quan công và các doanh nghiệp cần nguồn nhiệt → businesses' },
        40: { v: 'Triển vọng tương lai.', t: 'But in general, the demand for biomass fuels is almost certain to grow, and that can only benefit the environment.', p: '“Demand… is almost certain to grow” = the demand is likely to increase → demand' },
      },
    },
  ],
};
