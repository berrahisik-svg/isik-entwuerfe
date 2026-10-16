/* Zum Sternen · Animationen und Öffnungsstatus (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;
  var reduced = d.classList.contains('reduced');
  var touch = d.classList.contains('touch');

  /* Öffnungsstatus nach Ettlinger Zeit, läuft auch ohne Animationen */
  var HOURS = { 0: [14 * 60, 22 * 60], 1: [690, 1380], 2: [690, 1380], 3: [690, 1380], 4: [690, 1380], 5: [690, 1380], 6: [600, 1440] };
  var NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function fmt(m) { var h = Math.floor(m / 60) % 24, mi = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }
  try {
    var parts = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    var wd = { 'So.': 0, 'Mo.': 1, 'Di.': 2, 'Mi.': 3, 'Do.': 4, 'Fr.': 5, 'Sa.': 6 };
    var day, hh, mm;
    parts.forEach(function (p) { if (p.type === 'weekday') day = wd[p.value]; if (p.type === 'hour') hh = +p.value; if (p.type === 'minute') mm = +p.value; });
    if (day !== undefined) {
      var now = hh * 60 + mm, h = HOURS[day], el = document.querySelector('.now'), t = document.querySelector('.now__txt');
      if (now >= h[0] && now < h[1]) { el.classList.add('is-open'); t.textContent = 'Jetzt geöffnet bis ' + (h[1] === 1440 ? '24:00' : fmt(h[1])) + ' Uhr'; }
      else if (now < h[0]) { el.classList.add('is-closed'); t.textContent = 'Heute ab ' + fmt(h[0]) + ' Uhr geöffnet'; }
      else { var n = (day + 1) % 7; el.classList.add('is-closed'); t.textContent = 'Wieder geöffnet ' + NAMES[n] + ' ab ' + fmt(HOURS[n][0]) + ' Uhr'; }
      document.querySelectorAll('.hrow').forEach(function (r) { if (r.getAttribute('data-days').split(',').indexOf(String(day)) > -1) r.classList.add('is-today'); });
    }
  } catch (e) {}

  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out', EIO = 'power4.inOut';
  var mmq = gsap.matchMedia();

  var lenis = null;
  if (!touch && window.Lenis) {
    lenis = new Lenis({ duration: 1.25, smoothWheel: true });
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

  function splitWords(el) {
    var txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    return el.querySelectorAll('.sw > span');
  }
  document.querySelectorAll('.split').forEach(function (el) {
    var w = splitWords(el);
    gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.2, ease: E, stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* Statement: Wort für Wort heller beim Scrollen */
  var st = document.querySelector('.split-l');
  if (st) {
    var sw = splitWords(st);
    gsap.fromTo(sw, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: st, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  }

  /* Pasta-Titel */
  gsap.utils.toArray('.split-w').forEach(function (w, i) {
    gsap.from(w, { yPercent: 60, opacity: 0, rotate: i === 1 ? -4 : 0, duration: 1.2, ease: E, delay: i * 0.1, scrollTrigger: { trigger: '.menu__title', start: 'top 80%', once: true } });
  });

  /* Hero */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.fromTo('.hero__img', { scale: 1.25 }, { scale: 1.06, duration: 3, ease: 'power3.out' }, 0)
      .fromTo('.hero__logo', { opacity: 0, filter: 'blur(18px)', y: 30 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.8 }, 0.2)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.12 }, 0.8)
      .from('[data-hero]', { y: 24, duration: 1.1, stagger: 0.12 }, 0.8);

  /* Intro: der Stern zeichnet sich, füllt sich mit Gold, verschwindet */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    var path = intro.querySelector('.intro__path');
    var len = path.getTotalLength ? path.getTotalLength() : 600;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ defaults: { ease: E } })
      .to(path, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' })
      .to(path, { fillOpacity: 1, duration: 0.5 }, '-=0.2')
      .to('.intro__star', { rotate: 45, scale: 0.6, duration: 0.8, ease: EIO }, '+=0.1')
      .to('.intro__star', { scale: 14, opacity: 0, duration: 0.8, ease: 'power3.in' })
      .to(intro, { opacity: 0, duration: 0.5 }, '-=0.35')
      .add(function () { hero.play(); }, '-=0.5')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  /* Hero-Parallax und Navigation */
  gsap.to('.hero__img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__in', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll();
    nav.classList.toggle('is-solid', y > 60);
    nav.classList.toggle('is-hidden', y > 500 && y > last);
    last = y;
  } });

  /* Gastraum-Collage mit Tiefe */
  gsap.utils.toArray('.ph img').forEach(function (img, i) {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(img.parentNode, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: EIO, scrollTrigger: { trigger: img.parentNode, start: 'top 85%', once: true } });
  });
  mmq.add('(min-width: 901px)', function () {
    gsap.to('.room__b', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.room', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Sterne drehen sich mit dem Scrollen */
  gsap.to('.menu__star', { rotate: 180, ease: 'none', scrollTrigger: { trigger: '.menu', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.contact__bg svg', { rotate: 90, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Punktlinien der Karte laufen ein */
  gsap.utils.toArray('.dish__l').forEach(function (l) {
    gsap.from(l, { scaleX: 0, transformOrigin: 'left', duration: 1, ease: E, scrollTrigger: { trigger: l, start: 'top 90%', once: true } });
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.08 }); } });

  var c = document.querySelector('.count');
  if (c) {
    var o = { v: 0 };
    gsap.to(o, { v: 4.6, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 85%', once: true },
      onUpdate: function () { c.textContent = o.v.toFixed(1).replace('.', ','); } });
  }

  /* Stern-Cursor */
  var cur = document.querySelector('.cursor');
  if (cur && !touch) {
    var xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { xTo(e.clientX); yTo(e.clientY); });
    gsap.to(cur, { rotate: 360, duration: 10, repeat: -1, ease: 'none' });
    document.querySelectorAll('a,button').forEach(function (a) {
      a.addEventListener('mouseenter', function () { gsap.to(cur, { scale: 2.2, duration: 0.4, ease: E }); });
      a.addEventListener('mouseleave', function () { gsap.to(cur, { scale: 1, duration: 0.4, ease: E }); });
    });
  }

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
