/* ══════════════════════════════════════════════
   dashboard-audio.js  –  Text-to-speech + sound-effect subsystem,
   extracted from dashboard.js. soundEnabled/_ttsCache/correctSound/
   wrongSound are used exclusively by the functions below — nothing else
   in dashboard.js touches them (verified via project-wide grep) — so this
   was safe to isolate as its own file, sharing the browser's classic-
   script top-level scope with dashboard.js the same way every other
   extraction in this pass does.
══════════════════════════════════════════════ */

let soundEnabled = true;

const correctSound = new Audio('./sounds/correct.mp3');
const wrongSound   = new Audio('./sounds/incorrect.mp3');
correctSound.volume = 0.5;
wrongSound.volume   = 0.5;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const text = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    document.getElementById('soundToggle').textContent = text;
    const mob = document.getElementById('soundToggleMob');
    if (mob) mob.textContent = text;
}
function playCorrectSound() { if (soundEnabled) { correctSound.currentTime = 0; correctSound.play().catch(()=>{}); } }
function playWrongSound()   { if (soundEnabled) { wrongSound.currentTime   = 0; wrongSound.play().catch(()=>{}); } }

/* ══════════════════════════════════════════════
   SPEAK WORD — multi-layer fallback
   Layer 1: Web Speech API (cần Google TTS / hệ thống TTS)
   Layer 2: DictionaryAPI audio (MP3 có sẵn online)
   Layer 3: Google Translate TTS (fallback cuối)
══════════════════════════════════════════════ */
let _ttsCache = {};   // word → audio URL đã tìm được

async function speakWord(word) {
    if (!word) return;
    word = word.trim();

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
            utt.rate  = 0.85;
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
                    await _speakFallback(word);
                    resolve();
                }, 1500);

                utt.onstart = () => clearTimeout(timer);
                utt.onend   = () => { clearTimeout(timer); resolve(); };
                utt.onerror = async () => {
                    clearTimeout(timer);
                    if (!timedOut) { await _speakFallback(word); resolve(); }
                };
            });
        }
    }

    // Không có Web Speech → fallback ngay
    await _speakFallback(word);
}

async function _speakFallback(word) {
    // ── Layer 2: Cache hit ────────────────────────
    if (_ttsCache[word]) {
        _playAudioUrl(_ttsCache[word]);
        return;
    }

    // ── Layer 2: DictionaryAPI (MP3 thật, không CORS) ─
    try {
        const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
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

    // ── Layer 3: Web Speech không cần voice check (voices load trễ trên mobile) ──
    try {
        const synth2 = window.speechSynthesis;
        if (synth2) {
            synth2.cancel();
            const utt2 = new SpeechSynthesisUtterance(word);
            utt2.lang  = 'en-US';
            utt2.rate  = 0.85;
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
        audio.play().catch(() => {
            // Nếu autoplay bị block, không làm gì (tránh crash)
        });
    } catch { }
}
