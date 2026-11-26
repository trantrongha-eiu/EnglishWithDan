import { useEffect, useRef, useState } from 'react';
import { bindDict } from '../utils/shell';
import Timetable from './strategy/Timetable';
import Guide from './strategy/Guide';

// 🧭 Chiến lược luyện đề — /app/reading-listening-strategy (was
// reading-listening-strategy.html). A reference article with a table of
// contents (sidebar on desktop, a fold-out on phones) that follows the
// section being read, plus the 7-week timetable tracker.

const TOC = [
  ['sec-timetable', '🗓️', 'Lộ trình luyện đề 7 tuần'],
  ['sec-read', 'I', 'Cách luyện đề Reading'],
  ['sec-listen', 'II', 'Cách luyện đề Listening'],
  ['sec-track', 'III', 'Sau mỗi đề: đừng chỉ ghi điểm'],
  ['sec-move', 'IV', 'Khi nào chuyển sang đề mới?'],
  ['sec-phase', 'V', 'Chiến lược theo từng giai đoạn'],
  ['sec-principle', 'VI', 'Một nguyên tắc quan trọng'],
  ['sec-tip', 'VII', 'Một mẹo cuối cùng'],
  ['sec-books', 'VIII', 'Tài liệu tham khảo'],
  ['sec-summary', '⭐', 'Tóm tắt cực ngắn'],
];
const IDS = new Set(TOC.map(([id]) => id));

// <base href="/"> in /app/index.html would send a bare "#sec-…" link to the
// home page, so the links scroll by hand and keep the section in the address.
function goTo(id, behavior) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView(behavior ? { behavior } : undefined);
  window.history.replaceState(window.history.state, '', location.pathname + location.search + '#' + id);
}

function TocLinks({ active, onPick }) {
  return (
    <nav className="st-toc">
      {TOC.map(([id, num, label]) => (
        <a key={id} href={'#' + id} className={active === id ? 'active' : undefined}
          onClick={(e) => { e.preventDefault(); goTo(id); onPick?.(); }}>
          <span className="st-toc-num">{num}</span> {label}
        </a>
      ))}
    </nav>
  );
}

export default function ReadingListeningStrategy() {
  const [active, setActive] = useState('');
  const mobToc = useRef(null);

  useEffect(() => {
    // Reference material: word lookup is always on (no exam gate)
    bindDict('st-content', 'reading-listening-strategy');

    // A link to a section (…#sec-listen) opens there, after the layout's
    // "new page starts at the top"
    const id = location.hash.slice(1);
    const raf = IDS.has(id) ? requestAnimationFrame(() => goTo(id, 'instant')) : 0;

    // Highlight the section being read in both tables of contents
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
      document.querySelectorAll('.st-sec').forEach((s) => io.observe(s));
    }
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, []);

  return (
    <div className="st-layout">
      <aside className="st-sidebar">
        <p className="st-sidebar-title">Mục lục</p>
        <TocLinks active={active} />
      </aside>

      <details className="st-mob-toc" ref={mobToc}>
        <summary>Mục lục <i className="fas fa-chevron-down"></i></summary>
        <TocLinks active={active} onPick={() => { if (mobToc.current) mobToc.current.open = false; }} />
      </details>

      <main className="st-main">
        <div className="st-wrap" id="st-content">
          <header className="st-hero pf-hero pf-hero-olive" data-mascot="think">
            <div className="pf-hero-body">
              <h1>Chiến lược luyện đề <span className="pf-tag">Reading &amp; Listening</span></h1>
              <p className="pf-hero-sub">Reading &amp; Listening không phải hai kỹ năng tăng điểm chỉ nhờ cày thật nhiều đề.
                {' '}Quy trình đúng: <b>làm đề → phát hiện lỗi → hiểu nguyên nhân → sửa lỗi → gặp lại → kiểm tra lại</b>.</p>
            </div>
          </header>

          <Timetable />
          <Guide />
        </div>
      </main>
    </div>
  );
}
