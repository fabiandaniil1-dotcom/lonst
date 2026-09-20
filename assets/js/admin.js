/* Eventu — admin panel.
   Reads and writes the same localStorage catalogue the public site uses,
   so every change here is visible on index.html straight away. */
(function () {
  'use strict';

  var CFG = window.EVENTU_CONFIG;
  var DATA = window.EVENTU_DATA;
  var S = window.EventuStore;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };

  var filters = { ev: '', bk: '' };
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3000);
  }

  /* -------------------------------------------------------------- theme */
  (function theme() {
    var saved = S.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
    document.addEventListener('DOMContentLoaded', function () {
      $('#theme-toggle').addEventListener('click', function () {
        saved = saved === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        S.setTheme(saved);
      });
    });
  })();

  /* --------------------------------------------------------------- gate */
  function ensureBuiltInAdmin() {
    var a = CFG.admin;
    if (!a || !a.email) return;
    var exists = S.users.some(function (u) { return u.email === a.email; });
    if (!exists) {
      S.register('Адміністратор офісу', a.email, a.pass);
      S.logout();
    }
  }

  function showPanel() {
    $('#gate').hidden = true;
    $('#panel').hidden = false;
    $('#admin-logout').classList.remove('hide');
    $('#admin-who').textContent = S.user.email;
    renderAll();
  }

  function gate() {
    if (S.user && S.isAdmin()) { showPanel(); return; }
    $('#gate').hidden = false;
    $('#panel').hidden = true;
  }

  /* --------------------------------------------------------------- KPI */
  function money(n) { return n.toLocaleString('uk-UA') + ' ₴'; }

  function renderKpi() {
    var events = S.events();
    var tickets = S.bookings.reduce(function (s, b) { return s + b.qty; }, 0);
    var revenue = S.bookings.reduce(function (s, b) { return s + b.total; }, 0);
    var seats = events.reduce(function (s, e) { return s + e.seats; }, 0);
    var busy = events.reduce(function (s, e) { return s + (e.seats - S.seatsLeft(e)); }, 0);
    var fill = seats ? Math.round((busy / seats) * 100) : 0;

    var cards = [
      [events.length, 'подій в афіші'],
      [tickets, 'заброньованих квитків'],
      [money(revenue), 'очікувана каса'],
      [fill + '%', 'середня заповненість'],
      [S.users.length, 'акаунтів'],
      [S.reviews.length + DATA.reviews.length, 'відгуків']
    ];
    $('#kpi').innerHTML = cards.map(function (c) {
      return '<div class="counter"><div class="counter__num">' + esc(c[0]) +
        '</div><div class="counter__label">' + c[1] + '</div></div>';
    }).join('');
  }

  /* ------------------------------------------------------------ events */
  function catName(id) {
    var c = DATA.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.ua : id;
  }
  function venueName(id) {
    var v = DATA.venues.filter(function (x) { return x.id === id; })[0];
    return v ? v.ua : id;
  }
  function dt(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }) + ' ' +
      d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  }

  function renderEvents() {
    var list = S.events().filter(function (e) {
      if (!filters.ev) return true;
      var q = filters.ev.toLowerCase();
      return (e.ua.title + ' ' + e.en.title + ' ' + venueName(e.venue)).toLowerCase().indexOf(q) > -1;
    });

    $('#ev-table').innerHTML =
      '<thead><tr><th>Подія</th><th>Дата</th><th>Локація</th><th>Ціна</th>' +
      '<th>Місця</th><th>Броні</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (e) {
        var left = S.seatsLeft(e);
        var busy = e.seats - left;
        var pct = Math.round((busy / e.seats) * 100);
        return '<tr><td><strong>' + esc(e.ua.title) + '</strong><br>' +
          '<span class="ticket__seats">' + esc(catName(e.cat)) + ' · ' + esc(e.id) + '</span></td>' +
          '<td>' + dt(e.date) + '</td>' +
          '<td>' + esc(venueName(e.venue)) + '</td>' +
          '<td>' + (e.price ? e.price + ' ₴' : 'вільний вхід') + '</td>' +
          '<td>' + busy + ' / ' + e.seats + '<div class="bar" style="margin-top:.35rem">' +
            '<i class="' + (left <= e.seats * 0.12 ? 'low' : '') + '" style="width:' + pct + '%"></i></div></td>' +
          '<td>' + S.bookingsFor(e.id).length + '</td>' +
          '<td class="nowrap"><button class="btn" data-edit="' + e.id + '">Редагувати</button> ' +
          '<button class="btn btn--coral" data-del="' + e.id + '">Видалити</button></td></tr>';
      }).join('') : '<tr><td colspan="7"><p class="empty">Нічого не знайшлося.</p></td></tr>') +
      '</tbody>';
  }

  /* ---------------------------------------------------------- bookings */
  function renderBookings() {
    var list = S.bookings.slice().sort(function (a, b) { return b.created.localeCompare(a.created); })
      .filter(function (b) {
        if (!filters.bk) return true;
        var q = filters.bk.toLowerCase();
        return (b.code + ' ' + b.name + ' ' + b.email).toLowerCase().indexOf(q) > -1;
      });

    $('#bk-table').innerHTML =
      '<thead><tr><th>Код</th><th>Подія</th><th>Відвідувач</th><th>Кількість</th>' +
      '<th>Сума</th><th>Створено</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (b) {
        var ev = S.events().filter(function (e) { return e.id === b.eventId; })[0];
        return '<tr><td class="mt__code">' + esc(b.code) + '</td>' +
          '<td>' + esc(ev ? ev.ua.title : b.eventId) + '</td>' +
          '<td>' + esc(b.name) + '<br><span class="ticket__seats">' + esc(b.email) +
            (b.phone ? ' · ' + esc(b.phone) : '') + '</span>' +
            (b.note ? '<br><span class="ticket__seats">« ' + esc(b.note) + ' »</span>' : '') + '</td>' +
          '<td>' + b.qty + '</td>' +
          '<td>' + (b.total ? b.total + ' ₴' : '—') + '</td>' +
          '<td>' + dt(b.created) + '</td>' +
          '<td><button class="btn btn--coral" data-bkdel="' + b.id + '">Скасувати</button></td></tr>';
      }).join('') : '<tr><td colspan="7"><p class="empty">Бронювань ще немає.</p></td></tr>') +
      '</tbody>';
  }

  function exportCsv() {
    var rows = [['code', 'event', 'name', 'email', 'phone', 'qty', 'total', 'created']];
    S.bookings.forEach(function (b) {
      var ev = S.events().filter(function (e) { return e.id === b.eventId; })[0];
      rows.push([b.code, ev ? ev.ua.title : b.eventId, b.name, b.email, b.phone, b.qty, b.total, b.created]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    download('eventu-bookings.csv', 'text/csv;charset=utf-8', '\ufeff' + csv);
  }

  function download(name, type, content) {
    var blob = new Blob([content], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ----------------------------------------------------------- reviews */
  function renderReviews() {
    var mine = S.reviews.map(function (r) { return { r: r, own: true }; });
    var seed = DATA.reviews.map(function (r) { return { r: r, own: false }; });
    $('#rv-list').innerHTML = mine.concat(seed).map(function (x) {
      return '<article class="review"><div class="review__head">' +
        '<span class="review__who">' + esc(x.r.name) + '</span>' +
        '<span class="review__rate">' + '★'.repeat(x.r.rating) + '</span></div>' +
        '<p>' + esc(x.r.ua) + '</p>' +
        '<div class="row" style="justify-content:space-between;margin-top:.6rem">' +
        '<span class="review__when">' + esc(x.r.date) + (x.own ? '' : ' · базовий набір') + '</span>' +
        (x.own ? '<button class="btn btn--coral" data-rvdel="' + x.r.id + '">Видалити</button>' : '') +
        '</div></article>';
    }).join('');
  }

  /* ------------------------------------------------------------ users */
  function renderUsers() {
    $('#us-table').innerHTML =
      '<thead><tr><th>Імʼя</th><th>Пошта</th><th>Вхід</th><th>Квитків</th></tr></thead><tbody>' +
      S.users.map(function (u) {
        var qty = S.bookings.filter(function (b) { return b.userId === u.id; })
          .reduce(function (s, b) { return s + b.qty; }, 0);
        return '<tr><td>' + esc(u.name) + '</td><td>' + esc(u.email) + '</td>' +
          '<td>' + (u.google ? 'Google' : 'пароль') + '</td><td>' + qty + '</td></tr>';
      }).join('') + '</tbody>';
  }

  /* ----------------------------------------------------- event editor */
  function openEditor(id) {
    var ev = id ? S.events().filter(function (e) { return e.id === id; })[0] : null;
    $('#ev-form-title').textContent = ev ? 'Редагування події' : 'Нова подія';

    $('#f-cat').innerHTML = DATA.categories.filter(function (c) { return c.id !== 'all'; })
      .map(function (c) { return '<option value="' + c.id + '">' + esc(c.ua) + '</option>'; }).join('');
    $('#f-venue').innerHTML = DATA.venues
      .map(function (v) { return '<option value="' + v.id + '">' + esc(v.ua) + '</option>'; }).join('');

    var d = ev || {
      id: '', cat: 'lecture', venue: 'main', date: '2026-11-15T18:00', duration: 90,
      price: 0, seats: 100, taken: 0, ink: '#2B3CF0', paper: '#FFD84D',
      ua: { title: '', host: '', desc: '' }, en: { title: '', host: '', desc: '' }
    };
    $('#f-id').value = d.id;
    $('#f-title-ua').value = d.ua.title; $('#f-title-en').value = d.en.title;
    $('#f-host-ua').value = d.ua.host;   $('#f-host-en').value = d.en.host;
    $('#f-desc-ua').value = d.ua.desc;   $('#f-desc-en').value = d.en.desc;
    $('#f-cat').value = d.cat; $('#f-venue').value = d.venue;
    $('#f-date').value = d.date.slice(0, 16);
    $('#f-duration').value = d.duration; $('#f-price').value = d.price;
    $('#f-seats').value = d.seats; $('#f-taken').value = d.taken;
    $('#f-ink').value = d.ink; $('#f-paper').value = d.paper;

    $('#modal-event').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    $$('.modal').forEach(function (m) { m.hidden = true; });
    document.body.style.overflow = '';
  }

  function saveFromForm(e) {
    e.preventDefault();
    var id = $('#f-id').value || ('ev-' + Date.now().toString(36));
    var seats = Number($('#f-seats').value);
    var taken = Number($('#f-taken').value);
    if (taken > seats) { toast('Зайнятих місць не може бути більше, ніж усього'); return; }

    S.saveEvent({
      id: id,
      cat: $('#f-cat').value,
      venue: $('#f-venue').value,
      date: $('#f-date').value,
      duration: Number($('#f-duration').value),
      price: Number($('#f-price').value),
      seats: seats,
      taken: taken,
      ink: $('#f-ink').value,
      paper: $('#f-paper').value,
      ua: { title: $('#f-title-ua').value, host: $('#f-host-ua').value, desc: $('#f-desc-ua').value },
      en: { title: $('#f-title-en').value, host: $('#f-host-en').value, desc: $('#f-desc-en').value }
    });
    closeModals();
    renderAll();
    toast('Подію збережено');
  }

  /* -------------------------------------------------------------- wire */
  function renderAll() {
    renderKpi(); renderEvents(); renderBookings(); renderReviews(); renderUsers();
  }

  function init() {
    ensureBuiltInAdmin();
    gate();

    $('#gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var res = S.login($('#gate-email').value, $('#gate-pass').value);
      var err = $('#gate-error');
      if (res.error) { err.textContent = 'Пошта або пароль не збігаються'; err.hidden = false; return; }
      if (!S.isAdmin()) {
        S.logout();
        err.textContent = 'Цей акаунт не має доступу до адмінпанелі';
        err.hidden = false;
        return;
      }
      err.hidden = true;
      showPanel();
    });

    $('#admin-logout').addEventListener('click', function () { S.logout(); location.reload(); });

    $('#admin-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (!b) return;
      $$('#admin-tabs .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      $$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
    });

    $('#ev-search').addEventListener('input', function (e) { filters.ev = e.target.value.trim(); renderEvents(); });
    $('#bk-search').addEventListener('input', function (e) { filters.bk = e.target.value.trim(); renderBookings(); });
    $('#ev-new').addEventListener('click', function () { openEditor(null); });
    $('#ev-form').addEventListener('submit', saveFromForm);
    $('#bk-export').addEventListener('click', exportCsv);

    $('#sys-export').addEventListener('click', function () {
      download('eventu-data.json', 'application/json', JSON.stringify({
        events: S.events(), bookings: S.bookings, users: S.users.map(function (u) {
          return { id: u.id, name: u.name, email: u.email, google: !!u.google };
        }), reviews: S.reviews
      }, null, 2));
    });

    $('#sys-reset').addEventListener('click', function () {
      if (!confirm('Скинути каталог подій до початкового набору?')) return;
      S.resetCatalogue();
      renderAll();
      toast('Каталог відновлено');
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('.modal__veil') || e.target.closest('[data-close]')) { closeModals(); return; }

      var ed = e.target.closest('[data-edit]');
      if (ed) { openEditor(ed.dataset.edit); return; }

      var del = e.target.closest('[data-del]');
      if (del) {
        var n = S.bookingsFor(del.dataset.del).length;
        if (!confirm('Видалити подію' + (n ? ' разом із ' + n + ' бронями?' : '?'))) return;
        S.deleteEvent(del.dataset.del); renderAll(); toast('Подію видалено'); return;
      }

      var bd = e.target.closest('[data-bkdel]');
      if (bd) {
        if (!confirm('Скасувати цю бронь? Місце повернеться в продаж.')) return;
        S.cancel(bd.dataset.bkdel); renderAll(); toast('Бронь скасовано'); return;
      }

      var rd = e.target.closest('[data-rvdel]');
      if (rd) { S.deleteReview(rd.dataset.rvdel); renderAll(); toast('Відгук видалено'); }
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModals(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
