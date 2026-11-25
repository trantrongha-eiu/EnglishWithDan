// Vol 10 – Test 8 (source: izone.edu.vn "Giải chi tiết đề VOL 10 – Test 8 Listening": question paper PDF on a public Google
// Drive link + key + transcript). Only P1 has a recording we can use: "House Rental" = IELTS Recent Actual Tests 3 – Listening
// Test 6 Section 1 (DOL AT3_L6_S1; also terratern Practice Test 68 Section 1). Audio + speaker-labelled transcript from the cached
// DOL section (web/vol10/dolprep.js; "big Q3 garage" marker, "cany" → carry, ligatures fixed). P2 (Home Features and Buying
// Advice) and P4 (History of Paint): no audio found (terratern / ieltspracticeonline / DOL, 2026-11-25); P3 = the bank's
// "Choosing an Internship" (transcript 68 %) → no full test yet. Key = izone, checked against the transcript.
const fs = require('fs'), path = require('path');
const { note } = require('../vol_build');
const TX = id => fs.readFileSync(path.join(__dirname, 'vol10_tx', `${id}.txt`), 'utf8');

module.exports = {
  vol: 10, test: 8,
  sections: [
    {
      part: 1, title: 'House Rental Inquiry', audio: 'LISTENING/test 8/part 1.mp3', clip: [0, 442],
      cover: 'house with swimming pool | family house garden', transcript: TX('t8p1'),
      groups: [
        note('Complete the notes below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', 'House Rental Inquiry', [
          'Name: Mary Collins',
          'Facility available: __Q1__ pool',
          'General layout:',
          '• upstairs: living room, bedrooms',
          '• downstairs: __Q2__',
          'Car park: availability of a large __Q3__',
          'Shopping: at the __Q4__',
          'Place for children playing: __Q5__',
          'Education resources: a __Q6__ in the community',
          'Rent: $980 a month (including the maintenance fees of the __Q7__)',
          'Date of house available: __Q8__',
          'Viewing arrangement (time): meet at __Q9__',
          'Postcode: GA58ER',
          'Address: 8 __Q10__',
        ], { 1: 'swimming', 2: 'dining room / the dining room', 3: 'garage', 4: 'local supermarket / supermarket', 5: 'park / a park', 6: 'primary school', 7: 'garden', 8: '23 April / 23rd April / April 23 / April 23rd', 9: '10.15 / 10:15 / 10.15 am', 10: 'Spring Street' }, 'Questions 1-10'),
      ],
      expl: {
        1: { v: 'Khi Mary hỏi nhà có phòng gym không.', t: 'No, the house doesn’t have a gym, however the house has a large swimming pool', p: 'Không có phòng gym (bẫy) nhưng có hồ bơi lớn → swimming' },
        2: { v: 'Khi hỏi bố cục ngôi nhà.', t: 'the living room is located upstairs with the bedrooms, and downstairs at ground floor is the dining room', p: 'Tầng trên là phòng khách và phòng ngủ, tầng dưới là phòng ăn → dining room' },
        3: { v: 'Khi hỏi chỗ đỗ xe trên phố.', t: 'The house comes with a big garage where you can park your cars and there’s also a lot of room for storage.', p: 'Không cần đỗ ngoài phố (bẫy) vì nhà có gara lớn; “big” = large → garage' },
        4: { v: 'Khi nói về việc mua sắm.', t: 'You actually don’t even need to take your car to do the shopping as the local supermarket is just down the street.', p: 'Siêu thị gần nhà, đi bộ được → local supermarket' },
        5: { v: 'Khi Mary hỏi chỗ cho con chơi.', t: 'Unfortunately there aren’t any playgrounds nearby, but there is a park near the supermarket that would be great for taking your children for a walk.', p: 'Không có sân chơi (bẫy), có công viên gần siêu thị → park' },
        6: { v: 'Khi nói về trường học.', t: 'The community has its own primary school and there is a secondary school in the neighbouring community', p: 'Trường trung học ở khu bên cạnh (bẫy); trong khu có trường tiểu học → primary school' },
        7: { v: 'Khi hỏi giá thuê gồm những gì.', t: 'The bills are not included in that figure, but it does include any maintenance fees for the garden.', p: 'Tiền thuê không gồm hóa đơn (bẫy) nhưng gồm phí bảo dưỡng khu vườn → garden' },
        8: { v: 'Khi hỏi ngày dọn vào.', t: 'This would make the house officially available on the 23rd April.', p: 'Người thuê cũ đi ngày 20 (bẫy), cần vài ngày dọn dẹp, chính thức trống ngày 23/4 → 23 April' },
        9: { v: 'Khi hẹn giờ xem nhà.', t: ['I have available appointments at 10.15 and 3.', 'OK, in that case can we schedule the appointment for 10.15?'], p: '1 giờ trưa không được vì người môi giới họp lúc 12.30 (bẫy); chọn 10.15 → 10.15' },
        10: { v: 'Khi hỏi địa chỉ.', t: 'The postcode is GA58ER and the house is number 8 on Spring Street.', p: 'Nhà số 8 đường Spring; Bath Street chỉ là đường để rẽ vào (bẫy) → Spring Street' },
      },
    },
  ],
};
