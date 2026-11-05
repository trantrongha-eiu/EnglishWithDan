'use strict';
// READ-ONLY (DB) → writes frontend/de-thi-ielts.html: a public, indexable catalog of every ACTIVE full Reading / Listening
// test (Vol 1–N "Original Exams", IELTS Recent Actual Tests, Cambridge IELTS) with passage / part titles, so search engines
// can find "đề IELTS Vol 10", "recent actual test", "Cambridge 20 test 1"… The practice pages themselves need a login and are
// Disallow-ed in robots.txt, so without this page none of that content is visible to Google.
//   node backend/scripts/seo/buildTestCatalog.js && node scripts/stamp-asset-versions.js   (after seeding a new vol / test; commit the page)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env'), quiet: true });
const fs = require('fs'), path = require('path');
const mongoose = require('mongoose');

const OUT = path.join(__dirname, '..', '..', '..', 'frontend', 'de-thi-ielts.html');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = s => +((String(s).match(/\d+/) || [0])[0]);
const partTitle = t => String(t || '').replace(/^.*?[–-]\s*Part\s*\d\s*$/i, '').trim(); // "Cam 20 - Test 1 – Part 1" → ''

// series key → { id, h2, blurb, order }
function seriesOf(name, series) {
  const s = series || '';
  let m;
  if ((m = s.match(/^Vol\s*(\d+)$/i))) return { id: `vol-${m[1]}`, label: `IELTS Vol ${m[1]}`, order: 1000 - +m[1], vol: +m[1] };
  if (/actual/i.test(s) || /^Actual/i.test(name)) return { id: 'recent-actual-tests', label: 'IELTS Recent Actual Tests', order: 2000 };
  if ((m = s.match(/^Cam\s*(\d+)$/i))) return { id: `cambridge-${m[1]}`, label: `Cambridge IELTS ${m[1]}`, order: 3000 - +m[1] };
  return null;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const rts = await db.collection('readingtests').find({ isActive: true }).toArray();
  const pids = rts.flatMap(t => t.passageIds || []);
  const ps = await db.collection('passages').find({ _id: { $in: pids.map(id => new mongoose.Types.ObjectId(String(id))) } })
    .project({ title: 1 }).toArray();
  const ptitle = Object.fromEntries(ps.map(p => [String(p._id), p.title]));
  const lts = await db.collection('listeningtests').find({ isActive: true }).project({ name: 1, seriesName: 1, testNumber: 1, 'sections.title': 1, 'sections.partNumber': 1 }).toArray();
  await mongoose.disconnect();

  const groups = {};
  const add = (kind, t, items) => {
    const s = seriesOf(t.name, t.seriesName);
    if (!s) return;
    const g = groups[s.id] ||= { ...s, reading: [], listening: [] };
    g[kind].push({ name: t.name, n: t.testNumber || num(t.name), items: items.filter(Boolean) });
  };
  for (const t of rts) add('reading', t, (t.passageIds || []).map(id => ptitle[String(id)]));
  for (const t of lts) add('listening', t, (t.sections || []).sort((a, b) => a.partNumber - b.partNumber).map(x => partTitle(x.title)));
  const list = Object.values(groups).sort((a, b) => a.order - b.order);
  for (const g of list) for (const k of ['reading', 'listening']) g[k].sort((a, b) => a.n - b.n || a.name.localeCompare(b.name));

  const vols = list.filter(g => g.vol).map(g => g.vol);
  const maxVol = Math.max(...vols);
  const nR = list.reduce((a, g) => a + g.reading.length, 0), nL = list.reduce((a, g) => a + g.listening.length, 0);
  const volRange = `Vol 1–${maxVol}`;
  const cams = list.filter(g => /^cambridge/.test(g.id)).map(g => num(g.label)).sort((a, b) => a - b);
  const camRange = cams.length ? `Cambridge IELTS ${cams[0]}–${cams[cams.length - 1]}` : 'Cambridge IELTS';

  const testCard = (kind, t) => `<li class="tc-test"><span class="tc-name">${esc(t.name)}</span>${t.items.length
    ? `<span class="tc-items">${t.items.map(esc).join(' · ')}</span>` : ''}</li>`;
  const section = g => {
    const intro = g.vol
      ? `Bộ đề <strong>IELTS Vol ${g.vol}</strong> (Original Exams): ${[g.reading.length && `${g.reading.length} đề Reading`, g.listening.length && `${g.listening.length} đề Listening`].filter(Boolean).join(" và ")} thi thử trên máy, có giải thích đáp án tiếng Việt.`
      : g.id === 'recent-actual-tests'
        ? `<strong>IELTS Recent Actual Tests</strong> — đề sưu tầm từ các kỳ thi gần đây: ${g.reading.length} đề Reading (Actual Mocktest) và ${g.listening.length} đề Listening (Actual Test).`
        : `<strong>${esc(g.label)}</strong>: ${g.reading.length ? `${g.reading.length} đề Reading, ` : ''}${g.listening.length} đề Listening có transcript và giải thích.`;
    const block = (kind, label, arr) => arr.length ? `
      <h3>${esc(g.label)} ${label}</h3>
      <ul class="tc-list">${arr.map(t => testCard(kind, t)).join('')}</ul>` : '';
    return `
    <section class="tc-series" id="${g.id}">
      <h2>${esc(g.label)}${g.vol ? ' – Reading &amp; Listening' : ''}</h2>
      <p>${intro}</p>${block('reading', 'Reading', g.reading)}${block('listening', 'Listening', g.listening)}
      <p class="tc-cta"><a class="btn btn-primary" href="/login"><i class="fas fa-play"></i> Luyện ${esc(g.label)} ngay</a></p>
    </section>`;
  };

  const faq = [
    ['Đề IELTS Vol là gì?', `Các bộ đề “IELTS Vol” (Vol 1, Vol 2 … Vol ${maxVol} – Original Exams) là tuyển tập đề Reading và Listening được học viên Việt Nam dùng nhiều nhất để luyện thi IELTS trên máy. Trên EnglishWithDan, mỗi đề Vol được chia thành từng passage / part để luyện riêng và gộp thành đề full 40 câu “Vol N - Test N”.`],
    ['IELTS Recent Actual Tests là gì?', 'Recent Actual Tests là các đề sưu tầm theo nội dung những kỳ thi IELTS gần đây. Bạn có thể làm Reading (Actual Mocktest) và Listening (Actual Test) như thi thật, chấm điểm và quy đổi band ngay sau khi nộp bài.'],
    ['Đề có giải thích đáp án không?', 'Có. Mỗi câu hỏi có dịch nghĩa, vị trí thông tin, câu trích trong bài đọc hoặc transcript và phân tích vì sao chọn đáp án, viết bằng tiếng Việt.'],
    ['Luyện đề IELTS online ở đâu?', 'Đăng nhập ieltsthayha.com, vào mục Reading hoặc Listening, chọn bộ đề (Vol, Recent Actual Tests, Cambridge) và làm bài ở giao diện thi trên máy giống IDP / British Council.'],
  ];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'ItemList', name: `Đề thi IELTS ${volRange}, Recent Actual Tests, ${camRange}`,
      itemListElement: list.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.label, url: `https://ieltsthayha.com/de-thi-ielts#${g.id}` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://ieltsthayha.com/' },
      { '@type': 'ListItem', position: 2, name: 'Đề thi IELTS', item: 'https://ieltsthayha.com/de-thi-ielts' }] },
  ];

  const title = `Đề thi IELTS ${volRange} & Recent Actual Tests – Luyện Reading, Listening online có giải thích`;
  const desc = `Luyện ${nR} đề IELTS Reading và ${nL} đề Listening: bộ đề IELTS ${volRange} (Original Exams), IELTS Recent Actual Tests, ${camRange}. Thi thử trên máy, chấm điểm, quy đổi band, giải thích đáp án tiếng Việt.`;
  const keywords = [`đề IELTS Vol`, `IELTS Vol ${maxVol}`, ...vols.sort((a, b) => b - a).slice(0, 4).map(v => `giải đề Vol ${v}`), 'IELTS Recent Actual Tests', 'recent actual test',
    'đề thi IELTS thật', 'luyện đề IELTS online', 'IELTS Reading practice', 'IELTS Listening practice', 'Cambridge IELTS', camRange,
    'thi thử IELTS trên máy', 'đề IELTS có giải thích'].join(', ');
  const toc = list.map(g => `<a href="#${g.id}">${esc(g.label)}</a>`).join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <!-- GENERATED by backend/scripts/seo/buildTestCatalog.js from the live test bank — edit the script, not this file. -->
  <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}"/>
  <meta name="keywords" content="${esc(keywords)}"/>
  <link rel="canonical" href="https://ieltsthayha.com/de-thi-ielts" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="EnglishWithDan" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:url" content="https://ieltsthayha.com/de-thi-ielts" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="https://ieltsthayha.com/img/big_logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="https://ieltsthayha.com/img/big_logo.png" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
  <link rel="stylesheet" href="/css/tokens.css?v=307c2602bb"/>
  <link rel="stylesheet" href="/css/main.css?v=dbdbc48a39"/>
  <script src="/js/theme.js?v=81e03964c4"></script>
  <script src="/js/shared/site-guard.js?v=69a46f173e" defer></script>
  <script src="/js/shared/visit-tracker.js?v=c9376aa47f" defer></script>
