const router = require('express').Router();
const UserDetailsRepository = require('../repositories/user-details.repository');
const UserDetailsService = require('../services/user-details.service');
const UserDetailsController = require('../controllers/user-details.controller');
const asyncHandler = require('../middleware/async-handler');
const {
  validateUser,
  validateId,
  validatePagination,
} = require('../validations/user-details.validation');

const repository = new UserDetailsRepository();
const service = new UserDetailsService(repository);
const controller = new UserDetailsController(service);

router.post('/', validateUser(), asyncHandler(controller.create));
router.get('/', validatePagination, asyncHandler(controller.getAll));
router.get('/:id', validateId, asyncHandler(controller.getById));
router.put('/:id', validateId, validateUser({ partial: true }), asyncHandler(controller.update));
router.delete('/:id', validateId, asyncHandler(controller.delete));

module.exports = router;
