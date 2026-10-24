# Vol 6: Read/Full Reading.docx = typed copy of all 6 tests -> plain text (tables as "a | b" rows inside [TABLE]..[/TABLE])
#   py docx2txt.py <file.docx> <out.txt>
import zipfile,sys
import xml.etree.ElementTree as ET
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
z=zipfile.ZipFile(sys.argv[1]); root=ET.fromstring(z.read('word/document.xml'))
body=root.find(W+'body')
def ptext(p):
    t=''
    for e in p.iter():
        if e.tag==W+'t': t+=e.text or ''
        elif e.tag in (W+'br',W+'cr'): t+='\n'
        elif e.tag==W+'tab': t+='\t'
    return t
out=[]
def walk(el):
    for c in el:
        if c.tag==W+'p': out.append(ptext(c))
        elif c.tag==W+'tbl':
            out.append('[TABLE]')
            for tr in c.iter(W+'tr'):
                out.append(' | '.join(' / '.join(ptext(p) for p in tc.iter(W+'p')) for tc in tr.findall(W+'tc')))
            out.append('[/TABLE]')
        elif c.tag==W+'sdt': walk(c.find(W+'sdtContent'))
walk(body)
open(sys.argv[2],'w',encoding='utf8',newline='\n').write('\n'.join(out))
