const User = require('../models/User');
const SuperAdmin = require('../models/SuperAdmin');
const SubscriptionCharge = require('../models/SubscriptionCharge');
const Product = require('../models/Product');
const Course = require('../models/Course');
const { env } = require('../config/env');

const defaultSuperAdminEmail = 'amitwebsolutioncompany@gmail.com';
const defaultSuperAdminPassword = 'amit@3401';

const defaultCharges = [
  { plan: 'demo10min', label: 'Demo 10 min', amount: 0 },
  { plan: 'demo5day', label: 'Demo 5 day', amount: 0 },
  { plan: 'month1', label: '1 month', amount: 0 },
  { plan: 'month6', label: '6 month', amount: 0 },
  { plan: 'year1', label: '1 year', amount: 0 }
];

async function seedAdmin() {
  const email = (env.adminEmail || defaultSuperAdminEmail).toLowerCase();
  const password = env.adminPassword || defaultSuperAdminPassword;

  const existing = await SuperAdmin.findOne({ email });
  if (!existing) {
    await SuperAdmin.create({
      name: 'MitPix Aura Studio Super Admin',
      email,
      password,
      phone: '+918574700615'
    });
    console.log('Initial super admin seeded');
  }

  await User.updateMany({ email, role: 'admin' }, { isActive: false });

  await Promise.all(defaultCharges.map((charge) => (
    SubscriptionCharge.updateOne({ plan: charge.plan }, { $setOnInsert: charge }, { upsert: true })
  )));
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
