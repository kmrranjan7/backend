const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

function parsePagination(query) {
  const page = Number(query.page ?? DEFAULT_PAGE);
  const size = Number(query.size ?? DEFAULT_SIZE);
  const errors = [];

  if (!Number.isInteger(page) || page < 0) {
    errors.push({ field: 'page', message: 'page must be an integer of 0 or greater' });
  }

  if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) {
    errors.push({ field: 'size', message: `size must be an integer between 1 and ${MAX_SIZE}` });
  }

  return { page, size, errors };
}

function buildPage({ content, page, size, totalElements, sort }) {
  const totalPages = Math.ceil(totalElements / size);

  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    ...(sort ? { sort } : {}),
    first: page === 0,
    last: page >= Math.max(totalPages - 1, 0),
  };
}

module.exports = { parsePagination, buildPage };
