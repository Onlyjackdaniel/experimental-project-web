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

  /* ---------- NAV: dropdown Episodios ---------- */
  document.querySelectorAll('.lk-drop').forEach(function (drop) {
    var btn = drop.querySelector('.lk-toggle');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // cerrar al hacer click fuera (solo escritorio, donde es hover/click)
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) { drop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  });

  /* ---------- GALERÍA: filmstrip + lightbox ---------- */
  var strip = document.querySelector('.filmstrip');
  if (strip) {
    var prev = document.querySelector('[data-gal="prev"]');
    var next = document.querySelector('[data-gal="next"]');
    var step = function () { return Math.min(strip.clientWidth * 0.8, 520); };
    if (prev) prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: 'smooth' }); });

    var imgs = [].slice.call(strip.querySelectorAll('img'));
    var lb = document.querySelector('.lightbox');
    if (lb && imgs.length) {
      var lbImg = lb.querySelector('img');
      var lbCount = lb.querySelector('.lb-count');
      var idx = 0;
      var open = function (i) {
        idx = (i + imgs.length) % imgs.length;
        lbImg.src = imgs[idx].currentSrc || imgs[idx].src;
        lbImg.alt = imgs[idx].alt || '';
        if (lbCount) lbCount.textContent = (idx + 1) + ' / ' + imgs.length;
        lb.classList.add('open');
        document.body.classList.add('menu-open');
      };
      var close = function () { lb.classList.remove('open'); document.body.classList.remove('menu-open'); };
      imgs.forEach(function (im, i) { im.addEventListener('click', function () { open(i); }); });
      lb.querySelector('.lb-close').addEventListener('click', close);
      lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); open(idx + 1); });
      lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); open(idx - 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') open(idx + 1);
        else if (e.key === 'ArrowLeft') open(idx - 1);
      });
    }
  }

  /* ---------- CONTACTO: formulario (aún sin backend) ---------- */
  var cform = document.querySelector('.form-card');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = cform.querySelector('.form-status');
      if (status) {
        status.innerHTML = '¡Gracias! Por ahora el envío directo aún no está conectado. ' +
          'Escríbenos por <a href="https://www.instagram.com/experimentalxproject/" target="_blank" rel="noopener" style="color:var(--ocre-ink);font-weight:600">Instagram</a> ' +
          'y te respondemos al momento.';
        status.classList.add('show');
      }
      if (window.epTrack) window.epTrack('contact_form_attempt', { channel: 'form' });
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
    var v = { y: 0, yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09 };
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
