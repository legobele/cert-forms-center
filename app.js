/* CERT Forms Center — single-page app, vanilla JS, Firebase compat 10.12.2 */
'use strict';

/* ---------- Constants ---------- */
const FB_CONFIG = {
  apiKey: "AIzaSyBXHKy8GWL_nccDOWjUC_uV-mKV4BVb7qE",
  authDomain: "cert-forms-center.firebaseapp.com",
  projectId: "cert-forms-center",
  storageBucket: "cert-forms-center.firebasestorage.app",
  messagingSenderId: "620982874670",
  appId: "1:620982874670:web:a8186a37569a3fecec25bf"
};
const PIN_HASH = "b3f25d01ddb3fafeb251acbce91c2880d8130a38e5c064e142414c6d2ebbaedc";
const DEMO_ORG_ID = "demo-2026-09-20";
const BUCKET_URL = "https://firebasestorage.googleapis.com/v0/b/cert-forms-center.firebasestorage.app/o/forms%2Ftemplates%2F";
const LOCK_MIN = 10;
const DEMO_TICK_MS = 25000;

/* ---------- i18n (STR/LANG pattern) ---------- */
const STR = {
  es: {
    appName: "Centro de Formularios CERT",
    pinTitle: "Ingrese el PIN del equipo",
    pinSub: "PIN de 6 dígitos. Se bloquea tras 10 min sin actividad.",
    pinBtn: "Desbloquear",
    pinBad: "PIN incorrecto",
    chooseMode: "¿Cómo va a usar esto?",
    kiosk: "Quiosco", kioskSub: "Sesión compartida en este dispositivo",
    personal: "Personal", personalSub: "Entrar con su cuenta",
    who: "¿Quién está usando esto?", namePh: "Nombre (p. ej. Giulia)",
    start: "Empezar", login: "Entrar", register: "Crear cuenta",
    email: "Correo", pass: "Contraseña",
    authOff: "Auth aún no habilitado. Pida al admin que active el proveedor Email/Password en la consola de Firebase.",
    authErr: "No se pudo entrar. Revise correo y contraseña.",
    incidents: "Incidentes", templates: "Plantillas", scans: "Escaneos", demo: "Demo",
    newIncident: "Nuevo incidente", nameEs: "Nombre del incidente",
    date: "Fecha", kind: "Tipo", exercise: "Ejercicio", real: "Real",
    status: "Estado", active: "Activo", archived: "Archivado",
    create: "Crear", cancel: "Cancelar", back: "Atrás",
    dashboard: "Tablero", fill: "Llenar formulario", save: "Guardar",
    sign: "Firmar", clear: "Borrar firma", saved: "Guardado",
    draft: "Borrador", signed: "Firmado", print: "Imprimir",
    chooseTemplate: "Elija una plantilla", required: "obligatorio",
    addRow: "+ Fila", delRow: "✕", team: "Equipo",
    uploadScan: "Subir escaneo", pickFile: "Elegir archivo",
    scan403: "Sin permiso para subir (el servidor denegó el acceso). Guarde el archivo localmente por ahora.",
    scanOk: "Escaneo subido", scanErr: "No se pudo subir el escaneo.",
    offlineQueued: "Sin conexión: guardado en la cola, se sincronizará.",
    outboxSynced: "Cola sincronizada.",
    lock: "Bloquear", lang: "EN", exit: "Salir",
    teams: "Equipos", submissions: "Formularios", recent: "Recientes",
    submittedBy: "Por", at: "el", noItems: "Nada aquí todavía.",
    demoLive: "VER DEMO EN VIVO", demoBanner: "⚠ DEMO — datos simulados, no reales",
    demoView: "Vista demo en vivo", simOn: "Simulador activo: actividad demo cada ~25 s",
    close: "Cerrar", details: "Detalles", signature: "Firma",
    actorName: "Nombre de quien llena", submitSigned: "Guardar y firmar",
    submitDraft: "Guardar borrador", tplFrom: "Plantilla",
    rows: "filas", signHere: "Firme aquí", tplFail: "No se pudo cargar la plantilla.",
    incCreated: "Incidente creado", fillRequired: "Complete los campos obligatorios.",
    sigRequired: "Se requiere firma para guardar firmado.",
    demoTeam1: "Equipo DEMO 1", demoTeam2: "Equipo DEMO 2",
    noAuth: "Sesión expirada, vuelva a entrar.",
    viewForm: "Ver", fieldValues: "Valores", loading: "Cargando…",
  },
  en: {
    appName: "CERT Forms Center",
    pinTitle: "Enter the team PIN",
    pinSub: "6-digit PIN. Locks after 10 min of inactivity.",
    pinBtn: "Unlock",
    pinBad: "Wrong PIN",
    chooseMode: "How will you use this?",
    kiosk: "Kiosk", kioskSub: "Shared session on this device",
    personal: "Personal", personalSub: "Sign in with your account",
    who: "Who is using this?", namePh: "Name (e.g. Giulia)",
    start: "Start", login: "Sign in", register: "Create account",
    email: "Email", pass: "Password",
    authOff: "Auth not enabled yet. Ask the admin to enable the Email/Password provider in the Firebase console.",
    authErr: "Could not sign in. Check email and password.",
    incidents: "Incidents", templates: "Templates", scans: "Scans", demo: "Demo",
    newIncident: "New incident", nameEs: "Incident name",
    date: "Date", kind: "Type", exercise: "Exercise", real: "Real",
    status: "Status", active: "Active", archived: "Archived",
    create: "Create", cancel: "Cancel", back: "Back",
    dashboard: "Dashboard", fill: "Fill a form", save: "Save",
    sign: "Sign", clear: "Clear signature", saved: "Saved",
    draft: "Draft", signed: "Signed", print: "Print",
    chooseTemplate: "Pick a template", required: "required",
    addRow: "+ Row", delRow: "✕", team: "Team",
    uploadScan: "Upload scan", pickFile: "Choose file",
    scan403: "No permission to upload (server denied access). Keep the file locally for now.",
    scanOk: "Scan uploaded", scanErr: "Could not upload the scan.",
    offlineQueued: "Offline: saved to queue, will sync.",
    outboxSynced: "Queue synced.",
    lock: "Lock", lang: "ES", exit: "Exit",
    teams: "Teams", submissions: "Submissions", recent: "Recent",
    submittedBy: "By", at: "at", noItems: "Nothing here yet.",
    demoLive: "VIEW LIVE DEMO", demoBanner: "⚠ DEMO — simulated data, not real",
    demoView: "Live demo view", simOn: "Simulator on: demo activity every ~25 s",
    close: "Close", details: "Details", signature: "Signature",
    actorName: "Filler name", submitSigned: "Save and sign",
    submitDraft: "Save draft", tplFrom: "Template",
    rows: "rows", signHere: "Sign here", tplFail: "Could not load the template.",
    incCreated: "Incident created", fillRequired: "Fill the required fields.",
    sigRequired: "Signature required to save as signed.",
    demoTeam1: "DEMO Team 1", demoTeam2: "DEMO Team 2",
    noAuth: "Session expired, sign in again.",
    viewForm: "View", fieldValues: "Values", loading: "Loading…",
  }
};
let LANG = localStorage.getItem('cfc_lang') || 'es';
const t = k => (STR[LANG] && STR[LANG][k]) || STR.es[k] || k;

