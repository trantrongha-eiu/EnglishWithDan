// Home of Speaking Part 2: hero, the 4 steps, Lulu, "Cách dùng bộ khung",
// the cue-card finder, one card per story and "Logic tổng hợp".
import { FLOW, PASS, STEPS, finderResults, mastery, nextStory, stepStatus, storyState, targets } from '../../utils/speakingPart2';
import { LuluSays } from './Parts';

function LockedBanner({ onUpgrade }) {
  return (
    <div className="t2w-promo sp2-promo" id="premium-promo-banner">
      <span className="t2w-promo-ic">⭐</span>
      <div className="t2w-promo-txt"><b>Nâng cấp Premium để học 7 câu chuyện gốc</b>
        <span>Bài mẫu theo 7 khung nói, 112 cụm từ ăn điểm, nhại theo từng câu có chấm phát âm, dịch câu Việt → Anh để thuộc bài và nói thử 2 phút. Xem trước danh sách câu chuyện và đề dùng được bên dưới.</span></div>
      <button type="button" className="t2w-go" onClick={onUpgrade}>Upgrade Premium</button>
    </div>
  );
}

function HomeCoach({ next, nDone, doing, onOpen }) {
  let text; let mood = 'happy';
  if (!next) { text = 'Cậu đã thuộc cả 7 câu chuyện rồi! Giờ gặp cue card nào cũng có bài để nói 🥳'; mood = 'cheer'; }
  else if (doing) text = 'Cậu đang học dở câu chuyện ' + next.no + ': “' + next.title + '” — học nốt nha! 💪';
  else if (nDone) { text = 'Giỏi lắm, đã thuộc ' + nDone + ' câu chuyện! Tiếp theo là ' + next.no + ': “' + next.title + '” 🎉'; mood = 'excited'; }
  else text = 'Chào cậu! Tớ là Lulu 🍊 Chỉ cần 7 câu chuyện là trả lời được phần lớn cue card Part 2. Bắt đầu với câu chuyện 01 nha!';
  return (
    <div className="t2w-coach">
      <LuluSays text={text} mood={mood} fallback="coach" />
      {next && (
        <button type="button" className="t2w-go" onClick={() => onOpen(next.id)}>
          <i className="fas fa-play" /> {doing ? 'Học tiếp' : 'Bắt đầu'} câu chuyện {next.no}
        </button>
      )}
    </div>
  );
}

function StoryCard({ st, i, p, locked, isNext, onOpen, onFull }) {
  const s = stepStatus(st, p, locked);
  const n = s.filter((x) => x.done).length;
  const stt = storyState(st, p, locked);
  const pct = locked ? 0 : mastery(st, p).pct;
  const chips = [];
  if (locked) chips.push(<span key="l" className="t2w-chip"><i className="fas fa-lock" /> Premium</span>);
  else if (stt === 'done' && pct < PASS) chips.push(<span key="d" className="t2w-chip is-ok"><i className="fas fa-check" /> Xong {STEPS.length} bước</span>);
  else if (stt === 'doing') chips.push(<span key="m" className="t2w-chip is-mid">✍️ {n}/{STEPS.length} bước</span>);
  if (!locked && pct >= PASS) chips.unshift(<span key="p" className="t2w-chip is-ok"><i className="fas fa-medal" /> Thuộc {pct}%</span>);
  if (isNext) chips.push(<span key="n" className="t2w-chip is-next">👉 Học tiếp</span>);
  const topics = st.remember.topics;
  return (
    <div className="t2w-group sp2-group" style={{ '--g-c': st.color, '--i': i }}>
      <div className="t2w-group-head">
        <span className="t2w-group-emoji">{st.emoji}</span>
        <div className="t2w-group-title"><div className="t2w-group-theme">{st.group}</div>
          <span className="t2w-group-type">{st.rootQ.split(' — ')[0]}</span></div>
        <span className={`t2w-group-count${pct >= PASS ? ' is-full' : ''}`} title={'Đã thuộc ' + pct + '% câu chuyện (cần ≥' + PASS + '%)'}>{pct}%</span>
      </div>
      <div className="t2w-group-bar"><i style={{ width: pct + '%' }} /></div>
      <div className="t2w-group-sessions">
        <button type="button" className={`t2w-sess is-${stt}${isNext ? ' is-next' : ''}`} onClick={() => onOpen(st.id)}>
          <span className="t2w-sess-num"><small>Bài</small>{st.no}</span>
          <span className="t2w-sess-body"><span className="t2w-sess-name">{st.title}</span>
            {chips.length > 0 && <span className="t2w-sess-chips">{chips}</span>}</span>
          <span className="t2w-sess-go" aria-hidden="true">{stt === 'done' ? <i className="fas fa-check" /> : <i className="fas fa-chevron-right" />}</span>
        </button>
      </div>
      <button type="button" className="sp2-full-btn" onClick={() => onFull(st.id)}>
        {locked ? <i className="fas fa-lock" /> : <i className="fas fa-file-alt" />} Xem full bài mẫu
      </button>
      <div className="sp2-topics"><span className="sp2-topics-lbl">Dùng cho:</span> {topics.slice(0, 5).join(' · ')}
        {topics.length > 5 && <> <span className="sp2-muted">+{topics.length - 5}</span></>}</div>
    </div>
  );
}

