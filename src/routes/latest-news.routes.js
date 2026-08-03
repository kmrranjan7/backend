const router = require('express').Router();
const LatestNews = require('../models/latest-news.model');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../middleware/async-handler');
const { requireAdmin } = require('../middleware/admin-auth.middleware');
const { writeApiLimiter } = require('../middleware/rate-limit.middleware');
const { successResponse } = require('../utils/api-response');

function toResponse(record) {
  return { id: String(record.id), title: record.title, link: record.link, updatedAt: record.updatedAt };
}

function values(body) {
  const title = String(body?.title ?? '').trim();
  const link = String(body?.link ?? '').trim();
  if (title.length < 3 || title.length > 180) throw new ApiError(422, 'Title must be between 3 and 180 characters');
  let valid = link.startsWith('/') && !link.startsWith('//');
  if (!valid) {
    try { valid = ['http:', 'https:'].includes(new URL(link).protocol); } catch { valid = false; }
  }
  if (!link || link.length > 500 || !valid) throw new ApiError(422, 'Link must be an internal path or a valid HTTP/HTTPS URL');
  return { title, link };
}

async function existing(id) {
  const record = await LatestNews.findByPk(id);
  if (!record) throw new ApiError(404, 'Latest news record not found');
  return record;
}

router.get('/', asyncHandler(async (req, res) => {
  const records = await LatestNews.findAll({ order: [['updatedAt', 'DESC']], limit: 100 });
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
  return successResponse(res, { message: 'Latest news fetched successfully', data: records.map(toResponse) });
}));

router.post('/', requireAdmin, writeApiLimiter, asyncHandler(async (req, res) => {
  const record = await LatestNews.create(values(req.body));
  return successResponse(res, { statusCode: 201, message: 'Latest news created successfully', data: toResponse(record) });
}));

router.put('/:id', requireAdmin, writeApiLimiter, asyncHandler(async (req, res) => {
  const record = await existing(req.params.id);
  await record.update(values(req.body));
  return successResponse(res, { message: 'Latest news updated successfully', data: toResponse(record) });
}));

router.delete('/:id', requireAdmin, writeApiLimiter, asyncHandler(async (req, res) => {
  const record = await existing(req.params.id);
  await record.destroy();
  return successResponse(res, { message: 'Latest news deleted successfully', data: null });
}));

module.exports = router;