${ld.map(o => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
  <style>
    .tc-wrap{max-width:1040px;margin:0 auto;padding:48px 24px 80px}
    .tc-wrap h1{font-size:clamp(26px,3.4vw,38px);line-height:1.25;margin:0 0 14px}
    .tc-lead{font-size:16px;line-height:1.75;color:var(--text2);max-width:820px}
    .tc-stats{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0}
    .tc-stat{background:var(--bg2,#f5f7fb);border-radius:12px;padding:12px 18px;font-weight:700}
    .tc-stat b{display:block;font-size:24px;color:var(--blue)}
    .tc-toc{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 8px}
    .tc-toc a{border:1px solid var(--border,#e5e7eb);border-radius:999px;padding:6px 12px;font-size:13.5px;text-decoration:none;color:var(--text)}
    .tc-toc a:hover{border-color:var(--blue);color:var(--blue)}
    .tc-series{border-top:1px solid var(--border,#e5e7eb);padding-top:28px;margin-top:32px;scroll-margin-top:80px}
    .tc-series h2{font-size:24px;margin:0 0 8px}
    .tc-series h3{font-size:17px;margin:20px 0 8px;color:var(--text)}
    .tc-series p{color:var(--text2);line-height:1.7}
    .tc-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}
    .tc-test{background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 14px}
    .tc-name{display:block;font-weight:700;font-size:14.5px}
    .tc-items{display:block;font-size:13px;color:var(--gray);line-height:1.55;margin-top:3px}
    .tc-cta{margin-top:14px}
    .tc-faq h3{font-size:17px;margin:22px 0 6px}
  </style>
</head>
<body>

<nav class="navbar" id="navbar">
  <a href="/" class="nav-logo"><img src="img/big_logo.png" alt="Daniel Hà English Education" class="nav-logo-img"></a>
  <div class="nav-links">
    <a href="/">Trang chủ</a>
    <a href="/courses">Khóa học</a>
    <a href="/de-thi-ielts">Đề thi IELTS</a>
    <a href="/about">Về chúng tôi</a>
    <a href="/contact">Liên hệ</a>
  </div>
  <div class="nav-cta">
    <button class="btn-dark-toggle" onclick="toggleDark()" title="Chế độ tối/sáng"><span class="dark-toggle-icon">🌙</span></button>
    <a href="/login" class="btn btn-outline"><i class="fas fa-sign-in-alt"></i> Luyện thi</a>
    <button class="btn btn-primary" onclick="openConsultModal()"><i class="fas fa-comments"></i> Tư vấn ngay</button>
  </div>
  <button class="nav-hamburger" onclick="toggleMenu()" aria-label="Menu"><i class="fas fa-bars" id="ham-icon"></i></button>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a href="/" onclick="toggleMenu()">🏠 Trang chủ</a>
  <a href="/courses" onclick="toggleMenu()">📚 Khóa học</a>
  <a href="/de-thi-ielts" onclick="toggleMenu()">📝 Đề thi IELTS</a>
  <a href="/about" onclick="toggleMenu()">👨‍🏫 Về chúng tôi</a>
  <a href="/contact" onclick="toggleMenu()">📞 Liên hệ</a>
  <a href="/login" onclick="toggleMenu()">→ Luyện thi</a>
  <a href="#" class="mobile-dark-toggle" onclick="toggleDark();return false;"><span class="dark-toggle-icon">🌙</span> Chế độ tối/sáng</a>
</div>

<main class="tc-wrap">
  <h1>Đề thi IELTS ${volRange} &amp; Recent Actual Tests – luyện Reading, Listening online</h1>
  <p class="tc-lead">Kho đề luyện thi IELTS trên máy của thầy Daniel Hà: trọn bộ <strong>đề IELTS ${volRange}</strong> (Original Exams),
    <strong>IELTS Recent Actual Tests</strong> và <strong>${camRange}</strong>. Mỗi đề Reading, Listening được chấm điểm tự động, quy đổi
    band và có <strong>giải thích đáp án chi tiết bằng tiếng Việt</strong> — dịch nghĩa, vị trí thông tin, câu trích trong bài và phân tích.
    Listening có transcript chạy theo audio, chép chính tả và luyện điền từ.</p>
  <div class="tc-stats">
    <div class="tc-stat"><b>${nR}</b>đề Reading full</div>
    <div class="tc-stat"><b>${nL}</b>đề Listening full</div>
    <div class="tc-stat"><b>${maxVol}</b>bộ đề Vol</div>
  </div>
  <p><a class="btn btn-primary" href="/login"><i class="fas fa-play"></i> Bắt đầu luyện đề miễn phí</a></p>
  <nav class="tc-toc" aria-label="Danh sách bộ đề">${toc}</nav>
${list.map(section).join('\n')}

  <section class="tc-series tc-faq" id="hoi-dap">
    <h2>Câu hỏi thường gặp</h2>
${faq.map(([q, a]) => `    <h3>${esc(q)}</h3>\n    <p>${esc(a)}</p>`).join('\n')}
  </section>
</main>

<footer class="footer">
  <div class="footer-bottom">
    <p>© <span id="footer-year"></span> EnglishWithDan – Daniel Hà English Center. All rights reserved. · <a href="/ban-quyen">Bản quyền &amp; DMCA</a></p>
  </div>
</footer>
<script>
  const yrEl = document.getElementById('footer-year');
  if (yrEl) yrEl.textContent = new Date().getFullYear();
  function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('ham-icon');
    const open = menu.classList.toggle('open');
    icon.className = open ? 'fas fa-times' : 'fas fa-bars';
  }
</script>
<script src="/js/consult-modal.js?v=1694f7cfed"></script>
</body>
</html>
`;
  fs.writeFileSync(OUT, html);
  console.log(`✓ ${path.relative(process.cwd(), OUT)}: ${list.length} series, ${nR} Reading + ${nL} Listening tests, ${(html.length / 1024).toFixed(0)} KB`);
})().catch(e => { console.error(e); process.exit(1); });
