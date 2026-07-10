/* ============================================================
   THE EXPERIMENTAL PROJECT — interacciones y animaciones
   Progressive enhancement: si algo falla, el contenido queda visible.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- NAV: estado al hacer scroll ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- NAV móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- año footer ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- tracking de los CTA (funciona aunque aún no haya IDs) ---------- */
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.epTrack) window.epTrack('contact_click', { channel: 'instagram_dm', ubicacion: a.getAttribute('data-cta') });
    });
  });

  /* ---------- FAQ: abrir de a una ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- CTA fijo móvil: aparece al salir del hero, se oculta en el contacto ---------- */
  var mcta = document.querySelector('.mobile-cta');
  if (mcta) {
    var contacto = document.querySelector('#contacto');
    var atBottom = false;
    var mShow = function () { mcta.classList.toggle('show', window.scrollY > 640 && !atBottom); };
    if (contacto && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { atBottom = es[0].isIntersecting; mShow(); }, { threshold: 0 }).observe(contacto);
    }
    window.addEventListener('scroll', mShow, { passive: true });
    mShow();
  }

  /* revela TODO sin depender de GSAP ni de requestAnimationFrame
     (failsafe duro: si algo falla, el contenido nunca queda invisible) */
  function showAll() {
    document.querySelectorAll('[data-reveal],[data-reveal-line] .ln>span,[data-stagger]>*,.manifesto .big .word')
      .forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  /* Sin GSAP (CDN caído) o con reduce-motion: mostramos todo y salimos. */
  if (reduce || !hasGSAP) { showAll(); return; }

  try {

  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Lenis: scroll suave ---------- */
  if (typeof window.Lenis !== 'undefined') {
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', function () { if (window.ScrollTrigger) window.ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    /* anclas internas con Lenis */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id && id.length > 1) {
          var el = document.querySelector(id);
          if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); }
        }
      });
    });
  }

  /* lo que ya está en pantalla al cargar se anima solo (no espera scroll) */
  function aboveFold(el) {
    return el.getBoundingClientRect().top < window.innerHeight * 0.92;
  }

  /* ---------- titulares con máscara por línea ---------- */
  document.querySelectorAll('[data-reveal-line]').forEach(function (el) {
    var spans = el.querySelectorAll('.ln > span');
    if (!spans.length) return;
    var v = { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09 };
    if (aboveFold(el)) { v.delay = 0.15; gsap.to(spans, v); }
    else { v.scrollTrigger = { trigger: el, start: 'top 88%' }; gsap.to(spans, v); }
  });

  /* ---------- reveals genéricos ---------- */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    var v = { y: 0, opacity: 1, duration: 1, ease: 'power3.out' };
    if (aboveFold(el)) { v.delay = 0.2; gsap.to(el, v); }
    else { v.scrollTrigger = { trigger: el, start: 'top 86%' }; gsap.to(el, v); }
  });

  /* ---------- grupos escalonados ---------- */
  gsap.utils.toArray('[data-stagger]').forEach(function (group) {
    var v = { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12 };
    if (aboveFold(group)) { gsap.to(group.children, v); }
    else { v.scrollTrigger = { trigger: group, start: 'top 84%' }; gsap.to(group.children, v); }
  });

  /* recalcular tras cargar fuentes/imágenes */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });

  /* failsafe: si a los 3.5s algo sigue invisible (scroll/rAF trabado),
     lo mostramos con estilo directo, sin depender del ticker de GSAP */
  setTimeout(function () {
    document.querySelectorAll('[data-reveal],[data-stagger]>*,[data-reveal-line] .ln>span')
      .forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
          el.style.opacity = '1'; el.style.transform = 'none';
        }
      });
  }, 3500);

  /* ---------- parallax suave en placeholders marcados ---------- */
  gsap.utils.toArray('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- signature: manifiesto que se ilumina palabra por palabra ---------- */
  var mani = document.querySelector('.manifesto .big[data-words]');
  if (mani) {
    var words = mani.querySelectorAll('.word');
    if (words.length) {
      mani.classList.add('words-on');
      gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 0.4,
        scrollTrigger: { trigger: mani, start: 'top 80%', end: 'bottom 55%', scrub: true }
      });
    }
  }

  } catch (e) { showAll(); }
})();
