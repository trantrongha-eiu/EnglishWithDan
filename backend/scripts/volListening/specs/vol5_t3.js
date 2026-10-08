// Vol 5 – Test 3 (PDF "Listening/Test 3/Test 3- up.pdf" p1–5; key "Tổng hợp key Listening.pdf" p3; audio Test 3/S1, P2–P4 —
// S1 clipped from "Now turn to section one" (the test introduction comes first); its example is played first and then the
// whole conversation again → transcript keeps the full version only).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns) checked against "Transcripts & Keys/test 3- transcript.pdf".
const { note, mc, multi, matching } = require('../vol_build');

module.exports = {
  vol: 5, test: 3,
  sections: [
    {
      part: 1, title: 'Sailing Courses for Children', audio: 'Listening/Test 3/S1.mp3', clip: [34.5, 431.5], cover: 'children sailing dinghy | sailing lesson marina',
      transcript: `
Staff:
Hello?
Mother:
Oh, good morning.
I'm calling on behalf of my 13-year-old son, Jacob.
He's interested in learning to sail.
Staff:
Great.
Well, we have what we call a taster day on the 22nd of June.
Mother:
I'm not sure he can make it, but we'll see.
Jacob's really interested, though.
So, can you tell me about the courses?
Staff:
OK.
We have two types of courses for children under 16, two-day and five-day.
Mother:
Could you explain the difference?
Staff:
Well, the two-day one just covers basic techniques in sailing.
And on this course, the kids always sail with the instructor they've been allocated.
Mother:
Well, that's good to know.
Staff:
Yeah, and the cost is £65.
Mother:
Oh, I thought it was more than that.
I heard it was £125.
Staff:
That's for the five-day course.
Mother:
OK.
I presume that course goes into much more detail.
Staff:
Yes, and from the third day, the kids are given the choice to sail on their own if they want.
We use the same types of boat, but we help them learn more techniques, in particular how to manage the boat in a variety of types of weather.
Mother:
Hmm, I think Jacob would enjoy that course.
Do you give them a certificate if they complete the course?
Staff:
Absolutely.
We give them out on the final day, which a lot of the kids really like.
Mother:
Great.
Could you tell me a bit more about what the children have to bring and so forth?
Staff:
Well, the most important thing is the clothing.
It goes without saying that whatever the time of year, they should have plenty of warm clothes, as it can be quite cool out on the water.
Mother:
What about footwear?
Do they have to wear anything special?
Staff:
The only rule is that they've got to have shoes of some kind.
They mustn't have bare feet.
Mother:
OK.
Staff:
And we suggest the kids pack an extra pair of trousers, you know, waterproof ones.
They don't have to wear them unless it starts to rain.
Mother:
Fine.
So basically it's just using your common sense.
Staff:
Yes.
Oh, and one other thing we do say is that the children mustn't wear jeans because they get extremely heavy when they're wet.
Mother:
Oh, OK.
One thing I forgot to ask is whether it's possible to get a meal anywhere.
Staff:
I'm afraid not.
But we do have a shop called the Marina Stores where he can get a snack.
Mother:
OK.
And before I forget, when I drop Jacob off, where can I park?
Staff:
Good question.
There's spaces near the entrance, but you have to pay for them.
But there's no charge for the car park just by the bridge.
Do you know it?
Mother:
Oh, yes.
I know where you mean.
Staff:
Now, we do need you to fill in a registration form.
You should send that in a couple of weeks before the course starts.
The form is on the website, but we ask you to print it off and add your signature.
Mother:
Yes, of course.
What sort of information do you need?
Staff:
About your child's swimming ability, any special requirements and so on.
Mother:
Will you need to know who his doctor is?
Staff:
Yes.
Mother:
We've just recently changed surgery, so I'll make a note to get that.
Staff:
And one more thing.
There's a separate form on the website, which is optional, that asks whether you're willing for photographs to be taken during the course.
Mother:
Yes, of course.
No problem.
Staff:
Great.
So, I'll send you...`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Sailing Courses', [
          'Example: There will be a Taster Day on <u>22nd June</u>',
          '<strong>Two-day course</strong>',
          '• This covers basic techniques.',
          '• Children are always accompanied by their __Q1__',
          '• Cost: £__Q2__',
          '<strong>Five-day course</strong>',
          '• Cost: £125',
          '• Children can sail alone from the third day onwards.',
          '• Children learn how to sail in different kinds of weather.',
          '• Children receive a __Q3__ on the last day.',
          '<strong>Clothing</strong>',
          '• Children should wear warm clothes.',
          '• Children must wear __Q4__',
          '• Children are recommended to bring extra trousers which are __Q5__',
          '• Children are not allowed to wear __Q6__',
          '<strong>Additional information</strong>',
          '• Visitors can buy a __Q7__ in the Marina Stores.',
          '• There is a free car park next to the __Q8__',
          '• Send the registration form two weeks before the course.',
          "• Remember to include the name of Jacob's __Q9__",
          '• There is an optional form giving permission to take __Q10__',
        ], { 1: 'instructor', 2: '65', 3: 'certificate', 4: 'shoes', 5: 'waterproof', 6: 'jeans', 7: 'snack', 8: 'bridge', 9: 'doctor', 10: 'photographs/photos' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi giải thích khoá 2 ngày.', t: 'And on this course, the kids always sail with the instructor they\'ve been allocated.', p: 'Trẻ luôn đi thuyền cùng huấn luyện viên được phân công → instructor' },
        2: { v: 'Khi nói giá khoá 2 ngày.', t: ['Yeah, and the cost is £65.', "I heard it was £125.", "That's for the five-day course."], p: '£125 là giá khoá 5 ngày (bẫy); khoá 2 ngày giá £65 → 65' },
        3: { v: 'Khi hỏi về chứng chỉ của khoá 5 ngày.', t: ['Do you give them a certificate if they complete the course?', 'Absolutely.', 'We give them out on the final day'], p: 'Chứng chỉ được phát vào ngày cuối → certificate' },
        4: { v: 'Khi hỏi về giày dép.', t: ["The only rule is that they've got to have shoes of some kind.", "They mustn't have bare feet."], p: 'Quy định duy nhất là phải đi giày → shoes' },
        5: { v: 'Khi nói về quần mang thêm.', t: 'And we suggest the kids pack an extra pair of trousers, you know, waterproof ones.', p: 'Mang thêm một chiếc quần không thấm nước → waterproof' },
        6: { v: 'Khi nói điều cấm mặc.', t: "Oh, and one other thing we do say is that the children mustn't wear jeans because they get extremely heavy when they're wet.", p: 'Không được mặc quần jean vì ướt sẽ rất nặng → jeans' },
        7: { v: 'Khi hỏi chỗ ăn uống.', t: ["One thing I forgot to ask is whether it's possible to get a meal anywhere.", "I'm afraid not.", 'But we do have a shop called the Marina Stores where he can get a snack.'], p: 'Không có bữa ăn (bẫy meal); cửa hàng Marina Stores bán đồ ăn nhẹ → snack' },
        8: { v: 'Khi hỏi chỗ đỗ xe.', t: ["There's spaces near the entrance, but you have to pay for them.", "But there's no charge for the car park just by the bridge."], p: 'Chỗ gần cổng phải trả tiền (bẫy); bãi miễn phí ở cạnh cây cầu → bridge' },
        9: { v: 'Khi hỏi thông tin trên đơn đăng ký.', t: ['Will you need to know who his doctor is?', 'Yes.'], p: 'Cần ghi tên bác sĩ của Jacob → doctor' },
        10: { v: 'Cuối bài, về mẫu đơn tuỳ chọn.', t: "There's a separate form on the website, which is optional, that asks whether you're willing for photographs to be taken during the course.", p: 'Đơn tuỳ chọn xin phép chụp ảnh trong khoá học → photographs' },
      },
    },
    {
      part: 2, title: 'Stanley Island – Travel Tips', audio: 'Listening/Test 3/P2.mp3', cover: 'tropical island ferry | pacific island beach resort',
      transcript: `
Welcome once again to the show where we give you travel tips on popular tourist destinations in the Pacific region.
And today, our focus is on beautiful Stanley Island.
Now, before we get started, a word of warning.
The seaplane service to the island was discontinued last week.
So, for the next month at least, the sole link to the island is provided by the old ferry service, since plans to run a hovercraft service to the island have been delayed.
So what is there to see and do on Stanley Island?
Well, the main tourist areas are on the north, south and east coasts of the island.
As far as recreation goes, in the south you'll find several leisure park lands, such as Waterworld and Fantasy Island, which seem well equipped and reasonably priced.
If it's golf you're after, the 18-hole course in the south of the island is currently being turned into a conference centre.
But don't despair.
There are two excellent courses just 30 minutes away on the east coast.
The south of the island has many large resorts and hotels, with plenty of children's activities and clubs.
This part of the island caters mainly for those seeking luxury to medium-class accommodation.
But the east coast has basic apartment complexes with fully equipped kitchens, so that at least you can cook for yourself.
For those who like to get back to nature, you'll probably find the south coast rather overdeveloped.
The rainforest areas on the west coast are largely inaccessible because of the surrounding mountains.
But those on the north coast are within easy reach and a local agency runs guided treks through the jungle.
If you're into water sports, all of the areas have something to offer.
Now, here are a few bits of advice for those visiting the island for the first time, to make your stay safer and more enjoyable.
The island is generally safe, but it's as well to take a few precautions.
If you're on any medication, bring this with you.
It may not be available on the island.
And it's also a good idea for everyone to pack some insect spray in their luggage.
If you're thinking of going into the more mountainous region in the west of the island, let someone know where you're going.
And remember, the reception for your mobile phone may be unreliable, so don't depend on that.
Take your own water.
Don't drink out of rivers.
You're likely to come across lots of monkeys.
They're cute, but watch out, as they can bite.
Finally, when you're back in the more inhabited areas, take a break from steak and do try the local seafood.
It's fresh and very good value.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'At the present time, Stanley Island can be reached by', ['hovercraft.', 'plane.', 'ferry.'], 'C'],
        ], 'Question 11'),
        matching('Where can the following facilities and attractions be found?\nWrite the correct letter, A, B or C, next to Questions 12-15.',
          ['The North Coast', 'The South Coast', 'The East Coast'], [
            [12, 'golf courses', 'C'],
            [13, 'family hotels', 'B'],
            [14, 'self-catering flats', 'C'],
            [15, 'nature walks', 'A'],
          ], { reuse: true, groupTitle: 'Questions 12-15' }),
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Advice to Visitors', [
          '• Bring your own __Q16__ and insect spray',
          '• It may not be possible to use your __Q17__ in the western area.',
          "• Don't drink water from __Q18__",
          '• Be careful of the __Q19__ as they bite',
          '• Try the local __Q20__',
        ], { 16: 'medication', 17: 'mobile phone/phone/mobile', 18: 'rivers/river', 19: 'monkeys', 20: 'seafood' }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Phần cảnh báo đầu bài.', t: ['The seaplane service to the island was discontinued last week.', 'So, for the next month at least, the sole link to the island is provided by the old ferry service, since plans to run a hovercraft service to the island have been delayed.'], p: 'Thuỷ phi cơ đã ngừng, tàu đệm khí bị hoãn (bẫy A, B); hiện chỉ có phà → C' },
        12: { v: 'Khi nói về sân golf.', t: ["If it's golf you're after, the 18-hole course in the south of the island is currently being turned into a conference centre.", 'There are two excellent courses just 30 minutes away on the east coast.'], p: 'Sân ở phía nam đang thành trung tâm hội nghị (bẫy B); hai sân tốt ở bờ đông → C' },
        13: { v: 'Khi nói về khách sạn.', t: "The south of the island has many large resorts and hotels, with plenty of children's activities and clubs.", p: 'Khách sạn có nhiều hoạt động cho trẻ em → khách sạn gia đình ở bờ nam → B' },
        14: { v: 'Ngay sau đó.', t: 'But the east coast has basic apartment complexes with fully equipped kitchens, so that at least you can cook for yourself.', p: 'Căn hộ có bếp đầy đủ để tự nấu → tự phục vụ ở bờ đông → C' },
        15: { v: 'Khi nói về thiên nhiên.', t: ['The rainforest areas on the west coast are largely inaccessible because of the surrounding mountains.', 'But those on the north coast are within easy reach and a local agency runs guided treks through the jungle.'], p: 'Bờ nam quá phát triển, bờ tây khó tiếp cận (không có trong lựa chọn); bờ bắc có tour đi bộ trong rừng → A' },
        16: { v: 'Phần lời khuyên cho du khách.', t: ["If you're on any medication, bring this with you.", 'It may not be available on the island.'], p: 'Mang theo thuốc đang dùng vì đảo có thể không có → medication' },
        17: { v: 'Khi nói về vùng núi phía tây.', t: "And remember, the reception for your mobile phone may be unreliable, so don't depend on that.", p: 'Sóng điện thoại di động có thể không ổn định → mobile phone' },
        18: { v: 'Khi nói về nước uống.', t: ['Take your own water.', "Don't drink out of rivers."], p: 'Không uống nước sông → rivers' },
        19: { v: 'Khi nói về động vật.', t: ["You're likely to come across lots of monkeys.", "They're cute, but watch out, as they can bite."], p: 'Khỉ dễ thương nhưng có thể cắn → monkeys' },
        20: { v: 'Cuối bài.', t: 'Finally, when you\'re back in the more inhabited areas, take a break from steak and do try the local seafood.', p: 'Thịt bò bít tết là bẫy; hãy thử hải sản địa phương → seafood' },
      },
    },
    {
      part: 3, title: 'Research on Absence from Work', audio: 'Listening/Test 3/P3.mp3', cover: 'empty office desk | employee questionnaire survey',
      transcript: `
Tutor:
Hello, Laura.
Have a seat.
So, I understand you're planning to investigate absence from work for your research project.
Laura:
That's right.
I'm going to base it on a local company called Burcock Engineering.
Tutor:
Is there any particular reason why you've chosen Burcock?
Laura:
Well, I'd originally thought of asking another company, FG Engineering, because I did my placement there and I knew the staff there.
But the CEO wasn't very keen.
But she knows the managing director at Burcock, and she spoke to him, and then he got in touch with me.
Apparently absence is a major problem there, so he's quite interested in having it investigated.
Tutor:
OK.
Laura:
So, my central theme is absence, but I'm thinking of concentrating on long-term absence.
I thought that might allow me to give more helpful feedback to the company.
Tutor:
If I were you, I wouldn't be that specific.
I'd look at absence as a whole.
You might get more interesting results.
Laura:
Oh, OK.
Tutor:
So what's the main thing you expect to find?
Rises in absence rates over time?
Laura:
Not really.
Initially, I wondered if workers often take time off without real justification, but I think that'll be hard to determine.
So, well, I think I may find that it's something to do with what sort of job the employee is doing.
Tutor:
OK.
Now, have you thought how you'll get your information?
Laura:
Well, first of all, I need access to the company records.
Tutor:
Yes, obviously you'll need overall absence figures, though it's unlikely they'll let you have them for individual workers.
And you probably won't have access to personal information, like when they were born, but you should be able to use anonymous details like the type of work they do or how long they've been with the company.
Laura:
OK.
Tutor:
So, let's think a bit more about your questionnaire.
Laura:
I know that it shouldn't be too long or people get bored.
Tutor:
No, but if it's too short, you don't get enough information.
The trick is to get the balance right.
Laura:
I think the questions should be closed questions too.
I mean, where people choose an answer from a list.
Tutor:
But then you miss the chance of getting unexpected information, so I'd include one or two open-ended questions, too.
Laura:
OK.
And I won't ask for names or addresses or anything.
Tutor:
No, it needs to be anonymous.
And after you've drafted it, you need to give it to at least one person to check there aren't any problems.
So you need to leave enough time for that and any revisions necessary.
Laura:
What about the covering letter that I'll send out with the questionnaire?
I'll need to introduce myself and explain what the questionnaire is for, but what else should I include?
Tutor:
I'd reassure people that the survey isn't going to be used to assess them personally, otherwise they might choose not to take part.
Laura:
Yes, I'll make that clear.
And what about when they do it?
Will they be allowed to use work time?
Tutor:
That's really up to their manager, but you should say roughly how much time it'll take.
Laura:
OK.
Tutor:
So now you need to produce a schedule with dates, for example, when you'll send out the questionnaire.
Laura:
Yes, OK.
Once I can arrange that date with the manager, I'll be able to fix the deadline for getting the completed questionnaires back.
And I want to use the time in between to analyse the figures that HR is going to give me from their database, though they haven't said exactly when I'll get them.
Tutor:
And you have to submit your assignment by the end of June?
Laura:
Actually, I have to get it finished by the 2nd, because I've arranged a work placement after that.
Tutor:
OK.
So, our next meeting is two weeks today.
Is that still OK?
Laura:
Yes, and in the meantime, I'll send you an email.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nResearch on absence from work', [
          [21, 'Laura chose Burcock Engineering for her research because', ['she was contacted by the managing director.', 'she knew several people who worked there.', 'she had already done a work placement there.'], 'A'],
          [22, 'What does Laura agree to do regarding the central theme of her research?', ['check it is relevant', 'broaden the focus', 'be more specific in her aims'], 'B'],
          [23, 'What does Laura expect to find from her research?', ['Absence rates are related to the type of work done.', 'A lot of worker absence is actually unnecessary.', 'Employee absence rates are increasing.'], 'A'],
          [24, 'What employee information does the tutor think Laura will be able to obtain from company records?', ['dates of birth', 'details of employment', 'individual records of absence'], 'B'],
        ], 'Questions 21-24'),
        multi('Choose TWO letters, A-E.', 25, "Which TWO recommendations does the tutor make about Laura's questionnaire?", ['Leave a space for contact details.', 'Specify a completion date.', 'Provide a mixture of question types.', 'Keep the length to a minimum.', 'Trial it on someone before finalising it.'], ['C', 'E'], 'Questions 25-26'),
        multi('Choose TWO letters, A-E.', 27, 'Which TWO things will Laura explain in her covering letter to participants?', ['when the questionnaire should be completed', 'the fact that participation in the survey is voluntary', 'how long the questionnaire is likely to take', 'the purpose of the survey', 'the benefits of participation in the survey'], ['C', 'D'], 'Questions 27-28'),
        multi('Choose TWO letters, A-E.', 29, 'Which TWO activities does Laura already have definite dates for?', ['completion of her finished assignment', 'questionnaire distribution', 'collection of completed questionnaires', 'the next meeting with her tutor', "analysis of figures from the company's database"], ['A', 'D'], 'Questions 29-30'),
      ],
      expl: {
        21: { v: 'Khi gia sư hỏi vì sao chọn Burcock.', t: ['because I did my placement there and I knew the staff there.', 'But she knows the managing director at Burcock, and she spoke to him, and then he got in touch with me.'], p: 'Thực tập và quen nhân viên là ở FG Engineering (bẫy B, C); giám đốc điều hành của Burcock liên hệ với Laura → A' },
        22: { v: 'Khi bàn chủ đề chính.', t: ["So, my central theme is absence, but I'm thinking of concentrating on long-term absence.", "If I were you, I wouldn't be that specific.", "I'd look at absence as a whole."], p: 'Gia sư khuyên đừng thu hẹp, hãy xem xét vắng mặt nói chung → mở rộng trọng tâm → B' },
        23: { v: 'Khi hỏi Laura dự đoán gì.', t: ['Rises in absence rates over time?', 'Not really.', "So, well, I think I may find that it's something to do with what sort of job the employee is doing."], p: 'Không phải tỉ lệ tăng (C sai), nghỉ không lý do khó xác định (B sai); liên quan đến loại công việc → A' },
        24: { v: 'Khi bàn hồ sơ công ty.', t: ["though it's unlikely they'll let you have them for individual workers.", "And you probably won't have access to personal information, like when they were born, but you should be able to use anonymous details like the type of work they do or how long they've been with the company."], p: 'Không có số liệu từng người, ngày sinh (A, C sai); có loại việc và thâm niên → chi tiết việc làm → B' },
        25: { v: 'Khi bàn bảng câu hỏi.', t: ["I think the questions should be closed questions too.", "But then you miss the chance of getting unexpected information, so I'd include one or two open-ended questions, too."], p: 'Thêm câu hỏi mở bên cạnh câu hỏi đóng → kết hợp nhiều dạng câu hỏi → C' },
        26: { v: 'Như câu 25 (chọn 2 đáp án).', t: ['No, it needs to be anonymous.', "And after you've drafted it, you need to give it to at least one person to check there aren't any problems."], p: 'Phải ẩn danh (A sai); độ dài cần cân bằng, không phải ngắn nhất (D sai); đưa cho người khác kiểm tra trước → E' },
        27: { v: 'Khi bàn thư giới thiệu.', t: ["I'll need to introduce myself and explain what the questionnaire is for", 'Will they be allowed to use work time?', "That's really up to their manager, but you should say roughly how much time it'll take."], p: 'Thời điểm làm là do quản lý quyết (A sai); ghi khoảng thời gian cần để làm → C' },
        28: { v: 'Như câu 27 (chọn 2 đáp án).', t: "I'll need to introduce myself and explain what the questionnaire is for, but what else should I include?", p: 'Giải thích bảng câu hỏi dùng để làm gì → mục đích khảo sát → D' },
        29: { v: 'Khi bàn lịch trình.', t: ['And you have to submit your assignment by the end of June?', "Actually, I have to get it finished by the 2nd, because I've arranged a work placement after that."], p: 'Ngày phát/thu bảng hỏi còn chờ quản lý, số liệu HR chưa biết khi nào (B, C, E sai); hạn hoàn thành bài là ngày 2 → A' },
        30: { v: 'Cuối bài.', t: ['So, our next meeting is two weeks today.', 'Is that still OK?', 'Yes'], p: 'Buổi gặp tiếp theo đã chốt: hai tuần nữa tính từ hôm nay → D' },
      },
    },
    {
      part: 4, title: 'Transhumance', audio: 'Listening/Test 3/P4.mp3', cover: 'herders moving sheep mountains | nomadic herders camels',
      transcript: `
Good afternoon, everyone.
Today I'm going to talk about what may be a new concept to you, the movement of people with their herds of animals from place to place.
This is known as transhumance.
These peoples are pastoralists, and their animals include cows, sheep, goats, horses, camels, and reindeer.
Now, researchers sometimes make a distinction between two types of transhumance, fixed and nomadic, and talk about various factors which differentiate between them.
The first and most important distinction they make is to do with the climate.
Fixed transhumance occurs in countries such as Switzerland, where seasons are predictable in terms of weather and timing.
Nomadic transhumance, on the other hand, is generally practised in areas where climatic conditions are difficult to predict.
An example of such a location is Somalia, as the anticipated rains often just don't appear.
Secondly, researchers sometimes look at the type of journey that pastoralists make, their movement.
For fixed transhumance, the pattern is sometimes known as vertical because it typically consists of a journey from lower ground in the winter season to higher ground in the summer, and vice versa.
In the wild, of course, animals frequently follow these kinds of migration patterns themselves.
Nomadic transhumance generally takes place over a longer distance, and it's far more complex.
The actual pattern varies from year to year, and it's determined primarily by the animals' needs for grass and also for water.
Another distinction is sometimes made in terms of homes.
In the case of fixed transhumance, the group will typically have permanent homes in the valley and a shelter which is semi-permanent in the mountains, such as a cabin, to offer some protection from the weather.
In nomadic transhumance, however, the pastoralists always live in temporary shelters, which are transported by their livestock from place to place, and are usually light and portable.
In northern Kenya, for example, the Gabra pastoralist carries the frame of his home on his camel, and then covers it with branches when he stops for the night.
A fourth factor often mentioned is the number of people taking part.
In the case of fixed transhumance, only the people who actually look after the herds travel.
These are normally the young ones, because they can withstand adverse physical conditions more easily.
By contrast, in nomadic transhumance, the whole group moves with their livestock.
The last points of comparison often made by researchers are diet and goods.
In fixed transhumance, those who do not move from the valleys often start working as farmers, cultivating the land.
They build up contacts with other communities, and in some cases, they may also trade animals for grain.
In nomadic transhumance, there are fewer contacts.
The group are generally regarded as providers of all their own needs, and they obtain food such as cheese and meat and also their clothing from their herds.
Another example is found in Algeria in North Africa, to see how far this model applies to transhumance there.
Fixed transhumance from valley to mountain pastures is common in the area.
But some pastoralists also take their herds on longer journeys at the end of spring, from the Sahara in the south to the plains in the north, where there is more abundant rainfall.
They have traditionally assisted local farmers with the harvest, which takes place while they are temporarily resident there.
We have to decide whether their move would fall within the category of fixed or nomadic transhumance.
It is true they live in tents, and these are movable and temporary right through the year, whether they are in the Sahara or in the north of Algeria.
So, in considering their homes, they appear nomadic.
On the other hand, in relation to their patterns of movement, they do not.
They drive their livestock through the same passes and mountains each year, which suggests fixed transhumance.
Here, in fact, we have a case showing some features of both types of transhumance, which we might more precisely refer to as intermediate.
This all goes to show that you should treat every theory with great care, and not force your case history into a model if it doesn't fit.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Transhumance', [
          '<strong>Two Types of Transhumance</strong>',
          '• fixed: mainly in countries with predictable seasons, e.g. Switzerland',
          '• nomadic: in areas with unpredictable climatic conditions, e.g. Somalia',
          '<strong>Study on the Movement of Pastoralists</strong>',
          '• for fixed transhumance, the pattern of movement is described as __Q31__',
          '• while for nomadic transhumance, the pattern is more complex and varied',
          '<strong>Differences in terms of Homes</strong>',
          '• fixed transhumance live in a semi-permanent shelter on high ground such as __Q32__',
          '• nomadic transhumance always stay in portable shelters, e.g. homes of the Gabra people carried on __Q33__',
          '<strong>Number of People Involved</strong>',
          '• for fixed transhumance, only __Q34__ pastoralists make the journey',
          '• however, all nomadic transhumance migrate with their livestock',
          '<strong>Diet and Goods</strong>',
          '• people who do not leave the valleys may become __Q35__',
          '• exchange animals with other communities for __Q36__',
          '• herds provide all needs – food and __Q37__',
          '<strong>Research in Algeria in North Africa</strong>',
          '• they traditionally arrive in time to help local residents with the __Q38__',
          '• their homes are __Q39__ which are temporary shelters',
          '• a better term to describe this type of transhumance might be __Q40__',
        ], { 31: 'vertical', 32: 'cabin/a cabin', 33: 'camel/camels', 34: 'young', 35: 'farmers', 36: 'grain', 37: 'clothing', 38: 'harvest', 39: 'tents', 40: 'intermediate' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về kiểu di chuyển.', t: 'For fixed transhumance, the pattern is sometimes known as vertical because it typically consists of a journey from lower ground in the winter season to higher ground in the summer, and vice versa.', p: 'Đi từ vùng thấp lên vùng cao rồi ngược lại → “vertical” → vertical' },
        32: { v: 'Khi nói về nơi ở.', t: 'In the case of fixed transhumance, the group will typically have permanent homes in the valley and a shelter which is semi-permanent in the mountains, such as a cabin, to offer some protection from the weather.', p: 'Nơi trú bán cố định trên núi, ví dụ một căn chòi → cabin' },
        33: { v: 'Khi nói về người Gabra.', t: 'In northern Kenya, for example, the Gabra pastoralist carries the frame of his home on his camel, and then covers it with branches when he stops for the night.', p: 'Khung nhà được chở trên lưng lạc đà → camel' },
        34: { v: 'Khi nói về số người tham gia.', t: ['In the case of fixed transhumance, only the people who actually look after the herds travel.', 'These are normally the young ones, because they can withstand adverse physical conditions more easily.'], p: 'Chỉ người trẻ đi theo đàn vì chịu được điều kiện khắc nghiệt → young' },
        35: { v: 'Khi nói về chế độ ăn và hàng hoá.', t: 'In fixed transhumance, those who do not move from the valleys often start working as farmers, cultivating the land.', p: 'Người ở lại thung lũng trở thành nông dân → farmers' },
        36: { v: 'Ngay sau đó.', t: 'They build up contacts with other communities, and in some cases, they may also trade animals for grain.', p: 'Đổi gia súc lấy ngũ cốc → grain' },
        37: { v: 'Khi nói về du mục.', t: 'The group are generally regarded as providers of all their own needs, and they obtain food such as cheese and meat and also their clothing from their herds.', p: 'Đàn gia súc cho thức ăn (đã có trên đề) và quần áo → clothing' },
        38: { v: 'Phần nghiên cứu ở Algeria.', t: 'They have traditionally assisted local farmers with the harvest, which takes place while they are temporarily resident there.', p: 'Giúp nông dân địa phương thu hoạch → harvest' },
        39: { v: 'Khi nói về nơi ở của họ.', t: 'It is true they live in tents, and these are movable and temporary right through the year', p: 'Sống trong lều, di chuyển được, tạm thời → tents' },
        40: { v: 'Cuối bài.', t: 'Here, in fact, we have a case showing some features of both types of transhumance, which we might more precisely refer to as intermediate.', p: 'Mang đặc điểm của cả hai loại → gọi chính xác hơn là “trung gian” → intermediate' },
      },
    },
  ],
};
