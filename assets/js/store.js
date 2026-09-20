/* Local persistence layer.
   Keeps accounts, bookings, reviews and preferences in localStorage.
   Swap the four read/write helpers for fetch() calls to plug in a real backend. */
(function () {
  var CFG = window.EVENTU_CONFIG;
  var P = CFG.storagePrefix;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(P + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(P + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function remove(key) { try { localStorage.removeItem(P + key); } catch (e) {} }

  /* Not security — just so plain passwords are not sitting in localStorage
     of a demo project. A real deployment authenticates on the server. */
  function scramble(text) {
    var h = 5381, i;
    for (i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return 'h' + h.toString(36) + '-' + text.length;
  }

  function code() {
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 8; i++) out += abc[Math.floor(Math.random() * abc.length)];
    return out.slice(0, 4) + '-' + out.slice(4);
  }

  var Store = {
    lang: read('lang', CFG.defaultLang),
    theme: read('theme', null),
    cookies: read('cookies', null),
    users: read('users', []),
    customEvents: read('events', {}),
    hiddenEvents: read('eventsHidden', []),
    user: read('session', null),
    bookings: read('bookings', []),
    reviews: read('reviews', []),

    setLang: function (l) { this.lang = l; write('lang', l); },
    setTheme: function (t) { this.theme = t; write('theme', t); },
    setCookies: function (v) { this.cookies = v; write('cookies', v); },

    /* ---- accounts ---- */
    register: function (name, email, pass) {
      email = String(email).trim().toLowerCase();
      if (pass.length < 6) return { error: 'auth.shortPass' };
      if (this.users.some(function (u) { return u.email === email; })) return { error: 'auth.exists' };
      var user = { id: 'u' + Date.now(), name: String(name).trim(), email: email, pass: scramble(pass) };
      this.users.push(user);
      write('users', this.users);
      this.user = { id: user.id, name: user.name, email: user.email };
      write('session', this.user);
      return { user: this.user };
    },
    login: function (email, pass) {
      email = String(email).trim().toLowerCase();
      var hit = this.users.filter(function (u) { return u.email === email && u.pass === scramble(pass); })[0];
      if (!hit) return { error: 'auth.badCreds' };
      this.user = { id: hit.id, name: hit.name, email: hit.email };
      write('session', this.user);
      return { user: this.user };
    },
    logout: function () { this.user = null; remove('session'); },

    /* Sign in with a Google identity payload (already verified by Google).
       Creates a local account on first use, then behaves like any other login. */
    loginWithGoogle: function (profile) {
      var email = String(profile.email || '').toLowerCase();
      if (!email) return { error: 'auth.badCreds' };
      var domain = CFG.google && CFG.google.allowedDomain;
      if (domain && email.split('@')[1] !== domain) return { error: 'auth.wrongDomain' };
      var hit = this.users.filter(function (u) { return u.email === email; })[0];
      if (!hit) {
        hit = { id: 'u' + Date.now(), name: profile.name || email.split('@')[0], email: email, pass: null, google: true };
        this.users.push(hit);
        write('users', this.users);
      }
      this.user = { id: hit.id, name: hit.name, email: hit.email, google: true };
      write('session', this.user);
      return { user: this.user };
    },

    isAdmin: function () {
      if (!this.user) return false;
      var list = (CFG.admin && CFG.admin.emails) || [];
      return list.indexOf(this.user.email) > -1;
    },

    /* ---- event catalogue (seed data + admin edits) ---- */
    events: function () {
      var self = this;
      var seed = window.EVENTU_DATA.events.map(function (e) {
        return self.customEvents[e.id] || e;
      });
      var extra = Object.keys(this.customEvents)
        .filter(function (id) { return !window.EVENTU_DATA.events.some(function (e) { return e.id === id; }); })
        .map(function (id) { return self.customEvents[id]; });
      return seed.concat(extra)
        .filter(function (e) { return self.hiddenEvents.indexOf(e.id) === -1; })
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    },
    saveEvent: function (ev) {
      this.customEvents[ev.id] = ev;
      write('events', this.customEvents);
      return ev;
    },
    deleteEvent: function (id) {
      if (this.hiddenEvents.indexOf(id) === -1) this.hiddenEvents.push(id);
      delete this.customEvents[id];
      write('eventsHidden', this.hiddenEvents);
      write('events', this.customEvents);
      this.bookings = this.bookings.filter(function (b) { return b.eventId !== id; });
      write('bookings', this.bookings);
    },
    resetCatalogue: function () {
      this.customEvents = {}; this.hiddenEvents = [];
      write('events', {}); write('eventsHidden', []);
    },
    bookingsFor: function (eventId) {
      return this.bookings.filter(function (b) { return b.eventId === eventId; });
    },
    deleteReview: function (id) {
      this.reviews = this.reviews.filter(function (r) { return r.id !== id; });
      write('reviews', this.reviews);
    },

    /* ---- seats ---- */
    bookedByAll: function (eventId) {
      return this.bookings.reduce(function (sum, b) {
        return b.eventId === eventId ? sum + b.qty : sum;
      }, 0);
    },
    bookedByMe: function (eventId) {
      var me = this.user ? this.user.id : null;
      if (!me) return 0;
      return this.bookings.reduce(function (sum, b) {
        return (b.eventId === eventId && b.userId === me) ? sum + b.qty : sum;
      }, 0);
    },
    seatsLeft: function (ev) {
      return Math.max(0, ev.seats - ev.taken - this.bookedByAll(ev.id));
    },

    /* ---- bookings ---- */
    book: function (ev, form) {
      var left = this.seatsLeft(ev);
      if (form.qty > left) return { error: 'book.notEnough' };
      if (this.bookedByMe(ev.id) + form.qty > CFG.maxTicketsPerUser) return { error: 'book.limit' };
      var booking = {
        id: 'b' + Date.now(),
        code: code(),
        eventId: ev.id,
        userId: this.user ? this.user.id : 'guest',
        name: form.name, email: form.email, phone: form.phone || '',
        note: form.note || '', qty: form.qty,
        total: form.qty * ev.price,
        created: new Date().toISOString()
      };
      this.bookings.push(booking);
      write('bookings', this.bookings);
      return { booking: booking };
    },
    cancel: function (bookingId) {
      this.bookings = this.bookings.filter(function (b) { return b.id !== bookingId; });
      write('bookings', this.bookings);
    },
    myBookings: function () {
      var me = this.user ? this.user.id : 'guest';
      return this.bookings.filter(function (b) { return b.userId === me; })
        .sort(function (a, b) { return b.created.localeCompare(a.created); });
    },

    /* ---- reviews ---- */
    allReviews: function () {
      return this.reviews.concat(window.EVENTU_DATA.reviews);
    },
    addReview: function (name, rating, text) {
      var r = {
        id: 'r' + Date.now(), name: name, rating: rating,
        date: new Date().toISOString().slice(0, 10),
        ua: text, en: text, own: true
      };
      this.reviews.unshift(r);
      write('reviews', this.reviews);
      return r;
    }
  };

  window.EventuStore = Store;
})();
