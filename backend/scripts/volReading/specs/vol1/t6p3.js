// Vol 1 - Test 6 - Reading Passage 3 (PDF p15–20). Not in the bank (mini-ielts 1444 "Nature works Polylactic acid", same
// questions, never imported). Paragraph letters A–I as printed (on their own lines). PDF typo "com" → corn.
// Key fixes (passage wins; the printed key = mini-ielts key):
//  - Q37–38 printed A, D: D "It's fading under the sun" contradicts "resistance to ultraviolet light… reduces the amount of
//    fading" → A, C (sportswear makers drawn to it; lighter garments, better at absorbing moisture).
//  - Q39–40 printed A, C: C "no use of fossil fuel" contradicts "uses 20%–50% less fossil fuel" → A, B ("carbon dioxide in
//    the atmosphere is removed when the feedstock is grown"). Source flaw: printed option D "It uses renewable raw resources"
//    says the same as A ("made of renewable raw materials") — a choose-two group cannot take alternative keys, so a student
//    picking D would lose a mark → 2026-10-17 duplicate D removed (printed E becomes D); no independent key found online.
const { endings, table, mc, multi } = require('../../vr_build');
module.exports = {
  vol: 1, test: 6, part: 3, title: 'NatureWorks Polylactic acid', text: 't6p3.txt',
  groups: [
    endings(27, ['make things like clothes', 'produce plastic from plants', 'selling plastic in the market', 'fermentation process', 'drape fabrics', 'wrapping products'],
      ['Scientists managed to', 'Cargill needed to have contacts with', 'NatureWorks is used for', 'Ingeo is used to'],
      { instruction: 'Complete each sentence with the correct ending, A–F, below. Write the correct letter, A–F, in boxes 27–30 on your answer sheet.' }),
    table(31, 34, ['Process', 'Product'], [
      ['Milling', 'Corn → __Q31__'],
      ['', 'unrefined dextrose'],
      ['__Q32__', 'Lactic acid'],
      ['__Q33__', 'Lactide'],
      ['Vacuum distillation', 'get __Q34__'],
      ['Solvent-free melting', 'NatureWorks PLA'],
    ], { instruction: 'Complete the flow-chart below (Process: Polylactic acid). Choose NO MORE THAN TWO WORDS from the passage for each answer. Write your answers in boxes 31–34 on your answer sheet.' }),
    mc(35, [
      ['Why was PLA chosen as a material for food packaging?', ['It smells good.', 'It can keep food fresh.', 'It can be used on other materials.', 'Some other things need to be revised about it.']],
      ['What is PLA packaging used for?', ['absorbing moisture', 'composting facilities', 'packaging fresh food', 'manufacturing']],
    ]),
    multi(37, 2, 'Which TWO features of PLA are correct?', ['It takes moisture away from the skin.', 'It is waterproof.', 'It is used for comfortable sportswear.', 'It fades in the sun.', 'It is only made in deep colours.']),
    multi(39, 2, 'Which TWO features of PLA are correct?', ['It is made of renewable raw materials.', 'It involves the removal of carbon dioxide.', 'It uses no fossil fuel products.', 'It is a sustenance which can absorb the CO2 in the atmosphere.']),
  ],
  key: { 27: 'B', 28: 'C', 29: 'F', 30: 'A', 31: 'starch', 32: 'fermentation / fermentation process', 33: 'condensation / condensation process', 34: 'polymer / a polymer',
    35: 'B', 36: 'C', 37: 'A', 38: 'C', 39: 'A', 40: 'B' },
  expl: {
    27: ['Các nhà khoa học đã làm được việc …', 'Đoạn A',
      '“scientists at Cargill got the idea of converting lactic acid made from corn into plastic” … “in time the efforts did succeed.”',
      'Các nhà khoa học của Cargill biến axit lactic từ ngô (thực vật) thành nhựa và cuối cùng đã thành công = sản xuất nhựa từ thực vật → B'],
    28: ['Cargill cần có quan hệ với …', 'Đoạn B',
      '“The company needed a partner with access to plastics markets and polymerization capabilities”',
      '“access to plastics markets” = tiếp cận thị trường để bán nhựa → C'],
    29: ['NatureWorks được dùng cho …', 'Đoạn B',
      '“NatureWorks™ PLA is a family of packaging polymers”',
      'NatureWorks là họ polyme dùng làm bao bì (packaging) = sản phẩm đóng gói, bọc hàng → F'],
    30: ['Ingeo được dùng để …', 'Đoạn B + C',
      '“Ingeo is a family of polymers for fibers made in a similar manner.” … “reaches the consumer in clothes, cups, packaging and other products.”',
      'Ingeo là polyme dùng làm sợi (fibers) — tức để làm các thứ như quần áo → A'],
    31: ['Nghiền (milling): Ngô → ______ → dextrose chưa tinh chế', 'Đoạn D',
      '“corn is milled, separating starch from the raw material. Unrefined dextrose, in turn, is processed from the starch.”',
      'Ngô được nghiền để tách ra tinh bột, rồi từ tinh bột mới tạo ra dextrose → starch'],
    32: ['Quá trình biến dextrose thành axit lactic', 'Đoạn E',
      '“Cargill Dow turns the unrefined dextrose into lactic acid using a fermentation process”',
      'Dextrose → axit lactic nhờ quá trình lên men → fermentation'],
    33: ['Quá trình tạo ra lactide từ axit lactic', 'Đoạn E',
      '“Through a special condensation process, a lactide is formed.”',
      'Lactide được tạo ra qua một quá trình ngưng tụ đặc biệt → condensation'],
    34: ['Chưng cất chân không: thu được ______', 'Đoạn E',
      '“This lactide is purified through vacuum distillation and becomes a polymer”',
      'Sau chưng cất chân không, lactide trở thành một polyme → polymer'],
    35: ['Vì sao PLA được chọn làm bao bì thực phẩm?', 'Đoạn H',
      '“NatureWorks PLA polymers are more oil- and grease-resistant and provide a better flavor and aroma barrier than existing petroleum-based polymers, grocery retailers are increasingly using this packaging for their fresh foods.”',
      'PLA chống dầu mỡ và giữ hương vị tốt hơn nên siêu thị dùng để đựng thực phẩm tươi = giữ thực phẩm tươi ngon. A sai: bài không nói PLA “có mùi thơm” mà nói nó ngăn mùi tốt → B'],
    36: ['Bao bì PLA được dùng để làm gì?', 'Đoạn H',
      '“grocery retailers are increasingly using this packaging for their fresh foods.”',
      'Các nhà bán lẻ thực phẩm dùng bao bì PLA cho thực phẩm tươi → C'],
    37: ['Hai đặc điểm đúng của PLA (1)', 'Đoạn H',
      '“it has an inherent ability to take moisture away from the skin”',
      'PLA có khả năng tự nhiên hút ẩm khỏi da → A'],
    38: ['Hai đặc điểm đúng của PLA (2)', 'Đoạn H',
      '“sportswear makers have been drawn to the product” … “the result is garments that are lighter and better at absorbing moisture.”',
      'Các hãng đồ thể thao chuộng PLA vì quần áo nhẹ hơn, thấm hút tốt hơn = đồ thể thao thoải mái. D sai: PLA chống tia cực tím nên “giảm phai màu”; E sai: bài chỉ nói có thể làm màu đậm mà không tốn nhiều thuốc nhuộm, không phải “chỉ” màu đậm; B không được nhắc. (Key in của đề ghi A, D.) → C'],
    39: ['Hai đặc điểm đúng của PLA (1)', 'Đoạn I',
      '“the company is using raw materials that can be regenerated year after year”',
      'PLA làm từ nguyên liệu có thể tái tạo hằng năm (ngô). (Đề in còn một lựa chọn “It uses renewable raw resources” trùng nghĩa với A — đã bỏ để không ai mất điểm oan.) → A'],
    40: ['Hai đặc điểm đúng của PLA (2)', 'Đoạn I',
      '“carbon dioxide in the atmosphere is removed when the feedstock is grown”',
      'Quá trình sản xuất PLA gắn với việc loại bỏ CO2 khỏi khí quyển khi trồng nguyên liệu. C sai: PLA dùng ít hơn 20%–50% nhiên liệu hoá thạch chứ không phải không dùng. (Key in của đề ghi A, C.) → B'],
  },
};
