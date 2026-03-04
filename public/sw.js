const CACHE_NAME = 'smk-v1';
const PRECACHE_URLS = [
    '/',
    '/search',
    '/try-on',
    '/faq',
    '/support',
];

// Install — precache shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network-first for pages, cache-first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip API calls and non-GET
    if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

    // Static assets — cache first
    if (url.pathname.match(/\.(js|css|png|jpg|webp|svg|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then((cached) =>
                cached || fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
            )
        );
        return;
    }

    // Pages — network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
});
