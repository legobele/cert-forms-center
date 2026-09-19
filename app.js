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
const PIN_HASH_FALLBACK = "b3f25d01ddb3fafeb251acbce91c2880d8130a38e5c064e142414c6d2ebbaedc";
const DEMO_ORG_ID = "demo-2026-09-20";
const BUCKET_URL = "https://firebasestorage.googleapis.com/v0/b/cert-forms-center.firebasestorage.app/o/forms%2Ftemplates%2F";
/* Runtime-overridable from Firestore config/access (hardcoded fallbacks). */
let PIN_HASH = PIN_HASH_FALLBACK;
let LOCK_MIN = 10;
let KIOSK_DEFAULT_USER = "";
const DEMO_TICK_MS = 25000;

/* Pull PIN hash / auto-lock minutes / default kiosk user from Firestore
   config/access; keeps hardcoded fallbacks when offline or unset. */
async function loadConfig() {
  if (!FB_OK) return;
  try {
    const d = await db.collection('config').doc('access').get();
    if (!d.exists) return;
    const c = d.data() || {};
    if (typeof c.pinHash === 'string' && /^[0-9a-f]{64}$/i.test(c.pinHash)) PIN_HASH = c.pinHash;
    if (Number.isFinite(+c.autoLockMinutes) && +c.autoLockMinutes > 0) LOCK_MIN = +c.autoLockMinutes;
    if (typeof c.kioskDefaultUser === 'string') KIOSK_DEFAULT_USER = c.kioskDefaultUser.slice(0, 60);
    pokeLock(); // re-arm with the (possibly new) LOCK_MIN
  } catch (e) { /* offline: fallbacks stand */ }
}

/* ---------- i18n (STR/LANG pattern) ---------- */
const STR = {
  es: {
    appName: "Centro de Formularios CERT",
    pinTitle: "Ingrese el PIN del equipo",
    pinSub: "PIN de 6 dígitos. Se bloquea tras 10 min sin actividad.",
    pinBtn: "Desbloquear",
    pinBad: "PIN incorrecto",
    pinLocked: "Demasiados intentos. Intente de nuevo en {s} s.",
    pinIncomplete: "Ingrese los 6 dígitos del PIN.",
    pinDigit: "Dígito",
    draftStashed: "Bloqueo automático: borrador guardado en este dispositivo.",
    draftFound: "Hay un borrador sin guardar de antes del bloqueo.",
    restore: "Restaurar", discard: "Descartar",
    chooseMode: "¿Cómo va a usar esto?",
    kiosk: "Quiosco", kioskSub: "Sesión compartida en este dispositivo",
    personal: "Personal", personalSub: "Entrar con su cuenta",
    who: "¿Quién está usando esto?", namePh: "Nombre (p. ej. Giulia)",
    anonUser: "Anónimo",
    start: "Empezar", login: "Entrar", register: "Crear cuenta",
    email: "Correo", pass: "Contraseña",
    authOff: "Auth aún no habilitado. Pida al admin que active el proveedor Email/Password en la consola de Firebase.",
    authErr: "No se pudo entrar. Revise correo y contraseña.",
    incidents: "Incidentes", templates: "Plantillas", scans: "Escaneos", demo: "Demo",
    newIncident: "Nuevo incidente", nameEs: "Nombre del incidente", nameReq: "Escriba un nombre para el incidente.",
    date: "Fecha", kind: "Tipo", exercise: "Ejercicio", real: "Real",
    status: "Estado", active: "Activo", archived: "Archivado",
    create: "Crear", cancel: "Cancelar", back: "Atrás",
    dashboard: "Tablero", fill: "Llenar formulario", save: "Guardar",
    sign: "Firmar", clear: "Borrar firma", saved: "Guardado",
    draft: "Borrador", signed: "Firmado", print: "Imprimir",
    chooseTemplate: "Elija una plantilla", required: "obligatorio",
    addRow: "+ Fila", delRow: "✕", delRowAria: "Eliminar fila", rowWord: "Fila", team: "Equipo",
    uploadScan: "Subir escaneo", pickFile: "Elegir archivo",
    scan403: "Sin permiso para subir (el servidor denegó el acceso). Guarde el archivo localmente por ahora.",
    scanOk: "Escaneo subido", scanErr: "No se pudo subir el escaneo.",
    scanTooBig: "Archivo demasiado grande (máx. 10 MB).",
    scanBadType: "Tipo de archivo no permitido (imagen o PDF).",
    scanPending: "No se pudo subir el archivo; quedó registrado como pendiente.",
    offlineQueued: "Sin conexión: guardado en la cola, se sincronizará.",
    outboxSynced: "Cola sincronizada.",
    outboxFull: "Almacenamiento lleno: no se pudo guardar en la cola. Libere espacio e inténtelo de nuevo.",
    lock: "Bloquear", lang: "EN",
    pending: "Pendiente",
    teamDefault: "Equipo 2",
    simStatuses: ["En ruta al área", "Evaluando daños", "En puesto de mando", "Completado"],
    simMsgs: ["Llegada al punto de reunión confirmada.", "Solicitando más botiquines en el área B.", "Comunicación radial restablecida."],
    routeErrTemplate: "Plantilla no encontrada", routeErrOffline: "Sin conexión",
    routeErrHash: "Enlace no válido", routeErrIncident: "Incidente no encontrado",
    routeErrOfflineSub: "No se pudo cargar. Revise su conexión e inténtelo de nuevo.",
    routeErrSub: "Revise el enlace e inténtelo de nuevo.", exit: "Salir",
    teams: "Equipos", submissions: "Formularios", recent: "Recientes",
    teamName: "Nombre del equipo", teamStatus: "Estado inicial",
    teamNameReq: "Escriba el nombre del equipo.", teamAdded: "Equipo registrado.",
    addTeam: "＋ Registrar equipo",
    submittedBy: "Por", at: "el", noItems: "Nada aquí todavía.",
    demoLive: "VER DEMO EN VIVO", demoBanner: "⚠ DEMO — datos simulados, no reales",
    demoView: "Vista demo en vivo", simOn: "Simulador activo: actividad demo cada ~25 s",
    close: "Cerrar", details: "Detalles", signature: "Firma", sigAlt: "Firma manuscrita",
    actorName: "Nombre de quien llena", submitSigned: "Guardar y firmar",
    submitDraft: "Guardar borrador", tplFrom: "Plantilla",
    rows: "filas", signHere: "Firme aquí", tplFail: "No se pudo cargar la plantilla.",
    incCreated: "Incidente creado", fillRequired: "Complete los campos obligatorios.",
    sigRequired: "Se requiere firma para guardar firmado.",
    demoTeam1: "Equipo DEMO 1", demoTeam2: "Equipo DEMO 2",
    noAuth: "Sesión expirada, vuelva a entrar.",
    viewForm: "Ver", fieldValues: "Valores", loading: "Cargando…",
    listenErr: "No se pudo cargar la lista. Revise su conexión.",
    retry: "Reintentar",
    indexErr: "Falta un índice compuesto en la consola de Firebase — solo un operador puede crearlo. Avise al coordinador.",
    orgline: "Centro de Formularios · CERT",
    pinClearBtn: "Borrar", backKey: "Retroceso", pinPad: "Teclado numérico",
    fillOut: "Diligenciar", secGeneral: "Datos generales", secClosing: "Cierre",
    offlineBanner: "Sin conexión — los datos se guardan en el dispositivo<br>y se sincronizan cuando haya red.",
    formsPending: "formularios por sincronizar", demoSub: "Datos simulados, no reales",
  },
  en: {
    appName: "CERT Forms Center",
    pinTitle: "Enter the team PIN",
    pinSub: "6-digit PIN. Locks after 10 min of inactivity.",
    pinBtn: "Unlock",
    pinBad: "Wrong PIN",
    pinLocked: "Too many attempts. Try again in {s} s.",
    pinIncomplete: "Enter all 6 PIN digits.",
    pinDigit: "Digit",
    draftStashed: "Auto-lock: draft saved on this device.",
    draftFound: "There's an unsent draft from before the lock.",
    restore: "Restore", discard: "Discard",
    chooseMode: "How will you use this?",
    kiosk: "Kiosk", kioskSub: "Shared session on this device",
    personal: "Personal", personalSub: "Sign in with your account",
    who: "Who is using this?", namePh: "Name (e.g. Giulia)",
    anonUser: "Anonymous",
    start: "Start", login: "Sign in", register: "Create account",
    email: "Email", pass: "Password",
    authOff: "Auth not enabled yet. Ask the admin to enable the Email/Password provider in the Firebase console.",
    authErr: "Could not sign in. Check email and password.",
    incidents: "Incidents", templates: "Templates", scans: "Scans", demo: "Demo",
    newIncident: "New incident", nameEs: "Incident name", nameReq: "Enter an incident name.",
    date: "Date", kind: "Type", exercise: "Exercise", real: "Real",
    status: "Status", active: "Active", archived: "Archived",
    create: "Create", cancel: "Cancel", back: "Back",
    dashboard: "Dashboard", fill: "Fill a form", save: "Save",
    sign: "Sign", clear: "Clear signature", saved: "Saved",
    draft: "Draft", signed: "Signed", print: "Print",
    chooseTemplate: "Pick a template", required: "required",
    addRow: "+ Row", delRow: "✕", delRowAria: "Delete row", rowWord: "Row", team: "Team",
    uploadScan: "Upload scan", pickFile: "Choose file",
    scan403: "No permission to upload (server denied access). Keep the file locally for now.",
    scanOk: "Scan uploaded", scanErr: "Could not upload the scan.",
    scanTooBig: "File too large (max 10 MB).",
    scanBadType: "File type not allowed (image or PDF).",
    scanPending: "Could not upload the file; recorded as pending.",
    offlineQueued: "Offline: saved to queue, will sync.",
    outboxSynced: "Queue synced.",
    outboxFull: "Storage full: could not save to the queue. Free space and try again.",
    lock: "Lock", lang: "ES",
    pending: "Pending",
    teamDefault: "Team 2",
    simStatuses: ["En route to the area", "Assessing damage", "At the command post", "Completed"],
    simMsgs: ["Arrival at the rally point confirmed.", "Requesting more first-aid kits in area B.", "Radio communication restored."],
    routeErrTemplate: "Template not found", routeErrOffline: "Offline",
    routeErrHash: "Invalid link", routeErrIncident: "Incident not found",
    routeErrOfflineSub: "Could not load. Check your connection and try again.",
    routeErrSub: "Check the link and try again.", exit: "Exit",
    teams: "Teams", submissions: "Submissions", recent: "Recent",
    teamName: "Team name", teamStatus: "Initial status",
    teamNameReq: "Enter the team name.", teamAdded: "Team registered.",
    addTeam: "+ Register team",
    submittedBy: "By", at: "at", noItems: "Nothing here yet.",
    demoLive: "VIEW LIVE DEMO", demoBanner: "⚠ DEMO — simulated data, not real",
    demoView: "Live demo view", simOn: "Simulator on: demo activity every ~25 s",
    close: "Close", details: "Details", signature: "Signature", sigAlt: "Handwritten signature",
    actorName: "Filler name", submitSigned: "Save and sign",
    submitDraft: "Save draft", tplFrom: "Template",
    rows: "rows", signHere: "Sign here", tplFail: "Could not load the template.",
    incCreated: "Incident created", fillRequired: "Fill the required fields.",
    sigRequired: "Signature required to save as signed.",
    demoTeam1: "DEMO Team 1", demoTeam2: "DEMO Team 2",
    noAuth: "Session expired, sign in again.",
    viewForm: "View", fieldValues: "Values", loading: "Loading…",
    listenErr: "Could not load the list. Check your connection.",
    retry: "Retry",
    indexErr: "A composite index is missing in the Firebase console — only an operator can create it. Tell the coordinator.",
    orgline: "CERT Forms Center",
    pinClearBtn: "Clear", backKey: "Backspace", pinPad: "Numeric keypad",
    fillOut: "Fill out", secGeneral: "General info", secClosing: "Closing",
    offlineBanner: "Offline — data stays on this device<br>and syncs when a network returns.",
    formsPending: "forms pending sync", demoSub: "Simulated data, not real",
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
  d.setAttribute('role', 'status'); // los avisos se anuncian en lectores de pantalla
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3200);
}
/* In-flight guard: double-clicks / double-taps don't create duplicates. */
const _busy = new Set();
async function once(key, fn) {
  if (_busy.has(key)) return;
  _busy.add(key);
  try { await fn(); } finally { _busy.delete(key); }
}
const ts = () => firebase.firestore.FieldValue.serverTimestamp();
/* serverTimestamp() sentinels don't survive the outbox's JSON round-trip
   (they'd replay as garbage objects). Strip to a marker on queue, re-stamp on sync. */
