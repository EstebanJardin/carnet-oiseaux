/* =====================================================================
   spots.js — Mes spots (affûts, points d'observation) et perchoirs
   - Page « Mes spots » (#/spots) et page d'un spot (#/spot/<id>)
   - Fenêtre pour créer ou modifier un spot (aussi depuis le formulaire
     d'observation : « Nouveau spot… »)
   - Sur la fiche d'une espèce (bouton « Mes spots ») : la note
     « Perchoirs connus » et les spots où l'espèce a été vue
   Une observation peut être rattachée à un spot (champ spotId), sans
   obligation. Distance et direction sont calculées sur le téléphone,
   sans connexion. Les spots s'affichent sur la carte hors ligne
   (carte.js) ; seul l'itinéraire Google Maps demande du réseau.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;

  // [clé, libellé, icône]
  const TYPES = [
    ['affut', /*tr*/'Affût', 'photo'],
    ['point', /*tr*/'Point d’observation', 'jumelles'],
    ['autre', /*tr*/'Autre lieu', 'epingle']
  ];
  function typeDe(spot) { return TYPES.find(function (t) { return t[0] === spot.type; }) || TYPES[2]; }
  function libType(spot) { return tr(typeDe(spot)[1]); }

  function aUnePosition(x) { return x && x.lat !== null && x.lat !== undefined && x.lon !== null && x.lon !== undefined; }

  /* ---------- Position, distance, direction ---------- */

  let maPosition = null; // { lat, lon, precision, le } — gardée le temps de la visite

  function localiser() {
    return new Promise(function (ok, ko) {
      if (!navigator.geolocation) { ko(new Error(tr('GPS non disponible sur cet appareil'))); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        maPosition = {
          lat: Math.round(pos.coords.latitude * 1e6) / 1e6,
          lon: Math.round(pos.coords.longitude * 1e6) / 1e6,
          precision: Math.round(pos.coords.accuracy),
          le: Date.now()
        };
        ok(maPosition);
      }, function (err) {
        ko(new Error(err.code === 1
          ? tr('Accès à la position refusé : autorise-le dans les réglages du navigateur.')
          : tr('Position introuvable pour l’instant. Réessaie à découvert.')));
      }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 });
    });
  }
  // Position récente (moins de 10 min), sinon null
  function positionRecente() { return maPosition && Date.now() - maPosition.le < 600000 ? maPosition : null; }
  // Position trouvée ailleurs (suivi GPS de la carte) : { lat, lon, precision, le }
  function noterPosition(p) { if (p && isFinite(p.lat) && isFinite(p.lon)) maPosition = p; }

  const RAD = Math.PI / 180;
  function distance(a, b) { // en mètres
    const dLat = (b.lat - a.lat) * RAD, dLon = (b.lon - a.lon) * RAD;
    const h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function cap(a, b) { // degrés depuis le nord, dans le sens des aiguilles d'une montre
    const dLon = (b.lon - a.lon) * RAD;
    const y = Math.sin(dLon) * Math.cos(b.lat * RAD);
    const x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos(dLon);
    return (Math.atan2(y, x) / RAD + 360) % 360;
  }
  const DIRECTIONS = [/*tr*/'au nord', /*tr*/'au nord-est', /*tr*/'à l’est', /*tr*/'au sud-est',
    /*tr*/'au sud', /*tr*/'au sud-ouest', /*tr*/'à l’ouest', /*tr*/'au nord-ouest'];
  function texteDistance(m) {
    if (m < 10) return tr('{n} m||distance', { n: '< 10' });
    if (m < 1000) return tr('{n} m||distance', { n: u.nombre(Math.round(m / 10) * 10) });
    return tr('{n} km||distance', { n: u.decimal(m / 1000, m < 10000 ? 1 : 0) });
  }
  // « À 1,2 km au nord-est » depuis la position du téléphone
  function texteTrajet(depuis, spot) {
    const m = distance(depuis, spot);
    if (m < 30) return tr('Tu y es (moins de 30 m)');
    return tr('À {distance} {direction}', {
      distance: texteDistance(m),
      direction: tr(DIRECTIONS[Math.round(cap(depuis, spot) / 45) % 8])
    });
  }

  function coordonnees(lat, lon) {
    return u.decimal(Math.abs(lat), 5) + ' ' + (lat >= 0 ? tr('N||latitude nord') : tr('S||latitude sud')) + ' · ' +
      u.decimal(Math.abs(lon), 5) + ' ' + (lon >= 0 ? tr('E||longitude est') : tr('O||longitude ouest'));
  }
  function lienCarte(lat, lon) {
    return 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=16/' + lat + '/' + lon;
  }
  function lienItineraire(lat, lon) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lon;
  }
  // « 42.64170, 24.80580 », « 42,6417 24,8058 », « 42.6417;24.8058 » → { lat, lon } ou null
  function lireCoordonnees(texte) {
    const s = String(texte || '').trim();
    if (!s) return null;
    let m = s.match(/^(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (!m) m = s.replace(/(\d),(\d)/g, '$1.$2').match(/^(-?\d{1,3}(?:\.\d+)?)\s*[;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (!m) return null;
    const lat = Number(m[1]), lon = Number(m[2]);
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { lat: Math.round(lat * 1e6) / 1e6, lon: Math.round(lon * 1e6) / 1e6 };
  }
  function ecrireCoordonnees(lat, lon) { return lat.toFixed(5) + ', ' + lon.toFixed(5); }

  /* ---------- Données ---------- */

  // Observations et espèces de chaque spot → Map(spotId → { obs[], especes: Map(especeId → { nb, derniere }) })
  function parSpot(c) {
    const m = new Map();
    c.obs.forEach(function (o) { // c.obs : plus récentes d'abord
      if (!o.spotId || !c.spotsParId.has(o.spotId)) return;
      let r = m.get(o.spotId);
      if (!r) { r = { obs: [], especes: new Map() }; m.set(o.spotId, r); }
      r.obs.push(o);
      const e = r.especes.get(o.especeId);
      if (e) e.nb++; else r.especes.set(o.especeId, { nb: 1, derniere: o });
    });
    return m;
  }
  function trier(spots, pos) {
    const col = App.collator();
    return spots.slice().sort(function (a, b) {
      if (pos) {
        const pa = aUnePosition(a), pb = aUnePosition(b);
        if (pa && pb) return distance(pos, a) - distance(pos, b);
        if (pa !== pb) return pa ? -1 : 1;
      }
      return col.compare(a.nom || '', b.nom || '');
    });
  }
  function photoDe(c, spot) { return spot && spot.photoId ? c.photosParId.get(spot.photoId) || null : null; }

  function vignetteSpot(c, spot) {
    const p = photoDe(c, spot);
    return '<div class="vignette vignette-spot">' + (p && p.miniature
      ? '<img src="' + App.photos.url(p, 'miniature') + '" alt="" loading="lazy" decoding="async">'
      : u.ic(typeDe(spot)[2])) + '</div>';
  }

  async function supprimer(spot) {
    const c = await App.donnees.charger();
    const maintenant = new Date().toISOString();
    const ops = [
      { magasin: 'spots', effacer: spot.id },
      { magasin: 'suppressions', mettre: { id: spot.id, type: 'spot', le: maintenant } }
    ];
    if (spot.photoId) {
      ops.push({ magasin: 'photos', effacer: spot.photoId });
      ops.push({ magasin: 'suppressions', mettre: { id: spot.photoId, type: 'photo', le: maintenant } });
      App.photos.oublierUrl(spot.photoId);
    }
    // Les observations restent : elles ne sont simplement plus rattachées à ce spot
    c.obs.forEach(function (o) {
      if (o.spotId !== spot.id) return;
      const n = Object.assign({}, o, { modifieLe: maintenant });
      delete n.spotId;
      ops.push({ magasin: 'observations', mettre: n });
    });
    // Les itinéraires gardent l'étape, comme un simple point sur la carte
    (c.itineraires || []).forEach(function (it) {
      const n = App.itineraires.sansSpot(it, spot);
      if (n) ops.push({ magasin: 'itineraires', mettre: Object.assign(n, { modifieLe: maintenant }) });
    });
    await App.db.ecrire(ops);
    App.itineraires.oublierSpotDuBrouillon(spot);
  }

  /* ---------- Fenêtre : nouveau spot / modifier un spot ---------- */

  // defauts : { nom, lat, lon, precision } (depuis le formulaire d'observation) → Promise<spot ou null>
  function editer(spot, defauts) {
    return App.donnees.charger().then(function (c) {
      return new Promise(function (resoudre) {
        defauts = defauts || {};
        const base = spot || { nom: defauts.nom || '', type: 'affut', lat: null, lon: null, precision: null, heures: '', notes: '', photoId: null };
        const etat = {
          type: base.type || 'affut',
          lat: spot ? (aUnePosition(spot) ? spot.lat : null) : (aUnePosition(defauts) ? defauts.lat : null),
          lon: spot ? (aUnePosition(spot) ? spot.lon : null) : (aUnePosition(defauts) ? defauts.lon : null),
          precision: spot ? spot.precision || null : defauts.precision || null,
          photo: photoDe(c, spot),  // photo déjà enregistrée (gardée tant qu'on ne la retire pas)
          nouvelle: null,           // { fichier, res, erreur, url, travail }
          retirer: false
        };
        const d = document.getElementById('dlg-confirm');
        d.innerHTML = '<form class="dlg dlg-spot" novalidate>' +
          '<h2>' + tr(spot ? /*tr*/'Modifier le spot' : /*tr*/'Nouveau spot') + '</h2>' +
          '<div class="dlg-corps">' +
          '<div class="champ"><label for="sp-nom">' + tr('Nom du spot') + '</label>' +
          '<input type="text" class="entree" id="sp-nom" maxlength="80" autocomplete="off" placeholder="' + u.esc(tr('Affût du vieux noyer, crête au-dessus du village…')) + '" value="' + u.esc(base.nom || '') + '">' +
          '<span class="erreur-champ" id="sp-err-nom" hidden>' + tr('Donne un nom à ce spot.') + '</span></div>' +
          '<div class="champ"><span class="etiq" id="sp-lbl-type">' + tr('Type de spot') + '</span>' +
          '<div class="puces" id="sp-type" role="group" aria-labelledby="sp-lbl-type">' + TYPES.map(function (t) {
            const on = t[0] === etat.type;
            return '<button type="button" class="puce' + (on ? ' on' : '') + '" data-type="' + t[0] + '" aria-pressed="' + on + '">' + u.ic(t[2]) + u.esc(tr(t[1])) + '</button>';
          }).join('') + '</div></div>' +
          '<div class="champ"><label for="sp-coord">' + tr('Position GPS') + '</label>' +
          '<div class="ligne-lieu"><input type="text" class="entree" id="sp-coord" autocomplete="off" spellcheck="false" placeholder="42.64170, 24.80580" value="' +
          (etat.lat !== null ? ecrireCoordonnees(etat.lat, etat.lon) : '') + '">' +
          '<button type="button" class="btn btn-doux btn-gps" id="sp-gps" title="' + u.esc(tr('Utiliser le GPS du téléphone')) + '">' + u.ic('position') + tr('Ma position') + '</button></div>' +
          '<div class="gps-info" id="sp-gps-info"></div>' +
          '<p class="aide">' + tr('Sur place avec le GPS, ou colle des coordonnées copiées d’une carte.') + '</p></div>' +
          '<div class="champ"><label for="sp-heures">' + tr('Meilleures heures') + '</label>' +
          '<input type="text" class="entree" id="sp-heures" maxlength="140" placeholder="' + u.esc(tr('Lever du soleil, 7 h – 9 h, lumière du soir…')) + '" value="' + u.esc(base.heures || '') + '"></div>' +
          '<div class="champ"><label for="sp-notes">' + tr('Notes') + '</label>' +
          '<textarea class="entree" id="sp-notes" placeholder="' + u.esc(tr('Accès, sens de la lumière, où se cacher, ce qu’on y voit…')) + '">' + u.esc(base.notes || '') + '</textarea></div>' +
          '<div class="champ"><span class="etiq">' + tr('Photo du spot (facultative)') + '</span><div class="sp-photo" id="sp-photo"></div></div>' +
          '</div>' +
          '<div class="dlg-actions">' +
          '<button type="button" class="btn btn-second" data-sp="annuler">' + tr('Annuler') + '</button>' +
          '<button type="submit" class="btn btn-prim" data-sp="ok">' + u.ic('check') + tr('Enregistrer') + '</button>' +
          '</div></form>';

        const $ = function (s) { return d.querySelector(s); };
        const form = $('form'), champNom = $('#sp-nom'), champCoord = $('#sp-coord'), info = $('#sp-gps-info'), zonePhoto = $('#sp-photo');
        let resultat = null;

        function majInfo() {
          const lu = lireCoordonnees(champCoord.value);
          if (champCoord.value.trim() && !lu) { info.innerHTML = '<span class="erreur-champ">' + tr('Coordonnées non reconnues : écris par exemple 42.64170, 24.80580') + '</span>'; return; }
          if (!lu) { info.innerHTML = ''; return; }
          info.innerHTML = u.ic('epingle') + '<span>' + coordonnees(lu.lat, lu.lon) + (etat.precision ? ' (± ' + etat.precision + ' m)' : '') + '</span>' +
            '<a class="lien-btn" href="' + lienCarte(lu.lat, lu.lon) + '" target="_blank" rel="noopener">' + tr('Voir la carte') + '</a>';
        }
        champCoord.addEventListener('input', function () { etat.precision = null; majInfo(); });
        $('#sp-gps').addEventListener('click', function () {
          info.innerHTML = '<span class="rond-charge" aria-hidden="true"></span><span>' + tr('Recherche de ta position… (à découvert, c’est plus rapide)') + '</span>';
          localiser().then(function (p) {
            if (!d.open) return;
            champCoord.value = ecrireCoordonnees(p.lat, p.lon);
            etat.precision = p.precision;
            majInfo();
          }, function (e) {
            if (d.open) info.innerHTML = '<span class="erreur-champ">' + u.esc(e.message) + '</span>';
          });
        });
        majInfo();

        $('#sp-type').addEventListener('click', function (ev) {
          const b = ev.target.closest('[data-type]');
          if (!b) return;
          etat.type = b.dataset.type;
          d.querySelectorAll('#sp-type [data-type]').forEach(function (x) {
            const on = x === b;
            x.classList.toggle('on', on);
            x.setAttribute('aria-pressed', String(on));
          });
        });

        // --- Photo facultative
        function rendrePhoto() {
          let apercu = '';
          if (etat.nouvelle) {
            const n = etat.nouvelle;
            if (n.res && n.res.miniature) {
              if (!n.url) n.url = URL.createObjectURL(n.res.miniature);
              apercu = '<img src="' + n.url + '" alt="">';
            } else if (n.res || n.erreur) apercu = '<div class="etat">' + tr('Aperçu impossible') + '<br>' + tr('(l’original sera gardé)') + '</div>';
            else apercu = '<div class="etat"><span class="rond-charge" aria-label="' + u.esc(tr('Traitement en cours')) + '"></span></div>';
          } else if (etat.photo && !etat.retirer) {
            apercu = etat.photo.miniature ? '<img src="' + App.photos.url(etat.photo, 'miniature') + '" alt="">' : '<div class="etat">' + tr('Aperçu indisponible') + '</div>';
          }
          zonePhoto.innerHTML = (apercu
            ? '<div class="photo-form">' + apercu + '<button type="button" class="suppr" data-sp="retirer-photo" aria-label="' + u.esc(tr('Retirer cette photo')) + '">' + u.ic('x') + '</button></div>'
            : '') +
            '<label class="btn btn-second">' + u.ic('photo') + tr(apercu ? /*tr*/'Changer la photo' : /*tr*/'Ajouter une photo') +
            '<input type="file" id="sp-fichier" accept="image/*" hidden></label>';
          $('#sp-fichier').addEventListener('change', function (ev) {
            const f = ev.target.files && ev.target.files[0];
            if (!f) return;
            if (etat.nouvelle && etat.nouvelle.url) URL.revokeObjectURL(etat.nouvelle.url);
            const n = { fichier: f, res: null, erreur: null, url: null };
            etat.nouvelle = n;
            n.travail = App.photos.traiter(f).then(function (res) {
              n.res = res;
              // Pas encore de position : on reprend celle de la photo (EXIF)
              if (res.exif && res.exif.lat !== undefined && !champCoord.value.trim()) {
                champCoord.value = ecrireCoordonnees(res.exif.lat, res.exif.lon);
                etat.precision = null;
                majInfo();
                App.ui.toast(tr('Reprises de la photo : {quoi}', { quoi: tr('position') }));
              }
            }, function (e) { n.erreur = e; console.warn(e); }).then(function () { if (etat.nouvelle === n && d.open) rendrePhoto(); });
            rendrePhoto();
          });
        }
        zonePhoto.addEventListener('click', function (ev) {
          if (!ev.target.closest('[data-sp="retirer-photo"]')) return;
          if (etat.nouvelle) { if (etat.nouvelle.url) URL.revokeObjectURL(etat.nouvelle.url); etat.nouvelle = null; }
          else etat.retirer = true;
          rendrePhoto();
        });
        rendrePhoto();

        // --- Enregistrement
        async function enregistrer() {
          const nom = champNom.value.trim();
          if (!nom) { $('#sp-err-nom').hidden = false; champNom.focus(); return; }
          const pos = lireCoordonnees(champCoord.value);
          if (champCoord.value.trim() && !pos) { champCoord.focus(); majInfo(); return; }
          const bouton = $('[data-sp="ok"]');
          bouton.disabled = true;
          bouton.innerHTML = '<span class="rond-charge" aria-hidden="true"></span>' + tr('Enregistrement…');
          try {
            if (etat.nouvelle && etat.nouvelle.travail) await etat.nouvelle.travail;
            const maintenant = new Date().toISOString();
            const id = spot ? spot.id : u.uid('spot');
            const ops = [];
            let photoId = spot && !etat.retirer ? spot.photoId || null : null;
            const ancienne = spot && spot.photoId && (etat.retirer || etat.nouvelle) ? spot.photoId : null;
            if (etat.nouvelle) {
              const n = etat.nouvelle, f = n.fichier;
              const r = n.res || { original: f, nomOriginal: f.name, type: f.type, taille: f.size, exif: {} };
              photoId = u.uid('ph');
              ops.push({ magasin: 'photos', mettre: {
                id: photoId, spotId: id,
                nomOriginal: r.nomOriginal || f.name || 'photo.jpg', type: r.type || 'image/jpeg', taille: r.taille || f.size,
                largeur: r.largeur || null, hauteur: r.hauteur || null,
                dateExif: r.exif && r.exif.date ? r.exif.date + 'T' + (r.exif.heure || '00:00') : null,
                original: r.original, affichage: r.affichage || null, miniature: r.miniature || null,
                crc: r.crc || null, favori: false, creeLe: maintenant, modifieLe: maintenant
              } });
            }
            if (ancienne) {
              ops.push({ magasin: 'photos', effacer: ancienne });
              ops.push({ magasin: 'suppressions', mettre: { id: ancienne, type: 'photo', le: maintenant } });
              App.photos.oublierUrl(ancienne);
            }
            const nouveau = {
              id: id, nom: nom, type: etat.type,
              lat: pos ? pos.lat : null, lon: pos ? pos.lon : null,
              precision: pos && etat.precision ? etat.precision : null,
              heures: $('#sp-heures').value.trim(),
              notes: $('#sp-notes').value.trim(),
              photoId: photoId,
              creeLe: spot ? spot.creeLe : maintenant,
              modifieLe: maintenant
            };
            ops.unshift({ magasin: 'spots', mettre: nouveau });
            await App.db.ecrire(ops);
            App.demanderPersistance();
            resultat = nouveau;
            d.close('ok');
          } catch (e) {
            console.error(e);
            App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: e && e.message ? e.message : e }), { erreur: true });
            bouton.disabled = false;
            bouton.innerHTML = u.ic('check') + tr('Enregistrer');
          }
        }
        form.addEventListener('submit', function (ev) { ev.preventDefault(); enregistrer(); });
        $('[data-sp="annuler"]').addEventListener('click', function () { d.close(''); });
        champNom.addEventListener('input', function () { $('#sp-err-nom').hidden = true; });

        d.returnValue = '';
        d.onclick = null; // pas de fermeture en touchant à côté : on perdrait la saisie
        d.onclose = function () {
          if (etat.nouvelle && etat.nouvelle.url) URL.revokeObjectURL(etat.nouvelle.url);
          d.onclose = null;
          resoudre(resultat);
        };
        d.showModal();
        if (!spot && !base.nom) champNom.focus();
      });
    });
  }

  // Après une création : toast + ouverture du spot
  function creerPuisOuvrir(defauts) {
    return editer(null, defauts).then(function (s) {
      if (!s) return;
      App.ui.toast(tr('Spot enregistré : {nom}', { nom: s.nom }));
      App.aller('#/spot/' + encodeURIComponent(s.id));
    });
  }

  /* ---------- Page « Mes spots » ---------- */

  let triDistance = false;

  App.vue('spots', {
    onglet: 'observations',
    afficher: async function (el) {
      const c = await App.donnees.charger();
      const stats = parSpot(c);
      const pos = triDistance ? positionRecente() : null;
      const spots = trier(c.spots, pos);

      const barre = '<div class="outils-obs">' +
        '<button type="button" class="btn btn-prim" data-spots="nouveau">' + u.ic('plus') + tr('Nouveau spot') + '</button>' +
        '<a class="btn btn-second" href="#/carte">' + u.ic('carte') + tr('Carte') + '</a>' +
        (c.spots.length > 1 ? '<button type="button" class="btn btn-doux" data-spots="distance" aria-pressed="' + !!pos + '">' + u.ic('position') + tr(pos ? /*tr*/'Triés par distance' : /*tr*/'Trier par distance') + '</button>' : '') +
        '</div>';

      let contenu;
      if (!c.spots.length) {
        contenu = '<div class="vide">' + u.ic('epingle', 'ic-vide ic-vide-spot') +
          '<h2>' + tr('Aucun spot pour l’instant') + '</h2>' +
          '<p>' + tr('Enregistre tes affûts et tes points d’observation : position GPS, meilleures heures, notes. Pratique pour y retourner photographier, et tu verras quelles espèces tu y as vues.') + '</p>' +
          '<div class="vide-actions"><button type="button" class="btn btn-prim" data-spots="nouveau">' + u.ic('plus') + tr('Nouveau spot') + '</button>' +
          '<a class="btn btn-second" href="#/carte">' + u.ic('carte') + tr('Carte') + '</a></div></div>';
      } else {
        contenu = '<ul class="liste-simple liste-spots">' + spots.map(function (s) {
          const st = stats.get(s.id);
          const infos = [libType(s)];
          if (st) infos.push(u.pluriel(st.especes.size, 'espèce'), tr('dernière fois le {date}', { date: u.dateCourte(st.obs[0].date) }));
          else infos.push(tr('pas encore d’observation'));
          const droite = pos && aUnePosition(s) ? texteDistance(distance(pos, s)) : (!aUnePosition(s) ? tr('sans GPS') : '');
          return '<li><a href="#/spot/' + encodeURIComponent(s.id) + '">' + vignetteSpot(c, s) +
            '<span class="ls-txt"><b>' + u.esc(s.nom) + '</b><small>' + infos.map(u.esc).join(' · ') + '</small></span>' +
            (droite ? '<span class="droite">' + u.esc(droite) + '</span>' : '') + '</a></li>';
        }).join('') + '</ul>';
      }

      // Itinéraires préparés sur la carte
      const blocItin = c.itineraires.length
        ? '<section class="section"><h2>' + u.ic('chemin') + tr('Mes itinéraires') + ' <span class="compte">' + c.itineraires.length + '</span></h2>' +
          '<ul class="liste-simple">' + c.itineraires.map(function (it) {
            const pts = App.itineraires.points(it, c);
            const infos = [u.pluriel(pts.length, 'étape'), tr(it.mode === 'voiture' ? /*tr*/'En voiture' : /*tr*/'À pied')];
            if (pts.length > 1) infos.push(tr('{distance} à vol d’oiseau', { distance: texteDistance(App.itineraires.distance(pts)) }));
            return '<li><a href="#/carte/itineraire/' + encodeURIComponent(it.id) + '"><div class="vignette vignette-spot">' + u.ic('chemin') + '</div>' +
              '<span class="ls-txt"><b>' + u.esc(it.nom) + '</b><small>' + u.esc(infos.join(' · ')) + '</small></span></a></li>';
          }).join('') + '</ul></section>'
        : '';

      el.innerHTML = App.ui.entete({
        titre: tr('Mes spots'),
        sous: c.spots.length ? u.pluriel(c.spots.length, 'spot') : tr('Affûts et points d’observation'),
        retour: '#/observations'
      }) + (c.spots.length ? barre : '') + contenu + blocItin;

      el.querySelectorAll('[data-spots="nouveau"]').forEach(function (b) {
        b.addEventListener('click', function () { creerPuisOuvrir(positionRecente() || {}); });
      });
      const bDist = el.querySelector('[data-spots="distance"]');
      if (bDist) bDist.addEventListener('click', function () {
        if (triDistance && positionRecente()) { triDistance = false; App.rafraichir(); return; }
        bDist.disabled = true;
        bDist.innerHTML = '<span class="rond-charge" aria-hidden="true"></span>' + tr('Recherche de ta position…');
        localiser().then(function () { triDistance = true; App.rafraichir(); }, function (e) {
          App.ui.toast(e.message, { erreur: true });
          bDist.disabled = false;
          bDist.innerHTML = u.ic('position') + tr('Trier par distance');
        });
      });
    }
  });

  /* ---------- Page d'un spot ---------- */

  // Heures des observations faites ici : 24 cases, plus foncées quand il y a plus d'observations
  function bandeHeures(obs) {
    const parHeure = new Array(24).fill(0);
    let n = 0;
    obs.forEach(function (o) {
      const h = parseInt((o.heure || '').slice(0, 2), 10);
      if (h >= 0 && h < 24) { parHeure[h]++; n++; }
    });
    if (!n) return '';
    const max = Math.max.apply(null, parHeure);
    let resumeTxt = '';
    if (n >= 3) {
      // Créneau de 3 heures le plus fréquenté
      let mieux = 0, debut = 0;
      for (let h = 0; h <= 21; h++) {
        const s = parHeure[h] + parHeure[h + 1] + parHeure[h + 2];
        if (s > mieux) { mieux = s; debut = h; }
      }
      const hh = function (h) { return (h < 10 ? '0' : '') + h + ':00'; };
      resumeTxt = '<p class="petit">' + tr('Le plus souvent entre {debut} et {fin} ({n} sur {total})', { debut: hh(debut), fin: hh(debut + 3), n: mieux, total: n }) + '</p>';
    }
    return '<div class="bande-heures" role="img" aria-label="' + u.esc(tr('Heures de tes observations ici')) + '">' +
      parHeure.map(function (v, h) {
        const niveau = v ? Math.max(1, Math.round(v / max * 4)) : 0;
        return '<span class="n' + niveau + '" title="' + (h < 10 ? '0' : '') + h + ':00 · ' + u.esc(u.pluriel(v, 'observation')) + '"></span>';
      }).join('') + '</div>' +
      '<div class="bande-heures-axe" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>' + resumeTxt;
  }

  App.vue('spot', {
    onglet: 'observations',
    afficher: async function (el, params) {
      const c = await App.donnees.charger();
      const spot = c.spotsParId.get(params[0]);
      if (!spot) {
        el.innerHTML = App.ui.entete({ titre: tr('Spot introuvable'), retour: '#/spots' }) +
          '<div class="vide"><p>' + tr('Ce spot n’existe plus (supprimé ou pas encore importé sur cet appareil).') + '</p>' +
          '<a class="btn btn-prim" href="#/spots">' + tr('Mes spots') + '</a></div>';
        return;
      }
      const resume = await App.donnees.resume();
      const st = parSpot(c).get(spot.id) || { obs: [], especes: new Map() };
      const photo = photoDe(c, spot);
      const col = App.collator();

      const blocPhoto = photo
        ? '<button type="button" class="spot-photo" data-spot="photo" aria-label="' + u.esc(tr('Agrandir la photo')) + '">' +
          (photo.affichage || photo.miniature ? '<img src="' + App.photos.url(photo, photo.affichage ? 'affichage' : 'miniature') + '" alt="' + u.esc(spot.nom) + '">' : '<span class="sans-apercu">' + tr('Aperçu indisponible') + '</span>') +
          '</button>'
        : '';

      const blocPosition = aUnePosition(spot)
        ? '<div class="encart spot-position">' +
          '<p class="spot-coord">' + u.ic('epingle') + '<span>' + coordonnees(spot.lat, spot.lon) + (spot.precision ? ' (± ' + spot.precision + ' m)' : '') + '</span></p>' +
          '<p class="spot-trajet" id="sp-trajet">' + (positionRecente() ? u.ic('position') + '<span>' + u.esc(texteTrajet(positionRecente(), spot)) + '</span>' : '') + '</p>' +
          '<div class="actions-fiche">' +
          '<button type="button" class="btn btn-doux" data-spot="trajet">' + u.ic('position') + tr('Distance depuis ma position') + '</button>' +
          '<a class="btn btn-second" href="#/carte/spot/' + encodeURIComponent(spot.id) + '">' + u.ic('carte') + tr('Voir sur la carte') + '</a>' +
          '<a class="btn btn-second" href="' + lienItineraire(spot.lat, spot.lon) + '" target="_blank" rel="noopener">' + u.ic('chemin') + tr('Itinéraire') + '</a>' +
          '</div>' +
          '<p class="aide">' + tr('La distance et la carte marchent sans réseau ; l’itinéraire s’ouvre dans Google Maps et demande une connexion.') + '</p>' +
          '</div>'
        : '<div class="encart encart-verif">' + u.ic('alerte') + '<div>' + tr('Pas de position GPS pour ce spot. Touche « Modifier » sur place pour l’ajouter, ou place-le sur la carte.') +
          '<div class="actions-fiche" style="margin:10px 0 0"><a class="btn btn-second btn-petit" href="#/carte/placer/' + encodeURIComponent(spot.id) + '">' + u.ic('epingle') + tr('Placer sur la carte') + '</a></div>' +
          '</div></div>';

      const blocHeures = (spot.heures || st.obs.length)
        ? '<section class="section"><h2>' + u.ic('horloge') + tr('Meilleures heures') + '</h2>' +
          (spot.heures ? '<p class="spot-texte">' + u.esc(spot.heures) + '</p>' : '') +
          bandeHeures(st.obs) + '</section>'
        : '';

      const blocNotes = spot.notes
        ? '<section class="section"><h2>' + u.ic('crayon') + tr('Notes') + '</h2><p class="spot-texte">' + u.esc(spot.notes) + '</p></section>'
        : '';

      const especes = Array.from(st.especes.entries()).sort(function (a, b) {
        return (b[1].nb - a[1].nb) || col.compare(App.esp.nom(App.esp.get(a[0])), App.esp.nom(App.esp.get(b[0])));
      });
      const blocEspeces = '<section class="section"><h2>' + u.ic('oiseau') + tr('Espèces vues ici') +
        (especes.length ? ' <span class="compte">' + especes.length + '</span>' : '') + '</h2>' +
        (especes.length
          ? '<ul class="liste-simple">' + especes.map(function (x) {
            const e = App.esp.get(x[0]), r = resume.get(x[0]);
            return '<li><a href="#/espece/' + encodeURIComponent(x[0]) + '">' + App.ui.vignette(r && r.couverture, '', x[0]) +
              '<span class="ls-txt"><b>' + u.esc(App.esp.nom(e)) + '</b><small>' + u.esc(tr('dernière fois le {date}', { date: u.dateCourte(x[1].derniere.date) })) + '</small></span>' +
              '<span class="droite">' + u.esc(u.pluriel(x[1].nb, 'obs.', 'obs.||pluriel')) + '</span></a></li>';
          }).join('') + '</ul>'
          : '<p class="muet">' + tr('Aucune observation rattachée à ce spot pour l’instant. Dans le formulaire d’observation, choisis ce spot dans « Spot ».') + '</p>') +
        '</section>';

      el.innerHTML = App.ui.entete({
        titre: u.esc(spot.nom),
        sous: u.ic(typeDe(spot)[2]) + u.esc(libType(spot)),
        retour: '#/spots'
      }) +
        '<div class="spot-page">' + blocPhoto + blocPosition +
        '<div class="actions-fiche">' +
        '<button type="button" class="btn btn-prim" data-spot="observer">' + u.ic('plus') + tr('Nouvelle observation ici') + '</button>' +
        '<button type="button" class="btn btn-second" data-spot="modifier">' + u.ic('crayon') + tr('Modifier') + '</button>' +
        '</div>' +
        blocHeures + blocNotes + blocEspeces +
        '<div class="zone-danger"><button type="button" class="btn btn-danger-doux" data-spot="supprimer">' + u.ic('poubelle') + tr('Supprimer ce spot') + '</button></div>' +
        '</div>';

      el.querySelectorAll('[data-spot]').forEach(function (b) {
        b.addEventListener('click', async function () {
          const a = b.dataset.spot;
          if (a === 'photo') {
            App.photos.ouvrir([{ photo: photo, obs: { date: (photo.dateExif || photo.creeLe || '').slice(0, 10) }, titre: spot.nom }], 0);
          } else if (a === 'trajet') {
            const zone = el.querySelector('#sp-trajet');
            zone.innerHTML = '<span class="rond-charge" aria-hidden="true"></span><span>' + tr('Recherche de ta position… (à découvert, c’est plus rapide)') + '</span>';
            localiser().then(function (p) {
              zone.innerHTML = u.ic('position') + '<span>' + u.esc(texteTrajet(p, spot)) + (p.precision > 100 ? ' · ' + tr('position approximative (± {n} m)', { n: p.precision }) : '') + '</span>';
            }, function (e) { zone.innerHTML = '<span class="erreur-champ">' + u.esc(e.message) + '</span>'; });
          } else if (a === 'observer') {
            App.spots.preselection = spot.id;
            App.aller('#/ajouter');
          } else if (a === 'modifier') {
            const s = await editer(spot);
            if (s) { App.ui.toast(tr('Spot modifié')); App.rafraichir(); }
          } else if (a === 'supprimer') {
            const ok = await App.ui.confirmer({
              titre: tr('Supprimer ce spot ?'),
              texte: tr('« {nom} » sera supprimé avec sa photo. Tes observations restent : elles ne seront simplement plus rattachées à ce spot.', { nom: u.esc(spot.nom) }),
              ok: tr('Supprimer'), danger: true
            });
            if (!ok) return;
            await supprimer(spot);
            App.ui.toast(tr('Spot supprimé'));
            location.replace('#/spots');
          }
        });
      });
    }
  });

  /* ---------- Fiche espèce : bouton « Mes spots » ---------- */

  // Dernier panneau choisi (observations ou spots), retrouvé en revenant sur la même fiche
  let dernierPanneau = { id: null, panneau: 'obs' };

  function panneauFiche(e, c) {
    const note = c.notesEspeces.get(e.id);
    const texte = note && note.perchoirs ? note.perchoirs : '';
    const stats = parSpot(c);
    const ici = trier(c.spots.filter(function (s) { const st = stats.get(s.id); return st && st.especes.has(e.id); }), null)
      .map(function (s) { return { spot: s, info: stats.get(s.id).especes.get(e.id) }; })
      .sort(function (a, b) { return b.info.nb - a.info.nb; });
    // Quelque chose à montrer sur la carte : une observation avec GPS ou un spot placé
    const avecPosition = c.obs.some(function (o) { return o.especeId === e.id && aUnePosition(o); }) ||
      ici.some(function (x) { return aUnePosition(x.spot); });
    return '<div class="encart perchoirs" id="perchoirs">' + perchoirsHtml(texte) + '</div>' +
      '<h3 class="section-titre" style="font-size:18px;margin-top:22px">' + tr('Spots où tu l’as vu') +
      (ici.length ? ' <span class="compte">' + ici.length + '</span>' : '') + '</h3>' +
      (ici.length
        ? '<ul class="liste-simple">' + ici.map(function (x) {
          return '<li><a href="#/spot/' + encodeURIComponent(x.spot.id) + '">' + vignetteSpot(c, x.spot) +
            '<span class="ls-txt"><b>' + u.esc(x.spot.nom) + '</b><small>' + u.esc(libType(x.spot) + ' · ' + tr('dernière fois le {date}', { date: u.dateCourte(x.info.derniere.date) })) + '</small></span>' +
            '<span class="droite">' + u.esc(u.pluriel(x.info.nb, 'obs.', 'obs.||pluriel')) + '</span></a></li>';
        }).join('') + '</ul>'
        : '<p class="muet">' + tr(c.spots.length
          ? /*tr*/'Aucune observation de cette espèce rattachée à un spot. Dans le formulaire d’observation, choisis un spot dans « Spot ».'
          : /*tr*/'Tu n’as pas encore de spot. Crée tes affûts et points d’observation, puis rattache-leur tes observations.') + '</p>') +
      '<div class="actions-fiche">' +
      (avecPosition ? '<a class="btn btn-second" href="#/carte/espece/' + encodeURIComponent(e.id) + '">' + u.ic('carte') + tr('Voir sur la carte') + '</a>' : '') +
      '<a class="btn btn-second" href="#/spots">' + u.ic('epingle') + tr('Tous mes spots') + (c.spots.length ? ' <span class="compte-btn">' + c.spots.length + '</span>' : '') + '</a>' +
      '<button type="button" class="btn btn-doux" data-fiche-spot="nouveau">' + u.ic('plus') + tr('Nouveau spot') + '</button>' +
      '</div>';
  }

  function perchoirsHtml(texte) {
    return '<div class="perch-haut"><h3>' + u.ic('feuille') + tr('Perchoirs connus') + '</h3>' +
      '<button type="button" class="lien-btn" data-perch="editer">' + tr(texte ? /*tr*/'Modifier' : /*tr*/'Ajouter') + '</button></div>' +
      (texte
        ? '<p class="spot-texte">' + u.esc(texte) + '</p>'
        : '<p class="muet petit">' + tr('Où cet oiseau se pose-t-il d’habitude ? Note ses perchoirs : poteau, branche morte du noyer, rocher au-dessus de la rivière…') + '</p>');
  }

  // Remplace le titre « Mes observations » de la fiche par deux boutons : Mes observations | Mes spots
  function enteteFiche(e, c) {
    const panneau = dernierPanneau.id === e.id ? dernierPanneau.panneau : 'obs';
    const stats = parSpot(c);
    const n = c.spots.filter(function (s) { const st = stats.get(s.id); return st && st.especes.has(e.id); }).length;
    return { panneau: panneau, html: '<div class="seg seg-fiche" role="group" aria-label="' + u.esc(tr('Mes observations et mes spots')) + '">' +
      '<button type="button" data-panneau-btn="obs" aria-pressed="' + (panneau === 'obs') + '">' + u.ic('jumelles') + tr('Mes observations') + '</button>' +
      '<button type="button" data-panneau-btn="spots" aria-pressed="' + (panneau === 'spots') + '">' + u.ic('epingle') + tr('Mes spots') +
      (n ? '<span class="compte-btn">' + n + '</span>' : '') + '</button></div>' };
  }

  function brancherFiche(el, e) {
    el.querySelectorAll('[data-panneau-btn]').forEach(function (b) {
      b.addEventListener('click', function () {
        const p = b.dataset.panneauBtn;
        dernierPanneau = { id: e.id, panneau: p };
        el.querySelectorAll('[data-panneau-btn]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        el.querySelectorAll('[data-panneau]').forEach(function (x) { x.hidden = x.dataset.panneau !== p; });
      });
    });
    const nouveau = el.querySelector('[data-fiche-spot="nouveau"]');
    if (nouveau) nouveau.addEventListener('click', function () { creerPuisOuvrir(positionRecente() || {}); });

    const zone = el.querySelector('#perchoirs');
    if (!zone) return;
    zone.addEventListener('click', async function (ev) {
      const b = ev.target.closest('[data-perch]');
      if (!b) return;
      const c = await App.donnees.charger();
      const note = c.notesEspeces.get(e.id);
      const texte = note && note.perchoirs ? note.perchoirs : '';
      const a = b.dataset.perch;
      if (a === 'editer') {
        zone.innerHTML = '<div class="perch-haut"><h3>' + u.ic('feuille') + '<label for="perch-txt">' + tr('Perchoirs connus') + '</label></h3></div>' +
          '<textarea class="entree" id="perch-txt" maxlength="1000" placeholder="' + u.esc(tr('Poteau électrique au bout du chemin, branche morte du grand noyer, matin surtout…')) + '">' + u.esc(texte) + '</textarea>' +
          '<div class="actions-fiche" style="margin-bottom:0">' +
          '<button type="button" class="btn btn-second" data-perch="annuler">' + tr('Annuler') + '</button>' +
          '<button type="button" class="btn btn-prim" data-perch="enregistrer">' + u.ic('check') + tr('Enregistrer') + '</button></div>';
        const t = zone.querySelector('#perch-txt');
        t.focus();
        t.setSelectionRange(t.value.length, t.value.length);
      } else if (a === 'annuler') {
        zone.innerHTML = perchoirsHtml(texte);
      } else if (a === 'enregistrer') {
        const nouveauTexte = zone.querySelector('#perch-txt').value.trim();
        try {
          if (nouveauTexte !== texte) {
            // Le texte vide est gardé (avec sa date) pour que l'effacement passe aussi par les sauvegardes
            await App.db.ecrire([{ magasin: 'notesEspeces', mettre: { id: e.id, perchoirs: nouveauTexte, modifieLe: new Date().toISOString() } }]);
            App.ui.toast(tr('Perchoirs enregistrés'));
          }
          zone.innerHTML = perchoirsHtml(nouveauTexte);
        } catch (err) {
          App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: err.message || err }), { erreur: true });
        }
      }
    });
  }

  /* ---------- Formulaire d'observation : liste des spots ---------- */

  // <option> du champ « Spot » : aucun, les spots (les plus proches d'abord si la position est connue), nouveau
  function optionsSelect(spots, pos, choisi) {
    return '<option value="">' + u.esc(tr('— Aucun spot —')) + '</option>' +
      trier(spots, pos).map(function (s) {
        const dist = pos && aUnePosition(s) ? ' · ' + texteDistance(distance(pos, s)) : '';
        return '<option value="' + u.esc(s.id) + '"' + (s.id === choisi ? ' selected' : '') + '>' + u.esc(s.nom + ' (' + libType(s) + ')' + dist) + '</option>';
      }).join('') +
      '<option value="__nouveau">' + u.esc(tr('＋ Nouveau spot…')) + '</option>';
  }

  App.spots = {
    TYPES: TYPES,
    libType: libType,
    icone: function (spot) { return typeDe(spot)[2]; },
    editer: editer,
    supprimer: supprimer,
    parSpot: parSpot,
    optionsSelect: optionsSelect,
    panneauFiche: panneauFiche,
    enteteFiche: enteteFiche,
    brancherFiche: brancherFiche,
    lireCoordonnees: lireCoordonnees,
    distance: distance,
    texteDistance: texteDistance,
    texteTrajet: texteTrajet,
    coordonnees: coordonnees,
    lienItineraire: lienItineraire,
    localiser: localiser,
    positionRecente: positionRecente,
    noterPosition: noterPosition,
    preselection: null // spot à choisir dans le prochain formulaire d'observation (« Nouvelle observation ici »)
  };
})(window.App);
