// Vol 4 – Test 5 (PDF "listening/test 5/listening- up.pdf" p1–6; key xlsx sheet Test 5 = key.pdf; audio test 5/0N Track.mp3 —
// Track 1 clipped from "Now turn to Part 1", Track 4 cut after "one minute to check" (10-minute silence follows)).
// Transcript: Whisper + Otter (01 Track.pdf, Speaker 2.pdf = P2, 03 Track.pdf, 04 Track - Part.pdf) written out with turns.
// Source errors fixed: key Q21–22 "D, E" → C, D (Otter + Whisper: "they'd had access to a piano at some point, but not all
// had studied it formally"; "they all had a degree of proficiency in at least two instruments"); paper Q36 line garbled
// ("particular types of 36 …itself slippery…, e.g. glutinous snail makes") → rewritten; Q25–26 option D "EThey".
const { note, table, matching, map, multi } = require('../vol_build');

module.exports = {
  vol: 4, test: 5,
  sections: [
    {
      part: 1, title: 'School Art Competition', audio: 'listening/test 5/01 Track.mp3', clip: [37.8, 412], cover: 'children art competition | school art exhibition',
      transcript: `
Wendy:
Hi, John.
John:
Hi, Wendy.
Wendy:
Thanks for coming to discuss the school art competition.
I know this is your first year organising it.
John:
Well, I've got some ideas, but I'd appreciate some help with arrangements.
Wendy:
OK.
We usually divide the competition into age groups.
The first age group is junior students.
John:
I'll just note that down.
Wendy:
Last year, we went with the theme of family.
That worked very well.
John:
Yes.
Something simple is best for young children, I think.
How about animals this year?
Wendy:
Sounds good.
And for the type of art, last year children in the junior age group created a drawing.
Shall we stick with that?
John:
Yes.
And for the prize, I heard last year we gave cinema tickets to the winner.
Is that right?
Wendy:
Yes.
But, you know, it might be nice to give the winners tickets to the zoo this time.
John:
Good idea.
Wendy:
OK.
Finally, for the senior students, we also have to think of a theme.
John:
I've got a couple of ideas.
One is the future.
Wendy:
Hmm.
I'm not quite sure how students might approach that theme.
It could be tricky.
John:
My other idea was the city.
What do you think?
Wendy:
Good.
Students could get some really interesting images with that theme.
And for the type of art, I think a photograph would work well.
John:
Great idea.
Wendy:
And as a prize, one of our sponsors is willing to donate a voucher that the winner can spend on travel.
John:
Fantastic.
They can find inspiration for their next artworks.
Wendy:
Sure.
First of all, the deadline for submitting artwork.
We want to award the prizes on May 25.
Last year, we needed a week to judge the winners and finalise arrangements for the awards night.
How about if entrants submit their artwork by May 18?
John:
Sure.
I'll just note that down.
Where should they submit their artworks?
At the office?
Wendy:
Actually, there's more space at the library.
So let's ask students to take their art there.
John:
OK.
In terms of judging the competition, what did you do last year?
Wendy:
We used an excellent local artist.
We should try and use her again this year.
Her name is Rebecca Leigh.
John:
OK.
Is that L-double-E?
Wendy:
No.
It's L-E-I-G-H.
John:
Right.
I guess I should also note down her number so that I can get in contact with her after we finalise the rest of the competition details.
Wendy:
Sure.
I've got her number here.
Are you ready?
It's 0407 625 4633.
John:
Got it.
After the judging, where are we going to display the artworks?
Wendy:
How about we book the Bridge Street Gallery?
It's a beautiful old building.
John:
It is.
So, can you go ahead and book it?
Wendy:
Yes.
And do you think we should also publish the artworks in the school magazine?
John:
Yes, definitely.
I think the winning students would be delighted to see that.
Wendy:
Great.
Now, in terms of the art exhibition of the students' work, should we make it a morning event and follow it up with a special lunch or afternoon tea for parents?
John:
I was thinking a late afternoon event might be better, so that parents can attend after work.
After the exhibition, we could put on a dinner.
What do you think?
Wendy:
Yes, that could be nice.
Now, I want...`,
      groups: [
        table('Complete the table below.\nWrite ONE WORD ONLY for each answer.\n\nSchool Art Competition – Arrangements for this year',
          ['Age group', 'Theme', 'Type of art', 'Prize'], [
            ['Junior students', '__Q1__', 'a drawing', '__Q2__ tickets'],
            ['Senior students', 'the __Q3__', 'a photograph', 'a __Q4__ voucher'],
          ], { 1: 'animals/animal', 2: 'zoo', 3: 'city', 4: 'travel' }, 'Questions 1-4'),
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Further details', [
          '<strong>Submitting the artwork</strong>',
          '• When: no later than __Q5__',
          '• Where: at the __Q6__',
          '<strong>Competition judge</strong>',
          '• Name: Rebecca __Q7__',
          '• Her phone number: __Q8__',
          '<strong>After the judging</strong>',
          '• The display will be in the Bridge Street Gallery.',
          '• The artworks will appear in a __Q9__',
          '• The art exhibition will be followed by a __Q10__ produced by the school.',
        ], { 5: '18 May/18th May/May 18/May 18th', 6: 'library', 7: 'Leigh', 8: '04076254633/0407 625 4633', 9: 'magazine', 10: 'dinner' }, 'Questions 5-10'),
      ],
      expl: {
        1: { v: 'Khi bàn chủ đề cho học sinh nhỏ.', t: ['Last year, we went with the theme of family.', 'How about animals this year?', 'Sounds good.'], p: 'Gia đình là chủ đề năm ngoái (bẫy); năm nay chọn động vật → animals' },
        2: { v: 'Khi bàn giải thưởng cho học sinh nhỏ.', t: ['And for the prize, I heard last year we gave cinema tickets to the winner.', 'But, you know, it might be nice to give the winners tickets to the zoo this time.', 'Good idea.'], p: 'Vé xem phim là của năm ngoái (bẫy); năm nay tặng vé sở thú → zoo' },
        3: { v: 'Khi bàn chủ đề cho học sinh lớn.', t: ["I'm not quite sure how students might approach that theme.", 'My other idea was the city.', 'Good.'], p: '“The future” bị cho là khó (bẫy); chọn chủ đề thành phố → city' },
        4: { v: 'Khi nói giải thưởng cho học sinh lớn.', t: 'And as a prize, one of our sponsors is willing to donate a voucher that the winner can spend on travel.', p: 'Phiếu quà tặng dùng để đi du lịch → travel voucher → travel' },
        5: { v: 'Khi bàn hạn nộp bài.', t: ['We want to award the prizes on May 25.', 'How about if entrants submit their artwork by May 18?'], p: '25/5 là ngày trao giải (bẫy); hạn nộp là 18/5 → 18 May' },
        6: { v: 'Khi hỏi nộp bài ở đâu.', t: ['At the office?', "Actually, there's more space at the library."], p: 'Văn phòng bị gạt đi (bẫy); nộp ở thư viện vì rộng hơn → library' },
        7: { v: 'Khi nói tên giám khảo.', t: ['Is that L-double-E?', 'No.', "It's L-E-I-G-H."], p: '“Lee” là cách viết sai (bẫy); họ được đánh vần L-E-I-G-H → Leigh' },
        8: { v: 'Khi đọc số điện thoại.', t: "It's 0407 625 4633.", p: 'Số điện thoại của Rebecca → 04076254633' },
        9: { v: 'Khi bàn sau khi chấm giải.', t: 'And do you think we should also publish the artworks in the school magazine?', p: 'Tác phẩm sẽ được đăng trên tạp chí của trường → magazine' },
        10: { v: 'Cuối bài, về sự kiện sau triển lãm.', t: ['should we make it a morning event and follow it up with a special lunch or afternoon tea for parents?', 'After the exhibition, we could put on a dinner.', 'Yes, that could be nice.'], p: 'Bữa trưa, tiệc trà chiều bị gạt đi (bẫy); sau triển lãm tổ chức bữa tối → dinner' },
      },
    },
    {
      part: 2, title: 'Palm Island Regional Park', audio: 'listening/test 5/02 Track.mp3', cover: 'coastal walking track island | regional park bay',
      transcript: `
Well, morning, everyone.
Welcome to Palm Island.
First, I'll run through the plan for the day.
So the idea is that in the morning you'll go for a walk.
There are actually a number of different walks on the island, so I'll describe each one and then you can choose.
So there's the Boundary Walk.
This is one of the longer walks, and it will appeal especially to people who love the coastline.
And in fact, the tide is out today, so it'll be perfect for exploring the very old rock formations behind the beach.
A good option is the Loop Track.
Now, this is quite short, but don't be misled by that, because it's very hilly and you need to be quite fit.
The reward, though, is that you'll be able to see right down the length of the island and even across to the mainland.
It'll be pretty as a picture on a fine day like today.
There's the Puriri Walk, which follows one of the earliest trails that was built on the island.
Unfortunately, the track's been damaged slightly by a storm, but it's still passable.
The nice thing is, about halfway, there's a table and chairs.
They've recently been restored and painted, in fact, and it's a great place to eat your packed lunch and have a rest.
You could also walk up to North Head.
This is an inland walk.
You'll hardly get a glimpse of the sea the whole way, but the attraction is you'll pass through a large area of very old native bush.
The number of birds is amazing, including several rare species.
You'll find some are quite tame, but please don't give them any food.
Now, if you look at your maps of the regional park, I'll just describe a few things you can do.
Um, so the bus will drop you at the park entrance, right at the bottom of the map.
One interesting place is the bird colony.
To get there from the park entrance, you go up the path to the lake.
About halfway around the east side of the lake, you need to turn off and take the path all the way out to the coast.
You'll find the colony there, overlooking a little island.
Now, if you'd like a swim, remember that not all the beaches are really suitable in this wind.
For the safest place, follow the path north from the park entrance, but before you get to the lake, turn right and go down there to the beach.
Something that people find interesting is the old ship.
It's more than 100 years old.
To get there, just north of the park entrance, you take the path which heads towards Okiwi Bay.
Then walk along the coast a little way before turning right and following that path over to Rocky Bay.
You'll see the wharf; go past that and the ship is just along there.
A long walk, but one that's well worth it, is up to Stony Batter.
You follow the path right around the lake to the far side and keep heading north.
But if you reach the water tower, you've gone too far.
Before that, you want to turn off to your left and take the path to the coast.
Now, where else is there?
Oh yes, the Settlers' Monument.
That's popular.
So, from the park entrance, take the first path on the left and follow it around behind Okiwi Bay.
The monument is out at the end there, on the headland.
Finally, if all this exercise has made you thirsty, there's a kiosk where you can get hot and cold drinks.
It's easy to find, beside the lake, right on the water's edge.
Well, now, if anyone has any questions...`,
      groups: [
        matching('What feature of each of the following walks does the speaker recommend?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 11-14.',
          ['picnic area', 'historic building', 'flat paths', 'seashore', 'art works', 'wildlife', 'views'], [
            [11, 'Boundary Walk', 'D'],
            [12, 'Loop Track', 'G'],
            [13, 'Puriri Walk', 'A'],
            [14, 'North Head', 'F'],
          ], { title: 'Recommended Features', groupTitle: 'Questions 11-14' }),
        map('Label the map below.\nWrite the correct letter, A-J, next to Questions 15-20.', [
          [15, 'Bird colony', 'D'],
          [16, 'Safe swimming beach', 'F'],
          [17, 'Old ship', 'J'],
          [18, 'Stony Batter', 'E'],
          [19, "Settlers' Monument", 'C'],
          [20, 'Kiosk', 'I'],
        ], { pdf: 'listening/test 5/listening- up.pdf', page: 3, box: [118, 168, 500, 500] }, 'Questions 15-20'),
      ],
      expl: {
        11: { v: 'Khi giới thiệu Boundary Walk.', t: ['This is one of the longer walks, and it will appeal especially to people who love the coastline.', "And in fact, the tide is out today, so it'll be perfect for exploring the very old rock formations behind the beach."], p: 'Dành cho người yêu bờ biển, khám phá đá sau bãi biển → seashore → D' },
        12: { v: 'Khi giới thiệu Loop Track.', t: ["The reward, though, is that you'll be able to see right down the length of the island and even across to the mainland."], p: 'Đường đồi dốc (không phẳng – bẫy C), phần thưởng là ngắm toàn đảo và đất liền → views → G' },
        13: { v: 'Khi giới thiệu Puriri Walk.', t: ["The nice thing is, about halfway, there's a table and chairs.", "They've recently been restored and painted, in fact, and it's a great place to eat your packed lunch and have a rest."], p: 'Đường mòn cổ (bẫy B), nhưng điểm hay là bàn ghế để ăn trưa → picnic area → A' },
        14: { v: 'Khi giới thiệu North Head.', t: ["You'll hardly get a glimpse of the sea the whole way, but the attraction is you'll pass through a large area of very old native bush.", 'The number of birds is amazing, including several rare species.'], p: 'Gần như không thấy biển; điểm hấp dẫn là rừng bụi và rất nhiều loài chim → wildlife → F' },
        15: { v: 'Khi chỉ đường tới bãi chim.', t: ['About halfway around the east side of the lake, you need to turn off and take the path all the way out to the coast.', "You'll find the colony there, overlooking a little island."], p: 'Rẽ ở giữa bờ đông của hồ, đi ra bờ biển, nhìn ra hòn đảo nhỏ → D' },
        16: { v: 'Khi nói chỗ bơi an toàn.', t: 'For the safest place, follow the path north from the park entrance, but before you get to the lake, turn right and go down there to the beach.', p: 'Đi về phía bắc, rẽ phải trước khi tới hồ, xuống bãi biển → F' },
        17: { v: 'Khi chỉ đường tới con tàu cũ.', t: ['Then walk along the coast a little way before turning right and following that path over to Rocky Bay.', "You'll see the wharf; go past that and the ship is just along there."], p: 'Qua vịnh Rocky, đi qua cầu tàu (Wharf), con tàu ở ngay sau đó → J' },
        18: { v: 'Khi chỉ đường tới Stony Batter.', t: ["But if you reach the water tower, you've gone too far.", 'Before that, you want to turn off to your left and take the path to the coast.'], p: 'Đi vòng qua hồ lên phía bắc, rẽ trái trước tháp nước, ra bờ biển → E' },
        19: { v: 'Khi chỉ đường tới Settlers\' Monument.', t: ['So, from the park entrance, take the first path on the left and follow it around behind Okiwi Bay.', 'The monument is out at the end there, on the headland.'], p: 'Rẽ trái đầu tiên, đi vòng sau vịnh Okiwi, tượng đài ở cuối mũi đất → C' },
        20: { v: 'Cuối bài, về quầy đồ uống.', t: "It's easy to find, beside the lake, right on the water's edge.", p: 'Ngay sát mép nước của hồ → I' },
      },
    },
    {
      part: 3, title: "Music Students' Attitudes to Performing", audio: 'listening/test 5/03 Track.mp3', cover: 'music students orchestra | piano practice',
      transcript: `
Lorna:
So Gareth, we need to organise the findings from our survey on music students for the final presentation.
Gareth:
Yes, Lorna, I think we've got some very interesting results.
Obviously, we need to start by saying that we interviewed all the third-year students doing a music degree and state the objective of our research project, that is, to find out about their attitudes to performing.
Lorna:
And then we should talk about the students' musical backgrounds before coming to university.
The most important points to make are that although most people have actually composed music during the course, that wasn't the case when they arrived.
Gareth:
And the other thing they had in common was the piano.
Lorna:
Well, they'd had access to a piano at some point, but not all had studied it formally.
Gareth:
I thought the most interesting finding was that before coming here, almost everyone was involved in a chamber orchestra or band or singing in a choir and playing in front of live audiences.
Lorna:
But varying enormously in size.
Some had only played in tiny venues.
I think it's worth saying that.
Gareth:
OK.
And as you might expect from people wanting to study music, they all had a degree of proficiency in at least two instruments.
But in most cases, one of the instruments was dominant.
Lorna:
Right.
We need to talk about attitudes to music practice.
The most striking thing here is that even students who you'd expect to practise for hours every day until they get it perfect say it's being terrified of failing that really makes them practise.
Gareth:
I know I'm the same.
Lorna:
Me too.
It's interesting what was said about practising alone.
Some people preferred that because they could focus more on their weak points.
But that wasn't a majority view.
Gareth:
What most of them agree on is that there's nothing more rewarding than mastering something that's really hard to learn.
Lorna:
That's right.
OK, after that, we should talk a bit about the pieces that students select for assessed performances.
Gareth:
There wasn't quite so much consensus on this, was there?
A few people prefer to do pieces which are relatively unknown, while others choose the ones they think will show off their technical ability.
Lorna:
But they were in the minority.
Gareth:
I think the first thing to say is that a high percentage said they would always try to learn their pieces by heart, because it's too easy to get lost if you're trying to read and play when you're nervous.
Lorna:
OK.
And quite a lot of them said it helps to listen to other people playing your chosen piece, preferably recordings, but even just other students.
Gareth:
We should point out that this includes informal and formal public performances, as well as assessed ones.
Lorna:
Yes, that's important.
I expected to find that performing solo would make students very nervous, but in fact that isn't the case.
They do find it hugely challenging to start with, but they appreciate the challenge and find it stimulating.
Gareth:
Right.
I was surprised by what students said about deciding which pieces to perform.
I thought they'd all say this was easy.
For me, it's always been quite straightforward.
Which pieces do I like best, and which pieces can I play well?
And my repertoire is quite limited anyway.
But the most commonly cited answer was that it took them ages to make their minds up.
Lorna:
I suppose it's because there are so many factors involved.
You need to consider your audience, the venue, the time available to learn the piece, especially if it's complicated.
You need to think about all these things, and you can't do that in a hurry.
Gareth:
That's true.
Then there's performing with musicians from a different genre, like a classical musician playing with a jazz group.
That can really be fun.
But most of the music students had never even considered it.
Lorna:
Right.
For performing with musicians who play the same instrument, almost everyone put the same thing.
Gareth:
Yes, they all said it was incredibly helpful, and not at all intimidating, which says a lot for the department's ethos.
Lorna:
Yes, that's a good point.
OK, what I think we should sort out now...`,
      groups: [
        multi('Choose TWO letters, A-E.', 21, 'Which TWO points did students most frequently make about their musical background before starting a music degree?', ['They had already composed music.', 'They had several music qualifications.', 'They could play more than one instrument.', 'They had performed in public.', 'They had had piano lessons.'], ['C', 'D'], 'Questions 21-22'),
        multi('Choose TWO letters, A-E.', 23, 'Which TWO points did students most frequently make about music practice?', ['They prefer to practise alone.', 'They try to practise every day.', 'They are motivated to practise by fear.', "They feel they don't do enough practice.", 'They enjoy the challenge of a difficult piece.'], ['C', 'E'], 'Questions 23-24'),
        multi('Choose TWO letters, A-E.', 25, 'Which TWO points were most frequently made by students about the pieces they select for assessed performances?', ['They like to hear others performing the same pieces.', 'They like to choose little-known pieces.', 'They like to play pieces from memory.', 'They like their tutor to choose their pieces.', 'They like to choose technically demanding pieces.'], ['A', 'C'], 'Questions 25-26'),
        matching('Which comment did most students make about each of the following aspects of performance?\nChoose FOUR answers from the box and write the correct letter, A-G, next to Questions 27-30.',
          ['This is very beneficial.', 'This is difficult but enjoyable.', 'This can affect relationships.', 'This makes them very nervous.', 'This is time-consuming.', 'This is easy.', 'This happens infrequently.'], [
            [27, 'Performing solo', 'B'],
            [28, 'Deciding which pieces to perform', 'E'],
            [29, 'Performing with musicians from a different genre', 'G'],
            [30, 'Performing with musicians who play the same instrument', 'A'],
          ], { title: 'Student comments', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi nói về nền tảng âm nhạc trước khi vào đại học.', t: ["although most people have actually composed music during the course, that wasn't the case when they arrived.", "Well, they'd had access to a piano at some point, but not all had studied it formally.", 'they all had a degree of proficiency in at least two instruments.'], p: 'Sáng tác là chuyện trong khoá học (A sai); không phải ai cũng học piano bài bản (E sai); tất cả đều chơi được ít nhất hai nhạc cụ → C (key gốc ghi E là sai)' },
        22: { v: 'Như câu 21 (chọn 2 đáp án).', t: 'I thought the most interesting finding was that before coming here, almost everyone was involved in a chamber orchestra or band or singing in a choir and playing in front of live audiences.', p: 'Hầu như ai cũng từng biểu diễn trước khán giả → D' },
        23: { v: 'Khi nói về thái độ luyện tập.', t: "The most striking thing here is that even students who you'd expect to practise for hours every day until they get it perfect say it's being terrified of failing that really makes them practise.", p: 'Nỗi sợ thất bại khiến họ luyện tập; tập hằng ngày chỉ là điều người ta tưởng (bẫy B) → C' },
        24: { v: 'Như câu 23 (chọn 2 đáp án).', t: ['But that wasn\'t a majority view.', "What most of them agree on is that there's nothing more rewarding than mastering something that's really hard to learn."], p: 'Tập một mình không phải ý của đa số (A sai); đa số thấy chinh phục bản khó là bổ ích nhất → E' },
        25: { v: 'Khi nói về chọn bản nhạc cho bài biểu diễn được chấm điểm.', t: 'And quite a lot of them said it helps to listen to other people playing your chosen piece, preferably recordings, but even just other students.', p: 'Bản ít người biết hoặc khoe kỹ thuật chỉ là thiểu số (B, E sai); nhiều người thích nghe người khác chơi cùng bản → A' },
        26: { v: 'Như câu 25 (chọn 2 đáp án).', t: "I think the first thing to say is that a high percentage said they would always try to learn their pieces by heart, because it's too easy to get lost if you're trying to read and play when you're nervous.", p: '“Learn their pieces by heart” = chơi thuộc lòng → C' },
        27: { v: 'Khi nói về biểu diễn độc tấu.', t: ['I expected to find that performing solo would make students very nervous, but in fact that isn\'t the case.', 'They do find it hugely challenging to start with, but they appreciate the challenge and find it stimulating.'], p: 'Không hề lo lắng (bẫy D); khó lúc đầu nhưng thấy hứng thú → B' },
        28: { v: 'Khi nói về chọn bản nhạc.', t: ["I thought they'd all say this was easy.", 'But the most commonly cited answer was that it took them ages to make their minds up.'], p: '“Dễ” là ý của Gareth (bẫy F); đa số mất rất nhiều thời gian quyết định → E' },
        29: { v: 'Khi nói về chơi cùng nhạc công khác thể loại.', t: ['That can really be fun.', 'But most of the music students had never even considered it.'], p: 'Đa số chưa từng nghĩ tới → việc này hiếm khi xảy ra → G' },
        30: { v: 'Cuối bài, về chơi cùng người chơi cùng nhạc cụ.', t: 'Yes, they all said it was incredibly helpful, and not at all intimidating', p: '“Incredibly helpful” = rất có ích → A' },
      },
    },
    {
      part: 4, title: 'Gastropods (Snails and Slugs)', audio: 'listening/test 5/04 Track.mp3', clip: [0, 388.5], cover: 'garden snail shell | slug on leaf',
      transcript: `
Good morning, everyone.
In this module, we've been looking at various field survey methods, and now I'm going to give you a brief introduction to the specific organism that we'll be focusing on during our first field trip, and that's the gastropod.
Gastropods are invertebrates; they're organisms without a backbone.
And they're more commonly known as snails or, if they haven't got a shell, slugs.
Now, in terms of their evolution, gastropods go back a long way.
As with other primitive animals, the minerals in their body fluids are very similar to the mineral composition of the sea, indicating that they began life there.
And their fossilised remains have been found in rocks dating back at least 500 million years.
Looking at the physical features of the gastropods, well, they all have one muscular foot for swimming or walking.
This foot is lubricated with mucus, and it's this that leaves the sticky trail that you see behind snails and slugs.
They also have an organ called a radula, which they use for feeding.
Then, of course, the snails, though not the slugs, have a shell.
In terms of their dimensions, snail shells in Britain range from the dwarf snail, which is 1.5 millimetres long, to the Roman snail, whose shell can be as big as 50 millimetres.
As well as size variations, you get a lot of differences in the form of snail shells.
For example, the majority coil to the right, but there are a few that coil to the left.
Then some shells, for instance the plaited snail, have regularly spaced ribs, while the prickly snail has prominent spines.
There are even a number of species with hair on their shells.
Colours on the shells also vary, as do patterns, so appearances are really varied.
OK, let's turn now to feeding habits.
Most of you who are gardeners will know to your cost that some gastropods eat healthy plants.
But you may not realise that these are the minority.
Most species feed on rotting plants, or they eat fungi and algae.
Some species eat dead animals, and there are some that are actually carnivorous.
They prey on live animals.
For example, the shield slug feeds on worms.
And apart from their own feeding habits, I should point out that gastropods themselves have plenty of predators.
Birds and frogs are the main ones.
But there's even an entire family of flies that have specialised in preying on gastropods.
And of course, last but not least, I should mention human predators.
It was the Romans who probably first introduced edible snails into Britain during the first century, and they are still eaten today.
In fact, the collection of wild snails for cooking has caused local extinctions of one species, which is also under threat internationally.
So, there are lots of predators, but to protect themselves, gastropods have often developed special defences.
I'll just give you one example.
The glutinous snail avoids predators by folding its mantle over its shell and turning itself into a very slippery blob of jelly.
Well, turning now to gastropod habitats, most species like dampness and shade.
In general, both very hot and very cold weather is bad for gastropods, but dry conditions are the least favourable.
Snails cope with this by withdrawing into their shells, and often they form a thick film of mucus over the mouth of their shell to minimise loss of water.
Habitats with a long, stable history tend to support the biggest range of gastropod species.
So, for instance, long-established forests usually support more species than newer plantations of trees, and old, natural meadowland is much better than land which has recently been farmed.
And there is a small number of highly specialised species that live in unusual habitats.
For instance, the blind snail spends its whole life buried under the ground.
It's been reported living at depths of two metres, and particularly likes the cavities in old, buried bones, apparently.
But species like these are exceptional.
But wherever they live, gastropods are often sensitive to pollution, and they don't thrive in areas contaminated by agrochemicals.
This means that they are a reliable indication of how healthy our environment is.
Now, at this point, I'd like to consider habitat management in relation to...`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Gastropods (snails and slugs)', [
          '<strong>Evolution</strong>',
          '• minerals in the bodies of gastropods are like those in the __Q31__',
          '• fossils date back 500 million years',
          '<strong>Physical features</strong>',
          '• single, muscular foot',
          '• radula (used for feeding)',
          '• shell (snails only)',
          '• size: British shells range from 1.5–50 mm',
          '• form: most shells coil to the __Q32__',
          '• some shells have ribs, spines or __Q33__',
          '• they have various colours and patterns',
          '<strong>Feeding habits</strong>',
          '• mainly feed on rotting plants, fungi or algae',
          '• some eat live animals, e.g. shield slugs eat __Q34__',
          '<strong>Predators</strong>',
          '• birds, frogs, flies',
          '• humans – snails were probably introduced to Britain as food in the __Q35__',
          '• many gastropods have particular types of __Q36__, e.g. the glutinous snail makes itself slippery',
          '<strong>Habitats</strong>',
          '• gastropods prefer dampness and shade',
          '• __Q37__ conditions are worst',
          '• biggest variety is found in old, natural habitats, e.g. __Q38__ and meadowland',
          '• highly specialised species live in unusual habitats, e.g. blind snail lives entirely below the __Q39__',
          '• good indicators of the quality of the __Q40__',
        ], { 31: 'sea', 32: 'right', 33: 'hair', 34: 'worms', 35: '1st century/first century', 36: 'defences/defenses/defence/defense', 37: 'dry', 38: 'forests/forest', 39: 'ground', 40: 'environment' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần tiến hoá.', t: 'As with other primitive animals, the minerals in their body fluids are very similar to the mineral composition of the sea, indicating that they began life there.', p: 'Khoáng chất trong cơ thể giống thành phần khoáng của biển → sea' },
        32: { v: 'Khi nói về hình dạng vỏ.', t: 'For example, the majority coil to the right, but there are a few that coil to the left.', p: '“The majority” = most shells xoắn sang phải; xoắn trái chỉ là số ít (bẫy) → right' },
        33: { v: 'Ngay sau đó.', t: ['Then some shells, for instance the plaited snail, have regularly spaced ribs, while the prickly snail has prominent spines.', 'There are even a number of species with hair on their shells.'], p: 'Gờ (ribs), gai (spines) rồi đến lông (hair) trên vỏ → hair' },
        34: { v: 'Phần thói quen ăn.', t: ['They prey on live animals.', 'For example, the shield slug feeds on worms.'], p: 'Sên khiên ăn giun → worms' },
        35: { v: 'Khi nói về con người là kẻ săn mồi.', t: 'It was the Romans who probably first introduced edible snails into Britain during the first century, and they are still eaten today.', p: 'Người La Mã đưa ốc sên ăn được vào Anh vào thế kỷ thứ nhất → 1st century' },
        36: { v: 'Khi nói cách tự vệ.', t: ['So, there are lots of predators, but to protect themselves, gastropods have often developed special defences.', 'The glutinous snail avoids predators by folding its mantle over its shell and turning itself into a very slippery blob of jelly.'], p: '“Special defences” = những kiểu tự vệ đặc biệt; ốc glutinous biến mình thành khối thạch trơn → defences' },
        37: { v: 'Phần môi trường sống.', t: 'In general, both very hot and very cold weather is bad for gastropods, but dry conditions are the least favourable.', p: 'Nóng, lạnh đều xấu nhưng khô hạn là tệ nhất (“least favourable”) → dry' },
        38: { v: 'Khi nói về môi trường lâu đời.', t: 'So, for instance, long-established forests usually support more species than newer plantations of trees, and old, natural meadowland is much better than land which has recently been farmed.', p: 'Rừng lâu năm và đồng cỏ tự nhiên có nhiều loài nhất → forests' },
        39: { v: 'Khi nói về loài sống ở nơi đặc biệt.', t: 'For instance, the blind snail spends its whole life buried under the ground.', p: 'Ốc mù sống cả đời dưới lòng đất → ground' },
        40: { v: 'Cuối bài.', t: 'This means that they are a reliable indication of how healthy our environment is.', p: '“A reliable indication of how healthy our environment is” = chỉ báo tốt về chất lượng môi trường → environment' },
      },
    },
  ],
};
