// The type guide above the path (recognise / outline / 6+→7+ / useful
// language / model essay / mistakes, GET /api/task2/type-guides) and the
// model essay ⑤ compares with. Highlights: js/shared/task2-highlight.js.

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// The essay as the old page built it: one HTML string (prompt, legend,
// sections, copy button), so the highlight script's own toggle keeps working.
function EssayBody({ me, prompt = false, copy = false }) {
  const T2H = window.T2Highlight;
  const hl = !!(T2H && T2H.hasAny(me.sections));
  const sections = me.sections || [];
  const html = (prompt ? `<div class="t2-g-prompt">${esc(me.prompt)}</div>` : '')
    + (hl ? T2H.legend(sections) : '')
    + sections.map((s) => `<h5>${esc(s.title)}</h5><div>${hl ? T2H.html(s.text, s.highlights) : esc(s.text)}</div>`).join('')
    + (copy ? '<button class="t2-g-copy"><i class="fas fa-copy"></i> Chép cả bài</button>' : '');
  function onClick(e) {
    const btn = e.target.closest('.t2-g-copy');
    if (!btn || !navigator.clipboard) return;
    const text = sections.map((s) => `${s.title}\n${s.text}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Đã chép';
      setTimeout(() => { btn.innerHTML = old; }, 1500);
    });
  }
  return (
    <div className={`t2-g-essay${hl ? ' t2hl-root' + (T2H.isOff() ? ' t2hl-off' : '') : ''}`}
      onClick={copy ? onClick : undefined} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function ModelEssay({ me, open }) {
  return (
    <details className="pth-model" open={open}>
      <summary>📖 Bài mẫu Band 7+{me.wordCount ? ' · ' + me.wordCount : ''}</summary>
      <EssayBody me={me} />
    </details>
  );
}

function Sub({ icon, title, children }) {
  return <details className="t2-g-sec"><summary>{icon} {title}</summary><div className="t2-g-inner">{children}</div></details>;
}

export default function TypeGuide({ g, hidden }) {
  const style = hidden ? { display: 'none' } : undefined;
  if (!g) return <div id="tpl-guide-area" style={style} />;
  const me = g.modelEssay || {};
  return (
    <div id="tpl-guide-area" style={style}>
      <details className="t2-guide">
        <summary><i className="fas fa-book-open" /> Hướng dẫn dạng bài này — {g.name}{g.nameVi ? ' · ' + g.nameVi : ''}</summary>
        <div className="t2-guide-body">
          <Sub icon="🔍" title="Nhận diện đề">
            <ul>{((g.recognise || {}).stems || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
            {(g.recognise || {}).note && <div className="t2-g-note">{g.recognise.note}</div>}
          </Sub>
          <Sub icon="🧭" title="Dàn ý">
            <div className="t2-g-flow">{(g.outline || {}).flow}</div>
            {(g.outline || {}).perBody && <div style={{ marginTop: 6 }}>{g.outline.perBody}</div>}
          </Sub>
          <Sub icon="🔼" title="Bảng nâng cấp câu: Band 6+ → Band 7+">
            <div style={{ overflowX: 'auto' }}>
              <table className="t2-g-up"><thead><tr><th>Band 6+</th><th>Band 7+</th></tr></thead>
                <tbody>{(g.upgradePairs || []).map((p, i) => <tr key={i}><td>{p[0]}</td><td>{p[1]}</td></tr>)}</tbody>
              </table>
            </div>
          </Sub>
          <Sub icon="🧰" title="Useful language">
            {(g.usefulLanguage || []).map((grp, i) => (
              <div className="t2-g-ul-grp" key={i}><b>{grp.label}</b><ul>{(grp.lines || []).map((l, k) => <li key={k}>{l}</li>)}</ul></div>
            ))}
          </Sub>
          <Sub icon="📝" title={'Bài mẫu Band 7+' + (me.wordCount ? ' · ' + me.wordCount : '')}>
            <EssayBody me={me} prompt copy />
          </Sub>
          <Sub icon="⚠️" title="Lỗi thường gặp ở dạng này">
            <ul>{(g.mistakes || []).map((m, i) => <li key={i}>{m}</li>)}</ul>
          </Sub>
        </div>
      </details>
    </div>
  );
}
