const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const objectController = require('../controllers/objectController');

router.post('/', objectController.createObject);
router.get('/', objectController.getAllObjects);
router.get('/filteredObjects', objectController.getObjectsFilteredByTime);
router.get('/:id', objectController.getObjectById);
router.put('/:id', objectController.updateObject);
router.delete('/:id', objectController.deleteObject);
router.post('/object-details', userController.getUserObjectDetails);
router.post('/similar', objectController.getSimilarObjects);
router.get('/byUser/:id', objectController.getObjectsByUser);


module.exports = router;

