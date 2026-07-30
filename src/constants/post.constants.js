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

const POST_SORT_FIELDS = Object.freeze({
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  postTitle: 'postTitle',
  startDate: 'startDate',
  endDate: 'endDate',
  vacancies: 'vacancies',
  priorityScore: 'priorityScore',
});

module.exports = { POST_TYPES, POST_STATUSES, POST_SORT_FIELDS };
