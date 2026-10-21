import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

// Pre-listening warm-up ("Synonym Hunt" + "Paraphrase Detectives") for one
// Listening section. Students see it before listening (ungraded, no
// answers); the answer key below is teacher-only. Loads/saves through its
// own endpoint — the section GET never carries warmUp (select:false).
const BLANK = '____';
const emptySyn = () => ({ keyword: '', answer: '' });
const emptyPara = () => ({ question: '', evidence: '', answer: '' });

export default function WarmUpPanel({ sectionId, hasTranscript }) {
  const toast = useToast();
  const [warmUp, setWarmUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch(`/admin/listening/sections/${sectionId}/warmup`)
      .then(d => { if (alive) setWarmUp(d.warmUp); })
      .catch(() => { if (alive) toast('Không tải được warm-up', 'error'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [sectionId, toast]);

  async function generate() {
    if ((warmUp?.synonyms?.length || warmUp?.paraphrases?.length)
      && !window.confirm('Sinh lại sẽ thay toàn bộ warm-up hiện tại (kể cả phần đã sửa tay). Tiếp tục?')) return;
    setGenerating(true);
    try {
      const d = await apiFetch(`/admin/listening/sections/${sectionId}/warmup/generate`, { method: 'POST', body: JSON.stringify({}) });
      setWarmUp(d.warmUp);
      setDirty(false);
      toast(`Đã sinh ${d.warmUp.synonyms.length} cặp từ + ${d.warmUp.paraphrases.length} paraphrase ✓`, 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setGenerating(false); }
  }

  async function save() {
    const bad = (warmUp.paraphrases || []).findIndex(p => p.question.trim() && p.evidence.split(BLANK).length !== 2);
    if (bad >= 0) { toast(`Paraphrase ${bad + 1}: evidence phải có đúng 1 chỗ trống "${BLANK}"`, 'error'); return; }
    setSaving(true);
    try {
      const d = await apiFetch(`/admin/listening/sections/${sectionId}/warmup`, {
        method: 'PUT',
        body: JSON.stringify({ synonyms: warmUp.synonyms, paraphrases: warmUp.paraphrases }),
      });
      setWarmUp(d.warmUp);
      setDirty(false);
      toast('Đã lưu warm-up ✓');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function edit(list, idx, field, value) {
    setDirty(true);
    setWarmUp(w => ({ ...w, [list]: w[list].map((it, i) => (i === idx ? { ...it, [field]: value } : it)) }));
  }
  function addRow(list) {
    setDirty(true);
    setWarmUp(w => ({ ...w, [list]: [...(w[list] || []), list === 'synonyms' ? emptySyn() : emptyPara()] }));
  }
  function removeRow(list, idx) {
    setDirty(true);
    setWarmUp(w => ({ ...w, [list]: w[list].filter((_, i) => i !== idx) }));
  }

  const title = (
    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Warm-up trước khi nghe
    </div>
  );
  if (loading) return <div>{title}<div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Đang tải...</div></div>;

  const syn = warmUp?.synonyms || [];
  const para = warmUp?.paraphrases || [];
  const has = syn.length > 0 || para.length > 0;
  const cell = { fontSize: 12 };
  const th = { fontSize: 11, fontWeight: 700, color: 'var(--text3)', textAlign: 'left', padding: '4px 6px' };
  const td = { padding: '3px 6px', verticalAlign: 'top' };
  const delBtn = (list, i) => (
    <button className="btn btn-ghost btn-sm" title="Xoá dòng" onClick={() => removeRow(list, i)} style={{ padding: '4px 8px' }}>✕</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        {title}
        {has
          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>✅ {syn.length} synonym · {para.length} paraphrase — học viên đang thấy</span>
          : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Chưa có</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
        Học viên điền trước khi nghe, không chấm điểm. Cột đáp án chỉ giáo viên/admin xem được.
        {warmUp?.editedAt ? ' · Đã sửa tay' : warmUp?.generatedAt ? ' · AI sinh' : ''}
      </div>

      <button className="btn btn-ghost btn-sm" onClick={generate} disabled={generating || !hasTranscript}>
        {generating ? '⏳ Đang sinh bằng AI (~1 phút)...' : has ? '🪄 Sinh lại bằng AI' : '🪄 Sinh warm-up bằng AI'}
      </button>
      {!hasTranscript && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Section chưa có transcript.</div>}

      {warmUp && (
        <>
          <div style={{ marginTop: 16 }}>
            <label className="form-label">Activity 1 — Synonym Hunt</label>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ ...th, width: 28 }}>#</th>
                <th style={th}>Keyword trong câu hỏi</th>
                <th style={th}>Đáp án (từ trong transcript, nhiều đáp án cách nhau " / ")</th>
                <th style={{ width: 40 }} />
              </tr></thead>
              <tbody>
                {syn.map((s, i) => (
                  <tr key={i}>
                    <td style={{ ...td, ...cell, color: 'var(--text3)', paddingTop: 10 }}>{i + 1}</td>
                    <td style={td}><input className="form-input" style={cell} value={s.keyword} onChange={e => edit('synonyms', i, 'keyword', e.target.value)} /></td>
                    <td style={td}><input className="form-input" style={cell} value={s.answer} onChange={e => edit('synonyms', i, 'answer', e.target.value)} /></td>
                    <td style={td}>{delBtn('synonyms', i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => addRow('synonyms')}>+ Thêm cặp từ</button>
          </div>

          <div style={{ marginTop: 18 }}>
            <label className="form-label">Activity 2 — Paraphrase Detectives (evidence dùng <code>{BLANK}</code> cho chỗ trống)</label>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <th style={{ ...th, width: 28 }}>#</th>
                <th style={{ ...th, width: '28%' }}>Question keywords</th>
                <th style={th}>Transcript evidence</th>
                <th style={{ ...th, width: '16%' }}>Đáp án</th>
                <th style={{ width: 40 }} />
              </tr></thead>
              <tbody>
                {para.map((p, i) => (
                  <tr key={i}>
                    <td style={{ ...td, ...cell, color: 'var(--text3)', paddingTop: 10 }}>{i + 1}</td>
                    <td style={td}><input className="form-input" style={cell} value={p.question} onChange={e => edit('paraphrases', i, 'question', e.target.value)} /></td>
                    <td style={td}><input className="form-input" style={cell} value={p.evidence} onChange={e => edit('paraphrases', i, 'evidence', e.target.value)} /></td>
                    <td style={td}><input className="form-input" style={cell} value={p.answer} onChange={e => edit('paraphrases', i, 'answer', e.target.value)} /></td>
                    <td style={td}>{delBtn('paraphrases', i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => addRow('paraphrases')}>+ Thêm paraphrase</button>
          </div>

          <div style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
              {saving ? 'Đang lưu...' : dirty ? '💾 Lưu warm-up' : '✓ Đã lưu'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
