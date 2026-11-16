'use strict';

// Step ③ "Dịch câu" built from "Bài mẫu từ Daniel" — the model essay of the
// same prompt on writing.html (WritingTask2.sampleSections). Those essays
// already follow the Band 7.0 template frames, so the student translates
// Daniel's own sentences, in essay order (Mở bài → Thân bài 1 → Thân bài 2);
// the conclusion is their own paragraph ("Tự viết kết bài"), with Daniel's
// conclusion shown afterwards as the reference.
// Seeded by scripts/seedTask2SampleSentences.js, which checks every `en`
// still appears verbatim in the sample.
//
// en  = exact sentence from the sample (curly quotes and all)
// vi  = the Vietnamese the student translates from
// key = the Band 7 template chunk drilled by mcq / gap (`dùng cấu trúc
//       "key"`), verbatim in `en`; omitted → listen / type, or click-to-order
//       when > 22 words.
//
// Pilot 2026-11-16: Buổi 9 (week 5, "Rise in Modern Mental Stress & Anxiety").

module.exports = {
  '6a8e5d01abe276c8dcf118b9': {
    label: 'W5 · Rise in Modern Mental Stress & Anxiety (type03)',
    prefix: 'w5ms_d',
    sentences: [
      { sec: 'intro', key: 'an increasingly serious problem',
        en: 'In recent years, stress-related illnesses and anxiety disorders have become an increasingly serious problem in modern society.',
        vi: 'Trong những năm gần đây, các bệnh liên quan đến căng thẳng và chứng rối loạn lo âu đã trở thành một vấn đề ngày càng nghiêm trọng trong xã hội hiện đại.' },
      { sec: 'intro', key: 'propose practical solutions',
        en: 'This essay will explore the main causes of this problem and propose practical solutions to improve public mental well-being.',
        vi: 'Bài viết này sẽ phân tích các nguyên nhân chính của vấn đề này và đề xuất những giải pháp thiết thực nhằm cải thiện sức khỏe tinh thần của cộng đồng.' },

      { sec: 'body1', key: 'underlying factors contributing to',
        en: 'There are several underlying factors contributing to the rise in stress and anxiety.',
        vi: 'Có nhiều yếu tố cơ bản góp phần làm gia tăng tình trạng căng thẳng và lo âu.' },
      { sec: 'body1', key: 'One of the main reasons',
        en: 'One of the main reasons is the intensity of modern working life.',
        vi: 'Một trong những nguyên nhân chính là cường độ của cuộc sống công việc hiện đại.' },
      { sec: 'body1',
        en: 'Job insecurity, long hours and constant emails mean that many employees never fully switch off, and a mind kept on alert for months at a time eventually becomes exhausted.',
        vi: 'Công việc bấp bênh, giờ làm dài và email liên tục khiến nhiều nhân viên không bao giờ thực sự được nghỉ ngơi, và một tâm trí luôn căng thẳng suốt nhiều tháng liền cuối cùng sẽ kiệt sức.' },
      { sec: 'body1',
        en: 'For instance, the habit of checking work messages late at night and first thing in the morning leaves many people with almost no time to rest.',
        vi: 'Chẳng hạn, thói quen kiểm tra tin nhắn công việc vào đêm khuya và ngay khi vừa thức dậy khiến nhiều người gần như không còn thời gian để nghỉ ngơi.' },
      { sec: 'body1', key: 'Another key contributor',
        en: 'Another key contributor is the influence of social media.',
        vi: 'Một yếu tố quan trọng khác là ảnh hưởng của mạng xã hội.' },
      { sec: 'body1',
        en: 'Scrolling through carefully edited images of other people’s lives invites constant comparison, while an endless stream of alarming news keeps users anxious about problems they cannot control.',
        vi: 'Việc lướt xem những hình ảnh được chỉnh sửa kỹ lưỡng về cuộc sống của người khác khiến người ta liên tục so sánh, trong khi dòng tin tức đáng lo ngại bất tận khiến người dùng lo âu về những vấn đề họ không thể kiểm soát.' },
      { sec: 'body1', key: 'If this trend continues',
        en: 'If this trend continues, more and more people may find themselves unable to work or study because of their mental health.',
        vi: 'Nếu xu hướng này tiếp diễn, ngày càng nhiều người có thể rơi vào tình trạng không thể làm việc hay học tập vì sức khỏe tinh thần của mình.' },

      { sec: 'body2', key: 'practical measures can be taken',
        en: 'Nevertheless, several practical measures can be taken to address this issue effectively.',
        vi: 'Tuy nhiên, có thể áp dụng một số biện pháp thiết thực để giải quyết vấn đề này một cách hiệu quả.' },
      { sec: 'body2', key: 'One effective way to tackle this problem',
        en: 'One effective way to tackle this problem is to make counselling easy to access before a crisis develops.',
        vi: 'Một cách hiệu quả để giải quyết vấn đề này là giúp mọi người dễ dàng tiếp cận dịch vụ tư vấn tâm lý trước khi khủng hoảng xảy ra.' },
      { sec: 'body2',
        en: 'Workplaces and schools should offer free, confidential support with short waiting times, so that a person who is struggling can be seen within days rather than months.',
        vi: 'Nơi làm việc và trường học nên cung cấp dịch vụ hỗ trợ miễn phí, bảo mật với thời gian chờ ngắn, để người đang gặp khó khăn có thể được gặp chuyên gia trong vài ngày thay vì vài tháng.' },
      { sec: 'body2', key: 'Another viable approach involves',
        en: 'Another viable approach involves teaching coping skills from an early age.',
        vi: 'Một cách tiếp cận khả thi khác là dạy kỹ năng đối phó với căng thẳng từ khi còn nhỏ.' },
      { sec: 'body2',
        en: 'Lessons on stress management, healthy sleep and challenging anxious thoughts in secondary schools would give young people tools they can use for life.',
        vi: 'Các bài học về quản lý căng thẳng, giấc ngủ lành mạnh và cách đối diện với những suy nghĩ lo âu ở trường trung học sẽ trang bị cho người trẻ những công cụ dùng được suốt đời.' },
      { sec: 'body2',
        en: 'Research has shown that public campaigns which treat anxiety as a common and treatable condition encourage people to seek help earlier, when treatment is cheaper and more effective.',
        vi: 'Nghiên cứu đã chỉ ra rằng các chiến dịch cộng đồng coi lo âu là một tình trạng phổ biến và có thể chữa trị sẽ khuyến khích mọi người tìm kiếm sự giúp đỡ sớm hơn, khi việc điều trị rẻ hơn và hiệu quả hơn.' }
    ]
  }
};
