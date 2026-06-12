require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('./database');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Blog = require('../models/Blog');

const seed = async () => {
  await connectDB();

  // Clear all
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    Review.deleteMany(),
    Order.deleteMany(),
    Blog.deleteMany()
  ]);
  console.log('🗑️  Cleared existing data');

  // ─── USERS ───────────────────────────────────────────────────────────────
  const hashedPass = await bcrypt.hash('Demo@1234', 12);
  const adminPass = await bcrypt.hash('Admin@1234', 12);

  const adminUser = await User.create({
    name: 'Alex Morgan',
    email: 'admin@revenio.com',
    password: adminPass,
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    phone: '+1-555-0100',
    address: { street: '100 Commerce St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
    isEmailVerified: true
  });

  const regularUser = await User.create({
    name: 'Jordan Lee',
    email: 'user@revenio.com',
    password: hashedPass,
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    phone: '+1-555-0200',
    address: { street: '42 Maple Ave', city: 'Austin', state: 'TX', zip: '73301', country: 'US' },
    isEmailVerified: true
  });

  const extraUsers = await User.insertMany([
    { name: 'Sam Carter', email: 'sam@example.com', password: hashedPass, role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam', isEmailVerified: true },
    { name: 'Riley Kim', email: 'riley@example.com', password: hashedPass, role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riley', isEmailVerified: true },
    { name: 'Casey Wu', email: 'casey@example.com', password: hashedPass, role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey', isEmailVerified: true },
  ]);

  console.log('👤 Users seeded');

  // ─── CATEGORIES ──────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech accessories', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', icon: '📱', color: '#6366f1' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories for every style', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop', icon: '👗', color: '#ec4899' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and everything for your home', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', icon: '🏠', color: '#f59e0b' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Equipment and gear for every adventure', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop', icon: '⚽', color: '#10b981' },
    { name: 'Books & Media', slug: 'books-media', description: 'Books, music, movies, and more', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop', icon: '📚', color: '#8b5cf6' },
    { name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, wellness, and personal care essentials', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=300&fit=crop', icon: '💄', color: '#f43f5e' },
  ]);

  console.log('📂 Categories seeded');

  // ─── PRODUCTS ────────────────────────────────────────────────────────────
  const [electronics, fashion, home, sports, books, beauty] = categories;

  const products = await Product.insertMany([
    // Electronics
    {
      name: 'Wireless Noise-Cancelling Headphones Pro',
      slug: 'wireless-noise-cancelling-headphones-pro',
      description: 'Experience studio-quality sound with adaptive noise cancellation. 30-hour battery life, premium leather ear cushions, and foldable design for travel.',
      shortDescription: 'Studio-quality sound with 30h battery and adaptive ANC.',
      price: 349.99, originalPrice: 449.99,
      category: electronics._id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&h=600&fit=crop',
      ],
      stock: 45, brand: 'SoundCore',
      specifications: [{ key: 'Battery Life', value: '30 hours' }, { key: 'Connectivity', value: 'Bluetooth 5.2' }, { key: 'Weight', value: '250g' }, { key: 'Driver Size', value: '40mm' }],
      tags: ['wireless', 'headphones', 'noise-cancelling', 'audio'],
      featured: true, newArrival: true,
      seller: adminUser._id,
    },
    {
      name: 'Smart Watch Series 8 Ultra',
      slug: 'smart-watch-series-8-ultra',
      description: 'Track your fitness, receive notifications, and monitor your health with our most advanced smartwatch. Always-on display, ECG monitoring, and 7-day battery life.',
      shortDescription: 'Advanced health tracking with always-on display and ECG.',
      price: 499.99, originalPrice: 599.99,
      category: electronics._id,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=600&fit=crop',
      ],
      stock: 32, brand: 'TechWrist',
      specifications: [{ key: 'Display', value: '1.9" AMOLED Always-On' }, { key: 'Battery', value: '7 days' }, { key: 'Water Resistance', value: '5ATM' }, { key: 'Health Sensors', value: 'ECG, SpO2, Heart Rate' }],
      tags: ['smartwatch', 'fitness', 'health', 'wearable'],
      featured: true, newArrival: false,
      seller: adminUser._id,
    },
    {
      name: '4K OLED Gaming Monitor 27"',
      slug: '4k-oled-gaming-monitor-27',
      description: 'Immerse yourself in stunning 4K OLED visuals with 144Hz refresh rate and 0.1ms response time. Perfect for competitive gaming and creative work.',
      shortDescription: '4K OLED with 144Hz, 0.1ms response time for pro gaming.',
      price: 899.99, originalPrice: 1099.99,
      category: electronics._id,
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1593640408182-31c228a08bd0?w=800&h=600&fit=crop',
      ],
      stock: 18, brand: 'ViewPro',
      specifications: [{ key: 'Resolution', value: '3840x2160 (4K)' }, { key: 'Panel', value: 'OLED' }, { key: 'Refresh Rate', value: '144Hz' }, { key: 'Response Time', value: '0.1ms' }],
      tags: ['monitor', 'gaming', '4k', 'oled'],
      featured: true,
      seller: adminUser._id,
    },
    {
      name: 'Mechanical Keyboard TKL RGB',
      slug: 'mechanical-keyboard-tkl-rgb',
      description: 'Tenkeyless mechanical keyboard with Cherry MX switches, full per-key RGB backlight, aluminum frame, and detachable USB-C cable.',
      shortDescription: 'TKL mechanical keyboard with Cherry MX and per-key RGB.',
      price: 129.99, originalPrice: 159.99,
      category: electronics._id,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=600&fit=crop'],
      stock: 67, brand: 'KeyMaster',
      specifications: [{ key: 'Switch', value: 'Cherry MX Red' }, { key: 'Layout', value: 'TKL (87 keys)' }, { key: 'Backlight', value: 'Per-key RGB' }, { key: 'Connection', value: 'USB-C detachable' }],
      tags: ['keyboard', 'mechanical', 'gaming', 'rgb'],
      featured: false,
      seller: adminUser._id,
    },
    // Fashion
    {
      name: 'Premium Merino Wool Crewneck Sweater',
      slug: 'premium-merino-wool-crewneck-sweater',
      description: 'Crafted from 100% extra-fine Merino wool, this crewneck sweater is naturally temperature-regulating, odor-resistant, and incredibly soft against the skin.',
      shortDescription: '100% extra-fine Merino wool, naturally temperature-regulating.',
      price: 149.99, originalPrice: 199.99,
      category: fashion._id,
      images: [
        'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop',
      ],
      stock: 89, brand: 'WoolCraft',
      specifications: [{ key: 'Material', value: '100% Extra-Fine Merino Wool' }, { key: 'Care', value: 'Machine washable cold' }, { key: 'Fit', value: 'Regular fit' }, { key: 'Available Sizes', value: 'XS-3XL' }],
      tags: ['sweater', 'merino', 'wool', 'knitwear'],
      featured: true, newArrival: true,
      seller: adminUser._id,
    },
    {
      name: 'Leather Ankle Boots - Handcrafted',
      slug: 'leather-ankle-boots-handcrafted',
      description: 'Handcrafted from full-grain leather with a Goodyear welt construction, ensuring durability and resolability. Side zipper for easy on/off.',
      shortDescription: 'Full-grain leather with Goodyear welt, built to last a lifetime.',
      price: 289.99, originalPrice: 359.99,
      category: fashion._id,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'],
      stock: 34, brand: 'LeatherCo',
      specifications: [{ key: 'Material', value: 'Full-grain leather upper' }, { key: 'Construction', value: 'Goodyear welt' }, { key: 'Sole', value: 'Rubber lugged' }, { key: 'Available Sizes', value: '6-13' }],
      tags: ['boots', 'leather', 'handcrafted', 'footwear'],
      featured: false,
      seller: adminUser._id,
    },
    // Home & Living
    {
      name: 'Ergonomic Office Chair Pro',
      slug: 'ergonomic-office-chair-pro',
      description: 'Designed with input from orthopedic specialists, this chair features lumbar support, adjustable armrests, and breathable mesh back to keep you comfortable during long work sessions.',
      shortDescription: 'Orthopedic-designed chair with lumbar support and mesh back.',
      price: 549.99, originalPrice: 699.99,
      category: home._id,
      images: [
        'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526040652367-ac003a0475fe?w=800&h=600&fit=crop',
      ],
      stock: 25, brand: 'ErgoSit',
      specifications: [{ key: 'Max Weight', value: '150kg' }, { key: 'Back Height', value: 'Adjustable' }, { key: 'Armrests', value: '4D adjustable' }, { key: 'Warranty', value: '5 years' }],
      tags: ['chair', 'ergonomic', 'office', 'furniture'],
      featured: true, newArrival: false,
      seller: adminUser._id,
    },
    {
      name: 'Ceramic Pour-Over Coffee Set',
      slug: 'ceramic-pour-over-coffee-set',
      description: 'Elevate your morning ritual with this handmade ceramic pour-over set. Includes a dripper, server, and two mugs, all crafted by local artisans.',
      shortDescription: 'Handmade ceramic pour-over dripper, server, and two mugs.',
      price: 79.99, originalPrice: 99.99,
      category: home._id,
      images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop'],
      stock: 112, brand: 'CraftBrew',
      specifications: [{ key: 'Material', value: 'Handmade ceramic' }, { key: 'Includes', value: 'Dripper + Server + 2 Mugs' }, { key: 'Capacity', value: '600ml server' }, { key: 'Dishwasher Safe', value: 'Yes' }],
      tags: ['coffee', 'pour-over', 'ceramic', 'kitchen'],
      featured: false, newArrival: true,
      seller: adminUser._id,
    },
    // Sports
    {
      name: 'Carbon Fiber Road Bike Helmet',
      slug: 'carbon-fiber-road-bike-helmet',
      description: 'MIPS-certified road cycling helmet with aerodynamic carbon fiber shell, 22 vents for superior airflow, and quick-adjust retention system.',
      shortDescription: 'MIPS-certified carbon fiber helmet with 22 vents.',
      price: 179.99, originalPrice: 229.99,
      category: sports._id,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'],
      stock: 41, brand: 'VeloPro',
      specifications: [{ key: 'Safety', value: 'MIPS certified, CE EN 1078' }, { key: 'Material', value: 'Carbon fiber shell' }, { key: 'Vents', value: '22 vents' }, { key: 'Weight', value: '260g' }],
      tags: ['helmet', 'cycling', 'bike', 'safety'],
      featured: false,
      seller: adminUser._id,
    },
    {
      name: 'Professional Yoga Mat Ultra-Grip',
      slug: 'professional-yoga-mat-ultra-grip',
      description: 'Made from natural rubber with a microfiber top layer, this yoga mat provides exceptional grip even during sweaty sessions. 6mm cushioning for joint protection.',
      shortDescription: 'Natural rubber + microfiber for the ultimate grip in any session.',
      price: 89.99, originalPrice: 119.99,
      category: sports._id,
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'],
      stock: 78, brand: 'YogaFlow',
      specifications: [{ key: 'Material', value: 'Natural rubber + Microfiber' }, { key: 'Thickness', value: '6mm' }, { key: 'Dimensions', value: '183cm x 68cm' }, { key: 'Weight', value: '2.1kg' }],
      tags: ['yoga', 'mat', 'fitness', 'exercise'],
      featured: true, newArrival: false,
      seller: adminUser._id,
    },
    // Books
    {
      name: 'The Art of Deep Work - Revised Edition',
      slug: 'the-art-of-deep-work-revised',
      description: 'A comprehensive guide to developing focus superpowers in a distracted world. This revised edition includes new chapters on digital minimalism and remote work strategies.',
      shortDescription: 'Develop focus superpowers and master the art of undistracted work.',
      price: 24.99, originalPrice: 32.99,
      category: books._id,
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop'],
      stock: 200, brand: 'DeepPress',
      specifications: [{ key: 'Pages', value: '368' }, { key: 'Format', value: 'Hardcover' }, { key: 'Language', value: 'English' }, { key: 'Edition', value: 'Revised 2nd Edition' }],
      tags: ['productivity', 'focus', 'self-help', 'business'],
      featured: false, newArrival: true,
      seller: adminUser._id,
    },
    // Beauty
    {
      name: 'Vitamin C Brightening Serum 30ml',
      slug: 'vitamin-c-brightening-serum-30ml',
      description: '20% L-ascorbic acid formula with ferulic acid and vitamin E for maximum antioxidant protection. Clinically proven to reduce dark spots in 4 weeks.',
      shortDescription: 'Clinical-grade 20% Vitamin C with ferulic acid – visibly brighter skin in 4 weeks.',
      price: 64.99, originalPrice: 84.99,
      category: beauty._id,
      images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop'],
      stock: 156, brand: 'DermaClear',
      specifications: [{ key: 'Key Ingredient', value: '20% L-Ascorbic Acid' }, { key: 'Volume', value: '30ml' }, { key: 'Skin Type', value: 'All skin types' }, { key: 'Free From', value: 'Parabens, Sulfates' }],
      tags: ['skincare', 'vitamin-c', 'serum', 'brightening'],
      featured: true, newArrival: true,
      seller: adminUser._id,
    },
  ]);

  console.log('📦 Products seeded');

  // ─── REVIEWS ─────────────────────────────────────────────────────────────
  const reviewData = [
    { product: products[0]._id, user: regularUser._id, rating: 5, title: 'Best headphones I\'ve ever owned', comment: 'The noise cancellation is absolutely incredible. I use these on my daily commute and they block out everything. Sound quality is warm and detailed.' },
    { product: products[0]._id, user: extraUsers[0]._id, rating: 4, title: 'Great headphones, minor gripe', comment: 'Sound quality is top-notch. Battery life is as advertised. Only giving 4 stars because the ear cups get a bit warm after 2+ hours.' },
    { product: products[1]._id, user: regularUser._id, rating: 5, title: 'Life-changing health tracking', comment: 'The ECG monitoring has been invaluable. Already detected an irregular rhythm that my doctor confirmed. Worth every penny.' },
    { product: products[4]._id, user: extraUsers[1]._id, rating: 5, title: 'Luxuriously soft', comment: 'I was skeptical about the price but this sweater is worth it. It\'s been washed a dozen times and still looks brand new.' },
    { product: products[6]._id, user: regularUser._id, rating: 5, title: 'Back pain is gone!', comment: 'After 3 weeks of using this chair, my chronic back pain has significantly decreased. The lumbar support is perfectly positioned.' },
    { product: products[9]._id, user: extraUsers[2]._id, rating: 4, title: 'Excellent grip, lives up to the hype', comment: 'The microfiber top layer provides incredible grip. Finally a mat that doesn\'t slide during hot yoga.' },
    { product: products[11]._id, user: regularUser._id, rating: 5, title: 'Visible results in 2 weeks', comment: 'Dark spots from sun damage have noticeably faded. My skin tone is more even and my face looks brighter overall.' },
    { product: products[2]._id, user: extraUsers[0]._id, rating: 5, title: 'Stunning visuals', comment: 'OLED quality is absolutely jaw-dropping. Games look like real life. The 144Hz makes everything silky smooth.' },
  ];

  const reviews = await Review.insertMany(reviewData);

  // Update product ratings
  for (const product of products) {
    const productReviews = reviews.filter(r => r.product.toString() === product._id.toString());
    if (productReviews.length > 0) {
      const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await Product.findByIdAndUpdate(product._id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: productReviews.length
      });
    }
  }

  console.log('⭐ Reviews seeded');

  // ─── ORDERS ──────────────────────────────────────────────────────────────
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
  const ordersData = [];

  for (let i = 0; i < 15; i++) {
    const user = i % 2 === 0 ? regularUser : extraUsers[i % 3];
    const product = products[i % products.length];
    const qty = Math.floor(Math.random() * 3) + 1;
    const subtotal = product.price * qty;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;

    ordersData.push({
      orderNumber: `RVN-${String(1000 + i).padStart(6, '0')}`,
      user: user._id,
      items: [{ product: product._id, name: product.name, price: product.price, quantity: qty, image: product.images[0] }],
      shippingAddress: { name: user.name, street: '42 Maple Ave', city: 'Austin', state: 'TX', zip: '73301', country: 'US', phone: '+1-555-0200' },
      subtotal,
      shippingCost: shipping,
      tax: Math.round(tax * 100) / 100,
      total: Math.round((subtotal + shipping + tax) * 100) / 100,
      status: statuses[i % statuses.length],
      paymentStatus: i < 12 ? 'paid' : 'pending',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - (15 - i) * 3 * 24 * 60 * 60 * 1000)
    });
  }

  await Order.insertMany(ordersData);
  console.log('🛒 Orders seeded');

  // ─── BLOGS ───────────────────────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: 'The Future of E-Commerce: Trends to Watch in 2025',
      slug: 'future-of-ecommerce-trends-2025',
      excerpt: 'From AI-powered personalization to augmented reality try-ons, we explore the technologies reshaping how we shop online.',
      content: `<p>The e-commerce landscape is evolving faster than ever. Artificial intelligence is no longer a buzzword — it\'s the engine behind personalized product recommendations, dynamic pricing, and conversational shopping assistants.</p><p>Augmented reality is allowing customers to "try on" products before buying, reducing return rates significantly. Sustainability is becoming a purchase driver, with consumers actively seeking brands that align with their values.</p><p>Social commerce — buying directly within social media apps — is exploding, especially among Gen Z shoppers. And voice search is quietly reshaping how people discover products.</p>`,
      author: adminUser._id,
      category: 'Industry Trends',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop',
      tags: ['ecommerce', 'ai', 'trends', 'retail'],
      isPublished: true,
      readTime: 5
    },
    {
      title: 'How to Build a Capsule Wardrobe That Never Goes Out of Style',
      slug: 'capsule-wardrobe-guide',
      excerpt: 'Quality over quantity: learn how to build a versatile wardrobe with 30 essential pieces that work for every occasion.',
      content: `<p>The capsule wardrobe concept, coined by Susie Faux in the 1970s, is as relevant as ever in our fast-fashion-fatigued world. The idea is simple: curate a collection of versatile, high-quality pieces that work together seamlessly.</p><p>Start with neutral foundations: a well-fitted pair of dark jeans, a white Oxford shirt, a navy blazer, and quality leather shoes. These form the backbone of dozens of outfits.</p><p>Layer in a few statement pieces that reflect your personality, but choose them carefully — they should complement your foundations, not compete with them.</p>`,
      author: adminUser._id,
      category: 'Style Guide',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=500&fit=crop',
      tags: ['fashion', 'style', 'wardrobe', 'sustainability'],
      isPublished: true,
      readTime: 7
    },
    {
      title: 'Ergonomics at Home: Setting Up Your Perfect Work-From-Home Office',
      slug: 'ergonomics-home-office-setup',
      excerpt: 'Your home office setup directly impacts your productivity and long-term health. Here\'s how to get it right.',
      content: `<p>With remote work becoming permanent for millions of people, investing in a proper home office setup has never been more important. Poor ergonomics leads to back pain, eye strain, and reduced productivity.</p><p>The first investment should always be a quality chair. Look for adjustable lumbar support, armrests that position your arms parallel to the floor, and a seat height that allows your feet to rest flat.</p><p>Monitor placement is equally critical — the top of your screen should be at or slightly below eye level, positioned about an arm\'s length away.</p>`,
      author: adminUser._id,
      category: 'Home & Lifestyle',
      image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=500&fit=crop',
      tags: ['home-office', 'ergonomics', 'productivity', 'wellness'],
      isPublished: true,
      readTime: 6
    },
    {
      title: 'The Science Behind Skincare: What Ingredients Actually Work',
      slug: 'skincare-ingredients-science',
      excerpt: 'Cut through the marketing noise and learn which skincare ingredients have real scientific backing.',
      content: `<p>The skincare industry is worth billions, and with that comes a lot of marketing noise. But a handful of ingredients have robust clinical evidence behind them.</p><p>Retinoids (vitamin A derivatives) are the gold standard for anti-aging, with decades of peer-reviewed research supporting their ability to increase collagen production and accelerate cell turnover.</p><p>Vitamin C (L-ascorbic acid) is a potent antioxidant that brightens skin and boosts collagen synthesis. Look for concentrations between 10-20% for best results.</p>`,
      author: adminUser._id,
      category: 'Beauty & Health',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop',
      tags: ['skincare', 'beauty', 'science', 'ingredients'],
      isPublished: true,
      readTime: 8
    },
  ]);

  console.log('📝 Blogs seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Credentials:');
  console.log('Admin → admin@revenio.com / Admin@1234');
  console.log('User  → user@revenio.com  / Demo@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
