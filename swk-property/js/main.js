import { DEVELOPERS, STATUS, LISTINGS, TEAM, DEALS, SHOW_SAMPLE_NOTE, AREAS, FAQ, totals } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(k));
  return n;
};
const fmtAED = (n) => 'AED ' + Math.round(n).toLocaleString('en-US');
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const PHONE = '971564330448', MAIL = 'info@swkpropertiesuae.com';
const KIND = { tower: 'High-rise', villa: 'Villas & townhouses', mixed: 'Mixed-use', island: 'Island / waterfront', retail: 'Retail & leisure' };
const T = totals();
let gl = null, markers = [], vh = innerHeight, activeFloor = null;

/* ------------------------------------------------------------------ static chrome */
$('#yr').textContent = new Date().getFullYear();
$('#statDev').textContent = T.developers;
$('#statProj').textContent = T.projects;
$('#nCompleted').textContent = T.completed; $('#nOngoing').textContent = T.ongoing; $('#nLaunched').textContent = T.launched;

if (store.get('swk-ann') === 'off') document.body.classList.add('ann-off');
$('.announce__x').addEventListener('click', () => { document.body.classList.add('ann-off'); store.set('swk-ann', 'off'); layout(); });
if (!store.get('swk-cookie')) $('#cookie').hidden = false;
$('#cookieOk').addEventListener('click', () => { $('#cookie').hidden = true; store.set('swk-cookie', '1'); });
$$('[data-dialog]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); $('#' + a.dataset.dialog).showModal(); }));
const burger = $('.nav__burger'), drawer = $('#drawer');
burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); drawer.hidden = !o; });
drawer.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); drawer.hidden = true; });

/* ------------------------------------------------------------------ developers (Level 01) */
const devGrid = $('#devGrid');
let hqFilter = 'all';
const northern = (h) => !['Dubai', 'Abu Dhabi'].includes(h);
function renderDevs() {
  const q = $('#devSearch').value.trim().toLowerCase();
  devGrid.replaceChildren();
  const list = DEVELOPERS.filter((d) => (hqFilter === 'all' || (hqFilter === 'north' ? northern(d.hq) : d.hq === hqFilter)) && (!q || d.name.toLowerCase().includes(q) || d.projects.some((p) => p[0].toLowerCase().includes(q))));
  if (!list.length) devGrid.append(el('li', { className: 'empty', textContent: 'No developers match — try a different search.' }));
  for (const d of list) {
    const dots = el('span', { className: 'dots', ariaHidden: 'true' });
    for (const p of d.projects) dots.append(el('i', { className: p[2][0] }));
    const b = el('button', { className: 'dev', type: 'button', title: `Open ${d.name} in SWK Village` }, el('b', { textContent: d.name }), el('small', { textContent: `${d.hq} · ${d.projects.length} project${d.projects.length > 1 ? 's' : ''}` }), dots);
    b.addEventListener('click', () => goVillage(d.id));
    devGrid.append(el('li', {}, b));
  }
}
$('#devSearch').addEventListener('input', renderDevs);
$('#devHq').addEventListener('click', (e) => {
  const b = e.target.closest('[data-hq]'); if (!b) return;
  hqFilter = b.dataset.hq; $$('#devHq .chip').forEach((c) => c.classList.toggle('is-on', c === b)); renderDevs();
});
renderDevs();

