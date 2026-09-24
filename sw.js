/* ════════════════════════════════════════════════════════
   FITNESS SYSTEM PRO — Service Worker (modo sin conexión)
   → La app (HTML): red primero con límite de 4 s; si no hay
     internet o la señal es muy lenta, abre la copia guardada.
   → Fotos, íconos, Firebase SDK, PDF, 3D y tipografías: se
     guardan al instalar y se sirven desde el dispositivo
     (se actualizan en segundo plano cuando hay internet).
   → Los datos de Firebase NUNCA pasan por aquí (van directo).
   → Al desplegar cambios, sube CACHE_VERSION.
   ════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'fitnesspro-v18';
const PRECACHE_LOCAL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './img/grupos/abdomen.webp',
  './img/grupos/biceps.webp',
  './img/grupos/braquial.webp',
  './img/grupos/cardiovascular.webp',
  './img/grupos/core.webp',
  './img/grupos/cuadriceps.webp',
  './img/grupos/deltoides.webp',
  './img/grupos/dorsal.webp',
  './img/grupos/erectores.webp',
  './img/grupos/espalda.webp',
  './img/grupos/femorales.webp',
  './img/grupos/gemelos.webp',
  './img/grupos/gluteo.webp',
  './img/grupos/manguito.webp',
  './img/grupos/oblicuos.webp',
  './img/grupos/pecho.webp',
  './img/grupos/recto.webp',
  './img/grupos/trapecio.webp',
  './img/grupos/triceps.webp',
  './img/hero/bienvenida.webp',
  './img/hero/inicio.webp',
  './img/sesiones/accesorios.webp',
  './img/sesiones/cardio.webp',
  './img/sesiones/cardiovascular.webp',
  './img/sesiones/descanso.webp',
  './img/sesiones/espalda.webp',
  './img/sesiones/full.webp',
  './img/sesiones/general.webp',
  './img/sesiones/hombro.webp',
  './img/sesiones/movilidad.webp',
  './img/sesiones/pecho.webp',
  './img/sesiones/pierna.webp',
  './img/sesiones/torso.webp',
];
const PRECACHE_CDN = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Figtree:wght@400;500;600;700;800&display=swap',
];
// Solo estos dominios externos se guardan (librerías y tipografías). Firebase Database queda fuera.
const CDN_HOSTS = ['www.gstatic.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];

/* Instalar: guardar todo lo necesario, uno por uno (si uno falla, los demás sí quedan) */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) =>
      Promise.allSettled([
        ...PRECACHE_LOCAL.map((u) => c.add(new Request(u, { cache: 'reload' }))),
        ...PRECACHE_CDN.map((u) => c.add(new Request(u, { mode: 'cors', credentials: 'omit' }))),
      ])
    )
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

function guardable(res){ return res && (res.status === 200) && (res.type === 'basic' || res.type === 'cors'); }
function guardar(req, res){ if(guardable(res)){ const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)); } return res; }

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const cdn = CDN_HOSTS.includes(url.hostname);
  if (!propio && !cdn) return;             // Firebase Database, IA, etc.: directo a la red

  // 1) La app: red primero (máx. 4 s), si no, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(new Promise((resolve) => {
      let listo = false;
      const usarCache = () => caches.match('./').then((r) => r || caches.match('./index.html')).then((r) => r || Response.error());
      const timer = setTimeout(() => {
        usarCache().then((r) => { if (!listo && r.type !== 'error') { listo = true; resolve(r); } });
      }, 4000);
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put('./', copy)); }
        if (!listo) { listo = true; clearTimeout(timer); resolve(res); }
      }).catch(() => {
        clearTimeout(timer);
        usarCache().then((r) => { if (!listo) { listo = true; resolve(r); } });
      });
    }));
    return;
  }

  // 2) Todo lo demás (fotos, íconos, librerías, tipografías):
  //    desde el dispositivo al instante y se actualiza en segundo plano
  e.respondWith(
    caches.match(req).then((cached) => {
      const red = fetch(req).then((res) => guardar(req, res)).catch(() => cached || Response.error());
      if (cached) { e.waitUntil(red.catch(() => {})); return cached; }
      return red;
    })
  );
});
