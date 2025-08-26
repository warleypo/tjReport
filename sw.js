const CACHE_NAME = "tj-report-cache";

const urlsToCache = ["/", "/index.html", "/app.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (e) => {
  caches.match(e.request).then((response) => {
    if (response) {
      fetch(e.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const cacheClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheClone);
          });
        }
      });

      return response;
    } else {
      return fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response(
            "Você está offline e o recurso não está em cache.",
            {
              status: 503,
              statusText: "Service Unavailable",
            }
          );
        });
    }
  });
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
