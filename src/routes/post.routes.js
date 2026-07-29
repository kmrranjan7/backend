const router = require('express').Router();
const PostRepository = require('../repositories/post.repository');
const PostService = require('../services/post.service');
const PostController = require('../controllers/post.controller');
const cache = require('../config/cache');
const asyncHandler = require('../middleware/async-handler');
const {
  validatePost,
  validatePostId,
  validatePostQuery,
} = require('../validations/post.validation');

const repository = new PostRepository();
const service = new PostService(repository, cache);
const controller = new PostController(service);

router.post('/', validatePost, asyncHandler(controller.create));
router.get('/', validatePostQuery, asyncHandler(controller.getAll));
router.get('/:postId', validatePostId, asyncHandler(controller.getByPostId));
router.put('/:postId', validatePostId, validatePost, asyncHandler(controller.update));
router.delete('/:postId', validatePostId, asyncHandler(controller.delete));

module.exports = router;
