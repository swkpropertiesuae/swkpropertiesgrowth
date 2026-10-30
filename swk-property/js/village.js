import { THREE, rng, canvasTexture, facadeTextures, mergeGeometries, clamp } from './util.js';
import { DEVELOPERS, STATUS } from './data.js';

// SWK Village: one hexagonal district per developer; inside each district every
// project is a "city" (cluster) styled by status:
//   completed → warm, fully lit      ongoing → cyan wireframe + cranes      launched → violet hologram
export const VC = new THREE.Vector3(5000, 0, 0);   // village centre in world space
export const HEX_R = 210;
const SPACING_X = Math.sqrt(3) * HEX_R, SPACING_Z = 1.5 * HEX_R;
export const STATUS_COL = { completed: '#f2d9a4', ongoing: '#4fd1ff', launched: '#c58bff' };

const hexPos = (q, r) => new THREE.Vector3(VC.x + SPACING_X * (q + r / 2), 0, VC.z + SPACING_Z * r);

function spiral(maxRing = 3) {
  const cells = [];
  for (let q = -maxRing; q <= maxRing; q++) for (let r = -maxRing; r <= maxRing; r++) {
    const s = -q - r; const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
    if (ring <= maxRing) cells.push({ q, r, ring, ang: Math.atan2(r * 1.5, q + r / 2) });
  }
  cells.sort((a, b) => a.ring - b.ring || a.ang - b.ang);
  return cells;
}

function cluster(kind, r) {
  const out = [];
  const add = (x, z, w, d, h) => out.push({ x, z, w, d, h });
  if (kind === 'tower') {
    const n = 4 + Math.floor(r() * 4);
    add(0, 0, 13 + r() * 5, 13 + r() * 5, 90 + r() * 80);
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + r(), rad = 17 + r() * 14; add(Math.cos(a) * rad, Math.sin(a) * rad, 9 + r() * 6, 9 + r() * 6, 38 + r() * 90); }
  } else if (kind === 'villa') {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (r() > 0.12) add(-26 + i * 13 + (r() - 0.5) * 2, -26 + j * 13 + (r() - 0.5) * 2, 8 + r() * 2, 6.5 + r() * 2, 4 + r() * 3);
  } else if (kind === 'mixed') {
    add(-9, -6, 14, 14, 85 + r() * 50); add(10, 8, 12, 12, 70 + r() * 50);
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.283, rad = 26 + r() * 6; add(Math.cos(a) * rad, Math.sin(a) * rad, 9 + r() * 4, 8 + r() * 4, 14 + r() * 24); }
  } else if (kind === 'island') {
    for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.283, rad = 26; add(Math.cos(a) * rad, Math.sin(a) * rad, 8 + r() * 3, 8 + r() * 3, 12 + r() * 30); }
    add(0, 0, 6, 6, 5);
  } else { // retail
    add(-4, 0, 34, 20, 9 + r() * 4); add(18, 14, 16, 12, 6); add(-16, -17, 16, 11, 5);
  }
  return out;
}

