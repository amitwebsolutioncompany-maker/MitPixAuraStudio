const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
  console.log(`MongoDB connected: ${env.mongoDbName}`);
}

module.exports = connectDB;