/* ---------- utils ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app = () => $('app');
function toast(msg) {
  document.querySelectorAll('.toast').forEach(e => e.remove());
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3200);
}
const ts = () => firebase.firestore.FieldValue.serverTimestamp();
const fmtT = v => {
  if (!v) return '—';
  const d = v.toDate ? v.toDate() : new Date(v);
  return d.toLocaleString(LANG === 'es' ? 'es-PR' : 'en-US', {dateStyle:'short', timeStyle:'short'});
};
function sha256hex(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    .then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''));
}
function constEq(a, b) { // constant-time-ish compare
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ---------- Firebase ---------- */
let db = null, auth = null, storage = null, FB_OK = false;
try {
  firebase.initializeApp(FB_CONFIG);
  db = firebase.firestore(); auth = firebase.auth(); storage = firebase.storage();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
  FB_OK = true;
} catch (e) { console.warn('Firebase init failed', e); }

/* ---------- session state ---------- */
const S = {
  view: 'pin', mode: null, actor: null, uid: null,
  incidentId: null, incident: null, templateId: null, submissionId: null,
  tplCache: {}, unsub: [], demoTimer: null,
};
function stopListeners() { S.unsub.forEach(u => { try { u(); } catch(e){} }); S.unsub = []; }
function stopDemo() { if (S.demoTimer) { clearInterval(S.demoTimer); S.demoTimer = null; } }

/* ---------- audit ---------- */
async function audit(action, collection, docId) {
  const doc = { actor: S.actor || 'anon', mode: S.mode || 'none', action, collection, docId: docId || null, at: ts() };
  await writeDoc('audit', null, doc);
}

/* ---------- offline outbox ---------- */
const OUTBOX_KEY = 'cfc_outbox_v1';
const outbox = () => { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch(e){ return []; } };
const setOutbox = q => localStorage.setItem(OUTBOX_KEY, JSON.stringify(q));
function queueWrite(coll, docId, data) {
  const q = outbox(); q.push({coll, docId, data, queuedAt: Date.now()});
  setOutbox(q); toast(t('offlineQueued'));
}
async function writeDoc(coll, docId, data) {
  // writes with explicit demo flag default; returns id. Queues offline.
  if (!FB_OK || !navigator.onLine) { queueWrite(coll, docId, data); return docId || 'queued-' + Date.now(); }
  try {
    if (!data.demo) data.demo = false;
    const ref = docId ? db.collection(coll).doc(docId) : db.collection(coll).doc();
    await ref.set(data, {merge: false});
    return ref.id;
  } catch (e) { queueWrite(coll, docId, data); return docId || 'queued-' + Date.now(); }
}
async function syncOutbox() {
  if (!FB_OK || !navigator.onLine) return;
  const q = outbox(); if (!q.length) return;
  const rest = [];
  for (const w of q) {
    try {
      const ref = w.docId ? db.collection(w.coll).doc(w.docId) : db.collection(w.coll).doc();
      await ref.set(w.data, {merge: false});
    } catch (e) { rest.push(w); }
  }
  setOutbox(rest);
  if (rest.length < q.length) toast(t('outboxSynced'));
}
window.addEventListener('online', syncOutbox);

/* ---------- PIN gate + auto-lock ---------- */
function unlocked() { return sessionStorage.getItem('cfc_unlocked') === '1'; }
let lockTimer = null;
function pokeLock() {
  if (!unlocked()) return;
  clearTimeout(lockTimer);
  lockTimer = setTimeout(doLock, LOCK_MIN * 60 * 1000);
}
function doLock() {
  sessionStorage.removeItem('cfc_unlocked');
  sessionStorage.removeItem('cfc_kiosk');
  S.mode = null; S.actor = null; stopDemo(); stopListeners();
  pendingRoute = null; setHash('');
  renderPin();
}
['pointerdown','keydown','touchstart'].forEach(ev =>
  window.addEventListener(ev, pokeLock, {passive: true}));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && unlocked()) doLock();
});
async function checkPin(pin) {
  const h = await sha256hex(pin);
  return constEq(h, PIN_HASH);
}

/* ---------- header/footer chrome ---------- */
function chrome(titleHtml, opts = {}) {
  return `<header class="top"><div class="t">${titleHtml}</div>` +
    (opts.demo ? `<span class="tag">DEMO</span>` : '') +
    `<button class="ghost" style="color:#fff" onclick="toggleLang()">${t('lang')}</button>` +
    (opts.lock ? `<button class="ghost" style="color:#fff" onclick="doLock()">🔒 ${t('lock')}</button>` : '') +
    `</header>`;
}
function footnav(active) {
  if (!S.mode || S.view === 'demo') return '';
  const items = [
    ['incidents', t('incidents'), "go('incidents')"],
    ['demo', t('demo'), "go('demo')"],
  ];
  return `<footer class="foot">` + items.map(([v, l, fn]) =>
    `<button class="${active===v?'on':''}" onclick="${fn}">${l}</button>`).join('') + `</footer>`;
}
function go(view) { S.view = view; stopDemo(); render(); }
function toggleLang() { LANG = LANG === 'es' ? 'en' : 'es'; localStorage.setItem('cfc_lang', LANG); render(); }

/* ---------- view: PIN gate ---------- */
function renderPin() {
  S.view = 'pin'; stopDemo(); stopListeners();
  app().innerHTML = chrome(t('appName')) + `
  <div class="card center">
    <div class="masthead">
      <div class="orgline">Centro de Formularios · CERT</div>
      <h1>&#129682; Tablilla</h1>
      <div class="sub">${esc(t('appName'))}</div>
    </div>
    <div class="pin-label">${esc(t('pinTitle'))}</div>
    <div class="pinrow" id="pinrow">${'<input inputmode="numeric" maxlength="1" pattern="[0-9]" autocomplete="off">'.repeat(6)}</div>
    <div class="keypad" role="group" aria-label="Teclado num&eacute;rico">
      <button type="button" onclick="pinKey('1')">1</button><button type="button" onclick="pinKey('2')">2</button><button type="button" onclick="pinKey('3')">3</button>
      <button type="button" onclick="pinKey('4')">4</button><button type="button" onclick="pinKey('5')">5</button><button type="button" onclick="pinKey('6')">6</button>
      <button type="button" onclick="pinKey('7')">7</button><button type="button" onclick="pinKey('8')">8</button><button type="button" onclick="pinKey('9')">9</button>
      <button type="button" class="fn" onclick="pinClear()">${esc(LANG==='es'?'Borrar':'Clear')}</button><button type="button" onclick="pinKey('0')">0</button><button type="button" class="fn" onclick="pinBack()">&#9003;</button>
    </div>
    <button class="warn" onclick="submitPin()">${esc(t('pinBtn'))}</button>
    <button class="sec" onclick="enterDemo()">${esc(t('demoLive'))}</button>
    <p class="mut small">${esc(t('pinSub'))}</p>
    <div class="offline">&#9673; ${esc(LANG==='es'?'Sin conexi\u00f3n \u2014 los datos se guardan en el dispositivo<br>y se sincronizan cuando haya red.':'Offline \u2014 data stays on this device<br>and syncs when a network returns.')}</div>
  </div>`;
  const boxes = [...document.querySelectorAll('#pinrow input')];
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => { b.value = b.value.replace(/\D/g,'').slice(0,1);
      if (b.value && i < 5) boxes[i+1].focus(); if (i === 5 && b.value) submitPin(); });
    b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && i > 0) boxes[i-1].focus(); });
  });
  boxes[0].focus();
}
async function submitPin() {
  const pin = [...document.querySelectorAll('#pinrow input')].map(b => b.value).join('');
  if (pin.length !== 6) return;
  if (await checkPin(pin)) {
    sessionStorage.setItem('cfc_unlocked', '1'); pokeLock(); renderMode();
  } else toast(t('pinBad'));
}
function pinKey(d) { // on-screen keypad feeds the same #pinrow inputs as a hardware keyboard
  const boxes = [...document.querySelectorAll('#pinrow input')];
  const i = boxes.findIndex(b => !b.value);
  if (i < 0) return;
  boxes[i].value = d;
  if (i < 5) boxes[i+1].focus(); else submitPin();
}
function pinBack() {
  const boxes = [...document.querySelectorAll('#pinrow input')];
  for (let i = boxes.length - 1; i >= 0; i--) {
    if (boxes[i].value) { boxes[i].value = ''; boxes[i].focus(); return; }
  }
  boxes[0].focus();
}
function pinClear() {
  const boxes = [...document.querySelectorAll('#pinrow input')];
  boxes.forEach(b => b.value = ''); boxes[0].focus();
}

