// Run with: npm run seed
// Populates the database with sample products for quick testing/demo.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    price: 129.99,
    description: 'Over-ear Bluetooth headphones with 30-hour battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    stock: 24,
  },
  {
    name: 'Smart Fitness Watch',
    category: 'Electronics',
    price: 89.5,
    description: 'Tracks heart rate, sleep, and workouts with a week-long battery.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    stock: 0,
  },
  {
    name: 'Organic Cotton T-Shirt',
    category: 'Clothing',
    price: 19.99,
    description: 'Soft, breathable everyday tee made from 100% organic cotton.',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    stock: 150,
  },
  {
    name: 'Running Sneakers',
    category: 'Clothing',
    price: 74.0,
    description: 'Lightweight running shoes with responsive cushioning.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    stock: 42,
  },
  {
    name: 'Stainless Steel French Press',
    category: 'Home & Kitchen',
    price: 34.5,
    description: 'Double-walled French press that keeps coffee hot for longer.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    stock: 60,
  },
  {
    name: 'Non-Stick Frying Pan Set',
    category: 'Home & Kitchen',
    price: 45.99,
    description: '3-piece non-stick frying pan set, oven-safe up to 400°F.',
    imageUrl: 'https://images.unsplash.com/photo-1584990347449-a9a6c9a4c7e0?w=500',
    stock: 0,
  },
  {
    name: 'The Silent Garden (Novel)',
    category: 'Books',
    price: 14.99,
    description: 'A bestselling mystery novel set in a small coastal town.',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    stock: 80,
  },
  {
    name: 'Yoga Mat with Carry Strap',
    category: 'Sports & Outdoors',
    price: 24.0,
    description: 'Extra-thick non-slip yoga mat, includes carrying strap.',
    imageUrl: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=500',
    stock: 35,
  },
];

const seed = async () => {
  await connectDB();
  try {
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log(`Seeded ${sampleProducts.length} products successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seed();
