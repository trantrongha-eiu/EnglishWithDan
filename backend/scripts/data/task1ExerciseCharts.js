'use strict';
/**
 * Illustrations for the old "Task 1 Grammar" bank (Task1Exercise) — one
 * `chart` spec per exercise, drawn in the browser by
 * frontend/js/shared/t1-chart.js. Keyed "<module>-<orderIndex>" (unique per
 * module; orderIndex alone repeats across modules).
 *
 * Where the exercise itself gives the figures, the chart uses exactly those.
 * Where it doesn't (paraphrase / introduction prompts, "doubled", "3 times"…)
 * the figures are invented to fit the sentence and the chart says so in
 * `note`, so nobody quotes them as real statistics.
 *
 * Applied by scripts/setTask1ExerciseCharts.js.
 */

const DEMO = 'Số liệu minh họa — chỉ để hình dung câu mô tả.';
const PROMPT = 'Hình minh họa đề bài — số liệu chỉ mang tính minh họa.';
const PART = 'Số đầu và cuối lấy từ đề bài; các điểm ở giữa là minh họa.';

const stat = (icon, value, label, title) => ({ kind: 'stat', title, items: [{ icon, value, label }] });
const share = (title, a, aVal, b, note) => ({
  kind: 'pie', title, pies: [{ caption: '', slices: [{ label: a, value: aVal }, { label: b, value: 100 - aVal }] }], note,
});

// Fish & meat (European country, 1979–2004) — used by 3 exercises.
const FISH_MEAT = {
  kind: 'line', title: 'Consumption of fish and meat in a European country, 1979–2004',
  unit: 'grams / person / week',
  labels: ['1979', '1984', '1989', '1994', '1999', '2004'],
  series: [
    { name: 'Beef', values: [220, 205, 195, 180, 160, 150] },
    { name: 'Lamb', values: [150, 130, 110, 90, 70, 60] },
    { name: 'Chicken', values: [150, 145, 170, 200, 230, 250] },
    { name: 'Fish', values: [60, 55, 55, 52, 50, 50] },
  ],
  note: PROMPT,
};

const UK_ECONOMY = {
  kind: 'bar', title: 'Contribution of three sectors to the UK economy, 1901–2000',
  unit: '% of GDP', labels: ['1901', '1951', '2000'],
  series: [
    { name: 'Agriculture', values: [25, 10, 2] },
    { name: 'Manufacturing', values: [35, 40, 15] },
    { name: 'Business & Financial', values: [20, 30, 45] },
  ],
  note: PROMPT,
};

const SPORTS_GENDER = {
  kind: 'bar', title: 'Participation by young people in sports, Great Britain 1999',
  unit: '%', labels: ['Swimming', 'Cycling', 'Football', 'Tennis'],
  series: [
    { name: 'Boys', values: [55, 50, 60, 25] },
    { name: 'Girls', values: [60, 38, 15, 24] },
  ],
  note: PROMPT,
};

const AUS_WATER = {
  kind: 'bar', title: 'Water used for agriculture in Australia, 2015',
  unit: 'thousand GL', labels: ['NSW', 'VIC', 'QLD', 'SA', 'WA'],
  series: [{ name: '', values: [4.0, 3.0, 2.5, 1.2, 0.5] }],
  note: PROMPT,
};

const COASTAL_TOURISTS = {
  kind: 'line', title: 'Tourists visiting coastal cities, 2000–2010',
  unit: 'million', labels: ['2000', '2002', '2004', '2006', '2008', '2010'],
  series: [
    { name: 'Da Nang', values: [0.8, 1.0, 1.3, 1.7, 2.2, 3.0] },
    { name: 'Nha Trang', values: [1.2, 1.4, 1.5, 1.8, 2.0, 2.4] },
    { name: 'Vung Tau', values: [1.5, 1.5, 1.6, 1.6, 1.7, 1.8] },
  ],
  note: PROMPT,
};

const CAR_SALES_ASIA = {
  kind: 'line', title: 'Car sales in Asia, 2015–2020', unit: 'million cars',
  labels: ['2015', '2016', '2017', '2018', '2019', '2020'],
  series: [{ name: 'Car sales', values: [38, 41, 43, 42, 40, 36] }],
  note: PROMPT,
};

