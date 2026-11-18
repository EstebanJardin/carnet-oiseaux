/* =====================================================================
   saison.js — page Saison : soleil et lune, arrivées et départs du mois,
   premières observations de l'année.
   + la petite ligne « du jour » en haut du catalogue, avec à côté
     le bouton « Cibles » (la page Cibles est dans cibles.js).
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;

  /* ---------- Calendrier des retours (d'après les mois du catalogue) ---------- */
  const prec = function (m) { return m === 1 ? 12 : m - 1; };
  const suiv = function (m) { return m === 12 ? 1 : m + 1; };
  function plage(e) {
    if (!e.mois || !e.mois.length) return '';
    if (e.mois.length >= 12) return tr('toute l’année');
    const present = function (m) { return e.mois.indexOf(m) !== -1; };
    const morceaux = [];
    for (let m = 1; m <= 12; m++) {
      if (present(m) && !present(prec(m))) {
        let fin = m;
        while (present(suiv(fin)) && suiv(fin) !== m) fin = suiv(fin);
        morceaux.push(fin === m ? u.MOIS_COURT[m - 1] : u.MOIS_COURT[m - 1] + ' → ' + u.MOIS_COURT[fin - 1]);
      }
    }
    return morceaux.join(', ');
  }
  App.saison = {
    arrivees: function (m) {
      return App.esp.liste.filter(function (e) { return e.mois.length < 12 && e.mois.indexOf(m) !== -1 && e.mois.indexOf(prec(m)) === -1; });
    },
    departs: function (m) {
      return App.esp.liste.filter(function (e) { return e.mois.length < 12 && e.mois.indexOf(m) !== -1 && e.mois.indexOf(suiv(m)) === -1; });
    },
    plage: plage
  };

  /* ---------- Ligne « du jour » (catalogue) + bouton « Cibles » à côté ---------- */
  App.saison.bandeauJour = async function () {
    const pos = await App.astro.position();
    const resume = await App.donnees.resume();
    const maintenant = new Date();
    const s = App.astro.soleil(maintenant, pos.lat, pos.lon);
    const l = App.astro.lune(maintenant);
    const m = u.moisActuel();
    const arrivees = App.saison.arrivees(m).length;
    const deSaison = App.cibles.deSaison(resume, m).length; // cibles à trouver, présentes ce mois-ci
    return '<div class="jour-ligne">' +
      '<a class="jour" href="#/saison" aria-label="' + u.esc(tr('Saison : soleil, lune, arrivées du mois')) + '">' +
      '<span>' + u.ic('soleil') + (s.lever ? App.astro.heure(s.lever[0]) + '–' + App.astro.heure(s.lever[1]) : '—') + '</span>' +
      '<span>' + App.astro.luneSVG(l.phase, 16) + '<span class="jour-pct">' + u.pct(Math.round(l.eclairage * 100)) + '</span></span>' +
      // Sur téléphone, le mot « arrivées » et la flèche se cachent pour laisser la place au bouton Cibles
      (arrivees ? '<span>' + u.ic('feuille') + arrivees + '<span class="jour-mot">&nbsp;' + u.mot(arrivees, 'arrivée') + '</span></span>' : '') +
      '<span class="jour-fleche">' + u.ic('droite') + '</span></a>' +
      '<a class="jour jour-cibles" href="#/cibles" aria-label="' + u.esc(deSaison ? tr('Mes cibles : {n} de saison maintenant', { n: deSaison }) : tr('Mes cibles')) + '">' +
      '<span class="cible-ic">' + u.ic('cible') + (deSaison ? '<b class="compte-cibles">' + deSaison + '</b>' : '') + '</span>' + tr('Cibles') + '</a>' +
      '</div>';
  };

  /* ---------- Page Saison ---------- */
  function dateSofia(d, opts) {
    try { return d.toLocaleDateString(App.locale(), Object.assign({ timeZone: 'Europe/Sofia' }, opts)); }
    catch (e) { return d.toLocaleDateString(App.locale(), opts); }
  }

  function barreSoleil(s) {
    if (!s.lever || !s.civil || !s.bleue || !s.doree) return '';
    const p = function (d) { return (App.astro.minutesSofia(d) / 1440 * 100).toFixed(2) + '%'; };
    const NUIT = '#22304a', BLEUE = '#4f78b0', DOREE = '#e5a646', JOUR = '#f2e3a6';
    const arrets = [
      [NUIT, '0%'], [NUIT, p(s.civil[0])], [BLEUE, p(s.civil[0])], [BLEUE, p(s.bleue[0])],
      [DOREE, p(s.bleue[0])], [DOREE, p(s.doree[0])], [JOUR, p(s.doree[0])], [JOUR, p(s.doree[1])],
      [DOREE, p(s.doree[1])], [DOREE, p(s.bleue[1])], [BLEUE, p(s.bleue[1])], [BLEUE, p(s.civil[1])],
      [NUIT, p(s.civil[1])], [NUIT, '100%']
    ];
    return '<div class="barre-soleil" style="background:linear-gradient(90deg,' + arrets.map(function (a) { return a[0] + ' ' + a[1]; }).join(',') + ')">' +
      '<span class="maintenant" style="left:' + p(new Date()) + '" title="' + u.esc(tr('Maintenant')) + '"></span></div>' +
      '<div class="barre-heures">' + [0, 6, 12, 18, 24].map(function (h) { return '<span>' + tr('{h} h', { h: h }) + '</span>'; }).join('') + '</div>';
  }

  function miniEspece(e, resume, annee) {
    const r = resume.get(e.id);
    const vue = r && r.obs.some(function (o) { return (o.date || '').slice(0, 4) === annee; });
    return '<a class="mini-esp" href="#/espece/' + encodeURIComponent(e.id) + '">' +
      App.ui.vignette(r && r.couverture, '', e.id) +
      '<span>' + u.esc(App.esp.nom(e)) + (vue ? ' <b class="vue">✓</b>' : '') + '</span></a>';
  }
  function bandeMini(liste, resume, annee, vide) {
    return liste.length
      ? '<div class="bande-mini">' + liste.map(function (e) { return miniEspece(e, resume, annee); }).join('') + '</div>'
      : '<p class="muet petit">' + vide + '</p>';
  }

  App.vue('saison', {
    onglet: 'saison',

    afficher: async function (el) {
      const c = await App.donnees.charger();
      const resume = await App.donnees.resume();
      const pos = await App.astro.position();
      const maintenant = new Date();
      const s = App.astro.soleil(maintenant, pos.lat, pos.lon);
      const hier = App.astro.soleil(new Date(maintenant.valueOf() - 86400000), pos.lat, pos.lon);
      const l = App.astro.lune(maintenant);
      const m = u.moisActuel();
      const annee = String(maintenant.getFullYear());
      const H = App.astro.heure;

      // Soleil
      let soleilHtml = '<p class="muet">' + tr('Calcul impossible pour cette position.') + '</p>';
      if (s.lever && s.civil && s.bleue && s.doree) {
        const duree = s.lever[1] - s.lever[0];
        const ecart = Math.round((duree - (hier.lever[1] - hier.lever[0])) / 60000);
        soleilHtml = barreSoleil(s) +
          '<table class="table-soleil"><tr><th></th><th>' + tr('Matin') + '</th><th>' + tr('Soir') + '</th></tr>' +
          '<tr><td><span class="pastille-c bleue"></span>' + tr('Heure bleue') + '</td><td>' + H(s.civil[0]) + '–' + H(s.bleue[0]) + '</td><td>' + H(s.bleue[1]) + '–' + H(s.civil[1]) + '</td></tr>' +
          '<tr><td><span class="pastille-c doree"></span>' + tr('Heure dorée') + '</td><td>' + H(s.bleue[0]) + '–' + H(s.doree[0]) + '</td><td>' + H(s.doree[1]) + '–' + H(s.bleue[1]) + '</td></tr>' +
          '<tr><td>' + u.ic('soleil') + tr('Soleil||astre') + '</td><td>' + tr('lever') + ' <b>' + H(s.lever[0]) + '</b></td><td>' + tr('coucher') + ' <b>' + H(s.lever[1]) + '</b></td></tr>' +
          '</table>' +
          '<p class="muet petit" style="margin:8px 0 0">' + tr('Durée du jour : {duree} ({ecart} min depuis hier) · midi solaire {midi}', {
            duree: App.astro.duree(duree), ecart: (ecart >= 0 ? '+' : '−') + Math.abs(ecart), midi: H(s.midi)
          }) + '</p>';
      }

      // Lune
      const luneHtml = '<div class="lune-carte">' + App.astro.luneSVG(l.phase, 56) +
        '<div><b>' + l.nom + '</b><br><span class="muet petit">' + tr('éclairée à {pct}', { pct: u.pct(Math.round(l.eclairage * 100)) }) + '</span><br>' +
        '<span class="petit">' + tr('Pleine lune : {pleine} · nouvelle lune : {nouvelle}', {
          pleine: dateSofia(l.prochainePleine, { weekday: 'short', day: 'numeric', month: 'short' }),
          nouvelle: dateSofia(l.prochaineNouvelle, { weekday: 'short', day: 'numeric', month: 'short' })
        }) + '</span></div></div>';

      // 7 prochains jours
      let semaine = '<table class="table-soleil"><tr><th>' + tr('Jour') + '</th><th>' + tr('Lever') + '</th><th>' + tr('Coucher') + '</th><th>' + tr('Lune') + '</th></tr>';
      for (let i = 1; i <= 7; i++) {
        const d = new Date(maintenant.valueOf() + i * 86400000);
        const sd = App.astro.soleil(d, pos.lat, pos.lon);
        const ld = App.astro.lune(d);
        semaine += '<tr><td>' + dateSofia(d, { weekday: 'short', day: 'numeric', month: 'short' }) + '</td><td>' +
          (sd.lever ? H(sd.lever[0]) : '—') + '</td><td>' + (sd.lever ? H(sd.lever[1]) : '—') + '</td><td>' +
          App.astro.luneSVG(ld.phase, 16) + ' ' + u.pct(Math.round(ld.eclairage * 100)) + '</td></tr>';
      }
      semaine += '</table>';

      // Calendrier des retours
      const nomMois = u.MOIS[m - 1], nomMoisSuiv = u.MOIS[(m % 12)];
      const arrivees = App.saison.arrivees(m), departs = App.saison.departs(m), bientot = App.saison.arrivees((m % 12) + 1);

      // Premières de l'année (plus récentes d'abord)
      const premieres = new Map();
      c.obs.slice().reverse().forEach(function (o) {
        if ((o.date || '').slice(0, 4) === annee && !premieres.has(o.especeId)) premieres.set(o.especeId, o);
      });
      const dernieresPremieres = Array.from(premieres.values()).reverse().slice(0, 6);
      const premieresHtml = dernieresPremieres.length
        ? '<ul class="liste-simple">' + dernieresPremieres.map(function (o) {
            const e = App.esp.get(o.especeId), r = resume.get(o.especeId);
            return '<li><a href="#/espece/' + encodeURIComponent(o.especeId) + '">' + App.ui.vignette(r && r.couverture, '', o.especeId) +
              '<span class="ls-txt"><b>' + u.esc(App.esp.nom(e)) + '</b><small>' + u.esc(o.lieu || '') + '</small></span>' +
              '<span class="droite">' + u.dateCourte(o.date) + '</span></a></li>';
          }).join('') + '</ul>' +
          '<p style="margin-top:8px"><a class="lien-btn" href="#/stats">' + tr('Toute ta liste {annee} ({n})', { annee: annee, n: u.pluriel(premieres.size, 'espèce') }) + '</a></p>'
        : '<p class="muet">' + tr('Ta première observation de {annee} apparaîtra ici.', { annee: annee }) + '</p>';

      el.innerHTML =
        App.ui.entete({
          titre: tr('Saison'),
          sous: dateSofia(maintenant, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + u.esc(pos.nom),
          retour: '#/catalogue'
        }) +
        '<section class="section" style="margin-top:10px"><h2>' + u.ic('soleil') + tr('Lumière du jour') + '</h2><div class="encart">' + soleilHtml + '</div></section>' +
        '<section class="section"><h2>' + tr('Lune') + '</h2><div class="encart">' + luneHtml +
        '<details class="details-simple"><summary>' + tr('Les 7 prochains jours') + '</summary>' + semaine + '</details></div></section>' +
        '<section class="section"><h2>' + u.ic('feuille') + tr('Ce mois-ci') + '</h2>' +
        '<h3 class="sous-titre">' + tr('Arrivent en {mois}', { mois: nomMois }) + '</h3>' + bandeMini(arrivees, resume, annee, tr('Pas de nouvelle arrivée ce mois-ci.')) +
        '<h3 class="sous-titre">' + tr('Dernières chances en {mois}', { mois: nomMois }) + '</h3>' + bandeMini(departs, resume, annee, tr('Aucun départ prévu ce mois-ci.')) +
        '<h3 class="sous-titre">' + tr('Bientôt : arrivent en {mois}', { mois: nomMoisSuiv }) + '</h3>' + bandeMini(bientot, resume, annee, tr('Pas d’arrivée prévue le mois prochain.')) +
        '<p class="muet petit">' + tr('D’après les mois de présence du catalogue. ✓ = déjà vue cette année.') + '</p></section>' +
        '<section class="section"><h2>' + tr('Premières de {annee}', { annee: annee }) + '</h2>' + premieresHtml + '</section>' +
        '<p class="muet petit">' + tr('Heures de Bulgarie, calculées pour {lieu} ({lat} N, {lon} E), sans connexion.', {
          lieu: u.esc(pos.nom), lat: u.decimal(pos.lat, 2), lon: u.decimal(pos.lon, 2)
        }) + '</p>';
    }
  });
})(window.App);
