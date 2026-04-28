const CACHE = 'biblioteca-v1';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
    // Firebase e APIs externas sempre pela rede
    if (e.request.url.includes('firestore') ||
        e.request.url.includes('firebase') ||
        e.request.url.includes('googleapis') ||
        e.request.url.includes('gstatic') ||
        e.request.url.includes('openlibrary')) {
        e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
        return;
    }
    // Resto: cache-first
    e.respondWith(
        caches.match(e.request).then(cached => {
            return cached || fetch(e.request).then(res => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            });
        })
    );
});
