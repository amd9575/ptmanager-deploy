const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.loginUser);
router.post('/update-device-token', userController.updateDeviceToken);
router.post('/create', userController.createUser);
router.post('/register', userController.registerUser);
router.get('/exists/:email', userController.checkIfUserExists);
router.post('/reset-password', userController.resetPassword);
router.post('/objects-info', userController.getUserObjectDetails);
router.get('/device-token/:id', userController.getDeviceToken);
router.put('/update/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);



router.get('/ping', (req, res) => {
  res.send('pong depuis /api/users/ping');
});


module.exports = router;

