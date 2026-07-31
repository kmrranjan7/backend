const express = require('express');
const compression = require('compression');
const routes = require('./routes');
const contactRoutes = require('./routes/contact.routes');
const corsMiddleware = require('./middleware/cors.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { successResponse } = require('./utils/api-response');
const { publicApiLimiter } = require('./middleware/rate-limit.middleware');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Cache-Control': 'private, no-store',
  });
  next();
});
app.use(corsMiddleware);
app.use(compression({ level: 4, threshold: 1024 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  return successResponse(res, {
    message: 'Service is healthy',
    data: { uptime: process.uptime() },
  });
});

app.use('/api', publicApiLimiter);
app.use('/api/v1', routes);
app.use('/api/contact', contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
