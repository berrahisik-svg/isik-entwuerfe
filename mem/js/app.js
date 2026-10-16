/* Rechtsanwalt Michael Eckhard Müller · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
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
    var lenis = new Lenis({ duration: 1.2, smoothWheel: true });
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
    gsap.to(w, { yPercent: 0, duration: 1.2, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Hero */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hw', { y: 0, duration: 1.3, stagger: 0.12 })
      .to('.hero__frame', { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: EIO }, 0.1)
      .from('.hero__img', { scale: 1.3, duration: 2.2 }, 0.1)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.08 }, 0.55)
      .from('[data-hero]', { y: 24, duration: 1.1, stagger: 0.08 }, 0.55);

  /* Intro: die drei Ebenen des Kanzleizeichens legen sich übereinander */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: E } })
      .from('.mark--intro path', { x: -22, opacity: 0, duration: 0.9, stagger: 0.2 })
      .from('.intro__name span, .intro__name small', { yPercent: 60, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.45')
      .to(intro, { yPercent: -100, duration: 0.95, ease: EIO }, '+=0.45')
      .add(function () { hero.play(); }, '<0.25')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  /* Navigation: hell auf Weiß, dunkel über schwarzen Kapiteln */
  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll(); nav.classList.toggle('is-solid', y > 40); nav.classList.toggle('is-hidden', y > 500 && y > last); last = y;
  } });
  ScrollTrigger.create({ trigger: '.areas', start: 'top 60px', end: 'bottom 60px', toggleClass: { targets: nav, className: 'is-dark' } });
  gsap.to('.hero__img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Signatur: jede Ebene ein Schwerpunkt */
  var areas = gsap.utils.toArray('.area');
  var glyphs = gsap.utils.toArray('.mark--big path');
  var num = document.querySelector('.areas__n');
  var cur = -1;
  function show(i) {
    if (i === cur) return;
    var prev = cur; cur = i;
    glyphs.forEach(function (g, k) { g.classList.toggle('is-on', k === i); });
    gsap.fromTo(glyphs[i], { x: -2 }, { x: 0, duration: 0.8, ease: E, overwrite: 'auto' });
    if (num) num.textContent = '0' + (i + 1);
    areas.forEach(function (a, k) { a.classList.toggle('is-on', k === i); });
    if (prev > -1) gsap.fromTo(areas[i], { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: E });
  }
  mm.add('(min-width: 961px)', function () {
    show(0);
    gsap.from('.mark--big path', { x: -9, opacity: 0, immediateRender: false, duration: 1.1, ease: E, stagger: 0.15, scrollTrigger: { trigger: '.areas', start: 'top 70%', once: true } });
    ScrollTrigger.create({ trigger: '.areas', start: 'top top', end: '+=180%', pin: '.areas__pin', scrub: true,
      onUpdate: function (s) { show(Math.min(2, Math.floor(s.progress * 3))); } });
    return function () { areas.forEach(function (a) { a.classList.add('is-on'); gsap.set(a, { clearProps: 'all' }); }); cur = -1; };
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.09 }); } });

  gsap.utils.toArray('.mark--mini').forEach(function (m) {
    gsap.from(m.querySelectorAll('path'), { x: -24, opacity: 0, duration: 0.9, ease: E, stagger: 0.12, scrollTrigger: { trigger: m, start: 'top 88%', once: true } });
  });

  gsap.fromTo('.person__img img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.person', start: 'top bottom', end: 'center center', scrub: true } });

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
