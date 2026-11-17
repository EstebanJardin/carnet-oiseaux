/* =====================================================================
   stats.js — Rubrique 4 : statistiques
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;

  function cleMois(d) { return d.y + '-' + u.pad(d.m); }
  function moisSuivant(d) { return d.m === 12 ? { y: d.y + 1, m: 1 } : { y: d.y, m: d.m + 1 }; }
  function moisMoins(d, n) {
    let y = d.y, m = d.m - n;
    while (m < 1) { m += 12; y--; }
    return { y: y, m: m };
  }
  function nomMois(d) {
    const t = u.MOIS[d.m - 1] + ' ' + d.y;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // Graphique en barres : nombre d'observations par mois (une seule série)
  // largeur : largeur réelle en pixels, pour que le texte garde sa taille sur téléphone
  function graphique(mois, largeur) {
    const W = Math.round(largeur), H = 220, G = 4, D = 4, HAUT = 26, BAS = 42;
    const n = mois.length;
    const pas = (W - G - D) / n;
    const lb = Math.min(46, pas - 6);
    const max = Math.max(1, Math.max.apply(null, mois.map(function (x) { return x.nb; })));
    const ech = (H - HAUT - BAS) / max;
    const base = H - BAS;
    const iMax = mois.findIndex(function (x) { return x.nb === max; });
    let barres = '', etiquettes = '', zones = '';
    mois.forEach(function (x, i) {
      const cx = G + i * pas + pas / 2;
      const gx = cx - lb / 2;
      if (x.nb > 0) {
        const h = Math.max(3, x.nb * ech);
        const y = base - h;
        const r = Math.min(4, h, lb / 2);
        barres += '<path class="barre" data-i="' + i + '" d="M' + gx.toFixed(1) + ' ' + base + 'V' + (y + r).toFixed(1) +
          'Q' + gx.toFixed(1) + ' ' + y.toFixed(1) + ' ' + (gx + r).toFixed(1) + ' ' + y.toFixed(1) +
          'H' + (gx + lb - r).toFixed(1) + 'Q' + (gx + lb).toFixed(1) + ' ' + y.toFixed(1) + ' ' + (gx + lb).toFixed(1) + ' ' + (y + r).toFixed(1) +
          'V' + base + 'Z"/>';
        if (i === iMax) etiquettes += '<text class="val" x="' + cx.toFixed(1) + '" y="' + (y - 7).toFixed(1) + '" text-anchor="middle">' + x.nb + '</text>';
      } else {
        barres += '<rect class="barre-0" x="' + gx.toFixed(1) + '" y="' + (base - 2) + '" width="' + lb.toFixed(1) + '" height="2" rx="1"/>';
      }
      etiquettes += '<text x="' + cx.toFixed(1) + '" y="' + (base + 17) + '" text-anchor="middle"' + (x.actuel ? ' style="font-weight:800;fill:var(--encre)"' : '') + '>' + u.MOIS_COURT[x.d.m - 1].replace('.', '') + '</text>';
      if (x.d.m === 1 || i === 0) etiquettes += '<text x="' + cx.toFixed(1) + '" y="' + (base + 32) + '" text-anchor="middle">' + x.d.y + '</text>';
      zones += '<rect class="zone" data-i="' + i + '" x="' + (G + i * pas).toFixed(1) + '" y="0" width="' + pas.toFixed(1) + '" height="' + H + '" fill="transparent"><title>' +
        nomMois(x.d) + ' : ' + u.pluriel(x.nb, 'observation') + '</title></rect>';
    });
    return '<svg class="graph" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Nombre d’observations par mois">' +
      '<line class="axe" x1="' + G + '" x2="' + (W - D) + '" y1="' + base + '" y2="' + base + '"/>' +
      barres + etiquettes + zones + '</svg>';
  }

  App.vue('stats', {
    afficher: async function (el) {
      const c = await App.donnees.charger();
      const resume = await App.donnees.resume();
      const langue = App.langue();
      const total = App.esp.liste.length;
      const vues = App.esp.liste.filter(function (e) { return resume.has(e.id); }).length;
      const pct = total ? Math.round(vues / total * 100) : 0;

      if (!c.obs.length) {
        el.innerHTML = App.ui.entete({ titre: 'Statistiques' }) +
          '<div class="vide"><svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>' +
          '<h2>Pas encore de chiffres</h2><p>Les statistiques apparaîtront dès ta première observation.</p>' +
          '<a class="btn btn-prim" href="#/ajouter">' + u.ic('plus') + 'Ajouter une observation</a></div>';
        return;
      }

      let individus = 0, photos = 0;
      const jours = new Set();
      c.obs.forEach(function (o) { individus += Math.max(0, parseInt(o.nombre, 10) || 0); jours.add(o.date); });
      resume.forEach(function (r) { photos += r.photos.length; });

      // --- Observations par mois (6 à 12 derniers mois)
      const now = new Date();
      const fin = { y: now.getFullYear(), m: now.getMonth() + 1 };
      const premiere = c.obs[c.obs.length - 1].date.split('-').map(Number);
      let debut = { y: premiere[0], m: premiere[1] };
      const ecart = (fin.y - debut.y) * 12 + (fin.m - debut.m);
      if (ecart > 11) debut = moisMoins(fin, 11);
      if (ecart < 5) debut = moisMoins(fin, 5);
      const parMois = {};
      c.obs.forEach(function (o) {
        const k = (o.date || '').slice(0, 7);
        if (!parMois[k]) parMois[k] = { nb: 0, especes: new Set() };
        parMois[k].nb++;
        parMois[k].especes.add(o.especeId);
      });
      const mois = [];
      for (let d = debut; cleMois(d) <= cleMois(fin); d = moisSuivant(d)) {
        const p = parMois[cleMois(d)];
        mois.push({ d: d, nb: p ? p.nb : 0, especes: p ? p.especes.size : 0, actuel: cleMois(d) === cleMois(fin) });
      }

      // --- Dernières espèces ajoutées (première observation de chaque espèce)
      const nouvelles = Array.from(resume.entries())
        .map(function (x) { return { id: x[0], r: x[1] }; })
        .sort(function (a, b) { return App.donnees.cleObs(b.r.premiere).localeCompare(App.donnees.cleObs(a.r.premiere)); })
        .slice(0, 8);

      // --- Premières observations de l'année
      const annees = Array.from(new Set(c.obs.map(function (o) { return (o.date || '').slice(0, 4); }))).sort().reverse();
      let annee = App.prefs.get('anneeStats', '');
      if (annees.indexOf(annee) === -1) annee = annees.indexOf(String(fin.y)) !== -1 ? String(fin.y) : annees[0];

      function listeAnnee(a) {
        const premieres = new Map();
        c.obs.slice().reverse().forEach(function (o) { // ordre chronologique
          if ((o.date || '').slice(0, 4) === a && !premieres.has(o.especeId)) premieres.set(o.especeId, o);
        });
        const l = Array.from(premieres.values());
        return '<p class="muet petit" style="margin-bottom:8px">' + u.pluriel(l.length, 'espèce') + ' observée' + (l.length > 1 ? 's' : '') + ' en ' + a + ', dans l’ordre de leur première observation.</p>' +
          '<ul class="liste-simple">' + l.map(function (o, i) {
            const e = App.esp.get(o.especeId);
            const r = resume.get(o.especeId);
            return '<li><a href="#/espece/' + encodeURIComponent(o.especeId) + '">' +
              '<span class="muet" style="min-width:26px;text-align:right;font-weight:700">' + (i + 1) + '</span>' +
              App.ui.vignette(r && r.couverture, '', o.especeId) +
              '<span class="ls-txt"><b>' + u.esc(App.esp.nom(e, langue)) + '</b><small>' + u.esc(o.lieu || '') + '</small></span>' +
              '<span class="droite">' + u.dateCourte(o.date) + '</span></a></li>';
          }).join('') + '</ul>';
      }

      // --- Par groupe
      const groupes = Object.keys(window.GROUPES).map(function (g) {
        const esp = App.esp.liste.filter(function (e) { return e.groupe === g; });
        const ok = esp.filter(function (e) { return resume.has(e.id); }).length;
        return { g: g, total: esp.length, ok: ok };
      }).filter(function (x) { return x.total > 0; });

      el.innerHTML =
        App.ui.entete({ titre: 'Statistiques', sous: 'Depuis le ' + u.dateLongue(c.obs[c.obs.length - 1].date) }) +

        '<section class="section" style="margin-top:12px">' +
        '<div class="encart">' +
        '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap">' +
        '<div><span style="font:600 40px/1 var(--police-titre)">' + vues + '</span>' +
        '<span class="muet" style="font-size:18px"> / ' + total + ' espèces du catalogue</span></div>' +
        '<b style="font-size:20px">' + pct + ' %</b></div>' +
        '<div class="progression" style="height:12px;margin-top:12px" role="progressbar" aria-label="Espèces observées" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + vues + '"><span style="width:' + pct + '%"></span></div>' +
        '</div></section>' +

        '<div class="chiffres">' +
        '<div class="chiffre"><b>' + u.nombre(c.obs.length) + '</b><span>observations</span></div>' +
        '<div class="chiffre"><b>' + u.nombre(individus) + '</b><span>individus comptés</span></div>' +
        '<div class="chiffre"><b>' + u.nombre(photos) + '</b><span>photos</span></div>' +
        '<div class="chiffre"><b>' + u.nombre(jours.size) + '</b><span>jours de terrain</span></div>' +
        '</div>' +

        '<section class="section"><h2>Observations par mois</h2>' +
        '<div class="encart">' + graphique(mois, Math.max(280, Math.min(900, el.clientWidth - 72))) +
        '<p id="graph-info" class="petit" style="margin:8px 0 0;min-height:22px" aria-live="polite"></p></div>' +
        '<table class="sr-only"><caption>Observations par mois</caption><tr><th>Mois</th><th>Observations</th><th>Espèces</th></tr>' +
        mois.map(function (x) { return '<tr><td>' + nomMois(x.d) + '</td><td>' + x.nb + '</td><td>' + x.especes + '</td></tr>'; }).join('') +
        '</table></section>' +

        '<section class="section"><h2>Dernières espèces ajoutées</h2>' +
        '<ul class="liste-simple">' + nouvelles.map(function (x) {
          const e = App.esp.get(x.id);
          return '<li><a href="#/espece/' + encodeURIComponent(x.id) + '">' + App.ui.vignette(x.r.couverture, '', x.id) +
            '<span class="ls-txt"><b>' + u.esc(App.esp.nom(e, langue)) + '</b><small>' + u.esc(window.GROUPES[e.groupe] || '') + '</small></span>' +
            '<span class="droite">1<sup>re</sup> obs.<br>' + u.dateCourte(x.r.premiere.date) + '</span></a></li>';
        }).join('') + '</ul></section>' +

        '<section class="section"><h2>Premières observations de l’année</h2>' +
        (annees.length > 1 ? '<div class="annees" role="group" aria-label="Année">' + annees.map(function (a) {
          return '<button type="button" class="puce' + (a === annee ? ' on' : '') + '" data-annee="' + a + '" aria-pressed="' + (a === annee) + '">' + a + '</button>';
        }).join('') + '</div>' : '') +
        '<div id="liste-annee">' + listeAnnee(annee) + '</div></section>' +

        '<section class="section"><h2>Par groupe</h2><div class="encart groupes-stats">' +
        groupes.map(function (x) {
          const p = Math.round(x.ok / x.total * 100);
          return '<div class="groupe-ligne"><div class="gl-haut"><span>' + u.esc(window.GROUPES[x.g]) + '</span><span>' + x.ok + ' / ' + x.total + '</span></div>' +
            '<div class="progression" role="progressbar" aria-label="' + u.esc(window.GROUPES[x.g]) + '" aria-valuemin="0" aria-valuemax="' + x.total + '" aria-valuenow="' + x.ok + '"><span style="width:' + p + '%"></span></div></div>';
        }).join('') + '</div></section>';

      // Survol / toucher d'une barre : détail du mois
      const info = el.querySelector('#graph-info');
      const svg = el.querySelector('.graph');
      function montrer(i) {
        const x = mois[i];
        info.innerHTML = '<b>' + nomMois(x.d) + '</b> : ' + u.pluriel(x.nb, 'observation') + (x.nb ? ', ' + u.pluriel(x.especes, 'espèce') : '');
        svg.querySelectorAll('.barre').forEach(function (b) { b.classList.toggle('active', b.dataset.i === String(i)); });
      }
      svg.addEventListener('pointerover', function (ev) { const z = ev.target.closest('[data-i]'); if (z) montrer(Number(z.dataset.i)); });
      svg.addEventListener('click', function (ev) { const z = ev.target.closest('[data-i]'); if (z) montrer(Number(z.dataset.i)); });
      montrer(mois.length - 1);

      el.querySelectorAll('[data-annee]').forEach(function (b) {
        b.addEventListener('click', function () {
          annee = b.dataset.annee;
          App.prefs.set('anneeStats', annee);
          el.querySelectorAll('[data-annee]').forEach(function (x) {
            x.classList.toggle('on', x === b);
            x.setAttribute('aria-pressed', String(x === b));
          });
          el.querySelector('#liste-annee').innerHTML = listeAnnee(annee);
        });
      });
    }
  });
})(window.App);
