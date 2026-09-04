'use strict';

// Per-essay-type reference material for the Task 2 Templates page
// (frontend/task2-template.html). Verbatim from PART B of
//   "task 2 writing/IELTS_Writing_Task2_TemplateBank.docx"  (Thầy Dan)
// — the same document the Band 6+/Band 7+ template sentences were seeded
// from. This adds the teaching scaffolding that was NOT on the web:
// recognising the question, the outline, the 6+→7+ upgrade table, useful
// language, a full Band 7+ model essay, and the common mistakes.
//
// Seeded by scripts/seedTask2TypeGuides.js into the Task2TypeGuide model.
// typeId matches Task2Template.typeId (type01..type07).

module.exports = [
  {
    typeId: 'type01',
    name: 'Advantages & Disadvantages',
    nameVi: 'Ưu điểm và nhược điểm',
    orderIndex: 0,
    recognise: {
      stems: [
        'What are the advantages and disadvantages of this trend?',
        'Discuss the advantages and disadvantages of...',
        'Does this development have more advantages than disadvantages?',
        'Do the benefits outweigh the drawbacks?',
      ],
      note: 'Nếu đề chỉ nói "discuss the advantages and disadvantages" → bạn có thể trung lập, không bắt buộc nêu quan điểm. Nếu đề hỏi "more advantages or more disadvantages" hoặc "outweigh" → bạn BẮT BUỘC chọn một phe và nói rõ ở cả Introduction lẫn Conclusion. Không chọn phe là mất điểm Task Response.',
    },
    outline: {
      flow: 'INTRO → BODY 1: ADVANTAGES → BODY 2: DISADVANTAGES → CONCLUSION + OPINION',
      perBody: 'IDEA → BECAUSE (tại sao) → RESULT (dẫn đến gì) → EXAMPLE (ví dụ cụ thể)',
    },
    upgradePairs: [
      ['In recent years, (topic) has become increasingly common.', 'In recent years, (topic) has become an increasingly prominent feature of modern life.'],
      ['While (topic) offers several benefits, it also has some drawbacks.', 'While the merits of (topic) are widely acknowledged, its potential drawbacks deserve equal consideration.'],
      ['This essay will discuss the advantages and disadvantages.', 'This essay will examine both the advantages and disadvantages of (topic).'],
      ['One of the main advantages is that...', 'One of the most significant advantages lies in its capacity to...'],
      ['This is mainly because...', 'This can largely be attributed to the fact that...'],
      ['As a result, people can save time.', 'Consequently, individuals can save a considerable amount of time, thereby freeing up hours for family or study.'],
      ['For example, (example).', 'A clear illustration of this can be seen in (example), where (outcome) occurred.'],
      ['However, (topic) also has some disadvantages.', 'Despite its advantages, (topic) is not without its limitations.'],
      ['This may cause problems.', 'This may give rise to a number of pressing concerns.'],
      ['Overall, I believe the advantages outweigh the disadvantages.', 'On balance, it can be argued that the advantages outweigh the drawbacks, provided that (condition).'],
    ],
    usefulLanguage: [
      { label: 'Nói về ưu điểm', lines: [
        'One of the main advantages is that... / A key benefit lies in its ability to...',
        'This makes it easier for people to... / This gives people greater access to...',
        'a major advantage · a significant benefit · a considerable improvement in...',
        'enable people to... · allow people to... · save time and money · improve quality of life',
      ] },
      { label: 'Nói về nhược điểm', lines: [
        'One of the main drawbacks is that... / One major concern is that...',
        'Despite its advantages, ... is not without its limitations.',
        'a serious drawback · a potential risk · an unintended consequence',
        'give rise to... · undermine... · place pressure on... · lead to an over-reliance on...',
      ] },
      { label: 'So sánh hai mặt ở kết bài', lines: [
        'the advantages outweigh the disadvantages',
        'the drawbacks are outweighed by the benefits',
        'the benefits are likely to be more significant in the long term',
        'provided that appropriate measures are taken',
      ] },
    ],
    modelEssay: {
      prompt: 'In some countries, many people continue to live with or very near their parents even when they are married and have their own children. Does this situation have more advantages or more disadvantages?',
      wordCount: 'khoảng 265 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'In some societies, it is increasingly common for married adults to live with or in close proximity to their parents, even after starting families of their own. With the growing prevalence of multigenerational households, questions have arisen regarding their overall impact. This essay will examine both the advantages and disadvantages of this arrangement.' },
        { title: 'BODY 1 — ADVANTAGES', text: 'One of the most significant advantages of living close to one’s parents is that it provides substantial practical and emotional support. To begin with, this arrangement enables individuals to receive assistance with childcare, thereby improving work–life balance. Grandparents often help look after young children, allowing parents to maintain full-time employment or reduce financial pressure. In addition, sharing a household can contribute to stronger family bonds, which plays a crucial role in fostering emotional stability. For example, children who grow up in extended families may benefit from greater affection, guidance, and a stronger sense of cultural identity.' },
        { title: 'BODY 2 — DISADVANTAGES', text: 'Despite its advantages, living with or near parents is not without its limitations. One major concern is that a lack of privacy may lead to tension and conflict between generations. Differences in parenting styles, lifestyle preferences, or financial decisions can create misunderstandings within the household. Additionally, an over-reliance on parents could result in reduced independence, thereby undermining personal growth.' },
        { title: 'CONCLUSION', text: 'In conclusion, although living in close proximity to parents offers clear benefits such as practical support and stronger family connections, it also entails notable disadvantages, including reduced privacy and potential dependency. On balance, it can be argued that the advantages of this arrangement outweigh its drawbacks, particularly in cultures where family cohesion and mutual assistance are highly valued.' },
      ],
    },
    mistakes: [
      'Viết hai body dài ngắn chênh lệch. Nếu Body 1 có bốn câu mà Body 2 chỉ có hai, giám khảo sẽ thấy bài mất cân đối. Giữ hai đoạn xấp xỉ bằng nhau.',
      'Liệt kê ba, bốn ưu điểm mà không giải thích ý nào. Hai ý được phát triển đầy đủ luôn tốt hơn bốn ý bị bỏ dở.',
      'Quên chọn phe khi đề hỏi "outweigh". Đây là lỗi mất điểm nặng nhất ở dạng này.',
      'Nhầm với dạng Discuss Both Views. Advantages/Disadvantages nói về mặt tốt và mặt xấu của MỘT thứ; Discuss Both Views nói về quan điểm của HAI nhóm người.',
    ],
  },

  {
    typeId: 'type02',
    name: 'Discuss Both Views',
    nameVi: 'Thảo luận hai quan điểm',
    orderIndex: 1,
    recognise: {
      stems: [
        'Some people think... while others believe... Discuss both views and give your own opinion.',
        'Some people argue that... Others say that... Discuss both these views.',
        'Dấu hiệu: đề nêu hai nhóm người với hai ý kiến trái ngược, và gần như luôn có cụm "give your own opinion".',
      ],
      note: 'Khi đề có "and give your own opinion", bạn phải nêu quan điểm cá nhân ở Introduction VÀ nhắc lại ở Conclusion. Chỉ nêu ở kết bài là chưa đủ và thường bị giữ ở Band 6. Phải viết về cả hai quan điểm với độ dài tương đương, kể cả quan điểm bạn không đồng ý.',
    },
    outline: {
      flow: 'INTRO + OPINION → BODY 1: VIEW 1 → BODY 2: VIEW 2 → CONCLUSION + OPINION',
      perBody: 'VIEW → WHY? (tại sao họ nghĩ vậy) → RESULT → EXAMPLE',
    },
    upgradePairs: [
      ['In recent years, (topic) has become a widely discussed issue.', 'In recent decades, the issue of (topic) has attracted increasing public attention.'],
      ['Some people believe that... others argue that...', 'While proponents of (view 1) maintain that..., critics contend that...'],
      ['One reason for this view is that...', 'One major reason underpinning this view is that...'],
      ['This is because...', 'This is largely because... / This stems from the fact that...'],
      ['As a result, more people can study.', 'As a result, higher education becomes accessible to a far wider section of society.'],
      ['For example, (example).', 'For instance, (example). This suggests that (implication).'],
      ['On the other hand, others argue that...', 'On the other hand, critics argue that... / An opposing view holds that...'],
      ['This is a problem.', 'This may give rise to a number of serious concerns.'],
      ['In conclusion, both views have advantages.', 'In conclusion, both perspectives offer valid arguments regarding (topic).'],
      ['I think that... because...', 'Personally, I believe that (stance), primarily because (reason).'],
    ],
    usefulLanguage: [
      { label: 'Giới thiệu quan điểm 1', lines: [
        'Some people believe that... / Some people argue that...',
        'Those who support this view believe that...',
        'One reason for this view is that... / Proponents of this view maintain that...',
      ] },
      { label: 'Giới thiệu quan điểm 2', lines: [
        'On the other hand, others argue that...',
        'However, others believe that... / There is also a view that...',
        'Critics of this position contend that...',
      ] },
      { label: 'Nêu quan điểm cá nhân', lines: [
        'In my view,... / I believe that... / Personally, I think that...',
        'I agree with the view that...',
        'In my view, both sides have valid points, but I believe that... — dùng khi bạn muốn quan điểm cân bằng.',
      ] },
    ],
    modelEssay: {
      prompt: 'Some people think international car-free days are an effective way of reducing air pollution; however, others think there are some other ways. Discuss both views and give your own opinion.',
      wordCount: 'khoảng 280 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'In recent decades, there has been an ongoing debate about whether international car-free days are an effective way of reducing air pollution. While some people argue that such initiatives can significantly improve environmental quality, others believe alternative measures would be more impactful. This essay will discuss both perspectives before explaining why I side with the latter.' },
        { title: 'BODY 1 — VIEW 1', text: 'There are several convincing reasons why some people support organising international car-free days. One major reason is that removing vehicles from the road directly lowers harmful gas emissions. This is largely because road transport accounts for a substantial share of urban air pollution. As a result, cities may experience clearer skies and measurable improvements in public health, even if only for a single day. Furthermore, such initiatives often promote cycling, walking and public transport, which helps foster long-term behavioural change.' },
        { title: 'BODY 2 — VIEW 2', text: 'On the other hand, critics argue that car-free days alone cannot address the root causes of air pollution. One key concern is that the reduction in emissions is only temporary, meaning pollution levels quickly return to normal once the event concludes. For example, in many large cities the air quality index recovers within a day or two. A more fundamental objection is that a large share of urban emissions originates from industry, construction and power generation rather than private cars, which means that even a permanent ban would leave much of the problem untouched. This highlights the risks of relying on symbolic measures rather than comprehensive policy.' },
        { title: 'CONCLUSION', text: 'In conclusion, both perspectives offer valid arguments regarding car-free days. Personally, I believe that while such events are beneficial in raising public awareness, they should be combined with stricter emission regulations and sustained investment in public transport infrastructure.' },
      ],
    },
    mistakes: [
      'Chỉ viết một quan điểm dài, quan điểm kia qua loa. Giám khảo yêu cầu "discuss both views" — hai đoạn phải cân bằng.',
      'Không nêu quan điểm cá nhân, hoặc nêu mơ hồ. "Both sides are right" không phải là một quan điểm.',
      'Quan điểm cá nhân mâu thuẫn với thân bài. Nếu bạn nói đồng ý với View 2 ở Introduction, Body 2 phải được viết thuyết phục hơn Body 1.',
      'Viết như thể mình là một trong hai nhóm. Ở Body 1 và 2 bạn đang tường thuật quan điểm của người khác, nên dùng "Some people believe that...", không dùng "I think" cho tới khi nêu quan điểm riêng.',
    ],
  },

  {
    typeId: 'type03',
    name: 'Cause – Solution',
    nameVi: 'Nguyên nhân và giải pháp',
    orderIndex: 2,
    recognise: {
      stems: [
        'What are the causes of this problem and what solutions can you suggest?',
        'Why is this happening and what measures can be taken to tackle it?',
        'What factors contribute to this trend? How can it be addressed?',
      ],
      note: 'Đề luôn có HAI câu hỏi. Bỏ sót một câu hỏi là mất điểm Task Response ngay lập tức. Giải pháp nên giải quyết đúng nguyên nhân bạn đã nêu — sự ăn khớp này là điểm cộng lớn cho Coherence.',
    },
    outline: {
      flow: 'INTRO → BODY 1: CAUSES → BODY 2: SOLUTIONS → CONCLUSION',
      perBody: 'CAUSES: CAUSE → WHY? → RESULT → EXAMPLE  |  SOLUTIONS: SOLUTION → HOW IT HELPS → RESULT',
    },
    upgradePairs: [
      ['(problem) has become an increasingly common issue.', '(problem) has become an increasingly serious concern in many parts of the world.'],
      ['There are several reasons why...', 'There are several underlying factors contributing to...'],
      ['One of the main causes is...', 'One of the primary reasons behind this problem is...'],
      ['This is because...', 'This can largely be attributed to...'],
      ['Another important cause is...', 'Another significant contributor is...'],
      ['In the past people walked more, but now they drive.', 'Unlike in the past, when walking was the norm, today most short journeys are made by car.'],
      ['This will be a problem in the future.', 'If this trend continues unchecked, it could lead to (negative consequence).'],
      ['However, there are several ways to solve this problem.', 'Nevertheless, several practical measures can be taken to address this issue effectively.'],
      ['One effective solution is to...', 'One effective way to tackle this problem is to... This would ensure that (mechanism), ultimately leading to (outcome).'],
      ['This would help people and also save money.', 'Not only would this help (effect 1), but it would also (effect 2).'],
      ['In conclusion, this problem is caused by... and can be solved by...', 'In conclusion, (problem) remains a complex issue that requires immediate and coordinated action.'],
    ],
    usefulLanguage: [
      { label: 'Nói về nguyên nhân', lines: [
        'One of the main causes is... / One of the primary reasons behind this is...',
        'Another important cause is... / Another significant contributor is...',
        'This is mainly due to... / This can largely be attributed to...',
        'stem from... · arise from... · be driven by... · contribute to...',
      ] },
      { label: 'Nói về giải pháp', lines: [
        'One effective solution is to... / One effective way to tackle this problem is to...',
        'Another possible solution is to... / Another viable approach involves...',
        'This would ensure that... / This could serve as a long-term solution to...',
      ] },
      { label: 'Động từ dùng cho giải pháp', lines: [
        'encourage people to... · provide more... · invest in... · subsidise...',
        'raise awareness of... · educate people about... · impose stricter regulations on...',
        'reduce... · limit... · restrict... · phase out... · promote...',
      ] },
    ],
    modelEssay: {
      prompt: 'People in many countries are becoming less physically active than they used to be. What are the causes of this, and what measures could be taken to reverse the trend?',
      wordCount: 'khoảng 315 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'In recent years, declining levels of physical activity have become an increasingly serious concern in many parts of the world. This essay will explore the main causes of this trend and propose practical measures to reverse it.' },
        { title: 'BODY 1 — CAUSES', text: 'There are several underlying factors contributing to this decline. One of the primary reasons is the pervasive influence of technology on everyday routines. This can largely be attributed to the fact that people can now work, shop and socialise without leaving their homes. For instance, in cities such as Ho Chi Minh City, delivery applications allow residents to obtain meals, groceries and medicine without walking further than their front door. This suggests that convenience has quietly replaced movement in daily life. Another significant contributor is the length of the modern working day. Unlike in the past, when manual labour was common, most jobs today are sedentary and leave employees exhausted by the evening. If this pattern continues, rates of obesity and cardiovascular disease are likely to rise sharply.' },
        { title: 'BODY 2 — SOLUTIONS', text: 'Nevertheless, several practical measures can be taken to address this issue effectively. One effective way to tackle the problem is to redesign urban spaces so that walking and cycling become the easiest options. This would ensure that exercise is built into daily routines rather than treated as an extra task, ultimately leading to higher activity levels without any conscious effort. Not only would this improve public health, but it would also reduce traffic congestion and air pollution. Another viable approach involves requiring large employers to provide flexible hours or on-site fitness facilities. If widely implemented, such a policy could serve as a long-term solution to workplace inactivity.' },
        { title: 'CONCLUSION', text: 'In conclusion, falling activity levels stem largely from technological convenience and sedentary work, but the trend is far from irreversible. Among the measures discussed, I believe that redesigning cities around walking and cycling would prove the most effective in the long term.' },
      ],
    },
    mistakes: [
      'Liệt kê bốn nguyên nhân, không giải thích cái nào. Hai nguyên nhân được giải thích rõ luôn được điểm cao hơn.',
      'Giải pháp không ăn khớp với nguyên nhân. Đây là lỗi Coherence rất phổ biến.',
      'Giải pháp quá chung chung: "The government should do something about it." Hãy nói rõ ai làm gì và điều đó giúp thế nào.',
      'Dùng từ học thuật chưa quen: root causes, coordinated action, viable approaches. Nếu chưa chắc, dùng bản Band 6+ — sai từ khó trừ điểm nặng hơn dùng từ dễ đúng.',
    ],
  },

  {
    typeId: 'type04',
    name: 'Effect – Solution',
    nameVi: 'Hậu quả và giải pháp',
    orderIndex: 3,
    recognise: {
      stems: [
        'What problems does this cause and what can be done about it?',
        'What are the effects of this trend? What solutions can you suggest?',
        'How does this affect individuals and society? How can these effects be reduced?',
      ],
      note: 'Dạng này gần như giống hệt Cause – Solution. Khác biệt duy nhất: Body 1 nói về HẬU QUẢ thay vì nguyên nhân. Đọc kỹ để không viết nhầm.',
    },
    outline: {
      flow: 'INTRO → BODY 1: EFFECTS → BODY 2: SOLUTIONS → CONCLUSION',
      perBody: 'EFFECTS: EFFECT → WHY? → RESULT → EXAMPLE  |  SOLUTIONS: SOLUTION → HOW? → RESULT',
    },
    upgradePairs: [
      ['One of the major problems facing society today is...', 'One of the most pressing challenges confronting modern society is...'],
      ['This problem can have serious effects on...', 'This issue has given rise to a range of significant consequences.'],
      ['There are several negative effects of (problem).', 'Two particularly alarming effects of this issue are (effect 1) and (effect 2).'],
      ['One of the main effects is...', 'To begin with, (effect 1) is a major concern.'],
      ['This is because...', 'This is largely because... / This stems primarily from...'],
      ['As a result, people feel stressed.', 'Consequently, chronic stress has become widespread, placing considerable pressure on healthcare systems.'],
      ['Another significant effect is...', 'Another significant impact is..., which over time can place considerable pressure on (group).'],
      ['However, there are several ways to reduce this.', 'Despite these challenges, several effective measures can be taken to address the issue.'],
      ['One effective solution is to...', 'The most practical solution is to... This approach would not only (benefit 1) but also (benefit 2).'],
      ['In conclusion, these effects can be reduced by...', 'In conclusion, while its effects are undeniable, they can be addressed through coordinated efforts.'],
    ],
    usefulLanguage: [
      { label: 'Nói về hậu quả', lines: [
        'One of the main effects is... / Another significant impact is...',
        'This can lead to... · This may result in... · This can have a detrimental effect on...',
        'place pressure on... · undermine... · erode... · weaken...',
        'affect people’s health · increase stress levels · reduce productivity · damage the environment · lower quality of life',
      ] },
      { label: 'Nói về giải pháp', lines: [
        'The most practical solution is to... / Another viable strategy is to...',
        'If implemented on a large scale, this measure could...',
        'mitigate the impact of... · alleviate the problem · bring about long-term improvements',
      ] },
    ],
    modelEssay: {
      prompt: 'Nowadays many people complain that they have difficulties getting enough sleep. What problems can lack of sleep cause? What can be done about lack of sleep?',
      wordCount: 'khoảng 280 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'One of the most pressing challenges confronting modern society is sleep deprivation. In today’s fast-paced world, an increasing number of individuals struggle to maintain healthy sleeping patterns because of demanding work schedules and constant digital distraction. This essay will examine the major effects of insufficient sleep and propose practical solutions to mitigate its impact.' },
        { title: 'BODY 1 — EFFECTS', text: 'Two particularly alarming effects of sleep deprivation stand out. To begin with, reduced cognitive performance is a major concern. This is largely because the brain consolidates memory and restores attention during deep sleep, so when rest is cut short, concentration and decision-making decline noticeably. If this situation continues over months, it may lead to poor academic results and costly errors at work. Another significant impact is on physical health. Numerous medical studies have linked long-term sleep deprivation to obesity, cardiovascular disease and weakened immunity. Over time, this places considerable pressure on public healthcare systems.' },
        { title: 'BODY 2 — SOLUTIONS', text: 'Despite these challenges, several effective measures can be taken to address the issue. The most practical solution is to establish consistent sleep routines. By going to bed and waking at fixed times, individuals regulate their internal body clocks and fall asleep more easily. This approach would not only improve rest quality but also reduce reliance on caffeine and sleeping aids. Another viable strategy is to introduce workplace policies that protect employees’ personal time, such as limiting after-hours emails. If implemented on a large scale, such measures could bring about long-term improvements in public well-being.' },
        { title: 'CONCLUSION', text: 'In conclusion, sleep deprivation continues to pose serious challenges to both mental and physical health. In my opinion, tackling this problem requires both personal discipline in maintaining healthy habits and institutional efforts to create balanced working environments.' },
      ],
    },
    mistakes: [
      'Viết nguyên nhân thay vì hậu quả. Đọc kỹ đề: "What problems does this cause?" hỏi hậu quả, không hỏi vì sao.',
      'Chỉ liệt kê hậu quả mà không giải thích. Sau mỗi hậu quả, hãy trả lời "Why does this happen?" hoặc "What does this lead to?".',
      'Giải pháp không nhắm vào hậu quả đã nêu. Nếu hậu quả là sức khỏe tinh thần, giải pháp nên liên quan đến sức khỏe tinh thần.',
    ],
  },

  {
    typeId: 'type05',
    name: 'Cause – Effect',
    nameVi: 'Nguyên nhân và hậu quả',
    orderIndex: 4,
    recognise: {
      stems: [
        'What are the causes of this and what effects does it have?',
        'Why is this happening and how does it affect individuals and society?',
        'What has caused this trend and what are the consequences?',
      ],
      note: 'Điểm khác biệt then chốt: đề KHÔNG hỏi giải pháp. Nếu bạn viết giải pháp, phần đó không được tính điểm và bạn đã lãng phí thời gian.',
    },
    outline: {
      flow: 'INTRO → BODY 1: CAUSES → BODY 2: EFFECTS → CONCLUSION',
      perBody: 'CAUSES: CAUSE → WHY? → EFFECT → EXAMPLE  |  EFFECTS: EFFECT → WHY? → RESULT → EXAMPLE. Câu mở đầu Body 2 nên nhắc lại nguyên nhân: "These developments have had a marked effect on..." — ghi điểm Coherence rất tốt.',
    },
    upgradePairs: [
      ['In recent years, (problem) has become common.', 'In today’s fast-changing world, (problem) has become an increasingly significant concern.'],
      ['There are several reasons why this happens.', 'The causes of (problem) are both complex and multifaceted.'],
      ['One of the main causes is...', 'One primary factor is..., which contributes significantly to this issue.'],
      ['Many people think that...', 'It is widely acknowledged that...'],
      ['This causes many problems in society.', 'Not only does this trigger (effect), but it also creates a ripple effect across society.'],
      ['This problem has several effects.', 'The effects of (problem) are both immediate and long-term.'],
      ['One of the main effects is...', 'One significant consequence is..., and research has consistently shown that (clause).'],
      ['It also causes other problems in the future.', 'More alarmingly, the long-term implications may include (serious effect).'],
      ['This puts pressure on society.', 'Over time, these effects may accumulate, placing substantial pressure on (group).'],
      ['In conclusion, this problem is caused by... and leads to...', 'In conclusion, (problem) stems from a range of interconnected factors and results in significant consequences.'],
    ],
    usefulLanguage: [
      { label: 'Nối nguyên nhân với hậu quả', lines: [
        'A leads to B · A results in B · A contributes to B · A triggers B',
        'A may cause B · A can have an impact on B · A gives rise to B',
        'B stems from A · B is largely attributable to A · B arises from A',
      ] },
      { label: 'Mẫu câu vàng của dạng này (CAUSE → can lead to → EFFECT)', lines: [
        'Excessive use of social media can lead to a marked decline in face-to-face communication.',
        'The rapid expansion of online entertainment has given rise to shorter attention spans among young people.',
      ] },
    ],
    modelEssay: {
      prompt: 'In many countries, people are reading fewer books than in the past. What are the causes of this trend, and what effects does it have?',
      wordCount: 'khoảng 295 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'In today’s fast-changing world, the steady decline in book reading has become an increasingly significant concern. This essay will examine the underlying causes of this trend and analyse its effects on individuals and society.' },
        { title: 'BODY 1 — CAUSES', text: 'The causes of this decline are both complex and multifaceted. One primary factor is the sheer availability of digital entertainment, which competes directly for people’s limited free time. It is widely acknowledged that a smartphone offers instant access to videos, games and social media, making it a far easier choice than a three-hundred-page novel at the end of a long day. For example, a commuter in Hanoi who once carried a paperback now scrolls through short videos for the same twenty minutes. Not only does this convenience displace reading, but it also gradually reshapes what people expect from entertainment: speed, novelty and constant stimulation. A second contributing factor is the intensity of modern working and studying schedules, which leaves many adults with little mental energy for sustained concentration.' },
        { title: 'BODY 2 — EFFECTS', text: 'The effects of this shift are both immediate and long-term. One significant consequence is a measurable reduction in attention span. Research has consistently shown that readers accustomed to short-form content find it harder to follow extended arguments, which affects academic performance in particular. More alarmingly, the long-term implications may include a narrower vocabulary and weaker critical thinking, since books expose readers to ideas and sentence patterns that social media rarely provides. Over time, these effects may accumulate, placing substantial pressure on education systems that assume students can read closely.' },
        { title: 'CONCLUSION', text: 'In conclusion, falling reading rates stem from a range of interconnected factors, chiefly digital convenience and time pressure, and they result in significant consequences for concentration and language ability. Overall, this remains a serious concern that warrants careful consideration from educators and families alike.' },
      ],
    },
    mistakes: [
      'Viết giải pháp dù đề không hỏi. Lỗi phổ biến nhất ở dạng này. Đọc lại đề trước khi viết Body 2.',
      'Nhầm nguyên nhân với hậu quả. Nguyên nhân trả lời "Vì sao chuyện này xảy ra?"; hậu quả trả lời "Chuyện này dẫn đến điều gì?".',
      'Hai đoạn không liên quan đến nhau. Hậu quả nên là kết quả tự nhiên của nguyên nhân đã nêu.',
    ],
  },

  {
    typeId: 'type06',
    name: 'Agree / Disagree',
    nameVi: 'Đồng ý, không đồng ý và đồng ý một phần',
    orderIndex: 5,
    recognise: {
      stems: [
        'To what extent do you agree or disagree?',
        'Do you agree or disagree?',
        'Some people believe that... What is your opinion?',
      ],
      note: 'Ba cách trả lời — chọn MỘT và giữ nguyên: (1) Hoàn toàn đồng ý — hai body đều bảo vệ nhận định; (2) Hoàn toàn không đồng ý — hai body đều phản bác; (3) Đồng ý một phần — Body 1 thừa nhận một phần đúng, Body 2 bảo vệ quan điểm chính. Không có cách nào cho điểm cao hơn cách nào — chọn cách bạn có nhiều ý nhất.',
    },
    outline: {
      flow: 'INTRO + LẬP TRƯỜNG → BODY 1: REASON 1 → BODY 2: REASON 2 → CONCLUSION + LẬP TRƯỜNG',
      perBody: 'REASON → BECAUSE → RESULT → EXAMPLE. Đồng ý một phần: Body 1 "While it is true that (opposing point)...", Body 2 "However, I believe that (your main position)...".',
    },
    upgradePairs: [
      ['In recent years, (topic) has become a widely discussed issue.', 'The issue of (topic) has become a subject of considerable debate in recent years.'],
      ['I completely agree with this view because...', 'This essay will argue that (position), owing to its significant influence on (aspect 1) and (aspect 2).'],
      ['While I agree that..., I believe that...', 'Although there are valid arguments supporting (opposing view), I contend that (your stance) outweighs these considerations.'],
      ['One of the main reasons is that...', 'One compelling reason why (position) is that... / It is undeniable that (key point) plays a crucial role in (aspect).'],
      ['This is because...', 'This can be attributed to the fact that...'],
      ['For example, (example).', 'For instance, (example), which clearly illustrates that (analysis).'],
      ['Some people disagree, but I think they are wrong.', 'While some may argue that (opposing view), this perspective fails to take into account that (counterargument).'],
      ['It is true that... However,...', 'Admittedly, (concession); nevertheless, the overall impact remains predominantly (positive / negative).'],
      ['In conclusion, I agree that... because...', 'In conclusion, having examined the arguments presented, I maintain that (position).'],
      ['So both things are important.', 'Ultimately, striking a balance between (aspect 1) and (aspect 2) may represent the most pragmatic approach.'],
    ],
    usefulLanguage: [
      { label: 'Nêu quan điểm', lines: [
        'I completely agree that... / I firmly believe that... / I would strongly contend that...',
        'I completely disagree with this view because... / I find this argument unconvincing because...',
      ] },
      { label: 'Đồng ý một phần', lines: [
        'While I agree that..., I believe that...',
        'Although ... is true to some extent, I believe that...',
        'It is true that... However,... / Admittedly,... Nevertheless,...',
        'There is some merit in this argument, yet...',
      ] },
      { label: 'Giới thiệu lý do', lines: [
        'One of the main reasons is that... / One compelling reason is that...',
        'Another important reason is that... / A further consideration is that...',
        'It is undeniable that... plays a crucial role in...',
      ] },
    ],
    modelEssay: {
      prompt: 'In the future, nobody will buy printed newspapers or books because they will be able to read everything they want online without paying. To what extent do you agree or disagree?',
      wordCount: 'khoảng 260 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'The future of printed newspapers and books has become a subject of considerable debate in recent years. With the rapid expansion of digital media, many people assume that physical publications will disappear once all content becomes freely accessible online. This essay will argue that printed materials are unlikely to vanish, owing to the distinctive reading experience they offer and the economics of the publishing industry.' },
        { title: 'BODY 1 — REASON 1', text: 'One compelling reason for this position is that a large number of readers continue to value the tangible experience that physical books provide. This can be attributed to the fact that printed pages create a focused, distraction-free environment which screens rarely replicate. Research has consistently shown that readers retain information more effectively from paper, thereby reinforcing the view that print serves a purpose beyond nostalgia. For instance, many universities still require students to work from printed course readers during examinations precisely because concentration is easier to sustain.' },
        { title: 'BODY 2 — REASON 2', text: 'A further consideration is that not all online content will remain free. It is undeniable that professional journalism and publishing depend on revenue, and most quality outlets have already moved behind paywalls. While some may argue that digital distribution is inherently cheaper, this perspective fails to take into account the cost of research, editing and copyright. Admittedly, digital formats will continue to dominate in volume; nevertheless, a substantial market for print is likely to persist.' },
        { title: 'CONCLUSION', text: 'In conclusion, having examined the arguments presented, I maintain that printed newspapers and books will not disappear entirely. Ultimately, the two formats are likely to coexist, each serving readers whose needs and habits differ.' },
      ],
    },
    mistakes: [
      'Lập trường thay đổi giữa bài. Introduction nói đồng ý, Body 2 lại nghiêng sang phía kia. Đây là lỗi Task Response nghiêm trọng.',
      '"I agree 50% and disagree 50%". Không phải là quan điểm. Đồng ý một phần vẫn phải nghiêng rõ về một phía.',
      'Không nêu quan điểm ở Introduction. Giám khảo cần thấy lập trường ngay từ đoạn đầu.',
      'Cố viết câu phản biện phức tạp rồi sai ngữ pháp. Nếu chưa chắc, bỏ câu phản biện — một lý do rõ ràng có ví dụ tốt vẫn đủ cho Band 7.',
    ],
  },

  {
    typeId: 'type07',
    name: 'Positive or Negative Development',
    nameVi: 'Đánh giá xu hướng tích cực hay tiêu cực',
    orderIndex: 6,
    recognise: {
      stems: [
        'Is this a positive or negative development?',
        'Do you think this is a positive or negative trend?',
        'Is this a positive or negative change for society?',
      ],
      note: 'ĐỪNG NHẦM VỚI Advantages & Disadvantages. Đây KHÔNG phải dạng cân bằng hai mặt — đề hỏi đánh giá của bạn: xu hướng này tốt hay xấu? Chọn một phía ngay ở Introduction và dành phần lớn bài để bảo vệ đánh giá đó. Có thể thừa nhận mặt còn lại ở Body 2, nhưng phải quay về củng cố quan điểm của mình.',
    },
    outline: {
      flow: 'INTRO + ĐÁNH GIÁ → BODY 1: HAI LÝ DO → BODY 2: THỪA NHẬN + CỦNG CỐ → CONCLUSION',
      perBody: 'BODY 1: REASON → WHY? → RESULT → EXAMPLE  |  BODY 2: ADMIT → EXPLAIN → HOWEVER → LẬP TRƯỜNG',
    },
    upgradePairs: [
      ['In recent years, (trend) has become increasingly common.', 'Over the past two decades, (trend) has gained considerable momentum across much of the world.'],
      ['This has had a noticeable impact on people.', 'This shift has had a profound influence on the way people (verb).'],
      ['In my view, this is a positive development because...', 'In my view, this constitutes a largely positive development, primarily because of its impact on (aspect 1) and (aspect 2).'],
      ['One of the main reasons is that...', 'The most compelling reason for regarding this trend as positive lies in (reason).'],
      ['This is because...', 'This is largely because... / This owes much to the fact that...'],
      ['As a result, people have more free time.', 'Consequently, employees regain several hours each week, thereby improving both productivity and family life.'],
      ['Another important reason is that...', 'A further consideration is (reason 2), which has the potential to (result) in the long term.'],
      ['Admittedly, (trend) can also have some disadvantages.', 'Admittedly, this trend is not without its drawbacks. It is often argued that (opposing point).'],
      ['However, I believe the benefits are bigger.', 'Nevertheless, such drawbacks are largely outweighed by the benefits outlined above, particularly when (condition).'],
      ['In conclusion, I believe this is a positive development.', 'In conclusion, having weighed both sides, I maintain that (trend) represents a largely positive development.'],
    ],
    usefulLanguage: [
      { label: 'Giới thiệu xu hướng', lines: [
        'In recent years,... / Nowadays,... / Over the past two decades,...',
        '(Trend) has become increasingly common / widespread / prevalent.',
        'There has been a marked rise in... / (Trend) has gained considerable momentum.',
      ] },
      { label: 'Đánh giá là tích cực', lines: [
        'a positive development · a beneficial trend · a welcome shift · a significant improvement',
        'provide greater opportunities for... · increase access to... · make it easier for people to...',
      ] },
      { label: 'Đánh giá là tiêu cực', lines: [
        'a negative development · a worrying trend · a troubling shift · a major drawback',
        'have a harmful effect on... · increase the risk of... · erode... · create problems for...',
      ] },
      { label: 'Thừa nhận mặt còn lại', lines: [
        'Admittedly,... / It is true that... / While this can be beneficial,...',
        'Nevertheless,... / However, I believe that...',
        'the benefits outweigh the drawbacks · the negative effects are more significant than the benefits',
      ] },
    ],
    modelEssay: {
      prompt: 'An increasing number of people now work from home rather than in an office. Is this a positive or a negative development?',
      wordCount: 'khoảng 305 từ',
      sections: [
        { title: 'INTRODUCTION', text: 'Over the past two decades, and especially since the pandemic, remote working has gained considerable momentum across much of the world. This shift has had a profound influence on the way people organise their working lives. In my view, this constitutes a largely positive development, primarily because of its impact on personal autonomy and urban congestion.' },
        { title: 'BODY 1 — MAIN REASONS', text: 'The most compelling reason for regarding this trend as positive lies in the flexibility it grants employees. This is largely because staff are judged on output rather than on hours spent at a desk, which allows them to arrange work around family commitments. Consequently, many employees regain the two hours a day once lost to commuting, thereby improving both their productivity and their relationships at home. A clear illustration of this can be seen in large Vietnamese cities, where a worker living in an outer district may spend three hours a day travelling to and from a central office. A further consideration is the environmental benefit: fewer daily journeys mean lower emissions and less strain on transport infrastructure, which has the potential to reshape city planning in the long term.' },
        { title: 'BODY 2 — ACKNOWLEDGE & REINFORCE', text: 'Admittedly, this trend is not without its drawbacks. It is often argued that remote employees lose the informal contact that builds trust within a team. This concern stems from the fact that spontaneous conversation is difficult to replicate online. As a result, junior staff in particular may feel isolated and learn more slowly. Nevertheless, such drawbacks are largely outweighed by the benefits outlined above, particularly when companies adopt hybrid arrangements that preserve regular face-to-face contact.' },
        { title: 'CONCLUSION', text: 'In conclusion, having weighed both sides, I maintain that remote working represents a largely positive development, chiefly because of its influence on personal freedom and the environment. Provided that employers manage team communication carefully, its benefits are likely to become even more pronounced in the years ahead.' },
      ],
    },
    mistakes: [
      'Viết thành bài Advantages & Disadvantages. Nếu hai body cân bằng hoàn toàn và bạn không nghiêng về phía nào, bạn đã trả lời sai đề.',
      'Body 2 dài bằng Body 1 và toàn nói mặt trái. Body 2 chỉ nên dành khoảng ba câu cho mặt trái, rồi quay lại củng cố quan điểm.',
      'Quên nêu đánh giá ở Introduction. Giám khảo cần biết bạn nghĩ gì ngay từ đoạn đầu.',
    ],
  },
];
