const ApiError = require('../utils/api-error');
const {
  POST_TYPES,
  POST_STATUSES,
  POST_SORT_FIELDS,
} = require('../constants/post.constants');

const fieldRules = {
  postTitle: { type: 'string', required: true, min: 3, max: 180 },
  postSlug: { type: 'string', required: true, min: 3, max: 200 },
  contentHtml: { type: 'string', required: true, min: 10, max: 100000 },
  applicationId: { type: 'string', max: 60, nullable: true },
  department: { type: 'string', max: 120, nullable: true },
  organization: { type: 'string', max: 140, nullable: true },
  qualification: { type: 'string', max: 120, nullable: true },
  imageUrls: { type: 'string', max: 5000, nullable: true },
  vacancies: { type: 'integer', min: 0, nullable: true },
  startDate: { type: 'date', nullable: true },
  endDate: { type: 'date', nullable: true },
  stateName: { type: 'string', max: 80, nullable: true },
  seoTitle: { type: 'string', max: 180, nullable: true },
  seoDescription: { type: 'string', max: 320, nullable: true },
  seoFocusKeyword: { type: 'string', max: 160, nullable: true },
  faqSchemaJson: { type: 'string', max: 5000, nullable: true },
  postStatus: { type: 'enum', required: true, values: POST_STATUSES },
  scheduledAt: { type: 'futureDateTime', nullable: true },
  postType: { type: 'enum', required: true, values: POST_TYPES },
  isFeatured: { type: 'boolean', nullable: true },
  priorityScore: { type: 'integer', min: 0, max: 100, nullable: true },
};

function normalizeEnum(value) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function validateField(field, value, rule) {
  if (value === null && rule.nullable) return null;

  if (rule.type === 'string') {
    if (typeof value !== 'string') return `${field} must be a string`;
    const length = value.trim().length;
    if (rule.min && length < rule.min) {
      return `${field} must contain at least ${rule.min} characters`;
    }
    if (length > rule.max) return `${field} must not exceed ${rule.max} characters`;
  }

  if (rule.type === 'integer') {
    if (!Number.isInteger(value)) return `${field} must be an integer`;
    if (value < rule.min || (rule.max !== undefined && value > rule.max)) {
      return rule.max === undefined
        ? `${field} must be ${rule.min} or greater`
        : `${field} must be between ${rule.min} and ${rule.max}`;
    }
  }

  if (rule.type === 'boolean' && typeof value !== 'boolean') {
    return `${field} must be a boolean`;
  }

  if (rule.type === 'date' && (typeof value !== 'string' || !isValidDate(value))) {
    return `${field} must be a valid date in YYYY-MM-DD format`;
  }

  if (rule.type === 'futureDateTime') {
    const date = new Date(value);
    if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
      return `${field} must be a valid ISO date-time`;
    }
    if (date <= new Date()) return `${field} must be in the future`;
  }

  if (rule.type === 'enum') {
    if (typeof value !== 'string' || !rule.values.includes(normalizeEnum(value))) {
      return `${field} must be one of: ${rule.values.join(', ')}`;
    }
  }

  return null;
}

function validatePost(req, res, next) {
  const errors = [];
  const allowedFields = Object.keys(fieldRules);

  Object.keys(req.body).forEach((field) => {
    if (!allowedFields.includes(field)) {
      errors.push({ field, message: `${field} is not allowed` });
    }
  });

  Object.entries(fieldRules).forEach(([field, rule]) => {
    const value = req.body[field];

    if (value === undefined) {
      if (rule.required) errors.push({ field, message: `${field} is required` });
      return;
    }

    const message = validateField(field, value, rule);
    if (message) {
      errors.push({ field, message });
    } else if (rule.type === 'enum') {
      req.body[field] = normalizeEnum(value);
    }
  });

  if (errors.length > 0) {
    return next(new ApiError(422, 'Validation failed', errors));
  }

  return next();
}

function validatePostId(req, res, next) {
  if (!/^POST-\d{4}-\d{5}$/.test(req.params.postId)) {
    return next(new ApiError(422, 'Validation failed', [
      { field: 'postId', message: 'postId must match POST-YYYY-#####' },
    ]));
  }

  return next();
}

function validatePostQuery(req, res, next) {
  const allowedQueryFields = ['search', 'postType', 'page', 'size', 'sortBy', 'sortDir'];
  const unknownField = Object.keys(req.query).find((field) => !allowedQueryFields.includes(field));

  if (unknownField) {
    return next(new ApiError(422, 'Validation failed', [
      { field: unknownField, message: `${unknownField} is not allowed` },
    ]));
  }

  const page = Number(req.query.page ?? 0);
  const size = Number(req.query.size ?? 20);
  const sortBy = req.query.sortBy || 'createdAt';
  const sortDir = (req.query.sortDir || 'desc').toLowerCase();
  const errors = [];

  if (!Number.isInteger(page) || page < 0) {
    errors.push({ field: 'page', message: 'page must be an integer of 0 or greater' });
  }

  if (!Number.isInteger(size) || size < 1 || size > 100) {
    errors.push({ field: 'size', message: 'size must be an integer between 1 and 100' });
  }

  if (!POST_SORT_FIELDS[sortBy]) {
    errors.push({
      field: 'sortBy',
      message: `sortBy must be one of: ${Object.keys(POST_SORT_FIELDS).join(', ')}`,
    });
  }

  if (!['asc', 'desc'].includes(sortDir)) {
    errors.push({ field: 'sortDir', message: 'sortDir must be asc or desc' });
  }

  if (req.query.search !== undefined) {
    if (typeof req.query.search !== 'string' || req.query.search.trim().length > 100) {
      errors.push({ field: 'search', message: 'search must not exceed 100 characters' });
    }
  }

  let postType;
  if (req.query.postType !== undefined) {
    postType = normalizeEnum(req.query.postType);
    if (!POST_TYPES.includes(postType)) {
      errors.push({ field: 'postType', message: `postType must be one of: ${POST_TYPES.join(', ')}` });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(422, 'Validation failed', errors));
  }

  req.query = {
    search: req.query.search?.trim() || undefined,
    postType,
    page,
    size,
    sortBy: POST_SORT_FIELDS[sortBy],
    sortDir,
  };

  return next();
}

module.exports = { validatePost, validatePostId, validatePostQuery };