const EDU_SPENDING = {
  kind: 'bar', title: 'Money spent on education in five countries, 2018',
  unit: '$ billion', labels: ['USA', 'Japan', 'Germany', 'UK', 'France'],
  series: [{ name: '', values: [700, 160, 140, 120, 110] }],
  note: PROMPT,
};

const STUDENTS_8_10 = {
  kind: 'bar', title: 'Number of students, 2003 and 2005', unit: 'students',
  labels: ['2003', '2005'], series: [{ name: '', values: [8000, 10000] }],
};

const WIND = {
  kind: 'line', title: 'Wind energy production, 2000–2020', unit: 'GW',
  labels: ['2000', '2005', '2010', '2015', '2020'],
  series: [{ name: 'Wind energy', values: [10, 25, 60, 120, 200], callouts: [0, 4] }],
  note: PART,
};

const THAILAND = {
  kind: 'line', title: 'Tourists visiting Thailand, 2000–2019', unit: 'million',
  labels: ['2000', '2005', '2010', '2015', '2019'],
  series: [{ name: 'Tourists', values: [20, 25, 30, 35, 40], callouts: [0, 4] }],
  note: PART,
};

const SOLAR_INSTALLS = {
  kind: 'line', title: 'Solar panel installations, 2010–2020', unit: 'units',
  labels: ['2010', '2012', '2014', '2016', '2018', '2020'],
  series: [{ name: 'Installations', values: [5000, 12000, 25000, 40000, 60000, 80000], callouts: [0, 5] }],
  note: PART,
};

