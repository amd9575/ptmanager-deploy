const express = require('express');
const router = express.Router();
const imgController = require('../controllers/imgObjectController');

router.post('/', imgController.createImg);
router.get('/', imgController.getAllImgs);
router.get('/object/:objectId', imgController.getImgsByObjectId);
router.delete('/:id', imgController.deleteImgByImgId);
router.delete('/object/:objectId', imgController.deleteImgByObjectId);
router.put('/:id', imgController.updateImg);

module.exports = router;

