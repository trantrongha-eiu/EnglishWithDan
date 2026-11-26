// "Bộ từ của lớp" helpers for the assignment editor (VocabListsField).
// Backend rules: assignment.controller buildVocabList (3–100 words, every
// word needs a meaning, duplicates dropped case-insensitively).

export const LIST_MIN_WORDS = 3;
export const LIST_MAX_WORDS = 100;

export const wordKey = (w) => String(w || '').toLowerCase().trim().replace(/\s+/g, ' ');

// One line per word: "word: nghĩa" · "word - nghĩa" · "word<TAB>nghĩa" ·
// "word | nghĩa | ví dụ" · "word" (meaning looked up later).
export function parseWordLines(raw) {
  const out = [];
  for (const line of String(raw || '').split('\n').map((l) => l.trim()).filter(Boolean)) {
    let word = line, meaning = '', example = '';
    if (line.includes('|')) {
      [word, meaning = '', example = ''] = line.split('|').map((x) => x.trim());
    } else {
      const tab = line.indexOf('\t');
      const colon = line.indexOf(':');
      const dash = line.indexOf(' - ');
      if (tab > 0) { word = line.slice(0, tab); meaning = line.slice(tab + 1); }
      else if (colon > 0) { word = line.slice(0, colon); meaning = line.slice(colon + 1); }
      else if (dash > 0) { word = line.slice(0, dash); meaning = line.slice(dash + 3); }
    }
    word = word.replace(/^[-•*\d.)\s]+/, '').trim(); // "1. word", "- word"
    if (word) out.push({ word, meaning: meaning.trim(), example: example.trim(), phonetic: '' });
  }
  return out;
}

// Adds `incoming` to `words`, skipping words already there. Returns the new
// array and how many were skipped as duplicates.
export function mergeWords(words, incoming) {
  const seen = new Set(words.map((w) => wordKey(w.word)));
  const next = [...words];
  let dup = 0;
  for (const w of incoming) {
    const k = wordKey(w.word);
    if (!k) continue;
    if (seen.has(k)) { dup += 1; continue; }
    seen.add(k);
    next.push({ word: w.word.trim(), meaning: w.meaning || '', example: w.example || '', phonetic: w.phonetic || '' });
  }
  return { words: next, dup };
}

function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const killer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(killer));
}

// Vietnamese meaning (Google translate) + phonetic / example sentence
// (dictionaryapi.dev) for one word — same free sources as the student
// notebook's "Thêm từ". Every source may fail; missing fields come back ''.
export async function lookupMeaning(word) {
  const enc = encodeURIComponent(word);
  const [gt, dict] = await Promise.allSettled([
    fetchWithTimeout(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${enc}`).then((r) => r.json()),
    fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc}`).then((r) => (r.ok ? r.json() : null)),
  ]);
  let meaning = gt.status === 'fulfilled' ? String(gt.value?.[0]?.[0]?.[0] || '').trim() : '';
  if (meaning.toLowerCase() === word.toLowerCase()) meaning = '';
  let phonetic = '', example = '';
  const entry = dict.status === 'fulfilled' && Array.isArray(dict.value) ? dict.value[0] : null;
  if (entry) {
    phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || '';
    for (const m of entry.meanings || []) {
      const d = (m.definitions || []).find((x) => x.example);
      if (d) { example = d.example; break; }
    }
  }
  return { meaning, phonetic, example };
}

// Fills blank meanings (and blank example/phonetic) of `words`, 4 lookups
// at a time; onProgress(done, total) after each. Returns the filled array.
export async function fillMissingMeanings(words, onProgress) {
  const out = words.map((w) => ({ ...w }));
  const todo = out.map((w, i) => i).filter((i) => !out[i].meaning?.trim());
  let done = 0;
  const worker = async () => {
    while (todo.length) {
      const i = todo.shift();
      try {
        const r = await lookupMeaning(out[i].word);
        out[i] = { ...out[i], meaning: out[i].meaning || r.meaning, example: out[i].example || r.example, phonetic: out[i].phonetic || r.phonetic };
      } catch { /* leave blank — the teacher types it */ }
      done += 1;
      if (onProgress) onProgress(done, done + todo.length);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  return out;
}
