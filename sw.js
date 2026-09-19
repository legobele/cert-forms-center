/* CERT Forms Center service worker — offline app shell + form templates */
const VERSION = '20260919-war2'; // bump on each deploy; activate purges older caches
const CACHE = 'cfc-' + VERSION;
const SHELL = [
  './', './index.html', './styles.css', './app.js', './forms/manifest.json',
  './forms/damage_assessment.xml', './forms/personnel_signin.xml',
  './forms/assignment_tracking.xml', './forms/briefing_assignment.xml',
  './forms/victim_treatment_record.xml', './forms/communications_log.xml',
  './forms/equipment_inventory.xml', './forms/general_message.xml',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // manifest: network-first so template-list updates ship promptly; cache fallback offline
  if (url.pathname.endsWith('/forms/manifest.json')) {
    e.respondWith(fetch(e.request).then(r => {
      // never cache error responses: a transient 500 must not poison the offline cache
      if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request)));
    return;
  }
  // form templates: cache-first (repo copies are authoritative fallback)
  if (url.pathname.includes('/forms/')) {
    e.respondWith(caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
        return r;
      }).catch(() => caches.match(e.request))));
    return;
  }
  // app shell: network-first, fall back to cache
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && e.request.method === 'GET' && url.origin === location.origin) {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
    }
    return r;
  }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
});
