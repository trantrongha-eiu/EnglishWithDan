# Cuts the dictation-drill clips: only the name / number + its spelling or
# read-back, each as its own small mp3 (no seeking inside a 30-minute file, no
# neighbouring word leaking in). For every candidate from
#   node scripts/dictationDrills/buildDictationDrills.js --export <dir>
# it (1) finds the item in the audio with faster-whisper, (2) moves both cuts to
# the nearest silence / energy valley, (3) re-transcribes the finished clip with
# no hint and rejects it unless the answer is really heard and nothing extra is.
#   py scripts/dictationDrills/cutClips.py <dir> [model]
# Results append to <dir>/results.jsonl, so an interrupted run resumes.
#   py scripts/dictationDrills/cutClips.py <dir> --recheck   re-queues clips passed by an older check
import sys, os, re, json, hashlib, urllib.request
from difflib import SequenceMatcher
import numpy as np, av
from faster_whisper import WhisperModel

SR, HOP = 16000, 160  # 10 ms analysis frames
OUT_SR = 44100
LEAD, TAIL, FADE = 0.08, 0.12, 0.02
NAME_GAP = 0.45  # silence between a far name and its spelling

UNITS = dict(zip('ZERO ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT NINE TEN ELEVEN TWELVE THIRTEEN FOURTEEN FIFTEEN SIXTEEN SEVENTEEN EIGHTEEN NINETEEN'.split(), range(20)))
UNITS['OH'] = 0
TENS = dict(zip('TWENTY THIRTY FORTY FIFTY SIXTY SEVENTY EIGHTY NINETY'.split(), range(20, 100, 10)))
SCALE = {'HUNDRED': 2, 'THOUSAND': 3, 'MILLION': 6}
DROP = {'POUND', 'POUNDS', 'PENCE', 'DOLLAR', 'DOLLARS', 'CENT', 'CENTS', 'EURO', 'EUROS', 'PERCENT', 'PER', 'AND', 'POINT', 'P'}
TRAILING_UNIT = {'POUND', 'POUNDS', 'PENCE', 'P', 'DOLLAR', 'DOLLARS', 'CENT', 'CENTS', 'EURO', 'EUROS', 'PERCENT', 'PER', 'MILLION', 'BILLION', 'THOUSAND', 'HUNDRED'}


UNIT_SAID = {'POUND', 'POUNDS', 'P', 'PENCE', 'DOLLAR', 'DOLLARS', 'CENT', 'CENTS', 'EURO', 'EUROS', 'PERCENT'}


def unit_heard(raws):
    """A currency / percent unit is in what Whisper heard ("£35", "35 pounds", "65%")."""
    return any(re.search(r'[£$€%]', w) or norm(w) in UNIT_SAID or re.search(r'\d(POUNDS?|P|DOLLARS?|EUROS?|PERCENT)$', norm(w))
               for w in raws)


def norm(raw):
    return re.sub(r'[^A-Za-z0-9]', '', raw).upper()


def to_chars(raws, spell):
    """Comparable characters per spoken word ("ninety five" -> "9","5")."""
    out, fill = [], None  # fill = (word index, trailing zeros it can still take)
    repeat = 1
    for raw in raws:
        w, chars = norm(raw), None
        if w in ('DOUBLE', 'TRIPLE'):
            repeat = 2 if w == 'DOUBLE' else 3
            out.append('')
            continue
        if not spell:
            parts = [norm(p) for p in re.split(r'[-\s]', raw.upper()) if p]
            if len(parts) == 2 and parts[0] in TENS and parts[1] in UNITS:
                chars, fill = str(TENS[parts[0]] + UNITS[parts[1]]), None
            elif w in UNITS or w in TENS:
                v = UNITS.get(w, TENS.get(w))
                s = str(v)
                if fill and v and len(s) <= fill[1]:
                    i = fill[0]
                    out[i] = out[i][:len(out[i]) - len(s)]
                fill = (len(out), 1) if w in TENS else None
                chars = s
            elif w == 'O':  # 'oh' written as a letter in a digit string
                chars = '0'
            elif w in SCALE:
                if out and out[-1] == 'A':  # 'a hundred and twenty'
                    out[-1] = '1'
                chars, fill = '0' * SCALE[w], (len(out), SCALE[w])
            elif w in DROP:
                chars = ''
        if chars is None:
            chars, fill = w, None
        if repeat > 1 and chars:
            chars = chars[0] * repeat + chars[1:]
            repeat = 1
        out.append(chars)
    return out


