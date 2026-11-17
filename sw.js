/* =====================================================================
   Service worker — fait fonctionner l'appli SANS connexion.
   Tous les fichiers de l'appli sont gardés en cache sur le téléphone.

   ⚠ IMPORTANT : après toute modification d'un fichier de l'appli
     (y compris data/especes.js), augmente VERSION ci-dessous
     (ex. 'v1.0.1'). Au prochain lancement avec du réseau, l'appli
     proposera « Mettre à jour ». Tes observations ne sont jamais
     touchées : elles sont dans la base IndexedDB, pas dans ce cache.
   ===================================================================== */
const VERSION = 'v1.0.0';
const CACHE = 'carnet-oiseaux-' + VERSION;

const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './data/especes.js',
  './js/utils.js',
  './js/db.js',
  './js/photos.js',
  './js/zip.js',
  './js/catalogue.js',
  './js/observations.js',
  './js/fiche.js',
  './js/stats.js',
  './js/sauvegarde.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // cache: 'reload' : on récupère la version la plus récente, pas celle du cache HTTP
      return cache.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: 'reload' }); }));
    })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys()
      .then(function (cles) {
        return Promise.all(cles
          .filter(function (k) { return k.indexOf('carnet-oiseaux-') === 0 && k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// L'appli demande d'activer la nouvelle version (bouton « Mettre à jour »)
self.addEventListener('message', function (ev) {
  if (ev.data === 'activer') self.skipWaiting();
});

// Cache d'abord, réseau ensuite
self.addEventListener('fetch', function (ev) {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // liens externes (carte) : non gérés

  if (req.mode === 'navigate') {
    ev.respondWith(
      caches.match('./index.html').then(function (r) { return r || fetch(req); })
    );
    return;
  }
  ev.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (r) { return r || fetch(req); })
  );
});