/* ---------- view: mode choice ---------- */
function renderMode() {
  S.view = 'mode';
  app().innerHTML = chrome(t('appName'), {lock:true}) + `
  <div class="card"><h2>${esc(t('chooseMode'))}</h2>
    <button class="modebtn" onclick="modeKiosk()">🖥️ <b>${esc(t('kiosk'))}</b><br><span class="small mut">${esc(t('kioskSub'))}</span></button>
    <button class="modebtn" onclick="modePersonal()">👤 <b>${esc(t('personal'))}</b><br><span class="small mut">${esc(t('personalSub'))}</span></button>
  </div>` + footnav('');
}
function modeKiosk() {
  S.view = 'kiosk';
  app().innerHTML = chrome(t('appName'), {lock:true}) + `
  <div class="card"><h2>${esc(t('who'))}</h2>
    <label class="f">${esc(t('actorName'))}</label>
    <input id="kname" value="Giulia" maxlength="60">
    <button onclick="startKiosk()">${esc(t('start'))}</button>
    <button class="ghost" onclick="renderMode()">${esc(t('back'))}</button>
  </div>`;
  $('kname').focus();
}
function startKiosk() {
  const name = ($('kname').value || 'Giulia').trim() || 'Giulia';
  S.mode = 'kiosk'; S.actor = name; sessionStorage.setItem('cfc_kiosk', name);
  audit('mode.kiosk', 'sessions', null).catch(()=>{});
  resumePending();
}
function modePersonal() {
  S.view = 'personal';
  app().innerHTML = chrome(t('appName'), {lock:true}) + `
  <div class="card"><h2>👤 ${esc(t('personal'))}</h2>
    <label class="f">${esc(t('email'))}</label><input id="pemail" type="email" autocomplete="email">
    <label class="f">${esc(t('pass'))}</label><input id="ppass" type="password" autocomplete="current-password">
    <button onclick="doLogin()">${esc(t('login'))}</button>
    <button class="sec" onclick="doRegister()">${esc(t('register'))}</button>
    <button class="ghost" onclick="renderMode()">${esc(t('back'))}</button>
  </div>`;
}
async function doLogin() {
  try {
    const u = await auth.signInWithEmailAndPassword($('pemail').value.trim(), $('ppass').value);
    S.mode = 'personal'; S.actor = u.user.email + ' (' + u.user.uid + ')'; S.uid = u.user.uid;
    audit('auth.login', 'sessions', u.user.uid).catch(()=>{});
    resumePending();
  } catch (e) {
    toast(e.code === 'auth/operation-not-allowed' ? t('authOff') : t('authErr'));
  }
}
async function doRegister() {
  try {
    const u = await auth.createUserWithEmailAndPassword($('pemail').value.trim(), $('ppass').value);
    S.mode = 'personal'; S.actor = u.user.email + ' (' + u.user.uid + ')'; S.uid = u.user.uid;
    audit('auth.register', 'sessions', u.user.uid).catch(()=>{});
    resumePending();
  } catch (e) {
    toast(e.code === 'auth/operation-not-allowed' ? t('authOff') : t('authErr'));
  }
}
async function exitMode() {
  if (S.mode === 'personal') { try { await auth.signOut(); } catch(e){} }
  S.mode = null; S.actor = null; S.uid = null; stopDemo(); renderMode();
}

