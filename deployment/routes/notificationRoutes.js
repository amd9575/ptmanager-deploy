const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /api/notify-user
router.post('/notify-user', notificationController.notifyUser);

module.exports = router;
