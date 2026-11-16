#!/usr/bin/env python3
"""Gera imgs_prods/contato_numerado.jpg com as fotos numeradas."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
image_dir = root / 'imgs_prods' / 'extraidas'
files = sorted(image_dir.glob('*'))
files = [f for f in files if f.suffix.lower() in ('.jpeg', '.jpg', '.png', '.webp')]
if not files:
    raise SystemExit(f'nenhuma imagem em {image_dir}')

w, h, label = 200, 250, 28
cols = 6
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + label)), 'white')
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except Exception:
    font = ImageFont.load_default()

for i, file in enumerate(files):
    img = Image.open(file)
    img = ImageOps.exif_transpose(img)
    img.thumbnail((w - 8, h - 8))
    x = (i % cols) * w + (w - img.width) // 2
    y = (i // cols) * (h + label) + (h - img.height) // 2
    if img.mode != 'RGB':
        img = img.convert('RGB')
    sheet.paste(img, (x, y))
    draw.text(((i % cols) * w + 6, (i // cols) * (h + label) + h + 3), f'{i + 1:02d}', fill='black', font=font)

out = root / 'imgs_prods' / 'contato_numerado.jpg'
sheet.save(out, quality=85)
print(out)
