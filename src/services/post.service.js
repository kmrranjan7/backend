const { randomInt } = require('crypto');
const { promisify } = require('util');
const ApiError = require('../utils/api-error');
const { buildPage } = require('../utils/pagination');

const randomIntAsync = promisify(randomInt);
const CACHE_PREFIX = 'posts:';
const LISTING_CACHE_PREFIX = 'post-listing:';
const MAX_ID_ATTEMPTS = 5;

class PostService {
  constructor(postRepository, cache) {
    this.repository = postRepository;
    this.cache = cache;
  }

  async create(payload) {
    const normalized = this.normalize(payload);
    this.validateDateRange(normalized.startDate, normalized.endDate);
    await this.ensureUniqueFields(normalized);

    const postId = await this.generateUniquePostId();
    const applicationId = normalized.applicationId || postId.replace('POST-', 'APP-');
    const post = await this.repository.create({ ...normalized, postId, applicationId });

    this.invalidateCache();
    return this.toResponse(post);
  }

  async getByPostId(postId) {
    const cacheKey = `${CACHE_PREFIX}id:${postId}`;
    const result = await this.cache.getOrLoad(cacheKey, async () => {
      const post = await this.getExistingPost(postId);
      return this.toResponse(post);
    });

    return { data: result.value, cacheStatus: result.status };
  }

  async getAll(query) {
    const cacheKey = `${CACHE_PREFIX}list:${JSON.stringify(query)}`;
    const result = await this.cache.getOrLoad(cacheKey, async () => {
      const search = query.search ? `%${this.escapeLike(query.search.trim())}%` : undefined;
      const { rows, count } = await this.repository.findAll({
        search,
        postType: query.postType,
        limit: query.size,
        offset: query.page * query.size,
        sortBy: query.sortBy,
        sortDir: query.sortDir.toUpperCase(),
      });

      return buildPage({
        content: rows.map((post) => this.toResponse(post)),
        page: query.page,
        size: query.size,
        totalElements: count,
        sort: `${query.sortBy},${query.sortDir}`,
      });
    });

    return { data: result.value, cacheStatus: result.status };
  }

  async update(postId, payload) {
    const post = await this.getExistingPost(postId);
    const normalized = this.normalize(payload);

    this.validateDateRange(normalized.startDate, normalized.endDate);
    await this.ensureUniqueFields(normalized, post.id);

    const updatedPost = await this.repository.update(post, normalized);
    this.invalidateCache();
    return this.toResponse(updatedPost);
  }

  async delete(postId) {
    const post = await this.getExistingPost(postId);
    await this.repository.delete(post);
    this.invalidateCache();
  }

  async getExistingPost(postId) {
    const post = await this.repository.findByPostId(postId);

    if (!post) {
      throw new ApiError(404, `Post not found for id: ${postId}`);
    }

    return post;
  }

  async ensureUniqueFields(payload, currentId = null) {
    const [slugPost, titlePost] = await Promise.all([
      this.repository.findBySlug(payload.postSlug),
      this.repository.findByTitleIgnoreCase(payload.postTitle),
    ]);

    if (slugPost && String(slugPost.id) !== String(currentId)) {
      throw new ApiError(409, 'postSlug already exists');
    }

    if (titlePost && String(titlePost.id) !== String(currentId)) {
      throw new ApiError(409, 'postTitle already exists');
    }
  }

  async generateUniquePostId() {
    const year = new Date().getUTCFullYear();

    for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
      const suffix = await randomIntAsync(10000, 100000);
      const postId = `POST-${year}-${suffix}`;

      if (!(await this.repository.findByPostId(postId))) return postId;
    }

    throw new ApiError(503, 'Unable to generate a unique post ID');
  }

  normalize(payload) {
    const normalized = { ...payload };
    const stringFields = [
      'postTitle',
      'postSlug',
      'contentHtml',
      'applicationId',
      'department',
      'organization',
      'qualification',
      'imageUrls',
      'stateName',
      'seoTitle',
      'seoDescription',
      'seoFocusKeyword',
      'faqSchemaJson',
    ];

    stringFields.forEach((field) => {
      if (typeof normalized[field] === 'string') {
        normalized[field] = normalized[field].trim();
      }
    });

    return normalized;
  }

  validateDateRange(startDate, endDate) {
    if (startDate && endDate && endDate < startDate) {
      throw new ApiError(422, 'endDate cannot be before startDate');
    }
  }

  escapeLike(value) {
    return value.replace(/[\\%_]/g, '\\$&');
  }

  invalidateCache() {
    this.cache.deleteByPrefix(CACHE_PREFIX);
    this.cache.deleteByPrefix(LISTING_CACHE_PREFIX);
  }

  toResponse(post) {
    const value = typeof post.toJSON === 'function' ? post.toJSON() : { ...post };
    const { id: internalId, postId, ...response } = value;
    return { id: postId, ...response };
  }
}

module.exports = PostService;
