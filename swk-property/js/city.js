import { THREE, rng, canvasTexture, textTexture, facadeTextures, concreteTexture, mergeGeometries, clamp } from './util.js';

// World layout (metres). SWK tower sits at the origin and faces +z.
//   plaza  z 15..48      Sheikh Zayed Road carriageway A  z 49.5..67.5 (traffic → +x)
//   metro viaduct z 71   carriageway B  z 74.5..92.5 (traffic → −x)
//   Emirates Towers metro station on the median at x ≈ −60
//   Emirates Towers at x ≈ −150 / −105 behind the plaza
export const ROAD = { aZ0: 49.5, aZ1: 67.5, bZ0: 74.5, bZ1: 92.5, mid: 71 };

const mat = (o) => new THREE.MeshStandardMaterial(o);

export function buildSky() {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(12000, 40, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        top: { value: new THREE.Color('#0c1642') },
        mid: { value: new THREE.Color('#5a4a9a') },
        hor: { value: new THREE.Color('#ff8f62') },
        glow: { value: new THREE.Color('#ffb078') },
        sunDir: { value: new THREE.Vector3(-0.62, 0.05, 0.78).normalize() },
        night: { value: 0 },
      },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `
        varying vec3 vP; uniform vec3 top, mid, hor, glow, sunDir; uniform float night;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
        float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
        void main(){
          vec3 d = normalize(vP); float h = d.y;
          vec3 hz = mix(hor, hor*vec3(.35,.3,.45), night);
          vec3 c = mix(hz, mid, smoothstep(0.0, 0.3, h));
          c = mix(c, top, smoothstep(0.3, 1.0, h));
          c = mix(c, hz*0.35, smoothstep(0.0, -0.25, h));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          c += glow * (pow(s, 18.0)*0.9 + pow(s, 3.0)*0.18) * (1.0 - night*0.7);
          // clouds
          vec2 uv = d.xz / (abs(h) + 0.18);
          float cl = smoothstep(0.52, 0.9, fbm(uv*1.4 + 3.0)) * smoothstep(0.0, 0.1, h) * (1.0 - smoothstep(0.35, 0.6, h));
          vec3 cc = mix(vec3(0.95,0.55,0.5), vec3(0.28,0.25,0.4), smoothstep(0.0, 0.3, h));
          c = mix(c, cc*(0.5+s*0.9), cl*0.55);
          // stars
          vec2 sg = floor(d.xz/(abs(d.y)+0.4)*160.0);
          float st = step(0.9965, h21(sg)) * smoothstep(0.22, 0.55, h);
          c += vec3(st) * (0.6 + 0.4*h21(sg+3.0));
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  return sky;
}

function roadTexture(laneDash = true) {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = '#1b1d23'; g.fillRect(0, 0, w, h);
    const r = rng(4);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(255,255,255,${r() * 0.035})`; g.fillRect(r() * w, r() * h, 2, 2);
    }
    if (laneDash) {
      g.fillStyle = 'rgba(235,235,235,0.9)';
      g.fillRect(0, h - 3, w * 0.34, 3);
    }
  }, { repeat: [120, 5], aniso: 8 });
}