const TS_MARK = '__cfc_server_ts';
function stripSentinels(data) {
  const FV = (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) || null;
  const walk = v => {
    if (FV && v instanceof FV) return {[TS_MARK]: true};
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = walk(x); return o; }
    return v;
  };
  return walk(data);
}
function restoreSentinels(data) {
  const walk = v => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      if (v[TS_MARK] === true) return ts();
      const o = {}; for (const [k, x] of Object.entries(v)) o[k] = walk(x); return o;
    }
    return v;
  };
  return walk(data);
}
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
  auth.onAuthStateChanged(restorePersonalSession);
  FB_OK = true;
} catch (e) { console.warn('Firebase init failed', e); }

/* ---------- session state ---------- */
const S = {
  view: 'pin', mode: null, actor: null, uid: null,
  incidentId: null, incident: null, templateId: null, submissionId: null,
  tplCache: {}, unsub: [], demoTimer: null, dashSeq: 0,
};
function stopListeners() { S.unsub.forEach(u => { try { u(); } catch(e){} }); S.unsub = []; }
/* onSnapshot error handler: replace the eternal "Cargando…" with an ES error + retry.
   failed-precondition = missing composite index (console-operator action), so say so
   instead of blaming the connection; the retry button covers transient failures and
   the case where the operator just created the missing index. */
const RETRY_VIEW = { inclist:'renderIncidents', 'dash-teams':'renderDashboard', 'dash-subs':'renderDashboard',
  'dash-scans':'renderDashboard', scanlist:'renderScansList', 'demo-teams':'renderDemoView',
  'demo-subs':'renderDemoView', 'demo-scans':'renderDemoView' };
function renderScansList() { renderScans(S.scanSubId); }
function retryList(elId) { const fn = RETRY_VIEW[elId] && window[RETRY_VIEW[elId]]; if (fn) fn(); }
const snapErr = elId => err => {
  const el = $(elId); if (!el) return;
  const missing = err && /precondition/i.test(String(err.code || err));
  const msg = missing ? t('indexErr') : t('listenErr');
  el.innerHTML = `<p class="mut small">${esc(msg)}</p><button class="ghost" onclick="retryList('${esc(elId)}')">${esc(t('retry'))}</button>`;
};
function stopDemo() { if (S.demoTimer) { clearInterval(S.demoTimer); S.demoTimer = null; } }

/* ---------- audit ---------- */
async function audit(action, collection, docId) {
  const doc = { actor: S.actor || 'anon', mode: S.mode || 'none', action, collection, docId: docId || null, at: ts() };
  await writeDoc('audit', null, doc);
}

