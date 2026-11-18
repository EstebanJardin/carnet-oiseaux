/* =====================================================================
   utils.js — outils communs : texte, dates, réglages, espèces
   ===================================================================== */
'use strict';
window.App = window.App || {};

(function (App) {
  const u = {};
  App.u = u;

  // Version de l'appli (à faire correspondre avec VERSION dans sw.js)
  App.VERSION = '1.3.0';

  // Les vues (écrans) s'enregistrent ici ; app.js, chargé en dernier, les affiche
  App._vues = {};
  App.vue = function (nom, def) { App._vues[nom] = def; };

  /* ---------- Texte ---------- */

  // Normalise pour la recherche : minuscules, sans accents, tirets et apostrophes → espaces
  u.norm = function (s) {
    return (s == null ? '' : String(s))
      .replace(/[œŒ]/g, 'oe').replace(/[æÆ]/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[-'’_.,;:()«»"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Translittération officielle bulgare → alphabet latin (système de 2009)
  const TRANSLIT = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
    'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht',
    'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya'
  };
  u.translit = function (s) {
    return Array.from(s || '').map(function (c) {
      const min = c.toLowerCase();
      const t = TRANSLIT[min];
      if (t === undefined) return c;
      return c !== min ? t.charAt(0).toUpperCase() + t.slice(1) : t;
    }).join('');
  };

  // Identifiant lisible pour les noms de fichiers : « Pic épeiche » → « pic-epeiche »
  u.slug = function (s) {
    return u.norm(u.translit(s)).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'oiseau';
  };

  u.esc = function (s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  u.ic = function (nom, cls) {
    return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + nom + '"/></svg>';
  };

  /* ---------- Traduction (data/traductions.js) ---------- */

  // App.tr(texte en français, {variables}) → le texte dans la langue choisie
  const TRAD = window.TRADUCTIONS || {};
  const manquants = new Set();
  // Un même texte français peut avoir deux sens : « Soleil||astre » s'affiche « Soleil » en français
  App.tr = function (fr, vars) {
    const l = App.langue();
    const cle = fr == null ? '' : String(fr);
    const i = cle.indexOf('||');
    let s = i === -1 ? cle : cle.slice(0, i);
    if (l !== 'fr' && cle) {
      const e = TRAD[cle];
      const v = e && e[l === 'en' ? 0 : 1];
      if (v) s = v;
      else if (!manquants.has(cle)) { manquants.add(cle); console.warn('Traduction manquante (' + l + ') : ' + cle); }
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  };
  const tr = App.tr;
  App.LOCALES = { fr: 'fr-FR', en: 'en-GB', bg: 'bg-BG' };
  App.locale = function () { return App.LOCALES[App.langue()] || 'fr-FR'; };

  // Le mot seul, accordé au nombre : en anglais et en bulgare, 0 prend le pluriel
  u.mot = function (n, un, plusieurs) {
    const pl = App.langue() === 'fr' ? n > 1 : n !== 1;
    return tr(pl ? (plusieurs || un + 's') : un);
  };
  // « 3 photos »
  u.pluriel = function (n, un, plusieurs) { return u.nombre(n) + ' ' + u.mot(n, un, plusieurs); };

  u.nombre = function (n) { return Number(n || 0).toLocaleString(App.locale()); };
  // Pourcentage : « 54 % » en français et en bulgare, « 54% » en anglais
  u.pct = function (n) { return n + (App.langue() === 'en' ? '%' : ' %'); };
  // Nombre à virgule : « 42,64 » (fr, bg) ou « 42.64 » (en)
  u.decimal = function (x, chiffres) {
    return Number(x).toLocaleString(App.locale(), { minimumFractionDigits: chiffres, maximumFractionDigits: chiffres });
  };

  const UNITES = { fr: ['o', 'Ko', 'Mo', 'Go', 'To'], en: ['B', 'KB', 'MB', 'GB', 'TB'], bg: ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'] };
  u.taille = function (octets) {
    if (octets == null || isNaN(octets)) return '?';
    const unites = UNITES[App.langue()] || UNITES.fr;
    let n = octets, i = 0;
    while (n >= 1024 && i < unites.length - 1) { n /= 1024; i++; }
    let txt = i === 0 ? String(n) : n.toFixed(n < 10 ? 1 : 0);
    if (App.langue() !== 'en') txt = txt.replace('.', ',');
    return txt + ' ' + unites[i];
  };

  u.debounce = function (fn, ms) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  };

  u.uid = function (prefixe) {
    let alea;
    try { alea = crypto.randomUUID().replace(/-/g, '').slice(0, 16); }
    catch (e) { alea = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
    return prefixe + '_' + alea;
  };

  /* ---------- Dates (format local, sans fuseau) ---------- */

  // Noms des mois dans la langue choisie (u.MOIS[0] = janvier)
  const MOIS = {
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    bg: ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември']
  };
  const MOIS_COURT = {
    fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    bg: ['яну', 'фев', 'март', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек']
  };
  const INITIALES = {
    fr: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    en: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
    bg: ['Я', 'Ф', 'М', 'А', 'М', 'Ю', 'Ю', 'А', 'С', 'О', 'Н', 'Д']
  };
  const parLangue = function (table) { return { get: function () { return table[App.langue()] || table.fr; } }; };
  Object.defineProperty(u, 'MOIS', parLangue(MOIS));
  Object.defineProperty(u, 'MOIS_COURT', parLangue(MOIS_COURT));
  Object.defineProperty(u, 'INITIALES_MOIS', parLangue(INITIALES));

  u.pad = function (n) { return String(n).padStart(2, '0'); };

  u.dateISO = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + u.pad(d.getMonth() + 1) + '-' + u.pad(d.getDate());
  };
  u.heureHM = function (d) {
    d = d || new Date();
    return u.pad(d.getHours()) + ':' + u.pad(d.getMinutes());
  };
  u.moisActuel = function () { return new Date().getMonth() + 1; };

  u.dateLongue = function (iso) {
    if (!iso) return '';
    const p = iso.split('-').map(Number);
    return p[2] + ' ' + u.MOIS[p[1] - 1] + ' ' + p[0] + (App.langue() === 'bg' ? ' г.' : '');
  };
  u.dateCourte = function (iso) {
    if (!iso) return '';
    const p = iso.split('-').map(Number);
    const annee = p[0] !== new Date().getFullYear() ? ' ' + p[0] : '';
    return p[2] + ' ' + u.MOIS_COURT[p[1] - 1] + annee;
  };
  u.jourSemaine = function (iso) {
    const p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(App.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  u.joursDepuis = function (horodatage) {
    return Math.floor((Date.now() - horodatage) / 86400000);
  };
  u.depuis = function (horodatage) {
    const j = u.joursDepuis(horodatage);
    if (j <= 0) return tr("aujourd'hui");
    if (j === 1) return tr('hier');
    return tr('il y a {n} jours', { n: j });
  };

  /* ---------- Réglages (stockés dans le navigateur) ---------- */

  const CLE_PREFS = 'carnet-oiseaux:prefs';
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(CLE_PREFS)) || {}; } catch (e) { prefs = {}; }
  App.prefs = {
    get: function (cle, defaut) { return Object.prototype.hasOwnProperty.call(prefs, cle) ? prefs[cle] : defaut; },
    set: function (cle, valeur) {
      prefs[cle] = valeur;
      try { localStorage.setItem(CLE_PREFS, JSON.stringify(prefs)); } catch (e) { /* stockage plein ou privé */ }
    }
  };
  // Appli ouverte dans deux onglets (PC) : on reprend les réglages modifiés par l'autre onglet
  window.addEventListener('storage', function (ev) {
    if (ev.key !== CLE_PREFS) return;
    try { prefs = JSON.parse(ev.newValue) || {}; } catch (e) { /* valeur illisible : on garde les nôtres */ }
  });

  App.langue = function () { return App.prefs.get('langue', 'fr'); };
  App.LANGUES = { fr: 'FR', bg: 'БГ', en: 'EN' };
  App.collator = function (langue) {
    try { return new Intl.Collator(langue || App.langue(), { sensitivity: 'base', ignorePunctuation: true }); }
    catch (e) { return new Intl.Collator('fr'); }
  };

  /* ---------- Espèces ---------- */

  const LISTE = window.ESPECES || [];
  const PAR_ID = new Map();
  LISTE.forEach(function (e, i) {
    e.ordre = i;
    e.tr = u.translit(e.bg);
    e.index = u.norm([e.fr, e.en, e.la, e.bg, e.tr].join(' '));
    PAR_ID.set(e.id, e);
  });

  App.esp = {
    liste: LISTE,
    // Renvoie l'espèce, ou une fiche de secours si elle a été retirée du catalogue
    get: function (id) {
      return PAR_ID.get(id) || {
        id: id, fr: id, bg: id, en: id, la: '', tr: id, groupe: 'passereaux',
        presence: [], mois: [], habitats: [], uicn: '', description: "Cette espèce n'est plus dans le catalogue (data/especes.js).",
        inconnue: true, index: u.norm(id)
      };
    },
    existe: function (id) { return PAR_ID.has(id); },
    nom: function (e, langue) { return e[langue || App.langue()] || e.fr; },
    autresNoms: function (e, langue) {
      langue = langue || App.langue();
      return ['fr', 'bg', 'en'].filter(function (l) { return l !== langue; }).map(function (l) { return e[l]; });
    },
    // Description et note dans la langue choisie (description_en, description_bg… dans data/especes.js)
    description: function (e) {
      if (e.inconnue) return tr(e.description);
      const l = App.langue();
      return (l !== 'fr' && e['description_' + l]) || e.description || '';
    },
    note: function (e) {
      const l = App.langue();
      return (l !== 'fr' && e['note_' + l]) || e.note || '';
    },
    // Filtre de recherche : tous les mots tapés doivent apparaître dans un des noms
    filtre: function (requete) {
      const mots = u.norm(requete).split(' ').filter(Boolean);
      if (!mots.length) return function () { return true; };
      return function (e) { return mots.every(function (m) { return e.index.indexOf(m) !== -1; }); };
    }
  };

  App.PRESENCES_COURT = { resident: 'Résident', estivant: 'Estivant', hivernant: 'Hivernant', passage: 'Passage' };

  // Libellés des données (data/especes.js), traduits dans la langue choisie
  App.lib = {
    groupe: function (k) { return tr((window.GROUPES || {})[k] || k); },
    habitat: function (k) { return tr((window.HABITATS || {})[k] || k); },
    presence: function (k) { return tr((window.PRESENCES || {})[k] || k); },
    presenceCourte: function (k) { return tr(App.PRESENCES_COURT[k] || k); },
    uicn: function (k) { return k && window.UICN && window.UICN[k] ? tr(window.UICN[k]) : ''; }
  };

  /* ---------- Photos de référence (Wikimedia Commons, data/photos.js) ---------- */

  App.photoRef = function (id) {
    const p = (window.PHOTOS_REF || {})[id];
    if (!p) return null;
    const v = p.v ? '?v=' + p.v : '';
    return Object.assign({
      grande: 'images/especes/' + id + '.jpg' + v,
      mini: 'images/especes/mini/' + id + '.jpg' + v
    }, p);
  };

  // « Auteur · Licence · Wikimedia Commons », avec liens (ouverts seulement si connecté)
  App.creditRef = function (ref) {
    const lien = function (href, texte) {
      return href ? '<a href="' + u.esc(href) + '" target="_blank" rel="noopener">' + u.esc(texte) + '</a>' : u.esc(texte);
    };
    return u.esc(ref.auteur) + ' · ' + lien(ref.lienLicence, ref.licence) + ' · ' + lien(ref.source, 'Wikimedia Commons');
  };

  /* ---------- Listes du formulaire ---------- */

  App.COMPORTEMENTS = [
    ['pose', 'Posé'], ['vol', 'En vol'], ['chant', 'Chante'], ['cri', 'Crie'],
    ['nourrit', 'Se nourrit'], ['chasse', 'Chasse'], ['parade', 'Parade'],
    ['nid', 'Construit le nid'], ['nourrissage', 'Nourrit les jeunes'], ['juveniles', 'Juvéniles'],
    ['bain', 'Se baigne'], ['groupe', 'En groupe'], ['migration', 'En migration']
  ];
  App.METEOS = [
    ['soleil', 'Soleil', 'soleil'], ['nuageux', 'Nuageux', 'nuage'], ['pluie', 'Pluie', 'pluie'],
    ['neige', 'Neige', 'neige'], ['brouillard', 'Brouillard', 'brouillard'], ['vent', 'Vent', 'vent']
  ];
  // Libellé traduit d'un comportement ou d'une météo
  App.libelle = function (liste, id) {
    const t = liste.find(function (x) { return x[0] === id; });
    return t ? tr(t[1]) : id;
  };
})(window.App);
