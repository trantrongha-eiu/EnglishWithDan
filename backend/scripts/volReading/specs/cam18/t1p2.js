// Cambridge IELTS 18 - Test 1 - Passage 2. Source: ieltsworldly.com, checked against the book key. Text fix: "longhomed" → longhorned.
const { matching, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 1, part: 2, title: 'Forest management in Pennsylvania, USA', text: 't1p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G'], [
      'bad outcomes for a forest when people focus only on its financial reward',
      'reference to the aspects of any tree that contribute to its worth',
      'mention of the potential use of wood to help run vehicles',
      'examples of insects that attack trees',
      'an alternative name for trees that produce low-use wood',
    ], { reuse: true, instruction: 'Reading Passage 2 has seven paragraphs, A–G. Which paragraph contains the following information? Write the correct letter, A–G, in boxes 14–18 on your answer sheet. NB You may use any letter more than once.' }),
    matching(19, ['a TSI Cut', 'a Salvage Cut', 'a Shelterwood Cut'], [
      'to remove trees that are diseased',
      'to generate income across a number of years',
      'to create a forest whose trees are close in age',
    ], { reuse: true, title: 'List of Timber Cuts', instruction: 'Look at the following purposes (Questions 19–21) and the list of timber cuts below. Match each purpose with the correct timber cut, A, B or C. Write the correct letter, A, B or C, in boxes 19–21 on your answer sheet. NB You may use any letter more than once.' }),
    notes(22, 26, [
      'Some dead wood is removed to avoid the possibility of __Q22__.',
      'The __Q23__ from the tops of cut trees can help improve soil quality.',
      'Some damaged trees should be left, as their __Q24__ provide habitats for a range of creatures.',
      'Some trees that are small, such as __Q25__, are a source of food for animals and insects.',
      'Any trees that are __Q26__ should be left to grow, as they add to the variety of species in the forest.',
    ], { instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 22–26 on your answer sheet.' }),
  ],
  key: { 14: 'B', 15: 'A', 16: 'C', 17: 'E', 18: 'B', 19: 'B', 20: 'C', 21: 'C', 22: 'fire', 23: 'nutrients', 24: 'cavities', 25: 'hawthorn', 26: 'rare' },
  expl: {
    14: ['Hậu quả xấu cho khu rừng khi người ta chỉ chú trọng lợi ích tài chính.', 'Đoạn B', '“compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand leaving it more vulnerable to poor weather and disease.”',
      'Chỉ khai thác cây giá trị cao (high-grading) để lại cây kém khiến rừng yếu đi → B'],
    15: ['Nhắc tới các khía cạnh của cây góp phần tạo nên giá trị của nó.', 'Đoạn A', '“A tree’s ‘value’ depends on several factors including its species, size, form, condition, quality, function, and accessibility”', 'Liệt kê các yếu tố tạo nên giá trị của cây → A'],
    16: ['Nhắc tới khả năng dùng gỗ để chạy xe.', 'Đoạn C', '“can even be made into liquid fuels like ethanol and gasoline for lorries and cars.”', 'Nhiên liệu lỏng cho xe tải, ô tô → C'],
    17: ['Ví dụ các loài côn trùng tấn công cây.', 'Đoạn E', '“hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth”', 'Liệt kê các loài sâu bệnh → E'],
    18: ['Một tên gọi khác cho những cây cho gỗ ít giá trị.', 'Đoạn B', '“Some people even call these ‘junk trees’”', '“junk trees” = tên gọi khác → B'],
    19: ['Để loại bỏ cây bị bệnh.', 'Đoạn E', '“These types of cut reduce the number of sick trees”', 'Salvage Cut giảm số cây bệnh → B'],
    20: ['Để tạo thu nhập trong nhiều năm.', 'Đoạn F', '“so that there are two harvests and the money that comes in is spread out over a decade or more.”', 'Shelterwood Cut: tiền thu được rải đều hơn một thập kỷ → C'],
    21: ['Để tạo khu rừng có cây gần bằng tuổi nhau.', 'Đoạn F', '“It leaves a young forest where all trees are at a similar point in their growth.”', 'Shelterwood Cut → C'],
    22: ['Một số gỗ chết được dọn để tránh nguy cơ ___.', 'Đoạn G', '“Thinnings and dense and dead wood removal for fire prevention”', '“prevention” = to avoid; phòng cháy → fire'],
    23: ['___ từ ngọn cây bị chặt có thể cải thiện chất lượng đất.', 'Đoạn G', '“The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil.”', 'Dưỡng chất quay về đất → nutrients'],
    24: ['Nên để lại một số cây hỏng vì các ___ của chúng là nơi ở cho nhiều sinh vật.', 'Đoạn G', '“trees with many cavities are extremely important habitats”', 'Các hốc cây → cavities'],
    25: ['Một số cây nhỏ, như ___, là nguồn thức ăn cho động vật.', 'Đoạn G', '“many species like hawthorn provide food for wildlife.”', 'Cây táo gai → hawthorn'],
    26: ['Cây ___ nên được giữ lại vì làm tăng sự đa dạng của rừng.', 'Đoạn G', '“rare species of trees in a forest should also stay behind as they add to its structural diversity.”', 'Loài cây hiếm → rare'],
  },
};