export function buildVillage(scene) {
  const g = new THREE.Group(); scene.add(g);

  // ----- terrain: sand island in a turquoise sea -----
  {
    const size = 7200;
    const tex = canvasTexture(2048, 2048, (c, w, h) => {
      const rr = rng(4);
      const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      const k = (m) => m / (size / 2);
      gr.addColorStop(0, '#6e6248'); gr.addColorStop(k(1200), '#7a6c50'); gr.addColorStop(k(1500), '#b8a781');
      gr.addColorStop(k(1620), '#d8c99f'); gr.addColorStop(k(1720), '#37b3b0'); gr.addColorStop(k(2100), '#12708a'); gr.addColorStop(k(2800), '#0a3d5c'); gr.addColorStop(1, '#06203a');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 7000; i++) { c.fillStyle = `rgba(${rr() > 0.5 ? '255,255,255' : '0,0,0'},${rr() * 0.04})`; c.fillRect(rr() * w, rr() * h, 2 + rr() * 8, 2 + rr() * 8); }
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0.05, envMapIntensity: 0.6 }));
    m.rotation.x = -Math.PI / 2; m.position.copy(VC); m.position.y = -0.5; g.add(m);
  }

  // ----- assign developers to hexes (largest nearest the centre) -----
  const cells = spiral(3);
  const devs = DEVELOPERS.map((d, i) => ({ d, i })).sort((a, b) => b.d.projects.length - a.d.projects.length || a.i - b.i);
  const districts = [];
  const hqCell = cells[0];
  const hq = { id: 'swk-hq', name: 'SWK Plaza', hq: true, center: hexPos(hqCell.q, hqCell.r), projects: [], hue: 0.12 };

  const plateGeo = new THREE.CylinderGeometry(HEX_R * 0.97, HEX_R * 0.97, 1.6, 6);
  const mkRing = (ro, ri) => {
    const v = [], idx = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.2832; v.push(Math.sin(a) * ro, 0, Math.cos(a) * ro, Math.sin(a) * ri, 0, Math.cos(a) * ri); }
    for (let i = 0; i < 6; i++) { const a = i * 2, b = ((i + 1) % 6) * 2; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); return geo;
  };
  const ringGeo = mkRing(HEX_R * 0.97, HEX_R * 0.945);

  const makePlate = (center, hue, dim = false) => {
    const col = new THREE.Color().setHSL(hue, 0.4, dim ? 0.08 : 0.11);
    const plateMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9, metalness: 0.1 });
    const plate = new THREE.Mesh(plateGeo, plateMat); plate.position.copy(center); plate.position.y = 0.4; g.add(plate);
    const rcol = new THREE.Color().setHSL(hue, 0.85, 0.6).multiplyScalar(dim ? 0.5 : 1.3);
    const ringMat = new THREE.MeshBasicMaterial({ color: rcol, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat); ring.position.copy(center); ring.position.y = 1.4; g.add(ring);
    return { plateMat, ringMat, baseRing: rcol.clone(), baseSel: new THREE.Color().setHSL(hue, 0.9, 0.7).multiplyScalar(3.2), sel: 0, target: 0 };
  };
  hq.plate = makePlate(hq.center, 0.12);

  const statusBuild = { completed: [], ongoing: [], launched: [] };
  const edgeBuild = { ongoing: [], launched: [] };
  const craneBuild = [];
  const beamInst = [];
  const pads = { pave: [], lawn: [], sand: [], lagoon: [] };

  const facades = {
    completed: facadeTextures(61, { litChance: 0.6, warmBias: 0.95, tint: [60, 52, 44] }),
    ongoing: facadeTextures(62, { litChance: 0.3, warmBias: 0.05, tint: [20, 50, 70] }),
  };

  const addBuilding = (status, cx, cz, b, r) => {
    const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
    const uv = geo.attributes.uv, n = geo.attributes.normal;
    const off = r();
    for (let i = 0; i < uv.count; i++) {
      const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
      if (ny > 0.5) { uv.setXY(i, 0.02, 0.02); continue; }
      uv.setXY(i, uv.getX(i) * (nx > 0.5 ? b.d : b.w) / 30 + off, uv.getY(i) * b.h / 36);
    }
    geo.translate(cx + b.x, b.h / 2, cz + b.z);
    statusBuild[status].push(geo);
    if (status !== 'completed') {
      const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(b.w, b.h, b.d)); e.translate(cx + b.x, b.h / 2, cz + b.z);
      edgeBuild[status].push(e);
    }
  };

  const labelsData = [];
  devs.forEach(({ d }, di) => {
    const cell = cells[1 + di];
    const hue = (di * 0.137 + 0.02) % 1;
    const center = hexPos(cell.q, cell.r);
    const dist = { id: d.id, name: d.name, hq: d.hq, dev: d, center, hue, projects: [] };
    dist.plate = makePlate(center, hue);
    // developer monolith in the middle
    const mono = new THREE.Mesh(new THREE.BoxGeometry(5, 46, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(hue, 0.8, 0.65).multiplyScalar(1.7) }));
    mono.position.set(center.x, 23, center.z); g.add(mono);
    const n = d.projects.length;
    const rad = n === 1 ? 0 : HEX_R * 0.52;
    const rr = rng(1000 + di * 17);
    d.projects.forEach((p, pi) => {
      const [name, location, status, kind, year] = p;
      const a = (pi / n) * 6.2832 + 0.35;
      const pos = new THREE.Vector3(center.x + Math.cos(a) * rad, 0, center.z + Math.sin(a) * rad);
      const proj = { name, location, status, kind, year, dev: d, pos, id: `${d.id}-${pi}` };
      dist.projects.push(proj);
      // pad under the cluster
      const m = new THREE.Matrix4();
      if (kind === 'island') {
        m.compose(new THREE.Vector3(pos.x, 0.9, pos.z), new THREE.Quaternion(), new THREE.Vector3(42, 1, 42)); pads.sand.push(m.clone());
        m.compose(new THREE.Vector3(pos.x, 1.2, pos.z), new THREE.Quaternion(), new THREE.Vector3(15, 1, 15)); pads.lagoon.push(m.clone());
      } else if (kind === 'villa') {
        m.compose(new THREE.Vector3(pos.x, 0.9, pos.z), new THREE.Quaternion(), new THREE.Vector3(76, 1, 76)); pads.lawn.push(m.clone());
      } else {
        m.compose(new THREE.Vector3(pos.x, 0.9, pos.z), new THREE.Quaternion(), new THREE.Vector3(40, 1, 40)); pads.pave.push(m.clone());
      }
      const blds = cluster(kind, rr);
      blds.forEach((b) => addBuilding(status === 'launched' ? 'launched' : status, pos.x, pos.z, b, rr));
      if (status === 'ongoing') {
        const tallest = blds.reduce((a2, b2) => (b2.h > a2.h ? b2 : a2), blds[0]);
        const cx = pos.x + tallest.x + tallest.w * 0.7, cz = pos.z + tallest.z;
        craneBuild.push({ x: cx, z: cz, h: tallest.h + 18 });
      }
      // beacon
      const bh = 120 + (pi % 3) * 20;
      beamInst.push({ pos: new THREE.Vector3(pos.x, bh / 2 + 2, pos.z), h: bh, color: new THREE.Color(STATUS_COL[status]) });
      proj.pinY = bh + 6;
    });
    districts.push(dist);
  });

  // empty hexes = open plots
  const used = 1 + devs.length;
  const open = [];
  for (let i = used; i < cells.length; i++) { const c = hexPos(cells[i].q, cells[i].r); makePlate(c, 0.6, true); open.push(c); }

  // ----- merged building meshes -----
  const mkMat = (status) => {
    if (status === 'completed') return new THREE.MeshStandardMaterial({ map: facades.completed.map, emissiveMap: facades.completed.emissive, emissive: '#fff', emissiveIntensity: 1.15, roughness: 0.55, metalness: 0.2, envMapIntensity: 0.9 });
    if (status === 'ongoing') return new THREE.MeshStandardMaterial({ map: facades.ongoing.map, emissiveMap: facades.ongoing.emissive, emissive: '#fff', emissiveIntensity: 0.9, roughness: 0.5, metalness: 0.2, transparent: true, opacity: 0.85 });
    return new THREE.MeshBasicMaterial({ color: new THREE.Color('#9d5cff').multiplyScalar(0.8), transparent: true, opacity: 0.2, depthWrite: false });
  };
  for (const st of ['completed', 'ongoing']) {
    facades[st].map.wrapS = facades[st].map.wrapT = facades[st].emissive.wrapS = facades[st].emissive.wrapT = THREE.RepeatWrapping;
  }
  for (const st of ['completed', 'ongoing', 'launched']) {
    if (!statusBuild[st].length) continue;
    g.add(new THREE.Mesh(mergeGeometries(statusBuild[st]), mkMat(st)));
  }
  for (const st of ['ongoing', 'launched']) {
    if (!edgeBuild[st].length) continue;
    g.add(new THREE.LineSegments(mergeGeometries(edgeBuild[st]), new THREE.LineBasicMaterial({ color: new THREE.Color(STATUS_COL[st]).multiplyScalar(st === 'launched' ? 2.4 : 1.8), transparent: true, opacity: 0.9 })));
  }

  // cranes
  {
    const geos = [];
    for (const c of craneBuild) {
      const mast = new THREE.BoxGeometry(1.4, c.h, 1.4); mast.translate(c.x, c.h / 2, c.z); geos.push(mast);
      const jib = new THREE.BoxGeometry(40, 1, 1); jib.translate(c.x + 12, c.h + 1.5, c.z); geos.push(jib);
      const cj = new THREE.BoxGeometry(8, 3, 3); cj.translate(c.x - 12, c.h + 1.5, c.z); geos.push(cj);
    }
    if (geos.length) g.add(new THREE.Mesh(mergeGeometries(geos), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff9b3d').multiplyScalar(1.5) })));
  }

  // beacons (pins from altitude)
  {
    const geo = new THREE.CylinderGeometry(1.1, 1.1, 1, 8, 1, true);
    const bm = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), beamInst.length);
    const hm = new THREE.InstancedMesh(new THREE.SphereGeometry(3, 10, 8), new THREE.MeshBasicMaterial({}), beamInst.length);
    const m = new THREE.Matrix4(); const sc = new THREE.Vector3(), q = new THREE.Quaternion();
    beamInst.forEach((b, i) => {
      m.compose(b.pos, q, sc.set(1, b.h, 1)); bm.setMatrixAt(i, m);
      bm.setColorAt(i, b.color.clone().multiplyScalar(1.6));
      m.compose(new THREE.Vector3(b.pos.x, b.h + 4, b.pos.z), q, sc.set(1, 1, 1)); hm.setMatrixAt(i, m);
      hm.setColorAt(i, b.color.clone().multiplyScalar(4));
    });
    g.add(bm, hm);
  }

  // ----- pads -----
  const padDefs = [['pave', '#2b303b', 1, 24], ['lawn', '#24503a', 1, 4], ['sand', '#d8c598', 1, 32], ['lagoon', '#2cc0cf', 1, 32]];
  for (const [k, col, , seg] of padDefs) {
    if (!pads[k].length) continue;
    const geo = k === 'lawn' ? new THREE.BoxGeometry(1, 0.4, 1) : new THREE.CylinderGeometry(0.5, 0.5, 0.4, seg);
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.85, emissive: k === 'lagoon' ? '#118fa0' : '#000', emissiveIntensity: 0.7 });
    const im = new THREE.InstancedMesh(geo, mat, pads[k].length); pads[k].forEach((m, i) => im.setMatrixAt(i, m)); g.add(im);
  }

  // ----- SWK Plaza (HQ) tower replica -----
  {
    const t = new THREE.Group(); t.position.copy(hq.center); g.add(t);
    const ft = facadeTextures(11, { litChance: 0.5, tint: [18, 36, 66] });
    ft.map.wrapS = ft.map.wrapT = ft.emissive.wrapS = ft.emissive.wrapT = THREE.RepeatWrapping;
    ft.map.repeat.set(2, 6); ft.emissive.repeat.set(2, 6);
    const body = new THREE.Mesh(new THREE.BoxGeometry(38, 220, 30), new THREE.MeshStandardMaterial({ map: ft.map, emissiveMap: ft.emissive, emissive: '#fff', emissiveIntensity: 1, metalness: 0.5, roughness: 0.2 }));
    body.position.y = 110; t.add(body);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(26, 1, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7fe7ff').multiplyScalar(3) })); halo.rotation.x = Math.PI / 2; halo.position.y = 222; t.add(halo);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 700, 8, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd49a').multiplyScalar(1.6), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = 350; t.add(beam);
    // podium
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(70, 76, 3, 48), new THREE.MeshStandardMaterial({ color: '#2a2f3a', roughness: 0.6, emissive: '#c9a96e', emissiveIntensity: 0.12 })); pod.position.y = 2; t.add(pod);
  }

  // ----- selection state -----
  const byId = Object.fromEntries(districts.map((d) => [d.id, d]));
  const select = (id) => { for (const d of districts) d.plate.target = d.id === id ? 1 : 0; hq.plate.target = id === 'swk-hq' ? 1 : 0; };
  const update = (t) => {
    for (const d of [...districts, hq]) {
      const p = d.plate; p.sel += (p.target - p.sel) * 0.12;
      p.ringMat.color.copy(p.baseRing).lerp(p.baseSel, p.sel);
      p.plateMat.emissive.copy(p.baseRing).multiplyScalar(0.05 + p.sel * 0.16);
    }
  };

  return { group: g, districts, hq, byId, open, select, update, center: VC };
}

