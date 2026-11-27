'use strict';
// Cambridge IELTS Reading from ieltstrainingonline.com pages → spec-ready text (2026-11-27; thầy: "bài nào thiếu hay lỗi
// thì dùng trang ieltstrainingonline.com"). Same outputs as cam_extract.js (the ieltsworldly version):
//   node ito_extract.js <book> <test>      reads web/cam/ito/r<B>t<T>.html (+ r<B>t<T>_ans.html when present)
//   → web/cam/x/c<B>t<T>.dump.txt   passages + question blocks + answer key (+ the site's English explanations)
//   → web/cam/x/c<B>t<T>p<P>.txt    passage text in the vr_build format ("# standfirst", "A " paragraph letters)
//   → web/cam/x/c<B>t<T>.key.json   { "1": "FALSE", … } from the page's "Answer Cam N Reading Test 0T" list
// Page URLs: practice-cam-<B>-reading-test-0<T>-with-answer/, answers-and-explanations-for-cambridge-ielts-<B>-reading-test-<T>/
const fs = require('fs'), path = require('path');
const [B, T] = process.argv.slice(2);
const W = (...p) => path.join(__dirname, 'web', 'cam', ...p);
fs.mkdirSync(W('x'), { recursive: true });
const clean = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<ins[\s\S]*?<\/ins>|<noscript[\s\S]*?<\/noscript>/g, '');
const ent = s => s.replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘').replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—').replace(/&#8230;|&hellip;/g, '…').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#038;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8242;/g, '′').replace(/&#215;/g, '×').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n))
  .replace(/‟/g, '’');
const txt = s => ent(s.replace(/<br\s*\/?>/g, '\n').replace(/<input[^>]*>/g, ' ___ ').replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim();

let h = clean(fs.readFileSync(W('ito', `r${B}t${T}.html`), 'utf8'));
h = h.slice(h.indexOf('<h1'));
h = h.slice(0, h.search(/Advertisements[\s\S]{0,400}SearchSearch|class="et_pb_sidebar|id="sidebar/) > 0 ? h.search(/Advertisements[\s\S]{0,400}SearchSearch|class="et_pb_sidebar|id="sidebar/) : h.length);

const blocks = [];
const re = /<(h[1-6]|p|table|ol|ul|figure|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/g;
let m;
while ((m = re.exec(h))) {
  const tag = m[1], inner = m[2];
  if (tag === 'figure' && !/<table/.test(inner)) { const img = inner.match(/<img[^>]+src="([^"]+)"/); if (img) blocks.push({ t: 'img', s: img[1] }); continue; }
  if (tag === 'table' || (tag === 'figure' && /<table/.test(inner))) {
    const rows = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => txt(c[1]).replace(/\n+/g, ' / ')));
    blocks.push({ t: 'table', rows }); continue;
  }
  if (tag === 'ol' || tag === 'ul') {
    const st = (m[0].match(/start="(\d+)"/) || [])[1];
    blocks.push({ t: tag, start: st ? +st : null, items: [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(li => txt(li[1])) }); continue;
  }
  const img = inner.match(/<img[^>]+src="([^"]+)"/);
  if (img) blocks.push({ t: 'img', s: img[1] });
  const s = txt(inner);
  if (!s || /^(ADVERTISEMENT|Advertisements)$/i.test(s)) continue;
  blocks.push({ t: /^h/.test(tag) ? 'h' : 'p', s, em: /^<em>/.test(inner.trim()) && !/<\/em>\s*\S/.test(inner.trim().replace(/<\/em>\s*$/, '')) });
}

// answer key: "Answer Cam N Reading Test 0T" then "n. X" paragraphs/list items
const key = {};
const ai = blocks.findIndex(b => /^Answers?\b.*Reading Test/i.test(b.s || ''));
if (ai >= 0) for (const b of blocks.slice(ai)) {
  const lines = b.t === 'ol' ? b.items.map((s, i) => `${(b.start || 1) + i}. ${s}`) : String(b.s || '').split('\n');
  for (const l of lines) {
    // "23&24   B, D" / "23-24 B, D" (pairs: one letter per question; vr_build's multi keys are interchangeable)
    const pr = l.match(/^(\d{1,2})\s*(?:&|and|–|-)\s*(\d{1,2})\s*[.):]?\s+(.+)$/);
    if (pr) { const v = pr[3].split(/\s*(?:,|and|&)\s*/).map(x => x.trim()).filter(Boolean); for (let q = +pr[1]; q <= +pr[2]; q++) key[q] ||= v[q - pr[1]] || pr[3]; continue; }
    const k = l.match(/^(\d{1,2})\s*(?:[.):]\s*|\s+)(.+)$/); if (k && +k[1] <= 40 && !key[k[1]]) key[k[1]] = k[2].trim();
  }
}
const body = ai >= 0 ? blocks.slice(0, ai) : blocks;

