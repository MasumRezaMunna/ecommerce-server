const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Guard: catch unconfigured placeholder URIs before attempting connection
  if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) {
    console.error('\n❌  MONGODB_URI is not configured.');
    console.error('─────────────────────────────────────────────────');
    console.error('Steps to fix:');
    console.error('  1. Copy server/.env.example  →  server/.env');
    console.error('  2. Create a free MongoDB Atlas cluster at https://cloud.mongodb.com');
    console.error('  3. Paste your real connection string into MONGODB_URI in server/.env');
    console.error('  4. Run:  npm run dev');
    console.error('─────────────────────────────────────────────────\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n❌  MongoDB connection failed:', error.message);
    console.error('Tip: Check your MONGODB_URI in server/.env — ensure the cluster is running and your IP is whitelisted in Atlas.\n');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️   MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('♻️   MongoDB reconnected'));

module.exports = connectDB;
