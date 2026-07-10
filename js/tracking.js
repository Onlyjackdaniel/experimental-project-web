/* ============================================================
   THE EXPERIMENTAL PROJECT — capa de medición
   Cableado y listo. Al crear las cuentas, rellena los IDs abajo
   y la medición se activa sola (GTM, GA4 vía GTM, y Meta Pixel).
   Mientras estén vacíos: NO carga nada externo, pero los eventos
   quedan en dataLayer para poder probar el cableado.
   ============================================================ */
(function () {
  'use strict';

  /* >>> RELLENAR AL CREAR LAS CUENTAS <<< */
  var TRACK = {
    gtm:   '',   // ej. 'GTM-XXXXXXX'  (contenedor de Google Tag Manager)
    pixel: ''    // ej. '123456789012345' (Meta Pixel / dataset)
    /* GA4 se configura DENTRO de GTM (no requiere ID aquí). */
  };

  window.dataLayer = window.dataLayer || [];

  /* --- Google Tag Manager (solo si hay contenedor) --- */
  if (TRACK.gtm) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', TRACK.gtm);
  }

  /* --- Meta Pixel (solo si hay ID) --- */
  if (TRACK.pixel) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', TRACK.pixel);
    window.fbq('track', 'PageView');
  }

  /* --- helper de eventos (funciona aunque aún no haya IDs) --- */
  window.epTrack = function (name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (window.fbq && TRACK.pixel) { window.fbq('trackCustom', name, params); }
  };
})();