def letterish(raw):
    """A spelled piece: "L", "-I", "L-I-M", "LIMERICK" — not the word "Limerick"."""
    w = norm(raw)
    bare = re.sub(r'[^A-Za-z]', '', raw)
    return len(w) <= 1 or w in ('DOUBLE', 'TRIPLE') or '-' in raw.strip('-.,?!') or (len(w) >= 3 and bare == w)


def close_enough(heard, target, spell):
    if not heard:
        return False
    if heard == target:
        return True
    if not spell and target.isdigit() and len(target) <= 4:
        return False  # a short number must be exact
    r = SequenceMatcher(None, heard, target).ratio()
    if spell:
        return r >= 0.8
    return r >= (0.88 if len(target) <= 10 else 0.84)


def edges_heard(pool, target):
    """(first char of target heard, last char of target heard)."""
    blocks = [b for b in SequenceMatcher(None, target, pool, autojunk=False).get_matching_blocks() if b.size]
    if not blocks:
        return False, False
    return blocks[0].a == 0, blocks[-1].a + blocks[-1].size == len(target)


def recheck(outdir):
    """Sends clips accepted by the older, looser check back to be cut again."""
    items = {i['key']: i for i in json.load(open(os.path.join(outdir, 'candidates.json'), encoding='utf8'))}
    path = os.path.join(outdir, 'results.jsonl')
    lines = [l for l in open(path, encoding='utf8') if l.strip()]
    keep, redo = [], []
    for line in lines:
        r = json.loads(line)
        it = items.get(r['key'])
        if r.get('status') == 'ok' and it:
            raws = r['heard'].split()
            pool = ''.join(to_chars(raws, it['kind'] == 'spell'))
            name_ok = not r.get('hasName') or any(
                SequenceMatcher(None, norm(w), it['nameTarget']).ratio() >= 0.7 for w in raws)
            if not all(edges_heard(pool, it['target'])) or not name_ok:
                redo.append(r)
                continue
        keep.append(line)
    with open(path + '.before-recheck', 'w', encoding='utf8') as f:
        f.writelines(lines)
    with open(path, 'w', encoding='utf8') as f:
        f.writelines(keep)
    print(f'{len(redo)} of {len(lines)} clips sent back to be cut again')
    for r in redo:
        print(' ', r['kind'], r['answer'], '|', r['heard'])


def find_span(words, target, spell, near):
    """Best run of words spelling `target`; ties go to the one nearest `near`."""
    raws = [w['w'] for w in words]
    chars = to_chars(raws, spell)
    best = None
    for i in range(len(words)):
        if not chars[i] or (spell and not letterish(raws[i])):
            continue
        acc, junk = '', 0
        for j in range(i, min(i + 40, len(words))):
            if spell and not letterish(raws[j]):
                junk += 1
                if junk > 2:
                    break
                continue
            acc += chars[j]
            if len(acc) > len(target) * 1.35 + 1:
                break
            if chars[j] and close_enough(acc, target, spell):
                score = (SequenceMatcher(None, acc, target).ratio(), -abs(words[i]['s'] - near))
                if not best or score > best[0]:
                    best = (score, i, j)
    return (best[1], best[2]) if best else None


def name_runs(raws, target, upto=None, min_ratio=0.7):
    """(k, k_end, ratio) for each run of 1–3 spoken (not spelled) words that sounds like `target`."""
    upto = len(raws) if upto is None else upto
    for k in range(upto - 1, -1, -1):
        for n in range(1, 4):
            if k + n > upto:
                break
            run = raws[k:k + n]
            if any(len(norm(w)) <= 1 or (letterish(w) and '-' in w) for w in run):
                break
            r = SequenceMatcher(None, ''.join(norm(w) for w in run), target).ratio()
            if r >= min_ratio:
                yield k, k + n - 1, r


def find_name(words, i, target):
    """The name said closest before the spelling at words[i] (within 40 s)."""
    raws = [w['w'] for w in words]
    for k, ke, _ in name_runs(raws, target, i):
        if words[i]['s'] - words[ke]['e'] > 40:
            return None
        return k, ke
    return None


def heard_name(raws, target, min_ratio=0.7):
    return any(True for _ in name_runs(raws, target, None, min_ratio))