/* ---------- view: incidents ---------- */
let incUnsub = null;
function renderIncidents() {
  S.view = 'incidents'; S.incidentId = null; S.incident = null; stopDemo();
  setHash('');
  const qlen = outbox().length;
  app().innerHTML = chrome(`${esc(t('appName'))} · ${esc(S.actor||'')}`, {lock:true}) + `
  <div class="card">
    <div class="masthead">
      <div class="orgline">Centro de Formularios · CERT</div>
      <h2>${esc(t('incidents'))}</h2>
    </div>
    ${qlen ? `<div class="sync-strip"><span>&#9673; ${qlen} ${esc(LANG==='es'?'formularios por sincronizar':'forms pending sync')}</span><span>&rarr;</span></div>` : ''}
    <button class="warn" onclick="renderNewIncident()">+ ${esc(t('newIncident'))}</button>
    <div id="inclist"><p class="mut">${esc(t('loading'))}</p></div></div>` + footnav('incidents');
  if (!FB_OK) { $('inclist').innerHTML = `<p class="mut">offline</p>`; return; }
  if (incUnsub) { try{incUnsub();}catch(e){} }
  incUnsub = db.collection('incidents').orderBy('createdAt','desc').limit(50)
    .onSnapshot(snap => {
      const items = [];
      snap.forEach(d => { const x = d.data(); if (x.demo === true) return; items.push({id:d.id, ...x}); });
      $('inclist').innerHTML = items.length ? items.map(i => `
        <a class="listitem" href="javascript:openIncident('${i.id}')">
          <b>${esc(i.name_es || i.id)}</b><br>
          <span class="small mut">${esc(i.date||'')} · ${esc(i.kind==='real'?t('real'):t('exercise'))} ·
          <span class="badge ${esc(i.status||'active')}">${esc(i.status==='archived'?t('archived'):t('active'))}</span></span>
        </a>`).join('') : `<p class="mut">${esc(t('noItems'))}</p>`;
    }, () => { $('inclist').innerHTML = `<p class="mut">offline</p>`; });
}
function renderNewIncident() {
  S.view = 'newincident';
  app().innerHTML = chrome(t('newIncident'), {lock:true}) + `
  <div class="card"><h2>${esc(t('newIncident'))}</h2>
    <label class="f">${esc(t('nameEs'))}</label><input id="iname" maxlength="120">
    <label class="f">${esc(t('date'))}</label><input id="idate" type="date" value="2026-09-20">
    <label class="f">${esc(t('kind'))}</label>
    <select id="ikind"><option value="exercise">${esc(t('exercise'))}</option><option value="real">${esc(t('real'))}</option></select>
    <button onclick="createIncident()">${esc(t('create'))}</button>
    <button class="ghost" onclick="renderIncidents()">${esc(t('cancel'))}</button>
  </div>`;
}
async function createIncident() {
  const name = $('iname').value.trim(); if (!name) { toast(t('nameEs')); return; }
  const data = { name_es: name, date: $('idate').value || '2026-09-20',
    kind: $('ikind').value, status: 'active', demo: false,
    actor: S.actor, createdAt: ts() };
  const id = await writeDoc('incidents', null, data);
  await audit('incident.create', 'incidents', id);
  toast(t('incCreated')); renderIncidents();
}

/* ---------- view: incident dashboard ---------- */
function openIncident(id) { S.incidentId = id; S.view = 'dashboard'; stopDemo(); setHash(routeFor('incident', id)); renderDashboard(); }
function renderDashboard() {
  stopListeners();
  app().innerHTML = chrome(`📋 ${esc(t('dashboard'))}`, {lock:true}) + `
  <div class="card"><p class="mut small">${esc(t('loading'))}</p></div>` + footnav('incidents');
  const incRef = db.collection('incidents').doc(S.incidentId);
  incRef.get().then(d => {
    S.incident = d.data() || {};
    drawDashShell();
    // live: teams subcollection
    S.unsub.push(incRef.collection('teams').onSnapshot(snap => {
      const el = $('dash-teams'); if (!el) return;
      const rows = []; snap.forEach(x => rows.push({id:x.id, ...x.data()}));
      el.innerHTML = rows.length ? rows.map(tm => `
        <div class="kv" style="border-bottom:1px solid var(--line);padding:6px 0">
          <dt><b>${esc(tm.name || tm.id)}</b></dt><dd>${esc(tm.status || '—')}</dd>
          <dt class="small">${esc(t('submittedBy'))}</dt><dd class="small mut">${esc(tm.actor||'—')} · ${fmtT(tm.at)}</dd>
        </div>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
    }));
    // live: submissions
    S.unsub.push(db.collection('submissions').where('incidentId','==',S.incidentId)
      .orderBy('createdAt','desc').limit(30).onSnapshot(snap => {
        const el = $('dash-subs'); if (!el) return;
        const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
        el.innerHTML = rows.length ? rows.map(r => `
          <a class="listitem" href="javascript:openSubmission('${r.id}')">
            <b>${esc(tplName(r.templateId))}</b> <span class="badge ${r.status==='signed'?'signed':'draft'}">${esc(r.status==='signed'?t('signed'):t('draft'))}</span><br>
            <span class="small mut">${esc(r.team||'')} · ${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span>
          </a>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
      }));
    // live: scans
    S.unsub.push(db.collection('scans').where('incidentId','==',S.incidentId)
      .orderBy('createdAt','desc').limit(30).onSnapshot(snap => {
        const el = $('dash-scans'); if (!el) return;
        const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
        el.innerHTML = rows.length ? rows.map(r => `
          <div class="listitem"><b>📎 ${esc(r.fileName||r.id)}</b><br>
          <span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('')
          : `<p class="mut small">${esc(t('noItems'))}</p>`;
      }));
  }).catch(() => { app().innerHTML = chrome('⚠', {lock:true}) + `<div class="card"><p class="mut">offline</p></div>`; });
}
function drawDashShell() {
  const i = S.incident;
  app().innerHTML = chrome(`📋 ${esc(i.name_es || S.incidentId)}`, {lock:true}) + `
  <div class="card">
    <div class="masthead">
      <div class="orgline">Centro de Formularios · CERT</div>
      <h2>${esc(i.name_es || S.incidentId)}</h2>
      <div class="sub">${esc(t('dashboard'))}</div>
    </div>
    <div class="kv"><dt>${esc(t('date'))}</dt><dd>${esc(i.date||'')}</dd>
    <dt>${esc(t('kind'))}</dt><dd>${esc(i.kind==='real'?t('real'):t('exercise'))}</dd>
    <dt>${esc(t('status'))}</dt><dd>${esc(i.status||'')}</dd></div>
    <button class="warn" onclick="renderTemplates()">${esc(t('fill'))}</button>
    <button class="sec" onclick="renderScans()">${esc(t('uploadScan'))}</button>
    <button class="ghost" onclick="renderIncidents()">${esc(t('back'))}</button>
  </div>
  <div class="card"><h3>${esc(t('teams'))}</h3><div id="dash-teams"><p class="mut small">${esc(t('loading'))}</p></div></div>
  <div class="card"><h3>${esc(t('submissions'))}</h3><div id="dash-subs"><p class="mut small">${esc(t('loading'))}</p></div></div>
  <div class="card"><h3>${esc(t('scans'))}</h3><div id="dash-scans"><p class="mut small">${esc(t('loading'))}</p></div></div>` + footnav('incidents');
}

/* ---------- templates: loader (bucket → repo fallback, localStorage cache) ---------- */
let MANIFEST = null;
async function loadManifest() {
  if (MANIFEST) return MANIFEST;
  try {
    const r = await fetch('forms/manifest.json');
    MANIFEST = await r.json();
  } catch (e) { MANIFEST = []; }
  return MANIFEST;
}
async function loadTemplateXml(id) {
  if (S.tplCache[id]) return S.tplCache[id];
  const ck = 'cfc_tpl_' + id;
  const m = (await loadManifest()).find(x => x.id === id);
  if (!m) throw new Error('no manifest entry');
  const cached = localStorage.getItem(ck);
  // try bucket first, then repo file; cache whatever wins
  let xml = null;
  for (const url of [BUCKET_URL + encodeURIComponent(m.file) + '?alt=media', 'forms/' + m.file]) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const txt = await r.text();
      if (txt.includes('<form')) { xml = txt; break; }
    } catch (e) {}
  }
  if (!xml && cached) xml = cached;           // offline: last-known good
  if (!xml) throw new Error('template fetch failed');
  try { localStorage.setItem(ck, xml); } catch(e){}
  S.tplCache[id] = xml;
  return xml;
}
function tplName(id) {
  const m = (MANIFEST || []).find(x => x.id === id);
  return m ? (LANG === 'es' ? m.name_es : m.name_en) : id;
}

