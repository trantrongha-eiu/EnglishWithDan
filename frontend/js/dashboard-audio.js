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
   SPEAK WORD — multi-layer fallback
   Layer 1: Web Speech API (cần Google TTS / hệ thống TTS)
   Layer 2: DictionaryAPI audio (MP3 có sẵn online)
   Layer 3: Google Translate TTS (fallback cuối)
══════════════════════════════════════════════ */
let _ttsCache = {};   // word → audio URL đã tìm được

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

// Rates: normal keeps the existing 0.85; slow is gentle enough to hear
// syllables but not so slow the TTS voice warbles.
const _rate = () => (_slowSpeech ? 0.6 : 0.85);

// Guards against overlapping speakWord() calls (e.g. rapidly flipping
// flashcards, or auto-play firing for quiz question N+1 before question N's
// utterance/fallback settled): synth.cancel() on a NEWER call fires the
// OLDER utterance's onerror, which — without this guard — would call
// _speakFallback() for a word the student already moved past. Only the most
// recent speakWord() call is allowed to actually play audio.
let _speakSeq = 0;

async function speakWord(word) {
    if (!word) return;
    word = word.trim();
    const requestId = ++_speakSeq;

    // ── Layer 1: Web Speech API ──────────────────
    const synth = window.speechSynthesis;
    if (synth) {
        // Kiểm tra có voice tiếng Anh không
        const voices = synth.getVoices();
        const hasEnVoice = voices.some(v => v.lang.startsWith('en'));

        if (hasEnVoice) {
            synth.cancel();
            const utt = new SpeechSynthesisUtterance(word);
            utt.lang  = 'en-US';
            utt.rate  = _rate();
            utt.pitch = 1;
            // Chọn voice en-US nếu có
            const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
            if (enVoice) utt.voice = enVoice;
            synth.speak(utt);

            // Nếu 1.5s sau vẫn đang "speaking" nhưng không thực sự phát → fallback
            return new Promise(resolve => {
                let timedOut = false;
                const timer = setTimeout(async () => {
                    timedOut = true;
                    synth.cancel();
                    if (requestId === _speakSeq) await _speakFallback(word, requestId);
                    resolve();
                }, 1500);

                utt.onstart = () => clearTimeout(timer);
                utt.onend   = () => { clearTimeout(timer); resolve(); };
                utt.onerror = async () => {
                    clearTimeout(timer);
                    if (!timedOut) {
                        if (requestId === _speakSeq) await _speakFallback(word, requestId);
                        resolve();
                    }
                };
            });
        }
    }

    // Không có Web Speech → fallback ngay
    await _speakFallback(word, requestId);
}

async function _speakFallback(word, requestId) {
    // ── Layer 2: Cache hit ────────────────────────
    if (_ttsCache[word]) {
        _playAudioUrl(_ttsCache[word]);
        return;
    }

    // ── Layer 2: DictionaryAPI (MP3 thật, không CORS) ─
    try {
        const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (requestId !== _speakSeq) return; // a newer speakWord() call has since started
        if (res.ok) {
            const data = await res.json();
            let audioUrl = '';
            for (const entry of data) {
                for (const ph of (entry.phonetics || [])) {
                    if (ph.audio && ph.audio.includes('.mp3')) {
                        audioUrl = ph.audio.startsWith('http') ? ph.audio : 'https:' + ph.audio;
                        break;
                    }
                }
                if (audioUrl) break;
            }
            if (audioUrl) {
                _ttsCache[word] = audioUrl;
                _playAudioUrl(audioUrl);
                return;
            }
        }
    } catch { /* ignore */ }

    if (requestId !== _speakSeq) return;

    // ── Layer 3: Web Speech không cần voice check (voices load trễ trên mobile) ──
    try {
        const synth2 = window.speechSynthesis;
        if (synth2) {
            synth2.cancel();
            const utt2 = new SpeechSynthesisUtterance(word);
            utt2.lang  = 'en-US';
            utt2.rate  = _rate();
            synth2.speak(utt2);
            await new Promise(resolve => {
                utt2.onend   = resolve;
                utt2.onerror = resolve;
                setTimeout(resolve, 2000);
            });
            return;
        }
    } catch { /* ignore */ }

    // ── Layer 4: Google Translate TTS (Audio element bypass CORS) ─────────────
    const gtUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`;
    _ttsCache[word] = gtUrl;
    _playAudioUrl(gtUrl);
}

function _playAudioUrl(url) {
    try {
        const audio = new Audio(url);
        audio.volume = 1;
        if (_slowSpeech) {
            // Keep the pitch natural while slowing the MP3 / Google-TTS clip.
            try { audio.preservesPitch = true; audio.mozPreservesPitch = true; audio.webkitPreservesPitch = true; } catch (e) {}
            audio.playbackRate = 0.7;
        }
        audio.play().catch(() => {
            // Nếu autoplay bị block, không làm gì (tránh crash)
        });
    } catch { }
}
