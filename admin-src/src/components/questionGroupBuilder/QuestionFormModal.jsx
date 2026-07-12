// Extracted from QuestionGroupBuilder.jsx — the add/edit-question modal.
// Receives its form state (qForm/setQForm) and callbacks as props; the
// only thing it reads from outside is the static Q_TYPES/ALLOWED/ANS_HINT
// config, not any of the main builder's group-list state.
import { InfoBox } from './Shared';
import { Q_TYPES, ALLOWED, ANS_HINT } from './constants';
import { TFNGAnswerPicker, MCAnswerPicker, CheckboxAnswerPicker, MapAnswerPicker } from './AnswerPickers';

export function QuestionFormModal({ qForm, setQForm, groupType, context, onSave, onClose, isDup, dragDropWords = [], positionLabel = null }) {
  const allTypes = Q_TYPES[context] || Q_TYPES.reading;
  const allowed = ALLOWED[groupType];
  const types = allowed ? allTypes.filter(t => allowed.includes(t.value)) : allTypes;
  const setF = k => e => setQForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  const setOpt = (i, v) => setQForm(f => { const o = [...(f.options || [])]; o[i] = v; return { ...f, options: o }; });
  const isTFNG = ['true-false-ng', 'yes-no-ng'].includes(qForm.type);
  const tfOpts = qForm.type === 'true-false-ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
  const isMultiOpt = t => ['checkbox', 'multi-answer-group'].includes(t);
  const needsOpts = ['multiple-choice', 'checkbox', 'multi-answer-group'].includes(qForm.type);
  const optLabels = isMultiOpt(qForm.type)
    ? Array.from({ length: (qForm.options || []).length }, (_, i) => String.fromCharCode(65 + i))
    : ['A','B','C','D'];
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            Câu hỏi trong nhóm
            {positionLabel && <span style={{ marginLeft: 10, fontSize: 18, color: 'var(--blue)', fontWeight: 800 }}>({positionLabel})</span>}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 11, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                {positionLabel ? <span>Vị trí <span style={{ color: 'var(--blue)', fontWeight: 800, fontSize: 16 }}>{positionLabel}</span></span> : 'Câu số *'}
              </label>
              <input className="form-input" type="number" min={1} value={qForm.questionNumber} onChange={setF('questionNumber')}
                style={{ borderColor: isDup ? '#ef4444' : '' }} />
              {isDup && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>⚠ Số câu đã tồn tại!</div>}
              {positionLabel && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Số câu IELTS (25, 26…)</div>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Loại câu *</label>
              <select className="form-input" value={qForm.type}
                onChange={e => {
                  const t = e.target.value;
                  setQForm(f => {
                    const opts = f.options || [];
                    let newOpts = opts;
                    if (isMultiOpt(t) && opts.length < 5) newOpts = [...opts, ...Array(5 - opts.length).fill('')];
                    else if (t === 'multiple-choice' && opts.length > 4) newOpts = opts.slice(0, 4);
                    return {
                      ...f, type: t, options: newOpts,
                      correctAnswer: ['true-false-ng','yes-no-ng'].includes(f.type) && !['true-false-ng','yes-no-ng'].includes(t) ? '' : f.correctAnswer,
                    };
                  });
                }}
                style={types.length === 1 ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {types.length === 1 && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>💡 Loại câu cố định cho nhóm này</div>}
            </div>
          </div>

          {qForm.type === 'multi-answer-group' && (
            <InfoBox>
              ✦ <strong>Choose TWO/THREE Letters A-G:</strong> Tạo <strong>từng câu riêng biệt</strong> với cùng danh sách options.<br/>
              Ví dụ Q18-20 "Choose THREE letters A-G": tạo <strong>3 câu</strong> (Q18, Q19, Q20), mỗi câu cùng type này, cùng options A-G, đáp án mỗi câu = <strong>1 chữ cái</strong> (A / B / C...). Hệ thống tự gộp thành 1 UI chung cho học sinh. <strong>Copy-paste options</strong> sang Q19, Q20 để tiết kiệm thời gian.
            </InfoBox>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              {qForm.type === 'fill-blank' ? 'Văn bản có chỗ trống (dùng ________ hoặc __Q1__)' : 'Nội dung câu hỏi'}
            </label>
            <textarea className="form-input" rows={3} value={qForm.questionText} onChange={setF('questionText')}
              placeholder={qForm.type === 'fill-blank' ? 'The meeting is on ________ at the community centre.' : 'Nội dung câu hỏi...'} />
          </div>

          {needsOpts && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Các đáp án {isMultiOpt(qForm.type) ? `A–${optLabels[optLabels.length - 1] || 'E'}` : 'A-D'}
              </label>
              {isMultiOpt(qForm.type) ? (
                <div style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {optLabels.map((l, i) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 700, color: 'var(--blue)', width: 18, fontSize: 12, flexShrink: 0 }}>{l}.</span>
                        <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '5px 8px' }}
                          value={qForm.options?.[i] || ''} onChange={e => setOpt(i, e.target.value)} placeholder={l} />
                        {optLabels.length > 2 && (
                          <button type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flexShrink: 0 }}
                            onClick={() => setQForm(f => ({
                              ...f,
                              options: f.options.filter((_, j) => j !== i),
                              correctAnswer: qForm.type === 'multi-answer-group' ? '' : '[]',
                            }))}>
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {optLabels.length < 7 && (
                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                      onClick={() => setQForm(f => ({ ...f, options: [...(f.options || []), ''] }))}>
                      ＋ Thêm đáp án
                    </button>
                  )}
                  {qForm.type === 'checkbox' && (
                    <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Số đáp án cần chọn:</label>
                      <input className="form-input" type="number" min={1} max={7}
                        value={qForm.checkboxCount || 2}
                        onChange={e => setQForm(f => ({ ...f, checkboxCount: Number(e.target.value) }))}
                        style={{ width: 55, fontSize: 12, padding: '5px 8px' }} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 4 }}>
                  {optLabels.map((l, i) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue)', width: 14, fontSize: 12 }}>{l}.</span>
                      <input className="form-input" style={{ fontSize: 12, padding: '5px 8px' }}
                        value={qForm.options?.[i] || ''} onChange={e => setOpt(i, e.target.value)} placeholder={l} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {qForm.type === 'sentence-completion' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Word Bank (cách nhau bằng dấu phẩy)</label>
              <input className="form-input"
                value={Array.isArray(qForm.wordBank) ? qForm.wordBank.join(', ') : ''}
                onChange={e => setQForm(f => ({ ...f, wordBank: e.target.value.split(',').map(w => w.trim()).filter(Boolean) }))}
                placeholder="word1, phrase two, word3" />
            </div>
          )}

          {qForm.type === 'map-labelling' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hình ảnh riêng (để trống nếu dùng hình nhóm)</label>
              <input className="form-input" value={qForm.imageUrl || ''}
                onChange={e => setQForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="URL hình (tùy chọn)" />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Đáp án đúng *</label>
            {isTFNG ? (
              <TFNGAnswerPicker options={tfOpts} value={qForm.correctAnswer}
                onChange={a => setQForm(f => ({ ...f, correctAnswer: a }))} />
            ) : ['multiple-choice', 'multi-answer-group'].includes(qForm.type) && (qForm.options || []).some(o => o?.trim()) ? (
              <MCAnswerPicker options={qForm.options} optLabels={optLabels} value={qForm.correctAnswer}
                onChange={a => setQForm(f => ({ ...f, correctAnswer: a }))} />
            ) : qForm.type === 'checkbox' && (qForm.options || []).some(o => o?.trim()) ? (
              <CheckboxAnswerPicker options={qForm.options} optLabels={optLabels} value={qForm.correctAnswer}
                onChange={a => setQForm(f => ({ ...f, correctAnswer: a }))} />
            ) : groupType === 'map' && dragDropWords.length > 0 ? (
              <MapAnswerPicker words={dragDropWords} value={qForm.correctAnswer}
                onChange={a => setQForm(f => ({ ...f, correctAnswer: a }))} />
            ) : (
              <input className="form-input" value={qForm.correctAnswer} onChange={setF('correctAnswer')}
                placeholder={ANS_HINT[qForm.type] || 'Đáp án chính xác'} />
            )}
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
              💡 {groupType === 'map' && dragDropWords.length > 0 ? 'Chọn nhãn đúng từ Option Bank bên trên' : ANS_HINT[qForm.type]}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giải thích (tùy chọn)</label>
            <textarea className="form-input" rows={2} value={qForm.explanation || ''} onChange={setF('explanation')} placeholder="Giải thích đáp án..." />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn btn-primary" onClick={onSave}>Lưu câu hỏi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
