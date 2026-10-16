/* Willi Kruse Malerbetrieb · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
(function () {
  var d = document.documentElement;

  /* Vergleichsregler funktionieren auch ohne Animationen */
  document.querySelectorAll('[data-compare]').forEach(function (c) {
    var r = c.querySelector('.compare__range');
    var set = function () { c.style.setProperty('--p', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  /* Menü */
  var mb = document.querySelector('.rail__menu'), menu = document.getElementById('menu');
  if (mb && menu) {
    var toggle = function (open) { menu.hidden = !open; mb.setAttribute('aria-expanded', open); mb.querySelector('.rail__lbl').textContent = open ? 'Schließen' : 'Menü'; };
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
    gsap.set(w, { yPercent: 115 });
    gsap.to(w, { yPercent: 0, duration: 1.2, ease: E, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  /* Hero: Bild wird wie mit der Rolle aufgetragen */
  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hw', { y: 0, duration: 1.3, stagger: 0.12 })
      .fromTo('.roll i', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut', stagger: 0.07 }, 0.3)
      .set('.roll i', { transformOrigin: 'right center' })
      .to('.roll i', { scaleX: 0, duration: 0.8, ease: 'power3.inOut', stagger: 0.07 }, '>0.05')
      .from('.tri__f img', { scale: 1.2, duration: 1.8, ease: E }, '<')
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.08 }, 0.6)
      .from('[data-hero]', { y: 22, duration: 1.1, stagger: 0.08 }, 0.6);

  /* Intro: das U aus dem Logo füllt sich Schicht für Schicht */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: EIO } })
      .from('.tube span', { scaleY: 0, duration: 0.55, stagger: 0.32 })
      .from('.intro__txt', { opacity: 0, y: 14, duration: 0.7, ease: E }, '-=0.2')
      .to(intro, { yPercent: -100, duration: 0.95 }, '+=0.4')
      .add(function () { hero.play(); }, '<0.25')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  gsap.to('.tri__f--l', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.tri', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.tri__f--r', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.tri', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* Signatur: die Chronik zieht durch über hundert Jahre */
  var yr = document.querySelector('.chron__y');
  var evs = gsap.utils.toArray('.ev');
  mm.add('(min-width: 961px)', function () {
    var track = document.querySelector('.chron__track');
    var dist = function () { return track.scrollWidth - document.querySelector('.chron__pin').clientWidth; };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.chron', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.chron__pin', scrub: 0.6, invalidateOnRefresh: true,
        onUpdate: function (s) {
          var i = Math.min(evs.length - 1, Math.round(s.progress * (evs.length - 1)));
          var t = evs[i].querySelector('.ev__y').textContent;
          if (yr.textContent !== t) yr.textContent = t;
        } } });
    gsap.from('.ev', { y: 60, opacity: 0, duration: 1, ease: E, stagger: 0.06, scrollTrigger: { trigger: '.chron', start: 'top 70%', once: true } });
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.05 }); } });

  /* Vergleich: der Regler zeigt beim Reinscrollen einmal kurz beide Seiten */
  document.querySelectorAll('[data-compare]').forEach(function (c) {
    var r = c.querySelector('.compare__range'), o = { v: 50 };
    ScrollTrigger.create({ trigger: c, start: 'top 70%', once: true, onEnter: function () {
      gsap.timeline().to(o, { v: 82, duration: 0.9, ease: 'power2.inOut' }).to(o, { v: 22, duration: 1.1, ease: 'power2.inOut' }).to(o, { v: 50, duration: 0.8, ease: 'power2.out' })
        .eventCallback('onUpdate', function () { r.value = o.v; c.style.setProperty('--p', o.v + '%'); });
    } });
  });

  /* Arbeiten: Bilder werden wie mit dem Pinsel freigelegt */
  gsap.utils.toArray('.wk').forEach(function (f) {
    gsap.fromTo(f.querySelector('.wk__in'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: EIO, scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
    gsap.fromTo(f.querySelector('img'), { scale: 1.18 }, { scale: 1, duration: 1.8, ease: E, scrollTrigger: { trigger: f, start: 'top 88%', once: true } });
  });

  /* Satz füllt sich beim Scrollen Wort für Wort mit Farbe */
  var ft = document.querySelector('.fill__txt');
  if (ft) {
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = p;
            if (node.classList && node.classList.length) node.classList.forEach(function (cl) { s.classList.add(cl); });
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) wrapWords(n);
      });
    };
    wrapWords(ft);
    var ws = ft.querySelectorAll('.w');
    ScrollTrigger.create({ trigger: '.fill', start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle('on', i < n); }); } });
  }

  /* Signatur: der Farbfächer öffnet sich */
  var cards = gsap.utils.toArray('.fan__c');
  cards.forEach(function (c) { c.style.background = c.getAttribute('data-bg'); });
  mm.add('(min-width: 961px)', function () {
    var n = cards.length, spread = 124;
    gsap.set(cards, { rotate: 0 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.svc', start: 'top top', end: '+=140%', pin: '.svc__pin', scrub: 0.7 } });
    tl.to(cards, { rotate: function (i) { return -spread / 2 + i * spread / (n - 1); }, ease: 'power2.out', duration: 1 });
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { gsap.to(c, { y: -40, duration: 0.4, ease: E }); });
      c.addEventListener('mouseleave', function () { gsap.to(c, { y: 0, duration: 0.6, ease: E }); });
    });
  });
  mm.add('(max-width: 960px)', function () {
    gsap.from(cards, { y: 60, opacity: 0, duration: 0.8, ease: E, stagger: 0.04, scrollTrigger: { trigger: '.fan', start: 'top 85%', once: true } });
  });

  /* Pinsel-Cursor in den Logofarben */
  var brush = document.querySelector('.brush');
  if (brush && !touch) {
    d.classList.add('has-brush');
    var cols = ['#d6262c', '#2b7bc6', '#f3d21c'], ci = 0;
    var bx = gsap.quickTo(brush, 'x', { duration: 0.35, ease: 'power3' }), by = gsap.quickTo(brush, 'y', { duration: 0.35, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { bx(e.clientX); by(e.clientY); });
    document.querySelectorAll('a, button, .fan__c, .compare').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ci = (ci + 1) % 3; brush.style.background = cols[ci]; brush.classList.add('big'); });
      el.addEventListener('mouseleave', function () { brush.classList.remove('big'); });
    });
  }

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
