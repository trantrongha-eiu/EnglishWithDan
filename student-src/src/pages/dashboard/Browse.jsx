import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import SearchMatch from '../../utils/searchMatch';
import { apiFetch } from '../../utils/api';
import { todaysLessonIndex, groupByClass, lessonHref, unitHref, PARA_REVIEW_HREF, LAST_KEY, lsGet, lsSet } from '../../utils/lessons';

// Full-width "pick a Paraphrase Unit / Vocab Topic" list —
// /dashboard/paraphrase and /dashboard/topics. Port of dashboard-browse.js:
// "Gợi ý cho bạn" chips, collapsible "Cách học hiệu quả", search, cards.

const GUIDES = {
  paraphrase: {
    summary: 'Cách học Paraphrase hiệu quả',
    steps: [
      ['Mỗi ngày 1 Unit, 15–20 phút', <>Học đều mỗi ngày nhớ lâu hơn học dồn nhiều Unit một lúc. Học xong một Unit rồi mới sang Unit tiếp.</>],
      ['Tự đoán trước rồi mới lật thẻ', <>Ở tab <b>Study</b> (chế độ 🃏 Thẻ), đọc cụm từ trong bài rồi tự hỏi <i>&quot;đề sẽ diễn đạt lại thế nào?&quot;</i> trước khi lật. Tự nhớ ra được thì nhớ lâu hơn nhiều so với chỉ đọc lướt.</>],
      ['Chấm mức nhớ thật lòng', <>Bấm <b>Chưa thuộc / Nhớ sơ sơ / Đã thuộc</b> đúng với mức nhớ thật. Hệ thống dựa vào đó để hẹn ngày ôn từng cụm (lặp lại ngắt quãng), nên chấm &quot;Đã thuộc&quot; quá sớm là tự làm mình quên.</>],
      ['Luyện ngay sau khi học', <>Làm lần lượt <b>Quiz → Flashcard → Translate</b>, cuối cùng là <b>Mixed</b>. Mixed đạt từ 80% trở lên thì coi như đã nắm được Unit.</>],
      ['Ôn đúng hạn trước khi học mới', <>Khi có cụm đến hạn, bấm <b>Ôn Paraphrase</b> trước. Ôn đúng hạn quan trọng hơn học thêm Unit mới.</>],
      ['Áp dụng khi làm đề', <>Khi làm Reading/Listening, gạch chân từ khoá trong câu hỏi rồi tìm cụm có cùng nghĩa trong bài. Đó chính là kỹ năng paraphrase bạn đang luyện.</>],
    ],
    tip: <>Cụm nào hay sai thì vào <b>Ôn lại từ hay sai</b> ở sidebar, hoặc bấm lưu cụm đó vào sổ từ vựng để ôn lại.</>,
  },
  topics: {
    summary: 'Cách học Vocab Topics hiệu quả',
    steps: [
      ['Ưu tiên bài của lớp bạn', <>Làm các bài trong nhóm <b>Lớp …</b> của bạn trước (giáo viên giao theo tiến độ lớp), sau đó mới đến nhóm <b>Chung</b>.</>],
      ['Learn kỹ trước khi Quiz', <>Ở tab <b>Learn</b>, đọc nghĩa, ví dụ và collocation, bấm 🔊 rồi đọc to theo. Với mỗi từ, thử tự đặt 1 câu về bản thân.</>],
      ['Tự kiểm tra trước', <>Che phần nghĩa đi, nhìn từ tiếng Anh rồi nói nghĩa. Từ nào chưa nói được thì đọc lại trước khi làm Quiz.</>],
      ['Làm Quiz đến khi đạt ≥ 90%', <>Quiz có cả câu sắp xếp lại câu ví dụ, giúp bạn học cách dùng từ chứ không chỉ nhớ nghĩa. Đạt từ 90% trở lên thì bài chuyển sang trạng thái <b>Review</b>.</>],
      ['Xem lại câu sai ở Results', <>Mở tab <b>Results</b>, xem lại những từ đã sai và làm lại Quiz sau khoảng 1 ngày.</>],
      ['Lưu cả bài vào sổ', <>Bấm <b>Lưu tất cả</b> để đưa các từ vào sổ từ vựng. Hệ thống sẽ nhắc bạn ôn từng từ đúng lúc.</>],
    ],
    tip: <>Quiz làm đủ từ 5 câu trở lên sẽ được tính vào bảng <b>Top 10 Quiz điểm cao</b> ở trang <b>BXH vocab</b>.</>,
  },
};

