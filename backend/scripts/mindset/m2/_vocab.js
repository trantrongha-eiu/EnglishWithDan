// vocabFrom(list, texts) — the class book's "Từ vựng & cụm từ hay" page
// ("word: meaning" per line) → [[word, meaning, example]], the example being
// the shortest sentence of the unit's own reading texts / audioscripts that
// contains the word (sb/sth/one's are wildcards, inflections allowed).
'use strict';

const WILD = new Set(['sb', 'sth', "one's", "sb's", 'someone', 'something', 'n', 'oneself']);

// A long sentence cut down to ~24 words around the match ("… x y z …").
function trim(s, re) {
  const m = re.exec(s);
  const words = s.split(/\s+/);
  const at = s.slice(0, m.index).split(/\s+/).length - 1;
  const a = Math.max(0, at - 9);
  const b = Math.min(words.length, at + 15);
  return (a > 0 ? '… ' : '') + words.slice(a, b).join(' ') + (b < words.length ? ' …' : '');
}

function sentences(texts) {
  return texts.join('\n').replace(/\*\*|##/g, '')
    .split(/\r?\n+/).map((l) => l.replace(/^\d{1,2}\s+(?=[A-Z])/, '').replace(/^[A-Z][A-Za-z .]{0,20}:\s+/, '')) // drop "1 " item numbers and "Speaker:" labels
    .join(' ').split(/(?<=[.!?])\s+(?=[A-Z‘'"(])/)
    .map((s) => s.trim()).filter((s) => s.length > 12);
}

function pattern(word) {
  const toks = word.toLowerCase().replace(/[()]/g, '').split(/\s+/).filter(Boolean);
  const GAP = "(?:[\\w'’,-]+\\s+){0,3}?"; // up to 3 extra words between tokens
  const parts = toks.map((t, i) => {
    if (WILD.has(t)) return "(?:[\\w'’-]+\\s+){0,5}?";
    if (t === 'be') return "(?:(?:be|am|is|are|was|were|been|being|'re|'s|'m)\\s+)?";
    const base = t.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
    const stem = base.length > 3 ? base.replace(/(e|y)$/, '') : base;
    return (i ? GAP : '') + stem + "[\\w'’-]*\\s+";
  });
  return new RegExp('\\b' + parts.join('').replace(/\\s\+$/, ''), 'i');
}

function vocabFrom(list, texts) {
  const ss = sentences(texts);
  return list.trim().split('\n').map((line) => {
    const i = line.indexOf(': ');
    if (i < 0) throw new Error('vocab line without ": " → ' + line);
    const word = line.slice(0, i).trim();
    const [meaning, own] = line.slice(i + 2).split(' | ').map((x) => x.trim()); // "word: meaning | own example"
    const re = pattern(word.split(/\s*\/\s*/)[0]);
    const all = ss.filter((s) => re.test(s)).sort((a, b) => a.length - b.length);
    const short = all.find((s) => s.split(/\s+/).length <= 30);
    const hit = short || (all[0] ? trim(all[0], re) : '');
    return [word, meaning, own || hit];
  });
}

// vocabFile('u05-reading', texts) — same, list read from m2/vocab/<name>.txt
function vocabFile(name, texts) {
  return vocabFrom(require('fs').readFileSync(require('path').join(__dirname, 'vocab', name + '.txt'), 'utf8'), texts);
}

module.exports = { vocabFrom, vocabFile };
