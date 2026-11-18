/* =====================================================================
   sons.js — enregistrer et écouter des chants d'oiseaux
   - Enregistrement au micro (fonctionne hors connexion), 3 minutes max,
     sans les filtres « voix » du téléphone pour garder le chant fidèle.
   - Un seul lecteur pour toute l'appli : un son à la fois.
   ===================================================================== */
'use strict';

(function (App) {
  const u = App.u;
  const tr = App.tr;
  const DUREE_MAX = 180; // secondes

  function typeAudio() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    for (let i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    return '';
  }

  function extension(type) {
    type = type || '';
    if (/mp4|m4a|aac/.test(type)) return 'm4a';
    if (/ogg/.test(type)) return 'ogg';
    if (/mpeg|mp3/.test(type)) return 'mp3';
    if (/wav/.test(type)) return 'wav';
    return 'webm';
  }

  function format(secondes) {
    secondes = Math.max(0, Math.round(secondes || 0));
    return Math.floor(secondes / 60) + ':' + String(secondes % 60).padStart(2, '0');
  }

  // Démarre un enregistrement. Renvoie { arreter(): Promise<{blob, type, duree}>, annuler() }
  async function enregistrer(surTemps) {
    const flux = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    const type = typeAudio();
    const rec = new MediaRecorder(flux, type ? { mimeType: type } : undefined);
    const morceaux = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) morceaux.push(e.data); };
    const debut = Date.now();
    let promesse = null;
    const controle = {
      arreter: function () {
        if (promesse) return promesse;
        promesse = new Promise(function (ok) {
          rec.onstop = function () {
            clearInterval(minuteur);
            flux.getTracks().forEach(function (t) { t.stop(); });
            const t = rec.mimeType || type || 'audio/webm';
            ok({ blob: new Blob(morceaux, { type: t }), type: t, duree: Math.round((Date.now() - debut) / 1000) });
          };
          if (rec.state !== 'inactive') rec.stop(); else rec.onstop();
        });
        return promesse;
      },
      annuler: function () {
        clearInterval(minuteur);
        try { if (rec.state !== 'inactive') rec.stop(); } catch (e) { /* déjà arrêté */ }
        flux.getTracks().forEach(function (t) { t.stop(); });
      }
    };
    const minuteur = setInterval(function () {
      const s = Math.floor((Date.now() - debut) / 1000);
      if (surTemps) surTemps(s);
      if (s >= DUREE_MAX) controle.arreter();
    }, 250);
    rec.start(1000);
    return controle;
  }

  // Durée d'un fichier son importé
  function lireDuree(blob) {
    return new Promise(function (ok) {
      const a = document.createElement('audio');
      const x = URL.createObjectURL(blob);
      a.preload = 'metadata';
      a.onloadedmetadata = function () { const d = isFinite(a.duration) ? Math.round(a.duration) : 0; URL.revokeObjectURL(x); ok(d); };
      a.onerror = function () { URL.revokeObjectURL(x); ok(0); };
      a.src = x;
    });
  }

  /* ---------- Lecteur unique ---------- */
  const urls = new Map();
  function url(son) {
    let x = urls.get(son.id);
    if (!x) { x = URL.createObjectURL(son.blob); urls.set(son.id, x); }
    return x;
  }
  function oublierUrl(id) {
    if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); }
  }

  let audio = null, boutonActif = null;
  function etatBouton(b, joue) {
    if (!b) return;
    b.classList.toggle('joue', joue);
    const ic = b.querySelector('.ic use');
    if (ic) ic.setAttribute('href', joue ? '#i-pause' : '#i-lecture');
  }
  function lire(son, bouton) {
    if (!audio) {
      audio = new Audio();
      audio.addEventListener('ended', function () { etatBouton(boutonActif, false); boutonActif = null; });
      audio.addEventListener('pause', function () { etatBouton(boutonActif, false); });
      audio.addEventListener('play', function () { etatBouton(boutonActif, true); });
    }
    if (boutonActif === bouton && !audio.paused) { audio.pause(); return; }
    if (boutonActif && boutonActif !== bouton) etatBouton(boutonActif, false);
    boutonActif = bouton;
    audio.src = url(son);
    audio.play().catch(function (e) { App.ui.toast(tr('Lecture impossible : {erreur}', { erreur: e.message }), { erreur: true }); });
  }
  function arreter() { if (audio && !audio.paused) audio.pause(); }

  // Bouton compact « ▶ 0:24 »
  function puce(son, attribut) {
    return '<button type="button" class="son-puce" ' + attribut + '="' + u.esc(son.id) + '" aria-label="' + u.esc(tr('Écouter le son ({duree})', { duree: format(son.duree) })) + '">' +
      u.ic('lecture') + '<span>' + format(son.duree) + '</span></button>';
  }

  App.sons = {
    disponible: function () { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },
    enregistrer: enregistrer,
    lireDuree: lireDuree,
    extension: extension,
    format: format,
    lire: lire,
    arreter: arreter,
    oublierUrl: oublierUrl,
    puce: puce,
    DUREE_MAX: DUREE_MAX
  };
})(window.App);
