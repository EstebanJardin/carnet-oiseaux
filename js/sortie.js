/* =====================================================================
   sortie.js — Mode sortie : compter les oiseaux d'une balade
   Un toucher sur « + » = un individu. À la fin, chaque espèce comptée
   devient une observation (date, heure du premier contact, lieu, nombre).
   La sortie en cours est gardée dans le navigateur : si l'appli se ferme,
   elle reprend là où tu en étais.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const CLE = 'sortie';

  function lire() { return App.prefs.get(CLE, null); }
  function sauver(s) { App.prefs.set(CLE, s); }

  function duree(debutISO, finISO) {
    const ms = (finISO ? Date.parse(finISO) : Date.now()) - Date.parse(debutISO);
    const min = Math.max(0, Math.round(ms / 60000));
    return min < 60 ? tr('{n} min', { n: min }) : tr('{h} h {m}', { h: Math.floor(min / 60), m: String(min % 60).padStart(2, '0') });
  }
  function totaux(s) {
    let esp = 0, ind = 0;
    Object.keys(s.comptes || {}).forEach(function (id) { esp++; ind += s.comptes[id].n; });
    return { esp: esp, ind: ind };
  }

  // Petite pastille « Sortie en cours » visible sur les autres écrans
  function majPastille(nomVue) {
    const p = document.getElementById('pastille-sortie');
    if (!p) return;
    const s = lire();
    // Sur « Mes observations », le bouton du haut affiche déjà « Reprendre »
    if (!s || nomVue === 'sortie' || nomVue === 'ajouter' || nomVue === 'modifier' || nomVue === 'observations') { p.hidden = true; return; }
    const t = totaux(s);
    p.innerHTML = '<span class="point" aria-hidden="true"></span>' + tr('Sortie en cours') + ' · ' + u.pluriel(t.esp, 'espèce') + ' · ' + duree(s.debut);
    p.hidden = false;
  }
  setInterval(function () { majPastille(document.body.dataset.vue); }, 60000);

  App.sortie = { enCours: lire, duree: duree, totaux: totaux, majPastille: majPastille };

  /* ---------- Position GPS (facultative) ---------- */
  function boutonGps(bouton, info, pos) {
    function afficher() {
      if (pos.lat === null) { info.innerHTML = ''; return; }
      info.innerHTML = u.ic('epingle') + '<span>' + u.decimal(pos.lat, 5) + ' ' + tr('N||latitude nord') + ' · ' + u.decimal(pos.lon, 5) + ' ' + tr('E||longitude est') +
        (pos.precision ? ' (± ' + pos.precision + ' m)' : '') + '</span>';
    }
    bouton.addEventListener('click', function () {
      if (!navigator.geolocation) { App.ui.toast(tr('GPS non disponible sur cet appareil'), { erreur: true }); return; }
      info.innerHTML = '<span class="rond-charge" aria-hidden="true"></span><span>' + tr('Recherche de ta position…') + '</span>';
      navigator.geolocation.getCurrentPosition(function (p) {
        pos.lat = Math.round(p.coords.latitude * 1e6) / 1e6;
        pos.lon = Math.round(p.coords.longitude * 1e6) / 1e6;
        pos.precision = Math.round(p.coords.accuracy);
        afficher();
      }, function (err) {
        info.innerHTML = '<span class="erreur-champ">' + (err.code === 1 ? tr('Accès à la position refusé.') : tr('Position introuvable pour l’instant.')) + '</span>';
      }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 30000 });
    });
    afficher();
  }

  /* ---------- Départ ---------- */
  async function depart(el) {
    const c = await App.donnees.charger();
    const lieux = [];
    c.obs.forEach(function (o) { if (o.lieu && lieux.indexOf(o.lieu) === -1 && lieux.length < 40) lieux.push(o.lieu); });
    const pos = { lat: null, lon: null, precision: null };
    el.innerHTML =
      App.ui.entete({ titre: tr('Nouvelle sortie'), retour: '#/observations', sansOutils: true }) +
      '<div class="form" style="padding-bottom:30px">' +
      '<p class="muet" style="margin:0">' + tr('Compte les oiseaux au fil de ta balade : un toucher sur <b>+</b> = un individu. À la fin, chaque espèce devient une observation de ton carnet (date, heure, lieu, nombre).') + '</p>' +
      '<div class="champ"><label for="s-lieu">' + tr('Lieu de la sortie') + '</label>' +
      '<div class="ligne-lieu"><input type="text" class="entree" id="s-lieu" list="s-lieux" autocomplete="off" placeholder="' + u.esc(tr('Boucle de la rivière, forêt au-dessus du village…')) + '" value="' +
      u.esc(App.prefs.get('dernierLieuSortie', '')) + '">' +
      '<button type="button" class="btn btn-doux btn-gps" id="s-gps">' + u.ic('position') + tr('Ma position') + '</button></div>' +
      '<datalist id="s-lieux">' + lieux.map(function (l) { return '<option value="' + u.esc(l) + '">'; }).join('') + '</datalist>' +
      '<div class="gps-info" id="s-gps-info"></div></div>' +
      '<button type="button" class="btn btn-prim btn-bloc" id="s-go" style="min-height:60px">' + u.ic('chemin') + tr('Démarrer la sortie') + '</button>' +
      '</div>';
    boutonGps(el.querySelector('#s-gps'), el.querySelector('#s-gps-info'), pos);
    el.querySelector('#s-go').addEventListener('click', function () {
      const lieu = el.querySelector('#s-lieu').value.trim();
      sauver({
        id: u.uid('sortie'), debut: new Date().toISOString(), date: u.dateISO(),
        lieu: lieu, lat: pos.lat, lon: pos.lon, precision: pos.precision, comptes: {}
      });
      App.prefs.set('dernierLieuSortie', lieu);
      App.rafraichir();
    });
  }

  /* ---------- Comptage ---------- */
  async function enCours(el, s) {
    const c = await App.donnees.charger();
    const resume = await App.donnees.resume();
    const langue = App.langue();
    const col = App.collator(langue);
    const m = u.moisActuel();
    const frequence = {};
    c.obs.forEach(function (o) { frequence[o.especeId] = (frequence[o.especeId] || 0) + 1; });
    let requete = '';

    el.innerHTML =
      '<header class="entete">' +
      '<a class="btn-icone" href="#/observations" data-action="retour" aria-label="' + u.esc(tr('Quitter cet écran (la sortie continue)')) + '">' + u.ic('retour') + '</a>' +
      '<div class="entete-txt"><h1>' + tr('Sortie en cours') + '</h1><p class="sous">' + u.esc(s.lieu || tr('Lieu non précisé')) +
      ' · ' + tr('depuis {heure}', { heure: u.heureHM(new Date(s.debut)) }) + ' · <span id="s-chrono"></span></p></div></header>' +
      '<div class="sortie-totaux" aria-live="polite"><span id="s-esp"></span><span id="s-ind"></span></div>' +
      '<div class="barre-recherche"><label class="recherche">' + u.ic('recherche') + '<span class="sr-only">' + tr('Ajouter une autre espèce') + '</span>' +
      '<input type="search" id="s-q" placeholder="' + u.esc(tr('Une autre espèce ? Cherche-la ici')) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></label></div>' +
      '<div id="s-liste" class="liste-sortie"></div>' +
      '<div class="barre-enreg"><button type="button" class="btn btn-second" id="s-annuler">' + tr('Abandonner') + '</button>' +
      '<button type="button" class="btn btn-prim" id="s-fin">' + u.ic('check') + tr('Terminer') + '</button></div>';

    const zone = el.querySelector('#s-liste');

    function ligne(e) {
      const cpt = s.comptes[e.id];
      const n = cpt ? cpt.n : 0;
      const r = resume.get(e.id);
      return '<div class="ligne-sortie' + (n ? ' comptee' : '') + '" data-id="' + u.esc(e.id) + '">' +
        App.ui.vignette(r && r.couverture, '', e.id) +
        '<div class="ls-nom"><b>' + u.esc(App.esp.nom(e, langue)) + '</b>' + (r ? '' : '<small class="nouv">' + tr('pas encore vue') + '</small>') + '</div>' +
        '<button type="button" class="cpt" data-moins aria-label="' + u.esc(tr('Un de moins')) + '"' + (n ? '' : ' hidden') + '>−</button>' +
        '<span class="cpt-n"' + (n ? '' : ' hidden') + '>' + n + '</span>' +
        '<button type="button" class="cpt plus" data-plus aria-label="' + u.esc(tr('Compter un {nom}', { nom: App.esp.nom(e, langue) })) + '">+</button>' +
        '</div>';
    }

    function rendre() {
      if (requete) {
        const f = App.esp.filtre(requete);
        const res = App.esp.liste.filter(f).sort(function (a, b) { return col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue)); });
        zone.innerHTML = res.length ? res.map(ligne).join('') : '<p class="muet">' + tr('Aucune espèce ne correspond.') + '</p>';
        return;
      }
      const comptees = Object.keys(s.comptes).filter(App.esp.existe).map(App.esp.get)
        .sort(function (a, b) { return (s.comptes[b.id].t || 0) - (s.comptes[a.id].t || 0); });
      const probables = App.esp.liste.filter(function (e) { return !s.comptes[e.id] && e.mois.indexOf(m) !== -1; })
        .sort(function (a, b) {
          return ((frequence[b.id] || 0) - (frequence[a.id] || 0)) || col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue));
        });
      zone.innerHTML =
        (comptees.length ? '<h3 class="sous-titre">' + tr('Comptées') + '</h3>' + comptees.map(ligne).join('') : '') +
        '<h3 class="sous-titre">' + tr('Probables en {mois}', { mois: u.MOIS[m - 1] }) + '</h3>' + probables.map(ligne).join('') +
        '<p class="muet petit" style="margin-top:12px">' + tr('Une espèce absente de cette liste ? Cherche-la avec le champ du haut.') + '</p>';
    }

    function majTotaux() {
      const t = totaux(s);
      el.querySelector('#s-esp').innerHTML = '<b>' + t.esp + '</b> ' + u.mot(t.esp, 'espèce');
      el.querySelector('#s-ind').innerHTML = '<b>' + t.ind + '</b> ' + u.mot(t.ind, 'individu');
    }

    // Les lignes ne bougent pas pendant qu'on compte (pas de clic au mauvais endroit)
    zone.addEventListener('click', function (ev) {
      const b = ev.target.closest('[data-plus],[data-moins]');
      if (!b) return;
      const rangee = b.closest('[data-id]');
      const id = rangee.dataset.id;
      const cpt = s.comptes[id] || { n: 0, heure: u.heureHM(), t: Date.now() };
      cpt.n += b.hasAttribute('data-plus') ? 1 : -1;
      if (cpt.n <= 0) delete s.comptes[id]; else s.comptes[id] = cpt;
      sauver(s);
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { /* pas de vibreur */ }
      const n = cpt.n > 0 ? cpt.n : 0;
      rangee.classList.toggle('comptee', n > 0);
      const zoneN = rangee.querySelector('.cpt-n');
      zoneN.textContent = n;
      zoneN.hidden = !n;
      rangee.querySelector('[data-moins]').hidden = !n;
      majTotaux();
    });

    const champ = el.querySelector('#s-q');
    champ.addEventListener('input', u.debounce(function () { requete = champ.value; rendre(); }, 120));
    champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') champ.blur(); });

    const chrono = el.querySelector('#s-chrono');
    const majChrono = function () { chrono.textContent = duree(s.debut); };
    majChrono();
    const minuteur = setInterval(majChrono, 30000);
    App.surNettoyage(function () { clearInterval(minuteur); });

    el.querySelector('#s-annuler').addEventListener('click', async function () {
      const ok = await App.ui.confirmer({
        titre: tr('Abandonner la sortie ?'),
        texte: tr('Les comptages de cette sortie seront perdus.'),
        ok: tr('Abandonner'), danger: true
      });
      if (!ok) return;
      App.prefs.set(CLE, null);
      location.replace('#/observations');
    });

    el.querySelector('#s-fin').addEventListener('click', async function () {
      const t = totaux(s);
      if (!t.esp) { App.ui.toast(tr('Aucun oiseau compté pour l’instant')); return; }
      const ok = await App.ui.confirmer({
        titre: tr('Terminer la sortie ?'),
        texte: tr('{especes} et {individus} seront ajoutés à ton carnet.', { especes: u.pluriel(t.esp, 'espèce'), individus: u.pluriel(t.ind, 'individu') }),
        ok: tr('Terminer')
      });
      if (!ok) return;
      const fin = new Date().toISOString();
      const ops = Object.keys(s.comptes).map(function (id) {
        return {
          magasin: 'observations',
          mettre: {
            id: u.uid('obs'), especeId: id, date: s.date, heure: s.comptes[id].heure,
            lieu: s.lieu, lat: s.lat, lon: s.lon, precision: s.precision,
            nombre: s.comptes[id].n, comportements: [], meteo: [], temperature: null, notes: '',
            photoIds: [], sonIds: [], sortie: { id: s.id, debut: s.debut, fin: fin },
            creeLe: fin, modifieLe: fin
          }
        };
      });
      try {
        await App.db.ecrire(ops);
      } catch (e) {
        App.ui.toast(tr('Enregistrement impossible : {erreur}', { erreur: e && e.message ? e.message : e }), { erreur: true });
        return;
      }
      App.prefs.set(CLE, null);
      App.demanderPersistance();
      location.replace('#/sortie/bilan/' + encodeURIComponent(s.id));
    });

    rendre();
    majTotaux();
  }

  /* ---------- Bilan ---------- */
  async function bilan(el, id) {
    const c = await App.donnees.charger();
    const resume = await App.donnees.resume();
    const langue = App.langue();
    const obs = c.obs.filter(function (o) { return o.sortie && o.sortie.id === id; });
    if (!obs.length) {
      el.innerHTML = App.ui.entete({ titre: tr('Sortie introuvable'), retour: '#/observations' }) +
        '<div class="vide"><p>' + tr('Cette sortie n’existe plus sur cet appareil.') + '</p><a class="btn btn-prim" href="#/observations">' + tr('Mes observations') + '</a></div>';
      return;
    }
    const info = obs[0].sortie;
    const lieu = obs[0].lieu;
    const individus = obs.reduce(function (s, o) { return s + (parseInt(o.nombre, 10) || 0); }, 0);
    obs.sort(function (a, b) { return (b.nombre - a.nombre) || App.collator(langue).compare(App.esp.nom(App.esp.get(a.especeId), langue), App.esp.nom(App.esp.get(b.especeId), langue)); });
    const nouvelles = obs.filter(function (o) { const r = resume.get(o.especeId); return r && r.premiere && r.premiere.id === o.id; });
    const cibles = nouvelles.filter(function (o) { return App.cibles.contient(o.especeId); });
    const d = duree(info.debut, info.fin);

    el.innerHTML =
      App.ui.entete({ titre: tr('Bilan de la sortie'), sous: u.dateLongue(obs[0].date) + (lieu ? ' · ' + u.esc(lieu) : ''), retour: '#/observations' }) +
      '<div class="chiffres" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:8px">' +
      '<div class="chiffre"><b>' + obs.length + '</b><span>' + u.mot(obs.length, 'espèce') + '</span></div>' +
      '<div class="chiffre"><b>' + individus + '</b><span>' + u.mot(individus, 'individu') + '</span></div>' +
      '<div class="chiffre"><b>' + d + '</b><span>' + tr('de sortie') + '</span></div></div>' +
      (nouvelles.length
        ? '<div class="bandeau bandeau-info"><div class="txt"><span>🎉 ' + tr('{n} pour ton carnet : {noms}', {
            n: u.pluriel(nouvelles.length, 'nouvelle espèce', 'nouvelles espèces'),
            noms: nouvelles.map(function (o) { return u.esc(App.esp.nom(App.esp.get(o.especeId), langue)); }).join(', ')
          }) +
          (cibles.length ? ' · 🎯 ' + u.pluriel(cibles.length, 'cible atteinte', 'cibles atteintes') : '') + '</span></div></div>'
        : '') +
      '<ul class="liste-simple" style="margin-top:12px">' + obs.map(function (o) {
        const e = App.esp.get(o.especeId), r = resume.get(o.especeId);
        return '<li><a href="#/espece/' + encodeURIComponent(o.especeId) + '">' + App.ui.vignette(r && r.couverture, '', o.especeId) +
          '<span class="ls-txt"><b>' + u.esc(App.esp.nom(e, langue)) + '</b><small>' + tr('premier contact à {heure}', { heure: u.esc(o.heure || '?') }) + '</small></span>' +
          '<span class="droite"><b>× ' + o.nombre + '</b></span></a></li>';
      }).join('') + '</ul>' +
      '<div class="actions-fiche"><button type="button" class="btn btn-prim" id="b-partager">' + u.ic('partager') + tr('Partager le bilan') + '</button>' +
      '<a class="btn btn-second" href="#/observations">' + tr('Mes observations') + '</a></div>' +
      '<p class="muet petit">' + tr('Pour ajouter une photo ou un chant à une espèce de cette sortie, ouvre-la dans ton journal puis touche « Modifier ».') + '</p>';

    el.querySelector('#b-partager').addEventListener('click', async function () {
      const v = { date: u.dateLongue(obs[0].date), lieu: lieu, duree: d, especes: u.pluriel(obs.length, 'espèce'), oiseaux: u.pluriel(individus, 'oiseau', 'oiseaux') };
      const texte = (lieu ? tr('Sortie oiseaux du {date} à {lieu} ({duree}) : {especes}, {oiseaux} 🐦', v)
        : tr('Sortie oiseaux du {date} ({duree}) : {especes}, {oiseaux} 🐦', v)) + '\n' +
        obs.map(function (o) { return App.esp.nom(App.esp.get(o.especeId), langue) + (o.nombre > 1 ? ' ×' + o.nombre : ''); }).join(', ') +
        '\n— ' + tr('Carnet d’oiseaux · Sredna Gora');
      try {
        if (navigator.share) { await navigator.share({ title: tr('Ma sortie oiseaux'), text: texte }); return; }
        await navigator.clipboard.writeText(texte);
        App.ui.toast(tr('Bilan copié : colle-le où tu veux'));
      } catch (e) {
        if (e && e.name !== 'AbortError') App.ui.toast(tr('Partage impossible : {erreur}', { erreur: e.message }), { erreur: true });
      }
    });
  }

  App.vue('sortie', {
    onglet: 'sortie',
    afficher: async function (el, params) {
      if (params[0] === 'bilan') return bilan(el, params[1]);
      const s = lire();
      return s ? enCours(el, s) : depart(el);
    }
  });
})(window.App);
