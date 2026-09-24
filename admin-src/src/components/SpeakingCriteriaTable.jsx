import { useState } from 'react';

// Teacher view of a speaking-v2 AI analysis (backend services/
// speakingScoringV2.js): one row per IELTS criterion — band, range /
// accuracy / flexibility, main strength, main limitation — and clicking a
// row opens the evidence behind it (descriptor match, quoted evidence,
// corrections, the AI's explanation, the improvement step, plus lexical
// features / grammar structures). Used by the Speaking practice history and
// the Entrance Test review modal. Renders nothing for an older flat
// ("speaking-v1") result without `criteria`.
const ROWS = [
  ['fluencyCoherence', 'Fluency & Coherence'],
  ['lexicalResource', 'Lexical Resource'],
  ['grammaticalRangeAccuracy', 'Grammar'],
  ['pronunciation', 'Pronunciation'],
];
const LEVEL = { low: 'Low', moderate: 'Moderate', high: 'High' };
const LEX = [['lowFrequency', 'Less common'], ['idioms', 'Idioms'], ['phrasalVerbs', 'Phrasal verbs'], ['collocations', 'Collocations'], ['paraphrasing', 'Paraphrase']];

const bandColor = b => (b == null ? 'var(--text3,#888)' : b >= 7 ? '#16a34a' : b >= 5.5 ? '#d97706' : '#dc2626');
const box = { background: 'var(--surface2,#f1f5f9)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, lineHeight: 1.6 };
const label = { fontWeight: 700, fontSize: 12, margin: '10px 0 4px', color: 'var(--text2,#555)' };

function Detail({ k, c }) {
  if (k === 'pronunciation' && c.assessable === false) {
    return <div style={box}>{c.reason || 'Not assessable — no recording was heard.'}</div>;
  }
  return (
    <div>
      {c.feedback && <><div style={label}>AI explanation (why this band)</div><div style={box}>{c.feedback}</div></>}
      {c.descriptorMatch?.length > 0 && (
        <><div style={label}>Descriptor match</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.descriptorMatch.map((d, i) => <span key={i} className="badge" style={{ background: 'var(--surface2,#f1f5f9)', color: 'var(--text,#111)' }}>{d}</span>)}
          </div></>
      )}
      {c.evidence?.length > 0 && (
        <><div style={label}>Evidence</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {c.evidence.map((e, i) => (
              <div key={i} style={{ ...box, borderLeft: `3px solid ${e.positive === false ? '#dc2626' : '#16a34a'}` }}>
                <em>“{e.studentQuote}”</em>{e.feature && <strong> · {e.feature}</strong>}
                {e.evaluation && <div style={{ color: 'var(--text2,#555)' }}>{e.evaluation}</div>}
              </div>
            ))}
          </div></>
      )}
      {c.limitations?.length > 0 && (
        <><div style={label}>Corrections</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {c.limitations.map((l, i) => (
              <div key={i} style={box}>
                {l.studentQuote && <span style={{ color: '#dc2626', textDecoration: 'line-through' }}>{l.studentQuote}</span>}
                {l.correction && <> → <strong style={{ color: '#16a34a' }}>{l.correction}</strong></>}
                {(l.problem || l.explanation) && <div style={{ color: 'var(--text2,#555)' }}>{[l.problem, l.explanation].filter(Boolean).join(' — ')}</div>}
              </div>
            ))}
          </div></>
      )}
      {k === 'lexicalResource' && c.features && (() => {
        const groups = LEX.filter(([key]) => c.features[key]?.length);
        const rep = c.features.repetition || [];
        if (!groups.length && !rep.length) return null;
        return (
          <><div style={label}>Detected language features</div>
            <div style={{ display: 'grid', gap: 4, fontSize: 12.5 }}>
              {groups.map(([key, name]) => (
                <div key={key}><strong>{name}:</strong>{' '}
                  {c.features[key].map((f, i) => (
                    <span key={i} style={{ marginRight: 10, color: f.natural === false ? '#dc2626' : '#16a34a' }}>
                      {f.natural === false ? '✗' : '✓'} “{f.studentQuote}”
                    </span>
                  ))}
                </div>
              ))}
              {rep.length > 0 && <div><strong>Repetition:</strong> {rep.map(r => `“${r.word}” ×${r.count}`).join(', ')}</div>}
            </div></>
        );
      })()}
      {k === 'grammaticalRangeAccuracy' && (c.structures?.length > 0 || c.errorDensity?.clauses > 0) && (
        <><div style={label}>Structures</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12.5 }}>
            {(c.structures || []).map((s, i) => (
              <span key={i} title={s.studentQuote} style={{ color: s.correct === false ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                {s.correct === false ? '✗' : '✓'} {s.type}
              </span>
            ))}
          </div>
          {c.errorDensity?.clauses > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text2,#555)', marginTop: 4 }}>
              ≈ {c.errorDensity.errors} errors / {c.errorDensity.clauses} clauses ({c.errorDensity.minor} minor, {c.errorDensity.major} major){c.errorDensity.pattern ? ` · ${c.errorDensity.pattern}` : ''}
            </div>
          )}</>
      )}
      {c.nextStep && <><div style={label}>Improvement plan</div><div style={box}>{c.nextStep}</div></>}
    </div>
  );
}

