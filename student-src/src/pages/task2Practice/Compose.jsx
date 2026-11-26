import { Fragment, useEffect, useRef } from 'react';
import {
  isStaff, LESSON_MIN_WORDS, LESSON_SECTIONS, SECTION_GROUPS, SENT_GROUPS, sentenceParts, sentGroupType, sentSection,
  sectionsFilled, sectionsWords, templateFor, tplSection, wc,
} from '../../utils/task2Practice';
import { ideaSides } from './lib';
import { BusyButton, Html, TplLine } from './Parts';
import { CoWrite } from './CoWrite';

// The split-screen writer: reference (left) · essay (right). Sections are
// autosaved while typing (useLesson); students retype the sentences (paste
// is blocked), staff get ＋ to insert them at the caret.

function SaveState({ s }) {
  switch (s) {
    case 'dirty': return <><i className="fas fa-pen" /> Đang soạn…</>;
    case 'saving': return <><i className="fas fa-spinner fa-spin" /> Đang lưu…</>;
    case 'saved': return <><i className="fas fa-check" /> Đã lưu</>;
    case 'error': return <><i className="fas fa-exclamation-triangle" /> Chưa lưu được — sẽ thử lại</>;
    default: return null;
  }
}

function Section({ s, c }) {
  const C = c.compose;
  const txt = c.lesson.sections[s.key] || '';
  const active = s.phase === C.phase;
  const tpl = templateFor(c.tplData, c.t, C.tplLevel);
  const tplTitle = tplSection(tpl, s.key)?.title || '';
  // "② Body 1 – Advantages · Ưu điểm" → "Advantages · Ưu điểm"
  const focus = (tplTitle.split(/\s[–-]\s/)[1] || '').trim();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    c.registerTa(s.key, el);
    if (el && !isStaff() && window.PasteGuard) window.PasteGuard.attach(el, { hint: 'tự gõ lại câu để nhớ lâu hơn nha!' });
  }, [s.key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className={`t2c-sec ${active ? 'is-active' : 'is-other'}`}>
      <div className="t2c-sec-head">
        <b>{s.label}</b>
        <span className="t2c-sec-en">{s.en}{focus && s.key.startsWith('body') ? ` · ${focus}` : ''}</span>
        <span className={`t2c-sec-tag ${s.phase}`}>{s.phase === 'class' ? 'Trên lớp' : 'Về nhà'}</span>
        <span className="t2c-sec-wc" id={`t2c-wc-${s.key}`}>{wc(txt)} từ</span>
      </div>
      <textarea ref={ref} className="t2c-ta" id={`t2c-ta-${s.key}`} data-key={s.key} rows={active ? 8 : 3} spellCheck="false" placeholder={s.ph} value={txt}
        onChange={(e) => c.setSection(s.key, e.target.value)} onFocus={() => c.setCompose({ lastFocus: s.key })} />
    </section>
  );
}

// "Xem template": any of the 7 essay types, Band 6+ / 7+, Vietnamese on/off
// (js/shared/task2-generic-tpl.js — the same panel as writing.html)
function TplPanel({ c }) {
  const G = window.Task2GenericTpl;
  if (!G) return null;
  const C = c.compose;
  let body = '';
  if (C.tplType) {
    if (c.tplData === null) body = '<div class="gtpl-empty">⏳ Đang tải...</div>';
    else if (c.tplData === 'error' || !Object.keys(c.tplData || {}).length) body = '<div class="gtpl-empty">Không tải được nội dung. Vui lòng thử lại.</div>';
    else body = G.html(c.tplData, C.tplLevel, C.tplType, !!C.tplVi);
  }
  return (
    <>
      <button type="button" className={`t2-secondary t2c-tpl-btn${C.tplOpen ? ' is-open' : ''}`} id="t2c-tpl-btn" onClick={() => c.setCompose({ tplOpen: !C.tplOpen })}>
        {C.tplOpen ? <><i className="fas fa-chevron-up" /> Ẩn template</> : <><i className="fas fa-file-lines" /> Xem template</>}
      </button>
      <div id="pw-tpl-inline" className="pw-tpl t2c-tpl" style={C.tplOpen ? undefined : { display: 'none' }}>
        <div className="pw-tpl-ask">Chọn dạng bài bạn muốn xem template:</div>
        <div className="pw-tpl-types">{G.TYPES.map((x, i) => (
          <button key={x.id} type="button" className={`pw-tpl-type${C.tplType === x.id ? ' active' : ''}`} data-type={x.id} onClick={() => c.setCompose({ tplType: x.id })}>
            <span className="pw-tpl-type-no">{String(i + 1).padStart(2, '0')}</span> {x.label}
          </button>
        ))}</div>
        <div className="pw-tpl-bar">
          <div className="pw-tpl-levels">
            <button type="button" className={`pw-tpl-level${C.tplLevel === 'band6' ? ' active' : ''}`} data-level="band6" onClick={() => c.setCompose({ tplLevel: 'band6' })}>🌱 Band 6+</button>
            <button type="button" className={`pw-tpl-level${C.tplLevel === 'band7' ? ' active' : ''}`} data-level="band7" onClick={() => c.setCompose({ tplLevel: 'band7' })}>🏆 Band 7+</button>
          </div>
          <button type="button" className="pw-tpl-vi-btn" id="pw-tpl-vi-btn" onClick={() => c.setCompose({ tplVi: !C.tplVi })}>{C.tplVi ? '🇻🇳 Ẩn tiếng Việt' : '🇻🇳 Hiện tiếng Việt'}</button>
        </div>
        <Html as="div" id="pw-tpl-body" className="pw-tpl-body" html={C.tplOpen ? body : ''} />
      </div>
    </>
  );
}