/* ---------- generic renderer: parse XML per README schema ---------- */
function parseForm(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const form = doc.querySelector('form');
  const q = sel => form.querySelector(sel);
  const title = (q('meta > title') || {}).textContent || form.getAttribute('id');
  const titleEn = (q('meta > title_en') || {}).textContent || title;
  const fld = el => ({
    name: el.getAttribute('name'), type: el.getAttribute('type') || 'text',
    label: el.getAttribute('label') || el.getAttribute('name'),
    label_en: el.getAttribute('label_en') || el.getAttribute('label') || el.getAttribute('name'),
    required: el.getAttribute('required') === 'true',
    options: [...el.querySelectorAll('option')].map(o => ({
      value: o.getAttribute('value'),
      label: o.getAttribute('label') || o.getAttribute('value'),
      label_en: o.getAttribute('label_en') || o.getAttribute('label') || o.getAttribute('value')
    }))
  });
  const tables = [...form.querySelectorAll('tables > table')].map(tb => ({
    name: tb.getAttribute('name'),
    label: tb.getAttribute('label') || tb.getAttribute('name'),
    label_en: tb.getAttribute('label_en') || tb.getAttribute('label'),
    min_rows: parseInt(tb.getAttribute('min_rows') || '4', 10),
    columns: [...tb.querySelectorAll('column')].map(fld)
  }));
  return {
    id: form.getAttribute('id'), version: form.getAttribute('version'),
    title, title_en: titleEn,
    header: [...form.querySelectorAll('header > field')].map(fld),
    tables,
    footer: [...form.querySelectorAll('footer > field')].map(fld),
  };
}
const LBL = f => esc(LANG === 'es' ? f.label : (f.label_en || f.label));
function fieldInput(f, prefix, val) {
  const id = prefix + '__' + f.name;
  const req = f.required ? ' <span class="req">*</span>' : '';
  const v = val ?? '';
  let ctrl = '';
  if (f.type === 'textarea') ctrl = `<textarea id="${id}" data-f="${esc(f.name)}">${esc(v)}</textarea>`;
  else if (f.type === 'select') ctrl = `<select id="${id}" data-f="${esc(f.name)}"><option value=""></option>` +
    f.options.map(o => `<option value="${esc(o.value)}" ${o.value===v?'selected':''}>${esc(LANG==='es'?o.label:o.label_en)}</option>`).join('') + `</select>`;
  else if (f.type === 'checkbox') ctrl = `<input type="checkbox" class="tickbox" id="${id}" data-f="${esc(f.name)}" ${v?'checked':''}>`;
  else if (f.type === 'signature') ctrl = `<div class="signbox"><canvas class="sig" id="${id}" data-f="${esc(f.name)}"></canvas><div class="xline"></div><div class="cap">${esc(t('signHere'))}</div></div>`;
  else {
    const map = {date:'date', time:'time', datetime:'datetime-local', number:'number'};
    ctrl = `<input type="${map[f.type]||'text'}" id="${id}" data-f="${esc(f.name)}" value="${esc(v)}">`;
  }
  return `<div class="field"><label class="f" for="${id}">${LBL(f)}${req}</label>${ctrl}</div>`;
}
function tableHtml(tb, prefix, rows, sec) {
  const n = Math.max(rows ? rows.length : 0, 3);
  let head = tb.columns.map(c => `<th>${LBL(c)}</th>`).join('') + `<th></th>`;
  let body = '';
  for (let r = 0; r < n; r++) {
    body += '<tr>';
    for (const c of tb.columns) {
      const v = rows && rows[r] ? rows[r][c.name] : '';
      const id = `${prefix}__${tb.name}__${r}__${c.name}`;
      let ctrl;
      if (c.type === 'select') ctrl = `<select id="${id}" data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}"><option value=""></option>` +
        c.options.map(o => `<option value="${esc(o.value)}" ${o.value===v?'selected':''}>${esc(LANG==='es'?o.label:o.label_en)}</option>`).join('') + `</select>`;
      else if (c.type === 'checkbox') ctrl = `<input type="checkbox" class="tickbox" id="${id}" data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}" ${v?'checked':''}>`;
      else ctrl = `<input id="${id}" data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}" value="${esc(v)}">`;
      body += `<td>${ctrl}</td>`;
    }
    body += `<td><button class="ghost" type="button" onclick="this.closest('tr').remove()">${t('delRow')}</button></td></tr>`;
  }
  return `<div class="fsection"><span class="section-tag">${sec?`<span class="n">${esc(sec)}</span>`:''}${esc(LANG==='es'?tb.label:tb.label_en)}</span>
  <table class="form" id="${prefix}__tbl__${esc(tb.name)}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  <button class="sec small" type="button" onclick="addTableRow('${prefix}','${esc(tb.name)}')">${esc(t('addRow'))}</button></div>`;
}
function addTableRow(prefix, tname) {
  const tbl = $(prefix + '__tbl__' + tname);
  if (!tbl) return;
  const cols = [...tbl.querySelector('thead tr').children].length - 1;
  // next row index = max existing + 1 (row count would collide after a ✕ delete)
  const rs = [...tbl.querySelectorAll('tbody tr [data-r]')].map(el => +el.dataset.r);
  const r = (rs.length ? Math.max(...rs) : -1) + 1;
  const tr = document.createElement('tr');
  for (let i = 0; i < cols; i++)
    tr.insertAdjacentHTML('beforeend', `<td><input id="${prefix}__${esc(tname)}__${r}__col${i}" data-t="${esc(tname)}" data-r="${r}" data-c="col${i}"></td>`);
  tr.insertAdjacentHTML('beforeend', `<td><button class="ghost" type="button" onclick="this.closest('tr').remove()">${t('delRow')}</button></td>`);
  tbl.querySelector('tbody').appendChild(tr);
}
function collectValues(prefix, form) {
  const values = {}, tables = {};
  const reqMissing = [];
  // id'd controls plus any id-less [data-t] row inputs (belt and braces)
  document.querySelectorAll(`[id^="${prefix}__"],[data-t]`).forEach(el => {
    if (el.dataset.f) {
      const v = el.type === 'checkbox' ? el.checked : (el.tagName === 'CANVAS' ? sigData[el.id] || '' : el.value);
      values[el.dataset.f] = v;
    } else if (el.dataset.t) {
      const tn = el.dataset.t, r = +el.dataset.r, c = el.dataset.c || el.closest('td').cellIndex;
      tables[tn] = tables[tn] || [];
      tables[tn][r] = tables[tn][r] || {};
      tables[tn][r][typeof c === 'string' ? c : 'col' + c] = el.type === 'checkbox' ? el.checked : el.value;
    }
  });
  const allFields = [...form.header, ...form.footer];
  for (const f of allFields) if (f.required && !values[f.name]) reqMissing.push(LBL(f));
  return {values, tables, reqMissing};
}

/* ---------- signature pad ---------- */
const sigData = {};
function wireSig(canvas) {
  const ctx = canvas.getContext('2d');
  const fit = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = 360; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#111'; };
  fit(); let drawing = false, lx = 0, ly = 0;
  const pos = e => { const r = canvas.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e;
    return [(p.clientX - r.left) * 2, (p.clientY - r.top) * 2]; };
  const start = e => { e.preventDefault(); drawing = true; [lx, ly] = pos(e); };
  const move = e => { if (!drawing) return; e.preventDefault(); const [x, y] = pos(e);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke(); lx = x; ly = y; };
  const end = () => { if (!drawing) return; drawing = false;
    // downscale to keep <1MB
    const small = document.createElement('canvas'); small.width = 480; small.height = 180;
    small.getContext('2d').drawImage(canvas, 0, 0, 480, 180);
    let url = small.toDataURL('image/png');
    if (url.length > 900000) url = small.toDataURL('image/jpeg', 0.7);
    sigData[canvas.id] = url;
  };
  canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend', end);
  canvas._clear = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); delete sigData[canvas.id]; };
}

/* ---------- view: template picker ---------- */
async function renderTemplates() {
  S.view = 'templates';
  app().innerHTML = chrome(t('chooseTemplate'), {lock:true}) + `
  <div class="card"><h2>${esc(t('chooseTemplate'))}</h2><div id="tpllist"><p class="mut">${esc(t('loading'))}</p></div>
  <button class="ghost" onclick="renderDashboard()">${esc(t('back'))}</button></div>` + footnav('incidents');
  const m = await loadManifest();
  $('tpllist').innerHTML = m.map(x => `
    <button class="modebtn" onclick="renderFill('${x.id}')">📄 <b>${esc(LANG==='es'?x.name_es:x.name_en)}</b><br>
    <span class="small mut">v${x.version} · ${esc(x.id)}</span></button>`).join('');
}

