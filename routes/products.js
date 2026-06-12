const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/admin/all', protect, restrictTo('admin'), productController.getAllProductsAdmin);
router.get('/:slug', productController.getProductBySlug);
router.post('/', protect, restrictTo('admin'), productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
