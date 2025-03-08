const CACHE_NAME = 'certificate-generator-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/js/script.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .catch((error) => {
        console.error('Ошибка при кешировании ресурсов:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Игнорируем запросы к Vite и другие нестандартные запросы
  if (request.url.includes('@vite') || request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Если ресурс найден в кеше, возвращаем его
        if (response) {
          return response;
        }

        // Если ресурс не найден в кеше, загружаем его из сети
        return fetch(request)
          .then((networkResponse) => {
            // Кешируем только успешные ответы
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Ошибка при загрузке ресурса:', error);
            // Возвращаем заглушку для ошибок
            return new Response('Ошибка загрузки ресурса', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});