/* ------------------------------------------------------------------ listings (Level 02) */
const listings = $('#listings');
for (const l of LISTINGS) {
  const card = el('article', { className: 'glass listing' },
    el('img', { src: l.img, alt: `${l.title} — ${l.community}`, loading: 'lazy', width: 600, height: 400 }),
    el('div', { className: 'listing__b' },
      el('span', { className: 'badge', textContent: l.status }),
      el('h3', { textContent: l.title }),
      el('p', { className: 'price', textContent: `From ${fmtAED(l.price)}` }),
      el('p', { className: 'meta' }, el('span', { textContent: l.developer }), el('span', { textContent: l.community }), el('span', { textContent: l.type }), el('span', { textContent: `Handover ${l.handover}` }), el('span', { textContent: `Plan ${l.payment}` })),
      el('p', { textContent: l.blurb }),
      el('div', { className: 'cta-row', style: 'margin-top:8px' },
        (() => { const a = el('a', { className: 'btn btn--gold btn--sm', href: '#contact', textContent: 'Enquire' }); a.addEventListener('click', (e) => { e.preventDefault(); $('#fProject').value = l.title; goTo('contact'); }); return a; })(),
        el('a', { className: 'btn btn--ghost btn--sm', target: '_blank', rel: 'noopener', href: `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello SWK, I'm interested in ${l.title} (${l.developer}).`)}`, textContent: 'WhatsApp' }))));
  listings.append(card);
}

/* ------------------------------------------------------------------ insights (Level 04) */
const num = (id) => parseFloat($(id).value) || 0;
function calcMortgage() {
  const price = num('#mPrice'), down = num('#mDown'), rate = num('#mRate'), yrs = num('#mYears');
  $('#mDownV').textContent = down + '%'; $('#mRateV').textContent = rate.toFixed(1) + '%'; $('#mYearsV').textContent = yrs + ' yrs';
  const P = price * (1 - down / 100), r = rate / 100 / 12, n = yrs * 12;
  const pmt = r ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
  $('#mOut').textContent = fmtAED(pmt) + ' / month';
  $('#mSub').textContent = `Loan ${fmtAED(P)} · down payment ${fmtAED(price * down / 100)} · total interest ≈ ${fmtAED(pmt * n - P)}`;
}
function calcYield() {
  const price = num('#yPrice'), rent = num('#yRent'), fees = num('#yFees');
  if (!price) return;
  const net = ((rent - fees) / price) * 100, gross = (rent / price) * 100;
  $('#yOut').textContent = net.toFixed(2) + '%';
  $('#ySub').textContent = `Gross ${gross.toFixed(2)}% · DLD transfer fee (4%) ≈ ${fmtAED(price * 0.04)} + admin fee`;
}
['#mPrice', '#mDown', '#mRate', '#mYears'].forEach((s) => $(s).addEventListener('input', calcMortgage));
['#yPrice', '#yRent', '#yFees'].forEach((s) => $(s).addEventListener('input', calcYield));
calcMortgage(); calcYield();
const areaChips = $('#areaChips'), areaOut = $('#areaOut');
AREAS.forEach(([n, t], i) => {
  const b = el('button', { className: 'chip' + (i === 0 ? ' is-on' : ''), type: 'button', textContent: n });
  b.addEventListener('click', () => { $$('.chip', areaChips).forEach((c) => c.classList.toggle('is-on', c === b)); areaOut.textContent = t; $('#fProject').placeholder = n; });
  areaChips.append(b);
});
areaOut.textContent = AREAS[0][1];

/* ------------------------------------------------------------------ contact + FAQ (Level 05) */
const faq = $('#faq');
FAQ.forEach(([q, a], i) => faq.append(el('details', i === 0 ? { open: true } : {}, el('summary', { textContent: q }), el('p', { textContent: a }))));
const enquiry = $('#enquiry');
let via = 'email';
$$('button[type=submit]', enquiry).forEach((b) => b.addEventListener('click', () => { via = b.dataset.via; $$('input,select', enquiry).forEach((i) => i.classList.add('touched')); }));
enquiry.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(enquiry); const msg = $('#formMsg');
  if (!enquiry.checkValidity()) { msg.textContent = 'Please complete the required fields and accept the consent box.'; enquiry.reportValidity(); return; }
  const body = [`Name: ${f.get('name')}`, `Phone: ${f.get('phone')}`, `Email: ${f.get('email')}`, `Interested in: ${f.get('interest')}`, `Budget: ${f.get('budget')}`, f.get('project') ? `Project / area: ${f.get('project')}` : '', '', f.get('message')].filter((x) => x !== null).join('\n');
  if (via === 'wa') window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
  else location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Enquiry — ' + f.get('interest'))}&body=${encodeURIComponent(body)}`;
  msg.textContent = via === 'wa' ? 'Opening WhatsApp with your message…' : 'Opening your email app with your message…';
});
$('#newsletter').addEventListener('submit', () => {
  const v = $('#nEmail').value; if (!v) return;
  location.href = `mailto:${MAIL}?subject=${encodeURIComponent('Off-plan watchlist subscription')}&body=${encodeURIComponent('Please add me to the off-plan watchlist: ' + v)}`;
  $('#nMsg').textContent = 'Opening your email app to confirm your subscription…';
});

/* ------------------------------------------------------------------ team (Level 06) */
const tabs = $('#teamTabs'), member = $('#member');
let activeMember = TEAM[0].id, teamTimer = null, teamTouched = false;
const figTags = {};
function renderMember(id, fromUser) {
  activeMember = id;
  if (fromUser) teamTouched = true;
  const m = TEAM.find((x) => x.id === id);
  $$('.tab', tabs).forEach((t) => { const on = t.dataset.id === id; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
  const deals = DEALS[id] || [];
  member.replaceChildren(
    el('img', { src: m.photo, alt: m.name, width: 180, height: 240 }),
    el('div', {},
      el('h3', { textContent: m.name }), el('p', { className: 'role', textContent: m.role }), el('p', { textContent: m.bio }),
      el('ul', { className: 'deals' }, deals.map((d, i) => el('li', { style: `animation-delay:${i * 90}ms` }, el('span', { className: 'k ' + d.kind, textContent: d.kind === 'Ops' ? 'Ops' : d.kind }), el('span', {}, d.title, el('small', { textContent: d.area })), el('b', { textContent: d.value })))),
      SHOW_SAMPLE_NOTE ? el('p', { className: 'sample', textContent: 'Sample entries shown for layout — to be replaced with SWK’s verified closed deals.' }) : null));
  for (const [k, t] of Object.entries(figTags)) t.classList.toggle('is-on', k === id);
  gl?.tower.setActiveMember(id);
}
TEAM.forEach((m) => {
  const b = el('button', { className: 'tab', type: 'button', role: 'tab', 'data-id': m.id }, el('img', { src: m.photo, alt: '', width: 120, height: 120, loading: 'lazy' }), el('b', { textContent: m.name.split(' ').slice(-2).join(' ') }), el('small', { textContent: m.role }));
  b.addEventListener('click', () => renderMember(m.id, true));
  tabs.append(b);
  const tag = el('div', { className: 'fig-tag' }, el('span', { textContent: m.name }), el('small', { textContent: m.role }));
  document.body.append(tag); figTags[m.id] = tag;
});
renderMember(TEAM[0].id);

/* ------------------------------------------------------------------ rail + navigation */
const floors = $$('[data-floor]').filter((s) => s.dataset.name);
const railList = $('#railList');
const railItems = floors.map((s) => {
  const b = el('button', { type: 'button', textContent: s.dataset.level === '0' ? 'G' : s.dataset.level, title: s.dataset.name, 'aria-label': s.dataset.name });
  b.addEventListener('click', () => goTo(s.id));
  const li = el('li', {}, b); railList.append(li); return li;
});
function goTo(id) {
  const t = document.getElementById(id); if (!t) return;
  window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + 2, behavior: 'auto' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-go]'); if (!a) return;
  e.preventDefault();
  if (a.dataset.status) setStatus(a.dataset.status);
  goTo(a.dataset.go);
});

/* ------------------------------------------------------------------ 3D */
const hasWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !location.search.includes('3d=1');
const noGL = !hasWebGL || reduce;
if (noGL) {
  document.documentElement.classList.add('no-gl');
  if (reduce && hasWebGL) {
    const b = el('button', { className: 'btn btn--ghost btn--sm', type: 'button', textContent: 'Enable 3D tour' });
    b.addEventListener('click', () => { location.search = '?3d=1'; });
    $('.beat--hero .cta-row').append(b);
  }
}

function layout() {
  vh = innerHeight;
  if (!gl) return;
  const m = [];
  const topOf = (n) => n.getBoundingClientRect().top + scrollY;
  for (const s of $$('[data-cam],[data-cams]')) {
    const top = topOf(s), bottom = top + s.offsetHeight, end = Math.max(top + 1, bottom - vh);
    if (s.dataset.cam) { m.push({ y: top, cam: s.dataset.cam }, { y: end, cam: s.dataset.cam }); }
    else {
      const cams = s.dataset.cams.split(',');
      cams.forEach((c, i) => m.push({ y: top + ((end - top) * i) / (cams.length - 1), cam: c }));
    }
  }
  gl.setMarkers(m);
  gl.resize(innerWidth, innerHeight);
}

function onScroll() {
  const y = scrollY;
  gl?.setScroll(y);
  $('#nav').classList.toggle('is-solid', y > 60);
  // active floor = the section crossing the middle of the viewport
  let found = null;
  for (const s of floors) { const r = s.getBoundingClientRect(); if (r.top < vh * 0.55 && r.bottom > vh * 0.45) found = s; }
  const id = found ? found.id || found.dataset.floor : null;
  if (id !== activeFloor) {
    activeFloor = id;
    railItems.forEach((li, i) => li.classList.toggle('is-on', floors[i] === found));
    $$('.nav__links a').forEach((a) => a.classList.toggle('is-on', found && a.dataset.go === found.id));
    onFloorChange(found);
  }
  // walk / lift captions cross-fade by progress
  const fade = (sel, a, b) => { const s = $(sel); if (!s) return; const r = s.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
    const A = $(a, s), B = $(b, s); if (!A || !B) return; A.style.opacity = p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) * 10); B.style.display = 'block'; B.style.opacity = p > 0.55 ? Math.min(1, (p - 0.55) * 6) : 0; };
  fade('.beat--walk', '.walk__a', '.walk__b'); fade('.beat--lift', '.lift__a', '.lift__b');
}
function onFloorChange(sec) {
  const inTeam = sec && sec.id === 'team';
  Object.values(figTags).forEach((t) => (t.style.opacity = 0));
  clearInterval(teamTimer);
  if (inTeam && !teamTouched) teamTimer = setInterval(() => { const i = (TEAM.findIndex((m) => m.id === activeMember) + 1) % TEAM.length; renderMember(TEAM[i].id); }, 5200);
  if (gl) gl.explorer.setActive(!!sec && sec.id === 'village');
  if (sec && sec.id === 'village' && pendingDistrict) { const id = pendingDistrict; pendingDistrict = null; setTimeout(() => selectDistrict(id), 900); }
}

