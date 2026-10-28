/* Autoservice Kohler · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;

  /* Öffnungszeiten (Europe/Berlin): Mo bis Fr 8 bis 18 Uhr */
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
    /* Wurde die Seite ohne Lenis bewegt (Sprungmarke, Tastatur, Skript), Lenis vor dem nächsten Rad-Schritt angleichen */
    var sync = function () { if (Math.abs(lenis.actualScroll - lenis.animatedScroll) > 40) lenis.reset(); };
    addEventListener('scroll', sync, { capture: true, passive: true });
    addEventListener('wheel', sync, { capture: true, passive: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); } }); });
  }

  /* Überschriften Wort für Wort */
  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span'); gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 0.9, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  gsap.utils.toArray('.rv').forEach(function (el, i) { gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: E, delay: 0.08 + (i % 4) * 0.07, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }); });

  /* Leitmotiv Hebebühne: Bühnenarme fahren aus, das Bild fährt von unten hoch */
  function lift(box, delay) {
    var img = box.querySelector('img');
    var tl = gsap.timeline({ paused: true, delay: delay || 0 });
    tl.fromTo(box, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'power3.inOut' }, 0)
      .fromTo(img, { yPercent: 10 }, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0.1);
    return tl;
  }

  /* Hero: Titel steht sofort, Bild fährt hoch, Rest kommt in unter einer Sekunde */
  var heroLift = lift(document.querySelector('.bay'));
  heroLift.play();
  gsap.fromTo('[data-hero]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: E, stagger: 0.08, delay: 0.1 });
  gsap.to('.bay__car', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Werkstatt-Fotos: jedes fährt beim Einscrollen hoch */
  gsap.utils.toArray('.ph__img').forEach(function (box, i) {
    var tl = lift(box, (i % 2) * 0.08);
    ScrollTrigger.create({ trigger: box, start: 'top 90%', once: true, onEnter: function () { tl.play(); } });
  });

  gsap.fromTo('.place__img img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.place', start: 'top bottom', end: 'center center', scrub: true } });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.14, y: (e.clientY - r.top - r.height / 2) * 0.24, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' }); });
  });
})();
