const path = require('path');

require('dotenv').config({ path: process.env.ENV_FILE || path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '..', '.env.local') });
require('dotenv').config();

const required = ['MONGO_URI', 'SECRET_KEY'];
const missing = required.filter((key) => !process.env[key] && !(key === 'SECRET_KEY' && process.env.JWT_SECRET));

if (missing.length) {
  throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || 'mitpix_aura_studio',
  jwtSecret: process.env.JWT_SECRET || process.env.SECRET_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

module.exports = { env };
