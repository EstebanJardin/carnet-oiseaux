/* =====================================================================
   db.js — base de données locale (IndexedDB)
   Magasins :
     observations  { id, especeId, date, heure, lieu, lat, lon, precision,
                     nombre, comportements[], meteo[], temperature, notes,
                     photoIds[], creeLe, modifieLe }
     photos        { id, observationId, especeId, nomOriginal, type, taille,
                     largeur, hauteur, dateExif, original (Blob),
                     affichage (Blob), miniature (Blob), crc{}, favori,
                     creeLe, modifieLe }
     suppressions  { id, type, le }  ← traces des suppressions, pour que
                     l'import d'une ancienne sauvegarde ne les fasse pas revenir
   ===================================================================== */
'use strict';

(function (App) {
  const NOM_BASE = 'carnet-oiseaux';
  const VERSION_BASE = 2; // 2 : ajout des sons (chants enregistrés)
  let ouverture = null;

  function ouvrir() {
    if (ouverture) return ouverture;
    ouverture = new Promise(function (ok, ko) {
      if (!('indexedDB' in window)) { ko(new Error('Ce navigateur ne permet pas de stocker des données (IndexedDB).')); return; }
      const req = indexedDB.open(NOM_BASE, VERSION_BASE);
      req.onupgradeneeded = function () {
        const base = req.result;
        if (!base.objectStoreNames.contains('observations')) {
          const s = base.createObjectStore('observations', { keyPath: 'id' });
          s.createIndex('especeId', 'especeId');
          s.createIndex('date', 'date');
        }
        if (!base.objectStoreNames.contains('photos')) {
          const s = base.createObjectStore('photos', { keyPath: 'id' });
          s.createIndex('observationId', 'observationId');
          s.createIndex('especeId', 'especeId');
        }
        if (!base.objectStoreNames.contains('suppressions')) {
          base.createObjectStore('suppressions', { keyPath: 'id' });
        }
        if (!base.objectStoreNames.contains('sons')) {
          const s = base.createObjectStore('sons', { keyPath: 'id' });
          s.createIndex('observationId', 'observationId');
          s.createIndex('especeId', 'especeId');
        }
      };
      req.onsuccess = function () {
        const base = req.result;
        base.onversionchange = function () { base.close(); location.reload(); };
        ok(base);
      };
      req.onerror = function () { ouverture = null; ko(req.error); };
      req.onblocked = function () { ko(new Error("La base est bloquée : ferme les autres onglets de l'appli.")); };
    });
    return ouverture;
  }

  function promesse(req) {
    return new Promise(function (ok, ko) {
      req.onsuccess = function () { ok(req.result); };
      req.onerror = function () { ko(req.error); };
    });
  }
  function finTransaction(tx) {
    return new Promise(function (ok, ko) {
      tx.oncomplete = function () { ok(); };
      tx.onerror = function () { ko(tx.error); };
      tx.onabort = function () { ko(tx.error || new Error('Écriture annulée')); };
    });
  }

  App.db = {
    ouvrir: ouvrir,
    tout: async function (magasin) {
      const base = await ouvrir();
      return promesse(base.transaction(magasin).objectStore(magasin).getAll());
    },
    lire: async function (magasin, id) {
      const base = await ouvrir();
      return promesse(base.transaction(magasin).objectStore(magasin).get(id));
    },
    compter: async function (magasin) {
      const base = await ouvrir();
      return promesse(base.transaction(magasin).objectStore(magasin).count());
    },
    // ops = [{ magasin, mettre: objet } ou { magasin, effacer: id }] — tout ou rien
    ecrire: async function (ops) {
      if (!ops.length) return;
      const base = await ouvrir();
      const magasins = Array.from(new Set(ops.map(function (o) { return o.magasin; })));
      const tx = base.transaction(magasins, 'readwrite');
      ops.forEach(function (o) {
        const s = tx.objectStore(o.magasin);
        if (o.effacer !== undefined) s.delete(o.effacer); else s.put(o.mettre);
      });
      try { await finTransaction(tx); }
      finally { App.donnees.invalider(); }
    }
  };

  /* ---------- Données en mémoire (rechargées après chaque écriture) ---------- */

  let cache = null;

  function cleObs(o) { return (o.date || '') + 'T' + (o.heure || '00:00'); }

  App.donnees = {
    cleObs: cleObs,
    invalider: function () { cache = null; },

    charger: async function () {
      if (cache) return cache;
      const res = await Promise.all([App.db.tout('observations'), App.db.tout('photos'), App.db.tout('sons')]);
      const obs = res[0], photos = res[1], sons = res[2];
      obs.sort(function (a, b) { return cleObs(b).localeCompare(cleObs(a)); }); // plus récentes d'abord
      const photosParId = new Map(photos.map(function (p) { return [p.id, p]; }));
      const sonsParId = new Map(sons.map(function (s) { return [s.id, s]; }));
      const obsParId = new Map(obs.map(function (o) { return [o.id, o]; }));
      cache = { obs: obs, photos: photos, photosParId: photosParId, sons: sons, sonsParId: sonsParId, obsParId: obsParId, resume: null };
      return cache;
    },

    // Photos d'une observation, dans l'ordre choisi
    photosDe: function (c, o) {
      return (o.photoIds || []).map(function (id) { return c.photosParId.get(id); }).filter(Boolean);
    },

    // Sons (chants enregistrés) d'une observation
    sonsDe: function (c, o) {
      return (o.sonIds || []).map(function (id) { return c.sonsParId.get(id); }).filter(Boolean);
    },

    // Résumé par espèce : nb d'obs, individus, première/dernière obs, photos, couverture
    resume: async function () {
      const c = await App.donnees.charger();
      if (c.resume) return c.resume;
      const m = new Map();
      c.obs.forEach(function (o) {
        let r = m.get(o.especeId);
        if (!r) {
          r = { nb: 0, individus: 0, premiere: null, derniere: null, obs: [], photos: [], couverture: null };
          m.set(o.especeId, r);
        }
        r.nb++;
        r.individus += Math.max(0, parseInt(o.nombre, 10) || 0);
        r.obs.push(o);
        if (!r.derniere || cleObs(o) > cleObs(r.derniere)) r.derniere = o;
        if (!r.premiere || cleObs(o) < cleObs(r.premiere)) r.premiere = o;
        App.donnees.photosDe(c, o).forEach(function (p) { r.photos.push({ photo: p, obs: o }); });
      });
      m.forEach(function (r) {
        const fav = r.photos.find(function (x) { return x.photo.favori && x.photo.miniature; });
        const premiere = r.photos.find(function (x) { return x.photo.miniature; });
        r.couverture = (fav || premiere || {}).photo || null;
      });
      c.resume = m;
      return m;
    },

    // Supprime une observation et ses photos (avec traces de suppression)
    supprimerObservation: async function (obsId) {
      const c = await App.donnees.charger();
      const o = c.obsParId.get(obsId);
      if (!o) return;
      const maintenant = new Date().toISOString();
      const ops = [
        { magasin: 'observations', effacer: obsId },
        { magasin: 'suppressions', mettre: { id: obsId, type: 'observation', le: maintenant } }
      ];
      (o.photoIds || []).forEach(function (pid) {
        ops.push({ magasin: 'photos', effacer: pid });
        ops.push({ magasin: 'suppressions', mettre: { id: pid, type: 'photo', le: maintenant } });
        if (App.photos) App.photos.oublierUrl(pid);
      });
      (o.sonIds || []).forEach(function (sid) {
        ops.push({ magasin: 'sons', effacer: sid });
        ops.push({ magasin: 'suppressions', mettre: { id: sid, type: 'son', le: maintenant } });
        if (App.sons) App.sons.oublierUrl(sid);
      });
      await App.db.ecrire(ops);
    },

    // Marque une photo comme « couverture » de son espèce (une seule à la fois)
    definirFavori: async function (photoId) {
      const c = await App.donnees.charger();
      const p = c.photosParId.get(photoId);
      if (!p) return false;
      const devient = !p.favori;
      const maintenant = new Date().toISOString();
      const ops = [];
      c.photos.forEach(function (x) {
        if (x.especeId === p.especeId && x.favori && x.id !== p.id) {
          ops.push({ magasin: 'photos', mettre: Object.assign({}, x, { favori: false, modifieLe: maintenant }) });
        }
      });
      ops.push({ magasin: 'photos', mettre: Object.assign({}, p, { favori: devient, modifieLe: maintenant }) });
      await App.db.ecrire(ops);
      return devient;
    }
  };
})(window.App);
