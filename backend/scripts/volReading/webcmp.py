# READ-ONLY: cut the passage text out of a saved web page (an online copy of a Vol passage) so wdiff.js can compare it with
# the spec text. Start = the spec's first words, end = its last words (both searched loosely in the page text).
#   py webcmp.py <spec.txt> <page.html> <out.txt>
import re, sys, html
spec, page, out = sys.argv[1:4]
raw = open(page, encoding='utf8', errors='ignore').read()
raw = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', raw, flags=re.S)
txt = html.unescape(re.sub(r'<[^>]+>', ' ', raw))
txt = re.sub(r'\s+', ' ', txt)
body = [l for l in open(spec, encoding='utf8').read().split('\n\n') if l.strip() and not l.startswith('#') and not l.startswith('*')]
words = lambda s: re.findall(r"[A-Za-z0-9]+", s)
def find(ws, from_end=False):
    pat = r'\W+'.join(map(re.escape, ws))
    ms = list(re.finditer(pat, txt, flags=re.I))
    if not ms: return None
    return ms[-1] if from_end else ms[0]
first = words(re.sub(r'^[A-J]\.?\s+', '', body[0]))
last = words(body[-1])
s = None
for n in (8, 6, 4):
    s = find(first[:n])
    if s: break
e = None
for n in (8, 6, 4):
    e = find(last[-n:], True)
    if e: break
if not s or not e or e.end() <= s.start():
    print('NOT FOUND', bool(s), bool(e)); sys.exit(1)
open(out, 'w', encoding='utf8').write(txt[s.start():e.end()])
print('ok', e.end() - s.start(), 'chars')
