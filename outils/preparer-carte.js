// Prépare les fichiers de la carte hors ligne pour l'appli.
//   node outils/preparer-carte.js <region.pmtiles> <maplibre-gl/dist> <pmtiles/dist/pmtiles.js>
//                                 <@protomaps/basemaps/dist/basemaps.js> <basemaps-assets>
// Écrit :
//   carte/                 bibliothèque MapLibre, lecteur PMTiles, styles, polices, icônes
//   carte/region-AAAAMMJJ/ la région découpée en morceaux de 2 Mo (téléchargement reprenable)
//   data/carte.js          la liste des fichiers avec leur taille et leur empreinte SHA-256
// À lancer après outils/extraire-carte.js (qui écrit aussi region.pmtiles.meta.json).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RACINE = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.length < 5) {
  console.error('Usage : node outils/preparer-carte.js <region.pmtiles> <maplibre-gl/dist> <pmtiles.js> <basemaps.js> <basemaps-assets>');
  process.exit(1);
}
const REGION = path.resolve(args[0]);
const MAPLIBRE = path.resolve(args[1]);
const PMTILES = path.resolve(args[2]);
const BASEMAPS = path.resolve(args[3]);
const ASSETS = path.resolve(args[4]);

const META = JSON.parse(fs.readFileSync(REGION + '.meta.json', 'utf8'));
const ZONE = JSON.parse(fs.readFileSync(path.join(__dirname, 'zone-carte.json'), 'utf8'));
const DATE_OSM = String(META.osm || '').slice(0, 10);
const VERSION = DATE_OSM.replace(/-/g, '');
if (!/^\d{8}$/.test(VERSION)) throw new Error('date des données OSM introuvable dans ' + REGION + '.meta.json');

const TAILLE_PARTIE = 2 * 1024 * 1024;
// Polices du style (nom MapLibre → dossier) et plages de caractères gardées :
// latin, latin étendu (roumain, turc…), grec, cyrillique, ponctuation
const POLICES = { 'Noto Sans Regular': 'regular', 'Noto Sans Medium': 'medium', 'Noto Sans Italic': 'italic' };
const PLAGES = ['0-255', '256-511', '512-767', '768-1023', '1024-1279', '8192-8447'];

function empreinte(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
function ecrire(rel, buf) {
  const p = path.join(RACINE, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, buf);
  return { c: rel, t: buf.length, h: empreinte(buf) };
}
// Retire la dernière ligne « //# sourceMappingURL=… » (les fichiers .map ne sont pas publiés)
function sansCarteSource(buf) {
  return Buffer.from(buf.toString('utf8').replace(/\n\/\/# sourceMappingURL=[^\n]*\s*$/, '\n'), 'utf8');
}

// Ancienne version : on repart de zéro (LICENCES.md est gardé)
const DOSSIER = path.join(RACINE, 'carte');
if (fs.existsSync(DOSSIER)) {
  fs.readdirSync(DOSSIER).forEach(function (n) {
    if (n !== 'LICENCES.md') fs.rmSync(path.join(DOSSIER, n), { recursive: true, force: true });
  });
}

const fichiers = [];
fichiers.push(ecrire('carte/maplibre-gl.js', sansCarteSource(fs.readFileSync(path.join(MAPLIBRE, 'maplibre-gl.mjs')))));
fichiers.push(ecrire('carte/maplibre-gl-worker.js', sansCarteSource(fs.readFileSync(path.join(MAPLIBRE, 'maplibre-gl-worker.mjs')))));
fichiers.push(ecrire('carte/maplibre-gl.css', fs.readFileSync(path.join(MAPLIBRE, 'maplibre-gl.css'))));
fichiers.push(ecrire('carte/pmtiles.js', sansCarteSource(fs.readFileSync(PMTILES))));
fichiers.push(ecrire('carte/basemaps.js', sansCarteSource(fs.readFileSync(BASEMAPS))));
Object.keys(POLICES).forEach(function (nom) {
  PLAGES.forEach(function (p) {
    fichiers.push(ecrire('carte/polices/' + POLICES[nom] + '/' + p + '.pbf', fs.readFileSync(path.join(ASSETS, 'fonts', nom, p + '.pbf'))));
  });
});
['light', 'dark'].forEach(function (s) {
  ['.json', '.png', '@2x.json', '@2x.png'].forEach(function (suf) {
    fichiers.push(ecrire('carte/icones/' + s + suf, fs.readFileSync(path.join(ASSETS, 'sprites', s + suf))));
  });
});

const region = fs.readFileSync(REGION);
const parties = [];
for (let i = 0, n = 0; i < region.length; i += TAILLE_PARTIE, n++) {
  parties.push(ecrire('carte/region-' + VERSION + '/' + String(n).padStart(2, '0') + '.bin', region.subarray(i, i + TAILLE_PARTIE)));
}

const total = fichiers.concat(parties).reduce(function (s, f) { return s + f.t; }, 0);
const manifeste = {
  version: VERSION,
  osm: DATE_OSM,
  schema: META.schema,
  nom: ZONE.nom,
  zone: ZONE.zone,
  bornes: ZONE.bornes,
  centre: ZONE.centre,
  niveaux: ZONE.niveaux,
  taille: total,
  tailleRegion: region.length,
  empreinteRegion: empreinte(region),
  polices: POLICES,
  fichiers: fichiers,
  region: parties
};
function ligne(f) { return '    ' + JSON.stringify(f); }
const js = '/* =====================================================================\n' +
  '   Carte hors ligne : fichiers à télécharger, avec taille et empreinte.\n' +
  '   Généré par outils/preparer-carte.js — ne pas modifier à la main.\n' +
  '   Carte : © OpenStreetMap (ODbL), tuiles Protomaps, données du ' + DATE_OSM + '.\n' +
  '   ===================================================================== */\n' +
  'self.CARTE = {\n' +
  Object.keys(manifeste).filter(function (k) { return k !== 'fichiers' && k !== 'region'; }).map(function (k) {
    return '  ' + k + ': ' + JSON.stringify(manifeste[k]) + ',\n';
  }).join('') +
  '  fichiers: [\n' + fichiers.map(ligne).join(',\n') + '\n  ],\n' +
  '  region: [\n' + parties.map(ligne).join(',\n') + '\n  ]\n' +
  '};\n';
fs.writeFileSync(path.join(RACINE, 'data', 'carte.js'), js);
console.log('Carte ' + VERSION + ' : ' + fichiers.length + ' fichiers + ' + parties.length + ' morceaux, ' + (total / 1048576).toFixed(2) + ' Mo');
