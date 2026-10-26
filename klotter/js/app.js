/* Abschleppdienst Klotter · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;
  var hd = document.getElementById('hd'), lastY = 0;
  addEventListener('scroll', function () { var y = scrollY; hd.classList.toggle('is-solid', y > 40); hd.classList.toggle('is-hidden', y > 600 && y > lastY); lastY = y; }, { passive: true });

  /* Videos erst laden, wenn sie in Sicht kommen */
  var lazy = document.querySelectorAll('[data-lazy-video]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.target; if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }); }, { rootMargin: '200px' });
    lazy.forEach(function (v) { io.observe(v); });
  }
  if (d.classList.contains('reduced')) document.querySelectorAll('video').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });

  var reduced = d.classList.contains('reduced'), touch = d.classList.contains('touch');
  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out';

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); } }); });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span'); gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1, ease: E, stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });
  gsap.utils.toArray('.rv').forEach(function (el, i) { gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: E, delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });

  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.fromTo('.hero__v', { scale: 1.25 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
      .to('.hl', { y: 0, duration: 1.1, stagger: 0.11 }, 0.15)
      .from('.hero__count b, .hero__count span', { yPercent: 60, opacity: 0, duration: 1.4, stagger: 0.1 }, 0.3)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.55)
      .from('[data-hero]', { y: 20, duration: 1, stagger: 0.08 }, 0.55);

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline()
      .to('.intro__stripes i', { scaleY: 1, duration: 0.45, ease: 'power3.out', stagger: 0.045 })
      .from('.intro__logo', { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, 0.25)
      .to('.intro__stripes i', { scaleY: 0, transformOrigin: 'top', duration: 0.4, ease: 'power3.in', stagger: 0.035 }, '+=0.35')
      .to('.intro__logo', { y: -30, opacity: 0, duration: 0.4, ease: 'power3.in' }, '<')
      .to(intro, { opacity: 0, duration: 0.3 }, '-=0.1')
      .add(function () { hero.play(); }, '<')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else hero.play();

  /* Warnband läuft beim Scrollen mit */
  gsap.to('.hazard', { backgroundPosition: '100% 0', ease: 'none', scrollTrigger: { trigger: '.hazard', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.hero__count', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Flotte: Kamera fährt zurück und zeigt den ganzen Hof */
  gsap.fromTo('.fleet__img img', { scale: 1.45 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.fleet', start: 'top bottom', end: 'center center', scrub: true } });

  /* Zahlen */
  document.querySelectorAll('.facts__grid b').forEach(function (b) {
    var t = b.textContent, n = parseFloat(t.replace(',', '.')), dec = t.indexOf(',') > -1, o = { v: 0 };
    gsap.to(o, { v: n, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 88%', once: true }, onUpdate: function () { b.textContent = dec ? o.v.toFixed(1).replace('.', ',') : Math.round(o.v); } });
  });

  /* Einsatz: Video steht, Schritte wechseln */
  var ops = gsap.utils.toArray('[data-op]');
  gsap.matchMedia().add('(min-width: 901px)', function () {
    gsap.set(ops, { opacity: 0.2 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.ops__pin', start: 'top top', end: '+=130%', pin: true, scrub: 0.5 } });
    ops.forEach(function (o, i) { tl.to(o, { opacity: 1, duration: 0.3 }, i * 0.33); if (i < 2) tl.to(o, { opacity: 0.2, duration: 0.3 }, i * 0.33 + 0.3); });
    tl.fromTo('.ops__media', { clipPath: 'inset(8% 8% 8% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'none' }, 0);
    return function () { gsap.set(ops, { clearProps: 'opacity' }); };
  });

  gsap.fromTo('.classic__big', { xPercent: 10 }, { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.classic', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.16, y: (e.clientY - r.top - r.height / 2) * 0.26, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });
  });
})();
