'use strict';
// Cambridge IELTS Reading (books 10–14, 18) from ieltsworldly.com pages → spec-ready text (2026-11-26).
//   node cam_extract.js <book> <test>          reads web/cam/w/c<B>t<T>.html
//   → web/cam/x/c<B>t<T>.dump.txt   whole test as readable blocks (passages, question blocks, widgets, answer key)
//   → web/cam/x/c<B>t<T>p<P>.txt    passage text in the vr_build format ("# standfirst", "A " paragraph letters)
//   → web/cam/x/c<B>t<T>.key.json   { "1": "update", … } from the page's "Answer Keys" table
// The pages are not uniform (some have <input>/<select> widgets, some plain text), so the question blocks are
// dumped for a human to turn into a spec; only the passages and the key are extracted automatically.
const fs = require('fs'), path = require('path');
const [B, T] = process.argv.slice(2);
const W = (...p) => path.join(__dirname, 'web', 'cam', ...p);
fs.mkdirSync(W('x'), { recursive: true });
let h = fs.readFileSync(W('w', `c${B}t${T}.html`), 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<ins[\s\S]*?<\/ins>|<noscript[\s\S]*?<\/noscript>/g, '');
const start = h.indexOf('<h1'), end = h.indexOf('Answer Keys', start);
const keyHtml = h.slice(end, h.indexOf('</table>', end) + 8);
h = h.slice(start, end);

const ent = s => s.replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘').replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#8230;|&hellip;/g, '…').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#038;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8242;/g, '′').replace(/&#215;/g, '×').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
const txt = s => ent(s.replace(/<br\s*\/?>/g, '\n').replace(/<input[^>]*>/g, ' ___ ').replace(/<select[\s\S]*?<\/select>/g, ' [___] ').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();

// block list
const blocks = [];
const re = /<(h[1-4]|p|table|ol|ul|figure|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/g;
let m;
while ((m = re.exec(h))) {
  const tag = m[1], inner = m[2];
  if (tag === 'figure' && !/<table/.test(inner)) { const img = inner.match(/<img[^>]+src="([^"]+)"/); if (img) blocks.push({ t: 'img', s: img[1] }); continue; }
  if (tag === 'table' || (tag === 'figure' && /<table/.test(inner))) {
    const rows = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => txt(c[1]).replace(/\n/g, ' / ')));
    blocks.push({ t: 'table', rows }); continue;
  }
  if (tag === 'ol' || tag === 'ul') {
    const st = (m[0].match(/start="(\d+)"/) || [])[1];
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(li => {
      const sel = li[1].match(/<select[\s\S]*?<\/select>/);
      const opts = sel ? [...sel[0].matchAll(/<option value="([^"]+)"/g)].map(o => o[1]) : null;
      const radios = [...li[1].matchAll(/<input[^>]*type="(radio|checkbox)"[^>]*>\s*([^<]*)/g)].map(r => r[2].trim());
      return { s: txt(li[1]), opts, radios };
    });
    blocks.push({ t: tag, start: st ? +st : null, items }); continue;
  }
  const s = txt(inner);
  if (!s || /^ADVERTISEMENT$/i.test(s)) continue;
  blocks.push({ t: tag === 'p' || tag === 'blockquote' ? 'p' : 'h', s, bold: /^<(strong|b)>/.test(inner.trim()), em: /^<em>/.test(inner.trim()) });
}

