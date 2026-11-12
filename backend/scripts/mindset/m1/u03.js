// Mindset for IELTS Level 1 — Unit 3: Education and employment (Reading pp. 44–48 · Listening pp. 54–57)
const { mcq, gap, match, cat, passage, picture, card, qMcq, qFill, lx, html } = require('../dsl');
const { vocabFrom } = require('./_vocab');

const SLOT = 2; // sách của lớp: Unit 3–4 → Sổ 2

const GLOBAL = `## Globalisation of education and the workplace

**A** Globalisation has affected most aspects of our lives. One area which has changed is education. More and more people move to different countries for their studies. At the same time, more people stay at home and study by distance learning. It is now easy to learn without attending a college or university, or attending less often. 'Blended learning' means studying partly in a traditional way in the classroom and partly online or via email. These changes also mean that there is now more interest in 'lifelong learning', the idea that we go on learning throughout our working lives and even into retirement. It is easy to attend 'webinars' or online seminars without being away from our offices. Many adults go back to college later in life because it is so easy to get a qualification without giving up work or disrupting family life.

**B** Different countries have benefitted from the globalisation of education in different ways. Many British, Australian and American universities run their degree programmes in countries throughout Asia, and many students, parents and employers feel this is a valuable opportunity. Students can get an internationally recognised degree at a much cheaper price than going abroad and so can improve their chances of getting a good job. At the same time, those in the countries providing world-class degrees also benefit. They have greater access to ideas and knowledge from all over the world and having international students enriches their universities.

**C** However, it is not good news for everyone in some developing countries. It is usually the elite – or the richest people in the large cities – who have access to international education. Many people in rural areas have not even had a primary education. Also, those areas usually do not have reliable internet connections and most people do not own a computer. It will take a bit more time for international opportunities to reach everyone in developing countries.

**D** One concern people have about globalisation is that it can start to mean 'westernisation'. In other words, local knowledge can be lost and money seen as more important than culture. Education should treat every culture with respect; it should not be just learning about the West, but should include different ways of teaching and approaches from around the world. The aim is to enrich and share; the flow of ideas and information should go from East to West as well as from West to East.

**E** Educational institutions have changed their focus due to globalisation. There are so many benefits of having overseas students that universities are competing for them, using strategies from the world of business. For example, they visit Education Fairs all over the world and spend time and money creating publicity material and advertisements. There is also more emphasis on the student experience. There is more focus on customer care, especially helping international students to settle in, improve their English and understand the academic culture of the host country.

**F** There are many advantages to the globalisation of education and the workplace. More people get benefits that were only available to those in the developed countries before. There is more understanding between different nations as people learn about each other's cultures. However, it is important to make sure the benefits reach everyone and don't leave many citizens of the developing world behind.`;

const UK = `## Education and the workplace in the UK

**A** There has been a trend towards creating a closer connection between education/training and the workplace. This is because many employers felt that school leavers were not prepared well enough and didn't have the skills they would need to do well at work. Having a close relationship between training and work is not new: apprenticeships were a common way of learning in the past. Young people learnt by working with an expert, but this was most common in trades such as builders or electricians. The trend now is for a closer connection between education and the workplace at all levels and in many different types of job.

**B** In 1944, the UK government created a new system of education. Education was divided into three parts. Children who passed an exam at 11 went to grammar schools. Pupils who didn't do well in the exam went to 'secondary modern' schools or technical schools. At technical schools they studied work-based subjects. In practice, however, only 0.5% of pupils went to technical schools, and this system divided students at a very young age into academic and non-academic. The system did not produce good results, and changed to a more equal system in the 1970s.

**C** In the 1980s the British government introduced NVQs or National Vocational Qualifications so that young people could get certificates to show their practical skills. It helps employers understand what workers can do. In 1994, the government started a programme which aimed to provide 'quality training on a work-based (educational) route'. These 'modern apprenticeships' are available at three different levels.

**D** At the higher levels of education, too, there has been more emphasis on work-based learning, which links academic study closely to practical experience. At degree level, companies have linked with universities to create specialised qualifications, such as the BA in Distribution run between Middlesex University and Asda Supermarket. Such partnerships also exist at Masters and even doctorate level.

**E** The development of technology has helped work-based learning to develop. Blended learning means part of the course can be delivered online, so people don't have to miss work to go to classes. Older or recently retired employees have been given the opportunity to develop new skills as tutors, mentors and coaches for the work-based part of these courses. This kind of work-based training was common in fields such as nursing and teaching, but has now spread to careers which were traditionally not closely linked to education.

**F** There are some challenges involved in work-based learning. Some lecturers might find it difficult to teach students with a lot of work experience. It may also be difficult to find teachers who can teach in different places and at different times. However, it is a positive trend as there are more ways to learn and people can study at different stages of their lives.`;

