/* =====================================================================
   observations.js — Rubrique 2 : mes observations
   - Formulaire d'ajout / modification (espèce, date, lieu + GPS, nombre,
     comportement, météo, notes, photos)
   - Liste : accordéon par espèce (mobile), galerie (PC), journal
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;

  function lienCarte(lat, lon) {
    return 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=15/' + lat + '/' + lon;
  }
  function coordonnees(lat, lon) {
    return Math.abs(lat).toFixed(5).replace('.', ',') + (lat >= 0 ? ' N' : ' S') + ' · ' +
      Math.abs(lon).toFixed(5).replace('.', ',') + (lon >= 0 ? ' E' : ' O');
  }
  function aUnePosition(o) { return o.lat !== null && o.lat !== undefined && o.lon !== null && o.lon !== undefined; }

  /* =================================================================
     Rendu partagé (utilisé aussi par la fiche espèce)
     ================================================================= */
  App.rendu = {
    // Vignette de photo avec bouton de téléchargement
    tuile: function (photo, obs, opts) {
      opts = opts || {};
      const e = App.esp.get(photo.especeId);
      const img = photo.miniature
        ? '<img src="' + App.photos.url(photo, 'miniature') + '" alt="' + u.esc(App.esp.nom(e)) + '" loading="lazy" decoding="async">'
        : '<span class="sans-apercu">Aperçu indisponible</span>';
      return '<div class="tuile">' +
        '<button type="button" class="tuile-img" data-ph="' + photo.id + '" aria-label="Agrandir la photo">' + img + '</button>' +
        '<button type="button" class="dl" data-dl="' + photo.id + '" aria-label="Télécharger l’original" title="Télécharger l’original">' + u.ic('telecharger') + '</button>' +
        (photo.favori ? '<span class="fav-marque" title="Photo de couverture">' + u.ic('etoile') + '</span>' : '') +
        '<div class="tuile-leg">' +
        (opts.sansEspece ? '' : '<b>' + u.esc(App.esp.nom(e)) + '</b>') +
        '<small>' + u.dateCourte(obs.date) + (obs.lieu ? ' · ' + u.esc(obs.lieu) : '') + '</small>' +
        '</div></div>';
    },

    // Carte d'une observation (journal, fiche espèce)
    carteObs: function (o, c, opts) {
      opts = opts || {};
      const e = App.esp.get(o.especeId);
      const photos = App.donnees.photosDe(c, o);
      const meta = [];
      if (!opts.sansEspece) meta.push('<span>' + u.ic('calendrier') + u.dateCourte(o.date) + '</span>');
      if (o.lieu || aUnePosition(o)) {
        meta.push('<span>' + u.ic('epingle') + (o.lieu ? u.esc(o.lieu) : 'Position GPS') +
          (aUnePosition(o) ? ' <a href="' + lienCarte(o.lat, o.lon) + '" target="_blank" rel="noopener" title="Voir sur la carte (connexion nécessaire)" aria-label="Voir sur la carte">' + u.ic('carte') + '</a>' : '') +
          '</span>');
      }
      meta.push('<span>' + u.pluriel(o.nombre || 1, 'individu') + '</span>');
      if ((o.meteo && o.meteo.length) || (o.temperature !== null && o.temperature !== undefined && o.temperature !== '')) {
        const icone = o.meteo && o.meteo.length ? (App.METEOS.find(function (m) { return m[0] === o.meteo[0]; }) || [0, 0, 'soleil'])[2] : 'soleil';
        meta.push('<span>' + u.ic(icone) +
          (o.meteo || []).map(function (m) { return App.libelle(App.METEOS, m); }).join(', ') +
          (o.temperature !== null && o.temperature !== undefined && o.temperature !== '' ? (o.meteo && o.meteo.length ? ' · ' : '') + String(o.temperature).replace('.', ',') + ' °C' : '') +
          '</span>');
      }
      const comportements = (o.comportements || []).map(function (k) {
        return '<span class="tag">' + u.esc(App.libelle(App.COMPORTEMENTS, k)) + '</span>';
      }).join('');
      return '<article class="carte-obs">' +
        '<div class="obs-haut">' +
        (opts.sansEspece
          ? '<span class="obs-esp">' + u.dateLongue(o.date) + '</span>'
          : '<a class="obs-esp" href="#/espece/' + encodeURIComponent(o.especeId) + '">' + u.esc(App.esp.nom(e)) + '</a>') +
        '<span class="obs-heure">' + u.esc(o.heure || '') + '</span>' +
        '</div>' +
        '<div class="obs-meta">' + meta.join('') + '</div>' +
        (comportements ? '<div class="tags">' + comportements + '</div>' : '') +
        (o.notes ? '<p class="obs-notes">' + u.esc(o.notes) + '</p>' : '') +
        (photos.length ? '<div class="mini-bande">' + photos.map(function (p) {
          return '<button type="button" data-ph="' + p.id + '" aria-label="Agrandir la photo">' +
            (p.miniature ? '<img src="' + App.photos.url(p, 'miniature') + '" alt="" loading="lazy" decoding="async">' : '') + '</button>';
        }).join('') + '</div>' : '') +
        '<div class="obs-actions">' +
        '<a class="btn btn-second btn-petit" href="#/modifier/' + encodeURIComponent(o.id) + '">' + u.ic('crayon') + 'Modifier</a>' +
        '<button type="button" class="btn btn-danger-doux btn-petit" data-suppr="' + o.id + '">' + u.ic('poubelle') + 'Supprimer</button>' +
        '</div></article>';
    },

    // Clics communs : agrandir une photo, télécharger, supprimer une observation.
    // fournisseur : liste [{photo, obs}] ou fonction(photoId) qui la renvoie
    brancher: function (el, fournisseur) {
      el.addEventListener('click', async function (ev) {
        const ph = ev.target.closest('[data-ph]');
        if (ph) {
          ev.preventDefault();
          const id = ph.dataset.ph;
          let liste = typeof fournisseur === 'function' ? fournisseur(id) : fournisseur;
          let i = (liste || []).findIndex(function (x) { return x.photo.id === id; });
          if (i === -1) {
            const c = await App.donnees.charger();
            const p = c.photosParId.get(id);
            const o = p && c.obsParId.get(p.observationId);
            if (!o) return;
            liste = App.donnees.photosDe(c, o).map(function (x) { return { photo: x, obs: o }; });
            i = liste.findIndex(function (x) { return x.photo.id === id; });
          }
          App.photos.ouvrir(liste, i);
          return;
        }
        const dl = ev.target.closest('[data-dl]');
        if (dl) {
          const c = await App.donnees.charger();
          const p = c.photosParId.get(dl.dataset.dl);
          if (p) App.photos.telecharger(p);
          return;
        }
        const s = ev.target.closest('[data-suppr]');
        if (s) {
          const ok = await App.ui.confirmer({
            titre: 'Supprimer cette observation ?',
            texte: 'L’observation et ses photos seront effacées de cet appareil. Cette action est définitive.',
            ok: 'Supprimer', danger: true
          });
          if (!ok) return;
          try {
            await App.donnees.supprimerObservation(s.dataset.suppr);
            App.ui.toast('Observation supprimée');
            App.rafraichir();
          } catch (e) { App.ui.toast('Suppression impossible : ' + e.message, { erreur: true }); }
        }
      });
    }
  };

  /* =================================================================
     Liste « Mes observations »
     ================================================================= */
  let filtreObs = '';

  App.vue('observations', {
    garderPosition: true,

    afficher: async function (el) {
      const c = await App.donnees.charger();
      const resume = await App.donnees.resume();
      const rappel = await App.ui.rappelSauvegarde();
      const langue = App.langue();
      let nbPhotos = 0;
      resume.forEach(function (r) { nbPhotos += r.photos.length; });

      if (!c.obs.length) {
        el.innerHTML = App.ui.entete({ titre: 'Mes observations' }) +
          '<div class="vide"><svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>' +
          '<h2>Ton carnet t’attend</h2>' +
          '<p>Ajoute ta première observation : l’espèce, le lieu, le nombre d’individus et tes photos.</p>' +
          '<a class="btn btn-prim" href="#/ajouter">' + u.ic('plus') + 'Première observation</a></div>';
        return;
      }

      const surPC = window.matchMedia('(min-width: 900px)').matches;
      let mode = App.prefs.get('modeObs', '') || (surPC ? 'galerie' : 'especes');
      const MODES = [['especes', 'Espèces', 'couches'], ['galerie', 'Galerie', 'grille'], ['journal', 'Journal', 'liste']];

      el.innerHTML =
        App.ui.entete({
          titre: 'Mes observations',
          sous: u.pluriel(resume.size, 'espèce') + ' · ' + u.pluriel(c.obs.length, 'observation') + ' · ' + u.pluriel(nbPhotos, 'photo')
        }) + rappel +
        '<div class="outils-obs">' +
        '<div class="seg" role="group" aria-label="Type d’affichage">' +
        MODES.map(function (m) {
          return '<button type="button" data-mode="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + u.ic(m[2]) + m[1] + '</button>';
        }).join('') + '</div>' +
        '<label class="recherche" style="flex:1 1 220px;height:50px">' + u.ic('recherche') +
        '<span class="sr-only">Filtrer par espèce</span>' +
        '<input type="search" id="obs-q" placeholder="Filtrer par espèce…" autocomplete="off" value="' + u.esc(filtreObs) + '"></label>' +
        '</div>' +
        '<div id="obs-contenu"></div>';

      const zone = el.querySelector('#obs-contenu');
      let photosGalerie = [];

      function rendre() {
        const f = App.esp.filtre(filtreObs);
        const garde = function (id) { return f(App.esp.get(id)); };
        let html = '';

        if (mode === 'especes') {
          const ids = Array.from(resume.keys()).filter(garde);
          ids.sort(function (a, b) {
            return App.donnees.cleObs(resume.get(b).derniere).localeCompare(App.donnees.cleObs(resume.get(a).derniere));
          });
          html = ids.length ? '<div class="acc">' + ids.map(function (id) {
            const r = resume.get(id);
            const e = App.esp.get(id);
            return '<details class="acc-item" data-esp="' + u.esc(id) + '">' +
              '<summary>' + App.ui.vignette(r.couverture) +
              '<div class="acc-txt"><div class="acc-nom">' + u.esc(App.esp.nom(e, langue)) + '</div>' +
              '<div class="acc-info">' + u.pluriel(r.nb, 'obs.', 'obs.') + ' · ' + u.pluriel(r.photos.length, 'photo') +
              ' · ' + u.dateCourte(r.derniere.date) + '</div></div>' +
              u.ic('chevron', 'chev') + '</summary>' +
              '<div class="acc-corps"></div></details>';
          }).join('') + '</div>' : '';
        } else if (mode === 'galerie') {
          photosGalerie = [];
          c.obs.forEach(function (o) {
            if (!garde(o.especeId)) return;
            App.donnees.photosDe(c, o).forEach(function (p) { photosGalerie.push({ photo: p, obs: o }); });
          });
          const groupes = [];
          photosGalerie.forEach(function (x) {
            const cle = (x.obs.date || '').slice(0, 7);
            let g = groupes[groupes.length - 1];
            if (!g || g.cle !== cle) { g = { cle: cle, items: [] }; groupes.push(g); }
            g.items.push(x);
          });
          html = groupes.map(function (g) {
            const p = g.cle.split('-').map(Number);
            const titre = u.MOIS[p[1] - 1] + ' ' + p[0];
            return '<h2 class="mois-titre">' + titre.charAt(0).toUpperCase() + titre.slice(1) + '</h2>' +
              '<div class="galerie">' + g.items.map(function (x) { return App.rendu.tuile(x.photo, x.obs); }).join('') + '</div>';
          }).join('');
          if (!html && !filtreObs) {
            html = '<div class="vide"><h2>Pas encore de photo</h2><p>Ajoute des photos à tes observations : elles apparaîtront ici en galerie.</p></div>';
          }
        } else {
          const obs = c.obs.filter(function (o) { return garde(o.especeId); });
          let jour = null;
          html = '<div class="journal">' + obs.map(function (o) {
            let titre = '';
            if (o.date !== jour) { jour = o.date; titre = '<h2 class="jour-titre">' + u.esc(u.jourSemaine(o.date)) + '</h2>'; }
            return titre + App.rendu.carteObs(o, c);
          }).join('') + '</div>';
          if (!obs.length) html = '';
        }

        zone.innerHTML = html || '<div class="vide"><h2>Rien à afficher</h2><p>Aucune observation ne correspond à « ' + u.esc(filtreObs) + ' ».</p></div>';

        // Accordéon : contenu préparé à la première ouverture
        zone.querySelectorAll('details.acc-item').forEach(function (d) {
          d.addEventListener('toggle', function () {
            if (!d.open || d.dataset.pret) return;
            d.dataset.pret = '1';
            const id = d.dataset.esp;
            const r = resume.get(id);
            d.querySelector('.acc-corps').innerHTML =
              (r.photos.length
                ? '<div class="bande">' + r.photos.map(function (x) { return App.rendu.tuile(x.photo, x.obs, { sansEspece: true }); }).join('') + '</div>'
                : '<p class="muet petit">Pas de photo pour cette espèce.</p>') +
              '<ul class="acc-obs">' + r.obs.map(function (o) {
                return '<li><span class="q">' + u.dateCourte(o.date) + (o.heure ? ' · ' + u.esc(o.heure) : '') +
                  (o.lieu ? ' · ' + u.esc(o.lieu) : '') + ' · ' + u.pluriel(o.nombre || 1, 'ind.', 'ind.') + '</span>' +
                  '<a class="btn btn-second btn-petit" href="#/modifier/' + encodeURIComponent(o.id) + '" aria-label="Modifier l’observation du ' + u.dateLongue(o.date) + '">' + u.ic('crayon') + '</a></li>';
              }).join('') + '</ul>' +
              '<div class="acc-pied">' +
              '<a class="lien-btn" href="#/espece/' + encodeURIComponent(id) + '">Voir la fiche complète</a>' +
              '<a class="btn btn-doux btn-petit" href="#/ajouter/' + encodeURIComponent(id) + '">' + u.ic('plus') + 'Nouvelle obs.</a>' +
              '</div>';
          });
        });
      }

      el.querySelectorAll('[data-mode]').forEach(function (b) {
        b.addEventListener('click', function () {
          mode = b.dataset.mode;
          App.prefs.set('modeObs', mode);
          el.querySelectorAll('[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          rendre();
        });
      });
      const champ = el.querySelector('#obs-q');
      champ.addEventListener('input', u.debounce(function () { filtreObs = champ.value; rendre(); }, 120));

      App.rendu.brancher(el, function (photoId) {
        if (mode === 'galerie') return photosGalerie;
        const p = c.photosParId.get(photoId);
        if (!p) return [];
        if (mode === 'especes') { const r = resume.get(p.especeId); return r ? r.photos : []; }
        return null; // journal : les photos de l'observation
      });

      rendre();
    }
  });

  /* =================================================================
     Choix de l'espèce (fenêtre avec recherche)
     ================================================================= */
  async function choisirEspece() {
    const d = document.getElementById('dlg-espece');
    const resume = await App.donnees.resume();
    const langue = App.langue();
    const col = App.collator(langue);
    const toutes = App.esp.liste.slice().sort(function (a, b) { return col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue)); });
    const recentes = Array.from(resume.keys())
      .filter(App.esp.existe)
      .sort(function (a, b) { return App.donnees.cleObs(resume.get(b).derniere).localeCompare(App.donnees.cleObs(resume.get(a).derniere)); })
      .slice(0, 8)
      .map(App.esp.get);

    d.innerHTML =
      '<div class="feuille-haut">' +
      '<label class="recherche">' + u.ic('recherche') + '<span class="sr-only">Rechercher une espèce</span>' +
      '<input type="search" placeholder="Nom français, bulgare, anglais, latin…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></label>' +
      '<button type="button" class="btn-icone" data-fermer aria-label="Fermer">' + u.ic('x') + '</button>' +
      '</div><div class="feuille-liste"></div>';
    const champ = d.querySelector('input');
    const zone = d.querySelector('.feuille-liste');

    function option(e) {
      const r = resume.get(e.id);
      return '<button type="button" class="option-esp" data-id="' + u.esc(e.id) + '">' + App.ui.vignette(r && r.couverture) +
        '<span class="oe-txt"><span class="oe-nom">' + u.esc(App.esp.nom(e, langue)) + (r ? ' <span class="tag tag-ok">✓</span>' : '') + '</span>' +
        '<span class="oe-autre" style="display:block">' + u.esc(App.esp.autresNoms(e, langue).join(' · ')) + ' · <i>' + u.esc(e.la) + '</i></span></span></button>';
    }
    function rendre() {
      const q = champ.value;
      if (!u.norm(q)) {
        zone.innerHTML = (recentes.length ? '<h3>Observées récemment</h3>' + recentes.map(option).join('') : '') +
          '<h3>Toutes les espèces</h3>' + toutes.map(option).join('');
      } else {
        const f = App.esp.filtre(q);
        const res = toutes.filter(f);
        zone.innerHTML = res.length ? res.map(option).join('')
          : '<div class="vide" style="padding:24px 8px"><p>Aucune espèce ne correspond. Vérifie l’orthographe, ou ajoute l’espèce dans <code>data/especes.js</code>.</p></div>';
      }
    }
    champ.addEventListener('input', u.debounce(rendre, 60));
    champ.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const premier = zone.querySelector('[data-id]');
        if (premier) d.close(premier.dataset.id);
      }
    });
    rendre();

    return new Promise(function (resoudre) {
      d.onclick = function (ev) {
        if (ev.target.closest('[data-fermer]')) { d.close(''); return; }
        const b = ev.target.closest('[data-id]');
        if (b) d.close(b.dataset.id);
      };
      d.addEventListener('close', function () { resoudre(d.returnValue || null); }, { once: true });
      d.returnValue = '';
      d.showModal();
      zone.scrollTop = 0;
      if (window.matchMedia('(hover: hover)').matches) champ.focus();
    });
  }

  /* =================================================================
     Formulaire d'observation (ajout et modification)
     ================================================================= */
  async function formulaire(el, o, especeInitiale) {
    const c = await App.donnees.charger();
    const resume = await App.donnees.resume();
    const langue = App.langue();
    const etat = {
      especeId: o ? o.especeId : (especeInitiale && App.esp.existe(especeInitiale) ? especeInitiale : ''),
      lat: o && aUnePosition(o) ? o.lat : null,
      lon: o && aUnePosition(o) ? o.lon : null,
      precision: o ? (o.precision || null) : null,
      comportements: o ? (o.comportements || []).slice() : [],
      meteo: o ? (o.meteo || []).slice() : [],
      photosGardees: o ? App.donnees.photosDe(c, o) : [],
      photosRetirees: [],
      nouvelles: []
    };
    let file = Promise.resolve();
    let dateTouchee = !!o;
    let exifApplique = false;
    App.formulaireModifie = false;

    const lieux = [];
    c.obs.forEach(function (x) { if (x.lieu && lieux.indexOf(x.lieu) === -1 && lieux.length < 40) lieux.push(x.lieu); });

    el.innerHTML =
      App.ui.entete({
        titre: o ? 'Modifier l’observation' : 'Nouvelle observation',
        retour: o ? '#/espece/' + encodeURIComponent(o.especeId) : '#/catalogue',
        sansOutils: true
      }) +
      '<form class="form" id="form-obs" novalidate>' +
      '<div class="champ"><span class="etiq" id="lbl-espece">Espèce</span>' +
      '<button type="button" class="choix-espece" id="f-espece"></button>' +
      '<span class="erreur-champ" id="err-espece" hidden>Choisis d’abord une espèce.</span></div>' +

      '<div class="ligne-2">' +
      '<div class="champ"><label for="f-date">Date</label><input type="date" class="entree" id="f-date" required value="' + (o ? o.date : u.dateISO()) + '"></div>' +
      '<div class="champ"><label for="f-heure">Heure</label><input type="time" class="entree" id="f-heure" value="' + (o ? u.esc(o.heure || '') : u.heureHM()) + '"></div>' +
      '</div>' +

      '<div class="champ"><label for="f-lieu">Lieu</label>' +
      '<div class="ligne-lieu"><input type="text" class="entree" id="f-lieu" list="lieux-connus" autocomplete="off" placeholder="Rivière Stryama, sortie du village…" value="' + u.esc(o ? o.lieu || '' : '') + '">' +
      '<button type="button" class="btn btn-doux btn-gps" id="f-gps" title="Utiliser le GPS du téléphone">' + u.ic('position') + 'Ma position</button></div>' +
      '<datalist id="lieux-connus">' + lieux.map(function (l) { return '<option value="' + u.esc(l) + '">'; }).join('') + '</datalist>' +
      '<div class="gps-info" id="f-gps-info"></div></div>' +

      '<div class="champ"><label for="f-nombre">Nombre d’individus</label>' +
      '<div class="stepper"><button type="button" data-pas="-1" aria-label="Un individu de moins">−</button>' +
      '<input type="number" class="entree" id="f-nombre" min="1" step="1" inputmode="numeric" value="' + (o ? (o.nombre || 1) : 1) + '">' +
      '<button type="button" data-pas="1" aria-label="Un individu de plus">+</button></div></div>' +

      '<div class="champ"><span class="etiq">Comportement</span><div class="puces" id="f-comp" role="group" aria-label="Comportement">' +
      App.COMPORTEMENTS.map(function (k) {
        const on = etat.comportements.indexOf(k[0]) !== -1;
        return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-comp="' + k[0] + '" aria-pressed="' + on + '">' + u.esc(k[1]) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="champ"><span class="etiq">Météo</span><div class="puces" id="f-meteo" role="group" aria-label="Météo">' +
      App.METEOS.map(function (k) {
        const on = etat.meteo.indexOf(k[0]) !== -1;
        return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-meteo="' + k[0] + '" aria-pressed="' + on + '">' + u.ic(k[2]) + u.esc(k[1]) + '</button>';
      }).join('') + '</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-top:4px"><label for="f-temp" class="petit muet">Température (°C, facultatif)</label>' +
      '<input type="number" class="entree" id="f-temp" inputmode="decimal" step="0.5" style="width:110px" value="' +
      (o && o.temperature !== null && o.temperature !== undefined ? u.esc(o.temperature) : '') + '"></div></div>' +

      '<div class="champ"><label for="f-notes">Notes</label>' +
      '<textarea class="entree" id="f-notes" placeholder="Plumage, chant, comportement, réglages photo…">' + u.esc(o ? o.notes || '' : '') + '</textarea></div>' +

      '<div class="champ"><span class="etiq">Photos</span>' +
      '<div class="boutons-photo">' +
      '<label class="btn btn-second">' + u.ic('photo') + 'Appareil photo<input type="file" id="f-cam" accept="image/*" capture="environment" hidden></label>' +
      '<label class="btn btn-second">' + u.ic('galerie') + 'Galerie<input type="file" id="f-gal" accept="image/*" multiple hidden></label>' +
      '</div>' +
      '<p class="aide">L’original est gardé intact pour le téléchargement ; une copie allégée sert à l’affichage. Si la photo contient sa date ou sa position (EXIF), je les reprends.</p>' +
      '<div class="photos-form" id="f-photos"></div></div>' +

      (o ? '<div class="zone-danger"><button type="button" class="btn btn-danger-doux" id="f-suppr">' + u.ic('poubelle') + 'Supprimer cette observation</button></div>' : '') +
      '</form>' +
      '<div class="barre-enreg">' +
      '<a class="btn btn-second" href="' + (o ? '#/espece/' + encodeURIComponent(o.especeId) : '#/catalogue') + '" data-action="retour">Annuler</a>' +
      '<button type="button" class="btn btn-prim" id="f-enreg">' + u.ic('check') + 'Enregistrer</button>' +
      '</div>';

    const $ = function (s) { return el.querySelector(s); };
    const champDate = $('#f-date'), champHeure = $('#f-heure'), champLieu = $('#f-lieu');
    const champNombre = $('#f-nombre'), champTemp = $('#f-temp'), champNotes = $('#f-notes');
    const infoGps = $('#f-gps-info'), zonePhotos = $('#f-photos'), btnEnreg = $('#f-enreg');

    function modifie() { App.formulaireModifie = true; }
    App.garde = function () {
      return !App.formulaireModifie || window.confirm('Quitter sans enregistrer cette observation ?');
    };
    App.surNettoyage(function () {
      App.formulaireModifie = false;
      etat.nouvelles.forEach(function (n) { if (n.url) URL.revokeObjectURL(n.url); });
    });

    // --- Espèce
    function majEspece() {
      const b = $('#f-espece');
      b.setAttribute('aria-label', etat.especeId
        ? 'Espèce : ' + App.esp.nom(App.esp.get(etat.especeId), langue) + ' (changer)'
        : 'Choisir l’espèce');
      if (!etat.especeId) {
        b.classList.add('vide-choix');
        b.innerHTML = u.ic('recherche') + '<span class="ce-txt"><span class="ce-nom">Choisir l’espèce…</span><span class="ce-autre" style="display:block">Recherche par nom français, bulgare, anglais ou latin</span></span>';
        return;
      }
      const e = App.esp.get(etat.especeId);
      const r = resume.get(etat.especeId);
      b.classList.remove('vide-choix');
      b.innerHTML = App.ui.vignette(r && r.couverture) +
        '<span class="ce-txt"><span class="ce-nom" style="display:block">' + u.esc(App.esp.nom(e, langue)) + '</span>' +
        '<span class="ce-autre" style="display:block">' + u.esc(App.esp.autresNoms(e, langue).join(' · ')) + '</span></span>' +
        '<span class="lien-btn">Changer</span>';
      $('#err-espece').hidden = true;
    }
    $('#f-espece').addEventListener('click', async function () {
      const id = await choisirEspece();
      if (id && id !== etat.especeId) { etat.especeId = id; modifie(); majEspece(); }
    });
    majEspece();

    // --- Date, lieu, notes…
    [champDate, champHeure].forEach(function (ch) { ch.addEventListener('input', function () { dateTouchee = true; modifie(); }); });
    [champLieu, champNombre, champTemp, champNotes].forEach(function (ch) { ch.addEventListener('input', modifie); });

    // --- GPS
    function majGps() {
      if (etat.lat === null) { infoGps.innerHTML = ''; return; }
      infoGps.innerHTML = u.ic('epingle') + '<span>' + coordonnees(etat.lat, etat.lon) +
        (etat.precision ? ' (± ' + etat.precision + ' m)' : '') + (etat.sourceGps === 'photo' ? ' · d’après la photo' : '') + '</span>' +
        '<a class="lien-btn" href="' + lienCarte(etat.lat, etat.lon) + '" target="_blank" rel="noopener">Voir la carte</a>' +
        '<button type="button" class="lien-btn" id="f-gps-effacer">Effacer</button>';
      $('#f-gps-effacer').addEventListener('click', function () {
        etat.lat = etat.lon = etat.precision = null; modifie(); majGps();
      });
    }
    $('#f-gps').addEventListener('click', function () {
      if (!navigator.geolocation) { App.ui.toast('GPS non disponible sur cet appareil', { erreur: true }); return; }
      infoGps.innerHTML = '<span class="rond-charge" aria-hidden="true"></span><span>Recherche de ta position… (à découvert, c’est plus rapide)</span>';
      navigator.geolocation.getCurrentPosition(function (pos) {
        etat.lat = Math.round(pos.coords.latitude * 1e6) / 1e6;
        etat.lon = Math.round(pos.coords.longitude * 1e6) / 1e6;
        etat.precision = Math.round(pos.coords.accuracy);
        etat.sourceGps = 'gps';
        modifie();
        majGps();
      }, function (err) {
        infoGps.innerHTML = '<span class="erreur-champ">' + (err.code === 1
          ? 'Accès à la position refusé : autorise-le dans les réglages du navigateur.'
          : 'Position introuvable pour l’instant. Réessaie à découvert.') + '</span>';
      }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 });
    });
    majGps();

    // --- Nombre
    el.querySelectorAll('[data-pas]').forEach(function (b) {
      b.addEventListener('click', function () {
        const n = Math.max(1, (parseInt(champNombre.value, 10) || 1) + Number(b.dataset.pas));
        champNombre.value = n;
        modifie();
      });
    });

    // --- Puces comportement / météo
    function bascule(liste, cle, bouton) {
      const i = liste.indexOf(cle);
      if (i === -1) liste.push(cle); else liste.splice(i, 1);
      bouton.classList.toggle('on', i === -1);
      bouton.setAttribute('aria-pressed', String(i === -1));
      modifie();
    }
    $('#f-comp').addEventListener('click', function (ev) {
      const b = ev.target.closest('[data-comp]'); if (b) bascule(etat.comportements, b.dataset.comp, b);
    });
    $('#f-meteo').addEventListener('click', function (ev) {
      const b = ev.target.closest('[data-meteo]'); if (b) bascule(etat.meteo, b.dataset.meteo, b);
    });

    // --- Photos
    function rendrePhotos() {
      zonePhotos.innerHTML =
        etat.photosGardees.map(function (p) {
          return '<div class="photo-form">' + (p.miniature ? '<img src="' + App.photos.url(p, 'miniature') + '" alt="">' : '<div class="etat">Aperçu indisponible</div>') +
            '<button type="button" class="suppr" data-retirer-ex="' + p.id + '" aria-label="Retirer cette photo">' + u.ic('x') + '</button></div>';
        }).join('') +
        etat.nouvelles.map(function (n) {
          let contenu;
          if (n.res && n.res.miniature) {
            if (!n.url) n.url = URL.createObjectURL(n.res.miniature);
            contenu = '<img src="' + n.url + '" alt="">';
          } else if (n.res || n.erreur) {
            contenu = '<div class="etat">Aperçu impossible<br>(l’original sera gardé)</div>';
          } else {
            contenu = '<div class="etat"><span class="rond-charge" aria-label="Traitement en cours"></span></div>';
          }
          return '<div class="photo-form">' + contenu +
            '<button type="button" class="suppr" data-retirer-nv="' + n.cle + '" aria-label="Retirer cette photo">' + u.ic('x') + '</button></div>';
        }).join('');
    }
    function appliquerExif(exif) {
      if (!exif) return;
      const msgs = [];
      if (exif.date && !dateTouchee && !exifApplique) {
        champDate.value = exif.date;
        if (exif.heure) champHeure.value = exif.heure;
        exifApplique = true;
        msgs.push('date et heure');
      }
      if (exif.lat !== undefined && etat.lat === null) {
        etat.lat = exif.lat; etat.lon = exif.lon; etat.precision = null; etat.sourceGps = 'photo';
        majGps();
        msgs.push('position');
      }
      if (msgs.length) App.ui.toast('Reprises de la photo : ' + msgs.join(' et '));
    }
    function ajouterFichiers(fichiers) {
      Array.from(fichiers || []).forEach(function (f) {
        if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|heic|heif|gif|avif)$/i.test(f.name)) {
          App.ui.toast('« ' + f.name + ' » n’est pas une image', { erreur: true });
          return;
        }
        const n = { cle: u.uid('n'), fichier: f, res: null, erreur: null, url: null };
        etat.nouvelles.push(n);
        file = file.then(function () { return App.photos.traiter(f); })
          .then(function (res) { n.res = res; appliquerExif(res.exif); })
          .catch(function (e) { n.erreur = e; })
          .then(rendrePhotos);
      });
      modifie();
      rendrePhotos();
    }
    $('#f-cam').addEventListener('change', function () { ajouterFichiers(this.files); this.value = ''; });
    $('#f-gal').addEventListener('change', function () { ajouterFichiers(this.files); this.value = ''; });
    zonePhotos.addEventListener('click', function (ev) {
      const ex = ev.target.closest('[data-retirer-ex]');
      if (ex) {
        const id = ex.dataset.retirerEx;
        etat.photosGardees = etat.photosGardees.filter(function (p) { return p.id !== id; });
        etat.photosRetirees.push(id);
        modifie(); rendrePhotos();
        return;
      }
      const nv = ev.target.closest('[data-retirer-nv]');
      if (nv) {
        const cle = nv.dataset.retirerNv;
        etat.nouvelles = etat.nouvelles.filter(function (n) {
          if (n.cle === cle && n.url) URL.revokeObjectURL(n.url);
          return n.cle !== cle;
        });
        rendrePhotos();
      }
    });
    rendrePhotos();

    // --- Suppression (en modification)
    if (o) {
      $('#f-suppr').addEventListener('click', async function () {
        const ok = await App.ui.confirmer({
          titre: 'Supprimer cette observation ?',
          texte: 'L’observation et ses photos seront effacées de cet appareil. Cette action est définitive.',
          ok: 'Supprimer', danger: true
        });
        if (!ok) return;
        await App.donnees.supprimerObservation(o.id);
        App.formulaireModifie = false;
        App.ui.toast('Observation supprimée');
        location.replace('#/observations');
      });
    }

    // --- Enregistrement
    async function enregistrer() {
      if (!etat.especeId) {
        $('#err-espece').hidden = false;
        $('#f-espece').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      btnEnreg.classList.add('occupe');
      btnEnreg.innerHTML = '<span class="rond-charge" aria-hidden="true"></span>' +
        (etat.nouvelles.some(function (n) { return !n.res && !n.erreur; }) ? 'Traitement des photos…' : 'Enregistrement…');
      try {
        await file;
        const maintenant = new Date().toISOString();
        const id = o ? o.id : u.uid('obs');
        const nouvelles = etat.nouvelles.map(function (n) {
          const r = n.res || { original: n.fichier, nomOriginal: n.fichier.name, type: n.fichier.type, taille: n.fichier.size, exif: {} };
          return {
            id: u.uid('ph'), observationId: id, especeId: etat.especeId,
            nomOriginal: r.nomOriginal || n.fichier.name || 'photo.jpg', type: r.type || 'image/jpeg', taille: r.taille || n.fichier.size,
            largeur: r.largeur || null, hauteur: r.hauteur || null,
            dateExif: r.exif && r.exif.date ? r.exif.date + 'T' + (r.exif.heure || '00:00') : null,
            original: r.original, affichage: r.affichage || null, miniature: r.miniature || null,
            crc: r.crc || null, favori: false, creeLe: maintenant, modifieLe: maintenant
          };
        });
        const temp = champTemp.value.trim() === '' ? null : Number(champTemp.value.replace(',', '.'));
        const obs = {
          id: id,
          especeId: etat.especeId,
          date: champDate.value || u.dateISO(),
          heure: champHeure.value || '',
          lieu: champLieu.value.trim(),
          lat: etat.lat, lon: etat.lon, precision: etat.precision,
          nombre: Math.max(1, parseInt(champNombre.value, 10) || 1),
          comportements: etat.comportements.slice(),
          meteo: etat.meteo.slice(),
          temperature: temp !== null && isFinite(temp) ? temp : null,
          notes: champNotes.value.trim(),
          photoIds: etat.photosGardees.map(function (p) { return p.id; }).concat(nouvelles.map(function (p) { return p.id; })),
          creeLe: o ? o.creeLe : maintenant,
          modifieLe: maintenant
        };
        const ops = [{ magasin: 'observations', mettre: obs }];
        nouvelles.forEach(function (p) { ops.push({ magasin: 'photos', mettre: p }); });
        etat.photosRetirees.forEach(function (pid) {
          ops.push({ magasin: 'photos', effacer: pid });
          ops.push({ magasin: 'suppressions', mettre: { id: pid, type: 'photo', le: maintenant } });
          App.photos.oublierUrl(pid);
        });
        if (o && o.especeId !== etat.especeId) {
          etat.photosGardees.forEach(function (p) {
            ops.push({ magasin: 'photos', mettre: Object.assign({}, p, { especeId: etat.especeId, favori: false, modifieLe: maintenant }) });
          });
        }
        await App.db.ecrire(ops);
        App.formulaireModifie = false;
        App.garde = null;
        App.demanderPersistance();
        App.ui.toast(o ? 'Observation modifiée' : 'Observation enregistrée', {
          action: o ? null : 'Nouvelle', surAction: function () { App.aller('#/ajouter'); }
        });
        location.replace('#/espece/' + encodeURIComponent(obs.especeId));
      } catch (e) {
        console.error(e);
        const plein = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
        App.ui.toast(plein
          ? 'Stockage plein : exporte une sauvegarde puis supprime des photos anciennes.'
          : 'Enregistrement impossible : ' + (e && e.message ? e.message : e), { erreur: true });
        btnEnreg.classList.remove('occupe');
        btnEnreg.innerHTML = u.ic('check') + 'Enregistrer';
      }
    }
    btnEnreg.addEventListener('click', enregistrer);
    $('#form-obs').addEventListener('submit', function (ev) { ev.preventDefault(); enregistrer(); });
  }

  App.vue('ajouter', {
    onglet: 'ajouter',
    afficher: function (el, params) { return formulaire(el, null, params[0]); }
  });

  App.vue('modifier', {
    onglet: 'observations',
    afficher: async function (el, params) {
      const c = await App.donnees.charger();
      const o = c.obsParId.get(params[0]);
      if (!o) {
        el.innerHTML = App.ui.entete({ titre: 'Observation introuvable', retour: '#/observations' }) +
          '<div class="vide"><p>Cette observation n’existe plus (supprimée ou pas encore importée sur cet appareil).</p>' +
          '<a class="btn btn-prim" href="#/observations">Mes observations</a></div>';
        return;
      }
      return formulaire(el, o, null);
    }
  });
})(window.App);
