// Découpe la région de la carte hors ligne dans une carte mondiale Protomaps
// (format PMTiles v3), en ne lisant que les morceaux utiles (requêtes HTTP Range).
// Rien à installer : Node 18 ou plus suffit.
//   node outils/extraire-carte.js <url de la carte mondiale> outils/zone-carte.json            → mesure seulement
//   node outils/extraire-carte.js <url de la carte mondiale> outils/zone-carte.json region.pmtiles → écrit l'extrait
// Liste des cartes mondiales : https://build-metadata.protomaps.dev/builds.json
// (ex. https://build.protomaps.com/20261117.pmtiles). Ensuite : node outils/preparer-carte.js …
'use strict';
const fs = require('fs');
const zlib = require('zlib');

const SOURCE = process.argv[2];
const CONFIG = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const SORTIE = process.argv[4] || null;

let octetsLus = 0;
async function lireOctets(debut, longueur) {
  for (let essai = 0; ; essai++) {
    try {
      const r = await fetch(SOURCE, { headers: { Range: 'bytes=' + debut + '-' + (debut + longueur - 1) } });
      if (r.status !== 206) throw new Error('HTTP ' + r.status);
      const b = Buffer.from(await r.arrayBuffer());
      if (b.length !== longueur) throw new Error('reçu ' + b.length + ' au lieu de ' + longueur);
      octetsLus += b.length;
      return b;
    } catch (e) {
      if (essai >= 5) throw e;
      await new Promise(function (ok) { setTimeout(ok, 1500 * (essai + 1)); });
    }
  }
}

async function parLots(liste, n, fn) {
  let i = 0;
  async function travailleur() { while (i < liste.length) { const k = i++; await fn(liste[k], k); } }
  const t = [];
  for (let k = 0; k < n; k++) t.push(travailleur());
  await Promise.all(t);
}

// ---------- Format PMTiles v3 ----------
function lireEntete(b) {
  if (b.toString('latin1', 0, 7) !== 'PMTiles') throw new Error('pas un fichier PMTiles');
  const u64 = function (o) { return Number(b.readBigUInt64LE(o)); };
  return {
    version: b[7],
    rootOff: u64(8), rootLen: u64(16), metaOff: u64(24), metaLen: u64(32),
    leafOff: u64(40), leafLen: u64(48), dataOff: u64(56), dataLen: u64(64),
    nAdresses: u64(72), nEntrees: u64(80), nContenus: u64(88),
    clustered: b[96], compInterne: b[97], compTuiles: b[98], typeTuiles: b[99],
    minZoom: b[100], maxZoom: b[101],
    minLon: b.readInt32LE(102) / 1e7, minLat: b.readInt32LE(106) / 1e7,
    maxLon: b.readInt32LE(110) / 1e7, maxLat: b.readInt32LE(114) / 1e7,
    centreZoom: b[118], centreLon: b.readInt32LE(119) / 1e7, centreLat: b.readInt32LE(123) / 1e7
  };
}

function ecrireEntete(h) {
  const b = Buffer.alloc(127);
  b.write('PMTiles', 0, 'latin1');
  b[7] = 3;
  const u64 = function (o, v) { b.writeBigUInt64LE(BigInt(v), o); };
  u64(8, h.rootOff); u64(16, h.rootLen); u64(24, h.metaOff); u64(32, h.metaLen);
  u64(40, h.leafOff); u64(48, h.leafLen); u64(56, h.dataOff); u64(64, h.dataLen);
  u64(72, h.nAdresses); u64(80, h.nEntrees); u64(88, h.nContenus);
  b[96] = 1; b[97] = 2; b[98] = h.compTuiles; b[99] = h.typeTuiles;
  b[100] = h.minZoom; b[101] = h.maxZoom;
  b.writeInt32LE(Math.round(h.minLon * 1e7), 102); b.writeInt32LE(Math.round(h.minLat * 1e7), 106);
  b.writeInt32LE(Math.round(h.maxLon * 1e7), 110); b.writeInt32LE(Math.round(h.maxLat * 1e7), 114);
  b[118] = h.centreZoom;
  b.writeInt32LE(Math.round(h.centreLon * 1e7), 119); b.writeInt32LE(Math.round(h.centreLat * 1e7), 123);
  return b;
}

