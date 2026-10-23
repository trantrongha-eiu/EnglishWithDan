// Vol 6 – Test 4 (PDF "Lis/L-TEST 4.pdf" p1–6; key "Lis/L-key.pdf" p4; audio "Lis/Audio Lis/Test 4/01–04 Track N.mp3").
// Question text typed from "Lis/Full Listening.docx" (OCR of the paper) and checked against the scan.
// Track 1 opens with the whole-test introduction (0–50 s) → clip from "Part 1"; Track 4 carries 10 min of transfer silence → clip.
// Transcript: Whisper turbo (sentences + pitch for turns) checked against large-v3; passages both models drop or garble were
// re-heard with wb.js: P2 74–116 s (Seekers / Hidden Box), P3 188–226 s (distribution), P4 234–272 s (climate).
// Source errors fixed: key Q25 A (delivery times) → C — the recording sets time aside ("Of course, there's the whole idea of
// managing time… but I'd like to read up on the effects of managing all distribution from just one office") = centralisation.
// The key page heads Part 2 "Questions 21-30" (typo).
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 6, test: 4,
  sections: [
    {
      part: 1, title: 'Coxhead Motorhomes', audio: 'Lis/Audio Lis/Test 4/01 Track 1.mp3', clip: [50, 450], cover: 'motorhome countryside road | campervan rental',
      transcript: `
Dave:
Hello, Coxhead Motorhomes, Dave Sparrow speaking.
Christy:
Oh, hi.
I would like to inquire about renting an RV for a week.
I think you call them motorhomes in the UK?
Dave:
Yes, we do.
Well, we should be able to help you there.
So, what type were you thinking of?
Christy:
It's just for two of us, me and my husband.
Dave:
Right, the best model for you would be the two-berth end kitchen.
That's the one with the sitting and sleeping area in the middle and the other facilities at the back.
Christy:
Yes, that sounds good.
And what sort of price is that?
Dave:
The cost starts at £545 a week, depending on when you want it for.
If it's high season, it goes up to £755.
Christy:
And is that all inclusive?
Dave:
There's what we call a damage deposit.
That's fully refundable if the vehicle is returned in good condition.
That depends on the driver's age.
You do have to be at least 21 to drive one of these vehicles.
Christy:
That's OK.
I'm 24.
Dave:
Well, in that case, if you're driving the vehicle, the deposit would be £460.
It goes down to £250 for drivers of 26 and above.
Christy:
And do I have to pay more if my husband drives as well?
Dave:
No, extra drivers are free.
Christy:
Great.
We have to pay a supplement for that in the States.
Dave:
So, you've driven one of these before, have you?
Christy:
Yes, but only in America.
Oh, that reminds me, about my driving licence.
I've got an international one, is that OK?
Dave:
That's fine.
Christy:
And I just have a few questions about the motorhomes, if that's all right?
Dave:
Go ahead.
Christy:
So, first of all, can you tell me how old your vehicles are, on average?
Dave:
They're all less than 30 months, so you're getting a vehicle in peak condition.
Christy:
OK.
And I'd prefer an automatic gearbox, if possible.
Can you do that?
Dave:
I'm afraid not.
They're all manual.
Will that be a problem?
Christy:
Oh, I guess I'll be OK.
It was just a thought.
Dave:
And also, our customers sometimes ask if they can bring their pets along, so if you wanted to do that, it's fine, as long as you make sure they're properly looked after.
Christy:
Oh, well, that won't apply to us, but it's nice to know.
And I suppose there are cooking facilities in the motorhome?
Dave:
Yes, there's everything you need for cooking.
Christy:
Like a fridge?
Dave:
Yes, and you've got a built-in microwave, too.
Christy:
And you said it sleeps two.
So is that two singles or a double?
Dave:
You can arrange the bed either way.
And you've got a CD player.
And this year we've installed a television in every motorhome as well.
Christy:
Right.
Well, that might be useful if we have a rainy day.
Oh, and what about sat-nav?
I don't suppose that's included, is it?
Dave:
Sure.
We've had that in all our motorhomes for a few years now.
Our customers really appreciate it.
Christy:
Great.
Oh, and what about a rack for my bicycle?
I'd like to take it along.
Dave:
Yes, we can arrange for that.
Christy:
Now, what happens about electricity?
I think we'll probably be staying at campsites most of the time, so, presumably, there'll be mains hook-up there.
But we're going to a music festival for a couple of days, and I don't think they have hook-up there, so we'll need a generator.
Dave:
It's not included, but we can hire one for you.
It'll be £50 for a week.
Christy:
OK.
Now about collection.
I know your company is near Salisbury.
We'll be coming from London.
So what's the best way for us to get to you?
We'll be arriving by train.
Dave:
Well, if you want, we can pick you up from the station.
The nearest station to us is Grateley.
Christy:
I'm sorry?
Dave:
Grateley.
That's spelled G-R-A-T-E-L-E-Y.
There's no charge for that.
Just let us know when you'll be arriving.
So, would you like to go ahead and book a vehicle now?
Christy:
Yes.
So, my name is Christy and my...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Coxhead Motorhomes', [
          'Representative: Dave Sparrow',
          "Model of motorhome recommended: 'Two berth end kitchen'",
          'Cost £545 – £755 per week',
          'Damage deposit: £__Q1__ (for drivers of 21 – 25)',
          'No charge for an __Q2__ driver',
          'An __Q3__ driving licence is acceptable',
          'All vehicles are under 30 months old',
          'All motorhomes have __Q4__ gearboxes',
          "Customers' __Q5__ are allowed",
          '<strong>Facilities</strong>',
          'All cooking facilities including a __Q6__ and a microwave',
          'A __Q7__ (new this year)',
          'Satellite navigation system',
          'A __Q8__ rack',
          'Electricity: mains hook-up or can hire a __Q9__',
          '<strong>Collection</strong>',
          'Nearest station: __Q10__ (customers can be picked up from there)',
        ], { 1: '460', 2: 'extra', 3: 'international', 4: 'manual', 5: 'pets', 6: 'fridge', 7: 'television/TV', 8: 'bicycle/bike', 9: 'generator', 10: 'Grateley' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nói về tiền đặt cọc.', t: ["I'm 24.", "Well, in that case, if you're driving the vehicle, the deposit would be £460.", 'It goes down to £250 for drivers of 26 and above.'], p: '£250 là cho tài xế từ 26 tuổi (bẫy); người 21–25 tuổi cọc £460 → 460' },
        2: { v: 'Khi hỏi chồng lái thêm có mất phí không.', t: 'No, extra drivers are free.', p: 'Tài xế phụ được miễn phí → extra' },
        3: { v: 'Khi hỏi về bằng lái.', t: ["I've got an international one, is that OK?", "That's fine."], p: 'Bằng lái quốc tế được chấp nhận → international' },
        4: { v: 'Khi hỏi về hộp số.', t: ["And I'd prefer an automatic gearbox, if possible.", "I'm afraid not.", "They're all manual."], p: 'Khách muốn số tự động nhưng không có (bẫy automatic); tất cả đều số sàn → manual' },
        5: { v: 'Ngay sau đó.', t: "And also, our customers sometimes ask if they can bring their pets along, so if you wanted to do that, it's fine", p: 'Khách được mang thú cưng theo → pets' },
        6: { v: 'Khi hỏi về đồ nấu ăn.', t: ['Like a fridge?', "Yes, and you've got a built-in microwave, too."], p: 'Có tủ lạnh và lò vi sóng → fridge' },
        7: { v: 'Khi nói tiện nghi mới năm nay.', t: "And this year we've installed a television in every motorhome as well.", p: 'Đầu CD đã có từ trước (bẫy); năm nay mới lắp tivi → television' },
        8: { v: 'Khi hỏi về giá để đồ.', t: ["Oh, and what about a rack for my bicycle?", 'Yes, we can arrange for that.'], p: 'Giá để xe đạp → bicycle' },
        9: { v: 'Khi hỏi về điện.', t: ["But we're going to a music festival for a couple of days, and I don't think they have hook-up there, so we'll need a generator.", "It's not included, but we can hire one for you."], p: 'Lễ hội âm nhạc không có điện nối nên cần thuê máy phát điện → generator' },
        10: { v: 'Khi nói ga tàu gần nhất.', t: ['The nearest station to us is Grateley.', "That's spelled G-R-A-T-E-L-E-Y."], p: 'Salisbury là thành phố gần công ty (bẫy); ga gần nhất được đánh vần G-R-A-T-E-L-E-Y → Grateley' },
      },
    },
    {
      part: 2, title: 'The Citadel Theatre and Youth Arts Festival', audio: 'Lis/Audio Lis/Test 4/02 Track 2.mp3', cover: 'theatre stage performance audience | youth arts festival',
      transcript: `
Presenter:
Today we're pleased to welcome Jan Beamish, who's the director of the Citadel Theatre.
So, Jan, what does the theatre have in store for us in the next few months?
Jan:
Well, at present we've got Comedy Shop, which features five comedians doing sketches.
It's very popular because some of the people watching the show have the chance to come and join in the sketches.
It's had excellent reviews.
Then after that, there's a new play called Seekers.
This is a very beautiful story about childhood featuring Abigail Garrick, who's one of the country's top actors.
But sadly, there are no more tickets left for any of the performances.
We're also putting on The Hidden Box, which is a delightful fantasy about a search for lost treasure.
It goes down very well with youngsters, particularly pre-school, and actually, the whole family will enjoy it too.
There are still quite a number of tickets left for afternoon performances.
For one week only, we've been lucky enough to secure Night Shift, a fascinating new play based on the diary kept by a factory owner in the 19th century.
It's quite a disturbing piece with some violent scenes, so it could be upsetting for some people, but it's certainly well worth seeing if you want to get a new perspective on the industry that built up our town.
Next month sees the start of a production called John Dory, a light-hearted show based on stories from the local area.
Surprisingly, perhaps, it's played to packed houses in other countries in recent months.
Even though the audiences knew nothing about the area, they responded to the humour and warmth of the characters.
And finally, I mustn't forget Vital Signs.
You may well have seen this at the cinema where it won awards both in Britain and in the US, but this new stage version really brings to life the moving true story of a struggling young singer trying to find success.
Presenter:
And this summer, the Citadel is once again supporting the Youth Arts Festival.
Can you tell us a bit about that?
Jan:
Yes.
Well, we're already planning a whole range of activities for young people leading up to this year's Youth Arts Festival, and we're looking for anyone from 8 to 21 years old who's interested not just in performing, but also writing, directing or doing workshops.
The deadline for applications is the 15th of March, and then we aim to have the schedule for the different activities put together by the end of April.
That's just a few months before the festival itself, which will be in the first week of August.
If anyone would like to put on a performance themselves, there's still time to apply.
You can download the application form from our website.
Make sure you complete all the relevant sections.
You need to briefly describe what happens in the performance.
If you want, you can also send a DVD or photos of the performance.
You will be expected to provide your own costumes and music, by the way.
There's also a competition for anyone who's interested in actually writing a short play.
The winning play will be performed at the festival, directed by Steve Taylor from the theatre here, and the writer will have the chance to play one of the roles if he or she wants to.
Last year's winning play was even shown on national TV afterwards.
The highlight of the festival will be a production of the experimental play Calcamon, acted and written entirely by young people.
The play is all about communication, and each actor writes a sort of made-up language for his or her role during the performance, which no one else can understand.
We hope it will be a really enjoyable ending to all these months of preparation, and that the whole experience will be a rewarding one for everyone who's taken part.`,
      groups: [
        matching('What information does the woman give about the following events at the Citadel theatre?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 11-16.',
          ['adapted from a film', 'audience are invited on stage', 'enjoyed by young children', 'features a local actor', 'fully booked', 'not suitable for everyone', 'recently performed abroad', 'very few tickets available'], [
            [11, 'Comedy Shop', 'B'],
            [12, 'Seekers', 'E'],
            [13, 'The Hidden Box', 'C'],
            [14, 'Night Shift', 'F'],
            [15, 'John Dory', 'G'],
            [16, 'Vital Signs', 'A'],
          ], { title: 'Information', groupTitle: 'Questions 11-16' }),
        mc('Choose the correct letter, A, B or C.\n\nYouth Arts Festival', [
          [17, 'When will the programme for the Youth Arts Festival be finalised?', ['the middle of March', 'the end of April', 'the beginning of August'], 'B'],
          [18, 'An application to put on a performance at the festival must include', ['a DVD of the performance.', 'a short summary of the performance.', 'details of costumes and music used in the performance.'], 'B'],
          [19, 'The winner of the play-writing competition will be offered the chance to', ['take part in their own play.', 'have their play shown on TV.', 'direct their play at the festival.'], 'A'],
          [20, "What is unusual about the production of 'Calcamon'?", ['Actors use invented language.', 'There is no script.', 'The actors change roles in the performance.'], 'A'],
        ], 'Questions 17-20'),
      ],
      expl: {
        11: { v: 'Khi giới thiệu Comedy Shop.', t: "It's very popular because some of the people watching the show have the chance to come and join in the sketches.", p: 'Một số khán giả được lên tham gia các tiểu phẩm → khán giả được mời lên sân khấu → B' },
        12: { v: 'Khi giới thiệu vở Seekers.', t: ["This is a very beautiful story about childhood featuring Abigail Garrick, who's one of the country's top actors.", 'But sadly, there are no more tickets left for any of the performances.'], p: 'Diễn viên hàng đầu cả nước chứ không phải diễn viên địa phương (bẫy D); không còn vé cho bất kỳ suất nào → kín chỗ → E' },
        13: { v: 'Khi giới thiệu The Hidden Box.', t: ['It goes down very well with youngsters, particularly pre-school, and actually, the whole family will enjoy it too.', 'There are still quite a number of tickets left for afternoon performances.'], p: 'Vẫn còn khá nhiều vé (bẫy H); rất được trẻ nhỏ, nhất là tuổi mẫu giáo, yêu thích → C' },
        14: { v: 'Khi giới thiệu Night Shift.', t: "It's quite a disturbing piece with some violent scenes, so it could be upsetting for some people", p: 'Có cảnh bạo lực, có thể khiến một số người khó chịu → không phù hợp với mọi người → F' },
        15: { v: 'Khi giới thiệu John Dory.', t: "Surprisingly, perhaps, it's played to packed houses in other countries in recent months.", p: 'Gần đây đã diễn kín rạp ở các nước khác → mới diễn ở nước ngoài → G' },
        16: { v: 'Khi giới thiệu Vital Signs.', t: 'You may well have seen this at the cinema where it won awards both in Britain and in the US, but this new stage version really brings to life the moving true story', p: 'Đã chiếu ở rạp phim, nay là phiên bản sân khấu → chuyển thể từ phim → A' },
        17: { v: 'Khi nói lịch của Liên hoan Nghệ thuật Trẻ.', t: ['The deadline for applications is the 15th of March, and then we aim to have the schedule for the different activities put together by the end of April.', "That's just a few months before the festival itself, which will be in the first week of August."], p: '15/3 là hạn nộp đơn, tháng 8 là lúc diễn ra liên hoan (bẫy A, C); lịch hoạt động hoàn tất cuối tháng 4 → B' },
        18: { v: 'Khi nói về đơn đăng ký biểu diễn.', t: ['You need to briefly describe what happens in the performance.', 'If you want, you can also send a DVD or photos of the performance.', 'You will be expected to provide your own costumes and music, by the way.'], p: 'DVD là tuỳ chọn (bẫy A), trang phục và nhạc là tự chuẩn bị (bẫy C); bắt buộc mô tả ngắn gọn buổi diễn → B' },
        19: { v: 'Khi nói về cuộc thi viết kịch.', t: ['The winning play will be performed at the festival, directed by Steve Taylor from the theatre here, and the writer will have the chance to play one of the roles if he or she wants to.', "Last year's winning play was even shown on national TV afterwards."], p: 'Đạo diễn là Steve Taylor (bẫy C), lên TV là vở năm ngoái (bẫy B); tác giả được đóng một vai → tham gia vở của chính mình → A' },
        20: { v: 'Khi nói về vở Calcamon.', t: 'The play is all about communication, and each actor writes a sort of made-up language for his or her role during the performance, which no one else can understand.', p: 'Mỗi diễn viên tự tạo một thứ ngôn ngữ riêng → dùng ngôn ngữ tự sáng tạo → A' },
      },
    },
    {
      part: 3, title: 'Assignment on Multinational Companies', audio: 'Lis/Audio Lis/Test 4/03 Track 3.mp3', cover: 'global business multinational | chocolate brand supermarket',
      transcript: `
Tutor:
Hello, Lara.
Thank you for coming in to discuss the work you've done so far on your assignment on multinational companies.
I've had a good look at it.
I'm interested in your research on this chocolate and its brand image.
You've shown that it's quite different in different markets and the differences in advertising campaigns, how in some countries it's sold in pretty upmarket places, whereas in others it's sold in supermarkets that appeal to a different customer.
Did you know that they use different amounts of caffeine and sugar to appeal to tastes in different countries, too?
Lara:
Oh, I didn't.
I'll look into that, too.
Do you think this next section on the aim of global marketing is clear?
Tutor:
Well, I got a bit lost when you talked about starting production in another country.
The link to the aim of global marketing could be clearer, but what I thought worked really well was your explanation of how a huge increase in sales is what most companies who go global are after.
Well done.
You could then link that to profits to finish off that section.
Lara:
Yes, that's down on my plan.
Another thing that's grabbed my attention is the messages for young people in advertising by multinationals.
Tutor:
You could follow up on that thought.
Other moral issues come up.
For example, the supermarket chain who offered free plastic bags in a market which is very environment conscious.
Their aim had been to bring in lots of new customers quickly by getting their name seen everywhere in town, but they'd forgotten that that market didn't want any more plastic polluting their environment.
Lara:
A big mistake.
There seems to be a sort of arrogance on the part of some multinationals.
Tutor:
In what way?
Lara:
Well, it's OK if the multinational comes into your country, takes over a company, and introduces better working conditions or new machinery.
But it's the way they often bring in their own management team who ride roughshod over everyone and who don't exactly go in for consultation at local level.
Tutor:
That's an interesting observation.
What do you have in mind for the last section?
Lara:
I'd like to look at distribution.
It can be key to the success or failure of so many businesses.
Of course, there's the whole idea of managing time and what happens when customers don't get their goods on time, but I'd like to read up on the effects of managing all distribution from just one office, because if a company isn't used to that and it's suddenly introduced, it can be chaos.
I looked at the issue of stock control in last term's paper, so I'd rather not revisit that.
Tutor:
Now you need to finish off with a company case study.
And I see you've been looking into some possibilities.
What did you find out about Drummonds?
Lara:
At first I thought they'd be good to illustrate the importance of getting the workforce right, but I'm not sure I'd have enough information.
But what I could use them for is to show how you have to base your company in the right part of the world to benefit from tax advantages.
That's what Drummonds did.
Tutor:
Yes, that could be good.
There's also Multiplan.
I read recently that they've made the classic mistake of going for an international market before they've really grown enough, and that's causing them some headaches.
So no matter where they'd expanded their business to abroad, they'd have faced the same problems.
Lara:
What about Elbeys?
There are really detailed figures showing that by going global, they were in a strong position to negotiate rock-bottom prices for their materials because they were buying in bulk.
Tutor:
Yes, they would be a good choice because it would allow you to present data effectively.
Babbis would be good for that too.
All the figures relating to their staffing levels before and after going global are available.
Lara:
Oh, and they're huge, aren't they?
I did look at how Emerson went to different companies who provided them with components they needed when they went global, and what a huge difference this made to quality.
Tutor:
So, just check through to see which one would give you scope to develop a good case study with a clear focus.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nAssignment on multinational companies', [
          [21, 'The tutor points out to Lara that in different markets, a brand of chocolate', ['has different proportions of the ingredients.', 'uses different methods of advertising.', 'is sold at different prices.'], 'A'],
          [22, 'Which aim of global marketing has Lara explained very clearly?', ['making profit', 'maximising sales', 'expanding production'], 'B'],
          [23, 'The tutor gives the example of the supermarket chain to show how companies', ['can use new advertising methods to bring new business.', 'may fail to take local values into consideration.', 'need time to build up their reputation.'], 'B'],
          [24, 'Lara believes that some multinational companies can be criticised for', ['offering poor working conditions locally.', 'failing to improve machinery.', 'replacing local managers.'], 'C'],
          [25, 'Which aspect of distribution does Lara want to read about?', ['delivery times', 'stock control', 'centralisation'], 'C'],
        ], 'Questions 21-25'),
        matching('Which topic can be found in each of the following case studies?\nChoose FIVE answers from the box and write the correct letter, A-F, next to Questions 26-30.',
          ['bargaining power', 'changing suppliers', 'location of head office', 'mergers', 'size of workforce', 'timing of going global'], [
            [26, 'Drummonds', 'C'],
            [27, 'Multiplan', 'F'],
            [28, 'Elbeys', 'A'],
            [29, 'Babbis', 'E'],
            [30, 'Emerson', 'B'],
          ], { title: 'Topic', groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Khi giảng viên nhận xét phần về thương hiệu sô-cô-la.', t: 'Did you know that they use different amounts of caffeine and sugar to appeal to tastes in different countries, too?', p: 'Quảng cáo khác nhau thì Lara đã viết rồi (bẫy B); điều giảng viên chỉ ra là lượng caffeine và đường khác nhau → tỉ lệ thành phần khác nhau → A' },
        22: { v: 'Khi bàn phần mục tiêu của tiếp thị toàn cầu.', t: 'what I thought worked really well was your explanation of how a huge increase in sales is what most companies who go global are after.', p: 'Phần sản xuất ở nước khác khó hiểu (bẫy C), lợi nhuận là phần sẽ bổ sung (bẫy A); giải thích rất tốt về tăng doanh số → B' },
        23: { v: 'Khi giảng viên nêu ví dụ chuỗi siêu thị.', t: "Their aim had been to bring in lots of new customers quickly by getting their name seen everywhere in town, but they'd forgotten that that market didn't want any more plastic polluting their environment.", p: 'Phát túi nhựa ở thị trường rất quan tâm môi trường → không tính đến giá trị của người dân địa phương → B' },
        24: { v: 'Khi Lara nói về sự ngạo mạn của các công ty đa quốc gia.', t: ["Well, it's OK if the multinational comes into your country, takes over a company, and introduces better working conditions or new machinery.", 'But it\'s the way they often bring in their own management team who ride roughshod over everyone'], p: 'Họ còn cải thiện điều kiện làm việc và máy móc (bẫy A, B); điều đáng chê là đưa đội quản lý của mình vào thay → thay thế quản lý địa phương → C' },
        25: { v: 'Khi Lara nói về phần phân phối.', t: ["Of course, there's the whole idea of managing time and what happens when customers don't get their goods on time, but I'd like to read up on the effects of managing all distribution from just one office", "I looked at the issue of stock control in last term's paper, so I'd rather not revisit that."], p: 'Thời gian giao hàng chỉ được nhắc qua (bẫy A), quản lý kho đã làm kỳ trước (bẫy B); muốn đọc về việc quản lý toàn bộ phân phối từ một văn phòng → tập trung hoá → C (key gốc ghi A, đã sửa theo băng)' },
        26: { v: 'Khi bàn về Drummonds.', t: 'But what I could use them for is to show how you have to base your company in the right part of the world to benefit from tax advantages.', p: 'Lực lượng lao động thì không đủ thông tin (bẫy E); đặt công ty ở đúng nơi để hưởng lợi thuế → vị trí trụ sở → C' },
        27: { v: 'Khi giảng viên nói về Multiplan.', t: "I read recently that they've made the classic mistake of going for an international market before they've really grown enough, and that's causing them some headaches.", p: 'Vươn ra quốc tế khi chưa đủ lớn → thời điểm toàn cầu hoá → F' },
        28: { v: 'Khi Lara nói về Elbeys.', t: 'There are really detailed figures showing that by going global, they were in a strong position to negotiate rock-bottom prices for their materials because they were buying in bulk.', p: 'Ở thế mạnh để đàm phán giá nguyên liệu rất thấp → sức mạnh thương lượng → A' },
        29: { v: 'Khi nói về Babbis.', t: 'All the figures relating to their staffing levels before and after going global are available.', p: 'Số liệu về số lượng nhân viên trước và sau khi toàn cầu hoá → quy mô lực lượng lao động → E' },
        30: { v: 'Khi Lara nói về Emerson.', t: 'I did look at how Emerson went to different companies who provided them with components they needed when they went global, and what a huge difference this made to quality.', p: 'Chuyển sang các công ty khác cung cấp linh kiện → đổi nhà cung cấp → B' },
      },
    },
    {
      part: 4, title: 'Soundscapes', audio: 'Lis/Audio Lis/Test 4/04 Track 4.mp3', clip: [0, 437], cover: 'nature sound recording microphone forest | frogs rainforest night',
      transcript: `
Today I want to talk to you about something called a soundscape.
We all know what a landscape is, that is, the view that you can see from any particular point.
As the name implies, a soundscape comprises all the sounds you can hear at a given time in a particular environment.
The term was first coined by a Canadian called Murray Schafer, a famous composer who became interested in the concept in the late 1960s and early 1970s.
One important aspect of the soundscape is that it is not random, abstract noise, nor is it simply mindless background sound such as the recorded music you hear so often in public places like elevators.
No, the sounds in a soundscape generally have meaning and can be understood and decoded.
The sounds of which a soundscape is composed can be divided into three types.
First, biophony.
These are sounds emitted by living creatures, for example, by frogs, which you undoubtedly know can be extremely loud when heard in trees on a dark, wet night.
Some people love that sound.
Then, the second type of soundscape sound is termed geophony, and that is sound created by non-biological forces.
In our daily life, we're constantly surrounded by these sounds, like the patter of rain, which I myself find incredibly soothing and relaxing.
Some, of course, would disagree.
Lastly, we have the sounds lumped together under the heading of anthrophony, and these refer to sounds made by humans.
An altogether noisy group, I'd say.
Anyhow, the study of the soundscape has attracted many people over the years, including an American called Bernie Krause, who has spent more than 40 years recording the sounds of nature.
He came to several interesting conclusions about the sounds he recorded.
He maintained that every sound has what is referred to as its own signature, which makes it as recognisable and identifiable as when a person writes his own name.
Furthermore, Krause concluded that the sounds of various organisms in an environment are harmonious in two ways.
Firstly, they fit together in terms of loudness, and thus they don't drown each other out.
And secondly, the frequency of each sound is also harmonious with the other sounds.
Scientists who study soundscapes say that overall changes in the sound patterns in a certain place are often important first indicators of a change that is taking place in the climate of that particular area.
This in itself would make a better understanding of soundscapes valuable in trying to assess what is going on in the environment around the world today.
Change in the soundscape may also be a first warning sign of pollution of many kinds.
In fact, it was an absence of birdsong that alerted writer and early ecologist Rachel Carson to the environmental devastation being caused by the understandable attempt by American farmers to control insects.
Soundscape ecologists are using ever more sophisticated equipment to study the sounds of nature, including the state-of-the-art acoustic sound recorders.
The data from these are used to create three-dimensional maps of acoustic features plotted across a landscape.
These can provide a valuable permanent record of the soundscape at a particular time and can be used to note potentially significant changes, such as variation by season.
Now, when I give talks, the most common question that I get asked is, what's the loudest creature in the animal world?
The answer is probably debatable, but it's not a roaring lion or a bellowing elephant.
To the best of my knowledge, it's something found in the ocean.
A shrimp, less than four centimetres long, which makes an explosive sound underwater with its single claw, the equivalent of about 160 decibels in the air.
And that's even more than the noise a rock band makes.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Soundscapes', [
          'Soundscape – the sound environment',
          '• the term was first used by a Canadian, Murray Schafer, a well-known __Q31__',
          '• the soundscape is not just noise, but has __Q32__ which can be interpreted',
          '<strong>Divisions of the soundscape</strong>',
          '• biophony – created by living organisms, e.g. __Q33__',
          '• geophony – caused by non-biological forces, e.g. __Q34__',
          '• anthrophony – made by humans',
          '<strong>Conclusions of Bernie Krause</strong>',
          '• every sound in nature has a unique __Q35__',
          '• the sounds of nature are harmonious in __Q36__ and frequency',
          '<strong>Soundscape changes can be</strong>',
          '• an indication of a change in the __Q37__ of an environment',
          '• a warning of the presence of different types of __Q38__, e.g. insecticides',
          '<strong>Equipment used in the study of soundscapes</strong>',
          '• acoustic recorders – data are used to create __Q39__ in 3-D',
          '<strong>Most common query</strong>',
          '• What is the noisiest creature? Answer: probably a particular kind of __Q40__ which lives in the ocean',
        ], { 31: 'composer', 32: 'meaning', 33: 'frogs', 34: 'rain', 35: 'signature', 36: 'loudness', 37: 'climate', 38: 'pollution', 39: 'maps', 40: 'shrimp' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói ai đặt ra thuật ngữ.', t: 'The term was first coined by a Canadian called Murray Schafer, a famous composer', p: 'Một nhà soạn nhạc nổi tiếng (famous = well-known) → composer' },
        32: { v: 'Khi nói đặc điểm của soundscape.', t: 'No, the sounds in a soundscape generally have meaning and can be understood and decoded.', p: 'Âm thanh có ý nghĩa và có thể giải mã (decoded = interpreted) → meaning' },
        33: { v: 'Khi nói loại biophony.', t: 'These are sounds emitted by living creatures, for example, by frogs', p: 'Ví dụ tiếng ếch → frogs' },
        34: { v: 'Khi nói loại geophony.', t: "In our daily life, we're constantly surrounded by these sounds, like the patter of rain", p: 'Ví dụ tiếng mưa rơi → rain' },
        35: { v: 'Khi nói kết luận của Bernie Krause.', t: 'He maintained that every sound has what is referred to as its own signature', p: 'Mỗi âm thanh có "chữ ký" riêng (unique) → signature' },
        36: { v: 'Ngay sau đó.', t: "Firstly, they fit together in terms of loudness, and thus they don't drown each other out.", p: 'Hài hoà về độ lớn và tần số → loudness' },
        37: { v: 'Khi nói về thay đổi trong soundscape.', t: 'Scientists who study soundscapes say that overall changes in the sound patterns in a certain place are often important first indicators of a change that is taking place in the climate of that particular area.', p: 'Dấu hiệu đầu tiên của sự thay đổi khí hậu ở khu vực → climate' },
        38: { v: 'Ngay sau đó.', t: 'Change in the soundscape may also be a first warning sign of pollution of many kinds.', p: 'Cảnh báo sớm nhiều loại ô nhiễm (vd. thuốc trừ sâu) → pollution' },
        39: { v: 'Khi nói về máy ghi âm.', t: 'The data from these are used to create three-dimensional maps of acoustic features plotted across a landscape.', p: 'Dữ liệu dùng để tạo bản đồ ba chiều → maps' },
        40: { v: 'Khi trả lời câu hỏi con vật ồn nhất.', t: ["To the best of my knowledge, it's something found in the ocean.", 'A shrimp, less than four centimetres long, which makes an explosive sound underwater with its single claw'], p: 'Sư tử, voi bị loại; là một loài tôm dưới đại dương → shrimp' },
      },
    },
  ],
};