// dump
const out = [];
for (const b of blocks) {
  if (b.t === 'h') out.push(`\n## ${b.s}`);
  else if (b.t === 'p') out.push((b.em ? '_' : '') + b.s);
  else if (b.t === 'img') out.push(`[IMG ${b.s}]`);
  else if (b.t === 'table') out.push('[TABLE]\n' + b.rows.map(r => '| ' + r.join(' | ')).join('\n'));
  else out.push(b.items.map((it, i) => `${b.t === 'ol' ? (b.start || 1) + i + '.' : '•'} ${it.s}${it.opts ? '  {' + it.opts.join('/') + '}' : ''}${it.radios.length ? '  (' + it.radios.join(' | ') + ')' : ''}`).join('\n'));
}
const key = {};
for (const r of keyHtml.matchAll(/<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/g)) { const n = txt(r[1]); if (/^\d+$/.test(n)) key[n] = txt(r[2]); }
fs.writeFileSync(W('x', `c${B}t${T}.key.json`), JSON.stringify(key, null, 0));
fs.writeFileSync(W('x', `c${B}t${T}.dump.txt`), out.join('\n') + '\n\n[KEY] ' + Object.entries(key).map(([k, v]) => `${k}=${v}`).join('  ') + '\n');

// passages: a passage = a heading followed by ≥3 long paragraphs before the next "Questions" line
const isQ = s => /^(Passage \d+ )?Questions? \d+/i.test(s);
const SEO = s => /IELTS|Reading Practice Test|Cambridge|Reading Test \d|Answers/i.test(s);
const passages = [];
const rp = blocks.map((b, i) => b.t === 'h' && /^READING PASSAGE \d$/i.test(b.s) ? i : -1).filter(i => i >= 0);
if (rp.length) {
  // older layout: "READING PASSAGE n" heading → (intro line) → title heading → text with <br> paragraphs, stray headings
  for (const i0 of rp) {
    let i = i0 + 1;
    while (i < blocks.length && !(blocks[i].t === 'h' && !SEO(blocks[i].s))) i++;
    const title = blocks[i] ? blocks[i].s : '?';
    const body = [];
    let letter = null;
    for (let j = i + 1; j < blocks.length; j++) {
      const b = blocks[j];
      if ((b.t === 'h' && (isQ(b.s) || /^READING PASSAGE/i.test(b.s))) || (b.t === 'p' && isQ(b.s))) break;
      if (b.t === 'h') {
        if (/^[A-J]$/.test(b.s)) { letter = b.s; continue; }
        if (SEO(b.s) || b.s.length < 40) continue;   // SEO filler / stray sub-heading
      }
      if (b.t !== 'p' && b.t !== 'h') continue;
      if (SEO(b.s) && b.s.length < 120) continue;
      b.s.split(/\n+/).map(x => x.trim()).filter(Boolean).forEach((para, k) => {
        body.push({ t: 'p', s: (letter && k === 0 ? letter + ' ' : '') + para, em: b.em && k === 0 && !body.length });
        if (k === 0) letter = null;
      });
    }
    passages.push({ title, body });
  }
} else for (let i = 0; i < blocks.length; i++) {
  if (blocks[i].t !== 'h') continue;
  const body = [];
  let j = i + 1;
  for (; j < blocks.length; j++) {
    const b = blocks[j];
    if (b.t === 'h' || (b.t === 'p' && isQ(b.s))) break;
    if (b.t === 'p' || b.t === 'ul' || b.t === 'ol') body.push(b);
  }
  const long = body.filter(b => b.t === 'p' && b.s.length > 200).length;
  if (long >= 3) passages.push({ title: blocks[i].s, body });
}
passages.slice(0, 3).forEach((p, k) => {
  const lines = [];
  p.body.forEach((b, i) => {
    if (b.t !== 'p') { lines.push(b.items.map(it => it.s).join('\n')); return; }
    let s = b.s.replace(/\n/g, ' ');
    const lm = s.match(/^\(?([A-J])\)?[.:]?\s+(?=[A-Z‘“'"(])/);
    if (lm) s = `${lm[1]} ${s.slice(lm[0].length)}`;
    else if (i === 0 && b.em && s.length < 400) s = `# ${s}`;
    lines.push(s);
  });
  fs.writeFileSync(W('x', `c${B}t${T}p${k + 1}.txt`), lines.join('\n\n') + '\n');
  console.log(`P${k + 1} ${p.title}  (${p.body.length} paragraphs)`);
});
console.log(`key: ${Object.keys(key).length} answers`);
