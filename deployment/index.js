const express = require('express');
const db = require('./db');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Gérer la variable d’environnement pour le service account
if (process.env.SERVICE_ACCOUNT_BASE64) {
  const decoded = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  const tempPath = path.join(__dirname, 'service-account.json');

  fs.writeFileSync(tempPath, decoded, { encoding: 'utf8' });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
}


const userRoutes = require('./routes/userRoutes');

const initDbRoute = require('./routes/initDbRoute');
app.use('/init-db', initDbRoute);

app.use(express.json());
//app.use(express.json({ limit: '10mb' }));
app.use('/api/users', userRoutes);

const objectRoutes = require('./routes/objectRoutes');
app.use('/api/objects', objectRoutes);

const imgRoutes = require('./routes/imgObjectRoutes');
app.use('/api/imgs', imgRoutes);

const notificationRoute = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoute);

const emailRoutes = require('./routes/emailRoutes');
app.use('/api/send-email', emailRoutes);

const visionRoutes = require('./routes/visionRoutes');
app.use('/api/vision', visionRoutes); // 🔥 Ajouté ici

app.get('/', (req, res) => {
  res.send('API PTManager opérationnelle');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur requête DB', err);
    res.status(500).send('Erreur DB');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

