/* Integral Veteran Club - offline support.
   The pitch at Nomayos has patchy signal, so the site caches itself and
   keeps working without a connection. Anything from Supabase still needs
   data, but the pages, photos and video load from the phone. */

const CACHE = 'ivc-v3';
const CORE = ['./', './index.html',
  './assets/logo-dark.png', './assets/logo-light.png', './assets/logo-icon.png',
  './assets/squad.jpg', './assets/huddle.jpg', './assets/committee.jpg',
  './assets/player.jpg', './assets/net.jpg', './assets/cones.jpg', './assets/balls.jpg',
  './assets/club-video-poster.jpg', './assets/constitution.pdf'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // never cache the database; stale dues would be worse than none
  if (url.hostname.endsWith('supabase.co')) return;

  if (url.origin === location.origin) {
    // fresh when online, cached when not
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
    );
  }
});