/* ------------------------------------------------------------------ village directory + explorer */
let vStatus = 'all', vQuery = '', selected = null, selectedProject = null, pendingDistrict = null, labels = null;
const vList = $('#vList'), vCard = $('#vCard');
const vil = () => gl?.village;
function setStatus(s) { vStatus = s; $$('#vFilter .chip').forEach((c) => c.classList.toggle('is-on', c.dataset.st === s)); renderVillageList(); }
function goVillage(id) { pendingDistrict = id; if (noGL) { selectDistrict(id); goTo('village'); } else goTo('village'); }
function renderVillageList() {
  vList.replaceChildren();
  const q = vQuery.toLowerCase();
  let n = 0;
  for (const d of DEVELOPERS) {
    const projs = d.projects.filter((p) => (vStatus === 'all' || p[2] === vStatus) && (!q || d.name.toLowerCase().includes(q) || p[0].toLowerCase().includes(q) || p[1].toLowerCase().includes(q)));
    if (!projs.length) continue; n++;
    const open = selected === d.id;
    const head = el('button', { className: 'vdev' + (open ? ' is-sel' : ''), type: 'button', 'aria-expanded': open }, el('span', { textContent: d.name }), el('small', { textContent: `${projs.length} / ${d.projects.length}` }));
    head.addEventListener('click', () => selectDistrict(d.id));
    const li = el('li', {}, head);
    if (open) {
      const ul = el('ul', { className: 'vprojects' });
      for (const p of projs) {
        const b = el('button', { className: p[2] + (selectedProject && selectedProject.name === p[0] ? ' is-sel' : ''), type: 'button' }, p[0], el('small', { textContent: p[1] }));
        b.addEventListener('click', () => { const proj = vil()?.byId[d.id].projects.find((x) => x.name === p[0]) || { name: p[0], location: p[1], status: p[2], kind: p[3], year: p[4], dev: d }; selectProject(proj); });
        ul.append(el('li', {}, b));
      }
      li.append(ul);
    }
    vList.append(li);
  }
  if (!n) vList.append(el('li', { className: 'empty', textContent: 'Nothing matches that filter.' }));
}
function selectDistrict(id) {
  selected = id; selectedProject = null; vCard.hidden = true;
  const v = vil(); const d = v?.byId[id] || (id === 'swk-hq' ? v?.hq : null);
  v?.select(id); labels?.setSelected(id);
  if (d && gl) gl.explorer.focusDistrict(d);
  if (id === 'swk-hq') showCard({ name: 'SWK Plaza', location: 'Sheikh Zayed Road, Dubai', status: 'completed', kind: 'tower', dev: { name: 'SWK Properties' }, hq: true });
  renderVillageList();
  const sel = $('.vdev.is-sel', vList); sel?.scrollIntoView({ block: 'nearest' });
}
function selectProject(p) {
  const d = p.dev.id || DEVELOPERS.find((x) => x.name === p.dev.name)?.id;
  if (selected !== d) { selected = d; vil()?.select(d); labels?.setSelected(d); }
  selectedProject = p; gl?.explorer.focusProject(p); showCard(p); renderVillageList();
}
function showCard(p) {
  vCard.hidden = false; vCard.dataset.status = p.status;
  vCard.replaceChildren(
    el('span', { className: 'st', textContent: p.hq ? 'SWK headquarters' : STATUS[p.status].label }),
    el('h3', { textContent: p.name }),
    el('p', { textContent: `${p.dev.name} · ${p.location}` }),
    el('p', { className: 'muted', textContent: `${KIND[p.kind] || ''}${p.year ? ` · Completed ${p.year}` : ''}` }),
    p.hq ? el('p', { textContent: 'Where the tour began: Al Saqr Business Tower, beside Emirates Towers Metro.' }) : el('p', { className: 'fine', textContent: 'Status and handover from public information — SWK confirms the current position with the developer.' }),
    el('div', { className: 'cta-row', style: 'margin-top:12px' },
      (() => { const a = el('a', { className: 'btn btn--gold btn--sm', href: '#contact', textContent: p.hq ? 'Visit us' : 'Enquire' }); a.addEventListener('click', (e) => { e.preventDefault(); if (!p.hq) $('#fProject').value = p.name; goTo('contact'); }); return a; })(),
      el('a', { className: 'btn btn--ghost btn--sm', target: '_blank', rel: 'noopener', href: `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello SWK, tell me about ${p.name}${p.dev.name ? ' (' + p.dev.name + ')' : ''}.`)}`, textContent: 'WhatsApp' })));
}
$('#vFilter').addEventListener('click', (e) => { const b = e.target.closest('[data-st]'); if (b) setStatus(b.dataset.st); });
$('#vSearch').addEventListener('input', (e) => { vQuery = e.target.value.trim(); renderVillageList(); });
$('#vReset').addEventListener('click', () => { selected = null; selectedProject = null; vCard.hidden = true; vil()?.select(null); labels?.setSelected(null); gl?.explorer.reset(); renderVillageList(); });
$('#vIn').addEventListener('click', () => gl?.explorer.zoom(0.7));
$('#vOut').addEventListener('click', () => gl?.explorer.zoom(1.4));
renderVillageList();

// drag to orbit on the stage
{
  const stage = $('#villageStage'); let down = null;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('.vpanel,.vcard,.gl-label,.gl-pin,button,a,input')) return; down = { x: e.clientX, y: e.clientY, t: e.pointerType }; stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; down.x = e.clientX; down.y = e.clientY; gl?.explorer.drag(dx, down.t === 'touch' ? 0 : dy); });
  const up = () => { down = null; stage.classList.remove('drag'); };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
}

/* ------------------------------------------------------------------ boot 3D */
async function boot() {
  const loader = el('div', { className: 'loader' }, el('b', { textContent: 'SWK PROPERTY' }), el('span', { textContent: 'Raising the tower on Sheikh Zayed Road…' }));
  if (!noGL) document.body.append(loader);
  if (noGL) { onScroll(); return; }
  try {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const { createScene } = await import('./scene.js');
    const { makeLabels } = await import('./village.js');
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || /Mobi|Android/i.test(navigator.userAgent) || innerWidth < 760;
    const q = store.get('swk-quality') || (lowEnd ? 'low' : 'high');
    gl = createScene($('#gl'), { quality: q });
    labels = makeLabels($('#gl-labels'), gl.village, { onPickDistrict: selectDistrict, onPickProject: selectProject });
    if (location.search.includes('debug')) window.__swk = gl;
    setQualityChip(gl.quality);
    renderMember(activeMember);
    layout(); onScroll();
    requestAnimationFrame(loop);
    loader.classList.add('done'); setTimeout(() => loader.remove(), 900);
  } catch (err) {
    console.error('3D failed, using static layout', err);
    document.documentElement.classList.add('no-gl'); loader.remove(); gl = null; onScroll();
  }
}
function setQualityChip(q) { const b = $('#qToggle'); b.setAttribute('aria-pressed', q === 'high'); $('b', b).textContent = q === 'high' ? 'High' : 'Light'; }
$('#qToggle').addEventListener('click', () => { if (!gl) return; const q = gl.quality === 'high' ? 'low' : 'high'; gl.setQuality(q); store.set('swk-quality', q); setQualityChip(q); });

const hdgEl = $('#hudHdg'), altEl = $('#hudAlt'), compass = $('#compassN');
let dirV = null;
let last = performance.now(), frames = 0, acc = 0, shown = '';
function loop(now) {
  const dt = Math.min(0.08, (now - last) / 1000); last = now;
  if (document.hidden) { requestAnimationFrame(loop); return; }
  gl.frame(now / 1000, dt);
  // adaptive quality: drop to light if the first 2 seconds average slower than ~22 fps
  if (frames < 120) { frames++; acc += dt; if (frames === 120 && acc / 120 > 0.045 && gl.quality === 'high' && !store.get('swk-quality')) { gl.setQuality('low'); setQualityChip('low'); } }
  // HUD: level readout
  const cam = gl.camera;
  const inVillage = cam.position.x > 800;
  const lvl = inVillage ? '∞' : String(gl.levelAt()).padStart(2, '0');
  if (lvl !== shown) { shown = lvl; $('#levelNum').textContent = lvl; }
  const sec = floors.find((s) => s.id === activeFloor);
  $('#levelName').textContent = inVillage ? 'SWK Village' : (cam.position.y > 300 ? 'Sky' : (sec ? sec.dataset.name : (cam.position.y > 36 ? 'Express lift' : 'Street')));
  // team tags
  if (activeFloor === 'team') {
    const pos = { x: 0, y: 0, vis: false };
    for (const m of TEAM) {
      const p = gl.tower.memberHead(m.id); gl.project(p, pos);
      const t = figTags[m.id]; t.style.opacity = pos.vis ? 1 : 0; t.style.left = pos.x + 'px'; t.style.top = pos.y + 'px';
    }
  }
  // village labels + HUD
  const ex = gl.explorerAmount;
  labels.update(cam, innerWidth, innerHeight, ex > 0.6 || cam.position.x > 3000);
  if (cam.position.x > 800) {
    dirV ||= cam.position.clone();
    cam.getWorldDirection(dirV);
    const hdg = (Math.atan2(dirV.x, -dirV.z) * 180 / Math.PI + 360) % 360;
    hdgEl.textContent = 'HDG ' + String(Math.round(hdg)).padStart(3, '0') + '°';
    altEl.textContent = 'ALT ' + Math.round(cam.position.y).toLocaleString('en-US') + ' M';
    compass.setAttribute('transform', `rotate(${-hdg} 20 20)`);
  }
  requestAnimationFrame(loop);
}

addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); onScroll(); }, 120); });
addEventListener('load', () => { layout(); onScroll(); });
boot();
