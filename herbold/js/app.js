/* Herbold-Dach · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;
  var reduced = d.classList.contains('reduced');
  var touch = d.classList.contains('touch');
  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out', EIO = 'power4.inOut';
  var mm = gsap.matchMedia();

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); }
      });
    });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span');
    gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Hero: das Bild steigt in der Dachneigung von unten auf */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hero__media', { clipPath: 'polygon(0 0%,100% 0%,100% 100%,0 100%)', duration: 1.5, ease: EIO })
      .from('.hero__img', { scale: 1.25, duration: 2.2 }, 0)
      .to('.hw', { y: 0, duration: 1.2, stagger: 0.1 }, 0.6)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.1 }, 0.85)
      .from('[data-hero]', { y: 22, duration: 1.1, stagger: 0.1 }, 0.85);

  /* Intro: roter Dachbalken legt sich, Schriftzug erscheint */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: E } })
      .from('.intro__roof', { scaleX: 0, duration: 0.9, ease: EIO, transformOrigin: '50% 50%' })
      .from('.intro__logo', { clipPath: 'inset(0 0 100% 0)', y: -14, duration: 0.9 }, '-=0.2')
      .to('.intro__roof', { y: -26, duration: 0.5, ease: 'power3.in' }, '+=0.35')
      .to(intro, { yPercent: -100, duration: 0.9, ease: EIO }, '-=0.15')
      .add(function () { hero.play(); }, '<0.2')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll(); nav.classList.toggle('is-solid', y > 60); nav.classList.toggle('is-hidden', y > 500 && y > last); last = y;
  } });
  gsap.to('.hero__img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Zahlen zählen hoch */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'), o = { v: to - 16 };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
    } });
  });

  /* Signatur: das Blech schiebt sich in der Dachneigung über das Dach */
  mm.add('(min-width: 961px)', function () {
    var duo = document.querySelector('.duo');
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.duo', start: 'top top', end: '+=170%', pin: '.duo__pin', scrub: 0.7,
      onUpdate: function (s) { duo.classList.toggle('is-blech', s.progress > 0.5); } } });
    tl.to('.duo__img--dach', { scale: 1.08, duration: 1, ease: 'none' }, 0)
      .fromTo('.duo__img--blech', { clipPath: 'polygon(0% 100%,100% 100%,100% 100%,0% 100%)' },
        { clipPath: 'polygon(0% 32%,100% 0%,100% 100%,0% 100%)', duration: 0.45, ease: 'power2.inOut' }, 0.3)
      .to('.duo__img--blech', { clipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', duration: 0.25, ease: 'power2.out' }, 0.75);
    return function () { duo.classList.remove('is-blech'); };
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.08 }); } });

  /* Arbeiten: Bilder öffnen sich schräg wie eine Dachfläche */
  gsap.utils.toArray('.wk').forEach(function (f, i) {
    var inn = f.querySelector('.wk__in');
    gsap.fromTo(inn, { clipPath: 'polygon(0 100%,100% 100%,100% 100%,0 100%)' }, { clipPath: 'polygon(0 0%,100% 0%,100% 100%,0 100%)', duration: 1.3, ease: EIO, scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
    gsap.fromTo(f.querySelector('img'), { scale: 1.2 }, { scale: 1, duration: 1.8, ease: E, scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
  });

  gsap.fromTo('.about__img img', { yPercent: -8 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.career__media img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.career', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (!touch) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.5, ease: E });
      });
      b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }); });
    });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
