// routes/notificationRoute.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.createNotification);
router.post('/send', notificationController.sendNotification);

module.exports = router;

