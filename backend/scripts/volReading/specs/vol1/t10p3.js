// Vol 1 - Test 10 - Reading Passage 3 (PDF p14–19). Not in the bank (mini-ielts 1449, same questions). No "READING PASSAGE 3"
// heading in the PDF. Text = mini copy (= PDF) with copy errors fixed (punctuation, "a few 11 other", "Which proposed…?").
// The de Waal paragraph is garbled in every copy ("Soon unlikely if a non-dominant male had been injured.") → completed
// following de Waal's own observation (Chimpanzee Politics, 1982: a young male adopted the limping gait of an older,
// dominant male — cited in a Queen's University Belfast paper): "Soon, a young male in the group began to copy his limp —
// something that would have been unlikely if …" (checked 2026-10-17: mini-ielts, vietop, ieltsonlinetests,
// ieltsit all print the same broken sentence; ece.edu.vn's "others began to limp" is its own guess).
// Q30 printed D ("cultural norms and relationships"), as mini-ielts and gradding.com, but the passage only says observation is
// how we "learn to communicate and perform motor skills as well as deal with many everyday problems" (+ the subway newcomer)
// → A, with D still accepted.
const { mc, ynng, endings } = require('../../vr_build');
module.exports = {
  vol: 1, test: 10, part: 3, title: 'Marketing and Mind Control', text: 't10p3.txt',
  groups: [
    mc(27, [
      ['According to the writer, which marketing technique attempts to make consumers stay in a shop for longer?', ['playing appealing music', 'emitting pleasant scents', 'displaying attractive posters', 'making in-store announcements']],
      ['The writer mentions bottled water in order to show that', ['consumers buy it because of the fact that it is marketed.', 'people purchase it despite the fact that it has no taste.', 'marketers need not do taste tests when a campaign is effective.', 'tests prove that people cannot differentiate it from tap water.']],
      ['According to the writer, socially transmitted food preference occurs when', ['only dominant members of an animal group influence what others eat.', 'the same types of animals naturally prefer the same types of food.', 'animals are influenced by what any other animals of the same species eat.', 'a food type is more desirable because an animal views that food as scarce.']],
      ['According to the writer, how is learning by observation and imitation a useful feature of the brain?', ['It helps people overcome challenges.', 'Positive models can influence social behaviour.', 'It can give an advantage when communicating with others.', 'Cultural norms and relationships can be understood more easily.']],
      ['According to the writer, how does television advertising exploit the human tendency to imitate others?', ['It shows buying behaviour that marketers want to encourage in viewers.', 'It features people who have a desirable image.', 'It shows older people whom teenagers admire.', 'It features successful people endorsing products responsible for their success.']],
    ]),
    ynng(32, [
      'The diamond campaign worked by making a connection in people’s minds between diamonds and luxury.',
      'People are more aware of visual marketing than auditory marketing.',
      'The campaign advertising diamonds had a positive influence on society.',
      'There is still some uncertainty about whether animals copy the behaviour of the most powerful animals among them.',
      'Consumers make a logical connection between celebrities’ achievements and the products they promote.',
    ]),
    endings(37, [
      'people imitated behaviour that was linked with success.',
      'younger animals of a certain species are more likely to imitate each other.',
      'an animal would imitate another that had higher status.',
      'imitation of popular sportspeople has occurred for many decades.',
      'products are marketed to potential consumers who are unaware that marketing is occurring.',
      'animals can develop new habits by observation.',
      'incentives are provided for consumers who behave in a certain way.',
    ], [
      'The behaviour of the monkeys on the island of Koshima showed that',
      'Primatologist Frans de Waal found that',
      'Dick Fosbury is mentioned in order to show that',
      'A feature of some modern marketing campaigns is that',
    ]),
  ],
  key: { 27: 'B', 28: 'A', 29: 'C', 30: 'A / D', 31: 'B', 32: 'NO', 33: 'NOT GIVEN', 34: 'NOT GIVEN', 35: 'YES', 36: 'NO', 37: 'F', 38: 'C', 39: 'A', 40: 'E' },
  expl: {
    27: ['Theo tác giả, kỹ thuật marketing nào nhằm khiến khách ở lại cửa hàng lâu hơn?', 'Đoạn 2',
      '“our olfactory system is targeted by variations of vanilla and citrus perfumes aimed at enticing us to linger in a retail outlet.”',
      '“linger in a retail outlet” = ở lại cửa hàng lâu hơn; cách làm là xịt hương vani, cam chanh = toả mùi dễ chịu → B'],
    28: ['Tác giả nhắc đến nước đóng chai để cho thấy …', 'Đoạn 2',
      '“In the case of bottled water, we are swayed by advertising into paying for something that we can obtain for free.”',
      'Ta trả tiền cho thứ có thể có miễn phí chỉ vì bị quảng cáo tác động = mua vì nó được quảng bá. D sai: bài nói các hãng hiếm khi đề nghị thử mù, không có “thử nghiệm chứng minh” → A'],
    29: ['Sở thích ăn uống lan truyền qua xã hội xảy ra khi …', 'Đoạn 3',
      '“if we put that rat with another rat that spent its day eating just one type, when faced with a choice, our rat will now show a preference for the same type as the other rat was eating.”',
      'Con chuột chịu ảnh hưởng từ món mà một con chuột bất kỳ khác ăn (không cần là con đầu đàn) → C'],
    30: ['Học bằng quan sát và bắt chước là đặc điểm hữu ích của não như thế nào?', 'Đoạn 5',
      '“this is how we learn to communicate and perform motor skills as well as deal with many everyday problems. For example, a newcomer struggling to purchase tickets and navigate the subway system in a foreign city may step back to learn from the people nearby.”',
      'Quan sát giúp ta giải quyết những khó khăn hằng ngày (ví dụ người mới đến lúng túng mua vé tàu điện) = vượt qua thử thách. Bài không nói về “chuẩn mực văn hoá và các mối quan hệ”. (Key in của đề ghi D; vẫn chấm đúng cả D.) → A'],
    31: ['Quảng cáo truyền hình khai thác xu hướng bắt chước của con người thế nào?', 'Đoạn 6',
      '“advertisements are disproportionately populated with attractive, successful looking individuals. If we are going to imitate someone, we are more inclined to imitate those who appear to be popular and appealing.”',
      'Quảng cáo dùng người hấp dẫn, trông thành đạt = người có hình ảnh đáng mơ ước → B'],
    32: ['Chiến dịch kim cương thành công nhờ gắn kim cương với sự xa xỉ trong tâm trí mọi người.', 'Đoạn 1',
      '“the objective was to promote diamonds as the symbol of everlasting love.”',
      'Kim cương được gắn với “tình yêu vĩnh cửu”, không phải sự xa xỉ → NO'],
    33: ['Người ta nhận biết marketing bằng hình ảnh rõ hơn marketing bằng âm thanh.', 'Đoạn 2',
      '“Our visual system is targeted by an avalanche of information” … “Our auditory system submits to catchy radio jingles and telemarketers.”',
      'Bài chỉ kể các hình thức quảng cáo nhắm vào thị giác và thính giác, không so sánh mức độ nhận biết → NOT GIVEN'],
    34: ['Chiến dịch quảng cáo kim cương có ảnh hưởng tích cực đến xã hội.', 'Đoạn 1 + 2',
      '“they can be so successful that they change the fabric of our culture.”',
      'Bài nói chiến dịch thay đổi cả văn hoá, nhưng không đánh giá đó là tốt hay xấu cho xã hội → NOT GIVEN'],
    35: ['Vẫn còn chưa chắc chắn việc động vật có bắt chước những con quyền lực nhất trong đàn hay không.', 'Đoạn 7',
      '“Although not all researchers are convinced by the findings, a number of studies indicate that some animals also imitate dominant members of their group.”',
      '“not all researchers are convinced” = vẫn còn chưa chắc chắn → YES'],
    36: ['Người tiêu dùng liên hệ một cách lý trí giữa thành tích của người nổi tiếng với sản phẩm họ quảng cáo.', 'Đoạn 8',
      '“Rationally, we know these people’s success did not depend on these products, so it seems our propensity to purchase products relates more to neural programs that evolved to encourage imitation”',
      'Về lý trí ta biết thành công của họ không nhờ sản phẩm; ta mua vì bản năng bắt chước, không phải vì liên hệ logic → NO'],
    37: ['Hành vi của bầy khỉ trên đảo Koshima cho thấy …', 'Đoạn 4',
      '“She began taking her dirt-covered sweet potatoes to the river to wash them before eating them. Upon seeing this, a few other open-minded monkeys picked up on the idea.”',
      'Các con khỉ khác thấy rồi làm theo, thói quen rửa khoai lan ra cả đàn = học thói quen mới qua quan sát → F'],
    38: ['Nhà linh trưởng học Frans de Waal phát hiện rằng …', 'Đoạn 7',
      '“some animals also imitate dominant members of their group. Primatologist Frans de Waal provides anecdotal evidence of preferential imitation among chimpanzees. He noted that in one particular group the dominant male was hurt and was limping as a result.”',
      'Con đực đầu đàn bị thương đi khập khiễng và một con đực non bắt chước dáng đi đó — điều khó xảy ra nếu con bị thương không phải đầu đàn = bắt chước con có địa vị cao hơn → C'],
    39: ['Dick Fosbury được nhắc đến để cho thấy …', 'Đoạn 8',
      '“When athlete Dick Fosbury revolutionised the high jump by jumping over the bar backward in 1968, imitators obviously copied his jumping style, not his brand of sports shoes.”',
      'Người ta bắt chước kiểu nhảy — chính là thứ làm nên thành công của Fosbury = bắt chước hành vi gắn với thành công → A'],
    40: ['Một đặc điểm của một số chiến dịch marketing hiện đại là …', 'Đoạn 8',
      '“companies engage in stealth marketing campaigns in which people are paid to frequent bars or websites to covertly promote certain products.”',
      '“stealth”, “covertly” = quảng bá lén lút, người tiêu dùng không biết mình đang bị tiếp thị → E'],
  },
};
