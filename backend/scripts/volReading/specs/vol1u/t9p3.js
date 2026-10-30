// Vol 1 - Test 9 UPDATE — Reading Passage 3 (Vol 7 folder "Reading/các đề update web khác trên bản pdf/Reading khác bản pdf
// update/VOL 1 TEST 9 READING.docx", typed; P1 Tuatara + P2 Tasmanian Tiger = the bank passages already in Vol 1 - Test 9).
// Not in the bank / mini-ielts. This 14-question passage replaces "The Cane Toad in Australia" (13 q + the example turned into
// Q27), so the test has its own Q27–40. Key = "giải thích reading/giải thích vol1 test9.docx", checked against the passage: all correct.
// Q36–40: the list printed A, B, C, E, F, G, H (no D; no copy online) → relettered A–G, key B, H, E, G, F → B, G, D, F, E.
// Text fixes: "1982 In" → in, "Vandal Squad state" → states, "Graft has a multitude" → Graffiti, "heard Kids" → heard. Kids,
// "young people, Private" → . Private, "Phun Phactony" → Phactory, DiLillo "eliminate the legal graffiti" → illegal (the point
// of a legal place to paint; the key file says the same), "graft artists" → graffiti artists, "bonds, By" → . By.
// Questions: "graffitis started" → graffiti, "Pat Dililo" / "DiLiio" → DiLillo, "artistic ments" → merits, "teenage lack" →
// teenagers lack, stray full stops after "states that" / "because".
const { mc, ynng, endings } = require('../../vr_build');
module.exports = {
  vol: '1u', test: 9, part: 3, title: 'Graffiti in New York City', text: 't9p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['The broken windows theory states that', [
        'poor neighbourhoods have high crime rates.', 'crime rates rise unless small offences are dealt with.',
        'the destruction of property is a serious form of crime.', 'authorities should prioritise crimes where people are physically hurt.']],
      ['The writer states that graffiti started in New York because', [
        'more people came to live in the city.', 'young people were competing to be the best graffiti artist.',
        'people realized that graffiti was less harmful than advertising.', 'young people adopted the publicity tactics of companies.']],
      ['According to Pat DiLillo, what is the answer to New York’s graffiti problem?', [
        'designating special areas for graffiti', 'showing people the artistic merits of graffiti',
        'giving teenagers activities other than graffiti', 'covering up illegal graffiti as soon as it appears']],
      ['In the final paragraph, the writer recommends that the city authorities should', [
        'examine the real causes of graffiti', 'develop a connection with graffiti artists',
        'work with young gang members to prevent crime', 'consider the problems that are faced by graffiti artists.']],
    ]),
    ynng(31, [
      'There is clear proof that the application of the ‘broken windows’ theory led to a lower crime rate in New York.',
      'City administrators fail to distinguish between graffiti as vandalism and graffiti-art.',
      'The graffiti-art that can be found in New York is of the highest standard in the world.',
      'Graffiti might be an important way of raising New York’s profile as a unique city.',
      'Graffiti has had minimal impact on the art world.',
    ]),
    endings(36, [
      'graffiti has the capacity to transform a dull city environment.',
      'graffiti creates an impression that the law is not being obeyed in the community.',
      'graffiti will never be accepted by the public as a real form of art.',
      'some individuals do not see the beauty of graffiti because of their backgrounds.',
      'teenagers lack suitable ways to spend their time.',
      'graffiti artists are motivated by the need to have their work acknowledged.',
      'graffiti results in great monetary cost to New York and its citizens.',
    ], [
      'Lieutenant Steve Mona holds the opinion that',
      'The Mayor of New York states that',
      'Graffiti artist Dmitri Wright thinks that',
      'King Bee is a New York graffiti artist who believes',
      'Pat DiLillo of the Phun Phactory claims',
    ]),
  ],
  key: { 27: 'B', 28: 'D', 29: 'A', 30: 'B', 31: 'NO', 32: 'YES', 33: 'NOT GIVEN', 34: 'YES', 35: 'NO',
    36: 'B', 37: 'G', 38: 'D', 39: 'F', 40: 'E' },
  expl: {
    27: ['Thuyết “cửa sổ vỡ” cho rằng', 'Đoạn 1',
      '“argues that petty non-violent crimes such as the creation of graffiti increase overall crime. The theory reasons that if minor signs of disorder such as broken windows and graffiti are left unfixed, potential criminals assume that chaos reigns, and commit more crimes.”',
      'Nếu các dấu hiệu vi phạm nhỏ không được xử lý (left unfixed) thì tội phạm sẽ tăng → B'],
    28: ['Tác giả nói graffiti bắt đầu ở New York vì', 'Đoạn 6',
      '“Graffiti grew in part out of a reaction to the fact that the city was becoming covered in advertisements.” … “It was a natural progression that the youth of the day would use the same tools to sell themselves that the corporations were using to sell products to the public.”',
      'Giới trẻ dùng chính công cụ quảng bá của các công ty để “bán” bản thân = áp dụng chiến thuật quảng cáo của doanh nghiệp → D'],
    29: ['Theo Pat DiLillo, giải pháp cho vấn đề graffiti của New York là gì?', 'Đoạn 7',
      '“The most common alternative suggested is creating a legitimate outlet for the graffiti urges of young people” … “I figured if I created a place for the young people to paint [graffiti], then it would eliminate the illegal graffiti.”',
      'Tạo một nơi riêng để giới trẻ vẽ hợp pháp = chỉ định khu vực đặc biệt cho graffiti. C sai vì ông không đưa ra hoạt động khác thay graffiti → A'],
    30: ['Ở đoạn cuối, tác giả khuyên chính quyền thành phố nên', 'Đoạn 8',
      '“ties between the city and graffiti artists are rarely sought and never formed” … “By providing a legal medium for the artistic impulses of the city’s youth, the city could form a relationship with that generation”',
      'Tác giả muốn thành phố xây dựng mối quan hệ (form a relationship) với các nghệ sĩ graffiti trẻ → B'],
    31: ['Có bằng chứng rõ ràng rằng việc áp dụng thuyết “cửa sổ vỡ” đã làm giảm tỷ lệ tội phạm ở New York.', 'Đoạn 2',
      '“while the application of the ‘broken windows’ thesis is credited by some as causing the fall in crime in New York, there is little evidence supporting this.”',
      'Tác giả nói có rất ít bằng chứng (little evidence), trái với “clear proof” → NO'],
    32: ['Các nhà quản lý thành phố không phân biệt graffiti phá hoại với nghệ thuật graffiti.', 'Đoạn 3',
      '“City administrators lump together all forms of graffiti: artistic, meaningful, and gang- or drug-related, into one undesirable group. This oversimplifies the realities of street art.”',
      '“lump together all forms” = gộp chung mọi loại vào một nhóm, tức không phân biệt → YES'],
    33: ['Nghệ thuật graffiti ở New York đạt tiêu chuẩn cao nhất thế giới.', 'Đoạn 4',
      '“The beautiful graffiti-art that can be found today throughout the city, on commissioned walls and in art galleries, is an expression of New York like no other art form.”',
      'Tác giả khen graffiti New York đẹp và đặc trưng nhưng không so sánh với graffiti nơi khác trên thế giới → NOT GIVEN'],
    34: ['Graffiti có thể là một cách quan trọng để nâng cao hình ảnh của New York như một thành phố độc đáo.', 'Đoạn 4',
      '“Surely, in the right context, graffiti-art can become a powerful tool to promote New York City’s identity and originality.”',
      '“a powerful tool to promote … identity and originality” = cách quan trọng để quảng bá nét riêng, độc đáo của thành phố → YES'],
    35: ['Graffiti có ảnh hưởng rất nhỏ đến giới nghệ thuật.', 'Đoạn 4',
      '“its influence on the art world is increasingly present” … “Today, New York graffiti-art on canvas can sell for tens of thousands of dollars.”',
      'Ảnh hưởng của graffiti lên giới nghệ thuật ngày càng rõ, tranh bán được hàng chục nghìn đô, trái với “minimal impact” → NO'],
    36: ['Trung úy Steve Mona cho rằng …', 'Đoạn 1',
      '“Graffiti gives the look of disorder, as if nobody is in control.”',
      '“look of disorder, as if nobody is in control” = tạo ấn tượng luật pháp không được tuân thủ trong cộng đồng → B'],
    37: ['Thị trưởng New York nói rằng …', 'Đoạn 2',
      '“The Mayor also argues that it causes millions of dollars of damage to property holders and to the city”',
      '“millions of dollars of damage” = tổn thất tiền bạc lớn cho thành phố và người dân → G'],
    38: ['Nghệ sĩ graffiti Dmitri Wright nghĩ rằng …', 'Đoạn 3',
      '“It is absolutely spectacular, but sometimes people can\'t get past their own culture.”',
      'Một số người không thấy được vẻ đẹp của graffiti vì không vượt qua được nền văn hóa của mình (their backgrounds) → D'],
    39: ['King Bee, một nghệ sĩ graffiti New York, tin rằng …', 'Đoạn 5',
      '“They all seek recognition for their creativity in the who\'s who in the graffiti game.”',
      '“seek recognition for their creativity” = động lực là muốn tác phẩm được công nhận → F'],
    40: ['Pat DiLillo của Phun Phactory khẳng định …', 'Đoạn 7',
      '“Many of these artists start out as vandals. There is nothing for them to do; there\'s no youth program or anything.”',
      '“nothing for them to do; no youth program” = thanh thiếu niên thiếu cách tiêu thời gian phù hợp → E'],
  },
};
