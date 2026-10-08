# Pitch track of an audio file (autocorrelation, numpy only): prints JSON [f0 Hz or 0 per 10 ms frame].
#   py f0.py <audio> <ffmpeg>
import sys, json, subprocess
import numpy as np

src, ff = sys.argv[1], sys.argv[2]
sr = 16000
raw = subprocess.run([ff, '-loglevel', 'error', '-i', src, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
hop, win = sr // 100, int(sr * 0.04)
lo, hi = sr // 400, sr // 70  # lags for 400 Hz … 70 Hz
rms_all = np.sqrt(np.mean(x ** 2)) + 1e-9
out = []
for i in range(0, max(0, len(x) - win), hop):
    f = x[i:i + win] - np.mean(x[i:i + win])
    if np.sqrt(np.mean(f ** 2)) < 0.5 * rms_all:
        out.append(0); continue
    spec = np.fft.rfft(f, 2 * win)
    ac = np.fft.irfft(spec * np.conj(spec))[:win]
    if ac[0] <= 0:
        out.append(0); continue
    ac = ac / ac[0]
    k = lo + int(np.argmax(ac[lo:hi]))
    out.append(round(sr / k) if ac[k] > 0.5 else 0)
print(json.dumps(out))
