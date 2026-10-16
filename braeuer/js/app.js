/* Anwaltskanzlei Bräuer · Animationen (GSAP + ScrollTrigger + Lenis, alles lokal) */
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
    var lenis = new Lenis({ duration: 1.2, smoothWheel: true });
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
    gsap.to(w, { yPercent: 0, duration: 1.2, ease: E, stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  var hero = gsap.timeline({ paused: true, defaults: { ease: E } });
  hero.to('.hw', { y: 0, duration: 1.3, stagger: 0.1 })
      .to('.hero__frame', { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: EIO }, 0.15)
      .from('.hero__img', { scale: 1.25, duration: 2 }, 0.15)
      .to('[data-hero]', { opacity: 1, duration: 1, stagger: 0.1 }, 0.5)
      .from('[data-hero]', { y: 24, duration: 1.1, stagger: 0.1 }, 0.5)
      .from('.hero__cap', { xPercent: -25, opacity: 0, duration: 1 }, 1.1);

  /* Intro: Balken schwingt aus, kommt zur Ruhe, Logo erscheint */
  var intro = document.getElementById('intro');
  if (intro && !d.classList.contains('no-intro')) {
    gsap.timeline({ defaults: { ease: E } })
      .to('.intro__beam span', { scaleX: 1, duration: 0.8, ease: EIO })
      .fromTo('.intro__beam', { rotate: 0 }, { rotate: -8, duration: 0.45, ease: 'power2.out' })
      .to('.intro__beam', { rotate: 5, duration: 0.5, ease: 'power2.inOut' })
      .to('.intro__beam', { rotate: 0, duration: 0.7, ease: 'elastic.out(1,0.5)' })
      .to('.intro__beam', { opacity: 0, duration: 0.3 })
      .to('.intro__logo', { opacity: 1, duration: 0.6 }, '<')
      .to(intro, { yPercent: -100, duration: 0.9, ease: EIO }, '+=0.35')
      .add(function () { hero.play(); }, '<0.2')
      .add(function () { intro.classList.add('is-done'); try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {} });
  } else { hero.play(); }

  var nav = document.getElementById('nav'), last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { var y = s.scroll(); nav.classList.toggle('is-hidden', y > 300 && y > last); last = y; } });
  gsap.to('.hero__img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Signature: die Waage kommt beim Scrollen ins Gleichgewicht */
  mm.add('(min-width: 901px)', function () {
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.balance', start: 'top top', end: '+=150%', pin: '.balance__pin', scrub: 0.8 } });
    tl.fromTo('.scale__beam', { rotate: -9 }, { rotate: 6, duration: 1, ease: 'sine.inOut' })
      .to('.scale__beam', { rotate: -2.5, duration: 0.7, ease: 'sine.inOut' })
      .to('.scale__beam', { rotate: 0, duration: 0.6, ease: 'sine.out' })
      .from('.balance__txt', { opacity: 0, y: 30, duration: 0.6 }, '-=0.5')
      .from('.value', { opacity: 0, y: 30, stagger: 0.15, duration: 0.5 }, '-=0.2');
  });
  mm.add('(max-width: 900px)', function () {
    gsap.fromTo('.scale__beam', { rotate: -9 }, { rotate: 0, ease: 'sine.out', scrollTrigger: { trigger: '.scale', start: 'top 85%', end: 'bottom 35%', scrub: 0.6 } });
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: E, stagger: 0.08 }); } });

  gsap.utils.toArray('.person__img img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

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
