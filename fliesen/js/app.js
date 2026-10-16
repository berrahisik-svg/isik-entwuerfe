/* Fliesen Meister · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;

  /* Mosaik: das Bild wird in 8 x 6 Fliesen geteilt */
  var mo = document.querySelector('.mosaic');
  if (mo) {
    var src = mo.getAttribute('data-img').replace(/^\//, ''), html = '';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 8; c++)
      html += '<i style="background-image:url(' + src + ');background-position:' + (c / 7 * 100) + '% ' + (r / 5 * 100) + '%"></i>';
    mo.innerHTML = html;
  }

  /* Menü am Handy */
  var mb = document.querySelector('.top__menu'), menu = document.getElementById('menu');
  if (mb && menu) {
    var toggle = function (open) { menu.hidden = !open; mb.setAttribute('aria-expanded', open); mb.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); };
    mb.addEventListener('click', function () { toggle(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
  }

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

  /* Überschriften Wort für Wort, kursive Wörter bleiben kursiv */
  document.querySelectorAll('.split').forEach(function (el) {
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    var out = [];
    el.childNodes.forEach(function (n) {
      var em = n.nodeType === 1, words = n.textContent.trim().split(/\s+/).filter(Boolean);
      words.forEach(function (w) { out.push('<span class="sw" aria-hidden="true"><span>' + (em ? '<em>' + w + '</em>' : w) + '</span></span>'); });
    });
    el.innerHTML = out.join(' ');
    var w = el.querySelectorAll('.sw > span');
    gsap.set(w, { yPercent: 115 });
    gsap.to(w, { yPercent: 0, duration: 1.1, ease: E, stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Hero: das Bad öffnet sich aus der Mitte */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hero__media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: EIO })
      .from('.hero__img', { scale: 1.25, duration: 2.4 }, 0)
      .to('.hw', { y: 0, duration: 1.2, stagger: 0.12 }, 0.6)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.08 }, 0.9)
      .from('[data-hero]', { y: 22, duration: 1.1, stagger: 0.08 }, 0.9);

  /* Intro: zwölf Fliesen kippen weg und geben das Logo frei */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline()
      .from('.intro__logo', { opacity: 0, y: 16, duration: 0.6, ease: E }, 0.1)
      .from('.intro__grid i', { scale: 0, duration: 0.5, ease: 'back.out(1.4)', stagger: { each: 0.035, from: 'random' } }, 0)
      .to('.intro__grid i', { scale: 0, rotate: 30, duration: 0.5, ease: 'power3.in', stagger: { each: 0.03, from: 'random' } }, '+=0.35')
      .to('.intro__logo', { opacity: 0, y: -16, duration: 0.4, ease: 'power3.in' }, '-=0.35')
      .add(function () { hero.play(); intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
    var y = s.scroll(); nav.classList.toggle('is-solid', y > window.innerHeight * 0.85); nav.classList.toggle('is-hidden', y > 500 && y > last); last = y;
  } });
  gsap.to('.hero__img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.1 }); } });

  /* Betrieb: zwei Fotos gegeneinander */
  gsap.fromTo('.ap--big img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.ap--small', { yPercent: 30 }, { yPercent: -20, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Signatur: Fliese für Fliese. Das Bild ist von Anfang an schwach sichtbar und wird verlegt */
  var tiles = gsap.utils.toArray('.mosaic i');
  var steps = gsap.utils.toArray('.step');
  var order = tiles.map(function (t, i) { return { t: t, k: (i % 8) + Math.floor(i / 8) * 1.3 + Math.random() * 1.1 }; })
                   .sort(function (a, b) { return a.k - b.k; }).map(function (o) { return o.t; });
  mm.add('(min-width: 961px)', function () {
    gsap.set(tiles, { opacity: 0.18, scale: 0.86, rotate: function () { return gsap.utils.random(-10, 10); } });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.lay', start: 'top top', end: '+=160%', pin: '.lay__pin', scrub: 0.6,
      onUpdate: function (s) { var i = Math.min(2, Math.floor(s.progress * 3)); steps.forEach(function (st, k) { st.classList.toggle('is-on', k === i); }); } } });
    tl.to(order, { opacity: 1, scale: 1, rotate: 0, duration: 0.3, ease: 'power2.out', stagger: { each: 0.03 } });
    return function () { gsap.set(tiles, { clearProps: 'all' }); };
  });
  mm.add('(max-width: 960px)', function () {
    gsap.from(order, { opacity: 0.15, scale: 0.6, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.015, scrollTrigger: { trigger: '.mosaic', start: 'top 80%', once: true } });
  });

  /* Bereiche: Karten stapeln sich, die vorige wird kleiner */
  mm.add('(min-width: 961px)', function () {
    var cards = gsap.utils.toArray('.card');
    cards.forEach(function (c, i) {
      gsap.fromTo(c.querySelector('.card__img img'), { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 20%', scrub: true } });
      if (i < cards.length - 1) gsap.to(c, { scale: 0.94, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 30%', scrub: true } });
    });
  });

  /* Projekte: horizontal am Desktop, Zähler läuft mit */
  var idx = document.querySelector('.proj__i'), pfs = gsap.utils.toArray('.pf');
  mm.add('(min-width: 961px)', function () {
    var track = document.querySelector('.proj__track');
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.proj', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.proj__pin', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) { var i = Math.min(pfs.length, Math.round(s.progress * (pfs.length - 1)) + 1); idx.textContent = '0' + i; } } });
  });

  gsap.fromTo('.contact__img img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: true } });

  if (!touch) {
    document.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.5, ease: E });
      });
      b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)' }); });
    });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
