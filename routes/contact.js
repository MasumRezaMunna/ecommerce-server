const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', contactController.submitContact);
router.get('/', protect, restrictTo('admin'), contactController.getContacts);
router.patch('/:id', protect, restrictTo('admin'), contactController.updateContactStatus);

module.exports = router;
