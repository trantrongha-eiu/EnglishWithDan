// Vol 2 - Test 9 UPDATE (seeded as "Vol 2 - Test 11") — Reading Passage 3 ("VOL2 TEST 9 (1).pdf", text layer). Not in the
// bank; mini-ielts 1362 "Decision, Decision !" has the same text (more typos: "water crisis", "fare better", "simply 'snap'
// decisions with being") and the same questions. Paragraphs split as in mini (PDF has no blank lines; the quotation is its own
// paragraph). Text fixes: "held us as an example" → held up as, "Suedfield" → Suedfeld (Peter Suedfeld, UBC), "deemed to be
// the effective" → deemed to be effective, "It's core argument" → Its, "what the author refer to" → authors, "In other study" →
// In another study. Word bank "concious" → conscious; Q30 "negative affected" → negatively.
// Key = "giải thích reading/Key VOL 2 TEST 9.pdf" = mini key except Q37 (Vol YES, mini NOT GIVEN): the writer says "one suspects
// many of our political leaders already embrace this wisdom" → YES, NOT GIVEN also accepted.
const { mc, summary, ynng } = require('../../vr_build');
module.exports = {
  vol: '2u', test: 9, part: 3, title: 'Decisions, decisions!', text: 't9p3.txt', lettered: false,
  groups: [
    mc(27, [
      ['The legend of the Gordian knot is used to illustrate the idea that', [
        'anyone can solve a difficult problem.', 'difficult problems can have easy solutions.',
        'the solution to any problem requires a lot of thought.', 'people who can solve complex problems make good leaders.']],
      ['The ‘conflict model’ of decision making proposed by Janis and Mann requires that', [
        'opposing political parties be involved.', 'all important facts be considered.',
        'people be encouraged to have different ideas.', 'previous similar situations be thoroughly examined.']],
      ['According to recent thinking reinforced by Malcolm Gladwell, the best decisions', [
        'involve consultation.', 'involve complex thought.', 'are made very quickly.', 'are the most attractive option.']],
      ['Dijksterhuis and his colleagues claim in their article that', [
        'our cognitive resources improve as tasks become more complex.', 'conscious decision making is negatively affected by task complexity.',
        'unconscious decision making is a popular approach.', 'deliberation without attention defines the way we make decisions.']],
      ['Dijksterhuis\'s car study found that, in simple tasks, participants', [
        'were involved in lengthy discussions.', 'found it impossible to make decisions quickly.',
        'were unable to differentiate between the options.', 'could make a better choice when allowed to concentrate.']],
    ]),
    summary(32, 35, 'Using clothing and furniture as examples of different types of purchases, Dijksterhuis questioned shoppers on their satisfaction with what they had bought. People who spent __Q32__ time buying simple clothing items were more satisfied than those who had not. However, when buying furniture, shoppers made __Q33__ purchasing decisions if they didn\'t think too hard. From this, the researchers concluded that in other choices, perhaps more important than shopping, __Q34__ decisions are best made by the unconscious. The writer comments that Dijksterhuis\'s finding is apparently __Q35__ but nonetheless true.',
      ['more', 'counterintuitive', 'simple', 'better', 'conscious', 'obvious', 'complex', 'less', 'worse'],
      { title: 'Dijksterhuis\'s shopping study and its conclusions',
        instruction: 'Complete the summary using the list of words and phrases, A–I, below. Write the correct letter, A–I, in boxes 32–35 on your answer sheet.' }),
    ynng(36, [
      'Dijksterhuis\'s findings agree with existing political and management theories.',
      'Some political leaders seem to use deliberation without attention when making complex decisions.',
      'All political decisions are complex ones.',
      'We judge political errors according to our own political beliefs.',
      'Social considerations must be taken into account for any examination of decision making to prove useful.',
    ]),
  ],
  key: { 27: 'B', 28: 'B', 29: 'C', 30: 'B', 31: 'D', 32: 'more', 33: 'better', 34: 'complex', 35: 'counterintuitive',
    36: 'NO', 37: 'YES / NOT GIVEN', 38: 'NOT GIVEN', 39: 'YES', 40: 'NOT GIVEN' },
  expl: {
    27: ['Truyền thuyết về nút thắt Gordian được dùng để minh họa ý rằng', 'Đoạn 1',
      '“rather than deliberating on how to untie the Gordian knot, Alexander … simply took out his sword and cut it in two” … “the notion of a \'Gordian solution\' has referred to the attractiveness of a simple answer to an otherwise intractable problem.”',
      'Một vấn đề tưởng không giải được (intractable) lại có lời giải đơn giản (simple answer) → B'],
    28: ['Mô hình “xung đột” trong ra quyết định của Janis và Mann đòi hỏi', 'Đoạn 2',
      '“Decisions made without thorough canvassing, surveying, weighing, examining and reexamining relevant information and options would be suboptimal and often disastrous.”',
      'Phải xem xét kỹ lưỡng, cân nhắc lại mọi thông tin liên quan = mọi dữ kiện quan trọng đều phải được xem xét → B'],
    29: ['Theo quan điểm gần đây được Malcolm Gladwell củng cố, các quyết định tốt nhất', 'Đoạn 3',
      '“a growing body of work suggests that in many situations simple \'snap\' decisions will be routinely superior to more complex ones – an idea that gained widespread public appeal with Malcolm Gladwell\'s best-selling book Blink”',
      '“snap decisions” = quyết định chớp nhoáng, được đưa ra rất nhanh → C'],
    30: ['Dijksterhuis và cộng sự khẳng định trong bài báo rằng', 'Đoạn 4',
      '“to be effective, conscious (deliberative) decision making requires cognitive resources. Because increasingly complex decisions place increasing strain on those resources, the quality of our decisions declines as their complexity increases.”',
      'Quyết định có ý thức giảm chất lượng khi độ phức tạp tăng = bị ảnh hưởng tiêu cực bởi độ phức tạp → B'],
    31: ['Nghiên cứu về ô tô của Dijksterhuis cho thấy, với nhiệm vụ đơn giản, người tham gia', 'Đoạn 5',
      '“Among participants who considered four attributes, those who were allowed to engage in undistracted deliberative thought did better at discriminating between the best and worst cars.”',
      '“undistracted deliberative thought” = được tập trung suy nghĩ; “did better at discriminating” = chọn tốt hơn → D'],
    32: ['Những người dành ______ thời gian mua quần áo đơn giản thì hài lòng hơn những người không làm vậy.', 'Đoạn 6',
      '“Compared with those who said they had deliberated long and hard, shoppers who bought with little conscious deliberation felt less happy with their simple clothing purchase”',
      'Người cân nhắc lâu (deliberated long and hard) hài lòng hơn với quần áo → dành nhiều thời gian hơn → more'],
    33: ['Khi mua đồ nội thất, người mua đưa ra quyết định ______ nếu họ không suy nghĩ quá nhiều.', 'Đoạn 6',
      '“but happier with the complex furniture purchases. Deliberation without attention actually produced better results as the decisions became more complex.”',
      'Với đồ nội thất, mua mà ít cân nhắc lại hài lòng hơn = quyết định tốt hơn → better'],
    34: ['Các nhà nghiên cứu kết luận rằng trong các lựa chọn khác, các quyết định ______ nên để vô thức đưa ra.', 'Đoạn 8',
      '“it should benefit the individual to think consciously about simple matters and to delegate thinking about more complicated matters to the unconscious.”',
      '“more complicated matters … to the unconscious” → các quyết định phức tạp → complex'],
    35: ['Tác giả nhận xét rằng phát hiện của Dijksterhuis có vẻ ______ nhưng vẫn đúng.', 'Đoạn 4',
      '“The seemingly counterintuitive conclusion is that although conscious thought enhances simple decisions, the opposite holds true for more complex decisions.”',
      '“seemingly counterintuitive” = có vẻ ngược với trực giác → counterintuitive'],
    36: ['Phát hiện của Dijksterhuis phù hợp với các lý thuyết chính trị và quản lý hiện có.', 'Đoạn 9',
      '“This radical inference contradicts standard political and managerial theory”',
      '“contradicts standard … theory” = mâu thuẫn với lý thuyết hiện có → NO'],
    37: ['Một số nhà lãnh đạo chính trị dường như dùng cách “cân nhắc không cần chú ý” khi đưa ra quyết định phức tạp.', 'Đoạn 9',
      '“doubtless comforts those in politics and management who always find the simple solution to the complex problem an attractive proposition. Indeed, one suspects many of our political leaders already embrace this wisdom.”',
      'Tác giả ngờ rằng nhiều nhà lãnh đạo chính trị đã áp dụng “sự khôn ngoan” này (để vô thức lo việc phức tạp) = dường như dùng deliberation without attention. (Một số bản key ghi NOT GIVEN vì tác giả chỉ “suspects” — cũng được chấp nhận.) → YES'],
    38: ['Mọi quyết định chính trị đều là quyết định phức tạp.', 'Đoạn 10',
      '“Two pertinent questions arise. First, what counts as a complex decision?”',
      'Tác giả chỉ đặt câu hỏi thế nào là quyết định phức tạp, không khẳng định mọi quyết định chính trị đều phức tạp → NOT GIVEN'],
    39: ['Chúng ta đánh giá sai lầm chính trị theo niềm tin chính trị của chính mình.', 'Đoạn 11',
      '“when political decision makers make mistakes, it is their politics, or the relation between their politics and our own, rather than psychology which is at fault.”',
      'Cái bị coi là sai nằm ở quan hệ giữa chính kiến của họ và của chúng ta = ta đánh giá theo niềm tin chính trị của mình → YES'],
    40: ['Phải tính đến các yếu tố xã hội thì mọi nghiên cứu về ra quyết định mới hữu ích.', 'Đoạn 12',
      '“Avoiding social considerations in a search for general appeal can take us away from enlightenment rather than towards it.”',
      'Tác giả chỉ nói bỏ qua yếu tố xã hội “có thể” làm ta xa sự hiểu biết, không khẳng định mọi nghiên cứu “phải” tính đến mới hữu ích → NOT GIVEN'],
  },
};
