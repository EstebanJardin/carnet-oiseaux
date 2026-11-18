/* =====================================================================
   catalogue.js — Rubrique 1 : catalogue des espèces
   Recherche sur les 4 noms (sans accents, + bulgare translittéré),
   filtres groupe / habitat / présence (plusieurs choix possibles),
   « visibles en ce moment », observées ou non, tri.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;

  // Filtres à choix multiples : une espèce est gardée si elle a au moins un des choix cochés
  // (ex. rapaces diurnes + rapaces nocturnes). Les différents filtres se cumulent.
  const MULTI = {
    groupe: { titre: /*tr*/'Groupes', tous: /*tr*/'Tous les groupes', options: function () { return window.GROUPES; }, valeurs: function (e) { return [e.groupe]; } },
    habitat: { titre: /*tr*/'Habitats', tous: /*tr*/'Tous les habitats', options: function () { return window.HABITATS; }, valeurs: function (e) { return e.habitats; } },
    saison: { titre: /*tr*/'Présence en Bulgarie', tous: /*tr*/'Toutes les présences', options: function () { return window.PRESENCES; }, valeurs: function (e) { return e.presence; } }
  };
  function defauts() { return { groupe: [], habitat: [], saison: [], maintenant: false, statut: '' }; }
  // Réglages enregistrés par les versions d'avant 1.3.1 (un seul choix, en texte) → liste
  function enListe(v, options) {
    return (Array.isArray(v) ? v : (v ? [v] : [])).filter(function (k) { return Object.prototype.hasOwnProperty.call(options, k); });
  }
  const etat = Object.assign({ q: '', tri: 'alpha' }, defauts(), App.prefs.get('filtresCatalogue', {}));
  Object.keys(MULTI).forEach(function (nom) { etat[nom] = enListe(etat[nom], MULTI[nom].options()); });

  function sauverFiltres() {
    App.prefs.set('filtresCatalogue', {
      groupe: etat.groupe, habitat: etat.habitat, saison: etat.saison,
      maintenant: etat.maintenant, statut: etat.statut, tri: etat.tri
    });
  }
  function filtresActifs() {
    return !!(etat.q || etat.groupe.length || etat.habitat.length || etat.saison.length || etat.maintenant || etat.statut);
  }
  function garde(nom, e) {
    const choix = etat[nom];
    return !choix.length || MULTI[nom].valeurs(e).some(function (k) { return choix.indexOf(k) !== -1; });
  }

  // Puce d'un filtre à choix multiples : « Tous les groupes », « Rapaces diurnes », « Rapaces diurnes +1 »…
  function contenuPuce(nom) {
    const def = MULTI[nom], options = def.options();
    const noms = etat[nom].map(function (k) { return tr(options[k]); });
    return {
      on: noms.length > 0,
      aria: tr('{a} : {b}', { a: tr(def.titre), b: noms.length ? noms.join(', ') : tr(def.tous) }),
      html: '<span class="puce-lbl">' + u.esc(noms.length ? noms[0] : tr(def.tous)) + '</span>' +
        (noms.length > 1 ? '<span class="puce-plus">+' + (noms.length - 1) + '</span>' : '') + u.ic('chevron')
    };
  }
  function puceMulti(nom) {
    const c = contenuPuce(nom);
    return '<button type="button" class="puce puce-multi' + (c.on ? ' on' : '') + '" data-multi="' + nom +
      '" aria-haspopup="dialog" aria-label="' + u.esc(c.aria) + '">' + c.html + '</button>';
  }

  function puceSelect(nom, options, valeur, libelleTous) {
    return '<label class="puce-sel' + (valeur ? ' on' : '') + '">' +
      '<span class="sr-only">' + u.esc(libelleTous) + '</span>' +
      '<select data-f="' + nom + '">' +
      '<option value="">' + u.esc(libelleTous) + '</option>' +
      Object.keys(options).map(function (k) {
        return '<option value="' + k + '"' + (k === valeur ? ' selected' : '') + '>' + u.esc(tr(options[k])) + '</option>';
      }).join('') +
      '</select>' + u.ic('chevron') + '</label>';
  }

  function carte(e, r, langue) {
    const tags = e.presence.map(function (p) {
      return '<span class="tag tag-' + p + '">' + App.lib.presenceCourte(p) + '</span>';
    }).join('') + (r ? '<span class="tag tag-ok">' + tr('Observé ✓') + '</span>'
      : (App.cibles.contient(e.id) ? '<span class="tag tag-cible">' + u.ic('cible') + tr('Cible') + '</span>' : ''));
    return '<a class="carte-esp" href="#/espece/' + encodeURIComponent(e.id) + '">' +
      App.ui.vignette(r && r.couverture, '', e.id) +
      '<div class="carte-txt">' +
      '<div class="nom">' + u.esc(App.esp.nom(e, langue)) +
      (e.aVerifier ? '<span class="badge-verif" title="' + u.esc(tr('Information à vérifier')) + '">?</span>' : '') + '</div>' +
      '<div class="autres">' + u.esc(App.esp.autresNoms(e, langue).join(' · ')) + '</div>' +
      '<div class="latin">' + u.esc(e.la) + '</div>' +
      '<div class="tags">' + tags + '</div>' +
      '</div></a>';
  }

  App.vue('catalogue', {
    garderPosition: true,

    afficher: async function (el) {
      const resume = await App.donnees.resume();
      const rappel = await App.ui.rappelSauvegarde();
      const jour = await App.saison.bandeauJour();
      const langue = App.langue();
      const total = App.esp.liste.length;
      const vues = App.esp.liste.filter(function (e) { return resume.has(e.id); }).length;
      const pct = total ? Math.round(vues / total * 100) : 0;
      const mois = u.moisActuel();

      el.innerHTML =
        App.ui.entete({ titre: tr('Catalogue'), sous: tr('{vues} / {total} espèces observées · {pct} %', { vues: vues, total: total, pct: pct }) }) +
        '<div class="progression" role="progressbar" aria-label="' + u.esc(tr('Espèces observées')) + '" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + vues + '">' +
        '<span style="width:' + pct + '%"></span></div>' +
        jour +
        rappel +
        '<div class="barre-recherche">' +
        '<label class="recherche">' + u.ic('recherche') +
        '<span class="sr-only">' + tr('Rechercher une espèce') + '</span>' +
        '<input type="search" id="cat-q" placeholder="' + u.esc(tr('pic, кълвач, kalvach, Dendrocopos…')) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="' + u.esc(etat.q) + '">' +
        '<button type="button" class="effacer" id="cat-effacer" aria-label="' + u.esc(tr('Effacer la recherche')) + '"' + (etat.q ? '' : ' hidden') + '>' + u.ic('x') + '</button>' +
        '</label>' +
        '<div class="filtres" role="group" aria-label="' + u.esc(tr('Filtres du catalogue')) + '">' +
        '<button type="button" class="puce' + (etat.maintenant ? ' on' : '') + '" data-f="maintenant" aria-pressed="' + etat.maintenant + '">' +
        u.ic('calendrier') + tr('Visibles en {mois}', { mois: u.MOIS[mois - 1] }) + '</button>' +
        puceMulti('groupe') + puceMulti('habitat') + puceMulti('saison') +
        puceSelect('statut', { oui: 'Déjà observées', non: 'Pas encore vues', cible: 'Mes cibles', verif: 'Infos à vérifier' }, etat.statut, tr('Observées ou non')) +
        '<button type="button" class="puce" data-f="tri" title="' + u.esc(tr('Changer le tri')) + '">' + u.ic('liste') +
        tr(etat.tri === 'alpha' ? 'Tri A → Z' : 'Ordre des guides') + '</button>' +
        '</div></div>' +
        '<div class="resultat"><span id="cat-res"></span>' +
        '<button type="button" class="lien-btn" id="cat-raz"' + (filtresActifs() ? '' : ' hidden') + '>' + tr('Tout afficher') + '</button></div>' +
        '<div class="liste-especes" id="cat-liste"></div>';

      const champ = el.querySelector('#cat-q');
      const liste = el.querySelector('#cat-liste');
      const resultat = el.querySelector('#cat-res');
      const raz = el.querySelector('#cat-raz');
      const effacer = el.querySelector('#cat-effacer');

      let nombre = 0;
      function rendre() {
        const correspond = App.esp.filtre(etat.q);
        const m = u.moisActuel();
        let l = App.esp.liste.filter(function (e) {
          if (!correspond(e)) return false;
          if (!garde('groupe', e) || !garde('habitat', e) || !garde('saison', e)) return false;
          if (etat.maintenant && e.mois.indexOf(m) === -1) return false;
          if (etat.statut === 'oui' && !resume.has(e.id)) return false;
          if (etat.statut === 'non' && resume.has(e.id)) return false;
          if (etat.statut === 'verif' && !e.aVerifier) return false;
          if (etat.statut === 'cible' && !App.cibles.contient(e.id)) return false;
          return true;
        });
        if (etat.tri === 'alpha') {
          const col = App.collator(langue);
          l = l.slice().sort(function (a, b) { return col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue)); });
        }
        nombre = l.length;
        resultat.textContent = u.pluriel(l.length, 'espèce');
        raz.hidden = !filtresActifs();
        liste.innerHTML = l.length
          ? l.map(function (e) { return carte(e, resume.get(e.id), langue); }).join('')
          : '<div class="vide"><svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>' +
            '<h2>' + tr('Aucune espèce trouvée') + '</h2><p>' + tr('Essaie un autre nom, ou retire un filtre.') + '</p></div>';
        return nombre;
      }

      // Fenêtre à cases à cocher d'un filtre : la liste se met à jour à chaque case touchée
      function ouvrirMulti(nom, bouton) {
        const def = MULTI[nom], options = def.options();
        const d = document.getElementById('dlg-confirm');
        d.innerHTML = '<form method="dialog" class="dlg dlg-multi">' +
          '<h2>' + u.esc(tr(def.titre)) + '</h2>' +
          '<div class="choix-liste">' +
          Object.keys(options).map(function (k) {
            const n = App.esp.liste.filter(function (e) { return def.valeurs(e).indexOf(k) !== -1; }).length;
            return '<label class="choix"><input type="checkbox" value="' + u.esc(k) + '"' + (etat[nom].indexOf(k) !== -1 ? ' checked' : '') + '>' +
              '<span class="choix-txt">' + u.esc(tr(options[k])) + '</span><span class="choix-n">' + n + '</span></label>';
          }).join('') +
          '</div>' +
          '<div class="dlg-actions">' +
          '<button type="button" class="btn btn-second" data-effacer>' + u.esc(tr('Effacer')) + '</button>' +
          '<button value="ok" class="btn btn-prim" data-voir></button>' +
          '</div></form>';
        const voir = d.querySelector('[data-voir]');
        const toutEffacer = d.querySelector('[data-effacer]');
        function majFenetre() {
          voir.textContent = tr('Voir {especes}', { especes: u.pluriel(nombre, 'espèce') });
          toutEffacer.disabled = !etat[nom].length;
        }
        function appliquer() {
          etat[nom] = Array.from(d.querySelectorAll('input[type="checkbox"]:checked')).map(function (c) { return c.value; });
          const c = contenuPuce(nom);
          bouton.classList.toggle('on', c.on);
          bouton.setAttribute('aria-label', c.aria);
          bouton.innerHTML = c.html;
          sauverFiltres();
          rendre();
          majFenetre();
        }
        d.onchange = appliquer;
        d.onclick = function (ev) {
          if (ev.target === d) { d.close(); return; } // toucher à côté de la fenêtre la ferme
          if (ev.target.closest('[data-effacer]')) {
            d.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) { c.checked = false; });
            appliquer();
          }
        };
        d.onclose = function () { d.onchange = null; };
        d.returnValue = '';
        majFenetre();
        d.showModal();
      }

      const rendreBientot = u.debounce(rendre, 80);
      champ.addEventListener('input', function () {
        etat.q = champ.value;
        effacer.hidden = !champ.value;
        rendreBientot();
      });
      champ.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') champ.blur(); });
      effacer.addEventListener('click', function () {
        champ.value = ''; etat.q = ''; effacer.hidden = true; rendre(); champ.focus();
      });
      el.querySelectorAll('select[data-f]').forEach(function (s) {
        s.addEventListener('change', function () {
          etat[s.dataset.f] = s.value;
          s.parentNode.classList.toggle('on', !!s.value);
          sauverFiltres();
          rendre();
        });
      });
      el.querySelectorAll('[data-multi]').forEach(function (b) {
        b.addEventListener('click', function () { ouvrirMulti(b.dataset.multi, b); });
      });
      el.querySelector('[data-f="maintenant"]').addEventListener('click', function () {
        etat.maintenant = !etat.maintenant;
        this.classList.toggle('on', etat.maintenant);
        this.setAttribute('aria-pressed', String(etat.maintenant));
        sauverFiltres();
        rendre();
      });
      el.querySelector('[data-f="tri"]').addEventListener('click', function () {
        etat.tri = etat.tri === 'alpha' ? 'guides' : 'alpha';
        this.innerHTML = u.ic('liste') + tr(etat.tri === 'alpha' ? 'Tri A → Z' : 'Ordre des guides');
        sauverFiltres();
        rendre();
      });
      raz.addEventListener('click', function () {
        Object.assign(etat, defauts(), { q: '' });
        sauverFiltres();
        App.rafraichir();
      });

      rendre();
    }
  });
})(window.App);
