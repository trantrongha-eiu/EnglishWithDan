# Mindset 2 authoring tool: pull reading passages / audioscripts out of the
# Level 2 PDF's OCR text layer into m2/text/<name>.txt, so unit files can
# read the book text from disk.
#
#   py scripts/mindset/m2/_extract.py            # every entry in texts.json
#   py scripts/mindset/m2/_extract.py u01-antilia  # one entry
#
# texts.json entries:
#   passage: { "name", "kind": "passage", "page", "title", "clips": [[x0,y0,x1,y1],…] (PDF points, read in order),
#              "paras": [[letter, missingFirstLine | "", anchor]] (anchor = first words of the OCR'd rest of the paragraph),
#              "fix": [[from, to], …] }
#   script:  { "name", "kind": "script", "pages": [a, b], "start": anchor, "end": anchor | "", "fix": [...] }
import json, os, re, sys
import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, '..', '..', '..', '..', 'Mindset curriculum', 'Mindset_for_IELTS_Level_2_Reading_Listening (2).pdf')
OUT = os.path.join(HERE, 'text')

def junk(line):
    s = line.strip()
    if not s:
        return True
    # OCR noise = lots of characters that never occur in the book's prose
    # (a short line like "B: It's 110 m by 55 m." is real text).
    odd = sum(not (c.isalnum() or c in " .,'’‘\"“”?!:;()£%&/-–—*") for c in s)
    alnum = sum(c.isalnum() for c in s)
    return (odd / len(s) > 0.2 or alnum / len(s) < 0.35 or s.count('_') >= 3
            or re.fullmatch(r'[\W\d_]{0,6}', s) is not None
            or re.fullmatch(r'\d+(\s*&\s*\d+)?\s+[^A-Za-z]*[A-Za-z]?[^A-Za-z]*\d{2,3}', s) is not None)  # "12 :i 28" track marker

# OCR misreads of "l" as "t" in this scan (never real words in these scripts).
COMMON = {'tong': 'long', 'sate': 'sale', 'sates': 'sales', 'wilt': 'will', 'welt': 'well', 'atl': 'all',
          'Tong': 'Long', 'tittle': 'little', 'toad': 'load', 'alt': 'all', 'tot': 'lot', 'stilt': 'still', 'shalt': 'shall', 'realty': 'really'}
GLOBAL = [('Leth bridge', 'Lethbridge')]

def apply_fix(text, fixes):
    text = re.sub(r'\b(' + '|'.join(COMMON) + r')\b', lambda m: COMMON[m.group(1)], text)
    text = text.replace('­ ', ' – ').replace('­', '')
    text = re.sub(r'(?<=\s)l(?=\s)', 'I', text)  # lone "l" = "I"
    text = text.replace('\\', '')  # OCR noise ("we\\ and"); never real text in the book
    for a, b in GLOBAL:
        text = text.replace(a, b)
    for a, b in fixes:
        if a not in text:
            raise SystemExit('fix not found: ' + a)
        text = text.replace(a, b)
    return text

def join_lines(lines):
    out = ''
    for l in lines:
        l = l.strip()
        if not out:
            out = l
        elif out.endswith('-') and l[:1].islower():
            out += l
        else:
            out += ' ' + l
    return re.sub(r'\s+', ' ', out).strip()

def passage(doc, e):
    lines = []
    for c in e['clips']:
        page = doc[(c[4] if len(c) > 4 else e['page']) - 1]
        t = page.get_text('text', clip=fitz.Rect(*c[:4]))
        lines += [l for l in t.split('\n') if not junk(l)]
    text = join_lines(lines)
    # anchor None = a paragraph the OCR layer lost entirely; its text is given in full.
    anchored = [(k, text.find(a)) for k, (_, _, a) in enumerate(e['paras']) if a is not None]
    for k, i in anchored:
        if i < 0:
            raise SystemExit(f"{e['name']}: anchor not found: {e['paras'][k][2]}")
    starts = dict(anchored)
    order = [i for _, i in anchored]
    paras = []
    for k, (letter, first, anchor) in enumerate(e['paras']):
        if anchor is None:
            body = first
        else:
            later = [i for i in order if i > starts[k]]
            end = min(later) if later else len(text)
            rest = re.sub(r'\s+[A-Za-z]$', '', text[starts[k]:end].strip())  # next paragraph's OCR'd letter
            body = (first + ' ' if first else '') + rest
        paras.append((f'**{letter}** ' if letter else '') + body)
    out = ('## ' + e['title'] + '\n\n' if e.get('title') else '') + '\n\n'.join(paras)
    return apply_fix(out, e.get('fix', []))

SPEAKER = re.compile(r"^([A-Z][A-Za-z.' ]{0,24}|[A-Z]):\s")
HEAD = re.compile(r'^(Conversation|Recording|Speaker|Discussion|Extract|Part|Lecture|Topic)\s*\d+\b')
FOOT = re.compile(r'LISTENING SCRIPTS|^Unit\s*\d|^SPEAKING$|^LISTENING$')

def script(doc, e):
    raw = ''
    for p in range(e['pages'][0], e['pages'][1] + 1):
        raw += doc[p - 1].get_text() + '\n'
    i = raw.find(e['start'])
    if i < 0:
        raise SystemExit(f"{e['name']}: start not found")
    j = raw.find(e['end'], i + len(e['start'])) if e.get('end') else len(raw)
    if j < 0:
        raise SystemExit(f"{e['name']}: end not found")
    out = []
    prev = ''
    for l in raw[i:j].split('\n'):
        s = l.strip()
        if not s or FOOT.search(s) or junk(s):
            continue
        para_end = re.search(r'[.!?]["\']?$', prev) and len(prev) < 52  # short last line of a paragraph
        prev = s
        if not out or SPEAKER.match(s) or HEAD.match(s) or re.match(r'^\d{1,2}\s+[A-Z]', s) or para_end:
            out.append(s)
        elif out[-1].endswith('-') and s[:1].islower():
            out[-1] += s
        else:
            out[-1] += ' ' + s
    return apply_fix('\n'.join(out), e.get('fix', []))

def main():
    spec = json.load(open(os.path.join(HERE, 'texts.json'), encoding='utf-8'))
    only = set(sys.argv[1:])
    doc = fitz.open(PDF)
    os.makedirs(OUT, exist_ok=True)
    for e in spec:
        if only and e['name'] not in only:
            continue
        text = passage(doc, e) if e['kind'] == 'passage' else script(doc, e)
        for a, b in e.get('words', {}).items():  # whole-word OCR swaps for this text only
            text = re.sub(r'\b' + re.escape(a) + r'\b', b, text)
        with open(os.path.join(OUT, e['name'] + '.txt'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(text + '\n')
        print(e['name'], len(text.split()), 'words')

main()
