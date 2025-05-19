const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.loginUser);
router.post('/update-device-token', userController.updateDeviceToken);
router.post('/create', userController.createUser);
router.post('/register', userController.registerUser);

module.exports = router;

