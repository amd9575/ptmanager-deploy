// routes/initDbRoute.js
const express = require('express');
const router = express.Router();
const { initDatabaseSchema } = require('../utils/initDb');

router.get('/', async (req, res) => {
  try {
    await initDatabaseSchema();
    res.send('✅ Base de données initialisée');
  } catch (err) {
    res.status(500).send('Erreur lors de la création des tables');
  }
});

module.exports = router;