/* ---------- view: fill form ---------- */
let curForm = null;
async function renderFill(tplId) {
  S.view = 'fill'; S.templateId = tplId; setHash(routeFor('form', S.incidentId, tplId));
  app().innerHTML = chrome(t('fill'), {lock:true}) + `
  <div class="card"><p class="mut">${esc(t('loading'))}</p></div>` + footnav('incidents');
  let xml;
  try { xml = await loadTemplateXml(tplId); }
  catch (e) { app().innerHTML = chrome('⚠', {lock:true}) + `<div class="card"><p>${esc(t('tplFail'))}</p>
    <button class="ghost" onclick="renderTemplates()">${esc(t('back'))}</button></div>`; return; }
  curForm = parseForm(xml);
  const f = curForm, P = 'fld';
  const pad = n => String(n).padStart(2, '0');
  const footNonsig = f.footer.filter(x => x.type !== 'signature');
  const footSig = f.footer.filter(x => x.type === 'signature');
  const secClose = pad(2 + f.tables.length), secSign = pad(3 + f.tables.length);
  app().innerHTML = chrome(`📝 ${esc(LANG==='es'?f.title:f.title_en)}`, {lock:true}) + `
  <div class="card screen-only">
    <div class="formid"><span>N.&ordm; ${esc(f.id)} &middot; v${esc(String(f.version||1))}</span><span>${esc(LANG==='es'?'Diligenciar':'Fill out')}</span></div>
    <div class="masthead">
      <div class="orgline">Centro de Formularios &middot; CERT</div>
      <h2>${esc(LANG==='es'?f.title:f.title_en)}</h2>
      <div class="sub">${esc(t('fill'))}</div>
    </div>
    <div class="fsection"><span class="section-tag"><span class="n">01</span>${esc(LANG==='es'?'Datos generales':'General info')}</span>
      <div class="field"><label class="f" for="sub-team">${esc(t('team'))}</label><input id="sub-team" maxlength="60" value="Equipo 2"></div>
      ${f.header.map(x => fieldInput(x, P)).join('')}
    </div>
    ${f.tables.map((tb, i) => tableHtml(tb, P, null, pad(i + 2))).join('')}
    ${footNonsig.length ? `<div class="fsection"><span class="section-tag"><span class="n">${secClose}</span>${esc(LANG==='es'?'Cierre':'Closing')}</span>${footNonsig.map(x => fieldInput(x, P)).join('')}</div>` : ''}
    ${footSig.length ? `<div class="fsection"><span class="section-tag"><span class="n">${secSign}</span>${esc(t('signature'))}</span>${footSig.map(x => fieldInput(x, P)).join('')}<button class="sec small" type="button" onclick="clearSigs()">${esc(t('clear'))}</button></div>` : ''}
    <hr>
    <button class="warn" onclick="saveSubmission('signed')">${esc(t('submitSigned'))}</button>
    <button class="sec" onclick="saveSubmission('draft')">${esc(t('submitDraft'))}</button>
    <button class="ghost" onclick="renderTemplates()">${esc(t('back'))}</button>
  </div>` + footnav('incidents');
  document.querySelectorAll('canvas.sig').forEach(wireSig);
}
function clearSigs() { document.querySelectorAll('canvas.sig').forEach(c => c._clear && c._clear()); }
async function saveSubmission(status) {
  const {values, tables, reqMissing} = collectValues('fld', curForm);
  if (reqMissing.length) { toast(t('fillRequired') + ' ' + reqMissing.slice(0,3).join(', ')); return; }
  if (status === 'signed') {
    const sigFields = curForm.footer.filter(x => x.type === 'signature');
    if (sigFields.length && !sigFields.some(f => values[f.name])) { toast(t('sigRequired')); return; }
  }
  const m = (MANIFEST || []).find(x => x.id === S.templateId);
  const doc = {
    templateId: S.templateId, templateVersion: m ? m.version : 1,
    incidentId: S.incidentId, team: $('sub-team').value.trim() || 'Equipo 2',
    fieldValues: values, tables, status, demo: false,
    actor: S.actor, uid: S.uid || null, createdAt: ts(), updatedAt: ts()
  };
  const id = await writeDoc('submissions', null, doc);
  await audit('submission.' + status, 'submissions', id);
  toast(t('saved')); S.submissionId = id; renderSubmission(id);
}

/* Strict allowlist for stored data-URL images: only our own signature-pad
   output (png/jpeg base64, no quotes or exotic chars) may become <img>.
   Anything else falls back to escaped text — never raw HTML. */
