/* ══════════════════════════════════════════════════════════════════════
   T1Chart — small inline-SVG illustrations for Task 1 Grammar exercises
   (task1-practice.html). Each Task1Exercise may carry a `chart` spec; this
   draws it at the container's real pixel width (so labels stay readable
   on phones) and re-draws on resize. No library, no network.

   Spec kinds (all take optional `title`, `note`, `source`):
     bar     { labels:[..], series:[{name, values:[..]}], unit, yMax?, horizontal? }
     line    { labels:[..], series:[{name, values:[..]}], unit, forecastFrom?, yMax?, yMin? }
     pie     { pies:[{caption, slices:[{label, value}]}] }  (or slices:[..] for one pie)
     table   { head:[..], rows:[[..]] }
     stat    { items:[{icon, value, label}] }
     map     { panels:[{caption, items:[{t, label, x, y, w, h}]}] }  (0–100 grid)
     process { steps:[{icon, label}], cycle? }

   Colours: the 8-slot categorical palette (fixed order, light + dark steps),
   text always in the site's text tokens. Series ≥2 get a legend; ≤4 lines
   are also labelled at their end.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const STYLE_ID = 't1-chart-style';
  const CSS = `
.t1-chart{--c1:#2a78d6;--c2:#eb6834;--c3:#1baf7a;--c4:#eda100;--c5:#e87ba4;--c6:#008300;--c7:#6250d6;--c8:#e34948;
  --cgrid:rgba(17,24,39,.08);--caxis:rgba(17,24,39,.28);--cring:var(--surface,#fff);
  margin:0 0 14px;padding:12px 12px 10px;border:1px solid var(--border,#e5e7eb);border-radius:12px;background:var(--surface,#fff);color:var(--text,#111827)}
[data-theme="dark"] .t1-chart{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#d55181;--c6:#008300;--c7:#9085e9;--c8:#e66767;
  --cgrid:rgba(245,245,245,.08);--caxis:rgba(245,245,245,.3)}
.t1-chart.hidden{display:none}
.t1-chart-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.t1-chart-kind{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text2,#6b7280)}
.t1-chart-title{font-size:14px;font-weight:700;line-height:1.35;color:var(--text,#111827)}
.t1-chart svg{display:block;width:100%;height:auto;overflow:visible}
.t1-chart svg text{font-family:inherit}
.t1-chart-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:4px 0 2px;font-size:12px;color:var(--text2,#6b7280)}
.t1-chart-legend span{display:inline-flex;align-items:center;gap:6px}
.t1-chart-legend i{display:inline-block;width:12px;height:12px;border-radius:3px}
.t1-chart-legend i.ln{height:3px;border-radius:2px;width:16px}
.t1-chart-legend i.dash{background:none!important;border-top:2px dashed var(--text2,#6b7280);height:0;width:16px;border-radius:0}
.t1-chart-note{margin-top:6px;font-size:11.5px;color:var(--text3,#9ca3af);line-height:1.4}
.t1-chart table{width:100%;border-collapse:collapse;font-size:13px}
.t1-chart th,.t1-chart td{padding:7px 9px;border-bottom:1px solid var(--border,#e5e7eb);text-align:right;font-variant-numeric:tabular-nums}
.t1-chart th:first-child,.t1-chart td:first-child{text-align:left}
.t1-chart th{font-size:12px;color:var(--text2,#6b7280);font-weight:700;background:var(--surface2,#f3f4f6)}
.t1-chart-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.t1-chart-stat{border-radius:10px;background:var(--surface2,#f3f4f6);padding:12px;text-align:center}
.t1-chart-stat .ic{font-size:28px;line-height:1}
.t1-chart-stat .v{font-size:22px;font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums;color:var(--text,#111827)}
.t1-chart-stat .l{font-size:12px;color:var(--text2,#6b7280);margin-top:2px;line-height:1.35}
.t1-chart-steps{display:flex;flex-wrap:wrap;align-items:stretch;gap:6px}
.t1-chart-step{flex:1 1 110px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;padding:10px 8px;border-radius:10px;background:var(--surface2,#f3f4f6);font-size:12.5px;line-height:1.3;position:relative}
.t1-chart-step .ic{font-size:26px;line-height:1}
.t1-chart-step .n{position:absolute;top:5px;left:7px;font-size:10.5px;font-weight:800;color:var(--text3,#9ca3af)}
.t1-chart-arrow{align-self:center;color:var(--text3,#9ca3af);font-size:16px}
.t1-chart-maps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.t1-chart-maps figure{margin:0}
.t1-chart-maps figcaption{text-align:center;font-weight:700;font-size:13px;margin-bottom:4px}
.t1-chart-tip{position:absolute;pointer-events:none;z-index:5;background:var(--text,#111827);color:var(--surface,#fff);font-size:12px;padding:5px 8px;border-radius:6px;white-space:nowrap;transform:translate(-50%,-110%);opacity:0;transition:opacity .12s}
`;

  const KIND_LABEL = {
    bar: 'Bar chart', line: 'Line graph', pie: 'Pie chart', table: 'Table',
    stat: 'Số liệu', map: 'Map', process: 'Process diagram',
  };

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = i => `var(--c${(i % 8) + 1})`;

  function fmt(v) {
    if (v == null || isNaN(v)) return '';
    const n = Number(v);
    if (Math.abs(n) >= 1000) return n.toLocaleString('en-US');
    return String(Math.round(n * 100) / 100);
  }
  const withUnit = (v, unit) => {
    if (!unit) return fmt(v);
    if (unit === '%') return fmt(v) + '%';
    if (unit[0] === '$' || unit[0] === '£') return unit[0] + fmt(v) + unit.slice(1);
    return fmt(v) + ' ' + unit;
  };

  // "nice" axis max + tick step
  function niceScale(max, min) {
    min = min || 0;
    const span = Math.max(1e-9, max - min);
    const raw = span / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    const top = Math.ceil(max / step) * step;
    const bottom = Math.floor(min / step) * step;
    return { top, bottom, step };
  }
  const tickLabel = v => (Math.abs(v) >= 1000 ? (v / 1000).toLocaleString('en-US') + 'k' : fmt(v));

  function legend(series, kind, forecast) {
    if (series.length < 2 && !forecast) return '';
    const items = series.length >= 2 ? series.map((s, i) =>
      `<span><i class="${kind === 'line' ? 'ln' : ''}" style="background:${col(s.color != null ? s.color : i)}"></i>${esc(s.name)}</span>`).join('') : '';
    const fc = forecast ? '<span><i class="dash"></i>Dự báo (forecast)</span>' : '';
    return `<div class="t1-chart-legend">${items}${fc}</div>`;
  }

  // ── Tooltip (one per chart container) ─────────────────────────────────
  function bindTips(root) {
    const tip = document.createElement('div');
    tip.className = 't1-chart-tip';
    root.style.position = 'relative';
    root.appendChild(tip);
    root.querySelectorAll('[data-tip]').forEach(el => {
      const show = () => {
        const r = el.getBoundingClientRect();
        const rr = root.getBoundingClientRect();
        tip.textContent = el.getAttribute('data-tip');
        tip.style.left = (r.left + r.width / 2 - rr.left) + 'px';
        tip.style.top = (r.top - rr.top) + 'px';
        tip.style.opacity = '1';
      };
      const hide = () => { tip.style.opacity = '0'; };
      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('touchstart', show, { passive: true });
    });
  }

  // ── Bar ───────────────────────────────────────────────────────────────
  function drawBar(spec, W) {
    const series = spec.series || [];
    const labels = spec.labels || [];
    const n = labels.length, k = Math.max(1, series.length);
    const all = series.flatMap(s => s.values).filter(v => v != null);
    const sc = niceScale(spec.yMax || Math.max(...all, 1));
    const narrow = W < 420;
    const H = narrow ? 230 : 260;
    const padL = 44, padR = 8, padT = 18;
    const pw = W - padL - padR;
    const band = pw / n;
    // x labels: one line if every label fits its band, else two lines, else slanted
    const fs = narrow ? 11 : 12;
    const textW = s => String(s).length * fs * 0.56;
    const split = s => { const w = String(s).split(' '); const m = Math.ceil(w.length / 2); return [w.slice(0, m).join(' '), w.slice(m).join(' ')]; };
    const labMode = labels.every(l => textW(l) <= band - 4) ? 'one'
      : labels.every(l => split(l).every(p => textW(p) <= band - 4)) ? 'two' : 'slant';
    const padB = labMode === 'one' ? 34 : labMode === 'two' ? 46
      : 22 + Math.min(90, Math.max(...labels.map(textW)) * 0.6);
    const ph = H - padT - padB;
    const y = v => padT + ph - (v - sc.bottom) / (sc.top - sc.bottom) * ph;
    const groupW = Math.min(band * 0.72, k * 46);
    const gap = k > 1 ? 2 : 0;
    const bw = (groupW - gap * (k - 1)) / k;
    const showVals = n * k <= 12;
    let g = '';
    for (let t = sc.bottom; t <= sc.top + 1e-9; t += sc.step) {
      g += `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}" stroke="var(--cgrid)"/>`;
      g += `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--text2)">${tickLabel(t)}</text>`;
    }
    if (spec.unit) g += `<text x="2" y="${padT - 7}" text-anchor="start" font-size="10.5" fill="var(--text3)">${esc(spec.unit)}</text>`;
    labels.forEach((lab, i) => {
      const cx = padL + band * i + band / 2;
      const x0 = cx - groupW / 2;
      series.forEach((s, j) => {
        const v = s.values[i];
        if (v == null) return;
        const x = x0 + j * (bw + gap), yt = y(v), yb = y(Math.max(0, sc.bottom));
        const h = Math.max(1, yb - yt), r = Math.min(4, bw / 2, h);
        const c = col(s.color != null ? s.color : (series.length === 1 && spec.colorByBar ? i : j));
        g += `<path d="M${x},${yb} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${yb} Z" fill="${c}"
          data-tip="${esc((s.name ? s.name + ' · ' : '') + lab + ': ' + withUnit(v, spec.unit))}"/>`;
        if (showVals) g += `<text x="${x + bw / 2}" y="${yt - 5}" text-anchor="middle" font-size="${bw < 26 ? 10 : 11.5}" font-weight="600" fill="var(--text)">${esc(spec.valueLabels ? spec.valueLabels[j]?.[i] ?? fmt(v) : fmt(v))}</text>`;
      });
      const ly = H - padB + 17;
      if (labMode === 'one') {
        g += `<text x="${cx}" y="${ly}" text-anchor="middle" font-size="${fs}" fill="var(--text2)">${esc(lab)}</text>`;
      } else if (labMode === 'two') {
        const [a, b] = split(lab);
        g += `<text x="${cx}" y="${ly - 1}" text-anchor="middle" font-size="${fs}" fill="var(--text2)">${esc(a)}</text>`;
        if (b) g += `<text x="${cx}" y="${ly + 12}" text-anchor="middle" font-size="${fs}" fill="var(--text2)">${esc(b)}</text>`;
      } else {
        g += `<text x="${cx + 4}" y="${ly - 4}" text-anchor="end" font-size="${fs}" fill="var(--text2)" transform="rotate(-35 ${cx + 4} ${ly - 4})">${esc(lab)}</text>`;
      }
    });
    g += `<line x1="${padL}" x2="${W - padR}" y1="${y(Math.max(0, sc.bottom))}" y2="${y(Math.max(0, sc.bottom))}" stroke="var(--caxis)"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${g}</svg>` + legend(series, 'bar');
  }

  // ── Line ──────────────────────────────────────────────────────────────
  function drawLine(spec, W) {
    const series = spec.series || [];
    const labels = spec.labels || [];
    const n = labels.length;
    const all = series.flatMap(s => s.values).filter(v => v != null);
    const sc = niceScale(spec.yMax || Math.max(...all, 1), spec.yMin != null ? spec.yMin : 0);
    const narrow = W < 420;
    const endLabels = series.length >= 2 && series.length <= 4 && !narrow;
    const H = narrow ? 230 : 260;
    const padL = 44, padR = endLabels ? 74 : 16, padT = 18, padB = 34;
    const pw = W - padL - padR, ph = H - padT - padB;
    const x = i => padL + (n === 1 ? pw / 2 : pw * i / (n - 1));
    const y = v => padT + ph - (v - sc.bottom) / (sc.top - sc.bottom) * ph;
    const fc = spec.forecastFrom;
    let g = '';
    for (let t = sc.bottom; t <= sc.top + 1e-9; t += sc.step) {
      g += `<line x1="${padL}" x2="${padL + pw}" y1="${y(t)}" y2="${y(t)}" stroke="var(--cgrid)"/>`;
      g += `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" font-size="11" fill="var(--text2)">${tickLabel(t)}</text>`;
    }
    if (spec.unit) g += `<text x="2" y="${padT - 7}" text-anchor="start" font-size="10.5" fill="var(--text3)">${esc(spec.unit)}</text>`;
    if (fc != null) g += `<rect x="${x(fc)}" y="${padT}" width="${x(n - 1) - x(fc)}" height="${ph}" fill="var(--cgrid)" opacity=".6"/>`;
    const every = Math.ceil(n / (narrow ? 5 : 9));
    labels.forEach((lab, i) => {
      if (i % every && i !== n - 1) return;
      g += `<text x="${x(i)}" y="${H - padB + 17}" text-anchor="middle" font-size="${narrow ? 11 : 12}" fill="var(--text2)">${esc(lab)}</text>`;
    });
    g += `<line x1="${padL}" x2="${padL + pw}" y1="${y(sc.bottom)}" y2="${y(sc.bottom)}" stroke="var(--caxis)"/>`;
    const ends = [];
    series.forEach((s, j) => {
      const c = col(s.color != null ? s.color : j);
      const pts = s.values.map((v, i) => v == null ? null : [x(i), y(v)]);
      const path = (from, to) => {
        let d = '', pen = false;
        for (let i = from; i <= to; i++) {
          if (!pts[i]) { pen = false; continue; }
          d += (pen ? 'L' : 'M') + pts[i][0].toFixed(1) + ',' + pts[i][1].toFixed(1);
          pen = true;
        }
        return d;
      };
      if (fc != null) {
        g += `<path d="${path(0, fc)}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
        g += `<path d="${path(fc, n - 1)}" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round"/>`;
      } else {
        g += `<path d="${path(0, n - 1)}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      const markers = n <= 14;
      pts.forEach((p, i) => {
        if (!p) return;
        if (markers) g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${c}" stroke="var(--cring)" stroke-width="2"/>`;
        g += `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="transparent" data-tip="${esc((s.name ? s.name + ' · ' : '') + labels[i] + ': ' + withUnit(s.values[i], spec.unit))}"/>`;
      });
      (s.callouts || []).forEach(i => {
        if (!pts[i]) return;
        g += `<text x="${pts[i][0]}" y="${pts[i][1] - 10}" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--text)">${esc(fmt(s.values[i]))}</text>`;
      });
      const li = pts.map((p, i) => p ? i : -1).filter(i => i >= 0).pop();
      if (endLabels && li != null) ends.push({ y: pts[li][1], name: s.name, x: pts[li][0] });
    });
    // de-collide end labels
    ends.sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;
    ends.forEach(e => { g += `<text x="${e.x + 8}" y="${e.y + 4}" font-size="11.5" font-weight="600" fill="var(--text)">${esc(e.name)}</text>`; });
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${g}</svg>` + legend(series, 'line', fc != null);
  }

  // ── Pie ───────────────────────────────────────────────────────────────
  function drawPie(spec, W) {
    const pies = spec.pies || [{ caption: '', slices: spec.slices || [] }];
    const cols = W < 420 ? 1 : Math.min(pies.length, 2);
    const cellW = W / cols;
    const R = Math.min(cellW * 0.32, 92);
    const rowsN = Math.ceil(pies.length / cols);
    const cellH = R * 2 + 44;
    const H = rowsN * cellH;
    // stable colour per slice label across pies
    const labelOrder = [];
    pies.forEach(p => p.slices.forEach(s => { if (!labelOrder.includes(s.label)) labelOrder.push(s.label); }));
    let g = '';
    pies.forEach((p, pi) => {
      const cx = cellW * (pi % cols) + cellW / 2;
      const cy = Math.floor(pi / cols) * cellH + 24 + R;
      if (p.caption) g += `<text x="${cx}" y="${cy - R - 9}" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--text)">${esc(p.caption)}</text>`;
      const total = p.slices.reduce((a, s) => a + s.value, 0) || 1;
      let a0 = -Math.PI / 2;
      p.slices.forEach(s => {
        const frac = s.value / total;
        const a1 = a0 + frac * Math.PI * 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const c = col(labelOrder.indexOf(s.label));
        const d = frac >= 0.9999
          ? `M${cx - R},${cy} a${R},${R} 0 1,0 ${2 * R},0 a${R},${R} 0 1,0 ${-2 * R},0`
          : `M${cx},${cy} L${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} Z`;
        g += `<path d="${d}" fill="${c}" stroke="var(--cring)" stroke-width="2" stroke-linejoin="round" data-tip="${esc(s.label + ': ' + fmt(s.value) + (spec.unit === '%' || !spec.unit ? '%' : ' ' + spec.unit))}"/>`;
        if (frac >= 0.07) {
          const am = (a0 + a1) / 2, rr = R * 0.64;
          g += `<text x="${cx + rr * Math.cos(am)}" y="${cy + rr * Math.sin(am) + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${fmt(s.value)}%</text>`;
        }
        a0 = a1;
      });
    });
    // one pie → the legend also carries each value (small slices have no in-slice label)
    const one = pies.length === 1 ? pies[0].slices : null;
    const leg = `<div class="t1-chart-legend">${labelOrder.map((l, i) => {
      const v = one && one.find(s => s.label === l);
      return `<span><i style="background:${col(i)}"></i>${esc(l)}${v ? ' · ' + fmt(v.value) + '%' : ''}</span>`;
    }).join('')}</div>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${g}</svg>` + leg;
  }

  // ── Table / stat / process (plain HTML) ───────────────────────────────
  function drawTable(spec) {
    const head = (spec.head || []).map(h => `<th>${esc(h)}</th>`).join('');
    const rows = (spec.rows || []).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    return `<div style="overflow-x:auto"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function drawStat(spec) {
    return `<div class="t1-chart-stats">${(spec.items || []).map(it =>
      `<div class="t1-chart-stat"><div class="ic">${esc(it.icon || '📊')}</div><div class="v">${esc(it.value)}</div><div class="l">${esc(it.label)}</div></div>`).join('')}</div>`;
  }
  function drawProcess(spec) {
    const steps = spec.steps || [];
    const parts = [];
    steps.forEach((s, i) => {
      if (i) parts.push('<span class="t1-chart-arrow">➜</span>');
      parts.push(`<div class="t1-chart-step"><span class="n">${i + 1}</span><span class="ic">${esc(s.icon || '•')}</span><span>${esc(s.label)}</span></div>`);
    });
    if (spec.cycle) parts.push('<span class="t1-chart-arrow" title="lặp lại">↺</span>');
    return `<div class="t1-chart-steps">${parts.join('')}</div>`;
  }

  // ── Map (before / after panels on a 0–100 grid) ───────────────────────
  const MAP_STYLE = {
    farm:    { fill: 'rgba(234,179,8,.28)',  stroke: 'rgba(161,98,7,.7)',   icon: '🌾' },
    forest:  { fill: 'rgba(22,163,74,.28)',  stroke: 'rgba(21,128,61,.75)', icon: '🌲' },
    house:   { fill: 'rgba(229,57,53,.16)',  stroke: 'rgba(198,40,40,.6)',  icon: '🏠' },
    shop:    { fill: 'rgba(61,139,255,.2)',  stroke: 'rgba(44,120,240,.75)', icon: '🛍️' },
    hospital:{ fill: 'rgba(167,139,250,.25)', stroke: 'rgba(124,58,237,.7)', icon: '🏥' },
    school:  { fill: 'rgba(236,72,153,.18)', stroke: 'rgba(190,24,93,.6)',  icon: '🏫' },
    park:    { fill: 'rgba(34,197,94,.18)',  stroke: 'rgba(21,128,61,.6)',  icon: '🌳' },
    water:   { fill: 'rgba(56,189,248,.3)',  stroke: 'rgba(2,132,199,.6)',  icon: '' },
    road:    { fill: 'rgba(107,114,128,.45)', stroke: 'none', icon: '' },
    building:{ fill: 'rgba(107,114,128,.18)', stroke: 'rgba(75,85,99,.6)',  icon: '🏢' },
  };
  function drawMap(spec) {
    const panels = (spec.panels || []).map(p => {
      let g = `<rect x="0.5" y="0.5" width="99" height="74" rx="3" fill="var(--surface2)" stroke="var(--border2)" stroke-width=".5"/>`;
      (p.items || []).forEach(it => {
        const st = MAP_STYLE[it.t] || MAP_STYLE.building;
        g += `<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="${it.t === 'road' ? 0 : 1.5}" fill="${st.fill}" stroke="${st.stroke}" stroke-width=".5" data-tip="${esc(it.label || '')}"/>`;
        if (it.label) {
          const big = it.w >= 18 && it.h >= 12;
          const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
          if (st.icon && big) g += `<text x="${cx}" y="${cy - 1}" text-anchor="middle" font-size="6">${st.icon}</text>`;
          g += `<text x="${cx}" y="${cy + (st.icon && big ? 6 : 1.6)}" text-anchor="middle" font-size="${it.t === 'road' ? 3.4 : 3.9}" font-weight="600" fill="var(--text)">${esc(it.label)}</text>`;
        }
      });
      return `<figure><figcaption>${esc(p.caption || '')}</figcaption><svg viewBox="0 0 100 75" aria-hidden="true">${g}</svg></figure>`;
    });
    return `<div class="t1-chart-maps">${panels.join('')}</div>`;
  }

  function summary(spec) {
    const bits = [];
    if (spec.title) bits.push(spec.title);
    (spec.series || []).forEach(s => bits.push((s.name ? s.name + ': ' : '') +
      (spec.labels || []).map((l, i) => s.values[i] == null ? null : l + ' ' + withUnit(s.values[i], spec.unit)).filter(Boolean).join(', ')));
    (spec.pies || (spec.slices ? [{ slices: spec.slices }] : [])).forEach(p =>
      bits.push((p.caption ? p.caption + ': ' : '') + p.slices.map(s => s.label + ' ' + s.value + '%').join(', ')));
    return bits.join('. ');
  }

  function paint(el, spec) {
    const W = Math.max(280, Math.min(680, Math.floor(el.clientWidth - 24) || 560));
    let body = '';
    switch (spec.kind) {
      case 'bar': body = drawBar(spec, W); break;
      case 'line': body = drawLine(spec, W); break;
      case 'pie': body = drawPie(spec, W); break;
      case 'table': body = drawTable(spec); break;
      case 'stat': body = drawStat(spec); break;
      case 'map': body = drawMap(spec); break;
      case 'process': body = drawProcess(spec); break;
      default: return false;
    }
    const kindLbl = spec.kindLabel || KIND_LABEL[spec.kind] || '';
    el.innerHTML =
      `<div class="t1-chart-head"><span class="t1-chart-kind">${esc(kindLbl)}</span>` +
      (spec.title ? `<span class="t1-chart-title">${esc(spec.title)}</span>` : '') + `</div>` +
      body +
      (spec.note ? `<div class="t1-chart-note">${esc(spec.note)}</div>` : '');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', summary(spec) || kindLbl);
    bindTips(el);
    return true;
  }

  const live = new Map(); // el → spec, for resize re-draws
  let resizeT = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => live.forEach((spec, el) => {
      if (!el.isConnected) { live.delete(el); return; }
      if (!el.classList.contains('hidden')) paint(el, spec);
    }), 150);
  });

  /** Draw `spec` into `el` (shows it), or hide `el` when there's no spec. */
  function render(el, spec) {
    if (!el) return;
    injectStyle();
    el.classList.add('t1-chart');
    if (!spec || !spec.kind) {
      el.classList.add('hidden'); el.innerHTML = ''; live.delete(el); return;
    }
    el.classList.remove('hidden');
    if (!paint(el, spec)) { el.classList.add('hidden'); live.delete(el); return; }
    live.set(el, spec);
    // first paint may happen while a parent is still display:none → width 0
    if (!el.clientWidth) requestAnimationFrame(() => { if (el.clientWidth) paint(el, spec); });
  }

  window.T1Chart = { render };
})();
