"""Rebuild the Falcon logo as clean, transparent, 4x-resolution assets.

The supplied logo is a screenshot with a checkerboard "transparency" pattern
baked into its pixels. This script:
  1. classifies foreground vs. checkerboard (colour + connectivity),
  2. rebuilds the silver gear's bright teeth that match the checker tones
     (extrapolating the measured tooth profile),
  3. bleeds interior colours outward to kill the grey halo,
  4. denoises, upscales 4x and re-sharpens edges via a smoothed alpha curve,
  5. writes colour + reversed (for dark backgrounds) lockups, the emblem,
     favicons and an Open Graph cover.

Run:  python3 scripts/build-logo.py   (needs numpy scipy opencv-python-headless pillow)
"""
import os, sys
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "design-source", "logo-source.jpg")
OUT = os.path.join(ROOT, "public", "brand")
os.makedirs(OUT, exist_ok=True)
S = 4  # upscale factor

src = np.asarray(Image.open(SRC).convert("RGB"))
H, W, _ = src.shape
a = src.astype(np.float32)
lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
sat = a.max(2) - a.min(2)

# ---------- 1. emblem mask (x < 454) ----------
EMB_X1 = 454
bg = (sat < 14) & (lum >= 210)
fg = ndi.binary_opening(~bg, iterations=1)
fg[:, :240] = False
fg[:, EMB_X1:] = False
lab, n = ndi.label(fg)
fg = lab == (np.argmax(ndi.sum(fg, lab, range(1, n + 1))) + 1)

# ---------- 2. rebuild the gear teeth lost to the checker tones ----------
CX, CY, PER = 349.5, 121.0, 26.5
yy, xx = np.mgrid[0:H, 0:W]
dx, dy = xx - CX, CY - yy
r = np.hypot(dx, dy)
th = np.degrees(np.arctan2(dy, dx)) % 360

def radial_max(angs):
    out = []
    for t in angs:
        rr = np.arange(60, 112, 0.25)
        x = np.clip(np.round(CX + rr * np.cos(np.radians(t))).astype(int), 0, W - 1)
        y = np.clip(np.round(CY - rr * np.sin(np.radians(t))).astype(int), 0, H - 1)
        idx = np.nonzero(fg[y, x])[0]
        out.append(rr[idx.max()] if len(idx) else 0)
    return np.array(out)

known = np.arange(158, 266, 0.5)
prof = radial_max(known)
bins = (((known - 158) % PER) / PER * 40).astype(int)
tmpl = np.array([np.median(prof[bins == k]) if (bins == k).any() else 85.5 for k in range(40)])
ph = ((th - 158) % PER) / PER
Rt = np.interp(ph * 40 - 0.5, np.arange(40), tmpl, period=40)
synth = (th >= 52) & (th <= 160) & (r >= 69) & (r <= Rt)
emb = fg | synth
_d = np.hypot(*np.mgrid[-2:3, -2:3]) <= 2.2
emb = ndi.binary_closing(emb, structure=_d)
emb[:, EMB_X1:] = False
# fill tiny holes (specular highlights that matched the checker tones)
holes, hn = ndi.label(~emb)
hs = ndi.sum(~emb, holes, range(1, hn + 1))
filled = np.zeros_like(emb)
for i, s_ in enumerate(hs, 1):
    if s_ < 170:
        filled |= holes == i
emb = emb | filled

mask = emb

# ---------- 4. colour decontamination: bleed interior colours outward ----------
core = ndi.binary_erosion(mask, iterations=2)
idx = ndi.distance_transform_edt(~core, return_distances=False, return_indices=True)
bled = src[idx[0], idx[1]].astype(np.uint8)
# keep original pixels in the core, bled elsewhere (extends past the edge)
rgb = np.where(core[..., None], src, bled)
# repaint filled pinholes from the surrounding feathers (they held checker-toned highlights)
fm = ndi.binary_dilation(filled, iterations=1).astype(np.uint8) * 255
rgb = cv2.inpaint(np.ascontiguousarray(rgb), fm, 3, cv2.INPAINT_TELEA)

# denoise JPEG blocking, then upscale
rgb = cv2.bilateralFilter(rgb, d=5, sigmaColor=22, sigmaSpace=3)
hi = cv2.resize(rgb, (W * S, H * S), interpolation=cv2.INTER_LANCZOS4)
blur = cv2.GaussianBlur(hi, (0, 0), 1.1)
hi = np.clip(cv2.addWeighted(hi, 1.55, blur, -0.55, 0), 0, 255).astype(np.uint8)

