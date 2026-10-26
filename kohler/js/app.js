/* Autoservice Kohler · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;
  var H = { 1: [[480, 1080]], 2: [[480, 1080]], 3: [[480, 1080]], 4: [[480, 1080]], 5: [[480, 1080]], 6: [], 0: [] };
  var NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function berlin() {
    try { var p = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()), o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var wd = { 'So.': 0, 'Mo.': 1, 'Di.': 2, 'Mi.': 3, 'Do.': 4, 'Fr.': 5, 'Sa.': 6 }[o.weekday]; return { day: wd === undefined ? new Date().getDay() : wd, min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function fmt(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  function status() {
    var t = berlin(), open = null, next = null;
    H[t.day].forEach(function (s) { if (t.min >= s[0] && t.min < s[1]) open = s; if (!next && t.min < s[0]) next = s; });
    var st = document.querySelector('[data-status]'), now = document.querySelector('[data-now]');
    if (st) st.classList.toggle('is-open', !!open);
    if (now) { if (open) now.innerHTML = 'Jetzt geöffnet, heute bis <b>' + fmt(open[1]) + ' Uhr</b>.'; else if (next) now.innerHTML = 'Gerade geschlossen. Heute ab <b>' + fmt(next[0]) + ' Uhr</b>.';
      else for (var i = 1; i < 8; i++) { var dd = (t.day + i) % 7; if (H[dd].length) { now.innerHTML = 'Gerade geschlossen. Wieder ab <b>' + NAMES[dd] + ', ' + fmt(H[dd][0][0]) + ' Uhr</b>.'; break; } } }
  }
  status(); setInterval(status, 60000);

  var tp = document.getElementById('tp'), lastY = 0;
  addEventListener('scroll', function () { var y = scrollY; tp.classList.toggle('is-solid', y > 40); tp.classList.toggle('is-hidden', y > 600 && y > lastY); lastY = y; }, { passive: true });

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
  gsap.utils.toArray('.rv').forEach(function (el, i) { gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: E, delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }); });

  /* Hero: Bild fährt wie auf der Bühne nach oben */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.fromTo('.bay', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.inOut' }, 0)
      .fromTo('.bay__car', { yPercent: 6 }, { yPercent: -4, duration: 2, ease: 'power3.out' }, 0.2)
      .to('.hl', { y: 0, duration: 1.1, stagger: 0.1 }, 0.15)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.5)
      .from('[data-hero]', { y: 20, duration: 1, stagger: 0.08 }, 0.5);
  gsap.to('.bay__car', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline()
      .from('.intro__arm', { scaleX: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 })
      .from('.intro__w', { opacity: 0, y: 40, duration: 0.5, ease: E }, 0.2)
      .to('.intro__lift', { y: -60, duration: 0.9, ease: 'power2.inOut' }, '+=0.15')
      .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power3.inOut' }, '-=0.35')
      .add(function () { hero.play(); }, '<0.2')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else hero.play();

  /* Galerie fährt seitlich durch (Desktop) */
  gsap.matchMedia().add('(min-width: 901px)', function () {
    var track = document.querySelector('.reel__track');
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth + 40); };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '.reel__pin', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  });

  gsap.fromTo('.place__img img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.place', start: 'top bottom', end: 'center center', scrub: true } });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.16, y: (e.clientY - r.top - r.height / 2) * 0.26, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });
  });
})();
