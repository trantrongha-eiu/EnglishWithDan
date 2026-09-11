'use strict';

// NOTE: "Biomass fuel" (6a4c9670da428396002190a8) had all 10 correctAnswer
// values wrong (none fit grammatically into their own blank) — corrected
// first via fixBiomassFuelAnswers.js, using the transcript's own inline
// "(31)".."(40)" markers as ground truth. Explanations below are written
// against the CORRECTED answers.

module.exports = [
  {
    sectionId: '6a4c8a5fda428396002163be',
    title: 'Prescription Drug Assistance (PDA)',
    explanations: [
      { questionNumber: 1, explanation: 'Vị trí: Đầu hội thoại, khi bàn về ngoại lệ trong danh sách thuốc.\n\nTranscript: "Does the doctor need to obtain permission to include other drugs? — That\'s right."\n\nPhân tích: Bác sĩ cần xin phép (permission) để thêm thuốc ngoài danh sách → đáp án permission.' },
      { questionNumber: 2, explanation: 'Vị trí: Khi bàn về điều kiện thu nhập.\n\nTranscript: "applicants earning less than $25,000 a year will qualify."\n\nPhân tích: Điều kiện thu nhập dưới 25.000 đô la/năm → đáp án 25 thousand/25,000/25000.' },
      { questionNumber: 3, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "you have to be a resident of the country, which I am. Is that right? — Yes, that\'s a requirement."\n\nPhân tích: Cần là cư dân (resident) của quốc gia đó → đáp án resident.' },
      { questionNumber: 4, explanation: 'Vị trí: Khi bàn về độ tuổi.\n\nTranscript: "If you\'re a senior, you aren\'t eligible either, though judging by your voice, I\'m sure that doesn\'t apply to you."\n\nPhân tích: Người cao tuổi (senior) không thuộc diện được hưởng chương trình này (có chương trình riêng) → đáp án senior.' },
      { questionNumber: 5, explanation: 'Vị trí: Khi bàn về điều kiện việc làm.\n\nTranscript: "the PDA is aimed at people with a permanent job. It doesn\'t apply if you\'re unemployed."\n\nPhân tích: Cần có công việc ổn định/lâu dài (permanent) → đáp án permanent.' },
      { questionNumber: 6, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "you can\'t have any kind of insurance to cover medical costs."\n\nPhân tích: Không được có bảo hiểm y tế (insurance) → đáp án insurance.' },
      { questionNumber: 7, explanation: 'Vị trí: Khi bàn về hồ sơ cần nộp.\n\nTranscript: "You must provide identification, and it has to include your address."\n\nPhân tích: Giấy tờ tùy thân cần thể hiện địa chỉ (address) → đáp án address.' },
      { questionNumber: 8, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "PDA applicants need to provide some kind of statement from their bank."\n\nPhân tích: Cần có sao kê từ ngân hàng (bank) → đáp án bank.' },
      { questionNumber: 9, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "they\'ll have to check that you\'ve paid tax for that period."\n\nPhân tích: Cần kiểm tra việc đóng thuế (tax) trong ít nhất 2 năm làm việc → đáp án tax.' },
      { questionNumber: 10, explanation: 'Vị trí: Cuối hội thoại.\n\nTranscript: "You can call 1-866-387-8392."\n\nPhân tích: Số điện thoại tư vấn được đọc trực tiếp → đáp án 18663878392.' },
    ],
  },
  {
    sectionId: '6a4c8f8fda42839600217537',
    title: 'The Volunteering Process',
    explanations: [
      { questionNumber: 11, explanation: 'Vị trí: Đầu bài, khi mô tả khu nghỉ dưỡng.\n\nTranscript: "As you walk into the cottages, on your left, there\'s a board with practical information."\n\nPhân tích: Bảng thông tin nằm bên trong nhà nghỉ (inside the cottages) → đáp án B.' },
      { questionNumber: 12, explanation: 'Vị trí: Khi nói về thiết bị thể thao.\n\nTranscript: "if it\'s water skiing you\'re after, you\'ll need to book the night before."\n\nPhân tích: Chỉ có môn lướt ván nước (water-skiing) cần đặt trước → đáp án B.' },
      { questionNumber: 13, explanation: 'Vị trí: Khi nói về hang động đá vôi.\n\nTranscript: "Helmets are issued when you buy a ticket, so you just need to remember to bring some safe, sturdy shoes."\n\nPhân tích: Mũ bảo hiểm (a safety helmet) được cấp kèm vé, còn giày thì khách phải tự mang → đáp án C.' },
      { questionNumber: 14, explanation: 'Vị trí: Khi giới thiệu công viên động vật hoang dã.\n\nTranscript: "For a family outing, the Wildlife Park attached to the resort is highly recommended."\n\nPhân tích: Công viên được khuyên dùng cho chuyến đi gia đình (family outing) → đáp án family outing/families.' },
      { questionNumber: 15, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "Little kids always love the animal feeding times, and they will have the chance to actually feed them themselves."\n\nPhân tích: Trẻ em được phép cho động vật ăn (feed) → đáp án feed.' },
      { questionNumber: 16, explanation: 'Vị trí: Khi nói về kangaroo đỏ.\n\nTranscript: "he\'s actually taller than a person."\n\nPhân tích: Kangaroo đỏ cao hơn một người (a person) → đáp án a person.' },
      { questionNumber: 17, explanation: 'Vị trí: Khi nói về cá sấu.\n\nTranscript: "Charlie, the biggest of the crocodiles, is well over 50 years old."\n\nPhân tích: Cá sấu có thể sống hơn 50 năm (50 years) → đáp án 50 years (old).' },
      { questionNumber: 18, explanation: 'Vị trí: Đoạn nói về vùng đất trong đất liền.\n\nTranscript: "Most farms extend hospitality to visitors by offering light meals and lunches."\n\nPhân tích: Du khách có thể dùng bữa nhẹ (have light refreshments) → đáp án B.' },
      { questionNumber: 19, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "you can go on a tour of a cider or cheese factory. That\'s always a very popular trip."\n\nPhân tích: Du khách có thể tham quan quy trình làm phô mai (observe cheese production) → đáp án C.' },
      { questionNumber: 20, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "You might like to buy some of the pottery or items made from local wood."\n\nPhân tích: Du khách có thể mua đồ lưu niệm (buy a souvenir) → đáp án E.' },
    ],
  },
  {
    sectionId: '6a4c91e9da42839600217f9f',
    title: 'Internship',
    explanations: [
      { questionNumber: 21, explanation: 'Vị trí: Đầu hội thoại, khi Lindsay giải thích lý do chọn nơi thực tập.\n\nTranscript: "I still knew some people there, so it was easy to set up."\n\nPhân tích: Lindsay chọn cửa hàng đó vì có quen biết sẵn (she had contacts in the company) → đáp án B.' },
      { questionNumber: 22, explanation: 'Vị trí: Khi kể về sự cố kính râm.\n\nTranscript: "sales rocketed and we ran out. Customers started complaining, and I was asked to track down a supplier."\n\nPhân tích: Vấn đề là thiếu hàng trong kho (a shortage of stock) → đáp án A.' },
      { questionNumber: 23, explanation: 'Vị trí: Khi hai người so sánh trải nghiệm thực tập.\n\nTranscript: "The only good thing about it was having to deal with issues that came up. Classes just don\'t prepare you for a lot of them. — Yeah, that\'s true."\n\nPhân tích: Cả hai đồng ý điều hữu ích nhất là phải đối mặt với vấn đề thực tế mà lớp học không dạy (facing challenges that weren\'t dealt with in their classes) → đáp án C.' },
      { questionNumber: 24, explanation: 'Vị trí: Khi Ben kể về trải nghiệm của mình.\n\nTranscript: "they said I\'d spend time in every section and sit in on meetings with clients. But hardly any of that happened."\n\nPhân tích: Công ty không thực hiện đúng những gì đã hứa (the company didn\'t keep its promises to him) → đáp án A.' },
      { questionNumber: 25, explanation: 'Vị trí: Khi bàn về vai trò của trường học.\n\nTranscript: "they need to spell out the purpose of the internship and send the companies a list of their responsibilities."\n\nPhân tích: Trường cần cho công ty biết rõ trách nhiệm của mình (make the companies aware of their own role) → đáp án A.' },
      { questionNumber: 26, explanation: 'Vị trí: Đầu sơ đồ hành động, khi bàn về việc hỏi người từng thực tập trước.\n\nTranscript: "Were you the first intern they had from this college? — No, there\'s someone in the year above us who was there... I think the first step is to talk to her."\n\nPhân tích: Bước đầu tiên là nói chuyện với người thực tập ở đó trước đây (E "previous items" — ý chỉ intern trước đó) → đáp án E previous items.' },
      { questionNumber: 27, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "you need to make some notes and discuss the problem with the professor. He can advise you whether or not to take it any further."\n\nPhân tích: Bước tiếp theo là trao đổi với giáo sư (professor) → đáp án G professor.' },
      { questionNumber: 28, explanation: 'Vị trí: Khi bàn về việc xin phản hồi từ công ty.\n\nTranscript: "So the person I had most contact with, my line manager? — That would be better."\n\nPhân tích: Người phù hợp để xin phản hồi là quản lý trực tiếp (line manager), không phải giám đốc điều hành (đã bị bác bỏ trước đó) → đáp án D line manager.' },
      { questionNumber: 29, explanation: 'Vị trí: Khi bàn về việc liên hệ nhà trường.\n\nTranscript: "the college appointed an internship program organizer last fall."\n\nPhân tích: Người phụ trách hiện tại là internship programme organizer → đáp án C internship programme organizer.' },
      { questionNumber: 30, explanation: 'Vị trí: Cuối bài.\n\nTranscript: "I\'ll talk to one of the college\'s student advisors in the department."\n\nPhân tích: Bước cuối là hỏi thông tin từ cố vấn sinh viên (student advisor) → đáp án F student advisor.' },
    ],
  },
  {
    sectionId: '6a4c9670da428396002190a8',
    title: 'Biomass fuel',
    explanations: [
      { questionNumber: 31, explanation: 'Vị trí: Đầu bài, khi nói về lợi ích tài chính.\n\nTranscript: "Using briquettes has a financial benefit because they make use of waste products as raw materials, so there isn\'t any cost involved."\n\nPhân tích: Nguyên liệu thô (raw materials) là phế phẩm nên không tốn chi phí → đáp án raw.' },
      { questionNumber: 32, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "Handling briquettes is cleaner than handling materials like wood or charcoal."\n\nPhân tích: Xử lý viên nén sạch hơn (cleaner) so với gỗ hay than củi → đáp án cleaner.' },
      { questionNumber: 33, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "briquettes are less trouble to store because they are a uniform size and shape."\n\nPhân tích: Viên nén có kích thước (size) đồng đều nên dễ bảo quản → đáp án size.' },
      { questionNumber: 34, explanation: 'Vị trí: Đoạn mô tả phương pháp máy móc.\n\nTranscript: "all the loose plant material is ground into a powder and then mixed with other materials."\n\nPhân tích: Nguyên liệu được nghiền thành bột (powder) → đáp án powder.' },
      { questionNumber: 35, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "a machine compresses the biomass mixture, and that process raises the temperature and causes it to melt."\n\nPhân tích: Nhiệt độ tăng khiến hỗn hợp tan chảy (melt) → đáp án melt.' },
      { questionNumber: 36, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "with this method, electricity is essential to operate the machinery."\n\nPhân tích: Cần điện (electricity) để vận hành máy móc → đáp án electricity.' },
      { questionNumber: 37, explanation: 'Vị trí: Đoạn mô tả phương pháp thủ công.\n\nTranscript: "This method is suitable when the biomass is mainly composed of material that doesn\'t melt, like paper."\n\nPhân tích: Phương pháp thủ công phù hợp với nguyên liệu không tan chảy như giấy (paper) → đáp án paper.' },
      { questionNumber: 38, explanation: 'Vị trí: Ngay sau đó.\n\nTranscript: "The biomass is made into a paste by adding water, and in addition, something sticky, such as starch."\n\nPhân tích: Cần thêm chất kết dính như tinh bột (starch) → đáp án starch.' },
      { questionNumber: 39, explanation: 'Vị trí: Đoạn nói về sản xuất và sử dụng toàn cầu.\n\nTranscript: "since 2000, there\'s been a rapid increase in the production and use of briquettes made out of wood waste."\n\nPhân tích: Viên nén làm từ phế phẩm gỗ (wood) tăng mạnh từ năm 2000 → đáp án wood.' },
      { questionNumber: 40, explanation: 'Vị trí: Đoạn nói về Uganda.\n\nTranscript: "Most of the company\'s customers are public institutions like schools and universities that provide hot meals for their students."\n\nPhân tích: Khách hàng chính là các cơ sở công (public institutions) như trường học → đáp án institutions.' },
    ],
  },
];
