// Shared "paste & import" status banner — extracted 2026-07-25 (admin panel
// audit finding #9) from Vocabulary.jsx's ImportJsonModal and
// VocabularyLessonImport.jsx, which each hand-rolled their own success/
// error/warning message box with the same padding/border/color shape.
// The two import flows themselves stay separate (genuinely different
// formats — raw JSON vs a custom key=value DSL — and different data
// targets, VocabUnit vs VocabularyLesson), only this shared bit of chrome
// moved out.
const TONES = {
  success: { bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.3)', text: 'var(--green)' },
  error:   { bg: 'rgba(239,68,68,.1)',  border: 'rgba(239,68,68,.3)',  text: 'var(--danger)' },
  warning: { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)', text: '#b45309' },
};

/**
 * @param {string} tone - 'success' | 'error' | 'warning'
 * @param {string} title - bold heading line, e.g. "✓ Đã import 12 unit"
 * @param {Array<{ text: string, color?: string }|string>} [items] - optional bullet list; each item can be a plain string (uses the tone's text color) or {text, color} for per-item coloring (e.g. Vocabulary.jsx's created/updated/skip distinction)
 */
export default function ImportStatusBox({ tone, title, items }) {
  const c = TONES[tone] || TONES.success;
  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <strong>{title}</strong>
      {items?.length > 0 && (
        <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 12 }}>
          {items.map((item, i) => {
            const text = typeof item === 'string' ? item : item.text;
            const color = typeof item === 'string' ? undefined : item.color;
            return <li key={i} style={color ? { color } : undefined}>{text}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
