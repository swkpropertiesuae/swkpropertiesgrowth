"""Procedural texture generator for the Blender scene (PIL + numpy). Run once; outputs to ./tex"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tex'); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def save(a, name): Image.fromarray(np.clip(a, 0, 255).astype('uint8')).save(os.path.join(OUT, name))

def noise(h, w, scale, seed):
    r = np.random.default_rng(seed)
    small = r.random((max(2, h // scale), max(2, w // scale))).astype('float32')
    return np.asarray(Image.fromarray((small * 255).astype('uint8')).resize((w, h), Image.BICUBIC)).astype('float32') / 255

def marble(name, base, vein, seed):
    n = 1024
    f = sum(noise(n, n, s, seed + s) * a for s, a in ((256, .5), (64, .3), (16, .12), (4, .05)))
    v = np.abs(np.sin((np.arange(n)[None, :] * .006 + f * 9)))  # veins
    v = 1 - np.clip(v * 6, 0, 1)
    b = np.array(base, 'float32'); c = np.array(vein, 'float32')
    img = b[None, None, :] * (.94 + .06 * f[..., None]) * (1 - v[..., None] * .55) + c[None, None, :] * v[..., None] * .55
    img[:6] *= .8; img[:, :6] *= .8   # tile joint
    save(img, name)

def wood(name, base, seed):
    n = 512
    cols = noise(1, n, 1, seed)[0]; fine = noise(n, n, 3, seed + 1)
    g = (np.sin(np.arange(n)[None, :] * .9 + fine * 4) * .5 + .5) * .25 + .75
    img = np.array(base, 'float32')[None, None, :] * (g * (.85 + .3 * cols[None, :]))[..., None]
    save(img, name)

def concrete(name, base, seed):
    n = 512
    f = noise(n, n, 2, seed) * .5 + noise(n, n, 16, seed + 3) * .5
    save(np.array(base, 'float32')[None, None, :] * (.8 + .4 * f[..., None]), name)

def facade(name, seed, lit=.4, tint=(14, 28, 54), warm=.72, cols=8, rows=8):
    r = np.random.default_rng(seed); S = 1024
    base = Image.new('RGB', (S, S), (10, 14, 22)); em = Image.new('RGB', (S, S), (0, 0, 0))
    db, de = ImageDraw.Draw(base), ImageDraw.Draw(em)
    cw, ch = S / cols, S / rows
    for y in range(rows):
        for x in range(cols):
            x0, y0 = x * cw + cw * .06, y * ch + ch * .1; x1, y1 = x0 + cw * .88, y0 + ch * .8
            on = r.random() < lit
            glass = tuple(int(c * (.8 + .5 * r.random())) for c in tint)
            db.rectangle([x0, y0, x1, y1], fill=(60, 55, 48) if on else glass)
            if on:
                a = .5 + .5 * r.random()
                col = (255, 200, 140) if r.random() < warm else (190, 225, 255)
                de.rectangle([x0, y0, x1, y1], fill=tuple(int(c * a) for c in col))
    base.save(os.path.join(OUT, name + '_c.png')); em.save(os.path.join(OUT, name + '_e.png'))

def pad(name):
    S = 1024; img = Image.new('RGB', (S, S), (30, 32, 38)); d = ImageDraw.Draw(img)
    d.ellipse([60, 60, S - 60, S - 60], outline=(255, 255, 255), width=18)
    from PIL import ImageFont
    try: f = ImageFont.truetype('DejaVuSans-Bold.ttf', 520)
    except Exception: f = None
    d.text((S / 2, S / 2), 'H', fill=(255, 255, 255), font=f, anchor='mm'); img.save(os.path.join(OUT, name))

marble('marble_cream.png', (232, 226, 214), (110, 104, 96), 3)
marble('marble_dark.png', (40, 42, 50), (190, 180, 160), 7)
wood('walnut.png', (86, 54, 34), 5); wood('oak.png', (172, 128, 84), 8)
concrete('concrete.png', (110, 114, 122), 9); concrete('asphalt.png', (34, 36, 42), 12)
for i, (lit, tint, warm) in enumerate(((.36, (14, 28, 54), .72), (.22, (24, 34, 50), .6), (.5, (12, 32, 62), .8))):
    facade(f'facade{i}', 40 + i, lit, tint, warm, cols=10, rows=8)
facade('facade_tower', 11, .42, (14, 30, 58), .75, cols=12, rows=8)
facade('facade_steel', 31, .3, (44, 60, 86), .55, cols=12, rows=8)
pad('helipad.png')
print('textures ok')

# ---- screen / signage images ----
from PIL import ImageFont
def font(sz, bold=True):
    for f in ('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', 'DejaVuSans-Bold.ttf'):
        try: return ImageFont.truetype(f, sz)
        except Exception: pass
    return ImageFont.load_default()

def screen_dev():
    import json, re
    names = ['Emaar Properties','DAMAC Properties','Nakheel','Sobha Realty','Meraas','Dubai Properties','Aldar Properties','Ellington Properties','Danube Properties','Azizi Developments','Binghatti','Omniyat','Select Group','Imtiaz Developments','Arada','Deyaar','Union Properties','MAG Property','Samana Developers','Wasl Properties','Bloom Holding','Eagle Hills','Modon Holding','Majid Al Futtaim','Meydan','RAK Properties','Marjan','Nshama','Imkan Properties','Al Habtoor Group','Diamond Developers','Al Zorah']
    img = Image.new('RGB', (2048, 420), (11, 26, 51)); d = ImageDraw.Draw(img)
    for y in range(420): d.line([(0, y), (2048, y)], fill=(11, 26 + int(y * .06), 51 + int(y * .2)))
    d.text((40, 30), 'PARTNER DEVELOPERS', fill=(201, 169, 110), font=font(30))
    for i, n in enumerate(names):
        d.text((40 + (i % 4) * 500, 90 + (i // 4) * 40), n.upper(), fill=(255, 255, 255), font=font(28, False))
    img.save(os.path.join(OUT, 'screen_dev.png'))
def screen_board():
    img = Image.new('RGB', (2048, 300), (11, 26, 51)); d = ImageDraw.Draw(img)
    d.text((70, 70), 'SALES  ·  RENTALS  ·  OFF-PLAN', fill=(255, 255, 255), font=font(96))
    d.text((74, 200), 'SWK PROPERTIES  ·  DEALS CLOSED BY THE TEAM', fill=(201, 169, 110), font=font(36, False)); img.save(os.path.join(OUT, 'screen_board.png'))
def screen_market():
    import math
    img = Image.new('RGB', (2048, 320), (7, 18, 42)); d = ImageDraw.Draw(img)
    for x in range(0, 2048, 64): d.line([(x, 0), (x, 320)], fill=(20, 40, 80))
    for y in range(0, 320, 40): d.line([(0, y), (2048, y)], fill=(20, 40, 80))
    for col, ph in (((201, 169, 110), 0), ((79, 209, 255), 2), ((197, 139, 255), 4)):
        pts = [(x, 175 - math.sin(x * .004 + ph) * 38 - math.sin(x * .011 + ph * 2) * 22 - x / 2048 * 60) for x in range(0, 2049, 8)]
        d.line(pts, fill=col, width=5)
    for i in range(40): d.rectangle([40 + i * 50, 300 - (20 + (math.sin(i * 1.7) * .5 + .5) * 70), 68 + i * 50, 300], fill=(90, 80, 60))
    d.text((40, 20), 'DUBAI MARKET PULSE  ·  ILLUSTRATIVE VISUAL', fill=(201, 169, 110), font=font(26)); img.save(os.path.join(OUT, 'screen_market.png'))
def screen_text(name, txt, sub, color=(11, 26, 51)):
    img = Image.new('RGB', (1024, 256), color); d = ImageDraw.Draw(img)
    d.text((512, 100), txt, fill=(201, 169, 110), font=font(80), anchor='mm'); d.text((512, 190), sub, fill=(255, 255, 255), font=font(30, False), anchor='mm'); img.save(os.path.join(OUT, name))
screen_dev(); screen_board(); screen_market(); screen_text('screen_welcome.png', 'WELCOME', 'SWK PROPERTIES · DUBAI')
def neon(name, txt):
    img = Image.new('RGB', (1024, 200), (0, 0, 0)); d = ImageDraw.Draw(img); d.text((512, 100), txt, fill=(255, 225, 180), font=font(96), anchor='mm'); img.save(os.path.join(OUT, name))
neon('neon_services.png', 'BUY · SELL · RENT · MANAGE'); neon('neon_talk.png', "LET'S TALK")
import shutil
for f, n in (('golf-fields.webp', 'list_golf.png'), ('raw-district-2.webp', 'list_raw.png'), ('river-cove-residences.webp', 'list_river.png')):
    Image.open(os.path.join(os.path.dirname(OUT), '..', 'assets', f)).convert('RGB').save(os.path.join(OUT, n))
print('screens ok')
