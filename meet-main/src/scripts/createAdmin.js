const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const User = require('../models/user.model');

const createAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('MONGO_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const userName = 'admin';
    const email = 'admin@example.com';
    const password = 'admin123';

    // Check if admin already exists
    let admin = await User.findOne({ role: 'admin', userName });
    if (admin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin = await User.create({
      name: 'Administrator',
      email,
      userName,
      password: hashedPassword,
      dob: '2000-01-01',
      role: 'admin',
      status: 'active',
    });

    console.log('Admin user created successfully:');
    console.log({ userName, email, password });
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 