const META = {
  paraphrase: {
    title: 'Paraphrase Cambridge', icon: 'fa-graduation-cap', unit: 'Unit',
    sub: 'Các cụm paraphrase thường gặp trong bộ đề Cambridge IELTS 15–20. Chọn một Unit để học.',
    placeholder: 'Tìm Unit theo số hoặc tên...',
  },
  topics: {
    title: 'Vocab Topics', icon: 'fa-layer-group', unit: 'bài',
    sub: 'Từ vựng theo chủ đề — học rồi làm Quiz. Chọn một bài để bắt đầu.',
    placeholder: 'Tìm bài quiz theo tên...',
  },
};

const GUIDE_KEY = (kind) => `ews_pb_guide_${kind}`;
const matches = (q, ...fields) => !q || SearchMatch.matches(fields.map(f => String(f || '')), q);

function Empty({ icon, children }) {
  return <div className="pb-empty"><i className={`fas ${icon}`} /><div>{children}</div></div>;
}

function Guide({ kind }) {
  const g = GUIDES[kind];
  const [open, setOpen] = useState(() => lsGet(GUIDE_KEY(kind)) !== 'closed');
  return (
    <details className="pb-guide" open={open}>
      <summary onClick={(e) => {
        e.preventDefault();
        lsSet(GUIDE_KEY(kind), open ? 'closed' : 'open');
        setOpen(!open);
      }}>
        <i className="fas fa-lightbulb" /> {g.summary}<span className="pb-guide-toggle" />
      </summary>
      <div className="pb-guide-body">
        <ol className="pb-guide-steps">
          {g.steps.map(([t, d]) => (
            <li key={t}><div className="pb-guide-step-title">{t}</div><div className="pb-guide-step-desc">{d}</div></li>
          ))}
        </ol>
        {g.tip && <div className="pb-guide-tip"><i className="fas fa-circle-info" /> <span>{g.tip}</span></div>}
      </div>
    </details>
  );
}

function SuggestChip({ icon, label, title, tone, href }) {
  return (
    <a className={`pb-suggest-chip${tone ? ` pb-suggest-chip--${tone}` : ''}`} href={href}>
      <span className="pb-suggest-icon"><i className={`fas ${icon}`} /></span>
      <span className="pb-suggest-text">
        <span className="pb-suggest-label">{label}</span>
        <span className="pb-suggest-title">{title}</span>
      </span>
    </a>
  );
}

function ParaphraseList({ units, q }) {
  if (!units) return <Empty icon="fa-spinner fa-spin">Đang tải...</Empty>;
  if (!units.length) return <Empty icon="fa-box-open">Chưa có Paraphrase Unit nào</Empty>;
  const list = units.filter(u => matches(q, `unit ${u.unitNumber}`, u.title, u.description));
  if (!list.length) return <Empty icon="fa-search">Không tìm thấy Unit nào</Empty>;
  const last = lsGet(LAST_KEY.paraphrase);
  return (
    <div className="pb-grid">
      {list.map(u => (
        <a key={u.unitNumber} className={`pb-card${String(u.unitNumber) === last ? ' is-current' : ''}`} href={unitHref(u.unitNumber, 'paraphrase')}
          onClick={() => lsSet(LAST_KEY.paraphrase, String(u.unitNumber))}>
          <span className="pb-card-top">
            <span className="pb-card-num">Unit {u.unitNumber}</span>
            {u.level && <span className="pb-chip">{u.level}</span>}
          </span>
          <span className="pb-card-title">{u.title || ''}</span>
          {u.description && <span className="pb-card-desc">{u.description}</span>}
          <span className="pb-card-go">Học ngay <i className="fas fa-arrow-right" /></span>
        </a>
      ))}
    </div>
  );
}

function TopicsList({ lessons, q }) {
  if (!lessons) return <Empty icon="fa-spinner fa-spin">Đang tải...</Empty>;
  if (!lessons.length) return <Empty icon="fa-box-open">Chưa có bài học nào</Empty>;
  const list = lessons.filter(l => matches(q, l.title));
  if (!list.length) return <Empty icon="fa-search">Không tìm thấy bài quiz nào</Empty>;
  return groupByClass(list).map(g => (
    <div className="pb-group" key={g.key}>
      <div className="pb-group-label">{g.label} <span>{g.items.length}</span></div>
      <div className="pb-grid">
        {g.items.map(l => (
          <a key={l._id} className="pb-card pb-card--cover" href={lessonHref(l._id, 'topics')} onClick={() => lsSet(LAST_KEY.topics, String(l._id))}>
            <span className="pb-card-cover">
              <span className="pb-card-cover-logo"><span>D</span>aniel</span>
              {l.thumbnail && <img src={l.thumbnail} alt="" loading="lazy" onError={(e) => e.currentTarget.remove()} />}
            </span>
            <span className="pb-card-top">
              {l.difficulty && <span className="classroom-item-badge">{l.difficulty}</span>}
              {l.wordCount ? <span className="pb-card-meta">{l.wordCount} từ</span> : null}
            </span>
            <span className="pb-card-title">{l.title || ''}</span>
            <span className="pb-card-go">Vào bài <i className="fas fa-arrow-right" /></span>
          </a>
        ))}
      </div>
    </div>
  ));
}

