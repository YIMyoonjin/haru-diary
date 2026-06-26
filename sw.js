importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
try{
  firebase.initializeApp({apiKey:"AIzaSyAR0FRkNxUb3gzrmJiUGgoEpgs0wl4IiC4",authDomain:"haru-diary-a269f.firebaseapp.com",projectId:"haru-diary-a269f",storageBucket:"haru-diary-a269f.firebasestorage.app",messagingSenderId:"544993236898",appId:"1:544993236898:web:9146aeac7f203db4fcc4fb"});
  const _msg=firebase.messaging();
  _msg.onBackgroundMessage(function(payload){
    const n=(payload&&(payload.notification||payload.data))||{};
    self.registration.showNotification(n.title||'오늘의 Diary',{body:n.body||'일기 쓸 시간이에요 ✍️',icon:'/haru-diary/icon-192.png',badge:'/haru-diary/icon-192.png',tag:'haru-reminder'});
  });
}catch(e){}
self.addEventListener('notificationclick',function(e){e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){for(var i=0;i<cs.length;i++){if('focus' in cs[i])return cs[i].focus();}if(clients.openWindow)return clients.openWindow('/haru-diary/diary.html');}));});

const CACHE = 'haru-diary-v120';
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
