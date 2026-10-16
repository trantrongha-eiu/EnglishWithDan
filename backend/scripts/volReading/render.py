# Render every page of each VOL test PDF → web/vol<V>/pages/t<T>_p<k>.png (to read scanned Reading pages by eye / OCR)
#   py render.py <vol> [dpi]
import sys, os, glob, re
import pymupdf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
vol, dpi = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 150
src = next(d for d in glob.glob(os.path.join(ROOT, f'VOL {vol}*ORIGINAL EXAMS*')) if os.path.isdir(d))
out = os.path.join(os.path.dirname(__file__), 'web', f'vol{vol}', 'pages')
os.makedirs(out, exist_ok=True)
for p in glob.glob(os.path.join(src, '**', '*.pdf'), recursive=True):
    m = re.search(r'test\s*(\d+)', os.path.basename(os.path.dirname(p)), re.I)
    if not m: print('skip', p); continue
    doc = pymupdf.open(p)
    for i, page in enumerate(doc):
        page.get_pixmap(dpi=dpi).save(os.path.join(out, f't{m.group(1)}_p{i + 1}.png'))
    print(p, len(doc), doc[0].rect)