def rms_track(x):
    n = len(x) // HOP
    if not n:
        return np.zeros(1)
    e = np.sqrt(np.mean(x[:n * HOP].reshape(n, HOP) ** 2, axis=1))
    return np.convolve(e, np.ones(3) / 3, 'same')


def snap(rms, t0, s, e, lo, hi):
    """Cut points (seconds) at the silence around [s, e], never past lo / hi."""
    fr = lambda t: int(round((t - t0) * 100))
    inside = rms[max(0, fr(s)):max(fr(s) + 1, fr(e))]
    peak = float(np.percentile(inside, 95)) if len(inside) else float(rms.max())
    floor = float(np.percentile(rms, 8))
    thr = floor + 0.07 * max(peak - floor, 1e-6)

    a_min, a_max = max(fr(max(s - 0.45, lo)), 0), min(fr(s + 0.07), len(rms) - 1)
    start, run = None, 0
    for f in range(a_max, a_min - 1, -1):
        run = run + 1 if rms[f] < thr else 0
        if run >= 6:
            start = f + run - 2  # keep ~20 ms of the quiet before the onset
            break
    if start is None and a_max > a_min:
        lo2 = max(fr(max(s - 0.3, lo)), 0)  # connected speech: the deepest dip
        start = lo2 + int(np.argmin(rms[lo2:a_max + 1]))

    b_min, b_max = max(fr(e - 0.07), 0), min(fr(min(e + 0.55, hi)), len(rms) - 1)
    end, run = None, 0
    for f in range(b_min, b_max + 1):
        run = run + 1 if rms[f] < thr else 0
        if run >= 10:
            end = f - run + 6  # final stops: keep the closure + release
            break
    if end is None and b_max > b_min:
        hi2 = min(fr(min(e + 0.3, hi)), len(rms) - 1)
        end = b_min + int(np.argmin(rms[b_min:hi2 + 1]))

    start_t = t0 + (start if start is not None else fr(s)) / 100
    end_t = t0 + (end if end is not None else fr(e)) / 100
    fp = max(peak, 1e-6)
    edge = lambda t: float(rms[min(max(fr(t), 0), len(rms) - 1)] / fp)
    return start_t, end_t, edge(start_t), edge(end_t)


def decode(path):
    c = av.open(path)
    r16 = av.AudioResampler('flt', 'mono', SR)
    r44 = av.AudioResampler('flt', 'mono', OUT_SR)
    a, b = [], []
    for fr in c.decode(audio=0):
        for f in r16.resample(fr):
            a.append(f.to_ndarray()[0].copy())
        for f in r44.resample(fr):
            b.append(f.to_ndarray()[0].copy())
    c.close()
    return np.concatenate(a), np.concatenate(b)


def write_mp3(path, x):
    c = av.open(path, 'w', format='mp3')
    st = c.add_stream('libmp3lame', rate=OUT_SR)
    st.bit_rate = 96000
    st.layout = 'mono'
    pts = 0
    for i in range(0, len(x), 1152):
        part = x[i:i + 1152]
        f = av.AudioFrame.from_ndarray(part.reshape(1, -1), format='fltp', layout='mono')
        f.sample_rate, f.pts = OUT_SR, pts
        pts += len(part)
        for p in st.encode(f):
            c.mux(p)
    for p in st.encode(None):
        c.mux(p)
    c.close()


def asr(model, x, prompt=None):
    segs, _ = model.transcribe(x, language='en', beam_size=5, word_timestamps=True, vad_filter=False,
                               condition_on_previous_text=False, initial_prompt=prompt, temperature=0)
    return [{'w': w.word.strip(), 's': w.start, 'e': w.end} for s in segs for w in (s.words or []) if w.word.strip()]


