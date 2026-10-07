// Vol 1 – Test 9 (PDF p1–6, key p23; audio test 9/Part 1–4.mp3; transcript Transcipt Audio 9.docx)
// Source errors fixed: Q27-30 box lettered A,B,C,C,D,E (→ A–F; key D/A/E/C read against the re-lettered box, checked
// with the recording); Q31-40 instruction "NO WORD ONLY" (→ ONE WORD ONLY); key "finace"/"schol" spelling.
// Part 2 = bank "Global Museum" (Actual Test 13 P2): same talk, same questions and key → reused, not seeded.
const { note, table, mc, multi, map, matching, short } = require('../vol_build');

module.exports = {
  vol: 1, test: 9,
  sections: [
    {
      part: 1, title: 'Sports Photography Course Registration', audio: 'test 9/Part 1.mp3', cover: 'sports photographer camera | football match photography',
      speakers: { 1: 'Receptionist', 2: 'Chris' },
      fix: [['Thank you, Mr. Johnson.', 'Thank you, Mr Johnson.'], ['Just Keen Community Learning Center of Pinewood.', 'Just key in Community Learning Centre of Pinewood.'], ['mono pots', 'monopods'], ['The weather of the two shots', 'The weather in the two shots']],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Sports Photography Course Registration', [
          '<strong>Caller’s name:</strong> Chris Johnson',
          '<strong>The level of the selected course:</strong> suitable for __Q1__',
          '<strong>How to register:</strong> no need for an __Q2__',
          '<strong>Cost:</strong> $ __Q3__',
          '<strong>Date available:</strong> next course, beginning __Q4__',
          '<strong>Telephone number:</strong> __Q5__',
          '<strong>Requirement:</strong> bring two photos of different __Q6__',
        ], { 1: 'beginners', 2: 'interview', 3: '38', 4: '17th April/17 April/April 17th/April 17/17th of April', 5: '07139587302', 6: 'weather' }, 'Questions 1-6'),
        table('Complete the table below.\nWrite ONE WORD ONLY for each answer.', ['Curriculum', '', ''], [
          ['Saturday', 'Morning', '– Introduction by the instructor<br>– How to choose the appropriate __Q7__'],
          ['', 'Afternoon', 'Discuss the __Q8__ to take photos'],
          ['Sunday', '', '– Workshop on how to __Q9__ pictures<br>– Advice on how to __Q10__ pictures'],
        ], { 7: 'equipment', 8: 'position', 9: 'edit', 10: 'sell' }, 'Questions 7-10'),
      ],
      expl: {
        1: { v: 'Khi Chris hỏi trình độ của khoá học.', t: 'Well, this course is intended for beginners only.', p: 'Khoá này chỉ dành cho người mới bắt đầu; khoá nâng cao dành cho người có kinh nghiệm học kỳ sau (bẫy) → beginners' },
        2: { v: 'Khi hỏi cách đăng ký.', t: ['Do I have to go for an interview to register?', "There's no need to do that."], p: 'Không cần phỏng vấn, có thể đăng ký qua điện thoại → interview' },
        3: { v: 'Khi hỏi học phí.', t: "Luckily, this year we have more funding, so the price has gone down to $38.", p: '$45 là giá năm ngoái (bẫy); năm nay giảm còn $38 → 38' },
        4: { v: 'Khi hỏi ngày khai giảng.', t: "Then there's another one starting from April the 17th.", p: 'Khoá vừa kết thúc tuần trước; khoá kế tiếp bắt đầu 17/4; khoá 1/5 thì “too late” → 17th April' },
        5: { v: 'Khi hỏi số điện thoại.', t: "It's 07139587302.", p: 'Số điện thoại của Chris → 07139587302' },
        6: { v: 'Khi nói về yêu cầu với hai bức ảnh.', t: 'The weather in the two shots should be different.', p: 'Hai bức ảnh phải có thời tiết khác nhau, vd. trời nắng và trời tuyết → weather' },
        7: { v: 'Phần chương trình học, sáng thứ Bảy.', t: 'followed by instructions on the use of specific equipment for various sports', p: 'Sau phần giới thiệu là hướng dẫn dùng thiết bị phù hợp cho từng môn thể thao → equipment' },
        8: { v: 'Chiều thứ Bảy.', t: "You'll have to work together to decide the best position to take the shots.", p: 'Cả lớp cùng thảo luận vị trí tốt nhất để chụp → position' },
        9: { v: 'Chủ nhật.', t: "On Sunday, there's a workshop taking place in a computer equipped room where you'll learn to edit different shots.", p: 'Hội thảo trong phòng máy tính để học chỉnh sửa ảnh → edit' },
        10: { v: 'Ngay sau đó.', t: 'There is also a section on some tricks to sell them.', p: 'Có phần mẹo bán ảnh cho báo và tạp chí → sell' },
      },
    },
    {
      part: 2, reuse: '6a53bc495c459ab074ce6a26', title: 'Global Museum', audio: 'test 9/Part 2.mp3', groups: [], expl: {},
    },
    {
      part: 3, title: 'Music in Restaurants', audio: 'test 9/Part 3.mp3', cover: 'restaurant diners interior | jazz band restaurant',
      speakers: { 1: 'Dan', 3: 'Jeanie' },
      fix: [['What questions are posing your questionnaire?', 'What questions are posed in your questionnaire?'], ['largely act as distracted as the intention being', 'largely act as distractors, the intention being'], ['Before you head the rest of the discussion,', '']],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What is the topic of the research?', ['the effect of music on consumers', 'the effect of music on eating', 'the effect of music on the price of food'], 'A'],
          [22, 'The research finds that in the restaurants', ['the music is played everywhere.', 'the music is played at a uniform volume level.', 'the music is played at a certain time.'], 'B'],
          [23, 'The first few questions in the questionnaire are', ['to understand people’s taste in music.', 'to clarify the research aim.', 'to disguise the purpose of the survey.'], 'C'],
          [24, 'The questions in the questionnaire came from', ['a previous study.', 'a professional dictionary.', 'the student herself.'], 'A'],
        ], 'Questions 21-24'),
        multi('Choose TWO letters, A-E.', 25, 'Which TWO are the main reasons given for choosing a restaurant?', ['competitors nearby', 'environment', 'transport facilities', 'service', 'seat capacity'], ['A', 'E'], 'Questions 25-26'),
        matching('What is people’s attitude towards playing each of the following types of music in restaurants?\nChoose FOUR answers from the box and write the correct letter, A-F, next to Questions 27-30.',
          ['People will spend more money in the restaurant.', 'People don’t even notice the music.', 'People will come back again.', 'People don’t think the restaurant is worth the price.', 'People will leave the restaurant right after eating.', 'People don’t like the restaurant at all.'],
          [[27, 'no music', 'D'], [28, 'jazz', 'A'], [29, 'classical music', 'E'], [30, 'pop music', 'C']], { title: 'People’s Attitudes', groupTitle: 'Questions 27-30' }),
      ],
      expl: {
        21: { v: 'Khi Jeanie hỏi đề tài nghiên cứu.', t: 'if appropriate music is played while people are eating, it may cause some changes in their behavior.', p: 'Nghiên cứu xem âm nhạc làm thay đổi hành vi của thực khách (người tiêu dùng) ra sao, không phải cách ăn → A' },
        22: { v: 'Khi Dan kể kết quả quan sát.', t: 'More importantly, although the music is played at different times, the volume is unchanged.', p: 'Nhạc phát vào các thời điểm khác nhau (loại C) nhưng âm lượng không đổi → B' },
        23: { v: 'Khi nói về phần đầu bảng hỏi.', t: 'subjects will be less inclined to think that the survey is about the music being played.', p: 'Các câu đầu không hỏi về âm nhạc mà để đánh lạc hướng, che giấu mục đích khảo sát → C' },
        24: { v: 'Khi Jeanie hỏi Dan có tự thiết kế bảng hỏi không.', t: 'I read an assignment a student wrote last year, which was just kept beside a dictionary in the library.', p: 'Bảng hỏi lấy từ bài làm của một sinh viên năm trước = nghiên cứu trước đó; cuốn từ điển chỉ là chỗ để (bẫy B) → A' },
        25: { v: 'Khi nói về lý do chọn nhà hàng.', t: 'If one of them stands out from its rivals, they will choose it.', p: 'Phục vụ chỉ 12% (loại D), vị trí/giao thông không còn quan trọng (loại C); khách so sánh các nhà hàng đối thủ gần đó → A' },
        26: { v: 'Như câu 25 (chọn 2 đáp án).', t: 'While the majority of respondents think whether they will pick this restaurant depends on how many available seats it has.', p: 'Đa số chọn nhà hàng tùy vào số chỗ ngồi còn trống → sức chứa → E' },
        27: { v: 'Phần kết quả, khi không có nhạc.', t: "If people find there isn't any music during the meal, they will think the restaurant charge is too much.", p: 'Không có nhạc thì khách thấy giá quá đắt → không đáng tiền → D' },
        28: { v: 'Nhạc jazz.', t: 'they tend to stay at the restaurant longer and order more food to enjoy the music.', p: 'Ở lâu hơn và gọi thêm món → chi nhiều tiền hơn → A' },
        29: { v: 'Nhạc cổ điển.', t: 'but to finish the food quickly and hurry away because they don\'t like this type of music at all.', p: 'Khách ăn nhanh rồi vội đi ngay; họ không thích loại nhạc này chứ không phải nhà hàng (loại F) → E' },
        30: { v: 'Nhạc pop.', t: 'As a result, this greatly increases the possibility of their presence at the same restaurant.', p: 'Khả năng họ quay lại cùng nhà hàng tăng mạnh → C' },
      },
    },
    {
      part: 4, title: 'Cube Houses', audio: 'test 9/Part 4.mp3', cover: 'cube houses Rotterdam | Kubuswoningen',
      fix: [['Dutch architect Blom', 'Dutch architect Piet Blom'], ['in the older half an area of the city', 'in the Oude Haven area of the city'], ['Is easy to see why these striking homes are cubes tilted 45 degrees on their side.', "It's easy to see why. These striking homes are cubes tilted 45 degrees on their side."], ['Standing at three floors tall. Their ground floor is the entrance.', 'Standing at three floors tall, the ground floor is the entrance.'], ['The medium level house is a bathroom', 'The medium level houses a bathroom'], ['After curious bystanders kept disturbing the cube houses residents.', "After curious bystanders kept disturbing the cube houses' residents,"], ['the show Cube Museum', 'the Show Cube Museum'], ['Rotterdam based personal architecture BNA', 'Rotterdam-based Personal Architecture BNA'], ['leading stock hostel chains', 'leading Stayokay hostel chains']],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Cube Houses', [
          '<strong>Background information</strong>',
          '• After World War II, local urban planners wanted to redevelop and revive the city.',
          '• Altogether, the Cube Houses can function as a __Q31__.',
          '• Each Cube building is in the shape of a __Q32__.',
          '• The Cube Houses sit on top of a __Q33__ for pedestrians to the central city.',
          '• During construction, the work was temporarily discontinued because the designer faced the problem of __Q34__.',
          '<strong>Design features of the Cube Houses</strong>',
          '• Underneath the houses, there are three pillars made of __Q35__.',
          '• A new building is situated between a warehouse and a __Q36__ of architecture.',
          '• It is a three-storey building.',
          '– The ground floor is an entrance.',
          '– Both the lower level and the top level of each house are in the shape of a __Q37__.',
          '– The first floor has a living room and an open kitchen.',
          '– The medium level has a bathroom and two bedrooms.',
          '– The top floor is sometimes used as a small __Q38__.',
          '<strong>Living in the Cube Houses</strong>',
          '• There is a nearby market __Q39__ across the square from the Cube Houses.',
          '• For guests, two advantages of the house are its convenient __Q40__ and reasonable price.',
        ], { 31: 'village', 32: 'tree', 33: 'bridge', 34: 'finance', 35: 'concrete', 36: 'school', 37: 'triangle', 38: 'garden', 39: 'hall', 40: 'location' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Phần lịch sử, ý tưởng của kiến trúc sư.', t: 'He designed the cube houses to recreate daily life in a village where individuals are closely connected and yet have their own separate space.', p: 'Cả khu nhà tái hiện cuộc sống một ngôi làng → village' },
        32: { v: 'Khi giải thích ý tưởng thiết kế.', t: 'The concept behind these houses is that each elevated cube seems like a tree.', p: 'Mỗi khối lập phương như một cái cây, cả khu như một khu rừng (bẫy forest) → tree' },
        33: { v: 'Khi nói về vị trí.', t: 'these houses are located right over a pedestrian bridge across one of the busiest streets into the city center', p: 'Khu nhà nằm ngay trên một cây cầu dành cho người đi bộ → bridge' },
        34: { v: 'Khi nói về khó khăn khi xây dựng.', t: 'and it once stopped as the designer had difficulty in finance.', p: 'Công trình từng tạm dừng vì kiến trúc sư gặp khó khăn tài chính → finance' },
        35: { v: 'Phần đặc điểm thiết kế.', t: 'The tilted residences are constructed on three concrete pillars.', p: 'Ba trụ bằng bê tông → concrete' },
        36: { v: 'Khi nói về khối lập phương lớn.', t: 'One of the two larger cubes was developed as an architecture school and there is another building recently built between it and a warehouse.', p: 'Toà nhà mới nằm giữa nhà kho và trường kiến trúc → school' },
        37: { v: 'Khi mô tả các tầng.', t: 'This level and the top level are both triangle shaped.', p: 'Tầng dưới và tầng trên cùng đều hình tam giác → triangle' },
        38: { v: 'Khi nói về tầng trên cùng.', t: 'In some cases, the top floor is used as a small rooftop garden', p: 'Tầng trên cùng đôi khi là vườn nhỏ trên mái → garden' },
        39: { v: 'Phần cuộc sống trong nhà lập phương.', t: "Rotterdam's Market Hall, the largest indoor market in the Netherlands", p: 'Bên kia quảng trường là Market Hall, chợ trong nhà lớn nhất Hà Lan → hall' },
        40: { v: 'Cuối bài, về nhà nghỉ trong khối lập phương.', t: 'What attracts guests most is its ideal location, with a major railway station within a five minute walk.', p: 'Vị trí lý tưởng, gần ga tàu, cộng với giá hợp lý → location' },
      },
    },
  ],
};
