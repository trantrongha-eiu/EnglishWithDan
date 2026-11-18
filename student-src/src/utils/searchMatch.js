// GENERATED from backend/utils/searchMatch.js — do not edit here.
// Re-sync: node scripts/sync-search-match.js (backend test searchMatch.test.js fails when stale).
const SearchMatch = (function (module) {
/*
 * SearchMatch — the one search matcher used by every search box on the site
 * (site-wide 🔍, each page's "Tìm…" box, admin lists) and by the server.
 *
 * Why: plain `title.toLowerCase().includes(query)` / a Mongo `$regex` of the
 * whole query missed what students actually type:
 *   "cam 18 test 4"   vs "Cam 18 - Test 4"        (punctuation in between)
 *   "cam18t4"         vs "Cam 18 - Test 4"        (no spaces)
 *   "cambridge 18"    vs "Cam 18 …"               (long form)
 *   "nguyen van an"   vs "Nguyễn Văn An"           (no Vietnamese accents)
 *   "test 4 cam 18"   vs "Cam 18 - Test 4"        (other word order)
 * Every typed word must match somewhere (any order); numbers match whole
 * numbers ("vol 1" ≠ "Vol 10"); 1–2 letter words match a word start
 * ("t" → "test"); longer words match anywhere ("fest" → "festival").
 * Results are ranked: exact > starts with > whole phrase > all words.
 *
 * SOURCE OF TRUTH: backend/utils/searchMatch.js — after editing run
 * `node scripts/sync-search-match.js`. frontend/js/shared/
 * search-match.js is a byte-identical copy (a backend test checks), and
 * admin-src/src/utils/searchMatch.js wraps the same text as an ES module.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SearchMatch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Query word → other spellings that count as the same word.
  var ALIASES = {
    cam: ['cambridge'], cambridge: ['cam'], camb: ['cam'],
    vol: ['volume'], volume: ['vol'],
    part: ['section'], section: ['part'], sec: ['part', 'section'],
    mocktest: ['mock'], mock: ['mocktest'],
    test: ['tests'], tests: ['test'],
  };
  // Filler words: ignored when they don't match ("đề cam 18" still finds "Cam 18").
  var OPTIONAL = { de: 1, bai: 1, tim: 1, cua: 1, va: 1, the: 1, a: 1, an: 1, of: 1, and: 1, to: 1, in: 1 };

  // Combining accent marks (U+0300–U+036F), as real characters so the same
  // range works in a JS RegExp and in MongoDB's PCRE $regex.
  var MARKS = String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f);
  var MARKS_RE = new RegExp('[' + MARKS + ']', 'g');

  function fold(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(MARKS_RE, '')
      .replace(/[đĐ]/g, 'd')
      .toLowerCase();
  }

  // "Cam 18 – Test 4" → "cam 18 test 4"; "cam18t4" → "cam 18 t 4"
  function norm(s) {
    return fold(s)
      .replace(/([a-z])(?=\d)/g, '$1 ')
      .replace(/(\d)(?=[a-z])/g, '$1 ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function prepare(text) {
    var fields = (Array.isArray(text) ? text : [text])
      .map(norm).filter(function (f) { return f; });
    var hay = fields.join(' ');
    return { fields: fields, hay: hay, words: hay ? hay.split(' ') : [], compact: hay.replace(/ /g, '') };
  }

  function tokenHit(tok, p) {
    if (/^\d+$/.test(tok)) {
      // whole numbers only, but "08" matches "8"
      var n = String(parseInt(tok, 10));
      return p.words.some(function (w) { return w === tok || (/^\d+$/.test(w) && String(parseInt(w, 10)) === n); });
    }
    if (tok.length <= 2) return p.words.some(function (w) { return w.indexOf(tok) === 0; });
    return p.compact.indexOf(tok) !== -1;
  }

  function startsAtWord(tok, p) {
    return p.words.some(function (w) { return w.indexOf(tok) === 0; });
  }

  function sameNumber(a, b) {
    return /^\d+$/.test(a) && /^\d+$/.test(b) && parseInt(a, 10) === parseInt(b, 10);
  }
  function wordHit(tok, w) {
    if (/^\d+$/.test(tok)) return sameNumber(tok, w);
    return tok.length <= 2 ? w.indexOf(tok) === 0 : w.indexOf(tok) !== -1;
  }
  // "vol 1" / "test 4": a number typed right after a word must follow that
  // word in the text too, so "vol 1" skips "Vol 10 - Test 1". Only applies
  // when the word itself is found as a single word.
  function numberFollowsWord(num, prevAlts, p) {
    var seen = false;
    for (var j = 0; j < p.words.length; j++) {
      var hit = prevAlts.some(function (a) { return wordHit(a, p.words[j]); });
      if (!hit) continue;
      seen = true;
      if (j + 1 < p.words.length && sameNumber(num, p.words[j + 1])) return true;
    }
    return !seen;
  }

  /**
   * Relevance of `text` (a string or an array of fields) for `query`.
   * -1 = no match; 0 = empty query (everything matches); higher = better.
   */
  function score(text, query) {
    var q = norm(query);
    if (!q) return 0;
    var p = text && text.__sm ? text : prepare(text);
    if (!p.hay) return -1;
    var tokens = q.split(' ');
    var hits = 0;
    var atStart = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var alts = [tok].concat(ALIASES[tok] || []);
      // "helped" / "helping" / "lessons" → "help" / "lesson" as a last resort
      var stem = tok.length >= 5 ? tok.replace(/(ing|ed|es|s)$/, '') : tok;
      if (stem !== tok && stem.length >= 3) alts.push(stem);
      var hit = null;
      for (var j = 0; j < alts.length && !hit; j++) if (tokenHit(alts[j], p)) hit = alts[j];
      var prev = i > 0 ? tokens[i - 1] : '';
      if (hit && /^\d+$/.test(tok) && /^[a-z]+$/.test(prev) && !OPTIONAL[prev] &&
          !numberFollowsWord(tok, [prev].concat(ALIASES[prev] || []), p)) hit = null;
      if (hit) {
        hits++;
        if (startsAtWord(hit, p)) atStart++;
      } else if (!OPTIONAL[tok]) {
        return -1;
      }
    }
    if (!hits) return -1;
    var bonus = 0;
    var spaced = ' ' + q + ' ';
    // per field, and the fields joined ("Nguyễn Văn" + "An" = "nguyen van an")
    p.fields.concat(p.fields.length > 1 ? [p.hay] : []).forEach(function (f) {
      var b = 0;
      if (f === q) b = 100;
      else if ((f + ' ').indexOf(q + ' ') === 0) b = 70;            // starts with the whole words
      else if ((' ' + f + ' ').indexOf(spaced) !== -1) b = 50;      // has the whole words
      else if (f.indexOf(q) === 0) b = 40;                          // starts with (part of a word)
      else if (f.indexOf(q) !== -1) b = 25;
      if (b > bonus) bonus = b;
    });
    return 10 + bonus + hits * 2 + atStart * 3;
  }

  function matches(text, query) {
    return score(text, query) >= 0;
  }

  /**
   * Items whose getText(item) matches `query`, best first (stable: equal
   * scores keep the list's own order). Empty query → the list unchanged.
   */
  function filter(items, query, getText) {
    var list = items || [];
    if (!norm(query)) return list.slice();
    var get = getText || function (x) { return x; };
    return list
      .map(function (item, i) { return { item: item, i: i, s: score(get(item), query) }; })
      .filter(function (r) { return r.s >= 0; })
      .sort(function (a, b) { return (b.s - a.s) || (a.i - b.i); })
      .map(function (r) { return r.item; });
  }

  // ── Server side: the same idea as a MongoDB regex ─────────────────────
  var VARIANTS = {
    a: 'aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ',
    d: 'dđDĐ',
    e: 'eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ',
    i: 'iìíịỉĩIÌÍỊỈĨ',
    o: 'oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ',
    u: 'uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ',
    y: 'yỳýỵỷỹYỲÝỴỶỸ',
  };

  // Query words for a server-side search (accents dropped, max 8).
  function queryWords(query) {
    return fold(String(query == null ? '' : query).slice(0, 100))
      .replace(/[^a-z0-9@._-]+/g, ' ').trim().split(' ')
      .filter(function (w) { return w; }).slice(0, 8);
  }

  // One query word → regex source matching it with or without accents
  // ("nguyen" matches "Nguyễn", also when stored decomposed).
  function wordRegexSource(word) {
    var w = fold(word);
    // a number matches whole numbers only: "1" ≠ "10" / "21"
    if (/^\d+$/.test(w)) return '(?<![0-9])' + w + '(?![0-9])';
    return w.split('').map(function (ch) {
      if (VARIANTS[ch]) return '[' + VARIANTS[ch] + '][' + MARKS + ']*';
      return ch.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');
    }).join('');
  }

  /**
   * Mongo filter: every query word must hit at least one of `fields`
   * (so "Nguyễn Văn An" finds firstName "Nguyễn Văn" + lastName "An").
   * Returns null for an empty query.
   */
  function mongoFilter(query, fields) {
    var words = queryWords(query);
    if (!words.length) return null;
    return {
      $and: words.map(function (w) {
        var src = wordRegexSource(w);
        return { $or: fields.map(function (f) { var o = {}; o[f] = { $regex: src, $options: 'i' }; return o; }) };
      }),
    };
  }

  return {
    fold: fold, norm: norm, prepare: function (t) { var p = prepare(t); p.__sm = true; return p; },
    score: score, matches: matches, filter: filter,
    queryWords: queryWords, wordRegexSource: wordRegexSource, mongoFilter: mongoFilter,
  };
});
return module.exports;
})({ exports: {} });

export default SearchMatch;
export const { fold, norm, score, matches, filter } = SearchMatch;
