/* ============================================================
   THE EXPERIMENTAL PROJECT — capa de medición
   Cableado y listo. Al crear las cuentas, rellena los IDs abajo
   y la medición se activa sola.
   - Para arrancar rápido: basta GA4 (ga4) + Meta Pixel (pixel).
   - GTM es opcional: si lo usas, configura GA4 DENTRO de GTM y deja ga4 vacío.
   Mientras los IDs estén vacíos: NO carga nada externo, pero los
   eventos quedan en dataLayer para poder probar el cableado.
   ============================================================ */
(function () {
  'use strict';

  /* >>> RELLENAR AL CREAR LAS CUENTAS <<< */
  var TRACK = {
    ga4:   '',   // ej. 'G-XXXXXXXXXX'   (GA4 directo)
    gtm:   '',   // ej. 'GTM-XXXXXXX'    (opcional; si lo usas, deja ga4 vacío)
    pixel: ''    // ej. '123456789012345' (Meta Pixel / dataset)
  };

  window.dataLayer = window.dataLayer || [];

  /* --- Google Tag Manager (si hay contenedor) --- */
  if (TRACK.gtm) {
    (function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', TRACK.gtm);
  }

  /* --- GA4 directo (gtag), solo si NO usas GTM --- */
  if (!TRACK.gtm && TRACK.ga4) {
    var gs = document.createElement('script'); gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + TRACK.ga4;
    document.head.appendChild(gs);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', TRACK.ga4);
  }

  /* --- Meta Pixel (si hay ID) --- */
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
    if (window.gtag && TRACK.ga4 && !TRACK.gtm) { window.gtag('event', name, params); }
    if (window.fbq && TRACK.pixel) { window.fbq('trackCustom', name, params); }
  };
})();
