import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'vijaydinodia548@gmail.com';
    const plainPassword = 'vijay@123';

    // Check if admin already exists
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      console.log('⚠️  Admin user already exists:', email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Insert admin (bypass pre-save hook by setting directly)
    const admin = await AdminUser.create({ email, password: hashedPassword });
    console.log('🎉 Admin user created successfully!');
    console.log('   Email   :', admin.email);
    console.log('   Password: vijay@123');
    console.log('   ID      :', admin._id);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();
