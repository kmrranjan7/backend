const cors = require('cors');
const env = require('../config/env');
const ApiError = require('../utils/api-error');

const corsMiddleware = cors({
  origin(origin, callback) {
    // API clients and server-to-server requests may not send an Origin header.
    if (!origin || env.cors.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, 'Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 600,
});

module.exports = corsMiddleware;
