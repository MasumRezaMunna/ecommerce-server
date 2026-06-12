const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 150 },
  message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 2000 },
  status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  reply: String,
  repliedAt: Date,
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
