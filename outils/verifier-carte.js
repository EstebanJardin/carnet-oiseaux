// Relit un extrait PMTiles et vérifie quelques tuiles (décodage MVT minimal),
// puis compare un échantillon de tuiles à la carte mondiale d'origine.
//   node outils/verifier-carte.js region.pmtiles [url de la carte mondiale]
'use strict';
const fs = require('fs');
const zlib = require('zlib');

const FICHIER = process.argv[2];
const SOURCE = process.argv[3] || null;
const buf = fs.readFileSync(FICHIER);

function u64(b, o) { return Number(b.readBigUInt64LE(o)); }
const H = {
  rootOff: u64(buf, 8), rootLen: u64(buf, 16), metaOff: u64(buf, 24), metaLen: u64(buf, 32),
  leafOff: u64(buf, 40), leafLen: u64(buf, 48), dataOff: u64(buf, 56), dataLen: u64(buf, 64),
  nAdresses: u64(buf, 72), nEntrees: u64(buf, 80), nContenus: u64(buf, 88),
  clustered: buf[96], compInterne: buf[97], compTuiles: buf[98], type: buf[99], minZoom: buf[100], maxZoom: buf[101],
  bornes: [buf.readInt32LE(102) / 1e7, buf.readInt32LE(106) / 1e7, buf.readInt32LE(110) / 1e7, buf.readInt32LE(114) / 1e7],
  centre: [buf.readInt32LE(119) / 1e7, buf.readInt32LE(123) / 1e7, buf[118]]
};
console.log('En-tête :', JSON.stringify(H));
if (buf.toString('latin1', 0, 7) !== 'PMTiles' || buf[7] !== 3) throw new Error('en-tête invalide');
if (H.rootOff + H.rootLen > 16384) throw new Error('la racine dépasse 16 Ko');
if (H.dataOff + H.dataLen !== buf.length) throw new Error('taille incohérente');

function lireRep(b) {
  let pos = 0;
  function v() { let r = 0, m = 1, o; do { o = b[pos++]; r += (o & 0x7f) * m; m *= 128; } while (o & 0x80); return r; }
  const n = v(), e = [];
  let d = 0;
  for (let i = 0; i < n; i++) { d += v(); e.push({ tileId: d }); }
  for (let i = 0; i < n; i++) e[i].runLength = v();
  for (let i = 0; i < n; i++) e[i].length = v();
  for (let i = 0; i < n; i++) { const x = v(); e[i].offset = (x === 0 && i > 0) ? e[i - 1].offset + e[i - 1].length : x - 1; }
  return e;
}
const racine = lireRep(zlib.gunzipSync(buf.subarray(H.rootOff, H.rootOff + H.rootLen)));
const toutes = [];
racine.forEach(function (e) {
  if (e.runLength > 0) toutes.push(e);
  else lireRep(zlib.gunzipSync(buf.subarray(H.leafOff + e.offset, H.leafOff + e.offset + e.length))).forEach(function (f) { toutes.push(f); });
});
let adresses = 0;
toutes.forEach(function (e, i) {
  adresses += e.runLength;
  if (i > 0 && e.tileId <= toutes[i - 1].tileId) throw new Error('entrées non triées');
  if (e.offset + e.length > H.dataLen) throw new Error('entrée hors des données');
});
console.log('Racine : ' + racine.length + ' entrées ; total ' + toutes.length + ' entrées, ' + adresses + ' tuiles adressées');
if (adresses !== H.nAdresses || toutes.length !== H.nEntrees) throw new Error('compteurs incohérents');
const meta = JSON.parse(zlib.gunzipSync(buf.subarray(H.metaOff, H.metaOff + H.metaLen)).toString('utf8'));
console.log('Métadonnées : ' + Object.keys(meta).join(', '));

const DEBUT = []; (function () { let a = 0; for (let z = 0; z <= 26; z++) { DEBUT.push(a); a += Math.pow(4, z); } })();
function versId(z, x, y) {
  const xy = [x, y]; let d = 0;
  for (let s = Math.pow(2, z) / 2; s >= 1; s /= 2) {
    const rx = (xy[0] & s) > 0 ? 1 : 0, ry = (xy[1] & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) { if (rx === 1) { xy[0] = s - 1 - xy[0]; xy[1] = s - 1 - xy[1]; } const t = xy[0]; xy[0] = xy[1]; xy[1] = t; }
  }
  return DEBUT[z] + d;
}
function tuile(z, x, y) {
  const id = versId(z, x, y);
  let lo = 0, hi = toutes.length - 1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (toutes[m].tileId < id) lo = m + 1; else if (toutes[m].tileId > id) hi = m - 1; else { hi = m; break; } }
  const e = toutes[hi];
  if (!e || id - e.tileId >= e.runLength) return null;
  return buf.subarray(H.dataOff + e.offset, H.dataOff + e.offset + e.length);
}

