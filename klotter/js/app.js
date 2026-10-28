/* Abschleppdienst Klotter · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;
  var reduced = d.classList.contains('reduced'), touch = d.classList.contains('touch');
  var desk = window.matchMedia('(min-width: 901px)');

  /* Kopf: am Desktop nach unten scrollen blendet ihn aus, am Handy bleibt er stehen */
  var hd = document.getElementById('hd'), lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY; hd.classList.toggle('is-solid', y > 40);
    hd.classList.toggle('is-hidden', desk.matches && y > 600 && y > lastY); lastY = y;
  }, { passive: true });

  function load(v) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } }
  function play(v) { if (reduced) return; load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  /* Videos erst laden, wenn sie in Sicht kommen */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (v.hasAttribute('data-stage') && !v.classList.contains('is-on')) return;
        if (e.isIntersecting) play(v); else v.pause();
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('[data-lazy-video]').forEach(function (v) { io.observe(v); });

    /* Einsatz am Desktop: der Schritt in der Bildmitte ist aktiv, das Bild links wechselt mit */
    var steps = document.querySelectorAll('[data-op]'), stage = document.querySelectorAll('[data-stage]');
    function setStep(n, quiet) {
      steps.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-op') === n); });
      stage.forEach(function (v) {
        var on = v.getAttribute('data-stage') === n; v.classList.toggle('is-on', on);
        if (on && desk.matches && !quiet) play(v); else v.pause();
      });
    }
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setStep(e.target.getAttribute('data-op')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { so.observe(s); });
    setStep('0', true);
  }
  if (reduced) document.querySelectorAll('video').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power3.out';

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    /* Springt die Seite ohne Lenis (Tastatur, Bildlaufleiste, Skript), übernimmt Lenis die neue Position */
    addEventListener('scroll', function () { if (Math.abs(lenis.animatedScroll - scrollY) > 40) lenis.scrollTo(scrollY, { immediate: true, force: true }); }, { passive: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); } });
    });
  }

  /* Ankunft: Titel steht sofort, die Kamera fährt zurück, Text und Knöpfe folgen kurz danach */
  gsap.timeline({ defaults: { ease: E } })
    .fromTo('.hero__v', { scale: 1.18 }, { scale: 1, duration: 2.2 }, 0)
    .from('.hl', { y: 28, duration: 0.7, stagger: 0.08 }, 0)
    .to('[data-hero]', { opacity: 1, duration: 0.5, stagger: 0.08 }, 0.2)
    .from('[data-hero]', { y: 18, duration: 0.6, stagger: 0.08 }, 0.2);

  /* Abschnitte: Überschrift, dann Text, dann Bild, gestaffelt */
  gsap.utils.toArray('section').forEach(function (sec) {
    var items = sec.querySelectorAll('.rv'); if (!items.length) return;
    ScrollTrigger.batch(items, { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.8, ease: E, stagger: 0.08 }); } });
  });

  /* Flotte: Kamera fährt zurück und zeigt den ganzen Hof */
  gsap.fromTo('.fleet__img img', { scale: 1.4 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.fleet', start: 'top bottom', end: 'center center', scrub: true } });
  /* Oldtimer und Schluss: leichte Fahrt im Bild */
  gsap.fromTo('.classic__media video', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.classic', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.close__v', { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.close', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.14, y: (e.clientY - r.top - r.height / 2) * 0.22, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' }); });
  });
})();
