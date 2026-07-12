'use strict';
// Extracted from backend/routes/admin.js — Task 2 Templates CRUD section.
// Large on purpose: SEED_TEMPLATES is essay-template content (data), not logic.

const express = require('express');
const auth    = require('../../middleware/auth');
const { teacherOnly, escapeRegex } = require('./_shared');

const Task2Template = require('../../models/Task2Template');

const router = express.Router();

// ══════════════════════════════════════════════════
// TASK 2 TEMPLATES CRUD
// ══════════════════════════════════════════════════

const SEED_TEMPLATES = [
  { typeId:'type01', label:'Type 01', sub:'Adv & Disadv', name:'Advantages & Disadvantages', orderIndex:0, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, (noun phrase) has become an increasingly ___ feature of modern life, attracting considerable public attention.', answer:'prominent', vi:'→ Trong những năm gần đây, ... đã trở thành một phần ngày càng nổi bật trong đời sống hiện đại.' },
      { en:'With the growing prevalence of (noun phrase), questions have ___ regarding its overall impact.', answer:'arisen', vi:'→ Khi ... ngày càng phổ biến, nhiều câu hỏi đã được đặt ra về tác động tổng thể của nó.' },
      { en:'As society continues to evolve, the emergence of (noun phrase) has ___ widespread debate.', answer:'sparked', vi:'→ Khi xã hội tiếp tục phát triển, sự xuất hiện của ... đã làm dấy lên nhiều cuộc tranh luận.' },
      { en:'This essay will examine both the advantages and ___ of (noun phrase).', answer:'disadvantages', vi:'→ Bài luận này sẽ phân tích cả ưu điểm và nhược điểm của ...' },
      { en:'The following discussion aims to provide a ___ analysis of the positive and negative aspects associated with (noun phrase).', answer:'balanced', vi:'→ Bài viết sau sẽ đưa ra phân tích cân bằng về các mặt tích cực và tiêu cực của ...' },
    ]},
    { title:'② Body 1 – Advantages · Ưu điểm', items:[
      { en:'One of the most significant ___ of (noun phrase) is that (clause).', answer:'advantages', vi:'→ Một trong những lợi ích quan trọng nhất của ... là ...' },
      { en:'A key benefit of (noun phrase) ___ in its ability to (verb).', answer:'lies', vi:'→ Một lợi ích chính của ... nằm ở khả năng ...' },
      { en:'To begin with, (noun phrase) ___ individuals to (verb), thereby improving (noun phrase).', answer:'enables', vi:'→ Trước hết, ... cho phép con người ..., từ đó cải thiện ...' },
      { en:'In addition, the adoption of (noun phrase) can contribute to (noun phrase), which plays a ___ role in (verb+ing).', answer:'crucial', vi:'→ Thêm vào đó, việc áp dụng ... có thể góp phần vào ..., điều này đóng vai trò quan trọng trong việc ...' },
      { en:'Furthermore, (noun phrase) often leads to greater efficiency and ___.', answer:'productivity', vi:'→ Ngoài ra, ... thường dẫn đến hiệu quả và năng suất cao hơn.' },
      { en:'For example, recent studies have shown that (fact/statistic). A clear ___ of this can be seen in (specific example), where (positive outcome) occurred.', answer:'illustration', vi:'→ Ví dụ, các nghiên cứu gần đây cho thấy rằng ... Một minh chứng rõ ràng có thể thấy ở (ví dụ cụ thể), nơi (kết quả tích cực) đã xảy ra.' },
    ]},
    { title:'③ Body 2 – Disadvantages · Hạn chế', items:[
      { en:'Despite its advantages, (noun phrase) is not without its ___.', answer:'limitations', vi:'→ Mặc dù có nhiều lợi ích, ... không phải là không có hạn chế.' },
      { en:'However, the increasing ___ on (noun phrase) may give rise to several concerns.', answer:'reliance', vi:'→ Tuy nhiên, sự phụ thuộc ngày càng nhiều vào ... có thể gây ra một số vấn đề đáng lo ngại.' },
      { en:'One major concern is that (clause), which may ___ to (negative consequence).', answer:'lead', vi:'→ Một mối lo ngại lớn là ..., điều này có thể dẫn đến (hệ quả tiêu cực).' },
      { en:'Additionally, dependence on (noun phrase) could result in (noun phrase), thereby ___ (noun phrase).', answer:'undermining', vi:'→ Thêm vào đó, sự phụ thuộc vào ... có thể dẫn đến ..., từ đó làm suy yếu ...' },
      { en:'Another potential ___ involves (noun phrase), which might contribute to (undesirable outcome).', answer:'drawback', vi:'→ Một hạn chế tiềm ẩn khác liên quan đến ..., điều này có thể góp phần gây ra kết quả không mong muốn.' },
      { en:'For instance, research has ___ that (fact/statistic).', answer:'indicated', vi:'→ Chẳng hạn, nghiên cứu đã chỉ ra rằng (sự thật/thống kê).' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, although (noun phrase) offers clear benefits such as (advantage 1) and (advantage 2), it also ___ notable disadvantages, including (disadvantage 1) and (disadvantage 2).', answer:'entails', vi:'→ Tóm lại, mặc dù ... mang lại những lợi ích rõ ràng như (lợi ích 1) và (lợi ích 2), nó cũng tồn tại những hạn chế đáng kể như (hạn chế 1) và (hạn chế 2).' },
      { en:'On ___, it can be argued that the advantages of (noun phrase) outweigh its drawbacks.', answer:'balance', vi:'→ Xét tổng thể, có thể lập luận rằng lợi ích của ... vượt trội hơn hạn chế.' },
      { en:'Nevertheless, careful management and ___ are essential to minimize its negative effects.', answer:'regulation', vi:'→ Tuy nhiên, việc quản lý và điều chỉnh cẩn thận là cần thiết để giảm thiểu tác động tiêu cực.' },
    ]},
  ]},
  { typeId:'type02', label:'Type 02', sub:'Discuss Both', name:'Discuss Both Views', orderIndex:1, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent decades, the issue of (noun phrase) has ___ increasing public attention.', answer:'attracted', vi:'→ Trong vài thập kỷ gần đây, vấn đề ... đã thu hút sự quan tâm ngày càng lớn của công chúng.' },
      { en:'There has been an ongoing ___ about whether (clause).', answer:'debate', vi:'→ Đã có một cuộc tranh luận kéo dài về việc liệu ...' },
      { en:'With the rapid development of (noun phrase), ___ opinions have emerged regarding its impact.', answer:'differing', vi:'→ Với sự phát triển nhanh chóng của ..., nhiều quan điểm trái chiều đã xuất hiện về tác động của nó.' },
      { en:'While some people argue that (clause), ___ believe that (clause).', answer:'others', vi:'→ Trong khi một số người cho rằng ..., những người khác lại tin rằng ...' },
      { en:'This essay will discuss both ___ before presenting my own viewpoint.', answer:'perspectives', vi:'→ Bài viết này sẽ thảo luận cả hai quan điểm trước khi đưa ra ý kiến cá nhân.' },
      { en:'The following discussion will examine the arguments on both sides and offer a ___ conclusion.', answer:'balanced', vi:'→ Bài viết sau sẽ xem xét lập luận của cả hai phía và đưa ra kết luận cân bằng.' },
    ]},
    { title:'② Body 1 – First View · Quan điểm 1', items:[
      { en:'There are several convincing reasons why some people ___ (noun/gerund).', answer:'support', vi:'→ Có nhiều lý do thuyết phục khiến một số người ủng hộ ...' },
      { en:'One major reason for this view is that (clause). This is largely because (reason). As a ___, (consequence).', answer:'result', vi:'→ Điều này chủ yếu là do ... Kết quả là ...' },
      { en:'Unlike in the past, when (past situation), ___ (current trend).', answer:'nowadays', vi:'→ Không giống như trước đây, khi (tình huống quá khứ), ngày nay (xu hướng hiện tại).' },
      { en:'For instance, research has shown that (fact/statistic). This ___ that (implication).', answer:'suggests', vi:'→ Ví dụ, nghiên cứu đã chỉ ra rằng ... Điều này cho thấy rằng (hàm ý).' },
      { en:'Furthermore, another important factor to ___ is (noun phrase).', answer:'consider', vi:'→ Hơn nữa, một yếu tố quan trọng khác cần xem xét là ...' },
      { en:'In addition, many experts ___ that (clause).', answer:'believe', vi:'→ Ngoài ra, nhiều chuyên gia tin rằng ...' },
    ]},
    { title:'③ Body 2 – Opposing View · Quan điểm đối lập', items:[
      { en:'On the other ___, critics argue that (clause).', answer:'hand', vi:'→ Mặt khác, những người phản đối cho rằng ...' },
      { en:'However, an ___ perspective suggests that (clause).', answer:'alternative', vi:'→ Tuy nhiên, một quan điểm khác cho rằng ...' },
      { en:'One key concern is that (clause). This may ___ to (negative consequence).', answer:'lead', vi:'→ Một mối lo ngại chính là ... Điều này có thể dẫn đến (hệ quả tiêu cực).' },
      { en:'If (condition), it could result in (outcome). Such a situation is often ___ by (factor).', answer:'driven', vi:'→ Nếu (điều kiện), nó có thể dẫn đến (kết quả). Tình huống này thường được thúc đẩy bởi (yếu tố).' },
      { en:'This highlights the potential risks ___ with (noun/gerund).', answer:'associated', vi:'→ Điều này làm nổi bật những rủi ro tiềm ẩn liên quan đến ...' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, both ___ offer valid arguments regarding (noun/gerund).', answer:'perspectives', vi:'→ Tóm lại, cả hai quan điểm đều đưa ra những lập luận hợp lý về ...' },
      { en:'Personally, I believe that (stance) because (main reason). Moving forward, ___ should consider (action) to address these concerns.', answer:'policymakers', vi:'→ Cá nhân tôi tin rằng (lập trường) vì (lý do chính). Trong tương lai, các nhà hoạch định chính sách nên xem xét (hành động) để giải quyết những vấn đề này.' },
    ]},
  ]},
  { typeId:'type03', label:'Type 03', sub:'Cause–Solution', name:'Cause – Solution', orderIndex:2, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, (noun phrase) has become an increasingly serious ___ in many parts of the world.', answer:'concern', vi:'→ Trong những năm gần đây, ... đã trở thành một vấn đề ngày càng nghiêm trọng ở nhiều nơi trên thế giới.' },
      { en:'One of the major ___ facing modern society today is (noun phrase).', answer:'challenges', vi:'→ Một trong những thách thức lớn mà xã hội hiện đại đang phải đối mặt là ...' },
      { en:'This essay will explore the main ___ of (noun phrase) and propose practical solutions to address this problem.', answer:'causes', vi:'→ Bài viết này sẽ phân tích các nguyên nhân chính và đề xuất những giải pháp thiết thực.' },
    ]},
    { title:'② Body 1 – Causes · Nguyên nhân', items:[
      { en:'There are several underlying factors contributing to (noun phrase). The root causes ___ from both social and economic factors.', answer:'stem', vi:'→ Có nhiều yếu tố cơ bản góp phần gây ra ... Nguyên nhân gốc rễ bắt nguồn từ cả yếu tố xã hội lẫn kinh tế.' },
      { en:'One of the ___ reasons behind this problem is (cause). This can largely be attributed to (noun phrase).', answer:'primary', vi:'→ Một trong những nguyên nhân chính của vấn đề này là ... Điều này phần lớn bắt nguồn từ ...' },
      { en:'For instance, (specific example). This ___ that (implication).', answer:'suggests', vi:'→ Ví dụ, (ví dụ cụ thể). Điều này cho thấy rằng (hàm ý).' },
      { en:'Another ___ contributor is (cause). Unlike in the past, when (past situation), today (current trend).', answer:'significant', vi:'→ Một yếu tố quan trọng khác là ... Không giống như trước đây, ngày nay ...' },
      { en:'If this trend continues, it could ___ to (negative consequence).', answer:'lead', vi:'→ Nếu xu hướng này tiếp diễn, nó có thể dẫn đến (hệ quả tiêu cực).' },
    ]},
    { title:'③ Body 2 – Solutions · Giải pháp', items:[
      { en:'Nevertheless, several practical ___ can be taken to address this issue effectively.', answer:'measures', vi:'→ Tuy nhiên, có thể thực hiện một số biện pháp thiết thực để giải quyết vấn đề này hiệu quả.' },
      { en:'One effective way to ___ this problem is to (verb).', answer:'tackle', vi:'→ Một cách hiệu quả là giải quyết vấn đề này bằng cách ...' },
      { en:'This would ensure that (mechanism/explanation), ultimately ___ to (positive outcome).', answer:'leading', vi:'→ Điều này sẽ đảm bảo rằng (giải thích cơ chế), cuối cùng dẫn đến (kết quả tích cực).' },
      { en:'Not only would this help (effect 1), but it would ___ (effect 2).', answer:'also', vi:'→ Giải pháp này không chỉ giúp ... mà còn ...' },
      { en:'Another viable approach ___ (verb+ing). If widely implemented, this could serve as a long-term solution.', answer:'involves', vi:'→ Một cách tiếp cận khả thi khác là ... Nếu được triển khai rộng rãi, biện pháp này có thể trở thành giải pháp lâu dài.' },
      { en:'Research has shown that (evidence/statistic), ___ the effectiveness of this strategy.', answer:'reinforcing', vi:'→ Nghiên cứu đã chỉ ra rằng ..., củng cố tính hiệu quả của chiến lược này.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) remains a ___ issue that requires immediate and coordinated action.', answer:'complex', vi:'→ Kết luận lại, ... vẫn là một vấn đề phức tạp cần hành động khẩn cấp và đồng bộ.' },
      { en:'Among the various measures discussed, I believe that (solution) would be the most ___ in the long term.', answer:'effective', vi:'→ Trong các giải pháp đã nêu, tôi tin rằng ... sẽ hiệu quả nhất trong dài hạn.' },
      { en:'If governments, organizations, and individuals work ___, this issue can be significantly alleviated.', answer:'collaboratively', vi:'→ Nếu chính phủ, tổ chức và cá nhân cùng hợp tác, vấn đề này có thể được giảm thiểu đáng kể.' },
    ]},
  ]},
  { typeId:'type04', label:'Type 04', sub:'Effect–Solution', name:'Effect – Solution', orderIndex:3, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, increasing ___ has been paid to the issue of (noun phrase).', answer:'attention', vi:'→ Trong những năm gần đây, vấn đề ... ngày càng nhận được nhiều sự quan tâm.' },
      { en:'One of the most serious ___ facing modern society is (noun phrase).', answer:'challenges', vi:'→ Một trong những thách thức nghiêm trọng nhất mà xã hội hiện đại đang đối mặt là ...' },
      { en:'This essay will examine the major ___ of (noun phrase) and suggest practical solutions to mitigate its impact.', answer:'effects', vi:'→ Bài viết này sẽ phân tích những tác động chính và đề xuất các giải pháp thực tế để giảm thiểu ảnh hưởng.' },
      { en:'This issue has resulted in a range of significant consequences. If left ___, it may lead to even more serious long-term implications.', answer:'unaddressed', vi:'→ Vấn đề này đã gây ra nhiều hậu quả đáng kể. Nếu không được giải quyết, nó có thể dẫn đến những hệ quả nghiêm trọng hơn.' },
    ]},
    { title:'② Body 1 – Effects · Hậu quả', items:[
      { en:'Two particularly ___ effects of this issue are (effect 1) and (effect 2).', answer:'alarming', vi:'→ Hai hậu quả đáng lo ngại nhất của vấn đề này là ... và ...' },
      { en:'To begin with, (effect 1) is a major concern. This is largely because (reason/explanation). If this situation continues, it may ___ to (long-term consequence).', answer:'lead', vi:'→ Trước hết, ... là một mối lo ngại lớn. Nếu tình trạng này tiếp diễn, nó có thể dẫn đến (hậu quả lâu dài).' },
      { en:'Another ___ impact is (effect 2). As a result, (consequence).', answer:'significant', vi:'→ Một tác động đáng kể khác là ... Do đó, (hệ quả).' },
      { en:'Over time, this can place considerable ___ on (group/system/society).', answer:'pressure', vi:'→ Theo thời gian, điều này có thể tạo áp lực lớn lên (nhóm/hệ thống/xã hội).' },
    ]},
    { title:'③ Body 2 – Solutions · Giải pháp', items:[
      { en:'Despite these challenges, several effective ___ can be taken to address this issue.', answer:'measures', vi:'→ Mặc dù có những thách thức này, vẫn có thể thực hiện một số biện pháp hiệu quả để giải quyết vấn đề.' },
      { en:'The most ___ solution is to (verb). This approach would not only (benefit 1) but also (benefit 2).', answer:'practical', vi:'→ Giải pháp thiết thực nhất là ... Cách tiếp cận này không chỉ giúp ... mà còn ...' },
      { en:'Another ___ strategy is to (verb). If implemented on a large scale, this measure could bring about long-term improvements.', answer:'viable', vi:'→ Một chiến lược khả thi khác là ... Nếu được triển khai trên diện rộng, biện pháp này có thể mang lại cải thiện lâu dài.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) continues to ___ serious challenges due to its significant consequences.', answer:'pose', vi:'→ Tóm lại, ... vẫn gây ra những thách thức nghiêm trọng do những hậu quả đáng kể của nó.' },
      { en:'In my opinion, tackling this problem requires both (solution 1) and (solution 2) in order to achieve sustainable ___.', answer:'results', vi:'→ Theo tôi, việc giải quyết vấn đề này đòi hỏi cả hai giải pháp để đạt được kết quả bền vững.' },
      { en:'While the effects are undeniable, they can be ___ through coordinated efforts.', answer:'addressed', vi:'→ Mặc dù tác động của vấn đề này là không thể phủ nhận, chúng có thể được giải quyết thông qua sự phối hợp đồng bộ.' },
    ]},
  ]},
  { typeId:'type05', label:'Type 05', sub:'Cause–Effect', name:'Cause – Effect', orderIndex:4, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:"In today's fast-changing world, (noun phrase) has become an increasingly ___ concern.", answer:'significant', vi:'→ Trong thế giới thay đổi nhanh chóng ngày nay, ... đang trở thành mối quan tâm ngày càng lớn.' },
      { en:'It is ___ that (noun phrase) now plays a pivotal role in shaping modern life.', answer:'undeniable', vi:'→ Không thể phủ nhận rằng ... hiện đóng vai trò quan trọng trong đời sống hiện đại.' },
      { en:'Across the globe, societies are ___ with the issue of (noun phrase).', answer:'grappling', vi:'→ Trên toàn cầu, các xã hội đang vật lộn với vấn đề ...' },
      { en:'This essay will examine the underlying ___ of (noun phrase) and analyze its significant effects on society.', answer:'causes', vi:'→ Bài luận này sẽ xem xét các nguyên nhân sâu xa và phân tích những tác động đáng kể đối với xã hội.' },
    ]},
    { title:'② Body 1 – Causes · Nguyên nhân', items:[
      { en:'The causes of (noun phrase) are both complex and ___. Several key factors can be identified as contributing to this phenomenon.', answer:'multifaceted', vi:'→ Nguyên nhân của ... vừa phức tạp vừa đa chiều. Có thể xác định một số yếu tố chính góp phần vào hiện tượng này.' },
      { en:'One primary factor is (cause), which significantly contributes to this issue. It is widely ___ that (clause), making it a central driver of this trend.', answer:'acknowledged', vi:'→ Một yếu tố chính là ..., điều này góp phần đáng kể vào vấn đề. Nhiều người thừa nhận rằng ..., khiến nó trở thành động lực chính của xu hướng này.' },
      { en:'For example, (specific example) clearly ___ how this cause leads to wider consequences.', answer:'demonstrates', vi:'→ Ví dụ, (ví dụ cụ thể) cho thấy rõ cách nguyên nhân này dẫn đến hậu quả rộng hơn.' },
      { en:'This can largely be ___ to (cause), which in turn results in (effect).', answer:'attributed', vi:'→ Điều này phần lớn là do ..., từ đó dẫn đến ...' },
      { en:'Not only does (cause) trigger (effect), but it also creates a ___ effect across society.', answer:'ripple', vi:'→ ... không chỉ gây ra ... mà còn tạo hiệu ứng lan tỏa trong xã hội.' },
    ]},
    { title:'③ Body 2 – Effects · Hậu quả', items:[
      { en:'The effects of (noun phrase) are both immediate and long-term. This issue brings about several serious ___.', answer:'consequences', vi:'→ Tác động của ... vừa mang tính tức thời vừa lâu dài. Vấn đề này kéo theo nhiều hậu quả nghiêm trọng.' },
      { en:'One significant consequence is (effect). Research has ___ shown that (clause).', answer:'consistently', vi:'→ Một hậu quả đáng kể là ... Nghiên cứu đã liên tục chỉ ra rằng ...' },
      { en:'Furthermore, this phenomenon ___ leads to (noun phrase). More alarmingly, the long-term implications may include (serious effect).', answer:'inevitably', vi:'→ Hơn nữa, hiện tượng này tất yếu dẫn đến ... Đáng lo ngại hơn, tác động lâu dài có thể bao gồm ...' },
      { en:'Over time, these effects may ___, placing substantial pressure on (group/society).', answer:'accumulate', vi:'→ Theo thời gian, những tác động này có thể tích tụ và gây áp lực lớn lên ...' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, (noun phrase) stems from a range of ___ factors and results in significant consequences.', answer:'interconnected', vi:'→ Tóm lại, ... bắt nguồn từ nhiều yếu tố liên quan lẫn nhau và gây ra hậu quả đáng kể.' },
      { en:'Addressing this problem requires ___ efforts from both individuals and policymakers.', answer:'coordinated', vi:'→ Giải quyết vấn đề này đòi hỏi sự phối hợp từ cả cá nhân và nhà hoạch định chính sách.' },
      { en:'If effective measures are taken, the negative ___ can be significantly reduced.', answer:'impacts', vi:'→ Nếu có biện pháp hiệu quả, tác động tiêu cực có thể được giảm đáng kể.' },
    ]},
  ]},
  { typeId:'type06', label:'Type 06', sub:'Agree/Disagree', name:'Agree / Disagree', orderIndex:5, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'The issue of (topic) has become a subject of considerable ___ in recent years.', answer:'debate', vi:'→ Vấn đề về ... đã trở thành một chủ đề gây tranh luận đáng kể trong những năm gần đây.' },
      { en:'In contemporary society, the question of whether (paraphrase question) remains highly ___.', answer:'controversial', vi:'→ Trong xã hội hiện đại, câu hỏi liệu ... vẫn còn gây nhiều tranh cãi.' },
      { en:'I strongly ___ that (your position) for several compelling reasons.', answer:'agree', vi:'→ Tôi hoàn toàn đồng ý rằng ... vì một số lý do thuyết phục.' },
      { en:'While I ___ that (one side of argument), I believe that (your balanced position).', answer:'acknowledge', vi:'→ Mặc dù tôi thừa nhận rằng ..., tôi tin rằng (lập trường cân bằng của bạn).' },
      { en:'Although there are valid arguments supporting (opposing view), I ___ that (your main stance) outweighs these considerations.', answer:'contend', vi:'→ Mặc dù có những lập luận hợp lý ủng hộ (quan điểm đối lập), tôi cho rằng (lập trường chính) vượt trội hơn.' },
    ]},
    { title:'② Body 1 – Main Argument · Lập luận chính', items:[
      { en:'One ___ reason why (your position) is that (reason 1).', answer:'compelling', vi:'→ Một lý do thuyết phục khiến (lập trường của bạn) là (lý do 1).' },
      { en:'It is ___ that (key point) plays a crucial role in (related aspect).', answer:'undeniable', vi:'→ Không thể phủ nhận rằng ... đóng vai trò quan trọng trong ...' },
      { en:'This can be attributed to the fact that (explanation). For instance, (specific example), which clearly ___ that (analysis).', answer:'illustrates', vi:'→ Điều này có thể là do thực tế rằng ... Ví dụ, ..., điều này minh chứng rõ ràng rằng ...' },
      { en:'Research has consistently shown that (finding), thereby ___ the view that (argument).', answer:'reinforcing', vi:'→ Nghiên cứu đã liên tục chỉ ra rằng ..., từ đó củng cố quan điểm rằng ...' },
    ]},
    { title:'③ Body 2 – Counter-argument · Phản biện (Band 7.5+)', items:[
      { en:'While some may argue that (opposing view), this perspective fails to ___ that (counterargument).', answer:'consider', vi:'→ Mặc dù một số người có thể cho rằng ..., quan điểm này bỏ sót việc ...' },
      { en:'Admittedly, (concession); ___, the overall impact remains predominantly positive/negative.', answer:'nevertheless', vi:'→ Thừa nhận rằng ...; tuy nhiên, tác động tổng thể vẫn chủ yếu là tích cực/tiêu cực.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, having examined the arguments presented, I ___ that (restate position).', answer:'maintain', vi:'→ Tóm lại, sau khi xem xét các lập luận đã trình bày, tôi duy trì rằng ...' },
      { en:'Ultimately, striking a ___ between (aspect 1) and (aspect 2) may represent the most pragmatic approach.', answer:'balance', vi:'→ Cuối cùng, tìm kiếm sự cân bằng giữa ... và ... có thể là cách tiếp cận thực tế nhất.' },
    ]},
  ]},
  { typeId:'type07', label:'Type 07', sub:'Pos/Neg Dev', name:'Positive or Negative Development', orderIndex:6, isActive:true, sections:[
    { title:'① Introduction – Mở bài', items:[
      { en:'In recent years, (noun phrase) has emerged as one of the most ___ trends in contemporary society, sparking widespread debate.', answer:'controversial', vi:'→ Trong những năm gần đây, ... đã nổi lên là một trong những xu hướng gây tranh cãi nhất trong xã hội hiện đại.' },
      { en:'Views on this development remain deeply ___, with some welcoming it as progress and others raising serious concerns.', answer:'divided', vi:'→ Quan điểm về sự phát triển này vẫn còn rất phân cực, với một số người hoan nghênh nó và những người khác bày tỏ lo ngại.' },
      { en:'While (noun phrase) undoubtedly brings certain ___, it also carries the potential for significant drawbacks.', answer:'benefits', vi:'→ Mặc dù ... chắc chắn mang lại một số lợi ích, nó cũng tiềm ẩn những hạn chế đáng kể.' },
      { en:'I firmly ___ that, on balance, this constitutes a predominantly positive/negative development for the reasons outlined below.', answer:'believe', vi:'→ Tôi kiên định cho rằng, xét tổng thể, đây là một sự phát triển phần lớn tích cực/tiêu cực.' },
      { en:'This essay will ___ both dimensions of this issue before arriving at a well-supported conclusion.', answer:'examine', vi:'→ Bài viết này sẽ xem xét cả hai khía cạnh của vấn đề trước khi đưa ra kết luận có căn cứ.' },
    ]},
    { title:'② Body 1 – Main Case · Lập luận chính', items:[
      { en:'There are several ___ reasons to view (noun phrase) as a positive/negative development.', answer:'compelling', vi:'→ Có một số lý do thuyết phục để coi ... là một sự phát triển tích cực/tiêu cực.' },
      { en:'One of the most notable aspects is that (noun phrase) has ___ contributed to (outcome), benefiting/harming a large portion of society.', answer:'considerably', vi:'→ Một trong những khía cạnh đáng chú ý nhất là ... đã đóng góp đáng kể vào (kết quả).' },
      { en:'This is primarily because (reason), which has a ___ and far-reaching effect on (group/society/economy).', answer:'profound', vi:'→ Nguyên nhân chính là ..., điều này có tác động sâu sắc và rộng khắp đến (nhóm người/xã hội/nền kinh tế).' },
      { en:'To illustrate, (specific example) clearly ___ the magnitude of this trend\'s impact on everyday life.', answer:'demonstrates', vi:'→ Để minh họa, (ví dụ cụ thể) cho thấy rõ mức độ tác động của xu hướng này đối với cuộc sống hàng ngày.' },
      { en:'Furthermore, the influence of (noun phrase) ___ well beyond the individual, reshaping communities and institutions alike.', answer:'extends', vi:'→ Hơn nữa, sức ảnh hưởng của ... vươn xa hơn cá nhân, định hình lại cả các cộng đồng lẫn tổ chức.' },
      { en:'Research has consistently ___ that (fact/statistic), providing strong evidence that this development is largely beneficial/harmful.', answer:'confirmed', vi:'→ Nghiên cứu đã liên tục xác nhận rằng (thực tế/thống kê), cung cấp bằng chứng rõ ràng về sự phát triển này.' },
      { en:'This is a ___ that is likely to ___ as societal conditions and technological capabilities continue to evolve.', answers:['pattern','intensify'], vi:'→ Đây là một xu hướng có khả năng ngày càng mạnh mẽ hơn khi các điều kiện xã hội và năng lực công nghệ tiếp tục phát triển.' },
    ]},
    { title:'③ Body 2 – Acknowledge & Reinforce · Nhìn nhận đa chiều (Band 7+)', items:[
      { en:'Admittedly, (noun phrase) is not without its shortcomings, and critics have raised ___ concerns about (specific issue).', answer:'legitimate', vi:'→ Thừa nhận rằng, ... không phải là không có thiếu sót, và các nhà phê bình đã đặt ra những lo ngại chính đáng.' },
      { en:'However, these concerns, while not entirely ___, do not fundamentally alter the overall trajectory of this development.', answer:'unfounded', vi:'→ Tuy nhiên, những lo ngại này, dù không hoàn toàn vô căn cứ, nhưng không thay đổi cơ bản xu hướng tổng thể.' },
      { en:'When considered in a broader context, the positive/negative aspects of (noun phrase) clearly ___ its drawbacks/merits.', answer:'outweigh', vi:'→ Khi xem xét trong bối cảnh rộng hơn, các khía cạnh tích cực/tiêu cực của ... rõ ràng vượt trội hơn.' },
      { en:'Moreover, any potential risks can be effectively ___ through appropriate governance, public awareness, and informed policy decisions.', answer:'mitigated', vi:'→ Hơn nữa, bất kỳ rủi ro tiềm ẩn nào cũng có thể được giảm thiểu thông qua quản trị phù hợp và quyết định chính sách sáng suốt.' },
      { en:'Ultimately, the ___ benefits of this development far outweigh the associated risks, making a strong case for this position.', answer:'cumulative', vi:'→ Cuối cùng, những lợi ích tích lũy của sự phát triển này vượt xa so với những rủi ro liên quan.' },
      { en:'A ___ reading of the available evidence ___ that the positive outcomes significantly outweigh the concerns raised by critics.', answers:['careful','reveals'], vi:'→ Việc đọc cẩn thận các bằng chứng hiện có cho thấy rằng các kết quả tích cực vượt trội đáng kể so với những lo ngại của nhà phê bình.' },
    ]},
    { title:'④ Conclusion – Kết bài', items:[
      { en:'In conclusion, having examined this issue from multiple ___, I maintain that this is fundamentally a positive/negative development.', answer:'angles', vi:'→ Tóm lại, sau khi xem xét vấn đề này từ nhiều góc độ, tôi duy trì rằng đây về cơ bản là một sự phát triển tích cực/tiêu cực.' },
      { en:'The evidence ___ suggests that the advantages/disadvantages of (noun phrase) far exceed the drawbacks/merits, warranting a clear position.', answer:'overwhelmingly', vi:'→ Bằng chứng áp đảo cho thấy lợi ích/tác hại của ... vượt xa so với hạn chế/ưu điểm.' },
      { en:'Going forward, it is ___ that individuals, communities, and policymakers take a proactive approach to maximise the gains and minimise the risks of this trend.', answer:'essential', vi:'→ Trong tương lai, điều thiết yếu là các cá nhân, cộng đồng và nhà hoạch định chính sách cần có cách tiếp cận chủ động.' },
    ]},
  ]},
];

