const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', blogController.getBlogs);
router.get('/admin/all', protect, restrictTo('admin'), blogController.getAllBlogsAdmin);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/', protect, restrictTo('admin'), blogController.createBlog);
router.put('/:id', protect, restrictTo('admin'), blogController.updateBlog);
router.delete('/:id', protect, restrictTo('admin'), blogController.deleteBlog);

module.exports = router;
