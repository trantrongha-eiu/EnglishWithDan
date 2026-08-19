/**
 * Seed script – "Phân tích đề" (analysisSections) for the 22 pre-existing
 * WritingTask1 topics that predate seedWritingTasks2026Q3.js and never got
 * this field. Same band-6.5+ guidance style as
 * seedWritingTask1Analysis2026Q3.js: what to pick for the Overview, how to
 * split Body 1/Body 2, and a reusable formula per chart type. Data verified
 * directly against each topic's actual chart/map/diagram image.
 *
 * Matches existing docs by exact `prompt` text — does NOT upsert.
 *
 * Run: node backend/scripts/seedWritingTask1AnalysisExisting.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const ANALYSIS = [
  // ── 1. Steel production/demand + workers (2 line graphs) ──
  {
    prompt: 'The line graphs below show the production of and demand for steel in million tonnes and the number of workers employed in the steel industry in the UK in 2010.\n\n Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 biểu đồ đường theo THÁNG trong năm 2010: (1) sản lượng thép sản xuất vs nhu cầu thực tế, (2) số công nhân ngành thép.

Overview nên nói gì? Nhìn toàn bộ 2 biểu đồ → có 2 ý lớn:
- Sản lượng LUÔN CAO HƠN nhu cầu hầu hết cả năm, với 2 đỉnh (Feb, Sep) đều khoảng 5000 triệu tấn.
- Cả sản lượng VÀ số công nhân đều GIẢM MẠNH vào 3 tháng cuối năm (Oct-Dec), xuống mức thấp nhất vào Dec.

Cấu trúc Overview:
Overall, steel production consistently exceeded demand for most of the year, reaching two peaks in February and September, while both production and the number of workers fell sharply towards the end of the year, reaching their lowest points in December.`
      },
      {
        title: '2. Body 1 – Sản lượng vs nhu cầu (biểu đồ 1)',
        content: `Nên viết: 2 đỉnh sản lượng (Feb ~5000, Sep ~5000), nhu cầu luôn thấp hơn và ổn định hơn (dao động 1800-3000), khoảng cách lớn nhất giữa 2 đường là lúc sản lượng đạt đỉnh.

Topic sentence:
Steel production fluctuated considerably throughout the year, reaching two peaks of around 5,000 million tonnes in February and September.

Cấu trúc hay (an toàn cho band 6.5):
- exceed / outstrip
  Production consistently exceeded demand for most months of the year.
- reach a peak of
  Production reached a peak of approximately 5,000 million tonnes in both February and September.
- remain relatively stable
  In contrast, demand remained relatively more stable, fluctuating between 1,800 and 3,000 million tonnes.`
      },
      {
        title: '3. Body 2 – Số công nhân (biểu đồ 2) và sự sụt giảm cuối năm',
        content: `Nên viết: công nhân đạt đỉnh Feb (~5500), giảm mạnh xuống ~3000 vào Mar, dao động nhẹ, rồi giảm mạnh Oct-Dec xuống chỉ còn ~1000 — cùng xu hướng giảm với sản lượng cuối năm.

Topic sentence:
The number of workers employed peaked at around 5,500 in February before falling sharply to about 3,000 the following month.

Cấu trúc hay:
- fall sharply / drop dramatically
  The number of workers fell sharply from its February peak.
- decline further, reaching its lowest point
  Both production and the workforce declined further in the last quarter, reaching their lowest points of the year in December.
- mirror this trend
  The number of workers largely mirrored the trend in production over the same period.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2+ biểu đồ đường theo thời gian, có nhiều mốc dao động"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu xu hướng CHUNG lớn nhất (đường nào luôn cao hơn đường kia? có đỉnh/đáy rõ rệt ở đâu?) — KHÔNG cần liệt kê hết từng tháng.
BODY 1: mô tả biểu đồ/đường chính, tập trung vào đỉnh, đáy, khoảng dao động.
BODY 2: mô tả biểu đồ/đường còn lại, đặc biệt nhấn vào đoạn có thay đổi RÕ RỆT NHẤT (thường là đầu hoặc cuối kỳ).

Checklist để đạt 6.5+:
① Overview đã nêu xu hướng tổng thể, không sa vào chi tiết từng tháng chưa?
② Có nêu được ít nhất 1 đỉnh và 1 đáy rõ ràng với số liệu cụ thể không?
③ Có dùng từ so sánh (exceed/outstrip/mirror/in contrast) để nối 2 biểu đồ với nhau không?
④ Không cần mô tả cả 12 tháng — chỉ chọn những tháng có thay đổi đáng kể nhất.`
      },
    ],
  },

  // ── 2. Life expectancy bar chart + table ──
  {
    prompt: 'The bar chart gives information about the life expectancy in Japan, Korea, the United States, and Indonesia, and the table shows the change in life expectancy between 1953 and 2008. \nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Đề có 2 phần: biểu đồ cột (tuổi thọ trung bình của người sinh năm 2018) và bảng (mức tăng tuổi thọ từ 1953-2008), cho 4 nước.

Overview nên nói gì? Đây là dạng "nghịch lý" — nước có tuổi thọ CAO hiện tại lại có mức TĂNG thấp nhất, và ngược lại:
- Japan & USA: tuổi thọ 2018 cao nhất (81, 77) nhưng mức tăng 1953-2008 lại THẤP nhất (+3.5, +3).
- Korea & Indonesia: mức tăng LỚN nhất (+12.5, +15.7) nhưng tuổi thọ 2018 lại thấp hơn/thấp nhất.

Cấu trúc Overview:
Overall, Japan and the USA had the highest life expectancy in 2018 but recorded the smallest increases between 1953 and 2008, whereas Korea and Indonesia saw the largest increases despite having lower life expectancy figures overall.`
      },
      {
        title: '2. Body 1 – Nhóm tuổi thọ cao, tăng ít (Japan, USA)',
        content: `Nên viết: Japan (81 tuổi, tăng +3.5), USA (77 tuổi, tăng +3) — đều đã cao sẵn từ 1953 nên "room to grow" ít.

Topic sentence:
Japan had the highest life expectancy in 2018, at 81 years, yet its figure increased by only 3.5 years between 1953 and 2008, the second-smallest rise of the four countries.

Cấu trúc hay (an toàn cho band 6.5):
- despite having / despite recording
  Despite having the highest life expectancy, Japan recorded one of the smallest increases.
- the smallest/largest increase of
  The USA recorded the smallest increase of all four countries, at just 3 years.`
      },
      {
        title: '3. Body 2 – Nhóm tuổi thọ thấp hơn, tăng nhiều (Korea, Indonesia)',
        content: `Nên viết: Korea (79 tuổi, tăng +12.5), Indonesia (70 tuổi — thấp nhất, tăng +15.7 — cao nhất).

Topic sentence:
By contrast, Indonesia had the lowest life expectancy in 2018, at 70 years, but recorded by far the largest increase, at 15.7 years.

Cấu trúc hay:
- by far the largest/smallest
  Indonesia saw by far the largest increase of the four countries.
- although / even though
  Although Korea's life expectancy in 2018 was slightly lower than Japan's, it increased by 12.5 years, more than three times as much.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột (mức hiện tại) + bảng (mức thay đổi)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm mối quan hệ NGHỊCH giữa mức hiện tại và mức thay đổi (ai cao/thấp hiện tại thì thay đổi ít/nhiều) — đây thường CHÍNH LÀ điểm nổi bật nhất của dạng đề này.
BODY 1: nhóm "mức hiện tại cao, thay đổi ít".
BODY 2: nhóm "mức hiện tại thấp hơn, thay đổi nhiều".

Checklist để đạt 6.5+:
① Overview có nêu được mối quan hệ nghịch (cao/thấp ngược với nhiều/ít) không?
② Mỗi số liệu có đơn vị rõ ràng (tuổi, năm) không?
③ Có dùng despite/although để nối 2 chỉ số trái ngược nhau không?`
      },
    ],
  },

  // ── 3. Waste disposal methods (stacked/grouped bar) ──
  {
    prompt: 'The chart below shows different methods of waste disposal in a European country from 2005 to 2008. \n\nSummarise the information by selecting and reporting the main features and making comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột, 3 phương pháp xử lý rác (Landfill/chôn lấp, Burning/đốt, Dumping at sea/đổ ra biển), 4 năm 2005-2008.

Overview nên nói gì? Có 2 xu hướng ngược chiều nhau rõ rệt:
- Landfill (chôn lấp): GIẢM mạnh liên tục (1800 → 600 triệu tấn).
- Burning (đốt): TĂNG liên tục (500 → 900), vượt qua Landfill để trở thành phương pháp phổ biến nhất vào 2008.
- Dumping at sea: gần như không đổi (~550-600) suốt cả giai đoạn.

Cấu trúc Overview:
Overall, the use of landfill declined dramatically over the period while burning increased steadily, to the point where burning became the most common method of waste disposal by 2008; dumping at sea remained relatively stable throughout.`
      },
      {
        title: '2. Body 1 – Landfill giảm và Burning tăng (2 xu hướng ngược chiều)',
        content: `Nên viết: Landfill 1800(2005)→1200(2006)→900(2007)→600(2008); Burning 500→600→700→900. Hai đường CẮT NHAU vào khoảng 2007-2008.

Topic sentence:
The amount of waste disposed of in landfills fell consistently, from 1,800 million tonnes in 2005 to just 600 million tonnes in 2008.

Cấu trúc hay (an toàn cho band 6.5):
- fall/decline consistently, from X to Y
  Landfill use fell consistently, from 1,800 to 600 million tonnes.
- overtake / surpass
  By 2008, burning had overtaken landfill to become the leading method of waste disposal.
- rise steadily
  In contrast, the amount of waste burned rose steadily throughout the period.`
      },
      {
        title: '3. Body 2 – Dumping at sea (ổn định)',
        content: `Nên viết: dao động rất nhẹ quanh mức 550-600 suốt 4 năm — không có xu hướng tăng/giảm rõ rệt.

Topic sentence:
Dumping waste at sea remained relatively stable throughout the period, fluctuating only slightly between 550 and 600 million tonnes.

Cấu trúc hay:
- remain stable / show little change
  This method showed little change compared with the other two, dropping only marginally by 2008.
- unlike the other two methods
  Unlike the other two methods, dumping at sea did not follow a clear upward or downward trend.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột nhiều năm, các hạng mục thay đổi ngược chiều nhau"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu 2 xu hướng ngược chiều rõ nhất (cái nào tăng, cái nào giảm, cái nào không đổi).
BODY 1: nhóm/hạng mục có xu hướng RÕ RỆT NHẤT (tăng hoặc giảm mạnh nhất) — có thể gộp 2 hạng mục nếu chúng "cắt nhau".
BODY 2: hạng mục còn lại, đặc biệt nếu nó ổn định/không đổi thì nên nhấn mạnh sự tương phản này.

Checklist để đạt 6.5+:
① Overview có nêu rõ xu hướng tăng/giảm/không đổi của từng nhóm không?
② Có nêu số liệu bắt đầu và kết thúc (X → Y) cho ít nhất 2 hạng mục không?
③ Có dùng "overtake/surpass" nếu 2 đường cắt nhau không?`
      },
    ],
  },

  // ── 4. Internet activities 2007 vs 2009 ──
  {
    prompt: 'The chart below shows the percentages of Internet users in different activities in a UK city in 2007 and 2009.\n\nSummarise the information by selecting and reporting the main features and making comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột, 7 hoạt động internet (Shopping, Banking, Music, Job seeking, Games, Learning, TV), so sánh 2007 vs 2009.

Overview nên nói gì? Chia thành 2 nhóm: TĂNG và GIẢM:
- Tăng: Shopping (45%→50%, luôn cao nhất), Job seeking (25%→30%), TV (15%→20%).
- Giảm: Banking (40%→35%), Music (38%→30%), Learning (20%→15%).
- Games: không đổi (20%→20%).

Cấu trúc Overview:
Overall, online shopping remained the most popular internet activity in both years and increased further, while activities such as banking, listening to music, and learning became less popular; job seeking and watching TV online, meanwhile, both grew in popularity.`
      },
      {
        title: '2. Body 1 – Hoạt động tăng (Shopping, Job seeking, TV)',
        content: `Nên viết: Shopping 45%→50% (cao nhất cả 2 năm), Job seeking 25%→30%, TV 15%→20%.

Topic sentence:
Online shopping was the most popular activity in both years, rising from 45% in 2007 to 50% in 2009.

Cấu trúc hay (an toàn cho band 6.5):
- remain the most popular
  Shopping remained the most popular activity, increasing by a further 5 percentage points.
- rise/increase from X% to Y%
  The proportion of users seeking jobs online rose from 25% to 30%.
- likewise
  Likewise, watching TV online became more common, up from 15% to 20%.`
      },
      {
        title: '3. Body 2 – Hoạt động giảm hoặc không đổi (Banking, Music, Learning, Games)',
        content: `Nên viết: Banking 40%→35%, Music 38%→30% (giảm mạnh nhất), Learning 20%→15%, Games không đổi 20%→20%.

Topic sentence:
By contrast, the proportion of users listening to music online fell from 38% to 30%, the largest decline among all seven activities.

Cấu trúc hay:
- fall/decrease from X% to Y%
  The percentage using the internet for banking fell from 40% to 35%.
- the only activity to remain unchanged
  Games was the only activity to remain completely unchanged, at 20% in both years.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "nhiều hạng mục, so sánh 2 mốc thời gian (tăng/giảm/không đổi)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: chia các hạng mục thành 2-3 nhóm (tăng / giảm / không đổi) — nêu hạng mục nổi bật nhất mỗi nhóm.
BODY 1: nhóm TĂNG, dẫn đầu bằng hạng mục có tỉ lệ cao/tăng nhiều nhất.
BODY 2: nhóm GIẢM (và không đổi nếu có), dẫn đầu bằng hạng mục giảm nhiều nhất.

Checklist để đạt 6.5+:
① Overview đã phân nhóm rõ ràng (tăng/giảm) chưa, thay vì liệt kê cả 7 hạng mục?
② Mỗi câu có số liệu % cụ thể của cả 2 năm không?
③ Không cần mô tả TẤT CẢ 7 hạng mục chi tiết như nhau — chỉ chọn 3-4 hạng mục nổi bật nhất.`
      },
    ],
  },

  // ── 5. Houses sold >5M USD, 8 cities ──
  {
    prompt: 'The chart below shows the number of houses sold in 8 cities in the world for more than 5 million US dollars in 2009 and 2014. \n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột ngang, 8 thành phố, số nhà bán > 5 triệu USD, so sánh 2009 vs 2014.

Overview nên nói gì? Nhìn tổng thể → có 2 ý lớn:
- London: CAO NHẤT cả 2 năm VÀ tăng MẠNH NHẤT (550→1650, gấp 3 lần) — vượt xa tất cả các thành phố khác.
- Singapore: DUY NHẤT giảm (100→80), tất cả các thành phố khác đều tăng.

Cấu trúc Overview:
Overall, London recorded by far the highest number of luxury house sales in both years and saw the most dramatic increase of all eight cities, while Singapore was the only city where sales fell over the period.`
      },
      {
        title: '2. Body 1 – London và New York (tăng mạnh nhất, dẫn đầu)',
        content: `Nên viết: London 550→1650 (tăng gần gấp 3, cao nhất mọi lúc), New York 470→800 (đứng thứ 2).

Topic sentence:
London recorded by far the highest number of house sales in both years, rising dramatically from around 550 in 2009 to roughly 1,650 in 2014.

Cấu trúc hay (an toàn cho band 6.5):
- rise dramatically, from X to Y
  Sales in London rose dramatically, from around 550 to approximately 1,650.
- nearly/almost triple
  This figure almost tripled over the five-year period.
- follow a similar upward trend
  New York followed a similar upward trend, though on a smaller scale, rising from 470 to around 800.`
      },
      {
        title: '3. Body 2 – Các thành phố còn lại và trường hợp đặc biệt Singapore',
        content: `Nên viết: Hong Kong, Miami, LA, Sydney, Dubai đều tăng nhẹ-vừa; Singapore GIẢM (100→80) — duy nhất.

Topic sentence:
The remaining cities all saw modest increases, with the exception of Singapore, where the number of houses sold fell slightly, from around 100 to 80.

Cấu trúc hay:
- with the exception of
  All cities recorded an increase, with the exception of Singapore.
- the only city to see a decline
  Singapore was the only city to see a decline in sales over the period.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột ngang nhiều hạng mục, so sánh 2 mốc thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm hạng mục CAO NHẤT/tăng nhiều nhất, VÀ hạng mục có xu hướng KHÁC BIỆT (ví dụ duy nhất giảm trong khi tất cả tăng).
BODY 1: hạng mục dẫn đầu + 1-2 hạng mục tương tự.
BODY 2: các hạng mục còn lại, nhấn vào trường hợp đặc biệt/ngoại lệ nếu có.

Checklist để đạt 6.5+:
① Overview có nêu hạng mục nổi bật nhất VÀ trường hợp ngoại lệ (nếu có) không?
② Không cần liệt kê cả 8 thành phố với số liệu chi tiết như nhau.
③ Có dùng "with the exception of" khi có 1 hạng mục đi ngược xu hướng chung không?`
      },
    ],
  },

  // ── 6. Dept store sales by season ──
  {
    prompt: 'The graph below shows the sales of five types of items in four different seasons at a departmental store in the US in 2011.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột, 5 loại hàng hóa (Women's clothes, Men's clothes, Sports equipment, Cosmetics, Jewellery), 4 mùa (Winter, Spring, Summer, Autumn).

Overview nên nói gì? Có 2 ý lớn:
- Women's clothes: TĂNG LIÊN TỤC qua từng mùa (40k→60k→80k→110k) và luôn cao nhất — nổi bật nhất biểu đồ.
- Jewellery: cũng tăng dần, đạt cao nhất vào Autumn; các mặt hàng còn lại dao động không có xu hướng rõ rệt.

Cấu trúc Overview:
Overall, sales of women's clothing increased consistently across all four seasons and were by far the highest of the five categories, particularly in autumn, while sales of jewellery also rose overall and the remaining categories fluctuated with no clear pattern.`
      },
      {
        title: '2. Body 1 – Women\'s clothes (tăng liên tục, nổi bật nhất)',
        content: `Nên viết: Winter 40k → Spring 60k → Summer 80k → Autumn 110k — tăng đều đặn qua từng mùa.

Topic sentence:
Sales of women's clothing rose consistently throughout the year, from $40,000 in winter to $110,000 in autumn, the highest figure recorded for any item in any season.

Cấu trúc hay (an toàn cho band 6.5):
- increase consistently/steadily
  Sales of women's clothing increased consistently across all four seasons.
- by far the highest
  This was by far the highest figure of any category in any season.
- more than double
  Sales more than doubled between winter and autumn.`
      },
      {
        title: '3. Body 2 – Các mặt hàng còn lại (dao động)',
        content: `Nên viết: Jewellery tăng dần, cao nhất vào Autumn (~50k); Men's clothes, Sports equipment, Cosmetics dao động không rõ xu hướng, đều thấp hơn nhiều so với Women's clothes.

Topic sentence:
Jewellery sales also rose overall, reaching their highest point of around $50,000 in autumn, having been the lowest category in winter.

Cấu trúc hay:
- fluctuate, with no clear trend
  Sales of the remaining three items fluctuated across the seasons, with no clear overall trend.
- remain considerably lower than
  All other categories remained considerably lower than women's clothing throughout the year.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột nhiều hạng mục theo mùa/giai đoạn"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm hạng mục có xu hướng RÕ NHẤT (tăng/giảm đều đặn) — đây thường là điểm chính của Overview.
BODY 1: hạng mục nổi bật nhất, mô tả xu hướng qua từng giai đoạn.
BODY 2: các hạng mục còn lại — nếu chúng dao động không rõ xu hướng, chỉ cần nói vậy, không cần liệt kê từng số liệu.

Checklist để đạt 6.5+:
① Overview có nêu được hạng mục có xu hướng rõ nhất không?
② Có nêu số liệu đầu-cuối (X → Y) cho hạng mục chính không?
③ Không liệt kê chi tiết TẤT CẢ 5 hạng mục × 4 mùa — chỉ tập trung hạng mục nổi bật.`
      },
    ],
  },

  // ── 7 & 15. Time on websites, male vs female (SAME chart, 2 separate docs) ──
  {
    prompt: 'The charts below illustrate the percentage of time that male and female students spend on five different types of websites. \nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 biểu đồ tròn: nam sinh vs nữ sinh, thời gian dành cho 5 loại website (Study, Sport, News, Shopping, Other).

Overview nên nói gì? Tìm 2 khác biệt LỚN NHẤT giữa nam và nữ:
- Study (học tập): cả 2 đều cao nhất, nhưng nữ CAO HƠN nhiều (45% vs 30%).
- Sport (thể thao): khác biệt lớn nhất — nam CAO HƠN NHIỀU (35% vs chỉ 10%).

Cấu trúc Overview:
Overall, both male and female students spent the largest proportion of their time on study websites, although this figure was considerably higher for females; the biggest difference between the two groups was in sport websites, which male students used far more than females.`
      },
      {
        title: '2. Body 1 – Study và Shopping (nữ cao hơn)',
        content: `Nên viết: Study nam 30% / nữ 45% (nữ cao hơn 15 điểm %); Shopping nam 5% / nữ 20% (nữ cao hơn hẳn).

Topic sentence:
Female students spent significantly more time studying online than their male counterparts, at 45% compared with 30%.

Cấu trúc hay (an toàn cho band 6.5):
- spend significantly more time on
  Female students spent significantly more time on study websites than males.
- considerably higher/lower than
  The proportion of time spent shopping online was also considerably higher among females, at 20% compared with just 5% for males.`
      },
      {
        title: '3. Body 2 – Sport và News (nam cao hơn)',
        content: `Nên viết: Sport nam 35% / nữ chỉ 10% (khác biệt LỚN NHẤT toàn biểu đồ); News nam 20% / nữ 15%; Other bằng nhau (10% cả 2).

Topic sentence:
By contrast, male students spent far more time on sports websites than females, at 35% compared with only 10%, the largest difference of all five categories.

Cấu trúc hay:
- by far the largest difference
  This represented by far the largest difference between the two groups.
- identical / the same proportion
  Time spent on other websites was identical for both groups, at 10%.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2 biểu đồ tròn so sánh nam/nữ (hoặc 2 nhóm bất kỳ)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm 2 điểm — (1) hạng mục cao nhất chung cho cả 2 nhóm, (2) hạng mục có khoảng cách CHÊNH LỆCH lớn nhất giữa 2 nhóm.
BODY 1: các hạng mục nhóm A (vd nữ) cao hơn nhóm B.
BODY 2: các hạng mục nhóm B (vd nam) cao hơn nhóm A, kết ở hạng mục bằng nhau (nếu có).

Checklist để đạt 6.5+:
① Overview có nêu khoảng cách CHÊNH LỆCH lớn nhất giữa 2 nhóm không (không chỉ liệt kê số)?
② Mỗi câu so sánh có cả 2 số liệu (nam VÀ nữ) không?
③ Có dùng "considerably/significantly higher than" để nhấn mạnh chênh lệch không?`
      },
    ],
  },
  {
    prompt: 'The chart shows the time Spent by Students on Different Types of Websites',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 biểu đồ tròn: nam sinh vs nữ sinh, thời gian dành cho 5 loại website (Study, Sport, News, Shopping, Other) — cùng dữ liệu với đề "male and female students spend on five different types of websites".

Overview nên nói gì? Tìm 2 khác biệt LỚN NHẤT giữa nam và nữ:
- Study (học tập): cả 2 đều cao nhất, nhưng nữ CAO HƠN nhiều (45% vs 30%).
- Sport (thể thao): khác biệt lớn nhất — nam CAO HƠN NHIỀU (35% vs chỉ 10%).

Cấu trúc Overview:
Overall, both male and female students spent the largest proportion of their time on study websites, although this figure was considerably higher for females; the biggest difference between the two groups was in sport websites, which male students used far more than females.`
      },
      {
        title: '2. Body 1 – Study và Shopping (nữ cao hơn)',
        content: `Nên viết: Study nam 30% / nữ 45% (nữ cao hơn 15 điểm %); Shopping nam 5% / nữ 20% (nữ cao hơn hẳn).

Topic sentence:
Female students spent significantly more time studying online than their male counterparts, at 45% compared with 30%.

Cấu trúc hay (an toàn cho band 6.5):
- spend significantly more time on
  Female students spent significantly more time on study websites than males.
- considerably higher/lower than
  The proportion of time spent shopping online was also considerably higher among females, at 20% compared with just 5% for males.`
      },
      {
        title: '3. Body 2 – Sport và News (nam cao hơn)',
        content: `Nên viết: Sport nam 35% / nữ chỉ 10% (khác biệt LỚN NHẤT toàn biểu đồ); News nam 20% / nữ 15%; Other bằng nhau (10% cả 2).

Topic sentence:
By contrast, male students spent far more time on sports websites than females, at 35% compared with only 10%, the largest difference of all five categories.

Cấu trúc hay:
- by far the largest difference
  This represented by far the largest difference between the two groups.
- identical / the same proportion
  Time spent on other websites was identical for both groups, at 10%.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "2 biểu đồ tròn so sánh nam/nữ (hoặc 2 nhóm bất kỳ)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm 2 điểm — (1) hạng mục cao nhất chung cho cả 2 nhóm, (2) hạng mục có khoảng cách CHÊNH LỆCH lớn nhất giữa 2 nhóm.
BODY 1: các hạng mục nhóm A (vd nữ) cao hơn nhóm B.
BODY 2: các hạng mục nhóm B (vd nam) cao hơn nhóm A, kết ở hạng mục bằng nhau (nếu có).

Checklist để đạt 6.5+:
① Overview có nêu khoảng cách CHÊNH LỆCH lớn nhất giữa 2 nhóm không (không chỉ liệt kê số)?
② Mỗi câu so sánh có cả 2 số liệu (nam VÀ nữ) không?
③ Có dùng "considerably/significantly higher than" để nhấn mạnh chênh lệch không?`
      },
    ],
  },

  // ── 8. Youngsville map ──
  {
    prompt: 'The maps below show changes that took place in Youngsville in New\nNew Zealand over 5 years from 2005 to 2010.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `2 bản đồ thị trấn Youngsville, 2005 vs 2010.

Overview nên nói gì? Nhìn toàn bản đồ → có 2 ý lớn:
- Đường sắt bỏ hoang (disused railway) được KHÔI PHỤC thành đường sắt hoạt động, kèm 1 ga tàu MỚI.
- Nông trại (Farm) bị thay bằng sân golf (Golf course); có thêm nhiều công trình mới: bệnh viện, bãi đỗ xe, nhà kho.

Cấu trúc Overview:
Overall, the most significant change was the reopening of the disused railway line, which now has its own station, while the farm was replaced by a golf course; several new facilities, including a hospital and a car park, were also added.`
      },
      {
        title: '2. Body 1 – Đường sắt và khu vực phía Bắc/Đông',
        content: `Nên viết: Disused Railway (2005) → Railway hoạt động + Railway Station (2010); Farm (2005) → Golf course (2010); Bus stop dời vị trí gần sân golf hơn.

Topic sentence:
The most notable change was to the disused railway line, which was reopened and equipped with a new railway station by 2010.

Cấu trúc hay (an toàn cho band 6.5):
- be replaced by
  The farm in the north-east was replaced by a golf course.
- be reopened / brought back into use
  The previously disused railway was reopened and put back into use.`
      },
      {
        title: '3. Body 2 – Khu vực còn lại (Port, Hotel, các công trình mới)',
        content: `Nên viết: Factory, Port, Hotel, Restaurant, Church, Filling station giữ nguyên vị trí; thêm mới: Warehouse (gần Port), Hospital, Car park.

Topic sentence:
Several new facilities were added near the town centre, including a hospital, a car park, and a warehouse close to the port.

Cấu trúc hay:
- remain unchanged / stay in the same position
  The factory, hotel, and church all remained unchanged in their original positions.
- be newly built / be constructed
  A hospital and a car park were newly built close to the hotel and restaurant.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bản đồ thị trấn, 2 mốc thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu thay đổi LỚN NHẤT (công trình biến mất/thay thế) + 1 nhóm thay đổi khác.
BODY 1: khu vực có thay đổi NHIỀU nhất, theo thứ tự removed → replaced by → added.
BODY 2: khu vực còn lại — nêu công trình KHÔNG đổi trước, rồi công trình MỚI thêm vào.

Checklist để đạt 6.5+:
① Overview có nêu thay đổi lớn nhất (không phải liệt kê hết) không?
② Có dùng "replaced by" cho công trình bị thay thế không?
③ Có nêu được công trình nào GIỮ NGUYÊN vị trí để đối chiếu không?`
      },
    ],
  },

  // ── 9. Milk production process ──
  {
    prompt: 'The diagram shows the process of milk production',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Sơ đồ quy trình sản xuất sữa, 6 bước, dạng THẲNG (linear — không quay vòng lại điểm đầu).

Overview nên nói gì? Nêu điểm bắt đầu, điểm kết thúc, và số bước chính:
Bò được chăn thả → vắt sữa → trữ lạnh → xe bồn chở tới nhà máy sữa → chế biến (sữa/phô mai/kem/bơ) → đóng gói, giao tới siêu thị.

Cấu trúc Overview:
Overall, the process consists of six main stages, beginning with cows grazing and ending with the packaged products being delivered to supermarkets and shops.`
      },
      {
        title: '2. Body 1 – Từ chăn thả đến vận chuyển (3 bước đầu)',
        content: `Nên viết: cows grazing → milking machine (twice a day) → refrigeration storage → milk tanker chở tới Dairy hàng ngày.

Topic sentence:
The process begins with cows grazing in the fields before being milked twice a day using a milking machine.

Cấu trúc hay (an toàn cho band 6.5):
- begin with / start with
  The process begins with cows grazing in open fields.
- be transported to / be delivered to
  The milk is then stored in refrigeration tanks before being transported to the dairy by tanker each day.`
      },
      {
        title: '3. Body 2 – Chế biến tại nhà máy và đóng gói (3 bước cuối)',
        content: `Nên viết: tại Dairy, sữa được chế biến thành cheese/cream/butter HOẶC được tiệt trùng và đóng gói (pasteurized and packaged), rồi giao tới siêu thị/cửa hàng.

Topic sentence:
At the dairy, the milk is either processed into cheese, cream, and butter, or pasteurised and packaged for sale.

Cấu trúc hay:
- either... or...
  The milk is either turned into other dairy products or pasteurised for direct sale.
- finally / in the final stage
  Finally, the packaged milk is delivered to supermarkets and shops.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "quy trình sản xuất, dạng thẳng (linear)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu số bước + điểm bắt đầu + điểm kết thúc (KHÔNG cần liệt kê hết các bước ở đây).
BODY 1: nửa đầu quy trình, dùng "begin with... then... after that...".
BODY 2: nửa sau quy trình, kết bằng "finally...".

Checklist để đạt 6.5+:
① Overview có nêu rõ điểm ĐẦU và điểm CUỐI của quy trình không?
② Có dùng passive voice cho hầu hết các bước không (vì đây là quy trình bị tác động, không phải chủ động làm)?
③ Có dùng từ nối trình tự (first, then, after that, finally) đầy đủ không?`
      },
    ],
  },

  // ── 10. Salmon life cycle ──
  {
    prompt: 'The diagram below shows the life cycle of the salmon. \nSummarise the information by selecting and reporting the main features and making comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Sơ đồ vòng đời cá hồi, 7 giai đoạn, dạng VÒNG TRÒN (cyclical — quay lại điểm đầu).

Overview nên nói gì? Nêu đây là 1 vòng đời khép kín, từ trứng đến trưởng thành rồi lại đẻ trứng:
Trứng (hatch ~3 tháng) → Alevin → Fry (5-10 tuần) → Parr (vài tháng) → Smolt (1-3 năm) → Adult (1-6 năm ở biển) → Spawning Adult (đẻ trứng rồi chết trong 2 tuần) → quay lại thành trứng.

Cấu trúc Overview:
Overall, the salmon life cycle consists of seven stages and is cyclical in nature, beginning with eggs in fresh water and ending with the spawning adult, which lays new eggs before dying.`
      },
      {
        title: '2. Body 1 – Từ trứng đến cá con trưởng thành (4 giai đoạn đầu)',
        content: `Nên viết: Eggs (nở sau ~3 tháng) → Alevin (sống nhờ túi noãn hoàng vài tuần) → Fry (5-10 tuần tuổi, bắt đầu bơi) → Parr (vài tháng tuổi, có vằn "ngón tay").

Topic sentence:
The life cycle begins when eggs hatch in fresh water after approximately three months, producing alevins that feed off their yolk sac for several weeks.

Cấu trúc hay (an toàn cho band 6.5):
- hatch after / take approximately
  The eggs hatch after around three months.
- develop into / grow into
  The alevin then develops into a fry, which is five to ten weeks old.`
      },
      {
        title: '3. Body 2 – Từ cá ra biển đến khi đẻ trứng, khép vòng (3 giai đoạn cuối)',
        content: `Nên viết: Smolt (1-3 năm tuổi, ra biển theo đàn) → Adult (1-6 năm ở biển) → Spawning Adult (đẻ trứng rồi chết trong vòng 2 tuần) → quay lại thành trứng, khép vòng đời.

Topic sentence:
Once they reach the smolt stage, at one to three years old, the salmon group together and head out to sea, where they remain as adults for between one and six years.

Cấu trúc hay:
- spend + thời gian + V-ing
  Adult salmon spend one to six years living at sea.
- the cycle then repeats / the process begins again
  After spawning and dying within two weeks, the cycle then repeats as new eggs are laid.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "vòng đời sinh vật (life cycle, dạng vòng tròn)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu số giai đoạn + tính chất VÒNG TRÒN (bắt đầu và kết thúc nối lại với nhau) — khác quy trình thẳng.
BODY 1: nửa đầu vòng đời (từ trứng/non đến gần trưởng thành).
BODY 2: nửa sau (trưởng thành → sinh sản → quay lại điểm đầu) — PHẢI nói rõ nó khép vòng.

Checklist để đạt 6.5+:
① Overview có nói rõ đây là quy trình VÒNG TRÒN (cyclical), không phải thẳng không?
② Có nêu được thời gian/tuổi của từng giai đoạn không?
③ Câu cuối Body 2 có nhắc lại việc vòng đời "lặp lại" không?`
      },
    ],
  },

  // ── 11. UK housing preferences survey ──
  {
    prompt: 'The following chart show the results of a British survey taken in 2009 related to Housing preferences of UK people.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột, 3 thành phố (Liverpool, London, Manchester), 4 loại nhà ở (Apartments, Terraced, Detached, Semi-detached), năm 2009.

Overview nên nói gì? Liverpool nổi bật khác hẳn 2 thành phố kia:
- Liverpool: thích Apartments NHẤT (58% — cao nhất toàn biểu đồ) nhưng lại THẤP NHẤT ở cả 3 loại nhà còn lại.
- London & Manchester: đều thích Semi-detached houses nhất (37% cả 2).

Cấu trúc Overview:
Overall, Liverpool residents showed a strong preference for apartments, unlike those in London and Manchester, where semi-detached houses were the most popular choice; Liverpool had the lowest preference for every other type of housing.`
      },
      {
        title: '2. Body 1 – Liverpool (thích Apartments, thấp nhất các loại khác)',
        content: `Nên viết: Apartments 58% (cao nhất toàn biểu đồ), nhưng Terraced 9%, Detached 15%, Semi-detached 18% — đều thấp nhất trong 3 thành phố.

Topic sentence:
Liverpool stood out for its strong preference for apartments, which were chosen by 58% of respondents, by far the highest figure on the chart.

Cấu trúc hay (an toàn cho band 6.5):
- stand out for
  Liverpool stood out for its clear preference for apartment living.
- prefer X to Y
  Liverpool residents clearly preferred apartments to any other type of housing.`
      },
      {
        title: '3. Body 2 – London và Manchester (thích Semi-detached & Detached)',
        content: `Nên viết: Semi-detached London 37% / Manchester 37% (cao nhất ở cả 2 TP); Manchester cũng thích Detached houses cao (35%, cao nhất toàn biểu đồ ở mục này).

Topic sentence:
By contrast, semi-detached houses were the most popular option in both London and Manchester, each recorded at 37%.

Cấu trúc hay:
- the most popular option
  Semi-detached houses were the most popular option among London and Manchester residents alike.
- also show a preference for
  Manchester residents also showed a strong preference for detached houses, at 35%, the highest figure for this category.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ cột 3 nhóm × 4 hạng mục"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm nhóm có xu hướng KHÁC BIỆT rõ nhất so với các nhóm còn lại (ở đây là Liverpool).
BODY 1: nhóm khác biệt (Liverpool) — nêu điểm cao nhất VÀ điểm thấp nhất của nhóm đó.
BODY 2: các nhóm còn lại (London, Manchester) — nêu điểm chung giữa chúng.

Checklist để đạt 6.5+:
① Overview có nêu rõ nhóm nào khác biệt so với các nhóm còn lại không?
② Có so sánh CHÉO giữa các thành phố (không chỉ liệt kê từng TP riêng lẻ) không?
③ Không cần liệt kê hết 3 TP × 4 loại nhà = 12 số liệu — chỉ chọn số nổi bật nhất.`
      },
    ],
  },

  // ── 12. Population 65+ (USA, Sweden, Japan) ──
  {
    prompt: 'The graph below shows the proportion of the population aged 65 and over\nbetween 1940 and 2040 in three different countries.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ đường, 3 nước (USA, Sweden, Japan), tỉ lệ dân số từ 65 tuổi trở lên, 1940-2040 (có dự đoán tương lai).

Overview nên nói gì? Nhật Bản có sự thay đổi kịch tính nhất — đảo ngược hoàn toàn vị trí:
- Japan: THẤP NHẤT trong phần lớn giai đoạn (chỉ 3% suốt 1960-1980) nhưng dự kiến CAO NHẤT vào 2040 (27%) — vượt qua cả USA và Sweden.
- USA & Sweden: tăng đều đặn, ổn định hơn nhiều so với Japan.

Cấu trúc Overview:
Overall, Japan experienced the most dramatic change, starting with by far the lowest proportion of elderly people but being projected to have the highest by 2040, overtaking both the USA and Sweden, which increased more gradually throughout the period.`
      },
      {
        title: '2. Body 1 – USA và Sweden (tăng đều, ổn định)',
        content: `Nên viết: USA 9%(1940)→10%(1960)→15%(1980)→14%(2000)→16%(2020)→23%(2040); Sweden 7%→9%→14%→14%→20%→25% — cả 2 tăng dần đều, không có biến động đột ngột.

Topic sentence:
Both the USA and Sweden saw a gradual increase in the proportion of elderly people throughout the period, from around 9% and 7% respectively in 1940 to a projected 23% and 25% by 2040.

Cấu trúc hay (an toàn cho band 6.5):
- increase gradually
  Both countries saw their figures increase gradually and steadily throughout the period.
- be projected to reach
  Sweden's proportion is projected to reach 25% by 2040.`
      },
      {
        title: '3. Body 2 – Japan (thay đổi kịch tính nhất)',
        content: `Nên viết: Japan giữ mức thấp nhất (3%) suốt 1960-1980, sau đó tăng vọt từ khoảng 2020 (10%) lên 27% vào 2040 — vượt cả USA và Sweden.

Topic sentence:
Japan, by contrast, had by far the lowest proportion of elderly people for most of the period, remaining at just 3% between 1960 and 1980, before rising sharply to a projected 27% by 2040.

Cấu trúc hay:
- rise sharply / increase dramatically
  Japan's figure is projected to rise sharply after 2020.
- overtake
  By 2040, Japan is expected to overtake both the USA and Sweden.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ đường có số liệu dự đoán tương lai (projected)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm nước/đường có thay đổi KỊCH TÍNH nhất (đặc biệt nếu nó đảo ngược vị trí từ thấp nhất → cao nhất hoặc ngược lại).
BODY 1: các nước có xu hướng ỔN ĐỊNH, tăng/giảm đều.
BODY 2: nước có thay đổi kịch tính nhất — nhấn mạnh sự khác biệt giữa giai đoạn đầu và cuối.

Checklist để đạt 6.5+:
① Có dùng "is/are projected to" cho các số liệu ở tương lai (sau năm hiện tại) không, thay vì thì quá khứ?
② Overview có nêu được sự đảo ngược vị trí (nếu có) không?
③ Có dùng "overtake" khi 1 đường vượt qua đường khác không?`
      },
    ],
  },

  // ── 13. Honey bee life cycle ──
  {
    prompt: 'The diagram below shows the life cycle of the honey bee.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Sơ đồ vòng đời ong mật, 6 giai đoạn, dạng VÒNG TRÒN, tổng thời gian 34-36 ngày.

Overview nên nói gì? Nêu tổng thời gian vòng đời + điểm bắt đầu/kết thúc khép vòng:
Ong cái đẻ trứng (1-2 trứng/3 ngày) → trứng nở sau 9-10 ngày → lột xác lần 1 (5 ngày) → lột xác lần 2 (7 ngày) → ong non trưởng thành xuất hiện (9 ngày) → trưởng thành hoàn toàn (4 ngày) → quay lại đẻ trứng.

Cấu trúc Overview:
Overall, the life cycle of the honey bee consists of six stages and takes between 34 and 36 days to complete, beginning with eggs being laid and ending with a mature adult that is ready to lay eggs itself.`
      },
      {
        title: '2. Body 1 – Từ trứng đến lột xác lần 2 (nửa đầu vòng đời)',
        content: `Nên viết: trứng nở sau 9-10 ngày → lột xác lần 1, mất 5 ngày → lột xác lần 2, mất 7 ngày.

Topic sentence:
The cycle begins when female bees lay one or two eggs every three days, which hatch after nine to ten days.

Cấu trúc hay (an toàn cho band 6.5):
- hatch after
  The eggs hatch after nine to ten days.
- undergo + danh từ
  The larva then undergoes its first moulting, a process that takes five days.`
      },
      {
        title: '3. Body 2 – Từ ong non đến trưởng thành, khép vòng (nửa sau)',
        content: `Nên viết: sau lột xác lần 2 (7 ngày), ong non trưởng thành xuất hiện sau 9 ngày, rồi mất thêm 4 ngày để trưởng thành hoàn toàn — sau đó bắt đầu đẻ trứng, khép vòng đời (34-36 ngày).

Topic sentence:
After the second moulting, which takes seven days, a young adult bee emerges after a further nine days.

Cấu trúc hay:
- emerge after
  A young adult bee emerges after nine days.
- the entire cycle takes / the process then repeats
  The entire cycle takes between 34 and 36 days, after which the process repeats as the mature bee begins laying its own eggs.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "vòng đời côn trùng, có ghi rõ tổng thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu TỔNG thời gian vòng đời (nếu đề cho) + số giai đoạn + tính chất khép vòng.
BODY 1: nửa đầu vòng đời, có số ngày cụ thể mỗi bước.
BODY 2: nửa sau, kết bằng câu nhắc lại tổng thời gian và việc vòng đời lặp lại.

Checklist để đạt 6.5+:
① Overview có nêu TỔNG số ngày (34-36 ngày) không — đây là chi tiết hay bị bỏ sót?
② Mỗi giai đoạn có nêu số ngày cụ thể không?
③ Câu cuối có nhắc lại việc vòng đời khép lại (repeat) không?`
      },
    ],
  },

  // ── 14. Carbonated drinks process ──
  {
    prompt: 'The diagram below shows how bottled and canned carbonated drinks are made',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Sơ đồ quy trình sản xuất nước ngọt có ga, 5 giai đoạn được đánh số rõ ràng, dạng THẲNG.

Overview nên nói gì? Nêu số giai đoạn + điểm bắt đầu/kết thúc:
Làm sạch nước → gia nhiệt/bay hơi và tạo ga → pha trộn (màu, siro, hương liệu) → lọc và đóng chai/lon → đóng gói, giao đến siêu thị.

Cấu trúc Overview:
Overall, the production of carbonated drinks involves five main stages, beginning with the cleaning of raw water and ending with the packaged products being delivered to supermarkets.`
      },
      {
        title: '2. Body 1 – Làm sạch nước và tạo ga (giai đoạn 1-2)',
        content: `Nên viết: raw water → filter → water softener + chemicals → pump → electric heaters (qua cooling pipe) → thêm carbon dioxide để tạo ga.

Topic sentence:
In the first stage, raw water is cleaned by passing it through a filter, a water softener, and various chemicals, before being pumped towards the heating stage.

Cấu trúc hay (an toàn cho band 6.5):
- be passed through / be cleaned by
  The raw water is cleaned by being passed through a filter and a water softener.
- be added to
  Carbon dioxide is then added to the water to create carbonation.`
      },
      {
        title: '3. Body 2 – Pha trộn, đóng chai/lon và đóng gói (giai đoạn 3-5)',
        content: `Nên viết: mixing tank trộn với colouring/syrup/flavour → lọc rồi đóng vào chai HOẶC lon → đóng thùng, chuyển tới siêu thị bằng xe tải.

Topic sentence:
The carbonated water is then mixed with colouring, syrup, and flavouring in a mixing tank, before being filtered and filled into either bottles or cans.

Cấu trúc hay:
- either... or...
  The drinks are filled into either bottles or cans.
- finally / in the last stage
  In the final stage, the packaged drinks are transported by truck to supermarkets.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "quy trình sản xuất công nghiệp, có đánh số giai đoạn rõ ràng"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu số giai đoạn (theo đúng số đề đã đánh, ví dụ "five stages") + điểm bắt đầu/kết thúc.
BODY 1: giai đoạn 1 → nửa quy trình.
BODY 2: nửa quy trình còn lại, kết ở giai đoạn cuối cùng.

Checklist để đạt 6.5+:
① Overview có nêu ĐÚNG số giai đoạn như trong sơ đồ (vd "five stages") không?
② Có dùng passive voice cho hầu hết các bước không?
③ Có dùng "either...or..." nếu quy trình rẽ thành 2 nhánh (như chai/lon) không?`
      },
    ],
  },

  // ── 16. School library floor plan ──
  {
    prompt: 'School library 5 years ago and the same library now',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Sơ đồ mặt bằng thư viện trường học, 5 năm trước vs hiện tại.

Overview nên nói gì? Nhìn tổng thể → có 2 ý lớn:
- Các phòng CHỨC NĂNG CHUNG bị thay bằng phòng CHUYÊN BIỆT: Classroom → Recording studio; Library office → Conference room.
- Khu vực học tập/laptop cho học sinh được MỞ RỘNG đáng kể (nhiều bàn học riêng hơn, thêm bàn laptop).

Cấu trúc Overview:
Overall, the library has been reorganised with several general-purpose rooms replaced by more specialised facilities, such as a recording studio and a conference room, while the space for student study and laptop use has been significantly expanded.`
      },
      {
        title: '2. Body 1 – Các phòng bị thay thế',
        content: `Nên viết: Classroom (5 năm trước) → Recording studio (hiện tại); Library office → Conference room; Borrowing and returning desk (gộp) → tách thành Borrowing và Returning riêng biệt.

Topic sentence:
Several rooms have been repurposed: the classroom has been converted into a recording studio, while the library office has become a conference room.

Cấu trúc hay (an toàn cho band 6.5):
- be converted into / be replaced by
  The classroom has been converted into a recording studio.
- be split into
  The borrowing and returning desk has been split into two separate desks.`
      },
      {
        title: '3. Body 2 – Khu vực học tập được mở rộng',
        content: `Nên viết: bàn học (studying tables) tăng số lượng và trở thành "private"; bàn laptop cho sinh viên (desks for students' laptops) xuất hiện ở CẢ 2 vị trí (bên phải VÀ hàng dưới) thay vì chỉ 1 khu "desk for computers" như trước; 1 dãy kệ sách (book shelves) ở giữa bị bỏ.

Topic sentence:
The area for student study has been considerably expanded, with more private studying tables and additional desks for students' laptops.

Cấu trúc hay:
- be expanded / be increased
  The number of study tables has been increased, and they are now described as private.
- be removed
  One row of book shelves in the middle of the room has been removed.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "sơ đồ mặt bằng (floor plan), 2 mốc thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu nhóm phòng bị THAY ĐỔI CHỨC NĂNG lớn nhất + xu hướng chung (mở rộng/thu hẹp khu vực nào).
BODY 1: các phòng bị đổi tên/chức năng (A → B).
BODY 2: khu vực được mở rộng hoặc thu hẹp, có thể kèm chi tiết bị xóa/thêm.

Checklist để đạt 6.5+:
① Overview có nêu xu hướng chung (chuyên biệt hóa / mở rộng khu vực nào) chứ không chỉ liệt kê từng phòng?
② Có dùng "be converted into / be replaced by / be split into" cho các phòng đổi chức năng không?
③ Có nêu được ít nhất 1 chi tiết KHÔNG đổi (vị trí kệ sách chính) để đối chiếu không?`
      },
    ],
  },

  // ── 17. Cinema attendance ──
  {
    prompt: 'The graphs below show the cinema attendants in Australia and the average cinema visits by different age groups from 1996 to 2000. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Đề có 2 phần: bảng (tỉ lệ dân số đi xem phim % và tần suất trung bình lượt xem/năm) và biểu đồ đường (lượt xem theo 4 nhóm tuổi), 1996-2000.

Overview nên nói gì? Có 2 ý lớn, khá tinh tế:
- Tỉ lệ dân số ĐI XEM PHIM tăng rồi ổn định ở mức cao (62%→72%), nhưng TẦN SUẤT mỗi người đi lại GIẢM (10.3→8.3 lượt/năm) — nghĩa là nhiều người đi xem hơn nhưng mỗi người đi ÍT LẦN hơn.
- Ở TẤT CẢ nhóm tuổi, số lượt xem đều theo cùng 1 khuôn mẫu dao động (tăng-giảm-tăng-giảm); nhóm 14-24 LUÔN xem nhiều nhất, nhóm 50+ LUÔN xem ít nhất.

Cấu trúc Overview:
Overall, while the overall percentage of the population attending the cinema rose and then levelled off, the average number of visits per person actually declined; across all age groups, cinema attendance followed the same fluctuating pattern, with the youngest group consistently visiting most often and the oldest group least.`
      },
      {
        title: '2. Body 1 – Tỉ lệ dân số vs tần suất (bảng)',
        content: `Nên viết: Attendance 62%(1996)→72%(1997)→giữ ổn định quanh 70-72% tới 2000; Frequency 10.3(1996)→11.1(1997, đỉnh)→giảm còn ~8.2-8.3 từ 1998-2000.

Topic sentence:
The proportion of the population attending the cinema rose sharply from 62% in 1996 to 72% in 1997, before remaining relatively stable for the rest of the period.

Cấu trúc hay (an toàn cho band 6.5):
- rise sharply, then level off / remain stable
  Attendance rose sharply and then levelled off at around 70-72%.
- decline / fall, despite + N
  The average frequency of visits declined, despite the rise in overall attendance.`
      },
      {
        title: '3. Body 2 – Các nhóm tuổi (biểu đồ đường)',
        content: `Nên viết: cả 4 nhóm tuổi đều tăng tới đỉnh 1997, giảm 1998, tăng lại tới đỉnh 1999, rồi giảm 2000 — cùng 1 khuôn mẫu; nhóm 14-24 luôn cao nhất, nhóm 50+ luôn thấp nhất trong suốt giai đoạn.

Topic sentence:
Across all four age groups, the number of cinema visits followed an identical fluctuating pattern, rising to a peak in 1997, falling in 1998, and rising again to a second peak in 1999.

Cấu trúc hay:
- follow the same/an identical pattern
  All four age groups followed the same fluctuating pattern over the period.
- consistently the highest/lowest
  The 14-24 age group consistently recorded the highest number of visits, while the 50+ group recorded the lowest.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "bảng + biểu đồ đường nhiều nhóm cùng khuôn mẫu"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: (1) so sánh 2 chỉ số trong bảng xem có đi NGƯỢC chiều nhau không (ở đây: attendance tăng nhưng frequency giảm); (2) nêu khuôn mẫu CHUNG của các đường trong biểu đồ + thứ hạng cố định (nhóm nào luôn cao/thấp nhất).
BODY 1: mô tả 2 chỉ số trong bảng.
BODY 2: mô tả khuôn mẫu chung của biểu đồ đường, không cần tách riêng từng nhóm tuổi.

Checklist để đạt 6.5+:
① Overview có phát hiện được nghịch lý "attendance tăng nhưng frequency giảm" không — đây là điểm hay nhất của đề này?
② Có dùng "the same/identical pattern" khi nhiều đường có hình dạng giống nhau không?
③ Có nêu thứ hạng CỐ ĐỊNH (luôn cao nhất/thấp nhất) thay vì mô tả từng điểm dữ liệu không?`
      },
    ],
  },

  // ── 18. Australia population by nationality (city vs countryside) ──
  {
    prompt: 'The table and pie chart gives information about the population in Australia according to different nationalities and areas.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ tròn (tỉ lệ dân số theo quốc tịch) + bảng (% sống ở thành phố vs nông thôn theo quốc tịch).

Overview nên nói gì? Có 2 ý lớn:
- Người Úc chiếm áp đảo dân số (73%) — cao hơn nhiều so với các quốc tịch khác cộng lại.
- TẤT CẢ các quốc tịch đều sống chủ yếu ở THÀNH PHỐ; người Trung Quốc có tỉ lệ sống ở thành phố CAO NHẤT (99%), người Hà Lan THẤP NHẤT nhưng vẫn đa số (83%).

Cấu trúc Overview:
Overall, Australians made up by far the largest proportion of the population, and the vast majority of every nationality group lived in cities rather than the countryside, with Chinese residents showing the strongest concentration in urban areas.`
      },
      {
        title: '2. Body 1 – Cơ cấu dân số theo quốc tịch (biểu đồ tròn)',
        content: `Nên viết: Australian 73% (áp đảo), British 7%, New Zealander 3%, Chinese 2%, Dutch 1%, Other 14%.

Topic sentence:
Australians made up the vast majority of the population, at 73%, considerably more than all the other nationalities combined.

Cấu trúc hay (an toàn cho band 6.5):
- make up + %
  Australians made up 73% of the total population.
- considerably more than
  This was considerably more than the combined total of British, New Zealander, Chinese, and Dutch residents.`
      },
      {
        title: '3. Body 2 – Thành phố vs nông thôn (bảng)',
        content: `Nên viết: tất cả 5 quốc tịch đều sống chủ yếu ở thành phố (80-99%); Chinese cao nhất (99% thành phố / 1% nông thôn); Dutch có tỉ lệ sống nông thôn cao nhất trong nhóm (17%), dù thành phố vẫn chiếm đa số (83%).

Topic sentence:
Every nationality group lived predominantly in cities, ranging from 80% of Australians to as much as 99% of the Chinese population.

Cấu trúc hay:
- range from X% to Y%
  The proportion living in cities ranged from 80% to 99% across the five nationalities.
- have the highest/lowest proportion of
  The Chinese had the highest proportion of city-dwellers, while the Dutch had the lowest, though still a clear majority.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ tròn + bảng, cùng chủ đề dân số/nhóm"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: nêu hạng mục chiếm ưu thế nhất ở biểu đồ tròn + xu hướng CHUNG của cả bảng (ở đây: ai cũng sống ở thành phố là chính).
BODY 1: mô tả biểu đồ tròn (cơ cấu).
BODY 2: mô tả bảng, dùng "range from X% to Y%" để tóm gọn thay vì liệt kê hết 5 dòng.

Checklist để đạt 6.5+:
① Overview có nêu được xu hướng CHUNG của bảng (không phải liệt kê từng nước) không?
② Có dùng "range from...to..." để gộp số liệu thay vì liệt kê hết không?
③ Có nêu rõ đơn vị % ở mọi câu so sánh không?`
      },
    ],
  },

  // ── 19. Water use and cost (5 countries) ──
  {
    prompt: 'The table and chart below show the domestic water use and cost in 5 countries.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ cột (lượng nước dùng, lít) + bảng (giá nước, USD/m³), 5 nước (US, Canada, Italy, France, Germany).

Overview nên nói gì? Đây là dạng "quan hệ nghịch" — nước dùng NHIỀU nước lại trả giá THẤP, và ngược lại:
- US: dùng NHIỀU nước nhất (360L) nhưng giá RẺ nhất (chỉ $0.01/m³).
- France: dùng ÍT nước hơn (250L, đứng thứ 4) nhưng giá CAO nhất ($2.1/m³).

Cấu trúc Overview:
Overall, there appeared to be an inverse relationship between water usage and cost: the USA used the most water but paid by far the least for it, while France, despite relatively low usage, paid the highest price of all five countries.`
      },
      {
        title: '2. Body 1 – Lượng nước sử dụng (biểu đồ cột)',
        content: `Nên viết: US 360L (cao nhất) > Canada 330L > Italy 300L > France 250L > Germany 210L (thấp nhất).

Topic sentence:
The USA recorded the highest level of domestic water use, at 360 litres, followed by Canada and Italy, at 330 and 300 litres respectively.

Cấu trúc hay (an toàn cho band 6.5):
- record the highest/lowest level of
  The USA recorded the highest level of water use of the five countries.
- followed by
  This was followed by Canada and Italy, at 330 and 300 litres respectively.`
      },
      {
        title: '3. Body 2 – Giá nước (bảng) và mối quan hệ nghịch',
        content: `Nên viết: US $0.01 (rẻ nhất dù dùng nhiều nhất), Canada $0.31, Italy $0.7, Germany $1.35, France $2.1 (đắt nhất dù dùng ít thứ 4).

Topic sentence:
Despite using the most water, the USA paid by far the lowest price, at just $0.01 per cubic metre, whereas France paid the highest price, at $2.1, despite using comparatively little water.

Cấu trúc hay:
- despite + V-ing/N
  Despite using the most water, the USA paid the lowest price.
- pay X times as much as
  France paid over 200 times as much as the USA for its water.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ + bảng, có mối quan hệ nghịch giữa 2 chỉ số"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm ngay mối quan hệ NGHỊCH giữa 2 chỉ số (nước nào cao ở chỉ số này thì thấp ở chỉ số kia) — đây LUÔN là trọng tâm của dạng đề này.
BODY 1: mô tả chỉ số thứ nhất (lượng dùng) theo thứ tự cao→thấp.
BODY 2: mô tả chỉ số thứ hai (giá), nhấn mạnh vào 2 nước có sự "nghịch lý" rõ nhất (dùng nhiều/giá rẻ và dùng ít/giá đắt).

Checklist để đạt 6.5+:
① Overview có nêu được mối quan hệ NGHỊCH ngay từ đầu không — đây là yêu cầu bắt buộc để đạt điểm cao ở dạng đề này?
② Có dùng "despite" để nối 2 chỉ số trái ngược của CÙNG một nước không?
③ Đơn vị (lít, USD/m³) có được nêu rõ ràng, nhất quán không?`
      },
    ],
  },

  // ── 20. Fish and meat consumption ──
  {
    prompt: 'The graph below shows the consumption of fish and different kinds of\nmeat in a European country between 1979 and 2004.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ đường, 4 loại thực phẩm (Chicken, Beef, Lamb, Fish), gram/người/tuần, 1979-2004.

Overview nên nói gì? Có 2 ý lớn:
- Chicken TĂNG liên tục và trở thành loại được tiêu thụ nhiều NHẤT vào 2004, vượt qua Beef (vốn dẫn đầu từ đầu).
- Fish luôn ở mức THẤP NHẤT và gần như KHÔNG ĐỔI suốt cả giai đoạn.

Cấu trúc Overview:
Overall, chicken consumption rose steadily to become the most consumed type of meat by 2004, overtaking beef, which had led at the start of the period; fish consumption, meanwhile, remained consistently the lowest and changed very little throughout.`
      },
      {
        title: '2. Body 1 – Chicken (tăng, vượt lên dẫn đầu) và Beef (giảm dần)',
        content: `Nên viết: Chicken khởi đầu thấp hơn Beef (~150g năm 1979) nhưng tăng dần đều, vượt Beef vào khoảng cuối giai đoạn để dẫn đầu (~250g năm 2004); Beef khởi đầu cao nhất (~220g) nhưng nhìn chung giảm/dao động mạnh qua các năm.

Topic sentence:
Chicken consumption rose steadily throughout the period, overtaking beef to become the most widely consumed meat by 2004.

Cấu trúc hay (an toàn cho band 6.5):
- rise steadily / increase gradually
  Chicken consumption rose steadily over the 25-year period.
- overtake
  Chicken eventually overtook beef, which had led at the start of the period.`
      },
      {
        title: '3. Body 2 – Lamb (giảm) và Fish (ổn định, thấp nhất)',
        content: `Nên viết: Lamb giảm từ ~140g xuống dao động thấp hơn nhiều (~55-100g) qua giai đoạn; Fish luôn thấp nhất và ổn định nhất, chỉ dao động nhẹ quanh 40-60g suốt 25 năm.

Topic sentence:
Fish consumption remained the lowest of the four categories throughout the period, fluctuating only slightly between 40 and 60 grams per week.

Cấu trúc hay:
- remain the lowest / change very little
  Fish consumption changed very little, remaining the lowest of the four categories.
- decline overall, despite some fluctuation
  Lamb consumption declined overall, despite some fluctuation from year to year.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ đường nhiều hạng mục, thời gian dài (>20 năm)"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm đường có xu hướng RÕ NHẤT (tăng mạnh/vượt lên) + đường ỔN ĐỊNH nhất — không cần nêu hết 4 đường.
BODY 1: 2 đường có biến động/giao nhau (thường là đường tăng vượt lên và đường từng dẫn đầu).
BODY 2: 2 đường còn lại, đặc biệt nhấn vào đường ổn định nhất nếu có.

Checklist để đạt 6.5+:
① Overview có nêu được sự "vượt lên" (overtake) nếu 2 đường giao nhau không?
② Với giai đoạn dài (20+ năm), có tránh liệt kê từng năm mà chỉ nêu xu hướng tổng thể không?
③ Có dùng "remain the lowest/highest throughout" cho đường ổn định không?`
      },
    ],
  },

  // ── 21. Fast food consumption UK ──
  {
    prompt: 'The graph shows changes in the amount of fast food consumed in the UK between 1970 and 1990',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `Biểu đồ đường, 3 loại đồ ăn nhanh (Hamburger, Fish & Chips, Pizza), gram, 1970-1990.

Overview nên nói gì? Có 2 ý lớn, khá thú vị vì Fish & Chips và Pizza gần như ĐỔI VỊ TRÍ cho nhau:
- Fish & Chips: tăng KỊCH TÍNH nhất, từ mức thấp (75g) lên CAO NHẤT (500g) vào 1990.
- Pizza: ban đầu CAO NHẤT (310g) nhưng giảm dần rồi ổn định ở mức thấp hơn nhiều (~220g).

Cấu trúc Overview:
Overall, fish and chips saw by far the most dramatic increase, becoming the most consumed fast food by 1990 despite starting from a relatively low level, while pizza, initially the most popular option, declined before levelling off.`
      },
      {
        title: '2. Body 1 – Fish & Chips (tăng kịch tính nhất)',
        content: `Nên viết: 75g(1970)→100g(1975)→150g(1980)→300g(1985)→500g(1990) — tăng liên tục và ngày càng nhanh (accelerating), vượt xa 2 loại còn lại vào cuối giai đoạn.

Topic sentence:
Consumption of fish and chips rose dramatically throughout the period, from just 75 grams in 1970 to 500 grams in 1990, the highest figure of the three foods by a wide margin.

Cấu trúc hay (an toàn cho band 6.5):
- rise dramatically, from X to Y
  Consumption rose dramatically, from 75 to 500 grams.
- by a wide margin
  By 1990, fish and chips consumption exceeded that of the other two foods by a wide margin.`
      },
      {
        title: '3. Body 2 – Pizza (giảm rồi ổn định) và Hamburger (tăng đều)',
        content: `Nên viết: Pizza 310g(1970, cao nhất)→220g(1980)→200g(1985)→220g(1990, ổn định lại); Hamburger tăng đều từ mức thấp nhất (40g) lên gần bằng Pizza vào cuối kỳ (~280g).

Topic sentence:
Pizza consumption, by contrast, was the highest of the three foods in 1970, at 310 grams, but declined steadily before levelling off at around 200-220 grams from 1980 onwards.

Cấu trúc hay:
- decline steadily, before levelling off
  Pizza consumption declined steadily before levelling off in the final decade.
- rise steadily throughout, ending close to
  Hamburger consumption rose steadily throughout the period, ending close to pizza's level by 1990.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "biểu đồ đường, các đường gần như đổi vị trí cho nhau"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm đường có thay đổi kịch tính nhất (thường từ thấp→cao hoặc cao→thấp) + đường ban đầu dẫn đầu nhưng bị vượt qua.
BODY 1: đường tăng kịch tính nhất, mô tả có số liệu đầu-cuối rõ ràng.
BODY 2: 2 đường còn lại — đường giảm/ổn định, và đường tăng đều còn lại.

Checklist để đạt 6.5+:
① Overview có nêu được sự đảo ngược vị trí (đường nào từ dẫn đầu bị vượt qua) không?
② Có nêu số liệu đầu kỳ VÀ cuối kỳ cho đường chính không?
③ Có dùng "level off" khi 1 đường giảm rồi ổn định lại không?`
      },
    ],
  },

  // ── 22. School spending pie charts (1981/1991/2001) ──
  {
    prompt: 'The three pie charts below show the changes in annual spending by a particular UK school in 1981, 1991 and 2001. \n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    analysisSections: [
      {
        title: '1. Phân tích nhanh đề này',
        content: `3 biểu đồ tròn, chi tiêu hàng năm của 1 trường học ở Anh, 1981/1991/2001, 5 hạng mục.

Overview nên nói gì? Có 2 ý lớn:
- Teachers' salaries (lương giáo viên) LUÔN là khoản chi lớn nhất cả 3 năm (40%→50%→45%).
- Furniture and equipment (nội thất/thiết bị) có biến động MẠNH NHẤT — giảm sốc rồi tăng vọt lại (15%→5%→23%).

Cấu trúc Overview:
Overall, teachers' salaries remained the largest area of spending throughout all three years, while spending on furniture and equipment fluctuated the most dramatically, falling sharply before rebounding to become the second-largest category by 2001.`
      },
      {
        title: '2. Body 1 – Teachers\' salaries (luôn lớn nhất) và Insurance (tăng đều)',
        content: `Nên viết: Teachers' salaries 40%(1981)→50%(1991, đỉnh)→45%(2001) — luôn lớn nhất; Insurance tăng đều 2%→3%→8% dù vẫn luôn là khoản nhỏ nhất.

Topic sentence:
Teachers' salaries were the largest area of spending in all three years, rising from 40% in 1981 to a peak of 50% in 1991, before falling slightly to 45% in 2001.

Cấu trúc hay (an toàn cho band 6.5):
- remain the largest category throughout
  Teachers' salaries remained the largest category of spending throughout the period.
- rise steadily, despite remaining the smallest
  Spending on insurance rose steadily, despite remaining the smallest category throughout.`
      },
      {
        title: '3. Body 2 – Furniture and equipment (biến động mạnh) và các khoản còn lại',
        content: `Nên viết: Furniture and equipment 15%(1981)→5%(1991, giảm sốc)→23%(2001, tăng vọt, thành khoản lớn thứ 2); Other workers' salaries và Resources đều giảm dần qua 3 năm.

Topic sentence:
Spending on furniture and equipment fluctuated considerably, falling sharply from 15% in 1981 to just 5% in 1991, before rebounding to 23% in 2001, the second-largest category that year.

Cấu trúc hay:
- fluctuate considerably
  Furniture and equipment spending fluctuated considerably over the 20-year period.
- fall sharply, before rebounding to
  It fell sharply in 1991 before rebounding to become the second-largest category by 2001.`
      },
      {
        title: '4. Công thức áp dụng cho dạng "3 biểu đồ tròn, 3 mốc thời gian"',
        content: `Mỗi đề dạng này chỉ cần làm:
OVERVIEW: tìm hạng mục ỔN ĐỊNH lớn nhất (luôn đứng đầu) + hạng mục biến động MẠNH nhất qua 3 mốc.
BODY 1: hạng mục ổn định/luôn lớn nhất + 1 hạng mục phụ tăng đều.
BODY 2: hạng mục biến động mạnh nhất, mô tả đủ cả 3 mốc thời gian (không chỉ đầu-cuối) vì đây là điểm đáng chú ý.

Checklist để đạt 6.5+:
① Với 3 mốc thời gian (không phải 2), Overview có chọn đúng 2 hạng mục đáng chú ý nhất thay vì cố nói hết 5 hạng mục không?
② Hạng mục biến động mạnh có được mô tả với ĐỦ 3 số liệu (1981/1991/2001) không?
③ Có dùng "fall sharply, before rebounding to" cho hạng mục có hình chữ V không?`
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
  console.log(`[WritingTask1AnalysisExistingSeed] matched ${result.matchedCount}, modified ${result.modifiedCount} (expected ${ANALYSIS.length})`);
  if (result.matchedCount !== ANALYSIS.length) {
    console.warn('[WritingTask1AnalysisExistingSeed] WARNING: some prompts did not match an existing WritingTask1 doc — check for text drift.');
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => runSeed())
    .then(() => { console.log('[WritingTask1AnalysisExistingSeed] Done'); mongoose.disconnect(); })
    .catch(err => { console.error('[WritingTask1AnalysisExistingSeed] Failed:', err); process.exit(1); });
}

module.exports = { runSeed, ANALYSIS };
