// Cambridge IELTS 18 - Test 2 - Passage 2. Source: ieltsworldly.com, checked against the book key. Text fix: "superintendent machines" → superintelligent.
// Q20–23 are YES/NO/NOT GIVEN (the page showed TRUE/FALSE options).
const { mc, ynng, summary } = require('../../vr_build');
module.exports = {
  vol: 'cam18', book: 18, test: 2, part: 2, title: 'Living with artificial intelligence', text: 't2p2.txt', lettered: false,
  groups: [
    mc(14, [
      ['What point does the writer make about AI in the first paragraph?', ['It is difficult to predict how quickly AI will progress.', 'Much can be learned about the use of AI in chess machines.', 'The future is unlikely to see limitations on the capabilities of AI.', 'Experts disagree on which specialised tasks AI will be able to perform.']],
      ['What is the writer doing in the second paragraph?', ['explaining why machines will be able to outperform humans', 'describing the characteristics that humans and machines share', 'giving information about the development of machine intelligence', 'indicating which aspects of humans are the most advanced']],
      ['Why does the writer mention the story of King Midas?', ['to compare different visions of progress', 'to illustrate that poorly defined objectives can go wrong', 'to emphasise the need for cooperation', 'to point out the financial advantages of a course of action']],
      ['What challenge does the writer refer to in the fourth paragraph?', ['encouraging humans to behave in a more principled way', 'deciding which values we want AI to share with us', 'creating a better world for all creatures on the planet', 'ensuring AI is more human-friendly than we are ourselves']],
      ['What does the writer suggest about the future of AI in the fifth paragraph?', ['The safety of machines will become a key issue.', 'It is hard to know what impact machines will have on the world.', 'Machines will be superior to humans in certain respects.', 'Many humans will oppose machines having a wider role.']],
      ['Which of the following best summarises the writer’s argument in the sixth paragraph?', ['More intelligent machines will result in greater abuses of power.', 'Machine learning will share very few features with human learning.', 'There are a limited number of people with the knowledge to program machines.', 'Human shortcomings will make creating the machines we need more difficult.']],
    ]),
    ynng(20, [
      'Machines with the ability to make moral decisions may prevent us from promoting the interests of our communities.',
      'Silicon police would need to exist in large numbers in order to be effective.',
      'Many people are comfortable with the prospect of their independence being restricted by machines.',
      'If we want to ensure that machines act in our best interests, we all need to work together.',
    ]),
    summary(24, 26, 'AI currently has a limited role in the way __Q24__ are allocated in the health service. The positive aspect of AI having a bigger role is that it would be more efficient and lead to patient benefits. However, such a change would result, for example, in certain __Q25__ not having their current level of __Q26__. It is therefore important that AI goals are appropriate so that discriminatory practices could be avoided.',
      ['medical practitioners', 'specialised tasks', 'available resources', 'reduced illness', 'professional authority', 'technology experts'], { title: 'Using AI in the UK health system' }),
  ],
  key: { 14: 'C', 15: 'A', 16: 'B', 17: 'D', 18: 'C', 19: 'D', 20: 'YES', 21: 'NOT GIVEN', 22: 'NO', 23: 'YES', 24: 'available resources', 25: 'medical practitioners', 26: 'professional authority' },
  expl: {
    14: ['Tác giả nêu điểm gì về AI ở đoạn đầu?', 'Đoạn 2', '“But many experts believe this restriction is very temporary.”', 'Giới hạn ở AI hẹp chỉ là tạm thời; giữa thế kỷ có thể có AGI = tương lai ít giới hạn khả năng AI → C'],
    15: ['Tác giả làm gì ở đoạn thứ hai?', 'Đoạn 3', '“Machines will be free of many of the physical constraints on human intelligence.”', 'Giải thích vì sao máy sẽ vượt người: não người bị giới hạn tốc độ, năng lượng, kích thước → A'],
    16: ['Vì sao tác giả nhắc chuyện vua Midas?', 'Đoạn 4', '“Folklore is full of tales of people who ask for the wrong thing, with disastrous consequences”', 'Mục tiêu xác định kém dẫn tới hậu quả tai hại → B'],
    17: ['Thử thách tác giả nhắc ở đoạn thứ tư là gì?', 'Đoạn 5', '“One thing that makes this task difficult is that we are far from reliably human-friendly ourselves.”', 'Cần AI thân thiện với con người hơn chính con người → D'],
    18: ['Tác giả gợi ý gì về tương lai AI ở đoạn thứ năm?', 'Đoạn 6', '“If there are routes to the moral high ground, they’ll be better than us at finding them”', 'Máy sẽ giỏi hơn người về đạo đức và nhận thức → C'],
    19: ['Câu nào tóm tắt đúng lập luận ở đoạn thứ sáu?', 'Đoạn 7', '“This won’t be easy, given that we are tribal creatures and conflicted about the ideals ourselves.”', 'Khuyết điểm của con người khiến việc định hướng máy khó hơn → D'],
    20: ['Máy biết ra quyết định đạo đức có thể ngăn ta thiên vị cộng đồng của mình.', 'Đoạn 8', '“We might lose our freedom to discriminate in favour of our own communities”', 'Mất quyền ưu ái cộng đồng mình → YES'],
    21: ['“Cảnh sát silicon” cần số lượng lớn mới hiệu quả.', 'Đoạn 9', '“They might be so good at doing it that we won’t notice them”', 'Không nói gì về số lượng cần thiết → NOT GIVEN'],
    22: ['Nhiều người thoải mái với viễn cảnh bị máy hạn chế sự độc lập.', 'Đoạn 9', '“but few of us are likely to welcome such a future.”', 'Ít người hoan nghênh → NO'],
    23: ['Muốn máy hành động vì lợi ích của ta thì tất cả cần hợp tác.', 'Đoạn 11', '“it will require a cooperative spirit, and a willingness to set aside self-interest.”', 'Cần tinh thần hợp tác → YES'],
    24: ['AI hiện có vai trò hạn chế trong việc phân bổ ___ ở ngành y tế.', 'Đoạn 10', '“AI already has some input into how resources are used in our National Health Service”', '“resources” = các nguồn lực sẵn có → available resources'],
    25: ['…dẫn đến một số ___ không còn mức…', 'Đoạn 10', '“we’d be depriving some humans (e.g. senior doctors) of the control they presently enjoy.”', 'Bác sĩ cấp cao = người hành nghề y → medical practitioners'],
    26: ['…___ như hiện tại.', 'Đoạn 10', '“of the control they presently enjoy.”', '“control” = quyền hạn chuyên môn → professional authority'],
  },
};
