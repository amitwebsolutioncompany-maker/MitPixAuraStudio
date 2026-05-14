const router = require('express').Router();

// Render health checks and external uptime monitors should call:
// GET https://<your-render-service>.onrender.com/health
// Keep this endpoint dependency-free: no auth, no database query, no JWT, no heavy middleware.
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is alive',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
