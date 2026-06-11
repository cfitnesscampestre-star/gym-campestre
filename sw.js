/* ════════════════════════════════════════════════════════
   FITNESS SYSTEM PRO — Service Worker
   Estrategia: NETWORK FIRST con respaldo en caché.
   → Siempre intenta traer la versión más nueva de GitHub.
   → Si no hay internet, sirve la última copia guardada.
   → Al desplegar cambios, sube CACHE_VERSION (v2, v3...)
     para forzar limpieza de cachés viejos.
   ════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'fitnesspro-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

/* Instalar: precachear lo esencial y activar de inmediato */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then((c) => c.addAll(PRECACHE))
      .catch(() => {}) // si algo falla (p.ej. offline), no bloquear
  );
  self.skipWaiting();
});

/* Activar: borrar cachés de versiones anteriores y tomar control */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch: red primero, caché de respaldo */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navegaciones (el HTML): SIEMPRE red primero — nunca servir app vieja teniendo internet
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./').then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Recursos (fuentes, iconos, CDN): red primero con respaldo, y guardar copia
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
