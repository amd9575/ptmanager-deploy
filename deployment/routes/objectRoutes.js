const express = require('express');
const router = express.Router();
const objectController = require('../controllers/objectController');

router.post('/', objectController.createObject);
router.get('/', objectController.getAllObjects);
router.get('/:id', objectController.getObjectById);
router.put('/:id', objectController.updateObject);
router.delete('/:id', objectController.deleteObject);
router.get('/filteredObjects', objectController.getObjectsFilteredByTime);

module.exports = router;

