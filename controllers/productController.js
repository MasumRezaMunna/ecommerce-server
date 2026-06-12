const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Build query filters
const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = new RegExp(query.brand, 'i');
  if (query.isFeatured === 'true') filter.featured = true;
  if (query.isNew === 'true') filter.newArrival = true;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };

  if (query.inStock === 'true') filter.stock = { $gt: 0 };

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = buildFilter(req.query);

    // Sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc': sort = { price: 1 }; break;
      case 'price_desc': sort = { price: -1 }; break;
      case 'rating': sort = { rating: -1 }; break;
      case 'newest': sort = { createdAt: -1 }; break;
      case 'popular': sort = { soldCount: -1, rating: -1 }; break;
      case 'name_asc': sort = { name: 1 }; break;
      default: sort = { createdAt: -1 };
    }

    if (req.query.search) sort = { score: { $meta: 'textScore' }, ...sort };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-specifications -description')
        .populate('category', 'name slug color icon')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, featured: true })
      .select('-specifications')
      .populate('category', 'name slug color')
      .sort({ rating: -1 })
      .limit(8)
      .lean();
    res.json({ success: true, data: { products } });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug color icon')
      .populate('seller', 'name avatar');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Related products
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .select('-specifications -description')
      .populate('category', 'name slug')
      .limit(4)
      .lean();

    // Reviews
    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: { product, related, reviews } });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const product = await Product.create({ ...req.body, seller: req.user._id });
    await product.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product created successfully', data: { product } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', data: { product } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/admin/all (admin)
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};
