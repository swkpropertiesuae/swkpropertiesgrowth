import { THREE, rng, canvasTexture, textTexture, loadTexture, facadeTextures, marbleTexture, woodTexture, concreteTexture, clamp } from './util.js';
import { DEVELOPERS, LISTINGS } from './data.js';

// ---- geometry constants (metres) ----
export const FH = 4.4;          // typical floor height
export const H0 = 7;            // double-height lobby
export const LEVELS = 50;       // rooftop is level 50
export const W = 38, D = 30, HW = W / 2, HD = D / 2;
export const levelY = (k) => (k <= 0 ? 0 : H0 + (k - 1) * FH);
export const levelH = (k) => (k === 0 ? H0 : FH);
export const OPEN_LEVELS = 6;   // levels 0..6 are cut-away (open front)

const std = (o) => new THREE.MeshStandardMaterial(o);
const basic = (c, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: true });

export function buildTower(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const anim = [];

  // ---------- materials ----------
  const M = {
    plaster: std({ color: '#e7e3dc', roughness: 0.9 }),
    plasterDark: std({ color: '#262a33', roughness: 0.7 }),
    ceiling: std({ color: '#7d756b', roughness: 0.85 }),
    steel: std({ color: '#1b1f27', metalness: 0.85, roughness: 0.35 }),
    brass: std({ color: '#c9a96e', metalness: 1, roughness: 0.28, envMapIntensity: 1.6 }),
    walnut: std({ map: woodTexture(5, '#4b2f1f'), roughness: 0.5, metalness: 0.05 }),
    oak: std({ map: woodTexture(8, '#a5794e'), roughness: 0.55 }),
    marble: std({ map: marbleTexture(3), roughness: 0.14, metalness: 0.1, envMapIntensity: 1.3 }),
    marbleDark: std({ map: marbleTexture(7, '#2c2e35', '200,190,170'), roughness: 0.12, metalness: 0.15, envMapIntensity: 1.4 }),
    stone: std({ map: concreteTexture(3, '#3a3d46'), roughness: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#cfe6ff', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }),
    warm: basic('#ffd7a0', 2.2),
    warmSoft: basic('#ffd7a0', 1.1),
    cool: basic('#bfe0ff', 2.2),
    leaf: std({ color: '#2d6a3c', roughness: 0.8 }),
    leaf2: std({ color: '#3e8a4c', roughness: 0.8 }),
    pot: std({ color: '#d8d3c8', roughness: 0.6 }),
    cream: std({ color: '#e6dccb', roughness: 0.95 }),
    charcoal: std({ color: '#30343c', roughness: 0.95 }),
    teal: std({ color: '#1f5560', roughness: 0.95 }),
    rust: std({ color: '#8a4a30', roughness: 0.95 }),
    black: std({ color: '#0d0e12', roughness: 0.4, metalness: 0.6 }),
    rug: std({ color: '#2b2f3a', roughness: 1 }),
  };

  // ---------- helpers ----------
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 24);
  const sphGeo = new THREE.SphereGeometry(1, 16, 12);
  const Bx = (g, [w, h, d], mat, [x, y, z], rot) => {
    const m = new THREE.Mesh(boxGeo, mat); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z);
    if (rot) m.rotation.y = rot; g.add(m); return m;
  };
  const Cy = (g, r, h, mat, [x, y, z], seg) => {
    const m = new THREE.Mesh(cylGeo, mat); m.scale.set(r, h, r); m.position.set(x, y + h / 2, z); g.add(m); return m;
  };
  const Sp = (g, r, mat, [x, y, z], sc = [1, 1, 1]) => {
    const m = new THREE.Mesh(sphGeo, mat); m.scale.set(r * sc[0], r * sc[1], r * sc[2]); m.position.set(x, y, z); g.add(m); return m;
  };
  const plant = (g, x, z, s = 1) => {
    Cy(g, 0.32 * s, 0.55 * s, M.pot, [x, 0, z]);
    const r = rng(Math.floor(x * 13 + z * 7 + 3));
    for (let i = 0; i < 7; i++) {
      Sp(g, 0.34 * s, i % 2 ? M.leaf : M.leaf2, [x + (r() - 0.5) * 0.5 * s, (0.8 + r() * 0.9) * s, z + (r() - 0.5) * 0.5 * s], [1, 1.5 + r(), 1]);
    }
  };
  const sofa = (g, x, z, rot, mat, len = 3) => {
    const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = rot; g.add(s);
    Bx(s, [len, 0.38, 1.05], mat, [0, 0.12, 0]);
    Bx(s, [len, 0.6, 0.28], mat, [0, 0.45, -0.42]);
    Bx(s, [0.28, 0.35, 1.05], mat, [-len / 2 + 0.14, 0.45, 0]);
    Bx(s, [0.28, 0.35, 1.05], mat, [len / 2 - 0.14, 0.45, 0]);
    for (const dx of [-0.5, 0.5]) Bx(s, [len / 2 - 0.3, 0.14, 0.8], mat, [dx * (len / 2 - 0.2), 0.5, 0.08]);
    for (const dx of [-1, 1]) Cy(s, 0.04, 0.12, M.brass, [dx * (len / 2 - 0.2), 0, 0.4]);
    return s;
  };
  const chair = (g, x, z, rot, mat = M.charcoal) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rot; g.add(c);
    Bx(c, [0.5, 0.08, 0.5], mat, [0, 0.45, 0]);
    Bx(c, [0.5, 0.55, 0.07], mat, [0, 0.53, -0.24]);
    Cy(c, 0.03, 0.45, M.steel, [0, 0, 0]);
    Cy(c, 0.22, 0.03, M.steel, [0, 0, 0]);
  };
  const lamp = (g, x, z, h = 1.6) => { Cy(g, 0.02, h, M.brass, [x, 0, z]); Cy(g, 0.2, 0.3, M.warmSoft, [x, h, z]); };
  const rug = (g, x, z, w, d, mat = M.rug) => Bx(g, [w, 0.03, d], mat, [x, 0.01, z]);
  const screen = (g, x, y, z, w, h, tex, rotY = 0, k = 1) => {
    const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = rotY; g.add(s);
    const f = new THREE.Mesh(boxGeo, M.black); f.scale.set(w + 0.2, h + 0.2, 0.12); s.add(f);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(k, k, k) }));
    p.position.z = 0.07; s.add(p);
    return p;
  };
  const desk = (g, x, z, rot) => {
    const d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = rot; g.add(d);
    Bx(d, [1.6, 0.05, 0.8], M.oak, [0, 0.72, 0]);
    Bx(d, [0.05, 0.72, 0.7], M.steel, [-0.75, 0, 0]); Bx(d, [0.05, 0.72, 0.7], M.steel, [0.75, 0, 0]);
    Bx(d, [0.62, 0.36, 0.03], M.black, [0, 0.95, -0.1]);
    Bx(d, [0.58, 0.32, 0.01], basic('#8fc4ff', 1.2), [0, 0.97, -0.085]);
    Bx(d, [0.06, 0.2, 0.06], M.steel, [0, 0.77, -0.1]);
    chair(d, 0, 0.75, Math.PI);
  };
  const pendant = (g, x, y, z, r = 0.22, k = 2.4) => {
    Sp(g, r, basic('#ffe0b0', k), [x, y, z]);
    Bx(g, [0.012, 4.4 - y, 0.012], M.steel, [x, y, z]);
  };
  const strip = (g, w, d, x, y, z, k = 2.2, color = '#ffe0b8') => Bx(g, [w, 0.05, d], basic(color, k), [x, y, z]);

  // ---------- textures for screens ----------
  const devNamesTex = canvasTexture(2048, 420, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1a33'); gr.addColorStop(1, '#14305c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9a96e'; g.font = '600 26px "General Sans", sans-serif'; g.textAlign = 'left';
    g.letterSpacing = '8px'; g.fillText('PARTNER DEVELOPERS', 40, 52);
    g.fillStyle = '#fff'; g.font = '600 40px "Clash Display", sans-serif'; g.letterSpacing = '2px';
    const names = DEVELOPERS.map((d) => d.name.toUpperCase());
    const cols = 4, rows = 8;
    names.slice(0, cols * rows).forEach((n, i) => {
      const cx = 40 + (i % cols) * 500, cy = 120 + Math.floor(i / cols) * 36;
      g.fillStyle = i % 2 ? 'rgba(255,255,255,0.82)' : '#ffffff';
      g.font = '500 28px "Clash Display", sans-serif';
      g.fillText(n, cx, cy);
    });
  });
  const marketTex = canvasTexture(2048, 320, () => {});
  const drawMarket = (t) => {
    const c = marketTex.userData.canvas, g = c.getContext('2d'), w = c.width, h = c.height;
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#07122a'); gr.addColorStop(1, '#10285a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.07)'; g.lineWidth = 1;
    for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const lines = [['#c9a96e', 0], ['#4fd1ff', 2], ['#c58bff', 4]];
    lines.forEach(([col, ph], li) => {
      g.strokeStyle = col; g.lineWidth = 4; g.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.55 - Math.sin(x * 0.004 + t * 0.6 + ph) * 38 - Math.sin(x * 0.011 + ph * 2) * 22 - x / w * 60 * (1 - li * 0.25);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    });
    for (let i = 0; i < 40; i++) {
      const bh = 20 + (Math.sin(i * 1.7 + t * 0.8) * 0.5 + 0.5) * 70;
      g.fillStyle = 'rgba(201,169,110,0.38)'; g.fillRect(40 + i * 50, h - bh - 8, 28, bh);
    }
    g.fillStyle = '#c9a96e'; g.font = '600 22px "General Sans", sans-serif'; g.letterSpacing = '7px';
    g.fillText('DUBAI MARKET PULSE  ·  ILLUSTRATIVE VISUAL', 40, 40);
    marketTex.needsUpdate = true;
  };
  drawMarket(0);
  const boardTex = canvasTexture(2048, 300, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#0b1a33'); gr.addColorStop(1, '#14305c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.font = '600 96px "Clash Display", sans-serif'; g.letterSpacing = '6px'; g.textBaseline = 'middle';
    g.fillText('SALES  ·  RENTALS  ·  OFF-PLAN', 70, h / 2 - 22);
    g.fillStyle = '#c9a96e'; g.font = '500 34px "General Sans", sans-serif'; g.letterSpacing = '12px';
    g.fillText('SWK PROPERTIES  ·  DEALS CLOSED BY THE TEAM', 74, h / 2 + 70);
  });
  const welcomeTex = canvasTexture(1024, 256, (g, w, h) => {
    g.fillStyle = '#0b1a33'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9a96e'; g.font = '600 74px "Clash Display", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '10px';
    g.fillText('WELCOME', w / 2, h / 2 - 22);
    g.fillStyle = '#fff'; g.font = '500 30px "General Sans", sans-serif'; g.letterSpacing = '9px';
    g.fillText('SWK PROPERTIES · DUBAI', w / 2, h / 2 + 52);
  });
  const neonTex = (txt, col) => textTexture(txt, { w: 1024, h: 200, font: '600 110px "Clash Display", sans-serif', color: col, letterSpacing: 8 });

  const logoTex = loadTexture('assets/brand/swk-logo-white.png');

  // ---------- vehicle ----------
  const car = (g, x, z, rot, color) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rot; g.add(c);
    const paint = std({ color, metalness: 0.9, roughness: 0.18, envMapIntensity: 2.2 });
    const shp = new THREE.Shape();
    shp.moveTo(-2.35, 0.28); shp.lineTo(-2.4, 0.62); shp.lineTo(-1.5, 0.8); shp.lineTo(-0.6, 1.02);
    shp.lineTo(0.5, 1.1); shp.lineTo(1.35, 0.86); shp.lineTo(2.3, 0.64); shp.lineTo(2.4, 0.3); shp.lineTo(2.1, 0.2); shp.lineTo(-2.1, 0.2); shp.closePath();
    const geo = new THREE.ExtrudeGeometry(shp, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.12, bevelSegments: 3 });
    geo.translate(0, 0, -0.85);
    const body = new THREE.Mesh(geo, paint); c.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 1.35), std({ color: '#0c1420', metalness: 1, roughness: 0.05 }));
    cab.position.set(0.0, 0.98, 0); c.add(cab);
    for (const [wx, wz] of [[1.45, 0.82], [1.45, -0.82], [-1.45, 0.82], [-1.45, -0.82]]) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 20), M.black); tire.rotation.x = Math.PI / 2; tire.position.set(wx, 0.36, wz); c.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 12), M.brass); rim.rotation.x = Math.PI / 2; rim.position.set(wx, 0.36, wz); c.add(rim);
    }
    for (const dz of [-0.55, 0.55]) Bx(c, [0.06, 0.07, 0.4], basic('#fff4d8', 4), [2.4, 0.52, dz]);
    Bx(c, [0.05, 0.08, 1.4], basic('#ff2a1a', 3), [-2.42, 0.55, 0]);
    return c;
  };

  // ---------- mannequins for the team floor ----------
  const figures = [];
  const makeFigure = (id, { suit, shirt = '#f2efe9', skin = '#c9a384', h = 1.74 }) => {
    const g = new THREE.Group();
    const s = h / 1.74;
    const suitM = std({ color: suit, roughness: 0.75 });
    const skinM = std({ color: skin, roughness: 0.7 });
    const body = new THREE.Group(); g.add(body);
    for (const dx of [-0.1, 0.1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.86, 10), suitM); leg.position.set(dx, 0.5, 0); g.add(leg);
      const shoe = new THREE.Mesh(boxGeo, M.black); shoe.scale.set(0.11, 0.07, 0.27); shoe.position.set(dx, 0.04, 0.05); g.add(shoe);
    }
    const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.22, 12), suitM); hips.position.y = 0.95; body.add(hips);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.56, 14), suitM); torso.position.y = 1.3; body.add(torso);
    const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.02), std({ color: shirt, roughness: 0.8 })); shirtV.position.set(0, 1.4, 0.18); body.add(shirtV);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 8), skinM); neck.position.y = 1.62; body.add(neck);
    const head = new THREE.Group(); head.position.y = 1.7; body.add(head);
    const skull = new THREE.Mesh(sphGeo, skinM); skull.scale.set(0.095, 0.115, 0.1); head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), std({ color: '#17120f', roughness: 0.9 }));
    hair.scale.set(0.1, 0.12, 0.105); hair.position.y = 0.01; hair.rotation.x = -0.25; head.add(hair);
    const armL = new THREE.Group(), armR = new THREE.Group();
    for (const [a, sx] of [[armL, -1], [armR, 1]]) {
      a.position.set(sx * 0.235, 1.5, 0);
      const up = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.3, 8), suitM); up.position.y = -0.15; a.add(up);
      const lo = new THREE.Group(); lo.position.y = -0.3; a.add(lo);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8), suitM); fore.position.y = -0.14; lo.add(fore);
      const hand = new THREE.Mesh(sphGeo, skinM); hand.scale.setScalar(0.04); hand.position.y = -0.3; lo.add(hand);
      a.userData.lo = lo; body.add(a);
    }
    g.scale.setScalar(s);

    // highlight: floor ring + soft beam
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.66, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color('#c9a96e').multiplyScalar(2.2), transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; g.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#c9a96e').multiplyScalar(0.8), transparent: true, opacity: 0, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.035; g.add(disc);
    const beamTex = canvasTexture(8, 128, (c, w, hh) => { const gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(255,225,170,0)'); gr.addColorStop(1, 'rgba(255,225,170,1)'); c.fillStyle = gr; c.fillRect(0, 0, w, hh); });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 3.6, 24, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = 1.8; g.add(beam);

    const fig = { id, group: g, body, head, armL, armR, ring, disc, beam, active: 0, target: 0, phase: Math.random() * 6, pose: 0 };
    figures.push(fig);
    return fig;
  };

  const poseFigure = (f, t) => {
    const sway = Math.sin(t * 0.7 + f.phase);
    f.body.rotation.z = sway * 0.012;
    f.body.position.x = sway * 0.012;
    f.head.rotation.y = Math.sin(t * 0.45 + f.phase) * 0.35 + (f.look || 0);
    f.head.rotation.x = Math.sin(t * 0.6 + f.phase) * 0.05;
    const p = f.pose;
    // pose 0: relaxed, one hand in pocket. 1: arms crossed-ish. 2: gesturing while talking.
    if (p === 0) {
      f.armL.rotation.set(0.05, 0, 0.08); f.armL.userData.lo.rotation.set(0, 0, 0);
      f.armR.rotation.set(0.35, 0, -0.18); f.armR.userData.lo.rotation.set(-0.55, 0, 0.35);
    } else if (p === 1) {
      f.armL.rotation.set(0.7, 0, 0.35); f.armL.userData.lo.rotation.set(-1.0, 0, 0.8);
      f.armR.rotation.set(0.7, 0, -0.35); f.armR.userData.lo.rotation.set(-1.0, 0, -0.8);
    } else {
      f.armL.rotation.set(0.05, 0, 0.1); f.armL.userData.lo.rotation.set(0, 0, 0);
      f.armR.rotation.set(0.45 + Math.sin(t * 1.6 + f.phase) * 0.18, 0, -0.35); f.armR.userData.lo.rotation.set(-1.0 + Math.sin(t * 2.1 + f.phase) * 0.2, 0, -0.2);
    }
    f.active += (f.target - f.active) * 0.12;
    const pulse = 0.78 + 0.22 * Math.sin(t * 3);
    f.ring.material.opacity = (0.18 + f.active * 0.82) * (f.active > 0.5 ? pulse : 1);
    f.disc.material.opacity = f.active * 0.28;
    f.beam.material.opacity = f.active * 0.32;
    f.ring.scale.setScalar(1 + f.active * 0.18);
  };

  // ---------- tower shell ----------
  const facadeMat = (rx, ry, k = 0.9) => {
    const ft = facadeTextures(11, { litChance: 0.4, tint: [18, 36, 66] });
    for (const t of [ft.map, ft.emissive]) { t.repeat.set(rx, ry); t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return std({ map: ft.map, emissiveMap: ft.emissive, emissive: '#ffffff', emissiveIntensity: k, metalness: 0.6, roughness: 0.18, envMapIntensity: 1.8 });
  };
  const yOpenTop = levelY(OPEN_LEVELS + 1);   // top of the cut-away zone
  const yRoof = levelY(LEVELS);

  // upper body (full facade) from the top of level 6 up to the roof deck
  const upperH = yRoof - yOpenTop;
  const fmFront = facadeMat(W / 19, upperH / 35.2), fmSide = facadeMat(D / 19, upperH / 35.2), fmTop = std({ color: '#1a1d24' });
  const upper = new THREE.Mesh(new THREE.BoxGeometry(W, upperH, D), [fmSide, fmSide, fmTop, fmTop, fmFront, fmFront]);
  upper.position.y = yOpenTop + upperH / 2; root.add(upper);

  // lower body: walls + slabs with the front left open (dollhouse cut-away)
  const lowerH = yOpenTop;
  const sideOut = facadeMat(D / 19, lowerH / 35.2, 0.9), backOut = facadeMat(W / 19, lowerH / 35.2, 0.9);
  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(W, lowerH, 0.5), [M.plaster, M.plaster, M.plaster, M.plaster, M.plaster, backOut]);
  wallBack.position.set(0, lowerH / 2, -HD + 0.25); root.add(wallBack);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, lowerH, D), [sx > 0 ? sideOut : M.plaster, sx > 0 ? M.plaster : sideOut, M.plaster, M.plaster, M.plaster, M.plaster]);
    w.position.set(sx * (HW - 0.25), lowerH / 2, 0); root.add(w);
  }
  // slabs
  for (let k = 0; k <= OPEN_LEVELS + 1; k++) {
    const sl = new THREE.Mesh(boxGeo, [M.plaster, M.plaster, M.plaster, M.ceiling, M.plaster, M.plaster]);
    sl.scale.set(W, 0.4, D); sl.position.set(0, levelY(k) - 0.2, 0);
    if (k <= OPEN_LEVELS) sl.material = [M.plasterDark, M.plasterDark, [M.marble, M.marbleDark, M.oak, M.marbleDark, M.oak, M.marble][k], M.ceiling, M.plasterDark, M.plasterDark];
    root.add(sl);
    // fascia + LED edge on the open front
    Bx(root, [W, 0.5, 0.25], M.plasterDark, [0, levelY(k) - 0.55, HD]);
    Bx(root, [W, 0.05, 0.05], basic('#ffd9a8', 2.4), [0, levelY(k) - 0.62, HD + 0.14]);
  }
  // ceiling light strips (levels 0..6)
  for (let k = 0; k <= OPEN_LEVELS; k++) {
    const y = levelY(k + 1) - 0.46;
    for (const z of [-10, -2, 7]) strip(root, 26, 0.18, 0, y, z, 1.8);
  }
  // front mullions (open frame, no glass so the camera can pass through)
  for (let k = 0; k <= OPEN_LEVELS; k++) {
    const h = levelH(k);
    for (let i = 0; i <= 8; i++) Bx(root, [0.12, h - 0.6, 0.12], M.steel, [-HW + i * (W / 8), levelY(k), HD - 0.1]);
  }

  // ---------- diagonal exoskeleton (levels 7..46) ----------
  {
    const beamsDark = [], beamsGlow = [];
    const dummy = new THREE.Object3D();
    const y0 = yOpenTop + 0.2, y1 = levelY(46);
    const rowH = FH * 4;
    const rows = Math.floor((y1 - y0) / rowH);
    const faces = [
      { len: W, normal: [0, 0, 1], off: HD + 0.45, rotY: 0 },
      { len: W, normal: [0, 0, -1], off: HD + 0.45, rotY: Math.PI },
      { len: D, normal: [1, 0, 0], off: HW + 0.45, rotY: Math.PI / 2 },
      { len: D, normal: [-1, 0, 0], off: HW + 0.45, rotY: -Math.PI / 2 },
    ];
    for (const f of faces) {
      const bays = Math.round(f.len / 9.5), bw = f.len / bays;
      for (let j = 0; j < rows; j++) for (let i = 0; i < bays; i++) {
        const cx = -f.len / 2 + (i + 0.5) * bw, cy = y0 + (j + 0.5) * rowH;
        const L = Math.hypot(bw, rowH), ang = Math.atan2(rowH, bw);
        for (const sgn of [1, -1]) {
          dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
          dummy.rotation.set(0, f.rotY, sgn * ang);
          // build in face-local space: x along face, y up, z outward
          const m = new THREE.Matrix4().makeRotationY(f.rotY).multiply(new THREE.Matrix4().makeTranslation(cx, cy, f.off)).multiply(new THREE.Matrix4().makeRotationZ(sgn * ang));
          beamsDark.push(m.clone().multiply(new THREE.Matrix4().makeScale(L, 0.9, 0.9)));
          beamsGlow.push(m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.5)).multiply(new THREE.Matrix4().makeScale(L, 0.16, 0.16)));
        }
      }
    }
    const dm = new THREE.InstancedMesh(boxGeo, std({ color: '#161a22', metalness: 0.9, roughness: 0.3 }), beamsDark.length);
    const gm = new THREE.InstancedMesh(boxGeo, basic('#cfe4ff', 2.6), beamsGlow.length);
    beamsDark.forEach((m, i) => dm.setMatrixAt(i, m)); beamsGlow.forEach((m, i) => gm.setMatrixAt(i, m));
    root.add(dm, gm);
    // corner light columns
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Bx(root, [0.5, yRoof - yOpenTop, 0.5], basic('#cfe4ff', 2.0), [sx * (HW + 0.2), yOpenTop, sz * (HD + 0.2)]);
  }
  // sign on the facade: SWK logo
  {
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 12.7), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, color: new THREE.Color(2.4, 2.4, 2.4), toneMapped: false, depthWrite: false }));
    logo.position.set(0, levelY(40), HD + 1.1); root.add(logo);
    const back = Bx(root, [17, 14, 0.5], std({ color: '#0a1226', roughness: 0.4, metalness: 0.5 }), [0, levelY(40) - 7, HD + 0.6]);
  }

  // ---------- podium canopy ----------
  {
    const s = new THREE.Shape();
    const N = 28;
    s.moveTo(-48, 12);
    for (let i = 0; i <= N; i++) { const x = -48 + (96 * i) / N; const u = x / 48; s.lineTo(x, 24 + 16 * (1 - u * u)); }
    s.lineTo(48, 12); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false });
    geo.rotateX(Math.PI / 2); geo.translate(0, H0 - 0.1, 0);
    const can = new THREE.Mesh(geo, [M.plasterDark, M.plasterDark]); root.add(can);
    // underside glow
    const g2 = new THREE.ShapeGeometry(s); g2.rotateX(Math.PI / 2); g2.translate(0, H0 - 0.82, 0);
    root.add(new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd7a0').multiplyScalar(0.22), side: THREE.DoubleSide })));
    // LED fascia line
    const pts = []; for (let i = 0; i <= N; i++) { const x = -48 + (96 * i) / N, u = x / 48; pts.push(new THREE.Vector3(x, H0 - 0.35, 24 + 16 * (1 - u * u) + 0.01)); }
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[i + 1], L = a.distanceTo(b);
      const m = new THREE.Mesh(boxGeo, basic('#ffd9a8', 3)); m.scale.set(L, 0.12, 0.08); m.position.copy(a).lerp(b, 0.5);
      m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); root.add(m);
    }
    // columns
    for (const x of [-40, -27, -14, 14, 27, 40]) {
      const u = x / 48, z = 24 + 16 * (1 - u * u) - 1.2;
      Cy(root, 0.32, H0 - 0.1, std({ color: '#c8c3ba', roughness: 0.3, metalness: 0.4 }), [x, 0, z]);
      Bx(root, [0.06, H0 - 1, 0.04], basic('#ffd9a8', 2.5), [x, 0.4, z + 0.33]);
    }
    // SWK PROPERTY sign
    const tex = textTexture('SWK  PROPERTY', { w: 2048, h: 256, font: '600 150px "Clash Display", sans-serif', color: '#ffffff', letterSpacing: 26 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.75), new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: new THREE.Color(2.2, 2.2, 2.2), toneMapped: false, depthWrite: false }));
    sign.position.set(0, H0 + 1.1, 40.5); Bx(root, [23, 3.2, 0.5], std({ color: '#0a1226', roughness: 0.3, metalness: 0.6 }), [0, H0 - 0.5, 40.1]);
    root.add(sign);
    // ramp-like steps & forecourt glow
    Bx(root, [60, 0.2, 14], std({ map: marbleTexture(9, '#cfc9be'), roughness: 0.2, metalness: 0.2 }), [0, 0, 18]);
  }

  // ---------- interiors ----------
  const rooms = [];
  const room = (k) => { const g = new THREE.Group(); g.position.y = levelY(k); root.add(g); rooms[k] = g; return g; };

  // L0 reception ------------------------------------------------
  {
    const g = room(0);
    Bx(g, [W - 8, 6.6, 0.3], M.marbleDark, [0, 0.1, -HD + 0.65]);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 6.8), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, color: new THREE.Color(1.7, 1.7, 1.7), toneMapped: false }));
    logo.position.set(0, 3.6, -HD + 0.82); g.add(logo);
    for (let i = 0; i < 16; i++) for (const sx of [-1, 1]) Bx(g, [0.22, 6.6, 0.5], M.walnut, [sx * (7 + i * 0.62), 0.1, -HD + 0.9]);
    for (const sx of [-1, 1]) Bx(g, [0.1, 6.3, 0.05], basic('#ffd4a0', 2), [sx * 6.6, 0.2, -HD + 0.72]);
    // reception desk
    const desk = new THREE.Group(); desk.position.set(0, 0, -8.6); g.add(desk);
    Bx(desk, [11, 1.12, 1.5], M.walnut, [0, 0, 0]);
    Bx(desk, [11.2, 0.07, 1.7], M.marble, [0, 1.12, 0]);
    Bx(desk, [11, 0.06, 0.06], basic('#ffd4a0', 2.6), [0, 0.86, 0.78]);
    Bx(desk, [2.6, 0.5, 0.04], M.brass, [-3.5, 0.5, 0.77]);
    for (const dx of [-2, 2]) { Bx(desk, [0.62, 0.38, 0.03], M.black, [dx, 1.45, -0.2]); Bx(desk, [0.06, 0.28, 0.06], M.steel, [dx, 1.2, -0.2]); }
    const welcome = screen(g, 6.4, 3.2, -HD + 0.78, 3.6, 0.9, welcomeTex);
    // chandelier
    const r = rng(14);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), basic('#ffe2b6', 3.2), 70);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 70; i++) {
      const a = r() * 6.283, rad = Math.sqrt(r()) * 4.2, yy = 3.2 + r() * 3.0, sc = 0.09 + r() * 0.1;
      m.compose(new THREE.Vector3(Math.cos(a) * rad, yy, -1 + Math.sin(a) * rad), new THREE.Quaternion(), new THREE.Vector3(sc, sc, sc)); bulbs.setMatrixAt(i, m);
    }
    g.add(bulbs);
    // lounge (left)
    rug(g, -11.5, 1, 9, 6.4, std({ color: '#3a3f4a', roughness: 1 }));
    sofa(g, -11.5, -1.6, 0, M.cream, 3.6); sofa(g, -11.5, 3.6, Math.PI, M.charcoal, 3.6);
    Cy(g, 0.8, 0.35, M.marble, [-11.5, 0, 1]); Cy(g, 0.12, 0.35, M.brass, [-11.5, 0, 1]);
    plant(g, -17, -3, 1.4); plant(g, -17, 5, 1.2); lamp(g, -15.2, -2.2, 1.7);
    // supercars (right)
    for (const [cx, cz, rot, col, sc] of [[10.5, 1.5, -0.5, '#d8a83a', 1], [11.5, -6.2, 0.35, '#0e0f12', 1]]) {
      Cy(g, 3.4, 0.22, std({ color: '#15171c', roughness: 0.3, metalness: 0.5 }), [cx, 0, cz]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.03, 6, 64), basic('#ffd4a0', 3)); ring.rotation.x = Math.PI / 2; ring.position.set(cx, 0.24, cz); g.add(ring);
      const c = car(g, cx, cz, rot, col); c.position.y = 0.22;
    }
    plant(g, 17, 6, 1.3); plant(g, 17, -11, 1.2);
    // receptionist
    const rec = makeFigure('reception', { suit: '#1b2a4a', skin: '#c79d7c' });
    rec.group.position.set(-2.4, 0, -10.2); rec.group.rotation.y = 0.15; rec.pose = 2; g.add(rec.group);
    // concierge by the door
    const con = makeFigure('concierge', { suit: '#141414', skin: '#b58d6c' });
    con.group.position.set(5.5, 0, 11.5); con.group.rotation.y = Math.PI + 0.4; con.pose = 0; g.add(con.group);
    figures.splice(figures.indexOf(rec), 1); figures.splice(figures.indexOf(con), 1);
    anim.push((t) => { poseFigure(rec, t); poseFigure(con, t); });
  }

  // L1 developers -----------------------------------------------
  {
    const g = room(1);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.walnut, [0, 0, -HD + 0.6]);
    screen(g, 0, 2.2, -HD + 0.75, 24, 3.2, devNamesTex);
    strip(g, 26, 0.06, 0, 0.45, -HD + 0.75, 2.4);
    Bx(g, [14, 0.12, 3.4], M.marbleDark, [0, 0.74, -2]);
    for (const sx of [-5.5, 5.5]) Bx(g, [0.5, 0.74, 2.8], M.brass, [sx, 0, -2]);
    for (let i = 0; i < 6; i++) for (const sz of [-1, 1]) chair(g, -5.8 + i * 2.3, -2 + sz * 2.3, sz > 0 ? Math.PI : 0, M.charcoal);
    for (let i = 0; i < 3; i++) strip(g, 3.8, 0.12, -4.6 + i * 4.6, 3.55, -2, 3);
    rug(g, 0, -2, 18, 8, std({ color: '#d9d2c4', roughness: 1 }));
    // glass display case with models
    Bx(g, [4, 0.9, 1.4], M.black, [-15, 0, -8]);
    const r = rng(2); for (let i = 0; i < 9; i++) Bx(g, [0.35, 0.5 + r() * 1.2, 0.35], std({ color: '#e9eef6', roughness: 0.3, emissive: '#2d4a7a', emissiveIntensity: 0.5 }), [-16.4 + (i % 5) * 0.7, 0.9, -8.4 + Math.floor(i / 5) * 0.8]);
    Bx(g, [4.2, 1.8, 1.6], M.glass, [-15, 0.9, -8]);
    plant(g, 16.5, -11, 1.3); plant(g, -17, 8, 1.2); plant(g, 17, 8, 1.2);
    sofa(g, 13, 5, -Math.PI / 2, M.teal, 3.4); sofa(g, 13, -9, -Math.PI / 2, M.teal, 3);
    lamp(g, 16.5, 1, 1.7);
  }

  // L2 projects gallery ----------------------------------------
  {
    const g = room(2);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.plasterDark, [0, 0, -HD + 0.6]);
    LISTINGS.forEach((l, i) => {
      const tex = loadTexture(l.img);
      screen(g, -10.5 + i * 10.5, 2.35, -HD + 0.78, 7.2, 3.4, tex, 0, 1.05);
      Bx(g, [7.2, 0.04, 0.05], basic('#ffd4a0', 2.4), [-10.5 + i * 10.5, 0.45, -HD + 0.8]);
    });
    // scale model table
    const tbl = new THREE.Group(); tbl.position.set(0, 0, -1); g.add(tbl);
    Cy(tbl, 6.9, 0.8, M.black, [0, 0, 0]); Cy(tbl, 7.0, 0.05, basic('#ffd4a0', 2.4), [0, 0.72, 0]); Cy(tbl, 6.5, 0.1, std({ color: '#0e1624', roughness: 0.3, metalness: 0.4 }), [0, 0.8, 0]);
    const towers = new THREE.InstancedMesh(boxGeo, std({ color: '#eef3fb', roughness: 0.3, emissive: '#27446f', emissiveIntensity: 0.9 }), 54);
    const r = rng(8), mm = new THREE.Matrix4();
    for (let i = 0; i < 54; i++) {
      const a = r() * 6.283, rad = Math.sqrt(r()) * 5.8, w = 0.28 + r() * 0.36, h = 0.5 + Math.pow(r(), 1.8) * 3.2;
      mm.compose(new THREE.Vector3(Math.cos(a) * rad, 0.9 + h / 2, Math.sin(a) * rad), new THREE.Quaternion(), new THREE.Vector3(w, h, w)); towers.setMatrixAt(i, mm);
      towers.setColorAt(i, new THREE.Color().setHSL(0.58 + r() * 0.1, 0.35, 0.8 + r() * 0.15));
    }
    tbl.add(towers);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.07, 8, 96), basic('#ffd4a0', 3)); halo.rotation.x = Math.PI / 2; halo.position.y = 3.9; tbl.add(halo);
    anim.push((t) => { towers.rotation.y = t * 0.05; });
    for (const sx of [-1, 1]) { sofa(g, sx * 14.5, 4.5, sx > 0 ? -Math.PI / 2 : Math.PI / 2, M.cream, 3.2); plant(g, sx * 17, -3, 1.3); }
    for (let i = -2; i <= 2; i++) pendant(g, i * 3.2, 3.3, 5.5, 0.2);
  }

  // L3 services ------------------------------------------------
  {
    const g = room(3);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.oak, [0, 0, -HD + 0.6]);
    const tex = neonTex('BUY  ·  SELL  ·  RENT  ·  MANAGE', '#ffe1b3');
    const s = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: new THREE.Color(2.2, 2.2, 2.2), toneMapped: false, depthWrite: false }));
    s.position.set(0, 3.4, -HD + 0.78); g.add(s);
    for (let i = 0; i < 4; i++) {
      const x = -13.5 + i * 9;
      Bx(g, [8, 0.1, 6.5], M.oak, [x, 0, -11.7]);
      Bx(g, [8, 2.7, 0.06], M.glass, [x, 0.1, -8.5]);
      for (const dx of [-4, 0, 4]) Bx(g, [0.06, 2.9, 0.06], M.steel, [x + dx, 0, -8.5]);
      desk(g, x, -11.6, Math.PI);
      chair(g, x - 1.1, -9.4, 0, M.teal); chair(g, x + 1.1, -9.4, 0, M.teal);
      pendant(g, x, 3.2, -11, 0.18);
    }
    sofa(g, -9, 3, 0, M.charcoal, 3.6); sofa(g, 9, 3, 0, M.rust, 3.6);
    Cy(g, 0.7, 0.4, M.marble, [-9, 0, 5.2]); Cy(g, 0.7, 0.4, M.marble, [9, 0, 5.2]);
    rug(g, 0, 4, 28, 6, std({ color: '#cfc6b6', roughness: 1 }));
    plant(g, -17, 8, 1.3); plant(g, 17, 8, 1.3); plant(g, 0, 9, 1.1);
  }

  // L4 market insight ------------------------------------------
  {
    const g = room(4);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.plasterDark, [0, 0, -HD + 0.6]);
    screen(g, 0, 2.15, -HD + 0.75, 28, 3.3, marketTex);
    strip(g, 30, 0.05, 0, 0.45, -HD + 0.78, 2.4, '#8fc4ff');
    const holo = new THREE.Group(); holo.position.set(0, 0, -1); g.add(holo);
    Cy(holo, 3.4, 0.5, M.black, [0, 0, 0]); Cy(holo, 3.5, 0.04, basic('#8fc4ff', 3), [0, 0.5, 0]);
    const r = rng(12);
    const city = new THREE.Group(); city.position.y = 1.3; holo.add(city);
    const wire = new THREE.MeshBasicMaterial({ color: new THREE.Color('#7fd0ff').multiplyScalar(1.6), wireframe: true, transparent: true, opacity: 0.75 });
    for (let i = 0; i < 40; i++) {
      const a = r() * 6.283, rad = Math.sqrt(r()) * 2.6, h = 0.2 + Math.pow(r(), 2) * 2;
      const m = new THREE.Mesh(boxGeo, wire); m.scale.set(0.2, h, 0.2); m.position.set(Math.cos(a) * rad, h / 2, Math.sin(a) * rad); city.add(m);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.03, 6, 64), basic('#8fc4ff', 3)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.9; holo.add(ring);
    anim.push((t) => { city.rotation.y = t * 0.25; });
    for (const [x, z] of [[-10, 4], [10, 4], [-12, -6]]) { Cy(g, 0.6, 1.05, M.walnut, [x, 0, z]); for (let i = 0; i < 3; i++) { const a = i * 2.09; Cy(g, 0.18, 0.55, M.charcoal, [x + Math.cos(a) * 1.1, 0, z + Math.sin(a) * 1.1]); } }
    for (let i = 0; i < 6; i++) Bx(g, [1.6, 3.6, 0.3], std({ color: '#2f7a46', roughness: 1 }), [13.6 + i * 0.5, 0, 2 + i * 0.4]);
    plant(g, 17, -9, 1.5); plant(g, -17, 8, 1.3);
    anim.push((t) => { if (g.userData.near) { g.userData.acc = (g.userData.acc || 0) + 1; if (g.userData.acc % 8 === 0) drawMarket(t); } });
    g.userData.near = false; rooms.market = g;
  }

  // L5 lounge / contact ----------------------------------------
  {
    const g = room(5);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.walnut, [0, 0, -HD + 0.6]);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.8), new THREE.MeshBasicMaterial({ map: neonTex("LET'S TALK", '#ffcf9a'), transparent: true, color: new THREE.Color(2.4, 2.4, 2.4), toneMapped: false, depthWrite: false }));
    s.position.set(0, 3.0, -HD + 0.78); g.add(s);
    // bar
    Bx(g, [11, 1.1, 1.4], M.walnut, [10, 0, -10]); Bx(g, [11.2, 0.07, 1.6], M.marble, [10, 1.1, -10]);
    Bx(g, [11, 0.05, 0.05], basic('#ffd4a0', 2.6), [10, 0.9, -9.28]);
    for (let i = 0; i < 5; i++) { Cy(g, 0.2, 0.7, M.black, [5.8 + i * 1.9, 0, -8.3]); Cy(g, 0.24, 0.07, M.brass, [5.8 + i * 1.9, 0.7, -8.3]); }
    Bx(g, [0.7, 0.5, 0.5], M.steel, [12, 1.18, -10]);
    Bx(g, [11, 0.06, 0.5], M.oak, [10, 2.3, -13.2]); Bx(g, [11, 0.06, 0.5], M.oak, [10, 1.6, -13.2]);
    const r = rng(33); for (let i = 0; i < 18; i++) Cy(g, 0.07, 0.3 + r() * 0.15, basic(['#ffb870', '#9fd8ff', '#ffd4a0'][i % 3], 1.3), [4.8 + i * 0.6, i % 2 ? 1.66 : 2.36, -13.2]);
    // fireplace-style lounge
    rug(g, -9, -1, 11, 8, std({ color: '#40372e', roughness: 1 }));
    sofa(g, -9, -4.2, 0, M.cream, 4); sofa(g, -13.4, -1, Math.PI / 2, M.rust, 3); sofa(g, -4.6, -1, -Math.PI / 2, M.rust, 3);
    Cy(g, 0.95, 0.38, M.marbleDark, [-9, 0, -1]); Cy(g, 0.15, 0.38, M.brass, [-9, 0, -1]);
    lamp(g, -15.8, -5, 1.8); lamp(g, -2.6, -5.6, 1.8);
    // meeting table
    Bx(g, [4.4, 0.08, 1.7], M.oak, [-1, 0.74, 7]); for (const dx of [-1.6, 1.6]) Bx(g, [0.1, 0.74, 1.3], M.steel, [-1 + dx, 0, 7]);
    for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) chair(g, -2.4 + i * 1.4, 7 + sz * 1.3, sz > 0 ? Math.PI : 0, M.teal);
    pendant(g, -1, 3.4, 7, 0.26); pendant(g, 11, 3.4, 4, 0.2); pendant(g, 14, 3.4, 6, 0.2);
    plant(g, 17, 9, 1.5); plant(g, -17, 9, 1.3); plant(g, 16, -3, 1.2);
  }

  // L6 team floor ----------------------------------------------
  const teamFigs = {};
  {
    const g = room(6);
    Bx(g, [W - 2, FH - 0.5, 0.2], M.plasterDark, [0, 0, -HD + 0.6]);
    screen(g, 0, 2.3, -HD + 0.75, 24, 2.95, boardTex);
    strip(g, 26, 0.05, 0, 0.45, -HD + 0.78, 2.4);
    // desk rows (back)
    for (let i = 0; i < 5; i++) { desk(g, -14 + i * 7, -11, Math.PI); }
    for (let i = 0; i < 4; i++) { desk(g, -10.5 + i * 7, -7.5, 0); }
    rug(g, 0, 1, 28, 14, std({ color: '#2b2f3a', roughness: 1 }));
    // coffee points
    for (const [x, z] of [[-13, 5], [13, 5]]) { Cy(g, 0.55, 1.1, M.walnut, [x, 0, z]); Cy(g, 0.6, 0.05, M.marble, [x, 1.1, z]); }
    plant(g, -17, 8, 1.4); plant(g, 17, 8, 1.4); plant(g, 17, -4, 1.2); plant(g, -17, -3, 1.2);
    for (let i = 0; i < 5; i++) pendant(g, -12 + i * 6, 3.4, 0, 0.2);
    // five team members standing in casual groups
    const specs = [
      ['talha', -9.0, 1.2, 0.55, { suit: '#1f2f52' }, 2, 0.4],
      ['fareed', -5.6, 0.6, -0.8, { suit: '#33363c', h: 1.82 }, 0, -0.5],
      ['issaadi', -0.8, 2.4, 0.2, { suit: '#5a2a3a', h: 1.66 }, 1, 0.2],
      ['haseeb', 4.6, 0.4, -0.4, { suit: '#2d4a43', h: 1.78 }, 2, -0.3],
      ['shahid', 9.4, 2.0, -0.7, { suit: '#44403a', h: 1.72 }, 0, 0.3],
    ];
    for (const [id, x, z, ry, look, pose, hl] of specs) {
      const f = makeFigure(id, look); f.group.position.set(x, 0, z); f.group.rotation.y = ry; f.pose = pose; f.look = hl; g.add(f.group);
      teamFigs[id] = f;
    }
    anim.push((t) => { Object.values(teamFigs).forEach((f) => poseFigure(f, t)); });
  }

  // ---------- rooftop: sky pool + helipad ----------
  const roof = new THREE.Group(); roof.position.y = yRoof; root.add(roof);
  {
    const deck = Cy(roof, 26.5, 1.2, std({ color: '#cfc9be', roughness: 0.4, metalness: 0.1 }), [0, -1.2, 0]);
    Cy(roof, 26.9, 0.5, basic('#ffd9a8', 2.2), [0, -1.9, 0]);
    // pool water
    const poolMat = new THREE.MeshPhysicalMaterial({ color: '#0a8fa3', emissive: '#18d6ee', emissiveIntensity: 1.35, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.94, clearcoat: 1 });
    const pool = new THREE.Mesh(new THREE.RingGeometry(9.5, 23.8, 96, 1), poolMat); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.08; roof.add(pool);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(24.2, 0.22, 8, 128), std({ color: '#e7e3dc', roughness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.25; roof.add(rim);
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.2, 8, 96), std({ color: '#e7e3dc', roughness: 0.3 })); rim2.rotation.x = Math.PI / 2; rim2.position.y = 0.25; roof.add(rim2);
    const glassWall = new THREE.Mesh(new THREE.CylinderGeometry(25.4, 25.4, 1.4, 96, 1, true), M.glass); glassWall.position.y = 0.9; roof.add(glassWall);
    const edgeGlow = new THREE.Mesh(new THREE.TorusGeometry(25.4, 0.08, 6, 128), basic('#7fe7ff', 3)); edgeGlow.rotation.x = Math.PI / 2; edgeGlow.position.y = 1.6; roof.add(edgeGlow);
    // drum + helipad
    Cy(roof, 8.9, 7.5, std({ color: '#1b1f27', metalness: 0.8, roughness: 0.3 }), [0, 0, 0]);
    for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.283; Bx(roof, [0.12, 7, 0.12], basic('#ffd9a8', 2.2), [Math.cos(a) * 8.95, 0.2, Math.sin(a) * 8.95]); }
    const padTop = Cy(roof, 9.5, 0.4, std({ color: '#23262d', roughness: 0.6 }), [0, 7.5, 0]);
    const padTex = canvasTexture(512, 512, (c, w, h) => {
      c.fillStyle = '#23262d'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#ffffff'; c.lineWidth = 12; c.beginPath(); c.arc(w / 2, h / 2, 215, 0, 7); c.stroke();
      c.fillStyle = '#fff'; c.font = '700 260px "General Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', w / 2, h / 2 + 12);
    });
    const pad = new THREE.Mesh(new THREE.CircleGeometry(9.2, 64), new THREE.MeshBasicMaterial({ map: padTex })); pad.rotation.x = -Math.PI / 2; pad.position.y = 7.92; roof.add(pad);
    const lights = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 6.283;
      const m = new THREE.Mesh(sphGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? '#3dff9a' : '#ffffff').multiplyScalar(4) }));
      m.scale.setScalar(0.17); m.position.set(Math.cos(a) * 9.35, 8.05, Math.sin(a) * 9.35); roof.add(m); lights.push(m);
    }
    anim.push((t) => lights.forEach((l, i) => { l.material.color.set(i % 2 ? '#3dff9a' : '#ff3a2a').multiplyScalar(((Math.floor(t * 2) + i) % 2) ? 4.5 : 0.8); }));
    // eVTOL on the pad
    const ev = new THREE.Group(); ev.position.set(0, 8.1, 0); roof.add(ev);
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.8, 8, 16), std({ color: '#e8ebf1', metalness: 0.7, roughness: 0.2 })); hull.rotation.z = Math.PI / 2; hull.position.y = 1.1; ev.add(hull);
    Bx(ev, [4.8, 0.08, 1.1], std({ color: '#d4d9e2', metalness: 0.7, roughness: 0.3 }), [0, 1.35, 0]);
    for (const [x, z] of [[-1.9, -2.4], [1.9, -2.4], [-1.9, 2.4], [1.9, 2.4]]) {
      Cy(ev, 0.05, 0.9, M.steel, [x, 0.9, z * 0.4]);
      const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.04, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe3ff').multiplyScalar(1.2), transparent: true, opacity: 0.35 })); rot.position.set(x, 1.85, z * 0.7); ev.add(rot);
    }
    Bx(ev, [0.3, 0.05, 0.3], basic('#3dff9a', 4), [1.9, 1.0, 1.0]);
    ev.rotation.y = 0.5;
    // loungers + parasols + palms around the pool
    const rr = rng(77);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * 6.283 + 0.1, rad = 26.0 - 0.2;
      if (i % 3 === 0) {
        Cy(roof, 0.05, 2.8, M.steel, [Math.cos(a) * 20.5, 0.2, Math.sin(a) * 20.5]);
        const um = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.6, 12), std({ color: '#f2ece0', roughness: 0.9 })); um.position.set(Math.cos(a) * 20.5, 3.3, Math.sin(a) * 20.5); roof.add(um);
      } else {
        const l = Bx(roof, [0.7, 0.28, 1.9], std({ color: '#f2ece0', roughness: 0.9 }), [Math.cos(a) * 21.3, 0.1, Math.sin(a) * 21.3]); l.rotation.y = -a;
      }
    }
    // inner cabana ring (glass pavilion at the drum foot)
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 2.9, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: '#d6e9ff', transparent: true, opacity: 0.16, roughness: 0.05, side: THREE.DoubleSide }));
    cab.position.y = 1.5; roof.add(cab);
    // swimmers: warm point lights in the water
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283; const l = new THREE.PointLight('#27dff0', 40, 16, 2); l.position.set(Math.cos(a) * 16.5, 0.5, Math.sin(a) * 16.5); roof.add(l); }
    const beacon = new THREE.Mesh(sphGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a1a').multiplyScalar(5) })); beacon.scale.setScalar(0.4); beacon.position.y = 9; roof.add(beacon);
    anim.push((t) => { beacon.material.color.set('#ff2a1a').multiplyScalar(Math.sin(t * 3) > 0 ? 6 : 0.3); poolMat.emissiveIntensity = 1.25 + Math.sin(t * 1.3) * 0.15; });
  }

  // interior lights follow the camera between levels
  const lightA = new THREE.PointLight('#ffd9b0', 300, 46, 1.6); const lightB = new THREE.PointLight('#ffe9d0', 200, 40, 1.6);
  root.add(lightA, lightB);
  const levelOfY = (y) => { for (let k = OPEN_LEVELS; k >= 0; k--) if (y >= levelY(k) - 1) return k; return 0; };

  const headPos = new THREE.Vector3();
  return {
    root, figures: teamFigs, rooms,
    update(t, camY) {
      const k = levelOfY(camY), k2 = clamp(k + 1, 0, OPEN_LEVELS);
      const lv = (kk) => levelY(kk) + levelH(kk) * 0.6;
      lightA.position.set(-6, lv(k), 2); lightB.position.set(7, lv(k2), 2);
      lightB.intensity = camY > levelY(OPEN_LEVELS + 1) ? 0 : (k2 === k ? 0 : 170);
      lightA.intensity = camY > levelY(OPEN_LEVELS + 2) ? 0 : 300;
      rooms.market.userData.near = k >= 3 && k <= 5;
      anim.forEach((f) => f(t));
    },
    setActiveMember(id) { for (const f of Object.values(teamFigs)) f.target = f.id === id ? 1 : 0; },
    memberHead(id, out = headPos) { const f = teamFigs[id]; return f.group.localToWorld(out.set(0, 2.05, 0)); },
  };
}
