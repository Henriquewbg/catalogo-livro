const CACHE_NAME = "biblioteca-v2"; // muda versão aqui quando atualizar

self.addEventListener("install", e => {
    self.skipWaiting(); // ativa imediatamente
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./manifest.json"
            ]);
        })
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim(); // controla a página imediatamente
});

self.addEventListener("fetch", e => {
    e.respondWith(
        fetch(e.request)
            .then(res => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, res.clone()); // atualiza cache
                    return res;
                });
            })
            .catch(() => caches.match(e.request))
    );
});
