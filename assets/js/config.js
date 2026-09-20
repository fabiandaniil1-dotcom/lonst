/* Eventu — project configuration.
   Everything that a maintainer may want to tweak lives here. */
window.EVENTU_CONFIG = {
  brand: 'Eventu',
  office: 'Студентський офіс подій',
  email: 'tickets@eventu.university',
  phone: '+380 32 000 00 00',
  defaultLang: 'ua',          // 'ua' | 'en'
  maxTicketsPerUser: 2,       // per event, per account
  storagePrefix: 'eventu.v2.',
  // Google Sign-In. Put a real OAuth 2.0 Client ID here (Google Cloud Console →
  // Credentials → OAuth client ID → Web application → add your origin to
  // "Authorized JavaScript origins"). Empty string = the button is hidden.
  google: {
    clientId: '',            // e.g. '1234567890-abc.apps.googleusercontent.com'
    allowedDomain: ''        // e.g. 'lnu.edu.ua' to accept only university mail
  },

  // Accounts that may open admin.html. The built-in one works out of the box.
  admin: {
    email: 'admin@eventu.university',
    pass: 'eventu2026',
    emails: ['admin@eventu.university']
  },

  // Where the demo data comes from. Swap for a real API base when a backend exists.
  api: { mode: 'local' }
};
