// Vol 6 - Read/R-TEST 5.pdf - Reading Passage 3 (PDF p9–12). Not in the bank / mini-ielts. Text = Full Reading.docx, checked
// against the PDF; punctuation slips fixed ("affecting he scope", "within as strictly defined", "79AD. supply", stray "**"
// with no footnote). Key = Read/expl 5-6.pdf (Q27–30 = the option printed in bold), checked against the passage:
// Q36 Vol NOT GIVEN → NO (the peasant could not enjoy the activities "available in even the poorest of cities" — so they were
// not limited to Rome); Q38 Vol B "setting" → H "period" ("a limited ___ in Roman history" = the chosen generation).
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 6, test: 5, part: 3, title: 'Looking at daily life in ancient Rome', text: 't5p3.txt',
  groups: [
    mc(27, [
      ['What does the writer say about the period mentioned in the second paragraph?', [
        'There was a high level of immigration into Rome.', 'The export of minerals made Rome rich.',
        'Rome sent armies to control trade with India and East Asia.', 'The Roman standard of living reached its highest level.']],
      ['Ostia is mentioned as', [
        'a city which often features in literature.', 'an important area for archaeological research.',
        'the birthplace of a Roman Emperor.', 'a city whose layout was similar to that of Rome.']],
      ['The statement that \'Fortune has favoured the historian of this time\' refers to the fact that', [
        'historians of this period have become wealthy as a result of their discoveries.', 'works on this period are popular among the reading public.',
        'a wide range of sources is available for this period.', 'this period has been less studied than many others.']],
      ['In comparing urban and rural life in the Roman Empire, the writer states that', [
        'rural Romans were largely illiterate.', 'rural life and urban life had little in common.',
        'little information is available concerning rural life.', 'most readers of history are more interested in city life.']],
    ]),
    ynng(31, [
      'Rome\'s conquest of Arabia resulted in large-scale immigration from the east into Rome.',
      'More can be learned about Roman life from the literature of the period studied in this book than from later Latin literature.',
      'Discoveries at Herculaneum and Pompeii showed that certain beliefs about Roman life were wrong.',
      'Roman peasants provided assistance to the Empire when it was attacked.',
      'Rural inhabitants of the Roman Empire had a difficult life.',
      'Entertainment facilities were limited to the city of Rome itself.',
    ]),
    summary(37, 40, 'It was important for the writer to limit several aspects of his __Q37__. He decided to focus on a limited __Q38__ in Roman history, and to concentrate on the section of the population who were __Q39__. The writer was interested in the physical environment, the people that ruled the country and the __Q40__ that contributed both to Rome\'s strength and to its weaknesses.',
      ['emperors', 'setting', 'values', 'peasants', 'city-dwellers', 'social classes', 'myths', 'period', 'investigation'],
      { title: 'The scope of the writer\'s study' }),
  ],
  key: { 27: 'D', 28: 'B', 29: 'C', 30: 'B', 31: 'NOT GIVEN', 32: 'YES', 33: 'NOT GIVEN', 34: 'NO', 35: 'YES', 36: 'NO',
    37: 'investigation', 38: 'period', 39: 'city-dwellers', 40: 'values' },
  expl: {
    27: ['Tác giả nói gì về giai đoạn được nhắc đến ở đoạn thứ hai?', 'Đoạn 2',
      '“This generation saw the Roman Empire at its most powerful and prosperous.” … “In the material domain, this generation attained the pinnacle of ancient civilization.”',
      '“most powerful and prosperous”, “attained the pinnacle” về vật chất = mức sống đạt đỉnh cao nhất. B sai: khoáng sản được đưa vào (brought into) chứ không xuất khẩu → D'],
    28: ['Ostia được nhắc đến như là …', 'Đoạn 3',
      '“supply an immense fund of archaeological evidence. Later excavations have also restored to us the ruins of the city of Ostia”',
      'Các cuộc khai quật (excavations) ở Ostia, cùng với Herculaneum, Pompeii, cung cấp bằng chứng khảo cổ = an important area for archaeological research → B'],
    29: ['Câu “Fortune has favoured the historian of this time” nói đến thực tế rằng …', 'Đoạn 3',
      '“this generation is the one whose records combine to offer us the most complete picture of Roman life that we possess. We have a profusion of vivid and picturesque descriptions” … “supply an immense fund of archaeological evidence.”',
      'Nhiều văn bản (Martial, Juvenal, Pliny) và rất nhiều bằng chứng khảo cổ = a wide range of sources is available → C'],
    30: ['Khi so sánh đời sống thành thị và nông thôn, tác giả cho rằng …', 'Đoạn 4',
      '“there remains a significant difference between rural existence and the excitement of city life: a much greater gulf separated the peasant from the townsman of antiquity.”',
      '“a much greater gulf” (khoảng cách rất lớn) = rural life and urban life had little in common → B'],
    31: ['Việc La Mã chinh phục Ả Rập dẫn đến làn sóng nhập cư lớn từ phương Đông vào Rome.', 'Đoạn 2',
      '“the conquest of Arabia, which helped to bring the riches of India and East Asia flooding into Rome.”',
      'Chỉ có của cải (riches) đổ về Rome, bài không nói gì về người nhập cư → NOT GIVEN'],
    32: ['Có thể biết về đời sống La Mã qua văn học của thời kỳ được nghiên cứu nhiều hơn so với văn học Latin về sau.', 'Đoạn 3',
      '“By a fortunate coincidence - all the more fortunate in that Latin literature was soon to run nearly dry - this generation is the one whose records combine to offer us the most complete picture of Roman life that we possess.”',
      'Văn học Latin sau đó “run nearly dry” (gần như cạn kiệt), còn thế hệ này cho bức tranh đầy đủ nhất → YES'],
    33: ['Các phát hiện ở Herculaneum và Pompeii cho thấy một số niềm tin về đời sống La Mã là sai.', 'Đoạn 3',
      '“the ruins of Herculaneum and Pompeii … supply an immense fund of archaeological evidence.”',
      'Chỉ nói cung cấp nhiều bằng chứng khảo cổ, không nói chúng bác bỏ quan niệm nào → NOT GIVEN'],
    34: ['Nông dân La Mã đã giúp Đế chế khi Đế chế bị tấn công.', 'Đoạn 4',
      '“When the barbarian forces began to invade Roman territory, the peasants decided to fight alongside them.”',
      'Nông dân chiến đấu cùng quân man di (“them” = the barbarian forces) chống lại La Mã → NO'],
    35: ['Cư dân nông thôn của Đế chế La Mã có cuộc sống khó khăn.', 'Đoạn 5',
      '“The peasant knew nothing but unending labour without profit and was unable to enjoy the activities available in even the poorest of cities”',
      'Lao động không ngừng mà không có lợi lộc, không được hưởng các thú vui → a difficult life → YES'],
    36: ['Các tiện ích giải trí chỉ có ở thành phố Rome.', 'Đoạn 5',
      '“was unable to enjoy the activities available in even the poorest of cities: the liveliness of the sports field, the warmth of the public baths and the magnificence of public spectacles.”',
      'Sân thể thao, nhà tắm công cộng, các buổi biểu diễn có ở “even the poorest of cities” → không chỉ riêng Rome (file key của Vol ghi NOT GIVEN) → NO'],
    37: ['Tác giả cần giới hạn một số khía cạnh trong ______ của mình.', 'Đoạn 1, 2 và 4',
      '“we must study it within a strictly defined time.” … “It would lack foundation and consistency if we did not also focus it in space”',
      'Tác giả giới hạn cuộc nghiên cứu (study) cả về thời gian lẫn không gian = his investigation → investigation'],
    38: ['Ông quyết định tập trung vào một ______ giới hạn trong lịch sử La Mã.', 'Đoạn 2',
      '“Since a choice of time must necessarily be made, this history will confine itself to studying the generation which was born about the middle of the first century AD”',
      '“a choice of time”, “confine itself to … the generation” = a limited period (B “setting” trong file key của Vol là bối cảnh/không gian, không hợp với “in Roman history”) → period'],
    39: ['… và tập trung vào bộ phận dân cư là ______.', 'Đoạn 5',
      '“The time which we have chosen to describe day by day is that of those Roman subjects who spent their time exclusively in the town, or rather in The City, Rome”',
      'Những người sống hoàn toàn ở thành phố = city-dwellers → city-dwellers'],
    40: ['Tác giả quan tâm đến môi trường vật chất, những người cai trị và ______ góp phần tạo nên cả sức mạnh lẫn điểm yếu của Rome.', 'Đoạn 6',
      '“We must also investigate the moral background of thought and sentiment which can help explain both its strength and its weaknesses.”',
      '“the moral background of thought and sentiment” = các giá trị (values) → values'],
  },
};
