// Vol 10 – Test 6 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 6 Listening": question paper PDF on a public Google
// Drive link + key + transcript). The test = "IELTS Recent Actual Tests 1 – Listening Test 4" (DOL AT1_L4_S1–S4, all clean, never
// imported): audio + speaker-labelled transcript taken from the cached DOL sections (web/vol10/dolprep.js → LISTENING/test 6/
// part N.mp3, specs/vol10_tx/t6pN.txt; P3 DOL cues repeated three lines + "Q30" markers → removed). Questions + key = the Vol
// paper (izone), checked against the transcript. The Vol paper differs from DOL's in places: Q26 options (key C = "when she
// was 35"), Q37–40 = letters A–G from a box (DOL: typed names).
const fs = require('fs'), path = require('path');
const { note, mc, multi, matching } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');

module.exports = {
  vol: 10, test: 6,
  sections: [
    {
      part: 1, title: 'Recycling Group Enquiry', audio: 'LISTENING/test 6/part 1.mp3', clip: [0, 418],
      cover: 'recycling bins | recycling boxes', transcript: TX('t6p1'),
      groups: [
        note('Complete the form below.\nWrite NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.', 'Gaea’s Guardians', [
          'Aim: protecting environment through recycling',
          'Type of group: non-profit',
          'Frequency of newspaper collection: __Q1__',
          'Name: __Q2__',
          'Address: __Q3__',
          'E-mail: __Q4__',
          'Postcode: __Q5__',
        ], { 1: 'every other week', 2: 'Peter Wisrough', 3: '168 Bridge Road / No. 168 Bridge Road', 4: 'helpline@blackcat.com', 5: 'BS97PU / BS9 7PU' }, 'Questions 1-5'),
        note('Complete the form below.\nWrite NO MORE THAN TWO WORDS for each answer.', 'Recycling', [
          '<strong>Ways of recycling</strong>',
          'Newspaper: in a __Q6__ box',
          '<strong>Nearest rubbish collection centre</strong>',
          'On the East Side of __Q7__',
          '<strong>Rubbish that can be recycled</strong>',
          'Blue box: __Q8__',
          'Green box: glass and plastics',
          'Yellow box: paper',
          '<strong>Rubbish that cannot be recycled</strong>',
          '__Q9__',
          '<strong>Name of a booklet</strong>',
          '__Q10__',
        ], { 6: 'yellow', 7: 'Central Park', 8: 'metal', 9: 'magazines', 10: 'Savvy' }, 'Questions 6-10'),
      ],
      expl: {
        1: { v: 'Khi người phụ nữ nói về lịch thu gom báo.', t: 'In fact, we only do pickups every other week.', p: 'Không thu gom báo hằng ngày, chỉ “every other week” (hai tuần một lần) → every other week' },
        2: { v: 'Khi người đàn ông cho tên và đánh vần họ.', t: ['Peter Wisrough.', 'No, actually it’s W-I-S-R-O-U-G-H.'], p: 'Người phụ nữ đoán W-I-S-R-O-W (bẫy), anh sửa lại W-I-S-R-O-U-G-H → Peter Wisrough' },
        3: { v: 'Khi được hỏi địa chỉ.', t: 'No. 168 Bridge Road.', p: 'Số nhà 168 đường Bridge Road, ở London → 168 Bridge Road' },
        4: { v: 'Khi người phụ nữ nói về cuốn sách nhỏ gửi kèm.', t: 'The booklet has our phone number and email address helpline@blackcat.com.', p: 'Địa chỉ email được đánh vần H-E-L-P-L-I-N-E at B-L-A-C-K-C-A-T dot com → helpline@blackcat.com' },
        5: { v: 'Khi được hỏi mã bưu chính.', t: ['BS97PU', 'No. That’s B as in “boy"-S-9-7-P as in “Peter”-U.'], p: 'Người phụ nữ nghe nhầm thành PS97BU (bẫy); anh đánh vần lại B-S-9-7-P-U → BS97PU' },
        6: { v: 'Khi người đàn ông hỏi về những chiếc hộp màu vàng.', t: ['So, I’m guessing those yellow boxes I saw are for recycled newspapers?', 'Yes, that is correct, and it’s free of charge.'], p: 'Hộp màu vàng đặt trước nhà dùng để đựng báo tái chế → yellow' },
        7: { v: 'Khi hỏi vị trí trung tâm thu gom.', t: 'It’s actually right on the East Side of Central Park', p: 'Trung tâm chính nằm ở phía Đông của Central Park → Central Park' },
        8: { v: 'Khi nói về các thùng màu ở trung tâm.', t: 'The blue is for metal, the green is for glass and plastics, and the yellow of course is for paper.', p: 'Thùng xanh dương (blue) đựng kim loại → metal' },
        9: { v: 'Khi người đàn ông hỏi bỏ tạp chí vào thùng nào.', t: 'Unfortunately, magazines can’t be recycled because of the material they’re made of.', p: 'Tạp chí không tái chế được vì chất liệu làm ra chúng → magazines' },
        10: { v: 'Khi người phụ nữ nói sẽ gửi cuốn sách nhỏ.', t: 'I’ll be sending you our booklet, “Savvy”, that is S-A-double V-Y.', p: 'Tên cuốn sách được đánh vần S-A-double V-Y → Savvy' },
      },
    },
    {
      part: 2, title: 'CV and Interview Skills Seminar', audio: 'LISTENING/test 6/part 2.mp3', clip: [0, 402],
      cover: 'job interview | writing a CV', transcript: TX('t6p2'),
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN THREE WORDS for each answer.', '‘CV and Interview Skills’ Seminar', [
          'The speaker suggests that the students use the __Q11__ when they begin writing résumés.',
          'The students should be sure not to keep the CV __Q12__.',
          'A __Q13__ cover letter is useful when applying for a job and should be included.',
          'The speaker believes the CV should have a beautiful __Q14__.',
          'The CV should not have any spelling and grammar __Q15__.',
          'The words in a CV can describe your __Q16__.',
          'Don’t forget to put down a __Q17__ on the CV.',
        ], { 11: 'Internet', 12: 'too long', 13: 'typed', 14: 'layout', 15: 'errors', 16: 'skills and experiences', 17: 'contact number' }, 'Questions 11-17'),
        multi('Choose THREE letters, A-G.', 18, 'What THREE details should job applicants know in the interview?',
          ['Working hours', 'Promotion prospect', 'Salary range', 'Pension contribution bonus', 'Training', 'Holidays', 'Location'], ['C', 'E', 'F'], 'Questions 18-20'),
      ],
      expl: {
        11: { v: 'Đầu bài, khi nói về cách viết CV.', t: 'But let me tell you that there are dozens of great websites on the Internet. These will give you all the suggestions you need.', p: 'Có hàng chục trang web hay trên Internet cho mọi gợi ý cần thiết khi bắt đầu viết CV → Internet' },
        12: { v: 'Khi nêu điểm quan trọng đầu tiên.', t: 'One is that your CV or resume should not be too long.', p: '“should not be too long” = sure not to keep the CV … → too long' },
        13: { v: 'Khi nói về thư xin việc.', t: 'Also, when you send that CV, be sure to include a typed cover letter.', p: 'Phải gửi kèm thư xin việc đánh máy; công ty chỉ đọc thư đánh máy → typed' },
        14: { v: 'Khi nói về hình thức CV.', t: 'Another point about CVs is you should try to have an attractive layout.', p: '“attractive layout” = beautiful … → layout' },
        15: { v: 'Ngay sau phần bố cục.', t: 'Whatever layout you decide to use, however, avoid all spelling and grammar errors.', p: '“avoid all spelling and grammar errors” → errors' },
        16: { v: 'Khi nói nội dung nên viết trong CV.', t: 'Something you write in a CV is a description of your skills and experiences in an interesting way.', p: 'CV mô tả kỹ năng và kinh nghiệm một cách hấp dẫn → skills and experiences' },
        17: { v: 'Khi nói lỗi hay gặp cuối cùng.', t: 'But some people actually forget to provide a contact number.', p: 'Nhiều người quên ghi số liên lạc → contact number' },
        18: { v: 'Khi nói về những điều cần biết trong buổi phỏng vấn.', t: 'It is important, however, to get a feel for how much you’ll be paid.', p: 'Giờ làm việc và thăng tiến có thể tìm hiểu sau (bẫy A, B); phải nắm mức lương; lương hưu chưa quan trọng (bẫy D) → C' },
        19: { v: 'Khi nói về đào tạo.', t: 'In addition, if the company will provide training, you should find out how long the training period is and whether it is paid.', p: 'Cần tìm hiểu thời gian đào tạo và có được trả lương khi đào tạo không → E' },
        20: { v: 'Khi nói về chế độ nghỉ.', t: 'Speaking of compensation, find out about holidays as well.', p: 'Cần hỏi về ngày nghỉ, nghỉ phép có lương; địa điểm để sau (bẫy G) → F' },
      },
    },
    {
      part: 3, title: 'A Consultation with the Returning Students Advisor', audio: 'LISTENING/test 6/part 3.mp3', clip: [0, 454],
      cover: 'university advisor meeting | mature student', transcript: TX('t6p3'),
      groups: [
        mc('Choose the correct letter, A, B or C.', [
          [21, 'What does the man want to have?', ['A break', 'A talk', 'A class'], 'B'],
          [22, 'What does the man think of children nowadays?', ['Confident', 'Intelligent', 'Mature'], 'A'],
          [23, 'What type of people does the man want to teach?', ['Children', 'Students', 'Adults'], 'C'],
          [24, 'What did the man do when he encountered former students?', ['Had a conversation', 'Ran away', 'Taught them'], 'A'],
          [25, 'What is the man’s greatest weakness?', ['Being old-fashioned', 'Lack of confidence', 'Being introverted'], 'A'],
          [26, 'When did Doctor Lindsey go to college?', ['18 years ago', 'Before starting a family', 'When she was 35 years old'], 'C'],
          [27, 'How did the woman feel when she was a freshman?', ['Hopeless', 'Unsuccessful', 'Stressed'], 'C'],
          [28, 'How does the man feel about his career?', ['Unique', 'Boring', 'Impressive'], 'B'],
          [29, 'What does the man finally decide to study?', ['Languages', 'Business', 'Liberal Arts'], 'C'],
          [30, 'Which change in students’ life is NOT important to Frank?', ['Classroom technology', 'Student housing', 'University facilities'], 'B'],
        ], 'Questions 21-30'),
      ],
      expl: {
        21: { v: 'Đầu cuộc nói chuyện.', t: 'I understand you wanted to have a chat about what you should study if and when you return for further classes.', p: 'Frank đến để nói chuyện (“have a chat”) về việc học gì khi quay lại trường → B' },
        22: { v: 'Khi Frank nói về học sinh ngày nay.', t: 'In the schools I taught, I found today’s youngsters are very sure of themselves.', p: '“very sure of themselves” = tự tin; về trí tuệ và độ trưởng thành thì anh chê (bẫy B, C) → A' },
        23: { v: 'Khi được hỏi muốn học gì.', t: 'You see, I’ve been teaching children for a few years, but I think I’d be happier teaching adults.', p: 'Đã dạy trẻ em (bẫy A) nhưng muốn dạy người lớn → C' },
        24: { v: 'Khi Frank kể lý do muốn dạy người lớn.', t: 'Fairly often now I run into former students and we talk.', p: '“run into” = encountered; “we talk” = had a conversation → A' },
        25: { v: 'Khi được hỏi điểm yếu lớn nhất.', t: 'To tell the truth, I’m afraid I’m rather behind the times about many things.', p: 'Sự tự tin đang khá hơn, đang vượt qua tính hướng nội (bẫy B, C); “behind the times” = lạc hậu = old-fashioned → A' },
        26: { v: 'Khi Dr Lindsey kể về bản thân.', t: ['How old are you, 35? People at your age still go back to school for further education. I was a bit the same way.', 'I mean I didn’t study at the university till after I had a family: a husband and one child.'], p: 'Bà cũng như Frank, đi học đại học ở tuổi khoảng 35, sau khi đã có gia đình (B sai); “eighteen-year-old” chỉ là so sánh (bẫy A) → C' },
        27: { v: 'Khi Dr Lindsey nói về năm đầu đại học.', t: 'My first term at school was extremely stressful.', p: 'Học kỳ đầu rất căng thẳng; “unsuccessful” là Frank nói bà không thất bại (bẫy B) → C' },
        28: { v: 'Khi được hỏi có điều gì đặc biệt.', t: 'There is nothing interesting about my career or plans. It’s really not too impressive.', p: 'Frank cho rằng sự nghiệp không có gì thú vị = nhàm chán → B' },
        29: { v: 'Khi Frank nói về ngành muốn học.', t: 'but I made up my mind to study Liberal Arts once I got the idea of going back to school.', p: 'Từng thích Ngôn ngữ và Văn học, được khuyên học Quản trị kinh doanh (bẫy A, B), nhưng quyết định học Liberal Arts → C' },
        30: { v: 'Khi Dr Lindsey nói về các thay đổi.', t: 'Let\'s see, I doubt you’ll be living in student housing, so I won’t go into all the improvements there.', p: 'Frank sẽ không ở ký túc xá nên thay đổi về nhà ở sinh viên không quan trọng với anh → B' },
      },
    },
    {
      part: 4, title: 'Orientation at Wassamatta University', audio: 'LISTENING/test 6/part 4.mp3', clip: [0, 397],
      cover: 'university campus buildings | university library', transcript: TX('t6p4'),
      groups: [
        note('Complete the sentences below.\nWrite NO MORE THAN THREE WORDS for each answer.', '', [
          'The university uses __Q31__ as their teaching method.',
          'Research skills include writing and __Q32__.',
          'Books of Economics are kept in the __Q33__.',
          'Maths books are kept in the __Q34__ Building.',
        ], { 31: 'modules technology', 32: 'finding a job', 33: 'old library', 34: 'Maths Department' }, 'Questions 31-34'),
        mc('Choose the correct letter, A, B or C.', [
          [35, 'Which is NOT provided for students in most of the large buildings?', ['Printing', 'Photocopying', 'Typing'], 'B'],
          [36, 'Which of the following can be used when you want to print?', ['Computer printers', 'Prepaid cards', 'Laser printers'], 'C'],
        ], 'Questions 35-36'),
        matching('Choose FOUR answers from the box and write the correct letter, A-G, next to Questions 37-40.',
          ['Student Union Building', 'Nursery', 'Media Centre', 'Medical Services Centre', 'Maths Department Building', 'new library', 'old library'], [
            [37, 'If you go straight out those doors, the … is directly opposite this building.', 'B'],
            [38, 'If you make a right turn outside the door and go to the second building, that’s the …', 'D'],
            [39, 'You can see the … if you look out of that window.', 'C'],
            [40, 'The Media Centre is in front of the …', 'F'],
          ], { groupTitle: 'Questions 37-40' }),
      ],
      expl: {
        31: { v: 'Câu hỏi đầu tiên sau giờ nghỉ.', t: 'The first question is whether Wassamatta U. employs modules technology as an instruction method.', p: '“employs … as an instruction method” = uses … as their teaching method, và câu trả lời là có → modules technology' },
        32: { v: 'Khi nói về hội thảo kỹ năng nghiên cứu.', t: 'Writing English - the native language for most of you - and finding a job are also research skills.', p: 'Viết tiếng Anh và tìm việc cũng là kỹ năng nghiên cứu → finding a job' },
        33: { v: 'Khi nói nơi để sách kinh tế.', t: 'Economics books are in the old library.', p: 'Sách kinh tế nằm ở thư viện cũ (tòa gạch đỏ) → old library' },
        34: { v: 'Khi nói về sách toán.', t: 'They can be found in the Maths Department Building.', p: 'Sách toán không ở thư viện cũ hay mới mà ở tòa nhà Khoa Toán → Maths Department' },
        35: { v: 'Khi nói nơi sinh viên có thể sao chụp.', t: 'So most of the large buildings you see around campus do not have copiers for students.', p: 'Phần lớn các tòa nhà lớn không có máy photocopy cho sinh viên → B' },
        36: { v: 'Khi nói về in ấn.', t: 'If you need to have printing done, all the copiers available to students are laser printers.', p: 'Khi cần in, sinh viên dùng máy in laser; thẻ trả trước là cách trả tiền (bẫy B), không mang máy in nhà theo (bẫy A) → C' },
        37: { v: 'Khi nói về nhà trẻ.', t: 'If you go out of the building, you can see the Nursery is just on the other side of this building.', p: 'Ra khỏi cửa lớn là thấy nhà trẻ ngay bên kia tòa nhà → B' },
        38: { v: 'Khi nói về chỗ khám bệnh.', t: 'Of course, you need to find the Medical Services Centre which is on the right as you leave the building. Remember, that’s the second building on the right.', p: 'Rẽ phải, tòa nhà thứ hai là Trung tâm Dịch vụ Y tế → D' },
        39: { v: 'Khi chỉ ra cửa sổ.', t: 'And if you look out of that window, you can see a lot of antennae and satellite dishes on the roof. So that\'s where we call the Media Centre', p: 'Nhìn qua cửa sổ thấy tòa có nhiều ăng-ten, chảo vệ tinh = Media Centre → C' },
        40: { v: 'Khi chỉ tòa nhà phía sau.', t: ['Oh, can you see the back building there? Yes, behind the Media Centre.', 'That’s the new library, just decorated.'], p: 'Thư viện mới ở phía sau Media Centre → Media Centre ở phía trước thư viện mới; thư viện cũ ở bên trái (bẫy G) → F' },
      },
    },
  ],
};
