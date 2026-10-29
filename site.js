/* Asha's Ark page behavior. Plain JS, no dependencies.
   The scroll engine (scrollcraft.js) is untouched; everything here is the page's own. */
(function () {
  'use strict';
  var C = window.ASHA || {};
  var root = document.documentElement;
  var isStatic = root.classList.contains('is-static');
  var isReduce = root.classList.contains('is-reduce');
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function isSet(v) { return !!v && v !== 'REPLACE_ME'; }

  /* ---------- static layouts: the peak is an ordinary section ---------- */
  var give = $('#give');
  if (isStatic && give) {
    give.setAttribute('data-sc-act', 'flow');
    give.removeAttribute('data-sc-span');
    var st = $('[data-sc-stage]', give);
    if (st) st.removeAttribute('data-sc-stage');
  }

  /* ---------- tax line ---------- */
  var tax = isSet(C.TAX_STATUS_LINE) ? C.TAX_STATUS_LINE : '';
  $$('[data-tax-line]').forEach(function (el) { el.textContent = tax; });
  if (tax) { var ta = $('[data-tax-answer]'); if (ta) ta.textContent = tax; }

  /* ---------- motion switch ---------- */
  var stored = root.getAttribute('data-motion') === 'reduce';
  $$('[data-motion-toggle]').forEach(function (b) {
    b.setAttribute('aria-pressed', stored ? 'true' : 'false');
    if (isReduce && !stored) { b.title = 'Your device already asks for reduced motion.'; }
    b.addEventListener('click', function () {
      try {
        if (stored) localStorage.removeItem('ashaMotion'); else localStorage.setItem('ashaMotion', 'reduce');
      } catch (e) {}
      location.reload();
    });
  });

  /* ---------- donation buttons ---------- */
  var tiers = $$('.tier .btn[data-link]');
  var note = $('#give-note');
  var live = $('#freq-live');
  function applyTiers(announce) {
    var checked = $('input[name="freq"]:checked');
    var monthly = checked && checked.value === 'monthly';
    var any = false;
    tiers.forEach(function (a) {
      var key = monthly ? a.getAttribute('data-monthly') : a.getAttribute('data-link');
      var url = C.PAYMENT_LINKS && C.PAYMENT_LINKS[key];
      var label = monthly ? a.getAttribute('data-label-monthly') : a.getAttribute('data-label');
      a.textContent = '';
      if (isSet(url)) {
        a.setAttribute('href', url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener');
        a.removeAttribute('aria-disabled'); a.removeAttribute('role'); a.removeAttribute('aria-label');
        a.appendChild(document.createTextNode(label));
        var s = document.createElement('span'); s.className = 'sr-only'; s.textContent = ' (opens Stripe in a new tab)'; a.appendChild(s);
        any = true;
      } else {
        a.removeAttribute('href'); a.removeAttribute('target'); a.removeAttribute('rel');
        a.setAttribute('role', 'link'); a.setAttribute('aria-disabled', 'true'); a.setAttribute('tabindex', '0');
        a.setAttribute('aria-label', label + ', not available yet');
        a.appendChild(document.createTextNode('Donations open soon'));
      }
    });
    if (note) note.hidden = any;
    if (announce && live) live.textContent = monthly ? 'Showing monthly gifts.' : 'Showing one-time gifts.';
  }
  $$('input[name="freq"]').forEach(function (r) { r.addEventListener('change', function () { applyTiers(true); }); });
  tiers.forEach(function (a) {
    a.addEventListener('click', function (e) { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
    a.addEventListener('keydown', function (e) { if (a.getAttribute('aria-disabled') === 'true' && (e.key === 'Enter' || e.key === ' ')) e.preventDefault(); });
  });
  applyTiers(false);

  /* ---------- copy email ---------- */
  var copyBtn = $('#copy-mail'), copyLive = $('#copy-live'), mail = $('#mail-link');
  if (copyBtn && mail) {
    copyBtn.addEventListener('click', function () {
      var text = (C.CONTACT_EMAIL || mail.textContent).trim();
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(mail);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        copyLive.textContent = 'Address selected. Press Control or Command and C to copy.';
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { copyLive.textContent = 'Email address copied.'; }, fallback);
      } else fallback();
    });
  }

  /* ---------- contact form: validate, confirm, send ---------- */
  var form = $('#contact-form'), confirmBox = $('#confirm'), status = $('#form-status');
  var F = { name: $('#f-name'), email: $('#f-email'), msg: $('#f-msg'), terms: $('#f-terms') };
  var MSG = {
    name: 'Please enter your name.',
    email: 'Please enter an email address like name@example.com.',
    msg: 'Please write a message.',
    terms: 'Please tick the box to confirm you have read the Terms and Privacy Policy.'
  };
  function err(id, text) {
    var p = $('#f-' + id + '-err'), el = F[id === 'msg' ? 'msg' : id];
    if (text) { p.textContent = text; p.hidden = false; el.setAttribute('aria-invalid', 'true'); }
    else { p.textContent = ''; p.hidden = true; el.removeAttribute('aria-invalid'); }
  }
  function validate() {
    var first = null;
    function bad(k) { err(k, MSG[k]); if (!first) first = F[k]; }
    if (!F.name.value.trim()) bad('name'); else err('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(F.email.value.trim())) bad('email'); else err('email');
    if (!F.msg.value.trim()) bad('msg'); else err('msg');
    if (!F.terms.checked) bad('terms'); else err('terms');
    return first;
  }
  function setStatus(text, isError) { status.textContent = text; status.classList.toggle('is-error', !!isError); }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');
      var first = validate();
      if (first) { first.focus(); return; }
      $('#c-name').textContent = F.name.value.trim();
      $('#c-email').textContent = F.email.value.trim();
      $('#c-msg').textContent = F.msg.value.trim();
      form.hidden = true; confirmBox.hidden = false; confirmBox.focus();
    });
    $('#c-edit').addEventListener('click', function () { confirmBox.hidden = true; form.hidden = false; F.name.focus(); });
    $('#c-send').addEventListener('click', function () {
      var email = C.CONTACT_EMAIL || 'info@ashasark.org';
      if (!isSet(C.FORM_ENDPOINT)) {
        confirmBox.hidden = true; form.hidden = false;
        setStatus('This form is not connected yet, so nothing was sent. Please email ' + email + ' directly.', true);
        status.focus(); return;
      }
      var btn = $('#c-send'); btn.disabled = true;
      var hp = form.querySelector('[name="_gotcha"]');
      fetch(C.FORM_ENDPOINT, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: F.name.value.trim(), email: F.email.value.trim(), message: F.msg.value.trim(), _gotcha: hp ? hp.value : '', _captcha: 'false' })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        confirmBox.hidden = true; form.reset(); form.hidden = false;
        setStatus('Thank you. We will reply to the address you gave us.'); status.focus();
      }).catch(function () {
        confirmBox.hidden = true; form.hidden = false;
        setStatus('Your message was not sent. Please try again, or email ' + email + ' directly.', true); status.focus();
      }).then(function () { btn.disabled = false; });
    });
    ['name', 'email', 'msg'].forEach(function (k) { F[k].addEventListener('input', function () { if (F[k].hasAttribute('aria-invalid')) err(k); }); });
    F.terms.addEventListener('change', function () { err('terms'); });
  }

  /* ---------- hero chalk drawing: plays once, holds, can be paused or replayed ---------- */
  (function () {
    var v = $('#hero-video'), btn = $('#hero-pause');
    if (!v || !btn) return;
    if (isReduce || !v.canPlayType || !v.canPlayType('video/mp4')) { root.classList.add('no-video'); v.removeAttribute('src'); return; }
    var label = btn.querySelector('span');
    function setLabel(t, pressed) { label.textContent = t; btn.setAttribute('aria-pressed', pressed ? 'true' : 'false'); btn.setAttribute('aria-label', t + ' the chalk drawing'); }
    btn.hidden = false; setLabel('Pause', false);
    var started = false;
    function start() { if (started) return; started = true; var p = v.play(); if (p && p.catch) p.catch(function () { root.classList.add('no-video'); btn.hidden = true; }); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } }); }, { threshold: 0.3 });
      io.observe(v);
    } else start();
    v.addEventListener('ended', function () { setLabel('Replay', false); });
    v.addEventListener('error', function () { root.classList.add('no-video'); btn.hidden = true; });
    btn.addEventListener('click', function () {
      if (v.ended) { v.currentTime = 0; v.play(); setLabel('Pause', false); }
      else if (v.paused) { v.play(); setLabel('Pause', false); }
      else { v.pause(); setLabel('Play', true); }
    });
  })();

  /* ---------- running head: current chapter ---------- */
  var folioCh = $('#folio-chapter');
  var chapters = $$('[data-chapter]');
  if (folioCh && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { folioCh.innerHTML = en.target.getAttribute('data-chapter'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    chapters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- engine ---------- */
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);

  /* ---------- the ark assembles (motion mode only) ---------- */
  if (!isStatic) {
    var mark = $('.mark'), base = $('.mark-base');
    var A = { c1: $('#chapter-1'), c2: $('#chapter-2'), hope: $('#hope'), g: [$('#gift-1'), $('#gift-2'), $('#gift-3')], peak: give, a5: $('#peak-anchor'), a7: $('#logo-anchor') };
    var iris = document.getElementById('ark-iris-c');
    var arrive = $$('[data-arrive]');
    var lastIris = -1, queued = false;
    var vh = innerHeight;
    function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function ease(t) { return t * t * (3 - 2 * t); }
    function rect(el) { return el.getBoundingClientRect(); }
    function setVars(v) { for (var k in v) mark.style.setProperty('--' + k, v[k].toFixed(3)); }

    function frame() {
      queued = false;
      vh = innerHeight;
      var b = rect(base);
      var s1 = rect(A.c1), s2 = rect(A.c2), hp = rect(A.hope);
      var draw = clamp((vh * 0.9 - s1.top) / (s1.height * 0.7));
      var fill = clamp((vh * 0.85 - s2.top) / (s2.height * 0.55));
      var cabin = ease(clamp((vh * 0.8 - hp.top) / (vh * 0.22)));
      var bands = A.g.map(function (g) { return ease(clamp((vh * 0.78 - rect(g).top) / (vh * 0.3))); });

      var pr = rect(A.peak);
      var pk = clamp(-pr.top / Math.max(1, pr.height - vh));
      var sun = ease(clamp((pk - 0.08) / 0.3));
      var rays = ease(clamp((pk - 0.22) / 0.25));
      var mIn = ease(clamp(pk / 0.3));
      var mOut = 1 - clamp((vh - pr.bottom) / (vh * 0.6));
      var m5 = Math.min(mIn, mOut);

      /* The landing is driven by distance to the end of the page, not by where
         the footer logo sits, so it is complete exactly when the page is. */
      var a7 = rect(A.a7);
      var remaining = Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY);
      var m7 = ease(clamp(1 - remaining / (vh * 0.9)));
      var hands = ease(clamp(1.15 - remaining / (vh * 0.4)));

      var t5 = rect(A.a5);
      var x = b.left, y = b.top, w = b.width;
      x += (t5.left - b.left) * m5; y += (t5.top - b.top) * m5; w += (t5.width - b.width) * m5;
      x += (a7.left - x) * m7; y += (a7.top - y) * m7; w += (a7.width - w) * m7;
      mark.style.transform = 'translate3d(' + (x - b.left).toFixed(1) + 'px,' + (y - b.top).toFixed(1) + 'px,0) scale(' + (w / b.width).toFixed(4) + ')';

      setVars({ draw: draw, fill: fill, cabin: cabin, b1: bands[0], b2: bands[1], b3: bands[2], sun: sun, rays: rays, hands: hands });
      var r = Math.round(hands * 140);
      if (iris && r !== lastIris) { iris.setAttribute('r', r); lastIris = r; }

      var forced = give.classList.contains('has-focus');
      arrive.forEach(function (el) {
        var at = parseFloat(el.getAttribute('data-arrive'));
        var a = forced ? 1 : ease(clamp((pk - at) / 0.16));
        el.style.opacity = a.toFixed(3);
        el.style.transform = a >= 1 ? 'none' : 'translateY(' + ((1 - a) * 18).toFixed(1) + 'px)';
      });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    give.addEventListener('focusin', function () { give.classList.add('has-focus'); queue(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
    addEventListener('load', queue);
    queue();
  }

  /* ---------- crossing a layout breakpoint changes the mode, so reload once ---------- */
  var initial = isStatic, rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var now = isReduce || innerWidth <= 860 || innerHeight < 680 || (innerWidth < 1200 && innerHeight < 780);
      if (now !== initial) location.reload();
    }, 300);
  });
})();