def process(model, it, pcm16, pcm44, outdir):
    spell = it['kind'] == 'spell'
    target = it['target']
    t0 = max(0, it['winStart'])
    x = pcm16[int(t0 * SR):int(it['winEnd'] * SR)]
    if len(x) < SR // 2:
        return {'status': 'no-audio'}
    nw = (it.get('parts') or {}).get('nameWord')
    # the name in the hint too, or Whisper writes "Hi Aidan" for "Kaeden", "A-N-U-BOT" for "Anu Bhatt"
    prompt = ((f"{nw}. " if nw else '') + 'Spelling: ' + '-'.join(target) + '.') if spell else f"{it['answer']}."
    words, span = [], None
    # the hint helps, but can also make Whisper skip audio: retry without, then wider
    for pad_s, hint in ((0, prompt), (0, None), (6, prompt)):
        t0 = max(0, it['winStart'] - pad_s)
        x = pcm16[int(t0 * SR):int((it['winEnd'] + pad_s) * SR)]
        words = asr(model, x, hint)
        for w in words:
            w['s'] += t0
            w['e'] += t0
        span = find_span(words, target, spell, it['near'])
        if span:
            break
    if not span:
        return {'status': 'not-found', 'asr': ' '.join(w['w'] for w in words)[:160]}
    i, j = span
    if not spell:  # "15 percent", "£20 million": the unit belongs to the number
        while j + 1 < len(words) and norm(words[j + 1]['w']) in TRAILING_UNIT:
            j += 1
    # a fuzzy match can stop a digit / letter short: take the next one if it is right there
    chars = to_chars([w['w'] for w in words], spell)
    got = sum(len(c) for c in chars[i:j + 1])
    while got < len(target) and j + 1 < len(words) and words[j + 1]['s'] - words[j]['e'] < 0.8 and chars[j + 1]             and (letterish(words[j + 1]['w']) if spell else chars[j + 1].isdigit()):
        j += 1
        got += len(chars[j])
    first, last = i, j
    has_name = has_repeat = False
    name_cut = None  # (start, end) of a name said further back, joined on before the spelling
    if spell:
        # The student hears the whole name first, then its spelling.
        if not it.get('nameTarget'):
            return {'status': 'no-name'}
        nk = find_name(words, i, it['nameTarget'])
        if nk is None:
            return {'status': 'name-not-found', 'asr': ' '.join(w['w'] for w in words[max(0, i - 25):i])[-160:]}
        k, ke = nk
        if words[i]['s'] - words[ke]['e'] <= 3.5 and i - ke - 1 <= 4:
            first, has_name = k, True  # "Quigley. That's Q-U-…": one clip
        else:
            lo_n = (words[k - 1]['s'] + words[k - 1]['e']) / 2 if k else t0
            hi_n = (words[ke + 1]['s'] + words[ke + 1]['e']) / 2
            ns, ne, nes, nee = snap(rms_track(x), t0, words[k]['s'], words[ke]['e'], lo_n, hi_n)
            pre = (it.get('parts') or {}).get('namePrefix')
            if nes > 0.45 and pre and k and SequenceMatcher(None, norm(words[k - 1]['w']), norm(pre)).ratio() >= 0.7:
                # "Samira Manuja": no pause between first name and surname — take both
                lo_p = (words[k - 2]['s'] + words[k - 2]['e']) / 2 if k > 1 else t0
                ps, _, pes, _ = snap(rms_track(x), t0, words[k - 1]['s'], words[ke]['e'], lo_p, hi_n)
                if pes <= 0.45:
                    ns, nes, k = ps, pes, k - 1
                    it = {**it, 'parts': {**it['parts'], 'nameWord': f"{pre} {it['parts']['nameWord']}"}}
            if max(nes, nee) > 0.45 or ne - ns < 0.2:
                return {'status': 'name-cut-in-speech', 'edges': [round(nes, 2), round(nee, 2)]}
            name_cut = (ns, ne)
    if it.get('hasRepeat'):
        rest = [w for w in words[j + 1:] if w['s'] - words[j]['e'] <= 5]
        sp = find_span(rest, target, spell, words[j]['e']) if rest else None
        if sp:
            last, has_repeat = j + 1 + sp[1], True
    s, e = words[first]['s'], words[last]['e']
    if e - s > 15:
        return {'status': 'too-long', 'dur': round(e - s, 1)}
    rms = rms_track(x)
    # Whisper's word edges are approximate: the neighbours' midpoints are the real limits
    lo = (words[first - 1]['s'] + words[first - 1]['e']) / 2 if first else t0
    hi = (words[last + 1]['s'] + words[last + 1]['e']) / 2 if last + 1 < len(words) else t0 + len(x) / SR
    cs, ce, es, ee = snap(rms, t0, s, e, lo, hi)
    if ce - cs < 0.25:
        return {'status': 'too-short'}
    if max(es, ee) > 0.45:
        return {'status': 'cut-in-speech', 'edges': [round(es, 2), round(ee, 2)], 'asr': ' '.join(w['w'] for w in words[first:last + 1])[:100]}

    parts = it['parts']
    name_text = parts.get('name') if has_name else ((parts.get('nameWord') or '') + '.' if name_cut else None)
    text = ' '.join(p for p in [name_text, parts['core'], parts.get('repeat') if has_repeat else None] if p)
    name16 = None
    if name_cut:
        # the name on its own must be heard as the name, with nothing else in it
        name16 = pcm16[int(name_cut[0] * SR):int(name_cut[1] * SR)]
        pad = np.zeros(int(0.3 * SR), dtype=name16.dtype)
        name_ok = False
        for hint in (None, (parts.get('nameWord') or '') + '.'):
            nh = [w['w'] for w in asr(model, np.concatenate([pad, name16, pad]), hint)]
            nn = ''.join(norm(w) for w in nh)
            want = norm(parts.get('nameWord') or '') or it['nameTarget']
            if nn and SequenceMatcher(None, nn, want).ratio() >= 0.7 and len(nn) <= len(want) * 1.3 + 1:
                name_ok = True
                break
        if not name_ok:
            return {'status': 'name-not-heard', 'heard': ' '.join(nh), 'text': text}
    said_words = [norm(w) for w in re.split(r'[\s-]+', text) if norm(w)]

    def is_extra(raw, nxt=None):
        w = norm(raw)
        if not w:
            return False
        # a word cut off at the clip edge ("per...", "f -"); "per" only belongs in "per cent"
        if re.search(r'[-–]\s*$|\.\.\.$|…$', raw.strip()) and not (spell and letterish(raw)) and not re.search(r'\d', w):
            return True
        if w == 'PER' and not (nxt and norm(nxt) in ('CENT', 'CENTS')):
            return True
        if len(w) == 1 and not spell and w.isalpha() and w not in target and w not in ('A', 'O'):
            return True
        if len(w) == 1 or re.search(r'\d', w) or w in UNITS or w in TENS or w in SCALE or w in DROP or w in ('DOUBLE', 'TRIPLE'):
            return False
        return not any(SequenceMatcher(None, w, t).ratio() >= 0.7 for t in said_words)

    n = len(target)
    PAD = 0.3
    needs_unit = not spell and bool(re.search(r'[£$€%]', it['answer']))
    unit_widened = False
    attempt = -1
    widened = trimmed = False
    while True:
        attempt += 1
        if attempt > 3:
            return {'status': 'unstable', 'text': text}
        clip16 = pcm16[int(cs * SR):int(ce * SR)]
        pad = np.zeros(int(PAD * SR), dtype=clip16.dtype)
        audio = np.concatenate([pad, clip16, pad])
        # Second try with a generic format hint (never the answer itself): bare
        # digit strings and letter runs are what Whisper handles worst out of context.
        for hint in (None, 'It is spelled S-M-I-T-H.' if spell else 'The number is 0161 496 0123.'):
            heard = asr(model, audio, hint)
            h_raw = [w['w'] for w in heard]
            pool = ''.join(to_chars(h_raw, spell))
            found = target in pool or any(close_enough(pool[a:a + m], target, spell)
                                          for m in range(max(1, n - 2), n + 3)
                                          for a in range(0, max(1, len(pool) - m + 1)))
            if found:
                break
        said = ' '.join(h_raw)[:120]
        if not found:
            return {'status': 'not-heard', 'heard': said, 'text': text, 'cut': [round(cs, 2), round(ce, 2)]}
        # The first / last digit or letter must be heard: a fuzzy match would
        # otherwise pass a clip that lost it. Open the cut once, then give up.
        head_ok, tail_ok = edges_heard(pool, target)
        if not (head_ok and tail_ok):
            if widened:
                return {'status': 'edge-missing', 'heard': said, 'text': text, 'cut': [round(cs, 2), round(ce, 2)]}
            widened = True
            a_s, a_e, es2, ee2 = snap(rms, t0, cs - 0.3 if not head_ok else cs, ce + 0.3 if not tail_ok else ce,
                                      cs - 0.6, ce + 0.6)
            cs, es = (a_s, es2) if not head_ok else (cs, es)
            ce, ee = (a_e, ee2) if not tail_ok else (ce, ee)
            if max(es, ee) > 0.45:
                return {'status': 'cut-in-speech', 'edges': [round(es, 2), round(ee, 2)], 'asr': said}
            continue
        # The name was located with a hint; it must be heard in the clip too
        # (a spelling with no name before it is not a usable drill).
        if has_name and not heard_name(h_raw, it['nameTarget']):
            return {'status': 'name-not-heard', 'heard': said, 'text': text}
        # a neighbouring word caught at either edge ("is 45", "just $500"): trim it once
        heard = [w for w in heard if norm(w['w'])]  # a lone "-" / "," is not a word
        nxt_w = lambda k: heard[k]['w'] if k < len(heard) else None
        head = 0
        while head < len(heard) and is_extra(heard[head]['w'], nxt_w(head + 1)):
            head += 1
        tail = len(heard)
        while tail > head and is_extra(heard[tail - 1]['w'], nxt_w(tail)):
            tail -= 1
        if head == 0 and tail == len(heard):
            # "£35" / "65%": the clip must still have the "pounds" / "percent" in it
            if needs_unit and not unit_heard(h_raw):
                if unit_widened:
                    return {'status': 'no-unit', 'heard': said, 'text': text}
                unit_widened = True
                nxt = next((w for w in words if w['s'] >= ce - 0.05), None)
                if nxt and norm(nxt['w']) in UNIT_SAID:
                    k2 = words.index(nxt)
                    goal = nxt['e']
                    lim = (words[k2 + 1]['s'] + words[k2 + 1]['e']) / 2 if k2 + 1 < len(words) else goal + 0.6
                else:
                    goal = ce + 0.45
                    lim = (nxt['s'] + nxt['e']) / 2 if nxt else ce + 0.8
                _, a_e, _, ee2 = snap(rms, t0, cs, max(goal, ce + 0.1), ce - 0.05, max(lim, ce + 0.15))
                if ee2 > 0.45 or a_e <= ce + 0.02:
                    return {'status': 'no-unit', 'heard': said, 'text': text}
                ce, ee = a_e, ee2
                continue
            break
        if trimmed or head >= tail:
            return {'status': 'extra-edge', 'heard': said, 'text': text}
        trimmed = True
        at = lambda v: cs + max(0.0, v - PAD)
        new_s, new_e, new_lo, new_hi = cs, ce, cs, ce
        if head:
            new_lo = at((heard[head - 1]['s'] + heard[head - 1]['e']) / 2)
            new_s = at(heard[head]['s'])
        if tail < len(heard):
            new_hi = at((heard[tail]['s'] + heard[tail]['e']) / 2)
            new_e = at(heard[tail - 1]['e'])
        a_s, a_e, es2, ee2 = snap(rms, t0, new_s, new_e, new_lo, new_hi)
        cs, es = (a_s, es2) if head else (cs, es)
        ce, ee = (a_e, ee2) if tail < len(heard) else (ce, ee)
        if ce - cs < 0.25 or max(es, ee) > 0.45:
            return {'status': 'cut-in-speech', 'edges': [round(es, 2), round(ee, 2)], 'asr': said}
    if len(pool) > len(norm(text)) * 1.4 + 5:
        return {'status': 'extra-speech', 'heard': said, 'text': text}

    def piece(a, b):
        p = pcm44[int(a * OUT_SR):int(b * OUT_SR)].copy()
        f = int(FADE * OUT_SR)
        p[:f] *= np.linspace(0, 1, f, dtype=p.dtype)
        p[-f:] *= np.linspace(1, 0, f, dtype=p.dtype)
        return p

    seg = piece(cs, ce)
    if name_cut:  # the name, a short pause, then its spelling
        seg = np.concatenate([piece(*name_cut), np.zeros(int(NAME_GAP * OUT_SR), seg.dtype), seg])
    seg = np.concatenate([np.zeros(int(LEAD * OUT_SR), seg.dtype), seg, np.zeros(int(TAIL * OUT_SR), seg.dtype)])
    peak = float(np.abs(seg).max())
    if peak > 0:
        seg = seg * min(0.89 / peak, 4.0)
    nk = f"|{name_cut[0]:.2f}" if name_cut else ''
    name = hashlib.sha1(f"{it['key']}|{cs:.2f}|{ce:.2f}{nk}".encode()).hexdigest()[:16] + '.mp3'
    write_mp3(os.path.join(outdir, 'clips', name), seg)
    return {'status': 'ok', 'file': name, 'dur': round(len(seg) / OUT_SR, 2), 'cut': [round(cs, 2), round(ce, 2)],
            'edges': [round(es, 2), round(ee, 2)], 'hasName': has_name or bool(name_cut), 'nameCut': [round(v, 2) for v in name_cut] if name_cut else None,
            'hasRepeat': has_repeat,
            'text': text, 'heard': said}


