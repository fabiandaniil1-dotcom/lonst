/* Eventu — UI layer.
   Plain ES5-ish browser script so the project also runs from file:// without a server. */
(function () {
  'use strict';

  var CFG = window.EVENTU_CONFIG;
  var DATA = window.EVENTU_DATA;
  var I18N = window.EVENTU_I18N;
  var S = window.EventuStore;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------ i18n */
  function t(key, vars) {
    var dict = I18N[S.lang] || I18N.ua;
    var str = dict[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { str = str.replace('{' + k + '}', vars[k]); });
    return str;
  }
  function loc(obj) { return obj[S.lang] || obj.ua; }

  function applyI18n() {
    document.documentElement.lang = S.lang === 'en' ? 'en' : 'uk';
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === S.lang)); });
  }

  /* ----------------------------------------------------------------- icons */
  var PATHS = {
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>',
    pin: '<path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    ticket: '<path d="M3 9.5V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v3a2.5 2.5 0 0 0 0 5v3a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-3a2.5 2.5 0 0 0 0-5z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M4 12.5l5 5 11-11"/>',
    login: '<path d="M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5M10 8l-4 4 4 4M6 12h10"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (PATHS[name] || '') + '</svg>';
  }

  /* --------------------------------------------------------------- posters */
  /* Each event gets a generated riso-style poster, so the project ships with
     no external image dependencies. */
  function poster(ev) {
    var ink = ev.ink, pap = ev.paper;
    var seed = ev.id.charCodeAt(ev.id.length - 1);
    var shapes = '';
    if (ev.cat === 'music' || ev.cat === 'theatre') {
      shapes =
        '<circle cx="' + (120 + seed % 40) + '" cy="110" r="78" fill="' + ink + '" opacity=".92"/>' +
        '<circle cx="250" cy="150" r="52" fill="' + ink + '" opacity=".55"/>' +
        '<path d="M0 190 Q80 140 160 190 T320 190 V225 H0Z" fill="' + ink + '" opacity=".8"/>';
    } else if (ev.cat === 'sport') {
      shapes =
        '<path d="M-10 210 L120 40 L170 210Z" fill="' + ink + '" opacity=".9"/>' +
        '<path d="M140 210 L240 70 L330 210Z" fill="' + ink + '" opacity=".55"/>' +
        '<circle cx="262" cy="52" r="26" fill="' + ink + '"/>';
    } else if (ev.cat === 'career' || ev.cat === 'workshop') {
      shapes =
        '<rect x="24" y="52" width="86" height="130" fill="' + ink + '" opacity=".9"/>' +
        '<rect x="124" y="92" width="86" height="90" fill="' + ink + '" opacity=".6"/>' +
        '<rect x="224" y="24" width="72" height="158" fill="' + ink + '" opacity=".78"/>';
    } else {
      shapes =
        '<rect x="0" y="40" width="320" height="16" fill="' + ink + '" opacity=".85"/>' +
        '<rect x="0" y="76" width="240" height="16" fill="' + ink + '" opacity=".65"/>' +
        '<rect x="0" y="112" width="290" height="16" fill="' + ink + '" opacity=".85"/>' +
        '<rect x="0" y="148" width="170" height="16" fill="' + ink + '" opacity=".5"/>' +
        '<circle cx="268" cy="156" r="44" fill="' + ink + '" opacity=".9"/>';
    }
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="640" height="360">' +
      '<rect width="320" height="180" fill="' + pap + '"/>' + shapes + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ----------------------------------------------------------------- dates */
  function fmtDate(iso, opts) {
    var d = new Date(iso);
    var l = S.lang === 'en' ? 'en-GB' : 'uk-UA';
    return d.toLocaleDateString(l, opts || { day: 'numeric', month: 'long' });
  }
  function fmtTime(iso) {
    var d = new Date(iso);
    return d.toLocaleTimeString(S.lang === 'en' ? 'en-GB' : 'uk-UA', { hour: '2-digit', minute: '2-digit' });
  }
  function price(ev) {
    return ev.price === 0 ? t('events.free') : ev.price + ' ₴';
  }
  function venueOf(ev) {
    return DATA.venues.filter(function (v) { return v.id === ev.venue; })[0];
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ----------------------------------------------------------------- toast */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3200);
  }

  /* ---------------------------------------------------------------- modals */
  var lastFocus = null;
  function openModal(id) {
    lastFocus = document.activeElement;
    var m = $('#' + id);
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    var f = m.querySelector('input, button, select, textarea');
    if (f) f.focus();
  }
  function closeModal(m) {
    (m ? [m] : $$('.modal')).forEach(function (x) { x.hidden = true; });
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.modal__veil') || e.target.closest('[data-close]')) {
      closeModal(e.target.closest('.modal'));
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ----------------------------------------------------------------- theme */
  function initTheme() {
    var saved = S.theme;
    var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (sysDark ? 'dark' : 'light'), false);
  }
  function setTheme(mode, persist) {
    document.documentElement.setAttribute('data-theme', mode);
    $('#theme-toggle').innerHTML = icon(mode === 'dark' ? 'sun' : 'moon');
    $('#theme-toggle').setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (persist !== false) S.setTheme(mode);
  }

  /* ------------------------------------------------------------------ auth */
  function renderAuthBar() {
    var box = $('#auth-slot');
    if (S.user) {
      box.innerHTML = '<span>' + t('top.hi') + ' ' + esc(S.user.name.split(' ')[0]) + '</span>' +
        (S.isAdmin() ? ' <a href="admin.html">' + t('top.admin') + '</a>' : '') +
        ' <button id="btn-logout">' + t('top.logout') + '</button>';
      $('#btn-logout').addEventListener('click', function () {
        S.logout(); renderAuthBar(); renderEvents(); toast(t('auth.bye'));
      });
    } else {
      box.innerHTML = '<button id="btn-login">' + t('top.login') + '</button>';
      $('#btn-login').addEventListener('click', function () { openAuth('login'); });
    }
  }
  function openAuth(tab) {
    switchAuthTab(tab || 'login');
    $('#auth-error').hidden = true;
    openModal('modal-auth');
  }
  function switchAuthTab(tab) {
    $$('#auth-tabs .chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.authTab === tab));
    });
    $('#form-login').hidden = tab !== 'login';
    $('#form-register').hidden = tab !== 'register';
  }
  function authError(key) {
    var el = $('#auth-error');
    el.textContent = t(key);
    el.hidden = false;
  }

  /* ---------------------------------------------------------- google sign-in */
  function decodeJwt(token) {
    try {
      var part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(atob(part).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  function onGoogleCredential(response) {
    var profile = decodeJwt(response.credential);
    if (!profile) return authError('auth.badCreds');
    var r = S.loginWithGoogle({ email: profile.email, name: profile.name });
    if (r.error) return authError(r.error);
    closeModal(); renderAuthBar(); renderEvents();
    toast(t('auth.welcome', { name: r.user.name.split(' ')[0] }));
  }

  function initGoogle() {
    var slot = $('#google-slot');
    var id = (CFG.google && CFG.google.clientId) || '';
    if (!id) {
      slot.innerHTML = '<p class="empty" style="font-size:.85rem;padding:.9rem">' + t('auth.googleOff') + '</p>';
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = function () {
      if (!window.google || !google.accounts) return;
      google.accounts.id.initialize({ client_id: id, callback: onGoogleCredential });
      google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
    };
    script.onerror = function () {
      slot.innerHTML = '<p class="empty" style="font-size:.85rem;padding:.9rem">' + t('auth.googleOff') + '</p>';
    };
    document.head.appendChild(script);
  }

  /* ---------------------------------------------------------------- events */
  var filter = { cat: 'all', q: '' };

  function renderFilters() {
    $('#filters').innerHTML = DATA.categories.map(function (c) {
      return '<button class="chip" data-cat="' + c.id + '" aria-pressed="' +
        (filter.cat === c.id) + '">' + esc(loc(c)) + '</button>';
    }).join('');
  }

  function matches(ev) {
    if (filter.cat !== 'all' && ev.cat !== filter.cat) return false;
    if (!filter.q) return true;
    var q = filter.q.toLowerCase();
    var v = venueOf(ev);
    return (loc(ev).title + ' ' + loc(ev).host + ' ' + loc(v)).toLowerCase().indexOf(q) > -1;
  }

  function ticketCard(ev) {
    var left = S.seatsLeft(ev);
    var v = venueOf(ev);
    var pct = Math.round(((ev.seats - left) / ev.seats) * 100);
    var low = left <= ev.seats * 0.12;
    var cat = DATA.categories.filter(function (c) { return c.id === ev.cat; })[0];

    return '<article class="ticket' + (left === 0 ? ' ticket--soldout' : '') + '">' +
      '<div class="ticket__media">' +
        '<img src="' + poster(ev) + '" alt="">' +
        '<div class="ticket__badges">' +
          '<span class="tag tag--blue">' + esc(loc(cat)) + '</span>' +
          (ev.price === 0 ? '<span class="tag tag--mint">' + t('events.free') + '</span>' : '') +
          (left === 0 ? '<span class="tag tag--coral">' + t('events.soldout') + '</span>' : '') +
        '</div>' +
        '<div class="ticket__date">' + fmtDate(ev.date) + ' · ' + fmtTime(ev.date) + '</div>' +
      '</div>' +
      '<div class="ticket__body">' +
        '<h3>' + esc(loc(ev).title) + '</h3>' +
        '<div class="ticket__meta">' +
          '<span>' + icon('pin') + esc(loc(v)) + '</span>' +
          '<span>' + icon('user') + esc(loc(ev).host) + '</span>' +
          '<span>' + icon('clock') + t('events.duration') + ' ' + ev.duration + ' ' + t('events.min') + '</span>' +
        '</div>' +
        '<div class="bar"><i class="' + (low ? 'low' : '') + '" style="width:' + pct + '%"></i></div>' +
        '<span class="ticket__seats">' + t('events.left', { n: left }) + '</span>' +
        '<div class="ticket__perf">' +
          '<span class="ticket__price">' + price(ev) + '</span>' +
          '<span class="ticket__actions">' +
            '<button class="btn" data-details="' + ev.id + '">' + t('events.details') + '</button>' +
            '<button class="btn btn--solid" data-book="' + ev.id + '"' + (left === 0 ? ' disabled' : '') + '>' +
              (left === 0 ? t('events.soldout') : t('events.book')) + '</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderEvents() {
    var list = S.events().filter(matches);
    var box = $('#events-grid');
    box.innerHTML = list.length
      ? list.map(ticketCard).join('')
      : '<p class="empty">' + t('events.empty') + '</p>';
  }

  function eventById(id) {
    return S.events().filter(function (e) { return e.id === id; })[0];
  }

  /* --------------------------------------------------------- event details */
  function showDetails(id) {
    var ev = eventById(id), v = venueOf(ev), left = S.seatsLeft(ev);
    $('#details-body').innerHTML =
      '<div class="modal__hero"><img src="' + poster(ev) + '" alt=""></div>' +
      '<h2>' + esc(loc(ev).title) + '</h2>' +
      '<div class="ticket__meta" style="margin:.9rem 0 1rem">' +
        '<span>' + icon('calendar') + fmtDate(ev.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + fmtTime(ev.date) + '</span>' +
        '<span>' + icon('pin') + esc(loc(v)) + ' · ' + esc(S.lang === 'en' ? v.capEn : v.capUa) + '</span>' +
        '<span>' + icon('user') + t('events.host') + ': ' + esc(loc(ev).host) + '</span>' +
        '<span>' + icon('clock') + t('events.duration') + ' ' + ev.duration + ' ' + t('events.min') + '</span>' +
      '</div>' +
      '<p>' + esc(loc(ev).desc) + '</p>' +
      '<div class="ticket__perf" style="border-top:2px dashed var(--line);margin-top:1.3rem;padding-top:1.1rem">' +
        '<span><span class="ticket__price">' + price(ev) + '</span><br>' +
          '<span class="ticket__seats">' + t('events.left', { n: left }) + '</span></span>' +
        '<button class="btn btn--solid btn--lg" data-book="' + ev.id + '"' + (left === 0 ? ' disabled' : '') + '>' +
          (left === 0 ? t('events.soldout') : t('events.book')) + '</button>' +
      '</div>';
    openModal('modal-details');
  }

  /* --------------------------------------------------------------- booking */
  var bookingEvent = null;

  function openBooking(id) {
    if (!S.user) { toast(t('auth.needLogin')); openAuth('login'); return; }
    bookingEvent = eventById(id);
    var left = S.seatsLeft(bookingEvent);
    var allowed = Math.min(CFG.maxTicketsPerUser - S.bookedByMe(bookingEvent.id), left);
    if (allowed < 1) { toast(t('book.limit')); return; }

    $('#book-event').textContent = loc(bookingEvent).title;
    $('#book-when').textContent = fmtDate(bookingEvent.date, { weekday: 'short', day: 'numeric', month: 'long' }) +
      ', ' + fmtTime(bookingEvent.date) + ' · ' + loc(venueOf(bookingEvent));
    $('#book-name').value = S.user.name;
    $('#book-email').value = S.user.email;
    $('#book-qty').innerHTML = '';
    for (var i = 1; i <= allowed; i++) {
      $('#book-qty').innerHTML += '<option value="' + i + '">' + i + '</option>';
    }
    $('#book-gdpr').checked = false;
    $('#book-submit').disabled = true;
    $('#book-form').hidden = false;
    $('#book-done').hidden = true;
    updateTotal();
    closeModal($('#modal-details'));
    openModal('modal-book');
  }

  function updateTotal() {
    if (!bookingEvent) return;
    var qty = Number($('#book-qty').value || 1);
    var sum = qty * bookingEvent.price;
    $('#book-total').textContent = sum === 0 ? t('events.free') : sum + ' ₴ · ' + t('book.onsite');
  }

  /* ------------------------------------------------------------ my tickets */
  function renderMine() {
    var list = S.myBookings();
    $('#mine-body').innerHTML = list.length
      ? '<div class="mytickets">' + list.map(function (b) {
          var ev = eventById(b.eventId);
          return '<div class="mt"><div>' +
            '<strong>' + esc(loc(ev).title) + '</strong><br>' +
            '<span class="ticket__seats">' + fmtDate(ev.date) + ', ' + fmtTime(ev.date) +
              ' · ' + b.qty + ' ' + t('mine.qty') + '</span><br>' +
            '<span class="mt__code">' + b.code + '</span>' +
            '</div><button class="btn" data-cancel="' + b.id + '">' + t('mine.cancel') + '</button></div>';
        }).join('') + '</div>'
      : '<p class="empty">' + t('mine.empty') + '</p>';
  }

  /* ----------------------------------------------------------------- venues */
  function renderVenues() {
    var counts = {};
    S.events().forEach(function (e) { counts[e.venue] = (counts[e.venue] || 0) + 1; });

    $('#venue-list').innerHTML = DATA.venues.map(function (v, i) {
      return '<button class="venue" data-venue="' + v.id + '">' +
        '<span class="venue__idx">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span><span class="venue__name">' + esc(loc(v)) + '</span><br>' +
        '<span class="venue__note">' + esc(S.lang === 'en' ? v.capEn : v.capUa) + ' · ' +
        (counts[v.id] || 0) + ' ' + t('venues.events') + '</span></span></button>';
    }).join('');

    $('#campus-map').innerHTML =
      '<svg viewBox="0 0 100 80" role="img" aria-label="Campus map">' +
      '<rect width="100" height="80" fill="var(--paper)"/>' +
      '<path d="M0 46 H100 M44 0 V80" stroke="var(--line)" stroke-width="1.4" opacity=".35"/>' +
      '<path d="M10 14 H34 V30 H10Z M58 8 H86 V26 H58Z M8 58 H32 V74 H8Z M62 52 H90 V72 H62Z" ' +
      'fill="none" stroke="var(--line)" stroke-width="1" opacity=".35"/>' +
      DATA.venues.map(function (v, i) {
        return '<g class="map__pin" data-venue="' + v.id + '" tabindex="0" role="button">' +
          '<circle cx="' + v.x + '" cy="' + (v.y * 0.8) + '" r="11" fill="var(--coral)" stroke="var(--line)" stroke-width="1.5"/>' +
          '<text x="' + v.x + '" y="' + (v.y * 0.8 + 3.2) + '" text-anchor="middle" font-size="8" ' +
          'font-family="IBM Plex Mono, monospace" fill="#17102e">' + (i + 1) + '</text></g>';
      }).join('') + '</svg>';
  }

  function highlightVenue(id) {
    $$('#venue-list .venue').forEach(function (b) { b.classList.toggle('is-active', b.dataset.venue === id); });
    $$('#campus-map .map__pin').forEach(function (g) { g.classList.toggle('is-active', g.dataset.venue === id); });
  }

  /* ---------------------------------------------------------------- reviews */
  var newRating = 5;

  function renderReviews() {
    $('#reviews-list').innerHTML = S.allReviews().map(function (r) {
      return '<article class="review"><div class="review__head">' +
        '<span class="review__who">' + esc(r.name) + '</span>' +
        '<span class="review__rate">' + '★'.repeat(r.rating) + '<span style="opacity:.3">' + '★'.repeat(5 - r.rating) + '</span></span>' +
        '</div><p>' + esc(loc(r)) + '</p>' +
        '<div class="review__when">' + r.date + '</div></article>';
    }).join('');
  }
  function renderStars() {
    $('#stars').innerHTML = [1, 2, 3, 4, 5].map(function (n) {
      return '<button type="button" class="' + (n <= newRating ? 'on' : '') + '" data-star="' + n +
        '" aria-label="' + n + '">★</button>';
    }).join('');
  }

  /* --------------------------------------------------------------- counters */
  function counters() {
    var free = S.events().filter(function (e) { return e.price === 0; }).length;
    var vals = { events: 128, tickets: 24160 + S.bookings.length, students: 9540 + S.users.length, free: free };
    $$('#counters [data-count]').forEach(function (el) {
      var target = vals[el.dataset.count] || 0;
      var started = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || started) return;
          started = true;
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target; return; }
          var t0 = performance.now(), dur = 900;
          (function step(now) {
            var p = Math.min(1, (now - t0) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('uk-UA');
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: .4 });
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------- hero */
  function renderHeroStub() {
    var ev = S.events()[0];
    $('#stub-title').textContent = loc(ev).title;
    $('#stub-when').textContent = fmtDate(ev.date, { day: 'numeric', month: 'short' }) + ', ' + fmtTime(ev.date);
    $('#stub-where').textContent = loc(venueOf(ev));
    $('#stub-left').textContent = S.seatsLeft(ev);
    $('#stub-cta').dataset.book = ev.id;
  }

  /* ------------------------------------------------------------------ wire */
  function refreshAll() {
    applyI18n();
    renderAuthBar();
    renderFilters();
    renderEvents();
    renderVenues();
    renderReviews();
    renderStars();
    renderHeroStub();
    if (!(CFG.google && CFG.google.clientId)) initGoogle();
  }

  function init() {
    initTheme();
    initGoogle();
    refreshAll();
    counters();

    $('#theme-toggle').addEventListener('click', function () {
      setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { S.setLang(b.dataset.lang); refreshAll(); });
    });

    $('#burger').addEventListener('click', function () { $('#mobile-nav').classList.toggle('open'); });
    $$('#mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () { $('#mobile-nav').classList.remove('open'); });
    });

    $('#filters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      filter.cat = b.dataset.cat;
      renderFilters(); renderEvents();
    });

    $('#search').addEventListener('input', function (e) {
      filter.q = e.target.value.trim();
      renderEvents();
    });

    document.addEventListener('click', function (e) {
      var d = e.target.closest('[data-details]');
      if (d) { showDetails(d.dataset.details); return; }
      var b = e.target.closest('[data-book]');
      if (b && !b.disabled) { openBooking(b.dataset.book); return; }
      var m = e.target.closest('[data-mine]');
      if (m) { renderMine(); openModal('modal-mine'); return; }
      var c = e.target.closest('[data-cancel]');
      if (c) {
        S.cancel(c.dataset.cancel);
        renderMine(); renderEvents(); renderHeroStub();
        toast(t('mine.cancelled'));
        return;
      }
      var v = e.target.closest('[data-venue]');
      if (v) { highlightVenue(v.dataset.venue || v.getAttribute('data-venue')); return; }
      var st = e.target.closest('[data-star]');
      if (st) { newRating = Number(st.dataset.star); renderStars(); return; }
      var at = e.target.closest('[data-auth-tab]');
      if (at) { switchAuthTab(at.dataset.authTab); $('#auth-error').hidden = true; }
    });

    $('#campus-map').addEventListener('keydown', function (e) {
      var g = e.target.closest('[data-venue]');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); highlightVenue(g.dataset.venue); }
    });

    /* auth forms */
    $('#form-login').addEventListener('submit', function (e) {
      e.preventDefault();
      var r = S.login($('#login-email').value, $('#login-pass').value);
      if (r.error) return authError(r.error);
      closeModal(); renderAuthBar(); renderEvents();
      toast(t('auth.welcome', { name: r.user.name.split(' ')[0] }));
    });
    $('#form-register').addEventListener('submit', function (e) {
      e.preventDefault();
      var r = S.register($('#reg-name').value, $('#reg-email').value, $('#reg-pass').value);
      if (r.error) return authError(r.error);
      closeModal(); renderAuthBar();
      toast(t('auth.welcome', { name: r.user.name.split(' ')[0] }));
    });

    /* booking */
    $('#book-gdpr').addEventListener('change', function (e) { $('#book-submit').disabled = !e.target.checked; });
    $('#book-qty').addEventListener('change', updateTotal);
    $('#book-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var res = S.book(bookingEvent, {
        name: $('#book-name').value,
        email: $('#book-email').value,
        phone: $('#book-phone').value,
        note: $('#book-note').value,
        qty: Number($('#book-qty').value)
      });
      if (res.error) { toast(t(res.error)); return; }
      $('#book-code').textContent = res.booking.code;
      $('#book-form').hidden = true;
      $('#book-done').hidden = false;
      renderEvents(); renderHeroStub();
    });

    /* reviews */
    $('#form-review').addEventListener('submit', function (e) {
      e.preventDefault();
      var text = $('#review-text').value.trim();
      if (text.length < 5) { toast(t('reviews.needText')); return; }
      S.addReview($('#review-name').value.trim() || (S.user ? S.user.name : 'Anonymous'), newRating, text);
      $('#review-text').value = '';
      renderReviews();
      toast(t('reviews.thanks'));
    });

    /* cookies */
    if (S.cookies === null) $('#cookies').hidden = false;
    $('#cookies-accept').addEventListener('click', function () { S.setCookies('all'); $('#cookies').hidden = true; });
    $('#cookies-decline').addEventListener('click', function () { S.setCookies('essential'); $('#cookies').hidden = true; });

    /* static icons */
    $$('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.dataset.icon); });
    $('#year').textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
