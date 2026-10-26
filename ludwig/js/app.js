/* Lackierer Ludwig · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;
  var bar = document.getElementById('bar'), lastY = 0;
  addEventListener('scroll', function () { var y = scrollY; bar.classList.toggle('is-hidden', y > 500 && y > lastY); lastY = y; }, { passive: true });

  var reduced = d.classList.contains('reduced'), touch = d.classList.contains('touch');
  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out', IO = 'power3.inOut';

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); } });
    });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span'); gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('.rv').forEach(function (el, i) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: E, delay: (i % 4) * 0.07, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* Hero: Spritzgang über das Foto, dann Titel */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.fromTo('.hero__car', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: IO }, 0)
      .fromTo('.hero__car img', { scale: 1.25 }, { scale: 1, duration: 1.8 }, 0)
      .to('.hero__title .hl', { y: 0, duration: 1.2, stagger: 0.1 }, 0.2)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.6)
      .from('[data-hero]', { y: 18, duration: 1, stagger: 0.08 }, 0.6);

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: IO } })
      .from('.intro__logo', { opacity: 0, y: 10, duration: 0.6, ease: E })
      .to('.intro__pass--1', { scaleX: 1, duration: 0.55 }, 0.45)
      .to('.intro__pass--2', { scaleX: 1, duration: 0.55 }, 0.6)
      .to(intro, { yPercent: -100, duration: 0.9 }, '+=0.2')
      .add(function () { hero.play(); }, '<0.3')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  gsap.to('.wall img', { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.wall', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Signatur: drei Arbeitsschritte, jeder Bildwechsel ist ein Spritzgang */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    var f = gsap.utils.toArray('.pass__f'), labels = document.querySelectorAll('.pass__labels li');
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.pass__pin', start: 'top top', end: '+=160%', pin: true, scrub: 0.6,
      onUpdate: function (s) { var k = s.progress < 0.36 ? 0 : s.progress < 0.72 ? 1 : 2; labels.forEach(function (l, i) { l.classList.toggle('on', i === k); }); } } });
    tl.to({}, { duration: 0.15 });
    [1, 2].forEach(function (i) {
      var bandFrom = '-120%', bandTo = '720%';
      tl.fromTo(f[i], { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'none' })
        .fromTo(f[i].querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'none' }, '<');
      tl.to({}, { duration: 0.15 });
    });
  });

  /* Kilometer zählen hoch */
  var km = document.querySelector('[data-km]');
  if (km) { var o = { v: 0 }; gsap.to(o, { v: 20, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: km, start: 'top 85%', once: true }, onUpdate: function () { km.textContent = Math.round(o.v); } }); }

  gsap.utils.toArray('.work__grid img').forEach(function (im) { gsap.fromTo(im, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: im, start: 'top bottom', end: 'bottom top', scrub: true } }); });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });
  });
})();
