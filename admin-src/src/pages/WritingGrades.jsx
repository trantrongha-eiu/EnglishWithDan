import { useEffect, useState } from 'react';
import { apiFetch, formatDate } from '../utils/api';
import { useToast } from '../contexts/ToastContext';

const STATUS = {
  pending:   { label: 'Chờ chấm',      cls: 'badge-red'   },
  ai_done:   { label: 'AI đã chấm',    cls: 'badge-blue'  },
  confirmed: { label: 'Đã xác nhận',   cls: 'badge-green' },
};

function ScoreRow({ label, score, comment }) {
  if (score == null) return null;
  const color = score >= 7 ? '#15803d' : score >= 5.5 ? '#92400e' : '#b91c1c';
  const bg    = score >= 7 ? '#dcfce7' : score >= 5.5 ? '#fef9c3' : '#fee2e2';
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
      <span style={{ minWidth: 36, fontWeight: 700, color: 'var(--text3)', fontSize: 12 }}>{label}</span>
      <span style={{ background: bg, color, borderRadius: 4, padding: '0 7px', fontWeight: 700, fontSize: 13 }}>{score}</span>
      {comment && <span style={{ color: 'var(--text2)', fontSize: 12, flex: 1 }}>{comment}</span>}
    </div>
  );
}

function TaskPanel({ title, prompt, imageUrl, answer, wordCount, minWords, aiResult, isGrading, isConfirmed, onGrade }) {
  const [expanded, setExpanded] = useState(false);
  const hasAnswer = !!(answer && answer.trim());

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ background: 'var(--bg2)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        {wordCount > 0 && (
          <span style={{
            background: wordCount >= minWords ? '#dcfce7' : '#fee2e2',
            color: wordCount >= minWords ? '#15803d' : '#b91c1c',
            borderRadius: 5, padding: '1px 8px', fontSize: 11, fontWeight: 600
          }}>{wordCount}w {wordCount < minWords ? `(thiếu ${minWords - wordCount}w)` : ''}</span>
        )}
        {aiResult?.bandScore != null && (
          <span style={{ background: '#3d8bff22', color: '#3d8bff', borderRadius: 5, padding: '1px 9px', fontSize: 13, fontWeight: 700 }}>
            Band {aiResult.bandScore}
          </span>
        )}
      </div>

      {prompt && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,.02)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Đề bài</div>
          {imageUrl && <img src={imageUrl} alt={title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 6, marginBottom: 8, display: 'block' }} />}
          <div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{prompt}</div>
        </div>
      )}

      <div style={{ padding: '10px 16px', borderBottom: aiResult ? '1px solid var(--border)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Bài làm học sinh</span>
          {hasAnswer && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setExpanded(!expanded)}>
              {expanded ? '▲ Thu gọn' : '▼ Xem đầy đủ'}
            </button>
          )}
        </div>
        <div style={{
          fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.75, color: 'var(--text1)',
          maxHeight: expanded ? 'none' : 140, overflow: 'hidden',
        }}>
          {hasAnswer ? answer : <span style={{ color: 'var(--text3)' }}>Không có bài làm</span>}
        </div>
      </div>

      {aiResult && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(61,139,255,.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3d8bff', textTransform: 'uppercase', marginBottom: 10 }}>Kết quả AI Grading</div>
          <ScoreRow label="TA"  score={aiResult.ta?.score}  comment={aiResult.ta?.comment}  />
          <ScoreRow label="CC"  score={aiResult.cc?.score}  comment={aiResult.cc?.comment}  />
          <ScoreRow label="LR"  score={aiResult.lr?.score}  comment={aiResult.lr?.comment}  />
          <ScoreRow label="GRA" score={aiResult.gra?.score} comment={aiResult.gra?.comment} />
          {aiResult.overallFeedback && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text2)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <strong style={{ color: 'var(--text1)' }}>Nhận xét chung:</strong> {aiResult.overallFeedback}
            </div>
          )}
        </div>
      )}

      {!isConfirmed && (
        <div style={{ padding: '10px 16px' }}>
          <button className="btn btn-primary btn-sm" onClick={onGrade} disabled={isGrading}>
            {isGrading ? '⏳ Đang chấm AI...' : aiResult ? '🔄 Chấm lại AI' : '🤖 Chấm AI'}
          </button>
        </div>
      )}
    </div>
  );
}