/* ---------- offline outbox ---------- */
const OUTBOX_KEY = 'cfc_outbox_v1';
const outbox = () => { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch(e){ return []; } };
function setOutbox(q) {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(q)); return true; }
  catch (e) { toast(t('outboxFull')); return false; } // quota exceeded: loud, not silent
}
function queueWrite(coll, docId, data, auditAction) {
  const q = outbox();
  q.push({coll, docId, data: stripSentinels(data), queuedAt: Date.now(),
    key: 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2),
    audit: auditAction ? {action: auditAction, actor: S.actor || 'anon', mode: S.mode || 'none'} : null});
  if (setOutbox(q)) toast(t('offlineQueued'));
}
/* Returns {id, queued}. Never hands out fake "queued-<ts>" ids: queued writes
   report QUEUED (not success) and their audit is deferred until sync, when the
   real doc id exists. demo:false default applies to offline writes too. */
async function writeDoc(coll, docId, data, auditAction) {
  if (!data.demo) data.demo = false;
  if (!FB_OK || !navigator.onLine) { queueWrite(coll, docId, data, auditAction); return {id: null, queued: true}; }
  try {
    const ref = docId ? db.collection(coll).doc(docId) : db.collection(coll).doc();
    await ref.set(data, {merge: false});
    return {id: ref.id, queued: false};
  } catch (e) { queueWrite(coll, docId, data, auditAction); return {id: null, queued: true}; }
}
let syncing = false;
async function syncOutbox() {
  if (!FB_OK || !navigator.onLine || syncing) return;
  const q = outbox(); if (!q.length) return;
  syncing = true;
  try {
    const rest = [];
    for (const w of q) {
      let ok = false, rid = null;
      try {
        const ref = w.docId ? db.collection(w.coll).doc(w.docId) : db.collection(w.coll).doc();
        await ref.set(restoreSentinels(w.data), {merge: false});
        ok = true; rid = ref.id;
      } catch (e) { rest.push(w); }
      if (ok && w.audit) { // deferred audit, now that the real doc id exists
        try {
          await db.collection('audit').doc().set({
            actor: w.audit.actor, mode: w.audit.mode, action: w.audit.action,
            collection: w.coll, docId: rid, at: ts()});
        } catch (e) { /* audit best-effort; the doc itself already synced */ }
      }
    }
    // merge anything queued while we were syncing — otherwise it is lost
    const done = new Set(q.map(w => w.key));
    const fresh = outbox().filter(w => !done.has(w.key));
    setOutbox(rest.concat(fresh));
    if (rest.length < q.length) toast(t('outboxSynced'));
  } finally { syncing = false; }
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
/* Lock button: in personal mode this also signs the Firebase user out —
   previously there was no way to close a personal session from the UI. */
async function lockNow() {
  if (S.mode === 'personal' && auth) { try { await auth.signOut(); } catch (e) {} }
  doLock();
}
/* doLock: the single choke point for every lock path — manual Lock button
   (lockNow), the auto-lock timer, and the tab-hide lock. In personal mode it
   also signs the Firebase user out (LOCAL persistence would otherwise keep the
   previous personal user signed in on this shared kiosk, and the next boot
   while still PIN-unlocked would silently resurrect their session). */
async function doLock() {
  stashDraft(); // never vaporize an in-progress form silently
  const wasPersonal = S.mode === 'personal';
  sessionStorage.removeItem('cfc_unlocked');
  sessionStorage.removeItem('cfc_kiosk');
  sessionStorage.removeItem('cfc_mode');
  S.mode = null; S.actor = null; S.uid = null; stopDemo(); stopListeners();
  pendingRoute = null; setHash('');
  if (wasPersonal && auth) { try { await auth.signOut(); } catch (e) {} }
  renderPin();
}
/* Snapshot an in-progress fill-form draft (incl. signature strokes captured
   so far) so the auto-lock / tab-hide doesn't destroy user work. */
function stashDraft() {
  try {
    if (S.view === 'fill' && curForm && S.templateId) {
      const snap = collectValues('fld', curForm);
      sessionStorage.setItem('cfc_draft', JSON.stringify({
        templateId: S.templateId, incidentId: S.incidentId,
        team: $('sub-team') ? $('sub-team').value : '',
        values: snap.values, tables: snap.tables, at: Date.now()
      }));
      toast(t('draftStashed'));
    }
  } catch (e) { /* quota or no draft — locking must never fail */ }
}
['pointerdown','keydown','touchstart','wheel'].forEach(ev =>
  window.addEventListener(ev, pokeLock, {passive: true}));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && unlocked()) doLock();
});
async function checkPin(pin) {
  const h = await sha256hex(pin);
  return constEq(h, PIN_HASH);
}
/* PIN brute-force guard: 5 fallos -> 60 s de bloqueo */
let pinFails = 0, pinLockUntil = 0;
async function submitPin() {
  const now = Date.now();
  if (now < pinLockUntil) { toast(t('pinLocked').replace('{s}', String(Math.ceil((pinLockUntil - now) / 1000)))); return; }
  const pin = [...document.querySelectorAll('#pinrow input')].map(b => b.value).join('');
  if (pin.length !== 6) { toast(t('pinIncomplete')); return; }
  if (await checkPin(pin)) {
    pinFails = 0; pinLockUntil = 0;
    sessionStorage.setItem('cfc_unlocked', '1'); pokeLock();
    // El callback one-shot de auth ya pudo haber resuelto al usuario persistido
    // mientras el equipo seguía bloqueado (caso normal con auth rápida): en ese
    // caso la sesión personal nunca se restaura. Reintentar aquí con el usuario
    // actual; si restaura, ya navegó a incidents y no mostramos el selector.
    if (auth && auth.currentUser && !S.mode) restorePersonalSession(auth.currentUser);
    if (!S.mode) renderMode();
  } else if (++pinFails >= 5) {
    pinFails = 0; pinLockUntil = Date.now() + 60000;
    toast(t('pinLocked').replace('{s}', '60'));
  } else toast(t('pinBad'));
}

/* ---------- header/footer chrome ---------- */
function chrome(titleHtml, opts = {}) {
  return `<header class="top"><div class="t">${titleHtml}</div>` +
    (opts.demo ? `<span class="tag">DEMO</span>` : '') +
    `<button class="ghost" style="color:#fff" onclick="toggleLang()">${t('lang')}</button>` +
    (opts.lock ? `<button class="ghost" style="color:#fff" onclick="lockNow()">🔒 ${t('lock')}</button>` : '') +
    `</header>`;
}
function footnav(active) {
  if (!S.mode || S.view === 'demo') return '';
  const items = [
    ['incidents', t('incidents'), "go('incidents')"],
    ['demo', t('demo'), "go('demo')"],
  ];
  return `<footer class="foot">` + items.map(([v, l, fn]) =>
    `<button class="${active===v?'on':''}"${active===v?' aria-current="page"':''} onclick="${fn}">${l}</button>`).join('') + `</footer>`;
}
/* La navegación inferior puede pedir la demo: debe pasar por enterDemo()
   (oyentes + simulador), no por render() a secas. */
function go(view) {
  if (view === 'demo') return enterDemo();
  S.view = view; stopDemo(); render();
}
function toggleLang() { LANG = LANG === 'es' ? 'en' : 'es'; localStorage.setItem('cfc_lang', LANG); document.documentElement.lang = LANG; render(); }

