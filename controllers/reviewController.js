const Review = require('../models/Review');
const Order = require('../models/Order');

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment } = req.body;
    if (!product || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating, title and comment are required' });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if verified purchase
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': product,
      status: 'delivered'
    });

    const review = await Review.create({
      product, user: req.user._id, rating, title, comment,
      isVerifiedPurchase: !!order
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = { product: req.params.productId };
    if (req.query.rating) filter.rating = Number(req.query.rating);

    let sort = { createdAt: -1 };
    if (req.query.sort === 'helpful') sort = { helpful: -1 };
    if (req.query.sort === 'rating_high') sort = { rating: -1 };
    if (req.query.sort === 'rating_low') sort = { rating: 1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    // Rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        distribution: [5,4,3,2,1].map(r => ({
          rating: r,
          count: distribution.find(d => d._id === r)?.count || 0
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
