import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { downloadText } from '../utils/csvDownload';

// "Tài liệu in (Tips)": for every Tips lesson of the four skills, a Markdown
// pack (AI prompt + the tip's content + for Reading/Listening its fixed
// practice WITH answer key) the teacher hands another AI to write a
// printable class handout — see backend/services/tipLecturePackService.js.
// Packs are built on demand (they grade every practice question to pull the
// key) and cached per tip while the page is open.

export default function TipLecturePacks() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [packs, setPacks] = useState({});   // `${skill}/${lessonKey}` → pack
  const [busy, setBusy] = useState({});     // same key → action label
  const [preview, setPreview] = useState(null);

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

  async function copy(tip, what) {
    const p = await getPack(active.skill, tip.lessonKey, 'Đang tạo…');
    if (!p) return;
    try {
      await navigator.clipboard.writeText(what === 'prompt' ? p.prompt : p.markdown);
      toast(what === 'prompt' ? 'Đã copy prompt — đính kèm file .md khi gửi cho AI' : 'Đã copy cả tài liệu — dán thẳng vào AI', 'success');
    } catch {
      toast('Trình duyệt chặn copy — hãy dùng nút Tải file', 'error');
    }
  }

  async function openPreview(tip) {
    const p = await getPack(active.skill, tip.lessonKey, 'Đang tạo…');
    if (p) setPreview(p);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="hint-box" style={{ borderRadius: 8, padding: '12px 14px', lineHeight: 1.6 }}>
        <strong>Soạn bài giảng in từ bài Tips</strong> — mỗi mục có 1 file Markdown gồm: <b>(A)</b> prompt cho AI,
        {' '}<b>(B)</b> nội dung bài Tips, <b>(C)</b> với Reading/Listening: bài luyện tập đề thật đang dùng trên web kèm
        {' '}<b>đáp án, dẫn chứng, giải thích</b> (Listening có link audio + mốc thời gian + transcript).
        <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
          <li><b>Tải file .md</b>, mở ChatGPT / Gemini / Claude và đính kèm file (hoặc <b>Copy cả tài liệu</b> rồi dán).</li>
          <li>Nếu đã đính kèm file, chỉ cần <b>Copy prompt</b> và gửi kèm.</li>
          <li>AI trả về bài giảng (phiếu học viên + đáp án cho giáo viên). <b>Đối chiếu đáp án với phần C trước khi in.</b></li>
        </ol>
        <div style={{ color: 'var(--text3)', marginTop: 4 }}>File có đáp án — chỉ gửi cho AI / giáo viên, không phát nguyên file cho học viên.</div>
      </div>

      <div className="inner-tabs-nav">
        {skills.map(s => (
          <button key={s.skill} className={`inner-tab${active && s.skill === active.skill ? ' active' : ''}`}
            onClick={() => setParams({ skill: s.skill }, { replace: true })}>
            {s.label} <span style={{ opacity: 0.6 }}>({s.tips.length})</span>
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <input className="form-input search-input" placeholder="Tìm theo tên bài / nhóm…" value={q}
          onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      {loading ? <div className="table-empty">Đang tải…</div>
        : !groups.length ? <div className="table-empty">Không có bài Tips nào.</div>
          : groups.map(([cat, tips]) => (
            <div key={cat}>
              <div className="section-header" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {cat} <span style={{ color: 'var(--text3)', fontWeight: 500 }}>· {tips.length} bài</span>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Bài Tips</th>
                      <th>Nội dung file</th>
                      <th style={{ textAlign: 'right' }}>Tài liệu in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.map(t => {
                      const k = `${active.skill}/${t.lessonKey}`;
                      const working = busy[k];
                      return (
                        <tr key={k}>
                          <td><span style={{ marginRight: 6 }}>{t.icon}</span><strong>{t.title}</strong></td>
                          <td>
                            {t.hasPractice
                              ? <span className="badge badge-green"><span className="dot" />Lý thuyết + bài luyện tập đề thật + đáp án</span>
                              : <span className="badge badge-gray"><span className="dot" />Lý thuyết (AI tự soạn bài tập)</span>}
                          </td>
                          <td>
                            <div className="row-actions" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {working && <span style={{ color: 'var(--text3)', fontSize: 12 }}>{working}</span>}
                              <button className="btn btn-primary btn-sm" disabled={!!working} onClick={() => download(t)}>📥 Tải file .md</button>
                              <button className="btn btn-ghost btn-sm" disabled={!!working} onClick={() => copy(t, 'prompt')}>📋 Copy prompt</button>
                              <button className="btn btn-ghost btn-sm" disabled={!!working} onClick={() => copy(t, 'all')}>📄 Copy cả tài liệu</button>
                              <button className="btn btn-ghost btn-sm" disabled={!!working} onClick={() => openPreview(t)}>👁 Xem</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" style={{ maxWidth: 900, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{preview.filename}</div>
              <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            </div>
            <div className="modal-body">
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12.5, lineHeight: 1.55, maxHeight: '65vh', overflow: 'auto', margin: 0, fontFamily: 'var(--mono)' }}>
                {preview.markdown}
              </pre>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(preview.prompt).then(() => toast('Đã copy prompt', 'success'))}>📋 Copy prompt</button>
              <button className="btn btn-primary" onClick={() => downloadText(preview.markdown, preview.filename)}>📥 Tải file .md</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
