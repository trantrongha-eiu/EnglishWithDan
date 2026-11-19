// Shared bits of the "Viết câu nâng cao" page (/app/advanced-sentences)

export function Spinner({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <div className="as-spinner" />
      {text && <p style={{ color: '#9ca3af', marginTop: 10 }}>{text}</p>}
    </div>
  );
}

// Lulu reacting to a score (js/shared/playful.js), or the given fallback
export function Mascot({ html, children }) {
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children;
}
