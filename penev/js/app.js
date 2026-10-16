/* Penev-Dach · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
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
        if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -80 }); }
      });
    });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span');
    gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.15, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* Hero: Giebel öffnet sich */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hero__media', { clipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', duration: 1.6, ease: EIO })
      .from('.hero__img', { scale: 1.25, duration: 2.2 }, 0)
      .to('.hw', { y: 0, duration: 1.2, stagger: 0.1 }, 0.7)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.1 }, 0.9)
      .from('[data-hero]', { y: 22, duration: 1.1, stagger: 0.1 }, 0.9);

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    var pl = intro.querySelector('polyline');
    var len = pl.getTotalLength ? pl.getTotalLength() : 460;
    gsap.set(pl, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ defaults: { ease: E } })
      .to(pl, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
      .to('.intro__roof', { y: -30, opacity: 0, duration: 0.6, ease: 'power3.in' }, '+=0.25')
      .to(intro, { opacity: 0, duration: 0.5 }, '-=0.2')
      .add(function () { hero.play(); }, '-=0.45')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  gsap.to('.hero__img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__in', { yPercent: -15, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll(); nav.classList.toggle('is-solid', y > 60); nav.classList.toggle('is-hidden', y > 500 && y > last); last = y;
  } });

  /* Kupfer-Giebel über den Leistungen zeichnet sich */
  gsap.utils.toArray('.peak polyline').forEach(function (p) {
    var l = p.getTotalLength ? p.getTotalLength() : 420;
    gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.08 }); } });

  /* Projekte horizontal am Desktop */
  mm.add('(min-width: 961px)', function () {
    var track = document.querySelector('.track');
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.projects', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.projects__pin', scrub: 0.6, invalidateOnRefresh: true } });
    gsap.to('.timeline__rail span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
  });
  mm.add('(max-width: 960px)', function () {
    gsap.set('.timeline__rail span', { scaleX: 1, scaleY: 0 });
    gsap.to('.timeline__rail span', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
  });

  gsap.fromTo('.shop__img img', { yPercent: -8 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.shop', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (!touch) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: E });
      });
      b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }); });
    });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