function Suggestions({ kind, units, lessons, dueCount }) {
  const chips = [];
  if (kind === 'paraphrase') {
    if (dueCount > 0) {
      chips.push({ icon: 'fa-rotate', label: 'Đến hạn ôn', title: `${dueCount} cụm paraphrase cần ôn hôm nay`, tone: 'hot', href: PARA_REVIEW_HREF });
    }
    if (units?.length) {
      const last = lsGet(LAST_KEY.paraphrase);
      const idx = last ? units.findIndex(u => String(u.unitNumber) === last) : -1;
      const name = (u) => `Unit ${u.unitNumber} – ${u.title || ''}`;
      if (idx === -1) chips.push({ icon: 'fa-flag', label: 'Bắt đầu từ đây', title: name(units[0]), href: unitHref(units[0].unitNumber, 'paraphrase') });
      else {
        chips.push({ icon: 'fa-play', label: 'Học tiếp', title: name(units[idx]), href: unitHref(units[idx].unitNumber, 'paraphrase') });
        const nx = units[idx + 1];
        if (nx) chips.push({ icon: 'fa-forward', label: 'Unit kế tiếp', title: name(nx), href: unitHref(nx.unitNumber, 'paraphrase') });
      }
    }
  } else if (lessons?.length) {
    const today = lessons[todaysLessonIndex(lessons.length)];
    chips.push({ icon: 'fa-calendar-day', label: 'Bài hôm nay', title: today.title || '', tone: 'hot', href: lessonHref(today._id, 'topics') });
    const last = lessons.find(l => String(l._id) === lsGet(LAST_KEY.topics));
    if (last && last._id !== today._id) chips.push({ icon: 'fa-play', label: 'Học tiếp', title: last.title || '', href: lessonHref(last._id, 'topics') });
  }
  if (!chips.length) return null;
  return (
    <div className="pb-suggest">
      <div className="pb-suggest-head"><i className="fas fa-wand-magic-sparkles" /> Gợi ý cho bạn</div>
      <div className="pb-suggest-row">{chips.map(c => <SuggestChip key={c.label} {...c} />)}</div>
    </div>
  );
}

export default function Browse({ kind }) {
  const { units, lessons } = useOutletContext();
  const [q, setQ] = useState('');
  const [due, setDue] = useState({ kind: null, count: 0 });
  const m = META[kind];

  useEffect(() => {
    if (kind !== 'paraphrase') return undefined;
    let alive = true;
    apiFetch('/vocab/paraphrase/due-count')
      .then(d => { if (alive) setDue({ kind, count: (d?.success && d.count) || 0 }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [kind]);

  const query = q.trim();
  const data = kind === 'paraphrase' ? units : lessons;
  const shown = !data ? 0 : kind === 'paraphrase'
    ? data.filter(u => matches(query, `unit ${u.unitNumber}`, u.title, u.description)).length
    : data.filter(l => matches(query, l.title)).length;

  return (
    <div className="practice-browse" style={{ display: 'flex' }}>
      <div className="pb-inner">
        <div className="pb-head">
          <Link className="btn btn-ghost btn-sm" to="/dashboard">← Trang chủ</Link>
          <div className="pb-head-text">
            <h2><i className={`fas ${m.icon}`} /> {m.title}</h2>
            <p>{m.sub}</p>
          </div>
        </div>
        {!query && <Suggestions kind={kind} units={units} lessons={lessons} dueCount={due.kind === kind ? due.count : 0} />}
        <Guide key={kind} kind={kind} />
        <div className="pb-toolbar">
          <div className="pb-search">
            <i className="fas fa-search" />
            <input type="search" autoComplete="off" aria-label="Tìm kiếm" placeholder={m.placeholder} value={q}
              onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setQ(''); }} />
          </div>
          <span className="pb-count">{shown ? `${shown} ${m.unit}` : ''}</span>
          {kind === 'paraphrase' && (
            <a className="btn btn-ghost btn-sm" href={PARA_REVIEW_HREF} style={{ marginLeft: 'auto' }}>
              <i className="fas fa-rotate" /> Ôn Paraphrase
            </a>
          )}
        </div>
        <div>
          {kind === 'paraphrase' ? <ParaphraseList units={units} q={query} /> : <TopicsList lessons={lessons} q={query} />}
        </div>
      </div>
    </div>
  );
}
