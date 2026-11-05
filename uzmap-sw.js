// Offline copy of the constructor and the full map. Only same-named pages next to this file are
// served from it: other apps in the same repository are left alone.
const PAGE_CACHE = 'uzmap-page', VERSION = 'uzmap-2026-11-04-1';
const OURS = /\/(constructor\.html|uzbekistan\.html)$/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  // a new data version replaces the old copies; everything else in storage stays untouched
  e.waitUntil((async () => {
    const seen = await caches.open('uzmap-version');
    const was = await seen.match('v');
    const prev = was ? await was.text() : null;
    if (prev && prev !== VERSION) await caches.delete(PAGE_CACHE);
    await seen.put('v', new Response(VERSION));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || !OURS.test(u.pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(PAGE_CACHE);
    const key = u.origin + u.pathname;
    const hit = await cache.match(key);
    if (hit) return hit;
    const r = await fetch(e.request);
    if (r.ok) await cache.put(key, r.clone());
    return r;
  })());
});
