const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    // unique is handled via schema.index() below — no duplicate
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  images: {
    type: [String],
    validate: {
      validator: (v) => v.length > 0,
      message: 'At least one image is required'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  brand: { type: String, trim: true },
  specifications: [specificationSchema],
  tags: [{ type: String, lowercase: true, trim: true }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },   // renamed from isFeatured to avoid isNew clash
  newArrival: { type: Boolean, default: false },  // renamed from isNew (reserved word in Mongoose)
  isActive: { type: Boolean, default: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── Indexes (single declaration each — no duplicates) ─────────────────────────
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ featured: 1, isActive: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
productSchema.virtual('isFeatured').get(function () { return this.featured; });
productSchema.virtual('isNew').get(function () { return this.newArrival; });

productSchema.virtual('discountPercent').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
