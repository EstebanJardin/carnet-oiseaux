/* =====================================================================
   catalogue.js — Rubrique 1 : catalogue des espèces
   Recherche sur les 4 noms (sans accents, + bulgare translittéré),
   filtres groupe / habitat / présence / « visibles en ce moment », tri.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const FILTRES_DEFAUT = { groupe: '', habitat: '', saison: '', maintenant: false, statut: '' };
  const etat = Object.assign({ q: '', tri: 'alpha' }, FILTRES_DEFAUT, App.prefs.get('filtresCatalogue', {}));

  function sauverFiltres() {
    App.prefs.set('filtresCatalogue', {
      groupe: etat.groupe, habitat: etat.habitat, saison: etat.saison,
      maintenant: etat.maintenant, statut: etat.statut, tri: etat.tri
    });
  }
  function filtresActifs() {
    return !!(etat.q || etat.groupe || etat.habitat || etat.saison || etat.maintenant || etat.statut);
  }

  function puceSelect(nom, options, valeur, libelleTous) {
    return '<label class="puce-sel' + (valeur ? ' on' : '') + '">' +
      '<span class="sr-only">' + u.esc(libelleTous) + '</span>' +
      '<select data-f="' + nom + '">' +
      '<option value="">' + u.esc(libelleTous) + '</option>' +
      Object.keys(options).map(function (k) {
        return '<option value="' + k + '"' + (k === valeur ? ' selected' : '') + '>' + u.esc(options[k]) + '</option>';
      }).join('') +
      '</select>' + u.ic('chevron') + '</label>';
  }

  function carte(e, r, langue) {
    const tags = e.presence.map(function (p) {
      return '<span class="tag tag-' + p + '">' + App.PRESENCES_COURT[p] + '</span>';
    }).join('') + (r ? '<span class="tag tag-ok">Observé ✓</span>' : '');
    return '<a class="carte-esp" href="#/espece/' + encodeURIComponent(e.id) + '">' +
      App.ui.vignette(r && r.couverture) +
      '<div class="carte-txt">' +
      '<div class="nom">' + u.esc(App.esp.nom(e, langue)) +
      (e.aVerifier ? '<span class="badge-verif" title="Information à vérifier">?</span>' : '') + '</div>' +
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
      const langue = App.langue();
      const total = App.esp.liste.length;
      const vues = App.esp.liste.filter(function (e) { return resume.has(e.id); }).length;
      const pct = total ? Math.round(vues / total * 100) : 0;
      const mois = u.moisActuel();

      el.innerHTML =
        App.ui.entete({ titre: 'Catalogue', sous: vues + ' / ' + total + ' espèces observées · ' + pct + ' %' }) +
        '<div class="progression" role="progressbar" aria-label="Espèces observées" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + vues + '">' +
        '<span style="width:' + pct + '%"></span></div>' +
        rappel +
        '<div class="barre-recherche">' +
        '<label class="recherche">' + u.ic('recherche') +
        '<span class="sr-only">Rechercher une espèce</span>' +
        '<input type="search" id="cat-q" placeholder="pic, кълвач, kalvach, Dendrocopos…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="' + u.esc(etat.q) + '">' +
        '<button type="button" class="effacer" id="cat-effacer" aria-label="Effacer la recherche"' + (etat.q ? '' : ' hidden') + '>' + u.ic('x') + '</button>' +
        '</label>' +
        '<div class="filtres" role="group" aria-label="Filtres du catalogue">' +
        '<button type="button" class="puce' + (etat.maintenant ? ' on' : '') + '" data-f="maintenant" aria-pressed="' + etat.maintenant + '">' +
        u.ic('calendrier') + 'Visibles en ' + u.MOIS[mois - 1] + '</button>' +
        puceSelect('groupe', window.GROUPES, etat.groupe, 'Tous les groupes') +
        puceSelect('habitat', window.HABITATS, etat.habitat, 'Tous les habitats') +
        puceSelect('saison', window.PRESENCES, etat.saison, 'Toutes les présences') +
        puceSelect('statut', { oui: 'Déjà observées', non: 'Pas encore vues', verif: 'Infos à vérifier' }, etat.statut, 'Observées ou non') +
        '<button type="button" class="puce" data-f="tri" title="Changer le tri">' + u.ic('liste') +
        (etat.tri === 'alpha' ? 'Tri A → Z' : 'Ordre des guides') + '</button>' +
        '</div></div>' +
        '<div class="resultat"><span id="cat-res"></span>' +
        '<button type="button" class="lien-btn" id="cat-raz"' + (filtresActifs() ? '' : ' hidden') + '>Tout afficher</button></div>' +
        '<div class="liste-especes" id="cat-liste"></div>';

      const champ = el.querySelector('#cat-q');
      const liste = el.querySelector('#cat-liste');
      const resultat = el.querySelector('#cat-res');
      const raz = el.querySelector('#cat-raz');
      const effacer = el.querySelector('#cat-effacer');

      function rendre() {
        const correspond = App.esp.filtre(etat.q);
        const m = u.moisActuel();
        let l = App.esp.liste.filter(function (e) {
          if (!correspond(e)) return false;
          if (etat.groupe && e.groupe !== etat.groupe) return false;
          if (etat.habitat && e.habitats.indexOf(etat.habitat) === -1) return false;
          if (etat.saison && e.presence.indexOf(etat.saison) === -1) return false;
          if (etat.maintenant && e.mois.indexOf(m) === -1) return false;
          if (etat.statut === 'oui' && !resume.has(e.id)) return false;
          if (etat.statut === 'non' && resume.has(e.id)) return false;
          if (etat.statut === 'verif' && !e.aVerifier) return false;
          return true;
        });
        if (etat.tri === 'alpha') {
          const col = App.collator(langue);
          l = l.slice().sort(function (a, b) { return col.compare(App.esp.nom(a, langue), App.esp.nom(b, langue)); });
        }
        resultat.textContent = u.pluriel(l.length, 'espèce');
        raz.hidden = !filtresActifs();
        liste.innerHTML = l.length
          ? l.map(function (e) { return carte(e, resume.get(e.id), langue); }).join('')
          : '<div class="vide"><svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>' +
            '<h2>Aucune espèce trouvée</h2><p>Essaie un autre nom, ou retire un filtre.</p></div>';
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
      el.querySelector('[data-f="maintenant"]').addEventListener('click', function () {
        etat.maintenant = !etat.maintenant;
        this.classList.toggle('on', etat.maintenant);
        this.setAttribute('aria-pressed', String(etat.maintenant));
        sauverFiltres();
        rendre();
      });
      el.querySelector('[data-f="tri"]').addEventListener('click', function () {
        etat.tri = etat.tri === 'alpha' ? 'guides' : 'alpha';
        this.innerHTML = u.ic('liste') + (etat.tri === 'alpha' ? 'Tri A → Z' : 'Ordre des guides');
        sauverFiltres();
        rendre();
      });
      raz.addEventListener('click', function () {
        Object.assign(etat, FILTRES_DEFAUT, { q: '' });
        sauverFiltres();
        App.rafraichir();
      });

      rendre();
    }
  });
})(window.App);
