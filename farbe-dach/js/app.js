/* Farbe & Dach · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;
  var reduced = d.classList.contains('reduced');
  var touch = d.classList.contains('touch');

  if (!window.gsap || !window.ScrollTrigger || reduced) {
    d.classList.add('failsafe');
    return;
  }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out', EIO = 'power4.inOut';
  var mm = gsap.matchMedia();

  /* Weiches Scrollen nur am Desktop */
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

  /* Überschriften in Wörter teilen */
  document.querySelectorAll('.split').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
  });
  gsap.set('.sw > span', { yPercent: 105 });
  document.querySelectorAll('.split').forEach(function (el) {
    gsap.to(el.querySelectorAll('.sw > span'), {
      yPercent: 0, duration: 1.1, ease: E, stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* Hero-Timeline */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.word', { y: 0, duration: 1.3, stagger: 0.09 })
      .to('.hero__frame', { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: EIO }, 0.1)
      .from('.hero__img', { scale: 1.3, duration: 1.8 }, 0.1)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.35)
      .from('[data-hero]', { y: 24, duration: 1, stagger: 0.08 }, 0.35)
      .from('.rating', { xPercent: -30, opacity: 0, duration: 0.9 }, 0.9);

  /* Intro: der alte Satz wird durchgestrichen, dann rollt die Farbe */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    var t = intro.querySelector('.intro__text');
    t.innerHTML = t.textContent.split('').map(function (c) { return '<span class="ch">' + (c === ' ' ? '&nbsp;' : c) + '</span>'; }).join('');
    gsap.set('.intro__panel', { y: 0, yPercent: 100 });
    var tl = gsap.timeline({ defaults: { ease: E } });
    tl.from(intro.querySelectorAll('.ch'), { opacity: 0, duration: 0.01, stagger: 0.028 })
      .to('.intro__strike', { scaleX: 1, duration: 0.6, ease: EIO }, '+=0.15')
      .to('.intro__line', { opacity: 0, duration: 0.3 }, '+=0.2')
      .to('.intro__panel--o', { yPercent: 0, duration: 0.7, ease: EIO }, '<')
      .to('.intro__panel--b', { yPercent: 0, duration: 0.7, ease: EIO }, '<0.12')
      .set(intro, { backgroundColor: 'transparent' })
      .to('.intro__panel--b', { yPercent: -100, duration: 0.8, ease: EIO })
      .to('.intro__panel--o', { yPercent: -100, duration: 0.8, ease: EIO }, '<0.08')
      .add(function () { hero.play(); }, '<0.1')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else {
    hero.play();
  }

  /* Fortschrittsbalken und Navigation */
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll();
    nav.classList.toggle('is-hidden', y > 300 && y > last);
    last = y;
  } });

  /* Hero-Bild Parallax */
  gsap.to('.hero__img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Signature: Farbrolle */
  var fills = gsap.utils.toArray('.rw__fill');
  mm.add('(min-width: 901px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.roller', start: 'top top', end: '+=160%', pin: '.roller__pin', scrub: 0.6 } });
    fills.forEach(function (f, i) { tl.to(f, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 1 }, i * 0.9); });
    tl.from('.roller__note', { opacity: 0, y: 20, duration: 0.6 }, '>-0.3');
  });
  mm.add('(max-width: 900px)', function () {
    fills.forEach(function (f) {
      gsap.to(f, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 85%', end: 'top 45%', scrub: 0.5 } });
    });
  });

  /* Allgemeine Reveals */
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.09 }); }
  });

  /* Zeitstrahl zieht sich mit */
  mm.add('(min-width: 901px)', function () {
    gsap.to('.timeline__rail span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
  });
  mm.add('(max-width: 900px)', function () {
    gsap.to('.timeline__rail span', { scaleY: 1, scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
    gsap.set('.timeline__rail span', { scaleX: 1, scaleY: 0 });
  });

  /* Zahl zählt hoch */
  var c = document.querySelector('.count');
  if (c) {
    var o = { v: 0 };
    gsap.to(o, { v: 5, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 85%', once: true },
      onUpdate: function () { c.textContent = o.v.toFixed(1).replace('.', ','); } });
  }

  /* Magnetische Buttons nur mit Maus */
  if (!touch) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      var s = b.querySelector('span');
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        gsap.to(b, { x: x, y: y, duration: 0.5, ease: E });
        if (s) gsap.to(s, { x: x * 0.4, y: y * 0.4, duration: 0.5, ease: E });
      });
      b.addEventListener('mouseleave', function () {
        gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' });
        if (s) gsap.to(s, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
