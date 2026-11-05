// Vol 10 – Test 4 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 4 Listening": question paper + transcript PDF on a public
// Google Drive link + key). Same test = IELTS Trainer Test 5; audio: terratern.com "IELTS Listening Practice Test 74", one mp3 per
// section incl. narration → clip from "Section N" to ~2 s after "check your answers". Q25–30 diagram + Q37–40 flow chart are images
// in the paper (not in the PDF text) → diagram from terratern (web/vol10/img/t4p3_diagram.png, no watermark), flow chart typed.
// Transcript = specs/vol10_tx/t4pN.txt: izone PDF (Woman/Man → Agent/Carlton, Teacher → Tutor), P1 example dropped (the audio
// has no separate example), "Oh, thanks." is Carlton's; checked word by word against Whisper — restored from the audio: P2 "So,
// that's an overview of the kind of jobs.", P3 "Well, I was really impressed by something I saw on a roof in Cornwall…", P4
// "this later sample" (PDF "latest").
// Key = izone, checked against the transcript; Q25 izone "H" → F (the low wall on the right; H = the electric wire = Q26).
const fs = require('fs'), path = require('path');
const { note, matching, multi, map } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');

module.exports = {
  vol: 10, test: 4,
  sections: [
    {
      part: 1, title: 'Costwise Car Hire', audio: 'LISTENING/test 4/part 1.mp3', clip: [22.3, 368.5],
      cover: 'car rental keys | rental car airport', transcript: TX('t4p1'),
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'Costwise Car Hire', [
          '• Number of offices in Sydney – 3',
          '• Booking reference number – __Q1__',
          '• Office just by __Q2__ terminal',
          '• Opening hours 6.45 am to __Q3__',
          '• After hours charges – $ __Q4__',
          '• Cheapest model of car available – __Q5__',
          '• Information needed when booking – __Q6__ number',
          '• Length of hire period __Q7__',
          '• Reduce cost by driving under __Q8__ km per week',
          '• Insurance does not cover – __Q9__',
          '• After hours put keys in box near the office on the __Q10__',
        ], {
          1: '743002', 2: 'international / the international', 3: '6.15 / 6:15 / 6.15 pm / 6:15 pm / 18.15 / 18:15', 4: '30',
          5: 'Echo / the Echo', 6: 'credit card', 7: 'seven days / 7 days / one week / 1 week / a week', 8: '1000 / 1,000',
          9: 'luggage', 10: 'pavement',
        }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi nhân viên đọc mã đặt chỗ.', t: ['I mean the one you got from me when we booked your flights.', 'Yeah, 743002.'], p: '1800 705 639 là số điện thoại (bẫy); mã đặt chỗ là số nhận khi đặt vé máy bay → 743002' },
        2: { v: 'Khi Carlton hỏi văn phòng ở đâu.', t: ['I’ll be coming to the domestic terminal from Melbourne.', 'It’s immediately outside the international terminal.'], p: 'Carlton đến nhà ga nội địa (bẫy) nhưng văn phòng nằm ngay bên ngoài nhà ga quốc tế → international' },
        3: { v: 'Khi Carlton hỏi giờ mở cửa.', t: 'Mm, well, they open at quarter to seven (6:45) and close at 6:15 in the evening.', p: 'Mở 6:45 sáng, đóng 6:15 tối; “10 past 6” là giờ máy bay hạ cánh (bẫy) → 6.15' },
        4: { v: 'Khi nói về việc nhận xe ngoài giờ.', t: ['But if you arrange it in advance, they can wait for you.', 'You do have to pay an extra 30 dollars for that, though.'], p: 'Ngoài giờ phải trả thêm 30 đô; 50 đô là số tiền tiết kiệm nếu sáng hôm sau mới lấy xe (bẫy) → 30' },
        5: { v: 'Khi Carlton hỏi loại xe.', t: ['That would be the Echo, I guess.', 'E-C-H-O.'], p: 'Xe rẻ nhất (dưới 60 đô/ngày) là Echo, được đánh vần → Echo' },
        6: { v: 'Khi nói về đặt xe online.', t: 'They won’t deduct any charges until you finish with the car, but they do need your credit card number when you book, and of course, they’ll want to see your driving license when you collect.', p: 'Khi đặt cần số thẻ tín dụng; bằng lái chỉ xuất trình lúc nhận xe → credit card' },
        7: { v: 'Khi nhân viên hỏi thuê bao lâu.', t: ['I’m in Sydney for seven days.', 'I’ll only actually need to use it on three or four of those days, I hope, but I’ll keep it for the whole week.'], p: 'Chỉ dùng 3–4 ngày (bẫy) nhưng giữ xe cả tuần = 7 ngày → seven days' },
        8: { v: 'Khi Carlton hỏi cách giảm chi phí.', t: 'Oh, you get quite a big discount if you do less than a 1000 kilometers in the week.', p: 'Giảm giá nhiều nếu chạy dưới 1000 km một tuần → 1000' },
        9: { v: 'Khi nói về bảo hiểm.', t: 'Yes, but what you must remember is that it doesn’t cover anything except the car, so you must be careful not to leave anything at all in it when you park, because your luggage isn’t insured, even if it’s out of sight, locked in the boot.', p: 'Bảo hiểm chỉ cho xe; hành lý không được bảo hiểm → luggage' },
        10: { v: 'Khi Carlton hỏi trả xe ngoài giờ.', t: ['There’s a secure box just outside the office on the pavement.', 'You just drop the keys in there.'], p: 'Thả chìa khóa vào hộp ngay ngoài văn phòng, trên vỉa hè → pavement' },
      },
    },
    {
      part: 2, title: 'Careers with the International Finest Group of Hotels', audio: 'LISTENING/test 4/part 2.mp3', clip: [0, 430],
      cover: 'hotel reception desk | hotel lobby', transcript: TX('t4p2'),
      groups: [
        matching('The following are essential requirements for which job?\nWrite the correct letter, A, B or C, next to Questions 11-15.',
          ['foreign languages', 'willingness to travel abroad', 'professional qualification'], [
            [11, 'conference organiser', 'A'], [12, 'catering manager', 'C'], [13, 'housekeeper', 'B'],
            [14, 'fitness centre staff', 'C'], [15, 'reservations assistant', 'A'],
          ], { title: 'Essential requirements', reuse: true, groupTitle: 'Questions 11-15' }),
        matching('Complete the flow chart below.\nChoose FIVE answers from the list and write the correct letter, A-G, next to Questions 16-20.',
          ['CV', 'names of referees', 'work permit', 'recruitment seminar', 'evidence of qualifications', 'conditions of employment', 'initial interview'], [
            [16, 'Register interest in working for International Finest Group → Receive personal code and check …', 'F'],
            [17, 'Download application form → Send in form and attach …', 'A'],
            [18, 'Receive reply and confirm …', 'G'],
            [19, 'Send in …', 'E'],
            [20, 'Attend …', 'D'],
          ], { title: 'International Finest Group – Recruitment procedures', groupTitle: 'Questions 16-20' }),
      ],
      expl: {
        11: { v: 'Khi nói về đội tổ chức sự kiện.', t: 'If you have good communication and organizational skills, with a good level of fluency in at least one European and one non-European language, I’d suggest you think about becoming part of the team which sets up these events for all our centers.', p: 'Người tổ chức hội nghị cần thông thạo ít nhất một ngôn ngữ châu Âu và một ngôn ngữ ngoài châu Âu; làm việc cố định ở London (không đi nước ngoài) → A' },
        12: { v: 'Khi nói về quản lý bếp – ăn uống.', t: 'We’re after really energetic and totally efficient young managers who already have the relevant business qualifications—no training on the job here—and they must share the team’s determination to make everything run smoothly at any time of the day or night.', p: 'Quản lý bộ phận ăn uống phải có sẵn bằng cấp kinh doanh liên quan = professional qualification → C' },
        13: { v: 'Khi nói về quản gia dự phòng.', t: 'As well as covering UK holidays, maternity, and paternity leave, there will be times when you have to fill a key post when someone’s sick, which could be anywhere in our European, Middle Eastern, or Far Eastern hotels, so you must be prepared to hop on a plane at five minutes\' notice.', p: 'Phải sẵn sàng lên máy bay đến khách sạn ở châu Âu, Trung Đông, Viễn Đông = willingness to travel abroad → B' },
        14: { v: 'Khi nói về nhân viên hồ bơi, phòng gym.', t: 'A diploma in sports science would be the minimum requirement here.', p: 'Yêu cầu tối thiểu là bằng khoa học thể thao; không cần là vận động viên → C' },
        15: { v: 'Khi nói về vị trí xử lý đặt phòng.', t: 'If you have fluency and some keyboard skills in, for example, Spanish or any Far Eastern languages, either having taken a degree or preferably from having lived and worked overseas, you might be just the person we’re looking for to deal with email bookings and queries in the office here.', p: 'Xử lý đặt phòng qua email cần thông thạo tiếng Tây Ban Nha hoặc ngôn ngữ Viễn Đông; “lived and worked overseas” chỉ là cách có được ngoại ngữ → A' },
        16: { v: 'Khi nói bước sau khi nhận mã cá nhân.', t: 'Along with that, you get access to the Human Resources website, where you should make sure you understand the legal terms and conditions which apply to all our employees.', p: 'Nhận mã rồi vào web nhân sự để kiểm tra điều khoản, điều kiện áp dụng cho nhân viên = conditions of employment; giấy phép lao động là điều kiện trước khi đăng ký (bẫy C) → F' },
        17: { v: 'Khi nói về gửi đơn.', t: 'That’s also where you can then download the application form, fill it in, and send it back along with your CV.', p: 'Gửi đơn kèm CV → A' },
        18: { v: 'Khi nói về thư phản hồi tự động.', t: ['Hopefully, if we like the sound of you, there will be in that automated response a list of times for an initial interview, which will take place by telephone during the following week.', 'You confirm by email which of the time slots will suit you.'], p: 'Thư phản hồi có danh sách giờ phỏng vấn đầu tiên, ứng viên xác nhận khung giờ = confirm initial interview → G' },
        19: { v: 'Sau buổi phỏng vấn.', t: 'Provided the interview is satisfactory, at that point, we’ll ask for any evidence of qualifications required, which might be your degree or diploma certificate or so on, which you have to send certified copies of, and we contact your referees.', p: 'Ứng viên gửi bản sao chứng thực bằng cấp; người tham chiếu do công ty tự liên hệ (bẫy B) → E' },
        20: { v: 'Bước cuối cùng.', t: 'The last thing you have to do is you come along and have a look round the International Finest Group head office, get to know some of our team in Human Resources face-to-face, and participate in a one-day recruitment seminar, which involves a number of group and individual activities along with other potential employees.', p: 'Bước cuối: tham dự buổi hội thảo tuyển dụng một ngày → D' },
      },
    },
    {
      part: 3, title: 'Designing a Roof Garden', audio: 'LISTENING/test 4/part 3.mp3', clip: [0, 443.5],
      cover: 'roof garden city | green roof plants', transcript: TX('t4p3'),
      groups: [
        multi('Choose TWO letters, A-E.', 21, 'Which TWO possible objections to a roof garden are discussed?',
          ['problems of access', 'the cost of construction', 'the time needed to install it', 'who will look after it', 'how to support the weight of it'], ['B', 'D'], 'Questions 21-22'),
        multi('Choose TWO letters, A-E.', 23, 'Which TWO recent developments in roof garden building are mentioned?',
          ['waterproof barrier materials', 'drainage systems', 'tank designs', 'lightweight construction materials', 'watering systems'], ['A', 'E'], 'Questions 23-24'),
        map('Label the diagram below.\nWrite the correct letter, A-H, next to Questions 25-30.', [
          [25, 'wall', 'F'], [26, 'electric wire', 'H'], [27, 'fibre optic cable', 'C'],
          [28, 'wooden post', 'D'], [29, 'glass cap', 'B'], [30, 'acrylic rod', 'A'],
        ], { img: 'img/t4p3_diagram.png' }, 'Questions 25-30'),
      ],
      expl: {
        21: { v: 'Khi tutor hỏi lợi ích cho khách hàng.', t: 'Why do you think a supermarket chain would be willing to meet the expense of construction?', p: 'Tutor nêu trước phản đối về chi phí xây dựng; sinh viên đáp sẽ hoàn vốn sau khoảng 5 năm → B' },
        22: { v: 'Khi tutor nói về chi phí bảo dưỡng.', t: ['But they might feel the expense of maintenance would be an issue.', 'After all, supermarkets don’t normally employ gardeners.'], p: 'Siêu thị không thuê người làm vườn → ai sẽ chăm sóc vườn; sinh viên đề xuất cộng đồng tự chăm. “Public access” là giải pháp, không phải phản đối (bẫy A) → D' },
        23: { v: 'Khi bàn vật liệu giữa tòa nhà và khu vườn.', t: ['You mean the barrier fabric, which ensures there’s no chance of rainwater leaking down into the building?', 'Nowadays that is very good and quite easily sourced.'], p: 'Lớp vải chống thấm ngày nay rất tốt, dễ mua = phát triển gần đây; hệ thống thoát nước đã được hiểu rõ từ lâu (bẫy B) → A' },
        24: { v: 'Khi sinh viên nói về hệ thống tưới.', t: ['What I’ve been looking at are some buildings which use fairly conventional storage tanks, the kind that have been in use for decades, but have them linked to modern automatic watering systems.', 'I’ve been researching them and actually the latest ones definitely work very well, and they can be electronically regulated to suit the local microclimate.'], p: 'Bồn chứa là loại thông thường hàng chục năm (bẫy C); mới là hệ thống tưới tự động hiện đại → E' },
        25: { v: 'Khi tutor xem bản vẽ.', t: ['You have this low wall on the right?', 'Yes, that’s it.'], p: 'Bức tường thấp nằm bên phải hình vẽ (khối có mái E phía trên) → F' },
        26: { v: 'Khi sinh viên mô tả dây điện.', t: 'And then the heavy-duty electric wiring comes up through the floor, just outside the planted area and into the wall.', p: 'Dây điện chạy lên từ dưới sàn, bên ngoài khu trồng cây rồi vào tường = đường dây H dưới đất bên phải → H' },
        27: { v: 'Khi tutor hỏi về cáp quang.', t: ['The fibre optic goes across the surface of the soil in the planting area?', 'Yes, that’s the beauty of it!'], p: 'Cáp quang chạy trên mặt đất trong khu trồng cây → C' },
        28: { v: 'Khi sinh viên nói về cột gỗ.', t: 'And then the cable goes past a wooden post, which is between the shrubs and can be a support for them as they grow bigger, and then runs up into each element of the installation.', p: 'Cột gỗ nằm giữa hai bụi cây → D' },
        29: { v: 'Khi tutor hỏi về phần phát sáng.', t: 'So the light beam is carried up to the top of each element and illuminates a kind of conical glass cap?', p: 'Chóp thủy tinh hình nón trên đỉnh mỗi bộ phận → B' },
        30: { v: 'Khi tutor hỏi chóp đặt trên gì.', t: 'No, it’s a slender acrylic rod, like the stem of a flower or mushroom, which the cable runs up inside of.', p: 'Thanh acrylic mảnh như thân hoa, đỡ chóp thủy tinh, cáp chạy bên trong → A' },
      },
    },
    {
      part: 4, title: 'The Argus System and Sand Collecting', audio: 'LISTENING/test 4/part 4.mp3',
      cover: 'beach sand closeup | coastal erosion beach', transcript: TX('t4p4'),
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'The Argus System', [
          '• Developed by Rob Holman in North Carolina with other researchers.',
          '• Research is vital for understanding __Q31__',
          '• Matches information from under the water with information from a __Q32__',
          '• According to S. Jeffress Williams, useful because it can make observations during __Q33__',
          '<strong>Dr Holman’s sand collection</strong>',
          '• Dr H. has samples from every __Q34__',
          '• Used in teaching students of __Q35__',
          '• E.g. US East Coast display – grains from the south are small, light coloured and __Q36__ in shape',
        ], { 31: 'beach erosion', 32: 'fixed camera / camera', 33: 'storm / a storm / storms', 34: 'continent', 35: 'geology', 36: 'rounded' }, 'Questions 31-36'),
        note('Complete the flow chart below.\nWrite NO MORE THAN THREE WORDS for each answer.', 'Taking samples when travelling', [
          'to dig sand, a plastic or metal __Q37__ is ideal → store in plastic bags → write date and place, using a __Q38__',
          '<strong>After reaching home</strong>',
          'log samples, noting location, including which part of beach → dry sample on __Q39__ → transfer to container → add at least one __Q40__ immediately',
        ], { 37: 'spoon', 38: 'permanent marker / marker', 39: 'newspaper / layers of newspaper', 40: 'identification label / label' }, 'Questions 37-40'),
      ],
      expl: {
        31: { v: 'Khi nói về nghiên cứu ở cầu tàu.', t: 'This research is critical to the study of beach erosion in places where the coastline is being worn away.', p: '“critical to the study of” = vital for understanding → beach erosion' },
        32: { v: 'Khi giải thích hệ thống Argus.', t: 'The system correlates the data from under the water with what Dr Holman gets from his fixed camera, which is mounted above the water on the pier and uses time–lapse photography.', p: '“correlates the data from under the water with” = matches information from under the water with → fixed camera' },
        33: { v: 'Khi trích lời S. Jeffress Williams.', t: 'A lot of these take place when there is a storm or at other times when it is difficult to have people out on the beach making observations and taking measurements.', p: 'Hệ thống quan sát được lúc có bão, khi con người khó ra bãi biển → storm' },
        34: { v: 'Khi nói về bộ sưu tập cát.', t: 'and the collection includes sand from each continent, including Antarctica.', p: '“sand from each continent” = samples from every continent → continent' },
        35: { v: 'Khi nói ai dùng bộ sưu tập.', t: 'Anyway, it\'s mainly geology students at the university who study his collection, and they can learn a lot from it.', p: 'Chủ yếu sinh viên địa chất nghiên cứu bộ sưu tập → geology' },
        36: { v: 'Khi nói về cát bờ Đông nước Mỹ.', t: 'it has been battered by waves for a long time so the grains are fine and rounded because most of the time sand is not stationary on the beach.', p: 'Hạt cát ở Florida (phía nam) nhỏ mịn và tròn → rounded' },
        37: { v: 'Khi nói dụng cụ lấy cát.', t: ['One really handy thing for digging sand, especially if it\'s hard or frozen, is a spoon.', 'If you\'re travelling by air it\'ll have to be plastic, but metal is preferable, as plastic tends to break.'], p: 'Dụng cụ đào cát tiện nhất là cái thìa (nhựa hoặc kim loại) → spoon' },
        38: { v: 'Khi nói ghi ngày và địa điểm.', t: 'so you must also have a permanent marker with you, because you can never assume you will remember where you gathered a sample from later on', p: 'Ghi địa điểm, ngày lên túi bằng bút dạ không xóa được → permanent marker' },
        39: { v: 'Khi nói cách làm khô mẫu.', t: 'You don\'t need any complicated apparatus for this, you can just air it out on layers of newspaper, which is suitably absorbent.', p: 'Phơi khô mẫu trên các lớp giấy báo thấm hút → newspaper' },
        40: { v: 'Bước cuối cùng.', t: 'you put it in a clean small bag or a jar, and you must stick an identification label on straight away.', p: '“straight away” = immediately; dán nhãn nhận dạng (có thể thêm một nhãn bên trong) → identification label' },
      },
    },
  ],
};
