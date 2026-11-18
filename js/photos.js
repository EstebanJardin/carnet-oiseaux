/* =====================================================================
   photos.js — traitement des photos et visionneuse plein écran
   - L'original est conservé tel quel (pour le téléchargement).
   - Deux copies compressées en JPEG : « affichage » (1600 px) et
     « miniature » (480 px) pour des listes rapides.
   - Lecture EXIF (date/heure de prise de vue, GPS) des photos JPEG.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const MAX_AFFICHAGE = 1600, Q_AFFICHAGE = 0.82;
  const MAX_MINIATURE = 480, Q_MINIATURE = 0.74;

  /* ---------- Décodage et compression ---------- */

  function decoder(blob) {
    return new Promise(function (ok, ko) {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.decoding = 'async';
      img.onload = function () { ok({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); ko(new Error(tr('Format d’image non lisible par le navigateur'))); };
      img.src = url;
    });
  }

  function redessiner(source, largeur, hauteur, max) {
    const r = Math.min(1, max / Math.max(largeur, hauteur));
    const w = Math.max(1, Math.round(largeur * r));
    const h = Math.max(1, Math.round(hauteur * r));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, w, h);
    return c;
  }

  function enJpeg(canvas, qualite) {
    return new Promise(function (ok, ko) {
      canvas.toBlob(function (b) { if (b) ok(b); else ko(new Error(tr('Compression impossible'))); }, 'image/jpeg', qualite);
    });
  }

  // Prépare une photo choisie par l'utilisateur
  async function traiter(fichier) {
    const res = {
      original: fichier,
      nomOriginal: fichier.name || 'photo.jpg',
      type: fichier.type || 'image/jpeg',
      taille: fichier.size,
      affichage: null, miniature: null, largeur: null, hauteur: null,
      exif: {}, crc: null
    };
    try { res.exif = await lireExif(fichier); } catch (e) { res.exif = {}; }
    let d = null;
    try {
      d = await decoder(fichier);
      const w = d.img.naturalWidth, h = d.img.naturalHeight;
      res.largeur = w; res.hauteur = h;
      const cAff = redessiner(d.img, w, h, MAX_AFFICHAGE);
      res.affichage = await enJpeg(cAff, Q_AFFICHAGE);
      const cMin = redessiner(cAff, cAff.width, cAff.height, MAX_MINIATURE);
      res.miniature = await enJpeg(cMin, Q_MINIATURE);
      cAff.width = cAff.height = 0;
      cMin.width = cMin.height = 0;
    } catch (e) {
      console.warn('Aperçu impossible :', e);
    } finally {
      if (d) URL.revokeObjectURL(d.url);
    }
    // Empreintes CRC calculées une fois pour toutes : l'export .zip sera instantané
    try {
      res.crc = {
        original: await App.zip.crcBlob(fichier),
        affichage: res.affichage ? await App.zip.crcBlob(res.affichage) : null,
        miniature: res.miniature ? await App.zip.crcBlob(res.miniature) : null
      };
    } catch (e) { res.crc = null; }
    return res;
  }

  /* ---------- EXIF (JPEG) : date de prise de vue et GPS ---------- */

  async function lireExif(fichier) {
    const nom = (fichier.name || '').toLowerCase();
    if (!/jpe?g/.test(fichier.type || '') && !/\.jpe?g$/.test(nom)) return {};
    const tampon = await fichier.slice(0, 256 * 1024).arrayBuffer();
    const v = new DataView(tampon);
    if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return {};
    let pos = 2;
    while (pos + 4 <= v.byteLength) {
      const marqueur = v.getUint16(pos);
      if ((marqueur & 0xFF00) !== 0xFF00) break;
      const longueur = v.getUint16(pos + 2);
      if (marqueur === 0xFFE1 && pos + 10 <= v.byteLength && v.getUint32(pos + 4) === 0x45786966) {
        return lireTiff(v, pos + 10);
      }
      if (marqueur === 0xFFDA) break;
      pos += 2 + longueur;
    }
    return {};
  }

  function lireTiff(v, t) {
    const res = {};
    try {
      const le = v.getUint16(t) === 0x4949;
      const u16 = function (o) { return v.getUint16(o, le); };
      const u32 = function (o) { return v.getUint32(o, le); };
      if (u16(t + 2) !== 42) return res;
      const lireIFD = function (o) {
        const tags = {};
        if (o + 2 > v.byteLength) return tags;
        const n = u16(o);
        for (let i = 0; i < n; i++) {
          const e = o + 2 + i * 12;
          if (e + 12 > v.byteLength) break;
          tags[u16(e)] = { type: u16(e + 2), nb: u32(e + 4), val: e + 8 };
        }
        return tags;
      };
      const texte = function (tag) {
        const debut = tag.nb > 4 ? t + u32(tag.val) : tag.val;
        let s = '';
        for (let i = 0; i < tag.nb && debut + i < v.byteLength; i++) {
          const c = v.getUint8(debut + i);
          if (c === 0) break;
          s += String.fromCharCode(c);
        }
        return s;
      };
      const rationnels = function (tag) {
        const debut = t + u32(tag.val);
        const out = [];
        for (let i = 0; i < tag.nb; i++) {
          const num = u32(debut + i * 8), den = u32(debut + i * 8 + 4);
          out.push(den ? num / den : 0);
        }
        return out;
      };
      const ifd0 = lireIFD(t + u32(t + 4));
      let date = null;
      if (ifd0[0x8769]) {
        const exif = lireIFD(t + u32(ifd0[0x8769].val));
        const tag = exif[0x9003] || exif[0x9004];
        if (tag) date = texte(tag);
      }
      if (!date && ifd0[0x0132]) date = texte(ifd0[0x0132]);
      if (date) {
        const m = date.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
        if (m && m[1] !== '0000') { res.date = m[1] + '-' + m[2] + '-' + m[3]; res.heure = m[4] + ':' + m[5]; }
      }
      if (ifd0[0x8825]) {
        const g = lireIFD(t + u32(ifd0[0x8825].val));
        if (g[2] && g[4] && g[2].nb === 3 && g[4].nb === 3) {
          const la = rationnels(g[2]), lo = rationnels(g[4]);
          let lat = la[0] + la[1] / 60 + la[2] / 3600;
          let lon = lo[0] + lo[1] / 60 + lo[2] / 3600;
          if (g[1] && texte(g[1]) === 'S') lat = -lat;
          if (g[3] && texte(g[3]) === 'W') lon = -lon;
          if (isFinite(lat) && isFinite(lon) && (lat !== 0 || lon !== 0) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
            res.lat = Math.round(lat * 1e6) / 1e6;
            res.lon = Math.round(lon * 1e6) / 1e6;
          }
        }
      }
    } catch (e) { /* EXIF incomplet : on ignore */ }
    return res;
  }

  /* ---------- Adresses temporaires des images ---------- */

  const urls = new Map();
  function url(photo, variante) {
    variante = variante || 'miniature';
    let blob = photo[variante];
    if (!blob && variante !== 'original') blob = photo.affichage || photo.miniature;
    if (!blob) return '';
    const cle = photo.id + ':' + variante;
    let x = urls.get(cle);
    if (!x) { x = URL.createObjectURL(blob); urls.set(cle, x); }
    return x;
  }
  function oublierUrl(id) {
    ['miniature', 'affichage', 'original'].forEach(function (v) {
      const cle = id + ':' + v;
      if (urls.has(cle)) { URL.revokeObjectURL(urls.get(cle)); urls.delete(cle); }
    });
  }

  /* ---------- Téléchargement avec un nom clair ---------- */

  function extension(photo) {
    const m = (photo.nomOriginal || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    if (m) return m[1] === 'jpeg' ? 'jpg' : m[1];
    const t = photo.type || '';
    if (/png/.test(t)) return 'png';
    if (/heic|heif/.test(t)) return 'heic';
    if (/webp/.test(t)) return 'webp';
    return 'jpg';
  }

  // « pic-epeiche_2026-11-17.jpg », puis _2, _3… s'il y a plusieurs photos ce jour-là
  async function nomFichier(photo) {
    const c = await App.donnees.charger();
    if (photo.spotId) { // photo d'un spot : « spot_affut-du-noyer_2026-11-18.jpg »
      const s = c.spotsParId.get(photo.spotId);
      return 'spot_' + u.slug(s ? s.nom : 'spot') + '_' + (photo.creeLe || '').slice(0, 10) + '.' + extension(photo);
    }
    const o = c.obsParId.get(photo.observationId);
    const e = App.esp.get(photo.especeId);
    const date = o ? o.date : (photo.creeLe || '').slice(0, 10);
    const memeJour = [];
    c.obs.slice().reverse().forEach(function (x) {
      if (x.especeId === photo.especeId && x.date === date) {
        App.donnees.photosDe(c, x).forEach(function (p) { memeJour.push(p.id); });
      }
    });
    const rang = memeJour.indexOf(photo.id);
    const suffixe = memeJour.length > 1 && rang >= 0 ? '_' + (rang + 1) : '';
    return u.slug(e.fr) + '_' + date + suffixe + '.' + extension(photo);
  }

  App.telechargerBlob = function (blob, nom) {
    const lien = document.createElement('a');
    const x = URL.createObjectURL(blob);
    lien.href = x;
    lien.download = nom;
    lien.rel = 'noopener';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(function () { URL.revokeObjectURL(x); }, 120000);
  };

  async function telecharger(photo) {
    const blob = photo.original || photo.affichage;
    if (!blob) { App.ui.toast(tr('Fichier introuvable'), { erreur: true }); return; }
    const nom = await nomFichier(photo);
    App.telechargerBlob(blob, nom);
    App.ui.toast(tr('Téléchargement : {nom}', { nom: nom }));
  }

  /* ---------- Visionneuse plein écran ---------- */

  const visio = { liste: [], index: 0, modifie: false, pret: false };

  function preparerVisio() {
    if (visio.pret) return;
    visio.pret = true;
    const d = document.getElementById('visionneuse');
    d.innerHTML =
      '<div class="visio-haut">' +
      '<div class="visio-titre"><b></b><small></small></div>' +
      '<button type="button" class="btn-icone" data-v="fav" data-t-title="Choisir comme photo de couverture de l’espèce" title="' + u.esc(tr('Choisir comme photo de couverture de l’espèce')) + '">' + u.ic('etoile') + '</button>' +
      '<button type="button" class="btn-icone" data-v="dl" data-t-title="Télécharger l’original" data-t-aria="Télécharger l’original" title="' + u.esc(tr('Télécharger l’original')) + '" aria-label="' + u.esc(tr('Télécharger l’original')) + '">' + u.ic('telecharger') + '</button>' +
      '<button type="button" class="btn-icone" data-v="fermer" data-t-aria="Fermer la visionneuse" aria-label="' + u.esc(tr('Fermer la visionneuse')) + '">' + u.ic('x') + '</button>' +
      '</div>' +
      '<div class="visio-scene">' +
      '<img alt="">' +
      '<button type="button" class="visio-nav prec" data-v="prec" data-t-aria="Photo précédente" aria-label="' + u.esc(tr('Photo précédente')) + '">' + u.ic('gauche') + '</button>' +
      '<button type="button" class="visio-nav suiv" data-v="suiv" data-t-aria="Photo suivante" aria-label="' + u.esc(tr('Photo suivante')) + '">' + u.ic('droite') + '</button>' +
      '</div>' +
      '<div class="visio-bas"><span class="compteur"></span><span class="visio-sep"> · </span><a href="#" data-v="fiche" data-t="Voir la fiche de l’espèce">' + tr('Voir la fiche de l’espèce') + '</a></div>';

    d.addEventListener('click', function (ev) {
      const b = ev.target.closest('[data-v]');
      if (!b) return;
      const a = b.dataset.v;
      if (a === 'fermer') d.close();
      else if (a === 'prec') aller(-1);
      else if (a === 'suiv') aller(1);
      else if (a === 'dl') telecharger(visio.liste[visio.index].photo);
      else if (a === 'fav') basculerFavori();
      else if (a === 'fiche') {
        ev.preventDefault();
        const id = visio.liste[visio.index].photo.especeId;
        d.close();
        location.hash = '#/espece/' + encodeURIComponent(id);
      }
    });
    d.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); aller(-1); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); aller(1); }
      else if (ev.key === 'Home') { visio.index = 0; montrer(); }
      else if (ev.key === 'End') { visio.index = visio.liste.length - 1; montrer(); }
    });
    // Glisser le doigt vers la gauche ou la droite
    const scene = d.querySelector('.visio-scene');
    let depart = null;
    scene.addEventListener('pointerdown', function (ev) { depart = { x: ev.clientX, y: ev.clientY, t: Date.now() }; });
    scene.addEventListener('pointerup', function (ev) {
      if (!depart) return;
      const dx = ev.clientX - depart.x, dy = ev.clientY - depart.y;
      depart = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) aller(dx < 0 ? 1 : -1);
    });
    scene.addEventListener('pointercancel', function () { depart = null; });
    d.addEventListener('close', function () {
      d.querySelector('.visio-scene img').removeAttribute('src');
      if (visio.modifie) { visio.modifie = false; App.rafraichir(); }
    });
  }

  function aller(sens) {
    const n = visio.liste.length;
    if (n < 2) return;
    visio.index = (visio.index + sens + n) % n;
    montrer();
  }

  function montrer() {
    const d = document.getElementById('visionneuse');
    const el = visio.liste[visio.index];
    const p = el.photo, o = el.obs || {};
    const e = App.esp.get(p.especeId);
    // Photo d'un spot : pas d'espèce, donc ni couverture ni lien vers une fiche
    const titre = p.especeId ? App.esp.nom(e) : (el.titre || '');
    d.querySelector('[data-v="fav"]').hidden = !p.especeId;
    d.querySelector('.visio-bas [data-v="fiche"]').hidden = !p.especeId;
    d.querySelector('.visio-bas').classList.toggle('sans-fiche', !p.especeId);
    const img = d.querySelector('.visio-scene img');
    const src = url(p, 'affichage');
    if (src) { img.src = src; img.alt = titre; } else { img.removeAttribute('src'); img.alt = tr('Aperçu indisponible : télécharge l’original'); }
    d.querySelector('.visio-titre b').textContent = titre;
    d.querySelector('.visio-titre small').textContent =
      [o.date ? u.dateLongue(o.date) : '', o.heure || '', o.lieu || ''].filter(Boolean).join(' · ');
    d.querySelector('.compteur').textContent = (visio.index + 1) + ' / ' + visio.liste.length;
    const fav = d.querySelector('[data-v="fav"]');
    fav.classList.toggle('fav-on', !!p.favori);
    fav.setAttribute('aria-pressed', String(!!p.favori));
    fav.setAttribute('aria-label', p.favori ? tr('Photo de couverture de l’espèce (retirer)') : tr('Choisir comme photo de couverture'));
    const plusieurs = visio.liste.length > 1;
    d.querySelectorAll('.visio-nav').forEach(function (b) { b.hidden = !plusieurs; });
    // Précharge les voisines
    [1, -1].forEach(function (s) {
      const voisin = visio.liste[(visio.index + s + visio.liste.length) % visio.liste.length];
      if (voisin && voisin !== el) { const pre = new Image(); pre.src = url(voisin.photo, 'affichage'); }
    });
  }

  async function basculerFavori() {
    const el = visio.liste[visio.index];
    try {
      const devient = await App.donnees.definirFavori(el.photo.id);
      visio.liste.forEach(function (x) {
        if (x.photo.especeId === el.photo.especeId) x.photo = Object.assign({}, x.photo, { favori: false });
      });
      el.photo = Object.assign({}, el.photo, { favori: devient });
      visio.modifie = true;
      montrer();
      App.ui.toast(devient ? tr('Photo de couverture de l’espèce') : tr('Photo de couverture retirée'));
    } catch (e) { App.ui.toast(tr('Impossible : {erreur}', { erreur: e.message }), { erreur: true }); }
  }

  // liste : [{ photo, obs }]
  function ouvrirVisio(liste, index) {
    if (!liste.length) return;
    preparerVisio();
    visio.liste = liste.slice();
    visio.index = Math.max(0, Math.min(index || 0, liste.length - 1));
    const d = document.getElementById('visionneuse');
    if (!d.open) d.showModal();
    montrer();
  }

  App.photos = {
    traiter: traiter,
    lireExif: lireExif,
    url: url,
    oublierUrl: oublierUrl,
    nomFichier: nomFichier,
    telecharger: telecharger,
    ouvrir: ouvrirVisio
  };
})(window.App);
