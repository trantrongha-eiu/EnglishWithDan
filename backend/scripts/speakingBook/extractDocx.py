# Dump the Speaking Student's Book (.docx) to JSON, keeping what the course
# sync needs: every paragraph and table in order, each paragraph's bold runs
# marked as **bold**. Python stdlib only.
#
#   python backend/scripts/speakingBook/extractDocx.py \
#       speaking/IELTS_Speaking_StudentsBook_DanielHa_v2.docx  book.json
#
# Then: node backend/scripts/speakingBook/syncBookModels.js book.json
import json
import sys
import zipfile
from xml.etree import ElementTree as ET

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'


def run_text(r):
    t = ''
    for c in r:
        if c.tag == W + 't':
            t += c.text or ''
        elif c.tag == W + 'tab':
            t += '\t'
        elif c.tag == W + 'br':
            t += '\n'
    return t


def is_bold(r):
    rpr = r.find(W + 'rPr')
    if rpr is None:
        return False
    b = rpr.find(W + 'b')
    return b is not None and b.get(W + 'val') not in ('0', 'false')


def para_text(p):
    out = ''
    for r in p.iter(W + 'r'):
        t = run_text(r)
        if not t:
            continue
        out += ('**' + t + '**') if (is_bold(r) and t.strip()) else t
    return out.replace('****', '')


def para_style(p):
    s = p.find(W + 'pPr/' + W + 'pStyle')
    return s.get(W + 'val') if s is not None else ''


R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'


def image_names(zf, el):
    """media/imageN.ext of every picture inside a paragraph (--images)."""
    rels = getattr(image_names, 'rels', None)
    if rels is None:
        rx = ET.fromstring(zf.read('word/_rels/document.xml.rels'))
        rels = image_names.rels = {r.get('Id'): r.get('Target') for r in rx}
    return [rels.get(b.get(R + 'embed'), '') for b in el.iter(A + 'blip')]


def main(src, dst, with_images=False):
    zf = zipfile.ZipFile(src)
    root = ET.fromstring(zf.read('word/document.xml'))
    items = []
    for el in root.find(W + 'body'):
        if el.tag == W + 'p':
            t = para_text(el)
            if t.strip():
                item = {'k': 'p', 's': para_style(el), 't': t}
                jc = el.find(W + 'pPr/' + W + 'jc')
                if with_images and jc is not None and jc.get(W + 'val') == 'center':
                    item['c'] = 1  # centred = the caption under a picture
                items.append(item)
            # Pictures only on request: syncBookModels.js reads p/tbl blocks only.
            if with_images:
                for name in image_names(zf, el):
                    if name:
                        items.append({'k': 'img', 'name': name})
        elif el.tag == W + 'tbl':
            rows = []
            for tr in el.findall(W + 'tr'):
                rows.append([[para_text(p) for p in tc.findall('.//' + W + 'p') if para_text(p).strip()]
                             for tc in tr.findall(W + 'tc')])
            items.append({'k': 'tbl', 'rows': rows})
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False)
    print(f'{len(items)} blocks -> {dst}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        sys.exit('usage: extractDocx.py <book.docx> <out.json> [--images]')
    main(args[0], args[1], '--images' in sys.argv)
