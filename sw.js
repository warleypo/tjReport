const CACHE_NAME = "tj-report-cache-v14";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/app.js",
  "/bootstrap.min.css",
  "/cadastro.html",
  "/config.html",
  "/offline.html",
  "/notfound.html",
  "/tjReport192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Cache First com atualização em segundo plano
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Atualiza o cache com a nova versão
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });

          console.log("ok", networkResponse.status);
          if (networkResponse.status === 404) {
            return caches.match("/notfound.html");
          }

          if (networkResponse.ok) {
            return networkResponse;
          }
        })
        .catch(() => {
          // Se offline e não houver cache, não quebra
          return caches.match("/offline.html");
        });

      // Retorna cache imediatamente (se existir), ou espera a rede
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
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
