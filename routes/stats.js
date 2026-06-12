const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/admin', protect, restrictTo('admin'), statsController.getAdminStats);
router.get('/user', protect, statsController.getUserStats);

module.exports = router;
