/* =====================================================================
   observations.js — Rubrique 2 : mes observations
   - Formulaire d'ajout / modification (espèce, date, lieu + GPS, nombre,
     comportement, météo, notes, photos)
   - Liste : accordéon par espèce (mobile), galerie (PC), journal
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;

  function lienCarte(lat, lon) {
    return 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=15/' + lat + '/' + lon;
  }
  function coordonnees(lat, lon) {
    return u.decimal(Math.abs(lat), 5) + ' ' + (lat >= 0 ? tr('N||latitude nord') : tr('S||latitude sud')) + ' · ' +
      u.decimal(Math.abs(lon), 5) + ' ' + (lon >= 0 ? tr('E||longitude est') : tr('O||longitude ouest'));
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
        : '<span class="sans-apercu">' + tr('Aperçu indisponible') + '</span>';
      return '<div class="tuile">' +
        '<button type="button" class="tuile-img" data-ph="' + photo.id + '" aria-label="' + u.esc(tr('Agrandir la photo')) + '">' + img + '</button>' +
        '<button type="button" class="dl" data-dl="' + photo.id + '" aria-label="' + u.esc(tr('Télécharger l’original')) + '" title="' + u.esc(tr('Télécharger l’original')) + '">' + u.ic('telecharger') + '</button>' +
        (photo.favori ? '<span class="fav-marque" title="' + u.esc(tr('Photo de couverture')) + '">' + u.ic('etoile') + '</span>' : '') +
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
      // Spot (lien vers sa page) ; le lieu n'est répété que s'il diffère du nom du spot
      const spot = o.spotId && c.spotsParId ? c.spotsParId.get(o.spotId) : null;
      const lieuPropre = !!o.lieu && (!spot || o.lieu !== spot.nom);
      const lienGps = aUnePosition(o) ? ' <a href="' + lienCarte(o.lat, o.lon) + '" target="_blank" rel="noopener" title="' + u.esc(tr('Voir sur la carte (connexion nécessaire)')) + '" aria-label="' + u.esc(tr('Voir sur la carte')) + '">' + u.ic('carte') + '</a>' : '';
      if (spot) {
        meta.push('<span>' + u.ic(App.spots.icone(spot)) + '<a class="lien-spot" href="#/spot/' + encodeURIComponent(spot.id) + '" title="' + u.esc(tr('Voir le spot')) + '">' + u.esc(spot.nom) + '</a>' + (lieuPropre ? '' : lienGps) + '</span>');
      }
      if (lieuPropre || (!spot && aUnePosition(o))) {
        meta.push('<span>' + u.ic('epingle') + (o.lieu ? u.esc(o.lieu) : tr('Position GPS')) + lienGps + '</span>');
      }
      meta.push('<span>' + u.pluriel(o.nombre || 1, 'individu') + '</span>');
      if (o.sortie) meta.push('<span>' + u.ic('chemin') + tr('Sortie') + '</span>');
      const sons = App.donnees.sonsDe(c, o);
      if ((o.meteo && o.meteo.length) || (o.temperature !== null && o.temperature !== undefined && o.temperature !== '')) {
        const icone = o.meteo && o.meteo.length ? (App.METEOS.find(function (m) { return m[0] === o.meteo[0]; }) || [0, 0, 'soleil'])[2] : 'soleil';
        meta.push('<span>' + u.ic(icone) +
          (o.meteo || []).map(function (m) { return App.libelle(App.METEOS, m); }).join(', ') +
          (o.temperature !== null && o.temperature !== undefined && o.temperature !== '' ? (o.meteo && o.meteo.length ? ' · ' : '') + u.nombre(o.temperature) + ' °C' : '') +
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
          return '<button type="button" data-ph="' + p.id + '" aria-label="' + u.esc(tr('Agrandir la photo')) + '">' +
            (p.miniature ? '<img src="' + App.photos.url(p, 'miniature') + '" alt="" loading="lazy" decoding="async">' : '') + '</button>';
        }).join('') + '</div>' : '') +
        (sons.length ? '<div class="sons-ligne">' + sons.map(function (s) { return App.sons.puce(s, 'data-son'); }).join('') + '</div>' : '') +
        '<div class="obs-actions">' +
        '<a class="btn btn-second btn-petit" href="#/modifier/' + encodeURIComponent(o.id) + '">' + u.ic('crayon') + tr('Modifier') + '</a>' +
        '<button type="button" class="btn btn-danger-doux btn-petit" data-suppr="' + o.id + '">' + u.ic('poubelle') + tr('Supprimer') + '</button>' +
        '</div></article>';
    },

    // Clics communs : agrandir une photo, télécharger, supprimer une observation.
    // fournisseur : liste [{photo, obs}] ou fonction(photoId) qui la renvoie
    brancher: function (el, fournisseur) {
      el.addEventListener('click', async function (ev) {
        const son = ev.target.closest('[data-son]');
        if (son) {
          const cs = await App.donnees.charger();
          const s = cs.sonsParId.get(son.dataset.son);
          if (s) App.sons.lire(s, son);
          return;
        }
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
            titre: tr('Supprimer cette observation ?'),
            texte: tr('L’observation et ses photos seront effacées de cet appareil. Cette action est définitive.'),
            ok: tr('Supprimer'), danger: true
          });
          if (!ok) return;
          try {
            await App.donnees.supprimerObservation(s.dataset.suppr);
            App.ui.toast(tr('Observation supprimée'));
            App.rafraichir();
          } catch (e) { App.ui.toast(tr('Suppression impossible : {erreur}', { erreur: e.message }), { erreur: true }); }
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

      // Bouton « Sortie » bien visible en haut à droite (+ copie flottante quand on fait défiler)
      const sortieEnCours = !!App.prefs.get('sortie', null);
      const boutonSortie = function (cls) {
        return '<a class="bouton-sortie' + (sortieEnCours ? ' en-cours' : '') + (cls ? ' ' + cls : '') + '" href="#/sortie"' +
          (cls ? ' aria-hidden="true" tabindex="-1"' : '') + '>' +
          (sortieEnCours ? '<span class="point" aria-hidden="true"></span>' : u.ic('chemin')) +
          '<span>' + (sortieEnCours ? tr('Reprendre') : tr('Sortie')) + '</span></a>';
      };
      function brancherFlottant() {
        const tete = el.querySelector('.entete');
        if (!tete || !('IntersectionObserver' in window)) return;
        el.insertAdjacentHTML('beforeend', boutonSortie('flottant'));
        const flottant = el.querySelector('.bouton-sortie.flottant');
        const io = new IntersectionObserver(function (entrees) {
          const visible = !entrees[0].isIntersecting;
          flottant.classList.toggle('visible', visible);
          if (visible) { flottant.removeAttribute('aria-hidden'); flottant.removeAttribute('tabindex'); }
          else { flottant.setAttribute('aria-hidden', 'true'); flottant.setAttribute('tabindex', '-1'); }
        });
        io.observe(tete);
        App.surNettoyage(function () { io.disconnect(); });
      }

      if (!c.obs.length) {
        el.innerHTML = App.ui.entete({ titre: tr('Mes observations'), actions: boutonSortie() }) +
          '<div class="vide"><svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>' +
          '<h2>' + tr('Ton carnet t’attend') + '</h2>' +
          '<p>' + tr('Ajoute ta première observation : l’espèce, le lieu, le nombre d’individus et tes photos.') + '</p>' +
          '<a class="btn btn-prim" href="#/ajouter">' + u.ic('plus') + tr('Première observation') + '</a></div>';
        return;
      }

      const surPC = window.matchMedia('(min-width: 900px)').matches;
      let mode = App.prefs.get('modeObs', '') || (surPC ? 'galerie' : 'especes');
      const MODES = [['especes', /*tr*/'Espèces', 'couches'], ['galerie', /*tr*/'Galerie', 'grille'], ['journal', /*tr*/'Journal', 'liste']];

      el.innerHTML =
        App.ui.entete({
          titre: tr('Mes observations'),
          sous: u.pluriel(resume.size, 'espèce') + ' · ' + u.pluriel(c.obs.length, 'observation') + ' · ' + u.pluriel(nbPhotos, 'photo'),
          actions: boutonSortie()
        }) + rappel +
        '<div class="outils-obs">' +
        '<div class="seg" role="group" aria-label="' + u.esc(tr('Type d’affichage')) + '">' +
        MODES.map(function (m) {
          return '<button type="button" data-mode="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + u.ic(m[2]) + tr(m[1]) + '</button>';
        }).join('') + '</div>' +
        '<label class="recherche" style="flex:1 1 220px;height:50px">' + u.ic('recherche') +
        '<span class="sr-only">' + tr('Filtrer par espèce') + '</span>' +
        '<input type="search" id="obs-q" placeholder="' + u.esc(tr('Filtrer par espèce…')) + '" autocomplete="off" value="' + u.esc(filtreObs) + '"></label>' +
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
              '<summary>' + App.ui.vignette(r.couverture, '', id) +
              '<div class="acc-txt"><div class="acc-nom">' + u.esc(App.esp.nom(e, langue)) + '</div>' +
              '<div class="acc-info">' + u.pluriel(r.nb, 'obs.', 'obs.||pluriel') + ' · ' + u.pluriel(r.photos.length, 'photo') +
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
            html = '<div class="vide"><h2>' + tr('Pas encore de photo') + '</h2><p>' + tr('Ajoute des photos à tes observations : elles apparaîtront ici en galerie.') + '</p></div>';
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

        zone.innerHTML = html || '<div class="vide"><h2>' + tr('Rien à afficher') + '</h2><p>' + tr('Aucune observation ne correspond à « {q} ».', { q: u.esc(filtreObs) }) + '</p></div>';

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
                : '<p class="muet petit">' + tr('Pas de photo pour cette espèce.') + '</p>') +
              '<ul class="acc-obs">' + r.obs.map(function (o) {
                return '<li><span class="q">' + u.dateCourte(o.date) + (o.heure ? ' · ' + u.esc(o.heure) : '') +
                  (o.lieu ? ' · ' + u.esc(o.lieu) : '') + ' · ' + u.pluriel(o.nombre || 1, 'ind.', 'ind.||pluriel') + '</span>' +
                  '<a class="btn btn-second btn-petit" href="#/modifier/' + encodeURIComponent(o.id) + '" aria-label="' + u.esc(tr('Modifier l’observation du {date}', { date: u.dateLongue(o.date) })) + '">' + u.ic('crayon') + '</a></li>';
              }).join('') + '</ul>' +
              '<div class="acc-pied">' +
              '<a class="lien-btn" href="#/espece/' + encodeURIComponent(id) + '">' + tr('Voir la fiche complète') + '</a>' +
              '<a class="btn btn-doux btn-petit" href="#/ajouter/' + encodeURIComponent(id) + '">' + u.ic('plus') + tr('Nouvelle obs.') + '</a>' +
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
      brancherFlottant();
    }
  });

  /* =================================================================
     Choix de l'espèce (fenêtre avec recherche)
     ================================================================= */
  // opts.cibles : choix d'une cible (pas de « Observées récemment », cibles marquées 🎯)
  // Aussi utilisée par la page Cibles (App.choisirEspece) → Promise<id ou null>
  App.choisirEspece = choisirEspece;
  async function choisirEspece(opts) {
    opts = opts || {};
    const d = document.getElementById('dlg-espece');
    const resume = await App.donnees.resume();
    const langue = App.langue();
    const col = App.collator(langue);
    const toutes = App.esp.liste.slice().sort(function (a, b) { return col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue)); });
    const recentes = opts.cibles ? [] : Array.from(resume.keys())
      .filter(App.esp.existe)
      .sort(function (a, b) { return App.donnees.cleObs(resume.get(b).derniere).localeCompare(App.donnees.cleObs(resume.get(a).derniere)); })
      .slice(0, 8)
      .map(App.esp.get);

    d.innerHTML =
      '<div class="feuille-haut">' +
      '<label class="recherche">' + u.ic('recherche') + '<span class="sr-only">' + tr('Rechercher une espèce') + '</span>' +
      '<input type="search" placeholder="' + u.esc(tr('Nom français, bulgare, anglais, latin…')) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></label>' +
      '<button type="button" class="btn-icone" data-fermer aria-label="' + u.esc(tr('Fermer')) + '">' + u.ic('x') + '</button>' +
      '</div><div class="feuille-liste"></div>';
    const champ = d.querySelector('input');
    const zone = d.querySelector('.feuille-liste');

    function option(e) {
      const r = resume.get(e.id);
      return '<button type="button" class="option-esp" data-id="' + u.esc(e.id) + '">' + App.ui.vignette(r && r.couverture, '', e.id) +
        '<span class="oe-txt"><span class="oe-nom">' + u.esc(App.esp.nom(e, langue)) + (r ? ' <span class="tag tag-ok">✓</span>' : '') +
        (opts.cibles && App.cibles.contient(e.id) ? ' <span class="tag tag-cible">' + u.ic('cible') + tr('Cible') + '</span>' : '') + '</span>' +
        '<span class="oe-autre" style="display:block">' + u.esc(App.esp.autresNoms(e, langue).join(' · ')) + ' · <i>' + u.esc(e.la) + '</i></span></span></button>';
    }
    function rendre() {
      const q = champ.value;
      if (!u.norm(q)) {
        zone.innerHTML = (recentes.length ? '<h3>' + tr('Observées récemment') + '</h3>' + recentes.map(option).join('') : '') +
          '<h3>' + tr('Toutes les espèces') + '</h3>' + toutes.map(option).join('');
      } else {
        const f = App.esp.filtre(q);
        const res = toutes.filter(f);
        zone.innerHTML = res.length ? res.map(option).join('')
          : '<div class="vide" style="padding:24px 8px"><p>' + tr('Aucune espèce ne correspond. Vérifie l’orthographe, ou ajoute l’espèce dans {fichier}.', { fichier: '<code>data/especes.js</code>' }) + '</p></div>';
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
      nouvelles: [],
      sonsGardes: o ? App.donnees.sonsDe(c, o) : [],
      sonsRetires: [],
      nouveauxSons: [],
      spotId: ''
    };
    // Spot : celui de l'observation, ou celui choisi avec « Nouvelle observation ici » sur la page d'un spot
    const spotsConnus = c.spots.slice();
    if (o) etat.spotId = o.spotId && c.spotsParId.has(o.spotId) ? o.spotId : '';
    else if (App.spots.preselection && c.spotsParId.has(App.spots.preselection)) etat.spotId = App.spots.preselection;
    App.spots.preselection = null;
    const spotInitial = etat.spotId ? c.spotsParId.get(etat.spotId) : null;
    if (!o && spotInitial && spotInitial.lat !== null && spotInitial.lat !== undefined) {
      etat.lat = spotInitial.lat; etat.lon = spotInitial.lon; etat.precision = spotInitial.precision || null; etat.sourceGps = 'spot';
    }
    let file = Promise.resolve();
    let dateTouchee = !!o;
    let exifApplique = false;
    App.formulaireModifie = false;

    const lieux = [];
    c.obs.forEach(function (x) { if (x.lieu && lieux.indexOf(x.lieu) === -1 && lieux.length < 40) lieux.push(x.lieu); });

    el.innerHTML =
      App.ui.entete({
        titre: o ? tr('Modifier l’observation') : tr('Nouvelle observation'),
        retour: o ? '#/espece/' + encodeURIComponent(o.especeId) : '#/catalogue',
        sansOutils: true
      }) +
      '<form class="form" id="form-obs" novalidate>' +
      '<div class="champ"><span class="etiq" id="lbl-espece">' + tr('Espèce') + '</span>' +
      '<button type="button" class="choix-espece" id="f-espece"></button>' +
      '<span class="erreur-champ" id="err-espece" hidden>' + tr('Choisis d’abord une espèce.') + '</span></div>' +

      '<div class="ligne-2">' +
      '<div class="champ"><label for="f-date">' + tr('Date') + '</label><input type="date" class="entree" id="f-date" required value="' + (o ? o.date : u.dateISO()) + '"></div>' +
      '<div class="champ"><label for="f-heure">' + tr('Heure') + '</label><input type="time" class="entree" id="f-heure" value="' + (o ? u.esc(o.heure || '') : u.heureHM()) + '"></div>' +
      '</div>' +

      '<div class="champ"><label for="f-lieu">' + tr('Lieu') + '</label>' +
      '<div class="ligne-lieu"><input type="text" class="entree" id="f-lieu" list="lieux-connus" autocomplete="off" placeholder="' + u.esc(tr('Rivière Stryama, sortie du village…')) + '" value="' + u.esc(o ? o.lieu || '' : (spotInitial ? spotInitial.nom : '')) + '">' +
      '<button type="button" class="btn btn-doux btn-gps" id="f-gps" title="' + u.esc(tr('Utiliser le GPS du téléphone')) + '">' + u.ic('position') + tr('Ma position') + '</button></div>' +
      '<datalist id="lieux-connus">' + lieux.map(function (l) { return '<option value="' + u.esc(l) + '">'; }).join('') + '</datalist>' +
      '<div class="gps-info" id="f-gps-info"></div></div>' +

      '<div class="champ"><label for="f-spot">' + tr('Spot') + ' <span class="muet facultatif">' + tr('(facultatif)') + '</span></label>' +
      '<select class="entree" id="f-spot">' + App.spots.optionsSelect(spotsConnus, etat.lat !== null && etat.sourceGps !== 'spot' ? etat : null, etat.spotId) + '</select>' +
      '<p class="aide">' + tr('Rattache l’observation à un de tes affûts ou points d’observation, ou crée-en un ici.') + '</p></div>' +

      '<div class="champ"><label for="f-nombre">' + tr('Nombre d’individus') + '</label>' +
      '<div class="stepper"><button type="button" data-pas="-1" aria-label="' + u.esc(tr('Un individu de moins')) + '">−</button>' +
      '<input type="number" class="entree" id="f-nombre" min="1" step="1" inputmode="numeric" value="' + (o ? (o.nombre || 1) : 1) + '">' +
      '<button type="button" data-pas="1" aria-label="' + u.esc(tr('Un individu de plus')) + '">+</button></div></div>' +

      '<div class="champ"><span class="etiq">' + tr('Comportement') + '</span><div class="puces" id="f-comp" role="group" aria-label="' + u.esc(tr('Comportement')) + '">' +
      App.COMPORTEMENTS.map(function (k) {
        const on = etat.comportements.indexOf(k[0]) !== -1;
        return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-comp="' + k[0] + '" aria-pressed="' + on + '">' + u.esc(tr(k[1])) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="champ"><span class="etiq">' + tr('Météo') + '</span><div class="puces" id="f-meteo" role="group" aria-label="' + u.esc(tr('Météo')) + '">' +
      App.METEOS.map(function (k) {
        const on = etat.meteo.indexOf(k[0]) !== -1;
        return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-meteo="' + k[0] + '" aria-pressed="' + on + '">' + u.ic(k[2]) + u.esc(tr(k[1])) + '</button>';
      }).join('') + '</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-top:4px"><label for="f-temp" class="petit muet">' + tr('Température (°C, facultatif)') + '</label>' +
      '<input type="number" class="entree" id="f-temp" inputmode="decimal" step="0.5" style="width:110px" value="' +
      (o && o.temperature !== null && o.temperature !== undefined ? u.esc(o.temperature) : '') + '"></div></div>' +

      '<div class="champ"><label for="f-notes">' + tr('Notes') + '</label>' +
      '<textarea class="entree" id="f-notes" placeholder="' + u.esc(tr('Plumage, chant, comportement, réglages photo…')) + '">' + u.esc(o ? o.notes || '' : '') + '</textarea></div>' +

      '<div class="champ"><span class="etiq">' + tr('Photos') + '</span>' +
      '<div class="boutons-photo">' +
      '<label class="btn btn-second">' + u.ic('photo') + tr('Appareil photo') + '<input type="file" id="f-cam" accept="image/*" capture="environment" hidden></label>' +
      '<label class="btn btn-second">' + u.ic('galerie') + tr('Galerie') + '<input type="file" id="f-gal" accept="image/*" multiple hidden></label>' +
      '</div>' +
      '<p class="aide">' + tr('L’original est gardé intact pour le téléchargement ; une copie allégée sert à l’affichage. Si la photo contient sa date ou sa position (EXIF), je les reprends.') + '</p>' +
      '<div class="photos-form" id="f-photos"></div></div>' +

      '<div class="champ"><span class="etiq">' + tr('Chants et cris') + '</span>' +
      '<div class="boutons-photo">' +
      (App.sons.disponible() ? '<button type="button" class="btn btn-second" id="f-micro">' + u.ic('micro') + tr('Enregistrer||son') + '</button>' : '') +
      '<label class="btn btn-second">' + u.ic('importer') + tr('Fichier son') + '<input type="file" id="f-son" accept="audio/*" hidden></label>' +
      '</div>' +
      '<p class="aide">' + tr('Pour un oiseau qui chante sans se montrer : enregistre-le (3 min max), tu pourras le réécouter ou le faire identifier plus tard.') + '</p>' +
      '<div class="sons-form" id="f-sons"></div></div>' +

      (o ? '<div class="zone-danger"><button type="button" class="btn btn-danger-doux" id="f-suppr">' + u.ic('poubelle') + tr('Supprimer cette observation') + '</button></div>' : '') +
      '</form>' +
      '<div class="barre-enreg">' +
      '<a class="btn btn-second" href="' + (o ? '#/espece/' + encodeURIComponent(o.especeId) : '#/catalogue') + '" data-action="retour">' + tr('Annuler') + '</a>' +
      '<button type="button" class="btn btn-prim" id="f-enreg">' + u.ic('check') + tr('Enregistrer') + '</button>' +
      '</div>';

    const $ = function (s) { return el.querySelector(s); };
    const champDate = $('#f-date'), champHeure = $('#f-heure'), champLieu = $('#f-lieu');
    const champNombre = $('#f-nombre'), champTemp = $('#f-temp'), champNotes = $('#f-notes');
    const infoGps = $('#f-gps-info'), zonePhotos = $('#f-photos'), btnEnreg = $('#f-enreg');

    function modifie() { App.formulaireModifie = true; }
    App.garde = function () {
      return !App.formulaireModifie || window.confirm(tr('Quitter sans enregistrer cette observation ?'));
    };
    App.surNettoyage(function () {
      App.formulaireModifie = false;
      etat.nouvelles.forEach(function (n) { if (n.url) URL.revokeObjectURL(n.url); });
    });

    // --- Espèce
    function majEspece() {
      const b = $('#f-espece');
      b.setAttribute('aria-label', etat.especeId
        ? tr('Espèce : {nom} (changer)', { nom: App.esp.nom(App.esp.get(etat.especeId), langue) })
        : tr('Choisir l’espèce'));
      if (!etat.especeId) {
        b.classList.add('vide-choix');
        b.innerHTML = u.ic('recherche') + '<span class="ce-txt"><span class="ce-nom">' + tr('Choisir l’espèce…') + '</span><span class="ce-autre" style="display:block">' + tr('Recherche par nom français, bulgare, anglais ou latin') + '</span></span>';
        return;
      }
      const e = App.esp.get(etat.especeId);
      const r = resume.get(etat.especeId);
      b.classList.remove('vide-choix');
      b.innerHTML = App.ui.vignette(r && r.couverture, '', etat.especeId) +
        '<span class="ce-txt"><span class="ce-nom" style="display:block">' + u.esc(App.esp.nom(e, langue)) + '</span>' +
        '<span class="ce-autre" style="display:block">' + u.esc(App.esp.autresNoms(e, langue).join(' · ')) + '</span></span>' +
        '<span class="lien-btn">' + tr('Changer') + '</span>';
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
      // Liste des spots : les plus proches d'abord quand la position est connue
      const selSpot = $('#f-spot');
      if (selSpot) selSpot.innerHTML = App.spots.optionsSelect(spotsConnus, etat.lat !== null && etat.sourceGps !== 'spot' ? etat : null, etat.spotId);
      if (etat.lat === null) { infoGps.innerHTML = ''; return; }
      infoGps.innerHTML = u.ic('epingle') + '<span>' + coordonnees(etat.lat, etat.lon) +
        (etat.precision ? ' (± ' + etat.precision + ' m)' : '') +
        (etat.sourceGps === 'photo' ? ' · ' + tr('d’après la photo') : etat.sourceGps === 'spot' ? ' · ' + tr('d’après le spot') : '') + '</span>' +
        '<a class="lien-btn" href="' + lienCarte(etat.lat, etat.lon) + '" target="_blank" rel="noopener">' + tr('Voir la carte') + '</a>' +
        '<button type="button" class="lien-btn" id="f-gps-effacer">' + tr('Effacer') + '</button>';
      $('#f-gps-effacer').addEventListener('click', function () {
        etat.lat = etat.lon = etat.precision = null; modifie(); majGps();
      });
    }
    $('#f-gps').addEventListener('click', function () {
      if (!navigator.geolocation) { App.ui.toast(tr('GPS non disponible sur cet appareil'), { erreur: true }); return; }
      infoGps.innerHTML = '<span class="rond-charge" aria-hidden="true"></span><span>' + tr('Recherche de ta position… (à découvert, c’est plus rapide)') + '</span>';
      navigator.geolocation.getCurrentPosition(function (pos) {
        etat.lat = Math.round(pos.coords.latitude * 1e6) / 1e6;
        etat.lon = Math.round(pos.coords.longitude * 1e6) / 1e6;
        etat.precision = Math.round(pos.coords.accuracy);
        etat.sourceGps = 'gps';
        modifie();
        majGps();
      }, function (err) {
        infoGps.innerHTML = '<span class="erreur-champ">' + (err.code === 1
          ? tr('Accès à la position refusé : autorise-le dans les réglages du navigateur.')
          : tr('Position introuvable pour l’instant. Réessaie à découvert.')) + '</span>';
      }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 });
    });
    majGps();

    // --- Spot (facultatif) : un spot existant, aucun, ou un nouveau créé sur place
    const champSpot = $('#f-spot');
    let spotAvant = etat.spotId;
    champSpot.addEventListener('change', async function () {
      const precedent = spotsConnus.find(function (s) { return s.id === spotAvant; }) || null;
      if (champSpot.value === '__nouveau') {
        const cree = await App.spots.editer(null, { nom: champLieu.value.trim(), lat: etat.lat, lon: etat.lon, precision: etat.precision });
        if (!cree) { champSpot.value = spotAvant; return; }
        spotsConnus.push(cree);
        etat.spotId = cree.id;
        App.ui.toast(tr('Spot enregistré : {nom}', { nom: cree.nom }));
      } else etat.spotId = champSpot.value;
      const s = spotsConnus.find(function (x) { return x.id === etat.spotId; }) || null;
      // Le lieu suit le spot s'il était vide ou rempli par le spot précédent
      const lieu = champLieu.value.trim();
      if (!lieu || (precedent && lieu === precedent.nom)) champLieu.value = s ? s.nom : '';
      // La position du spot sert seulement si l'observation n'a pas la sienne (GPS ou photo)
      if (etat.lat === null || etat.sourceGps === 'spot') {
        if (s && s.lat !== null && s.lat !== undefined) {
          etat.lat = s.lat; etat.lon = s.lon; etat.precision = s.precision || null; etat.sourceGps = 'spot';
        } else if (etat.sourceGps === 'spot') {
          etat.lat = etat.lon = etat.precision = null; etat.sourceGps = null;
        }
      }
      spotAvant = etat.spotId;
      majGps();
      modifie();
    });

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
          return '<div class="photo-form">' + (p.miniature ? '<img src="' + App.photos.url(p, 'miniature') + '" alt="">' : '<div class="etat">' + tr('Aperçu indisponible') + '</div>') +
            '<button type="button" class="suppr" data-retirer-ex="' + p.id + '" aria-label="' + u.esc(tr('Retirer cette photo')) + '">' + u.ic('x') + '</button></div>';
        }).join('') +
        etat.nouvelles.map(function (n) {
          let contenu;
          if (n.res && n.res.miniature) {
            if (!n.url) n.url = URL.createObjectURL(n.res.miniature);
            contenu = '<img src="' + n.url + '" alt="">';
          } else if (n.res || n.erreur) {
            contenu = '<div class="etat">' + tr('Aperçu impossible') + '<br>' + tr('(l’original sera gardé)') + '</div>';
          } else {
            contenu = '<div class="etat"><span class="rond-charge" aria-label="' + u.esc(tr('Traitement en cours')) + '"></span></div>';
          }
          return '<div class="photo-form">' + contenu +
            '<button type="button" class="suppr" data-retirer-nv="' + n.cle + '" aria-label="' + u.esc(tr('Retirer cette photo')) + '">' + u.ic('x') + '</button></div>';
        }).join('');
    }
    function appliquerExif(exif) {
      if (!exif) return;
      const msgs = [];
      if (exif.date && !dateTouchee && !exifApplique) {
        champDate.value = exif.date;
        if (exif.heure) champHeure.value = exif.heure;
        exifApplique = true;
        msgs.push(tr('date et heure'));
      }
      if (exif.lat !== undefined && (etat.lat === null || etat.sourceGps === 'spot')) {
        etat.lat = exif.lat; etat.lon = exif.lon; etat.precision = null; etat.sourceGps = 'photo';
        majGps();
        msgs.push(tr('position'));
      }
      if (msgs.length) App.ui.toast(tr('Reprises de la photo : {quoi}', { quoi: msgs.length > 1 ? tr('date, heure et position') : msgs[0] }));
    }
    function ajouterFichiers(fichiers) {
      Array.from(fichiers || []).forEach(function (f) {
        if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|heic|heif|gif|avif)$/i.test(f.name)) {
          App.ui.toast(tr('« {nom} » n’est pas une image', { nom: f.name }), { erreur: true });
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

    // --- Sons : enregistrement au micro ou fichier importé
    const zoneSons = $('#f-sons');
    const btnMicro = $('#f-micro');
    let enregistrement = null;

    function nomSon(s) {
      return u.slug(App.esp.get(etat.especeId || s.especeId || '').fr || 'oiseau') + '_' + (champDate.value || u.dateISO()) +
        '_chant.' + App.sons.extension(s.type);
    }
    function rendreSons() {
      zoneSons.innerHTML =
        etat.sonsGardes.map(function (s) {
          return '<div class="son-form">' + App.sons.puce(s, 'data-ecoute-ex') +
            '<button type="button" class="btn-icone" data-dl-son="' + s.id + '" aria-label="' + u.esc(tr('Télécharger ce son')) + '">' + u.ic('telecharger') + '</button>' +
            '<button type="button" class="btn-icone" data-retirer-son-ex="' + s.id + '" aria-label="' + u.esc(tr('Retirer ce son')) + '">' + u.ic('x') + '</button></div>';
        }).join('') +
        etat.nouveauxSons.map(function (s) {
          return '<div class="son-form">' + App.sons.puce(s, 'data-ecoute-nv') +
            '<span class="muet petit">' + tr('nouveau') + '</span>' +
            '<button type="button" class="btn-icone" data-retirer-son-nv="' + s.id + '" aria-label="' + u.esc(tr('Retirer ce son')) + '">' + u.ic('x') + '</button></div>';
        }).join('');
    }
    async function finirEnregistrement() {
      if (!enregistrement) return;
      const ctrl = enregistrement;
      enregistrement = null;
      const res = await ctrl.arreter();
      if (btnMicro) { btnMicro.classList.remove('enregistre'); btnMicro.innerHTML = u.ic('micro') + tr('Enregistrer||son'); }
      if (res.blob.size) {
        etat.nouveauxSons.push({ id: u.uid('n'), blob: res.blob, type: res.type, duree: res.duree, nomOriginal: 'chant.' + App.sons.extension(res.type) });
        modifie();
        rendreSons();
      }
    }
    if (btnMicro) btnMicro.addEventListener('click', async function () {
      if (enregistrement) { await finirEnregistrement(); return; }
      try {
        App.sons.arreter();
        btnMicro.classList.add('enregistre');
        btnMicro.innerHTML = u.ic('stop') + tr('Arrêter') + ' · 0:00';
        enregistrement = await App.sons.enregistrer(function (s) {
          if (s >= App.sons.DUREE_MAX) { finirEnregistrement(); return; }
          if (enregistrement) btnMicro.innerHTML = u.ic('stop') + tr('Arrêter') + ' · ' + App.sons.format(s);
        });
      } catch (e) {
        enregistrement = null;
        btnMicro.classList.remove('enregistre');
        btnMicro.innerHTML = u.ic('micro') + tr('Enregistrer||son');
        App.ui.toast(e && e.name === 'NotAllowedError'
          ? tr('Accès au micro refusé : autorise-le dans les réglages du navigateur.')
          : tr('Micro indisponible : {erreur}', { erreur: e && e.message ? e.message : e }), { erreur: true });
      }
    });
    $('#f-son').addEventListener('change', async function () {
      const f = this.files && this.files[0];
      this.value = '';
      if (!f) return;
      const duree = await App.sons.lireDuree(f);
      etat.nouveauxSons.push({ id: u.uid('n'), blob: f, type: f.type || 'audio/mpeg', duree: duree, nomOriginal: f.name || 'son' });
      modifie();
      rendreSons();
    });
    zoneSons.addEventListener('click', function (ev) {
      const cherche = function (liste, id) { return liste.find(function (x) { return x.id === id; }); };
      const ex = ev.target.closest('[data-ecoute-ex]');
      if (ex) { const s = cherche(etat.sonsGardes, ex.dataset.ecouteEx); if (s) App.sons.lire(s, ex); return; }
      const nv = ev.target.closest('[data-ecoute-nv]');
      if (nv) { const s = cherche(etat.nouveauxSons, nv.dataset.ecouteNv); if (s) App.sons.lire(s, nv); return; }
      const dl = ev.target.closest('[data-dl-son]');
      if (dl) { const s = cherche(etat.sonsGardes, dl.dataset.dlSon); if (s) App.telechargerBlob(s.blob, nomSon(s)); return; }
      const rex = ev.target.closest('[data-retirer-son-ex]');
      if (rex) {
        App.sons.arreter();
        etat.sonsGardes = etat.sonsGardes.filter(function (x) { return x.id !== rex.dataset.retirerSonEx; });
        etat.sonsRetires.push(rex.dataset.retirerSonEx);
        modifie(); rendreSons();
        return;
      }
      const rnv = ev.target.closest('[data-retirer-son-nv]');
      if (rnv) {
        App.sons.arreter();
        App.sons.oublierUrl(rnv.dataset.retirerSonNv);
        etat.nouveauxSons = etat.nouveauxSons.filter(function (x) { return x.id !== rnv.dataset.retirerSonNv; });
        rendreSons();
      }
    });
    App.surNettoyage(function () {
      if (enregistrement) enregistrement.annuler();
      App.sons.arreter();
    });
    rendreSons();

    // --- Suppression (en modification)
    if (o) {
      $('#f-suppr').addEventListener('click', async function () {
        const ok = await App.ui.confirmer({
          titre: tr('Supprimer cette observation ?'),
          texte: tr('L’observation et ses photos seront effacées de cet appareil. Cette action est définitive.'),
          ok: tr('Supprimer'), danger: true
        });
        if (!ok) return;
        await App.donnees.supprimerObservation(o.id);
        App.formulaireModifie = false;
        App.ui.toast(tr('Observation supprimée'));
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
        (etat.nouvelles.some(function (n) { return !n.res && !n.erreur; }) ? tr('Traitement des photos…') : tr('Enregistrement…'));
      try {
        await finirEnregistrement();
        await file;
        const maintenant = new Date().toISOString();
        const id = o ? o.id : u.uid('obs');
        const sonsNouveaux = etat.nouveauxSons.map(function (s) {
          return {
            id: u.uid('son'), observationId: id, especeId: etat.especeId,
            type: s.type, duree: s.duree, taille: s.blob.size, nomOriginal: s.nomOriginal,
            blob: s.blob, creeLe: maintenant, modifieLe: maintenant
          };
        });
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
          sonIds: etat.sonsGardes.map(function (s) { return s.id; }).concat(sonsNouveaux.map(function (s) { return s.id; })),
          sortie: o && o.sortie ? o.sortie : undefined,
          spotId: etat.spotId || undefined,
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
        sonsNouveaux.forEach(function (s) { ops.push({ magasin: 'sons', mettre: s }); });
        etat.sonsRetires.forEach(function (sid) {
          ops.push({ magasin: 'sons', effacer: sid });
          ops.push({ magasin: 'suppressions', mettre: { id: sid, type: 'son', le: maintenant } });
          App.sons.oublierUrl(sid);
        });
        if (o && o.especeId !== etat.especeId) {
          etat.photosGardees.forEach(function (p) {
            ops.push({ magasin: 'photos', mettre: Object.assign({}, p, { especeId: etat.especeId, favori: false, modifieLe: maintenant }) });
          });
          etat.sonsGardes.forEach(function (s) {
            ops.push({ magasin: 'sons', mettre: Object.assign({}, s, { especeId: etat.especeId, modifieLe: maintenant }) });
          });
        }
        const nouvelleEspece = !resume.has(obs.especeId);
        await App.db.ecrire(ops);
        App.formulaireModifie = false;
        App.garde = null;
        App.demanderPersistance();
        if (nouvelleEspece) {
          const cible = App.cibles.contient(obs.especeId);
          App.ui.toast(tr('🎉 Nouvelle espèce pour ton carnet : {nom}', { nom: App.esp.nom(App.esp.get(obs.especeId)) }) + (cible ? ' · ' + tr('🎯 cible atteinte !') : ''), {
            action: tr('Partager'), surAction: function () { App.partage.ouvrir(obs.especeId); }, duree: 9000
          });
        } else {
          App.ui.toast(o ? tr('Observation modifiée') : tr('Observation enregistrée'), {
            action: o ? null : tr('Nouvelle'), surAction: function () { App.aller('#/ajouter'); }
          });
        }
        location.replace('#/espece/' + encodeURIComponent(obs.especeId));
      } catch (e) {
        console.error(e);
        const plein = e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''));
        App.ui.toast(plein
          ? tr('Stockage plein : exporte une sauvegarde puis supprime des photos anciennes.')
          : tr('Enregistrement impossible : {erreur}', { erreur: e && e.message ? e.message : e }), { erreur: true });
        btnEnreg.classList.remove('occupe');
        btnEnreg.innerHTML = u.ic('check') + tr('Enregistrer');
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
        el.innerHTML = App.ui.entete({ titre: tr('Observation introuvable'), retour: '#/observations' }) +
          '<div class="vide"><p>' + tr('Cette observation n’existe plus (supprimée ou pas encore importée sur cet appareil).') + '</p>' +
          '<a class="btn btn-prim" href="#/observations">' + tr('Mes observations') + '</a></div>';
        return;
      }
      return formulaire(el, o, null);
    }
  });
})(window.App);
