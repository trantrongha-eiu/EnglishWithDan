// Vol 8 - READING/Tets 11.pdf (Test 11) - Reading Passage 3 (PDF p7–10, text layer). Not in the bank / mini-ielts.
// Key = READING/Key.pdf (Test 11). Phrases A–H of Q37–40 are an image ("dragging each phrase" = an online-test wording) →
// a lettered word bank. Summary "tominimise" → "to minimise".
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 8, test: 11, part: 3, title: 'The Dunedin study', text: 't11p3.txt',
  groups: [
    mc(27, [
      ['What does the writer say about Dunedin in the 1970s?', [
        'It was the safest city in the country.', 'It was less prosperous than other cities.',
        'Many people were frustrated that they could not find a job.', 'It was wealthy and seen as an ideal place to raise children.']],
      ['What did the writer find surprising about Phil Silva’s original study?', [
        'That the study was held in a church.', 'That the tests took half a day.', 'That 91% of parents agreed to help.', 'That the study used volunteers.']],
      ['What was Silva\'s main finding in 1978?', [
        'Children had excellent language.', 'Many children had developmental problems.', 'No children had ear problems.', 'All children were healthy.']],
      ['What was different about the first and second studies?', [
        'The sample group was smaller in the first study.', 'The second study produced conflicting results.',
        'Helpers were not used in the second study.', 'The second study collected additional types of information.']],
      ['What problem did Silva face when conducting the original study?', [
        'A shortage of helpers.', 'A lack of available funding.', 'The bad behaviour of some children.', 'The poor language skills of the participants.']],
      ['Why does the writer mention the new building in the fourth paragraph?', [
        'To show how generous project funding had become.', 'To show that the study was being taken seriously.',
        'To emphasise the temporary nature of the facilities.', 'To highlight that the children disliked the site.']],
    ]),
    ynng(33, [
      'Recent results suggest that intellectual development and birth weight are linked.',
      'Medical textbooks used to claim that breast-fed children were more intelligent.',
      'Children who suck their thumbs are prone to developmental problems.',
      'The findings of the Dunedin study have challenged some doctors’ preconceptions.',
    ]),
    summary(37, 40, 'The success of the Dunedin project has been put down to two principal factors: good fortune and Phil Silva\'s methodology. The demographics of Dunedin mean that residents feel committed to the study, and that it also provides __Q37__ that can be applied both nationally and internationally, but even more important was Silva\'s conviction that the __Q38__ must be looked after; nothing should be done to threaten the study\'s __Q39__ and as a result Silva is cautious when questioned, and a lot of work is done to minimise __Q40__ in order to ensure that the study continues into the future.',
      ['generalisable research', 'study members', 'government funding', 'assessments', 'loyalty', 'barriers to involvement', 'confidentiality', 'results'],
      { title: 'A model study' }),
  ],
  key: { 27: 'D', 28: 'C', 29: 'B', 30: 'D', 31: 'B', 32: 'B', 33: 'YES', 34: 'NOT GIVEN', 35: 'NO', 36: 'YES',
    37: 'generalisable research', 38: 'study members', 39: 'confidentiality', 40: 'barriers to involvement' },
  expl: {
    27: ['Tác giả nói gì về Dunedin thập niên 1970?', 'Đoạn 1',
      '“New Zealand was then the ninth richest country in the world and many residents believed that, as a place to bring up children, this was a city without rival.”',
      'Giàu có (nước giàu thứ 9 thế giới) và được coi là nơi lý tưởng để nuôi dạy con (A sai: bài không so độ an toàn với thành phố khác) → D'],
    28: ['Tác giả thấy điều gì đáng ngạc nhiên về nghiên cứu ban đầu của Phil Silva?', 'Đoạn 1',
      '“Incredibly, no fewer than 91% agreed to help”',
      '“Incredibly” = đáng kinh ngạc, đi kèm 91% phụ huynh đồng ý → C'],
    29: ['Phát hiện chính của Silva năm 1978 là gì?', 'Đoạn 3',
      '“one in four children had delayed language development; 15% had ear problems; the researchers had identified one child who was blind”',
      'Chậm phát triển ngôn ngữ, vấn đề về tai, mù = nhiều trẻ gặp vấn đề phát triển → B'],
    30: ['Nghiên cứu thứ nhất và thứ hai khác nhau thế nào?', 'Đoạn 2',
      '“The data gathered at age three was updated and new measurement criteria – discipline, nutrition, dental health - were introduced.”',
      '“new measurement criteria … were introduced” = lần hai thu thập thêm loại thông tin mới (A sai: lần hai còn 96% của nhóm ban đầu) → D'],
    31: ['Silva gặp khó khăn gì khi tiến hành nghiên cứu ban đầu?', 'Đoạn 2',
      '“There was precious little money at Silva’s disposal, so the assessments were done in a church with the help of dozens of volunteers.”',
      '“precious little money” = thiếu kinh phí (có hàng chục tình nguyện viên nên A sai) → B'],
    32: ['Vì sao tác giả nhắc tới tòa nhà mới ở đoạn thứ tư?', 'Đoạn 4',
      '“Crucially for the study’s survival, the politicians were finally starting to take note … it was at least a site for the long term and its acquisition represented a landmark in the study’s development.”',
      'Chính trị gia bắt đầu chú ý, có tài trợ, có trụ sở lâu dài = nghiên cứu được coi trọng (A sai: kinh phí chỉ “trickle in”; C sai: “site for the long term”) → B'],
    33: ['Kết quả gần đây gợi ý sự phát triển trí tuệ và cân nặng khi sinh có liên quan.', 'Đoạn 5',
      '“although the amount a newborn infant weighs is associated with IQ.”',
      '“weighs is associated with IQ” = cân nặng khi sinh liên quan tới trí tuệ → YES'],
    34: ['Sách giáo khoa y khoa từng khẳng định trẻ bú sữa mẹ thông minh hơn.', 'Đoạn 5',
      '“Paediatric textbooks had insisted for years that breast-feeding protected against medical problems like asthma and allergies.”',
      'Sách nói bú mẹ chống hen suyễn, dị ứng; không nói gì về trí thông minh → NOT GIVEN'],
    35: ['Trẻ mút tay dễ gặp vấn đề phát triển.', 'Đoạn 5',
      '“Other findings that challenged the received wisdom include the fact that thumb-sucking does no harm”',
      '“thumb-sucking does no harm” = mút tay không gây hại → NO'],
    36: ['Kết quả nghiên cứu Dunedin đã thách thức định kiến của một số bác sĩ.', 'Đoạn 5',
      '“the Dunedin researchers have been able to contradict old assumptions and explode medical myths long held by the profession.”',
      '“explode medical myths long held by the profession” = phá bỏ quan niệm lâu nay của giới y khoa → YES'],
    37: ['… nghiên cứu cũng cung cấp ______ có thể áp dụng cả trong nước lẫn quốc tế', 'Đoạn 6',
      '“It is large enough to produce a study population that produces findings that can be generalised to New Zealand and other developed countries”',
      '“findings that can be generalised” = nghiên cứu có thể khái quát hóa (A) → generalisable research'],
    38: ['… Silva tin rằng ______ phải được chăm lo', 'Đoạn 7',
      '“He realised the most important asset they had was the sample group and these people must be nurtured at all costs.”',
      '“the sample group … must be nurtured” = những người tham gia nghiên cứu (B) → study members'],
    39: ['… không được làm gì đe dọa ______ của nghiên cứu, nên Silva thận trọng khi bị hỏi', 'Đoạn 7',
      '“Privacy is absolutely paramount: Silva won’t even say how many of the study members are now in prison: nothing must erode the trust that’s been built up”',
      '“Privacy is absolutely paramount” = tính bảo mật (G) → confidentiality'],
    40: ['… rất nhiều công sức được bỏ ra để giảm thiểu ______', 'Đoạn 8',
      '“This is just one example of the enormous effort that goes into maintaining contact and removing obstacles to participation.”',
      '“removing obstacles to participation” = giảm rào cản tham gia (F) → barriers to involvement'],
  },
};
