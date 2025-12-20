const express = require('express');
const db = require('./db');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// IMPORTANT : Importer Sentry AVANT de créer l'app
const { initSentry, errorHandler, Sentry } = require('./sentryConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT : Initialiser Sentry EN PREMIER (avant tout middleware)
initSentry(app);

// Gérer la variable d'environnement pour le service account
if (process.env.SERVICE_ACCOUNT_BASE64) {
  const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  const tempPath = path.join(__dirname, 'service-account.json');
  fs.writeFileSync(tempPath, decoded, { encoding: 'utf8' });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
}

// CORS - pour les appels depuis HTML
app.use(cors({
  origin: ['https://objetperdu.org', 'https://www.objetperdu.org'],
  credentials: true
}));

app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const initDbRoute = require('./routes/initDbRoute');
const objectRoutes = require('./routes/objectRoutes');
const imgRoutes = require('./routes/imgObjectRoutes');
const notificationRoute = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const visionRoutes = require('./routes/visionRoutes');
const matchRoutes = require('./routes/matchRoutes');

app.use('/init-db', initDbRoute);
app.use('/api/users', userRoutes);
app.use('/api/objects', objectRoutes);
app.use('/api/imgs', imgRoutes);
app.use('/api/notifications', notificationRoute);
app.use('/api/send-email', emailRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/matches', matchRoutes);

app.get('/', (req, res) => {
  res.send('API PTManager opérationnelle');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur requête DB', err);
    Sentry.captureException(err); // ✅ Log l'erreur dans Sentry
    res.status(500).send('Erreur DB');
  }
});

// Route de test Sentry (à retirer après vérification)
app.get('/api/test-sentry', (req, res) => {
  try {
    throw new Error('🧪 Test Sentry Backend - Tout fonctionne !');
  } catch (error) {
    Sentry.captureException(error);
    res.json({ success: true, message: 'Erreur de test envoyée à Sentry' });
  }
});

// IMPORTANT : errorHandler de Sentry APRÈS toutes les routes
app.use(errorHandler());

// Middleware d'erreur final
app.use((err, req, res, next) => {
  console.error('Error:', err);
  // Sentry a déjà capturé l'erreur grâce au errorHandler ci-dessus
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('Sentry activé pour le monitoring des erreurs');
});
