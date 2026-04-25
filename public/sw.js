const CACHE_NAME = "dev-daily-v1";
const STATIC_ASSETS = ["/", "/dashboard", "/manifest.json"];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET and API calls — always go to network
  if (event.request.method !== "GET" || event.request.url.includes("/api/"))
    return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Dev Daily", {
      body: data.body ?? "You have updates.",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: { url: data.url ?? "/dashboard" },
    }),
  );
});

// Notification click — open app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data?.url ?? "/dashboard";
      const existing = clientList.find(
        (c) => c.url.includes(url) && "focus" in c,
      );
      if (existing) return existing.focus();
      return clients.openWindow(url);
    }),
  );
});
