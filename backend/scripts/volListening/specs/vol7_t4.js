// Vol 7 – Test 4 (PDF "Listening/Test 1-10/Test 4.pdf", text layer; key p2 of "Key Lis VOL 7 (T1-T10).pdf"; audio = whole test
// "VOL 7 TEST 4.mp4"). P1–P3 = the bank's "Actual Test 1" (was Actual Test 3) P1–P3: same recordings (transcript 6-gram
// 0.50/0.85/0.64) and the same questions/keys (the bank stores P2 Q15–20 and P3 Q25–30 as box words: vetting… = H C F A D B,
// producers… ) → reused. P4 "Saffron" is new.
// Transcript: the vol's .docx checked against Whisper turbo (turbo drops the Crete passage at 254 s — the docx has it).
const { note } = require('../vol_build');
const A = 'Listening/Test 1-10/VOL 7 Audio (T1-T10)/VOL 7 TEST 4.mp4';

module.exports = {
  vol: 7, test: 4, docx: 'Listening/Test 1-10/Transcript VOL 7 (T1-T10)/Transcript vol 7 test 4.docx',
  sections: [
    { part: 1, reuse: '6a4b5bcd5934e78bb4ff7a63', title: 'Superior Home Appliances – Customer Complaint Form' },
    { part: 2, reuse: '6a4b5ea25934e78bb4ff8392', title: 'Connections' },
    { part: 3, reuse: '6a4b65fb5934e78bb4ff95cd', title: 'Climate change and allergies' },
    {
      part: 4, title: 'Saffron: Cultivation, Uses and History', audio: A, clip: [1355.5, 1712], cover: 'saffron crocus flowers harvest | saffron threads spice',
      groups: [
        note('Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.', 'Saffron', [
          'Saffron: a spice which comes from the crocus flower',
          '<strong>Cultivation and production</strong>',
          '• Harvested in October',
          '• Number of stigmas needed for 50 grams: __Q31__',
          '• Method of preservation: __Q32__',
          '• Taste and aroma: like honey',
          '• Forms in which sold: as whole stigmas and as a __Q33__',
          '<strong>Uses of saffron today</strong>',
          '• To colour and flavour food in many countries, especially for making __Q34__ dishes',
          '• In medicine:',
          '   – as a drug in treatment of problems affecting the __Q35__',
          '   – experiments with rats: as protection from exposure to some types of __Q36__',
          '<strong>History of saffron use</strong>',
          '• Ancient Crete: as a dye for __Q37__',
          '• Roman Empire:',
          '   – in oil used for the production of __Q38__',
          '   – as a __Q39__ in public baths',
          '• Persia (Iran): as a dye used in the making of __Q40__',
        ], { 31: '14000/14,000', 32: 'drying', 33: 'powder', 34: 'rice', 35: 'eye/eyes', 36: 'lights/light', 37: 'clothes', 38: 'cosmetics', 39: 'perfume', 40: 'carpets' }, 'Questions 31-40'),
      ],
      expl: {
        31: { v: 'Khi nói về lượng nhuỵ cần để làm ra nghệ tây.', t: 'One person must pick for almost 400 hours to produce just one kilo of saffron, and amazingly, to produce just 50 grams, it takes about 14,000 individual stigmas.', p: '400 giờ là để làm 1 kg (bẫy); 50 gram cần khoảng 14.000 nhuỵ → 14000' },
        32: { v: 'Khi nói cách bảo quản.', t: 'the stigmas are subject to a process of drying, by which some 98% of their moisture content is removed.', p: 'Nhuỵ được sấy khô, loại bỏ 98% độ ẩm → drying' },
        33: { v: 'Khi nói dạng bán ra.', t: 'you will find that saffron is either sold as whole stigmas or ground up as a powder.', p: 'Bán nguyên nhuỵ hoặc nghiền thành bột → powder' },
        34: { v: 'Khi nói món ăn thường dùng nghệ tây.', t: 'though cooks would agree that it is most commonly added to recipes for the cooking of rice', p: 'Thường được thêm vào các món cơm → rice' },
        35: { v: 'Khi nói ứng dụng y học.', t: 'medical research indicates that saffron may have important applications as a drug in the clinical treatment of a number of eye disorders.', p: 'Dùng làm thuốc chữa một số bệnh về mắt → eye' },
        36: { v: 'Khi nói thí nghiệm trên chuột.', t: 'recent experiments with laboratory rats have shown saffron to be effective in protecting the animals from damage caused when they are exposed to potentially harmful lights.', p: 'Bảo vệ chuột khỏi tổn thương do tiếp xúc với một số loại ánh sáng có hại → lights' },
        37: { v: 'Khi nói về đảo Crete cổ đại.', t: ['where paintings and other artifacts have been found indicating that women wore beautiful saffron-colored clothes.', 'This is the earliest evidence of saffron being used as a dye.'], p: 'Phụ nữ mặc quần áo nhuộm màu nghệ tây → dùng làm thuốc nhuộm quần áo → clothes' },
        38: { v: 'Khi nói về Đế chế La Mã.', t: 'During the Roman Empire, saffron oil was produced, which, because of both its color and aroma, was used to create cosmetics.', p: 'Dầu nghệ tây dùng để làm mỹ phẩm → cosmetics' },
        39: { v: 'Khi nói về nhà tắm công cộng.', t: ['Another use of saffron was to be found in the public baths.', 'There, saffron was used as a perfume to keep the places smelling fresh and aromatic.'], p: 'Dùng làm nước hoa giữ nhà tắm thơm tho → perfume' },
        40: { v: 'Khi nói về Ba Tư.', t: "One of the most well-known examples was in Persia, which is modern-day Iran, where saffron was a vital part of the process of manufacturing carpets.", p: 'Nghệ tây là thuốc nhuộm trong sản xuất thảm → carpets' },
      },
    },
  ],
};
