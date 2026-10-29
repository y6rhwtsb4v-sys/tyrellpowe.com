(function () {
  var root = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // Theme toggle
  var tb = document.querySelector('.theme-btn');
  function label() { if (tb) tb.querySelector('span').textContent = root.dataset.theme === 'light' ? 'Light' : 'Dark'; }
  label();
  if (tb) tb.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store('theme', root.dataset.theme); label();
  });

  // Phone menu
  var mb = document.querySelector('.menu-btn');
  function setMenu(open) { root.classList.toggle('menu-open', open); if (mb) mb.setAttribute('aria-expanded', open); }
  if (mb) {
    mb.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.querySelector('.brand').addEventListener('click', function () { setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 720) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }
  // Work list hover preview
  var rows = document.querySelector('.rows');
  var pv = document.querySelector('.preview');
  if (rows && pv && window.matchMedia('(hover:hover) and (min-width:901px)').matches) {
    var p = { x: 0, y: 0, tx: 0, ty: 0 }, on = false, img = pv.querySelector('img'), b = pv.querySelector('b'), s = pv.querySelector('span');
    rows.querySelectorAll('.row').forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        rows.classList.add('hovering');
        rows.querySelectorAll('.row.on').forEach(function (x) { x.classList.remove('on'); });
        r.classList.add('on');
        pv.style.background = r.dataset.tint; img.src = r.dataset.preview; b.textContent = r.dataset.name; s.textContent = r.dataset.tag;
        pv.classList.add('show'); on = true;
      });
    });
    rows.addEventListener('mousemove', function (e) {
      if (!p.tx && !p.ty) { p.x = e.clientX; p.y = e.clientY; }
      p.tx = e.clientX; p.ty = e.clientY;
    });
    rows.addEventListener('mouseleave', function () {
      rows.classList.remove('hovering'); pv.classList.remove('show'); on = false;
      rows.querySelectorAll('.row.on').forEach(function (x) { x.classList.remove('on'); });
    });
    (function tick() {
      p.x += (p.tx - p.x) * 0.18; p.y += (p.ty - p.y) * 0.18;
      if (on) pv.style.transform = 'translate(' + (p.x + 24) + 'px,' + (p.y - 120) + 'px) rotate(' + Math.max(-6, Math.min(6, (p.tx - p.x) * 0.05)) + 'deg)';
      requestAnimationFrame(tick);
    })();
  }

  // Astroman sketch toggles
  document.querySelectorAll('.sketch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var fig = btn.closest('.page'), z = fig.querySelector('.zoom'), im = z.querySelector('img');
      var onNow = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', onNow); btn.textContent = onNow ? 'Show finished' : 'Show sketch';
      var src = onNow ? z.dataset.orig : z.dataset.final;
      im.src = src; z.dataset.src = src;
      var n = fig.dataset.n;
      im.alt = 'Astroman page ' + n + ', ' + (onNow ? 'hand-drawn original' : 'finished');
      z.dataset.cap = 'Page ' + n + ', ' + (onNow ? 'hand-drawn original' : 'finished');
    });
  });

  // Lightbox
  var lb = document.querySelector('.lb');
  var zooms = Array.prototype.slice.call(document.querySelectorAll('.zoom'));
  if (lb && zooms.length) {
    var li = lb.querySelector('.lb-mid img'), lc = lb.querySelector('.lb-cap'), ln = lb.querySelector('.lb-count'), k = 0, last = null;
    function show(i) {
      k = (i + zooms.length) % zooms.length; var z = zooms[k];
      li.src = z.dataset.src; li.alt = z.dataset.cap || ''; lc.textContent = z.dataset.cap || '';
      ln.textContent = String(k + 1).padStart(2, '0') + ' / ' + String(zooms.length).padStart(2, '0');
    }
    function open(i) { last = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
    zooms.forEach(function (z, i) { z.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelectorAll('.lb-prev').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); show(k - 1); }); });
    lb.querySelectorAll('.lb-next').forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); show(k + 1); }); });
    var x0 = null, swiped = false;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; swiped = false; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { swiped = true; show(k + (dx < 0 ? 1 : -1)); }
    });
    li.addEventListener('click', function (e) { e.stopPropagation(); });
    lb.addEventListener('click', function () { if (swiped) { swiped = false; return; } close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(k + 1);
      if (e.key === 'ArrowLeft') show(k - 1);
    });
  }

  // Contact form: opens the visitor's email app with the message filled in
  var c = document.querySelector('.contact'), f = c && c.querySelector('form');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = f.elements.name.value, em = f.elements.email.value, m = f.elements.message.value;
    var subject = 'Portfolio inquiry from ' + n;
    var body = m + '\n\n' + n + '\n' + em;
    window.location.href = 'mailto:' + f.dataset.to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    c.classList.add('done');
  });
})();
