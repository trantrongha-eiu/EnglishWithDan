# usage: py h2t.py file.html [start_phrase] [end_phrase]  -> paragraphs as text
import sys, re, html
raw = open(sys.argv[1], encoding='utf-8', errors='replace').read()
raw = re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ', raw)
raw = re.sub(r'(?i)<br\s*/?>', '\n', raw)
raw = re.sub(r'(?i)</(p|div|h[1-6]|li|tr|section|article)>', '\n\n', raw)
txt = html.unescape(re.sub(r'<[^>]+>', ' ', raw))
txt = re.sub(r'[ \t\xa0]+', ' ', txt)
txt = re.sub(r'\n\s*\n+', '\n\n', txt)
if len(sys.argv) > 2:
    s = txt.find(sys.argv[2]); s = 0 if s < 0 else s
    e = txt.find(sys.argv[3], s) if len(sys.argv) > 3 else -1
    txt = txt[s:e if e > 0 else s + 12000]
sys.stdout.reconfigure(encoding='utf-8')
print(txt.strip())
