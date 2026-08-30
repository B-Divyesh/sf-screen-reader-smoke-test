// `scripts/generate-sw.mjs` replaces these development values in production
// with a content-addressed cache name and the current Vite asset paths.
const CACHE = "announce-check-docs-dev";
const SHELL = ["/", "/demo/", "/privacy/", "/terms/", "/404.html", "/announce-field.webp", "/og-image.webp", "/apple-touch-icon.png", "/mark.svg", "/styles.css", "/main.ts", "/demo.ts"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(SHELL.map((path) => new Request(path, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    // Documents refresh while online, so an activated new worker cannot keep a
    // prior shell indefinitely. Offline reload still has a complete shell.
    event.respondWith(networkFirstDocument(request));
    return;
  }

  // Scripts and styles must never receive the HTML shell as a fallback: that
  // produces MIME errors and leaves an offline page broken. They are precached
  // at install time and can be filled into this versioned cache on later visits.
  event.respondWith(cacheFirstAsset(request));
});

async function networkFirstDocument(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match("/")) || offlineResponse();
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineResponse();
  }
}

function offlineResponse() {
  return new Response("Offline", { status: 503, statusText: "Offline", headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
