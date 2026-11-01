// shared/answer-match.js — lenient comparison of a typed English answer with
// a list of accepted answers (grammar drills on essential-grammar.html).
//
// Treated as equal: case, punctuation, curly vs straight apostrophes,
// contractions vs long forms (doesn't = does not, I'm = I am, she's = she is
// / she has), number words vs digits (ten = 10), "a.m." vs "am",
// "any more" vs "anymore".
//
//   AnswerMatch.isMatch(userText, acceptedList) → true/false
//   AnswerMatch.diff(userText, answerText)      → { user:[{w,ok}], answer:[{w,ok}] }
//       word-by-word comparison for showing what was missing / extra.
(function () {
  'use strict';

  var NUMBER_WORDS = {
    zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
    eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13',
    fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18',
    nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50', hundred: '100'
  };

  // Unambiguous contractions. "'s" and "'d" are handled separately because
  // they can mean two things (is/has, had/would) — and "'s" is also possessive.
  var CONTRACTIONS = [
    [/\bwon't\b/g, 'will not'],
    [/\bcan't\b/g, 'can not'],
    [/\bcannot\b/g, 'can not'],
    [/\bshan't\b/g, 'shall not'],
    [/n't\b/g, ' not'],
    [/'m\b/g, ' am'],
    [/'re\b/g, ' are'],
    [/'ll\b/g, ' will'],
    [/'ve\b/g, ' have']
  ];
  var S_SUBJECTS = /\b(he|she|it|that|there|what|who|where|how|here)'s\b/g;
  var D_SUBJECTS = /\b(i|you|he|she|it|we|they)'d\b/g;

  function baseNormalize(text) {
    var t = String(text == null ? '' : text).toLowerCase()
      .replace(/[‘’ʼ`´]/g, "'")
      .replace(/\b([ap])\.\s?m\b\.?/g, '$1m');
    CONTRACTIONS.forEach(function (pair) { t = t.replace(pair[0], pair[1]); });
    t = t.replace(/[^a-z0-9'\s]/g, ' ')
      .replace(/(^|\s)'+|'+(\s|$)/g, ' ')   // stray quotes around words
      .replace(/\s+/g, ' ').trim();
    t = t.split(' ').map(function (w) { return NUMBER_WORDS[w] || w; }).join(' ');
    return t.replace(/\bany more\b/g, 'anymore');
  }

  // Every reading of the ambiguous contractions ('s → is/has, 'd → had/would).
  function variants(text) {
    var base = baseNormalize(text);
    var out = [base];
    if (S_SUBJECTS.test(base)) {
      out = [].concat.apply([], out.map(function (v) {
        return [v.replace(S_SUBJECTS, '$1 is'), v.replace(S_SUBJECTS, '$1 has')];
      }));
    }
    S_SUBJECTS.lastIndex = 0;
    if (D_SUBJECTS.test(base)) {
      out = [].concat.apply([], out.map(function (v) {
        return [v.replace(D_SUBJECTS, '$1 had'), v.replace(D_SUBJECTS, '$1 would')];
      }));
    }
    D_SUBJECTS.lastIndex = 0;
    return out;
  }

  function isMatch(userText, accepted) {
    var user = variants(userText);
    if (!user[0]) return false;
    return [].concat(accepted || []).some(function (a) {
      var av = variants(a);
      return user.some(function (u) { return av.indexOf(u) !== -1; });
    });
  }

  // Original words, each split into its normalized tokens (so "haven't"
  // compares as "have" + "not" but is still shown as one word).
  function tokenize(text) {
    var words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    var toks = [];
    words.forEach(function (w, wi) {
      baseNormalize(w).split(' ').filter(Boolean).forEach(function (t) { toks.push({ t: t, w: wi }); });
    });
    return { words: words, toks: toks };
  }

  // Longest common subsequence over tokens; a word is "ok" when all of its
  // tokens are part of the common subsequence.
  function diff(userText, answerText) {
    var a = tokenize(userText), b = tokenize(answerText);
    var n = a.toks.length, m = b.toks.length;
    var dp = [];
    for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) {
      for (var j = m - 1; j >= 0; j--) {
        dp[i][j] = a.toks[i].t === b.toks[j].t ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var aHit = new Array(n).fill(false), bHit = new Array(m).fill(false);
    i = 0; j = 0;
    while (i < n && j < m) {
      if (a.toks[i].t === b.toks[j].t) { aHit[i] = bHit[j] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    function mark(side, hits) {
      var ok = side.words.map(function () { return true; });
      side.toks.forEach(function (tk, k) { if (!hits[k]) ok[tk.w] = false; });
      return side.words.map(function (w, wi) { return { w: w, ok: ok[wi] }; });
    }
    return { user: mark(a, aHit), answer: mark(b, bHit), common: dp[0][0], answerLength: m };
  }

  // The accepted answer closest to what the student wrote — the one shown in
  // the word-by-word comparison.
  function closest(userText, accepted) {
    var list = [].concat(accepted || []);
    var best = list[0], bestScore = -1;
    list.forEach(function (a) {
      var d = diff(userText, a);
      var score = d.answerLength ? d.common / d.answerLength : 0;
      if (score > bestScore) { bestScore = score; best = a; }
    });
    return best;
  }

  var api = { normalize: baseNormalize, variants: variants, isMatch: isMatch, diff: diff, closest: closest };
  window.AnswerMatch = api;
})();