def verify(outdir, model_name):
    """Second, stronger ear over every clip that passed: a bigger Whisper,
    no hint, must hear EXACTLY the answer — every digit / letter (a fuzzy
    match let clips with a lost or extra digit through), the unit of a price
    or percent, the name before a spelling — and nothing cut off at the end.
    A failed clip gets status 'verify-failed' (kept in results.jsonl).
    A big model on CPU costs the same for 3 s as for 30 s of audio, so clips
    are first heard ~5 at a time (silence between); a clip that fails there
    is heard again on its own (no hint, then a format hint) before failing."""
    items = {i['key']: i for i in json.load(open(os.path.join(outdir, 'candidates.json'), encoding='utf8'))}
    path = os.path.join(outdir, 'results.jsonl')
    rows = [json.loads(l) for l in open(path, encoding='utf8') if l.strip()]
    model = load_model(model_name)
    todo = [r for r in rows if r.get('status') == 'ok' and r['key'] in items and r.get('verified') != model_name]
    print(f'verify: {len(todo)} clips with {model_name}', flush=True)
    GAP, WIN = 1.5, 27.0

    def save():
        with open(path, 'w', encoding='utf8') as f:
            f.writelines(json.dumps(x, ensure_ascii=False) + '\n' for x in rows)

    def settle(r, raws, why):
        it = items[r['key']]
        r['verifyHeard'] = ' '.join(raws)[:160]
        if why:
            r['status'], r['verifyWhy'] = 'verify-failed', why
            print(f"  x {it['answer']:<22} {why:<12} | {r['verifyHeard']}", flush=True)
        else:
            r['verified'] = model_name
            r.pop('verifyWhy', None)

    pcm = {r['key']: decode(os.path.join(outdir, 'clips', r['file']))[0] for r in todo}
    k = 0
    while k < len(todo):
        batch, total = [], GAP
        while k < len(todo) and (not batch or total + len(pcm[todo[k]['key']]) / SR + GAP <= WIN):
            batch.append(todo[k])
            total += len(pcm[todo[k]['key']]) / SR + GAP
            k += 1
        sil = np.zeros(int(GAP * SR), dtype=np.float32)
        parts, spans, t = [sil], [], GAP
        for r in batch:
            x = pcm[r['key']]
            spans.append((t, t + len(x) / SR))
            parts += [x, sil]
            t += len(x) / SR + GAP
        words = asr(model, np.concatenate(parts))
        for r, (a, b) in zip(batch, spans):
            it = items[r['key']]
            spell = it['kind'] == 'spell'
            raws = [w['w'] for w in words if a - 0.4 <= w['s'] < b + 0.6]
            why = check_heard(raws, it, spell)
            if why:  # on its own, then with a format hint
                pad = np.zeros(int(0.3 * SR), dtype=np.float32)
                audio = np.concatenate([pad, pcm[r['key']], pad])
                for hint in (None, 'It is spelled S-M-I-T-H.' if spell else 'The number is 0161 496 0123.'):
                    raws = [w['w'] for w in asr(model, audio, hint)]
                    why = check_heard(raws, it, spell)
                    if not why:
                        break
            settle(r, raws, why)
        save()
        print(f'  [{k}/{len(todo)}]', flush=True)
    bad = sum(1 for r in todo if r['status'] != 'ok')
    print(f'verify: {len(todo) - bad} ok, {bad} failed')


