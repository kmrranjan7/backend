const router = require('express').Router();
const UserDetailsRepository = require('../repositories/user-details.repository');
const UserDetailsService = require('../services/user-details.service');
const UserDetailsController = require('../controllers/user-details.controller');
const cache = require('../config/cache');
const asyncHandler = require('../middleware/async-handler');
const { requireAdmin } = require('../middleware/admin-auth.middleware');
const { writeApiLimiter } = require('../middleware/rate-limit.middleware');
const {
  validateUser,
  validateId,
  validatePagination,
} = require('../validations/user-details.validation');

const repository = new UserDetailsRepository();
const service = new UserDetailsService(repository, cache);
const controller = new UserDetailsController(service);

router.use(requireAdmin);
router.post('/', writeApiLimiter, validateUser(), asyncHandler(controller.create));
router.get('/', validatePagination, asyncHandler(controller.getAll));
router.get('/:id', validateId, asyncHandler(controller.getById));
router.put('/:id', writeApiLimiter, validateId, validateUser({ partial: true }), asyncHandler(controller.update));
router.delete('/:id', writeApiLimiter, validateId, asyncHandler(controller.delete));

module.exports = router;
