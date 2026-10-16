/* M&K Malerfachbetrieb · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;
  var reduced = d.classList.contains('reduced');
  var touch = d.classList.contains('touch');
  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out', EIO = 'power4.inOut';
  var mm = gsap.matchMedia();

  var lenis = null;
  if (!touch && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
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

  /* Überschriften wortweise */
  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var inner = el.querySelectorAll('.sw > span');
    gsap.set(inner, { yPercent: 105 });
    gsap.to(inner, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* Hero */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hw', { y: 0, duration: 1.2, stagger: 0.08 })
      .from('.bunt b', { yPercent: 120, rotate: function (i) { return (i % 2 ? 1 : -1) * 18; }, duration: 1.1, stagger: 0.06, ease: 'back.out(1.6)' }, 0.35)
      .to('.hero__frame', { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: EIO }, 0.15)
      .from('.hero__img', { scale: 1.25, duration: 1.8 }, 0.15)
      .to('.hero__img', { filter: 'grayscale(0)', duration: 1.6, ease: 'power2.inOut' }, 1)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.5)
      .from('[data-hero]', { y: 24, duration: 1, stagger: 0.08 }, 0.5)
      .from('.hero__cap', { yPercent: 60, opacity: 0, duration: 0.9 }, 1.1);

  /* Intro: M & K, sechs Farbstreifen wischen das Bild frei */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: E } })
      .from('.intro__mk span', { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 })
      .to('.intro__bars i', { scaleY: 1, duration: 0.6, stagger: 0.06, ease: EIO }, '+=0.25')
      .set('.intro__mk', { opacity: 0 })
      .set(intro, { backgroundColor: 'transparent' })
      .set('.intro__bars i', { transformOrigin: 'top' })
      .to('.intro__bars i', { scaleY: 0, duration: 0.6, stagger: 0.06, ease: EIO })
      .add(function () { hero.play(); }, '<0.15')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  /* Fortschritt und Navigation */
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { var y = s.scroll(); nav.classList.toggle('is-hidden', y > 300 && y > last); last = y; } });

  gsap.to('.hero__img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Signature: Vorher/Nachher */
  var v = document.querySelector('.ba__v'), n = document.querySelector('.ba__n');
  function stateTo(p) { if (v && n) { v.style.opacity = 1 - p * 0.65; n.style.opacity = 0.35 + p * 0.65; } }
  mm.add('(min-width: 961px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.ba', start: 'top top', end: '+=140%', pin: '.ba__pin', scrub: 0.6, onUpdate: function (s) { stateTo(s.progress); } } });
    tl.to('.ba__after', { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0).to('.ba__roller', { left: '100%', ease: 'none' }, 0);
  });
  mm.add('(max-width: 960px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.ba__stage', start: 'top 70%', end: 'bottom 40%', scrub: 0.5, onUpdate: function (s) { stateTo(s.progress); } } });
    tl.to('.ba__after', { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0).to('.ba__roller', { left: '100%', ease: 'none' }, 0);
  });

  /* Reveals */
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.08 }); } });

  /* Leistungen: Bild folgt der Maus */
  var peek = document.querySelector('.peek');
  if (peek && !touch) {
    var pimg = peek.querySelector('img');
    var xTo = gsap.quickTo(peek, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(peek, 'y', { duration: 0.6, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { xTo(e.clientX + 24); yTo(e.clientY - 180); });
    document.querySelectorAll('.srow').forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        var src = r.getAttribute('data-img');
        if (!src) { gsap.to(peek, { autoAlpha: 0, scale: 0.9, duration: 0.3 }); return; }
        pimg.src = src;
        gsap.to(peek, { autoAlpha: 1, scale: 1, rotate: gsap.utils.random(-5, 5), duration: 0.5, ease: E });
      });
    });
    document.querySelector('.slist').addEventListener('mouseleave', function () { gsap.to(peek, { autoAlpha: 0, scale: 0.9, duration: 0.35 }); });
  }

  /* Team-Buchstaben */
  gsap.utils.toArray('.person__letter').forEach(function (l) {
    gsap.from(l, { yPercent: 40, opacity: 0, duration: 1.3, ease: E, scrollTrigger: { trigger: l, start: 'top 85%', once: true } });
  });

  /* Galerie horizontal am Desktop */
  mm.add('(min-width: 961px)', function () {
    var track = document.querySelector('.gallery__track');
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    var h = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.gallery__pin', scrub: 0.6, invalidateOnRefresh: true } });
    gsap.utils.toArray('.g__in img').forEach(function (img) {
      gsap.to(img, { filter: 'grayscale(0)', ease: 'none', scrollTrigger: { trigger: img, containerAnimation: h, start: 'left 90%', end: 'left 45%', scrub: true } });
    });
  });
  mm.add('(max-width: 960px)', function () {
    gsap.utils.toArray('.g__in img').forEach(function (img) { gsap.to(img, { filter: 'grayscale(0)', duration: 1.2, scrollTrigger: { trigger: '.gallery', start: 'top 70%', once: true } }); });
  });

  /* Magnet-Buttons */
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