// Décodage MVT minimal : noms des couches, nombre d'objets, valeurs texte
function mvt(b) {
  let pos = 0;
  function v() { let r = 0, m = 1, o; do { o = b[pos++]; r += (o & 0x7f) * m; m *= 128; } while (o & 0x80); return r; }
  const couches = [];
  while (pos < b.length) {
    const cle = v(), champ = Math.floor(cle / 8), type = cle % 8;
    if (champ === 3 && type === 2) {
      const fin = v() + pos;
      const c = { nom: '', objets: 0, textes: [] };
      while (pos < fin) {
        const k = v(), f = Math.floor(k / 8), t = k % 8;
        if (t === 2) {
          const l = v(), deb = pos; pos += l;
          if (f === 1) c.nom = b.toString('utf8', deb, pos);
          else if (f === 2) c.objets++;
          else if (f === 4) { // Value : string_value = 1
            let p = deb;
            const k2 = b[p++];
            if (k2 === 0x0a) { let r = 0, m = 1, o; do { o = b[p++]; r += (o & 0x7f) * m; m *= 128; } while (o & 0x80); c.textes.push(b.toString('utf8', p, p + r)); }
          }
        } else if (t === 0) v();
        else if (t === 5) pos += 4;
        else if (t === 1) pos += 8;
        else throw new Error('type protobuf ' + t);
      }
      couches.push(c);
    } else throw new Error('champ inattendu ' + champ);
  }
  return couches;
}

function xy(lon, lat, z) {
  const n = Math.pow(2, z), r = lat * Math.PI / 180;
  return [Math.floor((lon + 180) / 360 * n), Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n)];
}
[[12, 24.8058, 42.6417], [15, 24.8058, 42.6417], [14, 24.917, 42.717], [9, 24.8, 42.6], [5, 24.8, 42.6], [0, 0, 0]].forEach(function (t) {
  const p = xy(t[1], t[2], t[0]);
  const d = tuile(t[0], p[0], p[1]);
  if (!d) { console.log('z' + t[0] + '/' + p.join('/') + ' : ABSENTE'); return; }
  const couches = mvt(zlib.gunzipSync(d));
  const textes = [].concat.apply([], couches.map(function (c) { return c.textes; }));
  console.log('z' + t[0] + '/' + p.join('/') + ' : ' + d.length + ' o, ' + couches.map(function (c) { return c.nom + '(' + c.objets + ')'; }).join(' ') +
    (textes.indexOf('Карлово') !== -1 ? ' — contient « Карлово »' : '') + (textes.indexOf('Ботев') !== -1 ? ' — contient « Ботев »' : ''));
});

// Comparaison avec la source sur un échantillon de tuiles (requêtes Range)
if (SOURCE) (async function () {
  async function lire(debut, l) {
    const r = await fetch(SOURCE, { headers: { Range: 'bytes=' + debut + '-' + (debut + l - 1) } });
    if (r.status !== 206) throw new Error('HTTP ' + r.status);
    return Buffer.from(await r.arrayBuffer());
  }
  const tete = await lire(0, 16384);
  const S = { rootOff: u64(tete, 8), rootLen: u64(tete, 16), leafOff: u64(tete, 40), dataOff: u64(tete, 56) };
  const sRacine = lireRep(zlib.gunzipSync(tete.subarray(S.rootOff, S.rootOff + S.rootLen)));
  const cache = new Map();
  async function sTuile(id) {
    let rep = sRacine;
    for (let p = 0; p < 5; p++) {
      let lo = 0, hi = rep.length - 1;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (rep[m].tileId < id) lo = m + 1; else if (rep[m].tileId > id) hi = m - 1; else { hi = m; break; } }
      const e = rep[hi];
      if (!e) return null;
      if (e.runLength === 0) {
        if (!cache.has(e.offset)) cache.set(e.offset, lireRep(zlib.gunzipSync(await lire(S.leafOff + e.offset, e.length))));
        rep = cache.get(e.offset); continue;
      }
      if (id - e.tileId >= e.runLength) return null;
      return lire(S.dataOff + e.offset, e.length);
    }
    return null;
  }
  // 40 tuiles au hasard parmi celles de l'extrait
  const ech = [];
  for (let i = 0; i < 40; i++) { const e = toutes[Math.floor(Math.random() * toutes.length)]; ech.push(e.tileId + Math.floor(Math.random() * e.runLength)); }
  let ok = 0;
  for (const id of ech) {
    let lo = 0, hi = toutes.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (toutes[m].tileId < id) lo = m + 1; else if (toutes[m].tileId > id) hi = m - 1; else { hi = m; break; } }
    const e = toutes[hi];
    const local = buf.subarray(H.dataOff + e.offset, H.dataOff + e.offset + e.length);
    const distant = await sTuile(id);
    if (distant && Buffer.compare(local, distant) === 0) ok++;
    else console.log('DIFFÉRENCE pour la tuile ' + id);
  }
  console.log('Comparaison avec la source : ' + ok + '/' + ech.length + ' tuiles identiques');
})().catch(function (e) { console.error('ERREUR', e); process.exit(1); });
