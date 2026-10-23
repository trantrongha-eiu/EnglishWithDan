// Vol 6 – Test 5 (PDF "Lis/L-TEST 5.pdf" p1–6; key "Lis/L-key.pdf" p5; audio "Lis/Audio Lis/Test 5/01–04 Track N.mp3").
// Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// Track 1 opens with the whole-test introduction (0–50 s) → clip from "Part 1"; Track 4 carries 10 min of transfer silence → clip.
// Transcript: Whisper turbo (sentences + pitch for turns) checked against large-v3. Both drop P1 327–341 s (turbo writes the
// prompt "Well, it's £15 a day." there) → re-heard with wb.js. P3: turns by content (tutor / Terence).
const { note, mc, multi, map } = require('../vol_build');

module.exports = {
  vol: 6, test: 5,
  sections: [
    {
      part: 1, title: 'Campsite Reservation Form', audio: 'Lis/Audio Lis/Test 5/01 Track 1.mp3', clip: [49.5, 461], cover: 'campsite tent forest California | national park campground',
      transcript: `
Ranger:
Nature Park Services, how may I help you today?
Sandra:
Hello.
I'm calling to make a campsite reservation.
Ranger:
Great.
Let me just pull up the reservation form and we can get started.
Okay.
First, could I get your name?
Sandra:
Sure, it's Sandra Kemp.
Ranger:
All right, Ms Kemp.
I can make reservations for the Northern, Central, and Southern California parks.
Which region will you be travelling to?
Sandra:
Is Mount Laguna in the Central or Southern region?
Ranger:
Is that where you're going?
Sandra:
Yes.
Ranger:
That's Southern.
Do you know which campground?
Sandra:
Actually, I was hoping you could help me with that.
I've read a lot about two different campgrounds, Sunrise and Mountain, but I can't decide.
Mountain Campground has many hiking trails close by.
But then again, Sunrise Campground is next to the lake, and my husband loves to fish.
Ranger:
Hmm.
They're both really beautiful spots.
I guess it depends on when you're going.
Sandra:
Really?
Well, we're going in April.
Ranger:
The thing is, fishing at Sunrise Campground is only allowed from June to September, so I suggest Mountain.
Sandra:
Okay, then.
That makes it easy.
Ranger:
So we've selected the campground, so now we need to think about which sort of site.
There are different options.
You can stay at a cabin, a tent, or a recreational vehicle campsite.
Sandra:
Which type of site offers the most peace and quiet?
Ranger:
A tent site would be your best bet.
Sandra:
Sounds good to me.
Ranger:
Um, so, if you've read about the park, you probably know that some vehicles aren't suitable for the park roads.
Cars tend to get stuck when it rains.
If you have a truck, you won't have any trouble.
Sandra:
Luckily we do.
We'll be driving that instead of our car.
I hope we don't get any rain, but I'd rather be safe than sorry.
Ranger:
Perfect.
I'll just need to get your licence plate number.
Sandra:
That's QY0918.
Ranger:
Thanks.
And what about your trip dates?
Sandra:
We'd like to stay for three days.
Ranger:
Does that mean you'll be staying two nights?
Sandra:
That's right.
We'll be arriving on April 10th and leaving on the 12th.
Ranger:
Now, the park is home to some black bears, so you'll need to rent a bear-proof food container to lock your food inside for hikes.
It's really just a precaution.
We have small, medium, and large food containers for campers.
Sandra:
Oh, I'm familiar with food containers, but they can be heavy.
Ranger:
Well, the large one is, but if you get the small size, it's not so heavy.
Sandra:
Let's do that.
I really want something lightweight.
Ranger:
Would you be interested in signing up for a guided nature walk on the second day of your trip?
Sandra:
What kind of walk?
Ranger:
Well, at 7 a.m., there are three different ones near your campground.
There's the flower walk, the bird-watching walk, and the waterfall walk.
Sandra:
Really?
I love gardening, so the flower walk sounds interesting.
My son might be more into the waterfall one, but I can't imagine him getting up in time.
Maybe I could go alone.
Could you sign me up?
Ranger:
Sure.
Now just a few more things.
Visitors must purchase park passes as well.
You have the option of the one-day pass, which would be cheaper, or the one-year pass, which is a better deal if you plan to go to more parks.
Sandra:
Let's go ahead and get that.
I'm sure we'll visit more parks soon.
Ranger:
It's a really good bargain.
Plus, we donate $5 of the pass fee to one of our three park programmes.
You get to choose which one.
Sandra:
Park programmes?
Ranger:
Yes.
Well, we run a youth programme for local kids to attend a nature camp in the summer.
The other two options are conservation projects.
There's a wildlife programme and a tree planting programme.
Sandra:
Wow, they all sound worthwhile.
What should I do?
Um, it's important for children to appreciate the outdoors.
Let's go with the youth programme.
Ranger:
Okay.
We just need to review the fee and payment information.`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Campsite Reservation Form', [
          'Name: Sandra Kemp',
          'Park region: __Q1__ California',
          'Campground name: __Q2__ Campground',
          'Type of site: __Q3__',
          'Type of vehicle: will be driving a __Q4__',
          'Licence plate number: __Q5__',
          'Number of nights: two',
          'Departure date: __Q6__',
          'Bear-proof food container: size required: __Q7__',
          'Type of nature walk booked: the __Q8__ walk',
          'Type of park pass: the __Q9__ pass',
          'Donation programme selection: the __Q10__ programme',
        ], { 1: 'Southern', 2: 'Mountain', 3: 'tent', 4: 'truck', 5: 'QY0918', 6: 'April 12/12 April/12th April/April 12th/12th of April', 7: 'small', 8: 'flower', 9: 'one-year/one year', 10: 'youth' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi vùng công viên.', t: ['Is Mount Laguna in the Central or Southern region?', "That's Southern."], p: 'Mount Laguna thuộc vùng phía Nam → Southern' },
        2: { v: 'Khi chọn khu cắm trại.', t: ['The thing is, fishing at Sunrise Campground is only allowed from June to September, so I suggest Mountain.', 'Okay, then.'], p: 'Sunrise chỉ cho câu cá từ tháng 6–9 mà họ đi tháng 4 (bẫy Sunrise) → chọn Mountain' },
        3: { v: 'Khi chọn loại chỗ ở.', t: ['Which type of site offers the most peace and quiet?', 'A tent site would be your best bet.', 'Sounds good to me.'], p: 'Chỗ yên tĩnh nhất là khu cắm lều → tent' },
        4: { v: 'Khi nói về phương tiện.', t: ["If you have a truck, you won't have any trouble.", 'Luckily we do.', "We'll be driving that instead of our car."], p: 'Ô tô hay bị kẹt khi mưa (bẫy car); họ sẽ lái xe tải → truck' },
        5: { v: 'Khi hỏi biển số xe.', t: "That's QY0918.", p: 'Biển số QY0918 → QY0918' },
        6: { v: 'Khi hỏi ngày đi.', t: ["We'll be arriving on April 10th and leaving on the 12th."], p: 'Ngày 10 là ngày đến (bẫy); ngày rời đi là 12/4 → April 12' },
        7: { v: 'Khi nói về hộp đựng thức ăn chống gấu.', t: ["Well, the large one is, but if you get the small size, it's not so heavy.", "Let's do that."], p: 'Hộp lớn nặng (bẫy large); chọn cỡ nhỏ cho nhẹ → small' },
        8: { v: 'Khi chọn chuyến đi bộ ngắm thiên nhiên.', t: ['I love gardening, so the flower walk sounds interesting.', "My son might be more into the waterfall one, but I can't imagine him getting up in time.", 'Could you sign me up?'], p: 'Con trai có thể thích tuyến thác nước nhưng khó dậy sớm (bẫy waterfall); Sandra thích làm vườn và đăng ký tuyến ngắm hoa → flower' },
        9: { v: 'Khi chọn vé vào công viên.', t: ['You have the option of the one-day pass, which would be cheaper, or the one-year pass, which is a better deal if you plan to go to more parks.', "Let's go ahead and get that.", "I'm sure we'll visit more parks soon."], p: 'Vé một ngày rẻ hơn (bẫy); họ sẽ đi thêm nhiều công viên nên chọn vé một năm → one-year' },
        10: { v: 'Khi chọn chương trình quyên góp.', t: ["There's a wildlife programme and a tree planting programme.", "Let's go with the youth programme."], p: 'Động vật hoang dã, trồng cây là lựa chọn khác (bẫy); chọn chương trình cho thanh thiếu niên → youth' },
      },
    },
    {
      part: 2, title: 'Talk to New Hotel Staff', audio: 'Lis/Audio Lis/Test 5/02 Track 2.mp3', cover: 'hotel reception lobby staff | seaside hotel building',
      transcript: `
Good morning, all of you.
I do apologise for being a little late starting our meeting.
One of our guests has been taken ill.
Susie, who's our assistant manager, has driven him to the hospital, but she was in the middle of compiling our weekly report for head office, which is urgent, and I had to finish writing it for her.
Now, this is the first day of work at the Ocean Edge Hotel for all of you.
Let me say something that might surprise you.
Well, you've all got a qualification in hospitality, and some of you have got very high grades.
But to me, what counts most is that you enjoy the contact with guests and really want to make a career in the hospitality industry.
You'll be getting some very valuable experience here, so make the most of it.
A few words about the history of the Ocean Edge Hotel.
There have been buildings on this site for about 250 years.
We know that in the 18th century there was a bakery here, when the town was very new.
The building was destroyed by fire in the early 19th century, and houses were constructed on the site.
These, in their turn, were demolished in the middle of the 20th century and replaced by the hotel.
I think it's fair to say that this is a popular place to work.
We're always getting job applications from local people, even when we haven't any vacancies.
And whereas in many hotels staff tend to stay for a year or even less, here five is pretty standard.
And in fact, several of our staff have been here for ten years or more.
You're the first people we've appointed in the last three years, and we only needed to do that because we're currently constructing 25 new bedrooms.
Depending on their location, hotels usually have mostly business guests or mostly tourists.
We attract a large number of tourists who come to spend a few days beside the ocean.
We also have quite a lot of people who are here on business and perhaps stay for one or two nights.
What we've noticed recently, though, is that we're getting more and more regulars.
People staying here for four nights every week, because they have jobs in this locality, but live somewhere else in the country, so they go home for the weekend.
Now let me give you an idea of the layout of the hotel.
All the bedrooms are along walkways in the gardens, and the main building, which we're in now, has most of the other rooms that guests use.
Obviously, when they arrive, the first place they find themselves in is the reception area, where we're sitting.
The desk is over on the right of the entrance, and the office is immediately behind it.
There's a connecting door from the desk itself, and another entrance from the corridor.
A lot of local residents hire the function room for parties and other events.
This is right at the front of the hotel, on the left of the reception area, opposite the desk.
This room is booked several evenings a week, and most weekends.
It's a major source of income.
Companies are very important customers for us, and a large number of local firms hold conferences here.
To reach the main conference room, you go past the fountain as far as you can, and the doors are directly in front of you.
The meeting room is often hired by companies and other local organisations for small gatherings.
For this room, you turn into the corridor at the side of the reception desk and you'll see the room facing you at the end of the corridor.
Our restaurant is open to the public, as well as to hotel residents, and I'm pleased to say it has a very good reputation locally.
You turn left, just before the fountain, as though you're heading for the guests' rooms, and it's the large room on your right.
Next, I should mention that there is...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nTalk to new hotel staff', [
          [11, 'Why has the manager arrived late at this meeting?', ['He had to complete a report.', 'He had to speak to head office.', 'He had to take a guest to hospital.'], 'A'],
          [12, 'What is the main thing the manager is looking for in his staff?', ['experience', 'enthusiasm', 'good qualifications'], 'B'],
          [13, 'When did the Ocean Edge Hotel first open?', ['in the 18th century', 'in the 19th century', 'in the 20th century'], 'C'],
          [14, 'How long do staff generally remain at the hotel?', ['three years', 'five years', 'ten years'], 'B'],
          [15, 'Which group of guests is growing fastest?', ['tourists visiting local attractions', 'people staying for one or two nights on business', 'people working locally who go home at weekends'], 'C'],
        ], 'Questions 11-15'),
        map('Label the plan below.\nWrite the correct letter, A-I, next to Questions 16-20.', [
          [16, 'Office', 'I'],
          [17, 'Function room', 'F'],
          [18, 'Main conference room', 'B'],
          [19, 'Meeting room', 'H'],
          [20, 'Restaurant', 'C'],
        ], { pdf: 'Lis/L-TEST 5.pdf', page: 3, box: [425, 430, 1725, 1475] }, 'Questions 16-20 – Plan of hotel: main building'),
      ],
      expl: {
        11: { v: 'Đầu bài, khi người quản lý xin lỗi vì đến muộn.', t: ["Susie, who's our assistant manager, has driven him to the hospital, but she was in the middle of compiling our weekly report for head office, which is urgent, and I had to finish writing it for her."], p: 'Trợ lý chở khách đi viện chứ không phải ông (bẫy C), báo cáo gửi trụ sở chứ không nói chuyện với trụ sở (bẫy B); ông phải viết nốt bản báo cáo → A' },
        12: { v: 'Khi nói điều ông coi trọng ở nhân viên.', t: ["Well, you've all got a qualification in hospitality, and some of you have got very high grades.", 'But to me, what counts most is that you enjoy the contact with guests and really want to make a career in the hospitality industry.'], p: 'Bằng cấp mọi người đều có (bẫy C); quan trọng nhất là thích tiếp xúc với khách và thật sự muốn theo nghề → sự nhiệt tình → B' },
        13: { v: 'Khi kể lịch sử khách sạn.', t: ['These, in their turn, were demolished in the middle of the 20th century and replaced by the hotel.'], p: 'Thế kỷ 18 là tiệm bánh, thế kỷ 19 là nhà ở (bẫy A, B); giữa thế kỷ 20 khách sạn mới được xây → C' },
        14: { v: 'Khi nói nhân viên ở lại bao lâu.', t: ['And whereas in many hotels staff tend to stay for a year or even less, here five is pretty standard.', 'And in fact, several of our staff have been here for ten years or more.'], p: 'Chỉ vài người ở 10 năm (bẫy C), 3 năm là lần tuyển gần nhất (bẫy A); 5 năm là mức thông thường → B' },
        15: { v: 'Khi nói về các nhóm khách.', t: ["What we've noticed recently, though, is that we're getting more and more regulars.", 'People staying here for four nights every week, because they have jobs in this locality, but live somewhere else in the country, so they go home for the weekend.'], p: 'Khách du lịch và khách công tác đã đông sẵn; nhóm tăng ngày càng nhiều là người làm việc ở địa phương, cuối tuần về nhà → C' },
        16: { v: 'Khi chỉ văn phòng.', t: ['The desk is over on the right of the entrance, and the office is immediately behind it.', "There's a connecting door from the desk itself, and another entrance from the corridor."], p: 'Ngay sau quầy lễ tân bên phải lối vào → I' },
        17: { v: 'Khi chỉ phòng tổ chức sự kiện.', t: 'This is right at the front of the hotel, on the left of the reception area, opposite the desk.', p: 'Phía trước khách sạn, bên trái khu lễ tân, đối diện quầy → F' },
        18: { v: 'Khi chỉ phòng hội nghị chính.', t: 'To reach the main conference room, you go past the fountain as far as you can, and the doors are directly in front of you.', p: 'Đi qua đài phun nước tới cuối, cửa ngay trước mặt → B' },
        19: { v: 'Khi chỉ phòng họp.', t: "For this room, you turn into the corridor at the side of the reception desk and you'll see the room facing you at the end of the corridor.", p: 'Rẽ vào hành lang cạnh quầy lễ tân, phòng ở cuối hành lang → H' },
        20: { v: 'Khi chỉ nhà hàng.', t: "You turn left, just before the fountain, as though you're heading for the guests' rooms, and it's the large room on your right.", p: 'Rẽ trái ngay trước đài phun nước như đi về phía phòng khách, phòng lớn bên phải → C' },
      },
    },
    {
      part: 3, title: 'Presentation on African Art', audio: 'Lis/Audio Lis/Test 5/03 Track 3.mp3', cover: 'Ife bronze head sculpture | African art museum sculpture',
      transcript: `
Tutor:
OK, Terence.
Now, I've looked through your preliminary outline and notes for the presentation on the art of the Ife region in Africa.
That's in Nigeria, right?
Terence:
Yes.
I'm concentrating on Ife sculptures from the 12th to the 15th century.
Tutor:
How did you get interested in that?
I know there have been some recent articles in the journals about African sculpture.
Terence:
Well, I've read most of those now, but initially I got my introduction to this at a special display at the City Museum a few years ago.
I just happened to be there and saw these works and thought they were fantastic.
And I even went to Nigeria last summer to see more of them.
Tutor:
I've seen the photos for your presentation and I must say the sculptures are gorgeous portrayals of what appear to be kings and queens.
Terence:
Yes, I decided to concentrate on those as they're the most typical.
They're interesting because they're so naturalistic, unlike the abstract figures we often associate with African art.
There's also a lovely sculpture of a mudfish and one of a scaly crocodile, but I didn't get very good pictures of those, so I won't spend long on them.
Tutor:
Right.
So what was the city of Ife like when these works were made?
It's on the Niger River, isn't it?
Terence:
Yeah.
The boat traffic's what made it a centre of commerce then, as it still is today, but nowadays it's better known as the home of a big university.
Tutor:
Speaking of modern-day Ife, tell me about your trip.
Terence:
I was incredibly lucky to be able to get enough money to go.
My parents encouraged me, but they couldn't afford to send me.
I applied for a grant from the Arts Council, and in the end I got it.
I also wrote a series of articles about my trip for the local newspaper, but I didn't get any money for that.
I was just pleased to get them published.
Tutor:
And the highlight of the trip?
Terence:
That had to be meeting a professor, working on the site in Ife, who had been a young boy when they first discovered the sculptures by accident at a building site in 1938.
He had been working at the site.
Of course, I also got to talk to lots of artists who are working there today, and I got to try my hand at making a little sculpture myself.
Tutor:
Well, let's see what you might do to improve what you're planning for your presentation.
Terence:
About the sculptures themselves, I think I need to add as much as possible about the details of the way they were made.
Of course, I can't add anything about the artists who made them, because nobody really knows anything about them.
Tutor:
All good points.
And you've certainly said enough about what the sculptures depict, what the subjects are.
That's well covered.
But I'd make some bigger photos of them so you can clearly see the fine detail.
Terence:
OK.
Tutor:
And I would limit my personal reactions to these works of art if I were you.
I know you think they're fantastic.
Terence:
You're right.
I'll contain my enthusiasm.
What about the section of the presentation which I call history?
I'd like to go into more depth about the history of that whole area, you know, in the countries around Nigeria.
Tutor:
That would make the presentation stronger, but I think you've covered the situation regarding the rulers of the country quite well, and you've got plenty already about what the Ife people were doing then and the way their society was structured.
And in fact, I think you could cut out the bit about modern Nigerian history because it's not relevant.
Terence:
I agree.
That doesn't fit.
But perhaps I should concentrate more on the religious beliefs, since all these sculptures do seem to have some kind of religious association.
Tutor:
Good.
I can lend you a book on that.
Now, probably the part the class will find most interesting is the report of your trip to Nigeria and the research you did there.
So, I gather you managed to use the university library in Ife?
Terence:
Yes.
As soon as I'd explained why I wanted the information, that was no problem.
They couldn't have been more helpful.
There were some interesting accounts of how the first sculptures were found and what happened to them, which I want to include.
What struck me when I saw the sculptures in Nigeria is the extent to which 20th century European artists were influenced by them, but that's beyond the scope of my presentation, I think.
Tutor:
Yes.
What about the sources of the materials they used?
You don't mention that anywhere.
Terence:
I didn't manage to find out much about that.
I want to cover the theories about who the original sculptors were, though.
Tutor:
Yes, the idea that a lot of them may have been made by the same person.
That's very interesting.
Terence:
It is, isn't it?
Right, well, thanks for all the advice.
Tutor:
Now I think I need to work...`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nPresentation on African art', [
          [21, 'What first attracted Terence to the topic of Ife sculptures?', ['He read several journal articles.', 'He attended an exhibition.', 'He spent some time in Nigeria.'], 'B'],
          [22, 'In his presentation Terence will focus on sculptures featuring', ['abstract designs.', 'fish and wild animals.', 'people.'], 'C'],
          [23, 'How did Terence finance his trip to Ife?', ['He received money from an arts organisation.', 'His mother and father paid for him.', 'He wrote about the trip for a newspaper.'], 'A'],
          [24, 'What was most memorable for Terence about his trip?', ['helping at an archaeological site', 'the professor he met', 'the artists he got to know'], 'B'],
        ], 'Questions 21-24'),
        multi('Choose TWO letters, A-E.', 25, 'Which TWO additions will Terence make to the part of the presentation on the sculptures?', ['enlarged pictures of the sculptures', 'more material about the subjects', 'more about his personal opinion of the art works', 'extra information about the techniques used', 'additional information about the artists'], ['A', 'D'], 'Questions 25-26'),
        multi('Choose TWO letters, A-E.', 27, 'Which TWO additions will Terence make to the section on history?', ['data about the kings in the Ife area', 'extra information about the surrounding region', 'examination of the beliefs of the Ife people', 'an explanation of the development of modern Ife', 'more details of past activities of the Ife people'], ['B', 'C'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO features of his research in Nigeria will Terence discuss in his presentation?', ['the influence of the sculptures on western artists', 'the uncertainty over who made the sculptures', 'the source of the materials used for the sculptures', 'the problems he faced in collecting information', 'the original discovery of the sculptures'], ['B', 'E'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi giảng viên hỏi Terence bắt đầu quan tâm thế nào.', t: ["Well, I've read most of those now, but initially I got my introduction to this at a special display at the City Museum a few years ago."], p: 'Đọc báo là sau này (bẫy A), đi Nigeria là hè năm ngoái (bẫy C); ban đầu là xem một cuộc trưng bày đặc biệt ở bảo tàng → triển lãm → B' },
        22: { v: 'Khi nói về các bức tượng trong bài.', t: ['I must say the sculptures are gorgeous portrayals of what appear to be kings and queens.', "Yes, I decided to concentrate on those as they're the most typical.", "There's also a lovely sculpture of a mudfish and one of a scaly crocodile, but I didn't get very good pictures of those, so I won't spend long on them."], p: 'Tượng cá, cá sấu sẽ không nói nhiều (bẫy B), tượng rất tự nhiên chứ không trừu tượng (bẫy A); tập trung vào tượng vua và hoàng hậu → con người → C' },
        23: { v: 'Khi kể về tiền cho chuyến đi.', t: ["My parents encouraged me, but they couldn't afford to send me.", 'I applied for a grant from the Arts Council, and in the end I got it.', "I also wrote a series of articles about my trip for the local newspaper, but I didn't get any money for that."], p: 'Bố mẹ không đủ tiền (bẫy B), viết báo không được trả tiền (bẫy C); nhận tài trợ từ Hội đồng Nghệ thuật → A' },
        24: { v: 'Khi hỏi điểm đáng nhớ nhất.', t: 'That had to be meeting a professor, working on the site in Ife, who had been a young boy when they first discovered the sculptures by accident at a building site in 1938.', p: 'Gặp các nghệ sĩ chỉ là thêm (bẫy C); điểm nổi bật nhất là gặp vị giáo sư → B' },
        25: { v: 'Khi giảng viên góp ý phần về các bức tượng.', t: ["And you've certainly said enough about what the sculptures depict, what the subjects are.", "But I'd make some bigger photos of them so you can clearly see the fine detail.", "Of course, I can't add anything about the artists who made them, because nobody really knows anything about them."], p: 'Chủ đề đã đủ (B sai), không thêm gì về nghệ nhân (E sai), hạn chế cảm nhận cá nhân (C sai); làm ảnh to hơn → ảnh phóng to → A' },
        26: { v: 'Khi Terence nói sẽ bổ sung gì cho phần các bức tượng.', t: 'About the sculptures themselves, I think I need to add as much as possible about the details of the way they were made.', p: 'Thêm chi tiết về cách làm ra tượng → kỹ thuật → D → D' },
        27: { v: 'Khi bàn phần lịch sử.', t: ["I'd like to go into more depth about the history of that whole area, you know, in the countries around Nigeria.", 'That would make the presentation stronger'], p: 'Đi sâu hơn về lịch sử các nước quanh Nigeria và giảng viên đồng ý → thêm thông tin về vùng xung quanh → B' },
        28: { v: 'Ngay sau đó.', t: ["I think you've covered the situation regarding the rulers of the country quite well", 'But perhaps I should concentrate more on the religious beliefs, since all these sculptures do seem to have some kind of religious association.', 'Good.'], p: 'Về các vị vua và hoạt động của người Ife đã đủ (A, E sai), lịch sử Nigeria hiện đại bị bỏ (D sai); tập trung thêm vào tín ngưỡng → C' },
        29: { v: 'Khi bàn phần nghiên cứu ở Nigeria.', t: ["I didn't manage to find out much about that.", "I want to cover the theories about who the original sculptors were, though."], p: 'Nguồn vật liệu không tìm được gì (C sai); muốn nói về các giả thuyết ai là người tạc tượng → sự không chắc chắn về người làm ra tượng → B' },
        30: { v: 'Khi nói về thư viện đại học ở Ife.', t: ['There were some interesting accounts of how the first sculptures were found and what happened to them, which I want to include.', "What struck me when I saw the sculptures in Nigeria is the extent to which 20th century European artists were influenced by them, but that's beyond the scope of my presentation, I think."], p: 'Ảnh hưởng tới nghệ sĩ châu Âu nằm ngoài phạm vi bài (A sai), thư viện rất hữu ích nên không gặp khó khăn (D sai); sẽ đưa vào chuyện các bức tượng được phát hiện ra sao → E' },
      },
    },
    {
      part: 4, title: 'Reasons For and Against Urban Migration', audio: 'Lis/Audio Lis/Test 5/04 Track 4.mp3', clip: [0, 374], cover: 'city skyline aerial | urban migration crowded city',
      transcript: `
Good morning, everyone.
Today we're looking at urban migration, the movement of people migrating from outside cities into cities.
I think it's easy to jump to the conclusion that a rural lifestyle is greener.
However, recent studies have suggested otherwise.
First of all, if we take the land area of the earth, the proportion that cities take up is a mere 3%, and these same cities actually produce 30-40% of the carbon that is released into the atmosphere, a lower amount than the 60-70% from non-urban areas.
Anyway, let's imagine that most people decide to migrate to the city.
What kind of impact would that have?
For a start, this movement of people from the countryside should lift the pressure of intensive agriculture from the land, allowing forests to regenerate.
Another point in favour of urban migration is that it can be far more energy efficient if services are concentrated in the city, for example.
This is true for electricity and, as you can imagine, water.
Then, once you remember that rural communities are often very spread out, you can see yet another green reason to live in the city.
Rural citizens rely on the car to make their journeys far more than city dwellers who have other more environmentally friendly forms of transport that they can use, such as buses and trains.
The journeys tend to be shorter too.
Yet another point in favour of urban migration is the kind of recycling schemes that can only take place where the population is concentrated.
Take, for instance, Seattle in the USA, where methane gas is being put to good use and is generating energy for the city.
It's produced from the city's rubbish, which could not be collected so efficiently from rural areas.
Now, another factor that threatens the environment is the growing world population.
It's estimated that 75 million babies are now born every year and in some countries the birth rate shows no signs of slowing down.
Urban migration may provide an answer here.
Now in cities, one of the reasons that women tend to have fewer children is that they get married later and start their families later.
And the reason for this is that it's far easier to find a job, and once you have one, to get a promotion.
So yes, the focus isn't on bearing children.
Well, it would be foolish to pretend that there are no downsides to urban living when clearly there are.
The thing that critics often mention is the idea that migrants may end up losing their culture, although some studies have found the opposite is true.
Rather than give up their traditions, people actually work hard to maintain them.
More evident is the fact that compared to the lower rate that is observed in rural areas, we can see that there is more crime occurring in cities.
There won't be many of us here today who can say we haven't been directly or indirectly affected by it.
There's another issue that we have to deal with.
So many cities, including our own, now suffer from high levels of pollution so that the air we breathe is far from pure.
And another factor against the 'urban is greener' idea is that urbanisation often drives a country's economy.
Put simply, when there is greater wealth in society, more energy is consumed.
One of the direct effects of a stronger economy, something that many citizens will now experience every day and may well find stressful, is the amount of traffic on the road, despite the other options we mentioned earlier.
This is a problem that is not about to go away, although there are some solutions that could be considered.
Let's have a look at some of those...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Reasons for and against urban migration', [
          '<strong>Cities today</strong>',
          "• account for 3% of our planet's land area",
          '• produce less __Q31__ than non-urban areas',
          '<strong>The advantages of more people moving to the city</strong>',
          '• some __Q32__ would recover',
          '• more energy efficient for services like electricity and water',
          '• __Q33__ in the city is more environmentally friendly',
          '• Recycling: energy could be generated from the methane gas from __Q34__',
          '• Population: urban women',
          '   – start a family much later',
          '   – are more likely to gain __Q35__ at work',
          '<strong>The downsides of living in the city</strong>',
          '• possible loss of __Q36__ amongst some migrants',
          '• the higher __Q37__ rate among the population',
          '• the poor quality of the __Q38__',
          '• Economic factors: increased __Q39__ in a population leads to more energy consumption',
          '• citizens may find the quantity of daily __Q40__ stressful',
        ], { 31: 'carbon', 32: 'forests', 33: 'transport', 34: 'rubbish', 35: 'promotion', 36: 'culture', 37: 'crime', 38: 'air', 39: 'wealth', 40: 'traffic' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về các thành phố ngày nay.', t: 'these same cities actually produce 30-40% of the carbon that is released into the atmosphere, a lower amount than the 60-70% from non-urban areas.', p: 'Thành phố thải ra ít carbon hơn khu vực ngoài đô thị → carbon' },
        32: { v: 'Khi nói ưu điểm đầu tiên.', t: 'For a start, this movement of people from the countryside should lift the pressure of intensive agriculture from the land, allowing forests to regenerate.', p: 'Regenerate = recover: rừng được phục hồi → forests' },
        33: { v: 'Khi so sánh việc đi lại.', t: 'Rural citizens rely on the car to make their journeys far more than city dwellers who have other more environmentally friendly forms of transport that they can use, such as buses and trains.', p: 'Người thành phố có phương tiện giao thông thân thiện với môi trường hơn → transport' },
        34: { v: 'Khi nói về tái chế ở Seattle.', t: ["Take, for instance, Seattle in the USA, where methane gas is being put to good use and is generating energy for the city.", "It's produced from the city's rubbish, which could not be collected so efficiently from rural areas."], p: 'Khí methane sinh ra từ rác của thành phố → rubbish' },
        35: { v: 'Khi nói về phụ nữ thành thị.', t: "And the reason for this is that it's far easier to find a job, and once you have one, to get a promotion.", p: 'Dễ tìm việc và được thăng chức → promotion' },
        36: { v: 'Khi nói mặt trái của đời sống thành thị.', t: 'The thing that critics often mention is the idea that migrants may end up losing their culture', p: 'Người di cư có thể mất đi văn hoá của mình → culture' },
        37: { v: 'Ngay sau đó.', t: 'More evident is the fact that compared to the lower rate that is observed in rural areas, we can see that there is more crime occurring in cities.', p: 'Tỷ lệ tội phạm ở thành phố cao hơn → crime' },
        38: { v: 'Khi nói về ô nhiễm.', t: 'So many cities, including our own, now suffer from high levels of pollution so that the air we breathe is far from pure.', p: 'Không khí ta thở không trong lành → chất lượng không khí kém → air' },
        39: { v: 'Khi nói yếu tố kinh tế.', t: 'Put simply, when there is greater wealth in society, more energy is consumed.', p: 'Xã hội giàu hơn thì tiêu thụ nhiều năng lượng hơn → wealth' },
        40: { v: 'Ngay sau đó.', t: 'One of the direct effects of a stronger economy, something that many citizens will now experience every day and may well find stressful, is the amount of traffic on the road', p: 'Lượng xe cộ trên đường gây căng thẳng hằng ngày → traffic' },
      },
    },
  ],
};
