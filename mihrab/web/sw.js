/* مِحراب — offline cache */
const VERSION = 'mihrab-v5';
const CORE = [
  './', 'index.html', 'styles.css', 'app.js', 'adhan.min.js', 'quran.json', 'manifest.webmanifest',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-180.png',
  'fonts/amiri-quran.woff2', 'fonts/amiri-700.woff2', 'fonts/amiri-latin-700.woff2', 'fonts/amiri-400.woff2', 'fonts/amiri-latin-400.woff2', 'adhkar.json', 'tafsir.json', 'names.json',
  'fonts/plex-400.woff2', 'fonts/plex-500.woff2', 'fonts/plex-600.woff2', 'fonts/plex-latin-400.woff2', 'fonts/plex-latin-500.woff2',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // recitation audio streams from the network
  // App code: network first so updates arrive; everything else: cache first.
  const fresh = req.mode === 'navigate' || /\.(js|css|html|webmanifest)$/.test(url.pathname);
  if (fresh) {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })));
  }
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./#home');
  }));
});
