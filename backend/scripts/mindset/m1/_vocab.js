// vocabFrom(list, texts) — the class book's "Từ vựng & cụm từ hay" page
// ("word: meaning" per line) → [[word, meaning, example]], the example being
// the shortest sentence of the unit's own reading texts / audioscripts that
// contains the word (sb/sth/one's are wildcards, inflections allowed).
'use strict';

const WILD = new Set(['sb', 'sth', "one's", "sb's", 'someone', 'something', 'n']);

function sentences(texts) {
  return texts.join('\n').replace(/\*\*|##/g, '')
    .split(/\n+/).map((l) => l.replace(/^[A-Z][A-Za-z .]{0,20}:\s+/, '')) // drop "Speaker:" labels
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
    const hit = ss.filter((s) => re.test(s) && s.split(/\s+/).length <= 30).sort((a, b) => a.length - b.length)[0] || '';
    return [word, meaning, own || hit];
  });
}

// vocabFile('u05-reading', texts) — same, list read from m1/vocab/<name>.txt
function vocabFile(name, texts) {
  return vocabFrom(require('fs').readFileSync(require('path').join(__dirname, 'vocab', name + '.txt'), 'utf8'), texts);
}

module.exports = { vocabFrom, vocabFile };
