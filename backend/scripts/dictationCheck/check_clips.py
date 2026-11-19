# Re-transcribe each dictation sentence's exact clip [start,end] → results.jsonl
import sys, os, json, urllib.request
import numpy as np, av
from faster_whisper import WhisperModel
SR = 16000
out_dir = sys.argv[1]; worker = int(sys.argv[2]); nworkers = int(sys.argv[3])
jobs = json.load(open(os.path.join(out_dir, 'jobs.json'), encoding='utf8'))
res = os.path.join(out_dir, f'results_{worker}.jsonl')
done = set()
if os.path.exists(res):
    done = {json.loads(l)['id'] for l in open(res, encoding='utf8') if l.strip()}
model = WhisperModel(os.environ.get('MODEL', 'base.en'), device='cpu', compute_type='int8', cpu_threads=int(os.environ.get('ASR_THREADS', 6)))
def decode(path):
    c = av.open(path); r = av.AudioResampler('flt', 'mono', SR); a = []
    for fr in c.decode(audio=0):
        for f in r.resample(fr): a.append(f.to_ndarray()[0].copy())
    c.close(); return np.concatenate(a)
tmp = os.path.join(out_dir, f'_a{worker}.mp3')
with open(res, 'a', encoding='utf8') as out:
    for n, j in enumerate(jobs):
        if n % nworkers != worker or j['id'] in done: continue
        try:
            req = urllib.request.Request(j['audioUrl'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=180) as r, open(tmp, 'wb') as f: f.write(r.read())
            pcm = decode(tmp)
        except Exception as ex:
            out.write(json.dumps({'id': j['id'], 'error': str(ex)[:200]}) + '\n'); out.flush(); continue
        rows = []
        for s in j['sents']:
            x = pcm[int(s['start'] * SR):int(s['end'] * SR)]
            if len(x) < SR // 5: rows.append({'i': s['i'], 'heard': ''}); continue
            segs, _ = model.transcribe(x, language='en', beam_size=int(os.environ.get('BEAM', 5)), vad_filter=False, condition_on_previous_text=False, temperature=0, without_timestamps=True)
            rows.append({'i': s['i'], 'heard': ' '.join(sg.text.strip() for sg in segs)})
        out.write(json.dumps({'id': j['id'], 'rows': rows}, ensure_ascii=False) + '\n'); out.flush()
        print(f'[{worker}] {n+1}/{len(jobs)} {j["title"]}', flush=True)
