/* =====================================================================
   fiche.js — Rubrique 3 : fiche d'une espèce
   Infos du catalogue + toutes mes observations de l'espèce.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;

  function liste(cles, dico) {
    return cles.map(function (k) { return dico[k] || k; }).join(', ');
  }

  App.vue('espece', {
    onglet: 'catalogue',

    afficher: async function (el, params) {
      const id = params[0] || '';
      const e = App.esp.get(id);
      const c = await App.donnees.charger();
      const resume = await App.donnees.resume();
      const r = resume.get(id);
      const langue = App.langue();
      const m = u.moisActuel();
      const visibleMaintenant = e.mois.indexOf(m) !== -1;
      const couverture = r && r.couverture;
      const ref = App.photoRef(e.id);

      // Couverture : ta photo préférée (★) ou la plus récente ; sinon la photo de référence
      const couv = '<div class="fiche-couv">' +
        (couverture
          ? '<img src="' + App.photos.url(couverture, 'affichage') + '" alt="' + u.esc(App.esp.nom(e, langue)) + '" data-ph="' + couverture.id + '">' +
            '<span class="credit">' + (couverture.favori ? '★ ' : '') + 'Ta photo</span>'
          : ref
            ? '<img src="' + ref.grande + '" alt="' + u.esc(App.esp.nom(e, langue)) + ' (photo de référence)" style="cursor:default">' +
              '<span class="credit">Photo de référence</span>'
            : '<svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>') +
        '<a class="btn-icone retour-flottant" href="#/catalogue" data-action="retour" aria-label="Retour">' + u.ic('retour') + '</a>' +
        '</div>' +
        (!couverture && ref ? '<p class="credit-ref">Photo : ' + App.creditRef(ref) + '</p>' : '');

      // Avec ta propre photo : la photo de référence reste visible à côté, pour comparer
      const encartRef = couverture && ref
        ? '<figure class="encart encart-ref"><figcaption class="etiq-ref">Photo de référence</figcaption>' +
          '<img src="' + ref.grande + '" alt="' + u.esc(App.esp.nom(e, langue)) + ' (photo de référence)" loading="lazy" decoding="async">' +
          '<p class="credit-ref">' + App.creditRef(ref) + '</p></figure>'
        : '';

      const tags = '<div class="tags">' +
        e.presence.map(function (p) { return '<span class="tag tag-' + p + '">' + window.PRESENCES[p] + '</span>'; }).join('') +
        (visibleMaintenant ? '<span class="tag">' + u.ic('calendrier') + 'Visible en ' + u.MOIS[m - 1] + '</span>' : '') +
        (r ? '<span class="tag tag-ok">Observé ✓</span>' : '') +
        (e.aVerifier ? '<span class="tag tag-verif">? À vérifier</span>' : '') +
        '</div>';

      const verif = e.aVerifier
        ? '<div class="encart encart-verif">' + u.ic('alerte') + '<div><b>Information à vérifier</b><br>' + u.esc(e.note || 'Une donnée de cette fiche est incertaine.') + '</div></div>'
        : '';

      const calendrier = '<div class="calendrier" aria-label="Mois de présence">' +
        u.INITIALES_MOIS.map(function (lettre, i) {
          const on = e.mois.indexOf(i + 1) !== -1;
          return '<span class="' + (on ? 'on' : '') + (i + 1 === m ? ' maintenant' : '') + '" title="' + u.MOIS[i] + (on ? ' : présente' : ' : absente') + '">' + lettre + '</span>';
        }).join('') + '</div>' +
        '<p class="legende-cal">Mois de présence habituelle dans la région. Le mois en cours est entouré.</p>';

      const noms = '<div class="encart"><dl class="noms-grille">' +
        '<dt>Français</dt><dd>' + u.esc(e.fr) + '</dd>' +
        '<dt>Български</dt><dd lang="bg">' + u.esc(e.bg) + '<small lang="bg-Latn">' + u.esc(e.tr) + '</small></dd>' +
        '<dt>English</dt><dd lang="en">' + u.esc(e.en) + '</dd>' +
        '<dt>Latin</dt><dd lang="la"><i>' + u.esc(e.la) + '</i></dd>' +
        '</dl></div>';

      const statut = '<div class="encart"><dl class="noms-grille">' +
        '<dt>Groupe</dt><dd>' + u.esc(window.GROUPES[e.groupe] || e.groupe) + '</dd>' +
        '<dt>Présence</dt><dd>' + u.esc(liste(e.presence, window.PRESENCES) || '—') + '</dd>' +
        '<dt>Habitats</dt><dd>' + u.esc(liste(e.habitats, window.HABITATS) || '—') + '</dd>' +
        '<dt>UICN</dt><dd>' + (e.uicn
          ? '<span class="uicn uicn-' + e.uicn + '"><b>' + e.uicn + '</b>' + u.esc(window.UICN[e.uicn] || '') + '</span><small>Statut mondial (Liste rouge)</small>'
          : '—') + '</dd>' +
        '</dl></div>';

      // Mes observations
      let mesObs;
      if (r) {
        const obsTriees = r.obs; // déjà triées : plus récentes d'abord
        mesObs =
          '<div class="chiffres">' +
          '<div class="chiffre"><b>' + r.nb + '</b><span>' + (r.nb > 1 ? 'observations' : 'observation') + '</span></div>' +
          '<div class="chiffre"><b>' + u.nombre(r.individus) + '</b><span>individus vus au total</span></div>' +
          '<div class="chiffre"><b>' + u.dateCourte(r.premiere.date) + '</b><span>première observation</span></div>' +
          '<div class="chiffre"><b>' + u.dateCourte(r.derniere.date) + '</b><span>dernière observation</span></div>' +
          '</div>' +
          '<div class="actions-fiche"><a class="btn btn-prim" href="#/ajouter/' + encodeURIComponent(e.id) + '">' + u.ic('plus') + 'Nouvelle observation</a>' +
          '<button type="button" class="btn btn-second" data-partager>' + u.ic('partager') + 'Partager</button></div>' +
          (r.photos.length
            ? '<h3 class="section-titre" style="font-size:18px">Photos <span class="compte">' + r.photos.length + '</span></h3>' +
              '<div class="galerie">' + r.photos.map(function (x) { return App.rendu.tuile(x.photo, x.obs, { sansEspece: true }); }).join('') + '</div>'
            : '') +
          '<h3 class="section-titre" style="font-size:18px;margin-top:22px">Chronologie</h3>' +
          '<div class="journal">' + obsTriees.map(function (o) { return App.rendu.carteObs(o, c, { sansEspece: true }); }).join('') + '</div>';
      } else {
        mesObs = '<div class="vide" style="padding:20px 10px">' +
          '<p>Tu n\'as pas encore observé cette espèce.</p>' +
          '<a class="btn btn-prim" href="#/ajouter/' + encodeURIComponent(e.id) + '">' + u.ic('plus') + 'Ajouter une observation</a></div>';
      }

      el.innerHTML = couv +
        '<div class="fiche-titre">' +
        '<h1>' + u.esc(App.esp.nom(e, langue)) + '</h1>' +
        '<div class="latin">' + u.esc(e.la) + '</div>' + tags +
        (e.inconnue ? '' : '<button type="button" class="puce puce-cible' + (App.cibles.contient(e.id) ? ' on' : '') + '" data-cible aria-pressed="' + App.cibles.contient(e.id) + '">' +
          u.ic('cible') + (App.cibles.contient(e.id) ? 'Dans mes cibles' : 'Cible') + '</button>') +
        '</div>' +
        (e.inconnue ? '<div class="encart encart-verif">' + u.ic('alerte') + '<div>Cette espèce n\'existe plus dans <code>data/especes.js</code>. Tes observations sont conservées.</div></div>' : '') +
        '<div class="fiche-grille">' +
        '<div class="fiche-princ">' + verif +
        '<p class="description" style="margin-top:14px">' + u.esc(e.description) + '</p>' +
        '<section class="section"><h2>Présence en Bulgarie</h2>' + calendrier + '</section>' +
        '</div>' +
        '<aside class="fiche-cote">' + noms + statut + encartRef + '</aside>' +
        '</div>' +
        '<section class="section" id="mes-obs"><h2>Mes observations</h2>' + mesObs + '</section>';

      if (r) App.rendu.brancher(el, r.photos);

      const boutonCible = el.querySelector('[data-cible]');
      if (boutonCible) boutonCible.addEventListener('click', function () {
        const ajoutee = App.cibles.basculer(e.id);
        boutonCible.classList.toggle('on', ajoutee);
        boutonCible.setAttribute('aria-pressed', String(ajoutee));
        boutonCible.innerHTML = u.ic('cible') + (ajoutee ? 'Dans mes cibles' : 'Cible');
        App.ui.toast(ajoutee
          ? (r ? 'Ajoutée à tes cibles (déjà observée)' : 'Ajoutée à tes cibles · en saison : ' + App.saison.plage(e))
          : 'Retirée de tes cibles');
      });
      const boutonPartage = el.querySelector('[data-partager]');
      if (boutonPartage) boutonPartage.addEventListener('click', function () { App.partage.ouvrir(e.id); });
    }
  });
})(window.App);
