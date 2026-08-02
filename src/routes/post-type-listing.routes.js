const router = require('express').Router();
const PostRepository = require('../repositories/post.repository');
const { POST_TYPES, POST_SEARCH_MAX_LENGTH } = require('../constants/post.constants');
const { parsePagination, buildPage } = require('../utils/pagination');
const ApiError = require('../utils/api-error');
const asyncHandler = require('../middleware/async-handler');
const { successResponse } = require('../utils/api-response');
const cache = require('../config/cache');
const { protectDraftListings } = require('../middleware/admin-auth.middleware');

const repository = new PostRepository();
const LISTING_STATUSES = Object.freeze(['PUBLISHED', 'DRAFT']);

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
    slug: value.postSlug,
    postType: value.postType,
    startDate: value.startDate,
    lastDate: value.endDate,
    status: value.postStatus,
    state: value.stateName,
    vacancies: value.vacancies,
    department: value.department,
    qualification: value.qualification,
  };
}

function toPublicPostDetail(post) {
  const value = typeof post.toJSON === 'function' ? post.toJSON() : post;
  return {
    ...value,
    id: value.postId,
    title: value.postTitle,
    slug: value.postSlug,
    lastDate: value.endDate,
    status: value.postStatus,
  };
}

router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const slug = String(req.params.slug ?? '').trim();
  if (!slug) throw new ApiError(422, 'slug is required');

  const result = await cache.getOrLoad(`post-listing:slug:${slug}`, async () => {
    const post = await repository.findBySlug(slug);
    if (!post || post.postStatus !== 'PUBLISHED') {
      throw new ApiError(404, 'Published post not found');
    }
    return toPublicPostDetail(post);
  });

  res.set('X-Cache', result.status);
  return successResponse(res, {
    message: 'Published post fetched successfully',
    data: result.value,
  });
}));

router.get('/', protectDraftListings, asyncHandler(async (req, res) => {
  const allowedFields = ['postType', 'status', 'search', 'page', 'size', 'sortDir'];
  const unknownField = Object.keys(req.query).find((field) => !allowedFields.includes(field));
  const postType = normalizePostType(req.query.postType);
  const status = String(req.query.status ?? 'PUBLISHED').trim().toUpperCase();
  const searchValue = String(req.query.search ?? '').trim();
  const sortDir = String(req.query.sortDir ?? 'desc').trim().toLowerCase();
  const { page, size, errors } = parsePagination(req.query);

  if (unknownField) {
    errors.push({ field: unknownField, message: `${unknownField} is not allowed` });
  }
  if (postType && !POST_TYPES.includes(postType)) {
    errors.push({ field: 'postType', message: `postType must be one of: ${POST_TYPES.join(', ')}` });
  }
  if (status && !LISTING_STATUSES.includes(status)) {
    errors.push({ field: 'status', message: 'status must be PUBLISHED or DRAFT' });
  }
  if (searchValue.length > POST_SEARCH_MAX_LENGTH) {
    errors.push({
      field: 'search',
      message: `search must not exceed ${POST_SEARCH_MAX_LENGTH} characters`,
    });
  }
  if (!['asc', 'desc'].includes(sortDir)) {
    errors.push({ field: 'sortDir', message: 'sortDir must be asc or desc' });
  }
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);

  const cacheKey = `post-listing:${JSON.stringify({
    postType: postType || 'ALL',
    status,
    search: searchValue.toLowerCase(),
    page,
    size,
    sortDir,
  })}`;
  const result = await cache.getOrLoad(cacheKey, async () => {
    const { rows, count } = await repository.findAll({
      search: toSearchPattern(searchValue),
      postType: postType || undefined,
      postStatus: status,
      limit: size,
      offset: page * size,
      sortBy: 'startDate',
      sortDir: sortDir.toUpperCase(),
    });

    return buildPage({
      content: rows.map(toListingItem),
      page,
      size,
      totalElements: count,
      sort: `startDate,${sortDir}`,
    });
  });

  res.set('X-Cache', result.status);

  return successResponse(res, {
    message: 'Post listings fetched successfully',
    data: result.value,
  });
}));

module.exports = router;
