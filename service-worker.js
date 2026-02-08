const CACHE_NAME = 'pwa-cache-v1';
const CACHE_FILES = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// 1. 安装：缓存文件
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES)));
  self.skipWaiting();
});

// 2. 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
  return self.clients.claim();
});

// 3. 拦截请求（离线可用）
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});

// 4. 后台通知触发（核心：应用后台/关闭时也能弹通知）
self.addEventListener('push', (e) => {
  const data = e.data?.json() || { title: '后台消息', body: '你有新通知' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png'
    })
  );
});

// 5. 点击通知事件
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