function Ins({ text, c }) {
  if (!isStaff()) return null;
  return <button type="button" className="t2c-ins" title="Chèn vào chỗ con trỏ" aria-label="Chèn vào bài" onClick={() => c.insertRef(text)}>＋</button>;
}

function RefSentences({ c }) {
  const L = c.lesson;
  if (!L.sentences.length) return <p className="t2c-note">Đề này chưa có câu dịch. Dùng tab Ý tưởng và Template để viết nhé.</p>;
  const missing = L.sentences.filter((s) => !s.en).length;
  const item = (s) => {
    const i = L.sentences.indexOf(s);
    // The conclusion is the student's own paragraph — no Vietnamese source
    const { vi, kw } = s.type === 'short_writing' ? { vi: '', kw: '' } : sentenceParts(s.questionText);
    if (s.en) {
      return (
        <div className="t2c-sent" key={i}>
          <div className="t2c-sent-en">{s.en}</div>
          {vi && <div className="t2c-sent-vi">{vi}</div>}
          {kw && <div className="t2c-sent-meta"><span className="t2c-kw">{kw}</span></div>}
          <Ins text={s.en} c={c} />
        </div>
      );
    }
    if (c.compose.revealed[i] && s.model) {
      return (
        <div className="t2c-sent is-model" key={i}>
          <div className="t2c-sent-en">{s.model}</div>
          {vi && <div className="t2c-sent-vi">{vi}</div>}
          <div className="t2c-sent-meta">Câu mẫu — bạn chưa tự dịch câu này</div>
          <Ins text={s.model} c={c} />
        </div>
      );
    }
    return (
      <div className="t2c-sent is-todo" key={i}>
        {vi && <div className="t2c-sent-vi">{vi}</div>}
        <div className="t2c-sent-meta">{kw && <span className="t2c-kw">{kw}</span>}{s.type === 'short_writing' ? 'Chưa viết' : 'Chưa dịch'}{s.model && <> · <button type="button" className="t2-link" style={{ padding: 0, fontSize: 11 }} onClick={() => c.setCompose({ revealed: { ...c.compose.revealed, [i]: true } })}>Xem câu mẫu</button></>}</div>
      </div>
    );
  };
  const bySection = L.sentences.some((s) => s.type !== 'short_writing' && sentSection(s));
  const groups = bySection ? SECTION_GROUPS : SENT_GROUPS;
  const groupOf = bySection ? sentSection : sentGroupType;
  return (
    <>
      <p className="t2c-note">Câu bạn đã dịch ở bước ③. {isStaff() ? <>Bấm <b>＋</b> để chèn vào ô đang viết (chỗ con trỏ)</> : <><b>Tự gõ lại</b> câu vào ô đang viết — gõ tay giúp bạn nhớ lâu hơn</>}, rồi chỉnh lại cho hợp đoạn văn.</p>
      {groups.map((g) => {
        const list = L.sentences.filter((s) => groupOf(s) === g.type);
        return list.length ? <Fragment key={g.type}><div className="t2c-group">{g.title}</div>{list.map(item)}</Fragment> : null;
      })}
      {missing > 0 && <BusyButton className="t2-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={c.translateFromCompose}><i className="fas fa-language" /> Dịch {missing} câu còn lại</BusyButton>}
    </>
  );
}

function RefIdeas({ c }) {
  const sides = ideaSides(c.t);
  return (
    <>
      <p className="t2-note t2c-note">Ý tưởng nhóm bạn đã ghi ở bước ② — chọn ý mạnh nhất cho mỗi đoạn thân bài.</p>
      {sides.map((h, i) => (
        <Fragment key={i}>
          <div className={`t2c-group t2-side-txt${i % 4}`}>{h.side}</div>
          <div className={`t2c-mine t2-side-c${i % 4}`}>{(c.notes[i] || '').trim() ? c.notes[i] : <span style={{ color: '#9ca3af' }}>(chưa ghi ý nào)</span>}</div>
          {(h.points || []).length > 0 && <details className="t2c-tplsec" style={{ marginTop: 6 }}><summary>Gợi ý ý chính</summary><ul className="t2-brainstorm-hint-list">{h.points.map((p, k) => <li key={k}>{p}</li>)}</ul></details>}
        </Fragment>
      ))}
    </>
  );
}

function RefVocab({ c }) {
  const list = c.vocab.for === c.t._id ? c.vocab.list : [];
  if (!list.length) return <p className="t2c-note">Chưa tải được từ vựng của buổi này.</p>;
  return (
    <>
      <p className="t2c-note">Từ vựng &amp; collocations của buổi{isStaff() ? <> — bấm <b>＋</b> để chèn</> : ' — tự gõ vào bài để nhớ lâu hơn'}.</p>
      {list.map((v, i) => (
        <div key={i} className="t2c-sent" style={{ borderLeftColor: '#6366f1' }}>
          <div className="t2c-sent-en">{v.term}</div>
          {v.definitionVi && <div className="t2c-sent-vi">{v.definitionVi}</div>}
          {v.example && <div className="t2c-sent-meta" style={{ fontStyle: 'italic' }}>{v.example}</div>}
          <Ins text={v.term} c={c} />
        </div>
      ))}
    </>
  );
}

// The book template for this essay type; the sections of the current phase start open
function RefTemplate({ c }) {
  if (c.tplData === null) return <p className="t2c-note"><i className="fas fa-spinner fa-spin" /> Đang tải template...</p>;
  const C = c.compose;
  const level = C.tplLevel || 'band7';
  const levels = (
    <div className="t2c-tpl-levels" role="tablist" aria-label="Trình độ template">
      {[['band6', '🌱 Band 6+'], ['band7', '🏆 Band 7+']].map(([k, l]) => (
        <button key={k} type="button" role="tab" aria-selected={k === level ? 'true' : 'false'} className={`t2c-tpl-lv${k === level ? ' active' : ''}`} data-level={k} onClick={() => c.setCompose({ tplLevel: k })}>{l}</button>
      ))}
    </div>
  );
  const tpl = templateFor(c.tplData === 'error' ? {} : c.tplData, c.t, level);
  if (!tpl || !(tpl.sections || []).length) return <>{levels}<p className="t2c-note">Chưa có template cho dạng bài này.</p></>;
  const open = new Set(LESSON_SECTIONS.filter((s) => s.phase === C.phase).map((s) => tplSection(tpl, s.key)).filter(Boolean));
  return (
    <>
      {levels}
      <p className="t2c-note">Template {level === 'band6' ? 'Band 6+' : 'Band 7+'} ({tpl.name}) — giống trang Task 2 Templates. Thay phần <mark style={{ background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '0 3px' }}>(…)</mark> bằng nội dung của đề này — không chép nguyên văn.</p>
      {tpl.sections.map((sec, i) => (
        <details key={`${level}${i}`} className="t2c-tplsec" open={open.has(sec)}>
          <summary>{sec.title}</summary>
          {(sec.lines || []).map((ln, k) => (
            <div key={k} className="t2c-tpl">{ln.label && <div className="t2c-tpl-label">{ln.label}</div>}<TplLine en={ln.en} />{ln.vi && <div className="t2c-sent-vi">{String(ln.vi).replace(/^→\s*/, '')}</div>}<Ins text={ln.en} c={c} /></div>
          ))}
        </details>
      ))}
    </>
  );
}

export function Compose({ c }) {
  const t = c.t;
  const L = c.lesson;
  const C = c.compose;
  const total = sectionsWords(L.sections);
  const filled = sectionsFilled(L.sections);
  const nTrans = L.sentences.filter((s) => s.en).length;
  const tabs = [['sentences', 'Câu đã dịch', `${nTrans}/${L.sentences.length}`], ['ideas', 'Ý tưởng', ''], ['vocab', 'Từ vựng', ''], ['template', 'Template', '']];
  let body;
  if (C.tab === 'ideas') body = <RefIdeas c={c} />;
  else if (C.tab === 'vocab') body = <RefVocab c={c} />;
  else if (C.tab === 'template') body = <RefTemplate c={c} />;
  else body = <RefSentences c={c} />;
  return (
    <div className="t2c">
      <div className="t2c-top">
        <button className="t2-back-btn" onClick={c.closeCompose}><i className="fas fa-arrow-left" /> {c.sessionLabel || 'Buổi học'}</button>
        <div className="t2c-title" title={t.topicName}>{t.topicEmoji || '📝'} {t.topicName}</div>
        <div className="t2-seg" role="group" aria-label="Phần viết">
          <button type="button" className={C.phase === 'class' ? 'active' : ''} onClick={() => c.setPhase('class')}>🏫 Trên lớp · MB + TB1</button>
          <button type="button" className={C.phase === 'home' ? 'active' : ''} onClick={() => c.setPhase('home')}>🏠 Về nhà · TB2 + KB</button>
        </div>
        <span className={`t2c-wc${total >= LESSON_MIN_WORDS ? ' is-ok' : ''}`} id="t2c-total">{total} từ</span>
        <span className={`t2c-save${c.saveState === 'error' ? ' is-error' : ''}`} id="t2c-save"><SaveState s={c.saveState} /></span>
      </div>
      <button type="button" className="t2c-ref-toggle" onClick={() => c.setCompose({ refOpen: !C.refOpen })}><span>📚 Câu đã dịch ({nTrans}) · Ý tưởng · Template</span><i className={`fas fa-chevron-${C.refOpen ? 'up' : 'down'}`} /></button>
      <div className="t2c-grid">
        <aside className={`t2c-ref${C.refOpen ? ' is-open' : ''}`} id="t2c-ref" aria-label="Tài liệu tham khảo">
          <div className="t2c-tabs" role="tablist">
            {tabs.map(([k, label, count]) => (
              <button key={k} type="button" role="tab" aria-selected={C.tab === k ? 'true' : 'false'} className={`t2c-tab${C.tab === k ? ' active' : ''}`} onClick={() => c.setCompose({ tab: k })}>{label}{count && <span className="t2c-count">{count}</span>}</button>
            ))}
          </div>
          <div className="t2c-ref-body" id="t2c-ref-body">{body}</div>
        </aside>
        <main className="t2c-main">
          <details className="t2-prompt-box" open={c.promptOpen} onToggle={(e) => c.setPromptOpen(e.currentTarget.open)}>
            <summary className="t2-prompt-box-label">📋 Đề bài <span className="t2-prompt-peek">— {(t.prompt || '').slice(0, 70)}{(t.prompt || '').length > 70 ? '…' : ''}</span></summary>
            <p>{t.prompt}</p>
          </details>
          <CoWrite t={t} sections={L.sections} ready={L.status === 'ready'} phase={C.phase} />
          <TplPanel c={c} />
          {C.phase === 'class'
            ? <div className="t2c-tip"><b>🏫 Trên lớp:</b> viết <b>Mở bài</b> (cá nhân) rồi <b>Thân bài 1</b> (thảo luận nhóm → tự viết). Dùng câu đã dịch ở cột trái làm điểm tựa — {isStaff() ? <>bấm <b>＋</b> để chèn vào chỗ con trỏ rồi sửa cho liền mạch</> : <><b>tự gõ lại</b> từng câu (không dán) để nhớ lâu hơn, rồi sửa cho liền mạch</>}.</div>
            : <div className="t2c-tip is-home"><b>🏠 Về nhà:</b> viết <b>Thân bài 2</b> + <b>Kết bài</b> theo template Band 6+ / 7+ (tab <b>Template</b>). Dùng ý tưởng và câu đã dịch, nhưng <b>viết bằng lời của bạn</b> — đừng chép nguyên bài mẫu.</div>}
          {LESSON_SECTIONS.map((s) => <Section key={s.key} s={s} c={c} />)}
          <div className="t2c-foot">
            <span className="t2c-foot-note">Bài tự lưu khi bạn gõ. Đủ 4 phần ({filled}/4) và ≥ {LESSON_MIN_WORDS} từ thì nộp để AI chấm.</span>
            {t.writingTask2Id && <BusyButton className="t2-primary is-write" onClick={c.submitEssay} disabled={filled < LESSON_SECTIONS.length} title={filled < LESSON_SECTIONS.length ? 'Viết đủ 4 phần trước' : undefined}><i className="fas fa-paper-plane" /> Nộp bài chấm AI</BusyButton>}
          </div>
        </main>
      </div>
    </div>
  );
}
