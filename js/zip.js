/* =====================================================================
   zip.js — création et lecture de fichiers .zip, sans librairie
   - Les fichiers sont « stockés » sans recompression : les JPEG sont déjà
     compressés, et c'est beaucoup plus rapide sur téléphone.
   - Les données ne sont jamais copiées en mémoire : le .zip est un
     assemblage de morceaux (Blob) que le navigateur écrit directement.
   - Lecture : fichiers stockés ou compressés (deflate) si le navigateur
     sait les décompresser.
   ===================================================================== */
'use strict';

(function (App) {
  /* ---------- CRC32 ---------- */
  const TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(octets, precedent) {
    let crc = ((precedent || 0) ^ 0xFFFFFFFF) >>> 0;
    for (let i = 0; i < octets.length; i++) crc = TABLE[(crc ^ octets[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  async function crcBlob(blob) {
    const PAS = 4 * 1024 * 1024;
    let crc = 0;
    for (let i = 0; i < blob.size; i += PAS) {
      crc = crc32(new Uint8Array(await blob.slice(i, i + PAS).arrayBuffer()), crc);
    }
    return crc;
  }

  const encodeur = new TextEncoder();
  const decodeur = new TextDecoder('utf-8');

  function heureDos(d) {
    d = d || new Date();
    return {
      heure: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
      date: ((Math.max(1980, d.getFullYear()) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
  }

  /* ---------- Écriture ----------
     entrees : [{ nom, donnees: Blob | string | Uint8Array, crc?, date? }]
     Renvoie un Blob .zip. */
  async function creer(entrees, surProgression) {
    const morceaux = [];
    const central = [];
    let position = 0;
    for (let i = 0; i < entrees.length; i++) {
      const e = entrees[i];
      let donnees = e.donnees;
      if (typeof donnees === 'string') donnees = encodeur.encode(donnees);
      const blob = donnees instanceof Blob ? donnees : new Blob([donnees]);
      const taille = blob.size;
      const crc = typeof e.crc === 'number' ? e.crc
        : (donnees instanceof Uint8Array ? crc32(donnees) : await crcBlob(blob));
      const nom = encodeur.encode(e.nom);
      const t = heureDos(e.date);

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true);          // noms en UTF-8
      local.setUint16(8, 0, true);               // stocké, sans compression
      local.setUint16(10, t.heure, true);
      local.setUint16(12, t.date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, taille, true);
      local.setUint32(22, taille, true);
      local.setUint16(26, nom.length, true);
      local.setUint16(28, 0, true);
      morceaux.push(local.buffer, nom, blob);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, t.heure, true);
      cd.setUint16(14, t.date, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, taille, true);
      cd.setUint32(24, taille, true);
      cd.setUint16(28, nom.length, true);
      cd.setUint32(42, position, true);
      central.push(cd.buffer, nom);

      position += 30 + nom.length + taille;
      if (position > 0xFFFFFFFF) throw new Error('Sauvegarde trop grande pour un seul fichier .zip');
      if (surProgression) surProgression(i + 1, entrees.length);
    }
    const tailleCentral = central.reduce(function (s, b) { return s + (b.byteLength || b.length); }, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, entrees.length, true);
    fin.setUint16(10, entrees.length, true);
    fin.setUint32(12, tailleCentral, true);
    fin.setUint32(16, position, true);
    if (entrees.length > 0xFFFF) throw new Error('Trop de fichiers pour un seul .zip');
    return new Blob(morceaux.concat(central, [fin.buffer]), { type: 'application/zip' });
  }

  /* ---------- Lecture ----------
     Renvoie une Map nom → { taille, blob(): Promise<Blob>, texte(): Promise<string> } */
  async function lire(fichier) {
    const tailleFin = Math.min(fichier.size, 22 + 65535);
    const finBuf = new DataView(await fichier.slice(fichier.size - tailleFin).arrayBuffer());
    let p = -1;
    for (let i = finBuf.byteLength - 22; i >= 0; i--) {
      if (finBuf.getUint32(i, true) === 0x06054b50) { p = i; break; }
    }
    if (p === -1) throw new Error('Ce fichier n’est pas un .zip valide');
    const nb = finBuf.getUint16(p + 10, true);
    const tailleCD = finBuf.getUint32(p + 12, true);
    const debutCD = finBuf.getUint32(p + 16, true);
    if (debutCD === 0xFFFFFFFF) throw new Error('Format .zip64 non pris en charge');
    const cd = new DataView(await fichier.slice(debutCD, debutCD + tailleCD).arrayBuffer());
    const entrees = new Map();
    let o = 0;
    for (let i = 0; i < nb && o + 46 <= cd.byteLength; i++) {
      if (cd.getUint32(o, true) !== 0x02014b50) break;
      const methode = cd.getUint16(o + 10, true);
      const tailleComp = cd.getUint32(o + 20, true);
      const tailleReelle = cd.getUint32(o + 24, true);
      const lNom = cd.getUint16(o + 28, true);
      const lExtra = cd.getUint16(o + 30, true);
      const lComm = cd.getUint16(o + 32, true);
      const decalage = cd.getUint32(o + 42, true);
      const nom = decodeur.decode(new Uint8Array(cd.buffer, cd.byteOffset + o + 46, lNom));
      o += 46 + lNom + lExtra + lComm;
      if (nom.endsWith('/')) continue;
      entrees.set(nom, {
        taille: tailleReelle,
        blob: async function (type) {
          const tete = new DataView(await fichier.slice(decalage, decalage + 30).arrayBuffer());
          if (tete.getUint32(0, true) !== 0x04034b50) throw new Error('Entrée .zip abîmée : ' + nom);
          const debut = decalage + 30 + tete.getUint16(26, true) + tete.getUint16(28, true);
          const brut = fichier.slice(debut, debut + tailleComp);
          if (methode === 0) return new Blob([brut], { type: type || '' });
          if (methode === 8 && 'DecompressionStream' in window) {
            const flux = brut.stream().pipeThrough(new DecompressionStream('deflate-raw'));
            const b = await new Response(flux).blob();
            return type ? new Blob([b], { type: type }) : b;
          }
          throw new Error('Compression .zip non prise en charge pour ' + nom);
        },
        texte: async function () { return (await this.blob()).text(); }
      });
    }
    return entrees;
  }

  App.zip = { crc32: crc32, crcBlob: crcBlob, creer: creer, lire: lire };
})(window.App);
