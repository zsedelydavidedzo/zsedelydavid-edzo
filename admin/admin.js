/* =============================================================================
   Admin panel — a weboldal szövegeinek és képeinek szerkesztése
   A szerkesztés az index.html-en történik, a mentés GitHub commitot csinál,
   amit a Netlify automatikusan élesít.
   ========================================================================== */
(function () {
  'use strict';

  var API = '/api/save';

  var pw = '';
  var doc = null;          // a beolvasott index.html DOM-ja
  var fields = [];         // { el, orig, ta }
  var images = [];         // { picture, img, orig, newFiles }
  var dirty = false;

  var $ = function (s) { return document.querySelector(s); };
  var gate = $('#gate'), app = $('#app'), statusEl = $('#status');
  var noticeEl = $('#notice'), editor = $('#editor'), aside = $('#aside');
  var saveBtn = $('#save');

  /* --------------------------------------------------- segédfüggvények --- */
  function notice(msg, kind) {
    noticeEl.className = 'notice ' + (kind || 'info');
    noticeEl.innerHTML = msg;
    noticeEl.hidden = false;
    noticeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function setDirty(v) {
    dirty = v;
    saveBtn.disabled = !v;
    statusEl.textContent = v ? 'Nem mentett módosítások' : 'Minden mentve';
    statusEl.className = v ? 'dirty' : '';
  }
  function shorten(s, n) {
    s = (s || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  /* Szekciónevek — ami a HTML-ben nem beszédes */
  var SECTION_NAMES = {
    'hdr': 'Fejléc', 'hero': 'Hero (nyitóblokk)', 'stats': 'Számok sáv',
    'about': 'Rólam', 'services': 'Szolgáltatások', 'locations': 'Helyszínek',
    'process': 'Folyamat', 'gallery': 'Galéria', 'pricing': 'Árak / csomagok',
    'reviews': 'Vélemények', 'faq': 'GYIK', 'cta': 'CTA sáv',
    'contact': 'Kapcsolat', 'footer': 'Lábléc'
  };
  function sectionName(el) {
    var s = el.closest('section, header, footer');
    if (!s) return 'Egyéb';
    for (var cls in SECTION_NAMES) if (s.classList.contains(cls)) return SECTION_NAMES[cls];
    return 'Egyéb';
  }

  /* Szerkeszthető-e? Csak az inline tartalmú elemek. */
  var BLOCKISH = 'div,section,article,ul,ol,li,p,h1,h2,h3,h4,header,footer,nav,form,picture,img,svg,button,figure,blockquote,table,details,summary,input,select,textarea,aside,main,figcaption';
  function isLeaf(el) {
    return !el.querySelector(BLOCKISH);
  }

  /* --------------------------------------------------------- betöltés --- */
  /* A forrást a GitHub repóból töltjük, NEM az élő oldalról: az élő HTML-t a
     Netlify kiegészíti (statisztikai script, átírt linkek), és az visszamentve
     minden alkalommal beépülne a forrásba. */
  function load() {
    statusEl.textContent = 'Betöltés…';
    return fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'load', path: 'index.html', password: pw })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        if (!res.ok) {
          var e = new Error(res.j.error || ('HTTP ' + res.status));
          e.status = res.status;
          throw e;
        }
        doc = new DOMParser().parseFromString(res.j.content, 'text/html');
        build();
        setDirty(false);
        statusEl.textContent = 'Betöltve — ' + fields.length + ' szövegmező, ' + images.length + ' kép';
        return true;
      });
  }

  /* ------------------------------------------------- felület felépítése --- */
  function build() {
    fields = []; images = [];
    editor.innerHTML = ''; aside.innerHTML = '';

    var SEL = 'h1,h2,h3,h4,p,li,summary,a,b,em,small,span[data-edit],.tagi,.pin,.eyebrow,.price,'
            + '.stat b,.stat span,.hero-badge b,.hero-badge span,.card-meta span,.card-meta em,.feats li';
    var nodes = Array.prototype.slice.call(doc.querySelectorAll(SEL));

    // csak levél-elemek, üres és admin-idegen elemek nélkül
    nodes = nodes.filter(function (el) {
      if (!isLeaf(el)) return false;
      var t = (el.textContent || '').trim();
      if (!t) return false;
      if (el.closest('.logo')) return false;
      if (el.closest('script,style,head')) return false;
      if (el.classList.contains('skip')) return false;
      return true;
    });
    // duplikátumok kiszűrése
    nodes = nodes.filter(function (el, i) { return nodes.indexOf(el) === i; });
    // ha egy elemnek van szerkeszthető őse, csak az ős marad (nincs kettős szerkesztés)
    nodes = nodes.filter(function (el) {
      return !nodes.some(function (o) { return o !== el && o.contains(el); });
    });

    var imgs = Array.prototype.slice.call(doc.querySelectorAll('main img, header img'))
      .filter(function (im) { return (im.getAttribute('src') || '').indexOf('/img/') === 0; });

    // csoportosítás szekciónként, az oldal sorrendjében
    var groups = [], byName = {};
    function group(name) {
      if (!byName[name]) { byName[name] = { name: name, items: [] }; groups.push(byName[name]); }
      return byName[name];
    }
    nodes.forEach(function (el) { group(sectionName(el)).items.push({ type: 'text', el: el }); });
    imgs.forEach(function (im) { group(sectionName(im)).items.push({ type: 'img', el: im }); });

    groups.forEach(function (g, gi) {
      var id = 'g' + gi;
      var sec = document.createElement('section');
      sec.className = 'grp'; sec.id = id;
      sec.innerHTML = '<h2>' + g.name + '</h2><p class="sub">' + g.items.length + ' szerkeszthető elem</p>';

      g.items.forEach(function (it) {
        sec.appendChild(it.type === 'text' ? textField(it.el) : imageField(it.el));
      });
      editor.appendChild(sec);

      var a = document.createElement('a');
      a.href = '#' + id;
      a.innerHTML = g.name + '<span class="cnt">' + g.items.length + '</span>';
      aside.appendChild(a);
    });

    // aktív menüpont
    var links = Array.prototype.slice.call(aside.querySelectorAll('a'));
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id); });
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      editor.querySelectorAll('.grp').forEach(function (s) { io.observe(s); });
    }
  }

  /* ----------------------------------------------------- szövegmező --- */
  function textField(el) {
    var wrap = document.createElement('div');
    wrap.className = 'fld';

    var tag = el.tagName.toLowerCase();
    var label = ({ h1: 'Főcím', h2: 'Szekciócím', h3: 'Alcím', summary: 'Kérdés', li: 'Listaelem', p: 'Szöveg' })[tag] || 'Szöveg';
    if (el.classList.contains('eyebrow')) label = 'Kis címke';
    if (el.classList.contains('btn')) label = 'Gomb felirata';
    if (el.classList.contains('tagi') || el.classList.contains('pin')) label = 'Jelölő címke';
    if (el.classList.contains('price')) label = 'Ár';
    if (el.closest('.contact-info')) label = (tag === 'b') ? 'Adat megnevezése' : 'Elérhetőség';
    if (el.closest('.stat')) label = (tag === 'b') ? 'Szám' : 'Felirat';
    if (el.closest('.who')) label = 'Vélemény szerzője';
    if (el.closest('blockquote')) label = 'Vélemény szövege';
    if (el.closest('.nav')) label = 'Menüpont';
    if (el.closest('.f-col')) label = 'Lábléc link';
    if (el.closest('.socials')) label = 'Közösségi ikon';
    if (el.closest('.ans')) label = 'Válasz';
    if (el.closest('.feats')) label = 'Címke';

    var orig = el.innerHTML;
    var rows = Math.min(8, Math.max(1, Math.ceil(el.textContent.length / 78)));

    wrap.innerHTML = '<label>' + label + ' — <span style="color:#6E7682;text-transform:none;letter-spacing:0">'
      + shorten(el.textContent, 46) + '</span></label>'
      + '<textarea rows="' + rows + '"></textarea>';

    var ta = wrap.querySelector('textarea');
    ta.value = orig.replace(/\s*\n\s*/g, ' ').trim();

    var hints = [];
    if (/<[a-z]/i.test(orig)) {
      hints.push('Formázás megtartható: <code>&lt;span class="hl"&gt;kiemelt&lt;/span&gt;</code> · <code>&lt;br&gt;</code> sortörés.');
    }
    if (hints.length) {
      var h = document.createElement('p');
      h.className = 'hint';
      h.innerHTML = hints.join('<br>');
      wrap.appendChild(h);
    }

    /* A hivatkozás célcíme külön mezőben (Instagram, Messenger, telefon, e-mail).
       Az oldalon belüli ugrásokat (#arak) nem kínáljuk fel. */
    var linkEl = (tag === 'a') ? el : el.closest('a');
    var href = linkEl && linkEl.getAttribute('href');
    var hrefInput = null;
    if (href && !/^#/.test(href)) {
      var hw = document.createElement('div');
      hw.className = 'hrefrow';
      hw.innerHTML = '<label>Hova vezet</label><input type="text" spellcheck="false">'
        + '<p class="hint">Teljes cím: <code>https://instagram.com/felhasznalonev</code> · '
        + '<code>https://m.me/oldalneve</code> · <code>tel:+36701234567</code> · '
        + '<code>mailto:cim@example.com</code></p>';
      hrefInput = hw.querySelector('input');
      hrefInput.value = href;
      hrefInput.addEventListener('input', function () {
        var changed = hrefInput.value.trim() !== href;
        wrap.classList.toggle('changed', changed || ta.value.trim() !== orig.replace(/\s*\n\s*/g, ' ').trim());
        if (changed) setDirty(true);
      });
      wrap.appendChild(hw);
    }

    ta.addEventListener('input', function () {
      var changed = ta.value.trim() !== orig.replace(/\s*\n\s*/g, ' ').trim();
      wrap.classList.toggle('changed', changed);
      if (changed) setDirty(true);
    });

    fields.push({ el: el, orig: orig, ta: ta, linkEl: linkEl, href: href, hrefInput: hrefInput });
    return wrap;
  }

  /* --------------------------------------------------------- képmező --- */
  function imageField(img) {
    var wrap = document.createElement('div');
    wrap.className = 'fld';
    var src = img.getAttribute('src');
    var rec = { img: img, picture: img.closest('picture'), files: null, wrap: wrap };

    wrap.innerHTML =
      '<label>Kép</label>' +
      '<div class="imgfld">' +
      '  <img src="' + src + '" alt="">' +
      '  <div class="ic">' +
      '    <div class="fname">' + src + '</div>' +
      '    <input type="file" accept="image/*">' +
      '    <p class="hint">Válassz új képet — automatikusan átméretezem és optimalizálom. A régi kép megmarad a tárhelyen.</p>' +
      '  </div>' +
      '</div>';

    var input = wrap.querySelector('input[type=file]');
    var prev = wrap.querySelector('.imgfld > img');

    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      wrap.querySelector('.hint').textContent = 'Feldolgozás…';
      processImage(f, img).then(function (out) {
        rec.files = out.files;
        rec.newSrc = out.src;
        rec.newSrcset = out.srcset;
        prev.src = out.preview;
        wrap.classList.add('changed');
        wrap.querySelector('.hint').textContent =
          'Új kép előkészítve (' + out.files.length + ' változat, ' + Math.round(out.bytes / 1024) + ' kB). Mentéskor kerül fel.';
        setDirty(true);
      }).catch(function (e) {
        wrap.querySelector('.hint').textContent = 'Hiba a kép feldolgozásakor: ' + e.message;
      });
    });

    images.push(rec);
    return wrap;
  }

  /* Kliens oldali átméretezés + WebP/JPEG előállítás */
  function processImage(file, targetImg) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var im = new Image();
      im.onload = function () {
        URL.revokeObjectURL(url);
        try {
          // az eredeti kép arányát tartjuk meg (a layout ne csússzon el)
          var ratio = (targetImg.getAttribute('width') && targetImg.getAttribute('height'))
            ? targetImg.getAttribute('width') / targetImg.getAttribute('height')
            : im.width / im.height;

          var base = 'feltoltes-' + Date.now().toString(36);
          var widths = [500, 900, 1400].filter(function (w, i) { return i === 0 || w <= im.width * 1.1; });
          if (!widths.length) widths = [Math.min(im.width, 900)];

          var files = [], srcset = [], bytes = 0, preview = '';

          function draw(w) {
            var h = Math.round(w / ratio);
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            var ctx = c.getContext('2d');
            // "cover" vágás
            var sr = im.width / im.height, sw, sh, sx, sy;
            if (sr > ratio) { sh = im.height; sw = sh * ratio; sx = (im.width - sw) / 2; sy = 0; }
            else { sw = im.width; sh = sw / ratio; sx = 0; sy = (im.height - sh) / 2; }
            ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
            return c;
          }

          widths.forEach(function (w) {
            var c = draw(w);
            var d = c.toDataURL('image/webp', 0.82);
            var b64 = d.split(',')[1];
            files.push({ path: 'img/' + base + '-' + w + '.webp', content: b64, encoding: 'base64' });
            srcset.push('/img/' + base + '-' + w + '.webp ' + w + 'w');
            bytes += Math.round(b64.length * 0.75);
          });

          // JPG fallback a legnagyobb méretben
          var big = draw(widths[widths.length - 1]);
          var jd = big.toDataURL('image/jpeg', 0.84);
          files.push({ path: 'img/' + base + '.jpg', content: jd.split(',')[1], encoding: 'base64' });
          bytes += Math.round(jd.split(',')[1].length * 0.75);
          preview = jd;

          resolve({
            files: files, bytes: bytes, preview: preview,
            src: '/img/' + base + '.jpg',
            srcset: srcset.join(', ')
          });
        } catch (e) { reject(e); }
      };
      im.onerror = function () { URL.revokeObjectURL(url); reject(new Error('nem olvasható képfájl')); };
      im.src = url;
    });
  }

  /* ----------------------------------------------------------- mentés --- */
  function collect() {
    fields.forEach(function (f) {
      var v = f.ta.value.trim();
      if (v !== f.orig.replace(/\s*\n\s*/g, ' ').trim()) f.el.innerHTML = v;
      if (f.hrefInput) {
        var hv = f.hrefInput.value.trim();
        if (hv && hv !== f.href) f.linkEl.setAttribute('href', hv);
      }
    });

    var files = [];
    images.forEach(function (r) {
      if (!r.files) return;
      files = files.concat(r.files);
      r.img.setAttribute('src', r.newSrc);
      r.img.removeAttribute('srcset');
      if (r.picture) {
        var s = r.picture.querySelector('source[type="image/webp"]');
        if (s) s.setAttribute('srcset', r.newSrcset);
      }
    });

    // biztonsági háló: ami nem a mi forrásunkból való, ne kerüljön be a repóba
    doc.querySelectorAll('script[src*="/.netlify/"], script[src*="netlify.app"]')
       .forEach(function (s) { s.remove(); });

    var html = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
    files.push({ path: 'index.html', content: html, encoding: 'utf-8' });
    return files;
  }

  function save() {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Mentés…';
    notice('Mentés folyamatban…', 'info');

    var files = collect();
    fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        password: pw,
        message: 'Tartalom frissítése (' + new Date().toLocaleString('hu-HU') + ')',
        files: files
      })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        saveBtn.textContent = 'Mentés és közzététel';
        if (!res.ok) throw new Error(res.j.error || 'ismeretlen hiba');
        notice('<strong>Mentve!</strong> Commit: <code>' + res.j.commit + '</code>. '
          + 'A Netlify 1–2 percen belül élesíti a változást. '
          + 'Utána frissítsd az oldalt, hogy lásd.', 'ok');
        setDirty(false);
        document.querySelectorAll('.fld.changed').forEach(function (e) { e.classList.remove('changed'); });
        // friss állapot beolvasása kis késleltetéssel nem kell — a DOM már naprakész
        fields.forEach(function (f) {
          f.orig = f.el.innerHTML;
          if (f.linkEl) f.href = f.linkEl.getAttribute('href');
        });
        images.forEach(function (r) { r.files = null; });
      })
      .catch(function (e) {
        saveBtn.disabled = false;
        notice('<strong>Nem sikerült menteni.</strong> ' + e.message
          + '<br><br>Ellenőrizd, hogy a Netlify-on be van-e állítva az <code>ADMIN_PASSWORD</code>, '
          + '<code>GITHUB_TOKEN</code> és <code>GITHUB_REPO</code> környezeti változó.', 'err');
      });
  }

  /* ------------------------------------------------------------ start --- */
  $('#gateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var val = $('#pw').value;
    if (!val) return;
    pw = val;
    try { sessionStorage.setItem('zd_pw', pw); } catch (_) {}
    var btn = $('#gateForm button');
    var err = $('#gateErr');
    err.hidden = true;
    btn.disabled = true; btn.textContent = 'Belépés…';

    load().then(function () {
      btn.disabled = false; btn.textContent = 'Belépés';
      gate.hidden = true; app.hidden = false;
      notice('A szövegeket közvetlenül itt szerkesztheted. A <strong>Mentés és közzététel</strong> gomb '
        + 'elmenti a változásokat, és a weboldal 1–2 percen belül frissül.', 'info');
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = 'Belépés';
      pw = '';
      try { sessionStorage.removeItem('zd_pw'); } catch (_) {}
      err.textContent = (e.status === 401)
        ? 'Hibás jelszó.'
        : 'Nem sikerült betölteni: ' + e.message;
      err.hidden = false;
    });
  });

  saveBtn.addEventListener('click', save);
  $('#reload').addEventListener('click', function () {
    if (dirty && !confirm('Biztosan elveted a nem mentett módosításokat?')) return;
    load();
    noticeEl.hidden = true;
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // munkamenet visszaállítása
  try {
    var saved = sessionStorage.getItem('zd_pw');
    if (saved) { $('#pw').value = saved; }
  } catch (_) {}

})();
