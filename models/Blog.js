const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  slug: {
    type: String,
    required: true,
    // unique handled via schema.index() below only — no duplicate
    lowercase: true
  },
  excerpt: { type: String, required: [true, 'Excerpt is required'], maxlength: 300 },
  content: { type: String, required: [true, 'Content is required'] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, trim: true },
  image: String,
  tags: [{ type: String, lowercase: true, trim: true }],
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 5 },
  publishedAt: Date,
}, { timestamps: true });

// ── Indexes (single declaration each) ─────────────────────────────────────────
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ isPublished: 1, createdAt: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

blogSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
