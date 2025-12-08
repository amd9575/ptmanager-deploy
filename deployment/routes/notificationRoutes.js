const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /api/notify-user
router.post('/notify-user', notificationController.notifyUser);
router.put('/users/:userId/device-token', notificationController.updateDeviceToken);

module.exports = router;