const out = [];
for (const b of body) {
  if (b.t === 'h') out.push(`\n## ${b.s}`);
  else if (b.t === 'p') out.push((b.em ? '_' : '') + b.s);
  else if (b.t === 'img') out.push(`[IMG ${b.s}]`);
  else if (b.t === 'table') out.push('[TABLE]\n' + b.rows.map(r => '| ' + r.join(' | ')).join('\n'));
  else out.push(b.items.map((s, i) => `${b.t === 'ol' ? (b.start || 1) + i + '.' : '•'} ${s}`).join('\n'));
}
let dump = out.join('\n') + '\n\n[KEY] ' + Object.entries(key).map(([k, v]) => `${k}=${v}`).join('  ') + '\n';
// the site's answer-explanation page (English) — handy for the Vietnamese explanations
const ansF = W('ito', `r${B}t${T}_ans.html`);
if (fs.existsSync(ansF)) {
  let a = clean(fs.readFileSync(ansF, 'utf8')); a = a.slice(a.indexOf('<h1'));
  const t = txt(a.replace(/<\/(p|h\d|li|tr)>/g, '\n')).replace(/\n{2,}/g, '\n');
  dump += '\n[EXPLANATIONS]\n' + t.slice(0, t.search(/Advertisements\s*\n?\s*SearchSearch/) > 0 ? t.search(/Advertisements\s*\n?\s*SearchSearch/) : t.length);
}
fs.writeFileSync(W('x', `c${B}t${T}.key.json`), JSON.stringify(key, null, 0));
fs.writeFileSync(W('x', `c${B}t${T}.dump.txt`), dump);

// passages: "READING PASSAGE n" → intro "You should spend…" → title heading → text until the first "Questions" line
const isQ = s => /^(Passage \d+ )?Questions? \d+/i.test(s);
const rp = body.map((b, i) => (b.t === 'h' || b.t === 'p') && /^READING PASSAGE \d$/i.test(b.s) ? i : -1).filter(i => i >= 0);
rp.slice(0, 3).forEach((i0, k) => {
  let i = i0 + 1;
  while (i < body.length && (body[i].t !== 'h' || /You should spend|READING PASSAGE/i.test(body[i].s))) {
    if (body[i].t === 'p' && !/You should spend/i.test(body[i].s) && body[i].s.length > 150) break; // untitled passage
    i++;
  }
  const title = body[i] && body[i].t === 'h' ? body[i].s : '?';
  const lines = [];
  let letter = null;
  for (let j = body[i] && body[i].t === 'h' ? i + 1 : i; j < body.length; j++) {
    const b = body[j];
    if ((b.t === 'h' || b.t === 'p') && (isQ(b.s) || /^READING PASSAGE/i.test(b.s))) break;
    if (b.t === 'img') { lines.push(`[IMG ${b.s}]`); continue; }
    if (b.t === 'ol' || b.t === 'ul') { lines.push(b.items.join('\n')); continue; }
    if (b.t === 'table') { lines.push('[TABLE] ' + b.rows.map(r => r.join(' | ')).join(' // ')); continue; }
    if (/^[A-J]$/.test(b.s)) { letter = b.s; continue; }
    if (b.t === 'h' && b.s.length < 60) { lines.push(`## ${b.s}`); continue; }
    for (const [n, para] of b.s.split(/\n+/).map(x => x.trim()).filter(Boolean).entries()) {
      let s = para;
      const lm = s.match(/^\(?([A-J])\)?[.:]?\s+(?=[A-Z‘“'"(])/);
      if (letter && n === 0) { s = `${letter} ${s}`; letter = null; }
      else if (lm) s = `${lm[1]} ${s.slice(lm[0].length)}`;
      else if (!lines.length && b.em && s.length < 500) s = `# ${s}`;
      lines.push(s);
    }
  }
  fs.writeFileSync(W('x', `c${B}t${T}p${k + 1}.txt`), lines.join('\n\n') + '\n');
  console.log(`P${k + 1} ${title}  (${lines.length} paragraphs)`);
});
console.log(`key: ${Object.keys(key).length} answers`);