function Finder({ stories, value, onChange, onOpen }) {
  const res = value && value.trim() ? finderResults(stories, value) : null;
  return (
    <div className="sp2-card sp2-finder">
      <label className="sp2-finder-lbl" htmlFor="sp2-finder"><span className="sp2-card-ic">🔎</span> <b>Gặp cue card này thì kể chuyện nào?</b></label>
      <input id="sp2-finder" className="sp2-finder-input" type="search" autoComplete="off"
        placeholder="Gõ đề, ví dụ: a person who helped you · a crowded place · a gift…" value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="sp2-finder-res" id="sp2-finder-res">
        {res && !res.length && <div className="sp2-finder-none">Chưa thấy câu chuyện khớp. 7 câu chuyện gốc không phủ tốt: thể thao · toà nhà / căn phòng · món ăn · công nghệ · phim / sách · luật lệ — các dạng này cần câu chuyện riêng.</div>}
        {res && res.map((r, i) => (
          <button key={i} type="button" className="sp2-finder-row" style={{ '--g-c': r.st.color }} onClick={() => onOpen(r.st.id, r.k)}>
            <span className="sp2-finder-emoji">{r.st.emoji}</span>
            <span className="sp2-finder-main"><b>{r.st.no} · {r.st.title}</b><span>{r.k != null ? 'WHY: ' : ''}{r.label} <em>· {r.sub}</em></span></span>
            <i className="fas fa-chevron-right" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Logic({ logic: L, stories, onOpen }) {
  return (
    <details className="sp2-card sp2-logic">
      <summary><span className="sp2-card-ic">🧭</span> <b>Logic tổng hợp — 7 nhóm chủ đề</b><i className="fas fa-chevron-down sp2-chev" /></summary>
      <div className="sp2-card-body">
        <p className="sp2-note">{L.intro}</p>
        <div className="sp2-table-wrap"><table className="sp2-table"><thead><tr><th>Nhóm chủ đề</th><th>Câu hỏi gốc</th><th>Câu chuyện</th><th>Mượn sang được</th></tr></thead><tbody>
          {stories.map((st) => (
            <tr key={st.id}>
              <td><b>{st.group}</b></td><td>{st.rootQ}</td>
              <td><a href={'/app/speaking-part2?story=' + st.id} onClick={(e) => { e.preventDefault(); onOpen(st.id); }}>{st.emoji} {st.title}</a></td>
              <td>{st.borrow}</td>
            </tr>
          ))}
        </tbody></table></div>
        <div className="sp2-callout"><b>Triết lý của bộ khung</b><ul>{L.philosophy.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        <div className="sp2-callout is-warn"><b>Giới hạn — khi nào cần câu chuyện riêng</b><p>{L.limits}</p><p>{L.limitsTip}</p></div>
      </div>
    </details>
  );
}

export default function Home({ data, stories, locked, spOf, finder, onFinder, onOpen, onFull, onUpgrade }) {
  const nDone = stories.filter((s) => storyState(s, spOf(s.id), locked) === 'done').length;
  const nDoing = stories.filter((s) => storyState(s, spOf(s.id), locked) === 'doing').length;
  const next = nextStory(stories, spOf, locked);
  const h = data.howTo;
  const duo = window.Mascot ? window.Mascot.duo('happy') : '';
  return (
    <div className="t2w sp2">
      <section className="t2w-hero sp2-hero">
        <div className="t2w-hero-text">
          <h1 className="t2w-hero-title">Speaking Part 2 <span className="t2w-hero-tag">7 câu chuyện gốc</span></h1>
          <p className="t2w-hero-sub">Không học thuộc một bài riêng cho từng topic: thuộc phần <b>FIXED</b> của 1 câu chuyện (khoảng 60% bài nói), rồi thay 30–40 giây cuối (<b>WHY</b>) theo cue card.</p>
          <div className="t2w-hero-badges">
            <span className="t2w-hero-badge"><i className="fas fa-flag-checkered" /> {nDone}/{stories.length} câu chuyện đã thuộc</span>
            {nDoing > 0 && <span className="t2w-hero-badge">✍️ {nDoing} đang học</span>}
            <span className="t2w-hero-badge"><i className="fas fa-clock" /> ≤ 2:00 · ≈ {targets(data).total} từ</span>
          </div>
        </div>
        <div className="lh-mascot" aria-hidden="true" dangerouslySetInnerHTML={{ __html: duo }} />
      </section>

      <div className="t2w-flow" aria-label="Các bước của mỗi câu chuyện">
        <span className="t2w-flow-lbl">Mỗi câu chuyện gồm {STEPS.length} bước</span>
        {FLOW.map((g) => (
          <div key={g.cls} className={`t2w-phase is-${g.cls}`}><span className="t2w-phase-name">{g.phase}</span>
            <span className="t2w-phase-steps">{g.steps.map((s) => (
              <span key={s[0]} className="t2w-step"><b>{s[0]}</b><i className={`fas ${s[1]}`} /> {s[2]}</span>
            ))}</span></div>
        ))}
      </div>

      {locked
        ? <LockedBanner onUpgrade={onUpgrade} />
        : <HomeCoach next={next} nDone={nDone} doing={!!next && storyState(next, spOf(next.id), false) === 'doing'} onOpen={onOpen} />}

      <details className="sp2-card sp2-howto" open={!(nDone || nDoing)}>
        <summary><span className="sp2-card-ic">⏱️</span> <b>Cách dùng bộ khung</b> <span className="sp2-muted">— ngân sách thời gian & 3 nguyên tắc</span><i className="fas fa-chevron-down sp2-chev" /></summary>
        <div className="sp2-card-body">
          <p className="sp2-goal">🎯 {h.goal}</p>
          <div className="sp2-table-wrap"><table className="sp2-table"><thead><tr><th>Phần</th><th>Thời lượng</th><th>Số từ (ước tính)</th></tr></thead><tbody>
            {h.budget.map((r, i) => <tr key={i} className={i === h.budget.length - 1 ? 'is-total' : undefined}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
          </tbody></table></div>
          <p className="sp2-note">{h.budgetNote}</p>
          <ol className="sp2-rules">{h.rules.map((r, i) => <li key={i}><b>{r[0]}</b> {r[1]}</li>)}</ol>
        </div>
      </details>

      <Finder stories={stories} value={finder} onChange={onFinder} onOpen={onOpen} />

      <div className="t2w-grid sp2-grid">
        {stories.map((st, i) => (
          <StoryCard key={st.id} st={st} i={i} p={spOf(st.id)} locked={locked} isNext={!locked && next === st} onOpen={onOpen} onFull={onFull} />
        ))}
      </div>

      <Logic logic={data.logic} stories={stories} onOpen={onOpen} />
    </div>
  );
}
