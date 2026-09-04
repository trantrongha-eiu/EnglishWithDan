'use strict';

// ══════════════════════════════════════════════════════════════════════
// "Viết câu nâng cao" — BÀI TẬP LUYỆN DỊCH IELTS · NGỮ PHÁP NÂNG BAND
// 12 grammar-structure groups · 73 Việt→Anh translation sentences.
// Source: the teacher's worksheet + "ĐÁP ÁN GỢI Ý" (Band 7+ models).
//
// `answerEn` is ONE natural phrasing, not the only correct answer — the
// service grades near-variants (advSentenceService.gradeTranslation).
// `hintWords` = the worksheet "Hint:" line, split on " · ".
// Groups map to 6 "weeks", 2 groups each (slotInWeek 1|2).
// ══════════════════════════════════════════════════════════════════════

module.exports = [
  {
    code: 'complex-sentences',
    order: 1, week: 1, slotInWeek: 1,
    nameVi: 'Câu phức', nameEn: 'Complex Sentences', emoji: '🧩',
    targetStructure: 'Sử dụng: although, because, since, while, as, if...',
    sentences: [
      {
        order: 1,
        promptVi: 'Mặc dù giáo dục trực tuyến mang lại sự linh hoạt, nó không thể hoàn toàn thay thế sự tương tác trực tiếp giữa giáo viên và học sinh.',
        answerEn: 'Although online education offers flexibility, it cannot completely replace face-to-face interaction between teachers and students.',
        hintWords: ['online education', 'offer flexibility', 'face-to-face interaction', 'completely replace'],
      },
      {
        order: 2,
        promptVi: 'Vì giao thông công cộng ở nhiều thành phố vẫn chưa phát triển đầy đủ, nhiều người buộc phải sử dụng phương tiện cá nhân.',
        answerEn: 'Because public transport systems in many cities are still underdeveloped, many people are forced to use private vehicles.',
        hintWords: ['public transport system', 'underdeveloped', 'be forced to', 'private vehicles'],
      },
      {
        order: 3,
        promptVi: 'Trong khi công nghệ có thể giúp học sinh tiếp cận thông tin nhanh chóng, việc sử dụng nó quá mức có thể làm giảm khả năng tập trung.',
        answerEn: 'While technology can help students access information quickly, excessive use of it may reduce their ability to concentrate.',
        hintWords: ['access information', 'excessive use', "reduce one's ability to concentrate"],
      },
      {
        order: 4,
        promptVi: 'Nếu chính phủ không có những biện pháp hiệu quả, tình trạng ô nhiễm không khí có thể trở nên nghiêm trọng hơn trong tương lai.',
        answerEn: 'If governments do not take effective measures, air pollution may become more serious in the future.',
        hintWords: ['take effective measures', 'air pollution', 'become more serious'],
      },
      {
        order: 5,
        promptVi: 'Mặc dù nhiều người muốn sống ở các thành phố lớn, chi phí sinh hoạt cao khiến cuộc sống đô thị trở nên khó khăn đối với một số gia đình.',
        answerEn: 'Although many people want to live in large cities, the high cost of living makes urban life difficult for some families.',
        hintWords: ['the high cost of living', 'urban life', 'make sth difficult for sb'],
      },
    ],
  },

  {
    code: 'compound-sentences',
    order: 2, week: 1, slotInWeek: 2,
    nameVi: 'Câu ghép', nameEn: 'Compound Sentences', emoji: '🔗',
    targetStructure: 'Sử dụng: and, but, so, yet; hoặc dấu chấm phẩy với however, therefore, nevertheless...',
    sentences: [
      {
        order: 1,
        promptVi: 'Chính phủ đã đầu tư một khoản tiền lớn vào hệ thống giao thông công cộng, nhưng tình trạng tắc nghẽn vẫn chưa được cải thiện đáng kể.',
        answerEn: 'The government has invested a large amount of money in public transport systems, but traffic congestion has not improved significantly.',
        hintWords: ['invest a large amount of money in', 'traffic congestion', 'improve significantly'],
      },
      {
        order: 2,
        promptVi: 'Các phương tiện truyền thông xã hội giúp mọi người duy trì liên lạc với nhau, nhưng chúng cũng có thể làm giảm chất lượng của các mối quan hệ trực tiếp.',
        answerEn: 'Social media enables people to stay in touch with one another, but it can also reduce the quality of face-to-face relationships.',
        hintWords: ['enable sb to', 'stay in touch with one another', 'the quality of face-to-face relationships'],
      },
      {
        order: 3,
        promptVi: 'Nhiều sinh viên muốn học đại học, vì vậy các trường đại học đang phải đối mặt với số lượng đơn đăng ký ngày càng tăng.',
        answerEn: 'Many students want to pursue higher education, so universities are facing an increasing number of applications.',
        hintWords: ['pursue higher education', 'face', 'an increasing number of applications'],
      },
      {
        order: 4,
        promptVi: 'Xe điện tạo ra ít khí thải hơn; tuy nhiên, giá thành cao vẫn khiến nhiều người không thể mua chúng.',
        answerEn: 'Electric vehicles produce fewer emissions; however, their high cost still prevents many people from purchasing them.',
        hintWords: ['electric vehicles', 'produce fewer emissions', 'prevent sb from V-ing', 'purchase'],
      },
      {
        order: 5,
        promptVi: 'Dân số đô thị đang tăng nhanh, và điều này tạo ra áp lực lớn lên hệ thống nhà ở và dịch vụ công cộng.',
        answerEn: 'Urban populations are growing rapidly, and this places considerable pressure on housing and public services.',
        hintWords: ['urban population', 'grow rapidly', 'place pressure on', 'public services'],
      },
    ],
  },

  {
    code: 'conditional-sentences',
    order: 3, week: 2, slotInWeek: 1,
    nameVi: 'Câu điều kiện', nameEn: 'Conditional Sentences', emoji: '🔀',
    targetStructure: 'Sử dụng: If (loại 1, 2, 3), Unless, Provided that...',
    sentences: [
      {
        order: 1,
        promptVi: 'Nếu chính phủ đầu tư nhiều hơn vào giáo dục công, mọi trẻ em sẽ có cơ hội tiếp cận nền giáo dục chất lượng cao hơn.',
        answerEn: 'If governments invested more in public education, every child would have access to higher-quality education.',
        hintWords: ['invest in public education', 'have access to', 'higher-quality education'],
      },
      {
        order: 2,
        promptVi: 'Nếu mọi người tiếp tục phụ thuộc vào xe hơi cá nhân, tình trạng ùn tắc giao thông sẽ trở nên nghiêm trọng hơn.',
        answerEn: 'If people continue to rely on private cars, traffic congestion will become more serious.',
        hintWords: ['rely on', 'private cars', 'traffic congestion'],
      },
      {
        order: 3,
        promptVi: 'Nếu các thành phố đầu tư nhiều hơn vào hệ thống tàu điện ngầm, lượng khí thải từ phương tiện giao thông có thể giảm đáng kể.',
        answerEn: 'If cities invested more in metro systems, emissions from transportation could be reduced significantly.',
        hintWords: ['metro system', 'emissions from transportation', 'be reduced significantly'],
      },
      {
        order: 4,
        promptVi: 'Nếu các công ty cho phép nhân viên làm việc từ xa, nhiều người sẽ có sự cân bằng tốt hơn giữa công việc và cuộc sống.',
        answerEn: 'If companies allowed employees to work remotely, many people would achieve a better work-life balance.',
        hintWords: ['allow sb to work remotely', 'achieve a better work-life balance'],
      },
      {
        order: 5,
        promptVi: 'Trừ khi các biện pháp nghiêm ngặt được thực hiện, lượng rác thải nhựa sẽ tiếp tục tăng trong những năm tới.',
        answerEn: 'Unless strict measures are taken, the amount of plastic waste will continue to increase in the coming years.',
        hintWords: ['unless', 'strict measures are taken', 'plastic waste', 'in the coming years'],
      },
      {
        order: 6,
        promptVi: 'Nếu chính phủ đã giải quyết vấn đề này sớm hơn, nhiều hậu quả tiêu cực có thể đã được ngăn chặn.',
        answerEn: 'If governments had addressed this issue earlier, many negative consequences could have been prevented.',
        hintWords: ['address an issue', 'negative consequences', 'could have been prevented'],
      },
    ],
  },

  {
    code: 'passive-voice',
    order: 4, week: 2, slotInWeek: 2,
    nameVi: 'Câu bị động', nameEn: 'Passive Voice', emoji: '🔄',
    targetStructure: 'Sử dụng: should be + V3, have been + V3, It is widely acknowledged that...',
    sentences: [
      {
        order: 1,
        promptVi: 'Những quy định nghiêm ngặt hơn nên được ban hành để giảm lượng khí thải từ các nhà máy.',
        answerEn: 'Stricter regulations should be introduced to reduce emissions from factories.',
        hintWords: ['stricter regulations', 'be introduced', 'emissions from factories'],
      },
      {
        order: 2,
        promptVi: 'Nhiều biện pháp đã được đề xuất nhằm giải quyết tình trạng thiếu nhà ở tại các thành phố lớn.',
        answerEn: 'A number of measures have been proposed to address the housing shortage in large cities.',
        hintWords: ['a number of measures', 'be proposed', 'address the housing shortage'],
      },
      {
        order: 3,
        promptVi: 'Người ta thừa nhận rộng rãi rằng giáo dục đóng vai trò quan trọng trong sự phát triển của một quốc gia.',
        answerEn: 'It is widely acknowledged that education plays an important role in the development of a country.',
        hintWords: ['it is widely acknowledged that', 'play an important role in'],
      },
      {
        order: 4,
        promptVi: 'Nhiều công việc đơn giản có thể được thay thế bởi trí tuệ nhân tạo trong tương lai.',
        answerEn: 'Many simple jobs may be replaced by artificial intelligence in the future.',
        hintWords: ['be replaced by', 'artificial intelligence'],
      },
      {
        order: 5,
        promptVi: 'Nguồn ngân sách lớn hơn nên được phân bổ cho hệ thống y tế công cộng.',
        answerEn: 'More funding should be allocated to public healthcare systems.',
        hintWords: ['funding', 'be allocated to', 'public healthcare system'],
      },
      {
        order: 6,
        promptVi: 'Người ta thường cho rằng trẻ em nên được khuyến khích đọc sách từ khi còn nhỏ.',
        answerEn: 'It is often believed that children should be encouraged to read from an early age.',
        hintWords: ['it is often believed that', 'be encouraged to', 'from an early age'],
      },
    ],
  },

  {
    code: 'relative-clauses',
    order: 5, week: 3, slotInWeek: 1,
    nameVi: 'Mệnh đề quan hệ', nameEn: 'Relative Clauses', emoji: '🧵',
    targetStructure: 'Chú ý sử dụng: who, which, where, whose...',
    sentences: [
      {
        order: 1,
        promptVi: 'Làm việc từ xa giúp người lao động tiết kiệm thời gian đi lại, điều này có thể cải thiện chất lượng cuộc sống của họ.',
        answerEn: 'Remote working helps employees save commuting time, which can improve their quality of life.',
        hintWords: ['remote working', 'commuting time', ', which', 'quality of life'],
      },
      {
        order: 2,
        promptVi: 'Những học sinh được tiếp cận công nghệ hiện đại thường có nhiều cơ hội học tập hơn.',
        answerEn: 'Students who have access to modern technology often have more learning opportunities.',
        hintWords: ['who', 'have access to', 'learning opportunities'],
      },
      {
        order: 3,
        promptVi: 'Nhiều người muốn chuyển đến các thành phố lớn, nơi có nhiều cơ hội việc làm hơn.',
        answerEn: 'Many people want to move to large cities, where there are more employment opportunities.',
        hintWords: ['move to', ', where', 'employment opportunities'],
      },
      {
        order: 4,
        promptVi: 'Việc sử dụng xe đạp ngày càng phổ biến, điều này có thể giúp giảm tình trạng ô nhiễm không khí.',
        answerEn: 'The use of bicycles is becoming increasingly popular, which can help reduce air pollution.',
        hintWords: ['increasingly popular', ', which', 'reduce air pollution'],
      },
      {
        order: 5,
        promptVi: 'Trẻ em có cha mẹ thường xuyên đọc sách cùng chúng có xu hướng phát triển kỹ năng ngôn ngữ tốt hơn.',
        answerEn: 'Children whose parents regularly read with them tend to develop better language skills.',
        hintWords: ['whose', 'tend to', 'develop language skills'],
      },
      {
        order: 6,
        promptVi: 'Nhiều quốc gia đang đầu tư vào năng lượng tái tạo, điều này giúp giảm sự phụ thuộc vào nhiên liệu hóa thạch.',
        answerEn: 'Many countries are investing in renewable energy, which helps reduce their dependence on fossil fuels.',
        hintWords: ['renewable energy', ', which', 'dependence on fossil fuels'],
      },
    ],
  },

  {
    code: 'inversion',
    order: 6, week: 3, slotInWeek: 2,
    nameVi: 'Đảo ngữ để nhấn mạnh', nameEn: 'Inversion', emoji: '❗',
    targetStructure: 'Sử dụng các mẫu: Not only... but also... / Never before... / Only by...',
    sentences: [
      {
        order: 1,
        promptVi: 'Chính sách này không chỉ giúp giảm ùn tắc giao thông mà còn cải thiện chất lượng không khí tại các thành phố lớn.',
        answerEn: 'Not only does this policy help reduce traffic congestion, but it also improves air quality in large cities.',
        hintWords: ['not only does ... but ... also', 'traffic congestion', 'air quality'],
      },
      {
        order: 2,
        promptVi: 'Chưa bao giờ con người có thể tiếp cận một lượng thông tin lớn như hiện nay.',
        answerEn: 'Never before have people had access to such a vast amount of information.',
        hintWords: ['never before have', 'have access to', 'a vast amount of information'],
      },
      {
        order: 3,
        promptVi: 'Chỉ bằng cách đầu tư vào giao thông công cộng, các thành phố mới có thể giải quyết vấn đề ùn tắc trong dài hạn.',
        answerEn: 'Only by investing in public transport can cities solve the problem of traffic congestion in the long term.',
        hintWords: ['only by V-ing can', 'solve the problem of', 'in the long term'],
      },
      {
        order: 4,
        promptVi: 'Công nghệ không chỉ thay đổi cách con người làm việc mà còn thay đổi cách họ giao tiếp.',
        answerEn: 'Not only has technology changed the way people work, but it has also transformed the way they communicate.',
        hintWords: ['not only has ... but ... also', 'the way people work', 'transform'],
      },
      {
        order: 5,
        promptVi: 'Chỉ bằng cách nâng cao nhận thức của công chúng, chúng ta mới có thể khuyến khích mọi người bảo vệ môi trường.',
        answerEn: 'Only by raising public awareness can we encourage people to protect the environment.',
        hintWords: ['only by V-ing can', 'raise public awareness', 'encourage sb to'],
      },
    ],
  },

  {
    code: 'cleft-sentences',
    order: 7, week: 4, slotInWeek: 1,
    nameVi: 'Câu chẻ', nameEn: 'Cleft Sentences', emoji: '✂️',
    targetStructure: 'Sử dụng: It is/was ... that/who ... | What ... is/was ...',
    sentences: [
      {
        order: 1,
        promptVi: 'Chính sự thiếu hụt nhà ở giá rẻ là nguyên nhân khiến nhiều người trẻ gặp khó khăn khi sống ở thành phố.',
        answerEn: 'It is the lack of affordable housing that makes it difficult for many young people to live in cities.',
        hintWords: ['it is ... that', 'the lack of affordable housing', 'make it difficult for sb to'],
      },
      {
        order: 2,
        promptVi: 'Điều mà nhiều học sinh cần không phải là nhiều bài tập hơn mà là sự hướng dẫn hiệu quả hơn từ giáo viên.',
        answerEn: 'What many students need is not more homework but more effective guidance from teachers.',
        hintWords: ['what ... need is', 'not ... but', 'effective guidance'],
      },
      {
        order: 3,
        promptVi: 'Chính sự phát triển nhanh chóng của công nghệ đã thay đổi cách mọi người tiếp cận giáo dục.',
        answerEn: 'It is the rapid development of technology that has changed the way people access education.',
        hintWords: ['it is ... that', 'the rapid development of', 'access education'],
      },
      {
        order: 4,
        promptVi: 'Điều mà các thành phố cần làm là đầu tư nhiều hơn vào cơ sở hạ tầng công cộng.',
        answerEn: 'What cities need to do is invest more in public infrastructure.',
        hintWords: ['what ... need to do is', 'public infrastructure'],
      },
      {
        order: 5,
        promptVi: 'Chính việc thiếu thời gian là lý do khiến nhiều người không thể duy trì một lối sống lành mạnh.',
        answerEn: 'It is the lack of time that prevents many people from maintaining a healthy lifestyle.',
        hintWords: ['it is ... that', 'the lack of time', 'prevent sb from', 'maintain a healthy lifestyle'],
      },
    ],
  },

  {
    code: 'parallel-structures',
    order: 8, week: 4, slotInWeek: 2,
    nameVi: 'Cấu trúc song song', nameEn: 'Parallel Structures', emoji: '⚖️',
    targetStructure: 'Các thành phần liệt kê phải cùng dạng: V-ing / to V / danh từ / tính từ.',
    sentences: [
      {
        order: 1,
        promptVi: 'Chính phủ nên đầu tư để cải thiện hệ thống giáo dục, giảm tỷ lệ thất nghiệp và nâng cao chất lượng cuộc sống của người dân.',
        answerEn: "Governments should invest in improving the education system, reducing unemployment, and enhancing people's quality of life.",
        hintWords: ['improving the education system', 'reducing unemployment', 'enhancing quality of life'],
      },
      {
        order: 2,
        promptVi: 'Chương trình này nhằm giảm lượng rác thải, bảo vệ môi trường và khuyến khích người dân tái chế.',
        answerEn: 'This programme aims to reduce waste, protect the environment, and encourage people to recycle.',
        hintWords: ['aim to', 'reduce waste', 'protect the environment', 'recycle'],
      },
      {
        order: 3,
        promptVi: 'Giáo dục đại học có thể giúp sinh viên phát triển kiến thức chuyên môn, cải thiện kỹ năng tư duy phản biện và mở rộng cơ hội nghề nghiệp.',
        answerEn: 'Higher education can help students develop specialised knowledge, improve their critical-thinking skills, and expand their career opportunities.',
        hintWords: ['specialised knowledge', 'critical-thinking skills', 'expand career opportunities'],
      },
      {
        order: 4,
        promptVi: 'Một hệ thống giao thông hiệu quả cần phải nhanh chóng, đáng tin cậy và có giá cả phải chăng.',
        answerEn: 'An efficient transport system needs to be fast, reliable, and affordable.',
        hintWords: ['an efficient transport system', 'fast', 'reliable', 'affordable'],
      },
      {
        order: 5,
        promptVi: 'Các công ty nên khuyến khích nhân viên làm việc hiệu quả hơn, sử dụng thời gian hợp lý hơn và duy trì sự cân bằng giữa công việc và cuộc sống.',
        answerEn: 'Companies should encourage employees to work more efficiently, use their time more effectively, and maintain a healthy work-life balance.',
        hintWords: ['work efficiently', 'use time effectively', 'maintain a work-life balance'],
      },
    ],
  },

  {
    code: 'modal-verbs',
    order: 9, week: 5, slotInWeek: 1,
    nameVi: 'Động từ khuyết thiếu', nameEn: 'Modal Verbs', emoji: '🎚️',
    targetStructure: 'Sử dụng phù hợp: should, must, may, might, could, can, would...',
    sentences: [
      {
        order: 1,
        promptVi: 'Chính phủ nên đầu tư nhiều hơn vào năng lượng tái tạo để giảm sự phụ thuộc vào nhiên liệu hóa thạch.',
        answerEn: 'Governments should invest more in renewable energy to reduce their dependence on fossil fuels.',
        hintWords: ['should', 'renewable energy', 'dependence on fossil fuels'],
      },
      {
        order: 2,
        promptVi: 'Việc sử dụng mạng xã hội quá mức có thể ảnh hưởng tiêu cực đến sức khỏe tinh thần của người trẻ.',
        answerEn: "Excessive use of social media may negatively affect young people's well-being.",
        hintWords: ['may', 'excessive use of social media', 'negatively affect', 'well-being'],
      },
      {
        order: 3,
        promptVi: 'Các thành phố phải có những biện pháp hiệu quả để giải quyết vấn đề ùn tắc giao thông.',
        answerEn: 'Cities must take effective measures to address the problem of traffic congestion.',
        hintWords: ['must', 'take effective measures', 'address the problem of'],
      },
      {
        order: 4,
        promptVi: 'Nếu được thực hiện trên quy mô lớn, chính sách này có thể cải thiện chất lượng cuộc sống của người dân.',
        answerEn: "If implemented on a large scale, this policy could improve people's quality of life.",
        hintWords: ['if implemented on a large scale', 'could', 'quality of life'],
      },
      {
        order: 5,
        promptVi: 'Giáo dục trực tuyến có thể mang lại nhiều cơ hội hơn cho những người sống ở vùng nông thôn.',
        answerEn: 'Online education can provide more opportunities for people living in rural areas.',
        hintWords: ['can', 'provide opportunities for', 'rural areas'],
      },
      {
        order: 6,
        promptVi: 'Việc tăng thuế đối với thuốc lá có thể làm giảm số lượng người hút thuốc.',
        answerEn: 'Increasing taxes on tobacco could reduce the number of smokers.',
        hintWords: ['could', 'increase taxes on tobacco', 'the number of smokers'],
      },
    ],
  },

  {
    code: 'comparatives',
    order: 10, week: 5, slotInWeek: 2,
    nameVi: 'Cấu trúc so sánh', nameEn: 'Comparatives and Superlatives', emoji: '📊',
    targetStructure: 'Sử dụng: significantly/far/considerably + comparative | the more..., the more/less... | not nearly as...as...',
    sentences: [
      {
        order: 1,
        promptVi: 'Giao thông công cộng ở các nước phát triển thường hiệu quả hơn đáng kể so với ở các nước đang phát triển.',
        answerEn: 'Public transport in developed countries is often significantly more efficient than that in developing countries.',
        hintWords: ['significantly more efficient than', 'developed / developing countries'],
      },
      {
        order: 2,
        promptVi: 'Càng nhiều thời gian trẻ em dành cho thiết bị điện tử, chúng càng ít tham gia vào các hoạt động thể chất.',
        answerEn: 'The more time children spend on electronic devices, the less they participate in physical activities.',
        hintWords: ['the more ..., the less ...', 'electronic devices', 'physical activities'],
      },
      {
        order: 3,
        promptVi: 'Sống ở thành phố lớn thường đắt đỏ hơn nhiều so với sống ở vùng nông thôn.',
        answerEn: 'Living in a large city is often considerably more expensive than living in rural areas.',
        hintWords: ['considerably more expensive than', 'rural areas'],
      },
      {
        order: 4,
        promptVi: 'Giáo dục trực tuyến không đáng tin cậy bằng giáo dục truyền thống trong một số lĩnh vực thực hành.',
        answerEn: 'Online education is not nearly as reliable as traditional education in some practical fields.',
        hintWords: ['not nearly as reliable as', 'practical fields'],
      },
      {
        order: 5,
        promptVi: 'Càng có nhiều người sử dụng phương tiện giao thông công cộng, lượng khí thải carbon càng có thể giảm.',
        answerEn: 'The more people use public transport, the more carbon emissions can be reduced.',
        hintWords: ['the more ..., the more ...', 'carbon emissions', 'be reduced'],
      },
      {
        order: 6,
        promptVi: 'Trong nhiều trường hợp, phòng ngừa bệnh tật quan trọng hơn nhiều so với việc điều trị bệnh sau khi nó đã xảy ra.',
        answerEn: 'In many cases, preventing diseases is far more important than treating them after they have developed.',
        hintWords: ['far more important than', 'prevent diseases', 'treat'],
      },
    ],
  },

  {
    code: 'participle-clauses',
    order: 11, week: 6, slotInWeek: 1,
    nameVi: 'Cụm phân từ', nameEn: 'Participle Clauses', emoji: '🧬',
    targetStructure: 'Sử dụng: ..., thereby + V-ing | ..., allowing/enabling + sb + to V | Having + V3, ...',
    sentences: [
      {
        order: 1,
        promptVi: 'Làm việc từ xa giúp người lao động không phải di chuyển hằng ngày, từ đó giảm căng thẳng và lượng khí thải carbon.',
        answerEn: 'Remote working eliminates the need for employees to commute every day, thereby reducing stress and carbon emissions.',
        hintWords: ['eliminate the need to commute', 'thereby reducing', 'carbon emissions'],
      },
      {
        order: 2,
        promptVi: 'Các khóa học trực tuyến giúp sinh viên tiếp cận kiến thức từ bất cứ đâu, cho phép họ học tập mà không cần chuyển đến các thành phố lớn.',
        answerEn: 'Online courses provide students with access to knowledge from anywhere, allowing them to study without moving to large cities.',
        hintWords: ['provide sb with access to', 'allowing them to'],
      },
      {
        order: 3,
        promptVi: 'Chính phủ đã xây dựng thêm nhiều tuyến tàu điện ngầm, từ đó giúp giảm số lượng xe hơi trên đường.',
        answerEn: 'The government has built more metro lines, thereby helping to reduce the number of cars on the roads.',
        hintWords: ['metro lines', 'thereby helping to reduce', 'the number of cars'],
      },
      {
        order: 4,
        promptVi: 'Sau khi đầu tư mạnh vào giáo dục, quốc gia này đã đạt được những tiến bộ đáng kể về kinh tế.',
        answerEn: 'Having invested heavily in education, the country has made significant economic progress.',
        hintWords: ['having invested heavily in', 'make significant economic progress'],
      },
      {
        order: 5,
        promptVi: 'Việc sử dụng năng lượng mặt trời giúp giảm sự phụ thuộc vào nhiên liệu hóa thạch, từ đó hạn chế tác động tiêu cực đến môi trường.',
        answerEn: 'The use of solar energy reduces dependence on fossil fuels, thereby limiting negative impacts on the environment.',
        hintWords: ['solar energy', 'thereby limiting', 'negative impacts on'],
      },
      {
        order: 6,
        promptVi: 'Các ứng dụng sức khỏe cung cấp cho người dùng thông tin hữu ích, cho phép họ theo dõi tình trạng sức khỏe của mình dễ dàng hơn.',
        answerEn: 'Health applications provide users with useful information, allowing them to monitor their health more easily.',
        hintWords: ['provide users with', 'allowing them to', 'monitor their health'],
      },
    ],
  },

  {
    code: 'tense-usage',
    order: 12, week: 6, slotInWeek: 2,
    nameVi: 'Cách dùng thì', nameEn: 'Tense Usage', emoji: '⏳',
    targetStructure: 'Chọn đúng thì theo ngữ cảnh và mốc thời gian trong câu.',
    sentences: [
      {
        order: 1, structureNote: 'A. Present Simple',
        promptVi: 'Công nghệ đóng một vai trò ngày càng quan trọng trong nền giáo dục hiện đại.',
        answerEn: 'Technology plays an increasingly important role in modern education.',
        hintWords: ['play an increasingly important role in', 'modern education'],
      },
      {
        order: 2, structureNote: 'A. Present Simple',
        promptVi: 'Nhiều người tin rằng giao thông công cộng là giải pháp hiệu quả cho tình trạng ùn tắc.',
        answerEn: 'Many people believe that public transport is an effective solution to traffic congestion.',
        hintWords: ['believe that', 'an effective solution to'],
      },
      {
        order: 3, structureNote: 'A. Present Simple',
        promptVi: 'Sự phát triển kinh tế thường dẫn đến mức sống cao hơn.',
        answerEn: 'Economic development often leads to a higher standard of living.',
        hintWords: ['economic development', 'lead to', 'a higher standard of living'],
      },
      {
        order: 4, structureNote: 'B. Present Perfect',
        promptVi: 'Trong thập kỷ qua, việc học trực tuyến đã trở nên phổ biến hơn trên toàn thế giới.',
        answerEn: 'Over the past decade, online learning has become increasingly popular around the world.',
        hintWords: ['over the past decade', 'become increasingly popular'],
      },
      {
        order: 5, structureNote: 'B. Present Perfect',
        promptVi: 'Công nghệ đã thay đổi đáng kể cách mọi người giao tiếp và làm việc.',
        answerEn: 'Technology has significantly changed the way people communicate and work.',
        hintWords: ['significantly change', 'the way people communicate'],
      },
      {
        order: 6, structureNote: 'B. Present Perfect',
        promptVi: 'Trong những năm gần đây, nhiều thành phố đã đầu tư mạnh vào giao thông công cộng.',
        answerEn: 'In recent years, many cities have invested heavily in public transport.',
        hintWords: ['in recent years', 'invest heavily in'],
      },
      {
        order: 7, structureNote: 'C. Past Simple',
        promptVi: 'Trong quá khứ, phần lớn mọi người phụ thuộc vào sách và thư viện để tìm kiếm thông tin.',
        answerEn: 'In the past, most people relied on books and libraries to search for information.',
        hintWords: ['in the past', 'rely on', 'search for information'],
      },
      {
        order: 8, structureNote: 'C. Past Simple',
        promptVi: 'Trước đây, nhiều người trẻ rời quê hương để tìm kiếm cơ hội việc làm tại các thành phố lớn.',
        answerEn: 'In the past, many young people left their hometowns to seek employment opportunities in large cities.',
        hintWords: ["leave one's hometown", 'seek employment opportunities'],
      },
      {
        order: 9, structureNote: 'C. Past Simple',
        promptVi: 'Chính phủ đã triển khai một số chính sách mới để giải quyết vấn đề thất nghiệp vào năm ngoái.',
        answerEn: 'The government introduced several new policies to address unemployment last year.',
        hintWords: ['introduce policies', 'address unemployment', 'last year'],
      },
      {
        order: 10, structureNote: 'D. Future',
        promptVi: 'Nếu xu hướng này tiếp tục, các thành phố sẽ phải đối mặt với những vấn đề nghiêm trọng hơn về nhà ở trong tương lai.',
        answerEn: 'If this trend continues, cities will face more serious housing problems in the future.',
        hintWords: ['if this trend continues', 'face housing problems'],
      },
      {
        order: 11, structureNote: 'D. Future',
        promptVi: 'Công nghệ có khả năng sẽ tiếp tục thay đổi thị trường lao động trong những thập kỷ tới.',
        answerEn: 'Technology is likely to continue transforming the labour market in the coming decades.',
        hintWords: ['be likely to', 'transform the labour market', 'in the coming decades'],
      },
      {
        order: 12, structureNote: 'D. Future',
        promptVi: 'Nếu không có hành động kịp thời, biến đổi khí hậu sẽ ảnh hưởng đến cuộc sống của hàng triệu người.',
        answerEn: 'Without timely action, climate change will affect the lives of millions of people.',
        hintWords: ['without timely action', 'climate change', 'affect the lives of millions'],
      },
    ],
  },
];
