import { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

// Shared "Gap-fill" management UI — sinh nội dung bằng AI, xem trước
// transcript đã đục lỗ, sửa tay từng đáp án, publish/gỡ publish. Dùng cả
// trong ListeningSectionEdit.jsx (card riêng) và ListeningSections.jsx
// (modal mở nhanh từ danh sách) nên là component điều khiển hoàn toàn qua
// props (value/onChange) — không tự giữ state gapFill, tránh lệch dữ liệu
// giữa 2 nơi dùng.
export default function GapFillPanel({ sectionId, transcript, value, onChange }) {
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const gapFill = value || { template: '', answers: [], published: false, generatedAt: null };

  async function generate() {
    if (!sectionId) { toast('Lưu section trước khi sinh Gap-fill', 'error'); return; }
    if (!transcript?.trim()) { toast('Section chưa có transcript', 'error'); return; }
    setGenerating(true);
    try {
      const d = await apiFetch(`/admin/listening/sections/${sectionId}/gapfill/generate`, { method: 'POST' });
      onChange({
        template: d.gapFillTemplate || '',
        answers: d.gapFillAnswers || [],
        published: false,
        generatedAt: d.gapFillGeneratedAt || null,
      });
      toast(`Đã sinh ${d.gapFillAnswers?.length || 0} chỗ trống ✓ — kiểm tra lại rồi Publish`, 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setGenerating(false); }
  }

  async function save(publish) {
    setSaving(true);
    try {
      await apiFetch(`/admin/listening/sections/${sectionId}/gapfill`, {
        method: 'PUT',
        body: JSON.stringify({ gapFillTemplate: gapFill.template, gapFillAnswers: gapFill.answers, gapFillPublished: publish }),
      });
      onChange({ ...gapFill, published: publish });
      toast(publish ? 'Đã publish Gap-fill ✓' : 'Đã lưu Gap-fill ✓');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  function setAnswerAt(idx, val) {
    const answers = [...gapFill.answers];
    answers[idx] = val;
    onChange({ ...gapFill, answers });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Gap-fill (điền từ khi nghe transcript)
        </div>
        {gapFill.published
          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>✅ Đã publish</span>
          : gapFill.template
            ? <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>⏳ Đã sinh, chưa publish</span>
            : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Chưa sinh</span>}
      </div>

      <button className="btn btn-ghost btn-sm" onClick={generate} disabled={generating || !transcript?.trim()}>
        {generating ? '⏳ Đang sinh bằng AI...' : gapFill.template ? '🪄 Sinh lại bằng AI' : '🪄 Sinh Gap-fill bằng AI'}
      </button>
      {!transcript?.trim() && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Section chưa có transcript — thêm transcript trước.</div>
      )}

      {gapFill.template && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="form-label">Transcript đã đục lỗ (xem trước)</label>
            <div style={{
              whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.7,
              background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '12px 14px', maxHeight: 320, overflowY: 'auto',
            }}>
              {gapFill.template.replace(/\[\[(\d+)\]\]/g, (_m, n) => `_____(${n})_____`)}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="form-label">Đáp án ({gapFill.answers.length} chỗ trống — sửa tay nếu cần)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {gapFill.answers.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 18 }}>{i + 1}.</span>
                  <input className="form-input" style={{ fontSize: 12 }} value={a}
                    onChange={e => setAnswerAt(i, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => save(false)} disabled={saving}>
              💾 Lưu (chưa publish)
            </button>
            <button className="btn btn-primary" onClick={() => save(true)} disabled={saving}>
              {saving ? 'Đang lưu...' : gapFill.published ? '✅ Đã publish (lưu lại)' : '🚀 Publish cho học sinh'}
            </button>
            {gapFill.published && (
              <button className="btn btn-ghost" onClick={() => save(false)} disabled={saving}>
                ⏸ Gỡ publish
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
