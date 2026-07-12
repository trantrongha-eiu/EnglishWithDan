// Extracted from QuestionFormModal.jsx — the "Đáp án đúng" (correct-answer)
// section was a 5-branch sequential ternary, each branch its own inline JSX
// block. Pulled apart into one small presentational component per question
// type so QuestionFormModal only has to pick which one to render.

export function TFNGAnswerPicker({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, flexWrap: 'wrap' }}>
      {options.map(a => (
        <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, flex: '1 1 auto', minWidth: 100, padding: '4px 8px', borderRadius: 6, background: value === a ? 'rgba(61,139,255,.12)' : 'transparent', border: value === a ? '1.5px solid var(--blue)' : '1.5px solid transparent', transition: 'all .15s' }}>
          <input type="radio" name="tfng-ans" checked={value === a}
            onChange={() => onChange(a)} />
          <span style={{ fontWeight: value === a ? 700 : 400, color: value === a ? 'var(--blue)' : 'inherit' }}>{a}</span>
        </label>
      ))}
    </div>
  );
}

export function MCAnswerPicker({ options, optLabels, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
      {(options || []).map((opt, i) => !opt?.trim() ? null : (
        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
          <input type="radio" name="mc-ans" checked={value === optLabels[i]}
            onChange={() => onChange(optLabels[i])} />
          <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{optLabels[i]}</span>
        </label>
      ))}
    </div>
  );
}

export function CheckboxAnswerPicker({ options, optLabels, value, onChange }) {
  return (
    <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        {(options || []).map((opt, i) => {
          if (!opt?.trim()) return null;
          const letter = optLabels[i];
          let sel = false;
          try { sel = JSON.parse(value || '[]').includes(letter); } catch {}
          return (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={sel} onChange={() => {
                try {
                  const arr = JSON.parse(value || '[]');
                  const next = sel ? arr.filter(l => l !== letter) : [...arr, letter].sort();
                  onChange(JSON.stringify(next));
                } catch { onChange(JSON.stringify([letter])); }
              }} />
              <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{letter}</span>
            </label>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>JSON đáp án (tự cập nhật):</div>
      <input className="form-input" style={{ fontSize: 11 }} value={value}
        onChange={e => onChange(e.target.value)} placeholder='["A","C"]' />
    </div>
  );
}

export function MapAnswerPicker({ words, value, onChange }) {
  return (
    <div style={{ marginTop: 4, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {words.filter(Boolean).map(word => (
        <label key={word} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="radio" name="map-dd-ans" checked={value === word}
            onChange={() => onChange(word)} />
          <span style={{ fontWeight: value === word ? 700 : 400, color: value === word ? 'var(--blue)' : 'inherit' }}>
            {word}
          </span>
        </label>
      ))}
    </div>
  );
}
