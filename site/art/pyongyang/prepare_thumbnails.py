"""Convert Blender review renders to small, self-contained web thumbnails.

Requires Pillow. Rendering PNG proofs stay outside public/. This process changes
only file format/size; it does not paint, generate, or alter model appearance.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
RENDERS = ROOT / 'art/pyongyang/renders'
OUTPUT = ROOT / 'public/thumbnails/pyongyang'
NAMES = ['apartment-cylinder', 'apartment-block', 'storefront', 'resident',
         'commuter', 'porter', 'vendor', 'cyclist', 'bus', 'shelter',
         'streetlamp', 'tree', 'bench']
OUTPUT.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGB', (1600, 1600), '#ede8da')
draw = ImageDraw.Draw(sheet)
font_path = '/System/Library/Fonts/Helvetica.ttc'
font = ImageFont.truetype(font_path, 18) if Path(font_path).exists() else ImageFont.load_default()
for index, name in enumerate(NAMES):
    image = Image.open(RENDERS / (name + '.png')).convert('RGB')
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    image.save(OUTPUT / (name + '.webp'), 'WEBP', quality=84, method=6)
    image.thumbnail((376, 348), Image.Resampling.LANCZOS)
    x, y = (index % 4) * 400, (index // 4) * 400
    sheet.paste(image, (x + (400-image.width)//2, y + 8))
    draw.text((x+16, y+366), name, fill='#34494c', font=font)
sheet.save(ROOT / 'art/pyongyang/contact-sheet.png', optimize=True)
sheet.save(OUTPUT / 'contact-sheet.webp', 'WEBP', quality=86, method=6)
overview = RENDERS / 'asset-overview.png'
if overview.exists():
    image = Image.open(overview).convert('RGB')
    image.thumbnail((768, 768), Image.Resampling.LANCZOS)
    image.save(OUTPUT / 'asset-overview.webp', 'WEBP', quality=84, method=6)
print('Prepared 13 WebP thumbnails and contact sheet:', OUTPUT)
