// === 🧱 Настройки кэша ===
const CACHE_NAME = 'den-g-a-v0.111'; // ⬅️ меняй версию при каждом обновлении
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap'
];

// === 🪄 Установка и кэширование ===
self.addEventListener('install', event => {
  // Сразу активировать новую версию
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// === 🧹 Очистка старого кэша ===
self.addEventListener('activate', event => {
  // Новая версия сразу берёт контроль
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

// === ⚡ Основная логика запросов ===
// Сначала пробуем сеть, если не получилось — даём кэш
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Обновляем кэш свежей копией
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// === 🔔 Обновление приложения ===
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
