// Vol 6 – Test 3 (PDF "Lis/L-TEST 3.pdf" p1–6; key "Lis/L-key.pdf" p3; audio "Lis/Audio Lis/Test 3/01–04 Track N.mp3").
// Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// Track 1 opens with the whole-test introduction (0–49 s) → clip from "Part 1"; Track 4 carries 10 min of transfer silence → clip.
// Transcript: Whisper turbo (sentences + pitch for turns) checked against large-v3; turbo's "Yes, that's right." at P1 264 s
// is the prompt leaking (not in large-v3) → dropped.
const { note, table, mc, matching, map } = require('../vol_build');

module.exports = {
  vol: 6, test: 3,
  sections: [
    {
      part: 1, title: 'Get Away Tours', audio: 'Lis/Audio Lis/Test 3/01 Track 1.mp3', clip: [49, 419], cover: 'cycling holiday tour countryside | bicycle touring group',
      transcript: `
Sandra:
Good morning.
Thank you for calling Get Away Tours.
I'm Sandra.
How can I help you today?
Man:
Hi, Sandra.
I've got a lot of questions, but can you first tell me your office hours?
Sandra:
Sure.
We're open from 10 a.m. to 7 p.m.
Man:
Thanks, Sandra.
I saw your article in my favourite magazine last month, and I'd like more information about the different tours.
Sandra:
We have gotten a lot of calls about that article.
Man:
I'm not surprised.
Is it true that if I book a tour, the prices start at only $1,100 per person?
Sandra:
Yes, that's a special offer for this month.
Normally, they're from $1,400 going up to $2,000.
And it includes accommodation and meals.
This offer is for any of our 36 different bicycling tours.
Man:
Well, I am definitely interested in the bicycling tours, but I thought there were only 30.
Are all of them for a week?
Sandra:
Most of them.
If bicycling is not your thing, we also have walking tours to choose from.
Man:
That's a lot of options.
Sandra:
Are you aware that our trips all begin on Tuesday?
Man:
That's great.
It would give me Monday to pack.
How do you suggest I choose from so many options?
Sandra:
Yes, it is tough to make a choice.
Man:
I would love to hear about your most popular tours.
Sandra:
I'll start with the bicycling tours, since you said that was your main interest.
Man:
My wife and I are not in great shape for a hard ride.
Do you have rides that are at the beginner level?
Sandra:
Sure.
There's our Florida trip.
That's 14 nights.
But I'd recommend our holiday on the east coast of the U.S. in an area known as the Autumn Route, which is just six nights.
With short, leisurely routes on trails by the riverside and through the forest, you have plenty of time to explore the landscape during your holiday.
Man:
Wow.
Seeing the changing colours of the leaves would be amazing.
Sandra:
You also have the option to stop at some outstanding homes and to see their gardens.
Whichever cycling holiday you choose, you usually spend two nights at each hotel and always have plenty of time to explore, rest and sightsee as you wish.
Man:
Could you tell me about one of your moderate rides?
You never know.
Maybe my wife and I will get into enough shape to be able to do one.
Sandra:
Well, let me see.
Oh, this trip is actually ten nights long.
It travels through parts of Southern California.
The ride begins on a mountain trail and finally brings you down to the coastal roads.
Man:
Oh, yes, I see that here on your website.
Oh, that looks amazing.
I like that we would have the opportunity to try some of the local cuisine.
Sandra:
Yes, the cuisine in this area makes lavish use of colourful local produce.
And then, you know, the great weather of this region is a great feature by itself.
Man:
Do we stay in hotels on this trip?
Sandra:
You stay in hotels most of the way until the end, when you stay on a farm overlooking the sea.
That's always really popular.
Man:
Wow!
Both trips sound fabulous.
How far in advance do I have to make reservations?`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Get Away Tours', [
          '• Office hours: 10am to 7pm',
          '• Cost of cheapest tour per person is $__Q1__ (this month only)',
          '• Price includes accommodation and meals',
          '• The number of bicycle trips to choose from is __Q2__',
          '• Most tours last a __Q3__',
          '• This company offers __Q4__ holidays as well as bicycling',
          '• Travellers start their trips on __Q5__',
        ], { 1: '1100/1,100', 2: '36/thirty-six', 3: 'week', 4: 'walking', 5: 'Tuesday/Tuesdays' }, 'Questions 1-5'),
        table('Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.\n\nOverview of Bicycling Tours',
          ['', 'Number of nights', 'Terrain', 'Other attractions', 'Accommodation'], [
            ['Eastern United States', '__Q6__', 'Riverside and __Q7__ trails', 'Beautiful homes and __Q8__', 'Hotels'],
            ['Southern California', 'Ten', 'Mountain trail and __Q9__ roads', 'Inviting food and good weather', 'Hotels and a __Q10__'],
          ], { 6: '6/six', 7: 'forest', 8: 'gardens', 9: 'coastal', 10: 'farm' }, 'Questions 6-10'),
      ],
      expl: {
        1: { v: 'Khi người gọi hỏi giá tour.', t: ["Is it true that if I book a tour, the prices start at only $1,100 per person?", "Yes, that's a special offer for this month.", "Normally, they're from $1,400 going up to $2,000."], p: '1,400–2,000 là giá thường (bẫy); giá thấp nhất ưu đãi tháng này là 1,100 → 1100' },
        2: { v: 'Ngay sau đó.', t: ['This offer is for any of our 36 different bicycling tours.', 'Well, I am definitely interested in the bicycling tours, but I thought there were only 30.'], p: 'Người gọi tưởng chỉ có 30 (bẫy); thực tế có 36 tour xe đạp → 36' },
        3: { v: 'Khi hỏi tour kéo dài bao lâu.', t: ['Are all of them for a week?', 'Most of them.'], p: 'Phần lớn các tour kéo dài một tuần → week' },
        4: { v: 'Ngay sau đó.', t: 'If bicycling is not your thing, we also have walking tours to choose from.', p: 'Ngoài xe đạp còn có tour đi bộ → walking' },
        5: { v: 'Khi nói ngày khởi hành.', t: ['Are you aware that our trips all begin on Tuesday?', "It would give me Monday to pack."], p: 'Thứ Hai là ngày để chuẩn bị đồ (bẫy); chuyến đi bắt đầu vào thứ Ba → Tuesday' },
        6: { v: 'Khi giới thiệu tour bờ đông nước Mỹ.', t: ["There's our Florida trip.", "That's 14 nights.", "But I'd recommend our holiday on the east coast of the U.S. in an area known as the Autumn Route, which is just six nights."], p: 'Florida 14 đêm (bẫy); tour Autumn Route bờ đông chỉ 6 đêm → 6' },
        7: { v: 'Ngay sau đó, về địa hình.', t: 'With short, leisurely routes on trails by the riverside and through the forest', p: 'Đường mòn ven sông và xuyên rừng → forest' },
        8: { v: 'Khi nói điểm tham quan khác.', t: 'You also have the option to stop at some outstanding homes and to see their gardens.', p: 'Ghé những ngôi nhà đẹp và xem khu vườn → gardens' },
        9: { v: 'Khi giới thiệu tour Nam California.', t: 'The ride begins on a mountain trail and finally brings you down to the coastal roads.', p: 'Bắt đầu ở đường núi và kết thúc ở đường ven biển → coastal' },
        10: { v: 'Khi hỏi về chỗ ở của tour này.', t: 'You stay in hotels most of the way until the end, when you stay on a farm overlooking the sea.', p: 'Ở khách sạn rồi cuối chuyến ở một trang trại nhìn ra biển → farm' },
      },
    },
    {
      part: 2, title: 'Sports Information for Parents', audio: 'Lis/Audio Lis/Test 3/02 Track 2.mp3', cover: 'children cross country running school | school sports parents',
      transcript: `
Good evening, parents, and thank you for offering your help.
I'm here to talk about the sports programmes that the children are taking part in this term.
Although we do do sport during class time, children often have extra activities before or after school or at weekends, and that's when we need you.
First up, we're looking for parents who would like to become team coaches or managers.
We had some excellent people last year, but some of those parents now have other commitments.
It's the Year 4 netball team, the Year 5 and 6 rugby teams, and the Year 3 hockey team that need new people.
Now, coaching.
I know some parents might not be completely familiar with, say, rugby or netball rules, but don't let that put you off.
Obviously, knowledge of the game helps, but if you're keen, there are some coaching courses you can take before the training sessions for players begin, and these also get held throughout the whole season.
What's really required is the right attitude.
Are you the kind of person that can motivate kids and make the game seem exciting?
All the rugby training and matches are organised by North Shore Rugby Club.
If you do volunteer to become a rugby coach, you'll need to go along to an important day that's coming up.
That's on Saturday the 23rd.
It takes place on the rugby grounds and it's when all the kids put their names down for a team and the organisers are on hand to give parents a bit more information.
Matches are on Saturday morning and training sessions on a Wednesday after school.
Moving on to netball.
Matches and uniforms.
Matches are on Monday at 4pm and take place at the North Harbour netball grounds.
And for uniforms, we've just ordered a new set from the sports store in town and parents must hire one from the school secretary for $15, which gets refunded at the end of the season.
OK, some of you are kindly helping with the cross-country running event.
Children in Years 3 to 6 will be running from school, at the bottom of your map there.
The route isn't marked on your map, I'm afraid, but I'm going to point out some different places that need parent supervision.
The drinks station is one.
If you're handing out water, head to the north car park and the station will be set up on the other side of the road from it, right by the flag post.
Two or three parents will be needed to help out at the major crossing point, just to make sure everybody's going the right way.
So, on the map, there's that little footpath going up past the school, then it splits into three directions.
The crossing point is at the end of the left-hand path, heading west, just before you cross Summer Street.
Now, we'll need a couple of parents at the halfway point to send the children in the right direction.
So, there are four buildings on the far left-hand side.
The halfway point is just to the right of these buildings.
Just cheer the kids on.
And if anyone has given up running, that's fine.
OK, the teacher at our first aid post might need help sticking plasters on.
The quickest way to get to first aid is to head up the footpath next to school, and when you get to the second turning on the right, head down there, and it's sort of opposite the satellite dish.
What else?
The rest area is for children needing a break, and that's the place nearest the south car park, near the road.
And if any parent here is handy with a video camera, we'd really appreciate some help with filming the event.
This means heading up the footpath by the school, then keep going up, with the flag post on your left and the satellite dish on your right.
And the filming spot is just there in front of the trees.
Well, I think that covers everything.
But if you have any questions, please...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nSports information for parents', [
          [11, 'The school is looking for new team coaches and managers because', ['the overall interest in sport has grown.', 'certain parents have given up these roles.', 'new types of sport are being introduced.'], 'B'],
          [12, 'What does the speaker say is the most important thing a coach needs?', ['confidence about the rules of a particular sport', 'the ability to make children enthusiastic about a sport', 'commitment to training the team for a full season'], 'B'],
          [13, 'For parents who would like to coach rugby, one requirement is that they', ['attend an upcoming registration event.', 'can commit to two coaching sessions per week.', 'have their own child in the team.'], 'A'],
          [14, 'In order to get a netball uniform, parents will need to', ['pay a deposit at school.', 'ask the team manager for one.', 'visit the recommended local sports store.'], 'A'],
        ], 'Questions 11-14'),
        map('Label the map below.\nWrite the correct letter, A-I, next to Questions 15-20.', [
          [15, 'Drinks station', 'C'],
          [16, 'Crossing point', 'H'],
          [17, 'Halfway point', 'B'],
          [18, 'First aid', 'F'],
          [19, 'Rest area', 'G'],
          [20, 'Filming area', 'D'],
        ], { pdf: 'Lis/L-TEST 3.pdf', page: 3, box: [175, 528, 1560, 1500] }, 'Questions 15-20 – Cross country running event'),
      ],
      expl: {
        11: { v: 'Khi nói vì sao cần huấn luyện viên và quản lý mới.', t: 'We had some excellent people last year, but some of those parents now have other commitments.', p: 'Một số phụ huynh năm ngoái giờ bận việc khác → đã thôi đảm nhận vai trò này → B' },
        12: { v: 'Khi nói điều quan trọng nhất ở huấn luyện viên.', t: ["Obviously, knowledge of the game helps", "What's really required is the right attitude.", 'Are you the kind of person that can motivate kids and make the game seem exciting?'], p: 'Hiểu luật chỉ là có ích (bẫy A); điều thật sự cần là khả năng tạo động lực, làm trận đấu hấp dẫn với trẻ → B' },
        13: { v: 'Khi nói về huấn luyện viên rugby.', t: ["If you do volunteer to become a rugby coach, you'll need to go along to an important day that's coming up.", "It takes place on the rugby grounds and it's when all the kids put their names down for a team"], p: 'Phải tham dự ngày sắp tới khi các em đăng ký vào đội → sự kiện đăng ký sắp diễn ra → A' },
        14: { v: 'Khi nói về đồng phục netball.', t: 'And for uniforms, we\'ve just ordered a new set from the sports store in town and parents must hire one from the school secretary for $15, which gets refunded at the end of the season.', p: 'Cửa hàng thể thao là nơi trường đặt (bẫy C); phụ huynh thuê ở thư ký trường 15 đô, được hoàn lại cuối mùa → đặt cọc ở trường → A' },
        15: { v: 'Khi chỉ trạm nước uống.', t: 'If you\'re handing out water, head to the north car park and the station will be set up on the other side of the road from it, right by the flag post.', p: 'Bên kia đường so với bãi xe phía bắc, ngay cạnh cột cờ → C' },
        16: { v: 'Khi chỉ điểm băng qua đường.', t: ["So, on the map, there's that little footpath going up past the school, then it splits into three directions.", 'The crossing point is at the end of the left-hand path, heading west, just before you cross Summer Street.'], p: 'Cuối nhánh đường bên trái đi về phía tây, ngay trước khi qua Summer Street → H' },
        17: { v: 'Khi chỉ điểm giữa chặng.', t: ['So, there are four buildings on the far left-hand side.', 'The halfway point is just to the right of these buildings.'], p: 'Ngay bên phải bốn ngôi nhà ở phía ngoài cùng bên trái → B' },
        18: { v: 'Khi chỉ trạm sơ cứu.', t: 'The quickest way to get to first aid is to head up the footpath next to school, and when you get to the second turning on the right, head down there, and it\'s sort of opposite the satellite dish.', p: 'Rẽ phải ở lối thứ hai, đối diện chảo vệ tinh → F' },
        19: { v: 'Khi chỉ khu nghỉ.', t: "The rest area is for children needing a break, and that's the place nearest the south car park, near the road.", p: 'Điểm gần bãi xe phía nam nhất, gần đường → G' },
        20: { v: 'Khi chỉ chỗ quay phim.', t: ['This means heading up the footpath by the school, then keep going up, with the flag post on your left and the satellite dish on your right.', 'And the filming spot is just there in front of the trees.'], p: 'Cột cờ bên trái, chảo vệ tinh bên phải, ngay trước hàng cây → D' },
      },
    },
    {
      part: 3, title: 'Buildings Made of Plastic', audio: 'Lis/Audio Lis/Test 3/03 Track 3.mp3', cover: 'futuristic plastic house 1960s | inflatable exhibition hall',
      transcript: `
Luke:
Hi, Millie.
Millie:
Hi, Luke.
So, we're here to talk over our first assignment on alternative building materials.
Luke:
Yeah, I think it will be really interesting to learn more about how plastic has been used.
Millie:
I found lots of information from the 1960s.
Luke:
So, did you find out why the idea of plastic buildings wasn't popular with the public at that time?
Millie:
It wasn't the material's environmental credentials.
The concept of plastic houses was just too futuristic.
Luke:
So you mean it was their appearance?
Millie:
No.
People liked their modern design, but the idea of that sort of building as a home just didn't appeal.
Luke:
Right.
I did some research on the kind of problems engineers had with the old plastics in the 1960s and 1970s.
Millie:
What did you learn?
Luke:
Well, firstly, because plastic doesn't weigh very much, the buildings weren't very good in windy weather.
They managed to fix that by amending the shape of the buildings, but the real disadvantage was that when the plastic was exposed to the light, it developed fine cracks, and when rain got into these cracks, the plastic would deform and lose its strength.
Millie:
Right.
Luke:
I wonder where we can find some more information about the situation nowadays.
Millie:
Maybe we could ask one of the PhD students.
Luke:
I expect they'll be too busy.
Millie:
Yeah, that's true.
Well, we could always use the internet.
Luke:
Maybe we should research more academic sources, like the journals we have in the library.
Millie:
Hmm, OK.
That way we can reference everything properly at the end of the assignment.
Have you read Peterson's article about plastic houses?
Luke:
Yeah, it was really good.
Millie:
But it didn't have enough illustrations of the houses.
That was a shame.
They'd have been useful for us as examples in our presentation.
I liked the way it was organised, though.
That was really clear.
Luke:
Yeah, and it wasn't too technical.
But you did need to know a bit about plastic houses before you read it to get the most out of it.
Millie:
That's true.
OK.
Well, shall we start comparing our findings then?
Luke:
Sure.
I'll make some notes.
Millie:
Well, the earliest one I read about was a plastic house called the House of the Future that was built in 1957, though no one actually lived in it.
It was on show at a theme park in America for ten years.
After that, they demolished it, but they had a hard time.
It was really built to last.
They couldn't break the plastic up.
Luke:
Was that the one that had an ultrasonic dishwashing machine?
Millie:
Yes, that would still be pretty revolutionary today.
Did you read about the Wonderhouse?
Luke:
It was designed in 1964 by an industrial designer called Alfred Noyes.
Millie:
Oh, the one with the roof like a sort of tent or an umbrella.
Luke:
That's right.
The roof was made of fibreglass and it curved down to the ground at each corner, enclosing a big central space.
Then the sides were filled with glass or plastic.
It was a really innovative idea for the time, but Noyes only made a small model and the design wasn't implemented.
Millie:
Hmm, pity.
Luke:
What about those spaceship houses they built between 1968 and 1978?
Millie:
Like flying saucers.
They built over a hundred of them.
I don't know if I'd want to live in one.
The living area was quite limited and they had really low ceilings, but they do look really futuristic, don't they?
Luke:
With their white walls and circular shape, yes.
But the plastic houses I like are the foam houses they built between 1979 and 1983.
They've got really curvy shapes.
They built them by spraying foam over a great big balloon.
Millie:
They were partly built to show what computers could do in the home.
Things like controlling heat and lights and so on.
Quite new ideas at the time.
And they were very well insulated as well, so they saved energy.
People were just beginning to get into that.
Luke:
I read about a plastic exhibition hall that can all be packed away in a relatively small container.
You just put it on a truck and take it to wherever you want it, then inflate it.
You know, fill it up with air and there's room for hundreds of people.
And when the exhibition or whatever's over, you just take it down again and you can reuse it again and again.
Millie:
And there's a house in New Zealand that's built from household and industrial waste, like plastic boxes.
They say it's a much better construction material than bricks from the point of view of insulation.
Luke:
Yes, they're using that idea to build houses in other parts of the world, too.
OK, well, it looks as if we've got plenty of stuff...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nBuildings made of plastic', [
          [21, 'Why did buildings made of plastic fail to please the public in the 1960s?', ["People didn't think they were good for the environment.", "People didn't want to live in them.", "People didn't find them visually appealing."], 'B'],
          [22, 'In the 1960s and 1970s, engineers were unable to overcome the problem of', ['damage caused in the production process.', 'the effects of light and water.', 'the potential danger of wind.'], 'B'],
          [23, 'Luke and Millie agree to try to get more information about present-day plastics from', ['journals.', 'a PhD student.', 'websites.'], 'A'],
          [24, 'What do Luke and Millie agree about the article by Peterson?', ['It provided useful examples.', 'It was easy to understand.', 'It was a good introduction to the topic.'], 'B'],
        ], 'Questions 21-24'),
        matching('What description applies to each of the following structures?\nChoose SIX answers from the box and write the correct letter, A-G, next to Questions 25-30.',
          ['easy to transport', 'not much room inside', 'made from recycled materials', 'designed to promote technology', 'never actually built', 'easy to keep clean', 'very strong construction'], [
            [25, "the 'House of the Future' (1957)", 'G'],
            [26, "the 'Wonderhouse' (1964)", 'E'],
            [27, 'spaceship houses (1968–78)', 'B'],
            [28, 'foam houses (1979–83)', 'D'],
            [29, 'plastic exhibition hall', 'A'],
            [30, 'New Zealand house', 'C'],
          ], { title: 'Descriptions', groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Luke hỏi vì sao nhà bằng nhựa không được ưa chuộng.', t: ["It wasn't the material's environmental credentials.", 'So you mean it was their appearance?', 'No.', "People liked their modern design, but the idea of that sort of building as a home just didn't appeal."], p: 'Không phải do môi trường (bẫy A), người ta thích thiết kế (bẫy C); họ không thích ý tưởng sống trong đó → B' },
        22: { v: 'Khi Luke kể về vấn đề của nhựa cũ.', t: ['They managed to fix that by amending the shape of the buildings, but the real disadvantage was that when the plastic was exposed to the light, it developed fine cracks, and when rain got into these cracks, the plastic would deform and lose its strength.'], p: 'Vấn đề gió đã được khắc phục bằng cách đổi hình dáng (bẫy C); ánh sáng gây nứt và mưa làm nhựa biến dạng → ảnh hưởng của ánh sáng và nước → B' },
        23: { v: 'Khi bàn nơi tìm thêm thông tin.', t: ["I expect they'll be too busy.", 'Maybe we should research more academic sources, like the journals we have in the library.', 'Hmm, OK.'], p: 'Nghiên cứu sinh quá bận (bẫy B), internet bị thay (bẫy C); đồng ý dùng tạp chí học thuật trong thư viện → A' },
        24: { v: 'Khi nói về bài báo của Peterson.', t: ["But it didn't have enough illustrations of the houses.", 'That was really clear.', "Yeah, and it wasn't too technical."], p: 'Thiếu hình minh hoạ (bẫy A), cần biết trước về chủ đề mới hiểu hết (bẫy C); rõ ràng và không quá chuyên môn → dễ hiểu → B' },
        25: { v: "Khi Millie nói về 'House of the Future'.", t: ['After that, they demolished it, but they had a hard time.', 'It was really built to last.', "They couldn't break the plastic up."], p: 'Phá dỡ rất khó vì không đập vỡ được nhựa → kết cấu rất chắc chắn → G' },
        26: { v: 'Khi nói về Wonderhouse.', t: "It was a really innovative idea for the time, but Noyes only made a small model and the design wasn't implemented.", p: 'Chỉ làm mô hình nhỏ, thiết kế không được thực hiện → chưa bao giờ được xây → E' },
        27: { v: 'Khi nói về nhà hình phi thuyền.', t: 'The living area was quite limited and they had really low ceilings', p: 'Không gian sống hạn chế, trần thấp → không nhiều chỗ bên trong → B' },
        28: { v: 'Khi nói về nhà bọt xốp.', t: ['They were partly built to show what computers could do in the home.', 'Things like controlling heat and lights and so on.'], p: 'Xây để giới thiệu khả năng của máy tính trong nhà → quảng bá công nghệ → D' },
        29: { v: 'Khi Luke nói về phòng triển lãm bằng nhựa.', t: ['I read about a plastic exhibition hall that can all be packed away in a relatively small container.', 'You just put it on a truck and take it to wherever you want it, then inflate it.'], p: 'Gói gọn trong thùng nhỏ, chở bằng xe tải đi bất cứ đâu → dễ vận chuyển → A' },
        30: { v: 'Khi Millie nói về ngôi nhà ở New Zealand.', t: "And there's a house in New Zealand that's built from household and industrial waste, like plastic boxes.", p: 'Xây từ rác thải sinh hoạt và công nghiệp → làm từ vật liệu tái chế → C' },
      },
    },
    {
      part: 4, title: 'Calotype Photography in Britain and France', audio: 'Lis/Audio Lis/Test 3/04 Track 4.mp3', clip: [0, 502], cover: 'antique camera 19th century | early photography calotype',
      transcript: `
Morning, everyone.
Welcome back to this series of lectures on the development of photography.
Last week, we looked at a type of photography called daguerreotype.
Daguerreotype, the first commercially successful photographic process.
Today, we're going to look at how this was gradually replaced by a technique called calotype.
Daguerreotype was a major breakthrough, but there were problems with it.
In particular, because the image was produced on a copper sheet, it was expensive to create each photograph.
As a result, during the 1840s, a man named William Talbot began looking for an alternative approach.
Talbot eventually became an influential figure, but he always said he was not a professional photographer.
In fact, he trained as an artist.
His greatest interest was painting, and he only became involved with photography as a secondary interest.
Talbot spent many years trying to solve the problems associated with daguerreotype photography.
He tried a number of different approaches, and it took some time to find a successful alternative.
But in the end, what he did was, instead of producing each photograph on a sheet of copper, he produced them on paper, and at the time, this was a great advance.
Talbot's technique, which he called calotype photography, had other advantages as well.
Maybe the most important was that the pictures themselves weren't as sharp as the ones produced before.
The sharpness had been a problem because it distorted everything, but this new calotype process produced images that were realistic compared to all earlier photographs.
Calotype photography was invented in Britain, but it was also popular with French photographers.
The 1850s were a time of rapid development in France, and photography was used to record these changes.
One example of how important photography had become occurred in 1851, when the French government established a society to promote the interests of photographers.
Something that hadn't happened before.
To begin with, there were five members, and maybe the most important was a man called Gustave Le Gray.
Le Gray became increasingly fascinated by the calotype process.
Most of all, he wanted to produce different types of image, so began a series of experiments to see how this might be done.
His greatest success was when he designed the first camera that was able to create enlargements, an important step forward.
Another of Le Gray's innovations was his work on the size of the equipment necessary to take photographs.
Originally it was very heavy and difficult to move about, but Le Gray made it lighter and smaller.
This meant he could take photographs outdoors more easily, rather than being limited to the studio, which had sometimes been the case until then.
Le Gray produced numerous photographs during this period and was highly regarded among fellow photographers.
But his work also became famous among the general public because he wrote a very popular series of books describing the calotype process and giving examples of his work.
The simple fact was that people liked photography.
They thought it was reliable, especially compared to drawing, where the human hand might alter or exaggerate things.
This had various consequences, one of which was that photography was now often used to record the huge programme of renovation work of historical buildings in France during the 1850s.
The camera doesn't lie, so people said.
As a result, the calotype process was admired not only by photographers, but increasingly by the government and by mainstream society.
However, debate still remained about whether photography could truly be called an art form, like sculpture or drawing.
Certainly, although the public liked it, in the opinion of critics, photography could not be compared to other established forms of art.
So, in summary, what can we say about calotype photography during this period?
One thing to re-emphasise is that the 1850s were a period of great development in Britain and France.
The culture in both countries admired all new technological advances, and photography represented these ideas because it was considered to be a science by most people.
However, photographers didn't stop experimenting with new materials to improve the quality of their work.
Most of all, they were searching for ways to make images more permanent because calotype photographs tended to fade over time.
And in the end, they found that if the image was produced on glass, it lasted much longer.
So calotype photography was slowly replaced by other techniques which had greater...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Calotype photography in Britain and France', [
          '<strong>From Daguerreotype to Calotype</strong>',
          '• Daguerreotype was the first commercial photographic process.',
          '• Daguerreotype had a problem: the use of copper made it __Q31__',
          '• William Talbot began looking for an alternative approach in the 1840s.',
          '• Talbot was not originally a photographer but an artist who specialised in __Q32__',
          '• Talbot used paper instead of copper.',
          "• These calotype photographs were more __Q33__ because they weren't so sharp.",
          '<strong>French Calotype</strong>',
          '• In 1851, the first society for photographers was created.',
          '• Gustave Le Gray became fascinated by calotype photography.',
          '• He carried out experiments and produced the first __Q34__ using a camera.',
          '• He developed equipment that was easier to use outside the __Q35__',
          '• Calotype became famous because Le Gray produced __Q36__ about it.',
          '• People thought photography was more reliable than drawing.',
          '• It was used to record the work done on old __Q37__',
          "• Photography was not 'art', according to __Q38__",
          '<strong>Summary</strong>',
          '• Photography was thought of as a __Q39__ so reflected the culture of the 1850s.',
          '• The use of new materials, particularly __Q40__, led to new techniques.',
        ], { 31: 'expensive', 32: 'painting', 33: 'realistic', 34: 'enlargement/enlargements', 35: 'studio', 36: 'books', 37: 'buildings', 38: 'critics', 39: 'science', 40: 'glass' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói vấn đề của daguerreotype.', t: 'In particular, because the image was produced on a copper sheet, it was expensive to create each photograph.', p: 'Ảnh in trên tấm đồng nên mỗi tấm rất đắt → expensive' },
        32: { v: 'Khi giới thiệu William Talbot.', t: ['In fact, he trained as an artist.', 'His greatest interest was painting, and he only became involved with photography as a secondary interest.'], p: 'Là hoạ sĩ, đam mê lớn nhất là hội hoạ → painting' },
        33: { v: 'Khi nói ưu điểm của calotype.', t: 'The sharpness had been a problem because it distorted everything, but this new calotype process produced images that were realistic compared to all earlier photographs.', p: 'Ảnh không quá sắc nét nên chân thực hơn → realistic' },
        34: { v: 'Khi nói thành công lớn nhất của Le Gray.', t: 'His greatest success was when he designed the first camera that was able to create enlargements, an important step forward.', p: 'Máy ảnh đầu tiên tạo được ảnh phóng to → enlargement' },
        35: { v: 'Khi nói cải tiến thiết bị của Le Gray.', t: 'This meant he could take photographs outdoors more easily, rather than being limited to the studio', p: 'Chụp ngoài trời dễ hơn, không bị gò bó trong studio → studio' },
        36: { v: 'Khi nói vì sao công chúng biết đến.', t: 'But his work also became famous among the general public because he wrote a very popular series of books describing the calotype process', p: 'Ông viết một loạt sách rất nổi tiếng về calotype → books' },
        37: { v: 'Khi nói ứng dụng của nhiếp ảnh ở Pháp.', t: 'photography was now often used to record the huge programme of renovation work of historical buildings in France during the 1850s.', p: 'Ghi lại công việc tu sửa các toà nhà lịch sử (old = historical) → buildings' },
        38: { v: 'Khi nói tranh luận về nghệ thuật.', t: 'Certainly, although the public liked it, in the opinion of critics, photography could not be compared to other established forms of art.', p: 'Công chúng thích (bẫy public); theo các nhà phê bình thì không phải nghệ thuật → critics' },
        39: { v: 'Phần tóm tắt.', t: 'The culture in both countries admired all new technological advances, and photography represented these ideas because it was considered to be a science by most people.', p: 'Nhiếp ảnh được xem là một môn khoa học → science' },
        40: { v: 'Cuối bài.', t: 'And in the end, they found that if the image was produced on glass, it lasted much longer.', p: 'Vật liệu mới, đặc biệt là kính, giúp ảnh bền hơn → glass' },
      },
    },
  ],
};
