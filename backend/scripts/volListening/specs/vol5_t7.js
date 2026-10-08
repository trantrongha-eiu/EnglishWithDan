// Vol 5 – Test 7 (PDF "Listening/Test 7/Test 7- up.pdf" p1–7; key "Tổng hợp key Listening.pdf" p7; audio Test 7/P1, P3, P4).
// P2 = bank "Moving Office" (Actual Test 7 / Vol 2 - Test 8 P2: same questions, same key 10/10).
// Transcript: Whisper large-v3 + turbo (speaker_pitch.js for turns, wb.js for the many P4 passages large-v3 dropped) checked
// against "Transcripts & Keys/test 7- transcripts.pdf".
// Source errors fixed: key Q9 "2" → 3 ("I might be able to find a three-bedroom property for you." "Yes, that would be ideal.");
// paper Q11 "to pay less rent" kept, Q26 "What does Ted suggest Monac" → "What does Ted suggest Mona should do?",
// Q27–30 box "A-F" → A-G (seven options).
const { note, mc, matching } = require('../vol_build');

module.exports = {
  vol: 5, test: 7,
  sections: [
    {
      part: 1, title: 'The London Relocation Services', audio: 'Listening/Test 7/P1.MP3', cover: 'moving house boxes | london terraced houses',
      transcript: `
Daniel:
London Relocation Services, Daniel speaking.
How may I help you?
Anna:
Good morning.
My family and I are moving to London later this year and I wonder if you can help.
Daniel:
Sure.
First of all, I'll need to get some personal details.
May I take your full name, please?
Anna:
It's Anna Woods.
Daniel:
Thanks.
Where are you moving from?
Anna:
Northern Ireland, just outside Belfast, actually.
Daniel:
Right.
And what's your current address?
Anna:
It's 118 Fordyce Park.
I'll spell that for you.
It's F-O-R-D-Y-C-E.
And that's in Ballysillan.
Daniel:
And what's the postcode?
Anna:
It's BT149BJ.
Daniel:
All right.
And could I take a contact phone number?
Anna:
I'll give you my mobile number as you can get me on that anytime.
It's 07840051963.
Daniel:
Great.
Got that.
Now, we always like to get a bit more information about the families that we're moving.
It helps with the search.
Are you moving for work?
Anna:
Yes, my husband's just got a new job in London.
Daniel:
And what about you?
Do you work?
Anna:
Well, I've been working as a teaching assistant recently, but I'm actually a qualified nurse and I'd like to get back into that if possible.
Daniel:
Right.
And do you have any children?
Anna:
Yes, a son.
So we need to find a school for him.
Daniel:
Is it a secondary school you'll be looking for?
Anna:
No, he's still in primary school.
He's not quite at the secondary level yet.
Daniel:
Fine.
So, let's go on to talk about your requirements for the property.
Do you have a preferred location?
Is your husband's job in the centre?
Anna:
No, it's in East London, but we'd rather live somewhere quieter.
Daniel:
Sure.
There are some lovely areas in the south.
Anna:
OK, that sounds great.
Now, my husband doesn't want to spend too long commuting to work every day.
Daniel:
So, I imagine that ideally he'd like to be not too far from a station then.
Anna:
Yes, he drives now, but I guess that's not going to be possible and he's not keen on buses.
Daniel:
What about you or your son?
Do you have any preferences?
Does your son do any sport, for example?
Anna:
He's quite active, so I'm sure he'd love a park nearby to run around in.
He doesn't do swimming or anything like that.
Daniel:
Great.
So, what sort of property do you have in mind?
Anna:
We have friends who live in an amazing flat over there, but as we've always lived in a house, I think we'll stick with that.
We'd find it hard to adapt to a flat.
Daniel:
OK.
And size-wise, how many bedrooms would you like?
Anna:
Well, there's just myself, my husband and our son.
Daniel:
So you definitely need a two-bedroom property.
But how about having a guest room?
I might be able to find a three-bedroom property for you.
Anna:
Yes, that would be ideal.
We're sure to have family visiting often.
Daniel:
All right.
I've made a note of that.
Now, are there any other requirements for your new property?
Anna:
Hmm, well, it's not essential, but it'd be handy to have an office for when my husband works from home.
It doesn't need to be a big one.
Daniel:
I guess it all comes down to budget.
Anna:
Yes.
Daniel:
OK, Anna.
Well, I've certainly got enough to be getting on with, and I will...`,
      groups: [
        note('Complete the table below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'The London Relocation Services', [
          "<strong>Customer's name:</strong> Anna Woods",
          "<strong>Customer's personal details</strong>",
          '• Current address: 118 __Q1__ Park, Ballysillan',
          '• Postcode: BT149BJ',
          '• Phone No: __Q2__ (Mobile)',
          '<strong>Other information</strong>',
          '• Anna is hoping to find work as a __Q3__',
          '• She needs to find a __Q4__ school for her son.',
          '<strong>Requirements for the new property</strong>',
          'Location',
          '• Her preferred location is in the __Q5__ of the city.',
          '• Her husband would like to be near a __Q6__',
          '• Her son would prefer to be close to a __Q7__',
          'Property details',
          '• She would like to live in a __Q8__',
          '• She would prefer __Q9__ bedrooms',
          '• A small __Q10__ is also desirable',
        ], { 1: 'Fordyce', 2: '07840051963', 3: 'nurse', 4: 'primary', 5: 'south', 6: 'station', 7: 'park', 8: 'house', 9: '3/three', 10: 'office' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi hỏi địa chỉ hiện tại.', t: ["It's 118 Fordyce Park.", "It's F-O-R-D-Y-C-E."], p: 'Tên được đánh vần F-O-R-D-Y-C-E → Fordyce' },
        2: { v: 'Khi hỏi số điện thoại.', t: "It's 07840051963.", p: 'Số di động của Anna → 07840051963' },
        3: { v: 'Khi hỏi về công việc của Anna.', t: "Well, I've been working as a teaching assistant recently, but I'm actually a qualified nurse and I'd like to get back into that if possible.", p: 'Trợ giảng là việc gần đây (bẫy); muốn quay lại làm y tá → nurse' },
        4: { v: 'Khi hỏi về trường cho con.', t: ["Is it a secondary school you'll be looking for?", "No, he's still in primary school."], p: 'Không phải trung học (bẫy); con còn học tiểu học → primary' },
        5: { v: 'Khi hỏi khu vực mong muốn.', t: ["No, it's in East London, but we'd rather live somewhere quieter.", 'There are some lovely areas in the south.', 'OK, that sounds great.'], p: 'Phía đông là nơi làm của chồng (bẫy); chọn khu phía nam → south' },
        6: { v: 'Khi nói về việc đi làm của chồng.', t: ["So, I imagine that ideally he'd like to be not too far from a station then.", "Yes, he drives now, but I guess that's not going to be possible and he's not keen on buses."], p: 'Không lái xe được, không thích xe buýt (bẫy); muốn gần nhà ga → station' },
        7: { v: 'Khi hỏi sở thích của con trai.', t: ["He's quite active, so I'm sure he'd love a park nearby to run around in.", "He doesn't do swimming or anything like that."], p: 'Không bơi (bẫy); muốn có công viên gần nhà → park' },
        8: { v: 'Khi hỏi loại nhà.', t: ['We have friends who live in an amazing flat over there, but as we\'ve always lived in a house, I think we\'ll stick with that.'], p: 'Căn hộ là của bạn bè (bẫy); muốn ở nhà riêng → house' },
        9: { v: 'Khi hỏi số phòng ngủ.', t: ['So you definitely need a two-bedroom property.', 'I might be able to find a three-bedroom property for you.', 'Yes, that would be ideal.'], p: 'Hai phòng là mức tối thiểu (bẫy); có thêm phòng khách thì ba phòng là lý tưởng → 3' },
        10: { v: 'Cuối bài, về yêu cầu khác.', t: "Hmm, well, it's not essential, but it'd be handy to have an office for when my husband works from home.", p: 'Một phòng làm việc nhỏ cho chồng → office' },
      },
    },
    { part: 2, reuse: '6a53d6c95c459ab074ceb86a', title: 'Moving Office' },
    {
      part: 3, title: 'Presentation on Design Development', audio: 'Listening/Test 7/P3.mp3', cover: 'design history presentation | student presentation slides',
      transcript: `
Mona:
Ted, you've looked at my presentation, haven't you?
What do you think of it?
Ted:
Hey, Mona.
Yes, I have.
Before giving you some advice, I have a question.
Why didn't you write about the development of design and its influence, or connection with social advancement, or even art movement?
In my opinion, this direction would have more significance.
Mona:
Actually, I just want to focus on the history of design.
I'm particularly interested in its history from the 1800s.
That's why I wrote about it.
Ted:
I see.
It could save some effort.
Mona:
Not really.
I've covered different areas of design, such as building, clothing, and products.
It's a lot of work.
Ted:
Right.
Is it because you want to give a comprehensive talk?
Mona:
To be honest, I was worried about my teacher's reaction.
If I only talk about one area, she might think I've been lazy.
Ted:
You know what?
Even though it's okay to talk about different aspects, I think the topic is too broad.
It would be hard for the listeners to focus on any specific area.
Mona:
Um, you are right.
I only have about 45 minutes for the talk.
Maybe I should narrow the range.
Ted:
That would be much better.
And you can use computer technology to assist you in your presentation, like using the CAD or other computer software.
Mona:
I'm not sure.
Although computer technology can improve the visual effects of my presentation, I'd rather use the traditional way, since I'm talking about the history of design.
I guess traditional media is more affected by computers, rather than the designing industry.
Ted:
That makes sense.
You could do it your own way.
As for the content, you mentioned purism, and you said it can save people's effort.
I don't really agree with that.
I think it's not really easy to achieve.
On the other hand, I do think it's important to apply this concept in architecture.
I mean, the building should look simple and elegant.
Mona:
That's a good point.
Ted, what do you think I should do to further improve my talk?
Ted:
Well, I think you have read enough books about it.
So, it's not the theories that you lack.
Why don't you visit the Design Museum in the north of the city?
One of my friends went there last month, and he said it was worth it.
I'm sure it can give you some inspiration.
Mona:
How do you usually prepare for a presentation?
You have done it many times, right?
Ted:
You can say that.
When I prepare for a presentation, I would first try to come up with an introduction telling the audience what my topic is.
It's very important to grasp people's attention and let them know what you want to talk about.
Mona:
Okay, I think so.
A good beginning can mean everything.
Ted:
Exactly.
Maybe you could use a story to start.
Step 2, I would research deeper into the topic and give the audience something new.
Mona:
Yeah, that's what I've been working on.
I always try to look for more related information online.
I want them to learn something from my presentation.
Ted:
Since you work so hard, they will like it.
I noticed that you use a lot of pictures in your slides.
What I would do is put a statement under each picture, so the audience would know what exactly the pictures are about.
Mona:
I just thought it would be more impressive to use only pictures.
Alright, I will add that.
Ted:
In the next step, you should try illustrating slide by slide.
Each slide should only contain one thought or idea, so all of these thoughts will link together in your illustration.
Mona:
This step would need a lot of practice.
Ted:
Exactly.
A lot of practice is needed before you stand in front of the real audience.
There's one final step you should not forget.
I suggest you prepare some text handouts with important details.
Mona:
What are they for?
Ted:
The audience can reflect on what you talk about in and after your presentation.
Mona:
I've never thought about that.
Thank you so much.
Ted, you're a great help.
Ted:
No problem, Mona.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, "Mona's presentation topic is about", ['design development from the 1800s', 'design development and social advancement', 'design development and art movement'], 'A'],
          [22, "Mona doesn't want to just talk about one topic because", ["she is afraid of her tutor's response.", 'she wants to give a complete talk.', 'she thinks it would be too simple.'], 'A'],
          [23, "What does Ted say about Mona's topic?", ['very detailed', 'too old', 'too broad'], 'C'],
          [24, "What is Mona's viewpoint on computers?", ['They have improved work efficiency.', 'They have influenced traditional media.', "They have changed people's sense of style."], 'B'],
          [25, "What does Ted think of 'purism'?", ["It's important for architecture.", 'It saves a lot of effort.', 'He admires it in arts.'], 'A'],
          [26, 'What does Ted suggest Mona should do?', ['meet one of his friends', 'read more books', 'visit a museum'], 'C'],
        ], 'Questions 21-26'),
        matching('According to Ted, what is the right way to make a successful presentation?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 27-30.',
          ['text handouts', 'questions', 'an outline', 'an introduction', 'statement', 'explain', 'research'], [
            [27, 'Step 1. Write ______', 'D'],
            [28, 'Step 2. ______ further on the topic', 'G'],
            [29, 'Step 3. Put a ______ for every picture and support it', 'E'],
            [30, 'Step 4. Every slide illustrates a thought, all the thoughts link together. Step 5. Write ______', 'A'],
          ], { groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Đầu bài, khi Ted hỏi về chủ đề.', t: ['Why didn\'t you write about the development of design and its influence, or connection with social advancement, or even art movement?', "I'm particularly interested in its history from the 1800s."], p: 'Xã hội, phong trào nghệ thuật là gợi ý của Ted (bẫy B, C); Mona viết về lịch sử thiết kế từ những năm 1800 → A' },
        22: { v: 'Khi Ted hỏi có phải muốn bài nói toàn diện.', t: ['Is it because you want to give a comprehensive talk?', "To be honest, I was worried about my teacher's reaction."], p: '“Comprehensive talk” là phỏng đoán của Ted (bẫy B); Mona lo cô giáo phản ứng → A' },
        23: { v: 'Khi Ted nhận xét chủ đề.', t: "Even though it's okay to talk about different aspects, I think the topic is too broad.", p: 'Chủ đề quá rộng → C' },
        24: { v: 'Khi bàn dùng công nghệ máy tính.', t: ['Although computer technology can improve the visual effects of my presentation', 'I guess traditional media is more affected by computers, rather than the designing industry.'], p: 'Máy tính ảnh hưởng đến truyền thông truyền thống nhiều hơn → B' },
        25: { v: 'Khi Ted nói về chủ nghĩa thuần khiết.', t: ["As for the content, you mentioned purism, and you said it can save people's effort.", "I don't really agree with that.", "On the other hand, I do think it's important to apply this concept in architecture."], p: 'Tiết kiệm công sức là ý của Mona, Ted không đồng ý (bẫy B); quan trọng trong kiến trúc → A' },
        26: { v: 'Khi Mona hỏi cách cải thiện.', t: ['Well, I think you have read enough books about it.', "Why don't you visit the Design Museum in the north of the city?", 'One of my friends went there last month'], p: 'Đã đọc đủ sách, bạn của Ted chỉ là người từng đi (bẫy A, B); nên đi bảo tàng → C' },
        27: { v: 'Khi Ted kể cách chuẩn bị.', t: 'When I prepare for a presentation, I would first try to come up with an introduction telling the audience what my topic is.', p: 'Bước 1 là viết phần mở đầu → D' },
        28: { v: 'Bước 2.', t: 'Step 2, I would research deeper into the topic and give the audience something new.', p: 'Nghiên cứu sâu hơn về chủ đề → G' },
        29: { v: 'Khi nói về hình ảnh trong slide.', t: 'What I would do is put a statement under each picture, so the audience would know what exactly the pictures are about.', p: 'Đặt một câu nhận định dưới mỗi hình → E' },
        30: { v: 'Bước cuối cùng.', t: ["There's one final step you should not forget.", 'I suggest you prepare some text handouts with important details.'], p: 'Chuẩn bị tài liệu phát tay có chữ → A' },
      },
    },
    {
      part: 4, title: 'Graphical Symbols', audio: 'Listening/Test 7/P4.mp3', cover: 'egyptian hieroglyphs | ancient symbols stone',
      transcript: `
Good morning, everyone.
Today I'm going to talk about the graphical symbol.
A graphic symbol is a written symbol that is used to represent speech, such as those used in the Greek alphabet.
The term graphic symbol encompasses anything from the logographs used in Egyptian hieroglyphic writing to ancient Chinese pictograms.
Early symbols were based on pictographs and ideograms, before they were developed into logographic writing systems.
These systems are still in use in some non-literate cultures in Africa, the Americas, and Oceania.
Indeed, elements of pictography are still found in modern Chinese characters, and it is often an interesting exercise to trace the origins of some Chinese characters.
Pictographs remain in common commercial use today as signs, instructions, or statistical diagrams.
Road signs and public toilet signs, and even flat-pack assembly instructions utilising pictures, are considered pictographic.
Ancient graphic writing systems provide researchers with a wealth of knowledge about past civilisations.
In 1799, one of the most important historical discoveries was made by accident when members of Napoleon's expedition to Egypt found a stone in Rosetta that exhibited three different scripts.
The stone, now known as the Rosetta Stone, was studied in significant depth by scholars, and was first deciphered by Frenchman Jean-François Champollion in 1822.
He was able to correctly determine the phonetic values of the symbols, and later research has confirmed his findings.
In many of these symbols, lines are used to portray a multitude of meanings, and knowledge and understanding of these lines holds the key to comprehension of graphic writing systems.
A key moment in the history of communication was the invention of the camera obscura, or camera.
Although the concept can be traced back to the 5th century BC Chinese philosopher Mo Ti, the first photographic image was ultimately created in 1826 by Joseph Nicéphore Niépce.
Photography, as it was later known, enables researchers to piece together and better understand history.
Today, photography forms a huge part of everyday life, and most publications contain a vast number of photographs.
Photography is used in advertising, and is now becoming a way to increase awareness of existing world issues.
For example, animal welfare charities are increasingly using photography to advertise animals that are at high risk of endangerment.
Charity workers are sometimes flown to far-flung locations to document the suffering endured by high-risk animals in an attempt to raise human awareness of their consumption activities and how they impact others.
One recent high-profile campaign was undertaken by attaching a camera to the foot of a bird in order to obtain photographs of the animals in their natural habitats and understand how often they come into contact with human waste.
A soon-to-be-released documentary about the suffering of animals on Midway Island shows the full extent to which human consumption is harming animals thousands of miles away from us.
As photography continues to progress, with the use of drones now becoming somewhat commonplace, we should expect more and more objects to be included in the future, expanding the horizon of photography ever further.
Indeed, the downward pressure on traditional media prices means that media companies are being forced to get creative on how to make a profit.
Many have found that the answer to this lies in advertising, and companies are now willing to devote a large portion of their budgets to advertising in newspapers.
By the same token, marketing has become an essential part of a company's business model, often meaning the success or failure of a company.
As a result, much time and money has been pumped into the development of effective branding, with attractive packaging playing a large role in this.
However, many governments are now seen to be cracking down on marketing and packaging in an attempt to protect consumers from being misled.
In particular, tobacco companies are now subject to ever-increasing regulation.
For example, in the United Kingdom, legislation is soon to pass preventing any form of branding or differentiation on cigarette packaging in efforts to curb the harmful effects of smoking.
Finally, one must not forget the fundamental role that graphic writing systems have had to play in mathematics.
Graphs, icons and diagrams often form the very basis of these branches of academia.
Indeed, one needs to look no further than chemistry's periodic table to see a perfect example of graphic writing systems in use today.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Graphical Symbol', [
          "<strong>'Graphical symbol'</strong>",
          '• includes the logographs in Egyptian hieroglyphic writing and ancient Chinese pictograms',
          '• found in Africa, the Americas, and Oceania',
          '• still has something to do with __Q31__ use today',
          '<strong>Ancient graphic writing systems</strong>',
          '• Researchers obtain a wide range of __Q32__ about past civilisations.',
          "• Rosetta Stone was found in 1799 when members of Napoleon's expedition got to Egypt.",
          '• Frenchman Jean-François Champollion determined the phonetic values of the symbols in 1822.',
          '• In those symbols, __Q33__ are used to depict various meanings.',
          '<strong>Camera obscura</strong>',
          '• __Q34__ helps people understand history better.',
          '• Some charities will __Q35__ many endangered species.',
          '• A camera was tied to one __Q36__ of a bird.',
        ], { 31: 'commercial', 32: 'knowledge', 33: 'lines', 34: 'Photography', 35: 'advertise', 36: 'foot' }, 'Questions 31-36'),
        note('Complete the sentences below.\nWrite ONE WORD ONLY for each answer.', '', [
          'More __Q37__ will be included in the future with the development of photography.',
          'Companies would like to invest a lot to advertise in __Q38__',
          'Designing appealing __Q39__ is used as a way of effective branding.',
          'Graphic writing systems are of great importance in the subject of __Q40__',
        ], { 37: 'objects', 38: 'newspapers', 39: 'packaging', 40: 'mathematics/maths' }, 'Questions 37-40'),
      ],
      expl: {
        31: { v: 'Khi nói về chữ tượng hình ngày nay.', t: 'Pictographs remain in common commercial use today as signs, instructions, or statistical diagrams.', p: 'Vẫn được dùng phổ biến cho mục đích thương mại → commercial' },
        32: { v: 'Khi nói về hệ chữ viết cổ.', t: 'Ancient graphic writing systems provide researchers with a wealth of knowledge about past civilisations.', p: '“A wealth of knowledge” = lượng kiến thức phong phú → knowledge' },
        33: { v: 'Khi nói về đá Rosetta.', t: 'In many of these symbols, lines are used to portray a multitude of meanings', p: 'Các nét kẻ được dùng để thể hiện nhiều ý nghĩa → lines' },
        34: { v: 'Khi nói về máy ảnh.', t: 'Photography, as it was later known, enables researchers to piece together and better understand history.', p: 'Nhiếp ảnh giúp hiểu lịch sử rõ hơn → Photography' },
        35: { v: 'Khi nói về các tổ chức từ thiện.', t: 'For example, animal welfare charities are increasingly using photography to advertise animals that are at high risk of endangerment.', p: 'Dùng ảnh để quảng bá về các loài có nguy cơ tuyệt chủng → advertise' },
        36: { v: 'Khi kể chiến dịch gần đây.', t: 'One recent high-profile campaign was undertaken by attaching a camera to the foot of a bird', p: 'Gắn máy ảnh vào chân một con chim → foot' },
        37: { v: 'Khi nói về tương lai của nhiếp ảnh.', t: 'As photography continues to progress, with the use of drones now becoming somewhat commonplace, we should expect more and more objects to be included in the future', p: 'Sẽ có ngày càng nhiều vật thể được đưa vào ảnh → objects' },
        38: { v: 'Khi nói về quảng cáo.', t: 'Many have found that the answer to this lies in advertising, and companies are now willing to devote a large portion of their budgets to advertising in newspapers.', p: 'Dành phần lớn ngân sách quảng cáo trên báo → newspapers' },
        39: { v: 'Khi nói về xây dựng thương hiệu.', t: 'As a result, much time and money has been pumped into the development of effective branding, with attractive packaging playing a large role in this.', p: 'Bao bì hấp dẫn đóng vai trò lớn trong thương hiệu → packaging' },
        40: { v: 'Phần kết.', t: 'Finally, one must not forget the fundamental role that graphic writing systems have had to play in mathematics.', p: 'Vai trò nền tảng trong toán học (hoá học chỉ là ví dụ thêm) → mathematics' },
      },
    },
  ],
};
