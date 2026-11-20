/* =====================================================================
   carte.js — Carte hors ligne de la région (#/carte)
   - Tes spots, tes observations (regroupées quand elles sont proches),
     ta position, et la préparation d'itinéraires (→ Google Maps, GPX, KML)
   - Routes : #/carte · #/carte/spot/<id> · #/carte/obs/<id>
     #/carte/espece/<id> · #/carte/itineraire/<id|nouveau> · #/carte/placer/<spotId>
   - La carte de la région (liste dans data/carte.js) se télécharge une fois
     dans un cache à part ; ensuite tout est lu sur le téléphone, sans réseau.
     Bibliothèques : MapLibre GL JS, PMTiles, styles Protomaps
     (licences dans carte/LICENCES.md). Données © OpenStreetMap.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const M = window.CARTE || null;
  // Nom hors du préfixe « carnet-oiseaux- » : le service worker ne vide jamais ce cache
  const CACHE = 'carnet-carte-hors-ligne';
  const INSTALLEE = 'carte/installee.json';
  const BLEU = '#2F7DE1';

  function aUnePosition(x) {
    return !!x && typeof x.lat === 'number' && typeof x.lon === 'number' && isFinite(x.lat) && isFinite(x.lon);
  }
  function arrondi(x) { return Math.round(x * 1e6) / 1e6; }
  function adresse(chemin) { return new URL(chemin, document.baseURI).href; }
  // Clé du fichier dans le cache : l'empreinte y figure, une nouvelle version ne se confond pas avec l'ancienne
  function cle(f) { return adresse(f.c) + '?v=' + f.h.slice(0, 16); }
  function tous(man) { return man.fichiers.concat(man.region); }
  function somme(liste) { return liste.reduce(function (s, f) { return s + f.t; }, 0); }
  function typeMime(chemin) {
    if (/\.js$/.test(chemin)) return 'text/javascript';
    if (/\.css$/.test(chemin)) return 'text/css';
    if (/\.json$/.test(chemin)) return 'application/json';
    if (/\.png$/.test(chemin)) return 'image/png';
    if (/\.pbf$/.test(chemin)) return 'application/x-protobuf';
    return 'application/octet-stream';
  }
  function hex(buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) { return (b < 16 ? '0' : '') + b.toString(16); }).join('');
  }
  function erreurAnnulation() {
    try { return new DOMException('annulé', 'AbortError'); }
    catch (e) { const x = new Error('annulé'); x.name = 'AbortError'; return x; }
  }
  function dimensions(man) {
    const z = man.zone, lat = (z[1] + z[3]) / 2;
    return { l: Math.round((z[2] - z[0]) * 111.32 * Math.cos(lat * Math.PI / 180)), h: Math.round((z[3] - z[1]) * 111.2) };
  }

  /* =================================================================
     Fichiers de la carte : état, téléchargement reprenable, suppression
     ================================================================= */

  async function lireInstallee(cache) {
    try { const r = await cache.match(adresse(INSTALLEE)); return r ? await r.json() : null; }
    catch (e) { return null; }
  }
  async function clesPresentes(cache) { return new Set((await cache.keys()).map(function (r) { return r.url; })); }
  function manquants(man, presentes) { return tous(man).filter(function (f) { return !presentes.has(cle(f)); }); }

  // Version complète en cache : on la note comme installée et on retire les anciens fichiers
  async function installer(cache) {
    await cache.put(adresse(INSTALLEE), new Response(JSON.stringify(M), { headers: { 'Content-Type': 'application/json' } }));
    const garder = new Set(tous(M).map(cle).concat([adresse(INSTALLEE)]));
    const cles = await cache.keys();
    await Promise.all(cles.filter(function (r) { return !garder.has(r.url); }).map(function (r) { return cache.delete(r); }));
  }

  // → { possible, prete (manifeste utilisable ou null), aJour, aTelecharger[], taille }
  async function etat() {
    if (!M || !('caches' in window)) return { possible: false };
    const cache = await caches.open(CACHE);
    const presentes = await clesPresentes(cache);
    const manq = manquants(M, presentes);
    const inst = await lireInstallee(cache);
    if (!manq.length) {
      if (!inst || inst.version !== M.version) await installer(cache);
      return { possible: true, prete: M, aJour: true, aTelecharger: [], taille: 0 };
    }
    // Une ancienne version complète reste utilisable en attendant la mise à jour
    const ancienne = inst && inst.version !== M.version && inst.fichiers && !manquants(inst, presentes).length ? inst : null;
    return { possible: true, prete: ancienne, aJour: false, aTelecharger: manq, taille: somme(manq) };
  }

  async function verifierPlace(octets) {
    if (!navigator.storage || !navigator.storage.estimate) return;
    let e = null;
    try { e = await navigator.storage.estimate(); } catch (x) { return; }
    const marge = 20 * 1048576;
    if (e && e.quota && typeof e.usage === 'number' && e.quota - e.usage < octets + marge) {
      throw new Error(tr('Pas assez de place sur le téléphone : il faut environ {taille} de libre.', { taille: u.taille(octets + marge) }));
    }
  }

  async function telechargerFichier(f, signal, surOctets) {
    let r;
    try { r = await fetch(adresse(f.c), { cache: 'no-cache', signal: signal }); }
    catch (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new Error(tr('Pas de connexion pour l’instant. Le téléchargement reprendra là où il s’est arrêté.'));
    }
    if (!r.ok) throw new Error(tr('Le site ne répond pas (erreur {code}). Réessaie plus tard.', { code: r.status }));
    let octets;
    try {
      if (r.body && r.body.getReader) {
        const lecteur = r.body.getReader();
        const morceaux = [];
        let n = 0;
        for (;;) {
          const x = await lecteur.read();
          if (x.done) break;
          morceaux.push(x.value);
          n += x.value.length;
          surOctets(Math.min(n, f.t));
        }
        octets = new Uint8Array(n);
        let o = 0;
        morceaux.forEach(function (m) { octets.set(m, o); o += m.length; });
      } else {
        octets = new Uint8Array(await r.arrayBuffer());
        surOctets(Math.min(octets.length, f.t));
      }
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new Error(tr('Connexion coupée pendant le téléchargement. Il reprendra là où il s’est arrêté.'));
    }
    const abime = octets.length !== f.t ||
      (window.crypto && crypto.subtle && hex(await crypto.subtle.digest('SHA-256', octets)) !== f.h);
    if (abime) throw new Error(tr('Un fichier de la carte est arrivé abîmé ({nom}). Réessaie, de préférence en Wi-Fi.', { nom: f.c.split('/').pop() }));
    return octets;
  }

  // Un seul téléchargement à la fois ; il continue si tu changes de page dans l'appli
  let enCours = null; // { fait, total, ctrl, ecouteurs: Set, fini, erreur }
  function telecharger() {
    if (enCours) return enCours;
    const t = { fait: 0, total: 0, ctrl: new AbortController(), ecouteurs: new Set(), fini: false, erreur: null };
    function signaler() { t.ecouteurs.forEach(function (fn) { try { fn(t); } catch (e) { console.error(e); } }); }
    enCours = t;
    (async function () {
      const cache = await caches.open(CACHE);
      const liste = manquants(M, await clesPresentes(cache));
      t.total = somme(liste);
      await verifierPlace(t.total);
      signaler();
      const partiels = new Map();
      let finis = 0, i = 0;
      function maj() {
        let n = finis;
        partiels.forEach(function (v) { n += v; });
        t.fait = n;
        signaler();
      }
      async function travailleur() {
        while (i < liste.length && !t.ctrl.signal.aborted) {
          const f = liste[i++];
          const octets = await telechargerFichier(f, t.ctrl.signal, function (n) { partiels.set(f.c, n); maj(); });
          await cache.put(cle(f), new Response(octets, { headers: { 'Content-Type': typeMime(f.c), 'Content-Length': String(f.t) } }));
          partiels.delete(f.c);
          finis += f.t;
          maj();
        }
      }
      await Promise.all([0, 1, 2].map(function () {
        return travailleur().catch(function (e) { t.ctrl.abort(); throw e; });
      }));
      if (t.ctrl.signal.aborted) throw erreurAnnulation();
      await installer(cache);
      App.demanderPersistance();
    })().then(function () {
      enCours = null;
      t.fini = true;
      signaler();
      if (document.body.dataset.vue !== 'carte') {
        App.ui.toast(tr('Carte hors ligne prête'), { action: tr('Voir'), surAction: function () { App.aller('#/carte'); } });
      }
    }, function (e) {
      enCours = null;
      t.erreur = e;
      if (!(e && e.name === 'AbortError')) console.warn('Carte :', e);
      signaler();
    });
    return t;
  }

  async function supprimerCarte() {
    if (enCours) enCours.ctrl.abort();
    await caches.delete(CACHE);
    archive = { version: null, cle: null };
  }

  /* =================================================================
     Bibliothèques (lues dans le cache, aucune requête réseau)
     ================================================================= */

  let biblio = null;  // Promise<{ ml, protocole }>
  let archive = { version: null, cle: null };
  let pretePour = null; // manifeste dont les fichiers sont utilisés
  const clesParChemin = new Map();

  function chargerScript(url) {
    return new Promise(function (ok, ko) {
      const s = document.createElement('script');
      s.src = url;
      s.onload = function () { ok(); };
      s.onerror = function () { ko(new Error('script')); };
      document.head.appendChild(s);
    });
  }
  async function lire(cache, chemin) {
    const k = clesParChemin.get(chemin);
    const r = k ? await cache.match(k) : null;
    if (!r) throw new Error(tr('Fichier de la carte manquant : {nom}', { nom: chemin }));
    return r;
  }
  async function urlScript(cache, chemin) {
    const r = await lire(cache, chemin);
    return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type: 'text/javascript' }));
  }

  // Polices (carnet://polices/…) et icônes (carnet://icones/…) du style
  async function chargerRessource(params) {
    const chemin = decodeURIComponent(String(params.url).replace(/^carnet:\/\//, '').split('?')[0]);
    const cache = await caches.open(CACHE);
    let m = chemin.match(/^polices\/([^/]+)\/(\d+-\d+)\.pbf$/);
    if (m) {
      const pile = m[1].split(',')[0].trim();
      const dossier = pretePour && pretePour.polices ? pretePour.polices[pile] : null;
      const k = dossier ? clesParChemin.get('carte/polices/' + dossier + '/' + m[2] + '.pbf') : null;
      const r = k ? await cache.match(k) : null;
      // Plage de caractères absente (alphabet lointain) : aucun glyphe, sans erreur
      return { data: r ? await r.arrayBuffer() : new ArrayBuffer(0) };
    }
    m = chemin.match(/^icones\/([\w@.-]+)$/);
    if (m) {
      const r = await lire(cache, 'carte/icones/' + m[1]);
      if (params.type === 'json') return { data: await r.json() };
      if (params.type === 'image' && window.createImageBitmap) return { data: await createImageBitmap(await r.blob()) };
      return { data: await r.arrayBuffer() };
    }
    throw new Error('carnet://' + chemin);
  }

  async function preparer(man) {
    const cache = await caches.open(CACHE);
    clesParChemin.clear();
    tous(man).forEach(function (f) { clesParChemin.set(f.c, cle(f)); });
    pretePour = man;
    if (!biblio) {
      biblio = (async function () {
        await chargerScript(await urlScript(cache, 'carte/pmtiles.js'));
        await chargerScript(await urlScript(cache, 'carte/basemaps.js'));
        const css = document.createElement('style');
        css.id = 'css-maplibre';
        css.textContent = await (await lire(cache, 'carte/maplibre-gl.css')).text();
        // Avant style.css : les réglages de l'appli l'emportent
        document.head.insertBefore(css, document.head.querySelector('link[rel="stylesheet"]'));
        const ml = await import(await urlScript(cache, 'carte/maplibre-gl.js'));
        ml.setWorkerUrl(await urlScript(cache, 'carte/maplibre-gl-worker.js'));
        // Sur Chrome, MapLibre ne prend qu'un travailleur : avec 2 ou 3, la carte s'ouvre deux fois plus vite
        ml.setWorkerCount(Math.max(1, Math.min(3, Math.floor((navigator.hardwareConcurrency || 2) / 2))));
        ml.prewarm(); // les travailleurs démarrent pendant que la page se prépare
        const protocole = new window.pmtiles.Protocol({ metadata: true });
        ml.addProtocol('pmtiles', protocole.tile);
        ml.addProtocol('carnet', chargerRessource);
        return { ml: ml, protocole: protocole };
      })();
      biblio.catch(function () { biblio = null; });
    }
    const B = await biblio;
    if (archive.version !== man.version) {
      const morceaux = await Promise.all(man.region.map(function (f) {
        return lire(cache, f.c).then(function (r) { return r.blob(); });
      }));
      const nom = 'region-' + man.version + '.pmtiles';
      B.protocole.add(new window.pmtiles.PMTiles(new window.pmtiles.FileSource(new File(morceaux, nom))));
      archive = { version: man.version, cle: nom };
    }
    return { ml: B.ml, cle: archive.cle };
  }

  function styleCarte(cleArchive, sombre) {
    const B = window.basemaps;
    return {
      version: 8,
      glyphs: 'carnet://polices/{fontstack}/{range}.pbf',
      sprite: 'carnet://icones/' + (sombre ? 'dark' : 'light'),
      sources: {
        protomaps: {
          type: 'vector',
          url: 'pmtiles://' + cleArchive,
          attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>'
        }
      },
      layers: B.layers('protomaps', B.namedFlavor(sombre ? 'dark' : 'light'), { lang: App.langue() })
    };
  }

  function textesCarte() {
    return {
      'AttributionControl.ToggleAttribution': tr('Crédits de la carte'),
      'AttributionControl.MapFeedback': tr('Signaler une erreur sur la carte'),
      'ScaleControl.Meters': tr('m||unité'),
      'ScaleControl.Kilometers': tr('km||unité'),
      'Map.Title': tr('Carte')
    };
  }

  /* =================================================================
     Petites fenêtres
     ================================================================= */

  // Nom d'un itinéraire → Promise<texte ou null>
  function demanderNom(titre, valeur) {
    return new Promise(function (ok) {
      const d = document.getElementById('dlg-confirm');
      d.innerHTML = '<form method="dialog" class="dlg">' +
        '<h2>' + u.esc(titre) + '</h2>' +
        '<p><label class="sr-only" for="dlg-nom">' + tr('Nom de l’itinéraire') + '</label>' +
        '<input class="entree" id="dlg-nom" maxlength="80" autocomplete="off" value="' + u.esc(valeur || '') + '" placeholder="' + u.esc(tr('Tour des affûts du matin…')) + '"></p>' +
        '<div class="dlg-actions">' +
        '<button type="button" class="btn btn-second" data-dlg="annuler">' + tr('Annuler') + '</button>' +
        '<button value="oui" class="btn btn-prim">' + tr('Enregistrer') + '</button>' +
        '</div></form>';
      d.returnValue = '';
      d.onclick = null;
      d.querySelector('[data-dlg="annuler"]').addEventListener('click', function () { d.close('non'); });
      d.onclose = function () { ok(d.returnValue === 'oui' ? d.querySelector('#dlg-nom').value.trim() : null); };
      d.showModal();
      const champ = d.querySelector('#dlg-nom');
      champ.focus();
      champ.select();
    });
  }

  // Itinéraires enregistrés → Promise<itinéraire choisi ou null> (suppression possible)
  function choisirItineraire() {
    return App.donnees.charger().then(function (c) {
      return new Promise(function (ok) {
        const d = document.getElementById('dlg-confirm');
        let choisi = null;
        function ligne(it) {
          const pts = App.itineraires.points(it, c);
          const infos = [u.pluriel(pts.length, 'étape')];
          if (pts.length > 1) infos.push(tr('{distance} à vol d’oiseau', { distance: App.spots.texteDistance(App.itineraires.distance(pts)) }));
          infos.push(u.dateCourte((it.modifieLe || '').slice(0, 10)));
          return '<li class="dlg-iti-ligne"><button type="button" class="dlg-iti-ouvrir" data-iti="' + u.esc(it.id) + '">' + u.ic(it.mode === 'voiture' ? 'carte' : 'chemin') +
            '<span class="ls-txt"><b>' + u.esc(it.nom) + '</b><small>' + u.esc(infos.join(' · ')) + '</small></span></button>' +
            '<button type="button" class="btn-icone" data-iti-suppr="' + u.esc(it.id) + '" aria-label="' + u.esc(tr('Supprimer « {nom} »', { nom: it.nom })) + '">' + u.ic('poubelle') + '</button></li>';
        }
        function rendre() {
          d.innerHTML = '<form method="dialog" class="dlg dlg-multi">' +
            '<h2>' + tr('Mes itinéraires') + '</h2>' +
            (c.itineraires.length
              ? '<ul class="choix-liste dlg-iti">' + c.itineraires.map(ligne).join('') + '</ul>'
              : '<p>' + tr('Aucun itinéraire enregistré pour l’instant.') + '</p>') +
            '<div class="dlg-actions"><button value="non" class="btn btn-second">' + tr('Fermer') + '</button></div></form>';
        }
        rendre();
        d.returnValue = '';
        d.onclick = async function (ev) {
          const o = ev.target.closest('[data-iti]');
          if (o) { choisi = c.itinerairesParId.get(o.dataset.iti) || null; d.close('oui'); return; }
          const s = ev.target.closest('[data-iti-suppr]');
          if (!s) return;
          if (s.dataset.confirme !== '1') {
            s.dataset.confirme = '1';
            s.classList.add('confirmer');
            s.innerHTML = '<span>' + tr('Supprimer ?') + '</span>';
            return;
          }
          await App.itineraires.supprimer(s.dataset.itiSuppr);
          c = await App.donnees.charger();
          App.ui.toast(tr('Itinéraire supprimé'));
          rendre();
        };
        d.onclose = function () { d.onclick = null; ok(d.returnValue === 'oui' ? choisi : null); };
        d.showModal();
      });
    });
  }

  /* =================================================================
     Page « Carte »
     ================================================================= */

  let finCarte = null; // nettoyage de la carte affichée (aussi quand la page est redessinée)
  function terminer() { if (finCarte) { const f = finCarte; finCarte = null; try { f(); } catch (e) { console.error(e); } } }

  App.vue('carte', {
    onglet: 'carte',
    afficher: async function (el, params) {
      terminer();
      App.surNettoyage(terminer);
      const route = { type: params[0] || '', id: params[1] || '' };
      const st = await etat();
      if (!st.possible) { rendreImpossible(el); return; }
      if (!st.prete) { rendreAccueil(el, st); return; }
      await afficherCarte(el, route, st);
    }
  });

  function rendreImpossible(el) {
    el.innerHTML = App.ui.entete({ titre: tr('Carte'), retour: '#/observations' }) +
      '<div class="vide">' + u.ic('carte', 'ic-vide') + '<p>' + tr('Ce navigateur ne permet pas de garder la carte sur le téléphone. Essaie avec Chrome ou Samsung Internet à jour.') + '</p></div>';
  }

  // Bouton « Télécharger » ou barre de progression (zone : élément à remplir)
  function brancherTelechargement(zone, st, compact) {
    let desabonner = null;
    function bouton(erreur) {
      const partiel = st.taille < M.taille;
      const texte = st.prete ? /*tr*/'Mettre à jour la carte ({taille})'
        : partiel ? /*tr*/'Reprendre le téléchargement ({taille})' : /*tr*/'Télécharger la carte ({taille})';
      zone.innerHTML = (erreur ? '<p class="erreur-champ carte-dl-erreur">' + u.esc(erreur) + '</p>' : '') +
        '<button type="button" class="btn btn-prim' + (compact ? ' btn-petit' : ' btn-bloc') + '" data-dl="go">' + u.ic('telecharger') +
        tr(texte, { taille: u.taille(st.taille) }) + '</button>';
      zone.querySelector('[data-dl="go"]').addEventListener('click', function () {
        if (navigator.onLine === false) {
          App.ui.toast(tr('Pas de connexion pour l’instant : reviens ici quand tu auras du réseau.'), { erreur: true });
          return;
        }
        suivre(telecharger());
      });
    }
    function progres(t) {
      const pct = t.total ? Math.min(100, Math.floor(t.fait / t.total * 100)) : 0;
      if (!zone.querySelector('.carte-dl-progres')) {
        zone.innerHTML = '<div class="carte-dl-progres">' +
          '<div class="progression"><span style="width:0%"></span></div>' +
          '<div class="carte-dl-ligne"><span class="petit" data-dl="txt">' + tr('Préparation…') + '</span>' +
          '<button type="button" class="lien-btn" data-dl="stop">' + tr('Annuler') + '</button></div></div>';
        zone.querySelector('[data-dl="stop"]').addEventListener('click', function () { if (enCours) enCours.ctrl.abort(); });
      }
      zone.querySelector('.progression > span').style.width = pct + '%';
      if (t.total) {
        zone.querySelector('[data-dl="txt"]').textContent = tr('{fait} sur {total} ({pct})', { fait: u.taille(t.fait), total: u.taille(t.total), pct: u.pct(pct) });
      }
    }
    function ecouter(t) {
      // Page redessinée ou quittée : la nouvelle page a son propre suivi
      if (!zone.isConnected) { if (desabonner) desabonner(); return; }
      if (t.fini) { if (desabonner) desabonner(); App.rafraichir(); return; }
      if (t.erreur) {
        if (desabonner) desabonner();
        const message = t.erreur.name === 'AbortError' ? tr('Téléchargement interrompu.') : (t.erreur.message || String(t.erreur));
        etat().then(function (s2) { if (s2.possible) st = s2; if (zone.isConnected) bouton(message); });
        return;
      }
      if (zone.isConnected) progres(t);
    }
    function suivre(t) {
      t.ecouteurs.add(ecouter);
      desabonner = function () { t.ecouteurs.delete(ecouter); };
      progres(t);
    }
    if (enCours) suivre(enCours); else bouton();
    App.surNettoyage(function () { if (desabonner) desabonner(); });
  }

  function rendreAccueil(el, st) {
    const dim = dimensions(M);
    const partiel = st.taille < M.taille;
    el.innerHTML = App.ui.entete({ titre: tr('Carte'), sous: tr('Mes spots, mes observations, ma position'), retour: '#/observations' }) +
      '<div class="carte-accueil"><div class="encart carte-dl">' +
      '<div class="carte-dl-haut">' + u.ic('carte', 'carte-dl-ic') + '<h2>' + tr('Carte hors ligne de la région') + '</h2></div>' +
      '<p>' + tr('{zone} en détail (environ {l} × {h} km), et toute la Bulgarie en vue d’ensemble. Tes spots, tes observations et ta position s’y affichent sans réseau, et tu peux y préparer des itinéraires pour Google Maps.', { zone: u.esc(tr(M.nom)), l: dim.l, h: dim.h }) + '</p>' +
      '<ul class="carte-dl-infos">' +
      '<li>' + u.ic('telecharger') + '<span>' + (partiel
        ? tr('Déjà commencé : il reste {taille} à télécharger.', { taille: u.taille(st.taille) })
        : tr('À télécharger une seule fois : {taille} (Wi-Fi conseillé).', { taille: u.taille(st.taille) })) + '</span></li>' +
      '<li>' + u.ic('calendrier') + '<span>' + tr('Données OpenStreetMap du {date}.', { date: u.dateLongue(M.osm) }) + '</span></li>' +
      '</ul>' +
      '<div class="carte-dl-action"></div>' +
      '<p class="aide">' + tr('Si le réseau coupe ou si tu fermes l’appli, le téléchargement reprendra là où il s’est arrêté.') + '</p>' +
      '</div></div>';
    brancherTelechargement(el.querySelector('.carte-dl-action'), st, false);
  }

  async function afficherCarte(el, route, st) {
    const man = st.prete;
    let c = await App.donnees.charger();
    const sombre = App.theme.sombre();
    let statsSpots = App.spots.parSpot(c);

    // Filtres (gardés) ; l'espèce vient de l'adresse ou de la fenêtre des filtres (non gardée)
    const filtres = Object.assign({ spots: true, obs: true, periode: 'tout' }, App.prefs.get('carteFiltres', {}));
    let espece = route.type === 'espece' && App.esp.existe(route.id) ? route.id : null;

    let it = App.itineraires.brouillon();
    if (route.type === 'itineraire' && route.id !== 'nouveau') {
      const sauve = c.itinerairesParId.get(route.id);
      if (sauve) { it = JSON.parse(JSON.stringify(sauve)); App.itineraires.garderBrouillon(it); }
    }
    if (it.id) {
      // Itinéraire supprimé entre-temps (ici ou par une sauvegarde importée) : il redevient un brouillon ;
      // modifié ailleurs (import) : on reprend la version enregistrée, plus récente
      const sauve = c.itinerairesParId.get(it.id);
      if (!sauve) it = Object.assign({}, it, { id: null, creeLe: undefined, modifieLe: undefined });
      else if ((sauve.modifieLe || '') > (it.modifieLe || '')) it = JSON.parse(JSON.stringify(sauve));
      App.itineraires.garderBrouillon(it);
    }
    // Itinéraire en cours : le panneau revient s'il n'avait pas été fermé, replié sur téléphone
    // (la carte d'abord) ; ouvert en grand quand on vient exprès pour l'itinéraire
    let panneauOuvert = route.type === 'itineraire' || (it.etapes.length > 0 && !App.prefs.get('carteItinFerme', false));
    let reduit = route.type !== 'itineraire' && panneauOuvert && window.innerWidth < 900;
    let reduitAuto = false; // panneau replié le temps d'une fiche (téléphone)
    // Une fiche s'ouvre : sur téléphone, le panneau d'itinéraire se replie pour laisser voir la carte
    function faireDeLaPlace() {
      if (panneauOuvert && !reduit && window.innerWidth < 900) { reduit = true; reduitAuto = true; rendrePanneau(); }
    }

    el.classList.add('vue-carte');
    el.innerHTML = '<div class="carte-page">' +
      App.ui.entete({
        titre: tr('Carte'),
        sous: '<span id="c-sous"></span>',
        retour: '#/observations',
        sansOutils: true,
        actions: (App.sortie && App.sortie.enCours()
          ? '<a class="btn-icone carte-sortie" href="#/sortie" aria-label="' + u.esc(tr('Sortie en cours')) + '" title="' + u.esc(tr('Sortie en cours')) + '">' + u.ic('jumelles') + '<span class="point" aria-hidden="true"></span></a>'
          : '') +
          '<button type="button" class="btn-icone" data-c="filtres" aria-label="' + u.esc(tr('Que montrer sur la carte')) + '" title="' + u.esc(tr('Que montrer sur la carte')) + '">' + u.ic('couches') + '</button>' +
          '<button type="button" class="btn-icone" data-c="itin" aria-label="' + u.esc(tr('Itinéraire')) + '" title="' + u.esc(tr('Itinéraire')) + '">' + u.ic('chemin') + '</button>'
      }) +
      '<div class="carte-cadre">' +
      '<div class="carte-zone" id="c-zone"></div>' +
      '<div class="carte-haut" id="c-haut"></div>' +
      '<div class="carte-outils">' +
      '<button type="button" class="btn-icone" data-c="position" aria-label="' + u.esc(tr('Ma position')) + '" title="' + u.esc(tr('Ma position')) + '">' + u.ic('position') + '</button>' +
      '<button type="button" class="btn-icone carte-zoom" data-c="plus" aria-label="' + u.esc(tr('Zoomer')) + '">' + u.ic('plus') + '</button>' +
      '<button type="button" class="btn-icone carte-zoom" data-c="moins" aria-label="' + u.esc(tr('Dézoomer')) + '">' + u.ic('moins') + '</button>' +
      '</div>' +
      '<div class="carte-bas"><div class="carte-fiche" id="c-fiche" hidden></div><div class="carte-itin" id="c-itin" hidden></div></div>' +
      '<div class="carte-charge" id="c-charge"><span class="rond-charge" aria-hidden="true"></span><span>' + tr('Chargement de la carte…') + '</span></div>' +
      '</div></div>';

    const $ = function (s) { return el.querySelector(s); };
    const ficheEl = $('#c-fiche'), itinEl = $('#c-itin'), hautEl = $('#c-haut');

    let P;
    try { P = await preparer(man); }
    catch (e) {
      console.error(e);
      $('#c-charge').innerHTML = '<span class="erreur-champ">' + u.esc(tr('Impossible d’ouvrir la carte : {erreur}', { erreur: e.message || e })) + '</span>';
      return;
    }
    if (!el.isConnected) return; // page quittée pendant le chargement
    const ml = P.ml;

    const s = getComputedStyle(document.documentElement);
    const v = function (n, d) { return (s.getPropertyValue(n) || '').trim() || d; };
    const coul = {
      vert: v('--vert', '#2E5B47'), ocre: v('--ocre', '#A9582A'), fond: v('--carte', '#FFFFFF'),
      encre3: v('--encre-3', '#5F6C65'), surOcre: sombre ? '#2A1608' : '#FFFFFF'
    };

    function vueDepart() {
      const sp = (route.type === 'spot' || route.type === 'placer') ? c.spotsParId.get(route.id) : null;
      if (aUnePosition(sp)) return { centre: [sp.lon, sp.lat], zoom: 15.5 };
      const o = route.type === 'obs' ? c.obsParId.get(route.id) : null;
      if (aUnePosition(o)) return { centre: [o.lon, o.lat], zoom: 16 };
      const vu = App.prefs.get('carteVue', null);
      if (vu && Array.isArray(vu.c) && vu.c.length === 2 && isFinite(vu.c[0]) && isFinite(vu.c[1])) return { centre: vu.c, zoom: vu.z, gardee: true };
      return { centre: [man.centre[0], man.centre[1]], zoom: man.centre[2] || 12 };
    }
    const depart = vueDepart();
    const b = man.bornes;
    const carte = new ml.Map({
      container: $('#c-zone'),
      style: styleCarte(P.cle, sombre),
      center: depart.centre,
      zoom: depart.zoom,
      minZoom: 5,
      maxZoom: 18.5,
      maxBounds: [[b[0] - 3, b[1] - 2], [b[2] + 3, b[3] + 2]],
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      refreshExpiredTiles: false,
      fadeDuration: 120,
      validateStyle: false, // style connu (Protomaps) : on évite sa vérification, plus rapide à l'ouverture
      locale: textesCarte()
    });
    carte.touchZoomRotate.disableRotation();
    carte.keyboard.disableRotation();
    carte.addControl(new ml.AttributionControl({
      compact: true,
      customAttribution: '<a href="https://protomaps.com" target="_blank" rel="noopener">Protomaps</a> · <a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a>'
    }), 'bottom-right');
    carte.addControl(new ml.ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-left');

    // Thème clair / sombre changé pendant l'affichage : on redessine la page
    const observateur = new MutationObserver(function () { if (App.theme.sombre() !== sombre) App.rafraichir(); });
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const surMedia = function () { if (App.theme.sombre() !== sombre) App.rafraichir(); };
    try { media.addEventListener('change', surMedia); } catch (e) { /* ancien navigateur */ }

    let suivi = null;       // suivi GPS (watchPosition)
    let maPos = null;       // { lat, lon, precision, le }
    let marqueurMoi = null;
    let marqueurPoint = null;
    let placement = null;   // { spot, m }
    let selection = null;   // { type: 'spot', id } | { type: 'obs', ids } | { type: 'point', pt }
    const marqueurs = new Map();  // spotId → { m, el }
    let marqueursEtapes = [];
    let minuteurAppui = null;

    finCarte = function () {
      if (suivi !== null) navigator.geolocation.clearWatch(suivi);
      suivi = null;
      clearTimeout(minuteurAppui);
      observateur.disconnect();
      try { media.removeEventListener('change', surMedia); } catch (e) { /* ancien navigateur */ }
      carte.remove();
    };

    const garderVue = u.debounce(function () {
      if (!el.isConnected) return;
      const ctr = carte.getCenter();
      App.prefs.set('carteVue', { c: [arrondi(ctr.lng), arrondi(ctr.lat)], z: Math.round(carte.getZoom() * 100) / 100 });
    }, 800);

    /* ---------- Données affichées ---------- */

    function debutPeriode() {
      const d = new Date();
      if (filtres.periode === 'annee') return d.getFullYear() + '-01-01';
      if (filtres.periode === '12m') { d.setFullYear(d.getFullYear() - 1); return u.dateISO(d); }
      if (filtres.periode === '30j') { d.setDate(d.getDate() - 30); return u.dateISO(d); }
      return null;
    }
    function obsVisibles() {
      if (!filtres.obs && route.type !== 'obs') return [];
      const debut = debutPeriode();
      return c.obs.filter(function (o) {
        if (!aUnePosition(o)) return false;
        if (route.type === 'obs' && o.id === route.id) return true;
        if (!filtres.obs) return false;
        if (espece && o.especeId !== espece) return false;
        if (debut && (o.date || '') < debut) return false;
        return true;
      });
    }
    function spotsVisibles() {
      return c.spots.filter(function (sp) {
        if (!aUnePosition(sp)) return false;
        if (filtres.spots) return true;
        return (route.type === 'spot' && sp.id === route.id) || (selection && selection.type === 'spot' && selection.id === sp.id) || etapeDuSpot(sp.id) >= 0;
      });
    }
    function rectangle(z) {
      return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[z[0], z[1]], [z[2], z[1]], [z[2], z[3]], [z[0], z[3]], [z[0], z[1]]] } };
    }
    function cercle(lon, lat, rayon) {
      const pts = [], dLat = rayon / 111320, dLon = rayon / (111320 * Math.cos(lat * Math.PI / 180));
      for (let i = 0; i <= 48; i++) { const a = i / 48 * 2 * Math.PI; pts.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]); }
      return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } };
    }
    const VIDE = { type: 'FeatureCollection', features: [] };

    function majSous(nbObs) {
      const zone = $('#c-sous');
      if (!zone) return;
      const morceaux = [];
      if (espece) morceaux.push(App.esp.nom(App.esp.get(espece)));
      morceaux.push(u.pluriel(spotsVisibles().length, 'spot'));
      morceaux.push(u.pluriel(nbObs, 'observation'));
      if (filtres.periode !== 'tout') morceaux.push(tr(PERIODES.find(function (p) { return p[0] === filtres.periode; })[1]));
      zone.textContent = morceaux.join(' · ');
    }

    function majObs() {
      const src = carte.getSource('c-obs');
      if (!src) return;
      const liste = obsVisibles();
      src.setData({
        type: 'FeatureCollection',
        features: liste.map(function (o) {
          return { type: 'Feature', geometry: { type: 'Point', coordinates: [o.lon, o.lat] }, properties: { id: o.id } };
        })
      });
      majSous(liste.length);
    }

    function majSpots() {
      marqueurs.forEach(function (x) { x.m.remove(); });
      marqueurs.clear();
      spotsVisibles().forEach(function (sp) {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'carte-spot';
        const stSp = statsSpots.get(sp.id);
        if (espece && !(stSp && stSp.especes.has(espece))) bouton.classList.add('pale');
        if (placement && placement.spot.id === sp.id) bouton.hidden = true;
        bouton.innerHTML = '<span class="cs-rond">' + u.ic(App.spots.icone(sp)) + '</span><span class="cs-nom">' + u.esc(sp.nom) + '</span>';
        bouton.setAttribute('aria-label', sp.nom);
        bouton.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (placement) return;
          choisirSpot(sp.id);
          garderVisible(sp);
        });
        const m = new ml.Marker({ element: bouton, anchor: 'left', offset: [-16, 0] }).setLngLat([sp.lon, sp.lat]).addTo(carte);
        marqueurs.set(sp.id, { m: m, el: bouton });
      });
      majSelection();
      majSous(obsVisibles().length);
    }

    function majSelection() {
      marqueurs.forEach(function (x, id) { x.el.classList.toggle('choisi', !!selection && selection.type === 'spot' && selection.id === id); });
      if (carte.getLayer('c-obs-choisie')) {
        carte.setFilter('c-obs-choisie', ['in', ['get', 'id'], ['literal', selection && selection.type === 'obs' ? selection.ids : []]]);
      }
      if (marqueurPoint && !(selection && selection.type === 'point')) { marqueurPoint.remove(); marqueurPoint = null; }
    }

    function dessinerMoi() {
      if (!maPos) return;
      if (!marqueurMoi) {
        const point = document.createElement('div');
        point.className = 'carte-moi';
        point.setAttribute('aria-label', tr('Ma position'));
        marqueurMoi = new ml.Marker({ element: point }).setLngLat([maPos.lon, maPos.lat]).addTo(carte);
      } else marqueurMoi.setLngLat([maPos.lon, maPos.lat]);
      const src = carte.getSource('c-precision');
      if (src) src.setData(maPos.precision > 15 ? cercle(maPos.lon, maPos.lat, Math.min(maPos.precision, 3000)) : VIDE);
    }

    /* ---------- Position ---------- */

    const boutonPos = $('[data-c="position"]');
    function centrerSurMoi() {
      if (!maPos) return;
      carte.easeTo({ center: [maPos.lon, maPos.lat], zoom: Math.max(carte.getZoom(), 15) });
    }
    let centrerAuProchain = false;
    const majApresPosition = u.debounce(function () {
      if (!el.isConnected) return;
      majLigne();
      if (selection && selection.type !== 'obs') rafraichirFiche();
      if (panneauOuvert && !reduit) rendrePanneau();
    }, 1500);
    function suivrePosition(centrer) {
      if (!navigator.geolocation) { App.ui.toast(tr('GPS non disponible sur cet appareil'), { erreur: true }); return; }
      if (suivi !== null) { if (centrer) { if (maPos) centrerSurMoi(); else centrerAuProchain = true; } return; }
      centrerAuProchain = !!centrer;
      boutonPos.classList.add('on', 'cherche');
      suivi = navigator.geolocation.watchPosition(function (p) {
        maPos = { lat: arrondi(p.coords.latitude), lon: arrondi(p.coords.longitude), precision: Math.round(p.coords.accuracy), le: Date.now() };
        if (App.spots.noterPosition) App.spots.noterPosition(maPos);
        boutonPos.classList.remove('cherche');
        dessinerMoi();
        if (centrerAuProchain) { centrerAuProchain = false; centrerSurMoi(); }
        majApresPosition();
      }, function (err) {
        boutonPos.classList.remove('cherche');
        if (err.code === 1) {
          navigator.geolocation.clearWatch(suivi);
          suivi = null;
          boutonPos.classList.remove('on');
          App.ui.toast(tr('Accès à la position refusé : autorise-le dans les réglages du navigateur.'), { erreur: true });
        } else if (centrerAuProchain) {
          App.ui.toast(tr('Position introuvable pour l’instant. Réessaie à découvert.'), { erreur: true });
        }
      }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 45000 });
    }
    // Si l'accès au GPS est déjà autorisé, la position s'affiche d'elle-même
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (r) {
        if (r.state === 'granted' && el.isConnected) suivrePosition(false);
      }, function () { /* non disponible */ });
    }

    /* ---------- Fiche du bas (spot, observation, point) ---------- */

    function trajetVers(p) {
      return maPos ? '<p class="cf-trajet">' + u.ic('position') + '<span>' + u.esc(App.spots.texteTrajet(maPos, p)) + '</span></p>' : '';
    }
    function enteteFiche(visuel, titre, infos) {
      return '<div class="cf-haut">' + visuel +
        '<div class="cf-txt"><b>' + titre + '</b><small>' + infos + '</small></div>' +
        '<button type="button" class="btn-icone cf-fermer" data-f="fermer" aria-label="' + u.esc(tr('Fermer')) + '">' + u.ic('x') + '</button></div>';
    }
    function lienGoogleVers(p) {
      return App.itineraires.liensGoogle([p], 'pied', true)[0].url;
    }

    function choisirSpot(id) {
      const sp = c.spotsParId.get(id);
      if (!sp) return;
      selection = { type: 'spot', id: id };
      const stSp = statsSpots.get(id);
      const infos = [App.spots.libType(sp)];
      if (stSp) infos.push(u.pluriel(stSp.especes.size, 'espèce'), tr('dernière fois le {date}', { date: u.dateCourte(stSp.obs[0].date) }));
      else infos.push(tr('pas encore d’observation'));
      const dans = etapeDuSpot(id) >= 0;
      const photo = sp.photoId ? c.photosParId.get(sp.photoId) : null;
      const visuel = '<div class="vignette cf-vignette vignette-spot">' + (photo && photo.miniature
        ? '<img src="' + App.photos.url(photo, 'miniature') + '" alt="">' : u.ic(App.spots.icone(sp))) + '</div>';
      ficheEl.innerHTML = enteteFiche(visuel, u.esc(sp.nom), u.esc(infos.join(' · '))) + trajetVers(sp) +
        '<div class="cf-actions">' +
        '<a class="btn btn-second btn-petit" href="#/spot/' + encodeURIComponent(id) + '">' + tr('Voir le spot') + '</a>' +
        '<button type="button" class="btn btn-petit ' + (dans ? 'btn-doux' : 'btn-prim') + '" data-f="etape-spot">' + u.ic(dans ? 'check' : 'plus') +
        tr(dans ? /*tr*/'Retirer de l’itinéraire' : /*tr*/'Ajouter à l’itinéraire') + '</button>' +
        '</div><div class="cf-liens">' +
        '<a class="lien-btn" href="' + lienGoogleVers(sp) + '" target="_blank" rel="noopener">' + u.ic('externe') + tr('Y aller avec Google Maps') + '</a>' +
        '<button type="button" class="lien-btn" data-f="deplacer">' + u.ic('epingle') + tr('Déplacer') + '</button>' +
        '</div>';
      ficheEl.hidden = false;
      majSelection();
      faireDeLaPlace();
    }

    function choisirObs(ids) {
      const liste = ids.map(function (i) { return c.obsParId.get(i); }).filter(Boolean);
      if (!liste.length) return;
      selection = { type: 'obs', ids: liste.map(function (o) { return o.id; }) };
      if (liste.length === 1) {
        const o = liste[0], e = App.esp.get(o.especeId);
        const photo = App.donnees.photosDe(c, o).find(function (p) { return p.miniature; }) || null;
        const spot = o.spotId ? c.spotsParId.get(o.spotId) : null;
        const infos = [u.dateCourte(o.date) + (o.heure ? ' · ' + o.heure : ''), u.pluriel(o.nombre || 1, 'individu')];
        if (spot) infos.push(spot.nom); else if (o.lieu) infos.push(o.lieu);
        ficheEl.innerHTML = enteteFiche(App.ui.vignette(photo, 'cf-vignette', o.especeId), u.esc(App.esp.nom(e)), u.esc(infos.join(' · '))) + trajetVers(o) +
          '<div class="cf-actions">' +
          '<a class="btn btn-second btn-petit" href="#/espece/' + encodeURIComponent(o.especeId) + '">' + u.ic('livre') + tr('Fiche') + '</a>' +
          '<a class="btn btn-second btn-petit" href="#/modifier/' + encodeURIComponent(o.id) + '">' + u.ic('crayon') + tr('Modifier') + '</a>' +
          '<button type="button" class="btn btn-doux btn-petit" data-f="etape-obs">' + u.ic('plus') + tr('Étape') + '</button>' +
          '</div>';
      } else {
        liste.sort(function (a, b2) { return App.donnees.cleObs(b2).localeCompare(App.donnees.cleObs(a)); });
        ficheEl.innerHTML = enteteFiche('<div class="vignette cf-vignette">' + u.ic('jumelles') + '</div>',
          u.esc(u.pluriel(liste.length, 'observation')) + ' ' + tr('ici'), u.esc(u.pluriel(new Set(liste.map(function (o) { return o.especeId; })).size, 'espèce'))) +
          '<ul class="cf-liste">' + liste.slice(0, 30).map(function (o) {
            return '<li><a href="#/modifier/' + encodeURIComponent(o.id) + '"><b>' + u.esc(App.esp.nom(App.esp.get(o.especeId))) + '</b>' +
              '<small>' + u.esc(u.dateCourte(o.date) + (o.heure ? ' · ' + o.heure : '') + ' · ×' + (o.nombre || 1)) + '</small></a></li>';
          }).join('') + '</ul>' +
          '<div class="cf-actions"><button type="button" class="btn btn-doux btn-petit" data-f="etape-obs">' + u.ic('plus') + tr('Ajouter à l’itinéraire') + '</button></div>';
      }
      ficheEl.hidden = false;
      majSelection();
      faireDeLaPlace();
    }

    function choisirPoint(pt) {
      selection = { type: 'point', pt: pt };
      if (!marqueurPoint) {
        const e = document.createElement('div');
        e.className = 'carte-point';
        e.innerHTML = u.ic('epingle');
        marqueurPoint = new ml.Marker({ element: e, anchor: 'bottom' }).setLngLat([pt.lon, pt.lat]).addTo(carte);
      } else marqueurPoint.setLngLat([pt.lon, pt.lat]);
      ficheEl.innerHTML = enteteFiche('<div class="vignette cf-vignette">' + u.ic('epingle') + '</div>', tr('Point choisi'), App.spots.coordonnees(pt.lat, pt.lon)) + trajetVers(pt) +
        '<div class="cf-actions">' +
        '<button type="button" class="btn btn-prim btn-petit" data-f="nouveau-spot">' + u.ic('plus') + tr('Nouveau spot ici') + '</button>' +
        '<button type="button" class="btn btn-doux btn-petit" data-f="etape-point">' + u.ic('chemin') + tr('Ajouter à l’itinéraire') + '</button>' +
        '</div><div class="cf-liens">' +
        '<a class="lien-btn" href="' + lienGoogleVers(pt) + '" target="_blank" rel="noopener">' + u.ic('externe') + tr('Y aller avec Google Maps') + '</a>' +
        '<button type="button" class="lien-btn" data-f="copier">' + tr('Copier les coordonnées') + '</button>' +
        '</div>';
      ficheEl.hidden = false;
      majSelection();
      faireDeLaPlace();
    }

    // La fiche couvre le bas de la carte (la gauche sur PC) : si le point choisi est caché dessous,
    // la carte glisse pour le montrer au milieu de la partie libre
    function garderVisible(p) {
      if (!aUnePosition(p)) return;
      requestAnimationFrame(function () {
        if (!el.isConnected || ficheEl.hidden) return;
        const zone = carte.getContainer().getBoundingClientRect();
        const bas = $('.carte-bas').getBoundingClientRect();
        const pt = carte.project([p.lon, p.lat]);
        const x = zone.left + pt.x, y = zone.top + pt.y, marge = 30;
        if (x < bas.left - marge || x > bas.right + marge || y < bas.top - marge || y > bas.bottom + marge) return;
        if (bas.width < zone.width * 0.6) carte.panBy([x - (bas.right + zone.right) / 2, 0]);
        else carte.panBy([0, y - (zone.top + 70 + bas.top) / 2]);
      });
    }

    function fermerFiche() {
      selection = null;
      ficheEl.hidden = true;
      ficheEl.innerHTML = '';
      majSelection();
      if (reduitAuto) {
        reduitAuto = false;
        if (panneauOuvert && reduit) { reduit = false; rendrePanneau(); }
      }
    }
    // Sur téléphone, la fiche et le panneau déplié cacheraient toute la carte : on déplie, la fiche se ferme
    function placePourPanneau() {
      if (panneauOuvert && !reduit && selection && window.innerWidth < 900) fermerFiche();
    }
    function rafraichirFiche() {
      if (!selection) return;
      if (selection.type === 'spot') choisirSpot(selection.id);
      else if (selection.type === 'obs') choisirObs(selection.ids);
      else choisirPoint(selection.pt);
    }

    ficheEl.addEventListener('click', async function (ev) {
      const bt = ev.target.closest('[data-f]');
      if (!bt || !selection) return;
      const a = bt.dataset.f;
      if (a === 'fermer') fermerFiche();
      else if (a === 'etape-spot') {
        const sp = c.spotsParId.get(selection.id);
        const i = etapeDuSpot(sp.id);
        if (i >= 0) changer(function (x) { x.etapes.splice(i, 1); });
        else ajouterEtape({ spotId: sp.id, lat: sp.lat, lon: sp.lon, nom: sp.nom });
        rafraichirFiche();
      } else if (a === 'etape-obs') {
        const o = c.obsParId.get(selection.ids[0]);
        if (o) ajouterEtape({ lat: o.lat, lon: o.lon, nom: App.esp.nom(App.esp.get(o.especeId)) + ' (' + u.dateCourte(o.date) + ')' });
        fermerFiche();
      } else if (a === 'etape-point') {
        ajouterEtape({ lat: selection.pt.lat, lon: selection.pt.lon, nom: '' });
        fermerFiche();
      } else if (a === 'nouveau-spot') {
        const pt = selection.pt;
        const cree = await App.spots.editer(null, { lat: pt.lat, lon: pt.lon });
        if (!cree || !el.isConnected) return;
        App.ui.toast(tr('Spot enregistré : {nom}', { nom: cree.nom }));
        await recharger();
        choisirSpot(cree.id);
        garderVisible(cree);
      } else if (a === 'deplacer') {
        const sp = c.spotsParId.get(selection.id);
        if (sp) demarrerPlacement(sp);
      } else if (a === 'copier') {
        const texte = selection.pt.lat.toFixed(5) + ', ' + selection.pt.lon.toFixed(5);
        try { await navigator.clipboard.writeText(texte); App.ui.toast(tr('Coordonnées copiées : {texte}', { texte: texte })); }
        catch (e) { App.ui.toast(texte, { duree: 8000 }); }
      }
    });

    async function recharger() {
      c = await App.donnees.charger();
      statsSpots = App.spots.parSpot(c);
      majSpots();
      majObs();
      majItin();
    }

    /* ---------- Placer ou déplacer un spot ---------- */

    function demarrerPlacement(sp) {
      fermerFiche();
      if (placement) finirPlacement(false);
      const e = document.createElement('div');
      e.className = 'carte-placer';
      e.innerHTML = u.ic('epingle');
      const ll = aUnePosition(sp) ? [sp.lon, sp.lat] : carte.getCenter().toArray();
      const m = new ml.Marker({ element: e, anchor: 'bottom', draggable: true }).setLngLat(ll).addTo(carte);
      placement = { spot: sp, m: m };
      const x = marqueurs.get(sp.id);
      if (x) x.el.hidden = true;
      const bandeau = document.createElement('div');
      bandeau.className = 'carte-mode';
      bandeau.innerHTML = '<p>' + u.ic('epingle') + '<span>' + tr('Touche la carte ou fais glisser l’épingle à l’endroit de « {nom} ».', { nom: u.esc(sp.nom) }) + '</span></p>' +
        '<div class="carte-mode-actions"><button type="button" class="btn btn-second btn-petit" data-m="annuler">' + tr('Annuler') + '</button>' +
        '<button type="button" class="btn btn-prim btn-petit" data-m="ok">' + u.ic('check') + tr('Enregistrer') + '</button></div>';
      bandeau.addEventListener('click', function (ev) {
        const bt = ev.target.closest('[data-m]');
        if (bt) finirPlacement(bt.dataset.m === 'ok');
      });
      hautEl.prepend(bandeau);
      placement.bandeau = bandeau;
    }
    async function finirPlacement(garder) {
      const p = placement;
      if (!p) return;
      placement = null;
      p.bandeau.remove();
      const ll = p.m.getLngLat();
      p.m.remove();
      if (garder) {
        try {
          const n = Object.assign({}, p.spot, { lat: arrondi(ll.lat), lon: arrondi(ll.lng), precision: null, modifieLe: new Date().toISOString() });
          await App.db.ecrire([{ magasin: 'spots', mettre: n }]);
          App.ui.toast(tr('Position du spot enregistrée'));
        } catch (e) {
          App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: e.message || e }), { erreur: true });
        }
        await recharger();
        choisirSpot(p.spot.id);
        garderVisible(c.spotsParId.get(p.spot.id));
      } else majSpots();
    }

    /* ---------- Itinéraire ---------- */

    function etapeDuSpot(id) { return it.etapes.findIndex(function (e) { return e.spotId === id; }); }
    const sauverPlusTard = u.debounce(function () {
      if (!it.id) return;
      App.itineraires.enregistrer(it).then(function (r) {
        Object.assign(it, { id: r.id, nom: r.nom, creeLe: r.creeLe, modifieLe: r.modifieLe });
        App.itineraires.garderBrouillon(it);
      }, function (e) { App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: e.message || e }), { erreur: true }); });
    }, 700);
    function changer(fn) {
      fn(it);
      App.itineraires.garderBrouillon(it);
      if (it.id) sauverPlusTard();
      majItin();
    }
    function ajouterEtape(etape) {
      panneauOuvert = true;
      changer(function (x) { x.etapes.push(etape); });
      App.ui.toast(tr('Étape {n} ajoutée à l’itinéraire', { n: it.etapes.length }));
    }

    function majLigne() {
      const src = carte.getSource('c-itin');
      if (!src) return;
      const pts = App.itineraires.points(it, c);
      const ligne = (it.depuisPosition && maPos ? [maPos] : []).concat(pts);
      src.setData(ligne.length > 1
        ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: ligne.map(function (p) { return [p.lon, p.lat]; }) } }
        : VIDE);
    }

    function majItin() {
      majLigne();
      marqueursEtapes.forEach(function (m) { m.remove(); });
      marqueursEtapes = [];
      App.itineraires.points(it, c).forEach(function (p, i) {
        const e = document.createElement('div');
        e.className = 'carte-etape' + (p.spotId && marqueurs.has(p.spotId) ? ' sur-spot' : '');
        e.textContent = String(i + 1);
        const m = new ml.Marker({ element: e, offset: p.spotId && marqueurs.has(p.spotId) ? [14, -15] : [0, 0] }).setLngLat([p.lon, p.lat]).addTo(carte);
        marqueursEtapes.push(m);
      });
      rendrePanneau();
    }

    function rendrePanneau() {
      if (App.prefs.get('carteItinFerme', false) !== !panneauOuvert) App.prefs.set('carteItinFerme', !panneauOuvert);
      if (!panneauOuvert) { itinEl.hidden = true; itinEl.innerHTML = ''; return; }
      itinEl.hidden = false;
      const pts = App.itineraires.points(it, c);
      const depuis = it.depuisPosition && maPos ? maPos : null;
      const dist = App.itineraires.distance(pts, depuis);
      // La distance n'a de sens qu'à partir de deux points (ma position comprise)
      const resume = pts.length
        ? u.pluriel(pts.length, 'étape') + (pts.length + (depuis ? 1 : 0) > 1 ? ' · ' + tr('{distance} à vol d’oiseau', { distance: App.spots.texteDistance(dist) }) : '')
        : tr('Aucune étape');
      const liens = App.itineraires.liensGoogle(pts, it.mode, it.depuisPosition, 9);
      const boutonGoogle = liens.length === 1
        ? '<a class="btn btn-prim btn-petit ci-google" href="' + liens[0].url + '" target="_blank" rel="noopener">' + u.ic('externe') + tr('Ouvrir dans Google Maps') + '</a>'
        : '';
      const haut = '<div class="ci-haut">' +
        '<button type="button" class="ci-titre" data-i="reduire" aria-expanded="' + !reduit + '">' + u.ic('chemin') +
        '<span class="ci-txt"><b>' + u.esc(it.nom || tr('Nouvel itinéraire')) + '</b><small>' + u.esc(resume) + '</small></span>' +
        u.ic('chevron', 'ci-chev' + (reduit ? ' replie' : '')) + '</button>' +
        '<button type="button" class="btn-icone cf-fermer" data-i="fermer" aria-label="' + u.esc(tr('Fermer')) + '">' + u.ic('x') + '</button></div>';
      if (reduit) {
        itinEl.innerHTML = haut + (boutonGoogle ? '<div class="ci-actions">' + boutonGoogle + '</div>' : '');
        return;
      }
      const lignes = it.etapes.map(function (e, i) {
        const sp = e.spotId ? c.spotsParId.get(e.spotId) : null;
        const nom = sp ? sp.nom : (e.nom || tr('Point choisi sur la carte'));
        const detail = sp ? App.spots.libType(sp) : (aUnePosition(e) ? App.spots.coordonnees(e.lat, e.lon) : tr('sans position'));
        return '<li>' +
          '<button type="button" class="ci-etape" data-i="voir" data-n="' + i + '"><span class="ci-n">' + (i + 1) + '</span>' +
          '<span class="ci-txt"><b>' + u.esc(nom) + '</b><small>' + u.esc(detail) + '</small></span></button>' +
          '<button type="button" class="ci-mini" data-i="monter" data-n="' + i + '" aria-label="' + u.esc(tr('Monter')) + '"' + (i === 0 ? ' disabled' : '') + '>' + u.ic('haut') + '</button>' +
          '<button type="button" class="ci-mini" data-i="descendre" data-n="' + i + '" aria-label="' + u.esc(tr('Descendre')) + '"' + (i === it.etapes.length - 1 ? ' disabled' : '') + '>' + u.ic('chevron') + '</button>' +
          '<button type="button" class="ci-mini" data-i="retirer" data-n="' + i + '" aria-label="' + u.esc(tr('Retirer')) + '">' + u.ic('x') + '</button>' +
          '</li>';
      }).join('');
      let morceaux = '';
      if (liens.length > 1 || (liens.length === 1 && pts.length - (it.depuisPosition ? 1 : 2) > 3)) {
        const parties = App.itineraires.liensGoogle(pts, it.mode, it.depuisPosition, liens.length > 1 ? 9 : 3);
        const nomPt = function (n) { return n === 0 ? tr('ma position') : String(n); };
        morceaux = '<div class="ci-morceaux"><p class="aide">' + tr(liens.length > 1
          ? /*tr*/'Google Maps accepte 9 étapes intermédiaires au plus : ouvre l’itinéraire en plusieurs parties.'
          : /*tr*/'Sur certains téléphones, Google Maps ne garde que 3 étapes intermédiaires. S’il en manque, ouvre-le en plusieurs parties :') + '</p>' +
          '<div class="ci-parties">' + parties.map(function (x) {
            return '<a class="btn btn-second btn-petit" href="' + x.url + '" target="_blank" rel="noopener">' + u.esc(nomPt(x.de) + ' → ' + nomPt(x.a)) + '</a>';
          }).join('') + '</div></div>';
      }
      itinEl.innerHTML = haut +
        '<div class="ci-options">' +
        '<div class="seg seg-petit" role="group" aria-label="' + u.esc(tr('Moyen de transport')) + '">' +
        '<button type="button" data-i="mode" data-mode="pied" aria-pressed="' + (it.mode !== 'voiture') + '">' + tr('À pied') + '</button>' +
        '<button type="button" data-i="mode" data-mode="voiture" aria-pressed="' + (it.mode === 'voiture') + '">' + tr('En voiture') + '</button></div>' +
        '<label class="ci-depart"><input type="checkbox" data-i="depart"' + (it.depuisPosition ? ' checked' : '') + '>' + tr('Partir de ma position') + '</label>' +
        '</div>' +
        (it.etapes.length
          ? '<ol class="ci-etapes">' + lignes + '</ol>'
          : '<p class="muet petit ci-vide">' + tr('Touche un spot puis « Ajouter à l’itinéraire », ou fais un appui long sur la carte pour ajouter un point.') + '</p>') +
        (pts.length
          ? '<div class="ci-actions">' + boutonGoogle +
            '<button type="button" class="btn btn-second btn-petit" data-i="enregistrer">' + u.ic(it.id ? 'crayon' : 'check') + tr(it.id ? /*tr*/'Renommer' : /*tr*/'Enregistrer') + '</button>' +
            '<button type="button" class="btn btn-second btn-petit" data-i="gpx">' + u.ic('telecharger') + 'GPX</button>' +
            '<button type="button" class="btn btn-second btn-petit" data-i="kml">' + u.ic('telecharger') + 'KML</button>' +
            '</div>' + morceaux +
            '<p class="aide">' + tr('Google Maps calcule le trajet (avec du réseau). Le fichier GPX s’ouvre dans Organic Maps ou OsmAnd pour être guidé sans réseau ; le KML s’importe dans Google My Maps, puis s’affiche dans Google Maps.') + '</p>'
          : '') +
        '<div class="ci-bas">' +
        '<button type="button" class="lien-btn" data-i="ouvrir">' + u.ic('liste') + tr('Mes itinéraires') + (c.itineraires.length ? ' (' + c.itineraires.length + ')' : '') + '</button>' +
        (it.etapes.length || it.id ? '<button type="button" class="lien-btn" data-i="nouveau">' + u.ic('plus') + tr('Nouvel itinéraire') + '</button>' : '') +
        '</div>';
    }

    itinEl.addEventListener('click', async function (ev) {
      const bt = ev.target.closest('[data-i]');
      if (!bt || bt.disabled) return;
      const a = bt.dataset.i, n = Number(bt.dataset.n);
      if (a === 'reduire') { reduit = !reduit; reduitAuto = false; placePourPanneau(); rendrePanneau(); }
      else if (a === 'fermer') { panneauOuvert = false; rendrePanneau(); }
      else if (a === 'mode') changer(function (x) { x.mode = bt.dataset.mode; });
      else if (a === 'monter' && n > 0) changer(function (x) { const e = x.etapes.splice(n, 1)[0]; x.etapes.splice(n - 1, 0, e); });
      else if (a === 'descendre' && n < it.etapes.length - 1) changer(function (x) { const e = x.etapes.splice(n, 1)[0]; x.etapes.splice(n + 1, 0, e); });
      else if (a === 'retirer') { changer(function (x) { x.etapes.splice(n, 1); }); if (selection) rafraichirFiche(); }
      else if (a === 'voir') {
        const e = it.etapes[n];
        const sp = e && e.spotId ? c.spotsParId.get(e.spotId) : null;
        const p = aUnePosition(sp) ? sp : e;
        if (aUnePosition(p)) carte.easeTo({ center: [p.lon, p.lat], zoom: Math.max(carte.getZoom(), 15) });
        if (sp && marqueurs.has(sp.id)) choisirSpot(sp.id);
      } else if (a === 'gpx' || a === 'kml') {
        App.itineraires.exporter(it, c, a);
      } else if (a === 'enregistrer') {
        const nom = await demanderNom(tr(it.id ? /*tr*/'Renommer l’itinéraire' : /*tr*/'Enregistrer l’itinéraire'), it.nom || '');
        if (nom === null || !el.isConnected) return;
        try {
          const r = await App.itineraires.enregistrer(Object.assign({}, it, { nom: nom }));
          it = r;
          App.itineraires.garderBrouillon(it);
          App.ui.toast(tr('Itinéraire enregistré : {nom}', { nom: r.nom }));
          c = await App.donnees.charger();
          rendrePanneau();
        } catch (e) {
          App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: e.message || e }), { erreur: true });
        }
      } else if (a === 'ouvrir') {
        const choisi = await choisirItineraire();
        c = await App.donnees.charger();
        if (!el.isConnected) return;
        // L'itinéraire affiché vient d'être supprimé : il redevient un brouillon non enregistré
        if (it.id && !c.itinerairesParId.has(it.id)) {
          it = Object.assign({}, it, { id: null, creeLe: undefined, modifieLe: undefined });
          App.itineraires.garderBrouillon(it);
        }
        if (choisi) {
          it = JSON.parse(JSON.stringify(choisi));
          App.itineraires.garderBrouillon(it);
          reduit = false;
          majItin();
          cadrer(App.itineraires.points(it, c));
        } else rendrePanneau();
      } else if (a === 'nouveau') {
        if (!it.id && it.etapes.length) {
          const ok = await App.ui.confirmer({ titre: tr('Effacer cet itinéraire ?'), texte: tr('Il n’est pas enregistré : ses étapes seront perdues.'), ok: tr('Effacer'), danger: true });
          if (!ok || !el.isConnected) return;
        }
        it = App.itineraires.nouveau();
        it.mode = App.itineraires.brouillon().mode || 'pied';
        App.itineraires.garderBrouillon(it);
        majItin();
        if (selection) rafraichirFiche();
      }
    });
    itinEl.addEventListener('change', function (ev) {
      if (ev.target.matches('[data-i="depart"]')) changer(function (x) { x.depuisPosition = ev.target.checked; });
    });

    /* ---------- Filtres ---------- */

    const PERIODES = [['tout', /*tr*/'Toutes les dates'], ['annee', /*tr*/'Cette année'], ['12m', /*tr*/'12 derniers mois'], ['30j', /*tr*/'30 derniers jours']];
    function ouvrirFiltres() {
      const d = document.getElementById('dlg-confirm');
      const nbSpots = c.spots.filter(aUnePosition).length;
      const sansPos = c.spots.length - nbSpots;
      const nbObs = c.obs.filter(aUnePosition).length;
      function rendre() {
        d.innerHTML = '<form method="dialog" class="dlg dlg-multi dlg-carte">' +
          '<h2>' + tr('Que montrer sur la carte') + '</h2>' +
          '<div class="choix-liste dlg-carte-corps">' +
          '<label class="choix"><input type="checkbox" data-filtre="spots"' + (filtres.spots ? ' checked' : '') + '><span class="choix-txt">' + tr('Mes spots') + '</span><span class="choix-n">' + nbSpots + '</span></label>' +
          '<label class="choix"><input type="checkbox" data-filtre="obs"' + (filtres.obs ? ' checked' : '') + '><span class="choix-txt">' + tr('Mes observations') + '</span><span class="choix-n">' + nbObs + '</span></label>' +
          (sansPos ? '<p class="aide dlg-carte-p">' + tr('{n} sans position : sur la page du spot, touche « Placer sur la carte ».', { n: u.pluriel(sansPos, 'spot') }) + '</p>' : '') +
          '<div class="champ dlg-carte-p"><label for="cf-periode">' + tr('Période') + '</label>' +
          '<select class="entree" id="cf-periode">' + PERIODES.map(function (p) {
            return '<option value="' + p[0] + '"' + (filtres.periode === p[0] ? ' selected' : '') + '>' + u.esc(tr(p[1])) + '</option>';
          }).join('') + '</select></div>' +
          '<div class="champ dlg-carte-p"><span class="etiq">' + tr('Espèce') + '</span><div class="cf-espece">' +
          '<button type="button" class="btn btn-second btn-petit" data-filtre="espece">' + u.ic('recherche') + u.esc(espece ? App.esp.nom(App.esp.get(espece)) : tr('Toutes les espèces')) + '</button>' +
          (espece ? '<button type="button" class="lien-btn" data-filtre="toutes">' + tr('Toutes les espèces') + '</button>' : '') + '</div></div>' +
          '<h3 class="dlg-carte-h">' + tr('Exporter mes spots') + '</h3>' +
          '<p class="aide dlg-carte-p">' + tr('Pour Google My Maps (KML) ou une appli de randonnée comme Organic Maps (GPX).') + '</p>' +
          '<div class="actions-fiche dlg-carte-p"><button type="button" class="btn btn-second btn-petit" data-filtre="kml"' + (nbSpots ? '' : ' disabled') + '>' + u.ic('telecharger') + 'KML</button>' +
          '<button type="button" class="btn btn-second btn-petit" data-filtre="gpx"' + (nbSpots ? '' : ' disabled') + '>' + u.ic('telecharger') + 'GPX</button></div>' +
          '<h3 class="dlg-carte-h">' + tr('Carte hors ligne') + '</h3>' +
          '<p class="aide dlg-carte-p">' + u.esc(tr(man.nom)) + ' · ' + u.taille(man.taille) + ' · ' + tr('données OpenStreetMap du {date}', { date: u.dateLongue(man.osm) }) + '</p>' +
          '<div class="dlg-carte-p"><button type="button" class="lien-btn lien-danger" data-filtre="supprimer">' + tr('Retirer la carte du téléphone') + '</button></div>' +
          '</div>' +
          '<div class="dlg-actions"><button value="ok" class="btn btn-prim">' + tr('OK') + '</button></div></form>';
      }
      function appliquer() {
        App.prefs.set('carteFiltres', { spots: filtres.spots, obs: filtres.obs, periode: filtres.periode });
        majSpots();
        majObs();
        majItin();
      }
      rendre();
      d.returnValue = '';
      d.onclose = function () { d.onclick = null; d.onchange = null; };
      d.onchange = function (ev) {
        const x = ev.target;
        if (x.dataset.filtre === 'spots') filtres.spots = x.checked;
        else if (x.dataset.filtre === 'obs') filtres.obs = x.checked;
        else if (x.id === 'cf-periode') filtres.periode = x.value;
        appliquer();
      };
      d.onclick = async function (ev) {
        const bt = ev.target.closest('button[data-filtre]');
        if (!bt) return;
        const a = bt.dataset.filtre;
        if (a === 'espece') {
          const id = await App.choisirEspece();
          if (id) { espece = id; appliquer(); rendre(); }
        } else if (a === 'toutes') { espece = null; appliquer(); rendre(); }
        else if (a === 'kml' || a === 'gpx') App.itineraires.exporterSpots(c, a);
        else if (a === 'supprimer') {
          if (bt.dataset.confirme !== '1') {
            bt.dataset.confirme = '1';
            bt.textContent = tr('Confirmer : retirer la carte ({taille})', { taille: u.taille(man.taille) });
            return;
          }
          d.close();
          await supprimerCarte();
          App.ui.toast(tr('Carte retirée du téléphone'));
          App.rafraichir();
        }
      };
      d.showModal();
    }

    /* ---------- Hors de la zone détaillée ---------- */

    const avis = document.createElement('div');
    avis.className = 'carte-avis';
    avis.hidden = true;
    avis.innerHTML = '<span>' + tr('Pas de détails ici : la carte couvre {zone}.', { zone: u.esc(tr(man.nom)) }) + '</span>' +
      '<button type="button" class="lien-btn" data-avis="revenir">' + tr('Y revenir') + '</button>';
    avis.querySelector('[data-avis]').addEventListener('click', function () {
      const z = man.zone;
      carte.fitBounds([[z[0], z[1]], [z[2], z[3]]], { padding: 20, duration: 600 });
    });
    hautEl.appendChild(avis);
    function verifierZone() {
      const z = Math.min(15, Math.floor(carte.getZoom()));
      const niv = (man.niveaux || []).find(function (n) { return z >= n.z[0] && z <= n.z[1]; });
      const bb = niv ? niv.bbox : man.bornes;
      const ctr = carte.getCenter();
      avis.hidden = ctr.lng >= bb[0] && ctr.lng <= bb[2] && ctr.lat >= bb[1] && ctr.lat <= bb[3];
    }

    // Nouvelle version de la carte disponible (l'ancienne reste affichée en attendant)
    if (!st.aJour) {
      const maj = document.createElement('div');
      maj.className = 'carte-maj';
      maj.innerHTML = '<p>' + u.ic('actualiser') + '<span>' + tr('Nouvelle carte disponible (données du {date}).', { date: u.dateCourte(M.osm) }) + '</span></p><div class="carte-maj-action"></div>';
      hautEl.appendChild(maj);
      brancherTelechargement(maj.querySelector('.carte-maj-action'), st, true);
    }

    /* ---------- Cadrage ---------- */

    function cadrer(pts) {
      if (!pts.length) return;
      if (pts.length === 1) { carte.easeTo({ center: [pts[0].lon, pts[0].lat], zoom: Math.max(carte.getZoom(), 14), duration: 0 }); return; }
      const bornes = new ml.LngLatBounds();
      pts.forEach(function (p) { bornes.extend([p.lon, p.lat]); });
      const h = carte.getContainer().clientHeight, l = carte.getContainer().clientWidth;
      carte.fitBounds(bornes, {
        padding: { top: Math.min(70, h * 0.15), bottom: Math.min(210, h * 0.35), left: Math.min(40, l * 0.1), right: Math.min(70, l * 0.15) },
        maxZoom: 15, duration: 0
      });
    }

    /* ---------- Gestes ---------- */

    let dernierAppui = 0;
    function appuiLong(ll) {
      if (Date.now() - dernierAppui < 900) return;
      dernierAppui = Date.now();
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) { /* sans vibreur */ } }
      const pt = { lat: arrondi(ll.lat), lon: arrondi(ll.lng) };
      if (placement) { placement.m.setLngLat([pt.lon, pt.lat]); return; }
      choisirPoint(pt);
      garderVisible(pt);
    }
    // Geste commencé sur un spot, une étape ou ma position : ce n'est pas un appui sur la carte
    function surMarqueur(e) {
      const t = e.originalEvent && e.originalEvent.target;
      return !!(t && t.closest && t.closest('.maplibregl-marker'));
    }
    carte.on('contextmenu', function (e) {
      if (e.originalEvent && e.originalEvent.cancelable) e.originalEvent.preventDefault();
      if (!surMarqueur(e)) appuiLong(e.lngLat);
    });
    let departAppui = null;
    carte.on('touchstart', function (e) {
      clearTimeout(minuteurAppui);
      if (!e.originalEvent || e.originalEvent.touches.length !== 1 || surMarqueur(e)) return;
      departAppui = e.point;
      const ll = e.lngLat;
      minuteurAppui = setTimeout(function () { appuiLong(ll); }, 600);
    });
    carte.on('touchmove', function (e) {
      if (!departAppui) return;
      const multi = e.originalEvent && e.originalEvent.touches.length > 1;
      if (multi || Math.abs(e.point.x - departAppui.x) > 9 || Math.abs(e.point.y - departAppui.y) > 9) clearTimeout(minuteurAppui);
    });
    carte.on('touchend', function () { clearTimeout(minuteurAppui); });
    carte.on('touchcancel', function () { clearTimeout(minuteurAppui); });
    carte.on('dragstart', function () { clearTimeout(minuteurAppui); });

    carte.on('click', function (e) {
      if (surMarqueur(e)) return;
      if (Date.now() - dernierAppui < 700) return; // fin d'un appui long
      if (placement) { placement.m.setLngLat(e.lngLat); return; }
      if (!carte.getLayer('c-obs-points')) return;
      const p = e.point, r = 12;
      const trouves = carte.queryRenderedFeatures([[p.x - r, p.y - r], [p.x + r, p.y + r]], { layers: ['c-obs-groupes', 'c-obs-points'] });
      const groupe = trouves.find(function (f) { return f.properties && f.properties.cluster; });
      if (groupe) {
        Promise.resolve(carte.getSource('c-obs').getClusterExpansionZoom(groupe.properties.cluster_id)).then(function (z) {
          carte.easeTo({ center: groupe.geometry.coordinates, zoom: Math.min((z || carte.getZoom() + 2) + 0.3, 17) });
        }, function () { carte.easeTo({ center: groupe.geometry.coordinates, zoom: carte.getZoom() + 2 }); });
        return;
      }
      const ids = Array.from(new Set(trouves.map(function (f) { return f.properties && f.properties.id; }).filter(Boolean)));
      if (ids.length) { choisirObs(ids); garderVisible(c.obsParId.get(ids[0])); return; }
      fermerFiche();
    });
    ['c-obs-groupes', 'c-obs-points'].forEach(function (id) {
      carte.on('mouseenter', id, function () { carte.getCanvas().style.cursor = 'pointer'; });
      carte.on('mouseleave', id, function () { carte.getCanvas().style.cursor = ''; });
    });
    const majZoom = function () { $('.carte-cadre').classList.toggle('zoom-loin', carte.getZoom() < 12.5); };
    carte.on('zoom', majZoom);
    carte.on('moveend', function () { garderVue(); verifierZone(); });

    el.querySelector('.carte-page').addEventListener('click', function (ev) {
      const bt = ev.target.closest('[data-c]');
      if (!bt) return;
      const a = bt.dataset.c;
      if (a === 'position') suivrePosition(true);
      else if (a === 'plus') carte.zoomIn();
      else if (a === 'moins') carte.zoomOut();
      else if (a === 'filtres') ouvrirFiltres();
      else if (a === 'itin') { panneauOuvert = !panneauOuvert || reduit; reduit = false; reduitAuto = false; placePourPanneau(); rendrePanneau(); }
    });

    carte.on('error', function (e) { console.warn('Carte :', e && e.error ? e.error : e); });

    /* ---------- Style chargé : nos couches s'ajoutent sans attendre tout le fond de carte ---------- */

    carte.once('style.load', function () {
      carte.addSource('c-zone', { type: 'geojson', data: rectangle(man.zone) });
      carte.addLayer({ id: 'c-zone', type: 'line', source: 'c-zone', minzoom: 7, paint: { 'line-color': coul.encre3, 'line-opacity': 0.5, 'line-width': 1.5, 'line-dasharray': [3, 2] } });
      carte.addSource('c-precision', { type: 'geojson', data: VIDE });
      carte.addLayer({ id: 'c-precision', type: 'fill', source: 'c-precision', paint: { 'fill-color': BLEU, 'fill-opacity': 0.12 } });
      carte.addLayer({ id: 'c-precision-bord', type: 'line', source: 'c-precision', paint: { 'line-color': BLEU, 'line-opacity': 0.45, 'line-width': 1 } });
      carte.addSource('c-itin', { type: 'geojson', data: VIDE });
      carte.addLayer({ id: 'c-itin', type: 'line', source: 'c-itin', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': coul.vert, 'line-width': 4, 'line-opacity': 0.85, 'line-dasharray': [0.2, 1.8] } });
      carte.addSource('c-obs', { type: 'geojson', data: VIDE, cluster: true, clusterRadius: 44, clusterMaxZoom: 14 });
      carte.addLayer({
        id: 'c-obs-groupes', type: 'circle', source: 'c-obs', filter: ['has', 'point_count'],
        paint: { 'circle-color': coul.ocre, 'circle-opacity': 0.92, 'circle-radius': ['step', ['get', 'point_count'], 14, 10, 17, 50, 21], 'circle-stroke-width': 2.5, 'circle-stroke-color': coul.fond }
      });
      carte.addLayer({
        id: 'c-obs-groupes-n', type: 'symbol', source: 'c-obs', filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Medium'], 'text-size': 13, 'text-allow-overlap': true, 'text-ignore-placement': true },
        paint: { 'text-color': coul.surOcre }
      });
      carte.addLayer({
        id: 'c-obs-points', type: 'circle', source: 'c-obs', filter: ['!', ['has', 'point_count']],
        paint: { 'circle-color': coul.ocre, 'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4.5, 15, 7.5], 'circle-stroke-width': 2, 'circle-stroke-color': coul.fond }
      });
      carte.addLayer({
        id: 'c-obs-choisie', type: 'circle', source: 'c-obs', filter: ['in', ['get', 'id'], ['literal', []]],
        paint: { 'circle-radius': 14, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 3, 'circle-stroke-color': coul.ocre }
      });
      const charge = $('#c-charge');
      if (charge) charge.remove();

      majSpots();
      majObs();
      majItin();
      dessinerMoi();
      majZoom();
      verifierZone();

      // Destination donnée par l'adresse
      if (route.type === 'spot' && c.spotsParId.has(route.id)) { choisirSpot(route.id); garderVisible(c.spotsParId.get(route.id)); }
      else if (route.type === 'obs' && c.obsParId.has(route.id)) { choisirObs([route.id]); garderVisible(c.obsParId.get(route.id)); }
      else if (route.type === 'placer' && c.spotsParId.has(route.id)) demarrerPlacement(c.spotsParId.get(route.id));
      else if (route.type === 'espece' && espece) {
        cadrer(obsVisibles().concat(spotsVisibles().filter(function (sp) { const x = statsSpots.get(sp.id); return x && x.especes.has(espece); })));
      } else if (route.type === 'itineraire') cadrer(App.itineraires.points(it, c));
      else if (!depart.gardee) cadrer(spotsVisibles().concat(obsVisibles()));

      if (!App.prefs.get('astuceCarte', false)) {
        App.prefs.set('astuceCarte', true);
        App.ui.toast(tr('Astuce : un appui long sur la carte crée un spot ou une étape d’itinéraire.'), { duree: 7000 });
      }
    });
  }

  App.carte = { etat: etat, telecharger: telecharger, supprimer: supprimerCarte };
})(window.App);
