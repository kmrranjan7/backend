const POST_TYPES = Object.freeze([
  'JOB',
  'ADMIT',
  'EXAM',
  'RESULT',
  'ADMISSION',
  'SYLLABUS',
  'ANSWER_KEY',
  'OTHERS',
]);

const POST_STATUSES = Object.freeze([
  'DRAFT',
  'PENDING_REVIEW',
  'SCHEDULED',
  'PUBLISHED',
]);

const POST_SEARCH_MAX_LENGTH = 50;

module.exports = { POST_TYPES, POST_STATUSES, POST_SEARCH_MAX_LENGTH };