// ----- DOM labels (Google Earth Studio style): developer names + project pins -----
export function makeLabels(container, village, { onPickDistrict, onPickProject }) {
  const v = new THREE.Vector3();
  const all = [village.hq, ...village.districts];
  const devEls = all.map((d) => {
    const el = document.createElement('button');
    el.className = 'gl-label'; el.type = 'button';
    el.append(document.createElement('i'), Object.assign(document.createElement('span'), { textContent: d.hq ? 'SWK PLAZA · HQ' : d.name }));
    el.addEventListener('click', () => onPickDistrict(d.id));
    container.appendChild(el); return el;
  });
  const pinEls = [];
  const ensurePins = (d) => {
    if (d._pins) return d._pins;
    d._pins = d.projects.map((p) => {
      const el = document.createElement('button');
      el.className = 'gl-pin'; el.type = 'button'; el.dataset.status = p.status;
      el.append(document.createElement('i'), Object.assign(document.createElement('span'), { textContent: p.name }), Object.assign(document.createElement('em'), { textContent: STATUS[p.status].label }));
      el.addEventListener('click', () => onPickProject(p));
      container.appendChild(el); pinEls.push(el); return el;
    });
    return d._pins;
  };
  let selected = null, showAll = false;
  return {
    setSelected(id) { selected = id; },
    update(camera, w, h, active) {
      const cp = camera.position;
      all.forEach((d, i) => {
        const el = devEls[i];
        v.set(d.center.x, d.hq ? 250 : 58, d.center.z);
        const dist = cp.distanceTo(v);
        v.project(camera);
        const ok = active && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 && dist < 5200;
        el.style.opacity = ok ? (selected && selected !== d.id ? 0.4 : 1) : 0;
        el.style.pointerEvents = ok ? 'auto' : 'none';
        if (ok) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
        el.classList.toggle('is-sel', selected === d.id);
      });
      pinEls.forEach((el) => { el.style.opacity = 0; el.style.pointerEvents = 'none'; });
      const d = selected && village.byId[selected];
      if (d && active) {
        const pins = ensurePins(d);
        d.projects.forEach((p, i) => {
          v.set(p.pos.x, p.pinY + 10, p.pos.z); v.project(camera);
          const ok = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
          const el = pins[i];
          el.style.opacity = ok ? 1 : 0; el.style.pointerEvents = ok ? 'auto' : 'none';
          if (ok) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
        });
      }
    },
  };
}
