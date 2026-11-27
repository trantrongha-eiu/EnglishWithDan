/* ══════════════════════════════════════════════════════════════════════
   SeriesNav — the "📚 Bộ đề" column on the left of the Reading / Listening
   "Full đề" lists (reading-v2.js, listening.js).

   Lists every test series the page has (seriesName: "Quýt 18", "Vol 3",
   "Actual Tests" …). Numbered series of the same family ("Quýt 10" …
   "Quýt 21") collapse into one block with a chip per number; clicking the
   family name shows the whole family, a chip shows one book. The page owns
   the filter state and re-renders through onPick(key).

   Keys:  ''            → every test
          's:<series>'  → one series
          'f:<family>'  → every "<family> N" series

   SeriesNav.render(el, tests, activeKey, onPick)   // onPick(key)
   SeriesNav.match(test, key) → bool
   SeriesNav.label(key)       → "Quýt 18" / "Quýt (tất cả)" / ''
   SeriesNav.exists(tests, key) → does any test still match key
══════════════════════════════════════════════════════════════════════ */
(function () {
  const FALLBACK = 'Đề lẻ';
  const seriesOf = t => (t && t.seriesName) || FALLBACK;
  // "Quýt 18" → { family: 'Quýt', num: 18 }; "Actual Tests" → null
  function splitNum(name) {
    const m = /^(.*\S)\s+(\d+)$/.exec(name);
    return m ? { family: m[1], num: +m[2] } : null;
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const natCmp = (a, b) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' });

  function match(t, key) {
    if (!key) return true;
    const s = seriesOf(t);
    if (key.startsWith('s:')) return s === key.slice(2);
    if (key.startsWith('f:')) { const p = splitNum(s); return !!p && p.family === key.slice(2); }
    return true;
  }

  function label(key) {
    if (!key) return '';
    if (key.startsWith('s:')) return key.slice(2);
    if (key.startsWith('f:')) return key.slice(2) + ' (tất cả)';
    return '';
  }

  function exists(tests, key) { return !key || (tests || []).some(t => match(t, key)); }

  // Families with ≥2 numbered series become chip blocks; the rest are rows.
  function build(tests) {
    const series = new Map(); // name → { total, done }
    tests.forEach(t => {
      const s = seriesOf(t);
      const r = series.get(s) || { total: 0, done: 0 };
      r.total++; if (t.lastAttempt) r.done++;
      series.set(s, r);
    });
    const fam = new Map(); // family → [{ name, num, total, done }]
    series.forEach((r, name) => {
      const p = splitNum(name);
      if (!p) return;
      if (!fam.has(p.family)) fam.set(p.family, []);
      fam.get(p.family).push({ name, num: p.num, total: r.total, done: r.done });
    });
    const families = [];
    const inFamily = new Set();
    fam.forEach((items, family) => {
      if (items.length < 2) return;
      items.sort((a, b) => a.num - b.num);
      items.forEach(i => inFamily.add(i.name));
      families.push({
        family, items,
        total: items.reduce((n, i) => n + i.total, 0),
        done: items.reduce((n, i) => n + i.done, 0),
      });
    });
    families.sort((a, b) => natCmp(a.family, b.family));
    const singles = [];
    series.forEach((r, name) => { if (!inFamily.has(name)) singles.push({ name, total: r.total, done: r.done }); });
    singles.sort((a, b) => natCmp(a.name, b.name));
    return { families, singles, total: tests.length, done: tests.filter(t => t.lastAttempt).length };
  }

  const stateCls = r => (r.total && r.done >= r.total) ? ' sn-all-done' : (r.done ? ' sn-some-done' : '');

  function render(el, tests, activeKey, onPick) {
    if (!el) return;
    const { families, singles, total, done } = build(tests || []);
    const cur = activeKey || '';
    const attrs = k => `data-sn-key="${esc(k)}"${k === cur ? ' aria-current="true"' : ''}`;
    const on = k => (k === cur ? ' sn-active' : '');
    let html = `<button type="button" class="sn-toggle" data-sn-toggle>
        <i class="fas fa-layer-group"></i><span>Bộ đề${cur ? `: <b>${esc(label(cur))}</b>` : ''}</span>
        <i class="fas fa-chevron-down sn-toggle-caret"></i></button>
      <div class="sn-body">
        <div class="sn-head"><i class="fas fa-layer-group"></i> Bộ đề có sẵn</div>
        <button type="button" class="sn-row${on('')}" ${attrs('')}>
          <span class="sn-row-name">Tất cả bộ đề</span><span class="sn-count">${done}/${total}</span>
        </button>`;
    families.forEach(f => {
      const fk = 'f:' + f.family;
      html += `<div class="sn-fam">
          <button type="button" class="sn-row sn-fam-head${on(fk)}" ${attrs(fk)} title="Xem tất cả ${esc(f.family)}">
            <span class="sn-row-name">${esc(f.family)}</span><span class="sn-count">${f.done}/${f.total}</span>
          </button>
          <div class="sn-chips">${f.items.map(i => {
            const k = 's:' + i.name;
            return `<button type="button" class="sn-chip${stateCls(i)}${on(k)}" ${attrs(k)} title="${esc(i.name)} · ${i.done}/${i.total} đã làm">${i.num}</button>`;
          }).join('')}</div>
        </div>`;
    });
    if (singles.length) {
      if (families.length) html += `<div class="sn-sub">Bộ khác</div>`;
      singles.forEach(s => {
        const k = 's:' + s.name;
        html += `<button type="button" class="sn-row${stateCls(s)}${on(k)}" ${attrs(k)} title="${esc(s.name)}">
            <span class="sn-row-name">${esc(s.name)}</span><span class="sn-count">${s.done}/${s.total}</span>
          </button>`;
      });
    }
    html += '</div>';
    el.innerHTML = html;
    el.onclick = e => {
      if (e.target.closest('[data-sn-toggle]')) { el.classList.toggle('sn-open'); return; }
      const b = e.target.closest('[data-sn-key]');
      if (!b || !el.contains(b)) return;
      el.classList.remove('sn-open');
      onPick(b.getAttribute('data-sn-key'));
    };
  }

  window.SeriesNav = { render, match, label, exists };
})();
