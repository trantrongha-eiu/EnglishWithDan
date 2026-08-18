/**
 * Seed script – "Phân tích đề" (analysisSections) for the 12 WritingTask1
 * topics added by seedWritingTasks2026Q3.js. Each topic gets guidance for
 * band 6.5+: what to pick for the Overview, how to split Body 1 / Body 2,
 * and a reusable formula for that chart type — deliberately simpler than
 * band-8+ level (safe, high-frequency structures only).
 *
 * Matches existing WritingTask1 docs by exact `prompt` text — does NOT
 * upsert (no `upsert: true`), so if a prompt doesn't match an existing doc
 * this reports modifiedCount 0 for it instead of silently creating a
 * broken half-populated topic.
 *
 * Run: node backend/scripts/seedWritingTask1Analysis2026Q3.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const ANALYSIS = [
  // ── 1. Water use vs income from agricultural products (2 pie charts) ──
  {
    prompt: 'The charts below show the use of water for agricultural products in Australia in 2004 and the value of these products to the Australian economy in the same year. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Đây là 2 biểu đồ tròn CÙNG năm 2004 nhưng đo 2 đại lượng khác nhau: % nước tưới tiêu và % thu nhập, cho 7 loại nông sản.

Overview nên nói gì?
So khớp 2 biểu đồ để tìm sản phẩm nào LỆCH nhiều nhất giữa 2 chỉ số:
- Livestock (chăn nuôi): dùng NHIỀU nước nhất (36%) nhưng thu nhập lại THẤP nhất (chỉ 5%) → không hiệu quả.
- Fruit (trái cây): dùng ÍT nước (11%) nhưng thu nhập CAO nhất (36%) → hiệu quả nhất.

Cấu trúc Overview:
Overall, livestock farming consumed the largest proportion of water but generated the smallest share of income, whereas fruit production used relatively little water yet brought in the highest income.`
      },
      {
        title: '2. Body 1 – Nhóm không hiệu quả (dùng nhiều nước, thu nhập thấp)',
        content: `Nên viết: Livestock (36% nước / 5% thu nhập), Dairy (19% nước / 20% thu nhập – khá cân bằng), Cotton (15% nước / 11% thu nhập).

Topic sentence:
Livestock farming used the highest proportion of water, at 36%, yet it accounted for only 5% of total income.

Cấu trúc hay (an toàn cho band 6.5):
- A accounted for X% of Y
  Livestock accounted for 36% of total water use.
- despite + V-ing / despite + N
  Despite using the most water, livestock generated the least income.
- in contrast / whereas
  Dairy farming, in contrast, used a similar proportion of water and income (19% vs 20%).`
      },
      {
        title: '3. Body 2 – Nhóm hiệu quả (dùng ít nước, thu nhập cao)',
        content: `Nên viết: Fruit (11% nước / 36% thu nhập), Sugar (10% nước / 6% thu nhập), Rice (5% nước / 1% thu nhập), Vegetables (4% nước / 21% thu nhập).

Topic sentence:
By contrast, fruit required only 11% of the water but produced the largest share of income, at 36%.

Cấu trúc hay:
- required only X% but produced Y%
  Fruit required only 11% of the water but produced 36% of the income.
- the smallest amount of
  Rice used the smallest amount of water, at just 5%, and also generated the least income of all products, at 1%.
- similarly / likewise
  Similarly, vegetables used a small share of water (4%) but earned a much larger 21% of income.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2 biểu đồ tròn so sánh 2 chỉ số"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm 1-2 hạng mục LỆCH nhiều nhất giữa 2 chỉ số (cao ở biểu đồ này nhưng thấp ở biểu đồ kia, hoặc ngược lại).
BODY 1: nhóm hạng mục "không cân xứng" (dùng nhiều nhưng thu ít, hoặc ngược lại).
BODY 2: nhóm hạng mục còn lại, có thể có 1-2 hạng mục cân bằng để đối chiếu.

Checklist để đạt 6.5+:
① Đã nêu overview với 2 điểm nổi bật nhất chưa?
② Mỗi số liệu nêu ra có đơn vị % rõ ràng không?
③ Có dùng ít nhất 1 câu so sánh (despite / whereas / in contrast / by contrast) không?
④ Không liệt kê hết cả 7 sản phẩm chi tiết như nhau — chỉ tập trung vào các điểm khác biệt lớn.`
      },
    ],
  },

  // ── 2. Online shopping AU/NZ (2 pies + table) ──
  {
    prompt: 'The chart and table provide data on online shopping among Australian and New Zealand customers in 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Đề có 2 phần: 2 biểu đồ tròn (AU vs NZ mua ở web nội địa/nước ngoài/cả 2) và 1 bảng (lý do chính mua online).

Overview nên nói gì? Nhìn tổng thể → có 2 ý lớn:
- Khách Úc thích mua ở web nước ngoài hơn hẳn (65%) so với khách NZ (50%).
- Cả 2 nước đều xếp "giá rẻ hơn" là lý do #1, bỏ xa các lý do khác.

Cấu trúc Overview:
Overall, Australian customers showed a stronger preference for overseas websites than their New Zealand counterparts, and in both countries, lower prices were by far the most common reason for shopping online.`
      },
      {
        title: '2. Body 1 – 2 biểu đồ tròn (thói quen mua sắm)',
        content: `Nên viết: Overseas only (AU 65% / NZ 50%), Local only (AU 25% / NZ 43%), Both (AU 10% / NZ 7%).

Topic sentence:
Regarding shopping habits, a considerably higher proportion of Australians shopped exclusively on overseas websites compared with New Zealanders.

Cấu trúc hay:
- a higher/lower proportion of A than B
  A higher proportion of Australians shopped on overseas websites than New Zealanders.
- meanwhile
  Meanwhile, local websites were more popular among New Zealand shoppers, accounting for 43% compared with just 25% in Australia.
- a small minority
  A small minority in both countries used both types of websites (10% and 7% respectively).`
      },
      {
        title: '3. Body 2 – Bảng lý do mua sắm online',
        content: `Nên viết: Lower prices (AU 55% / NZ 51%), Convenience (AU 28% / NZ 36%), Better range of products (AU 15% / NZ 11%), Other (2% cả hai).

Topic sentence:
Turning to the reasons for shopping online, lower prices were the leading motivation in both countries, followed by convenience.

Cấu trúc hay:
- was the leading/main reason
  Lower prices were the leading reason for online shopping in both countries.
- followed by
  This was followed by convenience, which was cited by 28% of Australians and 36% of New Zealanders.
- the least common reason
  A better range of products was the least common reason, apart from the negligible "other" category.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ + bảng kết hợp"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: 1 ý từ biểu đồ + 1 ý từ bảng (không cần trộn lẫn, mỗi phần 1 điểm nổi bật).
BODY 1: mô tả toàn bộ phần biểu đồ (so sánh 2 nhóm/2 nước).
BODY 2: mô tả toàn bộ phần bảng (xếp hạng theo mức độ phổ biến).

Checklist để đạt 6.5+:
① Overview có nhắc đến CẢ biểu đồ và bảng không (không chỉ 1 trong 2)?
② Body 1 và Body 2 có tách biệt rõ ràng theo nguồn dữ liệu không?
③ Có so sánh AU vs NZ ở cả 2 phần không?
④ Số liệu bảng có được xếp theo thứ tự từ cao đến thấp khi mô tả không (dễ đọc hơn)?`
      },
    ],
  },

  // ── 3. UK library items borrowed (stacked bar, 1995-2005) ──
  {
    prompt: 'The chart below shows the number of items borrowed from public libraries in the UK over the ten-year period from 1995 to 2005. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột chồng, 3 mốc thời gian (1995, 2000, 2005), 4 loại tài liệu: Adult Fiction, Adult Non-Fiction, Children's Books, Audio-Visual.

Overview nên nói gì? Nhìn toàn biểu đồ → có 2 ý lớn:
- Tổng số lượt mượn giảm mạnh xuyên suốt 10 năm (từ ~1648 triệu xuống còn ~504 triệu).
- Children's Books giảm kịch tính nhất — từ hạng mục lớn nhất (1113 triệu) xuống gần như nhỏ nhất (110 triệu).

Cấu trúc Overview:
Overall, the total number of items borrowed from UK public libraries fell considerably between 1995 and 2005, with children's books experiencing by far the sharpest decline of all categories.`
      },
      {
        title: '2. Body 1 – Hạng mục giảm mạnh nhất',
        content: `Nên viết: Children's Books (1113 → 161 → 110 triệu), Audio-Visual materials (330 → 280 → 230 triệu).

Topic sentence:
Children's books saw the most dramatic fall, dropping from 1,113 million in 1995 to just 110 million in 2005.

Cấu trúc hay:
- dropped/fell from X to Y
  Children's books dropped from 1,113 million to 110 million over the period.
- a similar downward trend
  Audio-visual materials followed a similar downward trend, decreasing steadily from 330 million to 230 million.
- by far the sharpest decline
  This represented by far the sharpest decline among the four categories.`
      },
      {
        title: '3. Body 2 – Hạng mục ổn định hơn',
        content: `Nên viết: Adult Fiction (98 → 93 → 60 triệu, giảm nhẹ), Adult Non-Fiction (107 → 113 → 104 triệu, gần như không đổi).

Topic sentence:
In contrast, adult fiction and non-fiction books remained comparatively stable throughout the ten-year period.

Cấu trúc hay:
- remained comparatively stable
  Adult non-fiction remained comparatively stable, fluctuating only slightly between 104 and 113 million.
- a slight/gradual decrease
  Adult fiction saw only a gradual decrease, from 98 million to 60 million.
- while / whereas
  While the other categories declined sharply, these two book types changed only marginally.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột theo thời gian, nhiều hạng mục"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: xu hướng chung (tăng/giảm tổng thể) + hạng mục thay đổi mạnh nhất.
BODY 1: nhóm các hạng mục thay đổi NHIỀU (tăng/giảm mạnh), có số liệu cụ thể.
BODY 2: nhóm các hạng mục thay đổi ÍT (ổn định), dùng để đối chiếu.

Checklist để đạt 6.5+:
① Có nêu số liệu đầu kỳ và cuối kỳ cho các hạng mục chính không (không chỉ nói chung chung "tăng"/"giảm")?
② Có tách nhóm "thay đổi nhiều" và "thay đổi ít" thay vì mô tả lần lượt từng năm không?
③ Overview có nêu đúng hạng mục thay đổi MẠNH NHẤT không?`
      },
    ],
  },

  // ── 4. Archaeological site map (2004 → 2014) ──
  {
    prompt: 'The maps below show recent archaeological findings at a historic site in 2004 and 2014. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 bản đồ cùng 1 khu di tích, năm 2004 và 2014.

Overview nên nói gì? Nhìn toàn bản đồ → có 2 ý lớn:
- Khu vực có nhiều thay đổi/công trình mới được phát hiện thêm (stadium, toilet, palace, và số nhà tăng mạnh).
- Một số đặc điểm cũ biến mất (mountains), trong khi temple và sea gần như không đổi.

Cấu trúc Overview:
Overall, several new structures were discovered at the site by 2014, and the number of ancient houses increased considerably, while the temple and the coastline remained unchanged.`
      },
      {
        title: '2. Body 1 – Khu vực có nhiều thay đổi nhất',
        content: `Nên viết: Mountains → biến mất; Stadium → xuất hiện; Toilet → xuất hiện; Houses → 2 tăng lên 10 nhà.

Topic sentence:
The most significant changes took place in the area where the mountains used to be, which was replaced by a stadium and an ancient toilet.

Cấu trúc hay (an toàn cho band 6.5):
- A was replaced by B
  The mountains were replaced by a stadium.
- A new building was found
  A new toilet was also found in the same area.
- increased from X to Y
  The number of ancient houses increased from two to ten.`
      },
      {
        title: '3. Body 2 – Khu vực ít thay đổi hơn',
        content: `Nên viết: Palace → mới xuất hiện; Trees → giảm từ 3 xuống 2; Temple → không đổi; Sea → không đổi.

Topic sentence:
In the rest of the site, fewer changes were found, although a new palace was discovered.

Cấu trúc hay:
- a new N was found/discovered
  A new palace was found to the south.
- decreased slightly from X to Y
  The number of trees decreased slightly from three to two.
- remained unchanged / stayed the same
  The temple and the sea remained unchanged between 2004 and 2014.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bản đồ so sánh 2 mốc thời gian"',
        content: `Mỗi đề chỉ cần làm:
OVERVIEW: 1 ý về thay đổi lớn nhất + 1 ý về đặc điểm không đổi.
BODY 1: khu vực/nhóm thay đổi NHIỀU nhất — mất gì, thêm gì, số lượng tăng/giảm bao nhiêu.
BODY 2: khu vực/nhóm còn lại — thay đổi ít hơn, có gì mới, có gì không đổi.

Checklist để đạt 6.5+:
① Đã tìm đủ: thêm gì? mất gì? tăng/giảm số lượng? cái gì không đổi? chưa?
② Không chia Body theo "bản đồ 1 / bản đồ 2" — hãy chia theo khu vực hoặc nhóm thay đổi.
③ Có ít nhất 2 câu dùng passive voice (was added / was replaced / was found) không — cấu trúc rất hay dùng cho bản đồ.
④ Có nêu số liệu cụ thể (2 → 10 nhà, 3 → 2 cây) thay vì chỉ nói "tăng"/"giảm" chung chung không?`
      },
    ],
  },

  // ── 5. Course types pie charts (1984, 1994, 2004) ──
  {
    prompt: 'The pie charts illustrate the proportions of different course types chosen by students in the years 1984, 1994, and 2004. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `3 biểu đồ tròn theo thời gian (1984, 1994, 2004), 4 loại khóa học: Face-to-face, Correspondence, Online, Mixed-media.

Overview nên nói gì? Nhìn xu hướng 3 mốc → có 2 ý lớn:
- Face-to-face courses vẫn là loại phổ biến nhất xuyên suốt, nhưng tỷ lệ giảm dần (67% → 54% → 40%).
- Mixed-media courses tăng mạnh nhất, từ 13% lên 35%, vượt qua Correspondence để đứng thứ 2 vào năm 2004.

Cấu trúc Overview:
Overall, face-to-face courses remained the most popular option throughout the period despite a steady decline, while mixed-media courses saw the largest increase, overtaking correspondence courses by 2004.`
      },
      {
        title: '2. Body 1 – Face-to-face và Correspondence (2 loại truyền thống)',
        content: `Nên viết: Face-to-face (67% → 54% → 40%), Correspondence (20% → 20% → 15%).

Topic sentence:
Face-to-face courses were consistently the most common choice, although their share fell considerably from 67% in 1984 to 40% in 2004.

Cấu trúc hay:
- fell considerably from X to Y
  Face-to-face courses fell considerably from 67% to 40%.
- remained stable before falling
  Correspondence courses remained stable at 20% until 1994, before falling slightly to 15% in 2004.
- still the most popular option
  Despite this decline, face-to-face courses were still the most popular option in 2004.`
      },
      {
        title: '3. Body 2 – Online và Mixed-media (2 loại mới nổi)',
        content: `Nên viết: Online (0% → 11% → 10%, mới xuất hiện năm 1994), Mixed-media (13% → 15% → 35%, tăng mạnh nhất).

Topic sentence:
By contrast, mixed-media courses grew considerably, rising from 13% to 35% and becoming the second most popular type by 2004.

Cấu trúc hay:
- rose/grew considerably
  Mixed-media courses grew considerably over the two decades.
- did not exist until
  Online courses did not exist until 1994, when they accounted for 11% of the total.
- remained roughly stable at
  The proportion of online courses then remained roughly stable at around 10-11%.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ tròn theo thời gian (xu hướng)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: hạng mục LỚN NHẤT xuyên suốt (dù tăng hay giảm) + hạng mục THAY ĐỔI NHIỀU NHẤT.
BODY 1: 1-2 hạng mục ổn định/quen thuộc (số liệu 3 mốc thời gian).
BODY 2: 1-2 hạng mục biến động mạnh/mới xuất hiện (số liệu 3 mốc thời gian).

Checklist để đạt 6.5+:
① Có nêu đủ 3 mốc thời gian cho MỖI hạng mục được nhắc đến không?
② Overview có phân biệt rõ "phổ biến nhất" và "thay đổi nhiều nhất" (có thể là 2 hạng mục khác nhau) không?
③ Có dùng ít nhất 1 câu diễn tả xu hướng liên tục (steadily, gradually, considerably) không?`
      },
    ],
  },

  // ── 6. Leisure activities table (urban/rural, 1990 & 2010) ──
  {
    prompt: 'The graph below shows the percentage of adults living in urban and rural areas who participated in four leisure activities in 1990 and 2010. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Bảng số liệu: 4 hoạt động giải trí (Reading, Animated play, Playing, Photography), 2 khu vực (Urban, Rural), 2 mốc thời gian (1990, 2010).

Overview nên nói gì? Nhìn toàn bảng → có 2 ý lớn:
- Reading luôn là hoạt động phổ biến nhất ở cả 2 khu vực, và đến 2010 thì urban và rural có tỷ lệ BẰNG NHAU (78%).
- Photography tăng mạnh nhất, đặc biệt ở khu vực thành thị (7% → 17%, hơn gấp đôi).

Cấu trúc Overview:
Overall, reading was the most popular activity in both areas throughout the period, with urban and rural participation converging by 2010, while photography saw the sharpest increase, particularly among urban residents.`
      },
      {
        title: '2. Body 1 – Reading và Animated play',
        content: `Nên viết: Reading (Urban 61→78, Rural 71→78), Animated play (Urban 10→10, Rural 18→14).

Topic sentence:
Reading remained the most popular leisure activity in both areas, with participation rates converging at 78% by 2010.

Cấu trúc hay:
- converge / become equal
  Urban and rural reading rates converged at 78% by 2010, compared with a gap of 10 percentage points in 1990.
- remain unchanged
  Participation in animated play among urban adults remained unchanged, at 10%, over the period.
- a slight decline
  Rural participation in animated play saw a slight decline, from 18% to 14%.`
      },
      {
        title: '3. Body 2 – Playing và Photography',
        content: `Nên viết: Playing (Urban 21→14, giảm; Rural 26→26, không đổi), Photography (Urban 7→17, Rural 14→24, cả 2 đều tăng mạnh).

Topic sentence:
Photography saw the most significant rise of all four activities, more than doubling among urban adults from 7% to 17%.

Cấu trúc hay:
- more than double
  Urban participation in photography more than doubled, from 7% to 17%.
- fall while remaining stable elsewhere
  Playing fell among urban adults, from 21% to 14%, while the rural figure remained exactly the same, at 26%.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bảng số liệu urban/rural theo thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: hoạt động phổ biến nhất xuyên suốt + hoạt động thay đổi nhiều nhất.
BODY 1: 2 hoạt động có xu hướng ổn định/giống nhau giữa urban-rural.
BODY 2: 2 hoạt động có sự khác biệt hoặc thay đổi rõ rệt giữa urban-rural.

Checklist để đạt 6.5+:
① Mỗi hoạt động có nêu đủ 4 số liệu (urban 1990, urban 2010, rural 1990, rural 2010) không — ít nhất với 2 hoạt động chính?
② Có so sánh urban vs rural CÙNG một hoạt động, thay vì so sánh 2 hoạt động khác nhau không?
③ Overview có nêu đúng hoạt động tăng MẠNH NHẤT không (Photography, không phải Reading)?`
      },
    ],
  },

  // ── 7. International conferences line graph (3 cities) ──
  {
    prompt: 'The line graph provides information about the number of international conferences that took place in three different cities. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ đường, 3 thành phố (A, B, C), giai đoạn 1965-2010.

Overview nên nói gì? Nhìn toàn biểu đồ → có 2 ý lớn:
- City C thay đổi kịch tính nhất: bắt đầu từ 0 (không tổ chức hội nghị nào) năm 1965, rồi tăng dần lên mức tương đương 2 thành phố kia vào 2010.
- City B ổn định nhất trong suốt cả giai đoạn, gần như không đổi (khoảng 28-30).

Cấu trúc Overview:
Overall, City C experienced the most dramatic change, rising from zero conferences in 1965 to a level comparable with the other two cities by 2010, while City B remained the most stable of the three throughout the period.`
      },
      {
        title: '2. Body 1 – City A và City B',
        content: `Nên viết: City A (dao động mạnh: 35 → 20 → 30 → 20 → 30 → 20), City B (ổn định: quanh mức 28-30 suốt giai đoạn).

Topic sentence:
City B remained fairly constant throughout the period, fluctuating only slightly between 28 and 30 conferences.

Cấu trúc hay:
- fluctuate / fluctuate considerably
  City A fluctuated considerably, ranging between 20 and 35 conferences.
- reach a peak of
  City A reached a peak of 35 conferences in 1965, its highest figure in the entire period.
- remain fairly constant
  City B remained fairly constant, showing far less variation than City A.`
      },
      {
        title: '3. Body 2 – City C',
        content: `Nên viết: City C (0 năm 1965, tăng dần qua các mốc, đạt khoảng 30 vào 2010 — gần bằng 2 thành phố kia).

Topic sentence:
City C showed a completely different pattern, starting at zero in 1965 and increasing steadily to reach a similar level to the other two cities by 2010.

Cấu trúc hay:
- start at zero
  City C started at zero, meaning it held no international conferences in 1965.
- increase steadily
  The figure then increased steadily over the following decades.
- catch up with / reach a similar level to
  By 2010, City C had caught up with the other two cities, reaching a similar level of around 30 conferences.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ đường nhiều đường"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: đường nào thay đổi/dao động MẠNH nhất + đường nào ỔN ĐỊNH nhất.
BODY 1: nhóm các đường có đặc điểm giống nhau (vd: cùng ổn định, hoặc cùng dao động).
BODY 2: đường có xu hướng khác biệt/nổi bật nhất — mô tả riêng.

Checklist để đạt 6.5+:
① Có nêu điểm bắt đầu và điểm kết thúc của MỖI đường không (không chỉ nói "tăng"/"giảm" chung chung)?
② Có dùng từ diễn tả mức độ dao động (fluctuate, remain constant, vary) đúng chỗ không?
③ Overview có nêu đúng đường thay đổi ấn tượng nhất (City C) không, thay vì chỉ mô tả đường có số liệu cao nhất?`
      },
    ],
  },

  // ── 8. Female members of parliament line graph (5 countries) ──
  {
    prompt: 'The graph below shows the percentage of female members of parliament in five European countries between 2000 and 2012. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate. Your report should comprise a minimum of 150 words.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ đường, 5 quốc gia (Germany, Spain, Belgium, UK, Italy), giai đoạn 2000-2012. Với 5 đường, ĐỪNG cố mô tả hết chi tiết — chỉ chọn điểm nổi bật nhất.

Overview nên nói gì? Nhìn toàn biểu đồ → có 2 ý lớn:
- Cả 5 nước đều tăng tỷ lệ nữ nghị sĩ trong giai đoạn này (xu hướng chung).
- Italy có thay đổi kịch tính nhất — từ mức thấp nhất (gần 0%) tăng vọt lên gần bằng UK vào 2012; Belgium kết thúc ở mức cao nhất (38%).

Cấu trúc Overview:
Overall, the proportion of female members of parliament increased in all five countries between 2000 and 2012, with Italy showing by far the most dramatic rise and Belgium ending the period with the highest percentage.`
      },
      {
        title: '2. Body 1 – Nhóm tăng ổn định, dần đều (Germany, Spain, Belgium)',
        content: `Nên viết: Germany (~30.5 → ~33, tăng nhẹ đều), Spain (27 → 35, tăng rồi giữ ổn định), Belgium (23 → 38, tăng nhiều nhất trong nhóm này, vượt lên dẫn đầu).

Topic sentence:
Germany, Spain, and Belgium all saw a gradual increase over the period, with Belgium ending as the country with the highest proportion, at 38%.

Cấu trúc hay:
- rise gradually / steadily
  Germany's figure rose gradually, from around 30% to 33%.
- overtake
  Belgium overtook Spain to become the country with the highest percentage by 2012.
- level off
  Spain's growth levelled off after 2004, remaining at around 35% for the rest of the period.`
      },
      {
        title: '3. Body 2 – Nhóm thay đổi nổi bật (UK, Italy)',
        content: `Nên viết: UK (17 → 23, tăng chậm và đều), Italy (2.5 → 23, gần như bằng 0 rồi tăng vọt đột ngột 2004-2008, sau đó gần bằng UK vào 2012).

Topic sentence:
Italy stood out with an especially dramatic increase, climbing sharply from just 2.5% in 2000 to 23% by 2012 — nearly the same level as the UK.

Cấu trúc hay:
- stand out with
  Italy stood out with the sharpest rise among all five countries.
- climb sharply
  Italy's figure climbed sharply between 2004 and 2008 in particular.
- end up at a similar level to
  By 2012, Italy had ended up at a similar level to the UK, at around 23%.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ đường nhiều đường (4-5 đường)"',
        content: `Mỗi đề dạng này chỉ cần làm — QUAN TRỌNG: với 4-5 đường, đừng cố mô tả từng đường một cách đều nhau, hãy nhóm lại:
OVERVIEW: xu hướng chung (tăng/giảm ở tất cả) + đường thay đổi ấn tượng nhất.
BODY 1: nhóm 2-3 đường có xu hướng tương tự nhau (vd: cùng tăng đều).
BODY 2: đường/nhóm nổi bật nhất, khác biệt rõ so với phần còn lại.

Checklist để đạt 6.5+:
① Có tránh việc liệt kê số liệu của cả 5 đường một cách dàn trải, đều nhau không?
② Có nhóm được ít nhất 2 đường có đặc điểm chung vào cùng 1 câu/đoạn không?
③ Overview có nêu đúng nước có thay đổi ấn tượng nhất (Italy) và nước kết thúc cao nhất (Belgium) không?`
      },
    ],
  },

  // ── 9. Pentland coastal area map (1950 → 2007) ──
  {
    prompt: 'The diagrams below show the changes that took place in a coastal area called Pentland between 1950 and 2007. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 bản đồ cùng 1 thị trấn ven biển Pentland, năm 1950 và 2007.

Overview nên nói gì? Nhìn toàn bản đồ → có 2 ý lớn:
- Khu vực công nghiệp và đất trống (grassland) biến mất, thay vào đó là các công trình giải trí/dân cư mới (marina, hồ bơi, rạp chiếu phim, cửa hàng, chung cư).
- Đường bờ biển (sea) không thay đổi.

Cấu trúc Overview:
Overall, Pentland was transformed from an industrial area with open grassland into a residential and leisure destination, with several new facilities being added, while the coastline remained unchanged.`
      },
      {
        title: '2. Body 1 – Những gì biến mất / thay đổi',
        content: `Nên viết: Industrial area → biến mất; Grassland (2 khu) → biến mất; Roads/car park đơn giản → được thay bằng đường lớn hơn + bãi đỗ xe nhiều tầng.

Topic sentence:
The industrial area and the grassland that dominated the town in 1950 had completely disappeared by 2007.

Cấu trúc hay:
- had completely disappeared by
  The grassland had completely disappeared by 2007.
- be replaced by
  The simple car park was replaced by a multi-storey car park.
- no longer exist
  The industrial buildings no longer existed in 2007.`
      },
      {
        title: '3. Body 2 – Những gì được thêm mới',
        content: `Nên viết: Park, Swimming pool, Marina, Shops (2 khu), Cinema, Apartments — tất cả đều mới; Sea → không đổi.

Topic sentence:
By contrast, a number of new facilities were added, including a park, a swimming pool, a marina, shops, a cinema, and apartments.

Cấu trúc hay:
- a number of new facilities were added, including...
  A number of new facilities were added, including a marina and a cinema.
- be built/constructed
  Apartments were constructed on the eastern side of the town.
- remain unchanged
  The sea and the coastline remained unchanged throughout the period.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bản đồ so sánh 2 mốc thời gian"',
        content: `Mỗi đề chỉ cần làm:
OVERVIEW: 1 ý tổng quát về loại thay đổi (vd: từ công nghiệp → giải trí/dân cư) + 1 ý về đặc điểm không đổi.
BODY 1: những gì biến mất/bị thay thế.
BODY 2: những gì được thêm mới + đặc điểm không đổi.

Checklist để đạt 6.5+:
① Có liệt kê đủ các công trình MẤT ĐI và công trình MỚI THÊM không (đừng bỏ sót)?
② Có nêu rõ đặc điểm KHÔNG ĐỔI (sea/coastline) — đây là điểm hay bị quên?
③ Có dùng câu bị động (was replaced by / was added / were constructed) đúng ngữ pháp không?`
      },
    ],
  },

  // ── 10. Aluminium can recycling process ──
  {
    prompt: 'The diagram below shows the recycling process of aluminium cans. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Đây là dạng PROCESS (quy trình), khác hẳn biểu đồ số liệu — không có % hay số liệu để so sánh, mà mô tả các bước theo trình tự.

Overview nên nói gì?
- Quy trình có bao nhiêu bước (12 bước).
- Bắt đầu từ đâu, kết thúc ở đâu, và tổng thời gian (6 tuần).

Cấu trúc Overview:
Overall, the recycling of aluminium cans is a twelve-stage process which begins with waste collection and ends with the production of new cans, taking a total of six weeks to complete.`
      },
      {
        title: '2. Body 1 – Nửa đầu quy trình (bước 1-6): thu gom và xử lý sơ bộ',
        content: `Nên viết: (1) Waste Collection → (2) Consolidation → (3) Advanced Sorting → (4) Shredding → (5) Baling → (6) Induction Melting.

Topic sentence:
In the first stage of the process, used cans are collected and prepared before being melted down.

Cấu trúc hay (rất quan trọng cho dạng process — luôn dùng bị động vì không rõ ai làm):
- First/Firstly, A is collected
  First, waste aluminium cans are collected from various locations.
- After that / Next / Then
  After that, the cans are consolidated and sorted at a processing facility.
- be shredded / be baled / be melted
  The sorted material is then shredded and baled before being melted in an induction furnace.`
      },
      {
        title: '3. Body 2 – Nửa sau quy trình (bước 7-12): tạo lon mới',
        content: `Nên viết: (7) Thermal De-coating → (8) Ingot Casting → (9) Purification & Weighing → (10) Rolling Mills → (11) Can Forming & Shaping → (12) New Cans Ready.

Topic sentence:
In the second half of the process, the melted aluminium is turned into ingots and eventually shaped into new cans.

Cấu trúc hay:
- be cast into
  The purified aluminium is cast into ingots.
- be rolled / be shaped
  These ingots are then rolled into thin sheets and shaped into cans.
- finally / at the final stage
  Finally, the new cans are ready to be filled and sold, completing the six-week cycle.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "quy trình / process diagram"',
        content: `Mỗi đề dạng process chỉ cần làm:
OVERVIEW: tổng số bước + điểm bắt đầu/kết thúc + thời gian (nếu có).
BODY 1: nửa đầu quy trình (khoảng một nửa số bước), theo đúng thứ tự.
BODY 2: nửa sau quy trình, theo đúng thứ tự.

Checklist để đạt 6.5+:
① Có dùng passive voice (is collected / is melted / is shaped) thay vì active voice không? Đây là điểm bắt buộc cho dạng process.
② Có dùng đủ từ nối trình tự (first, next, after that, then, finally) không?
③ Có gộp mỗi 2-3 bước nhỏ vào 1 câu thay vì viết 12 câu riêng lẻ (mỗi câu 1 bước) không — cách này giúp bài mạch lạc hơn?
④ KHÔNG cần so sánh/số liệu — đây là điểm khác biệt lớn nhất so với các dạng biểu đồ khác.`
      },
    ],
  },

  // ── 11. Charity donations table (2006-2010) ──
  {
    prompt: 'The table shows the amount of money donated by charities in the USA, EU countries, and other countries to developing nations between 2006 and 2010, measured in millions of dollars. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Bảng số liệu: 3 nguồn quyên góp (USA, EU, Other countries), 5 năm (2006-2010), đơn vị triệu đô.

Overview nên nói gì? Nhìn toàn bảng → có 2 ý lớn:
- Mỹ (USA) quyên góp NHIỀU HƠN HẲN so với EU và các nước khác CỘNG LẠI, và khoảng cách này còn nới rộng thêm qua các năm.
- EU và Other countries có xu hướng khá giống nhau — đều tăng nhẹ, đều đặn, và ở mức thấp hơn nhiều so với Mỹ.

Cấu trúc Overview:
Overall, the USA donated considerably more money than the EU and other countries combined throughout the period, and this gap widened over time, while donations from the EU and other countries followed broadly similar, more modest upward trends.`
      },
      {
        title: '2. Body 1 – USA (nguồn quyên góp lớn nhất)',
        content: `Nên viết: USA (9.8 → 11 → 17 → 16.7 → 20.3 triệu đô, tăng hơn gấp đôi trong 5 năm).

Topic sentence:
The USA was by far the largest donor throughout the period, with its contributions more than doubling from $9.8 million in 2006 to $20.3 million in 2010.

Cấu trúc hay:
- by far the largest
  The USA was by far the largest donor in every year shown.
- more than double
  US donations more than doubled over the five-year period.
- a slight dip before rising again
  There was a slight dip in 2009, before donations rose again to reach their highest point in 2010.`
      },
      {
        title: '3. Body 2 – EU và Other countries (2 nguồn nhỏ hơn, tương tự nhau)',
        content: `Nên viết: EU (3.1 → 3.4 → 3.9 → 3.6 → 4.1 triệu đô), Other countries (2.8 → 3.2 → 3.5 → 3.2 → 3.7 triệu đô) — cả 2 đều tăng nhẹ, đều đặn.

Topic sentence:
By contrast, donations from the EU and other countries were much smaller and followed a similar, more gradual pattern of growth.

Cấu trúc hay:
- much smaller / considerably lower
  Donations from these two sources were considerably lower than those from the USA throughout.
- a similar pattern
  Both the EU and other countries followed a similar pattern, with only minor increases each year.
- remain close to each other
  The figures for the EU and other countries remained close to each other in every year shown.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bảng số liệu theo thời gian, nhiều nguồn"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nguồn/hạng mục LỚN NHẤT (và khoảng cách với các nguồn khác) + đặc điểm chung của các nguồn còn lại.
BODY 1: nguồn lớn nhất/nổi bật nhất — mô tả xu hướng từ đầu đến cuối kỳ.
BODY 2: các nguồn còn lại — nhóm chung nếu chúng có xu hướng giống nhau.

Checklist để đạt 6.5+:
① Có nêu số liệu năm ĐẦU và năm CUỐI cho từng nguồn chính không?
② Có nhận xét về khoảng cách giữa các nguồn (gap) chứ không chỉ mô tả từng nguồn riêng lẻ không?
③ Nếu 2 nguồn có số liệu gần giống nhau (EU và Other ở đây), có gộp chung vào 1 đoạn để tránh lặp lại không?`
      },
    ],
  },

  // ── 12. Housing estate map (now → future plan) ──
  {
    prompt: 'The maps below show a housing estate as it is now and a plan for developing it in the future. Provide an overview of the information by identifying and describing the key details, and include comparisons where appropriate.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 bản đồ: khu dân cư HIỆN TẠI và bản QUY HOẠCH tương lai. Lưu ý: đây là bản đồ "hiện tại vs tương lai", không phải "quá khứ vs hiện tại" — nên dùng "will be" cho phần tương lai.

Overview nên nói gì? Nhìn toàn bản đồ → có 2 ý lớn:
- Diện tích rừng (woodland) sẽ bị giảm rất mạnh (từ 6000 cây xuống chỉ còn 250 cây) để nhường chỗ cho phát triển.
- Nhiều tiện ích mới sẽ được xây dựng (hồ, sân tennis, vườn hoa) và số lượng nhà sẽ tăng lên (nhà nhỏ hơn nhưng nhiều hơn).

Cấu trúc Overview:
Overall, most of the woodland will be cleared to make way for new development, and a number of new facilities will be built, while the number of houses will increase considerably.`
      },
      {
        title: '2. Body 1 – Thay đổi về cây xanh và nhà ở',
        content: `Nên viết: Woodland (6000 cây → chỉ còn 250 cây, giảm mạnh, chỉ giữ lại ở phía Bắc gần đường chính); Houses (8 nhà 4 phòng ngủ → nhiều nhà nhỏ hơn — 1,2,3 phòng ngủ).

Topic sentence:
The most striking change will be the reduction of woodland, which will be cut down from 6,000 trees to just 250.

Cấu trúc hay (chú ý thì tương lai "will"):
- will be reduced/cut down from X to Y
  The woodland will be reduced from 6,000 trees to only 250.
- will be replaced by
  The large four-bedroom houses will be replaced by a greater number of smaller one-, two-, and three-bedroom houses.
- there will be an increase in
  There will be a significant increase in the total number of houses.`
      },
      {
        title: '3. Body 2 – Tiện ích mới được xây dựng',
        content: `Nên viết: Lake (mới), Tennis courts (mới), Flower garden (mới), Parkland (mới, rải rác quanh khu); Private road → vẫn giữ lại.

Topic sentence:
Several new amenities will also be added, including a lake, tennis courts, and a flower garden.

Cấu trúc hay:
- will be built/added/constructed
  A lake and tennis courts will be built in the northern part of the estate.
- will remain
  The private road will remain in roughly the same position.
- surrounded by
  The flower garden will be surrounded by the newly built houses.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bản đồ hiện tại vs tương lai (plan)"',
        content: `Mỗi đề dạng này chỉ cần làm — LƯU Ý QUAN TRỌNG: luôn dùng "will be" cho bản đồ tương lai/quy hoạch, KHÔNG dùng thì quá khứ như bản đồ "trước/sau" thông thường.
OVERVIEW: thay đổi lớn nhất (thường là giảm diện tích tự nhiên/tăng mật độ xây dựng) + 1 ý về tiện ích mới.
BODY 1: thay đổi về diện tích/nhà ở (số liệu cụ thể nếu có).
BODY 2: các công trình/tiện ích mới sẽ được xây, và những gì được giữ nguyên.

Checklist để đạt 6.5+:
① Có dùng "will be" xuyên suốt cho các thay đổi ở bản đồ tương lai không (lỗi rất hay gặp là dùng sai thì)?
② Có nêu số liệu cụ thể (6000 → 250 cây) không?
③ Có nhắc đến ít nhất 1 điều được GIỮ NGUYÊN (private road) để bài không chỉ toàn liệt kê thay đổi?`
      },
    ],
  },
];

async function runSeed() {
  const WritingTask1 = require('../models/WritingTask1');

  const ops = ANALYSIS.map(a => ({
    updateOne: {
      filter: { prompt: a.prompt },
      update: { $set: { analysisSections: a.analysisSections } },
      upsert: false,
    }
  }));

  const result = await WritingTask1.bulkWrite(ops);
  console.log(`[WritingTask1AnalysisSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS.length})`);
  if (result.matchedCount !== ANALYSIS.length) {
    console.warn('[WritingTask1AnalysisSeed] WARNING: some prompts did not match an existing WritingTask1 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask1AnalysisSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask1AnalysisSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, ANALYSIS };
