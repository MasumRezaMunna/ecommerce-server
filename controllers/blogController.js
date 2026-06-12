const Blog = require('../models/Blog');
const slugify = require('slugify');

exports.getBlogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 9;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .lean(),
      Blog.countDocuments(filter)
    ]);

    res.json({ success: true, data: { blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar');

    if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });

    const related = await Blog.find({
      _id: { $ne: blog._id },
      isPublished: true,
      $or: [{ category: blog.category }, { tags: { $in: blog.tags } }]
    }).select('-content').populate('author', 'name').limit(3).lean();

    res.json({ success: true, data: { blog, related } });
  } catch (error) { next(error); }
};

exports.createBlog = async (req, res, next) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.create({ ...req.body, slug, author: req.user._id });
    res.status(201).json({ success: true, message: 'Blog post created', data: { blog } });
  } catch (error) { next(error); }
};

exports.updateBlog = async (req, res, next) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog updated', data: { blog } });
  } catch (error) { next(error); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) { next(error); }
};

exports.getAllBlogsAdmin = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate('author', 'name').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: { blogs } });
  } catch (error) { next(error); }
};
