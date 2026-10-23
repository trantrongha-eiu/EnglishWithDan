// Vol 9 – Test 9 (same layout as vol9_t1.js; map = the image embedded in the question docx, redrawn without the watermark
// → img/t9/map_redraw.png). P1 plays the example first (the docx leaves it out, only the lead-in lines remain) → cut.
// Part 2 → 3 has no answer-check pause (cut before "Part three", 884.4 s). The recording stops 10 s into Part 4's
// "one minute to check your answers" (end of file). Q16-20 paper has no instruction line → "Label the map below…".
const { note, table, mc, map } = require('../vol_build');
const RE = require('./vol9_rawre');
const A = 'LISTENING/AUDIO/TEST 9.mp4';

module.exports = {
  vol: 9, test: 9, docx: 'LISTENING/KEY - TRANSCRIPT/KEY TEST 9-L.docx',
  rawRe: RE,
  sections: [
    {
      part: 1, title: 'Renfrew Activity Centre', audio: A, clip: [46.6, 474.2], cover: 'rock climbing wall rope | mountain biking trail',
      cut: [['On this occasion only', 'Listen carefully and answer questions 1 to 4.']],
      turns: [
        ['Gordon', 'Good morning.'], ['Woman', 'Hello.'], ['Gordon', "That's right."], ['Woman', 'Fine.'], ['Gordon', 'Well, you need to know'],
        ['Woman', "And what's the cost"], ['Gordon', 'Well, it depends'], ['Woman', "There'll be about 12"], ['Gordon', 'Right.'], ['Woman', "That's very reasonable."],
        ['Gordon', 'No, but it does include'], ['Woman', 'Right.'], ['Gordon', 'Oh, yes.'], ['Woman', 'Do you have to be'], ['Gordon', 'Not at all.'],
        ['Woman', 'The website said'], ['Gordon', 'Yes, you learn all'], ['Woman', "That'll be very useful."], ['Gordon', "It's 70 pounds"],
        ['Woman', 'Some of my colleagues'], ['Gordon', "That's right."], ['Woman', 'I read a bit'], ['Gordon', 'Yes, you do.'], ['Woman', 'And the cost?'],
        ['Gordon', '50 pounds.'], ['Woman', "Right, I've got that."], ['Gordon', "Yes, it's very popular"], ['Woman', 'And the cost of that?'], ['Gordon', '90 pounds.'],
        ['Woman', 'Does that include'], ['Gordon', "It doesn't"], ['Woman', 'Thanks.'], ['Gordon', 'Yes?'], ['Woman', 'Will you need a deposit'], ['Gordon', 'Yes.'],
        ['Woman', 'OK.'], ['Gordon', 'The most important'], ['Woman', "Right, that's good"], ['Gordon', 'Or you could book'], ['Woman', 'Thanks for your help.'],
      ],
      groups: [
        table('Complete the table below.\nWrite NO MORE THAN TWO WORDS for each answer.\n\nRenfrew Activity Centre', ['Activity', 'Location', 'Basic skill learned', 'Price per person', 'Price includes'], [
          ['<em>Example</em> Rock climbing', 'Centre grounds', 'using the __Q1__', '£60 (for a group of twelve)', '__Q2__'],
          ['Mountain biking', 'in the mountains', 'doing __Q3__ checks', '£70', 'services of a __Q4__'],
          ['Wild camping', 'in the __Q5__', 'finding out about plants', '£50', 'accommodation in tents'],
          ['Hill walking', 'in the National Park', '__Q6__ skills', '£90', '__Q7__'],
        ], { 1: 'ropes/rope', 2: 'equipment', 3: 'safety', 4: 'guide', 5: 'forest', 6: 'navigation', 7: 'lunch' }, 'Questions 1-7'),
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', '', [
          'Deposit for group booking: __Q8__ of full amount',
          'Must bring suitable __Q9__',
          'Name of contact: Gordon __Q10__',
        ], { 8: '20%/20 percent/20 per cent', 9: 'shoes', 10: 'Arkwright' }, 'Questions 8-10'),
      ],
      expl: {
        1: { v: 'Khi người gọi hỏi về kỹ thuật leo núi.', t: ["From your website, I see that the main technique I would learn would be rope work.", "Well, you need to know how to use ropes if you're going to climb"], p: 'Kỹ năng cơ bản là cách dùng dây thừng → ropes' },
        2: { v: 'Khi hỏi giá đã gồm những gì.', t: ['Does that include our accommodation and food?', 'No, but it does include the equipment.'], p: 'Không gồm chỗ ở và ăn uống (bẫy); có gồm dụng cụ → equipment' },
        3: { v: 'Khi nói về đạp xe leo núi.', t: ['The website said that we learn to do safety checks on our bikes.', 'Yes, you learn all about that.'], p: 'Học cách kiểm tra an toàn cho xe → safety' },
        4: { v: 'Khi hỏi giá tour đạp xe.', t: "It's 70 pounds and includes all the help you need from our guide.", p: 'Giá 70 bảng gồm sự hỗ trợ của hướng dẫn viên → guide' },
        5: { v: 'Khi nói về cắm trại hoang dã.', t: ["It's in the forest, the website said.", "That's right."], p: 'Cắm trại trong rừng → forest' },
        6: { v: 'Khi nói về đi bộ đường đồi.', t: ["And so you won't get lost when you go walking on your own.", 'We teach you some navigation skills.'], p: 'Dạy kỹ năng định hướng để không bị lạc → navigation' },
        7: { v: 'Khi hỏi giá đi bộ đường đồi gồm gì.', t: ['Does that include accommodation?', "It doesn't, but there are some very inexpensive B&Bs nearby.", 'Or you can stay at the local youth hostel, but lunch is included.'], p: 'Không gồm chỗ ở (bẫy) nhưng có bữa trưa → lunch' },
        8: { v: 'Khi hỏi về tiền đặt cọc.', t: ['When you book, we usually ask for a deposit of 25 pounds per person.', "But if you're booking for a group, then it'll be 20% of the total cost."], p: 'Đặt lẻ 25 bảng/người (bẫy); đặt theo nhóm cọc 20% tổng chi phí → 20%' },
        9: { v: 'Khi hỏi cần mang theo gì.', t: ['The most important thing is to have the right shoes, so you\'ll need to bring those.', 'Other things like maps and wet weather gear can be borrowed from here.'], p: 'Bản đồ, đồ đi mưa có thể mượn (bẫy); phải tự mang giày phù hợp → shoes' },
        10: { v: 'Khi Gordon giới thiệu tên.', t: ["My name's Gordon.", 'Gordon Arkwright.', "That's A-R-K-W-R-I-G-H-T."], p: 'Gordon đánh vần họ → Arkwright' },
      },
    },
    {
      part: 2, title: 'Beach Clean-up Day', audio: A, clip: [474.2, 884.4], cover: 'beach clean up volunteers litter | beach litter bags',
      turns: [],
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nBeach Clean-up Day', [
          [11, 'Quinlan Beach was chosen for the clean-up day because', ['litter there is a danger to wildlife.', 'visitors have complained about litter there.', 'the local council requested help with litter collection there.'], 'A'],
          [12, 'What does Brenda say about the groups for the clean-up day?', ['Groups will stay the same all day.', 'Everyone should choose their group in advance.', 'Group members can decide on their roles.'], 'C'],
          [13, 'What equipment does Brenda say that people may want to bring?', ['bags', 'a whistle', 'a litter-picking tool'], 'C'],
          [14, 'What does Brenda say about clothing for the day?', ['Hats are optional.', 'Footwear should be waterproof.', 'Gloves are provided in a range of sizes.'], 'B'],
          [15, 'Why does Brenda want each group to fill in a survey?', ['to collect information about the types of litter they pick up', 'to indicate the location of the litter they pick up', 'to measure how much litter they pick up'], 'B'],
        ], 'Questions 11-15'),
        map('Label the map below.\nChoose the correct letter, A-I, next to Questions 16-20.', [
          [16, 'First aid station', 'F'], [17, 'Equipment pick-up', 'B'], [18, 'Toilets', 'G'], [19, 'Meeting point', 'I'], [20, 'Location for lunch', 'D'],
        ], { img: 'img/t9/map_redraw.png' }, 'Questions 16-20'),
      ],
      expl: {
        11: { v: 'Khi Brenda giải thích vì sao chọn bãi Quinlan.', t: ['The town council does its best to provide bins, but litter is still a problem.', "It's important to deal with this, as it's a threat to the groups of seals that swim around there and regularly rest on the flat rocks."], p: 'Hội đồng chỉ đặt thùng rác (không nhờ giúp, loại C); rác đe doạ đàn hải cẩu = nguy hiểm cho động vật hoang dã → A' },
        12: { v: 'Khi nói về các nhóm.', t: ['There are different roles in the group.', "It'll be up to you to choose who does what in the group.", "After lunch, we'll form new groups"], p: 'Sau bữa trưa đổi nhóm (loại A), nhiều người sẽ được xếp nhóm tại chỗ (loại B); các thành viên tự chọn vai trò → C' },
        13: { v: 'Khi nói về dụng cụ.', t: ["If you want to use one of those, you'll have to bring your own.", "we'll give you each a whistle", 'The town council is providing special collection bags for us to use'], p: 'Còi và túi được phát (loại A, B); muốn dùng gậy nhặt rác thì phải tự mang → C' },
        14: { v: 'Khi nói về trang phục.', t: ['Definitely go for something comfortable and wear shoes or boots that will keep your feet dry.', "We're all going to be given yellow caps so we can identify each other.", "The town council is supplying vinyl gloves, but they're quite large"], p: 'Mũ vàng ai cũng đội (loại A), găng tay chỉ một cỡ lớn (loại C); giày phải giữ chân khô = chống nước → B' },
        15: { v: 'Khi nói về phiếu khảo sát.', t: ['The town council can get an estimate of the quantity and the different kinds of litter we gather up by examining the bags we collect.', 'However, they are very keen to know more about where you find the rubbish', "So that's what you're asked to indicate on the survey."], p: 'Số lượng và loại rác đã biết qua túi rác (loại A, C); phiếu để ghi nơi tìm thấy rác → B' },
        16: { v: 'Khi chỉ trạm sơ cứu.', t: ['You can find it by taking the footpath that goes north from the car park towards the beach.', 'The path branches out, but carry on straight and there it is.'], p: 'Theo lối đi lên phía bắc từ bãi xe, đến chỗ rẽ nhánh thì đi thẳng → F' },
        17: { v: 'Khi chỉ chỗ nhận dụng cụ.', t: ['To get to the equipment pickup, walk along the road that leads from the car park, around the bend and past the bus stop.', "There's a small building before you get to the golf club and that's where the equipment is kept."], p: 'Đi theo đường từ bãi xe, qua khúc cua và trạm xe buýt; toà nhỏ trước câu lạc bộ golf → B' },
        18: { v: 'Khi chỉ nhà vệ sinh.', t: "They're adjacent to the car park, on the opposite side from where the wooded area is.", p: 'Sát bãi xe, phía đối diện với khu cây cối (phía nam) → G' },
        19: { v: 'Khi chỉ điểm tập trung.', t: ['You can see the beach is sort of divided into two stretches by rocky point.', 'The meeting point for the beach cleanup is on the beach that\'s closest to the cafe.', "Later in the day, you'll move to the West Beach."], p: 'Bãi biển gần quán cà phê nhất (bãi phía đông, có dãy chòi); bãi phía tây là để chiều (bẫy A) → I' },
        20: { v: 'Khi nói nơi ăn trưa.', t: "We'll meet in the area immediately outside the entrance to the Grand Pier where there are picnic tables.", p: 'Ngay ngoài lối vào cầu tàu Grand Pier, có bàn picnic; quán cà phê chỉ là nơi mua đồ ăn (bẫy) → D' },
      },
    },
    {
      part: 3, title: 'Research Project on Maths Ability', audio: A, clip: [884.4, 1324.6], cover: 'maths problem notebook student | algebra equations blackboard',
      fix: [['08:14', '']],
      turns: [
        ['Tutor', 'Right, Aya.'], ['Aya', 'Yes.'], ['Tutor', 'Great.'], ['Aya', 'Well, I explored'], ['Tutor', 'Hmm.'], ['Aya', 'Quite a few'], ['Tutor', 'How did you identify'],
        ['Aya', 'Well, they were all'], ['Tutor', 'So you followed'], ['Aya', 'Yeah, and arranged'], ['Tutor', 'Did those figures'], ['Aya', "I wouldn't say so."],
        ['Tutor', 'Yes, I can imagine.'], ['Aya', 'Anyway, the next part'], ['Tutor', 'Do you mean the first row'], ['Aya', "Yes, that's right."],
        ['Tutor', "Didn't the men think that?"], ['Aya', 'No.'], ['Tutor', 'And some of these people'], ['Aya', 'Yeah, interesting'], ['Tutor', "Yes, that's been my experience"],
        ['Aya', 'And for the men'], ['Tutor', "I've come across"], ['Aya', 'And then at the third level'], ['Tutor', 'Thanks.'], ['Aya', 'Well, the method'],
        ['Tutor', 'Of what?'], ['Aya', 'Of how different'], ['Tutor', 'Good mathematicians?'], ['Aya', 'A mixture actually.'], ['Tutor', 'And were there any other'],
        ['Aya', 'Yes.'], ['Tutor', 'How interesting.'], ['Aya', 'Yep.'], ['Tutor', 'And what about the weaker'], ['Aya', 'Well, I have to say'], ['Tutor', "Well, that's extremely"],
      ],
      groups: [
        mc('Choose the correct letter, A, B or C.\n\nResearch Project on Maths Ability', [
          [21, 'Aya chose interviewing as her main research method because', ['it was easier to use than other methods.', 'it enabled her to explore points of interest in detail.', 'it was different from methods used by other research groups.'], 'B'],
          [22, 'On what basis did Aya choose her research participants?', ['They were available in large numbers.', 'They had asked to be involved in the project.', 'They all had very similar attitudes to maths.'], 'C'],
          [23, 'What surprised Aya most about her findings?', ['that so few people had thought about their maths ability before', 'that there were such distinct differences between the genders', 'that people had such strong feelings about the subject'], 'C'],
        ], 'Questions 21-23'),
        table('Complete the tables below.\nWrite ONE WORD ONLY for each answer.\n\nWhy do people have a negative attitude to maths? (Research method: interview)', ['', 'Females', 'Males'], [
          ['First-level importance', 'Poor __Q24__', 'Fear of __Q25__'],
          ['Second-level importance', 'No obvious __Q26__', 'Belief that you need a __Q27__ for maths'],
          ['Third-level importance', 'Low awareness of alternative strategies to solve maths problems', ''],
        ], { 24: 'teaching', 25: 'numbers', 26: 'applications', 27: 'talent' }, 'Questions 24-27'),
        table('How do people solve maths questions?', ['', 'Successful', 'Unsuccessful'], [
          ['Research method', "__Q28__ of people's strategies", ''],
          ['Most common strategy', 'Understanding the question as a __Q29__', 'Applying a solution learned previously'],
          ['Second most common strategy', 'Using visualisation', 'Giving up after first __Q30__ of the problem'],
        ], { 28: 'observation', 29: 'whole', 30: 'reading' }, 'Questions 28-30'),
      ],
      expl: {
        21: { v: 'Khi thầy hỏi Aya dùng phương pháp nghiên cứu nào.', t: ['tried out things like sending out questionnaires but then I opted for a different approach.', "I thought face-to-face interviews would be more appropriate because you can look at things in more depth when you're actually with the person."], p: 'Phỏng vấn trực tiếp giúp tìm hiểu sâu hơn; phỏng vấn còn "khá vất vả" (loại A) → B' },
        22: { v: 'Khi thầy hỏi cách chọn người tham gia.', t: 'send round a really short questionnaire by email asking whether people liked maths and these 25 answered not at all, which is what I needed.', p: 'Chọn 25 người đều trả lời "hoàn toàn không thích toán" = thái độ với môn toán giống nhau → C' },
        23: { v: 'Khi thầy hỏi kết quả có bất ngờ không.', t: ["I wouldn't say so.", 'What did shock me was how violently anti-maths as a subject they were.'], p: 'Không có khác biệt nam nữ (loại B); điều gây sốc là họ ghét môn toán dữ dội = cảm xúc mạnh → C' },
        24: { v: 'Khi nói về lý do hàng đầu của nữ.', t: 'Now, you can see that for the women, they thought bad teaching was mainly to blame for their disliking maths.', p: 'Nữ cho rằng cách dạy kém là nguyên nhân chính (bad = poor) → teaching' },
        25: { v: 'Khi nói về lý do hàng đầu của nam.', t: 'They talked mostly about the fact that they were actually, you know, scared of numbers.', p: 'Nam sợ các con số (scared = fear) → numbers' },
        26: { v: 'Khi nói về lý do thứ hai của nữ.', t: "And then the problem for the women at the second level was the fact that they couldn't see what applications maths had and what obvious ones anyway.", p: 'Nữ không thấy toán có ứng dụng rõ ràng nào → applications' },
        27: { v: 'Khi nói về lý do thứ hai của nam.', t: 'they had this strong belief that you have to be born with a talent for the subject to be any good at maths.', p: 'Nam tin phải có năng khiếu bẩm sinh mới giỏi toán → talent' },
        28: { v: 'Khi nói về phần nghiên cứu thứ hai.', t: ['Well, the method I used for my research was observation.', 'Of how different people solve maths problems.'], p: 'Phương pháp là quan sát cách mọi người giải toán → observation' },
        29: { v: 'Khi nói về chiến lược của người giải đúng.', t: 'the most common strategy used by the people who got the correct answers was that they attempted to comprehend the question taken as a whole.', p: 'Người giải đúng cố hiểu câu hỏi như một tổng thể → whole' },
        30: { v: 'Khi nói về người giải yếu.', t: 'Well, I have to say the strategy they used was to give up immediately after reading the question', p: 'Bỏ cuộc ngay sau lần đọc câu hỏi đầu tiên → reading' },
      },
    },
    {
      part: 4, title: 'The Red Sea Urchin', audio: A, clip: [1324.6, 1761.2], cover: 'red sea urchin | sea urchin kelp underwater',
      turns: [],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'The Red Sea Urchin', [
          '<strong>Background</strong>',
          'The red sea urchin:',
          '• feeds on __Q31__',
          '• is covered in __Q32__ that protect it',
          '• used to be regarded as a __Q33__',
          'From 1970s onwards:',
          '• it became clear that __Q34__ was an important market for red sea urchins',
          '• scientific interest increased because of a __Q35__ in red sea urchin population',
          '<strong>Research findings</strong>',
          'Study based on biochemical techniques',
          'Red sea urchins:',
          '• grow very slowly',
          '• live a very long time (maximum life span: up to __Q36__)',
          '• can be harvested only after 6-7 years',
          '• after 22 years, only grow __Q37__ per year',
          'Study measuring radiocarbon',
          '• no evidence of __Q38__ when sea urchins die',
          '• they can still __Q39__ and grow when very old',
          '• growth not connected to __Q40__ or other external factors',
        ], {
          31: 'plants', 32: 'spines', 33: 'pest', 34: 'Asia', 35: 'decline', 36: '200 years old/200 years/200',
          37: '0.1 of a centimetre/0.1 of a centimeter/0.1 centimetre/0.1 centimeter/0.1 cm', 38: 'ageing/aging', 39: 'breed', 40: 'ocean conditions',
        }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi giới thiệu nhím biển đỏ.', t: ['It grazes on plants.', "It's an herbivore, in other words."], p: 'Ăn thực vật, tức là loài ăn cỏ → plants' },
        32: { v: 'Khi nói vì sao chúng sống tốt.', t: "And it survives very well because it's covered in spines, which are very sharp, and these deter most predators.", p: 'Phủ đầy gai nhọn giúp xua đuổi kẻ săn mồi → spines' },
        33: { v: 'Khi nói về những năm 1960.', t: 'So, in fact, it was considered to be a pest.', p: 'Bị xem là loài gây hại vì làm tảo bẹ suy giảm → pest' },
        34: { v: 'Khi nói về thay đổi những năm 1970.', t: 'It became apparent that there was a demand for the Red Sea Urchin in Asia, where certain parts of the animal were considered to be a great delicacy.', p: 'Có nhu cầu lớn ở châu Á → Asia' },
        35: { v: 'Khi nói lý do giới khoa học quan tâm.', t: ['And just at this time, people noticed an apparent decline in the numbers of Sea Urchins.', 'This prompted a wave of scientific studies'], p: 'Số lượng suy giảm dẫn đến làn sóng nghiên cứu → decline' },
        36: { v: 'Khi nói về tuổi thọ.', t: 'They can live to be 100 years old, and some may even reach 200.', p: 'Sống đến 100 năm (bẫy), có con tới 200 → 200 years old' },
        37: { v: 'Khi nói tốc độ lớn sau 22 tuổi.', t: "from the age of 22, when it's about 12 centimetres long, it grows at just 0.1 of a centimetre a year.", p: 'Dài khoảng 12 cm (bẫy), mỗi năm chỉ lớn 0,1 cm → 0.1 of a centimetre' },
        38: { v: 'Khi nói về nghiên cứu đo carbon phóng xạ.', t: 'it has shown that even very old Sea Urchins show almost no sign of ageing when something finally kills them.', p: 'Hầu như không có dấu hiệu lão hoá khi chết → ageing' },
        39: { v: 'Khi nói về nhím biển rất già.', t: "And in addition to that, even when they're incredibly ancient, they are still able to breed.", p: 'Dù rất già vẫn có thể sinh sản → breed' },
        40: { v: 'Khi nói về tốc độ tăng trưởng.', t: 'And this growth is independent of ocean conditions and other variables.', p: 'Tăng trưởng không phụ thuộc điều kiện đại dương và các yếu tố khác → ocean conditions' },
      },
    },
  ],
};
