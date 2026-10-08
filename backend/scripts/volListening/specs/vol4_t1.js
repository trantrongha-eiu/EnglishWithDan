// Vol 4 – Test 1 (PDF "listening/test 1/test 1.pdf" p1–6, ảnh scan; key xlsx sheet Test 1; audio test 1/01–04 Track N.wma —
// Track 1 starts with the test introduction → clipped from "Now turn to Section 1"; Track 4 ends with the 10-minute
// answer-transfer silence → clipped after "half a minute to check").
// Transcript: Whisper + Otter (01-Track-1.pdf …), written out with turns by hand; gaps re-heard with wb.js.
// P1: the example (played first) is dropped, the full conversation kept.
const { note, mc, matching, short } = require('../vol_build');

module.exports = {
  vol: 4, test: 1,
  sections: [
    {
      part: 1, title: 'Birthday Party Arrangements', audio: 'listening/test 1/01 Track 1.wma', clip: [39, 489], cover: 'birthday party hotel | family celebration dinner',
      transcript: `
Margaret:
Hello, Rob.
Margaret here.
I'm just calling about the arrangements for Dad's 80th birthday party.
Rob:
Right.
Margaret:
I've rung round the rest of the family.
Most people do intend to come, even though it's a long journey.
Have you made any progress with the venue?
Rob:
Yes.
There are three possible hotels we could use for the party.
The Royal, the Star, and the Winchester.
Margaret:
Oh, good.
If we can make a decision now, you can probably book straight away on the Internet, can't you?
Rob:
Well, only the Star.
I'd have to make a telephone booking at the others, but that'd be OK, too.
Margaret:
OK.
So which one do you think?
Rob:
I'm not sure.
They're all fairly suitable and they're in really nice locations.
The Star looks right out over the bay.
It's on a clifftop.
Then the Winchester is in lovely countryside, too.
Margaret:
Yes.
It's in the valley, isn't it?
What about Mum's wheelchair?
How easy would it be for her to get in and out of these places?
Rob:
Well, I know that the Winchester would be fine, and the Star, because I've been there with her before.
I wasn't sure about the Royal, because I seemed to remember it had a lot of steps, so I checked, and apparently it's had ramps installed recently, so there wouldn't be any problem there either.
Margaret:
And what about the kids?
Which one do you think would be most suitable for them?
Have they got play areas or anything?
Rob:
The Royal hasn't got anything, but the Winchester has one.
It's on the ground floor, they said, not far from the dining room.
The Star's got one too, but it isn't under cover, and we don't know what the weather will be like, do we?
Margaret:
Hmm, true.
Rob:
Then there's the birthday meal itself.
The Royal's the only one where there'd be a choice.
The other two have a set menu at lunchtime.
Mind you, they all do very good food, apparently, so the quality should be fine.
Margaret:
I don't think it really matters whether there's a variety or not, but I think we need to have our own room, don't you?
Rob:
The only one that can provide that is the Royal.
The Winchester and the Star only have one dining room, so we'd just be sitting with the other guests, but in a separate area of the room.
Margaret:
Hmm, that's not quite the same, is it?
Rob:
No.
But the other thing to consider is the price.
Normally, there's not much difference between them.
Perhaps the Star's slightly cheaper than the other two, but the Winchester is offering quite a good reduction because there are so many of us.
The Star and the Royal would just charge their standard rates.
Margaret:
Hmm.
So, taking everything into consideration, which one do you think we should go for?
Rob:
The Winchester, unless you...
Margaret:
OK, that's fine by me.
You've obviously gone into everything very carefully.
You've done nearly all the work so far.
So what can I do now to help?
Rob:
Well, could you manage the finances?
Margaret:
Of course.
Do they want the whole amount in advance?
Rob:
Just a deposit.
I'll find out how much and let you know.
Then if you could send that straight away to secure the booking...
Margaret:
Fine.
And I'll go and buy some invitations.
Rob:
Oh, don't do that.
I can produce them.
I've got a programme on my computer.
It's easy.
Margaret:
OK, thanks.
Rob:
Then, once we've had the replies, I'll call everyone who's coming to find out if they want transport.
Margaret:
Great.
I can help out with that.
Pick people up from the station or whatever.
Rob:
OK.
Oh, yes.
And could you stress that Dad doesn't want presents?
He keeps reminding me.
He says there's nothing he really needs.
Margaret:
OK.
I'll try to discourage them.
But you know what people are like.
Anything else?
Shall I do...`,
      groups: [
        matching('Which hotel offers the following facilities?\nWrite the correct letter, A, B, C or D, next to Questions 1-6.',
          ['Royal Hotel', 'Star Hotel', 'Winchester Hotel', 'all three hotels'], [
            [1, 'sea view', 'B'],
            [2, 'disabled access', 'D'],
            [3, 'indoor play area', 'C'],
            [4, 'choice of food', 'A'],
            [5, 'private dining room', 'A'],
            [6, 'group discount', 'C'],
          ], { title: 'Hotels', reuse: true, groupTitle: 'Questions 1-6' }),
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Birthday party arrangements', [
          '<strong>Things to do immediately</strong>',
          'Send a __Q7__ to the Winchester Hotel',
          'Make the __Q8__',
          '<strong>Things to do later</strong>',
          'Find out who needs help with __Q9__',
          'Tell people not to bring any __Q10__',
        ], { 7: 'deposit', 8: 'invitations', 9: 'transport', 10: 'presents' }, 'Questions 7-10'),
      ],
      expl: {
        1: { v: 'Khi Rob nói về vị trí các khách sạn.', t: ['The Star looks right out over the bay.', "It's on a clifftop."], p: 'Khách sạn Star nhìn thẳng ra vịnh, nằm trên vách đá → có view biển; Winchester ở thung lũng (bẫy) → B' },
        2: { v: 'Khi Margaret hỏi về xe lăn của mẹ.', t: ["Well, I know that the Winchester would be fine, and the Star, because I've been there with her before.", "apparently it's had ramps installed recently, so there wouldn't be any problem there either."], p: 'Winchester và Star đều ổn; Royal tưởng nhiều bậc thang nhưng vừa lắp dốc cho xe lăn → cả ba khách sạn → D' },
        3: { v: 'Khi hỏi về khu vui chơi cho trẻ em.', t: ["The Royal hasn't got anything, but the Winchester has one.", "The Star's got one too, but it isn't under cover"], p: 'Royal không có; khu của Star ở ngoài trời (không có mái che); chỉ Winchester có khu vui chơi trong nhà (tầng trệt) → C' },
        4: { v: 'Khi nói về bữa ăn sinh nhật.', t: ["The Royal's the only one where there'd be a choice.", 'The other two have a set menu at lunchtime.'], p: 'Chỉ Royal cho chọn món, hai khách sạn kia có thực đơn cố định → A' },
        5: { v: 'Khi Margaret muốn có phòng riêng.', t: 'The only one that can provide that is the Royal.', p: 'Winchester và Star chỉ có một phòng ăn chung; chỉ Royal có phòng riêng → A' },
        6: { v: 'Khi nói về giá.', t: ['Perhaps the Star\'s slightly cheaper than the other two, but the Winchester is offering quite a good reduction because there are so many of us.', 'The Star and the Royal would just charge their standard rates.'], p: 'Star chỉ rẻ hơn một chút (bẫy); Winchester giảm giá vì đoàn đông người → C' },
        7: { v: 'Khi Margaret hỏi có phải trả hết tiền trước không.', t: ['Just a deposit.', 'Then if you could send that straight away to secure the booking...'], p: 'Chỉ cần đặt cọc, và gửi ngay để giữ chỗ → việc làm ngay: gửi tiền cọc → deposit' },
        8: { v: 'Khi Margaret định đi mua thiệp mời.', t: ["And I'll go and buy some invitations.", "Oh, don't do that.", 'I can produce them.'], p: 'Không mua mà Rob tự làm thiệp mời bằng chương trình trên máy tính → invitations' },
        9: { v: 'Khi nói việc sau khi nhận được hồi âm.', t: "Then, once we've had the replies, I'll call everyone who's coming to find out if they want transport.", p: 'Sau khi có hồi âm (việc làm sau) sẽ gọi hỏi ai cần đưa đón → transport' },
        10: { v: 'Cuối bài, lời dặn về quà.', t: "And could you stress that Dad doesn't want presents?", p: 'Bố không muốn nhận quà → dặn mọi người đừng mang quà → presents' },
      },
    },
    {
      part: 2, title: 'The Game of Curling', audio: 'listening/test 1/02 Track 2.wma', cover: 'curling stones ice | curling sport',
      transcript: `
It gives me great pleasure to welcome you to the Montreal Curling Club.
I hope you'll enjoy the introductory programme we've prepared for you.
I'll start with a brief introduction to the game itself and the equipment, so that you'll be able to enjoy it when you watch it later on.
I'll then go on to say a little about the history of the sport and the club.
So, first, let's take a look at the game of curling and the implements it uses.
It's played on ice, and the object of the game is for two teams to push heavy stones across the ice towards a target.
Now, there are four people in each of the two teams.
The first is called the lead, the next is called the second, the next, surprise, surprise, is called the third, and the final player, who is absolutely key, functions as the captain, but is always called the skip.
The area of play on the ice, whether it be on a rink or on a frozen lake or stream, is called the sheet.
This long, thin area is 42.15 metres by only 4.25 metres.
And unlike ice hockey ice, for example, it is constantly groomed by frequent shaving to keep it perfectly level.
At either end of this are the two zones for the targets.
Each one is known as a house.
A little bit about the equipment we need.
The stones are made from granite.
Originally, these were held by your fingers in holes specially carved out in the top, but then it was decided to add a handle to get a better grip.
The other distinctive implement is the brush, or broom.
This is used for two purposes.
To clean the ice, of course, but more crucially, to warm it.
This melts the ice slightly and lessens the friction, so you get a smoother slide.
Curling is not an expensive sport.
You don't buy your own stones.
In fact, it is illegal to play in a match with your own stones.
But you can use your own brush.
There are two main types, Scottish and Canadian.
The former are normally made out of horsehair, and the latter, which are now more frequently used, are made of synthetic materials, and they don't leave as many threads on the ice.
Now, apart from stones and brushes, the only other piece of equipment you would need as a beginner is a rubber sole on one of your shoes, depending on which shoe you lead from.
The captain will often carry a stopwatch to gauge when the ice needs to be changed.
All equipment and clothing can be bought in the club shop.
A quick word about Montreal Curling Club.
It's renowned not only because it often wins championships, but because it was the first club for any sport in the whole of the North American continent.
And although curling is not as well known as many other winter sports, we still boast a certain amount of influence in the National Sports Council.
And what are the origins of the game?
It's now well established that it started in Scotland at least as early as the 16th century.
Queen Victoria, on her frequent trips to Scotland, often played it, but wrote in her diary that it required exceptional strength to throw the stones.
Her patronage attracted a great deal of interest in the game, especially amongst younger players, and this was enhanced further when she granted a royal title to the Caledonian Curling Club, which had been set up in the early 19th century to create standard rules for the game.
Curling has always had support in high places.
In the 16th century, the Scottish Parliament actually banned golf and football as violent and unprofitable sports.
They felt that local men should spend any free time practising archery for self-defence against their enemies.
But the less popular game of curling wasn't included in the ban.
The art of throwing stones was thought to be just as useful as shooting arrows.
But back to Canada.
Here, the game has flourished since the beginning of the 19th century, when Scottish soldiers posted here enjoyed playing it on the frozen lakes and rivers.
Because of the difficulty in importing granite stones from Scotland, cast iron was used instead, obtained from melted-down cannonballs, which had originally been brought over from Europe.
Now, Canada is regarded as the most successful curling nation in the world.
Now the game you're going to see...`,
      groups: [
        short('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS for each answer.', [
          [11, 'The four players on the team are called the ______, the Second, the Third and the Skip.', 'lead'],
          [12, 'The length of ice on which curling is played is called the ______.', 'sheet'],
          [13, 'The target area is called the ______.', 'house'],
          [14, 'Scottish brushes are usually made from ______.', 'horse hair/horsehair'],
          [15, 'One shoe needs to have a sole made of ______.', 'rubber'],
          [16, 'The captain of the team often carries a ______.', 'stop watch/stopwatch'],
        ], 'Questions 11-16'),
        mc('Choose the correct letter, A, B or C.', [
          [17, 'Montreal Curling Club is famous as', ['the champion club of the local league.', 'the oldest sports club in the region.', 'the most influential club in winter sports.'], 'B'],
          [18, 'The Caledonian Curling Club was formed in order to', ['attract interest in the sport.', 'train young players.', 'fix regulations for the game.'], 'C'],
          [19, 'In the 16th century, curling avoided being banned because', ['it was already so popular.', 'it was good training for battle.', 'it was only played by children.'], 'B'],
          [20, 'Early curling games in Canada used implements made of', ['local material.', 'imported stone.', 'cast iron.'], 'C'],
        ], 'Questions 17-20'),
      ],
      expl: {
        11: { v: 'Khi giới thiệu 4 người trong một đội.', t: 'The first is called the lead, the next is called the second, the next, surprise, surprise, is called the third, and the final player, who is absolutely key, functions as the captain, but is always called the skip.', p: 'Người thứ nhất gọi là lead, sau đó second, third và skip → lead' },
        12: { v: 'Khi nói về khu vực thi đấu trên băng.', t: 'The area of play on the ice, whether it be on a rink or on a frozen lake or stream, is called the sheet.', p: '“The area of play on the ice” = dải băng thi đấu, được gọi là sheet → sheet' },
        13: { v: 'Ngay sau đó, về vùng mục tiêu.', t: ['At either end of this are the two zones for the targets.', 'Each one is known as a house.'], p: 'Mỗi vùng mục tiêu ở hai đầu được gọi là house → house' },
        14: { v: 'Khi nói về hai loại chổi.', t: 'The former are normally made out of horsehair, and the latter, which are now more frequently used, are made of synthetic materials', p: '“The former” = chổi Scotland, làm từ lông ngựa; vật liệu tổng hợp là của chổi Canada (bẫy) → horsehair' },
        15: { v: 'Khi nói về trang bị cho người mới chơi.', t: 'the only other piece of equipment you would need as a beginner is a rubber sole on one of your shoes', p: 'Một chiếc giày cần đế cao su → rubber' },
        16: { v: 'Ngay sau đó, về đội trưởng.', t: 'The captain will often carry a stopwatch to gauge when the ice needs to be changed.', p: 'Đội trưởng thường mang đồng hồ bấm giờ → stopwatch' },
        17: { v: 'Khi giới thiệu câu lạc bộ Montreal.', t: "It's renowned not only because it often wins championships, but because it was the first club for any sport in the whole of the North American continent.", p: '“Not only… but” nhấn mạnh lý do chính: câu lạc bộ thể thao đầu tiên ở Bắc Mỹ = lâu đời nhất trong khu vực; chỉ có “a certain amount of influence” (bẫy C) → B' },
        18: { v: 'Khi nói về Caledonian Curling Club.', t: 'the Caledonian Curling Club, which had been set up in the early 19th century to create standard rules for the game.', p: '“Create standard rules” = fix regulations; sự quan tâm của giới trẻ là nhờ Nữ hoàng Victoria (bẫy A) → C' },
        19: { v: 'Khi nói về lệnh cấm của Quốc hội Scotland thế kỷ 16.', t: ['They felt that local men should spend any free time practising archery for self-defence against their enemies.', 'The art of throwing stones was thought to be just as useful as shooting arrows.'], p: 'Ném đá được coi là hữu ích như bắn cung để tự vệ trước kẻ thù → rèn luyện cho chiến đấu; curling “less popular” nên A sai → B' },
        20: { v: 'Khi nói về curling thời đầu ở Canada.', t: 'Because of the difficulty in importing granite stones from Scotland, cast iron was used instead', p: 'Khó nhập đá granite (bẫy B) nên dùng gang đúc từ đạn đại bác nấu chảy → C' },
      },
    },
    {
      part: 3, title: 'Using Scientific Techniques to Investigate Works of Art', audio: 'listening/test 1/03 Track 3.wma', cover: 'art painting analysis laboratory | abstract painting canvas',
      transcript: `
Josh:
Hi Emily.
Emily:
Hi Josh.
Are you ready to work on the assignment?
Josh:
Yeah.
Now we need to describe how modern scientific techniques are being used in the field of art history.
Emily:
Right.
And Dr. Abbott suggested that we choose some famous cases to illustrate the argument.
OK.
So what have you found?
Josh:
Well, there's a Canadian forensic scientist called Biro.
Emily:
Yes, I think I've heard of him.
What do you know about him?
Josh:
Well, I'm a big fan of Jackson Pollock.
Emily:
The modern American artist?
Hmm.
Didn't he paint those really huge abstract paintings?
Josh:
That's him.
Emily:
I guess it would be pretty easy to fake one of those paintings.
Josh:
No way, Emily.
I know a lot of people think that even a child could paint one.
To the untrained eye, they might look simple, but they're incredibly intricate works of art.
Emily:
Well, sorry, but I really can't agree with you.
Anyway, what did Biro find out?
Josh:
Well, Biro worked on a case where a client asked him to prove that a painting she bought for only $5 was an authentic Jackson Pollock.
Emily:
So was it a fake?
Josh:
Well, Biro found evidence to show it was a genuine Pollock, but the art world didn't accept his findings.
Emily:
Why?
Josh:
Well, one critic said that compared to other Pollocks, the white and yellow lines on the painting were too straight.
Emily:
Come on, Josh.
That doesn't seem that convincing.
Josh:
No, you're right.
It is a bit weak.
But the strongest argument was that there were no records of previous owners.
For the painting to be authentic, you really should be able to trace the painting all the way back to the artist's studio.
Emily:
Well, that's true, I suppose.
Did they consult with anyone else?
Josh:
The International Foundation for Art Research got involved.
Emily:
And what was their verdict?
Josh:
Well, they saw a definite similarity in the painting techniques used.
Emily:
You mean the way Pollock dripped the oils on the canvas?
Josh:
Yeah, and they noted the dirt and paint marks on the back, which all of Pollock's paintings have.
Emily:
Why's that?
Josh:
He used to lie his canvases down on the ground when he painted them.
But the Foundation were worried about the acrylic paint that was used on the painting.
It's quite common now, but it was very unusual back in Pollock's day.
Emily:
So it was probably painted much later?
Josh:
Right.
So whose side are we on in this argument?
Emily:
When it comes to art, you can see the art critics' point.
If their knowledge and expertise tells them that it definitely isn't a Pollock painting, shouldn't we believe them?
I mean, that is usually how it works in the art world, isn't it?
Josh:
Art historians have always judged paintings, but things are changing now.
If we have modern and scientific techniques like fingerprint analysis, why not use them?
Emily:
That's true.
Well, maybe we need a combination.
Josh:
I think you're right.
Emily:
So, did you find out anything else, Josh?
Josh:
Well, have you ever heard of a painting called The Battle of Anghiari?
Emily:
I have, actually.
It's the lost masterpiece by Leonardo da Vinci, the famous Italian artist.
What about it?
Josh:
Well, an Italian art analyst called Seracini thinks he knows where it is, and he's using scientific techniques to help locate it.
Emily:
How?
Josh:
Well, art historians knew where the painting was last seen.
Emily:
That's right, in the Hall of the 500 in Florence.
Josh:
Right.
So, Seracini had a theory that the painting was still there, and he set out to prove it.
He used a lot of different technology, like radar and thermographic cameras, but initially he scanned every inch of the hall with a laser in order to make a really accurate 3D model of the building's design.
Emily:
Did he think the painting was hidden in the building somewhere?
Josh:
Exactly.
Then, to find out what the hall looked like in Leonardo's time, he took pictures of it with a thermographic camera.
Emily:
Couldn't he have used ultrasound to do that?
Josh:
Not really.
Different types of building materials produce different amounts of radiation, and you can really see those differences in a thermal image.
Emily:
So brick would look different from wood or glass, for example.
Josh:
Yes.
Seracini worked out what the building looked like when it was first built and what renovations took place after that.
He found that two large glass windows on the east wall had been removed and filled in by the time da Vinci started work on his painting, leaving a space big enough for it.
Emily:
But why hasn't the painting been seen for 400 years?
Josh:
To answer that question, Seracini needed to study that wall even more closely.
Emily:
Did he use the thermographic camera again?
Josh:
No, this time he used another kind of technology, radar.
Emily:
And what did that show?
Josh:
It showed there were, in fact, two walls there, an older one and a newer one built in front of it.
Emily:
So does Seracini believe that da Vinci's painting is on the concealed wall?
Josh:
Yes, on a stone wall, concealed by the newer brick wall.
Emily:
So what's the next stage in the investigation?
Josh:
Well, he isn't allowed to remove any plaster or bricks, so he's now experimenting with a gamma-ray camera to try and verify his theory.
Emily:
Well, I think we've got some really strong examples there of how science can help art.
Let's see if we can type up an outline.`,
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, "What does Josh think about Jackson Pollock's paintings?", ['They are easy to copy.', 'They are complex.', 'They are childish.'], 'B'],
          [22, 'The $5 painting was considered to be a fake because', ['it lacked documentation.', 'it was too cheap.', 'it featured the wrong colours.'], 'A'],
          [23, 'What made the International Foundation for Art Research reject the $5 painting?', ['what was on the back of the painting', 'the type of paint used', 'how the paint was applied'], 'B'],
          [24, 'What do Josh and Emily agree about art evaluation?', ["Only an experienced critic can evaluate a painting's authenticity.", 'Modern scientific methods have replaced the traditional approach.', 'Experts from the science and art worlds should work together.'], 'C'],
        ], 'Questions 21-24'),
        matching("Complete the flow-chart below.\nChoose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.\n\nSeracini's search for Leonardo Da Vinci's Battle of Anghiari",
          ['ultrasound', 'gamma-ray technology', 'stone', 'a laser scanner', 'a radar machine', 'glass', 'a thermographic camera', 'brick'], [
            [25, 'Seracini used ______ to help make a model of the building.', 'D'],
            [26, 'Seracini used ______ to reveal different materials in the walls. He found the original architecture.', 'G'],
            [27, 'Seracini guessed that Da Vinci painted his masterpiece on the east wall, in a space that used to hold ______.', 'F'],
            [28, 'Seracini analysed the wall using ______ and discovered a second wall behind it.', 'E'],
            [29, 'Seracini hypothesised that the Da Vinci painting is still there on the original ______ wall.', 'C'],
            [30, 'Seracini is using ______ to prove his theory.', 'B'],
          ], { groupTitle: 'Questions 25-30' }),
      ],
      expl: {
        21: { v: 'Khi Emily cho rằng tranh Pollock dễ làm giả.', t: ['I know a lot of people think that even a child could paint one.', "To the untrained eye, they might look simple, but they're incredibly intricate works of art."], p: '“Dễ làm giả”/“trẻ con vẽ được” là ý của Emily và người khác (bẫy A, C); Josh cho rằng đó là tác phẩm cực kỳ tinh xảo = complex → B' },
        22: { v: 'Khi Josh nói vì sao giới nghệ thuật không chấp nhận bức tranh.', t: ['But the strongest argument was that there were no records of previous owners.'], p: 'Lập luận về màu trắng, vàng quá thẳng bị chê là yếu (bẫy C); lý do mạnh nhất là không có hồ sơ chủ sở hữu trước = thiếu giấy tờ → A' },
        23: { v: 'Khi nói về kết luận của International Foundation for Art Research.', t: 'But the Foundation were worried about the acrylic paint that was used on the painting.', p: 'Kỹ thuật vẽ và vết bẩn phía sau đều giống Pollock (bẫy A, C); điều khiến họ bác bỏ là loại sơn acrylic → B' },
        24: { v: 'Khi hai bạn bàn nên đứng về phía nào.', t: ['Well, maybe we need a combination.', "I think you're right."], p: 'Emily nghiêng về giới phê bình, Josh nghiêng về khoa học; cuối cùng cả hai đồng ý cần kết hợp cả hai → C' },
        25: { v: 'Khi Josh kể bước đầu tiên của Seracini.', t: "but initially he scanned every inch of the hall with a laser in order to make a really accurate 3D model of the building's design.", p: 'Ra-đa và camera nhiệt được dùng sau; ban đầu ông quét bằng laser để dựng mô hình 3D → D' },
        26: { v: 'Khi Josh nói cách tìm hiểu đại sảnh thời Leonardo.', t: ["Then, to find out what the hall looked like in Leonardo's time, he took pictures of it with a thermographic camera.", 'Different types of building materials produce different amounts of radiation, and you can really see those differences in a thermal image.'], p: 'Siêu âm là gợi ý của Emily và bị bác (bẫy A); camera nhiệt cho thấy vật liệu khác nhau trong tường → G' },
        27: { v: 'Khi nói về bức tường phía đông.', t: 'He found that two large glass windows on the east wall had been removed and filled in by the time da Vinci started work on his painting, leaving a space big enough for it.', p: 'Hai cửa sổ kính lớn bị gỡ và lấp lại, để lại khoảng trống đủ cho bức tranh → khoảng trống từng chứa kính → F' },
        28: { v: 'Khi Emily hỏi có dùng lại camera nhiệt không.', t: ['No, this time he used another kind of technology, radar.', 'It showed there were, in fact, two walls there, an older one and a newer one built in front of it.'], p: 'Lần này dùng ra-đa và phát hiện bức tường thứ hai → E' },
        29: { v: 'Khi hỏi Seracini tin bức tranh nằm ở đâu.', t: 'Yes, on a stone wall, concealed by the newer brick wall.', p: 'Tường gạch là bức tường mới xây che phía trước (bẫy H); bức tranh nằm trên bức tường đá nguyên gốc → C' },
        30: { v: 'Cuối bài, về bước tiếp theo.', t: "Well, he isn't allowed to remove any plaster or bricks, so he's now experimenting with a gamma-ray camera to try and verify his theory.", p: 'Không được đục tường nên đang thử camera tia gamma để chứng minh giả thuyết → B' },
      },
    },
    {
      part: 4, title: 'Myths about Sustainability', audio: 'listening/test 1/04 Track 4.wma', clip: [0, 363.5], cover: 'wind turbines solar panels | sustainable energy',
      transcript: `
This week's lecture on a scientific topic of current general interest is on sustainability.
The term sustainability is not new.
It was first coined in 1987 in a report for the United Nations World Commission on Environment and Development.
Since then, however, the term has been applied to everything from cars to agriculture and even economics.
My specific focus, in fact, derives from this problem.
I want to analyse what seems to me to be the confusion that surrounds sustainability.
That UN document defines sustainable development as development that allows both the present and all future generations to meet their needs.
Here is the first myth.
Sustainability is not simply about the environment, which may come as a surprise to you.
In fact, the original definition says nothing about it at all.
Well, sustainability is not about protecting the world around us.
The original focus was on finding ways to help poor nations catch up with richer nations, which primarily meant giving them similar rights to natural resources, water, food, energy, the things that many of us take for granted.
The consequence and ultimate goal was improving living standards for all.
Another myth is that sustainability is a synonym for green, as in green movement, green products, etc., although there is some overlap between the terms.
Green suggests a preference for natural living, for example.
When you go shopping, products marketed as green imply the absence of high technology and mass manufacturing processes.
Those groups who campaign for sustainability, we can call them the lobby for sustainability, acknowledge that the situation is desperate.
The main problem, they state correctly, is time.
With six billion people on the planet now, and a billion more expected in the next 30 years, only technology will be able to provide everyone with an acceptable and safe lifestyle.
Electric cars, wind turbines, and solar cells are key examples of this.
They make great use of renewable resources while emitting fewer noxious chemicals.
Nuclear power, too, is something the sustainability lobby has come to accept, unlike most Greens.
And here's the third myth.
It concerns the role of technology.
Technology is not rejected as evil, but we should not overemphasise the role of technology either.
Take electric cars, for example.
Researchers are currently working on plans to electrify the world's car fleet.
New technology is currently being developed to make better batteries, giving longer performance.
But a better way of thinking is perhaps to have battery stations for drivers to use on roads.
When the battery is getting low, they simply swap the old one for a fully charged one.
In other words, new business thinking, not new technology, for a sustainable future.
There are similarities in agriculture, where knowledge can be more productive than new technology.
Agriculture uses up about three-quarters of the world's water.
Some crops are very thirsty and require a lot of water.
So many farmers who believe in sustainability are now planting crops like sunflowers and wheat instead of corn, which are happy with much less water.
In terms of water consumption, one of the biggest problems is that our diet is changing.
As countries develop and people become richer, they aspire to a diet with more meat.
Now, admittedly, most of the new births that will take our population to over 6 billion are going to be born in countries with largely vegetarian diets.
However, most of them will be born in the city, and this is where water consumption is highest.
That introduces the topic for next week's lecture.`,
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Sustainability', [
          'Sustainability: Term first used in 1987 by writers of United Nations report',
          'Lecture aim: Analysis of the __Q31__ surrounding sustainability',
          'Sustainable development: Development that will meet the needs of both present and future __Q32__',
          '<strong>Myth 1:</strong>',
          '• No mention of the __Q33__ in original definition',
          '• Original focus: poorer nations should have the same __Q34__ to natural resources as richer nations',
          'This would help them achieve better __Q35__ conditions',
          "<strong>Myth 2:</strong> 'Green' vs Sustainable",
          "• Key difference: unlike 'green', 'sustainable' is not always associated with things that are natural",
          '• For the sustainability lobby, the key problem is finding __Q36__ to develop technology',
          '• Sustainability lobby is prepared to __Q37__ nuclear energy',
          '<strong>Myth 3:</strong> Role of technology',
          '• Introduction of battery stations on __Q38__ is an example of new business thinking, not new technology',
          "• Agriculture: some farmers plant crops like sunflowers which don't use much water, unlike __Q39__",
          '• Greater use of water is a result of changes in our __Q40__',
        ], { 31: 'confusion', 32: 'generations', 33: 'environment', 34: 'right/rights', 35: 'living', 36: 'time', 37: 'accept', 38: 'roads', 39: 'corn', 40: 'diet' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi giảng viên nêu mục tiêu bài giảng.', t: 'I want to analyse what seems to me to be the confusion that surrounds sustainability.', p: '“Analyse… the confusion that surrounds sustainability” khớp “analysis of the … surrounding sustainability” → confusion' },
        32: { v: 'Khi nêu định nghĩa của tài liệu Liên Hợp Quốc.', t: 'That UN document defines sustainable development as development that allows both the present and all future generations to meet their needs.', p: '“Both the present and all future generations” → generations' },
        33: { v: 'Lầm tưởng thứ nhất.', t: ['Sustainability is not simply about the environment, which may come as a surprise to you.', 'In fact, the original definition says nothing about it at all.'], p: 'Định nghĩa gốc không nói gì về môi trường (“it” = the environment) → environment' },
        34: { v: 'Khi nói về trọng tâm ban đầu.', t: 'The original focus was on finding ways to help poor nations catch up with richer nations, which primarily meant giving them similar rights to natural resources', p: '“Similar rights to natural resources” = the same right to natural resources → right' },
        35: { v: 'Ngay sau đó.', t: 'The consequence and ultimate goal was improving living standards for all.', p: '“Improving living standards” = achieve better living conditions → living' },
        36: { v: 'Lầm tưởng thứ hai, về nhóm vận động cho phát triển bền vững.', t: 'The main problem, they state correctly, is time.', p: 'Vấn đề chính của “the lobby for sustainability” là thời gian (chỉ công nghệ mới kịp đáp ứng dân số tăng) → time' },
        37: { v: 'Khi nói về điện hạt nhân.', t: 'Nuclear power, too, is something the sustainability lobby has come to accept, unlike most Greens.', p: 'Nhóm vận động bền vững chấp nhận điện hạt nhân, khác với phần lớn người theo phong trào xanh → accept' },
        38: { v: 'Lầm tưởng thứ ba, ví dụ xe điện.', t: ['But a better way of thinking is perhaps to have battery stations for drivers to use on roads.', 'In other words, new business thinking, not new technology, for a sustainable future.'], p: 'Trạm đổi pin trên đường là tư duy kinh doanh mới chứ không phải công nghệ mới → roads' },
        39: { v: 'Khi nói về nông nghiệp.', t: 'So many farmers who believe in sustainability are now planting crops like sunflowers and wheat instead of corn, which are happy with much less water.', p: 'Hướng dương, lúa mì cần ít nước, được trồng thay cho ngô (loại cây “khát” nước) → corn' },
        40: { v: 'Cuối bài, về tiêu thụ nước.', t: 'In terms of water consumption, one of the biggest problems is that our diet is changing.', p: 'Lượng nước dùng tăng do chế độ ăn thay đổi (ăn nhiều thịt hơn) → diet' },
      },
    },
  ],
};
