# READ-ONLY: show each phrase in context inside a saved web page (online copy of a Vol passage), to settle a word the PDF
# garbled.   py -I webgrep.py <page.html> "<phrase>" ["<phrase>" …]   (case-insensitive; ctx 120 chars)
import re, sys, html
sys.stdout.reconfigure(encoding='utf-8')
t = open(sys.argv[1], encoding='utf8', errors='ignore').read()
t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
for k in sys.argv[2:]:
    ms = list(re.finditer(re.escape(k), t, re.I))
    print(f'== {k}: {len(ms)}')
    for m in ms[:3]: print('  …' + t[max(0, m.start() - 120):m.end() + 120] + '…')
