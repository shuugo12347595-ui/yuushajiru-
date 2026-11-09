// 勇者ジル Service Worker：ゲーム本体をキャッシュしてオフラインでも起動できるようにする
// ファイルを更新したら VERSION の数字を上げると、遊ぶ人の端末にも新しい版が届きます
const VERSION = 'jil3-v58';
const CORE = ['./', './index.html', './manifest.webmanifest', './worldmap.jpg', './faces.jpg', './cg_hill1.jpg', './cg_hill2.jpg', './cg_hill3.jpg', './cg_hill4.jpg', './cg_mem1.jpg', './cg_mem2.jpg', './cg_mem3.jpg', './cg_mem4.jpg', './cg_mem5.jpg', './cg_mem6.jpg', './cg_mem7.jpg', './cg_mem8.jpg', './cg_mem9.jpg', './cg_mem10.jpg', './icon-192.png', './icon-512.png',
  './three.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.headers.get('range')) return; // 音楽の途中再生はネットから
  if (req.mode === 'navigate') { // ページ本体：ネット優先、だめならキャッシュ
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
