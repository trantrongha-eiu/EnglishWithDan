# Word timestamps for Listening audio with local faster-whisper (CPU, no API quota).
# Reads the job list written by `node alignTranscriptTiming.js --export-jobs`
# ([{key, url}]) and writes <cache>/<key>.json = {words:[{w,s,e}], dur}.
# Already-done keys are skipped, so an interrupted run just resumes. Two workers
# can share the list: ASR_REVERSE=1 ASR_THREADS=6 for the second one.
#   py backend/scripts/transcriptTiming/asr_words.py [jobs.json] [model]
# base.en runs ~19x realtime on a 10-core laptop CPU — the text only has to be
# good enough to anchor our own verified transcript, not to be shown.
import sys, os, json, time, tempfile, urllib.request
from faster_whisper import WhisperModel

here = os.path.dirname(os.path.abspath(__file__))
cache = os.path.normpath(os.path.join(here, '..', 'data', 'transcriptAsr'))
jobs_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(cache, '_jobs.json')
model_name = sys.argv[2] if len(sys.argv) > 2 else 'base.en'
os.makedirs(cache, exist_ok=True)

jobs = json.load(open(jobs_path, encoding='utf8'))
todo = [j for j in jobs if not os.path.exists(os.path.join(cache, j['key'] + '.json'))]
print(f'{len(todo)}/{len(jobs)} to transcribe with {model_name}', flush=True)
if os.environ.get('ASR_REVERSE'):
    todo.reverse()  # second worker starts from the other end
model = WhisperModel(model_name, device='cpu', compute_type='int8',
                     cpu_threads=int(os.environ.get('ASR_THREADS', 8)))

for n, job in enumerate(todo, 1):
    out = os.path.join(cache, job['key'] + '.json')
    if os.path.exists(out):  # done by another worker meanwhile
        continue
    t0 = time.time()
    tmp = os.path.join(tempfile.gettempdir(), 'asr_' + job['key'] + '.mp3')
    try:
        req = urllib.request.Request(job['url'], headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=120) as r, open(tmp, 'wb') as f:
            f.write(r.read())
        segs, info = model.transcribe(tmp, language='en', beam_size=1, word_timestamps=True,
                                      condition_on_previous_text=False, vad_filter=True)
        words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)}
                 for s in segs for w in (s.words or []) if w.word.strip()]
        with open(out + '.tmp', 'w', encoding='utf8') as f:
            json.dump({'words': words, 'dur': round(info.duration, 2), 'model': model_name}, f)
        os.replace(out + '.tmp', out)
        print(f'[{n}/{len(todo)}] {job["key"]}: {len(words)} words, {info.duration:.0f}s audio in {time.time() - t0:.0f}s', flush=True)
    except Exception as e:
        print(f'[{n}/{len(todo)}] {job["key"]}: FAILED {e}', flush=True)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
