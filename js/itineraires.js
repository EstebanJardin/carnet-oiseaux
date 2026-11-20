/* =====================================================================
   itineraires.js — itinéraires vers mes spots (préparés sur la carte)
   Un itinéraire : { id, nom, mode ('pied' | 'voiture'), depuisPosition,
     etapes: [{ spotId, lat, lon, nom } | { lat, lon, nom }],
     creeLe, modifieLe }
   (une étape « spot » garde une copie de la position : elle sert si le
   spot disparaît ; sinon c'est la position actuelle du spot qui compte)
   Sorties :
   - lien « Ouvrir dans Google Maps » : Google calcule le trajet (réseau)
   - fichier GPX : Organic Maps, OsmAnd… (guidage sans réseau)
   - fichier KML : Google My Maps, puis visible dans Google Maps
   L'itinéraire en cours de préparation est gardé dans les préférences.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const CLE = 'itineraire';

  function aUnePosition(x) {
    return !!x && typeof x.lat === 'number' && typeof x.lon === 'number' && isFinite(x.lat) && isFinite(x.lon);
  }

  function nouveau() { return { id: null, nom: '', mode: 'pied', depuisPosition: true, etapes: [] }; }

  // Brouillon : l'itinéraire affiché sur la carte (enregistré ou non)
  function brouillon() {
    const it = App.prefs.get(CLE, null);
    return it && Array.isArray(it.etapes) ? it : nouveau();
  }
  function garderBrouillon(it) { App.prefs.set(CLE, it); }

  // Étapes avec leurs coordonnées → [{ lat, lon, nom, spotId }] (étapes sans position ignorées)
  function points(it, c) {
    return (it.etapes || []).map(function (e) {
      if (e.spotId) {
        const s = c.spotsParId.get(e.spotId);
        if (s && aUnePosition(s)) return { lat: s.lat, lon: s.lon, nom: s.nom, spotId: s.id };
      }
      return aUnePosition(e) ? { lat: e.lat, lon: e.lon, nom: e.nom || '', spotId: null } : null;
    }).filter(Boolean);
  }

  // Distance à vol d'oiseau, en mètres (depuis « depart » s'il est donné)
  function distance(pts, depart) {
    const liste = depart ? [depart].concat(pts) : pts;
    let d = 0;
    for (let i = 1; i < liste.length; i++) d += App.spots.distance(liste[i - 1], liste[i]);
    return d;
  }

  function nomEtape(p, i) { return (i + 1) + '. ' + (p.nom || tr('Étape')); }

  /* ---------- Google Maps ---------- */

  function coord(p) { return p.lat.toFixed(6) + ',' + p.lon.toFixed(6); }
  function lien(origine, destination, milieu, mode) {
    return 'https://www.google.com/maps/dir/?api=1' +
      (origine ? '&origin=' + coord(origine) : '') +
      '&destination=' + coord(destination) +
      (milieu.length ? '&waypoints=' + milieu.map(coord).join('%7C') : '') +
      '&travelmode=' + (mode === 'voiture' ? 'driving' : 'walking');
  }
  // Liens Google Maps, en morceaux de « maxMilieu » étapes intermédiaires au plus
  // (sans point de départ, Google part de la position du téléphone)
  // → [{ url, de, a }] : de / a = numéros d'étapes (0 = ma position)
  function liensGoogle(pts, mode, depuisPosition, maxMilieu) {
    if (!pts.length) return [];
    const suite = (depuisPosition ? [null] : []).concat(pts);
    if (suite.length === 1) return [{ url: lien(null, pts[0], [], mode), de: 0, a: 1 }];
    const decalage = depuisPosition ? 0 : 1;
    const pas = (maxMilieu || 9) + 1;
    const res = [];
    for (let k = 0; k < suite.length - 1; k += pas) {
      const m = suite.slice(k, k + pas + 1);
      res.push({ url: lien(m[0], m[m.length - 1], m.slice(1, -1), mode), de: k + decalage, a: k + m.length - 1 + decalage });
    }
    return res;
  }

  /* ---------- Fichiers GPX et KML ---------- */

  function xml(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lat(p) { return p.lat.toFixed(6); }
  function lon(p) { return p.lon.toFixed(6); }

  // pts : [{ lat, lon, nom, desc }] ; opts.trace : relier les points dans l'ordre ; opts.numeroter
  function gpx(nom, pts, opts) {
    opts = opts || {};
    const nomPt = function (p, i) { return opts.numeroter ? nomEtape(p, i) : (p.nom || tr('Point')); };
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<gpx version="1.1" creator="' + xml(tr('Carnet d’oiseaux · Sredna Gora')) + '" xmlns="http://www.topografix.com/GPX/1/1">\n' +
      '  <metadata><name>' + xml(nom) + '</name><time>' + new Date().toISOString() + '</time></metadata>\n' +
      pts.map(function (p, i) {
        return '  <wpt lat="' + lat(p) + '" lon="' + lon(p) + '"><name>' + xml(nomPt(p, i)) + '</name>' +
          (p.desc ? '<desc>' + xml(p.desc) + '</desc>' : '') + '</wpt>\n';
      }).join('') +
      (opts.trace && pts.length > 1
        ? '  <trk><name>' + xml(nom) + '</name><trkseg>\n' +
          pts.map(function (p) { return '    <trkpt lat="' + lat(p) + '" lon="' + lon(p) + '"></trkpt>\n'; }).join('') +
          '  </trkseg></trk>\n'
        : '') +
      '</gpx>\n';
  }

  function kml(nom, pts, opts) {
    opts = opts || {};
    const nomPt = function (p, i) { return opts.numeroter ? nomEtape(p, i) : (p.nom || tr('Point')); };
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n' +
      '  <name>' + xml(nom) + '</name>\n' +
      '  <Style id="ligne"><LineStyle><color>ff475b2e</color><width>4</width></LineStyle></Style>\n' +
      pts.map(function (p, i) {
        return '  <Placemark><name>' + xml(nomPt(p, i)) + '</name>' +
          (p.desc ? '<description>' + xml(p.desc) + '</description>' : '') +
          '<Point><coordinates>' + lon(p) + ',' + lat(p) + ',0</coordinates></Point></Placemark>\n';
      }).join('') +
      (opts.trace && pts.length > 1
        ? '  <Placemark><name>' + xml(nom) + '</name><styleUrl>#ligne</styleUrl><LineString><tessellate>1</tessellate><coordinates>' +
          pts.map(function (p) { return lon(p) + ',' + lat(p) + ',0'; }).join(' ') +
          '</coordinates></LineString></Placemark>\n'
        : '') +
      '</Document>\n</kml>\n';
  }

  function telecharger(texte, format, nom) {
    const type = format === 'kml' ? 'application/vnd.google-earth.kml+xml' : 'application/gpx+xml';
    App.telechargerBlob(new Blob([texte], { type: type }), nom + '.' + format);
  }

  // Un itinéraire → fichier GPX ou KML (étapes numérotées et reliées)
  function exporter(it, c, format) {
    const pts = points(it, c);
    const nom = it.nom || tr('Itinéraire||nom');
    const fichier = 'itineraire_' + u.slug(it.nom || 'carnet') + '_' + u.dateISO();
    telecharger((format === 'kml' ? kml : gpx)(nom, pts, { trace: true, numeroter: true }), format, fichier);
  }

  // Tous les spots (avec position) → fichier GPX ou KML
  function exporterSpots(c, format) {
    const pts = c.spots.filter(aUnePosition).map(function (s) {
      return {
        lat: s.lat, lon: s.lon, nom: s.nom,
        desc: [App.spots.libType(s), s.heures, s.notes].filter(Boolean).join(' — ')
      };
    });
    telecharger((format === 'kml' ? kml : gpx)(tr('Mes spots'), pts, {}), format, 'mes-spots_' + u.dateISO());
    return pts.length;
  }

  /* ---------- Enregistrement ---------- */

  async function enregistrer(it) {
    const maintenant = new Date().toISOString();
    const r = Object.assign({}, it, {
      id: it.id || u.uid('iti'),
      nom: (it.nom || '').trim() || tr('Itinéraire||nom'),
      creeLe: it.creeLe || maintenant,
      modifieLe: maintenant
    });
    await App.db.ecrire([{ magasin: 'itineraires', mettre: r }]);
    return r;
  }

  async function supprimer(id) {
    await App.db.ecrire([
      { magasin: 'itineraires', effacer: id },
      { magasin: 'suppressions', mettre: { id: id, type: 'itineraire', le: new Date().toISOString() } }
    ]);
    const b = App.prefs.get(CLE, null);
    if (b && b.id === id) App.prefs.set(CLE, Object.assign({}, b, { id: null, creeLe: undefined }));
  }

  // Un spot supprimé : ses étapes deviennent de simples points (ou disparaissent s'il n'avait pas de position)
  function sansSpot(it, spot) {
    if (!(it.etapes || []).some(function (e) { return e.spotId === spot.id; })) return null;
    return Object.assign({}, it, {
      etapes: it.etapes.map(function (e) {
        if (e.spotId !== spot.id) return e;
        if (aUnePosition(spot)) return { lat: spot.lat, lon: spot.lon, nom: spot.nom };
        return aUnePosition(e) ? { lat: e.lat, lon: e.lon, nom: e.nom || spot.nom } : null;
      }).filter(Boolean)
    });
  }
  function oublierSpotDuBrouillon(spot) {
    const b = App.prefs.get(CLE, null);
    const n = b ? sansSpot(b, spot) : null;
    if (n) App.prefs.set(CLE, n);
  }

  App.itineraires = {
    nouveau: nouveau,
    brouillon: brouillon,
    garderBrouillon: garderBrouillon,
    points: points,
    distance: distance,
    liensGoogle: liensGoogle,
    gpx: gpx,
    kml: kml,
    exporter: exporter,
    exporterSpots: exporterSpots,
    enregistrer: enregistrer,
    supprimer: supprimer,
    sansSpot: sansSpot,
    oublierSpotDuBrouillon: oublierSpotDuBrouillon
  };
})(window.App);
