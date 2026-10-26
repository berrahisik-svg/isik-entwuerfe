/* Karosseriebetrieb Sacal · Entwurf · GSAP + ScrollTrigger + Lenis (lokal) */
(function () {
  var d = document.documentElement;
  var H = { 1: [[480, 1050]], 2: [[480, 1050]], 3: [[480, 1050]], 4: [[480, 1050]], 5: [[480, 1050]], 6: [[480, 720]], 0: [] };
  var NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  function berlin() {
    try {
      var p = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      var wd = { 'So.': 0, 'Mo.': 1, 'Di.': 2, 'Mi.': 3, 'Do.': 4, 'Fr.': 5, 'Sa.': 6 }[o.weekday];
      return { day: wd === undefined ? new Date().getDay() : wd, min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function fmt(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  function status() {
    var t = berlin(), open = null, next = null;
    H[t.day].forEach(function (s) { if (t.min >= s[0] && t.min < s[1]) open = s; if (!next && t.min < s[0]) next = s; });
    var st = document.querySelector('[data-status]'), now = document.querySelector('[data-now]');
    if (st) st.classList.toggle('is-open', !!open);
    if (now) {
      if (open) now.innerHTML = 'Jetzt geöffnet, heute bis <b>' + fmt(open[1]) + ' Uhr</b>.';
      else if (next) now.innerHTML = 'Gerade geschlossen. Heute ab <b>' + fmt(next[0]) + ' Uhr</b>.';
      else for (var i = 1; i < 8; i++) { var dd = (t.day + i) % 7; if (H[dd].length) { now.innerHTML = 'Gerade geschlossen. Wieder ab <b>' + NAMES[dd] + ', ' + fmt(H[dd][0][0]) + ' Uhr</b>.'; break; } }
    }
    var row = document.querySelector('[data-day="' + t.day + '"]'); if (row) row.classList.add('is-today');
  }
  status(); setInterval(status, 60000);

  var nav = document.getElementById('nav'), lastY = 0;
  addEventListener('scroll', function () { var y = scrollY; nav.classList.toggle('is-solid', y > 40); nav.classList.toggle('is-hidden', y > 500 && y > lastY); lastY = y; }, { passive: true });

  var reduced = d.classList.contains('reduced'), touch = d.classList.contains('touch');

  /* Signatur: Messpunkte. Eine Delle zieht sich glatt, am Desktop drückt die Maus eine neue hinein. */
  var cv = document.getElementById('grid'), ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  var dent = { x: 0.62, y: 0.55, s: reduced ? 0 : 1 }, mouse = { x: -9, y: -9, s: 0 }, W, Hh, DPR;
  function size() { DPR = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; Hh = cv.clientHeight; cv.width = W * DPR; cv.height = Hh * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, Hh);
    var gap = W < 700 ? 30 : 36, r0 = Math.min(W, Hh) * 0.42;
    for (var y = gap / 2; y < Hh; y += gap) for (var x = gap / 2; x < W; x += gap) {
      var dx = x - dent.x * W, dy = y - dent.y * Hh, dist = Math.sqrt(dx * dx + dy * dy), f = Math.max(0, 1 - dist / r0) * dent.s;
      var mx = x - mouse.x, my = y - mouse.y, md = Math.sqrt(mx * mx + my * my), g = Math.max(0, 1 - md / 180) * mouse.s;
      var k = f * f * 26 + g * g * 18, px = x - (dist ? dx / dist : 0) * k * (f > 0 ? 1 : 0) - (md ? mx / md : 0) * g * 18, py = y - (dist ? dy / dist : 0) * k * (f > 0 ? 1 : 0) - (md ? my / md : 0) * g * 18;
      var a = 0.18 + Math.min(0.6, (f + g) * 0.9);
      ctx.fillStyle = (f + g) > 0.12 ? 'rgba(143,166,255,' + a + ')' : 'rgba(244,245,246,0.16)';
      ctx.beginPath(); ctx.arc(px, py, 1.6 + (f + g) * 1.4, 0, 6.283); ctx.fill();
    }
  }
  if (ctx) { size(); draw(); addEventListener('resize', function () { size(); draw(); }); }

  if (!window.gsap || !window.ScrollTrigger || reduced) { d.classList.add('failsafe'); dent.s = 0; draw(); return; }
  clearTimeout(window.__failsafe);
  gsap.registerPlugin(ScrollTrigger);
  var E = 'power4.out';

  if (ctx && !touch) {
    gsap.ticker.add(draw);
    cv.parentElement.addEventListener('mousemove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; gsap.to(mouse, { s: 1, duration: 0.4, overwrite: 'auto' }); });
    cv.parentElement.addEventListener('mouseleave', function () { gsap.to(mouse, { s: 0, duration: 0.8, overwrite: 'auto' }); });
  }

  if (!touch && window.Lenis) {
    var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60 }); } }); });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="sw" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    var w = el.querySelectorAll('.sw > span'); gsap.set(w, { yPercent: 110 });
    gsap.to(w, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('.rv').forEach(function (el, i) { gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: E, delay: (i % 3) * 0.07, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });

  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.ln', { y: 0, duration: 1.2, stagger: 0.1 })
      .to(dent, { s: 0, duration: 2.4, ease: 'elastic.out(1,0.5)', onUpdate: touch ? draw : null }, 0.3)
      .to('[data-hero]', { opacity: 1, duration: 0.9, stagger: 0.08 }, 0.5)
      .from('[data-hero]', { y: 20, duration: 1, stagger: 0.08 }, 0.5);

  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    var w = intro.querySelector('.intro__w'); w.innerHTML = w.textContent.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('');
    var L = w.querySelectorAll('span');
    gsap.set(L, { y: function (i) { return [18, -26, 10, -14, 22][i % 5]; }, rotate: function (i) { return [-8, 6, -4, 9, -6][i % 5]; } });
    gsap.timeline()
      .from(L, { opacity: 0, duration: 0.4, stagger: 0.05 })
      .to(L, { y: 0, rotate: 0, duration: 0.9, ease: 'elastic.out(1,0.55)', stagger: 0.04 }, 0.35)
      .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power3.inOut' }, '+=0.2')
      .add(function () { hero.play(); }, '<0.25')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else hero.play();

  /* „Gerade.“ richtet sich beim Scrollen auf */
  gsap.to('[data-align]', { rotate: 0, skewX: 0, ease: 'none', scrollTrigger: { trigger: '.unfall', start: 'top 80%', end: 'center 50%', scrub: true } });

  if (!touch) document.querySelectorAll('.magnet').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.4 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });
  });
})();
