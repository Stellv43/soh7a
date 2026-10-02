const CACHE_NAME = 'mahfathaty-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// تثبيت ملفات التطبيق
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// تفعيل وتنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// جلب الملفات (Cache-First) لضمان العمل Offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // إرجاع النسخة المخزنة إن وجدت (للعمل بدون إنترنت)
        if (cachedResponse) {
          return cachedResponse;
        }
        // في حال عدم وجودها يتم جلبها من الشبكة
        return fetch(event.request).then(response => {
          // تحديث الكاش بالملف الجديد
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        // Fallback في حالة فشل الشبكة للـ HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});