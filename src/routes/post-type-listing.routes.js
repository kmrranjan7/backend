const router = require('express').Router();
const PostRepository = require('../repositories/post.repository');
const { POST_TYPES } = require('../constants/post.constants');
const { parsePagination, buildPage } = require('../utils/pagination');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../middleware/async-handler');
const { successResponse } = require('../utils/api-response');
const cache = require('../config/cache');

const repository = new PostRepository();

function normalizePostType(value) {
  return String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function toSearchPattern(value) {
  const normalized = String(value ?? '').trim();
  return normalized ? `%${normalized.replace(/[\\%_]/g, '\\$&')}%` : undefined;
}

function toListingItem(post) {
  const value = typeof post.toJSON === 'function' ? post.toJSON() : post;

  return {
    id: value.postId,
    title: value.postTitle,
    startDate: value.startDate,
    lastDate: value.endDate,
    status: value.postStatus,
    state: value.stateName,
    department: value.department,
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const allowedFields = ['postType', 'search', 'page', 'size', 'sortDir'];
  const unknownField = Object.keys(req.query).find((field) => !allowedFields.includes(field));
  const postType = normalizePostType(req.query.postType);
  const searchValue = String(req.query.search ?? '').trim();
  const sortDir = String(req.query.sortDir ?? 'desc').trim().toLowerCase();
  const { page, size, errors } = parsePagination(req.query);

  if (unknownField) {
    errors.push({ field: unknownField, message: `${unknownField} is not allowed` });
  }
  if (!postType) {
    errors.push({ field: 'postType', message: 'postType is required' });
  } else if (!POST_TYPES.includes(postType)) {
    errors.push({ field: 'postType', message: `postType must be one of: ${POST_TYPES.join(', ')}` });
  }
  if (searchValue.length > 100) {
    errors.push({ field: 'search', message: 'search must not exceed 100 characters' });
  }
  if (!['asc', 'desc'].includes(sortDir)) {
    errors.push({ field: 'sortDir', message: 'sortDir must be asc or desc' });
  }
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);

  const cacheKey = `post-listing:${JSON.stringify({
    postType,
    search: searchValue.toLowerCase(),
    page,
    size,
    sortDir,
  })}`;
  const cachedPage = cache.get(cacheKey);

  if (cachedPage) {
    res.set('X-Cache', 'HIT');
    return successResponse(res, {
      message: 'Post listings fetched successfully',
      data: cachedPage,
    });
  }

  const { rows, count } = await repository.findAll({
    search: toSearchPattern(searchValue),
    postType,
    limit: size,
    offset: page * size,
    sortBy: 'createdAt',
    sortDir: sortDir.toUpperCase(),
  });

  const pageResponse = buildPage({
    content: rows.map(toListingItem),
    page,
    size,
    totalElements: count,
    sort: `createdAt,${sortDir}`,
  });

  cache.set(cacheKey, pageResponse);
  res.set('X-Cache', 'MISS');

  return successResponse(res, {
    message: 'Post listings fetched successfully',
    data: pageResponse,
  });
}));

module.exports = router;
