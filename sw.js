/* Caja BOKANA web: guarda la pagina para que abra sin internet.
   Con internet siempre trae la version mas nueva; sin internet usa la guardada. */
var V = "bk-caja-web-1";
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(["./", "./index.html"]); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // lo de Google no se toca
  var red = fetch(e.request).then(function (r) {
    if (r && r.ok) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); }
    return r;
  });
  var espera = new Promise(function (_, rej) { setTimeout(rej, 3000); });
  e.respondWith(Promise.race([red, espera]).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match("./index.html"); });
  }));
});
