import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { STATUS, EMPTY_MANUAL } from './constants';
import TaskPanel from './TaskPanel';

export default function GradeModal({ attemptId, onClose, onGraded }) {
  const toast = useToast();
  const [attempt, setAttempt]   = useState(null);
  const [gradingTask, setGradingTask] = useState(0);
  const [confirming, setConfirming]   = useState(false);
  const [aiOverloaded, setAiOverloaded] = useState(false);
  const [overallBand, setOverallBand] = useState('');
  const [adminNote, setAdminNote]     = useState('');
  const [modes, setModes]   = useState({ task1: 'ai', task2: 'ai' });
  const [manuals, setManuals] = useState({ task1: EMPTY_MANUAL(), task2: EMPTY_MANUAL() });
  const [reEditing, setReEditing] = useState(false);

  const isConfirmed          = attempt?.gradingStatus === 'confirmed';
  const isEffectivelyConfirmed = isConfirmed && !reEditing;
  const ai           = attempt?.aiGrading || {};
  const confirmed    = attempt?.grading || {};
  const hasTask1     = !!(attempt?.task1Snapshot?.prompt || (attempt?.task1Answer && attempt.task1Answer.trim()));
  const hasTask2     = !!(attempt?.task2Snapshot?.prompt || (attempt?.task2Answer && attempt.task2Answer.trim()));
  const hasAiResult  = !!(ai.task1?.bandScore || ai.task2?.bandScore);
  const hasManualResult =
    (modes.task1 === 'manual' && manuals.task1.bandScore !== '') ||
    (modes.task2 === 'manual' && manuals.task2.bandScore !== '');

  function calcBand(a) {
    const scores = [a?.aiGrading?.task1?.bandScore, a?.aiGrading?.task2?.bandScore].filter(s => s != null && s > 0);
    if (!scores.length) return '';
    return String(Math.round((scores.reduce((x, y) => x + y, 0) / scores.length) * 2) / 2);
  }

  function refresh() {
    return apiFetch(`/admin/writing-attempt/${attemptId}`)
      .then(d => {
        setAttempt(d.attempt);
        setAdminNote(d.attempt.grading?.adminNote || '');
        setOverallBand(d.attempt.grading?.overallBand
          ? String(d.attempt.grading.overallBand)
          : calcBand(d.attempt));
      })
      .catch(e => toast(e.message, 'error'));
  }

  useEffect(() => { refresh(); }, [attemptId]);

  function setMode(taskKey, newMode) {
    setModes(prev => ({ ...prev, [taskKey]: newMode }));
    if (newMode === 'manual' && !manuals[taskKey]?.bandScore) {
      const src = attempt?.aiGrading?.[taskKey];
      if (src) {
        setManuals(prev => ({
          ...prev,
          [taskKey]: {
            bandScore:       src.bandScore != null ? String(src.bandScore) : '',
            ta:  { score: src.ta?.score  != null ? String(src.ta.score)  : '', comment: src.ta?.comment  || '' },
            cc:  { score: src.cc?.score  != null ? String(src.cc.score)  : '', comment: src.cc?.comment  || '' },
            lr:  { score: src.lr?.score  != null ? String(src.lr.score)  : '', comment: src.lr?.comment  || '' },
            gra: { score: src.gra?.score != null ? String(src.gra.score) : '', comment: src.gra?.comment || '' },
            overallFeedback: src.overallFeedback || ''
          }
        }));
      }
    }
  }

  function updateManual(taskKey, data) {
    setManuals(prev => ({ ...prev, [taskKey]: data }));
  }

  function enterEditMode() {
    const g = attempt?.grading || {};
    const mapTask = t => t ? {
      bandScore:       t.bandScore  != null ? String(t.bandScore)  : '',
      ta:  { score: t.ta?.score  != null ? String(t.ta.score)  : '', comment: t.ta?.comment  || '' },
      cc:  { score: t.cc?.score  != null ? String(t.cc.score)  : '', comment: t.cc?.comment  || '' },
      lr:  { score: t.lr?.score  != null ? String(t.lr.score)  : '', comment: t.lr?.comment  || '' },
      gra: { score: t.gra?.score != null ? String(t.gra.score) : '', comment: t.gra?.comment || '' },
      overallFeedback: t.overallFeedback || ''
    } : EMPTY_MANUAL();
    setManuals({ task1: mapTask(g.task1), task2: mapTask(g.task2) });
    setModes({ task1: 'manual', task2: 'manual' });
    setOverallBand(g.overallBand != null ? String(g.overallBand) : '');
    setAdminNote(g.adminNote || '');
    setReEditing(true);
  }

  async function gradeTask(taskNum) {
    setGradingTask(taskNum);
    setAiOverloaded(false);
    try {
      const d = await apiFetch(`/admin/writing-attempts/${attemptId}/ai-grade`, {
        method: 'POST', body: JSON.stringify({ taskNum })
      });
      const taskKey = taskNum === 1 ? 'task1' : 'task2';
      setAttempt(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev, gradingStatus: 'ai_done',
          aiGrading: { ...(prev.aiGrading || {}), [taskKey]: d.result, generatedAt: new Date().toISOString() }
        };
        setOverallBand(calcBand(updated));
        return updated;
      });
      toast(`Task ${taskNum} đã chấm xong – Band ${d.result.bandScore}`);
    } catch (e) {
      if (e.status === 503) { setAiOverloaded(true); toast('AI đang quá tải — thử lại sau vài phút.', 'error'); }
      else toast(e.message, 'error');
    } finally { setGradingTask(0); }
  }

  function buildManualTask(manual) {
    const num = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };
    return {
      bandScore:       num(manual.bandScore),
      ta:  { score: num(manual.ta?.score),  comment: manual.ta?.comment  || '' },
      cc:  { score: num(manual.cc?.score),  comment: manual.cc?.comment  || '' },
      lr:  { score: num(manual.lr?.score),  comment: manual.lr?.comment  || '' },
      gra: { score: num(manual.gra?.score), comment: manual.gra?.comment || '' },
      overallFeedback: manual.overallFeedback || '',
      sentenceFeedback: []
    };
  }

  async function confirmGrade() {
    if (!overallBand) return toast('Nhập band tổng thể trước khi xác nhận', 'error');
    setConfirming(true);
    try {
      const task1Data = hasTask1 ? (modes.task1 === 'manual' ? buildManualTask(manuals.task1) : (ai.task1 || null)) : null;
      const task2Data = hasTask2 ? (modes.task2 === 'manual' ? buildManualTask(manuals.task2) : (ai.task2 || null)) : null;
      await apiFetch(`/admin/writing-attempts/${attemptId}/confirm-grade`, {
        method: 'PUT',
        body: JSON.stringify({ task1: task1Data, task2: task2Data, overallBand: parseFloat(overallBand), adminNote })
      });
      toast(reEditing ? 'Đã cập nhật điểm và gửi lại feedback cho học sinh' : 'Đã xác nhận điểm và gửi feedback cho học sinh');
      onGraded();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setConfirming(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 20, paddingBottom: 20 }}>
      <div className="modal" style={{ maxWidth: 900, width: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          {!attempt ? <h3 className="modal-title">Đang tải...</h3> : (
            <div>
              <h3 className="modal-title" style={{ marginBottom: 2 }}>
                ✏️ Chấm bài — {[attempt.userId?.firstName, attempt.userId?.lastName].filter(Boolean).join(' ') || attempt.userId?.username || '–'}
                {' · '}{attempt.examName || '–'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>{formatDate(attempt.submittedAt)}</span>
                <span className={`badge ${STATUS[attempt.gradingStatus]?.cls || 'badge-gray'}`}>
                  {STATUS[attempt.gradingStatus]?.label}
                </span>
                <span style={{ color: 'var(--text3)' }}>
                  {attempt.submissionType === 'practice' ? '✏️ Luyện tập' : '🏆 Thi'}
                </span>
                {isConfirmed && attempt.grading?.confirmedBy && (
                  <span style={{ color: 'var(--text3)' }}>bởi {attempt.grading.confirmedBy} · {formatDate(attempt.grading.confirmedAt)}</span>
                )}
              </div>
            </div>
          )}
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!attempt ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Đang tải bài làm...</div>
          ) : (
            <>
              {/* Warning: confirmed but missing sentence feedback */}
              {isEffectivelyConfirmed && !attempt.grading?.task1?.sentenceFeedback?.length && !attempt.grading?.task2?.sentenceFeedback?.length && (
                <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
                  <span style={{ flexShrink: 0 }}>⚠️</span>
                  <span>Bài này <strong>chưa có phân tích câu chi tiết</strong>. Chấm lại AI rồi bấm Xác nhận để học sinh nhận được phần sửa lỗi từng câu.</span>
                </div>
              )}

              {hasTask1 && (
                <TaskPanel title="Task 1"
                  prompt={attempt.task1Snapshot?.prompt || ''}
                  imageUrl={attempt.task1Snapshot?.imageUrl || ''}
                  answer={attempt.task1Answer} wordCount={attempt.wordCount1} minWords={150}
                  aiResult={ai.task1} confirmedResult={confirmed.task1}
                  isGrading={gradingTask === 1} isConfirmed={isEffectivelyConfirmed}
                  onGrade={() => gradeTask(1)} aiDisabled={aiOverloaded}
                  mode={modes.task1} onModeChange={m => setMode('task1', m)}
                  manualData={manuals.task1} onManualChange={d => updateManual('task1', d)} />
              )}
              {hasTask2 && (
                <TaskPanel title="Task 2"
                  prompt={attempt.task2Snapshot?.prompt || ''}
                  imageUrl={null}
                  answer={attempt.task2Answer} wordCount={attempt.wordCount2} minWords={250}
                  aiResult={ai.task2} confirmedResult={confirmed.task2}
                  isGrading={gradingTask === 2} isConfirmed={isEffectivelyConfirmed}
                  onGrade={() => gradeTask(2)} aiDisabled={aiOverloaded}
                  mode={modes.task2} onModeChange={m => setMode('task2', m)}
                  manualData={manuals.task2} onManualChange={d => updateManual('task2', d)} />
              )}

              {(hasAiResult || hasManualResult || isConfirmed) && (
                <div style={{ border: `1px solid ${reEditing ? '#f59e0b' : 'var(--border)'}`, borderRadius: 10, padding: '16px 20px', marginTop: 4, background: reEditing ? '#fffbeb' : undefined }}>
                  <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>
                    {isEffectivelyConfirmed ? '✓ Điểm đã xác nhận' : reEditing ? '✏️ Chỉnh sửa điểm đã xác nhận' : 'Xác nhận điểm'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, marginBottom: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Band tổng thể *</label>
                      <input className="form-input" type="number" step="0.5" min="0" max="9"
                        value={overallBand} onChange={e => setOverallBand(e.target.value)}
                        disabled={isEffectivelyConfirmed} placeholder="0–9" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Ghi chú giáo viên (tuỳ chọn)</label>
                      <input className="form-input" value={adminNote} onChange={e => setAdminNote(e.target.value)}
                        placeholder="Nhận xét thêm cho học sinh..." disabled={isEffectivelyConfirmed} />
                    </div>
                  </div>
                  {isEffectivelyConfirmed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span className="badge badge-green" style={{ fontSize: 14, padding: '4px 14px' }}>
                        ✓ Band {attempt.grading?.overallBand?.toFixed(1)}
                      </span>
                      {attempt.grading?.adminNote && (
                        <span style={{ fontSize: 13, color: 'var(--text2)' }}>"{attempt.grading.adminNote}"</span>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={enterEditMode} style={{ marginLeft: 'auto' }}>
                        ✏️ Sửa điểm
                      </button>
                    </div>
                  ) : reEditing ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary" onClick={confirmGrade} disabled={confirming || !overallBand}>
                        {confirming ? '⏳ Đang cập nhật...' : '✓ Cập nhật & Gửi lại feedback'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setReEditing(false)} disabled={confirming}>
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={confirmGrade} disabled={confirming || !overallBand}>
                      {confirming ? '⏳ Đang xác nhận...' : '✓ Xác nhận điểm & Gửi feedback'}
                    </button>
                  )}
                </div>
              )}

              {!hasAiResult && !hasManualResult && !isConfirmed && (hasTask1 || hasTask2) && (
                <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: '16px 20px', marginTop: 4, opacity: 0.6 }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
                    Chấm AI hoặc nhập thủ công ít nhất một task để xác nhận điểm
                  </div>
                </div>
              )}
              {!hasTask1 && !hasTask2 && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>Không tìm thấy bài làm</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
