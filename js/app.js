/* =====================================================================
   app.js — démarrage, navigation, thème, langue, messages, mises à jour
   (chargé en dernier : les vues se sont déjà déclarées avec App.vue)
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const VUES = App._vues || {};
  let nettoyages = [];
  let hashPrecedent = null;
  let navigations = 0;
  const positions = {};

  /* ---------- Thème ---------- */
  App.theme = {
    choix: function () { return App.prefs.get('theme', 'auto'); },
    sombre: function () {
      const t = App.theme.choix();
      return t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    },
    appliquer: function () {
      const t = App.theme.choix();
      if (t === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', t);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', App.theme.sombre() ? '#111814' : '#F4F1E8');
      majOutils();
    },
    definir: function (t) { App.prefs.set('theme', t); App.theme.appliquer(); },
    basculer: function () { App.theme.definir(App.theme.sombre() ? 'light' : 'dark'); }
  };

  function majOutils() {
    const lang = App.langue();
    document.querySelectorAll('[data-action="langue"]').forEach(function (b) {
      b.textContent = App.LANGUES[lang];
      b.setAttribute('aria-label', 'Langue des noms : ' + { fr: 'français', bg: 'bulgare', en: 'anglais' }[lang] + ' (changer)');
    });
    document.querySelectorAll('[data-action="theme"]').forEach(function (b) {
      const sombre = App.theme.sombre();
      b.innerHTML = u.ic(sombre ? 'soleil' : 'lune');
      b.setAttribute('aria-label', sombre ? 'Passer au thème clair' : 'Passer au thème sombre');
    });
  }

  /* ---------- Composants d'interface ---------- */
  App.ui = {
    outils: function () {
      return '<span class="outils-affichage">' +
        '<button type="button" class="btn-icone" data-action="langue"></button>' +
        '<button type="button" class="btn-icone" data-action="theme"></button>' +
        '</span>';
    },

    entete: function (o) {
      return '<header class="entete">' +
        (o.retour ? '<a class="btn-icone" href="' + o.retour + '" data-action="retour" aria-label="Retour">' + u.ic('retour') + '</a>' : '') +
        '<div class="entete-txt"><h1>' + o.titre + '</h1>' + (o.sous ? '<p class="sous">' + o.sous + '</p>' : '') + '</div>' +
        '<div class="entete-actions">' + (o.actions || '') + (o.sansOutils ? '' : App.ui.outils()) + '</div>' +
        '</header>';
    },

    // Ta photo en priorité, sinon la photo de référence de l'espèce, sinon la silhouette
    vignette: function (photo, cls, especeId) {
      let img;
      if (photo && photo.miniature) {
        img = '<img src="' + App.photos.url(photo, 'miniature') + '" alt="" loading="lazy" decoding="async">';
      } else {
        const ref = especeId ? App.photoRef(especeId) : null;
        img = ref
          ? '<img src="' + ref.mini + '" alt="" loading="lazy" decoding="async">'
          : '<svg class="ph-oiseau" aria-hidden="true"><use href="#i-oiseau"/></svg>';
      }
      return '<div class="vignette ' + (cls || '') + '">' + img + '</div>';
    },

    toast: function (message, opts) {
      opts = opts || {};
      const t = document.getElementById('toast');
      t.innerHTML = '<span>' + u.esc(message) + '</span>' + (opts.action ? '<button type="button">' + u.esc(opts.action) + '</button>' : '');
      t.className = 'toast visible' + (opts.erreur ? ' erreur' : '');
      if (opts.action) {
        t.querySelector('button').onclick = function () { masquer(); opts.surAction(); };
      }
      clearTimeout(t._minuteur);
      t._minuteur = setTimeout(masquer, opts.duree || (opts.erreur ? 6000 : 3500));
      function masquer() { t.classList.remove('visible'); }
    },

    // Fenêtre de confirmation → Promise<boolean>
    confirmer: function (o) {
      return new Promise(function (resoudre) {
        const d = document.getElementById('dlg-confirm');
        d.innerHTML = '<form method="dialog" class="dlg">' +
          '<h2>' + u.esc(o.titre) + '</h2>' +
          (o.texte ? '<p>' + o.texte + '</p>' : '') +
          '<div class="dlg-actions">' +
          '<button value="non" class="btn btn-second">' + u.esc(o.annuler || 'Annuler') + '</button>' +
          '<button value="oui" class="btn ' + (o.danger ? 'btn-danger' : 'btn-prim') + '">' + u.esc(o.ok || 'Confirmer') + '</button>' +
          '</div></form>';
        d.returnValue = '';
        d.onclose = function () { resoudre(d.returnValue === 'oui'); };
        d.showModal();
        const bouton = d.querySelector(o.danger ? 'button[value="non"]' : 'button[value="oui"]');
        if (bouton) bouton.focus();
      });
    },

    // Bandeau discret si aucune sauvegarde depuis 14 jours
    rappelSauvegarde: async function () {
      const c = await App.donnees.charger();
      if (!c.obs.length) return '';
      if (Date.now() < App.prefs.get('rappelPlusTard', 0)) return '';
      const derniere = App.prefs.get('derniereSauvegarde', 0);
      let reference = derniere;
      if (!reference) {
        reference = c.obs.reduce(function (min, o) {
          const t = Date.parse(o.creeLe) || Date.now();
          return Math.min(min, t);
        }, Date.now());
      }
      const jours = u.joursDepuis(reference);
      if (jours < 14) return '';
      const texte = derniere
        ? 'Pas de sauvegarde depuis ' + jours + ' jours.'
        : "Tu n'as encore jamais sauvegardé tes observations.";
      return '<div class="bandeau" role="status">' +
        '<div class="txt">' + u.ic('sauvegarde') + '<span>' + texte + '</span></div>' +
        '<div class="actions">' +
        '<button type="button" class="btn btn-plus-tard" data-action="rappel-plus-tard">Plus tard</button>' +
        '<a class="btn btn-rappel" href="#/sauvegarde">Sauvegarder</a>' +
        '</div></div>';
    }
  };

  /* ---------- Navigation ---------- */
  App.vue = function (nom, def) { VUES[nom] = def; };
  App.surNettoyage = function (fn) { nettoyages.push(fn); };
  App.garde = null; // fonction renvoyant false pour empêcher de quitter (formulaire non enregistré)

  function lireRoute() {
    const brut = location.hash.replace(/^#\/?/, '');
    const morceaux = brut.split('/').map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
    return { nom: VUES[morceaux[0]] ? morceaux[0] : 'catalogue', params: morceaux.slice(1) };
  }

  function fermerFenetres() {
    document.querySelectorAll('dialog[open]').forEach(function (d) { try { d.close(); } catch (e) { /* déjà fermée */ } });
  }

  async function afficherVue(garderDefilement) {
    const r = lireRoute();
    const def = VUES[r.nom];
    document.body.dataset.vue = r.nom;
    const onglet = def.onglet || r.nom;
    document.querySelectorAll('.nav a[data-vue]').forEach(function (a) {
      const actif = a.dataset.vue === onglet;
      a.classList.toggle('actif', actif);
      if (actif) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    // Nouvelle zone vierge à chaque affichage : les anciens écouteurs disparaissent
    const ancien = document.getElementById('vue');
    const el = ancien.cloneNode(false);
    const y = window.scrollY;
    ancien.replaceWith(el);
    try {
      await def.afficher(el, r.params);
    } catch (e) {
      console.error(e);
      el.innerHTML = '<div class="vide"><svg class="ph-oiseau"><use href="#i-oiseau"/></svg>' +
        "<h2>Impossible d'afficher cette page</h2><p>" + u.esc(e && e.message ? e.message : e) + '</p>' +
        '<a class="btn btn-prim" href="#/catalogue">Retour au catalogue</a></div>';
    }
    majOutils();
    if (garderDefilement) window.scrollTo(0, y);
    else window.scrollTo(0, def.garderPosition ? (positions[location.hash] || 0) : 0);
  }

  async function naviguer() {
    if (App.garde && hashPrecedent !== null && location.hash !== hashPrecedent) {
      if (!App.garde()) { history.replaceState(null, '', hashPrecedent); return; }
    }
    App.garde = null;
    if (hashPrecedent !== null) positions[hashPrecedent] = window.scrollY;
    hashPrecedent = location.hash;
    navigations++;
    fermerFenetres();
    nettoyages.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
    nettoyages = [];
    await afficherVue(false);
  }

  // Redessine la page actuelle (après un changement de langue, de données…)
  App.rafraichir = function () { return afficherVue(true); };

  App.aller = function (hash) {
    if (location.hash === hash) App.rafraichir(); else location.hash = hash;
  };

  App.retour = function (defaut) {
    if (navigations > 1) history.back(); else location.hash = defaut || '#/catalogue';
  };

  /* ---------- Actions globales (clics délégués) ---------- */
  document.addEventListener('click', function (ev) {
    const b = ev.target.closest('[data-action]');
    if (!b) return;
    const action = b.dataset.action;
    if (action === 'langue') {
      const ordre = ['fr', 'bg', 'en'];
      const suivante = ordre[(ordre.indexOf(App.langue()) + 1) % ordre.length];
      App.prefs.set('langue', suivante);
      if (App.garde && App.formulaireModifie) {
        // Ne pas redessiner un formulaire en cours de saisie
        majOutils();
        App.ui.toast('Langue changée : elle s’appliquera après l’enregistrement');
        return;
      }
      App.rafraichir();
      App.ui.toast('Noms affichés en ' + { fr: 'français', bg: 'bulgare', en: 'anglais' }[suivante] + ' en premier');
    } else if (action === 'theme') {
      App.theme.basculer();
    } else if (action === 'retour') {
      ev.preventDefault();
      App.retour(b.getAttribute('href'));
    } else if (action === 'rappel-plus-tard') {
      App.prefs.set('rappelPlusTard', Date.now() + 3 * 86400000);
      const bandeau = b.closest('.bandeau');
      if (bandeau) bandeau.remove();
    }
  });

  /* ---------- Stockage persistant (évite qu'Android efface les données) ---------- */
  App.demanderPersistance = async function () {
    try {
      if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) {
        return await navigator.storage.persist();
      }
      return true;
    } catch (e) { return false; }
  };

  /* ---------- Service worker (hors connexion + mises à jour) ---------- */
  function enregistrerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    // En test sur ton PC (localhost), pas de mode hors ligne sauf avec « ?sw=1 » dans l'adresse :
    // évite que l'appli reste en cache et masque d'autres projets servis à la même adresse.
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (local && !/[?&]sw=1\b/.test(location.search)) return;
    let attenteMaj = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (attenteMaj) { attenteMaj = false; location.reload(); }
    });
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      function proposer(travailleur) {
        const bandeau = document.getElementById('maj');
        bandeau.hidden = false;
        document.getElementById('maj-ok').onclick = function () {
          attenteMaj = true;
          bandeau.hidden = true;
          travailleur.postMessage('activer');
        };
      }
      if (reg.waiting && navigator.serviceWorker.controller) proposer(reg.waiting);
      reg.addEventListener('updatefound', function () {
        const nouveau = reg.installing;
        if (!nouveau) return;
        nouveau.addEventListener('statechange', function () {
          if (nouveau.state === 'installed' && navigator.serviceWorker.controller) proposer(nouveau);
        });
      });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') reg.update().catch(function () { /* hors ligne */ });
      });
    }).catch(function (e) { console.warn('Service worker non enregistré :', e); });
  }

  /* ---------- Démarrage ---------- */
  function demarrer() {
    App.theme.appliquer();
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', App.theme.appliquer);
    } catch (e) { /* ancien navigateur */ }
    window.addEventListener('hashchange', naviguer);
    window.addEventListener('beforeunload', function (ev) {
      if (App.garde && App.formulaireModifie) { ev.preventDefault(); ev.returnValue = ''; }
    });
    if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/catalogue');
    naviguer();
    enregistrerServiceWorker();
  }

  demarrer();
})(window.App);