# ---------- 5. alpha: smooth at source res, upscale, re-sharpen with a curve ----------
def crisp_alpha(m, sigma, k):
    f = cv2.GaussianBlur(m.astype(np.float32), (0, 0), sigma)
    f = cv2.resize(f, (W * S, H * S), interpolation=cv2.INTER_CUBIC)
    return np.clip((f - 0.5) * k + 0.5, 0, 1)

alpha = crisp_alpha(emb, 0.9, 5.0)

def save_rgba(rgb_arr, alpha_arr, path, box=None, pad=0):
    rgba = np.dstack([rgb_arr, (alpha_arr * 255 + 0.5).astype(np.uint8)])
    img = Image.fromarray(rgba, "RGBA")
    if box is None:
        ys, xs = np.nonzero(alpha_arr > 0.02)
        box = (xs.min() - pad, ys.min() - pad, xs.max() + 1 + pad, ys.max() + 1 + pad)
    img = img.crop(box)
    img.save(path, optimize=True)
    return img

# ---------- 6. vector wordmark, rules and divider (drawn at hi-res) ----------
from PIL import ImageDraw, ImageFont
from fontTools.ttLib import TTFont
FONTS = os.path.join(ROOT, "scripts", "fonts")
HW, HH = W * S, H * S

def cap_ratio(path):
    t = TTFont(path)
    return t["OS/2"].sCapHeight / t["head"].unitsPerEm

def text_mask(txt, font_path, cap_px, x0, x1, baseline, tracking=0.0, stroke=0):
    """Render txt so its cap-height == cap_px and it spans x0..x1 (hi-res px)."""
    size = int(round(cap_px / cap_ratio(font_path)))
    f = ImageFont.truetype(font_path, size)
    def render(sp):
        # per-glyph advance so tracking is exact, kerning kept by pair widths
        w = int(sum(f.getlength(c) for c in txt) + sp * (len(txt) - 1)) + 40
        im = Image.new("L", (w, size * 2), 0); d = ImageDraw.Draw(im)
        x = 20.0
        for i, c in enumerate(txt):
            d.text((x, size), c, font=f, fill=255, anchor="ls", stroke_width=stroke, stroke_fill=255)
            x += f.getlength(c) + sp
        return im
    im = render(tracking * size)
    bb = im.getbbox()
    ink = im.crop((bb[0], 0, bb[2], size * 2))
    # fit ink width exactly to the measured box
    ink = ink.resize((x1 - x0, ink.height), Image.LANCZOS)
    m = Image.new("L", (HW, HH), 0)
    m.paste(ink, (x0, baseline - size))
    return np.asarray(m, np.float32) / 255.0

def vgrad(y0, y1, c0, c1):
    t = np.clip((np.arange(HH, dtype=np.float32) - y0) / max(1, (y1 - y0)), 0, 1)[:, None, None]
    return np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t

