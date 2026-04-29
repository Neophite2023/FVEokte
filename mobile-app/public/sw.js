const CACHE_NAME = "fve-mobile-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        if (event.request.mode === "navigate") {
          // Fallback na index.html — použijeme scope SW namiesto relatívnej cesty,
          // pretože caches.match() vyžaduje presnú URL, nie relatívny reťazec
          const scopeUrl = new URL("./index.html", self.registration.scope).href;
          const indexFallback = await caches.match(scopeUrl);
          if (indexFallback) return indexFallback;
        }

        return new Response("Offline a zdroj nie je v cache.", {
          status: 503,
          statusText: "Service Unavailable"
        });
      })
  );
});