const stim = (t, c) => passage(t.replace(/^## /, ''), { caption: c });

const T26 = `Conversation 1
Manager: Come on in. It's Anna, isn't it?
Anna: Yes, that's right. Anna Scott.
Manager: Ah yes. Take a seat, Anna. First of all, we're delighted that you'll be joining us as a store assistant at the beginning of next week.
Anna: Thanks very much. I'm really looking forward to the challenge.
Manager: That's good to know.

Conversation 2
Receptionist: Good morning, you're through to Milton College. How can I help?
Student: Oh, hello there. I'd like to book a place on the Food Photography course.
Receptionist: OK. Now, is that the one that starts on the 18th?
Student: No, that's the date of the Food Technology course – I want the Food Photography course. It's the day after.
Receptionist: OK … got it right up on screen now. Food Photography – Saturday the 19th of September. And it looks like you're in luck – there are only a couple of spaces left. We've taken ten bookings already, so you've just made it – the course is limited to 12 participants. It's very popular.
Student: That's good to know! Now can I just check the details of the course?`;

const T27 = `Manager: Come on in. It's Anna, isn't it?
Anna: Yes, that's right. Anna Scott.
Manager: Ah yes. Take a seat, Anna. First of all, we're delighted that you'll be joining us as a store assistant at the beginning of next week.
Anna: Thanks very much. I'm really looking forward to the challenge.
Manager: That's good to know. Now, we know you've just finished a course in Information Technology, so we've decided to put you in the computing and phones section of our department store.
Anna: That's great. Now, that's next to the radios and audio equipment, isn't it?
Manager: That's right. All our radios and audio are in a part of the store we used to call the 'Sound Station'. But as I've just said, you'll be based in the computing and phones section. Now we've recently made this area of our store much bigger so that we can sell a much wider range of computer equipment, such as smart watches.
Anna: Mm. Smart watches.
Manager: Yes, we really want to attract a younger group of customers. And we haven't just given this whole area a completely new look – we've re-named it too!
Anna: Re-named it?
Manager: Yes. From next week it's going to be known as 'Moving Images'.
Anna: 'Moving Images'? Cool! I like it.
Manager: Now, do you have any questions before we move on?`;

const T28 = `Student: Now can I just check the details of the course?
Receptionist: Sure, go ahead.
Student: Now it says on the leaflet … um, let me find it … OK, got it! Right, so it's called Food Photography, and I've got here that it begins at nine thirty.
Receptionist: That's right – it's an early start. It begins at half past nine and it goes on until four thirty. Most of our weekend courses are quite short and so they're over in a couple of hours – this course is longer. According to the information I've got up here on screen, it's seven hours long.
Student: Oh, I'm glad it lasts for more than a few hours. I don't think I'd be able to learn how to take good pictures in less than seven hours.
Receptionist: Now, I'll just give you a bit more information about the course itself. Basically, you'll learn how to take good photos of food using a digital camera. So it'll train you in the basics of using a range of camera angles.
Student: Camera angles?
Receptionist: Yes, you'll learn how to photograph food using close-up shots, wide-angle shots and shots taken from above, that sort of thing.
Student: What about learning to edit pictures on my computer? Will that be covered too?
Receptionist: No, I'm afraid not. The purpose of the workshop is to teach you how to take good photos in the first place. It's a really hands-on session – in fact, you'll spend some of the day on location in a local hotel. It's just round the corner from the college – the Lincoln Hotel – so you'll have the opportunity to practise taking photographs using real dishes!
Student: That's great – a practical course is exactly what I'm looking for!
Receptionist: Now just a few more things. The full fee for the course is $55 and that includes a light lunch and refreshments at the hotel.
Student: Oh, that's really good. That means I don't have to worry about bringing along my own drinks and snacks on the day. That would probably cost me at least $10.
Receptionist: OK, I think that's everything, so I'll just take your details so that we can confirm your place on the course.`;

const R_VOCAB = `academic: thuộc học thuật
degree: bằng đại học
qualification: bằng cấp, chứng chỉ
blended learning: học kết hợp (trên lớp và trực tuyến)
lifelong learning: học tập suốt đời
retirement: sự nghỉ hưu
primary education: giáo dục tiểu học
employer: nhà tuyển dụng, chủ lao động
globalisation: toàn cầu hóa
affect most aspects of our lives: ảnh hưởng đến hầu hết mọi mặt cuộc sống
distance learning: học từ xa
attend: theo học, tham dự
give up work: nghỉ việc
disrupt family life: làm xáo trộn cuộc sống gia đình
benefit from: được lợi từ
internationally recognised: được công nhận quốc tế
improve one's chances of: tăng cơ hội để
world-class: đẳng cấp thế giới
have access to: được tiếp cận
enrich: làm phong phú
developing countries: các nước đang phát triển
the elite: tầng lớp tinh hoa
rural areas: vùng nông thôn
reliable internet connection: kết nối internet ổn định
treat sth with respect: đối xử tôn trọng với cái gì
institution: cơ sở giáo dục, tổ chức
compete for: cạnh tranh để giành
emphasis on: sự chú trọng vào
settle in: ổn định, làm quen với nơi mới
leave sb behind: bỏ lại ai phía sau
school leaver: học sinh mới tốt nghiệp phổ thông
apprenticeship: hình thức học nghề (vừa học vừa làm)
vocational: thuộc về dạy nghề
practical experience: kinh nghiệm thực tế
work-based learning: học tập gắn với công việc
mentor: người cố vấn, kèm cặp`;

const L_VOCAB = `be delighted that: rất vui mừng rằng
store assistant: nhân viên bán hàng
look forward to the challenge: mong chờ thử thách
book a place on a course: đăng ký một suất học | I'd like to book a place on the Food Photography course.
a couple of: một vài
be in luck: gặp may
be limited to: được giới hạn ở
participant: người tham gia
check the details: kiểm tra thông tin chi tiết
Information Technology: công nghệ thông tin
department store: cửa hàng bách hóa
audio equipment: thiết bị âm thanh
be based in: làm việc tại (bộ phận, nơi)
a wider range of: nhiều chủng loại hơn
attract customers: thu hút khách hàng | We really want to attract a younger group of customers.
give sth a new look: làm mới diện mạo của cái gì
rename: đổi tên | We haven't just given this area a new look – we've re-named it too!
move on: chuyển sang (việc khác)
leaflet: tờ rơi
an early start: sự khởi đầu sớm
last: kéo dài
the basics: kiến thức cơ bản
camera angle: góc máy
close-up shot: cảnh chụp cận
edit pictures: chỉnh sửa ảnh
in the first place: ngay từ đầu
hands-on: mang tính thực hành
on location: tại địa điểm thực tế
just round the corner: ngay gần đây
have the opportunity to: có cơ hội để
practical course: khóa học thực hành
full fee: toàn bộ học phí
refreshments: đồ ăn nhẹ và đồ uống
snack: đồ ăn vặt
confirm one's place: xác nhận chỗ của ai
workshop: buổi học thực hành, hội thảo`;

module.exports = {
  n: 3,
  title: 'Education and employment',
  titleVi: 'Giáo dục và việc làm',
  pages: '44–48, 54–57',
  outcomes: [
    'Reading: multiple-choice 4 phương án — tìm đúng đoạn chứa đáp án; xác định ý chính (main idea)',
    'Reading: nhận diện paraphrase (abroad ↔ overseas, useful ↔ valuable)',
    'Grammar: thì hiện tại hoàn thành — việc bắt đầu trong quá khứ, kết quả ở hiện tại',
    'Listening: sentence completion — gạch chân từ khoá, đoán loại thông tin, số ít/số nhiều, giới hạn số từ',
    'Từ vựng giáo dục, nghề nghiệp, khoá học (Sổ 2)',
  ],
  lessons: {
    vocab: {
      title: 'Lead-in & Vocabulary: work and studies',
      titleEn: 'Lead-in · Finding the answer (pp. 44–45)',
      slot: SLOT,
      minutes: 35,
      objectives: ['Phân loại từ vựng chủ đề công việc và học tập', 'Đọc lướt bài "Globalisation of education and the workplace" trong 1 phút', 'Nhận ra thái độ chung của bài (tích cực hay tiêu cực)'],
      theory: [
        card('Sổ từ vựng theo chủ đề', 'Divide your vocabulary notebook into topics', {
          usage: ['Chia sổ từ vựng **theo chủ đề** (Work / Studies…) và chừa chỗ để thêm từ mới khi học (TIP của sách).', '**Work**: business, employers, job, office, retirement · **Studies**: academic, blended learning, degree, qualification, primary education, lifelong learning, seminars.'],
        }),
      ],
      vocab: vocabFrom(R_VOCAB, [GLOBAL, UK]),
      ex: [
        cat('Work or studies? (Ex. 1)', 'Are these words about work or studies? Put them in the correct column.', { w: 'Work', s: 'Studies' }, [
          ['academic', 's'], ['degree', 's'], ['job', 'w'], ['office', 'w'], ['blended learning', 's'], ['employers', 'w'], ['qualification', 's'],
          ['lifelong learning', 's'], ['business', 'w'], ['retirement', 'w'], ['primary education', 's'], ['seminars', 's'],
        ]),
        cat('Find the words in the text (Ex. 2)', 'How many of the words from exercise 1 can you find in the text in ONE minute? Which word is NOT in the text?', { y: 'In the text', n: 'Not in the text' }, [
          ['academic', 'y'], ['degree', 'y'], ['job', 'y'], ['office', 'n', 'Bài chỉ có "offices" (số nhiều) trong cụm "away from our offices" — theo đáp án sách, office là từ không có trong bài.'], ['blended learning', 'y'], ['employers', 'y'],
          ['qualification', 'y'], ['lifelong learning', 'y'], ['business', 'y'], ['retirement', 'y'], ['primary education', 'y'], ['seminars', 'y'],
        ], { stimulus: stim(GLOBAL, 'Globalisation of education and the workplace (p. 45)') }),
        mcq('Positive or negative? (Ex. 3)', 'Spend another ONE minute quickly reading the text and answer this question.', [
          ['Does the text express a positive or negative view of globalisation in education?', ['mainly positive', 'mainly negative'], 'A', 'Bài có nêu vấn đề (đoạn C, D) nhưng nhìn chung tích cực hơn: đoạn F "There are many advantages to the globalisation of education…".'],
        ], { stimulus: stim(GLOBAL, 'Globalisation of education and the workplace') }),
      ],
    },

    reading: {
      title: 'Reading: multiple-choice questions & main ideas',
      titleEn: 'Multiple-choice questions · Words with similar meanings · Identifying the main idea · Exam skills (pp. 45–48)',
      minutes: 55,
      objectives: ['Làm multiple choice A–D: skim → tìm từ khoá ở phần câu hỏi → tìm đúng đoạn', 'Tìm từ đồng nghĩa (paraphrase) giữa câu hỏi và bài', 'Xác định ý chính — thường ở câu đầu đoạn', 'Cách thứ hai: tự trả lời trước rồi mới nhìn các phương án'],
      theory: [
        card('Multiple choice: tìm đúng chỗ chứa đáp án', 'Finding the answer', {
          formula: ['① **Skim** bài thật nhanh → ② đọc **phần chính của câu hỏi** (KHÔNG phải A, B, C, D), chọn từ khoá → ③ đọc lướt lại, chỉ tìm từ khoá hoặc từ cùng nghĩa → đó là chỗ có đáp án.'],
          usage: ['Trong phòng thi **không đủ thời gian đọc kỹ cả bài**.', 'Thuật ngữ (blended learning) thường giữ nguyên; các từ khác thường được **paraphrase** (abroad → overseas, benefits → advantages).'],
        }),
        card('Ý chính của bài', 'Identifying the main idea', {
          usage: ['Câu hỏi thường liên quan đến **ý chính**.', 'Đọc **đoạn đầu** và **câu đầu tiên của mỗi đoạn** — ý chính thường nằm ở đó.', 'Chi tiết nhỏ (học sau khi nghỉ hưu, học phí năm 2012…) không phải ý chính.'],
        }),
        card('Cách làm thứ hai', 'Multiple-choice questions: another way to do them', {
          formula: ['Gạch chân từ khoá → tìm đoạn có đáp án → **tự trả lời** câu hỏi → tìm phương án **khớp với câu trả lời của bạn** → kiểm tra các phương án còn lại sai ở đâu.'],
        }),
      ],
      links: [
        { ref: 'reading:M1-U03-R1', title: 'Globalisation of education and the workplace (Ex. 4, 7)', note: '5 câu multiple choice — tìm đoạn chứa đáp án trước.' },
        { ref: 'reading:M1-U03-R2', title: 'Exam skills: Education and the workplace in the UK (Ex. 9)', note: '4 câu multiple choice A–D.' },
      ],
      ex: [
        mcq('Which paragraph? (Ex. 4)', 'Quickly find which paragraph (A–F) you need to read to answer these questions. Do you need to read the whole paragraph?', [
          ['1 Blended learning means…', ['Paragraph A', 'Paragraph C', 'Paragraph E'], 'A', 'Đoạn A định nghĩa "Blended learning means studying partly in a traditional way… and partly online". Chỉ cần đọc một phần đoạn A.'],
          ['2 All of these are advantages of globalised education except…', ['Paragraph A only', 'Paragraphs B and C', 'Paragraph F only'], 'B', 'Cần đọc cả đoạn B (các lợi ích) và đầu đoạn C (giới tinh hoa được hưởng hết cơ hội — không phải lợi ích).'],
        ], { stimulus: stim(GLOBAL, 'Globalisation of education and the workplace') }),
        match('Words with similar meanings (Ex. 5)', 'If you see these words (1–7) in a question, what words might you expect to find in the text? Choose a word from the box.', [
          ['abroad', 'overseas'], ['benefits', 'advantages'], ['disturbing', 'disrupting'], ['going to', 'attending'], ['make better', 'enrich'], ['useful', 'valuable'], ['workplaces', 'offices'],
        ]),
        cat('Main ideas (Ex. 6)', 'Which FOUR sentences represent the main ideas of the passage?', { m: 'Main idea', d: 'Not a main idea' }, [
          ['There are both advantages and disadvantages to the globalisation of education.', 'm', 'Ý bao trùm cả bài (đoạn A–F).'],
          ['Many people study after retirement.', 'd', 'Chỉ là chi tiết nhỏ trong đoạn A (lifelong learning).'],
          ['It is important that globalisation should not be westernisation.', 'm', 'Câu đầu đoạn D.'],
          ['Universities have had to become more business-focused.', 'm', 'Đoạn E: "using strategies from the world of business".'],
          ['University fees rose dramatically in the UK in 2012.', 'd', 'Bài không nói đến.'],
          ['Many poorer people in developing countries do not benefit from globalisation.', 'm', 'Câu đầu đoạn C.'],
          ['Most lecturers work part-time.', 'd', 'Bài không nói đến.'],
        ], { stimulus: stim(GLOBAL, 'Globalisation of education and the workplace') }),
        mcq('Where are the main ideas? (Ex. 6)', 'Answer the question.', [
          ['Where in the paragraph can the main ideas usually be found?', ['in the first sentence of the paragraph', 'in the last sentence of the paragraph', 'in the middle of the paragraph'], 'A', 'Đọc đoạn đầu và câu đầu của mỗi đoạn.'],
        ]),
      ],
    },

    grammar: {
      title: 'Grammar focus: the present perfect',
      titleEn: 'Grammar focus: the present perfect (p. 47)',
      minutes: 30,
      objectives: ['Hiểu thì hiện tại hoàn thành nối quá khứ với hiện tại', 'Biết vì sao bài về toàn cầu hoá dùng nhiều hiện tại hoàn thành'],
      keyLanguage: [
        'Cấu trúc: **have / has + V3 (past participle)** — Globalisation **has affected** most aspects of our lives.',
        'Ý nghĩa: việc **bắt đầu trong quá khứ** và **còn kết quả / ảnh hưởng ở hiện tại** (chúng ta vẫn đang chịu ảnh hưởng của toàn cầu hoá).',
        'Phủ định: have/has **not** + V3 — Many people **have not** even **had** a primary education.',
      ],
      theory: [
        card('Hiện tại hoàn thành', 'The present perfect', {
          formula: ['S + have/has + V3', 'S + have/has + not + V3', 'Have/Has + S + V3 …?'],
          usage: ['Thay đổi bắt đầu từ quá khứ, kết quả vẫn còn: Educational institutions **have changed** their focus.', 'Tình huống ảnh hưởng đến người ta **bây giờ** → bài viết dùng nhiều hiện tại hoàn thành.'],
          examples: [['Different countries have benefitted from the globalisation of education.', 'Các nước đã được lợi (trong quá khứ) và vẫn đang được lợi.'], ['Many people in rural areas have not even had a primary education.', 'Họ chưa từng được học tiểu học — ảnh hưởng đến hiện tại.']],
        }),
      ],
      links: [{ grammar: 'present-perfect', title: 'Present Perfect', note: 'have/has + V3: quá khứ nối với hiện tại' }],
      ex: [
        mcq('Past and present (Ex. 8)', 'Look at these present perfect sentences from the passage. How do they relate to both the past and the present?', [
          ['Different countries have benefitted from the globalisation of education in different ways.', ['They benefitted in the past and they still benefit in the present.', 'They only benefitted in the past.', 'They will benefit in the future.'], 'A', 'Lợi ích bắt đầu từ quá khứ và vẫn còn ở hiện tại.'],
          ['Many people in rural areas have not even had a primary education.', ['They were not educated in the past, which affects their present.', 'They are at primary school now.', 'They had a primary education a long time ago.'], 'A', 'Không được học trong quá khứ → ảnh hưởng tới cuộc sống hiện tại.'],
          ['Educational institutions have changed their focus due to globalisation.', ['They changed in the past and are still different now.', 'They are changing at this moment only.', 'They changed but then went back to the old focus.'], 'A', 'Thay đổi đã xảy ra và kết quả vẫn còn.'],
          ['Which of these tenses is used most in the passage?', ['simple past', 'simple present', 'present continuous'], 'B', 'Bài chủ yếu dùng hiện tại đơn (is, mean, have, get…), kèm nhiều câu hiện tại hoàn thành.'],
          ['Choose the best reason for this choice of tense.', ['The situation affects people now.', 'Most of the changes happened in the past.', 'It is a constantly changing situation.'], 'A', 'Tình hình ảnh hưởng đến con người ở hiện tại.'],
        ]),
        gap('Form the present perfect (Ex. 8)', 'Complete the sentences from the passage with the present perfect form of the verb in brackets.', [
          ['Globalisation ____ (affect) most aspects of our lives.', 'has affected'],
          ['Different countries ____ (benefit) from the globalisation of education in different ways.', 'have benefitted|have benefited'],
          ['Many people in rural areas ____ even ____ (not have) a primary education.', ['have not|haven\'t', 'had']],
          ['Educational institutions ____ (change) their focus due to globalisation.', 'have changed'],
        ]),
      ],
    },

    listening: {
      title: 'Listening: sentence completion',
      titleEn: 'Lead-in · Sentence completion · Synonyms and paraphrase · Exam skills (pp. 54–57)',
      slot: SLOT,
      minutes: 55,
      objectives: ['Từ vựng nghề nghiệp và khoá học (-er, -ist = người; -ology, -tion, -ing = ngành)', 'Sentence completion: gạch chân từ khoá trước/sau chỗ trống, đoán loại từ', 'Viết đúng số ít/số nhiều, đúng số từ, không viết lại chữ đã có trong câu', 'Nhận ra từ đồng nghĩa trong bài nghe (title ↔ it\'s called, cost ↔ fee)'],
      images: ['media:m1u03-jobs.jpg|Ex. 1 (p. 54): areas of work or study A–G'],
      theory: [
        card('Sentence completion', 'Sentence completion', {
          formula: ['Điền **tối đa 3 từ**, hoặc **2 từ và/hoặc một số**. Chỗ trống có thể ở đầu, giữa hoặc cuối câu.', 'Trước khi nghe: gạch chân **từ khoá trước và sau chỗ trống** → đoán **loại thông tin** (nghề, môn học, ngày, số, nơi chốn).'],
          usage: ['**a store assistant** (không phải "a assistant" vì trước nguyên âm phải là "an").', '**information** không đếm được → không viết "informations".', '"The Moving Images" = 3 từ → sai nếu đề cho TWO WORDS; "Moving Image" sai vì người nói dùng số nhiều.'],
        }),
        card('Giới hạn số từ và cách viết số', 'Word limits and numbers', {
          usage: ['NO MORE THAN ONE WORD AND/OR A NUMBER: ✓ 19 · 19th · nineteenth (of) — ✗ "the 19" · "19th of September" (lặp lại chữ September đã có trong câu).', 'Viết số bằng **chữ số** cho nhanh và không sai chính tả.', 'Câu hỏi đi **theo thứ tự** của bài nghe.'],
        }),
        card('Từ đồng nghĩa trong bài nghe', 'Synonyms and paraphrase', {
          usage: ['Người nói thường dùng **từ khác** với câu hỏi: title ↔ it\'s called · starts ↔ begins · lasts ↔ goes on · teach ↔ train · nearby ↔ local · total cost ↔ full fee · practical ↔ hands-on.'],
        }),
      ],
      links: [
        { ref: 'listening:M1-U03-L1', title: 'A job or a course? / Booking a course (Ex. 5, 10)', note: 'Hai hội thoại ngắn + ngày học và số chỗ.' },
        { ref: 'listening:M1-U03-L2', title: 'Anna and the store manager (Ex. 8)', note: '3 câu, NO MORE THAN TWO WORDS — để ý số ít/số nhiều.' },
        { ref: 'listening:M1-U03-L3', title: 'Exam skills: the Food Photography course (Ex. 15)', note: '6 câu sentence completion.' },
      ],
      vocab: vocabFrom(L_VOCAB, [T26, T27, T28]),
      ex: [
        match('Areas of work or study (Ex. 1)', 'Pictures A–G show different areas of work or study. Match the pictures with the words in the box.', [
          ['Picture A', 'construction'], ['Picture B', 'sports and leisure'], ['Picture C', 'retail'], ['Picture D', 'hotel and catering'],
          ['Picture E', 'health'], ['Picture F', 'art and design'], ['Picture G', 'information technology'],
        ], { stimulus: picture('media:m1u03-jobs.jpg', 'Ex. 1') }),
        cat('Job or course? (Ex. 2)', 'Do these words describe a job or a type of course? (architect = job)', { j: 'Job', c: 'Course' }, [
          ['computing', 'c'], ['graphic designer', 'j'], ['web designer', 'j'], ['chef', 'j'], ['doctor', 'j'], ['medicine', 'c'], ['textiles', 'c'],
          ['building engineering', 'c'], ['fitness training', 'c'], ['shop management', 'c'], ['badminton coach', 'j'], ['food technology', 'c'], ['store assistant', 'j'],
        ]),
        match('Jobs and courses (Ex. 3)', 'Complete the table. Match each job with its course.', [
          ['graphic designer (art and design)', 'textiles'], ['architect (construction)', 'building engineering'], ['doctor (health)', 'medicine'],
          ['chef (hotel and catering)', 'food technology'], ['web designer (information technology)', 'computing'], ['store assistant (retail)', 'shop management'],
          ['badminton coach (sports and leisure)', 'fitness training'],
        ]),
        cat('Two correct endings (Ex. 4)', 'Identify the TWO correct endings for each sentence.', { ok: 'Correct ending', no: 'Wrong ending' }, [
          ["1 I've done a course in … computing", 'ok'], ["1 I've done a course in … badminton coach", 'no', 'badminton coach là nghề, không phải khoá học.'], ["1 I've done a course in … food technology", 'ok'],
          ['2 My sister has worked on a cruise ship as a … chef', 'ok'], ['2 My sister has worked on a cruise ship as a … medicine', 'no', 'as a + nghề; medicine là môn học.'], ['2 My sister has worked on a cruise ship as a … doctor', 'ok'],
          ['3 Our son had a job as a(n) … architect', 'ok'], ['3 Our son had a job as a(n) … store assistant', 'ok'], ['3 Our son had a job as a(n) … building engineering', 'no', 'building engineering là ngành học.'],
          ["4 He's very keen on … web designer", 'no', 'web designer là người/nghề; keen on + hoạt động/môn học.'], ["4 He's very keen on … fitness training", 'ok'], ["4 He's very keen on … textiles", 'ok'],
        ]),
        match('Type of information (Ex. 6–7)', 'Read the sentences. Underline the key words before and after each gap. Match each sentence with the type of information you need to listen for.', [
          ['1 Anna has got a job as a ______.', 'a type of job'],
          ['2 She has recently completed a course in ______.', 'an area of study'],
          ['3 The new name of the department which sells computers and phones is ______.', 'a name of a place'],
          ['4 The Food Photography course takes place on the ______ September.', 'a date'],
          ['5 There is a total of ______ places available on the course.', 'a number only'],
        ]),
        mcq('The correct grammatical answer (Ex. 9)', 'Choose the correct grammatical answer. Why are the other answers incorrect?', [
          ['Anna has got a job as a ______.', ['assistant', 'store assistant'], 'B', 'Trước "assistant" phải là "an", câu có sẵn "a" → store assistant.'],
          ['She has recently completed a course in ______.', ['informations technology', 'information technology'], 'B', 'information không đếm được → không có dạng số nhiều.'],
          ['The new name of the department which sells computers and phones is ______.', ['Moving Image', 'Moving Images', 'The Moving Images'], 'B', '"The Moving Images" = 3 từ (quá giới hạn 2 từ); "Moving Image" sai vì người nói dùng số nhiều.'],
        ]),
        cat("Candidates' answers (Ex. 11)", 'Complete the sentence: "The course takes place on the ______ September." Write NO MORE THAN ONE WORD AND/OR A NUMBER. Which answers are correct?', { ok: 'Correct', no: 'Incorrect' }, [
          ['19', 'ok'], ['19th', 'ok'], ['the 19', 'no', '"the" đã có sẵn trong câu → thừa chữ.'], ['nineteenth of', 'ok', 'Một từ + "of" vẫn đọc đúng câu: "on the nineteenth of September".'],
          ['19th of September', 'no', 'Lặp lại "September" đã có trong câu, quá số từ.'], ['19 Sept', 'no', 'Thừa từ "Sept" (đã có September).'],
        ]),
        match('Order of the topics (Ex. 12)', 'Read the questions in the Exam skills task carefully. Match each topic with the question (1–6) where it is mentioned.', [
          ['the name of the course', 'Question 1'], ['the starting time of the course', 'Question 2'], ['the duration of the course', 'Question 3'],
          ['the purpose of the course', 'Question 4'], ['the location of the course', 'Question 5'], ['the price of the course', 'Question 6'],
        ]),
        match('Synonyms (Ex. 13)', 'Match the words and phrases 1–9 with their synonyms a–i.', [
          ['price', 'cost'], ['name', 'title'], ['duration', 'length'], ['starts', 'begins'], ['takes place', 'is held'],
          ['purpose', 'reason for'], ['ends', 'finishes'], ['location', 'place'], ['practical', 'hands-on'],
        ]),
        match('Words used on the recording (Ex. 14)', 'Match the highlighted words in the Exam skills sentences with the words and phrases used on the recording.', [
          ['title', "it's called"], ['starts', 'begins'], ['lasts', 'goes on'], ['teach', 'train'], ['different', 'a range of'], ['part', 'some'], ['nearby', 'local'], ['total cost', 'full fee'],
        ]),
      ],
    },
  },

  passages: [
    {
      ref: 'M1-U03-R1',
      title: 'Mindset 1 · Unit 3 — Globalisation of education and the workplace',
      content: html(GLOBAL),
      questionGroups: [
        qMcq(1, 'Choose the correct letter, A, B, C or D.', [
          ['Blended learning means', ['continuing to learn throughout your life.', 'studying online or via email.', 'mixing traditional and modern methods.', 'learning in a classroom.'], 'C', 'Đoạn A: "\'Blended learning\' means studying **partly in a traditional way in the classroom and partly online or via email**" → kết hợp cách truyền thống và hiện đại. A là định nghĩa lifelong learning; B và D chỉ là một nửa.'],
          ['All of these are advantages of globalised education except:', ['Students in developing countries can get better jobs.', 'Students can get a degree at a cheaper price.', 'Universities benefit from international students.', 'The elite get most of the opportunities.'], 'D', 'A, B, C có ở đoạn B. Đoạn C: "It is usually **the elite** … who have access to international education" → đây là mặt hạn chế, không phải lợi ích.'],
        ], 'Questions 1–2'),
        qMcq(3, 'Choose the correct letter, A, B, C or D.', [
          ['Who benefits from globalised education in developing countries?', ['almost everyone in those countries', 'mainly well-off people in big towns', 'only those in developed countries', 'only those who own a computer'], 'B', 'Đoạn C: "It is usually the elite – or **the richest people in the large cities** – who have access" → well-off people in big towns (paraphrase).'],
          ["What is the meaning of 'westernisation'?", ['learning only about the West', 'learning local knowledge', 'not learning about culture', 'treating culture with respect'], 'A', 'Đoạn D: "it should not be **just learning about the West**" → westernisation = chỉ học về phương Tây.'],
          ['How has the focus of educational institutions changed?', ['They have become poor value for money.', 'Staff are not committed to their students.', 'They are focused on attracting students.', 'They only want foreign students.'], 'C', 'Đoạn E: "universities are **competing for them** (overseas students)… visit Education Fairs… publicity material and advertisements" → tập trung thu hút sinh viên. D sai vì "only".'],
        ], 'Questions 3–5'),
      ],
    },
    {
      ref: 'M1-U03-R2',
      title: 'Mindset 1 · Unit 3 — Education and the workplace in the UK',
      content: html(UK),
      questionGroups: [
        qMcq(1, 'Choose the correct letter, A, B, C or D.', [
          ['Apprenticeships', ['are a new way of learning.', 'were common in the past.', 'only existed in the past.', 'did not help people do well at work.'], 'B', 'Đoạn A: "apprenticeships **were a common way of learning in the past**". C sai: đoạn C nói vẫn còn "modern apprenticeships"; A sai: "is not new".'],
          ['The education system introduced in 1944', ['only affected 0.5% of students.', 'taught only technical subjects.', 'was not a great success.', 'was for academically gifted students.'], 'C', 'Đoạn B: "The system **did not produce good results**" → not a great success. 0.5% chỉ là số HS học trường kỹ thuật.'],
          ['Blended learning', ['mainly benefits older or retired people.', 'involves mainly face to face classes.', 'is mainly for teaching and nursing.', 'is convenient for working people.'], 'D', 'Đoạn E: "part of the course can be delivered online, so **people don\'t have to miss work** to go to classes" → tiện cho người đi làm.'],
          ['The challenges of work-based learning include', ['practical issues like when classes are held.', 'students who are not very experienced.', 'more types of learning are acceptable.', "older people can't use computers well."], 'A', 'Đoạn F: "It may also be difficult to find teachers who can teach **in different places and at different times**" → vấn đề thực tế về thời gian/địa điểm học. B ngược lại (sinh viên có NHIỀU kinh nghiệm).'],
        ], 'Questions 1–4'),
      ],
    },
  ],

  sections: [
    {
      ref: 'M1-U03-L1', title: 'Mindset 1 · Unit 3 — A job or a course?',
      description: 'Anna meets the store manager; a student books a course at Milton College.', partNumber: 1, audioFile: 'Mindset_L1_26.mp3', transcript: T26,
      questionGroups: [
        qMcq(1, 'Listen to two short conversations. Are the speakers talking about a job or a course? (Ex. 5)', [
          ['Conversation 1', ['a job', 'a course'], 'A', lx('Hội thoại 1 nói về việc làm hay khoá học?', 'Hội thoại 1.', "we're delighted that you'll be joining us as a store assistant", 'Anna bắt đầu làm nhân viên bán hàng → job.')],
          ['Conversation 2', ['a job', 'a course'], 'B', lx('Hội thoại 2 nói về việc làm hay khoá học?', 'Hội thoại 2.', "I'd like to book a place on the Food Photography course", 'Đăng ký khoá học → course.')],
        ], 'Questions 1–2'),
        qFill(3, 'Listen to the student and the receptionist again and complete the sentences. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each answer. (Ex. 10)', [
          ['The course takes place on the ______ September.', '19 / 19th / nineteenth / 19th of / nineteenth of', lx('Khoá học diễn ra ngày ___ tháng 9.', 'Giữa hội thoại 2.', ["is that the one that starts on the 18th?", "No, that's the date of the Food Technology course … It's the day after", 'Saturday the 19th of September'], 'BẪY: 18th là khoá Food Technology. Không viết lại "September".')],
          ['There are a total of ______ places available on the course.', '12 / twelve', lx('Khoá học có tổng cộng ___ chỗ.', 'Cuối hội thoại 2.', ["We've taken ten bookings already", 'the course is limited to 12 participants'], '10 là số đã đặt; tổng số chỗ = 12.')],
        ], 'Questions 3–4'),
      ],
    },
    {
      ref: 'M1-U03-L2', title: 'Mindset 1 · Unit 3 — Anna and the store manager',
      description: 'The store manager tells Anna about her new job.', partNumber: 1, audioFile: 'Mindset_L1_27.mp3', transcript: T27,
      questionGroups: [
        qFill(1, 'Listen again to Anna talking to the store manager and complete the sentences. Write NO MORE THAN TWO WORDS for each answer. (Ex. 8)', [
          ['Anna has got a job as a ______.', 'store assistant', lx('Anna được nhận làm ___', 'Đầu bài.', "you'll be joining us as a store assistant", 'Câu có "a" → không thể chỉ viết "assistant".')],
          ['She has recently completed a course in ______.', 'information technology', lx('Cô ấy vừa học xong khoá ___', 'Giữa bài.', "you've just finished a course in Information Technology", 'just finished = recently completed. information không có -s.')],
          ['The new name of the department which sells computers and phones is ______.', 'Moving Images', lx('Tên mới của khu bán máy tính và điện thoại là ___', 'Cuối bài.', ["we used to call the 'Sound Station'", "it's going to be known as 'Moving Images'"], 'BẪY: Sound Station là tên khu radio cũ. Viết số nhiều Images.')],
        ], 'Questions 1–3'),
      ],
    },
    {
      ref: 'M1-U03-L3', title: 'Mindset 1 · Unit 3 — Exam skills: the Food Photography course',
      description: 'The student checks the details of the course with the receptionist.', partNumber: 1, audioFile: 'Mindset_L1_28.mp3', transcript: T28,
      questionGroups: [
        qFill(1, 'Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. (Ex. 15)', [
          ['The title of the course the student wants to do is ______.', 'Food Photography', lx('Tên khoá học sinh viên muốn học là ___', 'Đầu bài.', "so it's called Food Photography", "title ↔ it's called.")],
          ['The course starts at ______.', '9.30 / 9:30 / nine thirty / half past nine / 9.30 am', lx('Khoá học bắt đầu lúc ___', '', ['it begins at nine thirty', 'It begins at half past nine and it goes on until four thirty'], 'starts ↔ begins. 4.30 là giờ kết thúc.')],
          ['It lasts for a period of ______ hours in total.', '7 / seven', lx('Khoá học kéo dài tổng cộng ___ giờ.', '', ["they're over in a couple of hours", "it's seven hours long"], 'lasts ↔ goes on / long. "a couple of hours" là các khoá khác.')],
          ['The course aims to teach people how to use different ______.', 'camera angles', lx('Khoá học dạy cách dùng các ___ khác nhau.', 'Giữa bài.', "it'll train you in the basics of using a range of camera angles", 'teach ↔ train; different ↔ a range of. Chỉnh sửa ảnh KHÔNG có trong khoá.')],
          ['Part of the course is held at a nearby ______.', 'hotel', lx('Một phần khoá học được tổ chức tại một ___ gần đó.', '', "you'll spend some of the day on location in a local hotel", 'part ↔ some of the day; nearby ↔ local.')],
          ['The total cost of the course is ______.', '$55 / 55 dollars / fifty-five dollars / 55', lx('Tổng chi phí khoá học là ___', 'Cuối bài.', ['The full fee for the course is $55', 'That would probably cost me at least $10'], 'total cost ↔ full fee. $10 là tiền đồ ăn tự mang (không cần).')],
        ], 'Questions 1–6'),
      ],
    },
  ],
};
