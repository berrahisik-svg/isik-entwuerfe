/* Kfz Service Westermann · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;

  /* Öffnungszeiten (Europe/Berlin) und Live-Status */
  var H = { 1: [[450, 720], [780, 1050]], 2: [[450, 720], [780, 1050]], 3: [[450, 720], [780, 1050]], 4: [[450, 720], [780, 1050]], 5: [[450, 720], [780, 1050]], 6: [[540, 750]], 0: [] };
  var NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function berlin() {
    try {
      var p = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
      var wd = { 'So.': 0, 'Mo.': 1, 'Di.': 2, 'Mi.': 3, 'Do.': 4, 'Fr.': 5, 'Sa.': 6 }[o.weekday];
      return { day: wd === undefined ? new Date().getDay() : wd, min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function fmt(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  function status() {
    var t = berlin(), slots = H[t.day], open = null, next = null;
    slots.forEach(function (s) { if (t.min >= s[0] && t.min < s[1]) open = s; if (!next && t.min < s[0]) next = s; });
    var st = document.querySelector('[data-status]'), now = document.querySelector('[data-now]');
    if (st) { st.textContent = open ? 'Jetzt geöffnet' : 'Gerade geschlossen'; st.classList.toggle('is-open', !!open); }
    if (now) {
      if (open) now.innerHTML = 'Jetzt geöffnet, heute bis <b>' + fmt(open[1]) + ' Uhr</b>.';
      else if (next) now.innerHTML = 'Gerade geschlossen. Heute wieder ab <b>' + fmt(next[0]) + ' Uhr</b>.';
      else {
        for (var i = 1; i < 8; i++) { var dd = (t.day + i) % 7; if (H[dd].length) { now.innerHTML = 'Gerade geschlossen. Wieder ab <b>' + NAMES[dd] + ', ' + fmt(H[dd][0][0]) + ' Uhr</b>.'; break; } }
      }
    }
    var row = document.querySelector('[data-day="' + t.day + '"]'); if (row) row.classList.add('is-today');
  }
  status(); setInterval(status, 60000);

  /* Monatsring der Plakette */
  var g = document.querySelector('[data-months]');
  if (g) {
    var cur = new Date().getMonth(), ns = 'http://www.w3.org/2000/svg';
    for (var m = 0; m < 12; m++) {
      var a = (m / 12) * Math.PI * 2 - Math.PI / 2, x = 200 + Math.cos(a) * 128, y = 200 + Math.sin(a) * 128;
      var tx = document.createElementNS(ns, 'text'); tx.setAttribute('x', x.toFixed(1)); tx.setAttribute('y', y.toFixed(1)); tx.textContent = m + 1;
      if (m === cur) tx.setAttribute('class', 'is-now'); g.appendChild(tx);
    }
  }

  /* Kopfzeile */
  var top = document.getElementById('top'), lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY; top.classList.toggle('is-solid', y > 40);
    top.classList.toggle('is-hidden', y > 500 && y > lastY); lastY = y;
  }, { passive: true });

  var reduced = d.classList.contains('reduced'), touch = d.classList.contains('touch');
  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out';

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); } });
    });
  }

  /* Überschriften Wort für Wort */
  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span'); gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('.rv').forEach(function (el, i) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: E, delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* Hero: Plakette füllt sich, Titel fährt hoch */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hw', { y: 0, duration: 1.2, stagger: 0.1 })
      .to('.plate__arc', { strokeDashoffset: 1056 - 1056 * ((new Date().getMonth() + 1) / 12), duration: 1.8, ease: 'power3.inOut' }, 0.1)
      .from('.plate__months text', { opacity: 0, scale: 0.6, transformOrigin: 'center', duration: 0.6, stagger: 0.04 }, 0.3)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.5)
      .from('[data-hero]', { y: 20, duration: 1, stagger: 0.08 }, 0.5);
  gsap.to('.plate', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .to('.intro__ring circle', { strokeDashoffset: 0, duration: 1.1 })
      .from('.intro__name', { opacity: 0, y: 12, duration: 0.6, ease: E }, 0.35)
      .to(intro, { clipPath: 'circle(0% at 50% 50%)', duration: 0.9 }, '+=0.25')
      .add(function () { hero.play(); }, '<0.3')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
    gsap.set(intro, { clipPath: 'circle(75% at 50% 50%)' });
  } else { hero.play(); }

  /* Signatur: Ablauf mit Drehscheibe 1 bis 3 */
  var steps = gsap.utils.toArray('[data-step]'), num = document.querySelector('[data-dial]');
  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    gsap.set(steps, { opacity: 0.18 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.flow__pin', start: 'top top', end: '+=140%', pin: true, scrub: 0.6,
      onUpdate: function (s) { var k = Math.min(2, Math.floor(s.progress * 3)); if (num.textContent != k + 1) num.textContent = k + 1; steps.forEach(function (st, i) { st.classList.toggle('on', i === k); }); } } });
    tl.fromTo('.dial__arc', { strokeDashoffset: 1068 }, { strokeDashoffset: 0, ease: 'none' }, 0);
    steps.forEach(function (st, i) { tl.to(st, { opacity: 1, duration: 0.2 }, i / 3).to(st, { opacity: i < 2 ? 0.18 : 1, duration: 0.2 }, i / 3 + 0.3); });
    return function () { gsap.set(steps, { clearProps: 'opacity' }); };
  });
  mm.add('(max-width: 900px)', function () {
    gsap.to('.dial__arc', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.flow', start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: function (s) { num.textContent = Math.min(3, 1 + Math.floor(s.progress * 3)); } } });
  });

  /* Zahl zählt hoch */
  var big = document.querySelector('[data-count]');
  if (big) { var o = { v: 0 }; gsap.to(o, { v: 4.9, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: big, start: 'top 85%', once: true }, onUpdate: function () { big.textContent = o.v.toFixed(1).replace('.', ','); } }); }

  /* Magnetische Buttons (Desktop) */
  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.2, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });
  });
})();
