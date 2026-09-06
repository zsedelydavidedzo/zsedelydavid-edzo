/* =============================================================
   Zsédely Dávid — személyi edző | main.js
   Vanilla JS, nincs függőség.
   ============================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------- 1. Sticky fejléc --- */
  var hdr = document.getElementById('hdr');
  var onScroll = function () {
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------ 2. Mobil menü --- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Menü megnyitása');
    document.body.style.overflow = '';
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ------------------------------------- 3. Scroll-belépő animációk --- */
  var animEls = document.querySelectorAll('[data-anim]');
  if (reduced || !('IntersectionObserver' in window)) {
    animEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    animEls.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------- 4. Számláló a statokban --- */
  var counters = document.querySelectorAll('[data-count]');

  /* Az értéket a látható szövegből olvassuk, nem attribútumból — így az
     admin panelen átírt szám tényleg megjelenik az oldalon. */
  function parseFig(raw) {
    var digits = (raw || '').replace(/[^\d]/g, '');
    return {
      num: digits ? parseInt(digits, 10) : null,
      suffix: (raw || '').replace(/[\d\s\u00A0]/g, '')
    };
  }
  function fmt(n, suffix) { return n.toLocaleString('hu-HU') + suffix; }

  function runCount(el) {
    var f = parseFig(el.textContent);
    if (f.num === null) return;
    var target = f.num, suffix = f.suffix;
    if (reduced) { el.textContent = fmt(target, suffix); return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased), suffix);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ------------------------------------------- 5. Aktív menüpont --- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* --------------------------------------- 6. GYIK — egy nyitott elem --- */
  var allDetails = document.querySelectorAll('.qa details');
  allDetails.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      allDetails.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ------------------------------------------------- 7. Vélemények --- */
  /* A névjelölő betűt a névből képezzük, hogy az admin panelen átírt
     névhez mindig a helyes kezdőbetű tartozzon. */
  document.querySelectorAll('.rev .who').forEach(function (who) {
    var nameEl = who.querySelector('b');
    var av = who.querySelector('.av');
    if (!nameEl || !av) return;
    var n = nameEl.textContent.trim();
    av.textContent = n ? n.charAt(0).toUpperCase() : '·';
  });

  /* A még ki nem töltött véleményhelyek nem jelennek meg. Amint az admin
     panelen felülírod a helykitöltő szöveget, a kártya megjelenik. */
  document.querySelectorAll('.rev[data-empty]').forEach(function (rev) {
    var p = rev.querySelector('blockquote p');
    var placeholder = (rev.getAttribute('data-empty') || '').trim();
    if (p && p.textContent.trim() === placeholder) rev.hidden = true;
  });

  /* ------------------------------------------------ 8. Kapcsolati űrlap --- */
  var form = document.querySelector('form[name="kapcsolat"]');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"], .btn');
    var origLabel = submitBtn ? submitBtn.textContent : '';

    function formMsg(html, kind) {
      var box = form.querySelector('.form-msg');
      if (!box) {
        box = document.createElement('p');
        box.className = 'form-msg';
        box.setAttribute('role', 'status');
        form.appendChild(box);
      }
      box.className = 'form-msg ' + kind;
      box.innerHTML = html;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Küldés…'; }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          window.location.href = form.getAttribute('action') || '/koszonjuk';
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
          formMsg(
            '<strong>Az üzenet most nem tudott elmenni.</strong> ' +
            'Hívj a <a href="tel:+36702818799">+36 70 281 8799</a> számon, ' +
            'írj a <a href="mailto:zsedelydavid.edzo@gmail.com">zsedelydavid.edzo@gmail.com</a> címre, ' +
            'vagy keress Messengeren — ott azonnal válaszolok.',
            'err'
          );
        });
    });
  }

  /* --------------------------------------------- 9. Galéria lightbox --- */
  var galBtns = Array.prototype.slice.call(document.querySelectorAll('.gal button'));
  if (galBtns.length) {
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Galéria nagy nézet');
    lb.innerHTML =
      '<button class="lb-close" aria-label="Bezárás">✕</button>' +
      '<button class="lb-nav lb-prev" aria-label="Előző kép">‹</button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" aria-label="Következő kép">›</button>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('img');
    var idx = 0, lastFocus = null;

    function show(i) {
      idx = (i + galBtns.length) % galBtns.length;
      var src = galBtns[idx].getAttribute('data-full');
      var alt = galBtns[idx].querySelector('img').alt;
      lbImg.src = src;
      lbImg.alt = alt;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    galBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ----------------------------------------------- 10. Év a láblécben --- */
  var ev = document.getElementById('ev');
  if (ev) ev.textContent = new Date().getFullYear();

})();