def check_heard(raws, it, spell):
    """None when `raws` (what Whisper heard in the clip) is the item exactly; else why not."""
    target = it['target']
    if spell:
        # the spelled letters, in one run, exactly
        runs, cur = [], []
        for w in raws:
            if letterish(w) and not (len(norm(w)) >= 3 and '-' not in w and norm(w) == it.get('nameTarget')):
                cur.append(w)
            else:
                if cur:
                    runs.append(cur)
                cur = []
        if cur:
            runs.append(cur)
        pools = [''.join(to_chars(rn, True)) for rn in runs]
        if not any(target in p for p in pools):
            return 'letters'
        first = next(k for k, w in enumerate(raws) if letterish(w) and target[0] in norm(w))
        # looser than the cut pass: Whisper mangles odd names ("Karaniski", "Yesovsky");
        # what this must catch is a clip with NO name before the letters ("That's Q-U-…")
        if it.get('nameTarget') and not heard_name(raws[:first], it['nameTarget'], 0.5):
            return 'no-name'
        return None
    chars = to_chars(raws, False)
    pool = ''.join(chars)
    if it['kind'] == 'address':
        # "13 Polworth Road": the house number exactly, the street name close enough
        num = re.match(r'\d+[A-Z]?', target).group(0)
        if not re.match(num + r'(?!\d)', pool) and not re.search(r'(?<!\d)' + num + r'(?!\d)', pool):
            return 'digits'
        if not close_enough(pool[pool.find(num):], target, True) and SequenceMatcher(None, pool, target).ratio() < 0.8:
            return 'street'
        return None
    if target not in pool:
        return 'digits'
    if re.search(r'[£$€%]', it['answer']) and not unit_heard(raws):
        return 'no-unit'
    if raws and re.search(r'[-–]\s*$|\.\.\.$|…$', raws[-1].strip()):
        return 'cut-off-end'
    rest = pool.replace(target, '', 1)
    rest = re.sub(r'(POUNDS?|PENCE|DOLLARS?|CENTS?|EUROS?|PERCENT|MILLION|THOUSAND)', '', rest)
    said = norm(' '.join(p for p in it['parts'].values() if p))
    if re.search(r'\d', rest) or any(c.isalpha() and c not in said for c in rest):
        return 'extra'
    return None


