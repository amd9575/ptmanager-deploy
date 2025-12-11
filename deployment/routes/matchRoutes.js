// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

// POST /api/matches/create
// Crée un nouveau match et envoie une notification
router.post('/create', matchController.createMatch);

// GET /api/matches/pending/:userId
// Récupère tous les matches en attente pour un utilisateur
router.get('/pending/:userId', matchController.getPendingMatches);

// POST /api/matches/confirm
// Confirme un match et envoie l'email au trouveur
router.post('/confirm', matchController.confirmMatch);

// POST /api/matches/reject
// Rejette un match
router.post('/reject', matchController.rejectMatch);

module.exports = router;
