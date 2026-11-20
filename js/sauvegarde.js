/* =====================================================================
   sauvegarde.js — export / import, CSV, stockage, réglages d'affichage
   Format .zip :
     carnet-oiseaux.json   toutes les données (observations, infos photos,
                           spots, perchoirs, cibles, itinéraires)
     observations.csv      le tableau des observations (partie 1)
     photos/…              les originaux, avec un nom clair
     apercus/…             les copies allégées (évite de tout recalculer)
     LISEZ-MOI.txt
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const FORMAT = 'carnet-oiseaux';
  const VERSION_FORMAT = 1;
  const LIMITE_PARTIE = 1024 * 1024 * 1024; // 1 Go par fichier .zip

  /* ---------- CSV (tableur) ---------- */
  function csv(obs, spotsParId) {
    // Titres des colonnes dans la langue de l'appli (data/traductions.js : « …||colonne CSV »)
    const entetes = ['date', 'heure', 'espece_fr', 'nom_latin', 'nom_bulgare', 'nom_anglais', 'groupe', 'nombre',
      'lieu', 'latitude', 'longitude', 'precision_m', 'comportement', 'meteo', 'temperature_c', 'notes', 'nb_photos', 'id_observation',
      'nb_sons', 'id_sortie', 'spot'].map(function (k) { return tr(k + '||colonne CSV'); });
    const q = function (v) {
      const s = v === null || v === undefined ? '' : String(v);
      return /[";\r\n]/.test(s) || s !== s.trim() ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lignes = [entetes.join(';')];
    obs.slice().sort(function (a, b) { return App.donnees.cleObs(a).localeCompare(App.donnees.cleObs(b)); })
      .forEach(function (o) {
        const e = App.esp.get(o.especeId);
        lignes.push([
          o.date, o.heure, e.fr, e.la, e.bg, e.en, App.lib.groupe(e.groupe), o.nombre,
          o.lieu, o.lat, o.lon, o.precision,
          (o.comportements || []).map(function (k) { return App.libelle(App.COMPORTEMENTS, k); }).join(', '),
          (o.meteo || []).map(function (k) { return App.libelle(App.METEOS, k); }).join(', '),
          o.temperature, o.notes, (o.photoIds || []).length, o.id,
          (o.sonIds || []).length, o.sortie ? o.sortie.id : '',
          o.spotId && spotsParId && spotsParId.get(o.spotId) ? spotsParId.get(o.spotId).nom : ''
        ].map(q).join(';'));
      });
    return '﻿' + lignes.join('\r\n') + '\r\n'; // BOM : Excel lit l'UTF-8 (cyrillique) correctement
  }

  // Coupe un paragraphe en lignes d'environ 76 caractères (fichier texte lisible partout)
  function couper(texte) {
    const lignes = [''];
    texte.split(' ').forEach(function (m) {
      const l = lignes[lignes.length - 1];
      if (l && (l + ' ' + m).length > 76) lignes.push(m);
      else lignes[lignes.length - 1] = l ? l + ' ' + m : m;
    });
    return lignes;
  }
  // Fichier LISEZ-MOI du .zip, dans la langue de l'appli
  function lisezMoi() {
    const fichier = function (nom, texte) { return '  ' + (nom + '  ').padEnd(21) + texte; };
    return [
      tr("CARNET D'OISEAUX — SAUVEGARDE"),
      '',
      tr('Contenu de ce fichier .zip :'),
      fichier('carnet-oiseaux.json', tr('tes observations, tes spots et les infos des photos')),
      fichier('observations.csv', tr('le tableau des observations (Excel, LibreOffice)')),
      fichier('photos/', tr('tes photos originales (nom : espece_date_identifiant)')),
      fichier('apercus/', tr('copies allégées utilisées par l’appli')),
      fichier('sons/', tr('tes enregistrements de chants et de cris')),
      ''
    ].concat(couper(tr('Pour restaurer : ouvre l’appli > Sauvegarde > Importer, et choisis ce fichier.')))
      .concat(couper(tr('L’import fusionne les données : rien n’est écrasé, la version la plus récente de chaque observation est gardée. Garde ce fichier en lieu sûr (PC, clé USB, cloud). Ne le modifie pas, sinon l’import pourrait échouer.')))
      .concat(['']).join('\r\n');
  }

  function extension(p) {
    const m = (p.nomOriginal || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    if (m) return m[1] === 'jpeg' ? 'jpg' : m[1];
    return /png/.test(p.type || '') ? 'png' : 'jpg';
  }
  function sansBlobs(p) {
    const m = Object.assign({}, p);
    delete m.original; delete m.affichage; delete m.miniature;
    return m;
  }
  function tailleBlobs(p) {
    return (p.original ? p.original.size : 0) + (p.affichage ? p.affichage.size : 0) + (p.miniature ? p.miniature.size : 0);
  }

  /* ---------- Export ---------- */
  async function preparer(type) {
    const c = await App.donnees.charger();
    const suppressions = await App.db.tout('suppressions');
    const instant = new Date().toISOString();
    const depuis = type === 'nouveautes' ? App.prefs.get('derniereSauvegardeISO', null) : null;
    let obs = c.obs, photos = c.photos, sons = c.sons, suppr = suppressions;
    let spots = c.spots, notes = Array.from(c.notesEspeces.values()), itineraires = c.itineraires;
    if (depuis) {
      obs = obs.filter(function (o) { return (o.modifieLe || '') > depuis; });
      spots = spots.filter(function (s) { return (s.modifieLe || '') > depuis; });
      itineraires = itineraires.filter(function (it) { return (it.modifieLe || '') > depuis; });
      notes = notes.filter(function (n) { return (n.modifieLe || '') > depuis; });
      photos = photos.filter(function (p) { return (p.modifieLe || p.creeLe || '') > depuis; });
      sons = sons.filter(function (s) { return (s.modifieLe || s.creeLe || '') > depuis; });
      suppr = suppr.filter(function (s) { return (s.le || '') > depuis; });
    }
    const items = photos.map(function (p) {
      const e = App.esp.get(p.especeId);
      const o = c.obsParId.get(p.observationId);
      const spot = p.spotId ? c.spotsParId.get(p.spotId) : null;
      const base = p.spotId
        ? 'spot_' + u.slug(spot ? spot.nom : 'spot') + '_' + (p.creeLe || '').slice(0, 10) + '_' + p.id.slice(-6)
        : u.slug(e.fr) + '_' + (o ? o.date : 'sans-date') + '_' + p.id.slice(-6);
      const fichiers = [];
      if (p.original) fichiers.push({ cle: 'original', nom: 'photos/' + base + '.' + extension(p), blob: p.original, crc: p.crc && p.crc.original });
      if (p.affichage) fichiers.push({ cle: 'affichage', nom: 'apercus/' + p.id + '_affichage.jpg', blob: p.affichage, crc: p.crc && p.crc.affichage });
      if (p.miniature) fichiers.push({ cle: 'miniature', nom: 'apercus/' + p.id + '_miniature.jpg', blob: p.miniature, crc: p.crc && p.crc.miniature });
      return { p: p, fichiers: fichiers, taille: tailleBlobs(p) };
    });
    const itemsSons = sons.filter(function (s) { return s.blob; }).map(function (s) {
      const e = App.esp.get(s.especeId);
      const o = c.obsParId.get(s.observationId);
      const nom = 'sons/' + u.slug(e.fr) + '_' + (o ? o.date : 'sans-date') + '_' + s.id.slice(-6) + '.' + App.sons.extension(s.type);
      return { son: s, fichiers: [{ cle: 'blob', nom: nom, blob: s.blob }], taille: s.blob.size };
    });
    const tous = items.concat(itemsSons);
    const parties = [[]];
    let courant = 0;
    tous.forEach(function (it) {
      if (courant + it.taille > LIMITE_PARTIE && parties[parties.length - 1].length) { parties.push([]); courant = 0; }
      parties[parties.length - 1].push(it);
      courant += it.taille;
    });
    const total = tous.reduce(function (s, it) { return s + it.taille; }, 0);
    return {
      c: c, type: depuis ? 'nouveautes' : 'complet', depuis: depuis, instant: instant, obs: obs, suppr: suppr,
      spots: spots, notes: notes, itineraires: itineraires,
      parties: parties, taille: total, nbPhotos: items.length, nbSons: itemsSons.length
    };
  }

  async function creerPartie(prep, index, surProgression) {
    const items = prep.parties[index];
    const donnees = {
      format: FORMAT, version: VERSION_FORMAT, appli: App.VERSION,
      exporteLe: prep.instant, type: prep.type, depuis: prep.depuis,
      partie: index + 1, parties: prep.parties.length,
      observations: prep.obs,
      photos: items.filter(function (it) { return it.p; }).map(function (it) {
        const m = sansBlobs(it.p);
        m.fichiers = {};
        it.fichiers.forEach(function (f) { m.fichiers[f.cle] = f.nom; });
        return m;
      }),
      sons: items.filter(function (it) { return it.son; }).map(function (it) {
        const m = Object.assign({}, it.son);
        delete m.blob;
        m.fichier = it.fichiers[0].nom;
        return m;
      }),
      cibles: App.cibles.liste(),
      spots: prep.spots,
      notesEspeces: prep.notes,
      itineraires: prep.itineraires,
      suppressions: prep.suppr
    };
    const entrees = [{ nom: 'carnet-oiseaux.json', donnees: JSON.stringify(donnees) }];
    if (index === 0) {
      entrees.push({ nom: 'observations.csv', donnees: csv(prep.obs, prep.c.spotsParId) });
      entrees.push({ nom: tr('LISEZ-MOI.txt'), donnees: lisezMoi() });
    }
    items.forEach(function (it) {
      it.fichiers.forEach(function (f) {
        entrees.push({ nom: f.nom, donnees: f.blob, crc: typeof f.crc === 'number' ? f.crc : undefined });
      });
    });
    return App.zip.creer(entrees, surProgression);
  }

  function nomZip(prep, index) {
    return 'carnet-oiseaux' + (prep.type === 'nouveautes' ? '_nouveautes' : '') + '_' + u.dateISO() +
      (prep.parties.length > 1 ? '_partie-' + (index + 1) + '-sur-' + prep.parties.length : '') + '.zip';
  }

  function marquerSauvegarde(prep) {
    App.prefs.set('derniereSauvegarde', Date.now());
    App.prefs.set('derniereSauvegardeISO', prep.instant);
    App.prefs.set('rappelPlusTard', 0);
  }

  /* ---------- Import (fusion) ---------- */
  async function fusionner(d, entrees, bilan, progression) {
    if (!d || d.format !== FORMAT) throw new Error(tr('Ce fichier n’est pas une sauvegarde du Carnet d’oiseaux.'));
    const locObs = new Map((await App.db.tout('observations')).map(function (o) { return [o.id, o]; }));
    const locPh = new Map((await App.db.tout('photos')).map(function (p) { return [p.id, p]; }));
    const locSup = new Map((await App.db.tout('suppressions')).map(function (s) { return [s.id, s]; }));
    const locSons = new Map((await App.db.tout('sons')).map(function (s) { return [s.id, s]; }));
    const locSpots = new Map((await App.db.tout('spots')).map(function (s) { return [s.id, s]; }));
    const locNotes = new Map((await App.db.tout('notesEspeces')).map(function (n) { return [n.id, n]; }));
    const locIti = new Map((await App.db.tout('itineraires')).map(function (it) { return [it.id, it]; }));
    const ops = [];

    (d.suppressions || []).forEach(function (s) {
      const connu = locSup.get(s.id);
      if (!connu || (connu.le || '') < (s.le || '')) { ops.push({ magasin: 'suppressions', mettre: s }); locSup.set(s.id, s); }
      if (s.type === 'observation') {
        const o = locObs.get(s.id);
        if (o && (o.modifieLe || '') <= s.le) { ops.push({ magasin: 'observations', effacer: s.id }); locObs.delete(s.id); bilan.supprimees++; }
      } else if (s.type === 'photo') {
        const p = locPh.get(s.id);
        if (p && (p.modifieLe || p.creeLe || '') <= s.le) { ops.push({ magasin: 'photos', effacer: s.id }); locPh.delete(s.id); App.photos.oublierUrl(s.id); }
      } else if (s.type === 'son') {
        const x = locSons.get(s.id);
        if (x && (x.modifieLe || x.creeLe || '') <= s.le) { ops.push({ magasin: 'sons', effacer: s.id }); locSons.delete(s.id); App.sons.oublierUrl(s.id); }
      } else if (s.type === 'spot') {
        const x = locSpots.get(s.id);
        if (x && (x.modifieLe || '') <= s.le) { ops.push({ magasin: 'spots', effacer: s.id }); locSpots.delete(s.id); }
      } else if (s.type === 'itineraire') {
        const x = locIti.get(s.id);
        if (x && (x.modifieLe || '') <= s.le) { ops.push({ magasin: 'itineraires', effacer: s.id }); locIti.delete(s.id); }
      }
    });

    // Spots (affûts, points d'observation) : la version la plus récente gagne
    (d.spots || []).forEach(function (s) {
      const sup = locSup.get(s.id);
      if (sup && (sup.le || '') >= (s.modifieLe || '')) return;
      const loc = locSpots.get(s.id);
      if (!loc || (s.modifieLe || '') > (loc.modifieLe || '')) {
        ops.push({ magasin: 'spots', mettre: s });
        bilan.spots = (bilan.spots || 0) + 1;
      }
    });
    // Perchoirs connus (une note par espèce)
    (d.notesEspeces || []).forEach(function (n) {
      const loc = locNotes.get(n.id);
      if (!loc || (n.modifieLe || '') > (loc.modifieLe || '')) ops.push({ magasin: 'notesEspeces', mettre: n });
    });
    // Itinéraires préparés sur la carte : la version la plus récente gagne
    (d.itineraires || []).forEach(function (it) {
      if (!it || !it.id || !Array.isArray(it.etapes)) return;
      const sup = locSup.get(it.id);
      if (sup && (sup.le || '') >= (it.modifieLe || '')) return;
      const loc = locIti.get(it.id);
      if (!loc || (it.modifieLe || '') > (loc.modifieLe || '')) {
        ops.push({ magasin: 'itineraires', mettre: it });
        bilan.itineraires = (bilan.itineraires || 0) + 1;
      }
    });

    (d.observations || []).forEach(function (o) {
      const sup = locSup.get(o.id);
      if (sup && (sup.le || '') >= (o.modifieLe || '')) { bilan.ignorees++; return; }
      const loc = locObs.get(o.id);
      if (!loc) { ops.push({ magasin: 'observations', mettre: o }); bilan.ajoutees++; }
      else if ((o.modifieLe || '') > (loc.modifieLe || '')) { ops.push({ magasin: 'observations', mettre: o }); bilan.misesAJour++; }
      else bilan.ignorees++;
    });
    await App.db.ecrire(ops);

    const photos = d.photos || [];
    for (let i = 0; i < photos.length; i++) {
      const m = photos[i];
      if (progression) progression(i, photos.length);
      const sup = locSup.get(m.id);
      if (sup && (sup.le || '') >= (m.modifieLe || m.creeLe || '')) { bilan.photosIgnorees++; continue; }
      const loc = locPh.get(m.id);
      if (loc && (m.modifieLe || '') <= (loc.modifieLe || '')) { bilan.photosIgnorees++; continue; }
      const rec = Object.assign({}, m);
      delete rec.fichiers;
      if (loc) {
        // Photo déjà présente : on met à jour ses infos (ex. couverture) sans recopier les fichiers
        rec.original = loc.original; rec.affichage = loc.affichage; rec.miniature = loc.miniature;
      } else {
        if (!entrees || !m.fichiers) { bilan.photosIgnorees++; continue; }
        for (const cle of ['original', 'affichage', 'miniature']) {
          const ent = m.fichiers[cle] && entrees.get(m.fichiers[cle]);
          rec[cle] = ent ? await ent.blob(cle === 'original' ? (m.type || 'image/jpeg') : 'image/jpeg') : null;
        }
        if (!rec.original) { bilan.erreurs.push(tr('Photo absente du .zip : {nom}', { nom: m.nomOriginal || m.id })); continue; }
        if (!rec.miniature || !rec.affichage) {
          const t = await App.photos.traiter(new File([rec.original], m.nomOriginal || 'photo.jpg', { type: m.type || 'image/jpeg' }));
          rec.affichage = rec.affichage || t.affichage;
          rec.miniature = rec.miniature || t.miniature;
          rec.crc = t.crc;
        }
      }
      await App.db.ecrire([{ magasin: 'photos', mettre: rec }]);
      bilan.photosAjoutees++;
    }
    if (progression) progression(photos.length, photos.length);

    // Sons (chants enregistrés)
    for (const m of (d.sons || [])) {
      const sup = locSup.get(m.id);
      if (sup && (sup.le || '') >= (m.modifieLe || m.creeLe || '')) continue;
      const loc = locSons.get(m.id);
      if (loc && (m.modifieLe || '') <= (loc.modifieLe || '')) continue;
      const rec = Object.assign({}, m);
      delete rec.fichier;
      if (loc) rec.blob = loc.blob;
      else {
        const ent = entrees && m.fichier ? entrees.get(m.fichier) : null;
        if (!ent) { if (entrees) bilan.erreurs.push(tr('Son absent du .zip : {nom}', { nom: m.nomOriginal || m.id })); continue; }
        rec.blob = await ent.blob(m.type || 'audio/webm');
      }
      await App.db.ecrire([{ magasin: 'sons', mettre: rec }]);
      bilan.sonsAjoutes = (bilan.sonsAjoutes || 0) + 1;
    }

    // Cibles : on ajoute celles de l'autre appareil
    if (Array.isArray(d.cibles)) App.cibles.fusionner(d.cibles);
  }

  async function importerFichier(f, bilan, progression) {
    const nom = (f.name || '').toLowerCase();
    if (/\.json$/.test(nom) || f.type === 'application/json') {
      let d;
      try { d = JSON.parse(await f.text()); } catch (e) { throw new Error(tr('{nom} : fichier .json illisible', { nom: f.name })); }
      await fusionner(d, null, bilan, progression);
    } else {
      const entrees = await App.zip.lire(f);
      const json = entrees.get('carnet-oiseaux.json');
      if (!json) throw new Error(tr('{nom} n’est pas une sauvegarde du Carnet d’oiseaux', { nom: f.name }));
      await fusionner(JSON.parse(await json.texte()), entrees, bilan, progression);
    }
  }

  /* ---------- Crédits des photos de référence (exigés par les licences) ---------- */
  function creditsPhotos() {
    const refs = window.PHOTOS_REF || {};
    const ids = App.esp.liste.map(function (e) { return e.id; }).filter(function (id) { return refs[id]; });
    if (!ids.length) return '';
    return '<details class="credits-photos"><summary>' + tr('Crédits des photos de référence ({n})', { n: ids.length }) + '</summary>' +
      '<p class="muet" style="margin:6px 0 0">' + tr('Photos libres de Wikimedia Commons, réduites et recadrées pour l’appli. Merci aux photographes !') + '</p>' +
      '<ul>' + ids.map(function (id) {
        return '<li><b>' + u.esc(App.esp.nom(App.esp.get(id))) + '</b> — ' + App.creditRef(App.photoRef(id)) + '</li>';
      }).join('') + '</ul></details>';
  }

  /* ---------- Écran ---------- */
  App.vue('sauvegarde', {
    afficher: async function (el) {
      const c = await App.donnees.charger();
      const derniere = App.prefs.get('derniereSauvegarde', 0);
      const derniereISO = App.prefs.get('derniereSauvegardeISO', null);
      let tailleTotale = 0;
      c.photos.forEach(function (p) { tailleTotale += tailleBlobs(p); });
      c.sons.forEach(function (s) { tailleTotale += s.blob ? s.blob.size : 0; });
      let nouv = { obs: 0, photos: 0, taille: 0 };
      if (derniereISO) {
        nouv.obs = c.obs.filter(function (o) { return (o.modifieLe || '') > derniereISO; }).length;
        nouv.spots = c.spots.filter(function (s) { return (s.modifieLe || '') > derniereISO; }).length;
        nouv.itineraires = c.itineraires.filter(function (it) { return (it.modifieLe || '') > derniereISO; }).length;
        c.photos.forEach(function (p) { if ((p.modifieLe || p.creeLe || '') > derniereISO) { nouv.photos++; nouv.taille += tailleBlobs(p); } });
      }
      const theme = App.theme.choix();
      const langue = App.langue();
      const nbVerif = App.esp.liste.filter(function (e) { return e.aVerifier; }).length;
      const partageFichiers = !!(navigator.canShare && window.File);

      const statut = derniere
        ? '<div class="encart statut-sauv statut-ok">' + u.ic('bouclier') + '<div><b>' + tr('Dernière sauvegarde : {quand}', { quand: u.depuis(derniere) }) + '</b><br><span class="muet petit">' + tr('le {date}', { date: u.dateLongue(u.dateISO(new Date(derniere))) }) + '</span></div></div>'
        : '<div class="encart statut-sauv statut-att">' + u.ic('alerte') + '<div><b>' + tr('Aucune sauvegarde pour l’instant') + '</b><br><span class="petit">' + tr('Tes données ne sont que sur cet appareil : fais une sauvegarde complète de temps en temps.') + '</span></div></div>';

      el.innerHTML =
        App.ui.entete({ titre: tr('Sauvegarde'), sous: tr('Tes données restent sur cet appareil, rien n’est envoyé sur Internet.') }) +
        '<section class="section" style="margin-top:10px">' + statut + '</section>' +

        '<section class="section"><h2>' + tr('Exporter') + '</h2>' +
        '<div class="grille-actions">' +
        '<button type="button" class="action-sauv prim" data-exp="complet">' + u.ic('sauvegarde') +
        '<div><strong>' + tr('Sauvegarde complète (.zip)') + '</strong><span>' + u.pluriel(c.obs.length, 'observation') + ', ' + u.pluriel(c.photos.length, 'photo') + ' ' + tr('(originaux compris)') +
        (c.sons.length ? ', ' + u.pluriel(c.sons.length, 'son') : '') + ' · ≈ ' + u.taille(tailleTotale) + '</span></div></button>' +
        (derniereISO
          ? '<button type="button" class="action-sauv" data-exp="nouveautes">' + u.ic('actualiser') +
            '<div><strong>' + tr('Nouveautés seulement (.zip)') + '</strong><span>' + tr('{a} : {b}', { a: tr('Depuis le {date}', { date: u.dateCourte(derniereISO.slice(0, 10)) }), b: u.pluriel(nouv.obs, 'observation') + ', ' + u.pluriel(nouv.photos, 'photo') + (nouv.spots ? ', ' + u.pluriel(nouv.spots, 'spot') : '') + (nouv.itineraires ? ', ' + u.pluriel(nouv.itineraires, 'itinéraire') : '') }) + ' · ≈ ' + u.taille(nouv.taille) + '</span></div></button>'
          : '') +
        '<button type="button" class="action-sauv" data-exp="json">' + u.ic('fichier') +
        '<div><strong>' + tr('Données seules (.json)') + '</strong><span>' + tr('Observations sans les photos, très léger') + '</span></div></button>' +
        '<button type="button" class="action-sauv" data-exp="csv">' + u.ic('tableur') +
        '<div><strong>' + tr('Tableau des observations (.csv)') + '</strong><span>' + tr('Pour ton inventaire Smokinya · s’ouvre dans Excel ou LibreOffice') + '</span></div></button>' +
        '</div>' +
        '<div id="exp-etat" aria-live="polite"></div></section>' +

        '<section class="section"><h2>' + tr('Importer') + '</h2>' +
        '<p class="muet petit">' + tr('Récupère une sauvegarde faite sur un autre appareil (téléphone ↔ PC). Les données sont fusionnées : rien n’est écrasé, la version la plus récente de chaque observation est gardée.') + '</p>' +
        '<label class="action-sauv" style="cursor:pointer">' + u.ic('importer') +
        '<div><strong>' + tr('Choisir un fichier .zip ou .json') + '</strong><span>' + tr('Tu peux sélectionner plusieurs parties à la fois') + '</span></div>' +
        '<input type="file" id="imp" accept=".zip,.json,application/zip,application/json" multiple hidden></label>' +
        '<div id="imp-etat" aria-live="polite"></div></section>' +

        '<section class="section"><h2>' + tr('Stockage sur cet appareil') + '</h2><div class="encart" id="stockage"><span class="muet">' + tr('Calcul…') + '</span></div></section>' +

        '<section class="section"><h2>' + tr('Affichage') + '</h2><div class="encart">' +
        '<div class="reglage"><div class="r-txt"><b>' + tr('Thème') + '</b><span>' + tr('Clair, sombre ou comme le téléphone') + '</span></div>' +
        '<div class="seg" role="group" aria-label="' + u.esc(tr('Thème')) + '">' +
        [['auto', /*tr*/'Auto'], ['light', /*tr*/'Clair'], ['dark', /*tr*/'Sombre']].map(function (t) {
          return '<button type="button" data-theme-choix="' + t[0] + '" aria-pressed="' + (theme === t[0]) + '">' + tr(t[1]) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="reglage"><div class="r-txt"><b>' + tr("Langue de l'appli") + '</b><span>' + tr('Toute l’appli · les noms d’oiseaux restent en 3 langues') + '</span></div>' +
        '<div class="seg" role="group" aria-label="' + u.esc(tr("Langue de l'appli")) + '">' +
        [['fr', 'Français'], ['bg', 'Български'], ['en', 'English']].map(function (l) {
          return '<button type="button" data-langue-choix="' + l[0] + '" aria-pressed="' + (langue === l[0]) + '">' + l[1] + '</button>';
        }).join('') + '</div></div>' +
        '</div></section>' +

        '<section class="section"><h2>' + tr('À propos') + '</h2><div class="encart petit">' +
        '<p><b>' + tr("Carnet d'oiseaux") + '</b> · ' + tr('version {v}', { v: App.VERSION }) + '</p>' +
        '<p>' + tr('Catalogue : {n} espèces de Bulgarie (Sredna Gora, plaines de Thrace), dont {v} avec une information à vérifier (badge « ? »). Le catalogue se corrige dans le fichier {fichier}.', {
          n: App.esp.liste.length, v: nbVerif, fichier: '<code>data/especes.js</code>'
        }) + '</p>' +
        '<p class="muet" style="margin:0 0 10px">' + tr('Statuts UICN : Liste rouge mondiale. Noms bulgares : à confirmer avec un guide local en cas de doute.') + '</p>' +
        creditsPhotos() +
        '</div></section>';

      const etatExp = el.querySelector('#exp-etat');
      const etatImp = el.querySelector('#imp-etat');

      function barre(pct) { return '<div class="barre-chargement"><span style="width:' + Math.round(pct) + '%"></span></div>'; }

      async function proposerPartage(blob, nom) {
        if (!partageFichiers) return '';
        try {
          const f = new File([blob], nom, { type: blob.type || 'application/octet-stream' });
          if (!navigator.canShare({ files: [f] })) return '';
          etatExp._partage = f;
          return ' <button type="button" class="btn btn-second btn-petit" data-partager>' + u.ic('externe') + tr('Partager (Drive, e-mail…)') + '</button>';
        } catch (e) { return ''; }
      }

      async function exporterZip(type) {
        etatExp.innerHTML = '<p class="journal-import"><span class="rond-charge"></span> ' + tr('Préparation de la sauvegarde…') + '</p>';
        const prep = await preparer(type);
        if (type === 'nouveautes' && !prep.obs.length && !prep.nbPhotos && !prep.nbSons && !prep.suppr.length) {
          etatExp.innerHTML = '<p class="journal-import">' + tr('Rien de nouveau depuis ta dernière sauvegarde.') + '</p>';
          return;
        }
        if (prep.parties.length === 1) {
          const blob = await creerPartie(prep, 0, function (i, n) {
            etatExp.innerHTML = '<p class="journal-import">' + tr('Création du fichier…') + ' ' + i + ' / ' + n + '</p>' + barre(i / n * 100);
          });
          const nom = nomZip(prep, 0);
          App.telechargerBlob(blob, nom);
          marquerSauvegarde(prep);
          etatExp.innerHTML = '<div class="bandeau bandeau-info"><div class="txt">' + u.ic('check') +
            '<span>' + tr('{fichier} ({taille}) est dans tes téléchargements. Copie-le sur ton PC, une clé USB ou un cloud.', { fichier: '<b>' + u.esc(nom) + '</b>', taille: u.taille(blob.size) }) + '</span></div></div>' +
            '<p>' + (await proposerPartage(blob, nom)) + '</p>';
        } else {
          const faites = new Set();
          etatExp.innerHTML = '<div class="bandeau bandeau-info"><div class="txt">' + u.ic('info') +
            '<span>' + tr('Sauvegarde volumineuse ({taille}) : elle est découpée en {n} fichiers. Télécharge-les tous, puis importe-les ensemble sur l’autre appareil.', { taille: u.taille(prep.taille), n: prep.parties.length }) + '</span></div></div>' +
            '<div class="parties">' + prep.parties.map(function (p, i) {
              const t = p.reduce(function (s, it) { return s + it.taille; }, 0);
              return '<button type="button" class="btn btn-second" data-partie="' + i + '">' + u.ic('telecharger') + tr('Partie {i} / {n}', { i: i + 1, n: prep.parties.length }) + ' · ' + u.taille(t) + '</button>';
            }).join('') + '</div><div id="exp-prog"></div>';
          etatExp.querySelectorAll('[data-partie]').forEach(function (b) {
            b.addEventListener('click', async function () {
              const i = Number(b.dataset.partie);
              b.classList.add('occupe');
              const prog = etatExp.querySelector('#exp-prog');
              const blob = await creerPartie(prep, i, function (k, n) { prog.innerHTML = barre(k / n * 100); });
              App.telechargerBlob(blob, nomZip(prep, i));
              prog.innerHTML = '';
              b.classList.remove('occupe');
              b.innerHTML = u.ic('check') + tr('Partie {i} téléchargée', { i: i + 1 });
              faites.add(i);
              if (faites.size === prep.parties.length) {
                marquerSauvegarde(prep);
                App.ui.toast(tr('Sauvegarde terminée'));
              }
            });
          });
        }
      }

      el.querySelectorAll('[data-exp]').forEach(function (b) {
        b.addEventListener('click', async function () {
          const type = b.dataset.exp;
          el.querySelectorAll('[data-exp]').forEach(function (x) { x.disabled = true; });
          try {
            if (type === 'complet' || type === 'nouveautes') {
              await exporterZip(type);
            } else if (type === 'json') {
              const suppressions = await App.db.tout('suppressions');
              const d = { format: FORMAT, version: VERSION_FORMAT, appli: App.VERSION, exporteLe: new Date().toISOString(), type: 'donnees', observations: c.obs, photos: [], sons: [], cibles: App.cibles.liste(), spots: c.spots, notesEspeces: Array.from(c.notesEspeces.values()), itineraires: c.itineraires, suppressions: suppressions };
              const nom = 'carnet-oiseaux_donnees_' + u.dateISO() + '.json';
              const blob = new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' });
              App.telechargerBlob(blob, nom);
              etatExp.innerHTML = '<p class="journal-import">' + u.ic('check') + ' ' + tr('{fichier} téléchargé (sans les photos).', { fichier: u.esc(nom) }) + (await proposerPartage(blob, nom)) + '</p>';
            } else if (type === 'csv') {
              const nom = 'observations_' + u.dateISO() + '.csv';
              const blob = new Blob([csv(c.obs, c.spotsParId)], { type: 'text/csv;charset=utf-8' });
              App.telechargerBlob(blob, nom);
              etatExp.innerHTML = '<p class="journal-import">' + u.ic('check') + ' ' + tr('{fichier} téléchargé : {lignes}, séparateur « ; ».', { fichier: u.esc(nom), lignes: u.pluriel(c.obs.length, 'ligne') }) + (await proposerPartage(blob, nom)) + '</p>';
            }
          } catch (e) {
            console.error(e);
            etatExp.innerHTML = '<p class="erreur-champ">' + tr('Export impossible : {erreur}', { erreur: u.esc(e.message || e) }) + '</p>';
          } finally {
            el.querySelectorAll('[data-exp]').forEach(function (x) { x.disabled = false; });
          }
        });
      });

      etatExp.addEventListener('click', async function (ev) {
        if (!ev.target.closest('[data-partager]') || !etatExp._partage) return;
        try { await navigator.share({ files: [etatExp._partage], title: etatExp._partage.name }); }
        catch (e) { if (e.name !== 'AbortError') App.ui.toast(tr('Partage impossible : {erreur}', { erreur: e.message }), { erreur: true }); }
      });

      el.querySelector('#imp').addEventListener('change', async function () {
        const fichiers = Array.from(this.files || []);
        this.value = '';
        if (!fichiers.length) return;
        // Les parties dans l'ordre (partie 1 d'abord)
        fichiers.sort(function (a, b) { return a.name.localeCompare(b.name, 'fr', { numeric: true }); });
        const bilan = { ajoutees: 0, misesAJour: 0, ignorees: 0, supprimees: 0, photosAjoutees: 0, photosIgnorees: 0, sonsAjoutes: 0, erreurs: [] };
        for (let k = 0; k < fichiers.length; k++) {
          const f = fichiers[k];
          etatImp.innerHTML = '<p class="journal-import"><span class="rond-charge"></span> ' + tr('Lecture de {fichier}…', { fichier: u.esc(f.name) }) + '</p>';
          try {
            await importerFichier(f, bilan, function (i, n) {
              etatImp.innerHTML = '<p class="journal-import">' + tr('{fichier} : photos {i} / {n}', { fichier: u.esc(f.name), i: i, n: n }) + '</p>' + barre(n ? i / n * 100 : 100);
            });
          } catch (e) {
            console.error(e);
            const plein = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
            bilan.erreurs.push(plein ? tr('Stockage plein pendant l’import de {fichier}', { fichier: f.name }) : (e.message || String(e)));
          }
        }
        etatImp.innerHTML = '<div class="bandeau ' + (bilan.erreurs.length ? '' : 'bandeau-info') + '"><div class="txt">' + u.ic(bilan.erreurs.length ? 'alerte' : 'check') +
          '<span>' + tr('Import terminé : {bilan}.', { bilan: u.pluriel(bilan.ajoutees, 'observation ajoutée', 'observations ajoutées') + ', ' +
          u.pluriel(bilan.misesAJour, 'mise à jour', 'mises à jour') + ', ' +
          u.pluriel(bilan.photosAjoutees, 'photo ajoutée', 'photos ajoutées') +
          (bilan.sonsAjoutes ? ', ' + u.pluriel(bilan.sonsAjoutes, 'son ajouté', 'sons ajoutés') : '') +
          (bilan.spots ? ', ' + u.pluriel(bilan.spots, 'spot ajouté ou mis à jour', 'spots ajoutés ou mis à jour') : '') +
          (bilan.itineraires ? ', ' + u.pluriel(bilan.itineraires, 'itinéraire ajouté ou mis à jour', 'itinéraires ajoutés ou mis à jour') : '') +
          (bilan.ignorees ? ' · ' + tr('{n} déjà à jour', { n: bilan.ignorees }) : '') +
          (bilan.supprimees ? ' · ' + u.pluriel(bilan.supprimees, 'supprimée', 'supprimées') : '') }) + '</span></div></div>' +
          (bilan.erreurs.length ? '<ul class="erreur-champ">' + bilan.erreurs.map(function (x) { return '<li>' + u.esc(x) + '</li>'; }).join('') + '</ul>' : '') +
          '<p><a class="btn btn-doux btn-petit" href="#/observations">' + tr('Voir mes observations') + '</a></p>';
        App.demanderPersistance();
      });

      el.querySelectorAll('[data-theme-choix]').forEach(function (b) {
        b.addEventListener('click', function () {
          App.theme.definir(b.dataset.themeChoix);
          el.querySelectorAll('[data-theme-choix]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        });
      });
      el.querySelectorAll('[data-langue-choix]').forEach(function (b) {
        b.addEventListener('click', function () {
          App.prefs.set('langue', b.dataset.langueChoix);
          if (App.majTextes) App.majTextes();
          App.rafraichir();
        });
      });

      // Stockage
      (async function () {
        const zone = el.querySelector('#stockage');
        let html = '';
        try {
          if (navigator.storage && navigator.storage.estimate) {
            const est = await navigator.storage.estimate();
            html += '<p><b>' + tr('Utilisé par l’appli :') + '</b> ' + u.taille(est.usage || 0) +
              (est.quota ? ' · <b>' + tr('Disponible :') + '</b> ≈ ' + u.taille(Math.max(0, est.quota - (est.usage || 0))) : '') + '</p>';
          }
          const protege = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false;
          html += protege
            ? '<p class="statut-ok" style="margin:0;display:flex;gap:8px;align-items:center">' + u.ic('bouclier') + '<b>' + tr('Stockage protégé :') + '</b>&nbsp;' + tr('le navigateur ne l’effacera pas pour gagner de la place.') + '</p>'
            : '<p style="margin:0 0 10px">' + tr('Le stockage n’est pas encore « protégé » : en cas de manque de place, le navigateur pourrait l’effacer. Installer l’appli sur l’écran d’accueil aide beaucoup.') + '</p>' +
              '<button type="button" class="btn btn-doux btn-petit" id="proteger">' + u.ic('bouclier') + tr('Protéger mes données') + '</button>';
        } catch (e) { html = '<p class="muet">' + tr('Informations de stockage indisponibles.') + '</p>'; }
        zone.innerHTML = html;
        const b = zone.querySelector('#proteger');
        if (b) b.addEventListener('click', async function () {
          const ok = await App.demanderPersistance();
          App.ui.toast(ok ? tr('Stockage protégé') : tr('Le navigateur refuse pour l’instant : installe l’appli, puis réessaie'), { erreur: !ok });
          if (ok) App.rafraichir();
        });
      })();
    }
  });

  App.sauvegarde = { csv: csv, preparer: preparer, creerPartie: creerPartie, importerFichier: importerFichier };
})(window.App);
