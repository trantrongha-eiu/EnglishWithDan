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


def main(src, dst):
    root = ET.fromstring(zipfile.ZipFile(src).read('word/document.xml'))
    items = []
    for el in root.find(W + 'body'):
        if el.tag == W + 'p':
            t = para_text(el)
            if t.strip():
                items.append({'k': 'p', 's': para_style(el), 't': t})
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
    if len(sys.argv) != 3:
        sys.exit('usage: extractDocx.py <book.docx> <out.json>')
    main(sys.argv[1], sys.argv[2])
