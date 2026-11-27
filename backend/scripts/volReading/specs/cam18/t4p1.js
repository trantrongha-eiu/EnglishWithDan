// Cambridge IELTS 18 - Test 4 - Passage 1. Source: ieltsworldly.com (its key table skips Q10–13; set from the passage: C/D and A/D).
const { matching, notes, multi } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 4, part: 1, title: 'Green roofs', text: 't4p1.txt',
  groups: [
    matching(1, ['A', 'B', 'C', 'D', 'E'], [
      'mention of several challenges to be overcome before a green roof can be installed',
      'reference to a city where green roofs have been promoted for many years',
      'a belief that existing green roofs should be used as a model for new ones',
      'examples of how green roofs can work in combination with other green urban initiatives',
      'the need to make a persuasive argument for the financial benefits of green roofs',
    ], { reuse: true, instruction: 'Reading Passage 1 has five paragraphs, A–E. Which paragraph contains the following information? Write the correct letter, A–E, in boxes 1–5 on your answer sheet. NB You may use any letter more than once.' }),
    notes(6, 9, [
      'City rooftops covered with greenery have many advantages. These include lessening the likelihood that floods will occur, reducing how much money is spent on __Q6__ and creating environments that are suitable for wildlife. In many cases, they can also be used for producing __Q7__.',
      'There are also social benefits of green roofs. For example, the medical profession recommends __Q8__ as an activity to help people cope with mental health issues. Studies have also shown that the availability of green spaces can prevent physical problems such as __Q9__.',
    ], { title: 'Advantages of green roofs', instruction: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 6–9 on your answer sheet.' }),
    multi(10, 2, 'Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage?', [
      'a longer growing season for edible produce', 'more economical use of water', 'greater water-storage capacity', 'ability to cultivate more plant types', 'a large surface area for growing plants',
    ]),
    multi(12, 2, 'Which TWO aims of new variations on the concept of green roofs are mentioned in Paragraph E of the passage?', [
      'to provide habitats for a wide range of species', 'to grow plants successfully even in the wettest climates', 'to regulate the temperature of the immediate environment', 'to generate power from a sustainable source', 'to collect water to supply other buildings',
    ]),
  ],
  key: { 1: 'D', 2: 'C', 3: 'E', 4: 'B', 5: 'D', 6: 'energy', 7: 'food', 8: 'gardening', 9: 'obesity', 10: 'C', 11: 'D', 12: 'A', 13: 'D' },
  expl: {
    1: ['Nhắc tới nhiều thách thức phải vượt qua trước khi lắp mái xanh.', 'Đoạn D', '“Other considerations include installing drainage paths, meeting health and safety requirements and perhaps allowing access for the public”', 'Kỹ năng mới, thoát nước, an toàn, quy hoạch… → D'],
    2: ['Nhắc tới một thành phố đã khuyến khích mái xanh nhiều năm.', 'Đoạn C', '“Toronto, Canada, has policies dating from the 1990s”', 'Chính sách từ thập niên 1990 → C'],
    3: ['Quan điểm nên lấy mái xanh hiện có làm hình mẫu cho mái mới.', 'Đoạn E', '“The success stories need to be studied and replicated elsewhere”', '“replicated” = làm theo mô hình → E'],
    4: ['Ví dụ mái xanh kết hợp với các sáng kiến xanh khác ở đô thị.', 'Đoạn B', '“green roofs in cities can integrate with ‘living walls’”', 'Kết hợp với tường xanh và cây xanh đường phố → B'],
    5: ['Cần lập luận thuyết phục về lợi ích tài chính của mái xanh.', 'Đoạn D', '“To convince investors and developers that installing green roofs is worthwhile, economic arguments are still the most important.”', 'Lập luận kinh tế để thuyết phục nhà đầu tư → D'],
    6: ['Giảm tiền chi cho ___.', 'Đoạn A', '“Among the benefits are saving on energy costs”', 'Tiết kiệm chi phí năng lượng → energy'],
    7: ['Có thể dùng để sản xuất ___.', 'Đoạn A', '“tackling air pollution and even growing food.”', 'Trồng thực phẩm → food'],
    8: ['Giới y khoa khuyên ___ để đối phó vấn đề sức khỏe tinh thần.', 'Đoạn B', '“Doctors are increasingly prescribing time spent gardening outdoors for patients dealing with anxiety and depression.”', 'Làm vườn → gardening'],
    9: ['Không gian xanh có thể ngăn vấn đề thể chất như ___.', 'Đoạn B', '“help people avoid obesity.”', 'Béo phì → obesity'],
    10: ['Hai lợi thế của tòa nhà mới khi làm mái xanh.', 'Đoạn C', '“it’s much easier to do this in newer buildings, which can typically hold greater weight”',
      'Giữ được nhiều nước trên mái (C) và đất sâu hơn nên trồng được nhiều loại cây (D). Hai đáp án là C và D → C'],
    11: ['Hai lợi thế của tòa nhà mới khi làm mái xanh.', 'Đoạn C', '“Having a stronger roof also makes it easier to grow a greater variety of plants, since the soil can be deeper.”', 'Trồng được nhiều loại cây hơn (D), cùng với C. Hai đáp án là C và D → D'],
    12: ['Hai mục đích của các biến thể mới.', 'Đoạn E', '“‘brown roofs’ which are wilder in nature and maximise biodiversity.”', 'Tối đa đa dạng sinh học = môi trường sống cho nhiều loài (A); mái xanh kết hợp pin mặt trời (D). Hai đáp án là A và D → A'],
    13: ['Hai mục đích của các biến thể mới.', 'Đoạn E', '“There are also combinations of green roofs with solar panels”', 'Pin mặt trời = phát điện từ nguồn bền vững (D), cùng với A. Hai đáp án là A và D → D'],
  },
};
