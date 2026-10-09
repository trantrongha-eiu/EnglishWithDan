/* ══════════════════════════════════════════════
   dashboard-audio.js  –  Text-to-speech + sound-effect subsystem,
   extracted from dashboard.js. soundEnabled/_ttsCache/correctSound/
   wrongSound are used exclusively by the functions below — nothing else
   in dashboard.js touches them (verified via project-wide grep) — so this
   was safe to isolate as its own file, sharing the browser's classic-
   script top-level scope with dashboard.js the same way every other
   extraction in this pass does.
══════════════════════════════════════════════ */

// Sound on/off is now the global nav toggle (js/shared/sound-effects.js,
// localStorage 'wp_sound') — these two functions keep their names (many
// call sites across dashboard.js/dashboard-lesson.js) but now read that
// shared flag instead of an own, unpersisted local variable.
const correctSound = new Audio('/sounds/correct.mp3');
const wrongSound   = new Audio('/sounds/incorrect.mp3');
correctSound.volume = 0.5;
wrongSound.volume   = 0.5;

function playCorrectSound() { if (!window.isSoundEnabled || window.isSoundEnabled()) { correctSound.currentTime = 0; correctSound.play().catch(()=>{}); } }
function playWrongSound()   { if (!window.isSoundEnabled || window.isSoundEnabled()) { wrongSound.currentTime   = 0; wrongSound.play().catch(()=>{}); } }

/* ══════════════════════════════════════════════
   SPEAK WORD — delegates to the shared engine in js/shared/word-audio.js
   (Oxford / dictionary recordings first, TTS fallback, silent lead-in
   before each word so the start isn't clipped).
══════════════════════════════════════════════ */

/* ── Slow-speech toggle (🐢) ───────────────────────────────────────────
   The word audio in the Listen / Classroom-quiz modes plays too fast for
   some learners. This flag (persisted, like the sound toggle) makes
   speakWord() drop the TTS rate / <audio> playbackRate so each sound is
   easier to catch. Buttons with class .js-slow-speech-btn reflect the
   state; toggleSlowSpeech(word) flips it and replays `word` at the new
   speed for instant feedback. */
let _slowSpeech = false;
try { _slowSpeech = localStorage.getItem('ews_vocab_slow') === '1'; } catch (e) { /* private mode */ }

function isSlowSpeech() { return _slowSpeech; }

function syncSlowSpeechBtns() {
    document.querySelectorAll('.js-slow-speech-btn').forEach(b => {
        b.classList.toggle('active', _slowSpeech);
        b.setAttribute('aria-pressed', _slowSpeech ? 'true' : 'false');
    });
}

function setSlowSpeech(on) {
    _slowSpeech = !!on;
    try { localStorage.setItem('ews_vocab_slow', _slowSpeech ? '1' : '0'); } catch (e) { /* ignore */ }
    syncSlowSpeechBtns();
}

function toggleSlowSpeech(replayWord) {
    setSlowSpeech(!_slowSpeech);
    if (replayWord) speakWord(replayWord);
}

window.isSlowSpeech       = isSlowSpeech;
window.setSlowSpeech      = setSlowSpeech;
window.toggleSlowSpeech   = toggleSlowSpeech;
window.syncSlowSpeechBtns = syncSlowSpeechBtns;

async function speakWord(word) {
    if (!word) return;
    if (window.WordAudio) return window.WordAudio.speak(word, { slow: _slowSpeech });
    // Engine script missing — plain TTS so the button still does something.
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(String(word).trim());
        utt.lang = 'en-US';
        utt.rate = _slowSpeech ? 0.6 : 0.85;
        window.speechSynthesis.speak(utt);
    }
}
