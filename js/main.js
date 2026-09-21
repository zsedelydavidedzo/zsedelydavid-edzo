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
    var raw = el.textContent;
    var f = parseFig(raw);
    if (f.num === null) return;
    var target = f.num, suffix = f.suffix;
    if (reduced) { el.textContent = fmt(target, suffix); return; }
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      if (!isFinite(val)) { el.textContent = raw; return; }   // sose írjunk NaN-t
      el.textContent = fmt(val, suffix);
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

  /* ------------------------------------------ 11. Süti-hozzájárulás --- */
  // Csak a hozzájárulás-köteles tartalom (Facebook) vár engedélyre; a döntés
  // megjegyzése feltétlenül szükséges tárolás. 180 nap után újra megkérdezzük.
  var CK_KEY = 'zd_consent';
  var CK_VERSION = 1;
  var CK_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

  var consent = (function () {
    try {
      var c = JSON.parse(localStorage.getItem(CK_KEY));
      if (c && c.v === CK_VERSION && Date.now() - new Date(c.date).getTime() < CK_MAX_AGE) return c;
    } catch (e) {}
    return null;
  })();

  var ck = null;

  function setConsent(external) {
    var hadExternal = !!(consent && consent.external);
    consent = { v: CK_VERSION, date: new Date().toISOString(), external: !!external };
    try { localStorage.setItem(CK_KEY, JSON.stringify(consent)); } catch (e) {}
    hideBanner();
    // a már betöltött Facebook-tartalmat csak újratöltéssel lehet eltávolítani
    if (hadExternal && !consent.external && document.getElementById('fb-root')) {
      window.location.reload();
      return;
    }
    document.dispatchEvent(new CustomEvent('zd:consent'));
  }

  function hideBanner() {
    if (ck) { ck.remove(); ck = null; }
  }

  function showBanner(openPrefs) {
    if (ck) {
      if (openPrefs) togglePrefs(true);
      return;
    }
    ck = document.createElement('div');
    ck.className = 'ck';
    ck.setAttribute('role', 'dialog');
    ck.setAttribute('aria-modal', 'false');
    ck.setAttribute('aria-labelledby', 'ck-ttl');
    ck.setAttribute('aria-describedby', 'ck-txt');
    ck.innerHTML =
      '<p class="ck-ttl" id="ck-ttl">Sütik és külső tartalom</p>' +
      '<p class="ck-txt" id="ck-txt">Az oldal nem használ nyomkövető, statisztikai vagy hirdetési sütiket. ' +
      'A Vélemények résznél élő Facebook-tartalmat jeleníthetünk meg, amely a Meta sütijeit használja — ' +
      'ezt csak a hozzájárulásoddal töltjük be. <a href="/adatkezeles#sutik">Részletek</a></p>' +
      '<div class="ck-prefs" id="ck-prefs" hidden>' +
        '<div class="ck-row"><div><b>Feltétlenül szükséges</b>' +
          '<span>A süti-döntésed megjegyzése a böngésződben (180 napig). Hozzájárulást nem igényel, nem kapcsolható ki.</span></div>' +
          '<span class="ck-always">Mindig aktív</span></div>' +
        '<label class="ck-row" for="ck-ext"><div><b>Külső tartalom — Facebook</b>' +
          '<span>A Facebook-értékelések élő beágyazása. Bekapcsolás esetén a Meta Platforms Ireland Ltd. sütiket helyezhet el, ' +
          'és megkapja többek között az IP-címedet és a böngésződ adatait — akkor is, ha nincs Facebook-fiókod.</span></div>' +
          '<input type="checkbox" class="ck-switch" id="ck-ext"></label>' +
      '</div>' +
      '<div class="ck-btns">' +
        '<button type="button" class="ck-btn" data-ck="reject">Elutasítom</button>' +
        '<button type="button" class="ck-btn" data-ck="accept">Elfogadom</button>' +
        '<button type="button" class="ck-btn" data-ck="save" hidden>Választás mentése</button>' +
        '<button type="button" class="ck-link" data-ck="prefs" aria-expanded="false" aria-controls="ck-prefs">Beállítások</button>' +
      '</div>';

    ck.querySelector('#ck-ext').checked = !!(consent && consent.external);
    ck.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var a = b.getAttribute('data-ck');
      if (a === 'accept') setConsent(true);
      else if (a === 'reject') setConsent(false);
      else if (a === 'save') setConsent(ck.querySelector('#ck-ext').checked);
      else if (a === 'prefs') togglePrefs();
    });

    var skip = document.querySelector('.skip');
    document.body.insertBefore(ck, skip ? skip.nextSibling : document.body.firstChild);
    if (openPrefs) togglePrefs(true);
  }

  function togglePrefs(force) {
    var prefs = ck.querySelector('#ck-prefs');
    var open = typeof force === 'boolean' ? force : prefs.hidden;
    prefs.hidden = !open;
    ck.querySelector('[data-ck="save"]').hidden = !open;
    var t = ck.querySelector('[data-ck="prefs"]');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    t.textContent = open ? 'Beállítások bezárása' : 'Beállítások';
  }

  if (!consent) showBanner(false);

  document.addEventListener('click', function (e) {
    var o = e.target.closest('.ck-open');
    if (!o) return;
    e.preventDefault();
    showBanner(true);
    ck.querySelector('#ck-ext').focus();
  });

  /* ---------------------- 12. Facebook vélemények (csak hozzájárulással) --- */
  var fbFrame = document.getElementById('fb-revs-frame');
  if (fbFrame) {
    var fbInView = !('IntersectionObserver' in window);
    var fbStarted = false;

    var fbFallback = function () {
      fbFrame.innerHTML =
        '<div class="fb-revs-fallback">' +
        '<div class="stars" aria-label="Facebook értékelések">★★★★★</div>' +
        '<p>A böngésződ blokkolja a Facebook-tartalmat, ezért itt nem jelenik meg élőben — de a véleményeket megnézheted közvetlenül a Facebook oldalunkon.</p>' +
        '</div>';
    };

    var startFb = function () {
      if (fbStarted || !fbInView || !consent || !consent.external) return;
      fbStarted = true;

      var pageBox = document.createElement('div');
      pageBox.className = 'fb-page';
      pageBox.setAttribute('data-href', 'https://www.facebook.com/profile.php?id=61579859533449');
      pageBox.setAttribute('data-tabs', 'reviews');
      pageBox.setAttribute('data-width', '500');
      pageBox.setAttribute('data-height', '700');
      pageBox.setAttribute('data-small-header', 'false');
      pageBox.setAttribute('data-adapt-container-width', 'true');
      pageBox.setAttribute('data-hide-cover', 'false');
      fbFrame.innerHTML = '';
      fbFrame.appendChild(pageBox);

      var fbCheck = window.setTimeout(function () {
        if (!fbFrame.querySelector('iframe')) fbFallback();
      }, 7000);

      if (window.FB) {
        window.clearTimeout(fbCheck);
        window.FB.XFBML.parse(fbFrame);
        return;
      }
      var fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.appendChild(fbRoot);

      var s = document.createElement('script');
      s.async = true;
      s.defer = true;
      s.crossOrigin = 'anonymous';
      s.src = 'https://connect.facebook.net/hu_HU/sdk.js#xfbml=1&version=v19.0';
      s.onerror = function () {
        window.clearTimeout(fbCheck);
        fbFallback();
      };
      document.body.appendChild(s);
    };

    if (!fbInView) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        obs.disconnect();
        fbInView = true;
        startFb();
      }, { rootMargin: '200px 0px' }).observe(fbFrame);
    }

    fbFrame.addEventListener('click', function (e) {
      if (e.target.closest('[data-consent-external]')) setConsent(true);
    });
    document.addEventListener('zd:consent', startFb);
    startFb();
  }

})();
