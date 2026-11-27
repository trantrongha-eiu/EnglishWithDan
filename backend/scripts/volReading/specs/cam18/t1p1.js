// Cambridge IELTS 18 - Test 1 - Passage 1. Source: ieltsworldly.com, checked against the book key. Text fix: lost € signs ("€100 to €150").
const { notes, table, tfng } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 1, part: 1, title: 'Urban farming', text: 't1p1.txt', lettered: false,
  free: ['1000 kg', '1000kg', '1,000kg', 'flavor', 'food consumption'],
  groups: [
    notes(1, 3, [
      'Vertical tubes are used to grow strawberries, __Q1__ and herbs.',
      'There will eventually be a daily harvest of as much as __Q2__ in weight of fruit and vegetables.',
      'It may be possible that the farm’s produce will account for as much as 10% of the city’s __Q3__ overall.',
    ], { title: 'Urban farming in Paris', instruction: 'Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer. Write your answers in boxes 1–3 on your answer sheet.' }),
    table(4, 7, ['', 'Growth', 'Selection', 'Sale'], [
      ['Intensive farming', '• wide range of __Q4__ used<br>• techniques pollute air', '• quality not good<br>• varieties of fruit and vegetables chosen that can survive long __Q5__', '• __Q6__ receive very little of overall income'],
      ['Aeroponic urban farming', '• no soil used<br>• nutrients added to water, which is recycled', '• produce chosen because of its __Q7__', '• produce sold __locally__'],
    ], { instruction: 'Complete the table below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 4–7 on your answer sheet.' }),
    tfng(8, [
      'Urban farming can take place above or below ground.',
      'Some of the equipment used in aeroponic farming can be made by hand.',
      'Urban farming relies more on electricity than some other types of farming.',
      'Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.',
      'Most produce can be grown on an aeroponic urban farm at any time of the year.',
      'Beans take longer to grow on an urban farm than other vegetables.',
    ]),
  ],
  key: { 1: 'lettuces', 2: '1,000 kg/1000 kg/1000kg/1,000kg', 3: 'consumption/food consumption', 4: 'pesticides', 5: 'journeys', 6: 'producers', 7: 'flavour/flavor',
    8: 'TRUE', 9: 'NOT GIVEN', 10: 'FALSE', 11: 'TRUE', 12: 'FALSE', 13: 'NOT GIVEN' },
  expl: {
    1: ['Các ống thẳng đứng dùng để trồng dâu tây, ___ và rau thơm.', 'Đoạn 2', '“From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs”', 'Ống thẳng đứng trồng dâu tây, xà lách và rau thơm → lettuces'],
    2: ['Cuối cùng mỗi ngày sẽ thu hoạch tới ___ rau quả.', 'Đoạn 4', '“20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day.”', '“up to” = as much as; 1.000 kg mỗi ngày → 1,000 kg'],
    3: ['Sản lượng có thể chiếm tới 10% ___ của thành phố.', 'Đoạn 4', '“there’s no reason why you shouldn’t eventually target maybe between 5% and 10% of consumption.”', 'Từ 5% đến 10% lượng tiêu thụ → consumption'],
    4: ['Canh tác thâm canh: dùng nhiều loại ___.', 'Đoạn 5', '“most of the fruit and vegetables we eat have been treated with something like 17 different pesticides”', '17 loại thuốc trừ sâu = wide range → pesticides'],
    5: ['Chọn giống rau quả chịu được những ___ dài.', 'Đoạn 5', '“because the varieties are selected for their capacity to withstand such substantial journeys”', '“withstand” = survive; những chuyến vận chuyển dài → journeys'],
    6: ['___ nhận được rất ít trong tổng thu nhập.', 'Đoạn 5', '“80% of the price I pay goes to wholesalers and transport companies, not the producers.”', 'Người sản xuất nhận rất ít → producers'],
    7: ['Canh tác khí canh: chọn nông sản vì ___ của nó.', 'Đoạn 6', '“You can select crop varieties for their flavour, not their resistance to the transport and storage chain”', 'Chọn giống theo hương vị → flavour'],
    8: ['Canh tác đô thị có thể diễn ra trên mặt đất hoặc dưới mặt đất.', 'Đoạn 7', '“Strawberries are being grown in disused shipping containers, mushrooms in underground carparks.”', 'Trên mái nhà và trong bãi đỗ xe ngầm → TRUE'],
    9: ['Một số thiết bị khí canh có thể làm thủ công.', 'Đoạn 7', '“The equipment weighs little, can be installed on almost any flat surface and is cheap to buy”', 'Chỉ nói nhẹ, dễ lắp, rẻ; không nói tự làm bằng tay → NOT GIVEN'],
    10: ['Canh tác đô thị tốn điện hơn một số loại canh tác khác.', 'Đoạn 7', '“consuming a tiny fraction of the electricity used by some techniques.”', 'Tiêu thụ một phần rất nhỏ lượng điện → FALSE'],
    11: ['Rau quả trồng khí canh rẻ hơn nông sản hữu cơ trồng truyền thống.', 'Đoạn 8', '“are lower than soil-based organic growers.”', 'Giá thấp hơn của người trồng hữu cơ trên đất → TRUE'],
    12: ['Hầu hết nông sản có thể trồng khí canh quanh năm.', 'Đoạn 8', '“much of the produce is suited to the summer months.”', 'Phần lớn hợp với mùa hè, không phải quanh năm → FALSE'],
    13: ['Đậu mọc lâu hơn các loại rau khác ở trang trại đô thị.', 'Đoạn 8', '“And beans tend to take up a lot of space for not much return.”', 'Chỉ nói đậu tốn chỗ mà thu ít; không nói thời gian sinh trưởng → NOT GIVEN'],
  },
};
