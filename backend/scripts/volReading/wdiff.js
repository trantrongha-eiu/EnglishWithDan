'use strict';
// READ-ONLY word diff between two passage texts (to clean OCR against another copy, e.g. a mini-ielts scrape):
//   node wdiff.js <fileA> <fileB|mini:<id>|bank:<idSuffix>> [ctx=4]
// Prints each differing span as  …context [A: ocr words] {B: other words} context…  Case/punctuation-insensitive match.
const fs = require('fs'), path = require('path');
const [fa, fb, ctxArg] = process.argv.slice(2);
const ctx = +(ctxArg || 4);
const load = f => {
  if (f.startsWith('mini:')) return require(path.join(__dirname, '..', 'miniIelts', 'web', 'mini', `x_${f.slice(5)}.json`)).paras.join('\n');
  if (f.startsWith('bank:')) return require('./web/passages.json').find(p => String(p._id).endsWith(f.slice(5))).content.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  return fs.readFileSync(f, 'utf8');
};
const tok = s => s.replace(/[‘’`]/g, "'").replace(/[“”]/g, '"').split(/\s+/).filter(Boolean);
const key = w => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const A = tok(load(fa)), B = tok(load(fb));
const a = A.map(key), b = B.map(key);
// LCS (O(n*m) — passages are ~1k words)
const n = a.length, m = b.length;
const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
const ops = []; let i = 0, j = 0;
while (i < n || j < m) {
  if (i < n && j < m && a[i] === b[j]) { ops.push(['=', A[i], B[j]]); i++; j++; }
  else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) { ops.push(['+', null, B[j]]); j++; }
  else { ops.push(['-', A[i], null]); i++; }
}
let k = 0, count = 0;
while (k < ops.length) {
  if (ops[k][0] === '=') { k++; continue; }
  let e = k; while (e < ops.length && ops[e][0] !== '=') e++;
  const before = ops.slice(Math.max(0, k - ctx), k).map(o => o[1]).join(' ');
  const after = ops.slice(e, e + ctx).map(o => o[1]).join(' ');
  const da = ops.slice(k, e).filter(o => o[1]).map(o => o[1]).join(' ');
  const db = ops.slice(k, e).filter(o => o[2]).map(o => o[2]).join(' ');
  console.log(`…${before} [${da}] {${db}} ${after}…`); count++;
  k = e;
}
console.log(`${count} differing spans; A ${A.length} words, B ${B.length} words`);
