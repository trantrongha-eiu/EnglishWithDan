// Vol 5 – Test 2 (PDF "Listening/Test 2/Test 2- up.pdf" p1–6; key "Tổng hợp key Listening.pdf" p2; audio Test 2/P1–P3 —
// P1 clipped from "Now turn to Part 1" to just before the Part 2 introduction that follows on the same file).
// P2 is NOT the "Arthur Jones" talk of Test 1 P2: another recording (Arthur Knowles, presenter Sue) with other questions.
// P4 = bank "Office Design" (Vol 3 - Test 10 P4: same key 10/10, same notes).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns) checked against "Transcripts & Keys/test 2- transcripts.pdf".
// Source errors fixed: Q1 the address is spelled "G-R-A-Y" on the recording (Whisper "Grey"); Q24 option A "very boning" →
// "very boring"; Q29 "Drip to" → "Drip tip".
const { note, mc, multi, matching, map } = require('../vol_build');

module.exports = {
  vol: 5, test: 2,
  sections: [
    {
      part: 1, title: 'Oz Housesitters – Home Owner Registration', audio: 'Listening/Test 2/P1.mp3', clip: [38.5, 439], cover: 'house sitting home garden | suburban house pool',
      transcript: `
Adam:
Hello, Oz House Sitters.
Adam here.
Jenny:
Oh, hello.
My husband and I are going on a trip overseas and we'd like someone to stay in our house and look after it while we're away.
Is that something you can help us with?
Adam:
It most certainly is.
We can take care of all the arrangements for you.
Jenny:
OK, great.
Adam:
Now, can I just get some contact details from you for the form?
Your name is...?
Jenny:
Jenny.
Jenny Hall.
Adam:
Thank you.
Now, what's your address?
Jenny:
14 Gray Street.
Adam:
Is that G-R-E-Y or G-R-A-Y?
Jenny:
A-Y.
Adam:
Right.
And what's the suburb?
Jenny:
Greenfield.
Adam:
Oh, I know it.
And if I can just get a contact telephone number?
Jenny:
I'll give you my mobile number.
That's probably the best one to use.
It's 0491 577 248.
Adam:
Thanks.
Now, when did you want the house sitter to start?
Jenny:
We're flying out on the 25th of September, but my brother will be in the house for a few days until the 28th.
So from the 29th of September, please.
Adam:
I'll note that down.
And how long do you want the house sitter for?
Jenny:
Well, I'll be attending a training course in Paris for two weeks, but we're also going to visit my niece in Singapore on the way home to Australia for a few days.
Adam:
So, shall I put down three weeks?
Jenny:
That sounds about right.
I think four would be too long.
Adam:
Sure.
Now, Jenny, can you tell me more about the features of your house?
This helps us to match house sitters and homeowners.
Jenny:
Sure.
What do you want to know?
Adam:
Does the house have air conditioning?
Jenny:
No, we don't like using it.
We prefer the fresh air.
But last year, we did put in a pool.
Adam:
Very nice.
And are there any other attractive features?
Is your house near a beach, for example?
Jenny:
No, not really.
We're about an hour's drive away.
But we are close to a station, so it's handy for anyone getting into work and so on.
Adam:
OK, great.
Now, if our house sitter has their own transport, is there any space for them to park?
Jenny:
Well, we won't be taking our car, but it's a large double garage.
There'll be space for one more.
Adam:
OK, great.
I'll note that down, too.
And are there any special duties that you'll need the house sitter to carry out?
Jenny:
Oh, I don't know.
What do people normally ask for?
Adam:
Well, for example, one common chore is looking after the garden.
Jenny:
Oh, yes.
We have an orange tree and an apple tree, which are both watered automatically.
But we haven't connected the sprinkler to our lemon tree yet, so they'll need to water that one.
Adam:
Sure.
Now, Jenny, do you have any special requirements for your house sitter?
Jenny:
Well, I don't know if this is possible, but I'd probably rather have a couple than someone who's single.
The house might be a bit too big for just one person.
Adam:
Sure.
Now, many of our owners ask for sitters without children.
What's your preference?
Jenny:
Oh, that's no problem.
There's nothing they can break.
Adam:
What about smoking?
Jenny:
Oh, no.
I can't stand the smell.
Definitely not.
Now, how do I know that my house is going to be safe with the house sitters?
Adam:
Well, we check all of our house sitters very carefully.
They have to provide references.
But as well as that, you can ask for a police check if you want to.
Jenny:
Oh, yes.
I'd like to do that, please.
Adam:
Okay, no problem.
That's all I need for now.
Jenny:
Okay.`,
      groups: [
        note('Complete the form below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Oz Housesitters – Home Owner Registration Form', [
          'Name: Jenny Hall',
          'Address: 14 __Q1__ St, Greenfield',
          'Mobile no: __Q2__',
          'Date required from: __Q3__',
          'Length of time required: __Q4__ weeks',
          '<strong>House features:</strong>',
          '• it has a new __Q5__',
          '• it is near a station',
          "• there is room for the housesitter's __Q6__",
          '<strong>Special duties required:</strong>',
          '• water the __Q7__ tree',
          '<strong>Housesitter requirements:</strong>',
          '• the house is large so a __Q8__ is preferred',
          '• no __Q9__ allowed',
          '• would like a check carried out by the __Q10__',
        ], { 1: 'Gray', 2: '0491577248/0491 577 248', 3: '29th September/29 September/September 29th/September 29', 4: '3/three', 5: 'pool', 6: 'car', 7: 'lemon', 8: 'couple', 9: 'smoking', 10: 'police' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi địa chỉ.', t: ['Is that G-R-E-Y or G-R-A-Y?', 'A-Y.'], p: 'Cách viết G-R-E-Y là bẫy; tên phố đánh vần A-Y → Gray' },
        2: { v: 'Khi hỏi số điện thoại.', t: "It's 0491 577 248.", p: 'Số di động của Jenny → 0491577248' },
        3: { v: 'Khi hỏi ngày người trông nhà bắt đầu.', t: ["We're flying out on the 25th of September, but my brother will be in the house for a few days until the 28th.", 'So from the 29th of September, please.'], p: 'Ngày 25 là ngày bay, ngày 28 em trai còn ở (bẫy); cần từ ngày 29/9 → 29th September' },
        4: { v: 'Khi hỏi cần trông nhà bao lâu.', t: ['Well, I\'ll be attending a training course in Paris for two weeks', 'So, shall I put down three weeks?', 'That sounds about right.', 'I think four would be too long.'], p: '2 tuần là khoá học, 4 tuần là quá dài (bẫy); chốt 3 tuần → 3' },
        5: { v: 'Khi hỏi đặc điểm ngôi nhà.', t: ['No, we don\'t like using it.', 'But last year, we did put in a pool.'], p: 'Không có điều hoà (bẫy); năm ngoái mới làm hồ bơi → pool' },
        6: { v: 'Khi hỏi chỗ đỗ xe cho người trông nhà.', t: ["Now, if our house sitter has their own transport, is there any space for them to park?", "Well, we won't be taking our car, but it's a large double garage.", "There'll be space for one more."], p: 'Gara đôi còn chỗ cho thêm một xe → chỗ cho xe hơi của người trông nhà → car' },
        7: { v: 'Khi nói về việc tưới cây.', t: ['We have an orange tree and an apple tree, which are both watered automatically.', "But we haven't connected the sprinkler to our lemon tree yet, so they'll need to water that one."], p: 'Cam và táo được tưới tự động (bẫy); cây chanh cần tưới tay → lemon' },
        8: { v: 'Khi hỏi yêu cầu về người trông nhà.', t: ["Well, I don't know if this is possible, but I'd probably rather have a couple than someone who's single.", 'The house might be a bit too big for just one person.'], p: 'Nhà rộng nên muốn một cặp đôi hơn người độc thân → couple' },
        9: { v: 'Khi hỏi về hút thuốc.', t: ['What about smoking?', "I can't stand the smell.", 'Definitely not.'], p: 'Trẻ em thì không sao (bẫy); hút thuốc thì tuyệt đối không → smoking' },
        10: { v: 'Cuối bài, về việc kiểm tra người trông nhà.', t: ['They have to provide references.', 'But as well as that, you can ask for a police check if you want to.', "I'd like to do that, please."], p: 'Thư giới thiệu là thủ tục bắt buộc (bẫy); Jenny muốn cảnh sát kiểm tra → police' },
      },
    },
    {
      part: 2, title: 'Becoming a Millionaire', audio: 'Listening/Test 2/P2.mp3', cover: 'entrepreneur plumbing business | radio interview studio',
      transcript: `
Sue:
Everybody dreams of becoming a millionaire one day.
So we asked Arthur Knowles, who made his millions in the plumbing business, to give the budding entrepreneurs among you a few tips on how to make your first million.
Arthur, welcome to the programme.
Arthur:
Thanks, Sue.
Sue:
So, Arthur, what advice do you have for our listeners?
Arthur:
Well, one thing I've heard people say is that when you're starting up a business, you can't afford to make mistakes.
Well, I believe in the old saying, a person who never made a mistake never made anything.
You can't really predict when you'll make mistakes, and you have to look at them as a positive experience, and one that means you won't make the same mistake again.
You need to be able to cope with the world of business.
But according to recent American business school studies, believing in yourself isn't enough by itself to guarantee success.
Confidence can be a good thing, but a person can have too much confidence.
And people who try to learn to be confident by buying those how-to-succeed books are just wasting their time.
The advice given in these American studies was that being a successful entrepreneur comes down to having the right attitude.
It's no good getting depressed every time something goes wrong.
Always keep your goals in mind and never give up.
And don't listen to all the people around you who say, oh, this will never work.
One thing I've learned in business is that you don't have to be an expert in everything, like marketing, for example.
When I started my business, I tried to do it all myself, but I soon realised that although I knew everything there was to know about plumbing, I didn't have much idea about how to sell my ideas.
So, I got someone who knew more about this to take care of the marketing side of things for me.
And as for leadership, well, you've got to be someone your workers look up to because you've been seen to make the right decisions.
You have to be able to control people but listen to them at the same time.
Some people are driven to make their companies successful, but that too often leads to a ruthless approach.
Then there's the question of taking risks, even calculated ones.
I personally feel it's actually better to tread carefully when it comes to taking short-term risks.
You need a degree of vision, certainly, but it's easy to get carried away by your desire to increase profits, and if things go wrong, you can end up losing more than you gain.
Sue:
So, if you have a great idea for a business, what should you do next?
Arthur:
Well, the first thing to ask yourself is whether there's a need for your product or service.
Can you cater for people's needs better than existing companies?
You don't need to worry about whether it's original or not, because there isn't always enough of a demand for completely new ideas.
And the second thing to ask yourself is, not what colour should the packet be or how much should it cost, but do I care enough about this idea to dedicate the next ten years of my life to it?
Because realistically, that's how long it will take.
Sue:
Tell us how you got started, Arthur.
How do you explain your early success?
Arthur:
Well, I started my business just as the economy was going into a recession, which wasn't the best time, and I was lucky to survive, especially as the banks weren't being particularly supportive to small businesses at that time.
If I'd listened to the business advice I was given back then, I'd never have got started.
My strengths were that I knew I could provide a better service than my competitors, who really hadn't spotted the opportunities that were out there, and that my wife had a good job and was able to pay the household bills while I was getting the company on its feet.
The first couple of years were very tough, but I knew I would make it eventually.
Sue:
OK, now we're going to take some calls from listeners.`,
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nBecoming a millionaire', [
          [11, 'Arthur feels that when starting a business, mistakes should be', ['seen as an opportunity to learn.', 'predicted and minimised.', 'avoided at all costs.'], 'A'],
          [12, 'Recent American studies found that confidence will', ["sometimes reduce people's chances of success.", 'be increased by reading self-help books.', 'ensure good results on business courses.'], 'A'],
          [13, 'The American studies recommended that new entrepreneurs', ["listen to their colleagues' advice.", 'get professional help when things go wrong.', 'remain concentrated on their aims.'], 'C'],
          [14, 'What does Arthur say about his own experience of marketing?', ['He relied on what he already knew.', 'He hired an expert to take care of it.', 'He realised its importance too late.'], 'B'],
          [15, 'What does Arthur think is an important quality shared by good leaders?', ['They are ambitious for their company.', 'They can deal with difficult people.', 'They earn the respect of their workforce.'], 'C'],
          [16, 'What does Arthur say about taking risks?', ['He advises being cautious.', 'He favours a long-term view.', 'He believes it is financially advantageous.'], 'A'],
        ], 'Questions 11-16'),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO things does Arthur say people should focus on when developing their business idea?', ['making sure the idea is original', 'offering a better deal than competitors', 'being committed to it', 'paying attention to detail', 'fixing realistic prices'], ['B', 'C'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO things does Arthur say helped him get his business started?', ['family support', 'getting a loan from a bank', 'good business advice', 'a favourable economic climate', 'an effective approach to business'], ['A', 'E'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Khi Arthur nói về việc mắc lỗi.', t: ["You can't really predict when you'll make mistakes, and you have to look at them as a positive experience, and one that means you won't make the same mistake again."], p: 'Không thể đoán trước lỗi (B sai); phải coi lỗi là trải nghiệm tích cực để không lặp lại → cơ hội học hỏi → A' },
        12: { v: 'Khi nói về các nghiên cứu ở Mỹ.', t: ['Confidence can be a good thing, but a person can have too much confidence.', 'And people who try to learn to be confident by buying those how-to-succeed books are just wasting their time.'], p: 'Đọc sách tự lực là phí thời gian (B sai); quá tự tin có thể làm giảm cơ hội thành công → A' },
        13: { v: 'Khi nói lời khuyên của các nghiên cứu.', t: ['Always keep your goals in mind and never give up.', "And don't listen to all the people around you who say, oh, this will never work."], p: 'Đừng nghe người xung quanh (A sai); luôn ghi nhớ mục tiêu → tập trung vào mục tiêu → C' },
        14: { v: 'Khi Arthur kể về marketing.', t: ['When I started my business, I tried to do it all myself', 'So, I got someone who knew more about this to take care of the marketing side of things for me.'], p: 'Tự làm chỉ là lúc đầu (bẫy A); sau đó thuê người giỏi hơn lo marketing → B' },
        15: { v: 'Khi nói về khả năng lãnh đạo.', t: ["And as for leadership, well, you've got to be someone your workers look up to because you've been seen to make the right decisions.", 'Some people are driven to make their companies successful, but that too often leads to a ruthless approach.'], p: 'Tham vọng cho công ty dễ dẫn tới tàn nhẫn (bẫy A); người lãnh đạo phải được nhân viên ngưỡng mộ → được tôn trọng → C' },
        16: { v: 'Khi nói về rủi ro.', t: ["I personally feel it's actually better to tread carefully when it comes to taking short-term risks."], p: '“Tread carefully” = thận trọng; tầm nhìn chỉ là “certainly” phụ (bẫy B) → A' },
        17: { v: 'Khi Sue hỏi nên làm gì với ý tưởng kinh doanh.', t: ["Can you cater for people's needs better than existing companies?", "You don't need to worry about whether it's original or not"], p: 'Không cần lo ý tưởng có độc đáo không (A sai); phục vụ tốt hơn các công ty hiện có → ưu đãi tốt hơn đối thủ → B' },
        18: { v: 'Như câu 17 (chọn 2 đáp án).', t: ['not what colour should the packet be or how much should it cost, but do I care enough about this idea to dedicate the next ten years of my life to it?'], p: 'Màu bao bì, giá bán không phải điều quan trọng (D, E sai); có đủ tâm huyết cống hiến 10 năm không → tận tâm → C' },
        19: { v: 'Khi Arthur kể về thành công ban đầu.', t: ['and that my wife had a good job and was able to pay the household bills while I was getting the company on its feet.'], p: 'Vợ có việc tốt, trả các hoá đơn trong nhà → sự hỗ trợ của gia đình → A' },
        20: { v: 'Như câu 19 (chọn 2 đáp án).', t: ['especially as the banks weren\'t being particularly supportive to small businesses at that time.', "If I'd listened to the business advice I was given back then, I'd never have got started.", 'My strengths were that I knew I could provide a better service than my competitors'], p: 'Kinh tế suy thoái, ngân hàng không hỗ trợ, lời khuyên không dùng được (B, C, D sai); điểm mạnh là cách làm kinh doanh hiệu quả, phục vụ tốt hơn đối thủ → E' },
      },
    },
    {
      part: 3, title: 'Science Experiments in Primary School', audio: 'Listening/Test 2/P3.wma', cover: 'children science experiment classroom | primary school science lesson',
      transcript: `
Stefan:
Hi, Magda.
How was your placement?
Magda:
It went really well.
The kids really enjoyed the science I did with them.
Stefan:
So did mine.
I think they found it very motivating.
Magda:
Yes, the programme we had to teach was much better than the old-style science experiments we did at school.
Stefan:
Yes, though I don't understand why the children should have to build a model of a steam engine.
I tried it with the kids, but I couldn't get it to work.
Magda:
Me neither, and it really shows it's hard to get any real results.
Stefan:
Yes, and it's usually the children's parents, rather than the kids themselves, who favour that type of experiment.
So what experiments did you do?
Magda:
Well, one day a discussion started in class about breakfast cereals, about which one was best.
One child then said that we should test them in class.
Stefan:
That's a nice idea.
Magda:
Yes, and it wasn't expensive.
We bought four different brands of cereal and had everyone evaluate them for taste, appearance and sogginess in milk.
Stefan:
And are you going to tell me which one won?
Magda:
No, I'll let you do it yourself.
It obviously isn't difficult to set up.
Another experiment we did, the sports teacher's idea actually, was to spend a morning seeing how high various balls bounced.
For example, do new tennis balls bounce higher than old ones?
And do basketballs that are fully inflated bounce better than flatter ones?
Stefan:
And I guess you got some interesting data.
Magda:
We did.
And they had to make a chart to plot the results.
It really improved their grasp of charts and graphs and calculation.
Apparently they'd had problems understanding the point of graphs in the past.
Stefan:
Did all your experiments work out OK?
Magda:
Well, we had one lesson on making paper from grass.
The children made a terrible mess in the classroom.
Whatever they did didn't work, and it wasn't because it was difficult.
I think it was because it didn't engage them at all.
It didn't seem to motivate them.
Stefan:
My tie-dyeing experiment went well.
They had to get a piece of material and twist it into a rope and then dye it.
The children did end up with blue and green hands for a few days, though.
Magda:
But don't you need to spend more than one lesson on that?
Stefan:
Yes, we did it over three classes.
The children really loved it, though, and one suggested we make scarves from the result.
I declined, as my sewing skills aren't up to much.
Magda:
I guess the one experiment that everyone loved in my class was making glue from milk.
I thought it would be a complete failure, but in fact it worked brilliantly.
One reason, I suspect, is that they got feedback straight away.
Some children get really restless if they have to wait for anything interesting to happen.
Stefan:
Yes, I think that's always a good idea.
Really helps to make it a success.
Magda:
I see you've got a diagram there for one of your experiments.
Stefan:
Yes, it was an idea I got from the internet.
It was very easy and straightforward to set up.
The idea is to make a condenser to extract essences from plants.
The large container's made of metal.
Magda:
Right, and that holds the hot water?
Stefan:
That's right, and it has a strainer which sits inside it.
This is where you put the plant matter.
We use plants like rosemary, as the essence you can extract is quite strong.
Magda:
So, what's the container right at the top?
Stefan:
It's made of glass.
It's where we put the ice.
The glass container has a drip tip at the bottom.
Magda:
What's that for?
Stefan:
It's where the essence collects.
Magda:
Where does the essence go then?
Stefan:
Into the dish at the bottom.
It's made of pottery.
Magda:
Sounds good.
I might try it with my class.`,
      groups: [
        matching('What is said about each of the following experiments?\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 21-26.',
          ['very boring', 'too difficult', 'specialised equipment needed', 'very expensive', 'immediate results', 'useful practice for maths', 'cheap to do', 'takes longer than usual to do'], [
            [21, 'Steam engine', 'B'],
            [22, 'Breakfast cereals', 'G'],
            [23, 'Bouncing balls', 'F'],
            [24, 'Making paper', 'A'],
            [25, 'Tie-dyeing', 'H'],
            [26, 'Glue from milk', 'E'],
          ], { title: 'Comments', groupTitle: 'Questions 21-26' }),
        map('Label the diagram below.\nWrite the correct letter, A-G, next to Questions 27-30.', [
          [27, 'Metal container', 'D'],
          [28, 'Integral strainer', 'F'],
          [29, 'Drip tip', 'G'],
          [30, 'Pottery container', 'C'],
        ], { pdf: 'Listening/Test 2/Test 2- up.pdf', page: 5, box: [184, 152, 391, 366] }, 'Questions 27-30'),
      ],
      expl: {
        21: { v: 'Khi nói về mô hình động cơ hơi nước.', t: ["I tried it with the kids, but I couldn't get it to work.", "Me neither, and it really shows it's hard to get any real results."], p: 'Cả hai đều không làm nó chạy được, khó ra kết quả → quá khó → B' },
        22: { v: 'Khi Magda kể thí nghiệm ngũ cốc ăn sáng.', t: ["Yes, and it wasn't expensive.", "It obviously isn't difficult to set up."], p: '“Wasn\'t expensive” = rẻ → G' },
        23: { v: 'Khi nói thí nghiệm bóng nảy.', t: ['And they had to make a chart to plot the results.', 'It really improved their grasp of charts and graphs and calculation.'], p: 'Vẽ biểu đồ, tính toán giúp trẻ hiểu biểu đồ và phép tính → luyện toán → F' },
        24: { v: 'Khi nói thí nghiệm làm giấy từ cỏ.', t: ["Whatever they did didn't work, and it wasn't because it was difficult.", "I think it was because it didn't engage them at all."], p: 'Không phải vì khó (bẫy B); vì không thu hút trẻ chút nào → rất nhàm chán → A' },
        25: { v: 'Khi Stefan kể thí nghiệm nhuộm vải.', t: ["But don't you need to spend more than one lesson on that?", 'Yes, we did it over three classes.'], p: 'Phải làm trong ba buổi học → mất nhiều thời gian hơn bình thường → H' },
        26: { v: 'Khi Magda kể thí nghiệm làm keo từ sữa.', t: ['One reason, I suspect, is that they got feedback straight away.', 'Some children get really restless if they have to wait for anything interesting to happen.'], p: '“Got feedback straight away” = có kết quả ngay → E' },
        27: { v: 'Khi Stefan giới thiệu sơ đồ bình ngưng.', t: ["The large container's made of metal.", 'Right, and that holds the hot water?', "That's right"], p: 'Thùng kim loại lớn là phần chứa nước nóng ở dưới cùng → D' },
        28: { v: 'Ngay sau đó.', t: ["That's right, and it has a strainer which sits inside it.", 'This is where you put the plant matter.'], p: 'Cái rây nằm bên trong thùng kim loại, nơi đặt thảo mộc → F' },
        29: { v: 'Khi nói về bình thuỷ tinh ở trên cùng.', t: ['The glass container has a drip tip at the bottom.', "It's where the essence collects."], p: 'Đầu nhỏ giọt nằm ở đáy bình thuỷ tinh phía trên → G' },
        30: { v: 'Cuối bài, tinh dầu chảy về đâu.', t: ['Where does the essence go then?', 'Into the dish at the bottom.', "It's made of pottery."], p: 'Chiếc đĩa gốm ở giữa, phía dưới hứng tinh dầu → C' },
      },
    },
    { part: 4, reuse: '6ac6fe7a5b29fd38ff5a402c', title: 'Office Design' },
  ],
};
