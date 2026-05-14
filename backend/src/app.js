const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { env } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Register health before JSON parsing, logging, rate limiting, auth, and API routes.
// This keeps Render/UptimeRobot keep-alive checks fast and prevents duplicate /health registration.
app.use('/health', require('./routes/healthRoutes'));

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
