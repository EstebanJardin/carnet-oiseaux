/* =====================================================================
   partage.js — carte « Nouvelle espèce ! » à partager
   Image 1080 × 1350 (format portrait Instagram) dessinée dans l'appli :
   ta photo (ou la photo de référence, créditée), le rang de l'espèce dans
   ton carnet, ses noms en 4 langues, le lieu et la date.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const W = 1080, H = 1350, HPHOTO = 1000;
  const SERIF = 'Georgia, "Noto Serif", "Droid Serif", serif';
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif';

  function charger(src) {
    return new Promise(function (ok, ko) {
      const img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { ko(new Error(tr('Image illisible'))); };
      img.src = src;
    });
  }

  // Remplit la zone en recadrant au centre (comme object-fit: cover)
  function couvrir(ctx, img, x, y, w, h) {
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / r, sh = h / r;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }

  // Écrit un texte en réduisant la police jusqu'à ce qu'il tienne
  function texte(ctx, t, x, y, largeurMax, taille, style, famille, couleur) {
    let s = taille;
    do { ctx.font = style + ' ' + s + 'px ' + famille; s -= 2; } while (ctx.measureText(t).width > largeurMax && s > 18);
    ctx.fillStyle = couleur;
    ctx.fillText(t, x, y);
  }

  async function creerCarte(especeId) {
    const resume = await App.donnees.resume();
    const e = App.esp.get(especeId);
    const r = resume.get(especeId);
    const ref = App.photoRef(especeId);

    let src = null, credit = '';
    if (r && r.couverture) src = App.photos.url(r.couverture, 'affichage');
    else if (ref) { src = ref.grande; credit = tr('Photo : {credit}', { credit: ref.auteur + ' · ' + ref.licence + ' · Wikimedia Commons' }); }

    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    x.fillStyle = '#2E5B47';
    x.fillRect(0, 0, W, H);
    if (src) {
      try { couvrir(x, await charger(src), 0, 0, W, HPHOTO); } catch (err) { /* sans photo */ }
    }

    // Crédit de la photo de référence (obligatoire pour les licences libres)
    if (credit) {
      x.font = '24px ' + SANS;
      const lc = Math.min(W - 40, x.measureText(credit).width + 28);
      x.fillStyle = 'rgba(0,0,0,.55)';
      x.fillRect(20, HPHOTO - 58, lc, 40);
      x.fillStyle = '#ffffff';
      x.fillText(credit, 34, HPHOTO - 29, W - 70);
    }

    // Bandeau du bas
    x.fillStyle = '#2E5B47';
    x.fillRect(0, HPHOTO, W, H - HPHOTO);
    x.fillStyle = '#E9B44C';
    x.fillRect(0, HPHOTO, W, 8);

    // Rang de l'espèce dans le carnet (ordre des premières observations)
    let etiquette = tr('MON CARNET D’OISEAUX');
    if (r) {
      const ordre = Array.from(resume.entries())
        .sort(function (a, b) { return App.donnees.cleObs(a[1].premiere).localeCompare(App.donnees.cleObs(b[1].premiere)); })
        .map(function (p) { return p[0]; });
      const rang = ordre.indexOf(especeId) + 1;
      const recente = (Date.now() - Date.parse(r.premiere.date)) < 4 * 86400000;
      etiquette = (recente ? tr('NOUVELLE ESPÈCE') : tr('MON CARNET')) + ' · ' + tr('N° {n}', { n: rang });
    }
    x.textBaseline = 'alphabetic';
    texte(x, etiquette, 60, HPHOTO + 70, 960, 32, '700', SANS, '#E9B44C');
    texte(x, App.esp.nom(e), 60, HPHOTO + 158, 960, 84, '700', SERIF, '#F4F1E8');
    texte(x, App.esp.autresNoms(e).join('  ·  '), 60, HPHOTO + 212, 960, 40, '400', SANS, '#CFE3D7');
    texte(x, e.la, 60, HPHOTO + 260, 960, 36, 'italic 400', SERIF, '#CFE3D7');

    // Lieu et date (dernière observation) + signature de l'appli
    let lieuDate = '';
    if (r) {
      const o = r.derniere;
      lieuDate = [o.lieu, u.dateLongue(o.date)].filter(Boolean).join(' · ');
    }
    x.font = '400 28px ' + SANS;
    x.fillStyle = '#F4F1E8';
    x.fillText(lieuDate, 60, H - 34, 620);
    x.font = '400 24px ' + SANS;
    x.fillStyle = '#9DC3AE';
    const signature = tr('Carnet d’oiseaux · Sredna Gora');
    x.fillText(signature, W - 60 - x.measureText(signature).width, H - 34);

    return new Promise(function (ok, ko) {
      cv.toBlob(function (b) { if (b) ok(b); else ko(new Error(tr('Image impossible à créer'))); }, 'image/jpeg', 0.9);
    });
  }

  // Aperçu + boutons Partager / Enregistrer
  async function ouvrir(especeId) {
    let blob;
    try { blob = await creerCarte(especeId); }
    catch (e) { App.ui.toast(tr('Carte impossible : {erreur}', { erreur: e.message }), { erreur: true }); return; }
    const e = App.esp.get(especeId);
    const nom = u.slug(e.fr) + '_carte.jpg';
    const fichier = new File([blob], nom, { type: 'image/jpeg' });
    let peutPartager = false;
    try { peutPartager = !!(navigator.canShare && navigator.canShare({ files: [fichier] })); } catch (err) { peutPartager = false; }
    const adresse = URL.createObjectURL(blob);
    const d = document.getElementById('dlg-confirm');
    d.innerHTML = '<div class="dlg dlg-partage"><h2>' + tr('Ta carte à partager') + '</h2>' +
      '<img src="' + adresse + '" alt="' + u.esc(tr('Carte de partage : {nom}', { nom: App.esp.nom(e) })) + '">' +
      '<div class="dlg-actions">' +
      '<button type="button" class="btn btn-second" data-x="enregistrer">' + u.ic('telecharger') + tr('Enregistrer') + '</button>' +
      (peutPartager ? '<button type="button" class="btn btn-prim" data-x="partager">' + u.ic('partager') + tr('Partager') + '</button>' : '') +
      '</div><p style="text-align:center;margin:10px 0 0"><button type="button" class="lien-btn" data-x="fermer">' + tr('Fermer') + '</button></p></div>';
    d.onclose = function () { URL.revokeObjectURL(adresse); };
    d.onclick = async function (ev) {
      const b = ev.target.closest('[data-x]');
      if (!b) return;
      if (b.dataset.x === 'fermer') d.close();
      else if (b.dataset.x === 'enregistrer') App.telechargerBlob(blob, nom);
      else if (b.dataset.x === 'partager') {
        try {
          await navigator.share({
            files: [fichier], title: App.esp.nom(e),
            text: tr('{nom} ({autre}) · mon carnet d’oiseaux en Bulgarie 🐦', { nom: App.esp.nom(e), autre: App.langue() === 'bg' ? e.en : e.bg })
          });
        } catch (err) {
          if (err && err.name !== 'AbortError') App.ui.toast(tr('Partage impossible : {erreur}', { erreur: err.message }), { erreur: true });
        }
      }
    };
    d.showModal();
  }

  App.partage = { creerCarte: creerCarte, ouvrir: ouvrir };
})(window.App);
