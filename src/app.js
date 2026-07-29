const express = require('express');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { successResponse } = require('./utils/api-response');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (req, res) => {
  return successResponse(res, {
    message: 'Service is healthy',
    data: { uptime: process.uptime() },
  });
});

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
