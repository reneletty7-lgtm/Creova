const CACHE = "creova-v2";

const FILES = [
  "./", "index.html", "register.html", "login.html", "home.html", "profile.html",
  "marketplace.html", "shops.html", "shop.html", "product.html", "create.html",
  "wallet.html", "premium.html", "dashboard.html", "my-purchases.html",
  "my-reviews.html", "downloads.html", "messages.html", "chat.html", "offline.html",
  "style.css", "index.css", "home.css", "marketplace.css", "create.css",
  "wallet.css", "premium.css", "product.css", "chat.css",
  "script.js", "login.js", "nav.js", "profile.js", "marketplace.js", "shops.js",
  "premium-core.js", "premium.js", "create.js", "wallet.js", "install.js",
  "chat-core.js", "notify.js",
  "manifest.json", "images/icon-192.png", "images/icon-512.png", "images/hero.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (cache) {
        return Promise.all(FILES.map(function (f) { return cache.add(f).catch(function () {}); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// online: always the newest files. offline: the saved copy.
self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    fetch(req)
      .then(function (res) {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (hit) {
          if (hit) return hit;
          if (req.mode === "navigate") return caches.match("offline.html");
        });
      })
  );
});

// tapping a message notification opens that chat
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "messages.html";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (let i = 0; i < list.length; i++) {
        if ("focus" in list[i]) {
          if ("navigate" in list[i]) list[i].navigate(url);
          return list[i].focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});