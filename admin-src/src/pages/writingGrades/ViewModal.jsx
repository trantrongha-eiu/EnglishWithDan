import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

export default function ViewModal({ attemptId, onClose }) {
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/admin/writing-attempt/${attemptId}`)
      .then(d => setAttempt(d.attempt))
      .catch(() => toast('Không tải được bài nộp', 'error'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  function download() {
    if (!attempt) return;
    const u = attempt.userId || {};
    const name = u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || 'Student');
    const t1 = attempt.task1Snapshot || {};
    const t2 = attempt.task2Snapshot || {};
    const text = [
      `${name} — ${attempt.examName || 'Writing Test'}`,
      `Ngày nộp: ${new Date(attempt.submittedAt || attempt.createdAt).toLocaleString('vi-VN')}`,
      '', '=== TASK 1 ===', t1.prompt || '', '', attempt.task1Answer || '(trống)',
      '', '=== TASK 2 ===', t2.prompt || '', '', attempt.task2Answer || '(trống)',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `${name}_writing.txt`; el.click();
    URL.revokeObjectURL(url);
  }

  const u = attempt?.userId || {};
  const studentName = attempt ? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '–') : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">👁 Xem bài Writing{attempt ? ` — ${studentName}` : ''}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Đang tải...</div>
        ) : !attempt ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Không tìm thấy bài nộp</div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
              <span><strong>Học sinh:</strong> {studentName}</span>
              <span><strong>Bài thi:</strong> {attempt.examName || '–'}</span>
              <span><strong>Loại:</strong> {attempt.submissionType === 'practice' ? '✏️ Luyện tập' : '🏆 Thi'}</span>
              <span><strong>Ngày nộp:</strong> {formatDate(attempt.submittedAt || attempt.createdAt)}</span>
            </div>

            {attempt.task1Answer && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  TASK 1 — {attempt.wordCount1 || 0} từ
                  {(attempt.wordCount1 || 0) < 150 && <span style={{ color: '#b91c1c', fontSize: 12, marginLeft: 6 }}>⚠ dưới 150</span>}
                </div>
                {attempt.task1Snapshot?.imageUrl && (
                  <img src={attempt.task1Snapshot.imageUrl} alt="task1"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6, marginBottom: 8, border: '1px solid var(--border)' }} />
                )}
                {attempt.task1Snapshot?.prompt && (
                  <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap', color: 'var(--text2)' }}>
                    {attempt.task1Snapshot.prompt}
                  </div>
                )}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.75, maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {attempt.task1Answer || <span style={{ color: 'var(--text3)' }}>(trống)</span>}
                </div>
              </div>
            )}

            {attempt.task2Answer && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  TASK 2 — {attempt.wordCount2 || 0} từ
                  {(attempt.wordCount2 || 0) < 250 && <span style={{ color: '#b91c1c', fontSize: 12, marginLeft: 6 }}>⚠ dưới 250</span>}
                </div>
                {attempt.task2Snapshot?.prompt && (
                  <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 8, whiteSpace: 'pre-wrap', color: 'var(--text2)' }}>
                    {attempt.task2Snapshot.prompt}
                  </div>
                )}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.75, maxHeight: 280, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {attempt.task2Answer || <span style={{ color: 'var(--text3)' }}>(trống)</span>}
                </div>
              </div>
            )}

            {attempt.grading?.overallBand != null && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
                <strong>Điểm xác nhận:</strong>{' '}
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{attempt.grading.overallBand}</span>
                {attempt.grading.adminNote && (
                  <div style={{ marginTop: 8, color: 'var(--text2)', lineHeight: 1.6 }}>
                    <strong>Feedback:</strong> {attempt.grading.adminNote}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button className="btn btn-ghost" onClick={download}>⬇ Tải về (.txt)</button>
              <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
