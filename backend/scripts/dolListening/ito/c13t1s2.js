// Cambridge IELTS 13 - Test 1 - Section 2 (not on DOL). Source: ieltstrainingonline.com practice-cam-13-listening-test-01 (questions,
// key, map image Cam-13-Test-1-Q14-20.jpg) + audio-script page. Source typos fixed: "the flow or traffic", "We’re decided".
const { mc, map } = require('../../volListening/vol_build');
module.exports = {
  book: 13, test: 1, part: 2, title: 'Traffic Changes in Granford',
  fix: [['the flow or traffic', 'the flow of traffic'], ['We’re decided we definitely', 'We’ve decided we definitely']],
  map: { group: 1, file: 'web/ito/c13t1_map.jpg' },
  groups: [
    mc('Choose the correct letter, A, B or C.', [
      [11, 'Why are changes needed to traffic systems in Granford?', ['The number of traffic accidents has risen.', 'The amount of traffic on the roads has increased.', 'The types of vehicles on the roads have changed.'], 'B'],
      [12, 'In a survey, local residents particularly complained about', ['dangerous driving by parents.', 'pollution from trucks and lorries.', 'inconvenience from parked cars.'], 'C'],
      [13, 'According to the speaker, one problem with the new regulations will be', ['raising money to pay for them.', 'finding a way to make people follow them.', 'getting the support of the police.'], 'B'],
    ], 'Questions 11–13'),
    map('Label the map below.\nWrite the correct letter, A–I, next to Questions 14–20.\nProposed traffic changes in Granford', [
      [14, 'New traffic lights', 'E'], [15, 'Pedestrian crossing', 'D'], [16, 'Parking allowed', 'B'], [17, 'New ‘No Parking’ sign', 'G'],
      [18, 'New disabled parking spaces', 'C'], [19, 'Widened pavement', 'H'], [20, 'Lorry loading/unloading restrictions', 'I'],
    ], null, 'Questions 14–20'),
  ],
  expl: {
    11: { v: 'Khi Phil giải thích vì sao cần thay đổi giao thông.', t: 'it’s the overall rise in the volume of traffic of all kinds that’s concerning us',
      p: '“rise in the volume of traffic” = lượng xe tăng; tai nạn thì “not been any increase” (A sai); xe tải nặng chỉ là ví dụ (C sai) → B' },
    12: { v: 'Khi nói về kết quả khảo sát cư dân.', t: 'People were very concerned about the lack of visibility on some roads due to cars parked along the sides of the roads.',
      p: 'Cư dân phàn nàn nhất về xe đỗ dọc đường che tầm nhìn; ùn tắc trước trường và khói xe tải “wasn’t top of the list” → C' },
    13: { v: 'Cuối phần đầu, khi nói về khó khăn còn lại.', t: 'it’s no good introducing new regulations if we don’t have a way of making sure that everyone obeys them',
      p: '“making sure that everyone obeys them” = make people follow them; ngân sách đã đủ (A sai), cảnh sát đang hỗ trợ (C sai) → B' },
    14: { v: 'Bản đồ – đèn giao thông mới.', t: 'we’re planning to have another set at the other end, at the School Road junction',
      p: 'Đèn mới ở đầu kia High Street, chỗ giao với School Road → E' },
    15: { v: 'Bản đồ – vạch qua đường cho người đi bộ.', t: 'we decided to locate it on the High Street, crossing the road in front of the supermarket',
      p: 'Trên High Street, trước siêu thị (không đặt ở School Road trước trường) → D' },
    16: { v: 'Bản đồ – chỗ được phép đỗ xe.', t: 'At present, parking isn’t allowed on the High Street outside the library, but we’re going to change that, and allow parking there',
      p: 'Cho phép đỗ xe trên High Street trước thư viện → B' },
    17: { v: 'Bản đồ – biển “Cấm đỗ xe” mới.', t: 'There’ll be a new ‘No Parking’ sign on School Road, just by the entrance to the school',
      p: 'Ngay cạnh lối vào trường trên School Road → G' },
    18: { v: 'Bản đồ – chỗ đỗ xe mới cho người khuyết tật.', t: 'we’ve got two new disabled parking spaces on the side road up towards the bank',
      p: 'Trên con đường nhánh dẫn lên ngân hàng → C' },
    19: { v: 'Bản đồ – vỉa hè được mở rộng.', t: 'We think we can manage to get an extra half-metre on the bend just before you get to the school, on the same side of the road.',
      p: 'Ở khúc cua ngay trước trường, cùng phía với trường trên School Road → H' },
    20: { v: 'Bản đồ – hạn chế xe tải bốc dỡ hàng.', t: 'That’s the supermarket on School Road',
      p: 'Áp dụng cho siêu thị trên School Road, không phải siêu thị High Street → I' },
  },
};
