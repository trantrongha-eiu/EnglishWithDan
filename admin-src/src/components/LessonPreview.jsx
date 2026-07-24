const DIFFICULTY_BADGE = {
  A1: 'badge-gray', A2: 'badge-gray',
  B1: 'badge-blue', B2: 'badge-blue',
  C1: 'badge-green', C2: 'badge-green',
};

// Shared read-only render of a parsed/stored lesson: Lesson → Word →
// Meaning → Example → Definition → Collocations → Distractors. Used both
// by the Import page's "Preview" step (unsaved, freshly-parsed data) and
// the Lessons list's "Preview" action (an already-saved lesson).
export default function LessonPreview({ lesson, words }) {
  if (!lesson) return null;
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px' }}>{lesson.title}</h3>
        {lesson.description && (
          <p style={{ margin: '0 0 8px', color: 'var(--text2)', fontSize: 13 }}>{lesson.description}</p>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${DIFFICULTY_BADGE[lesson.difficulty] || 'badge-blue'}`}>{lesson.difficulty}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Order: {lesson.order ?? 0}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{words.length} từ</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {words.map((w, i) => (
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 15 }}>{i + 1}. {w.word}</strong>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {w.ipa && <span style={{ fontFamily: 'var(--mono)', color: 'var(--text3)', fontSize: 12 }}>{w.ipa}</span>}
                {w.partOfSpeech && <span className="badge badge-gray" style={{ fontSize: 10 }}>{w.partOfSpeech}</span>}
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, marginTop: 4 }}>{w.meaning}</div>
            {w.example && <div style={{ fontSize: 13, fontStyle: 'italic', marginTop: 8 }}>"{w.example}"</div>}
            {w.definition && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{w.definition}</div>}
            {w.collocations?.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <b>Collocations:</b> {w.collocations.join(', ')}
              </div>
            )}
            {w.distractors?.length > 0 && (
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text3)' }}>
                <b>Distractors:</b> {w.distractors.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
