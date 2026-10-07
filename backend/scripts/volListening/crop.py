# Crop a region of a VOL PDF page to PNG (map/diagram images).  py crop.py <pdf> <page> x0 y0 x1 y1 <out.png>
import sys, fitz
pdf, page, x0, y0, x1, y1, out = sys.argv[1], int(sys.argv[2]), *map(float, sys.argv[3:7]), sys.argv[7]
d = fitz.open(pdf)
d[page - 1].get_pixmap(dpi=200, clip=fitz.Rect(x0, y0, x1, y1)).save(out)
print(out)