/* ---------- view: PIN gate ---------- */
function renderPin() {
  S.view = 'pin'; stopDemo(); stopListeners();
  const pinBoxes = [0,1,2,3,4,5].map(i =>
    `<input inputmode="numeric" maxlength="1" pattern="[0-9]" autocomplete="off" aria-label="${esc(t('pinDigit'))} ${i+1}">`).join('');
  app().innerHTML = chrome(t('appName')) + `
  <div class="card center">
    <div class="masthead">
      <div class="orgline">${esc(t('orgline'))}</div>
      <h1>&#129682; Tablilla</h1>
      <div class="sub">${esc(t('appName'))}</div>
    </div>
    <div class="pin-label">${esc(t('pinTitle'))}</div>
    <div class="pinrow" id="pinrow">${pinBoxes}</div>
    <div class="keypad" role="group" aria-label="${esc(t('pinPad'))}">
      <button type="button" onclick="pinKey('1')">1</button><button type="button" onclick="pinKey('2')">2</button><button type="button" onclick="pinKey('3')">3</button>
      <button type="button" onclick="pinKey('4')">4</button><button type="button" onclick="pinKey('5')">5</button><button type="button" onclick="pinKey('6')">6</button>
      <button type="button" onclick="pinKey('7')">7</button><button type="button" onclick="pinKey('8')">8</button><button type="button" onclick="pinKey('9')">9</button>
      <button type="button" class="fn" onclick="pinClear()">${esc(t('pinClearBtn'))}</button><button type="button" onclick="pinKey('0')">0</button><button type="button" class="fn" aria-label="${esc(t('backKey'))}" onclick="pinBack()">&#9003;</button>
    </div>
    <button class="warn" onclick="once('submitPin',submitPin)">${esc(t('pinBtn'))}</button>
    <button class="sec" onclick="enterDemo()">${esc(t('demoLive'))}</button>
    <p class="mut small">${esc(t('pinSub'))}</p>
    <div class="offline">&#9673; ${esc(t('offlineBanner'))}</div>
  </div>`;
  const boxes = [...document.querySelectorAll('#pinrow input')];
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => { b.value = b.value.replace(/\D/g,'').slice(0,1);
      if (b.value && i < 5) boxes[i+1].focus(); if (i === 5 && b.value) submitPin(); });
    b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && i > 0) boxes[i-1].focus(); });
  });
  // paste the full 6-digit PIN across the boxes instead of truncating to one digit
  document.getElementById('pinrow').addEventListener('paste', e => {
    const digits = ((e.clipboardData || {}).getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    boxes.forEach((b, i) => { b.value = digits[i] || ''; });
    const next = boxes.findIndex(b => !b.value);
    (next >= 0 ? boxes[next] : boxes[5]).focus();
    if (digits.length === 6) submitPin();
  });
  boxes[0].focus();
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
    <label class="f" for="kname">${esc(t('actorName'))}</label>
    <input id="kname" maxlength="60" placeholder="${esc(t('namePh'))}" value="${esc(KIOSK_DEFAULT_USER)}">
    <button onclick="startKiosk()">${esc(t('start'))}</button>
    <button class="ghost" onclick="renderMode()">${esc(t('back'))}</button>
  </div>`;
  $('kname').focus();
}
function startKiosk() {
  // never silently attribute to a default person: empty -> "Anónimo"
  const name = ($('kname').value || '').trim() || t('anonUser');
  S.mode = 'kiosk'; S.actor = name; sessionStorage.setItem('cfc_kiosk', name);
  sessionStorage.setItem('cfc_mode', 'kiosk');
  audit('mode.kiosk', 'sessions', null).catch(()=>{});
  resumePending();
}
function modePersonal() {
  S.view = 'personal';
  app().innerHTML = chrome(t('appName'), {lock:true}) + `
  <div class="card"><h2>👤 ${esc(t('personal'))}</h2>
    <label class="f" for="pemail">${esc(t('email'))}</label><input id="pemail" type="email" autocomplete="email">
    <label class="f" for="ppass">${esc(t('pass'))}</label><input id="ppass" type="password" autocomplete="current-password">
    <button onclick="doLogin()">${esc(t('login'))}</button>
    <button class="sec" onclick="doRegister()">${esc(t('register'))}</button>
    <button class="ghost" onclick="renderMode()">${esc(t('back'))}</button>
  </div>`;
}
/* Personal sessions survive reload: Firebase Auth persists (LOCAL); on boot
   we pick the signed-in user back up if the device is still PIN-unlocked. */
function restorePersonalSession(u) {
  if (u && unlocked() && !S.mode && (S.view === 'mode' || S.view === 'pin')) {
    S.mode = 'personal'; S.actor = u.email + ' (' + u.uid + ')'; S.uid = u.uid;
    sessionStorage.setItem('cfc_mode', 'personal');
    resumePending();
  } else if (!u && S.mode === 'personal') {
    // signed out elsewhere: drop the stale personal session
    S.mode = null; S.actor = null; S.uid = null;
    sessionStorage.removeItem('cfc_mode');
    if (S.view !== 'pin') renderMode();
  }
}
async function doLogin() {
  try {
    const u = await auth.signInWithEmailAndPassword($('pemail').value.trim(), $('ppass').value);
    S.mode = 'personal'; S.actor = u.user.email + ' (' + u.user.uid + ')'; S.uid = u.user.uid;
    sessionStorage.setItem('cfc_mode', 'personal');
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
    sessionStorage.setItem('cfc_mode', 'personal');
    audit('auth.register', 'sessions', u.user.uid).catch(()=>{});
    resumePending();
  } catch (e) {
    toast(e.code === 'auth/operation-not-allowed' ? t('authOff') : t('authErr'));
  }
}
async function exitMode() {
  if (S.mode === 'personal') { try { await auth.signOut(); } catch(e){} }
  sessionStorage.removeItem('cfc_kiosk'); sessionStorage.removeItem('cfc_mode');
  S.mode = null; S.actor = null; S.uid = null; stopDemo(); renderMode();
}

/* ---------- view: incidents ---------- */
function renderIncidents() {
  S.view = 'incidents'; S.incidentId = null; S.incident = null; stopDemo(); stopListeners();
  setHash('');
  const qlen = outbox().length;
  const stashed = sessionStorage.getItem('cfc_draft');
  app().innerHTML = chrome(`${esc(t('appName'))} · ${esc(S.actor||'')}`, {lock:true}) + `
  <div class="card">
    <div class="masthead">
      <div class="orgline">${esc(t('orgline'))}</div>
      <h2>${esc(t('incidents'))}</h2>
    </div>
    ${stashed ? `<div class="draft-banner"><p>⚠️ ${esc(t('draftFound'))}</p>
      <button class="sec small" onclick="restoreStashedDraft()">${esc(t('restore'))}</button>
      <button class="ghost small" onclick="discardStashedDraft()">${esc(t('discard'))}</button></div>` : ''}
    ${qlen ? `<div class="sync-strip"><span>&#9673; ${qlen} ${esc(t('formsPending'))}</span><span>&rarr;</span></div>` : ''}
    <button class="warn" onclick="renderNewIncident()">+ ${esc(t('newIncident'))}</button>
    <div id="inclist"><p class="mut">${esc(t('loading'))}</p></div></div>` + footnav('incidents');
  if (!FB_OK) { $('inclist').innerHTML = `<p class="mut">${esc(t('routeErrOffline'))}</p>`; return; }
  S.unsub.push(db.collection('incidents').orderBy('createdAt','desc').limit(50)
    .onSnapshot(snap => {
      const items = [];
      snap.forEach(d => { const x = d.data(); if (x.demo === true) return; items.push({id:d.id, ...x}); });
      $('inclist').innerHTML = items.length ? items.map(i => `
        <a class="listitem" href="javascript:openIncident('${i.id}')">
          <b>${esc(i.name_es || i.id)}</b><br>
          <span class="small mut">${esc(i.date||'')} · ${esc(i.kind==='real'?t('real'):t('exercise'))} ·
          <span class="badge ${esc(i.status||'active')}">${esc(i.status==='archived'?t('archived'):t('active'))}</span></span>
        </a>`).join('') : `<p class="mut">${esc(t('noItems'))}</p>`;
    }, snapErr('inclist')));
}
function renderNewIncident() {
  S.view = 'newincident'; stopListeners();
  app().innerHTML = chrome(t('newIncident'), {lock:true}) + `
  <div class="card"><h2>${esc(t('newIncident'))}</h2>
    <label class="f" for="iname">${esc(t('nameEs'))}</label><input id="iname" maxlength="120">
    <label class="f" for="idate">${esc(t('date'))}</label><input id="idate" type="date" value="2026-09-20">
    <label class="f" for="ikind">${esc(t('kind'))}</label>
    <select id="ikind"><option value="exercise">${esc(t('exercise'))}</option><option value="real">${esc(t('real'))}</option></select>
    <button onclick="once('createIncident',createIncident)">${esc(t('create'))}</button>
    <button class="ghost" onclick="renderIncidents()">${esc(t('cancel'))}</button>
  </div>`;
}
function renderNewIncidentKeep() {
  // language toggle: keep what the user already typed
  const keep = { name: $('iname') && $('iname').value, date: $('idate') && $('idate').value, kind: $('ikind') && $('ikind').value };
  renderNewIncident();
  if (keep.name != null) $('iname').value = keep.name;
  if (keep.date) $('idate').value = keep.date;
  if (keep.kind) $('ikind').value = keep.kind;
}
async function createIncident() {
  const name = $('iname').value.trim(); if (!name) { toast(t('nameReq')); return; }
  const data = { name_es: name, date: $('idate').value || '2026-09-20',
    kind: $('ikind').value, status: 'active', demo: false,
    actor: S.actor, createdAt: ts() };
  const {id, queued} = await writeDoc('incidents', null, data, 'incident.create');
  if (queued) { renderIncidents(); return; } // "encolado" toast already shown
  await audit('incident.create', 'incidents', id);
  toast(t('incCreated')); renderIncidents();
}

/* Registrar un equipo en el incidente real (tarjeta Equipos del tablero).
   Antes el único escritor de teams era el simulador demo. */
async function addTeam() {
  const nameEl = $('team-name'), stEl = $('team-status');
  const name = (nameEl.value || '').trim();
  if (!name) { toast(t('teamNameReq')); nameEl.focus(); return; }
  const data = { name, status: stEl.value, actor: S.actor, mode: S.mode, at: ts() };
  const coll = 'incidents/' + S.incidentId + '/teams';
  const {id, queued} = await writeDoc(coll, null, data, 'team.add'); // writeDoc forces demo:false
  nameEl.value = ''; stEl.selectedIndex = 0;
  if (queued) return; // offline: "encolado" toast already shown, audit deferred to sync
  await audit('team.add', coll, id);
  toast(t('teamAdded'));
}

/* ---------- view: incident dashboard ---------- */
function openIncident(id) { S.incidentId = id; S.view = 'dashboard'; stopDemo(); setHash(routeFor('incident', id)); renderDashboard(); }
function renderDashboard() {
  stopListeners();
  const myId = S.incidentId, mySeq = ++S.dashSeq; // stale guard: a newer render supersedes this one
  app().innerHTML = chrome(`📋 ${esc(t('dashboard'))}`, {lock:true}) + `
  <div class="card"><p class="mut small">${esc(t('loading'))}</p></div>` + footnav('incidents');
  const incRef = db.collection('incidents').doc(myId);
  incRef.get().then(d => {
    if (S.dashSeq !== mySeq) return; // superseded: no listeners, no render
    S.incident = d.data() || {};
    drawDashShell();
    // live: teams subcollection
    S.unsub.push(incRef.collection('teams').onSnapshot(snap => {
      const el = $('dash-teams'); if (!el) return;
      // skip demo:true like the submissions/scans lists below — demo teams stay in the demo view
      const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
      el.innerHTML = rows.length ? rows.map(tm => `
        <div class="kv" style="border-bottom:1px solid var(--line);padding:6px 0">
          <dt><b>${esc(tm.name || tm.id)}</b></dt><dd>${esc(tm.status || '—')}</dd>
          <dt class="small">${esc(t('submittedBy'))}</dt><dd class="small mut">${esc(tm.actor||'—')} · ${fmtT(tm.at)}</dd>
        </div>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
    }, snapErr('dash-teams')));
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
      }, snapErr('dash-subs')));
    // live: scans
    S.unsub.push(db.collection('scans').where('incidentId','==',S.incidentId)
      .orderBy('createdAt','desc').limit(30).onSnapshot(snap => {
        const el = $('dash-scans'); if (!el) return;
        const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
        el.innerHTML = rows.length ? rows.map(r => `
          <div class="listitem"><b>📎 ${esc(r.fileName||r.id)}</b>${r.downloadURL?` <a href="${esc(r.downloadURL)}" target="_blank" rel="noopener">🔗 ${esc(t('viewForm'))}</a>`:''}<br>
          <span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('')
          : `<p class="mut small">${esc(t('noItems'))}</p>`;
      }, snapErr('dash-scans')));
  }).catch(() => { app().innerHTML = chrome('⚠', {lock:true}) + `<div class="card"><p class="mut">${esc(t('routeErrOffline'))}</p></div>`; });
}
function drawDashShell() {
  const i = S.incident;
  app().innerHTML = chrome(`📋 ${esc(i.name_es || S.incidentId)}`, {lock:true}) + `
  <div class="card">
    <div class="masthead">
      <div class="orgline">${esc(t('orgline'))}</div>
      <h1>${esc(i.name_es || S.incidentId)}</h1>
      <div class="sub">${esc(t('dashboard'))}</div>
    </div>
    <div class="kv"><dt>${esc(t('date'))}</dt><dd>${esc(i.date||'')}</dd>
    <dt>${esc(t('kind'))}</dt><dd>${esc(i.kind==='real'?t('real'):t('exercise'))}</dd>
    <dt>${esc(t('status'))}</dt><dd>${esc(i.status||'')}</dd></div>
    <button class="warn" onclick="renderTemplates()">${esc(t('fill'))}</button>
    <button class="sec" onclick="renderScans()">${esc(t('uploadScan'))}</button>
    <button class="ghost" onclick="renderIncidents()">${esc(t('back'))}</button>
  </div>
  <div class="card"><h3>${esc(t('teams'))}</h3><div id="dash-teams"><p class="mut small">${esc(t('loading'))}</p></div>
  <div class="field"><label class="f" for="team-name">${esc(t('teamName'))}</label><input id="team-name" maxlength="60" autocomplete="off"></div>
  <div class="field"><label class="f" for="team-status">${esc(t('teamStatus'))}</label><select id="team-status">${t('simStatuses').map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></div>
  <button class="sec" onclick="once('addTeam',addTeam)">${esc(t('addTeam'))}</button></div>
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
  const n = Math.max(rows ? rows.length : 0, tb.min_rows || 3);
  const cellName = (c, r) => `${LBL(c)}, ${esc(t('rowWord'))} ${r+1}`; // nombre accesible: columna + fila
  let head = tb.columns.map(c => `<th scope="col">${LBL(c)}</th>`).join('') + `<th></th>`;
  let body = '';
  for (let r = 0; r < n; r++) {
    body += '<tr>';
    for (const c of tb.columns) {
      const v = rows && rows[r] ? rows[r][c.name] : '';
      const id = `${prefix}__${tb.name}__${r}__${c.name}`;
      const an = `aria-label="${cellName(c, r)}"`;
      let ctrl;
      if (c.type === 'select') ctrl = `<select id="${id}" ${an} data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}"><option value=""></option>` +
        c.options.map(o => `<option value="${esc(o.value)}" ${o.value===v?'selected':''}>${esc(LANG==='es'?o.label:o.label_en)}</option>`).join('') + `</select>`;
      else if (c.type === 'checkbox') ctrl = `<input type="checkbox" class="tickbox" id="${id}" ${an} data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}" ${v?'checked':''}>`;
      else { const cmap = {date:'date', time:'time', datetime:'datetime-local', number:'number'};
        ctrl = `<input type="${cmap[c.type]||'text'}" id="${id}" ${an} data-t="${esc(tb.name)}" data-r="${r}" data-c="${esc(c.name)}" value="${esc(v)}">`; }
      body += `<td>${ctrl}</td>`;
    }
    body += `<td><button class="ghost" type="button" aria-label="${esc(t('delRowAria'))}" onclick="this.closest('tr').remove()">${t('delRow')}</button></td></tr>`;
  }
  return `<div class="fsection"><span class="section-tag">${sec?`<span class="n">${esc(sec)}</span>`:''}${esc(LANG==='es'?tb.label:tb.label_en)}</span>
  <table class="form" id="${prefix}__tbl__${esc(tb.name)}" data-cols="${esc(JSON.stringify(tb.columns))}" tabindex="0" role="region" aria-label="${esc(LANG==='es'?tb.label:tb.label_en)}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  <button class="sec small" type="button" onclick="addTableRow('${prefix}','${esc(tb.name)}')">${esc(t('addRow'))}</button></div>`;
}
function addTableRow(prefix, tname) {
  const tbl = $(prefix + '__tbl__' + tname);
  if (!tbl) return;
  // next row index = max existing + 1 (row count would collide after a ✕ delete)
  const rs = [...tbl.querySelectorAll('tbody tr [data-r]')].map(el => +el.dataset.r);
  const r = (rs.length ? Math.max(...rs) : -1) + 1;
  const tr = document.createElement('tr');
  // clone the first row's controls so the new row keeps the REAL column names
  // (data-c) and control types (select/checkbox/date/number). The old code
  // minted generic col0/col1 text inputs here, which corrupted the table
  // schema in Firestore and made draft restore drop the new row's values.
  const srcs = [...tbl.querySelectorAll('tbody tr:first-child [data-t]')];
  let colLbl = {};
  try { colLbl = Object.fromEntries(JSON.parse(tbl.dataset.cols || '[]').map(c => [c.name, (LANG === 'es' ? c.label : c.label_en) || c.name])); } catch (e) {}
  if (srcs.length) {
    for (const src of srcs) {
      const el = src.cloneNode(true); // keeps <select> options
      el.id = `${prefix}__${tname}__${r}__${src.dataset.c}`;
      el.setAttribute('data-r', r);
      el.setAttribute('aria-label', `${esc(colLbl[src.dataset.c] || src.dataset.c)}, ${esc(t('rowWord'))} ${r+1}`); // fila correcta, no la clonada
      if (el.type === 'checkbox') { el.checked = false; el.removeAttribute('checked'); }
      else if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else { el.value = ''; el.removeAttribute('value'); }
      const td = document.createElement('td');
      td.appendChild(el);
      tr.appendChild(td);
    }
  } else {
    // degenerate: every row was ✕-deleted, nothing to clone — rebuild from
    // data-cols (column names + types ride on the table), not col0..colN
    let defs = [];
    try { defs = JSON.parse(tbl.dataset.cols || '[]'); } catch (e) {}
    if (!defs.length) defs = [...tbl.querySelector('thead tr').children].slice(0, -1).map((_, i) => ({name: 'col' + i, type: 'text'}));
    for (const c of defs) {
      const cmap = {date:'date', time:'time', 'datetime-local':'datetime-local', number:'number', select:'select', checkbox:'checkbox'};
      const kind = cmap[c.type] || 'text';
      const id = `${prefix}__${esc(tname)}__${r}__${esc(c.name)}`;
      const an = `aria-label="${esc((LANG === 'es' ? c.label : c.label_en) || c.name)}, ${esc(t('rowWord'))} ${r+1}"`;
      let ctrl;
      if (kind === 'select') ctrl = `<select id="${id}" ${an} data-t="${esc(tname)}" data-r="${r}" data-c="${esc(c.name)}"><option value=""></option>` +
        (c.options || []).map(o => `<option value="${esc(o.value)}">${esc(LANG === 'es' ? o.label : o.label_en)}</option>`).join('') + `</select>`;
      else if (kind === 'checkbox') ctrl = `<input type="checkbox" class="tickbox" id="${id}" ${an} data-t="${esc(tname)}" data-r="${r}" data-c="${esc(c.name)}">`;
      else ctrl = `<input type="${kind}" id="${id}" ${an} data-t="${esc(tname)}" data-r="${r}" data-c="${esc(c.name)}">`;
      tr.insertAdjacentHTML('beforeend', `<td>${ctrl}</td>`);
    }
  }
  tr.insertAdjacentHTML('beforeend', `<td><button class="ghost" type="button" aria-label="${esc(t('delRowAria'))}" onclick="this.closest('tr').remove()">${t('delRow')}</button></td>`);
  tbl.querySelector('tbody').appendChild(tr);
}
function collectValues(prefix, form) {
  const values = {}, tables = {};
  const reqMissing = [];
  const tableRows = {}; // tn -> Map(data-r -> row) in DOM order; compacted below
  // los <input type=number> se persisten como número, no como string;
  // vacío sigue siendo vacío (nunca 0 por coerción)
  const numVal = el => (el.type === 'number' && el.value !== '' ? +el.value : el.value);
  // id'd controls plus any id-less [data-t] row inputs (belt and braces)
  document.querySelectorAll(`[id^="${prefix}__"],[data-t]`).forEach(el => {
    if (el.dataset.f) {
      const v = el.type === 'checkbox' ? el.checked : (el.tagName === 'CANVAS' ? sigData[el.id] || '' : numVal(el));
      values[el.dataset.f] = v;
    } else if (el.dataset.t) {
      const tn = el.dataset.t, r = el.dataset.r, c = el.dataset.c || el.closest('td').cellIndex;
      // Rows keyed by data-r then compacted in DOM order: deleting a middle
      // row no longer leaves null holes that crash renderSubmission.
      let m = tableRows[tn];
      if (!m) m = tableRows[tn] = new Map();
      let row = m.get(r);
      if (!row) { row = {}; m.set(r, row); }
      row[typeof c === 'string' ? c : 'col' + c] = el.type === 'checkbox' ? el.checked : numVal(el);
    }
  });
  for (const tn of Object.keys(tableRows)) tables[tn] = [...tableRows[tn].values()];
  const allFields = [...form.header, ...form.footer];
  // 0 cuenta como diligenciado (antes era el string "0", truthy): evita
  // marcar como faltante un campo numérico obligatorio con valor cero;
  // un string de solo espacios también cuenta como vacío
  const isBlank = v => v === undefined || v === null || v === false || v === '' || (typeof v === 'string' && !v.trim());
  for (const f of allFields) if (f.required && isBlank(values[f.name])) reqMissing.push(LBL(f));
  return {values, tables, reqMissing};
}

/* ---------- signature pad ---------- */
const sigData = {};
let sigResizeBound = false;
function bindSigResize() { // one global listener: refit live signature canvases on resize/rotation
  if (sigResizeBound) return; sigResizeBound = true;
  const refit = () => document.querySelectorAll('canvas.sig').forEach(c => { if (c._refit) c._refit(); });
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', () => setTimeout(refit, 120));
}
function wireSig(canvas) {
  const ctx = canvas.getContext('2d');
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = canvas.offsetWidth, h = canvas.offsetHeight || 180;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
    // resizing wipes the canvas: redraw the captured strokes if any
    const v = sigData[canvas.id];
    if (v) { const img = new Image();
      img.onload = () => { try { ctx.drawImage(img, 0, 0, w, h); } catch (e) {} };
      img.src = v; }
  };
  canvas._refit = fit;
  fit(); let drawing = false, stroked = false, lx = 0, ly = 0;
  const pos = e => { const r = canvas.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e;
    return [p.clientX - r.left, p.clientY - r.top]; };
  const start = e => { e.preventDefault(); drawing = true; stroked = false; [lx, ly] = pos(e); };
  const move = e => { if (!drawing) return; e.preventDefault(); const [x, y] = pos(e);
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke(); lx = x; ly = y; stroked = true; };
  const end = () => { if (!drawing) return; drawing = false;
    // un tap sin trazos no emite firma: sigData queda intacto (o vacío), nunca un PNG en blanco
    if (!stroked) return;
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
  S.view = 'templates'; stopListeners();
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
let fillToken = 0; // guards rapid template switching: stale awaits bail out
async function renderFill(tplId) {
  const tok = ++fillToken;
  S.view = 'fill'; S.templateId = tplId; stopListeners(); setHash(routeFor('form', S.incidentId, tplId));
  app().innerHTML = chrome(t('fill'), {lock:true}) + `
  <div class="card"><p class="mut">${esc(t('loading'))}</p></div>` + footnav('incidents');
  let xml;
  try { xml = await loadTemplateXml(tplId); }
  catch (e) { app().innerHTML = chrome('⚠', {lock:true}) + `<div class="card"><p>${esc(t('tplFail'))}</p>
    <button class="ghost" onclick="renderTemplates()">${esc(t('back'))}</button></div>`; return; }
  if (tok !== fillToken) return; // superseded by a newer renderFill
  curForm = null;
  try { curForm = parseForm(xml); }
  catch (e) { // malformed XML: friendly error, never eternal "Cargando…"
    app().innerHTML = chrome('⚠', {lock:true}) + `<div class="card"><p>${esc(t('tplFail'))}</p>
    <button class="ghost" onclick="renderTemplates()">${esc(t('back'))}</button></div>`; return; }
  const f = curForm, P = 'fld';
  const pad = n => String(n).padStart(2, '0');
  const footNonsig = f.footer.filter(x => x.type !== 'signature');
  const footSig = f.footer.filter(x => x.type === 'signature');
  const secClose = pad(2 + f.tables.length), secSign = pad(3 + f.tables.length);
  app().innerHTML = chrome(`📝 ${esc(LANG==='es'?f.title:f.title_en)}`, {lock:true}) + `
  <div class="card screen-only">
    <div class="formid"><span>N.&ordm; ${esc(f.id)} &middot; v${esc(String(f.version||1))}</span><span>${esc(t('fillOut'))}</span></div>
    <div class="masthead">
      <div class="orgline">${esc(t('orgline'))}</div>
      <h1>${esc(LANG==='es'?f.title:f.title_en)}</h1>
      <div class="sub">${esc(t('fill'))}</div>
    </div>
    <div class="fsection"><span class="section-tag"><span class="n">01</span>${esc(t('secGeneral'))}</span>
      <div class="field"><label class="f" for="sub-team">${esc(t('team'))}</label><input id="sub-team" maxlength="60" value="${esc(t('teamDefault'))}"></div>
      ${f.header.map(x => fieldInput(x, P)).join('')}
    </div>
    ${f.tables.map((tb, i) => tableHtml(tb, P, null, pad(i + 2))).join('')}
    ${footNonsig.length ? `<div class="fsection"><span class="section-tag"><span class="n">${secClose}</span>${esc(t('secClosing'))}</span>${footNonsig.map(x => fieldInput(x, P)).join('')}</div>` : ''}
    ${footSig.length ? `<div class="fsection"><span class="section-tag"><span class="n">${secSign}</span>${esc(t('signature'))}</span>${footSig.map(x => fieldInput(x, P)).join('')}<button class="sec small" type="button" onclick="clearSigs()">${esc(t('clear'))}</button></div>` : ''}
    <hr>
    <button class="warn" onclick="once('saveSubmission',()=>saveSubmission('signed'))">${esc(t('submitSigned'))}</button>
    <button class="sec" onclick="once('saveSubmission',()=>saveSubmission('draft'))">${esc(t('submitDraft'))}</button>
    <button class="ghost" onclick="renderTemplates()">${esc(t('back'))}</button>
  </div>` + footnav('incidents');
  document.querySelectorAll('canvas.sig').forEach(wireSig);
}
function clearSigs() { document.querySelectorAll('canvas.sig').forEach(c => c._clear && c._clear()); }
/* Language toggle mid-fill: snapshot the draft, re-render, restore. */
async function renderFillKeepDraft() {
  let draft = null, team = null;
  try {
    if (curForm && S.templateId) {
      draft = collectValues('fld', curForm);
      team = $('sub-team') ? $('sub-team').value : null;
    }
  } catch (e) { draft = null; }
  await renderFill(S.templateId);
  if (draft) restoreDraft(draft, team);
}
/* Restore a draft stashed by the auto-lock (see stashDraft). */
async function restoreStashedDraft() {
  let d = null;
  try { d = JSON.parse(sessionStorage.getItem('cfc_draft')); } catch (e) {}
  sessionStorage.removeItem('cfc_draft');
  if (!d || !d.templateId) { renderIncidents(); return; }
  if (d.incidentId) S.incidentId = d.incidentId;
  await renderFill(d.templateId);
  if (curForm) restoreDraft({values: d.values || {}, tables: d.tables || {}}, d.team || '');
}
function discardStashedDraft() { sessionStorage.removeItem('cfc_draft'); renderIncidents(); }
function restoreDraft(draft, team) {
  if (team != null && $('sub-team')) $('sub-team').value = team;
  const values = draft.values || {};
  document.querySelectorAll('[data-f]').forEach(el => {
    const k = el.dataset.f;
    if (!Object.prototype.hasOwnProperty.call(values, k)) return;
    const v = values[k];
    if (el.tagName === 'CANVAS') {
      if (v) { // redraw the captured signature onto the fresh canvas
        sigData[el.id] = v;
        const img = new Image();
        img.onload = () => { try { el.getContext('2d').drawImage(img, 0, 0, el.clientWidth, el.clientHeight); } catch (e) {} };
        img.src = v;
      }
    } else if (el.type === 'checkbox') el.checked = !!v;
    else el.value = v ?? '';
  });
  for (const [tn, rows] of Object.entries(draft.tables || {})) {
    if (!Array.isArray(rows)) continue;
    const tbl = $('fld__tbl__' + tn);
    if (!tbl) continue;
    while (tbl.querySelectorAll('tbody tr').length < rows.length) addTableRow('fld', tn);
    for (const [rk, row] of Object.entries(rows)) {
      for (const [c, v] of Object.entries(row || {})) {
        const el = tbl.querySelector(`[data-r="${rk}"][data-c="${CSS.escape(String(c))}"]`);
        if (!el) continue;
        if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? '';
      }
    }
  }
}
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
    incidentId: S.incidentId, team: $('sub-team').value.trim() || t('teamDefault'),
    fieldValues: values, tables, status, demo: false,
    actor: S.actor, uid: S.uid || null, createdAt: ts(), updatedAt: ts()
  };
  const {id, queued} = await writeDoc('submissions', null, doc, 'submission.' + status);
  if (queued) return; // "encolado para sincronizar" toast shown; stay on the form, draft intact
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
  S.view = 'submission'; stopListeners();
  app().innerHTML = chrome(t('details'), {lock:true}) + `<div class="card"><p class="mut">${esc(t('loading'))}</p></div>`;
  let d;
  try { d = await db.collection('submissions').doc(id).get(); } catch(e) { d = null; }
  if (!d || !d.exists) { toast(t('routeErrSub')); renderDashboard(); return; }
  const s = d.data();
  const name = tplName(s.templateId);
  const fv = s.fieldValues || {};
  const rows = Object.entries(fv).map(([k, v]) => {
    const disp = safeImg(v) ? `<img src="${v}" alt="${esc(t('sigAlt'))}" style="max-width:220px;border:1px solid var(--line)">` : esc(v === true ? '✓' : v === false ? '✗' : v);
    return `<div class="kv"><dt><b>${esc(k)}</b></dt><dd class="pv">${disp}</dd></div>`;
  }).join('');
  const trows = Object.entries(s.tables || {}).map(([tn, arr]) => {
    if (!Array.isArray(arr) || !arr.length) return '';
    const rows = arr.filter(r => r && typeof r === 'object'); // skip null holes from legacy sparse rows
    const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
    return `<h3>${esc(tn)}</h3><table class="form"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>` +
      rows.map(r => `<tr>${cols.map(c => `<td>${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('') + `</tbody></table>`;
  }).join('');
  app().innerHTML = chrome(`📄 ${esc(name)}`, {lock:true}) + `
  <div class="card print-area">
    ${s.demo === true ? `<span class="stamp red demo-corner">Demo</span>` : ''}
    <div class="formid"><span>N.&ordm; ${esc(s.templateId||'')}</span><span>${fmtT(s.createdAt)}</span></div>
    <div class="masthead">
      <div class="orgline">${esc(t('orgline'))}</div>
      <h1>${esc(name)}</h1>
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
  S.view = 'scans'; S.scanSubId = subId || null; stopListeners();
  app().innerHTML = chrome(`📎 ${esc(t('scans'))}`, {lock:true}) + `
  <div class="card">
    <label class="f" for="scanfile">${esc(t('pickFile'))}</label>
    <input type="file" id="scanfile" accept="image/*,.pdf">
    <button onclick="once('uploadScan',()=>uploadScan('${esc(subId||'')}'))">${esc(t('uploadScan'))}</button>
    <button class="ghost" onclick="${subId ? `openSubmission('${esc(subId)}')` : 'renderDashboard()'}">${esc(t('back'))}</button>
  </div>
  <div class="card"><h3>${esc(t('scans'))}</h3><div id="scanlist"><p class="mut">${esc(t('loading'))}</p></div></div>` + footnav('incidents');
  S.unsub.push(db.collection('scans').where('incidentId','==',S.incidentId).orderBy('createdAt','desc').limit(30)
    .onSnapshot(snap => {
      const rows = []; snap.forEach(x => { const v = x.data(); if (v.demo === true) return; rows.push({id:x.id, ...v}); });
      const el = $('scanlist'); if (!el) return;
      el.innerHTML = rows.length ? rows.map(r => `
        <div class="listitem"><b>📎 ${esc(r.fileName||'')}</b>${r.status==='pending'?` <span class="badge">⏳ ${esc(t('pending'))}</span>`:''}${r.downloadURL?` <a href="${esc(r.downloadURL)}" target="_blank" rel="noopener">🔗 ${esc(t('viewForm'))}</a>`:''}<br>
        <span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('')
        : `<p class="mut">${esc(t('noItems'))}</p>`;
    }, snapErr('scanlist')));
}
async function uploadScan(subId) {
  const f = $('scanfile').files[0];
  if (!f) { toast(t('pickFile')); return; }
  // 1. validate before anything touches the network
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  const okType = f.type.startsWith('image/') || f.type === 'application/pdf' ||
    ['jpg','jpeg','png','gif','webp','pdf'].includes(ext);
  if (!okType) { toast(t('scanBadType')); return; }
  if (f.size > 10 * 1024 * 1024) { toast(t('scanTooBig')); return; }
  // el content-type se deriva de la extensión validada, nunca del MIME que reporte
  // el navegador: un «x.pdf» con type text/html se almacena como application/pdf
  const mimeFor = {jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', pdf:'application/pdf'};
  const contentType = mimeFor[ext] ||
    ((f.type.startsWith('image/') || f.type === 'application/pdf') ? f.type : 'application/octet-stream');
  const base = subId || S.incidentId || 'misc';
  const path = `forms/scans/${base}/${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  const meta = { incidentId: S.incidentId, submissionId: subId || null,
    fileName: f.name, storagePath: path, actor: S.actor, uid: S.uid || null,
    demo: false, createdAt: ts() };
  // 2. Firestore doc BEFORE the upload, marked pending
  const {id: scanId, queued} = await writeDoc('scans', null, {...meta, status: 'pending'}, 'scan.upload');
  if (queued) { renderScans(subId); return; } // offline: pending doc queued; no network for put()
  // 3. upload with one retry
  let putErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try { await storage.ref(path).put(f, {contentType}); putErr = null; break; }
    catch (e) { putErr = e; }
  }
  if (putErr) {
    toast(t('scanPending')); // doc stays pending; user can retry later
  } else {
    // record the download URL so the scan can be opened later (it was write-only)
    let url = null;
    try { url = await storage.ref(path).getDownloadURL(); } catch (e) {}
    try { await db.collection('scans').doc(scanId).update(url ? {status: 'done', downloadURL: url} : {status: 'done'}); } catch (e) {}
    await audit('scan.upload', 'scans', scanId);
    toast(t('scanOk'));
  }
  renderScans(subId);
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
      <div class="orgline">${esc(t('orgline'))}</div>
      <h1>${esc(t('demoView'))}</h1>
      <div class="sub">${esc(t('demoSub'))}</div>
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
    }, snapErr('demo-teams')));
  const demoList = (coll, elId) => S.unsub.push(db.collection(coll).where('demo','==',true)
    .orderBy('createdAt','desc').limit(20).onSnapshot(snap => { const el = $(elId); if (!el) return;
      const rows = []; snap.forEach(x => rows.push({id:x.id, ...x.data()}));
      el.innerHTML = rows.length ? rows.map(r => `<div class="listitem"><b>${esc(coll==='submissions'?tplName(r.templateId):(r.fileName||r.name||r.id))}</b> <span class="badge demo">DEMO</span><br><span class="small mut">${esc(r.actor||'')} · ${fmtT(r.createdAt)}</span></div>`).join('') : `<p class="mut small">${esc(t('noItems'))}</p>`;
    }, snapErr(elId)));
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
      const statuses = t('simStatuses');
      await db.collection('incidents').doc(DEMO_ORG_ID).collection('teams').doc(teamId)
        .set({ name: actor, status: statuses[demoStep % 4], actor, at: ts(), demo: true });
      await db.collection('audit').doc().set({ actor, mode:'demo', action:'demo.team_status', collection:'teams', docId: teamId, demo: true, at: ts() });
    } else if (kind === 1) { // submission with random template
      const f = DEMO_FILLER[demoStep % DEMO_FILLER.length];
      await db.collection('submissions').doc()
        .set({ templateId: f.t, templateVersion: 1, incidentId: DEMO_ORG_ID, team: actor,
          fieldValues: f.v, tables: {}, status: 'draft', demo: true, actor, createdAt: ts(), updatedAt: ts() });
    } else if (kind === 2) { // comms-log-style submission
      const msgs = t('simMsgs');
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
      if (!initial && (S.view === 'dashboard' || S.view === 'fill' || S.view === 'error' || S.view === 'demo')) {
        stopDemo(); // leaving #/demo by ANY route kills the simulator timer (browser back included)
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
  const msg = kind === 'template' ? t('routeErrTemplate')
    : kind === 'offline' ? t('routeErrOffline')
    : kind === 'hash' ? t('routeErrHash')
    : t('routeErrIncident');
  const sub = kind === 'offline' ? t('routeErrOfflineSub') : t('routeErrSub');
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
    case 'newincident': return renderNewIncidentKeep();
    case 'templates': return renderTemplates();
    case 'fill': return renderFillKeepDraft();
    case 'scans': return renderScans(S.scanSubId);
    case 'submission': return S.submissionId ? renderSubmission(S.submissionId) : renderIncidents();
    case 'demo': return renderDemoView();
    case 'dashboard': return renderDashboard();
    case 'error': return renderRouteError(S.routeErr || 'hash');
    default: return renderPin();
  }
}
window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = LANG;
  bindSigResize();
  syncOutbox();
  loadConfig();
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
Object.assign(window, { submitPin, pinKey, pinBack, pinClear, toggleLang, doLock, lockNow, renderMode, modeKiosk, modePersonal,
  startKiosk, doLogin, doRegister, exitMode, go, renderIncidents, renderNewIncident,
  createIncident, openIncident, renderDashboard, renderTemplates, renderFill, addTableRow,
  addTeam, clearSigs, saveSubmission, openSubmission, renderSubmission, renderScans, uploadScan,
  enterDemo, exitDemo, exitRouteError, restoreStashedDraft, discardStashedDraft, once,
  renderDemoView, renderScansList, retryList });
