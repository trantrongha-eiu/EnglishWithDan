// Vol 2 – Test 8 (PDF "listening/test 8/Test 8.pdf" p1–6, key p7; audio test 8/part 1–4; P4 transcript
// "section 4- test 8- trans.pdf" — the folder's p1/P2/P3.pdf belong to Test 1/Test 6).
// P1–P3 are already in the bank (same keys 10/10, bank đề lẻ outside any Vol test): P1 = "Joining a wildlife
// conservation society" (also in Actual Test 8), P2 = "Moving Office", P3 = "The artist Samuel Prout" (both in
// Actual Test 11) → reused. Only P4 (SW40 solar water purifier) is new.
// Transcript P4: Whisper + Otter merge; the angle is "12.5 degrees" (wb.js + Otter; Whisper heard "12").
const { short, map } = require('../vol_build');

module.exports = {
  vol: 2, test: 8,
  sections: [
    { part: 1, reuse: '6a53a9085c459ab074ce322a', title: 'Joining a wildlife conservation society', audio: 'listening/test 8/part 1.mp3' },
    { part: 2, reuse: '6a53d6c95c459ab074ceb86a', title: 'Moving Office', audio: 'listening/test 8/part 2.m4a' },
    { part: 3, reuse: '6a53d9035c459ab074cec0ca', title: 'The artist Samuel Prout', audio: 'listening/test 8/part 3.m4a' },
    {
      part: 4, title: 'The SW40 Solar Water Purifier', audio: 'listening/test 8/part 4.mp3', cover: 'solar still water purifier | clean drinking water village',
      fix: [
        ['For many\nParts of the world', 'For many parts of the world'], ['injection-motive process', 'injection-moulding process'],
        ['around AU$1 million.\nAustralian dollars.', 'around 1 million Australian dollars.'],
        ['The optimum is 12 degrees', 'The optimum is 12.5 degrees'], ['\nNow, what this means... is.', ''],
      ],
      groups: [
        short('Complete the sentences below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.\nSolar water purifier (SW40)', [
          [31, 'High levels of ______ make bore water unsafe to drink.', 'salts/salt'],
          [32, 'The SW40 produces water that is so pure it can be used in ______', 'hospitals'],
          [33, 'One problem with the present method of production of the SW40 is that it is quite ______', 'slow'],
          [34, 'The speaker hopes to acquire financial support from an agency called ______', 'Health International'],
          [35, 'The SW40 has a maximum output of ______ litres on a sunny day.', '9/nine'],
          [36, 'Each SW40 produces enough water for a ______', 'family'],
        ], 'Questions 31-36'),
        map('Label the diagram below.\nWrite NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', [
          [37, 'lid made of ______', 'glass'], [38, 'best inclined at angle ______ °', '12.5'], [39, 'UV light destroys ______', 'germs'], [40, 'water ______ containing pure water', 'collection tank'],
        ], { page: 6, box: [135, 155, 465, 535] }, 'Questions 37-40'),
      ],
      expl: {
        31: { v: 'Đầu bài, khi nói về nước giếng khoan.', t: 'Unfortunately, bore water may be dangerous to drink because it contains excessive amounts of salts.', p: 'Nước giếng khoan chứa quá nhiều muối nên không an toàn → salts' },
        32: { v: 'Khi nói về độ tinh khiết của nước.', t: 'In fact, it even passed the rigorous testing standards applied by hospitals to determine whether water is sterile enough for use there.', p: 'Nước đạt tiêu chuẩn vô trùng của bệnh viện → hospitals' },
        33: { v: 'Khi nói về vấn đề sản xuất.', t: 'The present method involves a process called vacuum forming, which tends to be rather slow.', p: 'Phương pháp hiện tại (tạo hình chân không) khá chậm; phương pháp mới nhanh hơn nhưng đắt → slow' },
        34: { v: 'Khi nói về nguồn tài trợ.', t: 'but my preferred option would be a global aid agency known as Health International, that sponsors projects like ours.', p: 'Các công ty tư nhân là phương án khác (bẫy); người nói muốn tổ chức Health International → Health International' },
        35: { v: 'Khi nói về lượng nước tạo ra.', t: 'it produces anywhere from 7 litres per day to as much as 9 litres.', p: '7 lít là mức thấp nhất, 1–2 lít là nhu cầu một người (bẫy); tối đa 9 lít → 9' },
        36: { v: 'Ngay sau đó.', t: 'So even under difficult conditions, one family could live off one of these devices.', p: 'Một máy đủ nước cho một gia đình; cả làng cần nhiều máy (bẫy) → family' },
        37: { v: 'Phần mô tả cấu tạo.', t: "Well, there's a rectangular box with a glass lid on it.", p: 'Hộp chữ nhật có nắp bằng kính; khung là thép (bẫy) → glass' },
        38: { v: 'Khi nói về độ nghiêng.', t: 'The optimum is 12.5 degrees to the horizontal, although it can be 1 or 2 degrees above or below that.', p: 'Góc tối ưu là 12,5 độ; 1–2 độ chỉ là sai số cho phép → 12.5' },
        39: { v: 'Khi nói về tia UV.', t: 'If there are germs present in the water, prolonged exposure to this type of light will kill them.', p: 'Tia UV tiêu diệt vi trùng trong nước → germs' },
        40: { v: 'Cuối bài, nước sạch được thu lại.', t: 'The droplets of water slowly run down the glass to a collection tank, ready to be taken away for drinking or whatever.', p: 'Giọt nước chảy xuống bể thu gom → collection tank' },
      },
    },
  ],
};
