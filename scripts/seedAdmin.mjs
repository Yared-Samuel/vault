#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Fix: Define __dirname FIRST before using it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Now use __dirname after it's defined
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// Set up console styling
const styles = {
  success: '\x1b[32m%s\x1b[0m', // Green
  error: '\x1b[31m%s\x1b[0m',   // Red
  info: '\x1b[36m%s\x1b[0m',    // Cyan
  warn: '\x1b[33m%s\x1b[0m'     // Yellow
};

// Helper functions for logging
const success = (msg) => console.log(styles.success, `✓ ${msg}`);
const error = (msg) => console.error(styles.error, `✗ ${msg}`);
const info = (msg) => console.log(styles.info, `ℹ ${msg}`);
const warn = (msg) => console.log(styles.warn, `⚠ ${msg}`);


const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  error('MONGODB_URI is not defined in environment variables');
  console.log('Please check your .env file and ensure MONGODB_URI is defined correctly');
  process.exit(1);
}

// Define schemas directly in this file to avoid import issues
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["accountant","owner","cashier","purchaser","admin"], required: true },
  password: {
    type: String,
    required: [true, "Please add a Password"],
    minLength: [6, "Password must be up to 6 characters"],
    select: false,
  },
  lastLogin: { type: Date },
}, { timestamps: true });

// Add password hashing method
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

async function seedAdmin() {
  try {
    info('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    success('Connected to MongoDB successfully');

    // Get or create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    info('Checking if admin user already exists...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      warn('Admin user already exists:');
      console.log({
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      await mongoose.disconnect();
      return;
    }


    
    // Create admin user with strong password
    info('Creating admin user...');
    const password = 'Admin@123';
    
    const adminUser = new User({
      name: 'Yared S',
      email: 'yared@system.com',
      password: password, // Will be hashed by the pre-save hook
      role: 'admin',
      lastLogin: new Date()
    });
    
    await adminUser.save();
    success('Admin user created successfully');
    
    
    // Display admin credentials
    success('Admin setup completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log('------------------');
    console.log(`Email:    admin@system.com`);
    console.log(`Password: ${password}`);
    console.log('\nIMPORTANT: Please change this password after first login!\n');
    
  } catch (err) {
    error('Unhandled error in seeding process: ' + err.message);
    console.error(err);
  } finally {
    // Close the database connection
    if (mongoose.connection.readyState !== 0) {
      info('Closing database connection...');
      await mongoose.disconnect();
      success('Database connection closed');
    }
  }
}

// Run the seed function
seedAdmin().catch(err => {
  error('Fatal error: ' + err.message);
  process.exit(1);
}); 