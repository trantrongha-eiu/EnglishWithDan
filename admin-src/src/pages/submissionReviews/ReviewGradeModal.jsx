import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { useApi } from '../../hooks/useApi';
import { ErrorState, Skeleton } from '../../components/ui/States';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { OpenResponse, TeacherBlock } from '../../components/Wt1ReviewModal';
import SpeakingCriteriaTable from '../../components/SpeakingCriteriaTable';
import { SCORE_LABELS, overallFromScores } from './grading';

// Grade one submission from the "Chấm bài khoá học & Speaking" queue:
// the student's work + the AI grade on top, the teacher's form below.
// Saving PUTs /admin/submission-reviews/:source/:id, which stores the
// teacher's grade on the row and messages the student.

const BANDS = Array.from({ length: 19 }, (_, i) => i / 2);
const num = (n) => (n == null || Number.isNaN(Number(n)) ? '–' : Math.round(Number(n) * 10) / 10);

function BandSelect({ value, onChange, label, id }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: 'var(--text2)' }}>
      {label}
      <select id={id} className="form-input" value={value ?? ''} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}>
        <option value="">—</option>
        {BANDS.map(b => <option key={b} value={b}>{b.toFixed(1)}</option>)}
      </select>
    </label>
  );
}

const box = { whiteSpace: 'pre-wrap', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, lineHeight: 1.7 };
const secTitle = { fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text3)', margin: '14px 0 4px' };

// Standalone Speaking practice attempt (SpeakingAttempt).
function SpeakingAttemptView({ a }) {
  const fb = a.aiFeedback || {};
  return (
    <>
      <div style={secTitle}>Câu hỏi</div>
      <div style={{ ...box, background: 'transparent' }}>{a.question || '—'}</div>
      <div style={secTitle}>Bản ghi âm</div>
      {a.audioUrl
        ? <audio controls preload="metadata" src={a.audioUrl} style={{ width: '100%', height: 34 }} />
        : <div className="muted" style={{ fontSize: 13 }}>Không có bản ghi âm được lưu (học sinh gõ/nhận diện giọng nói, hoặc upload lỗi) — chấm theo transcript.</div>}
      <div style={secTitle}>Transcript</div>
      <div style={box}>{a.transcript || <i>(trống)</i>}</div>
      {a.status === 'error' && <div className="hint-box" style={{ marginTop: 10 }}>⚠️ AI chấm lỗi cho lượt này — học sinh chưa có điểm AI.</div>}
      {fb.overallBand > 0 && (
        <>
          <div style={secTitle}>AI chấm</div>
          <div style={{ fontSize: 13 }}>
            <b>Band {num(fb.overallBand)}</b> · Fluency {num(fb.fluency)} · Vocabulary {num(fb.vocabulary)} · Grammar {num(fb.grammar)} · Pronunciation {fb.pronunciation ? num(fb.pronunciation) : 'N/A'}
          </div>
        </>
      )}
      {fb.criteria && <div style={{ marginTop: 8 }}><SpeakingCriteriaTable feedback={fb} /></div>}
      {(fb.overallFeedback || fb.feedback) && (<><div style={secTitle}>Nhận xét AI</div><div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{fb.overallFeedback || fb.feedback}</div></>)}
      {fb.corrections?.length > 0 && (
        <>
          <div style={secTitle}>Lỗi AI tìm thấy</div>
          {fb.corrections.map((c, i) => (
            <div key={i} style={{ fontSize: 13, marginTop: 3 }}>
              ✎ <s style={{ color: 'var(--danger)' }}>{c.original}</s> → <b style={{ color: 'var(--green)' }}>{c.corrected}</b>
              {c.explanation && <span className="muted"> ({c.explanation})</span>}
            </div>
          ))}
        </>
      )}
    </>
  );
}

function initialForm(d) {
  const t = d.teacherReview;
  const keys = d.scoreKeys || [];
  const scores = {};
  keys.forEach(k => { scores[k] = t?.scores?.[k] ?? ''; });
  // Pre-fill with the AI's band so confirming the AI grade is one click;
  // speaking leaves the criteria empty — the teacher grades by ear.
  const aiBand = d.source === 'course' ? d.review?.ai?.band : d.attempt?.aiFeedback?.overallBand;
  const band = t ? (t.band ?? '') : (d.kind === 'writing' && aiBand ? Math.round(Number(aiBand) * 2) / 2 : '');
  return { band, scores, note: t?.note || '' };
}

