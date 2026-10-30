import { THREE, clamp, lerp, smooth } from './util.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildSky, buildCity } from './city.js';
import { buildTower, levelY, LEVELS, FH } from './tower.js';
import { buildVillage, VC } from './village.js';

const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const eye = (k) => levelY(k) + (k === 0 ? 1.9 : 2.1);
const yRoof = levelY(LEVELS);

// explorer orbit helpers
const orbitPose = (o) => {
  const cp = Math.cos(o.pitch);
  return { p: new THREE.Vector3(o.target.x + o.dist * cp * Math.sin(o.yaw), o.target.y + o.dist * Math.sin(o.pitch), o.target.z + o.dist * cp * Math.cos(o.yaw)), l: o.target.clone() };
};
export const OVERVIEW = { target: new THREE.Vector3(VC.x, 0, VC.z), dist: 2500, pitch: 0.95, yaw: 0.55 };
const ov = orbitPose(OVERVIEW);

// Named camera poses: p = position, l = look-at, fov
export const CAMS = {
  hero:      { p: V3([-40, 2.8, 62]), l: V3([8, 62, -6]), fov: 64 },
  plaza:     { p: V3([-12, 2.1, 37]), l: V3([0, 12, 0]), fov: 62 },
  lobbyDoor: { p: V3([2, 2.0, 21]), l: V3([0, 2.9, -9]), fov: 58 },
  lobby:     { p: V3([5.5, 1.85, 12]), l: V3([-1, 2.4, -10]), fov: 64 },
  f1:        { p: V3([-4, eye(1), 26]), l: V3([1, eye(1) - 0.3, -7]), fov: 56 },
  f2:        { p: V3([4, eye(2), 26]), l: V3([-1, eye(2) - 0.3, -6]), fov: 56 },
  f3:        { p: V3([-4, eye(3), 26]), l: V3([1, eye(3) - 0.4, -7]), fov: 56 },
  f4:        { p: V3([3, eye(4), 26]), l: V3([-1, eye(4) - 0.4, -6]), fov: 56 },
  f5:        { p: V3([-3, eye(5), 26]), l: V3([1, eye(5) - 0.4, -6]), fov: 56 },
  f6:        { p: V3([0, eye(6) + 0.1, 25]), l: V3([0, eye(6) - 0.2, -5]), fov: 54 },
  ascent1:   { p: V3([26, levelY(14), 56]), l: V3([0, levelY(20), 0]), fov: 62 },
  ascent2:   { p: V3([-28, levelY(32), 50]), l: V3([0, levelY(40), 0]), fov: 62 },
  roofIn:    { p: V3([30, yRoof + 9, 40]), l: V3([0, yRoof + 3, 0]), fov: 58 },
  roofPool:  { p: V3([21, yRoof + 3.4, 19]), l: V3([-2, yRoof + 1.2, -6]), fov: 64 },
  roofHeli:  { p: V3([13, yRoof + 11, 17]), l: V3([0, yRoof + 9.2, 0]), fov: 60 },
  lift:      { p: V3([60, yRoof + 260, 210]), l: V3([900, yRoof - 60, -120]), fov: 56 },
  cruise:    { p: V3([3300, 1600, 800]), l: V3([VC.x, 0, VC.z]), fov: 50 },
  village:   { p: ov.p, l: ov.l, fov: 45 },
};

