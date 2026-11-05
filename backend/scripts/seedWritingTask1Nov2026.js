/**
 * seedWritingTask1Nov2026.js — Writing Task 1, Nov 2026 batch:
 *
 *  1. TASKS — three prompts with a band 7.5+ model answer taken from a
 *     published source (credited in the last "Phân tích đề" section) and a
 *     "Phân tích đề" guide written for this site:
 *       · Housing estate now vs. plan (map) — UPDATES the existing task
 *         6a848738c4d5b5ac38bce88a (old sample/analysis backed up to
 *         scripts/data/task1SampleBackup/ first) and moves its image to R2.
 *       · Fire exit plan, student accommodation (floor plan → 'map') — new.
 *       · Process for making soft cheese (process) — new.
 *     Images are uploaded to R2 (writing-tasks/) from scripts/data/task1Images/.
 *  2. CHART_TYPES — WritingTask1.chartType for every existing task (the
 *     filter groups on the student Task 1 list). Only sets tasks that are
 *     still unclassified, so an admin's later choice is never overwritten.
 *
 * Usage (from backend/):
 *   node scripts/seedWritingTask1Nov2026.js           # dry run
 *   node scripts/seedWritingTask1Nov2026.js --apply
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const WritingTask1 = require('../models/WritingTask1');
const mediaStore = require('../services/mediaStore');
const { highlightsFromSpec, splitSentences } = require('./data/task2SampleHighlights');

const APPLY = process.argv.includes('--apply');
const IMG_DIR = path.join(__dirname, 'data', 'task1Images');
const BACKUP_DIR = path.join(__dirname, 'data', 'task1SampleBackup');
const OUR_MEDIA = /^https:\/\/media\.ieltsthayha\.com\//;

// [title, content, highlight spec] — spec letters: Q paraphrase, O overview,
// T topic, D detail, C compare; numbers are sentence indexes.
const sample = rows => rows.map(([title, content, spec]) => {
  const highlights = highlightsFromSpec(content, spec);
  const n = splitSentences(content).length;
  if (highlights.length !== n) throw new Error(`"${title}": spec "${spec}" tags ${highlights.length} of ${n} sentences`);
  return { title, content, highlights };
});
const analysis = rows => rows.map(([title, content]) => ({ title, content }));

const TASKS = [
  // ── 1. Housing estate (map: now vs. future plan) ───────────────────────
  {
    id: '6a848738c4d5b5ac38bce88a',
    match: /housing estate as it is now and a plan for developing it/i,
    chartType: 'map',
    image: 'housing-estate-plan.webp',
    prompt: 'The maps below show a housing estate as it is now and a plan for developing it in the future. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    chartData: [
      'NOW: main road along the northern edge (unchanged in the plan); a private road forms a large U-shaped loop off the main road;',
      'four-bedroom houses spread along both sides of the private road; woodland covers the whole site (6,000 trees); no other facilities.',
      'PLAN: new private road runs straight south from the main road, then loops around a central rectangular flower garden;',
      'lake on the WEST side of the new road, tennis courts on the EAST side, opposite the lake;',
      'one-, two- and three-bedroom houses in clusters around the flower garden (replace the four-bedroom houses);',
      'woodland reduced to 250 trees, only near the main road in the north; patches of parkland near the lake/tennis courts and at the southern end, behind the houses.',
    ].join('\n'),
    sampleSections: sample([
      ['Introduction',
        'The maps compare the current layout of a housing estate with its development plan.',
        'Q0'],
      ['Overview',
        'Overall, the redevelopment plan highlights the introduction of communal and leisure amenities, alongside the redesign of the road system and the transformation of the existing housing stock. However, these changes involve a significant loss of woodland area.',
        'O0-1'],
      ['Body 1',
        'Regarding the original structures, the area’s residential and transport infrastructure will undergo substantial modifications. Specifically, the existing private road, which presently features a large loop, will be replaced by a straight route running southwards before looping around the map\'s centre. Furthermore, the current four-bedroom houses will be replaced by one- to three-bedroom units, with housing arrangements shifting from roadside distribution to clustering around the centre. Despite these changes, the main road along the northern edge will remain intact, providing access to the area.',
        'T0 D1-2 C3'],
      ['Body 2',
        'In terms of new features, the estate will witness the introduction of various communal and recreational amenities. As tree coverage declines from 6000 to 250 trees, green space will be extensively reduced. To compensate for this loss of greenery, several amenities will be constructed that mirror natural settings, including a large central flower garden, a lake by the western side of the private road, and patches of parkland near the amenities and at the rear of the household zone. Moreover, there will be tennis courts on the eastern side of the private road, facilitating recreational activities for residents.',
        'T0 D1-3'],
    ]),
    analysisSections: analysis([
      ['1. Phân tích nhanh đề này',
        'Dạng: 2 bản đồ — khu dân cư HIỆN TẠI và bản QUY HOẠCH tương lai.\n'
        + 'Thì: hiện tại đơn cho bản đồ hiện tại (The estate consists of / is covered by...), tương lai cho bản quy hoạch: will + bị động (will be replaced by / will be built), hoặc is set to / is expected to + V.\n\n'
        + 'Mẹo nhìn bản đồ: chia các thành phần thành 2 nhóm:\n'
        + '- Thành phần CŨ được cải tạo: đường nội bộ (private road), nhà ở; đường chính (main road) giữ nguyên.\n'
        + '- Thành phần MỚI: vườn hoa, hồ, sân tennis, parkland — đổi lại rừng cây bị thu hẹp rất mạnh (6000 → 250 cây).\n\n'
        + 'Overview nên nói gì? 2 ý lớn + 1 hệ quả:\n'
        + '- Thêm nhiều tiện ích cộng đồng / giải trí.\n'
        + '- Đường nội bộ và nhà ở được thiết kế lại.\n'
        + '- Hệ quả: mất phần lớn diện tích rừng.\n\n'
        + 'Câu Overview mẫu:\n'
        + 'Overall, the redevelopment plan highlights the introduction of communal and leisure amenities, alongside the redesign of the road system and the transformation of the existing housing stock. However, these changes involve a significant loss of woodland area.'],
      ['2. Body 1 – Thành phần cũ được cải tạo (đường + nhà ở)',
        'Nên viết theo thứ tự: đường nội bộ → nhà ở → đường chính (để cuối vì không đổi).\n'
        + '- Private road: hiện là một vòng cung lớn → sẽ thành đường thẳng chạy về phía nam rồi vòng quanh khu trung tâm.\n'
        + '- Houses: nhà 4 phòng ngủ rải dọc hai bên đường → nhà 1–3 phòng ngủ, tập trung thành cụm quanh vườn hoa.\n'
        + '- Main road: giữ nguyên ở rìa phía bắc, vẫn là lối vào khu.\n\n'
        + 'Topic sentence:\n'
        + 'Regarding the original structures, the area’s residential and transport infrastructure will undergo substantial modifications.\n\n'
        + 'Cấu trúc hay:\n'
        + '- will be replaced by + N + V-ing (mô tả hướng)\n'
        + '  The existing private road will be replaced by a straight route running southwards.\n'
        + '- with + N + shifting from A to B\n'
        + '  ... with housing arrangements shifting from roadside distribution to clustering around the centre.\n'
        + '- Despite these changes, X will remain intact.\n'
        + '  Despite these changes, the main road along the northern edge will remain intact.'],
      ['3. Body 2 – Thành phần mới (tiện ích) và rừng cây',
        'Nên viết: rừng giảm (6000 → 250 cây, chỉ còn gần đường chính) → các tiện ích "bù" mảng xanh: vườn hoa ở trung tâm, hồ ở phía tây đường nội bộ, các khu parkland gần tiện ích và phía sau khu nhà → cuối cùng là sân tennis ở phía đông, đối diện hồ.\n\n'
        + 'Topic sentence:\n'
        + 'In terms of new features, the estate will witness the introduction of various communal and recreational amenities.\n\n'
        + 'Cấu trúc hay:\n'
        + '- As + mệnh đề số liệu, + hệ quả\n'
        + '  As tree coverage declines from 6000 to 250 trees, green space will be extensively reduced.\n'
        + '- To compensate for this loss of ..., ...\n'
        + '  To compensate for this loss of greenery, several amenities will be constructed.\n'
        + '- there will be + N + on the eastern/western side of + N\n'
        + '  There will be tennis courts on the eastern side of the private road.'],
      ['4. Công thức cho dạng "bản đồ hiện tại vs quy hoạch"',
        'Có 2 cách chia thân bài, chọn 1:\n'
        + '- Cách an toàn: Body 1 = bản đồ hiện tại, Body 2 = bản quy hoạch.\n'
        + '- Cách nâng cao (bài mẫu dùng): Body 1 = thành phần CŨ thay đổi thế nào, Body 2 = thành phần MỚI xuất hiện.\n\n'
        + 'Checklist để đạt 6.5+:\n'
        + '① Thì đúng: hiện tại đơn cho "now", will / is set to cho "plan" — không dùng quá khứ.\n'
        + '② Có số liệu: 6000 → 250 cây.\n'
        + '③ Có ít nhất 1 thứ GIỮ NGUYÊN (main road).\n'
        + '④ Có vị trí khi mô tả công trình mới (west / east / centre / at the rear of).'],
      ['5. Nguồn bài mẫu',
        'Bài mẫu lấy từ ZIM Academy — "Phân tích đề IELTS Writing Task 1 tháng 5/2026 – Đề số 4" (bài mẫu Path B), zim.vn. Đề thi thật tháng 5/2026.'],
    ]),
  },

  // ── 2. Fire exit plan, student accommodation (floor plan) ──────────────
  {
    match: /fire exit plan/i,
    chartType: 'map',
    image: 'fire-exit-plan-college-accommodation.jpg',
    prompt: 'The diagram below shows the fire exit plan for the second floor of a college’s student accommodation. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    chartData: [
      'One floor: 7 bedrooms (1–7) around a central corridor; 2 staircases; 1 lift in the centre next to the northern staircase.',
      'Western staircase (west end) → Meeting point 1 outside on the west side. Used by bedrooms 1, 2 and 3 (bedroom 3 is in the south-west).',
      'Northern staircase (north side, beside the lift) → Meeting point 2 outside on the north side. Bedrooms 4 and 5 open straight onto it; bedrooms 6 and 7 (south-east) go up the corridor to reach it.',
    ].join('\n'),
    sampleSections: sample([
      ['Introduction',
        'The diagram illustrates the fire exit route for residents in a college accommodation in the event of a fire.',
        'Q0'],
      ['Overview',
        'It can be clearly seen that the fire exit plan is strategically designed with two separate routes leading to distinct meeting points to ensure a quick and organised evacuation.',
        'O0'],
      ['Body 1',
        'The layout of the college accommodation shows seven bedrooms, a corridor, and two staircases, with one of them located at the western end of the building and the other adjacent to the lift in the central part of the building.',
        'T0'],
      ['Body 2',
        'Since the lift is not to be used in case of a fire, occupants of bedrooms 1, 2, and 3 are directed to use the western staircase to exit the building. After descending the stairs, they are to gather at Meeting Point 1, which is located outside on the western side of the accommodation. In contrast, residents of bedrooms 4, 5, 6, and 7 are instructed to head towards the staircase on the northern side of the building. Those from bedrooms 4 and 5 have direct access to this staircase, whereas individuals from bedrooms 6 and 7 need to walk down the corridor to reach it. Upon exiting, they should gather at Meeting Point 2 located outside the building in close proximity to the staircase.',
        'D0-1 C2-3 D4'],
    ]),
    analysisSections: analysis([
      ['1. Phân tích nhanh đề này',
        'Dạng: sơ đồ mặt bằng (floor plan) — giống dạng Map nhưng chỉ có MỘT thời điểm, không có thay đổi. Nhiệm vụ: mô tả bố cục tầng và các TUYẾN THOÁT HIỂM.\n'
        + 'Thì: hiện tại đơn, nhiều bị động và động từ chỉ chỉ dẫn (are directed to / are instructed to / are to + V / should + V).\n\n'
        + 'Overview nên nói gì? Chỉ cần 1 ý lớn:\n'
        + '- Có 2 tuyến thoát hiểm riêng biệt, mỗi tuyến dùng 1 cầu thang và dẫn tới 1 điểm tập trung riêng (Meeting point 1 / 2).\n'
        + '(Có thể thêm: thang máy không được dùng khi có cháy.)\n\n'
        + 'Câu Overview mẫu:\n'
        + 'It can be clearly seen that the fire exit plan is strategically designed with two separate routes leading to distinct meeting points to ensure a quick and organised evacuation.'],
      ['2. Body 1 – Bố cục của tầng',
        'Nên viết: 7 phòng ngủ, 1 hành lang ở giữa, 2 cầu thang (1 ở đầu phía tây, 1 ở phía bắc cạnh thang máy), thang máy ở khu trung tâm.\n\n'
        + 'Câu mẫu:\n'
        + 'The layout of the college accommodation shows seven bedrooms, a corridor, and two staircases, with one of them located at the western end of the building and the other adjacent to the lift in the central part of the building.\n\n'
        + 'Cấu trúc hay:\n'
        + '- with one of them located at ... and the other adjacent to ...\n'
        + '  (giới thiệu 2 vật cùng loại ở 2 vị trí trong 1 câu)\n'
        + '- located at the western end of / in the central part of'],
      ['3. Body 2 – Hai tuyến thoát hiểm (so sánh)',
        'Nên viết theo từng nhóm phòng:\n'
        + '- Phòng 1, 2, 3 → cầu thang phía TÂY → Meeting point 1 (bên ngoài, phía tây).\n'
        + '- Phòng 4, 5, 6, 7 → cầu thang phía BẮC → Meeting point 2 (ngoài toà nhà, gần cầu thang).\n'
        + '  Trong đó phòng 4, 5 ra thẳng cầu thang; phòng 6, 7 phải đi dọc hành lang.\n\n'
        + 'Cấu trúc hay:\n'
        + '- be directed to / be instructed to + V\n'
        + '  Occupants of bedrooms 1, 2 and 3 are directed to use the western staircase.\n'
        + '- In contrast, ... / whereas ... (so sánh 2 nhóm)\n'
        + '  Those from bedrooms 4 and 5 have direct access to this staircase, whereas individuals from bedrooms 6 and 7 need to walk down the corridor to reach it.\n'
        + '- After + V-ing / Upon + V-ing\n'
        + '  Upon exiting, they should gather at Meeting Point 2.\n'
        + '- in close proximity to = very near'],
      ['4. Công thức cho dạng "sơ đồ mặt bằng / chỉ dẫn"',
        'OVERVIEW: số tuyến / số khu vực chính + điểm chung (mỗi tuyến có điểm tập trung riêng).\n'
        + 'BODY 1: bố cục chung (có gì, nằm ở đâu).\n'
        + 'BODY 2: lần lượt từng tuyến — ai đi, đi qua đâu, tới đâu — và so sánh 2 tuyến.\n\n'
        + 'Checklist để đạt 6.5+:\n'
        + '① Có nêu đủ 2 điểm tập trung và phòng nào ra điểm nào không?\n'
        + '② Có dùng phương hướng (western / northern) thay vì "left / right" không?\n'
        + '③ Có câu so sánh 2 tuyến (In contrast / whereas) không?\n'
        + '④ Không dùng thì quá khứ — sơ đồ mô tả quy định hiện hành.'],
      ['5. Nguồn bài mẫu',
        'Bài mẫu: Simone Braverman, IELTS-Blog.com — "IELTS Report, topic: Diagram describing a fire exit plan in a college accommodation" (Band 8.5 Model Answer, đề thi tại Ấn Độ). Sơ đồ do IELTS-Blog vẽ lại theo đề thi. Đã sửa 1 lỗi đánh máy của bản gốc ("list" → "lift").'],
    ]),
  },

  // ── 3. Soft cheese (process) ───────────────────────────────────────────
  {
    match: /soft cheese/i,
    chartType: 'process',
    image: 'process-soft-cheese.jpg',
    prompt: 'The diagram below illustrates the process of producing soft cheese. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    chartData: [
      '1. Mixing: water and milk poured in through two pipes, mixed (mixer).',
      '2. Cooling: 5°C for 2 hours, with mixer.',
      '3. Salt added through a valve on the pipe → Fermentation: heated to 37°C for 6 hours, with mixer; mixture starts to thicken.',
      '4. Evaporation: heated to 100°C for 8 hours; steam released through a chimney.',
      '5. Mixture passes a filter into a cooling tank: 5°C for 8 hours → soft cheese; waste water drained through the filter on the pipe and the filter under the tank.',
      'Total ≈ 24 hours (2 + 6 + 8 + 8). Liquid → thick mixture.',
    ].join('\n'),
    sampleSections: sample([
      ['Introduction',
        'The diagram illustrates the process by which soft cheese is produced.',
        'Q0'],
      ['Overview',
        'Overall, this is a biochemical process that consists of five main stages and takes approximately one day to complete. It begins with the mixing of raw ingredients, followed by the cooling, fermentation and evaporation steps, before being cooled again to produce soft cheese. Throughout the process, temperature control plays a crucial role in transforming the liquid into a thickened product.',
        'O0-2'],
      ['Body 1',
        'The process commences with the introduction of water and milk into a mixing chamber, where they are thoroughly blended. Thereafter, the mixture undergoes a cooling phase at 5°C for a duration of two hours, during which it is stirred continuously.',
        'D0-1'],
      ['Body 2',
        'Next, salt is added through a valve, and the mixture is then heated to 37°C while being stirred. Over six hours, chemical reactions occur, causing the mixture to thicken. Once fully fermented, the thickened mixture is transferred to an evaporator, in which it is heated to 100°C for eight hours as steam discharges.',
        'D0-2'],
      ['Body 3',
        'In the final stage, the condensed mixture is directed to a cooling tank, where it rests at 5°C for another eight hours, solidifying into soft cheese. During this stage, waste water is removed through two filtering devices connected to the transfer pipe and the tank’s outlet.',
        'D0-1'],
    ]),
    analysisSections: analysis([
      ['1. Phân tích nhanh đề này',
        'Dạng: quy trình nhân tạo (man-made process) — 5 giai đoạn: trộn → làm lạnh → lên men → bay hơi → làm lạnh lần cuối (kèm lọc nước thải).\n'
        + 'Thì: hiện tại đơn, chủ yếu BỊ ĐỘNG (is added / is heated / is transferred).\n\n'
        + 'Overview nên nói gì?\n'
        + '- Có bao nhiêu giai đoạn, bắt đầu và kết thúc bằng gì (sữa + nước → pho mát mềm).\n'
        + '- Tổng thời gian ≈ 1 ngày (2 + 6 + 8 + 8 = 24 giờ).\n'
        + '- Điểm chung: nhiệt độ thay đổi liên tục, hỗn hợp chuyển từ lỏng sang đặc.\n\n'
        + 'Câu Overview mẫu:\n'
        + 'Overall, this is a biochemical process that consists of five main stages and takes approximately one day to complete.'],
      ['2. Cách chia thân bài – theo trạng thái của hỗn hợp',
        'Bài mẫu chia 3 đoạn (có thể gộp Body 2 + Body 3 nếu muốn chỉ 2 đoạn):\n'
        + '- Body 1 – còn là chất LỎNG: trộn nước + sữa → làm lạnh 5°C trong 2 giờ (có khuấy).\n'
        + '- Body 2 – bắt đầu ĐẶC lại: thêm muối qua van → lên men 37°C trong 6 giờ → bay hơi 100°C trong 8 giờ, hơi nước thoát ra.\n'
        + '- Body 3 – THÀNH PHẨM: bể làm lạnh 5°C thêm 8 giờ → pho mát mềm; nước thải được lọc ra qua 2 bộ lọc.\n\n'
        + 'Đừng bỏ sót: salt, steam, filter, waste water — giám khảo kiểm tra các chi tiết này.'],
      ['3. Ngôn ngữ cho dạng process',
        'Từ nối trình tự (đừng lặp "then"):\n'
        + '- The process commences with ... / Thereafter, ... / Next, ... / Once fully fermented, ... / In the final stage, ...\n\n'
        + 'Nhiệt độ + thời gian:\n'
        + '- is heated to 37°C for six hours\n'
        + '- undergoes a cooling phase at 5°C for a duration of two hours\n'
        + '- rests at 5°C for another eight hours\n\n'
        + 'Mệnh đề quan hệ / phân từ để nối 2 bước:\n'
        + '- ... into a mixing chamber, where they are thoroughly blended.\n'
        + '- Over six hours, chemical reactions occur, causing the mixture to thicken.\n'
        + '- ... solidifying into soft cheese.'],
      ['4. Checklist để đạt 6.5+',
        '① Có đủ 5 giai đoạn và đúng thứ tự không?\n'
        + '② Mỗi giai đoạn nhiệt có ghi cả NHIỆT ĐỘ và THỜI GIAN không?\n'
        + '③ Có dùng bị động xuyên suốt (is added, is heated, is transferred) không?\n'
        + '④ Overview có nêu số giai đoạn + điểm đầu/điểm cuối, KHÔNG có số liệu chi tiết?'],
      ['5. Nguồn bài mẫu',
        'Bài mẫu lấy từ ZIM Academy — "Bài mẫu IELTS Writing Task 1 và Task 2 ngày 17/10/2024", zim.vn. Đề thi thật ngày 17/10/2024.'],
    ]),
  },
];

// WritingTask1.chartType for every task on the site (2026-11-05).
// static = one point in time / no time · dynamic = change over time ·
// mixed = two different chart kinds · process · map (incl. floor plans).
const CHART_TYPES = {
  '69ccec1984749e2f69dfb295': 'dynamic', // steel production/demand + workers, months of 2010 (2 line graphs)
  '69ccec4284749e2f69dfb29f': 'mixed',   // life expectancy bar + table
  '69cced8084749e2f69dfb2e8': 'dynamic', // waste disposal 2005–2008
  '69cced8084749e2f69dfb2eb': 'dynamic', // internet activities 2007 vs 2009
  '69ccef70ced4b4441bda4162': 'dynamic', // houses sold 2009 vs 2014
  '69ccefaeced4b4441bda4168': 'dynamic', // sales in four seasons
  '69ccefe7ced4b4441bda416e': 'static',  // time on websites, male/female
  '69ccfaf0be01f2365094f31a': 'map',     // Youngsville
  '69ccfb39c3dfac9a6ca873c1': 'process', // milk production
  '69ccfb7ec3dfac9a6ca873c7': 'process', // salmon life cycle
  '69ccfb8fc3dfac9a6ca873cd': 'static',  // UK housing preferences survey 2009
  '69e86a01d4a26e0e1ef31294': 'dynamic', // population 65+ 1940–2040
  '69ead68bb61306c0b122e219': 'process', // honey bee life cycle
  '69ead73cb61306c0b122e283': 'process', // carbonated drinks
  '69ead95712d21842dfb93078': 'static',  // time on websites
  '69fcb1a3e5b68c3982dd4e46': 'map',     // school library then/now
  '69fcb329e5b68c3982dd4f14': 'mixed',   // cinema: table + line graph
  '69fcb377e5b68c3982dd4f46': 'mixed',   // population: table + pie
  '69fcb3a7e5b68c3982dd4f78': 'mixed',   // water use: table + chart
  '6a3e9e7e464d74774ccfa458': 'dynamic', // fish & meat 1979–2004
  '6a6d66cd9eedfa86a52c6633': 'dynamic', // fast food 1970–1990
  '6a7e73556204f0a7d2aba2f6': 'dynamic', // school spending 1981/1991/2001 pies
  '6a848738c4d5b5ac38bce87f': 'static',  // water use & income, 2004 (2 pies)
  '6a848738c4d5b5ac38bce888': 'process', // aluminium can recycling
  '6a848738c4d5b5ac38bce88a': 'map',     // housing estate
  '6a848738c4d5b5ac38bce889': 'dynamic', // charity donations 2006–2010
  '6a848738c4d5b5ac38bce887': 'map',     // Pentland 1950–2007
  '6a848738c4d5b5ac38bce886': 'dynamic', // female MPs 2000–2012
  '6a848738c4d5b5ac38bce881': 'dynamic', // library loans 1995–2005
  '6a848738c4d5b5ac38bce880': 'mixed',   // online shopping: chart + table
  '6a848738c4d5b5ac38bce883': 'dynamic', // course types 1984/1994/2004
  '6a848738c4d5b5ac38bce885': 'dynamic', // international conferences
  '6a848738c4d5b5ac38bce884': 'dynamic', // leisure activities 1990 vs 2010
  '6a848738c4d5b5ac38bce882': 'map',     // archaeological site 2004/2014
  '6a8573d9282c853ce33a8f24': 'static',  // boys' sports 2010
  '6a857531282c853ce33a8f25': 'static',  // consumer spending 2002
  '6a8c0bf58bafbec237853163': 'static',  // recycling pies
  '6a8e5b9dbc78d7b28ea1d9df': 'static',  // household energy + emissions pies
  '6a991c890bed325d94ba2030': 'mixed',   // temperature line + sunshine table
  '6a991cf50bed325d94ba2031': 'mixed',   // UK travel line + bar
  '6aa117a182c95810be773b50': 'map',     // West Park Secondary School
  '6ab51b744db96d78f0045037': 'map',     // Eastminster
  '6ac0d4f573c776372979d7ec': 'static',  // household energy + emissions pies
  '6ad0bdf8cec639c8a30b1c49': 'process', // cement & concrete
};

async function uploadImage(file) {
  const buf = fs.readFileSync(path.join(IMG_DIR, file));
  const mime = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  if (!APPLY) return `(dry run) R2 upload of ${file}`;
  return (await mediaStore.uploadImage(`data:${mime};base64,${buf.toString('base64')}`, 'writing-tasks')).url;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`[seedWritingTask1Nov2026] ${APPLY ? 'APPLY' : 'DRY RUN'}`);

  for (const t of TASKS) {
    let doc = t.id
      ? await WritingTask1.findById(t.id).select('+chartData').lean()
      : await WritingTask1.findOne({ prompt: t.match }).select('+chartData').lean();
    const $set = {
      prompt: t.prompt, chartType: t.chartType, chartData: t.chartData,
      sampleSections: t.sampleSections, analysisSections: t.analysisSections, isActive: true,
    };
    if (!doc || !OUR_MEDIA.test(doc.imageUrl || '')) $set.imageUrl = await uploadImage(t.image);

    const words = t.sampleSections.map(s => s.content).join(' ').split(/\s+/).length;
    if (doc) {
      console.log(`UPDATE ${doc._id}  ${t.chartType}  sample ${words}w  ${$set.imageUrl ? 'image → R2' : 'image kept'}`);
      if (APPLY) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        fs.writeFileSync(path.join(BACKUP_DIR, `${doc._id}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`), JSON.stringify(doc, null, 2));
        await WritingTask1.updateOne({ _id: doc._id }, { $set });
      }
    } else {
      console.log(`CREATE ${t.chartType}  sample ${words}w  "${t.prompt.slice(0, 70)}…"`);
      if (APPLY) doc = await WritingTask1.create($set);
    }
  }

  let typed = 0;
  for (const [id, chartType] of Object.entries(CHART_TYPES)) {
    const r = APPLY
      ? await WritingTask1.updateOne({ _id: id, chartType: { $in: ['', null] } }, { $set: { chartType } })
      : { matchedCount: await WritingTask1.countDocuments({ _id: id, chartType: { $in: ['', null] } }) };
    typed += r.matchedCount;
  }
  const left = await WritingTask1.find({ isActive: true, chartType: { $in: ['', null] } }).select('prompt').lean();
  console.log(`chartType: ${typed} task(s) ${APPLY ? 'classified' : 'to classify'}; active still unclassified: ${left.length}`);
  left.forEach(d => console.log(`  ? ${d._id}  ${d.prompt.slice(0, 80)}`));
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
