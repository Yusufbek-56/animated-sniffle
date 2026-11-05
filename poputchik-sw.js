// Offline cache for poputchik.html only. It shares a site with other apps, so it touches nothing else:
// the scope is this one page, and only caches named poputchik-* are ever read or deleted.
const CACHE = 'poputchik-cdb2a9fe98';
const FILES = ['./poputchik.html', './poputchik.webmanifest', './poputchik-icon-192.png', './poputchik-icon-512.png', './poputchik-touch-icon.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('poputchik-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true })).then((hit) => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./poputchik.html', { cacheName: CACHE }) : Response.error()))),
  );
});