export function buildCity(scene) {
  const g = new THREE.Group();
  scene.add(g);
  const anim = [];

  // ----- ground -----
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000),
    mat({ color: '#14120f', roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.2; g.add(ground);

  // plaza
  const plazaTex = concreteTexture(2, '#2b2d33');
  plazaTex.repeat.set(60, 8);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(520, 34), mat({ map: plazaTex, roughness: 0.55, metalness: 0.15 }));
  plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.02, 32); g.add(plaza);
  // warm LED paving lines
  const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc68a').multiplyScalar(2.4) });
  for (let i = -5; i <= 5; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 30), ledMat);
    l.position.set(i * 7, 0.06, 32); g.add(l);
  }

  // ----- Sheikh Zayed Road -----
  const mkStrip = (z0, z1, lanes, tex) => {
    const t = tex.clone(); t.needsUpdate = true; t.repeat.set(120, lanes);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1440, z1 - z0), mat({ map: t, roughness: 0.42, metalness: 0.25, envMapIntensity: 1.4 }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, 0.03, (z0 + z1) / 2); g.add(m);
  };
  const rt = roadTexture();
  mkStrip(ROAD.aZ0, ROAD.aZ1, 5, rt);
  mkStrip(ROAD.bZ0, ROAD.bZ1, 5, rt);
  const median = new THREE.Mesh(new THREE.BoxGeometry(1440, 0.5, ROAD.bZ0 - ROAD.aZ1),
    mat({ map: concreteTexture(5, '#44474e'), roughness: 0.8 }));
  median.position.set(0, 0.25, ROAD.mid); g.add(median);
  const kerbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff1d8').multiplyScalar(1.5) });
  for (const z of [ROAD.aZ0 - 0.2, ROAD.aZ1 + 0.1, ROAD.bZ0 - 0.1, ROAD.bZ1 + 0.2]) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(1440, 0.04, 0.18), kerbMat);
    k.position.set(0, 0.06, z); g.add(k);
  }
  // far-side pavement
  const far = new THREE.Mesh(new THREE.PlaneGeometry(1440, 30), mat({ color: '#25262b', roughness: 0.7 }));
  far.rotation.x = -Math.PI / 2; far.position.set(0, 0.02, 108); g.add(far);

  // ----- traffic -----
  const CARS = 64;
  const carGeo = new THREE.BoxGeometry(4.3, 1.25, 1.85);
  const carMat = mat({ color: '#ffffff', roughness: 0.25, metalness: 0.7 });
  const lightGeo = new THREE.BoxGeometry(0.35, 0.22, 1.5);
  const makeTraffic = (z0, z1, dir) => {
    const body = new THREE.InstancedMesh(carGeo, carMat, CARS);
    const lampsF = new THREE.InstancedMesh(lightGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff6dc').multiplyScalar(4) }), CARS);
    const lampsR = new THREE.InstancedMesh(lightGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a1a').multiplyScalar(3.2) }), CARS);
    const r = rng(dir > 0 ? 21 : 22);
    const cars = [];
    const cols = ['#d9d9dc', '#18191c', '#8a8f98', '#7a1d1d', '#e8e2d0', '#1c2a44', '#2b2b30'];
    for (let i = 0; i < CARS; i++) {
      const lane = Math.floor(r() * 5);
      cars.push({ x: (r() - 0.5) * 1400, z: z0 + 1.8 + lane * 3.6 + (r() - 0.5) * 0.4, v: (16 + lane * 3.2 + r() * 4) * dir, h: 0.65 + r() * 0.15 });
      body.setColorAt(i, new THREE.Color(cols[Math.floor(r() * cols.length)]));
    }
    const m = new THREE.Matrix4();
    const upd = (t) => {
      for (let i = 0; i < CARS; i++) {
        const c = cars[i];
        let x = ((c.x + c.v * t + 700) % 1400 + 1400) % 1400 - 700;
        m.makeTranslation(x, c.h, c.z); body.setMatrixAt(i, m);
        m.makeTranslation(x + dir * 2.2, 0.62, c.z); lampsF.setMatrixAt(i, m);
        m.makeTranslation(x - dir * 2.2, 0.72, c.z); lampsR.setMatrixAt(i, m);
      }
      body.instanceMatrix.needsUpdate = lampsF.instanceMatrix.needsUpdate = lampsR.instanceMatrix.needsUpdate = true;
    };
    [body, lampsF, lampsR].forEach((o) => { o.frustumCulled = false; g.add(o); });
    anim.push(upd);
  };
  makeTraffic(ROAD.aZ0, ROAD.aZ1, 1);
  makeTraffic(ROAD.bZ0, ROAD.bZ1, -1);

  // street lights along the median
  {
    const N = 36;
    const poleGeo = new THREE.CylinderGeometry(0.16, 0.22, 13, 8); poleGeo.translate(0, 6.5, 0);
    const poles = new THREE.InstancedMesh(poleGeo, mat({ color: '#2a2d33', metalness: 0.6, roughness: 0.4 }), N);
    const lampGeo = new THREE.SphereGeometry(0.55, 10, 8);
    const lamps = new THREE.InstancedMesh(lampGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd49a').multiplyScalar(5) }), N * 2);
    const m = new THREE.Matrix4();
    for (let i = 0; i < N; i++) {
      const x = -700 + i * 40 + 12;
      m.makeTranslation(x, 0, ROAD.mid); poles.setMatrixAt(i, m);
      m.makeTranslation(x, 13, ROAD.mid - 1.5); lamps.setMatrixAt(i * 2, m);
      m.makeTranslation(x, 13, ROAD.mid + 1.5); lamps.setMatrixAt(i * 2 + 1, m);
    }
    g.add(poles, lamps);
  }

  // ----- Dubai Metro viaduct + Emirates Towers station -----
  const viaMat = mat({ map: concreteTexture(8, '#7d828b'), roughness: 0.7 });
  const via = new THREE.Mesh(new THREE.BoxGeometry(1440, 1.4, 8.4), viaMat);
  via.position.set(0, 10.2, ROAD.mid); g.add(via);
  const pillarGeo = new THREE.BoxGeometry(2.6, 9.6, 2.8); pillarGeo.translate(0, 4.8, 0);
  const pillars = new THREE.InstancedMesh(pillarGeo, viaMat, 60);
  { const m = new THREE.Matrix4(); for (let i = 0; i < 60; i++) { m.makeTranslation(-708 + i * 24, 0, ROAD.mid); pillars.setMatrixAt(i, m); } }
  g.add(pillars);
  // rails
  for (const dz of [-1.6, 1.6]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1440, 0.14, 0.14), mat({ color: '#9aa0aa', metalness: 1, roughness: 0.25 }));
    rail.position.set(0, 11.0, ROAD.mid + dz); g.add(rail);
  }

  // station concourse (arched shell)
  const st = new THREE.Group(); st.position.set(-60, 10.9, ROAD.mid); g.add(st);
  const arch = (rx, ry, depth, inner = 0) => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, rx, ry, 0, Math.PI, false);
    s.lineTo(-rx, 0);
    if (inner) { const h = new THREE.Path(); h.absellipse(0, 0, rx - inner, ry - inner, 0, Math.PI, false); h.lineTo(-(rx - inner), 0); s.holes.push(h); }
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 24 });
    geo.rotateY(Math.PI / 2); geo.translate(-depth / 2, 0, 0);
    return geo;
  };
  const shell = new THREE.Mesh(arch(7.4, 5.2, 78),
    new THREE.MeshPhysicalMaterial({ color: '#cfe3f2', metalness: 0.2, roughness: 0.08, transparent: true, opacity: 0.28, side: THREE.DoubleSide, envMapIntensity: 1.6, depthWrite: false }));
  st.add(shell);
  const ribGeo = arch(7.55, 5.35, 0.5, 0.35);
  const ribMat = mat({ color: '#d7dde6', metalness: 0.9, roughness: 0.22 });
  for (let i = -6; i <= 6; i++) {
    const rib = new THREE.Mesh(ribGeo, ribMat); rib.position.x = i * 6.2; st.add(rib);
  }
  const platform = new THREE.Mesh(new THREE.BoxGeometry(78, 0.4, 13), mat({ color: '#b9b3a8', roughness: 0.4 }));
  platform.position.y = -0.2; st.add(platform);
  const glowFloor = new THREE.Mesh(new THREE.BoxGeometry(76, 0.05, 11), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b8').multiplyScalar(1.1) }));
  glowFloor.position.y = 0.06; st.add(glowFloor);
  const roofLight = new THREE.Mesh(new THREE.BoxGeometry(70, 0.25, 0.7), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4de').multiplyScalar(3) }));
  roofLight.position.set(0, 5.0, 0); st.add(roofLight);
  // sign
  const signTex = textTexture('EMIRATES TOWERS', { w: 1024, h: 160, font: '700 90px "General Sans", sans-serif', color: '#ffffff', bg: '#c8102e', letterSpacing: 6 });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.2), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
  sign.position.set(0, 7.9, 7.6); st.add(sign);
  const sign2 = sign.clone(); sign2.position.z = -7.6; sign2.rotation.y = Math.PI; st.add(sign2);
  const totemTex = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#c8102e'; c.beginPath(); c.arc(w / 2, h / 2, 118, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.font = '700 150px "General Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('M', w / 2, h / 2 + 10);
  });
  const totem = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ map: totemTex, toneMapped: false }));
  totem.position.set(-39.5, 4.4, 0); totem.rotation.y = Math.PI / 2; st.add(totem);

  // footbridge from the station down to the SWK plaza
  const bridge = new THREE.Group(); g.add(bridge);
  const bw = 4.6;
  const zA = ROAD.mid - 5, zB = 40;
  const len = Math.hypot(zA - zB, 10.4);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.35, len), mat({ color: '#c9c3b8', roughness: 0.5 }));
  // rises from y≈0.4 at the plaza (zB) to y≈10.8 at the station (zA)
  slab.position.set(-42, 5.6, (zA + zB) / 2);
  slab.rotation.x = -Math.atan2(10.4, zA - zB);
  bridge.add(slab);
  const roofB = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.8, 0.12, len), new THREE.MeshPhysicalMaterial({ color: '#cfe3f2', transparent: true, opacity: 0.3, roughness: 0.1 }));
  roofB.position.copy(slab.position).add(new THREE.Vector3(0, 3.2, 0)); roofB.rotation.copy(slab.rotation); bridge.add(roofB);
  for (const dx of [-bw / 2, bw / 2]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, len), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a8').multiplyScalar(2.6) }));
    rail.position.copy(slab.position).add(new THREE.Vector3(dx, 1.2, 0)); rail.rotation.copy(slab.rotation); bridge.add(rail);
  }

  // metro train (4 cars) loops along the viaduct
  const train = new THREE.Group(); g.add(train);
  const carBody = new THREE.BoxGeometry(17.6, 3.5, 3.1);
  const trainMat = mat({ color: '#e7eaef', metalness: 0.7, roughness: 0.22 });
  const winMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe9c4').multiplyScalar(1.6) });
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(carBody, trainMat); b.position.set(i * 18.2, 1.9, 0); train.add(b);
    const w = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.9, 3.2), winMat); w.position.set(i * 18.2, 2.4, 0); train.add(w);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(17.7, 0.3, 3.16), new THREE.MeshBasicMaterial({ color: '#c8102e' })); stripe.position.set(i * 18.2, 0.7, 0); train.add(stripe);
  }
  train.position.y = 11.1; train.position.z = ROAD.mid - 1.6;
  const train2 = train.clone(); train2.position.z = ROAD.mid + 1.6; train2.scale.x = -1; g.add(train2);
  anim.push((t) => {
    const T = 70, ph = (t % T) / T;
    const e = ph; // constant crawl-in, dwell at station, depart
    const x = 700 - 1400 * e;
    train.position.x = x;
    // second train runs the opposite direction with a dwell at the platform
    const k = ((t + 30) % T) / T;
    train2.position.x = -700 + 1400 * k;
  });

  // ----- Emirates Towers -----
  const towerMats = [];
  const emirates = (h, x, z, rotY, seed, R = 24) => {
    const grp = new THREE.Group();
    const ft = facadeTextures(seed, { cols: 8, rows: 8, litChance: 0.3, tint: [34, 52, 78] });
    ft.map.repeat.set(9, h / 29); ft.emissive.repeat.set(9, h / 29);
    ft.map.wrapS = ft.map.wrapT = ft.emissive.wrapS = ft.emissive.wrapT = THREE.RepeatWrapping;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h - 50, 3, 1),
      mat({ map: ft.map, emissiveMap: ft.emissive, emissive: '#ffffff', emissiveIntensity: 0.9, metalness: 0.55, roughness: 0.22, envMapIntensity: 1.6 }));
    body.position.y = (h - 50) / 2; grp.add(body);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.08, R, 50, 3, 1),
      mat({ color: '#9fb0c4', metalness: 0.95, roughness: 0.18, envMapIntensity: 2 }));
    top.position.y = h - 50 + 25; grp.add(top);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 40, 6), mat({ color: '#cdd5df', metalness: 1, roughness: 0.2 }));
    spire.position.y = h + 18; grp.add(spire);
    // vertical edge lights
    for (let i = 0; i < 3; i++) {
      const a = i * (Math.PI * 2 / 3);
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.5, h - 50, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd4ff').multiplyScalar(1.4) }));
      e.position.set(Math.sin(a) * R, (h - 50) / 2, Math.cos(a) * R); grp.add(e);
    }
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a1a').multiplyScalar(5) }));
    beacon.position.y = h + 38; grp.add(beacon); towerMats.push(beacon);
    grp.position.set(x, 0, z); grp.rotation.y = rotY;
    g.add(grp);
  };
  emirates(355, -158, -6, Math.PI / 6, 31, 25);   // Office Tower
  emirates(305, -104, -52, Math.PI / 2.2, 32, 22); // Hotel Tower
  anim.push((t) => { const on = (Math.sin(t * 2.4) > 0.2) ? 5 : 0.15; towerMats.forEach((b) => b.material.color.set('#ff2a1a').multiplyScalar(on)); });

  // ----- skyline -----
  const r = rng(77);
  const buckets = [facadeTextures(41, { litChance: 0.34 }), facadeTextures(42, { litChance: 0.22, tint: [30, 40, 56] }), facadeTextures(43, { litChance: 0.45, tint: [16, 40, 70] })];
  const geos = [[], [], []];
  const place = (x, z, w, d, h, b) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const uv = geo.attributes.uv;
    // scale uvs per face so windows stay a consistent size
    const n = geo.attributes.normal;
    for (let i = 0; i < uv.count; i++) {
      const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
      const du = nx > 0.5 ? d : w;
      if (ny > 0.5) { uv.setXY(i, 0.01, 0.01); continue; }
      uv.setXY(i, uv.getX(i) * du / 16 + r(), uv.getY(i) * h / 29 + r());
    }
    geo.translate(x, h / 2, z);
    geos[b].push(geo);
  };
  const free = (x, z) => !((Math.abs(x) < 55 && z > -40 && z < 56) || (x > -215 && x < -60 && z > -95 && z < 30) || (z > 45 && z < 100));
  let guard = 0;
  for (let i = 0; i < 360 && guard < 3000; guard++) {
    const side = r();
    let x, z;
    if (side < 0.45) { x = (r() - 0.5) * 1800; z = 112 + r() * 340; }            // across the road
    else if (side < 0.85) { x = (r() - 0.5) * 1800; z = -80 - r() * 500; }        // behind
    else { x = (r() < 0.5 ? -1 : 1) * (240 + r() * 600); z = (r() - 0.5) * 100; } // along the road
    if (!free(x, z)) continue;
    const w = 22 + r() * 34, d = 22 + r() * 34;
    const far = Math.hypot(x, z);
    const h = 45 + Math.pow(r(), 2.2) * (far > 500 ? 330 : 220);
    place(x, z, w, d, h, Math.floor(r() * 3)); i++;
  }
  buckets.forEach((t, k) => {
    t.map.wrapS = t.map.wrapT = t.emissive.wrapS = t.emissive.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(mergeGeometries(geos[k]), mat({ map: t.map, emissiveMap: t.emissive, emissive: '#ffffff', emissiveIntensity: 0.85, metalness: 0.5, roughness: 0.3, envMapIntensity: 1.2 }));
    g.add(m);
  });

  // Burj Khalifa lookalike far to the south-west
  {
    const burj = new THREE.Group();
    const ft = facadeTextures(55, { litChance: 0.25, tint: [60, 78, 100] });
    ft.map.wrapS = ft.map.wrapT = ft.emissive.wrapS = ft.emissive.wrapT = THREE.RepeatWrapping;
    ft.map.repeat.set(14, 28); ft.emissive.repeat.set(14, 28);
    const bm = mat({ map: ft.map, emissiveMap: ft.emissive, emissive: '#fff', emissiveIntensity: 0.8, metalness: 0.8, roughness: 0.2, envMapIntensity: 1.8 });
    let y = 0; const tiers = [[34, 150], [29, 130], [24, 120], [20, 110], [16, 100], [12, 90], [8, 70], [4.5, 40]];
    for (const [rad, hh] of tiers) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.86, rad, hh, 3), bm); c.position.y = y + hh / 2; c.rotation.y = y * 0.01; burj.add(c); y += hh;
    }
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.8, 140, 6), mat({ color: '#e6ebf2', metalness: 1, roughness: 0.2 }));
    sp.position.y = y + 70; burj.add(sp);
    const bc = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff2a1a').multiplyScalar(5) })); bc.position.y = y + 142; burj.add(bc);
    burj.position.set(-760, 0, -560); g.add(burj);
  }

  // ----- plaza: palms, bollards -----
  {
    const R = rng(5);
    const trunkG = new THREE.CylinderGeometry(0.22, 0.38, 9, 7); trunkG.translate(0, 4.5, 0);
    const frond = new THREE.PlaneGeometry(0.9, 5.2, 1, 4); frond.translate(0, 2.6, 0);
    // bend the frond downward
    const p = frond.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -0.075 * y * y); }
    frond.computeVertexNormals();
    const spots = [];
    for (let i = -9; i <= 9; i++) { if (Math.abs(i) < 2) continue; spots.push([i * 22 + (R() - 0.5) * 3, 22 + R() * 10]); }
    const trunks = new THREE.InstancedMesh(trunkG, mat({ color: '#6b5a49', roughness: 0.9 }), spots.length);
    const fronds = new THREE.InstancedMesh(frond, mat({ color: '#2f6b3d', roughness: 0.8, side: THREE.DoubleSide, emissive: '#06150a' }), spots.length * 11);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3();
    spots.forEach(([x, z], i) => {
      const hs = 0.85 + R() * 0.5;
      m.compose(pos.set(x, 0, z), q.identity(), s.set(hs, hs, hs)); trunks.setMatrixAt(i, m);
      for (let k = 0; k < 11; k++) {
        e.set(-0.9 - R() * 0.35, (k / 11) * Math.PI * 2 + R() * 0.3, 0, 'YXZ');
        q.setFromEuler(e);
        m.compose(pos.set(x, 9 * hs, z), q, s.set(hs, hs, hs)); fronds.setMatrixAt(i * 11 + k, m);
      }
    });
    g.add(trunks, fronds);
    // uplights under the palms
    const up = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(3) }), spots.length);
    spots.forEach(([x, z], i) => { m.makeTranslation(x, 0.08, z + 0.6); up.setMatrixAt(i, m); });
    g.add(up);
  }

  // ----- drones / eVTOL traffic around the tower -----
  const DR = 16;
  const drones = new THREE.InstancedMesh(new THREE.BoxGeometry(1.3, 0.28, 0.8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#9fe3ff').multiplyScalar(2.2) }), DR);
  const droneSpec = Array.from({ length: DR }, (_, i) => ({ rad: 55 + (i % 5) * 18, y: 20 + (i * 37) % 170, sp: (0.06 + (i % 4) * 0.02) * (i % 2 ? 1 : -1), ph: i * 1.7 }));
  anim.push((t) => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    droneSpec.forEach((d, i) => {
      const a = d.ph + t * d.sp;
      e.set(0, -a + Math.PI / 2 * Math.sign(d.sp), 0); q.setFromEuler(e);
      m.compose(new THREE.Vector3(Math.cos(a) * d.rad * 1.2, d.y + Math.sin(t * 0.6 + i) * 1.2, Math.sin(a) * d.rad * 0.8 + 6), q, new THREE.Vector3(1, 1, 1));
      drones.setMatrixAt(i, m);
    });
    drones.instanceMatrix.needsUpdate = true;
  });
  drones.frustumCulled = false; g.add(drones);

  return { update: (t) => anim.forEach((f) => f(t)) };
}
