const User = require('../models/User');
const Product = require('../models/Product');
const Course = require('../models/Course');
const { env } = require('../config/env');

async function seedAdmin() {
  if (!env.adminEmail || !env.adminPassword) return;

  const existing = await User.findOne({ email: env.adminEmail });
  if (existing) return;

  await User.create({
    name: 'MitPix Aura Studio Admin',
    email: env.adminEmail,
    password: env.adminPassword,
    role: 'admin'
  });

  console.log('Initial admin seeded');
}

async function seedCatalog() {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    await Product.insertMany([
      {
        name: 'MitPix Aura Studio Grooming Serum',
        description: 'Premium daily care serum for polished salon finish.',
        price: 1299,
        stock: 40
      },
      {
        name: 'MitPix Aura Studio Beauty Care Kit',
        description: 'Curated grooming and beauty essentials for home care.',
        price: 2499,
        stock: 25
      }
    ]);
  }

  const courseCount = await Course.countDocuments();
  if (!courseCount) {
    await Course.insertMany([
      {
        title: 'Professional Grooming Foundation',
        description: 'Core grooming skills with hygiene, styling and client handling.',
        mode: 'hybrid',
        duration: '6 weeks',
        price: 9999
      },
      {
        title: 'Beauty Specialist Masterclass',
        description: 'Advanced beauty techniques for salon and freelance professionals.',
        mode: 'offline',
        duration: '8 weeks',
        price: 14999
      }
    ]);
  }
}

module.exports = { seedAdmin, seedCatalog };
