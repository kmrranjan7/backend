const router = require('express').Router();
const PostRepository = require('../repositories/post.repository');
const PostService = require('../services/post.service');
const PostController = require('../controllers/post.controller');
const cache = require('../config/cache');
const asyncHandler = require('../middleware/async-handler');
const { requireAdmin } = require('../middleware/admin-auth.middleware');
const { writeApiLimiter } = require('../middleware/rate-limit.middleware');
const {
  validatePost,
  validatePostId,
  validatePostQuery,
} = require('../validations/post.validation');

const repository = new PostRepository();
const service = new PostService(repository, cache);
const controller = new PostController(service);

router.use(requireAdmin);
router.post('/', writeApiLimiter, validatePost, asyncHandler(controller.create));
router.get('/', validatePostQuery, asyncHandler(controller.getAll));
router.get('/:postId', validatePostId, asyncHandler(controller.getByPostId));
router.put('/:postId', writeApiLimiter, validatePostId, validatePost, asyncHandler(controller.update));
router.delete('/:postId', writeApiLimiter, validatePostId, asyncHandler(controller.delete));

module.exports = router;