function GradeForm({ d, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => initialForm(d));
  const [saving, setSaving] = useState(false);
  const keys = d.scoreKeys || [];
  const isSpk = d.kind === 'speaking';

  function setScore(k, v) {
    setForm(f => {
      const scores = { ...f.scores, [k]: v };
      const auto = overallFromScores(scores, keys);
      return { ...f, scores, band: auto != null ? auto : f.band };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const scores = {};
      keys.forEach(k => { if (form.scores[k] !== '' && form.scores[k] != null) scores[k] = form.scores[k]; });
      await apiFetch(`/admin/submission-reviews/${d.source}/${d.id}`, {
        method: 'PUT',
        body: JSON.stringify({ band: form.band === '' ? null : form.band, scores, note: form.note }),
      });
      toast('Đã lưu điểm & gửi feedback cho học sinh');
      onSaved();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ borderTop: '2px solid var(--border)', marginTop: 16, paddingTop: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>🧑‍🏫 Giáo viên chấm {d.teacherReview && <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>(đã chấm — lưu lại sẽ cập nhật & báo học sinh)</span>}</div>
      {isSpk && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
          {keys.map(k => <BandSelect key={k} id={`sc-${k}`} label={SCORE_LABELS[k] || k} value={form.scores[k]} onChange={v => setScore(k, v)} />)}
        </div>
      )}
      <div style={{ maxWidth: 200 }}>
        <BandSelect id="sc-band" label={isSpk ? 'Band tổng (tự tính từ 4 tiêu chí, sửa được)' : 'Band tổng'} value={form.band} onChange={v => setForm(f => ({ ...f, band: v }))} />
      </div>
      <label htmlFor="sc-note" style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>Nhận xét gửi học sinh</label>
      <textarea id="sc-note" className="form-input" rows={5} maxLength={4000} value={form.note}
        placeholder={isSpk ? 'VD: Phát âm âm cuối /s/ còn thiếu… Lần sau thử mở rộng câu trả lời bằng ví dụ cá nhân.' : 'VD: Bài viết đủ ý, nhưng cần dùng thì quá khứ đơn nhất quán…'}
        onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ width: '100%', resize: 'vertical' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving || (form.band === '' && !form.note.trim())}>
          {saving ? '⏳ Đang gửi...' : '✅ Lưu điểm & gửi feedback'}
        </button>
      </div>
    </div>
  );
}

export default function ReviewGradeModal({ source, id, onClose, onSaved }) {
  const toast = useToast();
  const { data, error, loading, reload } = useApi(`/admin/submission-reviews/${source}/${id}`);
  const [regrading, setRegrading] = useState(false);
  const [override, setOverride] = useState(null); // detail returned by an AI re-grade
  const d0 = override || data;
  const d = d0 ? { ...d0, id } : null;

  async function regrade() {
    setRegrading(true);
    try {
      const res = await apiFetch(`/admin/submission-reviews/course/${id}/ai-grade`, { method: 'POST' });
      setOverride(res);
      toast('AI đã chấm lại bài này');
    } catch (e) { toast(e.message, 'error'); }
    finally { setRegrading(false); }
  }

  const r = d?.review;
  const title = d ? (d.source === 'course' ? r?.exercise?.title : 'Luyện Speaking') : 'Chấm bài';
  return (
    <Modal title={title || 'Chấm bài'} onClose={onClose} width={780} busy={regrading}>
      {loading && <div style={{ display: 'grid', gap: 8 }}><Skeleton height={18} /><Skeleton height={60} /><Skeleton height={60} /></div>}
      {error && <ErrorState error={error} onRetry={reload} compact />}
      {d && (
        <div style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', fontSize: 13, color: 'var(--text2)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <span>👤 <b>{d.student?.name}</b>{d.student?.username && ` (@${d.student.username})`}</span>
            <span>{d.context}</span>
            {r && <span>Lượt <b>{r.attempt}</b></span>}
            <span>{formatDate(r ? r.createdAt : d.attempt?.createdAt)}</span>
          </div>

          {d.source === 'course' ? (
            <>
              {r.exercise.instruction && <div style={{ fontSize: 13, marginTop: 10, whiteSpace: 'pre-wrap' }}><b>Đề bài:</b> {r.exercise.instruction}</div>}
              {d.kind === 'writing' && (d.rubric?.minWords || d.rubric?.targetStructures?.length > 0) && (
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {d.rubric.minWords && <>Mục tiêu ≥ {d.rubric.minWords} từ{d.rubric.maxWords ? ` (≤ ${d.rubric.maxWords})` : ''}. </>}
                  {d.rubric.targetStructures?.length > 0 && <>Cấu trúc cần dùng: {d.rubric.targetStructures.join('; ')}</>}
                </div>
              )}
              {d.kind === 'writing' && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13 }}>
                    {r.ai ? <>🤖 AI chấm: <b>Band {num(r.ai.band)}</b></> : <>🤖 Chưa có điểm AI {r.local?.aiUnavailable ? '(AI bận lúc nộp — chỉ chấm theo rubric)' : '(bài viết câu chấm theo rubric)'}</>}
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={regrade} disabled={regrading}>
                    {regrading ? '⏳ AI đang chấm...' : r.ai ? '🔄 Chấm lại bằng AI' : '🤖 Chấm bằng AI'}
                  </button>
                </div>
              )}
              <OpenResponse r={r} />
            </>
          ) : <SpeakingAttemptView a={d.attempt} />}

          {d.teacherReview && <TeacherBlock t={d.teacherReview} />}
          <GradeForm key={`${d.teacherReview?.reviewedAt || 'new'}${override ? '-ai' : ''}`} d={d} onSaved={onSaved} />
        </div>
      )}
    </Modal>
  );
}
