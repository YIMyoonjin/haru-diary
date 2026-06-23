const CACHE = 'haru-diary-v83';
const ASSETS = [
  '/haru-diary/diary.html',
  '/haru-diary/manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;
  // 문서/HTML/매니페스트는 항상 최신을 먼저 가져온다 (네트워크 우선)
  if (req.mode === 'navigate' || req.destination === 'document' ||
      url.endsWith('diary.html') || url.endsWith('manifest.json')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/haru-diary/diary.html')))
    );
    return;
  }
  // 그 외(아이콘 등)는 캐시 우선
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