function decompresser(b, comp) {
  if (comp === 1) return b;
  if (comp === 2) return zlib.gunzipSync(b);
  if (comp === 3) return zlib.brotliDecompressSync(b);
  throw new Error('compression non gérée : ' + comp);
}

function lireRepertoire(buf) {
  let pos = 0;
  function varint() {
    let res = 0, mul = 1, o;
    do { o = buf[pos++]; res += (o & 0x7f) * mul; mul *= 128; } while (o & 0x80);
    return res;
  }
  const n = varint();
  const e = new Array(n);
  let dernier = 0;
  for (let i = 0; i < n; i++) { dernier += varint(); e[i] = { tileId: dernier, runLength: 0, length: 0, offset: 0 }; }
  for (let i = 0; i < n; i++) e[i].runLength = varint();
  for (let i = 0; i < n; i++) e[i].length = varint();
  for (let i = 0; i < n; i++) {
    const v = varint();
    e[i].offset = (v === 0 && i > 0) ? e[i - 1].offset + e[i - 1].length : v - 1;
  }
  if (pos !== buf.length) throw new Error('répertoire mal lu (' + pos + ' / ' + buf.length + ')');
  return e;
}

function ecrireRepertoire(entrees) {
  const o = [];
  function varint(v) { while (v >= 128) { o.push((v % 128) | 128); v = Math.floor(v / 128); } o.push(v); }
  varint(entrees.length);
  let dernier = 0;
  entrees.forEach(function (e) { varint(e.tileId - dernier); dernier = e.tileId; });
  entrees.forEach(function (e) { varint(e.runLength); });
  entrees.forEach(function (e) { varint(e.length); });
  entrees.forEach(function (e, i) {
    if (i > 0 && e.offset === entrees[i - 1].offset + entrees[i - 1].length) varint(0);
    else varint(e.offset + 1);
  });
  return zlib.gzipSync(Buffer.from(o), { level: 9 });
}

// Plus grande entrée dont tileId ≤ id (même règle que la bibliothèque pmtiles)
function chercher(entrees, id) {
  let lo = 0, hi = entrees.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const c = entrees[m].tileId - id;
    if (c < 0) lo = m + 1; else if (c > 0) hi = m - 1; else return entrees[m];
  }
  if (hi >= 0) {
    const e = entrees[hi];
    if (e.runLength === 0) return e;
    if (id - e.tileId < e.runLength) return e;
  }
  return null;
}

// Numéro de tuile le long de la courbe de Hilbert
const DEBUT_ZOOM = [];
(function () { let acc = 0; for (let z = 0; z <= 26; z++) { DEBUT_ZOOM.push(acc); acc += Math.pow(4, z); } })();
function tuileVersId(z, x, y) {
  const n = Math.pow(2, z);
  const xy = [x, y];
  let d = 0;
  for (let s = n / 2; s >= 1; s /= 2) {
    const rx = (xy[0] & s) > 0 ? 1 : 0;
    const ry = (xy[1] & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) { xy[0] = s - 1 - xy[0]; xy[1] = s - 1 - xy[1]; }
      const t = xy[0]; xy[0] = xy[1]; xy[1] = t;
    }
  }
  return DEBUT_ZOOM[z] + d;
}
function lonVersX(lon, z) { return Math.floor((lon + 180) / 360 * Math.pow(2, z)); }
function latVersY(lat, z) {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z));
}

