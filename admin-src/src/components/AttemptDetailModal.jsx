import Modal from './ui/Modal';
import { useApi } from '../hooks/useApi';
import { ErrorState, Skeleton } from './ui/States';

// One history row's answers for the skills without a student-page review
// to deep-link to (dictation, gap-fill, Task 1/Task 2 practice, Viết câu
// nâng cao, Ngữ pháp, Từ vựng, Templates, Writing lẻ) —
// GET /admin/attempt-detail/:skill/:id (backend/routes/admin/attemptDetail.js),
// already normalised to { title, subtitle, summary, items[], emptyNote }.

const box = { whiteSpace: 'pre-wrap' };

function Item({ it, i }) {
  const color = it.correct === true ? 'var(--green)' : it.correct === false ? 'var(--danger)' : 'var(--border)';
  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '8px 12px', marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>
      <div style={{ fontWeight: 600, ...box }}>{i + 1}. {it.prompt}</div>
      {it.options?.length > 0 && (
        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
          {it.options.map((o, k) => <div key={k}>{String.fromCharCode(65 + k)}. {o}</div>)}
        </div>
      )}
      {(it.answer || it.correct !== false || it.correctAnswer) && (
        <div style={{ color: it.correct === false ? 'var(--danger)' : it.correct ? 'var(--green)' : undefined, ...box }}>
          {it.correct === true ? '✔ ' : it.correct === false ? '✗ ' : ''}Trả lời: <b>{it.answer || <i>(bỏ trống)</i>}</b>
          {it.note && <span className="muted" style={{ fontWeight: 400 }}> · {it.note}</span>}
        </div>
      )}
      {it.correct !== true && it.correctAnswer && <div style={{ color: 'var(--green)', ...box }}>Đáp án: <b>{it.correctAnswer}</b></div>}
      {it.explanation && <div className="muted" style={{ fontSize: 12, marginTop: 3, ...box }}>💡 {it.explanation}</div>}
    </div>
  );
}

export default function AttemptDetailModal({ skill, id, studentName, onClose }) {
  const { data, error, loading, reload } = useApi(`/admin/attempt-detail/${encodeURIComponent(skill)}/${id}`);
  const d = data?.detail;
  return (
    <Modal title={d ? d.title : 'Bài làm của học sinh'} onClose={onClose} width={720}>
      {loading && <div style={{ display: 'grid', gap: 8 }}><Skeleton height={18} /><Skeleton height={60} /><Skeleton height={60} /></div>}
      {error && <ErrorState error={error} onRetry={reload} compact />}
      {d && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'center', fontSize: 13, color: 'var(--text2)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <b style={{ fontSize: 16, color: 'var(--accent)' }}>{d.summary}</b>
            {studentName && <span>👤 <b>{studentName}</b></span>}
            {d.subtitle && <span>{d.subtitle}</span>}
          </div>
          {d.emptyNote && <div className="hint-box" style={{ marginTop: 10 }}>{d.emptyNote}</div>}
          {d.items.map((it, i) => <Item key={i} it={it} i={i} />)}
          {!d.items.length && !d.emptyNote && <div className="muted" style={{ marginTop: 12 }}>Không có câu trả lời nào được lưu.</div>}
        </div>
      )}
    </Modal>
  );
}
