import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/BufferGeometryUtils.js';

export { THREE, mergeGeometries };

export const rng = (seed = 1) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

export function canvasTexture(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = opts.aniso || 4;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opts.repeat[0], opts.repeat[1]); }
  t.userData.canvas = c;
  return t;
}

export function textTexture(text, { w = 1024, h = 256, font = '600 120px "Clash Display", system-ui, sans-serif',
  color = '#fff', bg = null, letterSpacing = 0, align = 'center' } = {}) {
  return canvasTexture(w, h, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    g.font = font; g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = align;
    if ('letterSpacing' in g) g.letterSpacing = letterSpacing + 'px';
    g.fillText(text, align === 'center' ? w / 2 : 20, h / 2 + 4);
  });
}

export function loadTexture(url, { srgb = true } = {}) {
  const t = new THREE.TextureLoader().load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------- shared procedural textures ----------
export function marbleTexture(seed = 3, base = '#ebe6dc', vein = '90,86,80') {
  const r = rng(seed);
  return canvasTexture(1024, 1024, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(255,255,255,${r() * 0.08})`;
      g.beginPath(); g.arc(r() * w, r() * h, 20 + r() * 120, 0, 7); g.fill();
    }
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(${vein},${0.05 + r() * 0.22})`;
      g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath();
      let x = r() * w, y = r() * h;
      g.moveTo(x, y);
      for (let k = 0; k < 7; k++) {
        x += (r() - 0.4) * 220; y += (r() - 0.5) * 220;
        g.quadraticCurveTo(x + (r() - 0.5) * 120, y + (r() - 0.5) * 120, x, y);
      }
      g.stroke();
    }
    // large-format tile joints
    g.strokeStyle = 'rgba(60,55,50,0.35)'; g.lineWidth = 2;
    g.strokeRect(0, 0, w, h);
  }, { repeat: [4, 4] });
}

export function woodTexture(seed = 5, base = '#5a3a26') {
  const r = rng(seed);
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 2) {
      g.fillStyle = `rgba(${r() > 0.5 ? '255,220,170' : '0,0,0'},${r() * 0.1})`;
      g.fillRect(x, 0, 1 + r() * 3, h);
    }
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 2;
    for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  }, { repeat: [2, 2] });
}

export function concreteTexture(seed = 9, base = '#6a6f78') {
  const r = rng(seed);
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() * 0.05})`;
      g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4);
    }
  }, { repeat: [8, 8] });
}

// Window grid for curtain-wall facades: returns { map, emissive }
export function facadeTextures(seed = 11, { cols = 8, rows = 8, litChance = 0.38, tint = [18, 34, 62], warmBias = 0.72 } = {}) {
  const r = rng(seed);
  const size = 512;
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const lit = r() < litChance;
    cells.push({ lit, warm: r() < warmBias, a: 0.55 + r() * 0.45 });
  }
  const draw = (emissive) => (g, w, h) => {
    g.fillStyle = emissive ? '#000' : '#0b0f16'; g.fillRect(0, 0, w, h);
    const cw = w / cols, ch = h / rows;
    cells.forEach((c, i) => {
      const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
      const ix = x + cw * 0.07, iy = y + ch * 0.1, iw = cw * 0.86, ih = ch * 0.8;
      if (emissive) {
        if (!c.lit) return;
        g.fillStyle = c.warm ? `rgba(255,205,140,${c.a})` : `rgba(190,225,255,${c.a})`;
        g.fillRect(ix, iy, iw, ih);
      } else {
        const gr = g.createLinearGradient(0, iy, 0, iy + ih);
        gr.addColorStop(0, `rgb(${tint[0] + 24},${tint[1] + 30},${tint[2] + 40})`);
        gr.addColorStop(1, `rgb(${tint[0]},${tint[1]},${tint[2]})`);
        g.fillStyle = c.lit ? (c.warm ? '#caa070' : '#9db8cf') : gr;
        g.fillRect(ix, iy, iw, ih);
        g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(ix, iy, iw * 0.4, ih);
      }
    });
  };
  return {
    map: canvasTexture(size, size, draw(false), { aniso: 8 }),
    emissive: canvasTexture(size, size, draw(true), { aniso: 8 }),
  };
}

export function disposeTree(o) {
  o.traverse((c) => { c.geometry?.dispose?.(); });
}
