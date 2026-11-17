/* =====================================================================
   cibles.js — Mes cibles : les espèces que tu veux trouver ou
   photographier, avec leur saison. Page #/cibles, ouverte par le
   bouton « Cibles » à côté de la ligne du jour (en haut du catalogue).
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;

  /* ---------- La liste (gardée dans les réglages et dans les sauvegardes) ---------- */
  App.cibles = {
    liste: function () { return App.prefs.get('cibles', []); },
    contient: function (id) { return App.cibles.liste().indexOf(id) !== -1; },
    basculer: function (id) {
      const l = App.cibles.liste().slice();
      const i = l.indexOf(id);
      if (i === -1) l.push(id); else l.splice(i, 1);
      App.prefs.set('cibles', l);
      return i === -1;
    },
    fusionner: function (autres) {
      const l = App.cibles.liste().slice();
      (autres || []).forEach(function (id) { if (typeof id === 'string' && l.indexOf(id) === -1) l.push(id); });
      App.prefs.set('cibles', l);
    },
    // Cibles pas encore observées et présentes au mois m
    deSaison: function (resume, m) {
      return App.cibles.liste().filter(function (id) {
        return App.esp.existe(id) && !resume.has(id) && App.esp.get(id).mois.indexOf(m) !== -1;
      });
    }
  };

  const suiv = function (m) { return m === 12 ? 1 : m + 1; };
  // Prochain mois de présence après le mois m : { mois, dans } (dans = 1 pour le mois prochain), ou null
  function retour(e, m) {
    let x = m;
    for (let dans = 1; dans <= 12; dans++) { x = suiv(x); if (e.mois.indexOf(x) !== -1) return { mois: x, dans: dans }; }
    return null;
  }
  // Dernier mois de présence en partant du mois m (l'espèce y est déjà)
  function finSaison(e, m) {
    let fin = m;
    for (let i = 0; i < 11 && e.mois.indexOf(suiv(fin)) !== -1; i++) fin = suiv(fin);
    return fin;
  }

  App.vue('cibles', {
    onglet: 'cibles',

    afficher: async function (el) {
      const resume = await App.donnees.resume();
      const m = u.moisActuel();
      const col = App.collator();
      const parNom = function (a, b) { return col.compare(App.esp.nom(a), App.esp.nom(b)); };
      const especes = App.cibles.liste().filter(App.esp.existe).map(App.esp.get);
      const aTrouver = especes.filter(function (e) { return !resume.has(e.id); });
      const toutLAnnee = function (e) { return e.mois.length >= 12; };
      const dernierMois = function (e) { return !toutLAnnee(e) && e.mois.indexOf(suiv(m)) === -1; };

      // Présentes ce mois-ci : les « dernier mois » d'abord
      const maintenant = aTrouver.filter(function (e) { return e.mois.indexOf(m) !== -1; })
        .sort(function (a, b) { return (dernierMois(b) - dernierMois(a)) || parNom(a, b); });
      // Absentes ce mois-ci : celles qui reviennent le plus tôt d'abord
      const attente = function (e) { const r = retour(e, m); return r ? r.dans : 99; };
      const plusTard = aTrouver.filter(function (e) { return e.mois.indexOf(m) === -1; })
        .sort(function (a, b) { return (attente(a) - attente(b)) || parNom(a, b); });
      // Déjà observées : la plus récente d'abord
      const trouvees = especes.filter(function (e) { return resume.has(e.id); })
        .sort(function (a, b) { return App.donnees.cleObs(resume.get(b.id).premiere).localeCompare(App.donnees.cleObs(resume.get(a.id).premiere)); });

      const habitats = function (e) {
        return u.esc(e.habitats.map(function (h) { return window.HABITATS[h]; }).filter(Boolean).join(', '));
      };
      // Une ligne : photo, nom, puis l'info de saison et les habitats en petit (toute la largeur pour le nom)
      const ligne = function (e, infos) {
        const r = resume.get(e.id);
        const nom = App.esp.nom(e);
        return '<li class="ligne-cible"><a href="#/espece/' + encodeURIComponent(e.id) + '">' +
          App.ui.vignette(r && r.couverture, '', e.id) +
          '<span class="ls-txt"><b>' + u.esc(nom) + '</b>' +
          infos.filter(Boolean).map(function (i) { return '<small>' + i + '</small>'; }).join('') + '</span></a>' +
          '<button type="button" class="btn-icone retirer" data-retirer="' + u.esc(e.id) + '" aria-label="Retirer ' + u.esc(nom) + ' de mes cibles" title="Retirer de mes cibles">' +
          u.ic('x') + '</button></li>';
      };
      const liste = function (l, fn) { return '<ul class="liste-simple">' + l.map(fn).join('') + '</ul>'; };

      const boutonAjout = function (cls) {
        return '<button type="button" class="btn ' + cls + '" data-ajouter>' + u.ic('plus') + 'Ajouter une cible</button>';
      };

      let corps;
      if (!especes.length) {
        corps = '<div class="vide">' + u.ic('cible', 'ic-vide') +
          '<h2>Aucune cible pour l’instant</h2>' +
          '<p>Choisis les espèces que tu veux trouver ou photographier : je te dirai quand c’est leur saison.</p>' +
          boutonAjout('btn-prim') + '</div>';
      } else {
        corps = '<div class="barre-cibles">' + boutonAjout('btn-doux') + '</div>' +
          '<section class="section"><h2>' + u.ic('cible') + 'À chercher en ' + u.MOIS[m - 1] + '</h2>' +
          (maintenant.length
            ? liste(maintenant, function (e) {
                const saison = toutLAnnee(e) ? 'toute l’année'
                  : dernierMois(e) ? '<span class="tag tag-cible">dernier mois</span>'
                  : 'jusqu’en ' + u.MOIS[finSaison(e, m) - 1];
                return ligne(e, [saison, habitats(e)]);
              })
            : '<p class="muet">' + (aTrouver.length ? 'Aucune de tes cibles n’est présente en ' + u.MOIS[m - 1] + '.' : 'Tu as trouvé toutes tes cibles. Bravo !') + '</p>') +
          '</section>' +
          (plusTard.length
            ? '<section class="section"><h2>' + u.ic('calendrier') + 'Plus tard dans l’année</h2>' +
              liste(plusTard, function (e) {
                const r = retour(e, m);
                return ligne(e, [(r ? 'arrive en ' + u.MOIS[r.mois - 1] + ' · ' : '') + u.esc(App.saison.plage(e)), habitats(e)]);
              }) + '</section>'
            : '') +
          (trouvees.length
            ? '<section class="section"><h2>' + u.ic('check') + 'Trouvées</h2>' +
              liste(trouvees, function (e) {
                const r = resume.get(e.id);
                return ligne(e, ['✓ vue le ' + u.dateCourte(r.premiere.date) + ' · ' + u.pluriel(r.obs.length, 'observation')]);
              }) + '</section>'
            : '') +
          '<p class="muet petit">Tu peux aussi ajouter une cible depuis la fiche d’une espèce (bouton « Cible »). ' +
          'Les saisons viennent des mois de présence du catalogue.</p>';
      }

      const sous = !especes.length ? 'Les espèces que tu veux trouver'
        : !aTrouver.length ? u.pluriel(trouvees.length, 'cible trouvée', 'cibles trouvées')
        : aTrouver.length + ' à trouver' + (maintenant.length ? ' · ' + maintenant.length + ' en ' + u.MOIS[m - 1] : '');

      el.innerHTML = App.ui.entete({ titre: 'Mes cibles', sous: sous, retour: '#/catalogue' }) + corps;

      // Redessine la page si l'on est encore dessus (ex. bouton « Annuler » d'un message)
      const redessiner = function () { if (document.body.dataset.vue === 'cibles') App.rafraichir(); };

      el.addEventListener('click', async function (ev) {
        const retirer = ev.target.closest('[data-retirer]');
        if (retirer) {
          const id = retirer.dataset.retirer;
          if (App.cibles.contient(id)) App.cibles.basculer(id);
          await App.rafraichir();
          App.ui.toast(App.esp.nom(App.esp.get(id)) + ' n’est plus dans tes cibles', {
            action: 'Annuler',
            surAction: function () { if (!App.cibles.contient(id)) App.cibles.basculer(id); redessiner(); }
          });
          return;
        }
        if (ev.target.closest('[data-ajouter]')) {
          const id = await App.choisirEspece({ cibles: true });
          if (!id) return;
          const e = App.esp.get(id);
          if (App.cibles.contient(id)) { App.ui.toast(App.esp.nom(e) + ' est déjà dans tes cibles'); return; }
          App.cibles.basculer(id);
          await App.rafraichir();
          App.ui.toast('🎯 Nouvelle cible : ' + App.esp.nom(e) + (resume.has(id) ? ' (déjà observée)' : ' · ' + App.saison.plage(e)));
        }
      });
    }
  });
})(window.App);
