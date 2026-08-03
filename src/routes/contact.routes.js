const router = require('express').Router();
const ContactRepository = require('../repositories/contact.repository');
const ContactService = require('../services/contact.service');
const ContactController = require('../controllers/contact.controller');
const cache = require('../config/cache');
const asyncHandler = require('../middleware/async-handler');
const { requireAdmin } = require('../middleware/admin-auth.middleware');
const { contactSubmissionLimiter } = require('../middleware/rate-limit.middleware');
const {
  validateContact,
  validateContactQuery,
} = require('../validations/contact.validation');

const repository = new ContactRepository();
const service = new ContactService(repository, cache);
const controller = new ContactController(service);

router.post('/', contactSubmissionLimiter, validateContact, asyncHandler(controller.create));
router.get('/', requireAdmin, validateContactQuery, asyncHandler(controller.getAll));

module.exports = router;
