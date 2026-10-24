// Vol 4 - reading/test 3/test 3.pdf - Reading Passage 3 (PDF p7–10). Not in the bank. Same text and questions as mini-ielts
// 1513 "The fluoridation controversy" (wdiff: only OCR noise) → text from the mini copy, its typos fixed ("pans of the
// population" → parts, "revolutions. in which", "might argue. 'The"). The mini key is garbled (10 B, 14 E …); key =
// explain key/test 3- up.pdf (scan), checked against the passage: all correct.
const { mc, ynng, endings } = require('../../vr_build');
module.exports = {
  vol: 4, test: 3, part: 3, title: 'The fluoridation controversy', text: 't3p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['The optimum amount of fluorine in fluoridated water is calculated partly according to', [
        'how hot the area is.', 'how warm the water is.', 'how many dental problems there are in the community.',
        'how much fluorine the community chooses to have in its water.']],
      ['One reason given by the writer for opposing fluoridation is that', [
        'it may contribute to tooth decay.', 'it will be unacceptably expensive for the public.',
        'obligatory fluoridation takes away personal freedom.', 'excessive fluoride could be added to the water by mistake.']],
      ['The writer mentions Kuhn in order to', [
        'provide a contrast with the view of Collins.', 'support the rational nature of scientific inquiry.',
        'demonstrate that Kuhn did not argue his case adequately.', 'show that science can be influenced by non-scientific considerations.']],
      ['What did Sutton\'s research discover about earlier studies in North America?', [
        'There were failings in the way they were carried out.', 'The scientists involved had achieved unique results.',
        'Proponents of fluoridation had not understood its long-term effects.', 'Fluoridation had a greater effect on tooth decay than previously believed.']],
      ['In the last paragraph, what does the writer say about scientists?', [
        'They should reveal their true motivations.', 'They should not decide the fluoridation policy.',
        'They are solely concerned with scientific truths.', 'They cannot reach agreement on the fluoridation issue.']],
    ]),
    ynng(32, [
      'Scientific knowledge should be kept separate from social values.',
      'Many sociologists have disregarded the doubts that some scientists have concerning fluoridation.',
      'Sutton\'s findings have been given insufficient attention by scientists outside of North America.',
      'There are valid arguments on both sides of the fluoridation debate.',
    ], { instruction: 'Do the following statements agree with the views of the writer in Reading Passage 3? In boxes 32–35 on your answer sheet, write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.' }),
    endings(36, [
      'the results of scientific research are not always understood at first.',
      'science is an unbiased discipline.',
      'people should be able to choose whether they want fluoride.',
      'there is insufficient proof to support a cautious approach.',
      'the serious damage fluoride causes far outweighs any positive effects.',
      'children are not the only ones who benefit from fluoridation.',
      'scientific knowledge is affected by the beliefs of everyone concerned.',
    ], [
      'The traditional view of science is that',
      'A sociological view of science argues that',
      'Collins is of the opinion that',
      'The writer suggests that a supporter of fluoridation may conclude that',
      'The writer suggests that an opponent of fluoridation may conclude that',
    ]),
  ],
  key: { 27: 'A', 28: 'C', 29: 'D', 30: 'A', 31: 'B', 32: 'NO', 33: 'YES', 34: 'NOT GIVEN', 35: 'YES', 36: 'B', 37: 'G', 38: 'A',
    39: 'D', 40: 'C' },
  expl: {
    27: ['Lượng flo tối ưu trong nước được tính một phần dựa vào điều gì?', 'Đoạn 1',
      '“the desired concentration of fluoride in public water is approximately one part per million, depending on the regional temperature and hence the amount of water people are likely to drink.”',
      '“regional temperature” = nhiệt độ của vùng = how hot the area is (không phải nhiệt độ của nước) → A'],
    28: ['Một lý do phản đối flo hoá mà tác giả nêu ra là gì?', 'Đoạn 2',
      '“Third, fluoridation is thought to be an infringement on individual rights because it is compulsory medication of all members of a community.”',
      '“compulsory” = obligatory; “infringement on individual rights” = takes away personal freedom → C'],
    29: ['Tác giả nhắc đến Kuhn nhằm mục đích gì?', 'Đoạn 5',
      '“the shift from one scientific way of thinking to another is not made solely on the basis of clear rules of formal scientific practice, but can include social factors”',
      'Kuhn cho rằng khoa học thay đổi còn do yếu tố xã hội = chịu ảnh hưởng của yếu tố phi khoa học. (A sai: Collins “took this concept further” – tiếp nối, không đối lập.) → D'],
    30: ['Nghiên cứu của Sutton phát hiện gì về các nghiên cứu trước ở Bắc Mỹ?', 'Đoạn 7',
      '“the study by Sutton in 1960, which analyzed the classic North American studies of the effect of fluoridation on tooth decay, and found that each showed significant methodological shortcomings.”',
      '“methodological shortcomings” = sai sót trong cách tiến hành → A'],
    31: ['Ở đoạn cuối, tác giả nói gì về các nhà khoa học?', 'Đoạn cuối',
      '“social values are likely to be bound up in any decision about fluoridation, so this is not an issue on which declarations by scientific experts ought to be considered the final word.”',
      'Tuyên bố của chuyên gia không nên là “lời cuối cùng” = họ không nên quyết định chính sách flo hoá → B'],
    32: ['Kiến thức khoa học nên được tách biệt khỏi các giá trị xã hội.', 'Đoạn 6',
      '“traditional distinctions between facts and theories, and between scientific knowledge and values, can no longer be justified. Because social processes are involved at all stages of the creation, evaluation, and establishing of scientific knowledge, social values may also be involved.”',
      'Tác giả cho rằng không còn tách được khoa học và giá trị → trái với nhận định → NO'],
    33: ['Nhiều nhà xã hội học đã bỏ qua mối nghi ngờ của một số nhà khoa học về flo hoá.', 'Đoạn 7',
      '“sociologists have also downplayed an important part of the debate by ignoring the number of eminent scientists who have questioned aspects of fluoridation.”',
      '“ignoring” = disregarded; “scientists who have questioned” = doubts that some scientists have → YES'],
    34: ['Phát hiện của Sutton chưa được các nhà khoa học ngoài Bắc Mỹ quan tâm đúng mức.', 'Đoạn 7',
      '“Yet Sutton\'s book is not cited in a single analysis of the fluoridation issue by any sociologist.”',
      'Bài chỉ nói các nhà xã hội học không trích dẫn Sutton; không nói gì về các nhà khoa học ngoài Bắc Mỹ → NOT GIVEN'],
    35: ['Cả hai phía của cuộc tranh luận về flo hoá đều có lập luận hợp lý.', 'Đoạn 8',
      '“This difference is not between rationality and irrationality but is a legitimate difference in values”',
      '“legitimate difference in values” = khác biệt chính đáng, cả hai bên đều hợp lý → YES'],
    36: ['Quan điểm truyền thống về khoa học cho rằng…', 'Đoạn 4',
      '“The traditional view is that science is a special kind of knowledge, which is established through scientific methods and objectively applied by members of a scientific community.”',
      '“objectively applied” = khách quan, không thiên vị → B'],
    37: ['Một quan điểm xã hội học về khoa học lập luận rằng…', 'Đoạn 4',
      '“a sociology of science that shows how scientific knowledge is socially negotiated, and inevitably linked to the values of the relevant parties, both scientists and nonscientists.”',
      '“linked to the values of the relevant parties, both scientists and nonscientists” = bị ảnh hưởng bởi niềm tin của mọi bên liên quan → G'],
    38: ['Collins cho rằng…', 'Đoạn 5',
      '“the outcome of experiments was not something whose meaning could be immediately comprehended, but rather something for interpretation, discussion between scientists, and reinterpretation”',
      '“not … immediately comprehended” = không phải lúc nào cũng hiểu ngay từ đầu → A'],
    39: ['Tác giả cho rằng người ủng hộ flo hoá có thể kết luận…', 'Đoạn 7',
      '“The evidence for the benefits of fluoridation is quite substantial, while the evidence for harm is limited and dubious. I think the likely benefits outweigh the possible dangers”',
      'Bằng chứng về tác hại “limited and dubious” → không đủ cơ sở để thận trọng (không cần dè dặt) → D'],
    40: ['Tác giả cho rằng người phản đối flo hoá có thể kết luận…', 'Đoạn 7',
      '“Therefore I oppose fluoridation of water supplies and favor the voluntary use of fluoride tablets by those who want to take them.”',
      '“voluntary use … by those who want to take them” = mọi người được tự chọn có dùng flo hay không. (E sai: họ chỉ nói “some slight chance of harm”, không phải tác hại nghiêm trọng.) → C'],
  },
};
