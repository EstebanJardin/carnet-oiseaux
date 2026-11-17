/* =====================================================================
   Service worker — fait fonctionner l'appli SANS connexion.
   Tous les fichiers de l'appli sont gardés en cache sur le téléphone.

   ⚠ IMPORTANT : après toute modification d'un fichier de l'appli
     (y compris data/especes.js), augmente VERSION ci-dessous
     (ex. 'v1.1.1'). Au prochain lancement avec du réseau, l'appli
     proposera « Mettre à jour ». Tes observations ne sont jamais
     touchées : elles sont dans la base IndexedDB, pas dans ce cache.

   Les photos de référence (images/especes/) ont leur propre cache,
   conservé d'une version à l'autre : elles ne sont téléchargées qu'une
   fois. Chaque adresse porte une empreinte (?v=…, dans data/photos.js) :
   une photo remplacée sera retéléchargée automatiquement.
   ===================================================================== */
const VERSION = 'v1.2.2';
const CACHE = 'carnet-oiseaux-' + VERSION;
const CACHE_PHOTOS = 'carnet-oiseaux-photos';

importScripts('data/photos.js');

const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './data/especes.js',
  './data/photos.js',
  './js/utils.js',
  './js/db.js',
  './js/photos.js',
  './js/zip.js',
  './js/astro.js',
  './js/sons.js',
  './js/partage.js',
  './js/catalogue.js',
  './js/observations.js',
  './js/fiche.js',
  './js/stats.js',
  './js/saison.js',
  './js/cibles.js',
  './js/sortie.js',
  './js/sauvegarde.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

// Adresses complètes des photos de référence de cette version
function adressesPhotos() {
  const refs = self.PHOTOS_REF || {};
  const liste = [];
  Object.keys(refs).forEach(function (id) {
    const v = refs[id].v ? '?v=' + refs[id].v : '';
    liste.push(new URL('images/especes/mini/' + id + '.jpg' + v, self.location).href);
    liste.push(new URL('images/especes/' + id + '.jpg' + v, self.location).href);
  });
  return liste;
}

// Télécharge les photos manquantes (au mieux : une photo qui échoue sera reprise plus tard)
async function precacherPhotos() {
  const cache = await caches.open(CACHE_PHOTOS);
  const deja = new Set((await cache.keys()).map(function (r) { return r.url; }));
  const manquantes = adressesPhotos().filter(function (u) { return !deja.has(u); });
  let i = 0;
  async function travailleur() {
    while (i < manquantes.length) {
      const u = manquantes[i++];
      try {
        const r = await fetch(u, { cache: 'reload' });
        if (r.ok) await cache.put(u, r);
      } catch (e) { /* hors ligne : réessai au prochain lancement */ }
    }
  }
  await Promise.all([travailleur(), travailleur(), travailleur(), travailleur()]);
}

self.addEventListener('install', function (ev) {
  ev.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    // cache: 'reload' : on récupère la version la plus récente, pas celle du cache HTTP
    await cache.addAll(FICHIERS.map(function (f) { return new Request(f, { cache: 'reload' }); }));
    await precacherPhotos();
  })());
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil((async function () {
    // Anciennes versions de l'appli
    const cles = await caches.keys();
    await Promise.all(cles
      .filter(function (k) { return k.indexOf('carnet-oiseaux-') === 0 && k !== CACHE && k !== CACHE_PHOTOS; })
      .map(function (k) { return caches.delete(k); }));
    // Photos qui ne servent plus (remplacées ou retirées)
    const utiles = new Set(adressesPhotos());
    const cachePhotos = await caches.open(CACHE_PHOTOS);
    const anciennes = (await cachePhotos.keys()).filter(function (r) { return !utiles.has(r.url); });
    await Promise.all(anciennes.map(function (r) { return cachePhotos.delete(r); }));
    await self.clients.claim();
    precacherPhotos(); // complète si certaines photos avaient échoué
  })());
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
  if (url.origin !== self.location.origin) return; // liens externes (carte, crédits) : non gérés

  if (req.mode === 'navigate') {
    ev.respondWith(
      caches.match('./index.html').then(function (r) { return r || fetch(req); })
    );
    return;
  }
  if (url.pathname.indexOf('/images/especes/') !== -1) {
    ev.respondWith(caches.open(CACHE_PHOTOS).then(function (cache) {
      return cache.match(req).then(function (r) {
        return r || fetch(req).then(function (rep) {
          if (rep.ok) cache.put(req, rep.clone());
          return rep;
        });
      });
    }));
    return;
  }
  ev.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (r) { return r || fetch(req); })
  );
});
