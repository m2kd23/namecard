const CACHE = 'namecard-v2';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
// 글자 인식 엔진과 모델은 용량이 커서, 한 번 받으면 폰에 저장해 두고 다시 받지 않음
const BIG = u => u.pathname.includes('/models/') || u.hostname === 'cdn.jsdelivr.net';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const save = r => { if (r && (r.status === 200 || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  if (BIG(u)) { // 저장된 것이 있으면 그것을 먼저 사용
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(save)));
    return;
  }
  e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