function GradeModal({ attemptId, onClose, onGraded }) {
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [gradingTask, setGradingTask] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [overallBand, setOverallBand] = useState('');
  const [adminNote, setAdminNote] = useState('');

  function calcBand(a) {
    const ai = a?.aiGrading || {};
    const scores = [ai.task1?.bandScore, ai.task2?.bandScore].filter(s => s != null && s > 0);
    if (!scores.length) return '';
    return String(Math.round((scores.reduce((x, y) => x + y, 0) / scores.length) * 2) / 2);
  }

  async function refresh() {
    try {
      const d = await apiFetch(`/admin/writing-attempt/${attemptId}`);
      setAttempt(d.attempt);
      setAdminNote(d.attempt.grading?.adminNote || '');
      if (d.attempt.grading?.overallBand) {
        setOverallBand(String(d.attempt.grading.overallBand));
      } else {
        setOverallBand(calcBand(d.attempt));
      }
    } catch (e) { toast(e.message, 'error'); }
  }

  useEffect(() => { refresh(); }, [attemptId]);

  async function gradeTask(taskNum) {
    setGradingTask(taskNum);
    try {
      const d = await apiFetch(`/admin/writing-attempts/${attemptId}/ai-grade`, {
        method: 'POST',
        body: JSON.stringify({ taskNum })
      });
      await refresh();
      toast(`Task ${taskNum} đã chấm xong – Band ${d.result.bandScore}`);
    } catch (e) { toast(e.message, 'error'); }
    finally { setGradingTask(0); }
  }

  async function confirmGrade() {
    if (!overallBand) return toast('Nhập band tổng thể trước khi xác nhận', 'error');
    setConfirming(true);
    try {
      const ai = attempt.aiGrading || {};
      await apiFetch(`/admin/writing-attempts/${attemptId}/confirm-grade`, {
        method: 'PUT',
        body: JSON.stringify({
          task1: ai.task1 || null,
          task2: ai.task2 || null,
          overallBand: parseFloat(overallBand),
          adminNote
        })
      });
      toast('Đã xác nhận điểm');
      onGraded();
      onClose();
    } catch (e) { toast(e.message, 'error'); }
    finally { setConfirming(false); }
  }

  const isConfirmed = attempt?.gradingStatus === 'confirmed';
  const ai = attempt?.aiGrading || {};
  const hasTask1 = !!(attempt?.task1Snapshot?.prompt || (attempt?.task1Answer && attempt.task1Answer.trim()));
  const hasTask2 = !!(attempt?.task2Snapshot?.prompt || (attempt?.task2Answer && attempt.task2Answer.trim()));
  const hasAiResult = !!(ai.task1?.bandScore || ai.task2?.bandScore);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: 20, paddingBottom: 20 }}>
      <div className="modal" style={{ maxWidth: 900, width: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        <div className="modal-header" style={{ flexShrink: 0 }}>
          {!attempt ? (
            <h3 className="modal-title">Đang tải...</h3>
          ) : (
            <div>
              <h3 className="modal-title" style={{ marginBottom: 2 }}>
                {[attempt.userId?.firstName, attempt.userId?.lastName].filter(Boolean).join(' ') || attempt.userId?.username || '–'}
                {' – '}
                {attempt.examName || '–'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text3)' }}>{formatDate(attempt.submittedAt)}</span>
                <span className={`badge ${STATUS[attempt.gradingStatus]?.cls || 'badge-gray'}`}>
                  {STATUS[attempt.gradingStatus]?.label}
                </span>
                {isConfirmed && attempt.grading?.confirmedBy && (
                  <span style={{ color: 'var(--text3)' }}>bởi {attempt.grading.confirmedBy} · {formatDate(attempt.grading.confirmedAt)}</span>
                )}
              </div>
            </div>
          )}
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!attempt ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Đang tải bài làm...</div>
          ) : (
            <>
              {hasTask1 && (
                <TaskPanel
                  title="Task 1"
                  prompt={attempt.task1Snapshot?.prompt || ''}
                  imageUrl={attempt.task1Snapshot?.imageUrl || ''}
                  answer={attempt.task1Answer}
                  wordCount={attempt.wordCount1}
                  minWords={150}
                  aiResult={ai.task1}
                  isGrading={gradingTask === 1}
                  isConfirmed={isConfirmed}
                  onGrade={() => gradeTask(1)}
                />
              )}
              {hasTask2 && (
                <TaskPanel
                  title="Task 2"
                  prompt={attempt.task2Snapshot?.prompt || ''}
                  imageUrl={null}
                  answer={attempt.task2Answer}
                  wordCount={attempt.wordCount2}
                  minWords={250}
                  aiResult={ai.task2}
                  isGrading={gradingTask === 2}
                  isConfirmed={isConfirmed}
                  onGrade={() => gradeTask(2)}
                />
              )}

              {(hasAiResult || isConfirmed) && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginTop: 4 }}>
                  <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>
                    {isConfirmed ? '✓ Điểm đã xác nhận' : 'Xác nhận điểm'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, marginBottom: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Band tổng thể *</label>
                      <input
                        className="form-input"
                        type="number" step="0.5" min="0" max="9"
                        value={overallBand}
                        onChange={e => setOverallBand(e.target.value)}
                        disabled={isConfirmed}
                        placeholder="0–9"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Ghi chú giáo viên (tuỳ chọn)</label>
                      <input
                        className="form-input"
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                        placeholder="Nhận xét thêm cho học sinh..."
                        disabled={isConfirmed}
                      />
                    </div>
                  </div>
                  {isConfirmed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge badge-green" style={{ fontSize: 14, padding: '4px 14px' }}>
                        ✓ Band {attempt.grading?.overallBand?.toFixed(1)}
                      </span>
                      {attempt.grading?.adminNote && (
                        <span style={{ fontSize: 13, color: 'var(--text2)' }}>"{attempt.grading.adminNote}"</span>
                      )}
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={confirmGrade}
                      disabled={confirming || !overallBand}
                    >
                      {confirming ? '⏳ Đang xác nhận...' : '✓ Xác nhận điểm'}
                    </button>
                  )}
                </div>
              )}

              {!hasTask1 && !hasTask2 && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>
                  Không tìm thấy bài làm
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WritingGrades() {
  const toast = useToast();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const d = await apiFetch('/admin/writing-history');
      setAttempts(d.attempts || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = attempts.filter(a => {
    if (statusFilter && a.gradingStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const uname = (a.userId?.username || '').toLowerCase();
      const fname = [a.userId?.firstName, a.userId?.lastName].filter(Boolean).join(' ').toLowerCase();
      const exam  = (a.examName || '').toLowerCase();
      return uname.includes(q) || fname.includes(q) || exam.includes(q);
    }
    return true;
  });

  const pending = attempts.filter(a => a.gradingStatus === 'pending').length;
  const aiDone  = attempts.filter(a => a.gradingStatus === 'ai_done').length;

  return (
    <>
      {selectedId && (
        <GradeModal
          attemptId={selectedId}
          onClose={() => setSelectedId(null)}
          onGraded={() => { load(); setSelectedId(null); }}
        />
      )}

      <div className="section-header">
        <div>
          <h2 className="section-title">Chấm bài Writing ({attempts.length})</h2>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {pending > 0 && <span style={{ color: 'var(--accent2)' }}>{pending} chờ chấm</span>}
            {pending > 0 && aiDone > 0 && ' · '}
            {aiDone > 0 && <span style={{ color: '#3d8bff' }}>{aiDone} AI đã chấm, chờ xác nhận</span>}
            {pending === 0 && aiDone === 0 && <span>Tất cả đã xác nhận</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          {loading ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          className="form-input search-input"
          placeholder="Tìm học sinh, tên đề..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ chấm</option>
          <option value="ai_done">AI đã chấm</option>
          <option value="confirmed">Đã xác nhận</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>HỌC SINH</th>
              <th>ĐỀ THI</th>
              <th>NGÀY NỘP</th>
              <th>WORD COUNT</th>
              <th>TRẠNG THÁI</th>
              <th>BAND</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} className="table-empty">Đang tải...</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan={7} className="table-empty">Không có dữ liệu</td></tr>
                : filtered.map(a => {
                  const name = [a.userId?.firstName, a.userId?.lastName].filter(Boolean).join(' ') || a.userId?.username || '–';
                  const st   = STATUS[a.gradingStatus] || STATUS.pending;
                  const band = a.grading?.overallBand;
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{name}</strong>
                        {a.userId?.username && <div style={{ fontSize: 11, color: 'var(--text3)' }}>@{a.userId.username}</div>}
                      </td>
                      <td>{a.examName || '–'}</td>
                      <td style={{ fontSize: 12 }}>{formatDate(a.submittedAt)}</td>
                      <td style={{ fontSize: 12 }}>
                        {a.wordCount1 > 0 && <span>T1: {a.wordCount1}w </span>}
                        {a.wordCount2 > 0 && <span>T2: {a.wordCount2}w</span>}
                        {!a.wordCount1 && !a.wordCount2 && '–'}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td>
                        {band != null
                          ? <span style={{
                              fontWeight: 700,
                              color: band >= 7 ? 'var(--green)' : band >= 5 ? 'var(--yellow)' : 'var(--accent2)'
                            }}>{band.toFixed(1)}</span>
                          : '–'}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${a.gradingStatus === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setSelectedId(a._id)}
                        >
                          {a.gradingStatus === 'pending' ? '🤖 Chấm AI' : '👁 Xem & Chấm'}
                        </button>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>
    </>
  );
}
