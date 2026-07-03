const CACHE_NAME = 'mestremiudo-v4';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
];

const LESSON_CACHE = 'mestremiudo-lessons-v1';
const QUIZ_CACHE = 'mestremiudo-quizzes-v1';
const API_HOSTS = ['supabase.co', 'supabase.net'];
const LESSON_PATH_PATTERNS = ['/api/lessons', '/api/content', 'lessons'];
const QUIZ_PATH_PATTERNS = ['/api/quizzes', '/api/questions', 'quizzes', 'questions'];

function isApiRequest(url) {
  return API_HOSTS.some(host => url.includes(host));
}

function isLessonRequest(url) {
  return LESSON_PATH_PATTERNS.some(p => url.includes(p));
}

function isQuizRequest(url) {
  return QUIZ_PATH_PATTERNS.some(p => url.includes(p));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

async function cacheFirstWithFallback(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  if (isLessonRequest(url)) {
    event.respondWith(cacheFirstWithFallback(event.request, LESSON_CACHE));
    return;
  }

  if (isQuizRequest(url)) {
    event.respondWith(cacheFirstWithFallback(event.request, QUIZ_CACHE));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
