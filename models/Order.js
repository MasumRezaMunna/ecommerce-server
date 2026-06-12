const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, default: 'US' },
  phone: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    // unique handled via schema.index() below only
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'Order must have at least one item'
    }
  },
  shippingAddress: shippingAddressSchema,
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'cod', 'bank_transfer'],
    default: 'card'
  },
  stripePaymentIntentId: String,
  trackingNumber: String,
  notes: String,
  deliveredAt: Date,
  cancelledAt: Date,
}, {
  timestamps: true
});

// Auto-generate order number using createdAt approach (avoids isNew reserved word)
orderSchema.pre('save', async function (next) {
  if (this.__isNewDoc && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `RVN-${String(count + 1001).padStart(6, '0')}`;
  }
  next();
});

// Workaround: track "new doc" state without using reserved this.isNew
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) this.__isNewDoc = true;
  next();
});

// ── Indexes (single declaration each) ─────────────────────────────────────────
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