export function createScene(canvas, { quality = 'high' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'high', powerPreference: 'high-performance', alpha: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07091a');
  scene.fog = new THREE.FogExp2('#5a456a', 0.0011);

  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.05).texture;
  scene.environmentIntensity = 0.38;

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 22000);
  scene.add(new THREE.HemisphereLight('#a396d4', '#2a2030', 0.7));
  const sun = new THREE.DirectionalLight('#ffa878', 1.9);
  sun.position.set(-420, 90, 620); scene.add(sun);
  const fill = new THREE.DirectionalLight('#7f8cff', 0.35); fill.position.set(300, 200, -300); scene.add(fill);

  const sky = buildSky(); scene.add(sky);
  const city = buildCity(scene);
  const tower = buildTower(scene);
  const village = buildVillage(scene);
  const cityGroupRoots = scene.children.filter((c) => c !== sky && c !== village.group && !c.isLight);

  // ---------- post ----------
  let composer = null, bloom = null;
  const setupComposer = () => {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.65, 0.88);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  };

  let W = 1, H = 1, dpr = 1;
  const setQuality = (q) => {
    quality = q;
    dpr = q === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
    if (q === 'high') { if (!composer) setupComposer(); } else { composer = null; bloom = null; }
    resize(W, H);
  };
  const resize = (w, h) => {
    W = w; H = h;
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(dpr); composer.setSize(w, h); }
  };

  // ---------- director ----------
  let markers = [];                 // [{ y, cam }]
  let scrollY = 0;
  const target = { p: new THREE.Vector3().copy(CAMS.hero.p), l: new THREE.Vector3().copy(CAMS.hero.l), fov: 66 };
  const cur = { p: target.p.clone(), l: target.l.clone(), fov: 66 };
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const poseAt = (y) => {
    if (!markers.length) return CAMS.hero;
    if (y <= markers[0].y) return CAMS[markers[0].cam];
    for (let i = 0; i < markers.length - 1; i++) {
      const a = markers[i], b = markers[i + 1];
      if (y >= a.y && y <= b.y) {
        const t = smooth((y - a.y) / Math.max(1, b.y - a.y));
        const A = CAMS[a.cam], B = CAMS[b.cam];
        return { p: tmpA.copy(A.p).lerp(B.p, t), l: tmpB.copy(A.l).lerp(B.l, t), fov: lerp(A.fov, B.fov, t) };
      }
    }
    return CAMS[markers[markers.length - 1].cam];
  };

  // ---------- explorer orbit ----------
  const orbit = { cur: { ...OVERVIEW, target: OVERVIEW.target.clone() }, tgt: { ...OVERVIEW, target: OVERVIEW.target.clone() } };
  let ex = 0, exTarget = 0, lastInput = -99;
  const explorer = {
    setActive(on) { exTarget = on ? 1 : 0; if (!on) this.reset(); },
    reset() { Object.assign(orbit.tgt, { ...OVERVIEW }); orbit.tgt.target = OVERVIEW.target.clone(); },
    drag(dx, dy) { orbit.tgt.yaw -= dx * 0.005; orbit.tgt.pitch = clamp(orbit.tgt.pitch + dy * 0.004, 0.18, 1.45); lastInput = performance.now(); },
    zoom(f) { orbit.tgt.dist = clamp(orbit.tgt.dist * f, 160, 4200); lastInput = performance.now(); },
    focusDistrict(d) {
      orbit.tgt.target = new THREE.Vector3(d.center.x, 0, d.center.z); orbit.tgt.dist = 640; orbit.tgt.pitch = 0.72; lastInput = performance.now();
    },
    focusProject(p) {
      orbit.tgt.target = new THREE.Vector3(p.pos.x, 20, p.pos.z); orbit.tgt.dist = 260; orbit.tgt.pitch = 0.6; lastInput = performance.now();
    },
  };

  const proj = new THREE.Vector3();
  const api = {
    renderer, scene, camera, tower, village, explorer,
    setMarkers(m) { markers = m.sort((a, b) => a.y - b.y); },
    setScroll(y) { scrollY = y; },
    jump(name) { const c = CAMS[name]; markers = [{ y: -1e9, cam: name }, { y: 1e9, cam: name }]; cur.p.copy(c.p); cur.l.copy(c.l); cur.fov = c.fov; },
    setQuality, resize,
    project(v, out = { x: 0, y: 0, vis: false }) {
      proj.copy(v).project(camera);
      out.x = (proj.x * 0.5 + 0.5) * W; out.y = (-proj.y * 0.5 + 0.5) * H; out.vis = proj.z < 1 && proj.z > -1;
      return out;
    },
    get quality() { return quality; },
    get explorerAmount() { return ex; },
    levelAt() { const y = camera.position.y; return y < 7 ? 0 : Math.min(LEVELS, 1 + Math.floor((y - 7) / FH)); },
    frame(t, dt) {
      // director pose with scroll damping
      const p = poseAt(scrollY);
      const k = 1 - Math.exp(-dt * 7.5);
      target.p.copy(p.p); target.l.copy(p.l); target.fov = p.fov;
      cur.p.lerp(target.p, k); cur.l.lerp(target.l, k); cur.fov += (target.fov - cur.fov) * k;

      // explorer
      ex += (exTarget - ex) * (1 - Math.exp(-dt * 3));
      if (ex > 0.001) {
        const idle = performance.now() - lastInput > 5000;
        if (idle && exTarget) orbit.tgt.yaw += dt * 0.025;
        const o = orbit.cur, g = orbit.tgt, kk = 1 - Math.exp(-dt * 3.2);
        o.yaw += (g.yaw - o.yaw) * kk; o.pitch += (g.pitch - o.pitch) * kk; o.dist += (g.dist - o.dist) * kk; o.target.lerp(g.target, kk);
      }
      const pos = tmpA.copy(cur.p), look = tmpB.copy(cur.l);
      let fov = cur.fov;
      if (ex > 0.001) {
        const op = orbitPose(orbit.cur);
        const e = smooth(ex);
        pos.lerp(op.p, e); look.lerp(op.l, e); fov = lerp(fov, 45, e);
      }
      // gentle handheld drift while a floor is on screen
      const near = pos.x < 100 && pos.y < yRoof + 40 ? 1 : 0;
      pos.x += Math.sin(t * 0.33) * 0.35 * near; pos.y += Math.sin(t * 0.47) * 0.12 * near;
      camera.position.copy(pos); camera.lookAt(look);
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }

      // atmosphere vs altitude
      const alt = clamp(camera.position.y / 1100, 0, 1);
      scene.fog.density = lerp(0.0011, 0.00004, smooth(alt));
      scene.fog.color.set('#5a456a').lerp(new THREE.Color('#2d2a52'), alt * 0.7);
      sky.position.copy(camera.position);

      // visibility culling between the two worlds
      const inVillage = camera.position.x > 1600;
      village.group.visible = inVillage || camera.position.y > 260;
      cityGroupRoots.forEach((o) => { o.visible = camera.position.x < 3600; });

      city.update(t);
      tower.update(t, camera.position.y);
      village.update(t);
      if (bloom) bloom.strength = lerp(0.5, 0.42, alt);
      (composer || renderer).render(...(composer ? [dt] : [scene, camera]));
    },
  };
  setQuality(quality);
  return api;
}
