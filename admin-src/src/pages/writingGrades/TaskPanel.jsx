import { useState } from 'react';
import { EMPTY_MANUAL } from './constants';

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

export function ResultBlock({ result, label, accentColor }) {
  if (!result) return null;
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: accentColor + '08' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <ScoreRow label="TA"  score={result.ta?.score}  comment={result.ta?.comment}  />
      <ScoreRow label="CC"  score={result.cc?.score}  comment={result.cc?.comment}  />
      <ScoreRow label="LR"  score={result.lr?.score}  comment={result.lr?.comment}  />
      <ScoreRow label="GRA" score={result.gra?.score} comment={result.gra?.comment} />
      {result.overallFeedback && (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text2)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <strong style={{ color: 'var(--text)' }}>Nhận xét chung:</strong> {result.overallFeedback}
        </div>
      )}
    </div>
  );
}

export function ManualGradeForm({ value, onChange, disabled }) {
  const set = (key, subKey, val) => {
    if (subKey) onChange({ ...value, [key]: { ...(value[key] || {}), [subKey]: val } });
    else onChange({ ...value, [key]: val });
  };
  return (
    <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,.05)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 10 }}>
        ✏️ Chấm thủ công
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 60, color: 'var(--text2)' }}>Band</span>
        <input type="number" min="0" max="9" step="0.5"
          value={value.bandScore ?? ''} onChange={e => set('bandScore', null, e.target.value)}
          disabled={disabled} className="form-input" style={{ width: 80, padding: '4px 8px' }} placeholder="0–9" />
      </div>
      {[['TA', 'ta'], ['CC', 'cc'], ['LR', 'lr'], ['GRA', 'gra']].map(([label, key]) => (
        <div key={key} style={{ display: 'grid', gridTemplateColumns: '36px 72px 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{label}</span>
          <input type="number" min="0" max="9" step="0.5"
            value={value[key]?.score ?? ''} onChange={e => set(key, 'score', e.target.value)}
            disabled={disabled} className="form-input" style={{ padding: '4px 8px' }} placeholder="0–9" />
          <input type="text" value={value[key]?.comment ?? ''} onChange={e => set(key, 'comment', e.target.value)}
            disabled={disabled} className="form-input" style={{ padding: '4px 8px' }} placeholder="Nhận xét tiêu chí..." />
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 4 }}>Nhận xét chung</div>
        <textarea value={value.overallFeedback ?? ''} onChange={e => set('overallFeedback', null, e.target.value)}
          disabled={disabled} className="form-input" rows={3}
          placeholder="Nhận xét tổng thể cho học sinh..."
          style={{ width: '100%', resize: 'vertical', padding: '6px 8px', boxSizing: 'border-box' }} />
      </div>
    </div>
  );
}

export default function TaskPanel({ title, prompt, imageUrl, answer, wordCount, minWords, aiResult, confirmedResult,
  isGrading, isConfirmed, onGrade, aiDisabled, mode, onModeChange, manualData, onManualChange }) {
  const [expanded, setExpanded] = useState(false);
  const hasAnswer = !!(answer && answer.trim());
  const displayBand = isConfirmed
    ? confirmedResult?.bandScore
    : mode === 'ai' ? aiResult?.bandScore : (parseFloat(manualData?.bandScore) || null);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ background: 'var(--surface2)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        {wordCount > 0 && (
          <span style={{
            background: wordCount >= minWords ? '#dcfce7' : '#fee2e2',
            color: wordCount >= minWords ? '#15803d' : '#b91c1c',
            borderRadius: 5, padding: '1px 8px', fontSize: 11, fontWeight: 600
          }}>{wordCount}w {wordCount < minWords ? `(thiếu ${minWords - wordCount}w)` : ''}</span>
        )}
        {displayBand != null && (
          <span style={{ background: '#3d8bff22', color: '#3d8bff', borderRadius: 5, padding: '1px 9px', fontSize: 13, fontWeight: 700 }}>
            Band {displayBand}
          </span>
        )}
        {!isConfirmed && (
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            background: mode === 'manual' ? 'rgba(16,185,129,.12)' : 'rgba(61,139,255,.1)',
            color: mode === 'manual' ? '#059669' : '#3d8bff',
            borderRadius: 4, padding: '1px 7px', fontWeight: 600
          }}>{mode === 'manual' ? '✏️ Thủ công' : '🤖 AI'}</span>
        )}
      </div>

      {prompt && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,.02)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Đề bài</div>
          {imageUrl && <img src={imageUrl} alt={title} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 6, marginBottom: 8, display: 'block' }} />}
          <div style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{prompt}</div>
        </div>
      )}

      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Bài làm học sinh</span>
          {hasAnswer && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setExpanded(!expanded)}>
              {expanded ? '▲ Thu gọn' : '▼ Xem đầy đủ'}
            </button>
          )}
        </div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.75, color: 'var(--text)', maxHeight: expanded ? 'none' : 140, overflow: 'hidden' }}>
          {hasAnswer ? answer : <span style={{ color: 'var(--text3)' }}>Không có bài làm</span>}
        </div>
      </div>

      {isConfirmed && <ResultBlock result={confirmedResult} label="✓ Kết quả đã xác nhận" accentColor="#059669" />}
      {!isConfirmed && mode === 'ai' && aiResult?.bandScore != null && (
        <ResultBlock result={aiResult} label="Kết quả AI Grading" accentColor="#3d8bff" />
      )}
      {!isConfirmed && mode === 'manual' && (
        <ManualGradeForm value={manualData || EMPTY_MANUAL()} onChange={onManualChange} disabled={false} />
      )}

      {isConfirmed ? (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Chấm lại để cập nhật phản hồi cho học sinh:</span>
          <button className="btn btn-sm btn-ghost" onClick={onGrade} disabled={isGrading || aiDisabled}
            title={aiDisabled ? 'AI đang quá tải — chờ vài phút rồi thử lại' : 'Chấm lại bằng AI, sau đó bấm Xác nhận để gửi cho học sinh'}>
            {isGrading ? '⏳ Đang chấm lại...' : '🔄 Chấm lại AI'}
          </button>
          {aiDisabled && (
            <span style={{ fontSize: 11, color: '#b45309', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 4, padding: '2px 7px' }}>
              ⚠️ AI quá tải — thử lại sau ít phút
            </span>
          )}
        </div>
      ) : (
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>Phương thức:</span>
          <button className={`btn btn-sm ${mode === 'ai' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onModeChange('ai')}>🤖 AI</button>
          <button className="btn btn-sm"
            style={mode === 'manual'
              ? { background: '#059669', color: '#fff', border: '1px solid #15803d' }
              : { background: 'none', border: '1px solid var(--border)', color: 'var(--text2)' }}
            onClick={() => onModeChange('manual')}>✏️ Thủ công</button>
          {mode === 'ai' && (
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <button className="btn btn-primary btn-sm" onClick={onGrade} disabled={isGrading || aiDisabled}
                title={aiDisabled ? 'AI đang quá tải — chờ vài phút rồi thử lại' : ''}>
                {isGrading ? '⏳ Đang chấm AI...' : aiResult ? '🔄 Chấm lại AI' : '▶ Chấm AI'}
              </button>
              {aiDisabled && (
                <span style={{ fontSize: 11, color: '#b45309', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                  ⚠️ AI quá tải — thử lại sau ít phút
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