def load_model(name):
    root = os.environ.get('WHISPER_ROOT')  # e.g. D:/hf-cache/hub for models kept off C:
    return WhisperModel(name, device='cpu', compute_type='int8', cpu_threads=int(os.environ.get('ASR_THREADS', 8)),
                        **({'download_root': root} if root else {}))


def main():
    outdir = sys.argv[1]
    if '--recheck' in sys.argv:
        recheck(outdir)
        return
    if '--verify' in sys.argv:
        rest = [a for a in sys.argv[2:] if not a.startswith('--')]
        verify(outdir, rest[0] if rest else 'large-v3-turbo')
        return
    model_name = sys.argv[2] if len(sys.argv) > 2 else 'small.en'
    limit = int(os.environ.get('CLIP_LIMIT', 0))
    os.makedirs(os.path.join(outdir, 'clips'), exist_ok=True)
    items = json.load(open(os.path.join(outdir, 'candidates.json'), encoding='utf8'))
    res_path = os.path.join(outdir, 'results.jsonl')
    done = set()
    if os.path.exists(res_path):
        done = {json.loads(l)['key'] for l in open(res_path, encoding='utf8') if l.strip()}
    by_url = {}
    for it in items:
        if it['key'] not in done:
            by_url.setdefault(it['audioUrl'], []).append(it)
    print(f'{sum(map(len, by_url.values()))} clips in {len(by_url)} files ({len(done)} done)', flush=True)
    model = load_model(model_name)
    tmp = os.path.join(outdir, '_audio.mp3')
    count = 0
    with open(res_path, 'a', encoding='utf8') as out:
        for n, (url, group) in enumerate(by_url.items(), 1):
            if limit and count >= limit:
                break
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=180) as r, open(tmp, 'wb') as f:
                    f.write(r.read())
                pcm16, pcm44 = decode(tmp)
            except Exception as ex:
                print(f'[{n}] AUDIO FAILED {url}: {ex}', flush=True)
                for it in group:
                    out.write(json.dumps({'key': it['key'], 'answer': it['answer'], 'kind': it['kind'], 'status': 'audio-error'}) + '\n')
                out.flush()
                continue
            for it in group:
                try:
                    r = process(model, it, pcm16, pcm44, outdir)
                except Exception as ex:
                    r = {'status': 'error', 'error': str(ex)[:200]}
                out.write(json.dumps({'key': it['key'], 'answer': it['answer'], 'kind': it['kind'], **r}, ensure_ascii=False) + '\n')
                out.flush()
                count += 1
            print(f'[{n}/{len(by_url)}] {len(group)} clips', flush=True)
    if os.path.exists(tmp):
        os.remove(tmp)


if __name__ == '__main__':
    main()
