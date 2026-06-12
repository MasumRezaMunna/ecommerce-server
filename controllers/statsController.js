const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Contact = require('../models/Contact');

// GET /api/stats/admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Overview counts
    const [
      totalUsers, totalProducts, totalOrders, newContacts,
      monthOrders, lastMonthOrders,
      monthUsers, lastMonthUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const currentRevenue = monthOrders[0]?.revenue || 0;
    const lastRevenue = lastMonthOrders[0]?.revenue || 0;
    const revenueGrowth = lastRevenue ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100) : 0;

    const currentOrderCount = monthOrders[0]?.count || 0;
    const lastOrderCount = lastMonthOrders[0]?.count || 0;
    const orderGrowth = lastOrderCount ? Math.round(((currentOrderCount - lastOrderCount) / lastOrderCount) * 100) : 0;

    const userGrowth = lastMonthUsers ? Math.round(((monthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0;

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const chartData = revenueByMonth.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders
    }));

    // Orders by status (pie)
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top selling products
    const topProducts = await Product.find({ isActive: true })
      .select('name images price soldCount rating')
      .sort({ soldCount: -1 })
      .limit(5)
      .lean();

    // Sales by category (bar chart)
    const salesByCategory = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productData.category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData.name',
          sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 6 }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Total revenue all-time
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: Math.round((totalRevenue[0]?.total || 0) * 100) / 100,
          monthRevenue: Math.round(currentRevenue * 100) / 100,
          revenueGrowth,
          orderGrowth,
          userGrowth,
          newContacts,
          monthOrders: currentOrderCount
        },
        charts: {
          revenueByMonth: chartData,
          ordersByStatus: ordersByStatus.map(o => ({ status: o._id, count: o.count })),
          salesByCategory: salesByCategory.map(c => ({ category: c._id, sales: Math.round(c.sales), units: c.units }))
        },
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stats/user
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [totalOrders, totalSpent, recentOrders, wishlistCount] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.aggregate([
        { $match: { user: userId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      User.findById(userId).select('wishlist').then(u => u?.wishlist?.length || 0)
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: Math.round((totalSpent[0]?.total || 0) * 100) / 100,
        wishlistCount,
        recentOrders,
        ordersByStatus: ordersByStatus.map(o => ({ status: o._id, count: o.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};
