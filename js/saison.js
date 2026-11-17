/* =====================================================================
   saison.js — page Saison : soleil et lune, arrivées et départs du mois,
   premières observations de l'année.
   + la petite ligne « du jour » en haut du catalogue, avec à côté
     le bouton « Cibles » (la page Cibles est dans cibles.js).
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;

  /* ---------- Calendrier des retours (d'après les mois du catalogue) ---------- */
  const prec = function (m) { return m === 1 ? 12 : m - 1; };
  const suiv = function (m) { return m === 12 ? 1 : m + 1; };
  function plage(e) {
    if (!e.mois || !e.mois.length) return '';
    if (e.mois.length >= 12) return 'toute l’année';
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
      '<a class="jour" href="#/saison" aria-label="Saison : soleil, lune, arrivées du mois">' +
      '<span>' + u.ic('soleil') + (s.lever ? App.astro.heure(s.lever[0]) + '–' + App.astro.heure(s.lever[1]) : '—') + '</span>' +
      '<span>' + App.astro.luneSVG(l.phase, 16) + '<span class="jour-pct">' + Math.round(l.eclairage * 100) + ' %</span></span>' +
      // Sur téléphone, le mot « arrivées » et la flèche se cachent pour laisser la place au bouton Cibles
      (arrivees ? '<span>' + u.ic('feuille') + arrivees + '<span class="jour-mot">&nbsp;' + (arrivees > 1 ? 'arrivées' : 'arrivée') + '</span></span>' : '') +
      '<span class="jour-fleche">' + u.ic('droite') + '</span></a>' +
      '<a class="jour jour-cibles" href="#/cibles" aria-label="Mes cibles' + (deSaison ? ' : ' + deSaison + ' de saison maintenant' : '') + '">' +
      '<span class="cible-ic">' + u.ic('cible') + (deSaison ? '<b class="compte-cibles">' + deSaison + '</b>' : '') + '</span>Cibles</a>' +
      '</div>';
  };

  /* ---------- Page Saison ---------- */
  function dateSofia(d, opts) {
    try { return d.toLocaleDateString('fr-FR', Object.assign({ timeZone: 'Europe/Sofia' }, opts)); }
    catch (e) { return d.toLocaleDateString('fr-FR', opts); }
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
      '<span class="maintenant" style="left:' + p(new Date()) + '" title="Maintenant"></span></div>' +
      '<div class="barre-heures"><span>0 h</span><span>6 h</span><span>12 h</span><span>18 h</span><span>24 h</span></div>';
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
      let soleilHtml = '<p class="muet">Calcul impossible pour cette position.</p>';
      if (s.lever && s.civil && s.bleue && s.doree) {
        const duree = s.lever[1] - s.lever[0];
        const ecart = Math.round((duree - (hier.lever[1] - hier.lever[0])) / 60000);
        soleilHtml = barreSoleil(s) +
          '<table class="table-soleil"><tr><th></th><th>Matin</th><th>Soir</th></tr>' +
          '<tr><td><span class="pastille-c bleue"></span>Heure bleue</td><td>' + H(s.civil[0]) + '–' + H(s.bleue[0]) + '</td><td>' + H(s.bleue[1]) + '–' + H(s.civil[1]) + '</td></tr>' +
          '<tr><td><span class="pastille-c doree"></span>Heure dorée</td><td>' + H(s.bleue[0]) + '–' + H(s.doree[0]) + '</td><td>' + H(s.doree[1]) + '–' + H(s.bleue[1]) + '</td></tr>' +
          '<tr><td>' + u.ic('soleil') + 'Soleil</td><td>lever <b>' + H(s.lever[0]) + '</b></td><td>coucher <b>' + H(s.lever[1]) + '</b></td></tr>' +
          '</table>' +
          '<p class="muet petit" style="margin:8px 0 0">Durée du jour : ' + App.astro.duree(duree) +
          ' (' + (ecart >= 0 ? '+' : '−') + Math.abs(ecart) + ' min depuis hier) · midi solaire ' + H(s.midi) + '</p>';
      }

      // Lune
      const luneHtml = '<div class="lune-carte">' + App.astro.luneSVG(l.phase, 56) +
        '<div><b>' + l.nom + '</b><br><span class="muet petit">éclairée à ' + Math.round(l.eclairage * 100) + ' %</span><br>' +
        '<span class="petit">Pleine lune : ' + dateSofia(l.prochainePleine, { weekday: 'short', day: 'numeric', month: 'short' }) +
        ' · nouvelle lune : ' + dateSofia(l.prochaineNouvelle, { weekday: 'short', day: 'numeric', month: 'short' }) + '</span></div></div>';

      // 7 prochains jours
      let semaine = '<table class="table-soleil"><tr><th>Jour</th><th>Lever</th><th>Coucher</th><th>Lune</th></tr>';
      for (let i = 1; i <= 7; i++) {
        const d = new Date(maintenant.valueOf() + i * 86400000);
        const sd = App.astro.soleil(d, pos.lat, pos.lon);
        const ld = App.astro.lune(d);
        semaine += '<tr><td>' + dateSofia(d, { weekday: 'short', day: 'numeric', month: 'short' }) + '</td><td>' +
          (sd.lever ? H(sd.lever[0]) : '—') + '</td><td>' + (sd.lever ? H(sd.lever[1]) : '—') + '</td><td>' +
          App.astro.luneSVG(ld.phase, 16) + ' ' + Math.round(ld.eclairage * 100) + ' %</td></tr>';
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
          '<p style="margin-top:8px"><a class="lien-btn" href="#/stats">Toute ta liste ' + annee + ' (' + premieres.size + ' espèces)</a></p>'
        : '<p class="muet">Ta première observation de ' + annee + ' apparaîtra ici.</p>';

      el.innerHTML =
        App.ui.entete({
          titre: 'Saison',
          sous: dateSofia(maintenant, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + u.esc(pos.nom),
          retour: '#/catalogue'
        }) +
        '<section class="section" style="margin-top:10px"><h2>' + u.ic('soleil') + 'Lumière du jour</h2><div class="encart">' + soleilHtml + '</div></section>' +
        '<section class="section"><h2>Lune</h2><div class="encart">' + luneHtml +
        '<details class="details-simple"><summary>Les 7 prochains jours</summary>' + semaine + '</details></div></section>' +
        '<section class="section"><h2>' + u.ic('feuille') + 'Ce mois-ci</h2>' +
        '<h3 class="sous-titre">Arrivent en ' + nomMois + '</h3>' + bandeMini(arrivees, resume, annee, 'Pas de nouvelle arrivée ce mois-ci.') +
        '<h3 class="sous-titre">Dernières chances en ' + nomMois + '</h3>' + bandeMini(departs, resume, annee, 'Aucun départ prévu ce mois-ci.') +
        '<h3 class="sous-titre">Bientôt : arrivent en ' + nomMoisSuiv + '</h3>' + bandeMini(bientot, resume, annee, 'Pas d’arrivée prévue le mois prochain.') +
        '<p class="muet petit">D’après les mois de présence du catalogue. ✓ = déjà vue cette année.</p></section>' +
        '<section class="section"><h2>Premières de ' + annee + '</h2>' + premieresHtml + '</section>' +
        '<p class="muet petit">Heures de Bulgarie, calculées pour ' + u.esc(pos.nom) + ' (' + pos.lat.toFixed(2).replace('.', ',') + ' N, ' +
        pos.lon.toFixed(2).replace('.', ',') + ' E), sans connexion.</p>';
    }
  });
})(window.App);
