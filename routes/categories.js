// routes/categories.js
const express = require('express');
const router = express.Router();
const catController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', catController.getCategories);
router.get('/:slug', catController.getCategoryBySlug);
router.post('/', protect, restrictTo('admin'), catController.createCategory);
router.put('/:id', protect, restrictTo('admin'), catController.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), catController.deleteCategory);

module.exports = router;
