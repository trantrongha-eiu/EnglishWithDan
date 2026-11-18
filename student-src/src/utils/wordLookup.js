// Word lookup for "Add word" and "Nhập hàng loạt" — port of dashboard.js
// lookupNewWord / _fetchWordInfo / _fetchAiExamples. Sources:
//   dictionaryapi.dev  → phonetic, part of speech, example sentences
//   Google translate   → first Vietnamese meaning
//   MyMemory           → more meanings + sentence fallback
//   /dictionary/…      → our cached AI example (best example when present)
// Every source may fail; callers just get fewer suggestions.
import { apiFetch } from './api';

function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const killer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(killer));
}

const escR = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// MyMemory "segments" are often glossary rows, not sentences.
function looksLikeSentence(seg) {
  if (/[\t\r\n]/.test(seg)) return false;
  const words = seg.split(/\s+/);
  if (words.length < 3) return false;
  return !/^\d+$/.test(words[words.length - 1]);
}

function memSentences(matches, word, limit) {
  const out = [];
  const wordRe = new RegExp(`\\b${escR(word)}\\b`, 'i');
  for (const m of matches) {
    if (out.length >= limit) break;
    const seg = (m.segment || '').trim();
    if (!seg || seg.toLowerCase() === word.toLowerCase()) continue;
    if (!looksLikeSentence(seg) || !wordRe.test(seg)) continue;
    if (!out.includes(seg)) out.push(seg);
  }
  return out;
}

const VI_RE = /[àáảãạăắặẳẵằâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

// Full lookup for one word → { phonetic, partOfSpeech, examples[], meanings[] }
export async function lookupWord(word) {
  const enc = encodeURIComponent;
  const [dictRes, gtRes, memRes, aiRes] = await Promise.allSettled([
    fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${enc(word)}`).then(r => (r.ok ? r.json() : null)),
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${enc(word)}`).then(r => r.json()),
    fetch(`https://api.mymemory.translated.net/get?q=${enc(word)}&langpair=en|vi`).then(r => (r.ok ? r.json() : null)),
    apiFetch(`/dictionary/${enc(word)}/example`),
  ]);
  const memMatches = (memRes.status === 'fulfilled' && memRes.value?.matches) || [];

  let phonetic = '', partOfSpeech = '';
  const examples = [];
  const dict = dictRes.status === 'fulfilled' && Array.isArray(dictRes.value) ? dictRes.value : null;
  if (dict) {
    phonetic = dict[0]?.phonetics?.find(p => p.text)?.text || dict[0]?.phonetic || '';
    partOfSpeech = dict[0]?.meanings?.[0]?.partOfSpeech || '';
    for (const entry of dict) {
      for (const m of entry.meanings || []) {
        for (const d of m.definitions || []) if (d.example && !examples.includes(d.example)) examples.push(d.example);
      }
      if (examples.length >= 5) break;
    }
  }
  if (examples.length < 3) {
    for (const s of memSentences(memMatches, word, 3 - examples.length)) if (!examples.includes(s)) examples.push(s);
  }
  const ai = (aiRes.status === 'fulfilled' && aiRes.value?.example || '').trim();
  if (ai) {
    const i = examples.indexOf(ai);
    if (i > -1) examples.splice(i, 1);
    examples.unshift(ai);
  }

  const meanings = [];
  const seen = new Set();
  const gt = gtRes.status === 'fulfilled' ? (gtRes.value?.[0]?.[0]?.[0] || '').trim() : '';
  if (gt && gt.toLowerCase() !== word.toLowerCase()) { meanings.push(gt); seen.add(gt.toLowerCase()); }
  const normWord = word.trim().toLowerCase().replace(/[.,!?;:'"]+$/, '');
  const exact = memMatches
    .filter(m => typeof m.translation === 'string' && m.segment
      && m.segment.trim().toLowerCase().replace(/[.,!?;:'"]+$/, '') === normWord)
    .sort((a, b) => (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0));
  for (const m of exact) {
    if (meanings.length >= 4) break;
    const val = m.translation.trim().replace(/[,.;:]+$/, '').trim();
    if (!val || val.toLowerCase() === word.toLowerCase()) continue;
    if (/^[a-z0-9\s\-,.']+$/i.test(val) && !VI_RE.test(val)) continue; // untranslated English
    if (!seen.has(val.toLowerCase())) { seen.add(val.toLowerCase()); meanings.push(val); }
  }

  return { phonetic, partOfSpeech, examples: examples.slice(0, 5), meanings };
}

// Light lookup for bulk import (no meanings): phonetic, part of speech, one example
export async function fetchWordInfo(word) {
  const [dictRes, memRes] = await Promise.allSettled([
    fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`).then(r => (r.ok ? r.json() : null)),
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi`).then(r => (r.ok ? r.json() : null)),
  ]);
  let phonetic = '', partOfSpeech = '', example = '';
  const entry = dictRes.status === 'fulfilled' && Array.isArray(dictRes.value) ? dictRes.value[0] : null;
  if (entry) {
    phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
    partOfSpeech = entry.meanings?.[0]?.partOfSpeech || '';
    for (const m of entry.meanings || []) {
      const d = m.definitions?.find(x => x.example);
      if (d) { example = d.example; break; }
    }
  }
  if (!example) {
    const matches = (memRes.status === 'fulfilled' && memRes.value?.matches) || [];
    example = memSentences(matches, word, 1)[0] || '';
  }
  return { phonetic, partOfSpeech, example };
}

// Cached AI examples for many words at once → { lowercased word: sentence }. Never throws.
export async function fetchAiExamples(words) {
  if (!words?.length) return {};
  try {
    const data = await apiFetch('/dictionary/examples', { method: 'POST', body: JSON.stringify({ words }) });
    return data?.examples || {};
  } catch {
    return {};
  }
}
