// Vol 5 – Test 10 (PDF "Listening/Test 10/Test 10-up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p10; audio Test 10/S1–S4 —
// S1 clipped from "Now turn to Section 1" (the test introduction comes first); its example is played first and then the whole
// conversation again → transcript keeps the full version only).
// S2/S4 are "practice of the day" recordings numbered 1–10 (the paper renumbers them 11–20 / 31–40).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns, wb.js for gaps) checked against
// "Transcripts & Keys/test 10- transcripts.pdf".
// Source errors fixed: paper Q9 lost its number ("managing the warehouse near the ……"), Q18–20 "next to Questions 8-10",
// Q6 "waiting a … for every vehicle" → writing, "handing" → handling, "repaining" → repairing.
const { note, mc, multi, matching, map } = require('../vol_build');

module.exports = {
  vol: 5, test: 10,
  sections: [
    {
      part: 1, title: 'Morgan Recruitment Agency – Request for New Staff', audio: 'Listening/Test 10/S1.mp3', clip: [36.5, 462], cover: 'refrigerated truck fleet | recruitment agency phone call',
      transcript: `
Agent:
Hello, Morgan Recruitment Agency.
How may I help you?
Peter:
Hello.
I need to employ some new staff for my company, and I believe your agency can help with that?
Agent:
Yes, of course.
First I'll get some details from you.
Can I have your name, please?
Peter:
Sure.
My name is Peter Smith.
Agent:
And can I also get a contact number?
Peter:
Our number here is 047 888 3925.
Agent:
Thank you.
Can I also take down some details about your company?
What's your company name?
Peter:
It's Vander Transport.
Agent:
Is that V-A-N?
That's N for November, D-E-R?
Peter:
That's right.
We are a large trucking company.
Agent:
The transport industry is really booming, especially for fresh fruit and vegetables, isn't it?
Peter:
Yes.
We have a fleet of refrigerated trucks, though, so we mostly carry frozen goods, fish, vegetables, pizza, all sorts.
Agent:
I see.
So you said that you need some new staff members.
When would you need them to start?
Peter:
We'd like them to start around the 27th of August.
Agent:
Just looking at my calendar here, the 27th is a Sunday, so do you mean the 28th?
Peter:
Ah, yes, that's right.
We're hoping to hold any interviews around July 29th.
Agent:
I'll get more details of that later.
OK.
Now could you tell me about the jobs you have available so we can hopefully find some suitable candidates?
Peter:
Sure.
The first position is an office manager.
Agent:
So does the job involve typical management duties?
Peter:
Yes, but they also have to liaise with our main client, which is a large supermarket chain.
So a background in a company like that is essential.
Agent:
OK, I'll note that down.
It sounds like an important role.
What are the minimum qualifications?
Do they need a university education, like a degree?
Peter:
Yes, candidates would definitely have one.
Agent:
OK.
Can you tell me about the next position?
Peter:
We're looking for a full-time mechanic.
Agent:
So I assume the job will involve doing general repairs on trucks?
Peter:
Yes, that's right.
And one of the other key responsibilities is to produce a written report for each vehicle.
Agent:
I think we have several people on our books that would be suitable.
And will the mechanic be doing much travelling?
Peter:
Some, yes, but not a great deal.
Unlike our next vacancy, that's for a full-time truck driver.
Agent:
Right.
What kind of shifts are they expected to work?
Peter:
They usually travel around 1,000 kilometres over a five-day period.
Agent:
I see.
Peter:
This job is different to our usual ones, though.
It involves moving animals.
Agent:
That sounds interesting.
Peter:
Yes.
Our company has just got a new contract, so we've bought new trucks and want a driver with that kind of experience.
Agent:
Great.
Is there anything else I should make a note of?
Peter:
Well, we own all of the trucks, but apart from their driving duties, it is up to all our drivers to clean their vehicle between trips.
We do give them extra time for that.
Agent:
OK.
And are there any other positions available?
Peter:
Yes.
We're looking for a warehouse supervisor.
Agent:
And what will this involve?
Peter:
They'll be in charge of our new warehouse.
It's located close to the airport.
We've recently moved out of the city centre.
Agent:
Oh, that must be more convenient.
And what are some of the requirements for this role?
Peter:
A successful candidate would be able to work effectively in a busy environment.
Sometimes they'll be on call 24 hours for our night-time deliveries.
Agent:
So, given the hours they'll be working, I assume it will be necessary for the candidate to have a car?
Peter:
Yes, that's right.
Buses and trains just don't operate at those times, unfortunately.
Agent:
OK, Mr Smith.
I'll have a look at the jobseekers we have on our books and see if we have any suitable candidates for the positions you have available.`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Morgan Recruitment Agency – Request for new staff', [
          'Example: Name: Peter <u>Smith</u>',
          'Phone number: __Q1__',
          'Company name: __Q2__ Transport',
          'Type of company: trucking company – transports a lot of __Q3__ food',
          'Date employees required: from __Q4__',
          '<strong>Details of Jobs</strong>',
          '<strong>Office Manager</strong>',
          '• experience working with supermarkets is needed',
          '• must have a __Q5__',
          '<strong>Mechanic</strong>',
          '• duties involve repairing trucks and writing a __Q6__ for every vehicle',
          '• the job will not involve much travelling',
          '<strong>Truck Driver</strong>',
          '• will cover long distances',
          '• will need to transport __Q7__, so experience handling them is preferred',
          '• all drivers also have to __Q8__ their truck',
          '<strong>Warehouse Supervisor</strong>',
          '• managing the warehouse near the __Q9__',
          '• they need their own __Q10__',
        ], { 1: '0478883925/047 888 3925', 2: 'Vander', 3: 'frozen', 4: '28th August/28 August/August 28th/August 28', 5: 'degree', 6: 'report', 7: 'animals', 8: 'clean', 9: 'airport', 10: 'car' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi số liên lạc.', t: 'Our number here is 047 888 3925.', p: 'Số điện thoại của công ty → 0478883925' },
        2: { v: 'Khi hỏi tên công ty.', t: ['Is that V-A-N?', "That's N for November, D-E-R?", "That's right."], p: 'Tên được đánh vần V-A-N-D-E-R → Vander' },
        3: { v: 'Khi nói về hàng vận chuyển.', t: ["The transport industry is really booming, especially for fresh fruit and vegetables, isn't it?", 'We have a fleet of refrigerated trucks, though, so we mostly carry frozen goods, fish, vegetables, pizza, all sorts.'], p: 'Rau quả tươi là ý của nhân viên (bẫy); chủ yếu chở hàng đông lạnh → frozen' },
        4: { v: 'Khi hỏi ngày bắt đầu.', t: ["We'd like them to start around the 27th of August.", "Just looking at my calendar here, the 27th is a Sunday, so do you mean the 28th?", "Ah, yes, that's right."], p: 'Ngày 27 là Chủ nhật, 29/7 là ngày phỏng vấn (bẫy); bắt đầu từ 28/8 → 28th August' },
        5: { v: 'Khi hỏi yêu cầu với quản lý văn phòng.', t: ['Do they need a university education, like a degree?', 'Yes, candidates would definitely have one.'], p: 'Ứng viên phải có bằng đại học → degree' },
        6: { v: 'Khi nói về thợ máy.', t: 'And one of the other key responsibilities is to produce a written report for each vehicle.', p: 'Viết báo cáo cho từng xe → report' },
        7: { v: 'Khi nói về tài xế xe tải.', t: ["This job is different to our usual ones, though.", 'It involves moving animals.'], p: 'Công việc vận chuyển động vật → animals' },
        8: { v: 'Ngay sau đó.', t: 'Well, we own all of the trucks, but apart from their driving duties, it is up to all our drivers to clean their vehicle between trips.', p: 'Tài xế phải tự rửa xe giữa các chuyến → clean' },
        9: { v: 'Khi nói về giám sát kho.', t: ["It's located close to the airport.", "We've recently moved out of the city centre."], p: 'Trung tâm thành phố là chỗ cũ (bẫy); kho mới gần sân bay → airport' },
        10: { v: 'Cuối bài.', t: ['So, given the hours they\'ll be working, I assume it will be necessary for the candidate to have a car?', "Yes, that's right.", "Buses and trains just don't operate at those times, unfortunately."], p: 'Xe buýt, tàu không chạy giờ đó; ứng viên cần có ô tô riêng → car' },
      },
    },
    {
      part: 2, title: 'Barton House and Gardens', audio: 'Listening/Test 10/S2.mp3', cover: 'historic house museum | garden swans lake',
      transcript: `
Good afternoon.
Welcome to Barton Museum.
I am Carly and I am your tour guide.
I would be taking you through all the places of interest in this museum before we actually set out to go.
The first building we stop at is the Barton House, which was built by the man himself, Barton.
When he first came to this area, it was largely uninhabited, and as a matter of fact, this place was a vast expanse of land where an abandoned farm was situated.
After he bought it, he began building, and in about three years, the basic structure was complete, although he never really stopped building.
As a man who loved the arts, Barton spent a good fortune on them.
He had several paintings from all over the world, and his gallery is still considered one of the best in town.
One of the most notable of his collection is the Chinese wallpaper, which was painted in the 18th century.
Rumour has it that he paid hundreds of thousands of dollars for the piece of art.
Barton kept adding some features to his house every year.
He did this until the night he died.
He was building a new bird room in which he collapsed and never came to himself.
His dining room is also beautifully adorned with antiquity, from the tables to the stools to the mats.
The chairs were bought from some Japanese merchants in the area then.
Looking at the location of his house, which sits some feet higher than surrounding lands, it is possible to see areas of just green, lush vegetation that run for miles.
At the backyard, there is a garden which he started himself.
He used to care for the plants there personally and made sure they never lacked water.
He detested fertilisers as he believed that it would spoil the cycle of growth of the plants in the garden.
He had some trees in the garden.
They are not ordinary trees, but some rare ones, and they have been alive for decades now.
Under one of those trees was his favourite spot, and history tells us that he used to sing and pray under the tree.
Recently, the government brought in some flamingos here, as the environment supports their growth and development well.
They are believed to make the scenery livelier and more beautiful.
Although there are many exotic animals in the garden, swans are still the most popular animal here.
They seem to be everywhere, and it was said that Barton thought that they were a gift from the heaven.
It was forbidden to kill or hurt any of these animals in his time.
Now, let's take a look at other interesting places this site has to offer.
Away from the backyard, there is a gallery just at the right side of the road, a few feet from the entrance, and there is usually a history exhibition every week.
Halfway down the path, to the east of the toilet, we have the woodland, and the area is just beautiful.
Barton decided to have it just because he loved the view.
If you keep walking down the path in front of you to the west of the site, you will see a large gift shop beside the toilet.
It has a large collection of handicrafts.
These handicrafts are not actually made by Barton himself, but are imitations of his artistic works.
As you have heard enough about this man, we would now proceed to see these things for ourselves.
And I'm very sure that you...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Barton House', [
          'Before Barton bought this house, it was a __Q11__',
          'The Chinese wallpaper was painted in the __Q12__ century.',
          'Barton died in the __Q13__ room.',
          'The dining room has many antiques such as the __Q14__ sold by Japanese.',
          '<strong>Backyard Garden</strong>',
          '__Q15__ plants that have been there for years.',
          '__Q16__ were introduced by the government.',
          'The most popular animal is the __Q17__',
        ], { 11: 'farm', 12: '18th/eighteenth', 13: 'bird', 14: 'chairs', 15: 'rare', 16: 'flamingos', 17: 'swans/swan' }, 'Questions 11-17'),
        map('Label the map below.\nWrite the correct letter, A-F, next to Questions 18-20.', [
          [18, 'gallery', 'C'],
          [19, 'woodland', 'F'],
          [20, 'gift shop', 'E'],
        ], { pdf: 'Listening/Test 10/Test 10-up.pdf', page: 3, box: [140, 160, 455, 420] }, 'Questions 18-20'),
      ],
      expl: {
        11: { v: 'Khi giới thiệu Barton House.', t: 'When he first came to this area, it was largely uninhabited, and as a matter of fact, this place was a vast expanse of land where an abandoned farm was situated.', p: 'Trước đây là một trang trại bỏ hoang → farm' },
        12: { v: 'Khi nói về bộ sưu tập.', t: 'One of the most notable of his collection is the Chinese wallpaper, which was painted in the 18th century.', p: 'Giấy dán tường Trung Hoa vẽ vào thế kỷ 18 → 18th' },
        13: { v: 'Khi nói về cái chết của Barton.', t: 'He was building a new bird room in which he collapsed and never came to himself.', p: 'Ông ngã quỵ trong phòng chim đang xây → bird' },
        14: { v: 'Khi nói về phòng ăn.', t: ['His dining room is also beautifully adorned with antiquity, from the tables to the stools to the mats.', 'The chairs were bought from some Japanese merchants in the area then.'], p: 'Bàn, ghế đẩu, thảm chỉ là đồ cổ nói chung (bẫy); ghế mua từ thương nhân Nhật → chairs' },
        15: { v: 'Khi nói về khu vườn.', t: "They are not ordinary trees, but some rare ones, and they have been alive for decades now.", p: 'Những cây quý hiếm sống đã hàng chục năm → rare' },
        16: { v: 'Khi nói về động vật trong vườn.', t: 'Recently, the government brought in some flamingos here, as the environment supports their growth and development well.', p: 'Chính phủ đưa chim hồng hạc vào → flamingos' },
        17: { v: 'Ngay sau đó.', t: 'Although there are many exotic animals in the garden, swans are still the most popular animal here.', p: 'Thiên nga là loài được yêu thích nhất → swans' },
        18: { v: 'Khi chỉ trên bản đồ.', t: 'Away from the backyard, there is a gallery just at the right side of the road, a few feet from the entrance', p: 'Bên phải con đường, cách lối vào vài bước → C' },
        19: { v: 'Khi nói về khu rừng nhỏ.', t: 'Halfway down the path, to the east of the toilet, we have the woodland, and the area is just beautiful.', p: 'Giữa con đường, ở phía đông nhà vệ sinh → F' },
        20: { v: 'Cuối bài, về cửa hàng quà tặng.', t: 'If you keep walking down the path in front of you to the west of the site, you will see a large gift shop beside the toilet.', p: 'Phía tây khu vực, ngay cạnh nhà vệ sinh → E' },
      },
    },
    {
      part: 3, title: 'Tim and Alice on Their Economics Course', audio: 'Listening/Test 10/S3.mp3', cover: 'university economics students | student mentor meeting',
      transcript: `
Alice:
Tim, the lectures we've been attending recently have been very informative.
I love the diversity of the information we're learning.
It gives a broad overall picture of the subject.
Tim:
True, Alice.
And it's useful to have a mentor help us get the most out of our studies.
I admit, I wasn't particularly confident before starting this course.
I felt my skills were not at the level required to succeed.
Alice:
I felt the same way, but with help from Mr Jarvis, I'm growing in self-confidence and ability every day.
I'm grateful he has the time to spend one-on-one with the students.
Tim:
Yeah, I improved a lot.
Alice:
I would like him to be able to give us more information on other subjects, however; he does give a very narrow view of economics.
Tim:
And I would like some advice on how to prepare for our seminars.
I'm never sure what to expect.
Alice:
I'm focusing on passing my exams at the moment.
Mr Jarvis has been coaching me in this respect.
He saw I was worried and offered to help.
Tim:
I'm grateful for his help in this respect, too.
Alice:
I'll think about what to study next year once I've passed.
Tim:
I'm not sure what I should do with my life.
I can't see myself pursuing a career in economics.
Alice:
You have many skills that could be useful in several different fields.
You've talked with the tutor about it previously, haven't you?
Tim:
Not regarding my career.
I did discuss with him some options for next semester, which course I might choose.
He had some great advice.
Alice:
He suggested that I should continue studying in this field for now.
I wonder if he might help me with the experiments I need to conduct.
I should ask him.
Tim:
Great idea.
How do you feel about the essays we've been required to write?
Alice:
I thought it can be difficult, and it is actually, but I'm just able to deal with it.
There are so many assignments to complete.
If they were any harder, I don't think I could manage.
Tim:
I feel the same way.
I was talking with John yesterday, and he believes the level of difficulty for our assignments could be higher, that they are too basic for him.
Alice:
I'm happy for him.
I think this subject poses many challenges, though.
Tim:
Why do you say that?
Your mathematical skills are very high.
I heard you aced all your exams throughout high school.
Alice:
At first the subject didn't pique my interest.
I've had no previous experience in economics, so this is all new ground for me.
Tim:
Well, you seem to be succeeding despite your misgivings.
My one concern is that we don't have the opportunity to put the theory we learn into any practical use.
We learn many formulas and strategies, but with no practical application, it feels like we are wasting our time.
Alice:
I don't agree.
I feel that the project we worked on last month was very practical.
We had the chance to test our skills and ascertain the areas we need to improve.
Tim:
I will say that this course is giving us many opportunities to expand our networks, which will be of benefit when we have graduated and are seeking employment.
Alice:
Yes, I've had the opportunity to meet many successful economists and businessmen and hear how they rose to their positions through hard work and dedication.
This has been of great value.
Do you feel we have had enough opportunities to experience what it is like to work in a large organisation?
Tim:
At first, I believed that to be the case.
Now I'm not so sure.
Alice:
I think we've been given ample opportunities, first through the work placement programme, and then by means of the excursions we've taken to some of the most prominent financial institutions in the country.
I feel, though, that through the course we haven't put enough emphasis on communication.
Tim:
Communication is vital in the workplace, especially in an environment where one mistake can have serious consequences.
But I believe we've been taught the necessary skills.
Our lecture yesterday covered this topic thoroughly.
Alice:
You mentioned you may not continue with economics.
Is it perhaps because you believe we haven't been shown the career possibilities in this field?
Tim:
No, our classes with Miss Hathaway have been beneficial in showing the possibilities.
It seems the teachers here would like us all to continue in our study.
They take every opportunity to assist us in identifying what specific career to pursue.
Alice:
I agree.
They have made it very clear what our options are, which I'm thankful for.`,
      groups: [
        multi('Choose THREE letters, A-G.', 21, 'Which THREE kinds of help did both Tim and Alice get from their mentor?', ['building up confidence', 'preparation for exams', 'preparation for seminars', 'course selection', 'information about the subjects', 'advice about future career', 'suggestions on conducting experiments'], ['A', 'B', 'D'], 'Questions 21-23'),
        mc('Choose the correct letter, A, B or C.', [
          [24, 'What do they think about the essay writing?', ["It's easier than expected.", "It's as difficult as they had expected.", "It's harder than expected."], 'B'],
          [25, 'Why does Alice think it is difficult to learn economics?', ["because it's her first time to learn economics", 'because she is not good at numbers', 'because she is not interested in it'], 'A'],
        ], 'Questions 24-25'),
        matching('What do Alice and Tim think of the course?\nWrite the correct letter, A, B or C, next to Questions 26-30.',
          ['Only Alice', 'Only Tim', 'Both Alice and Tim'], [
            [26, 'put theory into practice', 'A'],
            [27, 'have networking opportunity', 'C'],
            [28, 'have experience of working in large organisations', 'A'],
            [29, 'have communication skills', 'B'],
            [30, 'identify a career plan', 'C'],
          ], { reuse: true, groupTitle: 'Questions 26-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, khi nói về người hướng dẫn.', t: ["I admit, I wasn't particularly confident before starting this course.", "I felt the same way, but with help from Mr Jarvis, I'm growing in self-confidence and ability every day.", 'Yeah, I improved a lot.'], p: 'Cả hai đều tự tin hơn nhờ thầy Jarvis → A' },
        22: { v: 'Như câu 21 (chọn 3 đáp án).', t: ['Mr Jarvis has been coaching me in this respect.', "I'm grateful for his help in this respect, too."], p: 'Thông tin môn khác và chuẩn bị seminar là điều họ muốn mà chưa có (E, C sai); cả hai được giúp ôn thi → B' },
        23: { v: 'Như câu 21 (chọn 3 đáp án).', t: ['I did discuss with him some options for next semester, which course I might choose.', 'He suggested that I should continue studying in this field for now.'], p: 'Tim không bàn nghề nghiệp, thí nghiệm Alice mới định hỏi (F, G sai); cả hai được tư vấn chọn khoá học → D' },
        24: { v: 'Khi Tim hỏi về bài luận.', t: ["I thought it can be difficult, and it is actually, but I'm just able to deal with it.", 'I feel the same way.'], p: 'Nghĩ là khó và đúng là khó như vậy; Tim cũng thấy thế (John thấy dễ là bẫy) → B' },
        25: { v: 'Khi Alice nói môn học nhiều thử thách.', t: ['Your mathematical skills are very high.', "I've had no previous experience in economics, so this is all new ground for me."], p: 'Giỏi toán (B sai), lúc đầu không hứng thú chỉ là chuyện trước đây (C sai); lần đầu học kinh tế → A' },
        26: { v: 'Khi bàn đưa lý thuyết vào thực hành.', t: ["My one concern is that we don't have the opportunity to put the theory we learn into any practical use.", 'I don\'t agree.', 'I feel that the project we worked on last month was very practical.'], p: 'Tim thấy thiếu thực hành, Alice cho rằng dự án rất thực tế → chỉ Alice → A' },
        27: { v: 'Khi bàn mở rộng quan hệ.', t: ['I will say that this course is giving us many opportunities to expand our networks', 'This has been of great value.'], p: 'Tim nêu, Alice đồng ý và kể đã gặp nhiều nhà kinh tế → cả hai → C' },
        28: { v: 'Khi bàn kinh nghiệm làm ở tổ chức lớn.', t: ['At first, I believed that to be the case.', "Now I'm not so sure.", "I think we've been given ample opportunities"], p: 'Tim không còn chắc; Alice thấy đã có nhiều cơ hội → chỉ Alice → A' },
        29: { v: 'Khi bàn kỹ năng giao tiếp.', t: ["I feel, though, that through the course we haven't put enough emphasis on communication.", "But I believe we've been taught the necessary skills."], p: 'Alice thấy chưa chú trọng; Tim tin đã được dạy đủ → chỉ Tim → B' },
        30: { v: 'Cuối bài, về định hướng nghề nghiệp.', t: ['They take every opportunity to assist us in identifying what specific career to pursue.', 'I agree.'], p: 'Tim nói giáo viên giúp xác định nghề, Alice đồng ý → cả hai → C' },
      },
    },
    {
      part: 4, title: 'Introduction to Taxation', audio: 'Listening/Test 10/S4.mp3', cover: 'tax forms calculator | filing taxes online',
      transcript: `
Hello all.
Thank you for attending tonight's presentation.
I am Mr Dawkins from the Central Government Tax Agency, and I am here to provide you with information regarding filing and paying your taxes.
First off, let me tell you that in preparing to file your taxes, evidence that can confirm your actual income has to be adequate.
Then it should be submitted to the local authority.
You can't just guess what your income was, or you may be charged a large sum of penalty.
Income can come in different forms, including wage statements, independent freelancer statements.
Currently, apart from invoices, we also take bank statements.
Our tax period usually lasts for one year.
Different states have different policies, but here it runs from April to the end of March next year.
All of your current supervisors within the tax period are required to provide you with a wage statement.
If you have not received an annual wage statement within one month of the end of the fiscal year, you should contact us and we will request them to send this statement immediately.
But you need to ask your employers to provide the employment statement, because that's something we can't help.
A failure to pay, along with the evasion of or resistance to taxation, is punishable by law.
If you do not file an annual tax return, you may find that you will have to pay a penalty, up to $3,000 in some instances.
So you'd better file your taxes promptly, since the government does not tolerate this.
Everyone should make sure they file a tax return in a timely manner.
Now, I suppose you have known something about tax.
They are very important.
I hope you can always keep them in mind.
And here are some random tips which are also helpful.
When you purchase a new car during the tax period, please note that you will need to work out the latest tax rate and pay a line item tax for this.
For those who just started getting to know tax filing, I do not recommend that you take multiple types of taxes into consideration at your first attempt.
The calculation will be more straightforward with just one type of tax.
Please know that most people use their computers to deal with their taxes.
When using your computer to do your taxes or subscribe to an online tax service, you will find many advantages that don't exist when you do it at an office.
One of the advantages of preparing your taxes online is that you can save whatever information you have gathered and then resume your preparations at another time.
In doing this, since the tax information won't take much of the storage space, you don't have to worry about whether your computer will be able to accommodate the information you have gathered.
Also, in doing your taxes online or in using an online tax service, you will find that mistakes are less likely to happen, as the online tax preparation programs have safeguards to prevent you from omitting required information.
Generally, to begin working on your taxes, you will go to the tax office and inquire the office workers and finally fill in some forms.
But for now, you can go to our website and download some.
If necessary, you can take some time to complete a questionnaire, which will give you advice on which type of form you should fill in.
If there are any questions you cannot answer, you can call to speak to someone in person.
Thank you for attending tonight's presentation.
Please know that my Central Government Tax Agency associates and I are always willing to help you with your tax preparation by answering any questions you might have.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Introduction to Taxation', [
          '<strong>To certify income</strong>',
          '• enough __Q31__ is needed, including:',
          '– wage statements',
          '– independent freelancer statements',
          '– invoices',
          '– __Q32__ statements',
          '<strong>A tax year</strong>',
          '• starts from __Q33__',
          '• requires a statement of employment from __Q34__',
          '<strong>Penalty for failing to pay tax</strong>',
          '• the maximum amount is $__Q35__',
          '<strong>Tips</strong>',
          '• Tax rate will be changed when buying a __Q36__',
          '• __Q37__ for one single kind of tax is easier.',
          '<strong>Online tax service</strong>',
          '• Information occupies small __Q38__ space.',
          '• Fewer __Q39__ are made.',
          '• A __Q40__ is helpful to find the right kind of form.',
        ], { 31: 'evidence', 32: 'bank', 33: 'April', 34: 'employers/employer', 35: '3,000/3000', 36: 'car', 37: 'calculation/Calculation', 38: 'storage', 39: 'mistakes', 40: 'questionnaire' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Đầu bài, khi nói về chứng minh thu nhập.', t: 'First off, let me tell you that in preparing to file your taxes, evidence that can confirm your actual income has to be adequate.', p: 'Cần đủ bằng chứng xác nhận thu nhập → evidence' },
        32: { v: 'Khi liệt kê các loại giấy tờ.', t: 'Currently, apart from invoices, we also take bank statements.', p: 'Ngoài hoá đơn còn nhận sao kê ngân hàng → bank' },
        33: { v: 'Khi nói về năm tính thuế.', t: 'Different states have different policies, but here it runs from April to the end of March next year.', p: 'Năm thuế bắt đầu từ tháng 4 → April' },
        34: { v: 'Khi nói về giấy xác nhận việc làm.', t: "But you need to ask your employers to provide the employment statement, because that's something we can't help.", p: 'Phải nhờ chủ lao động cung cấp xác nhận việc làm → employers' },
        35: { v: 'Khi nói về tiền phạt.', t: 'If you do not file an annual tax return, you may find that you will have to pay a penalty, up to $3,000 in some instances.', p: 'Mức phạt tối đa $3.000 → 3,000' },
        36: { v: 'Phần mẹo.', t: 'When you purchase a new car during the tax period, please note that you will need to work out the latest tax rate', p: 'Mua xe mới thì phải tính lại thuế suất → car' },
        37: { v: 'Ngay sau đó.', t: 'The calculation will be more straightforward with just one type of tax.', p: 'Tính toán đơn giản hơn khi chỉ có một loại thuế → calculation' },
        38: { v: 'Khi nói về khai thuế trực tuyến.', t: "In doing this, since the tax information won't take much of the storage space", p: 'Thông tin không chiếm nhiều dung lượng lưu trữ → storage' },
        39: { v: 'Khi nói ưu điểm khác.', t: 'you will find that mistakes are less likely to happen, as the online tax preparation programs have safeguards', p: 'Ít sai sót hơn → mistakes' },
        40: { v: 'Phần cuối.', t: 'If necessary, you can take some time to complete a questionnaire, which will give you advice on which type of form you should fill in.', p: 'Bảng câu hỏi tư vấn loại mẫu đơn cần điền → questionnaire' },
      },
    },
  ],
};
