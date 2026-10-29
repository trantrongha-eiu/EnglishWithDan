// Vol 1 - Test 7 UPDATE — Reading Passage 3 (Vol 7 folder "Reading/các đề update web khác trên bản pdf/Reading khác bản pdf
// update/VOL 1 TEST 7.pdf", p8–11, text layer). Not in the bank / mini-ielts. This updated Test 7 replaces the PDF's
// "Irish Elk" (Q28–40, no Q27 anywhere) with this 14-question passage, so the test has all 40 questions.
// Key = "giải thích reading/vol 1 test 7.docx key.docx" (checked against the passage). Q35–40 instruction says "Reading
// Passage 1" → 3; Q35 "Some forms of technological utilization is inevitable" → are.
const { summary, mc, ynng } = require('../../vr_build');
module.exports = {
  vol: '1u', test: 7, part: 3, title: 'Thinking Small: Globalization and the Choice of Technology', text: 't7p3.txt',
  groups: [
    summary(27, 31, 'The __Q27__ of today’s globalised economy believe that developing countries need to use advanced technology, and multinational companies are using their power to impose this at a global level.<br>In terms of its operation, advanced technology requires the introduction of high levels of __Q28__ and also needs large amounts of __Q29__. This may make it unsuitable for developing countries, where large-scale __Q30__ is a problem and where there are insufficient __Q31__.',
      ['production', 'automation', 'skill', 'employees', 'unemployment', 'labour', 'critics', 'capital', 'pollution', 'resources', 'poverty', 'leaders'],
      { title: 'Globalisation and technology' }),
    mc(32, [
      ['In numerous developing nations, the influx of mass-manufactured goods', [
        'will diminish the technical expertise of the local workforce.', 'will influence the methods used in domestic production.',
        'will compel local producers to adjust according to consumer demands.', 'will result in people allocating their money toward non-essential items.']],
      ['The author references the United States as an example to illustrate that information technology', [
        'may not contribute to a more equitable society.', 'can provide greater advantages to certain nations over others.',
        'might, in fact, lead to an increase in financial hardship.', 'is ineffective unless it is broadly accessible.']],
      ['What is the author’s overall perspective on the role of information technology in India?', [
        'It is frequently unsuitable as a tool for communication.', 'It is associated with infrastructure development projects.',
        'It proves to be more beneficial in remote areas than in cities.', 'It has caused significant difficulties in certain regions.']],
    ]),
    ynng(35, [
      'Some forms of technological utilization are inevitable.',
      'Individuals tend to experience greater satisfaction when utilizing more compact technological solutions.',
      'Newly implemented small-scale technologies in emerging economies should be cost-effective.',
      'It is necessary to reduce the diversity of technological applications worldwide.',
      'Compact technological systems can remain effective across vast regions.',
      'The sustainability of regional economies could rely on the implementation of suitable production techniques.',
    ]),
  ],
  key: { 27: 'leaders', 28: 'automation', 29: 'capital', 30: 'unemployment', 31: 'resources', 32: 'B', 33: 'A', 34: 'A',
    35: 'YES', 36: 'NOT GIVEN', 37: 'YES', 38: 'NO', 39: 'NO', 40: 'YES' },
  expl: {
    27: ['______ của nền kinh tế toàn cầu hóa ngày nay tin rằng các nước đang phát triển cần dùng công nghệ tiên tiến …', 'Đoạn 1–2',
      '“There is an almost universal belief among policy-makers that advanced technology and increased exports are vital for economic development in poor countries.”',
      '“policy-makers” = những người lãnh đạo, hoạch định chính sách (L); “multinational corporations that dominate” = các công ty đa quốc gia áp đặt → leaders'],
    28: ['Về vận hành, công nghệ tiên tiến đòi hỏi mức độ ______ cao …', 'Đoạn 3',
      '“The increasing reliance on large-scale mechanization by these corporations demands substantial capital investment while simultaneously reducing the need for human labor wherever feasible.”',
      '“large-scale mechanization … reducing the need for human labor” = tự động hóa (B) → automation'],
    29: ['… và cần lượng lớn ______.', 'Đoạn 3',
      '“demands substantial capital investment”',
      '“substantial capital investment” = cần nhiều vốn (H) → capital'],
    30: ['… không phù hợp với các nước đang phát triển, nơi ______ quy mô lớn là vấn đề …', 'Đoạn 3',
      '“where populations are dense, unemployment rates are high, and natural resources … are scarce.”',
      '“unemployment rates are high” = thất nghiệp quy mô lớn (E) → unemployment'],
    31: ['… và nơi không có đủ ______.', 'Đoạn 3',
      '“natural resources such as fossil fuels, arable land, and freshwater are scarce.”',
      '“natural resources … are scarce” = thiếu tài nguyên (J) → resources'],
    32: ['Ở nhiều nước đang phát triển, hàng hóa sản xuất hàng loạt tràn vào sẽ', 'Đoạn 5',
      '“These imports bring with them embedded production technologies, leaving local manufacturers with little choice but to adopt similar methodologies to remain competitive”',
      'Nhà sản xuất trong nước buộc phải dùng phương pháp tương tự = ảnh hưởng tới cách sản xuất trong nước → B'],
    33: ['Tác giả lấy Mỹ làm ví dụ để minh họa rằng công nghệ thông tin', 'Đoạn 7',
      '“Yet, despite widespread technological adoption, the U.S. poverty rate remains at approximately 12 percent … while income inequality has widened by nearly 50 percent over the past 25 years.”',
      'Dù công nghệ phổ biến, nghèo đói không giảm và bất bình đẳng tăng = CNTT có thể không giúp xã hội công bằng hơn → A'],
    34: ['Quan điểm chung của tác giả về vai trò của công nghệ thông tin ở Ấn Độ là gì?', 'Đoạn 7',
      '“Although the internet can offer certain advantages … more traditional, cost-effective solutions — such as radio broadcasting — may be better suited for many rural areas.”',
      'Internet ở nhiều vùng nông thôn kém phù hợp hơn radio = thường không phù hợp làm công cụ truyền thông → A'],
    35: ['Một số hình thức sử dụng công nghệ là không thể tránh khỏi.', 'Đoạn 8',
      '“The issue at hand is not a binary choice between embracing technology and rejecting it outright. Even without sophisticated machinery, societies still require tools to facilitate labor.”',
      'Xã hội vẫn cần công cụ dù không có máy móc phức tạp = dùng công nghệ ở mức nào đó là tất yếu → YES'],
    36: ['Con người thường hài lòng hơn khi dùng các giải pháp công nghệ nhỏ gọn.', 'Đoạn 8–10',
      '“it would be more prudent … to adopt smaller-scale technologies that optimize human participation.”',
      'Tác giả nói công nghệ quy mô nhỏ hợp lý hơn về việc làm và tài nguyên, không nói gì về sự hài lòng của người dùng → NOT GIVEN'],
    37: ['Công nghệ quy mô nhỏ mới áp dụng ở các nền kinh tế mới nổi nên tiết kiệm chi phí.', 'Đoạn 8',
      '“Such technologies should be engineered to maximize efficiency in agricultural and industrial production while minimizing the financial investment required for their acquisition.”',
      '“minimizing the financial investment required” = phải tiết kiệm chi phí → YES'],
    38: ['Cần thu hẹp sự đa dạng của các ứng dụng công nghệ trên thế giới.', 'Đoạn 9',
      '“then the spectrum of acceptable technologies must be broadened considerably.”',
      '“must be broadened considerably” = phải mở rộng, trái với “reduce the diversity” → NO'],
    39: ['Các hệ thống công nghệ nhỏ gọn vẫn hiệu quả trên những vùng rộng lớn.', 'Đoạn 10',
      '“By opting for smaller-scale technologies, their functional reach is naturally confined, making them more conducive to local enterprises”',
      '“functional reach is naturally confined” = phạm vi tác dụng bị giới hạn, hợp với doanh nghiệp địa phương → trái với “across vast regions” → NO'],
    40: ['Tính bền vững của kinh tế địa phương có thể phụ thuộc vào việc áp dụng kỹ thuật sản xuất phù hợp.', 'Đoạn 10',
      '“Ultimately, the sustainability of local economies will hinge on the technological choices they make.”',
      '“will hinge on the technological choices” = phụ thuộc vào lựa chọn công nghệ → YES'],
  },
};
