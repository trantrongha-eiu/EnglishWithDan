// Vol 2 - Test 9 UPDATE (seeded as "Vol 2 - Test 11") — Reading Passage 2 ("VOL2 TEST 9 (1).pdf", text layer). Not in the
// bank / mini-ielts. Key = "giải thích reading/Key VOL 2 TEST 9.pdf", checked against the passage: all correct.
// Text fixes: "parasites organisms which" → "parasites – organisms which", "made-to-fit sizes large ants" → "sizes: large ants".
// The footnote "*fungus: …" is kept as the last line.
const { matching, mc } = require('../../vr_build');
module.exports = {
  vol: '2u', test: 9, part: 2, title: 'The fascinating world of attine ants', text: 't9p2.txt',
  groups: [
    matching(14, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [
      'two things at which leaf-cutter ants have succeeded but humans have failed',
      'a comparison between the nests of leaf-cutter and lower attine ants',
      'an assessment of the impact leaf-cutter ants have on their environment',
      'the effect Escovopsis has on ant communities',
      'the advantage for lower attine ants of growing a range of funguses',
      'the discovery of the age of the attine ant funguses',
    ], { instruction: 'Reading Passage 2 has eight sections, A–H. Which section contains the following information? Write the correct letter, A–H, in boxes 14–19 on your answer sheet.' }),
    matching(20, ['leaf-cutter ants', 'lower attine ants', 'both leaf-cutter and lower attine ants'], [
      'the use of dead vegetation to cultivate their fungus',
      'very small ants that keep the fungus free of foreign organisms',
      'the ability to safely eat harmful plants',
      'the cultivation of a single fungus',
      'a nest with a very large number of rooms for growing fungus',
    ], { reuse: true, instruction: 'Classify the following features as belonging to A leaf-cutter ants, B lower attine ants, C both leaf-cutter and lower attine ants. Write the correct letter, A, B or C, in boxes 20–24 on your answer sheet. NB You may use any letter more than once.' }),
    mc(25, [
      ['What does the writer say about Cameron Currie\'s research?', [
        'No previous work had been done in this area.', 'Earlier studies did not support his theory.',
        'Textbooks on this subject lacked specific detail.', 'Currie\'s initial theory had proven to be incorrect.']],
      ['Using a microscope, Currie was the first to discover that the body of attine ants', [
        'has a white covering.', 'is covered in wax.', 'is poisonous to humans.', 'has a substance useful to humans.']],
    ]),
  ],
  key: { 14: 'H', 15: 'C', 16: 'B', 17: 'F', 18: 'G', 19: 'D', 20: 'B', 21: 'A', 22: 'C', 23: 'A', 24: 'A', 25: 'B', 26: 'D' },
  expl: {
    14: ['hai việc mà kiến cắt lá đã làm được nhưng con người thì thất bại', 'Đoạn H',
      '“the leaf-cutter ants are accomplishing feats beyond the power of humans: they are growing a monocultural crop year after year without disaster, and they are using an antibiotic apparently so wisely that, unlike people, they are not provoking antibiotic resistance”',
      'Hai việc: trồng độc canh nhiều năm không gặp thảm họa và dùng kháng sinh mà không gây kháng thuốc — điều con người chưa làm được → H'],
    15: ['một sự so sánh giữa tổ của kiến cắt lá và kiến attine bậc thấp', 'Đoạn C',
      '“the other groups, known as the lower attines because their nests are smaller and their techniques more primitive”',
      'Kiến attine bậc thấp có tổ nhỏ hơn (so với kiến cắt lá) → C'],
    16: ['một đánh giá về tác động của kiến cắt lá lên môi trường của chúng', 'Đoạn B',
      '“These ant communities are the dominant plant-eaters of the Neotropics” … “Biologists believe 15 per cent of the leaf production of tropical forests disappears down the nests of leaf-cutter ants.”',
      '15% lượng lá của rừng nhiệt đới bị kiến cắt lá mang xuống tổ = đánh giá tác động lên môi trường → B'],
    17: ['tác động của Escovopsis lên các cộng đồng kiến', 'Đoạn F',
      '“Escovopsis is a deadly disease that can devastate a fungus garden in a couple of days.” … “the ants associated with the garden just starve to death.”',
      'Escovopsis tàn phá vườn nấm, kiến của vườn đó chết đói → F'],
    18: ['lợi ích của việc trồng nhiều loại nấm đối với kiến attine bậc thấp', 'Đoạn G',
      '“there is now a possible reason for the different varieties of fungus in the lower attine mushroom gardens - to stay one step ahead of the relentless Escovopsis.”',
      'Trồng nhiều loại nấm giúp kiến bậc thấp luôn đi trước Escovopsis một bước (ít bị nhiễm hơn) → G'],
    19: ['việc phát hiện ra tuổi của các loại nấm của kiến attine', 'Đoạn D',
      '“They found that the leaf-cutters\' fungus was descended from a single pure strain, propagated for at least 23 million years.”',
      'Phân tích DNA năm 1994 cho thấy dòng nấm đã được nhân giống ít nhất 23 triệu năm → D'],
    20: ['dùng thực vật đã chết để nuôi nấm', 'Đoạn C',
      '“the other groups, known as the lower attines … feed their gardens with similar leaves which have fallen on the ground and insects that lie on the forest floor.”',
      'Kiến cắt lá dùng lá tươi; kiến bậc thấp dùng lá rụng trên mặt đất (dead vegetation) → B'],
    21: ['những con kiến rất nhỏ giữ cho nấm sạch sinh vật lạ', 'Đoạn C',
      '“leaf-cutter worker ants come in made-to-fit sizes: large ants to saw off leaves, medium ones to shred them and miniature workers to seed them with fungus and clean off alien growths.”',
      '“miniature workers … clean off alien growths” chỉ có ở kiến cắt lá (kiến bậc thấp đều cùng cỡ) → A'],
    22: ['khả năng ăn an toàn những thực vật có hại', 'Đoạn B',
      '“The attine ants\' achievement is remarkable because it allows them to consume, courtesy of their mushroom\'s digestive powers, the harvest of tropical forests whose leaves are laden with poisonous chemicals.”',
      'Bài nói chung “attine ants” (cả họ, gồm cả kiến cắt lá và kiến bậc thấp) nhờ nấm tiêu hóa mà ăn được lá chứa chất độc → C'],
    23: ['việc trồng một loại nấm duy nhất', 'Đoạn D',
      '“the leaf-cutters\' fungus was descended from a single pure strain” … “the funguses grown by lower attine ants fell into four different groups”',
      'Kiến cắt lá trồng một dòng nấm thuần; kiến bậc thấp có bốn nhóm nấm → A'],
    24: ['một tổ có rất nhiều phòng để trồng nấm', 'Đoạn A',
      '“A single leaf-cutter nest may contain a thousand such chambers, embedded in an underground metropolis up to 18 feet deep”',
      'Một tổ kiến cắt lá có thể chứa một nghìn khoang trồng nấm → A'],
    25: ['Tác giả nói gì về nghiên cứu của Cameron Currie?', 'Đoạn E',
      '“Currie felt there had to be a parasite in the ant-fungus system. But a century of ant research did not provide any evidence for his idea.”',
      'Một thế kỷ nghiên cứu trước đó không đưa ra bằng chứng ủng hộ ý tưởng của ông (sách còn nói kiến giữ vườn sạch ký sinh) → B'],
    26: ['Dùng kính hiển vi, Currie là người đầu tiên phát hiện cơ thể kiến attine', 'Đoạn H',
      '“People have known for a hundred years that ants have a whitish growth on their body surface.” … “Currie discovered a specialized patch on the ants\' bodies that harbors a particular kind of bacterium, one well known to the pharmaceutical industry and the source of many antibiotics used in medicine.”',
      'Lớp phủ trắng đã được biết từ trăm năm (A sai), trước đây tưởng là sáp (B sai); Currie phát hiện vi khuẩn là nguồn kháng sinh dùng trong y học = chất có ích cho con người → D'],
  },
};