// ---------- Programme ----------
(async function () {
  const debutTemps = Date.now();
  const tete = await lireOctets(0, 16384);
  const H = lireEntete(tete);
  if (H.version !== 3) throw new Error('version PMTiles ' + H.version);
  console.log('Source :', JSON.stringify({ zooms: [H.minZoom, H.maxZoom], tuiles: H.nAdresses, compInterne: H.compInterne, compTuiles: H.compTuiles, type: H.typeTuiles, clustered: H.clustered }));
  const racine = lireRepertoire(decompresser(tete.subarray(H.rootOff, H.rootOff + H.rootLen), H.compInterne));
  const meta = JSON.parse(decompresser(await lireOctets(H.metaOff, H.metaLen), H.compInterne).toString('utf8'));
  console.log('Métadonnées :', JSON.stringify({ name: meta.name, version: meta.version, attribution: meta.attribution, 'planetiler:osm:osmosisreplicationtime': meta['planetiler:osm:osmosisreplicationtime'], couches: (meta.vector_layers || []).map(function (l) { return l.id; }) }));

  // Tuiles voulues
  const voulues = new Map(); // id → z
  CONFIG.niveaux.forEach(function (niv) {
    for (let z = niv.z[0]; z <= niv.z[1]; z++) {
      const b = niv.bbox;
      for (let x = lonVersX(b[0], z); x <= lonVersX(b[2], z); x++) {
        for (let y = latVersY(b[3], z); y <= latVersY(b[1], z); y++) voulues.set(tuileVersId(z, x, y), z);
      }
    }
  });
  const ids = Array.from(voulues.keys()).sort(function (a, b) { return a - b; });

  // Résolution dans les répertoires (racine puis feuilles)
  const feuilles = new Map();
  const trouve = new Map(); // id → {offset, length} dans la section des données
  let attente = ids.map(function (id) { return { id: id, rep: racine }; });
  for (let prof = 0; attente.length && prof < 5; prof++) {
    const suite = [];
    const aCharger = new Map();
    attente.forEach(function (t) {
      const e = chercher(t.rep, t.id);
      if (!e) return;
      if (e.runLength > 0) { trouve.set(t.id, { offset: e.offset, length: e.length }); return; }
      if (!feuilles.has(e.offset)) aCharger.set(e.offset, e);
      suite.push({ id: t.id, cle: e.offset });
    });
    await parLots(Array.from(aCharger.values()), 4, async function (e) {
      const brut = await lireOctets(H.leafOff + e.offset, e.length);
      feuilles.set(e.offset, lireRepertoire(decompresser(brut, H.compInterne)));
    });
    attente = suite.map(function (s) { return { id: s.id, rep: feuilles.get(s.cle) }; });
  }

  // Bilan par zoom (taille des contenus uniques)
  const parZoom = {};
  const vus = new Set();
  ids.forEach(function (id) {
    const z = voulues.get(id);
    const p = parZoom[z] || (parZoom[z] = { voulues: 0, presentes: 0, octets: 0 });
    p.voulues++;
    const t = trouve.get(id);
    if (!t) return;
    p.presentes++;
    if (!vus.has(t.offset)) { vus.add(t.offset); p.octets += t.length; }
  });
  let total = 0;
  Object.keys(parZoom).forEach(function (z) {
    const p = parZoom[z];
    total += p.octets;
    console.log('z' + z + ' : ' + p.presentes + '/' + p.voulues + ' tuiles, ' + (p.octets / 1048576).toFixed(2) + ' Mo');
  });
  console.log('Total des tuiles : ' + (total / 1048576).toFixed(2) + ' Mo (' + feuilles.size + ' répertoires feuilles lus, ' + (octetsLus / 1048576).toFixed(1) + ' Mo téléchargés)');
  if (!SORTIE) return;

  // Téléchargement des contenus, en regroupant les morceaux proches
  const uniques = Array.from(new Set(Array.from(trouve.values()).map(function (t) { return t.offset + ':' + t.length; })))
    .map(function (s) { const p = s.split(':'); return { offset: +p[0], length: +p[1] }; })
    .sort(function (a, b) { return a.offset - b.offset; });
  const groupes = [];
  uniques.forEach(function (u) {
    const g = groupes[groupes.length - 1];
    if (g && u.offset - g.fin <= 32768 && u.offset + u.length - g.debut <= 4 * 1048576) {
      g.fin = Math.max(g.fin, u.offset + u.length); g.membres.push(u);
    } else groupes.push({ debut: u.offset, fin: u.offset + u.length, membres: [u] });
  });
  const donnees = new Map(); // offset source → Buffer
  let faits = 0;
  await parLots(groupes, 6, async function (g) {
    const b = await lireOctets(H.dataOff + g.debut, g.fin - g.debut);
    g.membres.forEach(function (u) { donnees.set(u.offset, Buffer.from(b.subarray(u.offset - g.debut, u.offset - g.debut + u.length))); });
    faits++;
    if (faits % 20 === 0) process.stdout.write('  ' + faits + '/' + groupes.length + ' morceaux\r');
  });
  console.log('Données téléchargées : ' + groupes.length + ' requêtes');

  // Nouvelle disposition : contenus uniques dans l'ordre des numéros de tuiles
  const nouveaux = new Map(); // offset source → {offset, length}
  const entrees = [];
  const morceaux = [];
  let curseur = 0, nAdresses = 0;
  ids.forEach(function (id) {
    const t = trouve.get(id);
    if (!t) return;
    nAdresses++;
    let c = nouveaux.get(t.offset);
    if (!c) {
      c = { offset: curseur, length: t.length };
      nouveaux.set(t.offset, c);
      morceaux.push(donnees.get(t.offset));
      curseur += t.length;
    }
    const der = entrees[entrees.length - 1];
    if (der && der.offset === c.offset && der.length === c.length && id === der.tileId + der.runLength) der.runLength++;
    else entrees.push({ tileId: id, offset: c.offset, length: c.length, runLength: 1 });
  });

  // Répertoires : tout dans la racine si possible, sinon des feuilles
  let repRacine, repFeuilles = Buffer.alloc(0);
  repRacine = ecrireRepertoire(entrees);
  if (repRacine.length > 16384 - 127) {
    for (let taille = 2048; ; taille *= 2) {
      const r = [], bufs = [];
      let off = 0;
      for (let i = 0; i < entrees.length; i += taille) {
        const lot = entrees.slice(i, i + taille);
        const b = ecrireRepertoire(lot);
        r.push({ tileId: lot[0].tileId, offset: off, length: b.length, runLength: 0 });
        bufs.push(b); off += b.length;
      }
      const rb = ecrireRepertoire(r);
      if (rb.length <= 16384 - 127) { repRacine = rb; repFeuilles = Buffer.concat(bufs); break; }
    }
  }

  const b = CONFIG.bornes;
  meta.description = CONFIG.description || meta.description;
  const metaBuf = zlib.gzipSync(Buffer.from(JSON.stringify(meta), 'utf8'), { level: 9 });
  const zooms = Array.from(new Set(Array.from(voulues.values())));
  const h = {
    rootOff: 127, rootLen: repRacine.length,
    metaOff: 127 + repRacine.length, metaLen: metaBuf.length,
    leafOff: 127 + repRacine.length + metaBuf.length, leafLen: repFeuilles.length,
    dataOff: 127 + repRacine.length + metaBuf.length + repFeuilles.length, dataLen: curseur,
    nAdresses: nAdresses, nEntrees: entrees.length, nContenus: morceaux.length,
    compTuiles: H.compTuiles, typeTuiles: H.typeTuiles,
    minZoom: Math.min.apply(null, zooms), maxZoom: Math.max.apply(null, zooms),
    minLon: b[0], minLat: b[1], maxLon: b[2], maxLat: b[3],
    centreZoom: CONFIG.centre[2], centreLon: CONFIG.centre[0], centreLat: CONFIG.centre[1]
  };
  fs.writeFileSync(SORTIE, Buffer.concat([ecrireEntete(h), repRacine, metaBuf, repFeuilles].concat(morceaux)));
  console.log('Écrit ' + SORTIE + ' : ' + (fs.statSync(SORTIE).size / 1048576).toFixed(2) + ' Mo, ' + entrees.length + ' entrées, ' + morceaux.length + ' contenus, ' + ((Date.now() - debutTemps) / 1000).toFixed(0) + ' s');
  fs.writeFileSync(SORTIE + '.meta.json', JSON.stringify({ source: SOURCE, schema: meta.version, osm: meta['planetiler:osm:osmosisreplicationtime'] || null, attribution: meta.attribution }, null, 1));
})().catch(function (e) { console.error('ERREUR', e); process.exit(1); });
