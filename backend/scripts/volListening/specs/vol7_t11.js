// Vol 7 – Test 11 (PDF "Listening/Test 11/Test 11.pdf", text layer, key on its last pages; audio = whole test "Audio Test 11.mp3";
// transcript "Transcript Test 11.pdf" — headings "Section N", "(m:ss - m:ss)" lines, answers marked "Q7 …" in the text).
// P3 = bank "Oral History Project" (Vol 4 - Test 8 P3: same recording, 6-gram 0.71, key 10/10) → reused.
// The recording has no half-minute check pauses after P1/P2; P2 ends before "Part 3" (760 s). P4's transcript ends with
// "You have 2 minutes left…" lines that are not in the part's audio → cut.
const { note, mc, multi } = require('../vol_build');
const A = 'Listening/Test 11/Audio Test 11.mp3';

module.exports = {
  vol: 7, test: 11, docx: 'Listening/Test 11/Transcript Test 11.pdf',
  rawRe: [['\\bQ\\d{1,2}\\s+', '']],
  sections: [
    {
      part: 1, title: 'A Horseback Riding Trip', audio: A, clip: [38.3, 408.1], cover: 'horseback riding mountains valley | horse trekking holiday',
      turns: [
        ['Jenny', 'Hi Greg'], ['Greg', 'Yeah, I went on'], ['Jenny', "Yes, that's the one."], ['Greg', 'If you can, hang on'], ['Jenny', "That'd suit me better"],
        ['Greg', 'And also, at one point'], ['Jenny', 'Oh, great.'], ['Greg', 'Oh, and another thing'], ['Jenny', "I'm up for that."], ['Greg', 'Through some amazing'],
        ['Jenny', 'Is it hard work'], ['Greg', 'No.'], ['Jenny', "And what's on day two?"], ['Greg', 'No.'], ['Jenny', 'Wow, that sounds great.'],
        ['Greg', "Well, I'd had a sore knee"], ['Jenny', 'No problem there.'], ['Greg', 'Yeah, but another thing'], ['Jenny', "I think you've convinced me"],
        ['Greg', 'I registered online'], ['Jenny', 'I just have to let my boss know'], ['Greg', "I'm sure it won't."],
      ],
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Horseback riding trip', [
          'Length of trip: two days',
          'Best month to go: September',
          'Might see large numbers of __Q1__',
          'Type of accommodation: a __Q2__',
          '<strong>Day one</strong>',
          '• Final destination: __Q3__',
          '• Evening activity: chance to have a __Q4__',
          '<strong>Day two</strong>',
          '• Explore the valley and have lunch by a __Q5__',
          '• Afternoon trip to a __Q6__',
          '<strong>Tips for the holiday</strong>',
          '• unsuitable if you have __Q7__ problems',
          '• rocky paths, so take __Q8__',
          '<strong>Booking details</strong>',
          '• Book online to get a __Q9__',
          '• Inform your __Q10__ company about the type of holiday booked',
        ], { 1: 'birds', 2: 'tent', 3: 'mountains/the mountains', 4: 'swim', 5: 'waterfall', 6: 'cave', 7: 'back', 8: 'walking boots', 9: 'discount', 10: 'insurance' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Greg kể lý do nên đi vào tháng Chín.', t: 'And also, at one point when we stopped for a picnic, I was lying in a field, looking up, and saw a huge flock of birds.', p: 'Thấy một đàn chim rất lớn đang di cư → birds' },
        2: { v: 'Khi nói chỗ ở.', t: ["You don't stay in a hotel.", "You stay in a tent, so you don't have to come back to town in the evening."], p: 'Không ở khách sạn (bẫy) mà ngủ lều → tent' },
        3: { v: 'Khi nói lộ trình ngày đầu.', t: "Where you're really heading for is the mountains, and when you set out, you can only see them in the far distance.", p: 'Thung lũng có rừng chỉ là buổi sáng (bẫy); điểm đến thật sự là vùng núi → mountains' },
        4: { v: 'Khi nói buổi tối ngày đầu.', t: "But on that first evening, when you've been riding all day, you get the opportunity to go for a swim, and you really enjoy that.", p: 'Buổi tối có dịp đi bơi → swim' },
        5: { v: 'Khi nói ngày thứ hai.', t: ["At the end of it, there's a waterfall.", "It's an amazing place to stop for lunch."], p: 'Ăn trưa bên thác nước cuối thung lũng → waterfall' },
        6: { v: 'Khi nói buổi chiều ngày thứ hai.', t: "And in the afternoon, there's a trip that goes to a cave.", p: 'Buổi chiều đi thăm hang động → cave' },
        7: { v: 'Khi Greg đưa lời khuyên.', t: ["It was okay, actually, but what you've got to watch for is that you don't have any trouble with your back.", 'Riding can really aggravate that.'], p: 'Đau đầu gối thì vẫn ổn (bẫy knee); cưỡi ngựa làm nặng thêm bệnh lưng → back' },
        8: { v: 'Khi nói về đường đi.', t: ['Yeah, but another thing I hadn\'t realized is that you actually walk the horses down some pretty steep and uneven paths.', 'So make sure you have walking boots, not just normal riding boots.'], p: 'Đường dốc gồ ghề nên mang giày đi bộ, không chỉ giày cưỡi ngựa → walking boots' },
        9: { v: 'Khi nói cách đặt chỗ.', t: 'When I was looking at the website, I saw that if I register online, I can get a discount.', p: 'Đăng ký trực tuyến được giảm giá → discount' },
        10: { v: 'Cuối cuộc hội thoại.', t: "And then the other important thing I read was that you have to make sure that your insurance company know that you're going on an adventure trip to make sure that you're covered in case anything happens.", p: 'Báo cho sếp là chuyện xin nghỉ (bẫy); phải báo công ty bảo hiểm về chuyến đi mạo hiểm → insurance' },
      },
    },
    {
      part: 2, title: 'Working at the UK Summer Sports Camp', audio: A, clip: [408.1, 760], cover: 'summer sports camp children coaching | kids football camp',
      fix: [['What we particularly like this summer', "What we'd particularly like this summer"], ['sports bags which are for a small fee', 'sports bags which are available for a small fee']],
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [11, 'The speaker says that he is happy to answer questions during his talk about', ['the general operation of the camp.', 'the children who attend.', 'the job responsibilities.'], 'A'],
          [12, 'Why do parents send their children to the camp again and again?', ['They like the fact that it is cheaper than other camps.', 'They are pleased with the wide range of facilities on offer.', 'They know their children will be looked after at the camp.'], 'C'],
          [13, 'One special thing about this summer camp is', ['the number of international students.', 'the preparation for professional sports.', 'the inclusion of non-sports activities.'], 'B'],
          [14, 'The speaker says that this year, the camp particularly needs people', ['who would like to work in the office.', 'who have experience of cooking.', 'who young children can talk to.'], 'C'],
          [15, 'What should the new camera person have?', ['artistic talents', 'good camera equipment', 'a qualification in photography'], 'A'],
          [16, 'What does the speaker say about working conditions?', ['Sports coaches earn the most.', 'Kitchen staff work the longest hours.', 'Cleaners work in the mornings and evenings.'], 'A'],
        ], 'Questions 11-16'),
        multi('Choose TWO letters, A-E.', 17, 'Which TWO benefits are provided free of charge to camp workers?', ['a sports bag', 'a T-shirt', 'use of sports facilities', 'meals', 'internet access'], ['B', 'C'], 'Questions 17-18'),
        multi('Choose TWO letters, A-E.', 19, 'Which TWO things do applicants need in order to get a job at the camp?', ['experience of working with children', 'an ability to make decisions on their own', 'a friendly personality', 'relevant qualifications', 'to be over a certain age'], ['C', 'E'], 'Questions 19-20'),
      ],
      expl: {
        11: { v: 'Đầu bài nói.', t: "Feel free to interrupt if there's anything you don't understand about the way the camp is administered, though if you could save any questions about the work itself until the end that would be good.", p: 'Câu hỏi về công việc xin để cuối buổi (bẫy C); được ngắt lời hỏi về cách trại được điều hành → A' },
        12: { v: 'Khi nói lý do trại thành công.', t: ["The reason we're successful is because parents trust us and send their children to us summer after summer.", "but we make sure our team are caring and enthusiastic and that's why parents want their children to keep coming back, rather than because of the facilities on offer"], p: 'Trại không rẻ nhất (bẫy A), không phải nhờ cơ sở vật chất (bẫy B); phụ huynh tin đội ngũ chu đáo → C' },
        13: { v: 'Khi nói điều đặc biệt của trại.', t: "We run all the activities you'd expect in a summer camp, arts and music as well as sports, but we also have special coaching for those who might be able to make a career in their chosen sport.", p: 'Học sinh từ khắp cả nước, không phải quốc tế (bẫy A); nghệ thuật, âm nhạc là bình thường (bẫy C); có huấn luyện riêng cho người có thể theo thể thao chuyên nghiệp → B' },
        14: { v: 'Khi nói vị trí cần tuyển năm nay.', t: "What we'd particularly like this summer are people who are willing to be in charge of looking after our younger kids, making sure they're happy and have someone to go to if they have any problems.", p: 'Văn phòng không cần thêm người, đầu bếp chỉ cần vài người (bẫy A, B); cần người để trẻ nhỏ tìm đến khi có chuyện → C' },
        15: { v: 'Khi giới thiệu vị trí quay phim.', t: ["We'll supply first class equipment, but we need you to supply your creative abilities."], p: 'Trại cung cấp thiết bị (bẫy B), không nhắc bằng cấp (bẫy C); cần khả năng sáng tạo → năng khiếu nghệ thuật → A' },
        16: { v: 'Khi nói về điều kiện làm việc.', t: 'Daytime coaching roles pay the highest wages because of the sports skills required and the longer hours.', p: 'Huấn luyện viên ban ngày được trả lương cao nhất → A' },
        17: { v: 'Khi nói các quyền lợi.', t: "We'll give everyone UK summer camp t-shirts, which we'll expect you to wear when working.", p: 'Túi thể thao phải trả phí (bẫy A), internet tính phí (bẫy E), bữa ăn chỉ được giảm giá (bẫy D); áo phông được phát cho mọi người → B' },
        18: { v: 'Ngay trước đó.', t: "you'll be given access to all our facilities, which means you can have a swim or play a football match without having to pay anything.", p: 'Dùng mọi cơ sở vật chất không mất tiền → C' },
        19: { v: 'Khi nói yêu cầu với ứng viên.', t: 'Of course, you need to be sociable and enjoy meeting people.', p: 'Không cần bằng cấp (bẫy D), kinh nghiệm với trẻ chỉ là lợi thế (bẫy A), quyết định quan trọng phải hỏi giám sát (bẫy B); cần hoà đồng → C' },
        20: { v: 'Cuối bài nói.', t: "We can't accept applications from people under the age of 18, I'm afraid, but if you haven't got there yet, don't worry.", p: 'Không nhận người dưới 18 tuổi → phải trên một độ tuổi nhất định → E' },
      },
    },
    { part: 3, reuse: '6ac731391f45cf3630a45cd9', title: 'Oral History Project' },
    {
      part: 4, title: 'Improving the Local Hospital Services', audio: A, clip: [1177.8, 1560], cover: 'hospital corridor staff patients | modern hospital building',
      cut: [['You have 2 minutes left.', 'question booklet to be collected.']],
      fix: [['I thought this was really good practise too.', 'I thought this was really good practice too.']],
      groups: [
        note('Complete the notes below.\nWrite ONE WORD ONLY for each answer.', 'Improving the local hospital services', [
          '<strong>Feedback from questionnaire</strong>',
          'Main reasons for choosing a hospital:',
          '• convenient __Q31__ services',
          '• the hospital building should be __Q32__',
          '• staff providing __Q33__ prior to hospital treatment',
          '<strong>Intended action over the next year</strong>',
          '• develop web pages for local __Q34__ and for hospital staff',
          '• a __Q35__ may be given as a reward to some staff for success and effort',
          '• __Q36__ will be asked to give their opinions of the hospital',
          '• effectiveness of __Q37__ will be assessed at all levels',
          '<strong>Recommendations</strong>',
          '• new units should be opened, e.g. for patients that suffer from __Q38__ disturbance or who need __Q39__ surgery',
          '• the hospital has adequate equipment and space but needs improved __Q40__ to maximise use of its facilities',
        ], { 31: 'transport', 32: 'clean', 33: 'information', 34: 'doctors', 35: 'bonus', 36: 'visitors', 37: 'communication', 38: 'sleep', 39: 'plastic', 40: 'planning' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói lý do chọn bệnh viện.', t: 'For instance, people felt it was really important, not the distance the hospital was from their homes, but how easy it was to get transport there.', p: 'Không phải khoảng cách mà là việc đi lại thuận tiện → transport' },
        32: { v: 'Khi nói về toà nhà bệnh viện.', t: ['How clean it was, however, certainly was.', 'One in two people surveyed listed this as a major concern.'], p: 'Hiện đại và an toàn không được nhắc nhiều (bẫy); sạch sẽ là mối quan tâm lớn → clean' },
        33: { v: 'Khi nói về nhân viên bệnh viện.', t: 'People also said it was important for them to know that a member of the hospital staff would be prepared to give them information they needed about their treatment before they had it too.', p: 'Nhân viên cung cấp thông tin trước khi điều trị → information' },
        34: { v: 'Khi nói về trang web.', t: 'there is a plan to add to the existing hospital website to advise doctors who practise in the area, as well as on-site staff, of changes and developments in hospital services.', p: 'Thêm trang web cho các bác sĩ hành nghề trong vùng → doctors' },
        35: { v: 'Khi nói chương trình ghi nhận nhân viên.', t: ["It hasn't been decided yet what form this will take, but it's likely to be a bonus of some kind, I think.", 'Wage rises for all are always welcome too, of course.'], p: 'Tăng lương cho tất cả chỉ là nói thêm (bẫy); phần thưởng có thể là tiền thưởng → bonus' },
        36: { v: 'Khi nói ý kiến sẽ được thu thập.', t: 'Another idea that the hospital management want to introduce is to find a way to assess the views of visitors to the hospital.', p: 'Lấy ý kiến của người đến thăm bệnh viện → visitors' },
        37: { v: 'Khi nói điều sẽ được đánh giá.', t: 'And the hospital will be looking at how good the communication is between managers and staff and, in turn, that between staff and patients.', p: 'Đánh giá chất lượng giao tiếp ở mọi cấp → communication' },
        38: { v: 'Khi đưa ra khuyến nghị.', t: ["people have to travel to another hospital that's 60 miles away for treatment of illnesses associated with interrupted sleep.", 'So, a unit to support that would be really useful, I think.'], p: 'Cần đơn vị điều trị bệnh liên quan đến giấc ngủ bị gián đoạn → sleep' },
        39: { v: 'Ngay sau đó.', t: "I'd also suggest investigating the possibility of funding a new plastic surgery unit, because that's another service that patients cannot receive locally.", p: 'Khoa mắt đã có (bẫy eye); đề xuất khoa phẫu thuật thẩm mỹ → plastic' },
        40: { v: 'Khuyến nghị cuối.', t: ['But many of them are empty for long periods of time.', 'If better planning was implemented, these and other facilities could be in use 24 hours a day.'], p: 'Thiết bị và không gian đủ, cần lập kế hoạch tốt hơn để dùng hết công suất → planning' },
      },
    },
  ],
};
