/* ══════════════════════════════════════════════════════════════════════
   shared/sentence-drill.js — the parts of the sentence-writing drill that
   writing-practice.html (Luyện viết câu) and task1-practice.html (Task 1
   Grammar) had as identical copies: word-bank rearrange, the word-by-word
   "gõ từng chữ" typing drill, the timed-test controls, the mobile bottom
   sheet and the answer diff.

   Plain global functions, like the page scripts that call them (and the
   onclick="" handlers in the pages). Load it BEFORE the page script; at
   call time it uses the page's own globals:
     state      rearrangeAnswer, _isSubmitting,
                testTimeLeft, testTimerInterval, testTotalTime
     functions  submitAnswer(), submitTest(), testNextQuestion(), loadExercises()
   plus playOk() (sound-effects.js) and showToast() (toast.js).
══════════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════
function _safeParse(json, fallback){ if(json==null) return fallback; try{ return JSON.parse(json); }catch{ return fallback; } }

function _escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildAnswerDiff(userAnswer, sampleAnswer) {
  const norm = s => s.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
  const sampleSet = new Set(norm(sampleAnswer).split(/\s+/));
  return userAnswer.split(/\s+/).map(word => {
    const ok = sampleSet.has(norm(word));
    return `<span class="${ok ? 'wp-diff-ok' : 'wp-diff-err'}">${_escHtml(word)}</span>`;
  }).join(' ');
}

function startPractice() {
  if (window.AuthService && !window.AuthService.hasPremiumAccess()) {
    if (window.openUpgradeModal) window.openUpgradeModal();
    return;
  }
  loadExercises();
}

// ════════════════════════════════════════════════════════
//  MOBILE SHEET
// ════════════════════════════════════════════════════════
function openWpSheet() {
  document.getElementById('wp-mob-sheet').classList.add('open');
  document.getElementById('wp-mob-backdrop').classList.add('visible');
  document.getElementById('wp-mob-fab').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWpSheet() {
  document.getElementById('wp-mob-sheet').classList.remove('open');
  document.getElementById('wp-mob-backdrop').classList.remove('visible');
  document.getElementById('wp-mob-fab').classList.remove('open');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════════
//  WORD-BY-WORD "DỊCH CÂU" TYPING DRILL
//  Progressive, one active word at a time, character-by-character
//  validation (shared .wbw-* CSS lives in writing-practice.css). Feeds the
//  existing #answer-box → submitAnswer() flow unchanged — the server still
//  local-checks the finished sentence and returns XP / feedback / grammar
//  point exactly as for a typed answer.
// ════════════════════════════════════════════════════════
let _wbw = null;

function _wbwTokenize(answer) {
  return String(answer).trim().split(/\s+/).filter(Boolean).map(raw => {
    const target = raw.replace(/[^A-Za-z0-9]/g, '');   // chars the student actually types
    let seen = false;
    const mask = [...raw].map(ch => {
      if (/[A-Za-z0-9]/.test(ch)) { if (!seen) { seen = true; return ch; } return '*'; }
      return ch;                                        // punctuation stays visible
    }).join('');
    return { raw, target, mask };
  }).filter(t => t.target.length > 0);                  // drop stray punctuation-only tokens
}

function _wbwPreventPaste(e) { e.preventDefault(); }

function wbwInit(answer) {
  const wrap = document.getElementById('wbw');
  if (!wrap || !answer) { wbwTeardown(); return; }
  const tokens = _wbwTokenize(answer);
  if (!tokens.length) { wbwTeardown(); return; }
  _wbw = { answer, tokens, activeIdx: 0, typed: '', erroring: false, done: false, locked: false };
  wrap.classList.remove('hidden');

  const input = document.getElementById('wbw-input');
  if (input) {
    input.disabled = false;
    input.value = '';
    // #wbw markup is static (not rebuilt per question), so drop the previous
    // question's listeners before re-binding.
    input.removeEventListener('keydown', _wbwKeydown);
    input.removeEventListener('input', _wbwOnInput);
    input.removeEventListener('paste', _wbwPreventPaste);
    input.addEventListener('keydown', _wbwKeydown);
    input.addEventListener('input', _wbwOnInput);
    input.addEventListener('paste', _wbwPreventPaste);
  }
  const askBtn = document.getElementById('wbw-ask');
  if (askBtn) askBtn.disabled = false;
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge(false);
  setTimeout(wbwFocus, 30);
}

function wbwTeardown() {
  _wbw = null;
  const wrap = document.getElementById('wbw');
  if (wrap) wrap.classList.add('hidden');
}

function wbwFocus() {
  if (!_wbw || _wbw.locked) return;
  const input = document.getElementById('wbw-input');
  if (input) input.focus();
}

// "Hỏi Lulu": Lulu tells the next letter of the word being typed — one
// letter per ask, never the whole sentence, and never typed in for the
// student (they still type it themselves — active recall).
function wbwAskLulu() {
  if (!_wbw || _wbw.done || _wbw.locked) return;
  const tok = _wbw.tokens[_wbw.activeIdx];
  if (!tok) return;
  const next = tok.target.charAt(_wbw.typed.length);
  if (next && window.AskLulu) {
    const so = _wbw.typed + next;
    window.AskLulu.say(document.getElementById('wbw-ask'),
      `Chữ tiếp theo là “${next}” nè — từ này bắt đầu “${so}${so.length < tok.target.length ? '…' : ''}” 🍊`);
  }
  wbwFocus();
}

function _wbwRenderWords() {
  const host = document.getElementById('wbw-words');
  if (!host || !_wbw) return;
  const { tokens, activeIdx, typed, erroring, done } = _wbw;
  host.innerHTML = tokens.map((t, i) => {
    if (i < activeIdx) {
      return `<span class="wbw-word is-done" data-i="${i}">${_escHtml(t.raw)}</span>`;
    }
    if (i === activeIdx && !done) {
      const remaining = Math.max(0, t.target.length - typed.length);
      const tail = erroring
        ? `<span class="wbw-err">✕</span>`
        : `<span class="wbw-caret"></span>`;
      return `<span class="wbw-word is-active${erroring ? ' is-error' : ''}" data-i="${i}">`
        + `${_escHtml(typed)}${tail}<span class="wbw-star">${'*'.repeat(remaining)}</span></span>`;
    }
    return `<span class="wbw-word is-locked" data-i="${i}">${_escHtml(t.mask)}</span>`;
  }).join('');

  const input = document.getElementById('wbw-input');
  if (input && !_wbw.locked) {
    const cur = tokens[activeIdx];
    input.placeholder = cur ? cur.mask : '';
  }
}

function _wbwUpdateBar() {
  if (!_wbw) return;
  const el = document.getElementById('wbw-count');
  if (!el) return;
  const total = _wbw.tokens.length;
  const done = _wbw.done ? total : _wbw.activeIdx;
  el.textContent = `${done} / ${total} từ`;
  el.classList.toggle('is-full', done === total && total > 0);
}

// Mirror completed words into the hidden #answer-box so the existing
// getUserAnswer()/submitAnswer() chain works with zero changes.
function _wbwSyncBridge(full) {
  const box = document.getElementById('answer-box');
  if (!box || !_wbw) return;
  box.value = (full || _wbw.done)
    ? _wbw.answer
    : _wbw.tokens.slice(0, _wbw.activeIdx).map(t => t.raw).join(' ');
}

function _wbwFlashError() {
  if (!_wbw || _wbw.erroring) return;
  _wbw.erroring = true;
  const input = document.getElementById('wbw-input');
  if (input) input.classList.add('is-error');
  _wbwRenderWords();
  setTimeout(() => {
    if (!_wbw) return;
    _wbw.erroring = false;
    if (input) input.classList.remove('is-error');
    _wbwRenderWords();
  }, 260);
}

function _wbwKeydown(e) {
  if (!_wbw || _wbw.locked || _wbw.done) return;
  // Enter / Space are no-ops — progression is automatic, completion auto-submits.
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
}

// Runs on every keystroke (also IME / mobile / long-press). A rejected
// character is simply removed and the student retypes — never auto-corrected.
function _wbwOnInput() {
  if (!_wbw || _wbw.locked || _wbw.done) return;
  const input = document.getElementById('wbw-input');
  if (!input) return;
  const tok = _wbw.tokens[_wbw.activeIdx];
  const raw = input.value.replace(/[^A-Za-z0-9]/g, '');

  let good = '';
  let rejected = false;
  for (const ch of raw) {
    const expected = tok.target[good.length];
    if (expected === undefined) break;                  // don't overrun the word
    if (ch.toLowerCase() === expected.toLowerCase()) good += ch;
    else { rejected = true; break; }
  }

  _wbw.typed = good;
  input.value = good;                                   // active-recall: never auto-fill

  if (rejected) { _wbwFlashError(); return; }
  if (good.length < tok.target.length) { _wbwRenderWords(); return; }

  // ── active word complete ──
  _wbw.activeIdx++;
  _wbw.typed = '';
  input.value = '';
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge();
  const chip = document.querySelector(`#wbw-words .wbw-word[data-i="${_wbw.activeIdx - 1}"]`);
  if (chip) chip.classList.add('just-done');
  if (typeof playOk === 'function') playOk();

  if (_wbw.activeIdx >= _wbw.tokens.length) _wbwComplete();
  else wbwFocus();
}

function _wbwComplete() {
  if (!_wbw) return;
  const mine = _wbw;
  _wbw.done = true;
  _wbw.locked = true;
  const input = document.getElementById('wbw-input');
  if (input) { input.disabled = true; input.blur(); }
  const askBtn = document.getElementById('wbw-ask');
  if (askBtn) askBtn.disabled = true;
  _wbwRenderWords();
  _wbwUpdateBar();
  _wbwSyncBridge(true);
  // Hand off to the normal submit / feedback / auto-next flow. Bail if the
  // drill was torn down or replaced (e.g. student hit "Bỏ qua" during this
  // delay) — otherwise submitAnswer() would fire against the next exercise.
  setTimeout(() => {
    if (_wbw !== mine || _isSubmitting) return;
    submitAnswer();
  }, 500);
}

// ════════════════════════════════════════════════════════
//  REARRANGE (word bank)
// ════════════════════════════════════════════════════════
function selectWord(chip) {
  if (chip.dataset.used === 'true') return;
  chip.dataset.used = 'true'; chip.classList.add('wp-chip-used');
  rearrangeAnswer.push(chip.dataset.word);
  renderRearrangeAnswer();
}

function returnWord(e) {
  if (!e.target.classList.contains('wp-answer-chip')) return;
  const word = e.target.dataset.word;
  rearrangeAnswer.splice(parseInt(e.target.dataset.idx), 1);
  let unmarked = false;
  document.querySelectorAll('#rearrange-bank .wp-word-chip').forEach(c => {
    if (!unmarked && c.dataset.word === word && c.dataset.used === 'true') {
      c.dataset.used = 'false'; c.classList.remove('wp-chip-used');
      unmarked = true;
    }
  });
  renderRearrangeAnswer();
}

function renderRearrangeAnswer() {
  const area = document.getElementById('rearrange-answer');
  area.innerHTML = '';
  if (!rearrangeAnswer.length) {
    area.innerHTML = '<span class="wp-rearrange-placeholder">Bấm vào các từ để sắp xếp...</span>';
  } else {
    rearrangeAnswer.forEach((w, i) => {
      const chip = document.createElement('span');
      chip.className = 'wp-answer-chip'; chip.textContent = w;
      chip.dataset.word = w; chip.dataset.idx = i; chip.title = 'Bấm để bỏ từ này';
      area.appendChild(chip);
    });
  }
  document.getElementById('rearrange-input').value = rearrangeAnswer.join(' ');
}

// ════════════════════════════════════════════════════════
//  TEST MODE — timer and setup
// ════════════════════════════════════════════════════════
function startTestTimer(totalSeconds) {
  stopTestTimer();
  testTotalTime = totalSeconds;
  testTimeLeft  = totalSeconds;
  function tick() {
    const el = document.getElementById('test-timer');
    if (!el) return;
    const m = Math.floor(testTimeLeft / 60);
    const s = testTimeLeft % 60;
    el.textContent = '⏱ ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    const pct = testTotalTime > 0 ? testTimeLeft / testTotalTime : 1;
    el.className = 'wp-test-timer' + (pct <= 0.1 ? ' danger' : pct <= 0.25 ? ' warn' : '');
    if (testTimeLeft <= 0) {
      stopTestTimer();
      showToast('Hết giờ! Tự động nộp bài.', 'warn', 4000);
      submitTest();
      return;
    }
    testTimeLeft--;
  }
  tick();
  testTimerInterval = setInterval(tick, 1000);
}

function stopTestTimer() {
  clearInterval(testTimerInterval);
  testTimerInterval = null;
  const el = document.getElementById('test-timer');
  if (el) { el.textContent = '⏱ --:--'; el.className = 'wp-test-timer'; }
}

function selectTestLevel(level) {
  testLevel = level;
  document.querySelectorAll('.wp-level-btn[data-tlevel]').forEach(b =>
    b.classList.toggle('active', b.dataset.tlevel === level));
}

function selectTestCount(n) {
  testCount = n;
  document.querySelectorAll('.wp-level-btn[data-tcount]').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.tcount) === n));
}

function handleTestKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    testNextQuestion();
  }
}

// ════════════════════════════════════════════════════════
//  HISTORY MODAL
// ════════════════════════════════════════════════════════
function closeHistory() {
  document.getElementById('t1-hist-overlay').classList.add('hidden');
}
