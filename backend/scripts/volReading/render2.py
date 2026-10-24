# Vol 2+ layout: <VOL dir>/reading/**/*.pdf (not test folders) → web/vol<V>/pages/<stem>_p<k>.png
#   py render2.py <vol> [dpi]
# stem: a top-level file named "test N…" → tN (Vol 3: "TEST 1.pdf", "test 10 - full.pdf"); otherwise the file name without
# spaces/brackets, "_" → "x" (Vol 2: "AC_" → "ACx", "Test 1" → "Test1"); files in a subfolder get "<folder>-" in front
# (Vol 3: explain/test 1.pdf → explain-t1, key/key.pdf → key-key) so they never clash with the test files;
# a subfolder named "test N" (Vol 4) → tN.
import sys, os, glob, re
import pymupdf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
vol, dpi = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 150
src = next(d for d in glob.glob(os.path.join(ROOT, f'VOL {vol}*ORIGINAL EXAMS*')) if os.path.isdir(d))
rd = next(d for d in glob.glob(os.path.join(src, '**', 'reading'), recursive=True) if os.path.isdir(d))
out = os.path.join(os.path.dirname(__file__), 'web', f'vol{vol}', 'pages')
os.makedirs(out, exist_ok=True)
for p in sorted(glob.glob(os.path.join(rd, '**', '*.pdf'), recursive=True)):
    base = os.path.splitext(os.path.basename(p))[0]
    sub = os.path.relpath(os.path.dirname(p), rd)
    m = re.match(r'(?:test|tets)\s*(\d+)', base, re.I)
    stem = f't{m.group(1)}' if m and vol != '2' else re.sub(r'[\s()]+', '', base).replace('_', 'x')
    # Vol 4: reading/test N/<anything>.pdf → tN (the folder names the test)
    # Vol 5: reading/Test N/Explanation- N.pdf (key + explanation) → explain-tN
    if sub != '.' and re.fullmatch(r'test\s*\d+', sub, re.I):
        stem = ('explain-t' if re.match(r'expla', base, re.I) else 't') + re.search(r'\d+', sub).group(0)
    elif sub != '.': stem = re.sub(r'[\s()]+', '', sub) + '-' + stem
    doc = pymupdf.open(p)
    for i, page in enumerate(doc):
        page.get_pixmap(dpi=dpi).save(os.path.join(out, f'{stem}_p{i + 1}.png'))
    print(stem, len(doc), doc[0].rect)