const IMG_DATAURL_RE = /^data:image\/(png|jpe?g);base64,[A-Za-z0-9+/=]+$/;
const safeImg = v => typeof v === 'string' && v.length < 1200000 && IMG_DATAURL_RE.test(v);
function openSubmission(id) { S.submissionId = id; S.view = 'submission'; stopDemo(); renderSubmission(id); }
async function renderSubmission(id) {
  S.view = 'submission';
  app().innerHTML = chrome(t('details'), {lock:true}) + `<div class="card"><p class="mut">${esc(t('loading'))}</p></div>`;
  let d;
  try { d = await db.collection('submissions').doc(id).get(); } catch(e) { d = null; }
  if (!d || !d.exists) { toast('?'); renderDashboard(); return; }
  const s = d.data();
  const name = tplName(s.templateId);
  const fv = s.fieldValues || {};
  const rows = Object.entries(fv).map(([k, v]) => {
    const disp = safeImg(v) ? `<img src="${v}" style="max-width:220px;border:1px solid var(--line)">` : esc(v === true ? '✓' : v === false ? '✗' : v);
    return `<div class="kv"><dt><b>${esc(k)}</b></dt><dd class="pv">${disp}</dd></div>`;
  }).join('');
  const trows = Object.entries(s.tables || {}).map(([tn, arr]) => {
    if (!arr || !arr.length) return '';
    const cols = [...new Set(arr.flatMap(r => Object.keys(r || {})))];
    return `<h3>${esc(tn)}</h3><table class="form"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>` +
      arr.map(r => `<tr>${cols.map(c => `<td>${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('') + `</tbody></table>`;
  }).join('');
  app().innerHTML = chrome(`📄 ${esc(name)}`, {lock:true}) + `
  <div class="card print-area">
    ${s.demo === true ? `<span class="stamp red demo-corner">Demo</span>` : ''}
    <div class="formid"><span>N.&ordm; ${esc(s.templateId||'')}</span><span>${fmtT(s.createdAt)}</span></div>
    <div class="masthead">
      <div class="orgline">Centro de Formularios · CERT</div>
      <h2>${esc(name)}</h2>
      <div class="sub"><span class="stamp ${s.status==='signed'?'red':'amber'}" style="font-size:15px">${esc(s.status==='signed'?t('signed'):t('draft'))}</span></div>
    </div>
    <div class="kv">
      <dt>${esc(t('incidents'))}</dt><dd>${esc(S.incident ? S.incident.name_es : (s.incidentId||''))}</dd>
      <dt>${esc(t('team'))}</dt><dd>${esc(s.team||'')}</dd>
      <dt>${esc(t('status'))}</dt><dd><span class="badge ${s.status==='signed'?'signed':'draft'}">${esc(s.status==='signed'?t('signed'):t('draft'))}</span></dd>
      <dt>${esc(t('submittedBy'))}</dt><dd>${esc(s.actor||'')} · ${fmtT(s.createdAt)}</dd>
    </div><hr>
    <h3>${esc(t('fieldValues'))}</h3>${rows}${trows}
  </div>
  <div class="card screen-only noprint">
    <button onclick="window.print()">🖨️ ${esc(t('print'))}</button>
    <button class="sec" onclick="renderScans('${esc(id)}')">📎 ${esc(t('uploadScan'))}</button>
    <button class="ghost" onclick="renderDashboard()">${esc(t('back'))}</button>
  </div>` + footnav('incidents');
}

/* ---------- view: scans ---------- */
function renderScans(subId) {
  S.view = 'scans';
  app().innerHTML = chrome(`📎 ${esc(t('scans'))}`, {lock:true}) + `
  <div class="card">
    <label class="f">${esc(t('pickFile'))}</label>
    <input type="file" id="scanfile" accept="image/*,.pdf">
    <button onclick="uploadScan('${esc(subId||'')}')">${esc(t('uploadScan'))}</button>
    <button class="ghost" onclick="${subId ? `openSubmission('${esc(subId)}')` : 'renderDashboard()'}">${esc(t('back'))}</button>
  </div>
  <div class="card"><h3>${esc(t('scans'))}</h3><div id="scanlist"><p class="mut">${esc(t('loading'))}</p></div></div>` + footnav('incidents');
  db.collection('scans').where('incidentId','==',S.incidentId).orderBy('createdAt','desc').limit(30)
    .onSnapshot(snap => {
      const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
      const el = $('scanlist'); if (!el) return;
      el.innerHTML = rows.length ? rows.map(r => `
        <div class="listitem"><b>📎 ${esc(r.fileName||'')}</b><br>
        <span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('')
        : `<p class="mut">${esc(t('noItems'))}</p>`;
    });
}
async function uploadScan(subId) {
  const f = $('scanfile').files[0];
  if (!f) return;
  const base = subId || S.incidentId || 'misc';
  const path = `forms/scans/${base}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  try {
    const ref = storage.ref(path);
    await ref.put(f);
    const doc = { incidentId: S.incidentId, submissionId: subId || null,
      fileName: f.name, storagePath: path, actor: S.actor, uid: S.uid || null,
      demo: false, createdAt: ts() };
    const id = await writeDoc('scans', null, doc);
    await audit('scan.upload', 'scans', id);
    toast(t('scanOk')); renderScans(subId);
  } catch (e) {
    const code = (e && e.code) || '';
    toast(code.includes('unauthorized') || code.includes('permission') ? t('scan403') : t('scanErr'));
  }
}

/* ---------- DEMO: live view + simulator ---------- */
const DEMO_ACTORS = ['Equipo DEMO 1', 'Equipo DEMO 2'];
const DEMO_FILLER = [
  {t:'damage_assessment', v:{incident_date:'2026-09-20', team_name:'Equipo DEMO 1', team_leader:'Demo Líder', scribe:'Demo Escriba', page:'1 de 2'}},
  {t:'personnel_signin', v:{}},
  {t:'communications_log', v:{}},
  {t:'equipment_inventory', v:{}},
  {t:'victim_treatment_record', v:{}},
  {t:'briefing_assignment', v:{}},
  {t:'assignment_tracking', v:{}},
  {t:'general_message', v:{message_text:'Mensaje de prueba del simulador DEMO — ignórese.'}},
];
let demoStep = 0;
function enterDemo() { S.view = 'demo'; stopListeners(); renderDemoView(); startDemoSim(); }
async function renderDemoView() {
  S.view = 'demo'; S.demoView = true; setHash(routeFor('demo'));
  app().innerHTML = chrome(`🎭 ${esc(t('demoView'))}`, {demo:true}) + `
  <div class="card">
    <span class="stamp red demo-corner">Demo</span>
    <div class="masthead">
      <div class="orgline">Centro de Formularios · CERT</div>
      <h2>${esc(t('demoView'))}</h2>
      <div class="sub">${esc(LANG==='es'?'Datos simulados, no reales':'Simulated data, not real')}</div>
    </div>
    <div class="demo-banner"><span class="stamp red">Demo</span></div>
    <p class="small mut">${esc(t('simOn'))}</p>
    <button class="ghost" onclick="exitDemo()">${unlocked() ? esc(t('back')) : esc(t('close'))}</button></div>
  <div class="card"><h3>${esc(t('teams'))} <span class="badge demo">DEMO</span></h3><div id="demo-teams"><p class="mut small">${esc(t('loading'))}</p></div></div>
  <div class="card"><h3>${esc(t('submissions'))} <span class="badge demo">DEMO</span></h3><div id="demo-subs"><p class="mut small">${esc(t('loading'))}</p></div></div>
  <div class="card"><h3>${esc(t('scans'))} <span class="badge demo">DEMO</span></h3><div id="demo-scans"><p class="mut small">${esc(t('loading'))}</p></div></div>`;
  if (!FB_OK) return;
  S.unsub.push(db.collection('incidents').doc(DEMO_ORG_ID).collection('teams')
    .onSnapshot(snap => { const el = $('demo-teams'); if (!el) return;
      const rows = []; snap.forEach(x => rows.push({id:x.id, ...x.data()}));
      el.innerHTML = rows.length ? rows.map(tm => `<div class="kv"><dt><b>${esc(tm.name||tm.id)}</b></dt><dd>${esc(tm.status||'—')} <span class="small mut">· ${esc(tm.actor||'')}</span></dd></div>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
    }));
  const demoList = (coll, elId) => S.unsub.push(db.collection(coll).where('demo','==',true)
    .orderBy('createdAt','desc').limit(20).onSnapshot(snap => { const el = $(elId); if (!el) return;
      const rows = []; snap.forEach(x => rows.push({id:x.id, ...x.data()}));
      el.innerHTML = rows.length ? rows.map(r => `<div class="listitem"><b>${esc(coll==='submissions'?tplName(r.templateId):(r.fileName||r.name||r.id))}</b> <span class="badge demo">DEMO</span><br><span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
    }));
  demoList('submissions', 'demo-subs'); demoList('scans', 'demo-scans');
}
function exitDemo() { stopDemo(); S.demoView = false; stopListeners(); unlocked() && S.mode ? go('incidents') : renderPin(); }
async function demoTick() {
  if (!FB_OK || !navigator.onLine || S.view !== 'demo') return;
  const actor = DEMO_ACTORS[demoStep % 2];
  const kind = demoStep % 4;
  try {
    if (kind === 0) { // team status update
      const teamId = 'demo-team-' + ((demoStep % 2) + 1);
      const statuses = ['En ruta al área', 'Evaluando daños', 'En puesto de mando', 'Completado'];
      await db.collection('incidents').doc(DEMO_ORG_ID).collection('teams').doc(teamId)
        .set({ name: actor, status: statuses[demoStep % 4], actor, at: ts(), demo: true });
      await db.collection('audit').doc().set({ actor, mode:'demo', action:'demo.team_status', collection:'teams', docId: teamId, at: ts() });
    } else if (kind === 1) { // submission with random template
      const f = DEMO_FILLER[demoStep % DEMO_FILLER.length];
      await db.collection('submissions').doc()
        .set({ templateId: f.t, templateVersion: 1, incidentId: DEMO_ORG_ID, team: actor,
          fieldValues: f.v, tables: {}, status: 'draft', demo: true, actor, createdAt: ts(), updatedAt: ts() });
    } else if (kind === 2) { // comms-log-style submission
      const msgs = ['Llegada al punto de reunión confirmada.', 'Solicitando más botiquines en el área B.', 'Comunicación radial restablecida.'];
      await db.collection('submissions').doc()
        .set({ templateId: 'communications_log', templateVersion: 1, incidentId: DEMO_ORG_ID, team: actor,
          fieldValues: { log_message: msgs[demoStep % msgs.length], log_time: new Date().toTimeString().slice(0,5) },
          tables: {}, status: 'draft', demo: true, actor, createdAt: ts(), updatedAt: ts() });
    } else { // scan doc
      await db.collection('scans').doc()
        .set({ incidentId: DEMO_ORG_ID, fileName: 'demo-scan-' + Date.now() + '.jpg',
          storagePath: 'forms/scans/demo/placeholder.jpg', actor, demo: true, createdAt: ts() });
    }
  } catch (e) { /* demo sim is best-effort */ }
  demoStep++;
}
function startDemoSim() {
  stopDemo();
  demoTick();
  S.demoTimer = setInterval(demoTick, DEMO_TICK_MS);
}

/* ---------- deep links: hash routing ---------- */
/* __HASH_ROUTER_START__ */
function parseHash(hash) {
  // Pure: '#/incident/{id}' | '#/incident/{id}/form/{tpl}' | '#/demo' | '' | garbage
  // -> {route:'demo'} | {route:'incident',incidentId} | {route:'form',incidentId,templateId}
  //    | {route:'none'} | {route:'invalid'}
  let h = String(hash || '');
  if (h.charAt(0) === '#') h = h.slice(1);
  h = h.split('?')[0]; // ignore query junk
  if (!h || h === '/') return { route: 'none' };
  if (h.charAt(0) === '/') h = h.slice(1);
  let parts;
  try { parts = h.split('/').map(p => decodeURIComponent(p)); }
  catch (e) { return { route: 'invalid' }; }
  if (parts[0] === 'demo' && parts.length === 1) return { route: 'demo' };
  if (parts[0] === 'incident' && parts.length === 2 && parts[1])
    return { route: 'incident', incidentId: parts[1] };
  if (parts[0] === 'incident' && parts.length === 4 && parts[1] && parts[2] === 'form' && parts[3])
    return { route: 'form', incidentId: parts[1], templateId: parts[3] };
  return { route: 'invalid' };
}
function routeFor(kind, a, b) {
  if (kind === 'demo') return '#/demo';
  if (kind === 'form')
    return '#/incident/' + encodeURIComponent(a) + '/form/' + encodeURIComponent(b);
  return '#/incident/' + encodeURIComponent(a);
}
/* __HASH_ROUTER_END__ */
let pendingRoute = null;   // deep link waiting on PIN gate / mode choice
let suppressHash = false;  // set while writing hash ourselves (no loop)

function setHash(h) {
  if (location.hash === h) return;
  suppressHash = true;
  location.hash = h;
}
function routeFromHash(initial) {
  const r = parseHash(location.hash);
  switch (r.route) {
    case 'none':
      // browser back out of a deep view -> incidents list (or PIN gate)
      if (!initial && (S.view === 'dashboard' || S.view === 'fill' || S.view === 'error')) {
        if (unlocked() && S.mode) renderIncidents(); else renderPin();
        return true;
      }
      return false;
    case 'demo':
      enterDemo();
      return true;
    case 'incident':
      openIncidentRoute(r.incidentId);
      return true;
    case 'form':
      openFormRoute(r.incidentId, r.templateId);
      return true;
    default: // 'invalid'
      renderRouteError('hash');
      return true;
  }
}
window.addEventListener('hashchange', () => {
  if (suppressHash) { suppressHash = false; return; }
  routeFromHash(false);
});
function resumePending() {
  const p = pendingRoute; pendingRoute = null;
  if (!p) { go('incidents'); return; }
  if (p.type === 'form') openFormRoute(p.incidentId, p.templateId);
  else openIncidentRoute(p.incidentId);
}
async function openIncidentRoute(id) {
  if (id === DEMO_ORG_ID) { enterDemo(); return; } // demo org -> live demo view (quarantine intact)
  if (!unlocked()) { pendingRoute = { type: 'incident', incidentId: id }; renderPin(); return; }
  if (!S.mode) { pendingRoute = { type: 'incident', incidentId: id }; renderMode(); return; }
  setHash(routeFor('incident', id));
  if (S.view === 'dashboard' && S.incidentId === id) return; // already here (back/forward)
  if (!FB_OK) { renderRouteError('offline'); return; }
  try {
    const d = await db.collection('incidents').doc(id).get();
    if (!d.exists || (d.data() || {}).demo === true) { renderRouteError('incident'); return; }
  } catch (e) { renderRouteError('offline'); return; }
  S.incidentId = id; S.view = 'dashboard'; stopDemo(); renderDashboard();
}
async function openFormRoute(incidentId, templateId) {
  if (incidentId === DEMO_ORG_ID) { enterDemo(); return; }
  if (!unlocked()) { pendingRoute = { type: 'form', incidentId, templateId }; renderPin(); return; }
  if (!S.mode) { pendingRoute = { type: 'form', incidentId, templateId }; renderMode(); return; }
  setHash(routeFor('form', incidentId, templateId));
  if (S.view === 'fill' && S.incidentId === incidentId && S.templateId === templateId) return;
  if (!FB_OK) { renderRouteError('offline'); return; }
  try {
    const d = await db.collection('incidents').doc(incidentId).get();
    if (!d.exists || (d.data() || {}).demo === true) { renderRouteError('incident'); return; }
  } catch (e) { renderRouteError('offline'); return; }
  const m = await loadManifest();
  if (!m.find(x => x.id === templateId)) { renderRouteError('template'); return; }
  S.incidentId = incidentId; stopDemo(); renderFill(templateId);
}
function renderRouteError(kind) {
  // ES-first: friendly Spanish error, never a blank screen
  S.view = 'error'; S.routeErr = kind; stopDemo();
  const msg = kind === 'template' ? 'Plantilla no encontrada'
    : kind === 'offline' ? 'Sin conexión'
    : kind === 'hash' ? 'Enlace no válido'
    : 'Incidente no encontrado';
  const sub = kind === 'offline'
    ? 'No se pudo cargar. Revise su conexión e inténtelo de nuevo.'
    : 'Revise el enlace e inténtelo de nuevo.';
  app().innerHTML = chrome(t('appName')) + `
  <div class="card center"><h2>⚠️ ${esc(msg)}</h2>
  <p class="mut">${esc(sub)}</p>
  <button onclick="exitRouteError()">${esc(t('back'))}</button></div>`;
}
function exitRouteError() {
  setHash('');
  if (unlocked() && S.mode) renderIncidents(); else renderPin();
}

/* ---------- router + boot ---------- */
function render() {
  pokeLock();
  switch (S.view) {
    case 'pin': return renderPin();
    case 'mode': return renderMode();
    case 'kiosk': return modeKiosk();
    case 'personal': return modePersonal();
    case 'incidents': return renderIncidents();
    case 'demo': return renderDemoView();
    case 'dashboard': return renderDashboard();
    case 'error': return renderRouteError(S.routeErr || 'hash');
    default: return renderPin();
  }
}
window.addEventListener('DOMContentLoaded', () => {
  syncOutbox();
  const kiosk = sessionStorage.getItem('cfc_kiosk');
  if (unlocked() && kiosk) { S.mode = 'kiosk'; S.actor = kiosk; }
  if (!routeFromHash(true)) {
    // no hash: existing behavior unchanged
    if (unlocked() && S.mode) S.view = 'incidents';
    else if (unlocked()) S.view = 'mode';
    render();
  }
});
/* expose handlers used by inline onclick */
Object.assign(window, { submitPin, pinKey, pinBack, pinClear, toggleLang, doLock, renderMode, modeKiosk, modePersonal,
  startKiosk, doLogin, doRegister, exitMode, go, renderIncidents, renderNewIncident,
  createIncident, openIncident, renderDashboard, renderTemplates, renderFill, addTableRow,
  clearSigs, saveSubmission, openSubmission, renderSubmission, renderScans, uploadScan,
  enterDemo, exitDemo, exitRouteError });
