const Sentry = require("@sentry/node");

const initSentry = (app) => {
  Sentry.init({
    dsn: "https://b7d21aecd2a35421a55094b93135b252@o4510556997681153.ingest.de.sentry.io/4510567713603664",
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0, // 100% des transactions (réduire à 0.1 si trop de volume)
    
    // Filtrer les données sensibles
    beforeSend(event) {
      // Ne pas logger les mots de passe
      if (event.request && event.request.data) {
        if (event.request.data.password) {
          event.request.data.password = '[Filtered]';
        }
        if (event.request.data.token) {
          event.request.data.token = '[Filtered]';
        }
        // Masquer partiellement les emails
        if (event.request.data.email) {
          const email = event.request.data.email;
          event.request.data.email = email.replace(/^(.{2}).*(@.*)$/, '$1***$2');
        }
      }
      return event;
    }
  });

  // Middleware pour capturer les requêtes
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
};

const errorHandler = () => {
  return Sentry.Handlers.errorHandler();
};

module.exports = { initSentry, errorHandler, Sentry };
