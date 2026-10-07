# Extract text from one VOL's listening files: every PDF (per page, PyMuPDF text layer) and every
# .docx transcript (word/document.xml paragraphs) → web/vol<N>/extract.json, plus page renders of
# each PDF (web/vol<N>/pages/<test>_<pdf>_p<k>.png) to read scanned pages / diagrams by eye.
#   py extract.py <volNumber>
import sys, os, json, re, zipfile, glob
import fitz  # PyMuPDF

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
vol = sys.argv[1]
src = next(d for d in glob.glob(os.path.join(ROOT, f'VOL {vol}*ORIGINAL EXAMS*')) if os.path.isdir(d))
inner = next(os.path.join(src, d) for d in os.listdir(src) if os.path.isdir(os.path.join(src, d)))
out = os.path.join(os.path.dirname(__file__), 'web', f'vol{vol}')
os.makedirs(os.path.join(out, 'pages'), exist_ok=True)

def docx_text(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf8')
    paras = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', xml, flags=re.S):
        t = ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, flags=re.S))
        t = re.sub(r'<w:tab/>', '\t', t)
        t = t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&apos;', "'")
        paras.append(t)
    return '\n'.join(paras)

res = {}
for dirpath, _, files in os.walk(inner):
    rel = os.path.relpath(dirpath, inner)
    for f in sorted(files):
        p = os.path.join(dirpath, f)
        key = os.path.join(rel, f).replace('\\', '/')
        if f.lower().endswith('.pdf'):
            doc = fitz.open(p)
            pages = []
            for i, page in enumerate(doc):
                pages.append(page.get_text())
                tag = re.sub(r'[^A-Za-z0-9]+', '_', f'{rel}_{f[:-4]}')
                page.get_pixmap(dpi=110).save(os.path.join(out, 'pages', f'{tag}_p{i + 1}.png'))
            res[key] = {'type': 'pdf', 'pages': pages}
        elif f.lower().endswith('.docx'):
            res[key] = {'type': 'docx', 'text': docx_text(p)}
        else:
            res[key] = {'type': 'audio' if re.search(r'\.(mp3|mp4|m4a|wma|wav)$', f, re.I) else 'other', 'size': os.path.getsize(p)}
json.dump({'inner': inner, 'files': res}, open(os.path.join(out, 'extract.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for k, v in res.items():
    info = f"{len(v['pages'])} pages, {sum(len(x.strip()) for x in v['pages'])} chars" if v['type'] == 'pdf' else (f"{len(v['text'])} chars" if v['type'] == 'docx' else f"{v['size'] // 1024} KB")
    print(f'{k}: {v["type"]} {info}')
