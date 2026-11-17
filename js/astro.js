/* =====================================================================
   astro.js — soleil et lune, calculés sans réseau
   Formules astronomiques classiques (équation du lever du soleil, d'après
   « Astronomy Answers » et SunCalc de V. Agafonkin, licence BSD).
   Précision : environ une minute pour le soleil, quelques heures pour les
   dates de pleine et de nouvelle lune (largement suffisant sur le terrain).
   Les heures sont affichées à l'heure de Bulgarie (Europe/Sofia).
   ===================================================================== */
'use strict';

(function (App) {
  const RAD = Math.PI / 180;
  const JOUR = 86400000, J1970 = 2440588, J2000 = 2451545, J0 = 0.0009;
  const OBLIQUITE = RAD * 23.4397;

  const versJulien = function (d) { return d.valueOf() / JOUR - 0.5 + J1970; };
  const depuisJulien = function (j) { return new Date((j + 0.5 - J1970) * JOUR); };
  const anomalie = function (d) { return RAD * (357.5291 + 0.98560028 * d); };
  const longitudeEcliptique = function (M) {
    const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    return M + C + RAD * 102.9372 + Math.PI;
  };

  // Heures du soleil pour le jour solaire de « date » : chaque entrée = [matin, soir]
  function soleil(date, lat, lon) {
    const lw = -lon * RAD, phi = lat * RAD;
    const d = versJulien(date) - J2000;
    const n = Math.round(d - J0 - lw / (2 * Math.PI));
    const ds = J0 + lw / (2 * Math.PI) + n;
    const M = anomalie(ds), L = longitudeEcliptique(M);
    const dec = Math.asin(Math.sin(OBLIQUITE) * Math.sin(L));
    const Jmidi = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    function paire(hauteur) {
      const x = (Math.sin(hauteur * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
      if (x < -1 || x > 1) return null; // le soleil n'atteint jamais cette hauteur ce jour-là
      const w = Math.acos(x);
      const a = J0 + (w + lw) / (2 * Math.PI) + n;
      const Jsoir = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
      return [depuisJulien(Jmidi - (Jsoir - Jmidi)), depuisJulien(Jsoir)];
    }
    return {
      midi: depuisJulien(Jmidi),
      lever: paire(-0.833),   // lever et coucher (bord du disque, réfraction comprise)
      civil: paire(-6),        // aube et crépuscule civils (fin de l'heure bleue)
      bleue: paire(-4),        // limite heure bleue / heure dorée
      doree: paire(6)          // fin de l'heure dorée du matin, début de celle du soir
    };
  }

  // Phase de la lune (lunaison moyenne depuis la nouvelle lune du 6 janvier 2000)
  const LUNAISON = 29.530588853;
  const NOUVELLE_LUNE_REF = Date.UTC(2000, 0, 6, 18, 14);
  const NOMS_PHASES = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Lune gibbeuse croissante',
    'Pleine lune', 'Lune gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
  function lune(date) {
    const age = ((((date.valueOf() - NOUVELLE_LUNE_REF) / JOUR) % LUNAISON) + LUNAISON) % LUNAISON;
    const p = age / LUNAISON; // 0 = nouvelle, 0,5 = pleine
    return {
      phase: p,
      age: age,
      eclairage: (1 - Math.cos(2 * Math.PI * p)) / 2,
      nom: NOMS_PHASES[Math.floor(p * 8 + 0.5) % 8],
      prochainePleine: new Date(date.valueOf() + (((0.5 - p) % 1 + 1) % 1 || 1) * LUNAISON * JOUR),
      prochaineNouvelle: new Date(date.valueOf() + ((1 - p) % 1 || 1) * LUNAISON * JOUR)
    };
  }

  // Petite lune dessinée en SVG (côté éclairé à droite quand elle croît)
  function luneSVG(p, taille) {
    const c = taille / 2, r = taille / 2 - 1;
    const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r;
    const limbe = p < 0.5 ? 1 : 0;
    const terminateur = (p < 0.25 || (p >= 0.5 && p < 0.75)) ? 0 : 1;
    const eclairee = p < 0.02 || p > 0.98 ? '' :
      '<path d="M' + c + ' ' + (c - r) + 'A' + r + ' ' + r + ' 0 0 ' + limbe + ' ' + c + ' ' + (c + r) +
      'A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + terminateur + ' ' + c + ' ' + (c - r) + 'Z" fill="#EBC350" stroke="none"/>';
    return '<svg class="lune" width="' + taille + '" height="' + taille + '" viewBox="0 0 ' + taille + ' ' + taille + '" aria-hidden="true">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="currentColor" fill-opacity=".22"/>' +
      eclairee +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1"/></svg>';
  }

  // Affichage à l'heure de Bulgarie, même si l'appareil est réglé sur une autre heure
  let formatHeure;
  try { formatHeure = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Sofia', hour: '2-digit', minute: '2-digit' }); }
  catch (e) { formatHeure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  function heure(d) { return d ? formatHeure.format(d) : '—'; }
  function minutesSofia(d) {
    const t = heure(d).split(':').map(Number);
    return t[0] * 60 + t[1];
  }
  function duree(ms) {
    const min = Math.round(ms / 60000);
    return Math.floor(min / 60) + ' h ' + u2(min % 60);
  }
  function u2(n) { return String(n).padStart(2, '0'); }

  // Position de référence : dernière observation avec GPS, sinon Karlovo
  async function position() {
    const c = await App.donnees.charger();
    const o = c.obs.find(function (x) { return typeof x.lat === 'number' && typeof x.lon === 'number'; });
    return o ? { lat: o.lat, lon: o.lon, nom: o.lieu || 'ta dernière position' } : { lat: 42.6417, lon: 24.8058, nom: 'Karlovo' };
  }

  App.astro = { soleil: soleil, lune: lune, luneSVG: luneSVG, heure: heure, minutesSofia: minutesSofia, duree: duree, position: position };
})(window.App);
