// Vol 3 - Test 2 - Reading Passage 2 (PDF p6–8). Not in the bank. mini-ielts 1369 has the same text but drops paragraph G
// (European Commission / developing world) and swaps Q19 for another item — the Vol PDF has all nine paragraphs A–I and the
// original Q19, so text + questions = PDF. Figure 1 (two house drawings, day / night) is given as its caption; no question uses
// it. Fixes: "sitting of … experiment stations'" → siting of 'residential experiment stations'; "homes. Each equipped" → ", each
// equipped"; "maybe stipulated" → may be. Key = explain file except Q16: printed "16 D" but the evidence it quotes is paragraph H
// ("This is good news… The use of fossil fuels… environmental damage") → H (D is the Rokko Island experiment = Q15).
// Checked against the passage: all correct.
const { matching, tfng } = require('../../vr_build');
module.exports = {
  vol: 3, test: 2, part: 2, title: 'Photovoltaics on the rooftop', text: 't2p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'], [
      'examples of countries where electricity use is greater during the day than at night',
      'a detailed description of an experiment that led to photovoltaics being promoted throughout the country',
      'the negative effects of using conventional means of generating electricity',
      'an explanation of the photovoltaics system',
      'the long-term benefits of using photovoltaics',
      'a reference to wealthy countries being prepared to help less wealthy countries have access to photovoltaics',
    ], { reuse: true, instruction: 'Reading Passage 2 has nine paragraphs, A–I. Which paragraph contains the following information? Write the correct letter, A–I, in boxes 14–19 on your answer sheet. NB You may use any letter more than once.' }),
    tfng(20, [
      'Photovoltaics are used to store electricity.',
      'Since the 1970s, the US government has provided continuous support for the use of photovoltaics on homes.',
      'The solar-powered houses on Rokko Island are uninhabited.',
      'In 1994, the Japanese government was providing half the money required for installing photovoltaics on homes.',
      'Germany, Italy, the Netherlands and Australia all have strict goals with regard to greenhouse gas emissions.',
      'Residential electricity use is the major source of greenhouse gas emission.',
      'Energy-saving measures must now be included in the design of all new homes and improvements to buildings.',
    ]),
  ],
  key: { 14: 'B', 15: 'D', 16: 'H', 17: 'B', 18: 'I', 19: 'G', 20: 'FALSE', 21: 'FALSE', 22: 'TRUE', 23: 'TRUE', 24: 'NOT GIVEN',
    25: 'NOT GIVEN', 26: 'FALSE' },
  expl: {
    14: ['Ví dụ về những nước dùng điện ban ngày nhiều hơn ban đêm.', 'Đoạn B',
      '“This occurs in places like California in the US and Japan, where air-conditioning loads for offices and factories are large but heating loads for homes are small.”',
      'California và Nhật: tải điều hoà (ban ngày) lớn, tải sưởi (ban đêm) nhỏ → B'],
    15: ['Mô tả chi tiết một thí nghiệm dẫn đến việc quang điện được thúc đẩy trên cả nước.', 'Đoạn D',
      '“A large residential test station was installed on Rokko Island beginning in 1986.” … “the Japanese have used the experience gained from this station to begin their own massive residential photovoltaics campaign.”',
      'Trạm thử nghiệm Rokko được mô tả chi tiết (18 nhà “giả”, thiết bị bật tắt bằng máy tính) và dẫn tới chiến dịch toàn quốc → D'],
    16: ['Tác hại của việc dùng các cách sản xuất điện truyền thống.', 'Đoạn H',
      '“The use of fossil fuels to generate electricity is not only costly in financial terms, but also in terms of environmental damage.”',
      'Nhiên liệu hoá thạch = cách truyền thống; tốn kém và gây hại môi trường → H'],
    17: ['Giải thích hệ thống quang điện.', 'Đoạn B',
      '“During the day, when the home may not be using much electricity, excess power from the solar array is fed back to the grid” … “At night, power flows the opposite way. The grid network effectively provides storage.”',
      'Đoạn B giải thích cách hệ thống vận hành (bộ inverter, lưới điện thay cho bộ lưu trữ) → B'],
    18: ['Lợi ích lâu dài của việc dùng quang điện.', 'Đoạn I',
      '“the householder\'s outlay is soon compensated with the savings on energy bills. In addition, everyone living on the planet stands to gain from the more benign environmental impact.”',
      'Tiết kiệm hoá đơn điện và môi trường tốt hơn về lâu dài → I'],
    19: ['Đề cập việc các nước giàu sẵn sàng giúp các nước kém giàu hơn tiếp cận quang điện.', 'Đoạn G',
      '“The European Commission has called for one million solar residential systems before the year 2010, with 500,000 in Europe and 500,000 in the developing world, to be subsidised by the Commission.”',
      'Ủy ban châu Âu trợ giá 500.000 hệ thống ở các nước đang phát triển → G'],
    20: ['Quang điện được dùng để lưu trữ điện.', 'Đoạn B',
      '“no storage is required on-site” … “The grid network effectively provides storage.”',
      'Việc “lưu trữ” do lưới điện đảm nhận, không phải tấm quang điện → FALSE'],
    21: ['Từ thập niên 1970, chính phủ Mỹ liên tục hỗ trợ việc dùng quang điện cho nhà ở.', 'Đoạn C',
      '“A change in US government priorities in the early 1980s halted this program.”',
      'Chương trình bị dừng đầu thập niên 1980 → không liên tục → FALSE'],
    22: ['Những ngôi nhà dùng năng lượng mặt trời trên đảo Rokko không có người ở.', 'Đoạn D',
      '“This installation consists of 18 \'dummy\' homes” … “providing a lavish lifestyle for the non-existent occupants.”',
      '“dummy homes”, “non-existent occupants” = không có người ở → TRUE'],
    23: ['Năm 1994, chính phủ Nhật chi một nửa số tiền lắp đặt quang điện cho nhà ở.', 'Đoạn F',
      '“The program made a modest start in 1994, when 539 systems were installed with a government subsidy of 50 percent.”',
      '“subsidy of 50 percent” = một nửa chi phí → TRUE'],
    24: ['Đức, Ý, Hà Lan và Úc đều có mục tiêu nghiêm ngặt về phát thải khí nhà kính.', 'Đoạn G',
      '“several other countries including Germany, Italy, the Netherlands and Australia, have announced their own targets for residential photovoltaics.”',
      'Bốn nước này có mục tiêu về quang điện cho nhà ở; bài không nói mục tiêu phát thải của riêng các nước đó → NOT GIVEN'],
    25: ['Việc dùng điện trong nhà ở là nguồn phát thải khí nhà kính chính.', 'Đoạn H',
      '“These targets mean that all sources of greenhouse gas emissions, including residential electricity use, will receive closer attention in the future.”',
      'Điện dân dụng chỉ là một trong các nguồn; bài không nói nó là nguồn chính → NOT GIVEN'],
    26: ['Các biện pháp tiết kiệm năng lượng nay bắt buộc phải có trong thiết kế mọi nhà mới và công trình cải tạo.', 'Đoạn I',
      '“It is likely that in the future, governments will develop building codes” … “Approvals for building renovations may also be conditional upon taking such energy-saving measures.”',
      'Đây chỉ là dự đoán trong tương lai (“likely”, “may”), chưa phải quy định hiện nay → FALSE'],
  },
};
