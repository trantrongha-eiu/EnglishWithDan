/**
 * js/shared/transcript-sync.js — maps the rendered transcript back to the
 * server's per-token timing and marks the sentence being spoken.
 *
 * jsdom has no CSS Custom Highlight API, so this runs the fallback path
 * (.ts-active-block on the paragraph, .ts-active on gap-fill blanks) —
 * the token→time mapping it checks is the same one the Highlight path uses.
 */
'use strict';

const { loadScript } = require('../helpers/loadScript');

// Same format as backend services/transcriptTimingService.js encodeTiming.
function encode(timing) {
    let prev = 0;
    return timing.map(t => {
        if (!t) return '';
        const s = Math.round(t[0] * 100), d = Math.round(t[1] * 100) - s;
        const delta = s - prev; prev = s;
        return `${delta < 0 ? '-' + (-delta).toString(36) : delta.toString(36)}.${d.toString(36)}`;
    }).join(',');
}

// One second per spoken token, starting at `from`; nulls where `skip`.
function timeTokens(text, from, skip = () => false) {
    let t = from;
    return text.split(/\s+/).filter(Boolean).map(tok => {
        if (skip(tok)) return null;
        const r = [t, t + 0.8]; t += 1; return r;
    });
}

function fakeAudio() {
    const a = new EventTarget();
    a.currentTime = 0;
    a.paused = true;
    a.at = t => { a.currentTime = t; a.dispatchEvent(new Event('timeupdate')); };
    return a;
}

beforeAll(() => {
    // jsdom lays nothing out — make every element count as visible.
    Element.prototype.getClientRects = function () { return [{}]; };
    loadScript('transcript-sync.js');
});

afterEach(() => { document.body.innerHTML = ''; });

const active = () => Array.from(document.querySelectorAll('.ts-active-block')).map(p => p.textContent.trim());

test('decode reverses the server encoding, nulls included', () => {
    const t = [[1.5, 2], null, [2.1, 2.9], [0.5, 0.7]];
    expect(window.TranscriptSync.decode(encode(t))).toEqual(t);
});

test('review transcript: the line being spoken is marked, labels are not', () => {
    const text = 'Woman:\nHello there. How are you?\nMan:\nFine thanks.';
    const timing = timeTokens(text, 10, tok => /:$/.test(tok));
    document.body.innerHTML = '<div id="tb">' + text.split('\n').map(l => `<p>${l}</p>`).join('') + '</div>';
    const audio = fakeAudio();
    const c = window.TranscriptSync.attach({ container: document.getElementById('tb'), audio, text, timing: encode(timing) });
    expect(c).not.toBeNull();

    audio.at(10.2);
    expect(active()).toEqual(['Hello there. How are you?']);
    audio.at(13.5);
    expect(active()).toEqual(['Hello there. How are you?']);
    audio.at(15.1);
    expect(active()).toEqual(['Fine thanks.']);
    audio.at(30);
    expect(active()).toEqual([]);
});

test('gap-fill: blanks map to their [[n]] token, stripped annotations are skipped', () => {
    const template = 'Man: It is a [[1]] with (31) local [[2]], I think.';
    const timing = timeTokens(template, 5, tok => tok === 'Man:' || tok === '(31)');
    document.body.innerHTML = '<div id="gf"><p class="gf-turn"><span class="gf-speaker">Man</span> It is a '
        + '<span class="gf-blank-wrap"><input class="gf-blank" data-idx="0"></span> with local '
        + '<span class="gf-blank-wrap"><input class="gf-blank" data-idx="1"></span>, I think.</p></div>';
    const audio = fakeAudio();
    window.TranscriptSync.attach({
        container: document.getElementById('gf'), audio, text: template, timing: encode(timing),
        blankSelector: '.gf-blank', skipSelector: '.gf-speaker',
    });
    audio.at(6);
    const blanks = document.querySelectorAll('.gf-blank');
    expect(blanks[0].classList.contains('ts-active')).toBe(true);
    expect(blanks[1].classList.contains('ts-active')).toBe(true);
    audio.at(40);
    expect(blanks[0].classList.contains('ts-active')).toBe(false);
});

test('timing for a different version of the text is ignored', () => {
    document.body.innerHTML = '<div id="tb"><p>One two three.</p></div>';
    const c = window.TranscriptSync.attach({
        container: document.getElementById('tb'), audio: fakeAudio(),
        text: 'One two three.', timing: encode([[0, 1], [1, 2]]),
    });
    expect(c).toBeNull();
});

test('re-rendered content (part switch / saved highlights) is re-scanned', async () => {
    const text = 'Alpha beta. Gamma delta.';
    const tb = document.createElement('div');
    tb.innerHTML = '<p>Alpha beta. Gamma delta.</p>';
    document.body.appendChild(tb);
    const audio = fakeAudio();
    window.TranscriptSync.attach({ container: tb, audio, text, timing: encode(timeTokens(text, 0)) });
    audio.at(2.2);
    expect(active()).toEqual(['Alpha beta. Gamma delta.']);
    // A student highlight splits the text node — mapping must survive.
    tb.innerHTML = '<p>Alpha <span class="hl">beta. Gamma</span> delta.</p>';
    await Promise.resolve();
    audio.at(3.1);
    expect(active()).toEqual(['Alpha beta. Gamma delta.']);
});