export default function SpeakingCriteriaTable({ feedback }) {
  const [open, setOpen] = useState(null);
  const criteria = feedback?.criteria;
  if (!criteria) return null;
  return (
    <div>
      <div className="table-wrap">
        <table className="table" style={{ fontSize: 12.5 }}>
          <thead>
            <tr><th>CRITERION</th><th style={{ textAlign: 'center' }}>BAND</th><th>RANGE</th><th>ACCURACY</th><th>FLEXIBILITY</th><th>MAIN STRENGTH</th><th>MAIN LIMITATION</th></tr>
          </thead>
          <tbody>
            {ROWS.map(([k, name]) => {
              const c = criteria[k];
              if (!c) return null;
              const na = k === 'pronunciation' && c.assessable === false;
              const limitation = na ? (c.reason || 'audio unavailable') : (c.weaknesses?.[0] || c.limitations?.[0]?.problem || '—');
              return (
                <tr key={k} style={{ cursor: 'pointer', background: open === k ? 'var(--surface2,#f1f5f9)' : undefined }}
                  onClick={() => setOpen(open === k ? null : k)} title="Bấm để xem chi tiết">
                  <td style={{ fontWeight: 700 }}>{open === k ? '▾' : '▸'} {name}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: bandColor(na ? null : c.band) }}>{na ? 'N/A' : c.band ?? '—'}</td>
                  <td>{na ? '—' : LEVEL[c.rangeLevel] || '—'}</td>
                  <td>{na ? '—' : LEVEL[c.accuracyLevel] || '—'}</td>
                  <td>{na ? '—' : LEVEL[c.flexibilityLevel] || '—'}</td>
                  <td style={{ maxWidth: 200 }}>{na ? '—' : c.strengths?.[0] || '—'}</td>
                  <td style={{ maxWidth: 200 }}>{limitation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {open && criteria[open] && (
        <div style={{ border: '1px solid var(--border,#e5e7eb)', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>{ROWS.find(r => r[0] === open)?.[1]}</div>
          <Detail k={open} c={criteria[open]} />
        </div>
      )}
      {feedback.priorityImprovements?.length > 0 && (
        <div style={{ ...box, marginTop: 10 }}>
          <strong>Top 3 priorities:</strong>
          <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>{feedback.priorityImprovements.map((p, i) => <li key={i}>{p}</li>)}</ol>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text3,#888)', marginTop: 6 }}>
        {feedback.scoringVersion || ''}{feedback.provisional ? ' · overall is provisional (pronunciation not assessed)' : ''}
        {feedback.qualityCheck ? ` · quotes verified ${feedback.qualityCheck.verifiedQuotes}, dropped ${feedback.qualityCheck.droppedQuotes}` : ''}
      </div>
    </div>
  );
}
