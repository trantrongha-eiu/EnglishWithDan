'use strict';
// Seeds the Band 6+ (simpler-vocab) counterpart of the existing Task2Template
// set — same 7 essay types, same section shape (Intro/Body1/Body2/Conclusion).
//
// Every `en` sentence here is verbatim from the "Band 6+ EASY TEMPLATE /
// numbered-pattern / EXAMPLE paragraph" reference document supplied for this
// task (2026-08-26), with exactly one real content word blanked out — no
// paraphrasing, no invented filler sentences, no dropped sentence endings.
// (An earlier version of this script padded item counts with sentences not
// actually in that document — this revision replaces it after a fidelity
// check found ~9 non-verbatim items; see conversation for the full audit.)
// Bracketed placeholders like (topic)/(problem)/(trend)/(people/society/the
// environment) are kept literal, exactly as the source document writes them
// — they're slots for the student's own topic, not blankable vocabulary.
//
// Run once: node scripts/seedTask2TemplatesBand6.js
// Safe to re-run — upserts by {typeId, level} so it never creates duplicates.
require('dotenv').config();
const mongoose = require('mongoose');
const Task2Template = require('../models/Task2Template');

const BAND6_TEMPLATES = [
  { typeId: 'type01', level: 'band6', label: 'Type 01', sub: 'Adv & Disadv', name: 'Advantages & Disadvantages', orderIndex: 0, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (topic) has become increasingly ___ in many parts of the world.', answer: 'common', vi: '→ Trong những năm gần đây, (chủ đề) ngày càng trở nên phổ biến ở nhiều nơi trên thế giới.' },
      { en: 'While (topic) offers several benefits, it also has some potential ___.', answer: 'drawbacks', vi: '→ Mặc dù (chủ đề) mang lại một số lợi ích, nó cũng có một số hạn chế nhất định.' },
      { en: 'This essay will discuss the main advantages and ___ of (topic).', answer: 'disadvantages', vi: '→ Bài viết này sẽ phân tích những ưu điểm và nhược điểm chính của (chủ đề).' },
    ]},
    { title: '② Body 1 – Advantages · Ưu điểm', items: [
      { en: 'One of the main advantages of (topic) is that it is highly ___.', answer: 'convenient', vi: '→ Một trong những ưu điểm chính của (chủ đề) là nó rất tiện lợi.' },
      { en: 'This is mainly because people can buy products from home without having to ___ physical stores.', answer: 'visit', vi: '→ Điều này chủ yếu là bởi vì mọi người có thể mua sản phẩm tại nhà mà không cần đến các cửa hàng.' },
      { en: 'As a result, they can save a considerable amount of ___.', answer: 'time', vi: '→ Kết quả là, họ có thể tiết kiệm được một lượng thời gian đáng kể.' },
      { en: 'For example, busy workers can order groceries online ___ of going to a supermarket.', answer: 'instead', vi: '→ Ví dụ, những người bận rộn có thể đặt hàng tạp hóa trực tuyến thay vì đến siêu thị.' },
    ]},
    { title: '③ Body 2 – Disadvantages · Hạn chế', items: [
      { en: 'However, (topic) also has some ___.', answer: 'disadvantages', vi: '→ Tuy nhiên, (chủ đề) cũng có một số hạn chế.' },
      { en: 'One of the main drawbacks is that customers cannot see or ___ products before buying them.', answer: 'try', vi: '→ Một trong những hạn chế chính là khách hàng không thể xem hoặc thử sản phẩm trước khi mua.' },
      { en: 'This is because they have to ___ on pictures and descriptions provided on websites.', answer: 'rely', vi: '→ Điều này là bởi vì họ phải dựa vào hình ảnh và mô tả được cung cấp trên trang web.' },
      { en: 'As a result, they may receive products that are ___ from what they expected.', answer: 'different', vi: '→ Kết quả là, họ có thể nhận được sản phẩm khác với những gì họ mong đợi.' },
      { en: 'For instance, clothes bought online may not ___ properly or look the same as they do in photographs.', answer: 'fit', vi: '→ Chẳng hạn, quần áo mua trực tuyến có thể không vừa vặn hoặc trông không giống như trong ảnh.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, (topic) has both advantages and ___.', answer: 'disadvantages', vi: '→ Tóm lại, (chủ đề) có cả ưu điểm và nhược điểm.' },
      { en: 'Overall, I believe that the advantages ___ the disadvantages.', answer: 'outweigh', vi: '→ Nhìn chung, tôi tin rằng những lợi ích vượt trội hơn những hạn chế.' },
    ]},
  ]},
  { typeId: 'type02', level: 'band6', label: 'Type 02', sub: 'Discuss Both', name: 'Discuss Both Views', orderIndex: 1, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (topic) has become a widely ___ issue.', answer: 'discussed', vi: '→ Trong những năm gần đây, (chủ đề) đã trở thành một vấn đề được thảo luận rộng rãi.' },
      { en: 'There has been an ongoing debate ___ (topic).', answer: 'about', vi: '→ Đã có một cuộc tranh luận kéo dài về (chủ đề).' },
      { en: 'While some people believe that (View 1), ___ argue that (View 2).', answer: 'others', vi: '→ Trong khi một số người cho rằng (quan điểm 1), những người khác lại cho rằng (quan điểm 2).' },
      { en: 'This essay will discuss both views before ___ why I agree with (View 1/View 2).', answer: 'explaining', vi: '→ Bài viết này sẽ thảo luận cả hai quan điểm trước khi giải thích tại sao tôi đồng ý với (quan điểm 1/2).' },
    ]},
    { title: '② Body 1 – View 1 · Quan điểm 1', items: [
      { en: 'Some people ___ that (View 1).', answer: 'believe', vi: '→ Một số người cho rằng (quan điểm 1).' },
      { en: 'One reason for this view is that it would give more students access to ___ education.', answer: 'higher', vi: '→ Một lý do cho quan điểm này là nó sẽ giúp nhiều học sinh tiếp cận giáo dục đại học hơn.' },
      { en: 'This is because students from low-income families would not have to worry about ___ tuition fees.', answer: 'expensive', vi: '→ Điều này là bởi vì học sinh từ các gia đình thu nhập thấp sẽ không phải lo lắng về học phí đắt đỏ.' },
      { en: 'As a result, more young people could gain the ___ needed for better jobs.', answer: 'qualifications', vi: '→ Kết quả là, nhiều người trẻ hơn có thể đạt được bằng cấp cần thiết cho công việc tốt hơn.' },
      { en: 'For example, students from disadvantaged backgrounds could attend university without taking on large amounts of ___.', answer: 'debt', vi: '→ Ví dụ, học sinh có hoàn cảnh khó khăn có thể học đại học mà không phải gánh khoản nợ lớn.' },
    ]},
    { title: '③ Body 2 – View 2 · Quan điểm 2', items: [
      { en: 'On the other hand, others ___ that (View 2).', answer: 'argue', vi: '→ Mặt khác, những người khác cho rằng (quan điểm 2).' },
      { en: 'This is mainly because governments have ___ budgets and need to spend money on other essential services.', answer: 'limited', vi: '→ Điều này chủ yếu là bởi vì chính phủ có ngân sách hạn chế và cần chi tiêu cho các dịch vụ thiết yếu khác.' },
      { en: 'As a result, asking students to contribute could ___ the financial burden on the government.', answer: 'reduce', vi: '→ Kết quả là, yêu cầu học sinh đóng góp có thể giảm bớt gánh nặng tài chính cho chính phủ.' },
      { en: 'For instance, governments could use this money to improve public ___ and schools.', answer: 'healthcare', vi: '→ Chẳng hạn, chính phủ có thể dùng khoản tiền này để cải thiện y tế công cộng và trường học.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, there are ___ arguments on both sides of this issue.', answer: 'valid', vi: '→ Tóm lại, có những lập luận hợp lý ở cả hai phía của vấn đề này.' },
      { en: 'However, I believe that (your opinion) ___ (main reason).', answer: 'because', vi: '→ Tuy nhiên, tôi cho rằng (quan điểm của bạn) bởi vì (lý do chính).' },
    ]},
  ]},
  { typeId: 'type03', level: 'band6', label: 'Type 03', sub: 'Cause–Solution', name: 'Cause – Solution', orderIndex: 2, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (problem) has become an increasingly common ___ in many parts of the world.', answer: 'issue', vi: '→ Trong những năm gần đây, (vấn đề) ngày càng trở thành một vấn đề phổ biến ở nhiều nơi trên thế giới.' },
      { en: 'There are several ___ why this problem has become more widespread.', answer: 'reasons', vi: '→ Có một số lý do khiến vấn đề này ngày càng trở nên phổ biến hơn.' },
      { en: 'This essay will discuss the main causes of this problem and suggest some possible ___.', answer: 'solutions', vi: '→ Bài viết này sẽ phân tích những nguyên nhân chính của vấn đề và đưa ra một số giải pháp khả thi.' },
    ]},
    { title: '② Body 1 – Causes · Nguyên nhân', items: [
      { en: 'There are several reasons why (problem) has become increasingly ___.', answer: 'common', vi: '→ Có một số lý do khiến (vấn đề) ngày càng trở nên phổ biến.' },
      { en: 'One of the main causes is the increasing use of ___.', answer: 'technology', vi: '→ Một trong những nguyên nhân chính là việc sử dụng công nghệ ngày càng nhiều.' },
      { en: 'This is because people can now do many daily activities without ___ their homes.', answer: 'leaving', vi: '→ Điều này là bởi vì mọi người hiện có thể làm nhiều việc hàng ngày mà không cần rời khỏi nhà.' },
      { en: 'As a result, they spend more time sitting and less time ___.', answer: 'exercising', vi: '→ Kết quả là, họ dành nhiều thời gian ngồi hơn và ít thời gian tập thể dục hơn.' },
      { en: 'Another important cause is busy working ___, which leave many people with little free time for exercise.', answer: 'schedules', vi: '→ Một nguyên nhân quan trọng khác là lịch làm việc bận rộn, khiến nhiều người có ít thời gian rảnh để tập thể dục.' },
    ]},
    { title: '③ Body 2 – Solutions · Giải pháp', items: [
      { en: 'However, there are several ways to ___ this problem.', answer: 'address', vi: '→ Tuy nhiên, có một số cách để giải quyết vấn đề này.' },
      { en: 'One effective solution is to encourage people to ___ regularly.', answer: 'exercise', vi: '→ Một giải pháp hiệu quả là khuyến khích mọi người tập thể dục thường xuyên.' },
      { en: 'This could be done by providing more public sports ___ and creating safe walking and cycling areas.', answer: 'facilities', vi: '→ Điều này có thể được thực hiện bằng cách cung cấp thêm các cơ sở thể thao công cộng và tạo ra các khu vực đi bộ, đạp xe an toàn.' },
      { en: 'As a result, people would have more ___ to be physically active.', answer: 'opportunities', vi: '→ Kết quả là, mọi người sẽ có nhiều cơ hội hơn để vận động thể chất.' },
      { en: 'Another possible solution is for employers to encourage a healthier work-life ___.', answer: 'balance', vi: '→ Một giải pháp khả thi khác là các nhà tuyển dụng khuyến khích cân bằng công việc - cuộc sống lành mạnh hơn.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, (problem) is ___ caused by (cause 1) and (cause 2).', answer: 'mainly', vi: '→ Tóm lại, (vấn đề) chủ yếu bắt nguồn từ (nguyên nhân 1) và (nguyên nhân 2).' },
      { en: 'However, it can be ___ by (solution 1) and (solution 2).', answer: 'addressed', vi: '→ Tuy nhiên, vấn đề này có thể được giải quyết bằng (giải pháp 1) và (giải pháp 2).' },
    ]},
  ]},
  { typeId: 'type04', level: 'band6', label: 'Type 04', sub: 'Effect–Solution', name: 'Effect – Solution', orderIndex: 3, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (problem) has become an increasingly common issue in many parts of the ___.', answer: 'world', vi: '→ Trong những năm gần đây, (vấn đề) ngày càng trở thành một vấn đề phổ biến ở nhiều nơi trên thế giới.' },
      { en: 'This problem can have serious ___ on (people/society/the environment).', answer: 'effects', vi: '→ Vấn đề này có thể gây ra những ảnh hưởng nghiêm trọng đến (con người/xã hội/môi trường).' },
      { en: 'This essay will discuss the main effects of this problem and suggest some possible ___.', answer: 'solutions', vi: '→ Bài viết này sẽ phân tích những hậu quả chính của vấn đề và đưa ra một số giải pháp khả thi.' },
    ]},
    { title: '② Body 1 – Effects · Hậu quả', items: [
      { en: 'There are several negative ___ of (problem).', answer: 'effects', vi: '→ Có một số hậu quả tiêu cực của (vấn đề).' },
      { en: "One of the main effects is that it can negatively affect people's mental ___.", answer: 'health', vi: '→ Một trong những hậu quả chính là nó có thể ảnh hưởng tiêu cực đến sức khỏe tinh thần của con người.' },
      { en: 'This is because users may constantly ___ themselves with others online.', answer: 'compare', vi: '→ Điều này là bởi vì người dùng có thể liên tục so sánh bản thân với người khác trên mạng.' },
      { en: 'As a result, they may feel stressed or ___ with their own lives.', answer: 'dissatisfied', vi: '→ Kết quả là, họ có thể cảm thấy căng thẳng hoặc không hài lòng với cuộc sống của mình.' },
      { en: 'Another significant effect is reduced face-to-face ___, which can weaken relationships with family and friends.', answer: 'communication', vi: '→ Một hậu quả đáng kể khác là giảm giao tiếp trực tiếp, điều này có thể làm suy yếu các mối quan hệ với gia đình và bạn bè.' },
    ]},
    { title: '③ Body 2 – Solutions · Giải pháp', items: [
      { en: 'However, there are several ways to ___ the negative effects of this problem.', answer: 'reduce', vi: '→ Tuy nhiên, có một số cách để giảm những ảnh hưởng tiêu cực của vấn đề này.' },
      { en: 'One effective solution is to encourage people to ___ their daily use of social media.', answer: 'limit', vi: '→ Một giải pháp hiệu quả là khuyến khích mọi người hạn chế thời gian sử dụng mạng xã hội hàng ngày.' },
      { en: 'This could help them spend more time on ___ activities and communicate with others in person.', answer: 'offline', vi: '→ Điều này có thể giúp họ dành nhiều thời gian hơn cho các hoạt động ngoại tuyến và giao tiếp trực tiếp với người khác.' },
      { en: 'As a result, they may develop healthier ___ and improve their mental well-being.', answer: 'relationships', vi: '→ Kết quả là, họ có thể xây dựng các mối quan hệ lành mạnh hơn và cải thiện sức khỏe tinh thần.' },
      { en: 'Another possible solution is to ___ young people about the negative effects of excessive social media use.', answer: 'educate', vi: '→ Một giải pháp khả thi khác là giáo dục giới trẻ về những tác động tiêu cực của việc sử dụng quá mức.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, (problem) can have ___ effects on (people/society/the environment).', answer: 'serious', vi: '→ Tóm lại, (vấn đề) có thể gây ra những hậu quả nghiêm trọng đối với (con người/xã hội/môi trường).' },
      { en: 'However, these effects can be ___ by (solution 1) and (solution 2).', answer: 'reduced', vi: '→ Tuy nhiên, những hậu quả này có thể được giảm thiểu bằng (giải pháp 1) và (giải pháp 2).' },
    ]},
  ]},
  { typeId: 'type05', level: 'band6', label: 'Type 05', sub: 'Cause–Effect', name: 'Cause – Effect', orderIndex: 4, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (problem) has become an increasingly common issue in many parts of the ___.', answer: 'world', vi: '→ Trong những năm gần đây, (vấn đề) ngày càng trở thành một vấn đề phổ biến ở nhiều nơi trên thế giới.' },
      { en: 'This issue can be caused by several ___ and can have a range of effects on (people/society/the environment).', answer: 'factors', vi: '→ Vấn đề này có thể xuất phát từ nhiều yếu tố và gây ra nhiều ảnh hưởng đối với (con người/xã hội/môi trường).' },
      { en: 'This essay will discuss the main causes of this problem and ___ its effects.', answer: 'examine', vi: '→ Bài viết này sẽ phân tích những nguyên nhân chính của vấn đề và xem xét những hậu quả của nó.' },
    ]},
    { title: '② Body 1 – Causes · Nguyên nhân', items: [
      { en: 'There are several reasons why (problem) has become increasingly ___.', answer: 'common', vi: '→ Có một số lý do khiến (vấn đề) ngày càng trở nên phổ biến.' },
      { en: 'One of the main causes is the widespread use of digital ___.', answer: 'entertainment', vi: '→ Một trong những nguyên nhân chính là việc sử dụng rộng rãi các phương tiện giải trí kỹ thuật số.' },
      { en: 'This is because people can easily ___ social media, videos and games on their phones.', answer: 'access', vi: '→ Điều này là bởi vì mọi người có thể dễ dàng truy cập mạng xã hội, video và trò chơi trên điện thoại.' },
      { en: 'As a result, they may spend less of their free time ___.', answer: 'reading', vi: '→ Kết quả là, họ có thể dành ít thời gian rảnh hơn để đọc sách.' },
      { en: 'Another important cause is busy ___, which leave people with less time for reading.', answer: 'lifestyles', vi: '→ Một nguyên nhân quan trọng khác là lối sống bận rộn, khiến mọi người có ít thời gian đọc sách hơn.' },
    ]},
    { title: '③ Body 2 – Effects · Hậu quả', items: [
      { en: 'This problem can have several negative effects on ___ and society.', answer: 'individuals', vi: '→ Vấn đề này có thể gây ra một số ảnh hưởng tiêu cực đối với cá nhân và xã hội.' },
      { en: 'One of the main effects is lower levels of ___.', answer: 'concentration', vi: '→ Một trong những hậu quả chính là mức độ tập trung thấp hơn.' },
      { en: 'This is because people who spend too much time consuming short-form content may become used to receiving information ___.', answer: 'quickly', vi: '→ Điều này là bởi vì những người dành quá nhiều thời gian tiêu thụ nội dung ngắn có thể quen với việc tiếp nhận thông tin nhanh chóng.' },
      { en: 'As a result, they may find it more ___ to focus on long texts.', answer: 'difficult', vi: '→ Kết quả là, họ có thể thấy khó khăn hơn khi tập trung vào các văn bản dài.' },
      { en: 'For instance, some students may ___ to concentrate when reading academic materials.', answer: 'struggle', vi: '→ Chẳng hạn, một số học sinh có thể gặp khó khăn khi tập trung đọc tài liệu học thuật.' },
      { en: "Another significant effect is a decline in reading ___, which can limit people's vocabulary and general knowledge.", answer: 'habits', vi: '→ Một hậu quả đáng kể khác là sự suy giảm thói quen đọc sách, điều này có thể hạn chế vốn từ vựng và kiến thức chung của con người.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, (problem) is ___ caused by (cause 1) and (cause 2).', answer: 'mainly', vi: '→ Tóm lại, (vấn đề) chủ yếu bắt nguồn từ (nguyên nhân 1) và (nguyên nhân 2).' },
      { en: 'It can also ___ to (effect 1) and (effect 2).', answer: 'lead', vi: '→ Nó cũng có thể dẫn đến (hậu quả 1) và (hậu quả 2).' },
    ]},
  ]},
  { typeId: 'type06', level: 'band6', label: 'Type 06', sub: 'Agree/Disagree', name: 'Agree / Disagree', orderIndex: 5, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (topic) has become a widely discussed ___.', answer: 'issue', vi: '→ Trong những năm gần đây, (chủ đề) đã trở thành một vấn đề được thảo luận rộng rãi.' },
      { en: 'There are ___ views on whether (paraphrased question).', answer: 'different', vi: '→ Có nhiều quan điểm khác nhau về việc liệu (câu hỏi paraphrase).' },
      { en: 'I completely ___ with this view because (reason 1) and (reason 2).', answer: 'agree', vi: '→ Tôi hoàn toàn đồng ý với quan điểm này vì (lý do 1) và (lý do 2).' },
      { en: 'While I agree that (one side), I ___ that (your main position).', answer: 'believe', vi: '→ Mặc dù tôi đồng ý rằng (một phía), tôi cho rằng (quan điểm chính của bạn).' },
    ]},
    { title: '② Body 1 – First Reason · Lý do 1', items: [
      { en: 'One of the main reasons why I agree with this view is that online education provides greater ___.', answer: 'flexibility', vi: '→ Một trong những lý do chính khiến tôi đồng ý với quan điểm này là giáo dục trực tuyến mang lại sự linh hoạt lớn hơn.' },
      { en: 'This is because students can study at a time and place that is ___ for them.', answer: 'convenient', vi: '→ Điều này là bởi vì học sinh có thể học vào thời gian và địa điểm thuận tiện cho họ.' },
      { en: 'As a result, they can ___ their studies with work or other responsibilities more easily.', answer: 'balance', vi: '→ Kết quả là, họ có thể cân bằng việc học với công việc hoặc các trách nhiệm khác dễ dàng hơn.' },
      { en: 'For example, full-time workers can take online courses in the ___ without having to attend classes in person.', answer: 'evening', vi: '→ Ví dụ, người đi làm toàn thời gian có thể học các khóa học trực tuyến vào buổi tối mà không cần đến lớp trực tiếp.' },
    ]},
    { title: '③ Body 2 – Second Reason · Lý do 2', items: [
      { en: 'Another important reason is that online education can make learning more ___.', answer: 'affordable', vi: '→ Một lý do quan trọng khác là giáo dục trực tuyến có thể làm cho việc học trở nên dễ tiếp cận hơn về chi phí.' },
      { en: 'This is mainly because students do not have to spend as much money on ___ or accommodation.', answer: 'transportation', vi: '→ Điều này chủ yếu là bởi vì học sinh không phải chi nhiều tiền cho việc đi lại hoặc chỗ ở.' },
      { en: 'As a result, education can become more ___ to people from different financial backgrounds.', answer: 'accessible', vi: '→ Kết quả là, giáo dục có thể trở nên dễ tiếp cận hơn với những người có hoàn cảnh tài chính khác nhau.' },
      { en: 'For instance, students living in rural areas can take courses from universities without having to ___ to another city.', answer: 'move', vi: '→ Chẳng hạn, học sinh sống ở vùng nông thôn có thể học các khóa học từ trường đại học mà không cần chuyển đến thành phố khác.' },
      { en: 'However, I believe that (your main position) is more ___.', answer: 'important', vi: '→ Tuy nhiên, tôi cho rằng (quan điểm chính của bạn) quan trọng hơn.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, I ___ that (your position) because (reason 1) and (reason 2).', answer: 'agree', vi: '→ Tóm lại, tôi đồng ý rằng (quan điểm của bạn) vì (lý do 1) và (lý do 2).' },
      { en: 'In conclusion, while (one side) has ___ benefits, I believe that (your main position).', answer: 'some', vi: '→ Tóm lại, mặc dù (một phía) có một số lợi ích, tôi tin rằng (quan điểm chính của bạn).' },
    ]},
  ]},
  { typeId: 'type07', level: 'band6', label: 'Type 07', sub: 'Pos/Neg Dev', name: 'Positive or Negative Development', orderIndex: 6, isActive: true, sections: [
    { title: '① Introduction – Mở bài', items: [
      { en: 'In recent years, (trend) has become increasingly common in many parts of the ___.', answer: 'world', vi: '→ Trong những năm gần đây, (xu hướng) ngày càng trở nên phổ biến ở nhiều nơi trên thế giới.' },
      { en: 'This development has had a noticeable ___ on (people/society/the environment).', answer: 'impact', vi: '→ Sự phát triển này đã có ảnh hưởng đáng kể đến (con người/xã hội/môi trường).' },
      { en: 'In my view, this is a ___ development because (reason 1) and (reason 2).', answer: 'positive', vi: '→ Theo quan điểm của tôi, đây là một sự phát triển tích cực bởi vì (lý do 1) và (lý do 2).' },
    ]},
    { title: '② Body 1 – Main Reasons · Lý do chính', items: [
      { en: 'There are several reasons why I believe this is a ___ development.', answer: 'positive', vi: '→ Có một số lý do khiến tôi cho rằng đây là một sự phát triển tích cực.' },
      { en: 'One of the main reasons is that working from home gives employees greater ___.', answer: 'flexibility', vi: '→ Một trong những lý do chính là làm việc tại nhà mang lại cho nhân viên sự linh hoạt lớn hơn.' },
      { en: 'This is because they can choose when and where to work, as long as they ___ their tasks on time.', answer: 'complete', vi: '→ Điều này là bởi vì họ có thể chọn thời gian và địa điểm làm việc, miễn là hoàn thành công việc đúng hạn.' },
      { en: 'As a result, they may be able to achieve a better work-life ___.', answer: 'balance', vi: '→ Kết quả là, họ có thể đạt được sự cân bằng công việc - cuộc sống tốt hơn.' },
      { en: 'For example, parents can spend more time with their children instead of ___ to and from work.', answer: 'commuting', vi: '→ Ví dụ, cha mẹ có thể dành nhiều thời gian hơn cho con cái thay vì phải đi lại làm việc.' },
      { en: 'Another important benefit is that remote work can reduce commuting, which may save both time and ___.', answer: 'money', vi: '→ Một lợi ích quan trọng khác là làm việc từ xa có thể giảm việc đi lại, giúp tiết kiệm cả thời gian và tiền bạc.' },
    ]},
    { title: '③ Body 2 – Acknowledge & Reinforce · Nhìn nhận đa chiều', items: [
      { en: 'Admittedly, (trend) can also have some ___.', answer: 'disadvantages', vi: '→ Phải thừa nhận rằng (xu hướng) cũng có một số hạn chế.' },
      { en: 'This is mainly because employees may have fewer opportunities to ___ with their colleagues face-to-face.', answer: 'communicate', vi: '→ Điều này chủ yếu là bởi vì nhân viên có thể có ít cơ hội giao tiếp trực tiếp với đồng nghiệp hơn.' },
      { en: 'As a result, some people may feel ___ or less connected to their teams.', answer: 'isolated', vi: '→ Kết quả là, một số người có thể cảm thấy bị cô lập hoặc kém gắn kết với đội nhóm.' },
      { en: 'However, I believe that these disadvantages are ___ by the greater flexibility and convenience that remote work provides.', answer: 'outweighed', vi: '→ Tuy nhiên, tôi cho rằng những hạn chế này vẫn bị vượt qua bởi sự linh hoạt và tiện lợi lớn hơn mà làm việc từ xa mang lại.' },
    ]},
    { title: '④ Conclusion – Kết bài', items: [
      { en: 'In conclusion, I believe that (trend) is a positive development because of its ___ on (aspect 1) and (aspect 2).', answer: 'effects', vi: '→ Tóm lại, tôi cho rằng (xu hướng) là một sự phát triển tích cực bởi những ảnh hưởng của nó đến (khía cạnh 1) và (khía cạnh 2).' },
      { en: 'Overall, the ___ of this trend are likely to remain significant in the future.', answer: 'benefits', vi: '→ Nhìn chung, những lợi ích của xu hướng này có khả năng vẫn đáng kể trong tương lai.' },
    ]},
  ]},
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const tpl of BAND6_TEMPLATES) {
    const result = await Task2Template.findOneAndUpdate(
      { typeId: tpl.typeId, level: 'band6' },
      { $set: tpl },
      { upsert: true, new: true }
    );
    const qCount = result.sections.reduce((n, s) => n + s.items.length, 0);
    console.log('Upserted', result.typeId, '(band6):', result.name, '—', qCount, 'items');
  }

  const totalBand6 = await Task2Template.countDocuments({ level: 'band6' });
  const totalBand7 = await Task2Template.countDocuments({ level: 'band7' });
  console.log(`Done. band6 docs: ${totalBand6}, band7 docs: ${totalBand7}`);

  await mongoose.disconnect();
})().catch(e => { console.error('ERR', e); process.exit(1); });
