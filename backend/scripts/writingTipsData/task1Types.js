'use strict';
// "5 dạng bài Task 1" — classification-first approach (Dynamic/Static/Mixed/
// Map/Process) instead of memorizing chart names, each with a full essay
// skeleton (sườn bài) + key structures. orderIndex 60-66 — safe range above
// realWorldExamples.js's highest (53), see that file's own range note.
const { overview, steps, list, example, callout, table, summary, lesson } = require('./builder');

const CATEGORY = '5 dạng bài Task 1';

module.exports = [
  lesson({
    category: CATEGORY, lessonKey: 'classification', title: 'Task 1 có 5 dạng: Dynamic – Static – Mixed – Map – Process', icon: '🗂️', orderIndex: 60,
    summaryText: 'Phân loại theo bản chất thay vì nhớ tên biểu đồ — mỗi dạng có câu hỏi chính và trọng tâm riêng.',
    blocks: [
      overview('IELTS Writing Task 1 có 5 nhóm chính: DYNAMIC – STATIC – MIXED – MAP – PROCESS. Thay vì nhớ tên từng loại biểu đồ (line, bar, pie, table...), hãy nhớ bản chất: dạng bài này hỏi gì và cần tập trung vào điều gì.'),
      table('Phân loại theo câu hỏi chính', ['Dạng', 'Câu hỏi chính', 'Tập trung'], [
        ['Dynamic', 'What changed?', 'Trend'],
        ['Static', 'Who/what was higher?', 'Comparison'],
        ['Mixed', 'How are they related?', 'Connection'],
        ['Map', 'What changed where?', 'Location + Change'],
        ['Process', 'What happens next?', 'Stages / Sequence'],
      ]),
      list('Sơ đồ phân loại', [
        '1. DYNAMIC — có thời gian → CHANGE / TREND (line graph, bar chart/table/pie theo thời gian)',
        '2. STATIC — không có thời gian → COMPARE / RANK (bar chart, pie chart, table ở một thời điểm)',
        '3. MIXED — 2+ biểu đồ → CONNECT / COMPARE (bar+pie, line+table, bar+line...)',
        '4. MAP — LOCATION / CHANGE (một bản đồ = bố cục, hai bản đồ = thay đổi)',
        '5. PROCESS — Natural hoặc Manufacturing → SEQUENCE',
      ]),
      callout('Câu chốt cho học sinh', 'Dynamic → nhìn thời gian để tìm TREND.\nStatic → nhìn số liệu để tìm COMPARISON.\nMixed → nhìn các biểu đồ để tìm CONNECTION.\nMap → nhìn không gian để tìm CHANGE.\nProcess → nhìn các bước để tìm SEQUENCE.'),
      steps([
        { title: '1. WHAT?', description: 'Biểu đồ nói về cái gì?' },
        { title: '2. TREND?', description: 'Tăng / giảm / ổn định / dao động?' },
        { title: '3. EXTREMES?', description: 'Highest / lowest?' },
        { title: '4. GROUP?', description: 'Những đối tượng nào có xu hướng giống nhau?' },
        { title: '5. COMPARE?', description: 'Có sự khác biệt / tương đồng nào đáng chú ý?' },
        { title: '6. OVERVIEW?', description: 'Chọn 2 key features, không đưa quá nhiều số.' },
      ]),
      table('Công thức 4 đoạn an toàn', ['Đoạn', 'Nội dung'], [
        ['Introduction', 'Paraphrase đề'],
        ['Overview', '2 key features'],
        ['Body 1', 'Feature/group 1 + data + comparison'],
        ['Body 2', 'Feature/group 2 + data + comparison'],
      ]),
      summary('Task 1 không phải bài "mô tả tất cả số liệu". Hãy ưu tiên: Identify → Group → Compare → Support with data — thay vì Read → List → List → List. 7 từ khóa cần nhớ: Trend – Peak – Bottom – Group – Compare – Contrast – Overview.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'dynamic', title: '1. Dynamic — Biểu đồ có thay đổi theo thời gian', icon: '📈', orderIndex: 61,
    summaryText: 'Line graph, bar/table/pie theo thời gian — trọng tâm là TREND + COMPARISON.',
    blocks: [
      overview('Dynamic là biểu đồ có "movement/change" — thường có 2 hoặc nhiều mốc thời gian (line graph, bar chart/table/pie theo thời gian). Học sinh cần hỏi: "Cái gì thay đổi theo thời gian?" và tập trung vào: tăng, giảm, dao động, ổn định, đạt đỉnh, chạm đáy, thay đổi mạnh/nhẹ. Ví dụ: 2000 → 2010 → 2020, không chỉ nói "A = 20, 30, 40" mà phải nói "A increased steadily from 20 to 40".'),
      steps([
        { title: 'Introduction', description: 'The graph illustrates/shows/compares...' },
        { title: 'Overview', description: 'Overall, X showed an upward trend, while Y experienced a decline. X recorded the highest figure, whereas Y remained the lowest.' },
        { title: 'Body 1', description: 'Nhóm có cùng xu hướng — mô tả giai đoạn đầu → giữa, kèm số liệu + so sánh.' },
        { title: 'Body 2', description: 'Nhóm còn lại — mô tả giữa → cuối, điểm cao nhất/thấp nhất + số liệu.' },
      ]),
      table('Cấu trúc câu theo nhóm', ['Nhóm', 'Câu mẫu'], [
        ['Tăng', 'X increased from A to B. / X rose by A. / X saw a significant increase. / X climbed steadily.'],
        ['Giảm', 'X fell from A to B. / X decreased by A. / X experienced a sharp decline. / X dropped dramatically.'],
        ['Dao động', 'X fluctuated between A and B.'],
        ['Đạt đỉnh', 'X reached a peak of A.'],
        ['So sánh', 'X was considerably higher than Y. / X was twice as high as Y. / X exceeded Y by A.'],
      ]),
      callout('Công thức', 'Trend → Change → Data → Comparison'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'static', title: '2. Static — Biểu đồ không có thời gian', icon: '📊', orderIndex: 62,
    summaryText: 'Bar chart, pie chart, table ở một thời điểm — trọng tâm là RANKING + COMPARISON.',
    blocks: [
      overview('Static là biểu đồ "đứng yên" — không có sự thay đổi theo thời gian, thường chỉ có một thời điểm/một năm/một nhóm dữ liệu (bar chart, pie chart, table). Học sinh cần hỏi: "Ai cao nhất? Ai thấp nhất? Ai giống nhau? Khác nhau bao nhiêu?" và tập trung vào: highest, lowest, similar, difference, ranking, proportion, comparison.'),
      steps([
        { title: 'Introduction', description: 'The chart illustrates/compares...' },
        { title: 'Overview', description: 'Overall, X recorded the highest figure, while Y had the lowest. A and B had relatively similar figures.' },
        { title: 'Body 1', description: 'Nhóm cao nhất — highest + second highest + comparison.' },
        { title: 'Body 2', description: 'Nhóm thấp hơn — lowest + remaining figures + comparison.' },
      ]),
      table('Cấu trúc câu', ['Mục đích', 'Câu mẫu'], [
        ['Cao nhất', 'X recorded the highest figure, at 80.'],
        ['Thấp nhất', 'X had the lowest proportion, at just 10%.'],
        ['So sánh chênh lệch', 'X was considerably higher than Y. / The figure for X was approximately twice that of Y.'],
        ['Tương đồng', 'X and Y were relatively similar, at 35 and 37 respectively.'],
        ['Xếp hạng', 'X ranked first, followed by Y and Z.'],
      ]),
      callout('Công thức', 'Highest → Lowest → Comparison → Data'),
      callout('Lưu ý', 'Static không cần cố tìm "trend". Học sinh chỉ cần hỏi: Who/what is higher, lower, similar or different?'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'mixed', title: '3. Mixed — Kết hợp nhiều biểu đồ', icon: '🔀', orderIndex: 63,
    summaryText: 'Bar+pie, line+table, bar+line — trọng tâm là CONNECTION giữa các biểu đồ, không phải mô tả riêng lẻ.',
    blocks: [
      overview('Mixed là khi đề cho 2 hoặc nhiều loại biểu đồ cùng lúc (bar+pie, line+table, bar+line...). Sai lầm phổ biến là viết từng biểu đồ riêng biệt mà không kết nối chúng. Hãy nghĩ: "Hai biểu đồ đang cho mình những thông tin gì và chúng có liên quan thế nào?"'),
      steps([
        { title: 'Introduction', description: 'The charts illustrate/compare...' },
        { title: 'Overview', description: 'Nêu 2-3 đặc điểm lớn nhất của toàn bộ đề. Overall, X recorded the highest figure, while Y accounted for the smallest proportion. In addition, the number of X increased over the period.' },
        { title: 'Body 1', description: 'Phân tích Chart 1 — key feature + data.' },
        { title: 'Body 2', description: 'Phân tích Chart 2 — key feature + data. Nếu hai biểu đồ có liên hệ trực tiếp, nên cross-reference.' },
      ]),
      example([
        {
          label: 'Liệt kê rời rạc vs. Kết nối/so sánh',
          lines: [
            { tag: '❌ SAI', text: 'Chart 1: A = 20, B = 30, C = 40. Chart 2: X = 10, Y = 20, Z = 30. (chỉ là liệt kê, không liên hệ)' },
            { tag: '✅ ĐÚNG', text: 'The number of students studying science increased considerably, which was accompanied by a rise in the proportion of students choosing this subject.' },
          ],
        },
      ]),
      callout('Công thức', 'Chart 1 → Key feature → Data → Chart 2 → Connection/Comparison'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'map', title: '4. Map — Bản đồ', icon: '🗺️', orderIndex: 64,
    summaryText: '12 cấu trúc câu quan trọng cho Map — trọng tâm là LOCATION + CHANGE, không phải số liệu.',
    blocks: [
      overview('Map không tập trung vào số liệu mà vào location + change. Có 2 dạng: one map (mô tả bố cục/vị trí) và two maps (mô tả thay đổi giữa hai thời điểm). Học sinh cần tìm: What was added? What was removed? What was replaced? What was relocated? What remained unchanged?'),
      steps([
        { title: 'Introduction', description: 'The maps illustrate how the area changed between 2000 and 2020.' },
        { title: 'Overview', description: 'Nói 2-3 thay đổi lớn nhất, không đi vào chi tiết. Overall, the area underwent significant redevelopment, with several new facilities being constructed and a number of existing features being removed or replaced.' },
        { title: 'Body 1 — Khu vực 1 (vd: North/West)', description: 'Nói những gì giữ nguyên + thay đổi. In the northern part of the area, the park remained unchanged, while the car park was replaced by a shopping centre.' },
        { title: 'Body 2 — Khu vực 2 (vd: South/East)', description: 'Tiếp tục các thay đổi còn lại. Meanwhile, the southern area also saw a number of changes. The old houses were demolished and replaced by a residential complex.' },
      ]),
      example([
        { label: '1. ..., the most important of which', lines: [{ tag: 'VÍ DỤ', text: 'Several changes were made to the area, the most important of which was the construction of a new shopping centre.' }] },
        { label: '2. And', lines: [{ tag: 'VÍ DỤ', text: 'A new road was constructed, and the car park was expanded.' }], note: 'Đơn giản nhưng rất hữu ích để nối các thay đổi.' },
        { label: '3. While', lines: [{ tag: 'VÍ DỤ', text: 'The park remained unchanged, while the surrounding area was considerably redeveloped.' }] },
        { label: '4. With + O + V-ing / V3', lines: [{ tag: 'VÍ DỤ', text: 'The area saw a number of changes, with the old school being converted into a library. / Several new facilities were added, with a car park being constructed in the west.' }] },
        { label: '5. ..., which was accompanied by...', lines: [{ tag: 'VÍ DỤ', text: 'The main road was widened, which was accompanied by the construction of a new car park.' }] },
        { label: '6. V-ed + replacing...', lines: [{ tag: 'VÍ DỤ', text: 'A new shopping centre was constructed, replacing the old market. / The footpath was widened, replacing the narrow pathway.' }] },
        { label: '7. There used to be..., but...', lines: [{ tag: 'VÍ DỤ', text: 'There used to be a small park, but it was then redeveloped into a car park. / There used to be a market, but it was removed to make way for a shopping centre.' }], note: 'Rất tốt khi mô tả old → new.' },
        { label: '8. be converted into', lines: [{ tag: 'VÍ DỤ', text: 'The old school was converted into a library.' }] },
        { label: '9. be replaced by', lines: [{ tag: 'VÍ DỤ', text: 'The market was replaced by a shopping centre.' }] },
        { label: '10. be demolished', lines: [{ tag: 'VÍ DỤ', text: 'The old houses were demolished.' }] },
        { label: '11. remain unchanged', lines: [{ tag: 'VÍ DỤ', text: 'The hospital remained unchanged.' }] },
        { label: '12. be constructed / built', lines: [{ tag: 'VÍ DỤ', text: 'A new residential area was constructed in the east.' }] },
      ]),
      callout('Công thức', 'LOCATION → CHANGE → NEW FEATURE → COMPARISON'),
      callout('Lưu ý thứ tự viết Body', 'Nên đi theo một hướng nhất quán: North → South hoặc West → East. Không nên nhảy lung tung: North → South → North → East → back to North.'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'process-natural', title: '5A. Process — Natural (quy trình tự nhiên)', icon: '🌱', orderIndex: 65,
    summaryText: 'Water cycle, life cycle, formation of rocks... — trọng tâm là START → STAGES → END.',
    blocks: [
      overview('Natural process mô tả quá trình tự nhiên: water cycle, life cycle of a butterfly, formation of rocks, reproduction of plants... Tư duy: Stage 1 → Stage 2 → Stage 3 → ...'),
      steps([
        { title: 'Introduction', description: 'The diagram illustrates the process of...' },
        { title: 'Overview', description: 'Số giai đoạn + điểm bắt đầu + điểm kết thúc. Overall, the process consists of six main stages, beginning with X and ending with Y.' },
        { title: 'Body 1', description: 'Stage 1 → Stage 2 → Stage 3.' },
        { title: 'Body 2', description: 'Stage 4 → Stage 5 → Final stage.' },
      ]),
      list('Cấu trúc chuyển đoạn', [
        'Initially, ...',
        'At the first stage, ...',
        'Once this process is complete, ...',
        'This is followed by ...',
        'Subsequently, ...',
        'After that, ...',
        'In the next stage, ...',
        'Finally, ...',
      ]),
      callout('Công thức', 'START → STAGES → END'),
    ],
  }),

  lesson({
    category: CATEGORY, lessonKey: 'process-manufacturing', title: '5B. Process — Manufacturing (quy trình sản xuất)', icon: '🏭', orderIndex: 66,
    summaryText: 'Making paper, producing chocolate, recycling plastic... — trọng tâm là passive voice và RAW MATERIAL → PRODUCT.',
    blocks: [
      overview('Manufacturing process mô tả quy trình sản xuất do con người thực hiện: making paper, producing chocolate, recycling plastic, manufacturing bricks... Tư duy: Raw material → processing → production → final product. Passive voice rất quan trọng cho dạng này.'),
      steps([
        { title: 'Introduction', description: 'The diagram illustrates how X is produced/manufactured.' },
        { title: 'Overview', description: 'Overall, the process consists of X main stages, beginning with raw materials and ending with the finished product.' },
        { title: 'Body 1', description: 'Raw material → processing → intermediate product.' },
        { title: 'Body 2', description: 'Further processing → packaging → final product.' },
      ]),
      list('Passive voice mẫu', [
        'The raw materials are collected.',
        'They are transported to the factory.',
        'The materials are then processed.',
        'The mixture is heated.',
        'The final product is packaged and delivered.',
      ]),
      callout('Công thức', 'RAW MATERIAL → PROCESSING → PRODUCT → PACKAGING'),
    ],
  }),
];
