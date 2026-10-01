# Extract a mini-ielts reading page + its solution page into a neutral JSON.
# usage: py mini_extract.py <id> <slug>   -> web/mini/x_<id>.json
import sys, re, json, html, os, subprocess
from html.parser import HTMLParser

pid, slug = sys.argv[1], sys.argv[2]
D = os.path.join(os.path.dirname(__file__), 'web', 'mini')
def get(url, fn):
    fp = os.path.join(D, fn)
    if not os.path.exists(fp) or os.path.getsize(fp) < 1000:
        subprocess.run(['curl', '-sL', '-A', 'Mozilla/5.0', url, '-o', fp], check=True)
    return open(fp, encoding='utf-8', errors='replace').read()

page = get(f'https://mini-ielts.com/{pid}/reading/{slug}', f'p_{pid}.html')
sol = get(f'https://mini-ielts.com/{pid}/view-solution/reading/{slug}', f's_{pid}.html')

def clean(t):
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
    return re.sub(r'\s+', ' ', t.replace('\xa0', ' ')).strip()

# ── passage ──
a = page.find('reading-text panel'); b = page.find('class="splitter"', a)
ptxt = page[a:b]
ptxt = re.sub(r'(?s)<div class="ads.*?</ins>\s*<script>.*?</script>\s*</div>', '', ptxt)
title = clean((re.search(r'(?s)<h2>(.*?)</h2>', ptxt) or [None, ''])[1])
m = re.search(r'(?s)</h2>(.*?)</div>', ptxt)
subtitle = ''
paras = [clean(x) for x in re.findall(r'(?s)<p[^>]*>(.*?)</p>', ptxt)]
paras = [x for x in paras if x]
if len(paras) < 4:
    # some pages put the paragraphs in <ol style="list-style-type: upper-alpha"><li> (letters come from CSS),
    # in bare <div>s, or in one block split by <br> → split on any block boundary instead
    body = ptxt[ptxt.find('</h2>'):]
    body = body[body.find('</div>') + 6:] if '</div>' in body else body
    def lis(m):
        items = re.findall(r'(?s)<li[^>]*>(.*?)</li>', m.group(2))
        if 'upper-alpha' in m.group(1):
            return ''.join(f'\n@@{chr(65 + i)} {x}\n' for i, x in enumerate(items))
        return ''.join(f'\n@@{x}\n' for x in items)
    body = re.sub(r'(?s)<ol([^>]*)>(.*?)</ol>', lis, body)
    body = re.sub(r'(?i)</(p|div|li|h3|h4)>|<br\s*/?>', '\n@@', body)
    alt = [clean(x) for x in body.split('@@')]
    alt = [x for x in alt if x and x != '\xa0' and not re.fullmatch(r'<\w+', x)]  # drop a stray unclosed '<div' at the end
    if len(alt) > len(paras):
        paras = alt
imgs = re.findall(r'<img src="(https?://[^"]+)"', ptxt)

# ── questions ──
qa = page.find('exam-content panel'); qb = page.find('---End of the Test---', qa)
qhtml = page[qa:qb]
sections = []
for sec in re.split(r'<div class="exam-section">', qhtml)[1:]:
    h = re.search(r'(?s)<h2>(.*?)</h2>', sec)
    if not h: continue
    body = sec[h.end():]
    blocks = []
    for blk in re.findall(r'(?s)<(p|li|tr|h3|h4|table)[^>]*>(.*?)</\1>', body):
        raw = blk[1]
        ctrls = []
        for c in re.finditer(r"<select id='q(\d+)'[^>]*>(.*?)</select>", raw, re.S):
            ctrls.append({'kind': 'select', 'q': int(c.group(1)), 'options': re.findall(r"<option value='([^']+)'", c.group(2))})
        for c in re.finditer(r"<input type='text'[^>]*id='q(\d+)'", raw):
            ctrls.append({'kind': 'text', 'q': int(c.group(1))})
        for c in re.finditer(r"<input type='checkbox' name='q' value='(\d+)'[^>]*onchange='gcb\(this,(\d+),", raw):
            ctrls.append({'kind': 'checkbox', 'q': int(c.group(1)), 'n': int(c.group(2))})
        # newer pages: name='q7' value='A' (question number in the name, option letter in the value)
        for c in re.finditer(r"<input type='checkbox' name='q(\d+)' value='[A-Z]'[^>]*onchange='gcb\(this,(\d+),", raw):
            ctrls.append({'kind': 'checkbox', 'q': int(c.group(1)), 'n': int(c.group(2))})
        for c in re.finditer(r"<input type='radio' name='q(\d+)' value='([^']*)'", raw):
            ctrls.append({'kind': 'radio', 'q': int(c.group(1)), 'value': c.group(2)})
        # text with placeholders for text inputs / selects
        t = re.sub(r"<b>\s*\d+\s*</b>\s*(?=<(select|input))", '', raw)
        t = re.sub(r"<select id='q(\d+)'.*?</select>", r' [[Q\1]] ', t, flags=re.S)
        t = re.sub(r"<input type='text'[^>]*id='q(\d+)'[^>]*>", r' [[Q\1]] ', t)
        t = re.sub(r"<input type='(checkbox|radio)'[^>]*>(</input>)?", ' ', t)
        blocks.append({'text': clean(t), 'ctrls': ctrls})
    # diagrams / maps / pictures that belong to this question section (must be kept with the group)
    simgs = [u.replace('&amp;', '&') for u in re.findall(r'<img[^>]+src="(https?://[^"]+)"', body)]
    sections.append({'heading': clean(h.group(1)), 'blocks': [b for b in blocks if b['text'] or b['ctrls']], 'imgs': simgs})

# ── answers ──
st = clean(sol[sol.find('Answer Table'):])
answers = {}
for m in re.finditer(r'(?<!\d)(\d{1,2})\.\s+(.+?)(?=\s+\d{1,2}\.\s|\s+(?:Explanation|Please|Mini-ielts|Back|Share|Advertisement|Answer Table)|$)', st[:6000]):
    n = int(m.group(1))
    if 1 <= n <= 40 and n not in answers: answers[n] = m.group(2).strip()
json.dump({'id': pid, 'slug': slug, 'title': title, 'paras': paras, 'imgs': imgs, 'sections': sections, 'answers': answers},
          open(os.path.join(D, f'x_{pid}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(pid, title, len(paras), 'paras', sum(len(s['blocks']) for s in sections), 'blocks', len(answers), 'answers')