// GET /api/admin/task2/templates
router.get('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = search ? { $or: [{ name: { $regex: escapeRegex(search), $options: 'i' } }, { typeId: { $regex: escapeRegex(search), $options: 'i' } }] } : {};
    const templates = await Task2Template.find(query).sort({ orderIndex: 1 }).lean();
    res.json({ success: true, templates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates/seed  (before :id route)
router.post('/task2/templates/seed', auth, teacherOnly, async (req, res) => {
  try {
    const { force = false } = req.body;
    const existing = await Task2Template.countDocuments();
    if (existing > 0 && !force) {
      return res.json({ success: false, message: `Đã có ${existing} template. Gửi force:true để ghi đè.` });
    }
    if (force) await Task2Template.deleteMany({});
    await Task2Template.insertMany(SEED_TEMPLATES);
    res.json({ success: true, message: `Đã seed ${SEED_TEMPLATES.length} template mặc định.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/task2/templates/:id
router.get('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const template = await Task2Template.findById(req.params.id).lean();
    if (!template) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/task2/templates
router.post('/task2/templates', auth, teacherOnly, async (req, res) => {
  try {
    const template = new Task2Template(req.body);
    await template.save();
    res.status(201).json({ success: true, template });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/task2/templates/:id
router.put('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findById(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    Object.keys(req.body).forEach(k => { tpl[k] = req.body[k]; });
    await tpl.save();
    res.json({ success: true, template: tpl.toObject() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/task2/templates/:id
router.delete('/task2/templates/:id', auth, teacherOnly, async (req, res) => {
  try {
    const tpl = await Task2Template.findByIdAndDelete(req.params.id);
    if (!tpl) return res.status(404).json({ success: false, message: 'Không tìm thấy template' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
