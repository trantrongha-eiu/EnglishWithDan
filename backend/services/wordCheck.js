'use strict';

// Is this an English word? Asked of an online dictionary (Wiktionary, else
// api.dictionaryapi.dev). Used by scripts/seedChainWords.js (bulk check of
// the words Lulu 🤖 may play) and by Nối chữ when a player types a word our
// local lists don't have (favourite, website, podcast…).

// Never in a kids-friendly game, even when a dictionary has them
const BLOCK = new Set(('sex sexy sexual nude naked porn gay rape drug drugs kill killer suicide nazi '
  + 'whore slut bitch bastard damn hell crap piss dick cock pussy fuck shit ass arse boob boobs '
  + 'penis vagina nigger nigga fag faggot retard tit tits fucking fucker shitty asshole dickhead '
  + 'wanker twat cunt bollocks horny').split(' '));

const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const WIKT = 'https://en.wiktionary.org/api/rest_v1/page/definition/';
const UA = { 'User-Agent': 'vocab-word-game-check/1.0 (educational English word game)' };

const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
// Senses that don't make a word fair game on their own
const WEAK = /^(misspelling|obsolete|archaic|nonstandard|eye dialect|pronunciation spelling|abbreviation|initialism|acronym)\b/i;

// → { ok: true, pos, def, src } | { ok: false } | null (failed / rate-limited)
async function lookupWiktionary(w, timeoutMs = 15000) {
  let res;
  try { res = await fetch(WIKT + encodeURIComponent(w), { headers: UA, signal: AbortSignal.timeout(timeoutMs) }); } catch { return null; }
  if (res.status === 404) return { ok: false };
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const en = Array.isArray(data?.en) ? data.en : [];
  for (const sec of en) {
    for (const d of sec.definitions || []) {
      const def = stripHtml(d.definition);
      if (def && !WEAK.test(def)) return { ok: true, pos: String(sec.partOfSpeech || '').toLowerCase(), def: def.slice(0, 200), src: 'wiktionary' };
    }
  }
  return { ok: false };
}

// dictionaryapi.dev (also Wiktionary data; ~450 requests / 5 min)
async function lookupFreeDict(w, timeoutMs = 15000) {
  let res;
  try { res = await fetch(API + encodeURIComponent(w), { signal: AbortSignal.timeout(timeoutMs) }); } catch { return null; }
  if (res.status === 404) return { ok: false };
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !data.length) return { ok: false };
  // The entry must be for this exact word
  const entry = data.find((e) => String(e.word || '').toLowerCase() === w);
  if (!entry) return { ok: false };
  const m = (entry.meanings || []).find((x) => (x.definitions || []).length) || {};
  const def = String(m.definitions?.[0]?.definition || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  if (!def) return { ok: false };
  return { ok: true, pos: m.partOfSpeech || '', def, src: 'dictionaryapi.dev' };
}

// Up to 50 words → { word: [English category titles] } (missing page → []),
// null = rate-limited / failed
async function wiktionaryBatch(words) {
  const url = 'https://en.wiktionary.org/w/api.php?action=query&format=json&formatversion=2&prop=categories&cllimit=max'
    + '&clcategories=' + encodeURIComponent('Category:English lemmas|Category:English non-lemma forms')
    + '&titles=' + encodeURIComponent(words.join('|'));
  let res;
  try { res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) }); } catch { return null; }
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.query?.pages || data.continue) return null;
  const out = {};
  for (const p of data.query.pages) out[p.title] = p.missing ? [] : (p.categories || []).map((c) => c.title);
  return out;
}

// Wiktionary first, the Free Dictionary API when it doesn't answer
async function lookup(w, timeoutMs = 15000) {
  const r = await lookupWiktionary(w, timeoutMs);
  if (r) return r;
  return lookupFreeDict(w, timeoutMs);
}

module.exports = { BLOCK, lookup, lookupWiktionary, lookupFreeDict, wiktionaryBatch };
