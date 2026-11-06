import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { downloadText } from '../utils/csvDownload';
import { renderMarkdown } from '../utils/markdown';
import WarmUpPromptPanel from '../components/WarmUpPromptPanel';

// "Tài liệu in (Tips)": for every Tips lesson of the four skills, a Markdown
// pack (AI prompt + the tip's content + for Reading/Listening its fixed
// practice WITH answer key, the "Cách làm" guide and the I do / We do steps
// — the same as the web practice) the teacher hands another AI to write a
// printable class handout — see backend/services/tipLecturePackService.js.
// Packs are built on demand (they grade every practice question to pull the
// key) and cached per tip while the page is open.

// The pack minus its prompt (PHẦN A), for the formatted preview.
function lessonPart(markdown) {
  const at = markdown.indexOf('## PHẦN B');
  return at === -1 ? markdown : markdown.slice(at);
}

export default function TipLecturePacks() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [packs, setPacks] = useState({});   // `${skill}/${lessonKey}` → pack
  const [busy, setBusy] = useState({});     // same key → action label
  const [preview, setPreview] = useState(null);
  const [tab, setTab] = useState('lesson'); // preview: 'lesson' | 'prompt'

  useEffect(() => {
    let cancelled = false;
    apiFetch('/admin/tip-packs')
      .then(d => { if (!cancelled) setSkills(d.skills || []); })
      .catch(e => { if (!cancelled) toast(e.message, 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const active = skills.find(s => s.skill === params.get('skill')) || skills[0];
  const groups = useMemo(() => {
    if (!active) return [];
    const needle = q.trim().toLowerCase();
    const tips = active.tips.filter(t => !needle || `${t.title} ${t.category}`.toLowerCase().includes(needle));
    const byCat = new Map();
    tips.forEach(t => { if (!byCat.has(t.category)) byCat.set(t.category, []); byCat.get(t.category).push(t); });
    return [...byCat.entries()];
  }, [active, q]);

  // renderMarkdown escapes every bit of tip text before adding its own tags.
  const previewHtml = useMemo(() => (preview ? renderMarkdown(lessonPart(preview.markdown)) : ''), [preview]);

  async function getPack(skill, lessonKey, label) {
    const k = `${skill}/${lessonKey}`;
    if (packs[k]) return packs[k];
    setBusy(b => ({ ...b, [k]: label }));
    try {
      // a pack with a practice grades every question: allow a slow cold start
      const d = await apiFetch(`/admin/tip-packs/${skill}/${encodeURIComponent(lessonKey)}`, { timeout: 90000 });
      setPacks(p => ({ ...p, [k]: d }));
      return d;
    } catch (e) {
      toast(e.message || 'Không tạo được tài liệu', 'error');
      return null;
    } finally {
      setBusy(b => { const n = { ...b }; delete n[k]; return n; });
    }
  }

  async function download(tip) {
    const p = await getPack(active.skill, tip.lessonKey, 'Đang tạo file…');
    if (!p) return;
    downloadText(p.markdown, p.filename);
    toast(`Đã tải ${p.filename}`, 'success');
  }

  async function copyText(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(msg, 'success');
    } catch {
      toast('Trình duyệt chặn copy — hãy dùng nút Tải file', 'error');
    }
  }

  async function openPreview(tip) {
    const p = await getPack(active.skill, tip.lessonKey, 'Đang tạo…');
    if (p) { setTab('lesson'); setPreview(p); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <details className="hint-box" style={{ borderRadius: 10, padding: '10px 14px', lineHeight: 1.6 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
          Soạn bài giảng in từ bài Tips — mỗi bài 1 file Markdown, nội dung khớp đúng bài Tips và bài luyện tập trên web
        </summary>
        <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
          <li><b>Tải file .md</b> → đính kèm vào ChatGPT / Gemini / Claude (hoặc mở <b>Xem</b> → <b>Copy cả tài liệu</b> rồi dán).</li>
          <li>File gồm: <b>A</b> prompt cho AI · <b>B</b> nội dung bài Tips · <b>C</b> (Reading / Listening) cách làm, đề thật, đáp án, dẫn chứng, các bước làm mẫu — Listening có thêm mốc audio + transcript.</li>
          <li>AI trả về phiếu học viên + đáp án cho giáo viên. <b>Đối chiếu đáp án với phần C trước khi in.</b></li>
        </ol>
        <div style={{ color: 'var(--text3)', marginTop: 4 }}>File có đáp án — chỉ gửi cho AI / giáo viên, không phát nguyên file cho học viên.</div>
      </details>

      <div className="inner-tabs-nav">
        {skills.map(s => (
          <button key={s.skill} className={`inner-tab${active && s.skill === active.skill ? ' active' : ''}`}
            onClick={() => setParams({ skill: s.skill }, { replace: true })}>
            {s.label} <span style={{ opacity: 0.6 }}>({s.tips.length})</span>
          </button>
        ))}
      </div>

      {active && <WarmUpPromptPanel key={active.skill} skill={active.skill} />}

      <div className="filter-bar">
        <input className="form-input search-input" placeholder="Tìm theo tên bài / nhóm…" value={q}
          onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      {loading ? <div className="table-empty">Đang tải…</div>
        : !groups.length ? <div className="table-empty">Không có bài Tips nào.</div>
          : groups.map(([cat, tips]) => (
            <section key={cat} className="tp-group">
              <div className="tp-group-head">
                {cat} <span>· {tips.length} bài</span>
              </div>
              <div className="tp-list">
                {tips.map(t => {
                  const k = `${active.skill}/${t.lessonKey}`;
                  const working = busy[k];
                  return (
                    <div key={k} className="tp-row">
                      <span className="tp-icon">{t.icon}</span>
                      <div className="tp-main">
                        <div className="tp-title">{t.title}</div>
                        {t.hasPractice
                          ? <span className="tp-tag tp-tag-practice">Lý thuyết + bài luyện đề thật + đáp án</span>
                          : <span className="tp-tag">Lý thuyết · AI tự soạn bài tập</span>}
                      </div>
                      <div className="tp-actions">
                        {working && <span className="tp-working">{working}</span>}
                        <button className="btn btn-ghost btn-sm" disabled={!!working} onClick={() => openPreview(t)}>👁 Xem</button>
                        <button className="btn btn-primary btn-sm" disabled={!!working} onClick={() => download(t)}>📥 Tải .md</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: 920, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{preview.title}</div>
              <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            </div>
            <div className="inner-tabs-nav" style={{ padding: '0 20px' }}>
              <button className={`inner-tab${tab === 'lesson' ? ' active' : ''}`} onClick={() => setTab('lesson')}>Nội dung (B + C)</button>
              <button className={`inner-tab${tab === 'prompt' ? ' active' : ''}`} onClick={() => setTab('prompt')}>Prompt cho AI (A)</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflow: 'auto' }}>
              {tab === 'lesson'
                ? <div className="md-preview tp-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                : <pre className="tp-prompt">{preview.prompt}</pre>}
            </div>
            <div className="modal-footer">
              <span style={{ color: 'var(--text3)', fontSize: 12, marginRight: 'auto' }}>{preview.filename}</span>
              <button className="btn btn-ghost" onClick={() => copyText(preview.prompt, 'Đã copy prompt — đính kèm file .md khi gửi cho AI')}>📋 Copy prompt</button>
              <button className="btn btn-ghost" onClick={() => copyText(preview.markdown, 'Đã copy cả tài liệu — dán thẳng vào AI')}>📄 Copy cả tài liệu</button>
              <button className="btn btn-primary" onClick={() => downloadText(preview.markdown, preview.filename)}>📥 Tải file .md</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
