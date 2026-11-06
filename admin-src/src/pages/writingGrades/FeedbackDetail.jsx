// Detailed AI feedback for one task (sentence errors / vocabulary upgrades /
// logic notes / Draft 2 plan), as the student will see it. While the grade
// is still open the teacher can remove anything the AI got wrong before
// confirming; removals only take effect when the grade is confirmed.

// Same labels as ERROR_CATEGORIES in backend/services/writingGradingService.js.
const CAT = {
  tense: 'Thì động từ', sva: 'Hòa hợp chủ–vị', article: 'Mạo từ', noun_number: 'Số ít/số nhiều',
  preposition: 'Giới từ', word_form: 'Từ loại', verb_form: 'Dạng động từ', sentence_structure: 'Cấu trúc câu',
  relative_clause: 'Mệnh đề quan hệ', pronoun: 'Đại từ', comparison: 'So sánh', punctuation: 'Dấu câu',
  spelling: 'Chính tả', word_choice: 'Dùng từ sai', collocation: 'Collocation', register: 'Văn phong',
  linking: 'Từ nối', data: 'Sai số liệu', other: 'Khác',
};
const CRIT_COLOR = { GRA: '#7c3aed', LR: '#0369a1', CC: '#b45309', TA: '#dc2626', TR: '#dc2626' };

const errorsOf = s => (Array.isArray(s?.errors) ? s.errors : []);
const upgradesOf = s => (Array.isArray(s?.upgrades) ? s.upgrades : []);

// Drop one error from a sentence. The AI's corrected sentence still has that
// fix in it, so put the original words back where we can find them.
function withoutError(s, idx) {
  const e = errorsOf(s)[idx];
  const errors = errorsOf(s).filter((_, i) => i !== idx);
  const ups = upgradesOf(s);
  if (!errors.length) return { type: 'ok', original: s.original, ...(ups.length ? { upgrades: ups } : {}) };
  let better = s.better || '';
  if (better && e?.fix && e?.wrong && better.includes(e.fix)) better = better.replace(e.fix, e.wrong);
  return { ...s, errors, better, criterion: errors[0].criterion, issue: errors.map(x => x.why).filter(Boolean).join(' ') };
}

function Chip({ text, color }) {
  if (!text) return null;
  return <span style={{ background: color || '#6b7280', color: '#fff', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 8 }}>{text}</span>;
}