falcon_m = text_mask("FALCON", os.path.join(FONTS, "LibreCaslonText-Bold.ttf"),
                     cap_px=int(73.5 * S), x0=468 * S, x1=859 * S, baseline=149 * S + S // 2, tracking=-0.004, stroke=5)
sub_m = text_mask("EQUIPMENT TRADING FZE LLC", os.path.join(FONTS, "Montserrat-Bold.ttf"),
                  cap_px=int(18 * S), x0=472 * S, x1=856 * S, baseline=187 * S, tracking=0.035, stroke=2)

def rect_mask(x0, y0, x1, y1, feather=0.0):
    m = np.zeros((HH, HW), np.float32)
    m[int(y0 * S):int(y1 * S), int(x0 * S):int(x1 * S)] = 1
    return m
rule1 = rect_mask(468, 157.6, 859, 161.0)
rule2 = rect_mask(468, 191.8, 859, 195.0)
divider = rect_mask(454.2, 55, 457.4, 200.5)

def gold_layer(y0, y1):
    c = vgrad(y0, y1, (236, 201, 112), (178, 128, 46))
    return np.broadcast_to(c, (HH, HW, 3))

def compose(reversed_):
    canvas = np.zeros((HH, HW, 4), np.float32)
    def over(rgb, a):
        a = a[..., None]
        out_a = a + canvas[..., 3:4] * (1 - a)
        out_rgb = np.where(out_a > 0, (rgb * a + canvas[..., :3] * canvas[..., 3:4] * (1 - a)) / np.maximum(out_a, 1e-6), 0)
        canvas[..., :3] = out_rgb; canvas[..., 3:4] = out_a
    over(hi.astype(np.float32), alpha)  # emblem
    if reversed_:
        ink_f = vgrad(76 * S, 150 * S, (255, 255, 255), (206, 217, 240))
        ink_s = vgrad(168 * S, 187 * S, (240, 244, 252), (214, 223, 242))
    else:
        ink_f = vgrad(76 * S, 150 * S, (22, 62, 124), (8, 24, 58))
        ink_s = vgrad(168 * S, 187 * S, (14, 24, 54), (10, 18, 40))
    over(np.broadcast_to(ink_f, (HH, HW, 3)), falcon_m)
    over(np.broadcast_to(ink_s, (HH, HW, 3)), sub_m)
    over(gold_layer(157 * S, 162 * S), rule1)
    over(gold_layer(191 * S, 196 * S), rule2)
    over(gold_layer(55 * S, 200 * S), divider)
    return canvas

def save_canvas(canvas, path, pad=8):
    rgba = np.dstack([np.clip(canvas[..., :3], 0, 255), canvas[..., 3] * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    ys, xs = np.nonzero(canvas[..., 3] > 0.02)
    img = img.crop((xs.min() - pad, ys.min() - pad, xs.max() + 1 + pad, ys.max() + 1 + pad))
    img.save(path, optimize=True)
    return img

color = save_canvas(compose(False), os.path.join(OUT, "logo-color.png"))
color.save(os.path.join(OUT, "logo-color.webp"), quality=94, method=6)
save_canvas(compose(True), os.path.join(OUT, "logo-reversed.png"))
Image.open(os.path.join(OUT, "logo-reversed.png")).save(os.path.join(OUT, "logo-reversed.webp"), quality=94, method=6)

# emblem only
ex1 = EMB_X1 * S
emb_alpha = alpha.copy(); emb_alpha[:, ex1:] = 0
emblem = save_rgba(hi, emb_alpha, os.path.join(OUT, "emblem.png"), pad=6)
emblem.save(os.path.join(OUT, "emblem.webp"), quality=94, method=6)

# favicons: emblem centred on a transparent square
def square(img, size):
    s = max(img.size)
    canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    canvas.paste(img, ((s - img.width) // 2, (s - img.height) // 2), img)
    return canvas.resize((size, size), Image.LANCZOS)
sq = square(emblem, 1024)
sq.resize((512, 512), Image.LANCZOS).save(os.path.join(ROOT, "public", "icon-512.png"), optimize=True)
sq.resize((192, 192), Image.LANCZOS).save(os.path.join(ROOT, "public", "icon-192.png"), optimize=True)
sq.resize((48, 48), Image.LANCZOS).save(os.path.join(ROOT, "public", "favicon-48.png"), optimize=True)
sq.resize((32, 32), Image.LANCZOS).save(os.path.join(ROOT, "public", "favicon-32.png"), optimize=True)
# apple touch icon on brand navy (iOS ignores transparency)
ap = Image.new("RGBA", (180, 180), (7, 16, 38, 255))
inner = square(emblem, 180 - 36)
ap.paste(inner, (18, 18), inner)
ap.convert("RGB").save(os.path.join(ROOT, "public", "apple-touch-icon.png"), optimize=True)
sq.resize((64, 64), Image.LANCZOS).save(os.path.join(ROOT, "public", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Open Graph cover: reversed lockup on a navy gradient
OW, OH = 1200, 630
og = Image.new("RGB", (OW, OH))
gy, gx = np.mgrid[0:OH, 0:OW].astype(np.float32)
d = np.hypot((gx - OW * 0.5) / OW, (gy - OH * 0.45) / OH)
base = np.array([7, 16, 38], np.float32); glow = np.array([22, 48, 104], np.float32)
t2 = np.clip(1 - d * 1.7, 0, 1)[..., None] ** 1.6
og = Image.fromarray((base * (1 - t2) + glow * t2).astype(np.uint8))
lock = Image.open(os.path.join(OUT, "logo-reversed.png"))
lw = 900
lock = lock.resize((lw, int(lock.height * lw / lock.width)), Image.LANCZOS)
og.paste(lock, ((OW - lw) // 2, (OH - lock.height) // 2 - 20), lock)
og.save(os.path.join(ROOT, "public", "og-cover.jpg"), quality=90, optimize=True)
print("emblem", emblem.size, "lockup", color.size)
