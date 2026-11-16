// Subtext service worker: receives screenshots from the share sheet and keeps the app shell
// available. It never caches /api responses, so nothing about a post is kept here.

const SHELL_CACHE = "subtext-shell-v1";
const SHARE_CACHE = "subtext-share";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("subtext-shell-") && k !== SHELL_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Share target: the OS posts the shared screenshot here. Park it, then open the app.
  if (event.request.method === "POST" && url.pathname === "/share") {
    event.respondWith(
      (async () => {
        try {
          const form = await event.request.formData();
          const file = form.get("screenshot");
          const text = [form.get("title"), form.get("text")].filter(Boolean).join(" ").trim();
          const cache = await caches.open(SHARE_CACHE);
          if (file && typeof file === "object") {
            await cache.put("/shared-screenshot", new Response(file, { headers: { "Content-Type": file.type || "image/png" } }));
          }
          await cache.put("/shared-text", new Response(text));
          return Response.redirect("/?shared=1", 303);
        } catch {
          return Response.redirect("/?shared=0", 303);
        }
      })(),
    );
    return;
  }

  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  // Navigations: network first, cached shell as the fallback.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put("/", fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match("/");
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  // Built assets are content-hashed: cache first, fill from the network.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname.endsWith(".webmanifest")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const fresh = await fetch(event.request);
        if (fresh.ok) cache.put(event.request, fresh.clone());
        return fresh;
      })(),
    );
  }
});
