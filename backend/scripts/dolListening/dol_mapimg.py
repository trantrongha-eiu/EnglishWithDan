# Render DOL's label spots onto a map/diagram image (DOL draws them as HTML overlays; our map group
# needs them baked into the picture).
#   py dol_mapimg.py <draft.json> <groupIndex> <out.png>
# Spot coordinates: DRAG_OUT / DRAG_IN = top-left offset of the label box in px at the image's
# natural `width`; DIAGRAM_LABEL (centered) = offset of the box centre from the image centre.
import json, sys, io, urllib.request
from PIL import Image, ImageDraw, ImageFont

draft, gi, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
g = json.load(open(draft, encoding='utf-8'))['questionGroups'][gi]
src = g['_mapSource']
req = urllib.request.Request(src['url'], headers={'User-Agent': 'Mozilla/5.0'})
img = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=60).read())).convert('RGB')
W0 = src.get('width') or img.width
scale_up = max(1, 900 / img.width)            # upscale small images so labels stay crisp
img = img.resize((round(img.width * scale_up), round(img.height * scale_up)), Image.LANCZOS)
k = img.width / W0                             # spot px → output px
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('arialbd.ttf', round(15 * k))
except OSError:
    font = ImageFont.load_default()
r = round(13 * k)
for s in src['spots']:
    x, y = s['x'] * k, s['y'] * k
    if src.get('centered'):
        cx, cy = img.width / 2 + x, img.height / 2 + y
    else:
        cx, cy = x + r, y + r
    label = str(s['text']).strip()
    w = max(2 * r, d.textlength(label, font=font) + 10 * k)
    # keep the whole label inside the picture (DOL's drop boxes may start at the very edge)
    cx = min(max(cx, w / 2 + 3), img.width - w / 2 - 3)
    cy = min(max(cy, r + 3), img.height - r - 3)
    box = (cx - w / 2, cy - r, cx + w / 2, cy + r)
    d.rounded_rectangle(box, radius=r, fill=(255, 255, 255), outline=(220, 38, 38), width=max(2, round(2 * k)))
    d.text((cx, cy), label, fill=(185, 28, 28), font=font, anchor='mm')
img.save(out)
print(out, img.size)
