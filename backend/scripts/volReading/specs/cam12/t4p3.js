// Cambridge IELTS 12 - Test 4 (book Test 8) - Passage 3. Source: ieltsworldly.com (text, questions); key from babarenglish.com, checked against the passage.
// Text fix: "for more date" → data. Heading vii "Broads" → Boards.
const { headings, ynng, notes } = require('../../vr_build');
module.exports = {
  vol: 'cam12', book: 12, test: 4, part: 3, title: 'UK companies need more effective boards of directors', text: 't4p3.txt',
  groups: [
    headings(27, [
      'Disputes over financial arrangements regarding senior managers',
      'The impact on companies of being subjected to close examination',
      'The possible need for fundamental change in every area of business',
      'Many external bodies being held responsible for problems',
      'The falling number of board members with broad enough experience',
      'A risk that not all directors take part in solving major problems',
      'Boards not looking far enough ahead',
      'A proposal to change the way the board operates',
    ], ['Paragraph A', 'Paragraph B', 'Paragraph C', 'Paragraph D', 'Paragraph E', 'Paragraph F', 'Paragraph G'],
    { instruction: 'Reading Passage 3 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i–viii, in boxes 27–33 on your answer sheet.' }),
    ynng(34, [
      'Close scrutiny of the behaviour of boards has increased since the economic downturn.',
      'Banks have been mismanaged to a greater extent than other businesses.',
      'Board meetings normally continue for as long as necessary to debate matters in full.',
      'Using a committee structure would ensure that board members are fully informed about significant issues.',
    ]),
    notes(38, 40, [
      'Before 2008, non-executive directors were at a disadvantage because of their lack of __Q38__.',
      'Boards tend to place too much emphasis on __Q39__ considerations that are only of short-term relevance.',
      'On certain matters, such as pay, the board may have to accept the views of __Q40__.',
    ], { instruction: 'Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer. Write your answers in boxes 38–40 on your answer sheet.' }),
  ],
  key: { 27: 'iv', 28: 'ii', 29: 'vi', 30: 'viii', 31: 'vii', 32: 'i', 33: 'iii', 34: 'YES', 35: 'NOT GIVEN', 36: 'NO', 37: 'NO', 38: 'information', 39: 'financial', 40: 'shareholders/investors' },
  expl: {
    27: ['Đoạn A – chọn tiêu đề.', 'Đoạn A', '“Governments, regulators, central banks and auditors have all been in the frame.”', 'Nhiều tổ chức bên ngoài bị quy trách nhiệm → iv'],
    28: ['Đoạn B – chọn tiêu đề.', 'Đoạn B', '“The knock-on effect of this scrutiny has been to make the governance of companies in general an issue of intense public debate”', 'Tác động của việc bị soi xét kỹ: áp lực, khối lượng việc tăng → ii'],
    29: ['Đoạn C – chọn tiêu đề.', 'Đoạn C', '“the board as a whole is less involved in fully addressing some of the most important issues.”', 'Giao cho các ủy ban nên cả hội đồng ít tham gia giải quyết vấn đề lớn → vi'],
    30: ['Đoạn D – chọn tiêu đề.', 'Đoạn D', '“A radical solution … is the professional board”', 'Đề xuất hội đồng chuyên nghiệp = thay đổi cách hội đồng hoạt động → viii'],
    31: ['Đoạn E – chọn tiêu đề.', 'Đoạn E', '“they do not focus sufficiently on longer-term matters of strategy, sustainability and governance”', 'Không nhìn đủ xa → vii'],
    32: ['Đoạn F – chọn tiêu đề.', 'Đoạn F', '“Compensation for chief executives has become a combat zone”', 'Tranh cãi về lương thưởng giám đốc điều hành → i'],
    33: ['Đoạn G – chọn tiêu đề.', 'Đoạn G', '“Boards of companies in all sectors will need to widen their perspective to encompass these issues and this may involve a realignment of corporate goals.”', 'Thay đổi căn bản ở mọi lĩnh vực → iii'],
    34: ['Sự soi xét hành vi của hội đồng tăng lên kể từ suy thoái kinh tế.', 'Đoạn B', '“The knock-on effect of this scrutiny has been to make the governance of companies in general an issue of intense public debate”', 'Sau khủng hoảng 2008 sự soi xét tăng mạnh → YES'],
    35: ['Ngân hàng bị quản lý kém hơn các doanh nghiệp khác.', 'Đoạn A', '“The role of bank directors and management and their widely publicised failures have been extensively picked over”', 'Không so sánh mức độ quản lý kém giữa ngân hàng và doanh nghiệp khác → NOT GIVEN'],
    36: ['Cuộc họp hội đồng thường kéo dài đủ để bàn kỹ mọi vấn đề.', 'Đoạn B', '“this can mean the time for constructive debate must necessarily be restricted in favour of getting through the business.”', 'Thời gian tranh luận bị hạn chế → NO'],
    37: ['Dùng cơ cấu ủy ban sẽ giúp thành viên hội đồng nắm đủ thông tin về các vấn đề quan trọng.', 'Đoạn C', '“can mean that the board as a whole is less involved in fully addressing some of the most important issues.”', 'Ngược lại, cả hội đồng ít tham gia hơn → NO'],
    38: ['Trước 2008, giám đốc không điều hành bất lợi vì thiếu ___.', 'Đoạn D', '“where the executives had access to information that part-time non-executive directors lacked”', 'Thiếu thông tin → information'],
    39: ['Hội đồng quá chú trọng các yếu tố ___ chỉ có ý nghĩa ngắn hạn.', 'Đoạn E', '“but instead concentrate too much on short-term financial metrics.”', 'Chỉ số tài chính ngắn hạn → financial'],
    40: ['Về một số vấn đề như lương, hội đồng có thể phải chấp nhận quan điểm của ___.', 'Đoạn F', '“as shareholders use their muscle in the area of pay to pressure boards”', 'Cổ đông gây sức ép về lương → shareholders'],
  },
};
