const Sentry = require("@sentry/node");

const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    console.warn("⚠️ SENTRY_DSN manquant, Sentry désactivé");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 1.0,

    beforeSend(event) {
      if (event.request && event.request.data) {
        if (event.request.data.password) {
          event.request.data.password = "[Filtered]";
        }
        if (event.request.data.token) {
          event.request.data.token = "[Filtered]";
        }
        if (event.request.data.email) {
          const email = event.request.data.email;
          event.request.data.email = email.replace(
            /^(.{2}).*(@.*)$/,
            "$1***$2"
          );
        }
      }
      return event;
    },
  });

  // ✅ SEULE MÉTHODE EXPRESS EN v10
  Sentry.setupExpressErrorHandler(app);
};

module.exports = { initSentry, Sentry };