function RemoveBtn({ onClick, title }) {
  return (
    <button type="button" onClick={onClick} title={title || 'Bỏ mục này (AI chấm sai)'}
      style={{ flexShrink: 0, background: 'none', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text3)', cursor: 'pointer', fontSize: 11, padding: '0 6px', lineHeight: '18px', fontFamily: 'inherit' }}>
      ✕ Bỏ
    </button>
  );
}

export default function FeedbackDetail({ detail, editable, onChange }) {
  if (!detail) return null;
  const sf = detail.sentenceFeedback || [];
  const logic = detail.logicFeedback || [];
  const plan = detail.draft2Plan || [];
  if (!sf.length && !logic.length && !plan.length) return null;

  const nErr = sf.reduce((a, s) => a + (errorsOf(s).length || (s.type === 'issue' ? 1 : 0)), 0);
  const nUp = sf.reduce((a, s) => a + upgradesOf(s).length, 0);
  const setSentence = (i, next) => onChange({ ...detail, sentenceFeedback: sf.map((s, k) => (k === i ? next : s)) });

  return (
    <details open={editable} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
      <summary style={{ cursor: 'pointer', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>
        🔍 Phân tích chi tiết — {nErr} lỗi · {nUp} gợi ý nâng cấp · {logic.length} vấn đề lập luận
        {editable && <span style={{ fontWeight: 400, color: 'var(--text3)' }}> (bấm "✕ Bỏ" để xoá chỗ AI chấm sai trước khi xác nhận)</span>}
      </summary>
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {logic.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>Lập luận & bám đề</div>
            {logic.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(249,115,22,.08)', borderLeft: '3px solid #f97316', borderRadius: 6, padding: '6px 10px', fontSize: 12.5 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                    <b style={{ fontSize: 11 }}>{l.paragraph ? `Đoạn ${l.paragraph}` : 'Toàn bài'}</b>
                    <Chip text={l.criterion} color={CRIT_COLOR[l.criterion]} />
                  </div>
                  {l.quote && <div style={{ fontStyle: 'italic', color: 'var(--text3)' }}>“{l.quote}”</div>}
                  <div>{l.problem}</div>
                  {l.suggestion && <div style={{ color: '#059669' }}>→ {l.suggestion}</div>}
                </div>
                {editable && <RemoveBtn onClick={() => onChange({ ...detail, logicFeedback: logic.filter((_, k) => k !== i) })} />}
              </div>
            ))}
          </div>
        )}

        {sf.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', marginTop: 4 }}>Từng câu</div>}
        {sf.map((s, i) => {
          const errs = errorsOf(s), ups = upgradesOf(s);
          const ok = s.type === 'ok';
          if (ok && !ups.length && !s.suggestion) return null; // correct sentences with nothing to say are just noise here
          return (
            <div key={i} style={{ borderLeft: `3px solid ${ok ? '#22c55e' : '#ef4444'}`, background: ok ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)', borderRadius: 6, padding: '6px 10px', fontSize: 12.5 }}>
              <div style={{ color: 'var(--text)', marginBottom: 4, lineHeight: 1.6 }}>
                {!ok && !errs.length ? <s style={{ textDecorationColor: '#ef4444' }}>{s.original}</s> : s.original}
              </div>
              {errs.map((e, k) => (
                <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ flex: 1, lineHeight: 1.55 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#6d28d9', background: 'rgba(109,40,217,.1)', borderRadius: 4, padding: '0 5px', marginRight: 5 }}>{CAT[e.category] || CAT.other}</span>
                    <Chip text={e.criterion} color={CRIT_COLOR[e.criterion]} />{' '}
                    <s style={{ color: '#dc2626' }}>{e.wrong}</s> → <b style={{ color: '#15803d' }}>{e.fix || '(bỏ đi)'}</b>
                    {e.why && <div style={{ color: 'var(--text3)', fontSize: 12 }}>{e.why}</div>}
                  </div>
                  {editable && <RemoveBtn onClick={() => setSentence(i, withoutError(s, k))} />}
                </div>
              ))}
              {!errs.length && !ok && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ flex: 1 }}>
                    <Chip text={s.criterion} color={CRIT_COLOR[s.criterion]} /> {s.issue}
                  </div>
                  {editable && <RemoveBtn onClick={() => setSentence(i, { type: 'ok', original: s.original, ...(ups.length ? { upgrades: ups } : {}) })} />}
                </div>
              )}
              {!ok && s.better && <div style={{ color: '#15803d' }}>✓ {s.better}</div>}
              {ok && s.suggestion && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 3 }}>
                  <div style={{ flex: 1, color: 'var(--blue)' }}>
                    💡 Gợi ý (không trừ điểm): {s.suggestion}{s.suggestionWhy && <span style={{ color: 'var(--text3)' }}> — {s.suggestionWhy}</span>}
                  </div>
                  {editable && <RemoveBtn onClick={() => { const { suggestion, suggestionWhy, ...rest } = s; setSentence(i, rest); }} />}
                </div>
              )}
              {ups.map((u, k) => (
                <div key={`u${k}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 3 }}>
                  <div style={{ flex: 1, color: 'var(--blue)' }}>
                    💡 {u.from} → <b>{u.to}</b>{u.why && <span style={{ color: 'var(--text3)' }}> — {u.why}</span>}
                  </div>
                  {editable && <RemoveBtn onClick={() => setSentence(i, { ...s, upgrades: ups.filter((_, j) => j !== k) })} />}
                </div>
              ))}
            </div>
          );
        })}

        {plan.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>Kế hoạch Draft 2</div>
            {plan.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, marginBottom: 3 }}>
                <div style={{ flex: 1 }}>{i + 1}. {p}</div>
                {editable && <RemoveBtn onClick={() => onChange({ ...detail, draft2Plan: plan.filter((_, k) => k !== i) })} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