module.exports = {
  // ─── MODULE 1 ─────────────────────────────────────────────────────────
  '1-1': stat('👥', '5 million', 'Internet users in Vietnam (2003)', 'Đếm được: người dùng'),
  '1-2': stat('💧', '5 million m³', 'Water used (2010)', 'Không đếm được: nước'),
  '1-3': share('Internet users in Vietnam (% of total population)', 'Internet users', 20, 'Non-users'),
  '1-4': stat('🏍️', '20 million', 'Motorbike users in Vietnam', 'Đếm được: người dùng'),
  '1-5': stat('🎓', '2.5 million', 'University students in the UK (2010)'),
  '1-6': share('Australian population using public transport, 2018', 'Public transport users', 38, 'Others'),
  '1-7': stat('🚲', '≈ 1.2 billion', 'People using bicycles worldwide (2015)'),
  '1-8': share('UK population using the Internet, 1990', 'Internet users', 55, 'Non-users'),
  '1-9': stat('☕', '$5 billion', "Brazil's coffee exports (2005)"),
  '1-10': { kind: 'bar', title: 'Spending on education, 2019', unit: '$ billion', labels: ['UK', 'France'], series: [{ name: '', values: [50, 30] }] },
  '1-11': { kind: 'bar', title: 'Car users vs bus users', unit: 'million', labels: ['Car users', 'Bus users'], series: [{ name: '', values: [10, 25] }] },
  '1-12': { kind: 'pie', title: 'University students by gender', pies: [{ slices: [{ label: 'Male', value: 55 }, { label: 'Female', value: 45 }] }] },
  '1-13': { kind: 'bar', title: 'Smartphone users vs tablet users', unit: 'million', labels: ['Smartphone users', 'Tablet users'], series: [{ name: '', values: [60, 20] }], note: 'Tỉ lệ 3 : 1 — ' + DEMO },
  '1-20': { kind: 'bar', title: 'Electricity produced from coal and natural gas, 2020', unit: 'TWh', labels: ['Coal', 'Natural gas'], series: [{ name: '', values: [400, 250] }] },
  '1-21': { kind: 'bar', title: 'Proportion of Internet users by region, 2015', unit: '%', labels: ['North America', 'Europe', 'Asia'], series: [{ name: '', values: [35, 30, 25] }] },
  '1-22': { kind: 'bar', title: 'Water consumption by sector', unit: '% of total', labels: ['Agriculture', 'Industry'], series: [{ name: '', values: [70, 20] }], note: DEMO },
  '1-23': { kind: 'bar', title: 'Tourists visiting France', unit: 'million', labels: ['2018', '2019'], series: [{ name: '', values: [70, 90] }], note: DEMO },
  '1-24': {
    kind: 'line', title: 'CO₂ emissions, developed vs developing countries', unit: 'billion tonnes',
    labels: ['1990', '2000', '2010', '2020'],
    series: [{ name: 'Developed', values: [15, 14, 13, 12] }, { name: 'Developing', values: [7, 10, 15, 20] }], note: DEMO,
  },
  '1-25': { kind: 'pie', title: 'Urban transport users by mode', pies: [{ slices: [{ label: 'Cars', value: 50 }, { label: 'Buses', value: 15 }, { label: 'Other modes', value: 35 }] }] },
  '1-26': {
    kind: 'line', title: 'Employment by sector', unit: '% of workforce', labels: ['1990', '2000', '2010', '2020'],
    series: [{ name: 'Agriculture', values: [40, 33, 26, 20], callouts: [3] }, { name: 'Services', values: [40, 47, 54, 60], callouts: [3] }], note: PART,
  },
  '1-27': {
    kind: 'line', title: 'Life expectancy by gender', unit: 'years', yMin: 60, labels: ['1980', '1990', '2000', '2010', '2020'],
    series: [{ name: 'Women', values: [76, 77.5, 79, 80.5, 82], callouts: [4] }, { name: 'Men', values: [74, 74, 74, 74, 74], callouts: [4] }], note: PART,
  },
  '1-28': { kind: 'bar', title: 'Electricity from solar energy', unit: 'TWh', labels: ['2015', '2020'], series: [{ name: '', values: [50, 100] }], note: 'Gấp đôi (×2) — ' + DEMO },
  '1-29': { kind: 'bar', title: 'Museum visitors, 2022', unit: 'million', labels: ['History museum', 'Art museum'], series: [{ name: '', values: [2, 1] }], note: 'Gấp đôi (×2) — ' + DEMO },
  '1-30': { kind: 'bar', title: 'GDP growth rate, 2019', unit: '%', labels: ['Vietnam', 'Thailand'], series: [{ name: '', values: [7, 5] }] },
  '1-31': { kind: 'bar', title: 'Literacy rate', unit: '%', labels: ['Rural areas', 'Urban areas'], series: [{ name: '', values: [72, 95] }] },
  '1-32': { kind: 'pie', title: 'Energy sources', pies: [{ slices: [{ label: 'Fossil fuels', value: 40 }, { label: 'Solar', value: 25 }, { label: 'Wind', value: 20 }, { label: 'Hydro', value: 15 }] }], note: 'Fossil fuels 40% và Solar 25% lấy từ đề; Wind/Hydro là minh họa.' },
  '1-33': { kind: 'pie', title: 'Causes of water pollution', pies: [{ slices: [{ label: 'Agriculture', value: 45 }, { label: 'Industrial waste', value: 30 }, { label: 'Urban runoff', value: 15 }, { label: 'Other', value: 10 }] }] },
  '1-37': stat('🏭', '500 tonnes', 'CO₂ emitted by factories (2010)', 'Không đếm được: khí CO₂'),
  '1-38': share('Students enrolled in university', 'Enrolled', 45, 'Not enrolled'),
  '1-39': { kind: 'bar', title: 'Electricity consumed in Germany', unit: 'TWh', labels: ['2000', '2020'], series: [{ name: '', values: [300, 600] }], note: 'Gấp đôi (doubled) — ' + DEMO },
  '1-40': stat('🗼', '38 million', 'Tourists visiting Paris (2019)'),
  '1-41': share('UK workers using public transport, 2015', 'Public transport', 60, 'Other ways'),
  '1-42': stat('🎓', '2.5 million', 'University students in the UK (2010)'),
  '1-43': share('Australian population using public transport, 2018', 'Public transport users', 38, 'Others'),
  '1-44': share("Japan's electricity by source, 2020", 'Renewable energy', 20, 'Other sources'),
  '1-45': stat('🚲', '≈ 1.2 billion', 'People using bicycles worldwide (2015)'),
  '1-46': stat('☕', '$5 billion', "Brazil's coffee exports (2005)"),
  '1-47': share("UK's GDP by sector, 2000", 'Service sector', 72, 'Other sectors'),
  '1-48': { kind: 'bar', title: 'Spending on education', unit: '$ billion', labels: ['UK', 'France'], series: [{ name: '', values: [50, 30] }] },
  '1-49': { kind: 'bar', title: 'Car users vs bus users', unit: 'million', labels: ['Car users', 'Bus users'], series: [{ name: '', values: [10, 25] }] },
  '1-50': { kind: 'pie', title: 'University students by gender', pies: [{ slices: [{ label: 'Male', value: 55 }, { label: 'Female', value: 45 }] }] },
  '1-51': { kind: 'bar', title: 'Smartphone users vs tablet users', unit: 'million', labels: ['Smartphone users', 'Tablet users'], series: [{ name: '', values: [60, 20] }], note: 'Tỉ lệ 3 : 1 — ' + DEMO },
  '1-52': {
    kind: 'line', title: "China's urban and rural population", unit: '% of population', labels: ['2000', '2005', '2010', '2015', '2020'],
    series: [{ name: 'Urban', values: [36, 43, 50, 56, 60], callouts: [4] }, { name: 'Rural', values: [64, 57, 50, 44, 40], callouts: [4] }], note: PART,
  },
  '1-53': { kind: 'bar', title: 'Steel production (same year)', unit: 'million tonnes', labels: ['Germany', 'France'], series: [{ name: '', values: [80, 40] }] },
  '1-82': { kind: 'bar', title: 'Tourism revenue, 2019', unit: '$ billion', labels: ['Spain', 'Germany'], series: [{ name: '', values: [80, 42] }], note: DEMO },
  '1-84': { kind: 'bar', title: 'Military spending, 2010', unit: '$ billion', labels: ['USA', 'China'], series: [{ name: '', values: [690, 240] }] },

  // ─── MODULE 2: TREND LANGUAGE ─────────────────────────────────────────
  '2-14': { kind: 'line', title: 'Number of students, 2003–2006', unit: 'students', labels: ['2003', '2004', '2005', '2006'], series: [{ name: 'Students', values: [6000, 6200, 9000, 9200] }], note: DEMO },
  '2-15': STUDENTS_8_10,
  '2-16': STUDENTS_8_10,
  '2-17': WIND,
  '2-18': THAILAND,
  '2-19': { kind: 'line', title: 'The figure over six years', labels: ['2014', '2015', '2016', '2017', '2018', '2019', '2020'], series: [{ name: 'Figure', values: [500, 900, 2000, 4500, 7000, 10000, 12000], callouts: [0, 6] }], note: PART },
  '2-20': { kind: 'line', title: 'Monthly sales', unit: 'units', labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], series: [{ name: 'Sales', values: [30000, 38000, 45000, 40000, 36000], callouts: [2] }], note: DEMO },
  '2-21': {
    kind: 'line', title: 'Average US property prices, 1990–2010', unit: '$', labels: ['1990', '1994', '1998', '2002', '2006', '2008', '2010'],
    series: [{ name: 'Price', values: [130000, 150000, 175000, 230000, 298000, 240000, 175000], callouts: [4, 6] }], note: PART,
  },
  '2-22': { kind: 'line', title: 'The figure, 1990–2000', unit: '%', labels: ['1990', '1995', '2000'], series: [{ name: 'Figure', values: [60, 52, 45], callouts: [0, 2] }], note: DEMO },
  '2-23': { kind: 'line', title: 'Solar panel installations', unit: 'units', labels: ['2010', '2012', '2014', '2016', '2018', '2020', '2022'], series: [{ name: 'Installations', values: [5000, 12000, 25000, 40000, 60000, 80000, 72000], callouts: [5] }], note: DEMO },
  '2-24': {
    kind: 'line', title: 'Unemployment rate in Vietnam, 2007–2010', unit: '%', yMax: 14,
    labels: ['2007', 'mid-07', '2008', 'mid-08', '2009', 'mid-09', '2010'],
    series: [{ name: 'Unemployment', values: [9, 12, 8, 11, 8.5, 12, 10] }], note: DEMO,
  },
  '2-25': { kind: 'line', title: 'Electric vehicles sold in Europe, 2015–2022', unit: 'million', labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'], series: [{ name: 'EV sales', values: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }], note: DEMO },
  '2-26': { kind: 'bar', title: 'Research investment, 2002–2007', unit: '$ million', labels: ['2002', '2003', '2004', '2005', '2006', '2007'], series: [{ name: '', values: [50, 52, 51, 35, 34, 36] }], note: DEMO },
  '2-27': { kind: 'pie', title: 'Energy production by source, 2050 (forecast)', pies: [{ slices: [{ label: 'Gas', value: 40 }, { label: 'Renewables', value: 35 }, { label: 'Nuclear', value: 15 }, { label: 'Coal', value: 10 }] }], note: 'Gas 40% lấy từ đề; các nguồn còn lại là minh họa.' },
  '2-28': { kind: 'line', title: 'Clean water consumed in Paris (forecast)', unit: 'm³', labels: ['2030', '2035', '2040', '2045', '2050'], forecastFrom: 0, series: [{ name: 'Water', values: [1200, 1500, 1900, 2400, 3000], callouts: [0, 4] }], note: PART },
  '2-54': { kind: 'line', title: 'Number of coal mines, 1980–2000', unit: 'mines', labels: ['1980', '1985', '1990', '1995', '2000'], series: [{ name: 'Coal mines', values: [220, 180, 120, 70, 40] }], note: DEMO },
  '2-55': { kind: 'line', title: 'Oil prices, 2012–2016', unit: '$ per barrel', labels: ['2012', '2013', '2014', '2015', '2016'], series: [{ name: 'Oil price', values: [110, 105, 95, 50, 30], callouts: [4] }], note: DEMO },
  '2-56': { kind: 'line', title: 'Average house prices over a decade', unit: '$ thousand', yMin: 150, labels: ['2010', '2012', '2014', '2016', '2018', '2020'], series: [{ name: 'House price', values: [200, 204, 210, 216, 223, 230], callouts: [0, 5] }], note: '200 → 230 = +15% — ' + DEMO },
  '2-57': { kind: 'line', title: 'Internet usage', unit: '% of population', labels: ['2005', '2007', '2009', '2011', '2013', '2015', '2017', '2019', '2021'], series: [{ name: 'Internet usage', values: [30, 38, 47, 56, 64, 70, 70, 71, 70] }], note: DEMO },
  '2-58': WIND,
  '2-59': THAILAND,
  '2-60': { kind: 'line', title: 'Birth rate in Japan, 2010–2019', unit: '%', yMax: 2, labels: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019'], series: [{ name: 'Birth rate', values: [1.21, 1.19, 1.2, 1.2, 1.21, 1.2, 1.19, 1.2, 1.21, 1.2] }], note: DEMO },
  '2-61': { kind: 'line', title: 'Global smartphone sales', unit: 'billion units', labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'], series: [{ name: 'Sales', values: [1.0, 1.25, 1.42, 1.47, 1.5, 1.45, 1.4, 1.3], callouts: [4] }], note: DEMO },
  '2-62': { kind: 'line', title: 'US property prices, 2005–2010', unit: '$', labels: ['2005', '2006', '2007', '2008', '2009', '2010'], series: [{ name: 'Price', values: [270000, 295000, 300000, 180000, 175000, 178000], callouts: [2, 3] }], note: PART },
  '2-63': SOLAR_INSTALLS,
  '2-64': { kind: 'line', title: "World population (projection after 2020)", unit: 'billion', labels: ['2000', '2010', '2020', '2030', '2040', '2050'], forecastFrom: 2, series: [{ name: 'Population', values: [6.1, 6.9, 7.8, 8.6, 9.3, 10], callouts: [5] }], note: DEMO },
  '2-65': { kind: 'line', title: 'Unemployment rate, 2005–2015', unit: '%', yMax: 10, labels: ['2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'], series: [{ name: 'Unemployment', values: [6, 9, 5, 8, 5.5, 9, 6.5, 7, 6, 6, 6] }], note: DEMO },
  '2-66': { kind: 'bar', title: 'Sales, January vs February', unit: 'units', labels: ['Jan', 'Feb'], series: [{ name: '', values: [10000, 10200] }] },
  '2-80': { kind: 'line', title: 'Price of oil in the 2000s', unit: '$ per barrel', yMax: 100, labels: ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009'], series: [{ name: 'Oil price', values: [45, 70, 40, 78, 50, 80, 42, 75, 60, 48] }], note: DEMO },
  '2-81': { kind: 'pie', title: 'Share of transport use', pies: [{ slices: [{ label: 'Private transport', value: 45 }, { label: 'Bus', value: 30 }, { label: 'Tram', value: 25 }] }] },
  '2-85': { kind: 'line', title: 'Number of smokers in the UK, 1990–2015', unit: 'million', labels: ['1990', '1995', '2000', '2005', '2010', '2015'], series: [{ name: 'Smokers', values: [14, 12.5, 11, 9.5, 8, 8.6] }], note: DEMO },

  // ─── MODULE 3: PARAPHRASE / INTRODUCTION (the prompt's chart) ─────────
  '3-29': FISH_MEAT,
  '3-30': { kind: 'bar', title: 'Tourists visiting three countries', unit: 'million', labels: ['France', 'Spain', 'Italy'], series: [{ name: '', values: [90, 84, 65] }], note: PROMPT },
  '3-31': UK_ECONOMY,
  '3-32': { kind: 'bar', title: 'Average number of daily commuters by mode', unit: 'million', labels: ['Car', 'Bus', 'Train'], series: [{ name: '', values: [18, 8, 5] }], note: PROMPT },
  '3-33': {
    kind: 'table', title: 'Proportion of families living in poverty, Australia 1999',
    head: ['Family type', '% in poverty'],
    rows: [['Single aged person', '6%'], ['Aged couple', '4%'], ['Single, no children', '19%'], ['Couple, no children', '7%'], ['Sole parent', '21%'], ['Couple with children', '12%']],
    note: PROMPT,
  },
  '3-67': { kind: 'bar', title: 'Overseas students in five English-speaking countries, 2012', unit: 'thousand', labels: ['USA', 'UK', 'Australia', 'Canada', 'New Zealand'], series: [{ name: '', values: [740, 430, 250, 120, 40] }], note: PROMPT },
  '3-68': { kind: 'line', title: 'Energy consumption, 2000–2020', unit: 'Mtoe', labels: ['2000', '2005', '2010', '2015', '2020'], series: [{ name: 'Energy consumption', values: [100, 110, 125, 135, 150] }], note: PROMPT },
  '3-69': {
    kind: 'process', title: 'How solar panels produce electricity for home use',
    steps: [
      { icon: '☀️', label: 'Sunlight hits the panels' },
      { icon: '🔲', label: 'Cells produce DC electricity' },
      { icon: '🔌', label: 'Inverter converts DC to AC' },
      { icon: '🏠', label: 'Electricity powers the home' },
      { icon: '⚡', label: 'Surplus goes to the grid' },
    ],
  },
  '3-70': {
    kind: 'table', title: 'Percentage of the population using the Internet',
    head: ['Country', '2000', '2010'],
    rows: [['Canada', '51%', '80%'], ['UK', '27%', '85%'], ['USA', '43%', '74%'], ['Japan', '30%', '78%'], ['Brazil', '3%', '41%'], ['Mexico', '5%', '31%']],
    note: PROMPT,
  },
  '3-71': { kind: 'pie', title: 'Main reasons for working abroad, 2019', pies: [{ slices: [{ label: 'Higher salary', value: 40 }, { label: 'Career development', value: 25 }, { label: 'New culture', value: 20 }, { label: 'Family reasons', value: 15 }] }], note: PROMPT },
  '3-72': {
    kind: 'pie', title: 'Electricity generated in Germany and France, 2009',
    pies: [
      { caption: 'Germany', slices: [{ label: 'Fossil fuels', value: 60 }, { label: 'Nuclear', value: 23 }, { label: 'Renewables', value: 17 }] },
      { caption: 'France', slices: [{ label: 'Fossil fuels', value: 10 }, { label: 'Nuclear', value: 76 }, { label: 'Renewables', value: 14 }] },
    ],
    note: PROMPT,
  },
  '3-73': { kind: 'line', title: 'Money spent on fast food in Britain, 1970–1990', unit: '£ million', labels: ['1970', '1975', '1980', '1985', '1990'], series: [{ name: 'Spending', values: [100, 180, 260, 350, 450] }], note: PROMPT },
  '3-83': {
    kind: 'bar', title: 'Population of three Asian cities, 1990–2020', unit: 'million', labels: ['1990', '2000', '2010', '2020'],
    series: [{ name: 'Bangkok', values: [5.9, 6.4, 8.3, 10.5] }, { name: 'Jakarta', values: [8.2, 8.4, 9.6, 10.6] }, { name: 'Hanoi', values: [2.0, 2.7, 6.5, 8.2] }],
    note: PROMPT,
  },
  '3-87': AUS_WATER,
  '3-88': COASTAL_TOURISTS,
  '3-89': {
    kind: 'table', title: 'Cars produced in different countries, 2020',
    head: ['Country', 'Cars produced (million)'],
    rows: [['China', '25.2'], ['USA', '8.8'], ['Japan', '8.1'], ['Germany', '3.7'], ['South Korea', '3.5']],
    note: PROMPT,
  },
  '3-90': { kind: 'bar', title: 'Water consumed in households', unit: 'litres / person / day', labels: ['Bathing', 'Toilet', 'Cooking', 'Laundry', 'Other'], series: [{ name: '', values: [55, 40, 15, 25, 10] }], note: PROMPT },
  '3-91': CAR_SALES_ASIA,
  '3-92': EDU_SPENDING,
  '3-93': { kind: 'line', title: 'Electricity consumption in Germany, 2000–2020', unit: 'TWh', yMin: 400, labels: ['2000', '2005', '2010', '2015', '2020'], series: [{ name: 'Consumption', values: [550, 590, 600, 590, 550] }], note: PROMPT },
  '3-94': CAR_SALES_ASIA,
  '3-95': COASTAL_TOURISTS,
  '3-96': EDU_SPENDING,
  '3-97': CAR_SALES_ASIA,
  '3-98': share('Students who took part in sports activities, 2022', 'Took part', 65, 'Did not take part', PROMPT),
  '3-99': AUS_WATER,
  '3-100': { kind: 'bar', title: 'People using public transport in major cities, 2010', unit: 'million / day', labels: ['Tokyo', 'London', 'Paris', 'New York'], series: [{ name: '', values: [14, 6, 5, 7] }], note: PROMPT },
  '3-101': { kind: 'pie', title: 'Types of energy used in Australia, 2020', pies: [{ slices: [{ label: 'Oil', value: 37 }, { label: 'Coal', value: 31 }, { label: 'Gas', value: 25 }, { label: 'Renewables', value: 7 }] }], note: PROMPT },
  '3-103': SPORTS_GENDER,
  '3-104': SPORTS_GENDER,
  '3-105': {
    kind: 'pie', title: 'World population by region, 1900 and 2000',
    pies: [
      { caption: '1900', slices: [{ label: 'Asia', value: 57 }, { label: 'Europe', value: 25 }, { label: 'Americas', value: 10 }, { label: 'Africa', value: 8 }] },
      { caption: '2000', slices: [{ label: 'Asia', value: 61 }, { label: 'Europe', value: 12 }, { label: 'Americas', value: 14 }, { label: 'Africa', value: 13 }] },
    ],
    note: PROMPT,
  },
  '3-106': { kind: 'bar', title: 'British teenagers who owned a smartphone, 2015', unit: '%', labels: ['13', '14', '15', '16', '17'], series: [{ name: '', values: [65, 72, 80, 85, 90] }], note: 'Nhóm tuổi 13–17. ' + PROMPT },
  '3-107': UK_ECONOMY,
  '3-108': {
    kind: 'line', title: 'Average daily commuters by car, bus and train, UK 1970–2000', unit: 'million', labels: ['1970', '1980', '1990', '2000'],
    series: [{ name: 'Car', values: [5, 6.5, 8, 9] }, { name: 'Bus', values: [4, 3.5, 3, 2.5] }, { name: 'Train', values: [3, 3, 2.8, 3.2] }],
    note: PROMPT,
  },
  '3-109': { kind: 'bar', title: 'Electricity produced from three sources, 2010', unit: 'TWh', labels: ['Coal', 'Gas', 'Nuclear'], series: [{ name: '', values: [400, 300, 150] }], note: PROMPT },

  // ─── MODULE 4: OVERVIEW ───────────────────────────────────────────────
  '4-34': FISH_MEAT,
  '4-35': { kind: 'line', title: 'Internet usage, 1990–2020', unit: '% of population', labels: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'], series: [{ name: 'Internet usage', values: [10, 22, 40, 55, 68, 78, 85] }] },
  '4-36': FISH_MEAT,
  '4-74': { kind: 'bar', title: 'Education spending in five countries', unit: '$ per student', labels: ['UK', 'USA', 'Germany', 'France', 'Japan'], series: [{ name: '', values: [8000, 7000, 6000, 5000, 3000] }], note: PROMPT },
  '4-76': { kind: 'pie', title: 'Energy sources in the UK, 2019', pies: [{ slices: [{ label: 'Gas', value: 40 }, { label: 'Renewables', value: 30 }, { label: 'Nuclear', value: 20 }, { label: 'Coal', value: 5 }, { label: 'Oil', value: 5 }] }] },
  '4-77': {
    kind: 'line', title: 'Commuting in the UK by car, bus and train, 1970–2030', unit: 'million journeys', labels: ['1970', '1980', '1990', '2000', '2010', '2020', '2030'], forecastFrom: 5,
    series: [{ name: 'Car', values: [10, 14, 18, 22, 25, 28, 31] }, { name: 'Bus', values: [9, 8.5, 8, 7.5, 7, 6.8, 6.5] }, { name: 'Train', values: [5, 4.8, 4.5, 4.3, 6, 8, 12] }],
    note: PROMPT,
  },
  '4-78': {
    kind: 'line', title: 'Car ownership and bicycle usage', unit: 'million', labels: ['1990', '2000', '2010', '2020'],
    series: [{ name: 'Car ownership', values: [5, 8, 12, 15] }, { name: 'Bicycle usage', values: [8, 6, 4, 2] }],
  },
  '4-79': {
    kind: 'map', title: 'A town in 1980 and 2020',
    panels: [
      { caption: '1980', items: [
        { t: 'farm', label: 'Farmland', x: 5, y: 5, w: 38, h: 24 },
        { t: 'forest', label: 'Forest', x: 57, y: 5, w: 38, h: 24 },
        { t: 'road', label: 'Main road', x: 0, y: 34, w: 100, h: 5 },
        { t: 'house', label: 'Houses', x: 5, y: 45, w: 26, h: 24 },
        { t: 'school', label: 'School', x: 37, y: 45, w: 24, h: 24 },
        { t: 'farm', label: 'Farmland', x: 67, y: 45, w: 28, h: 24 },
      ] },
      { caption: '2020', items: [
        { t: 'house', label: 'Residential area', x: 5, y: 5, w: 38, h: 24 },
        { t: 'shop', label: 'Shopping centre', x: 57, y: 5, w: 38, h: 24 },
        { t: 'road', label: '', x: 47, y: 0, w: 6, h: 33 },
        { t: 'road', label: 'Main road (widened)', x: 0, y: 33, w: 100, h: 8 },
        { t: 'house', label: 'Houses', x: 5, y: 46, w: 26, h: 24 },
        { t: 'school', label: 'School', x: 37, y: 46, w: 24, h: 24 },
        { t: 'hospital', label: 'Hospital', x: 67, y: 46, w: 28, h: 24 },
      ] },
    ],
  },
  '4-86': { kind: 'bar', title: 'Household spending in the UK, 2020', unit: '£ per week', labels: ['Food', 'Entertainment', 'Clothing', 'Transport', 'Other'], series: [{ name: '', values: [120, 80, 40, 42, 38] }], note: PROMPT },
};
