const router = require('express').Router();
const ContactRepository = require('../repositories/contact.repository');
const ContactService = require('../services/contact.service');
const ContactController = require('../controllers/contact.controller');
const asyncHandler = require('../middleware/async-handler');
const {
  validateContact,
  validateContactQuery,
} = require('../validations/contact.validation');

const repository = new ContactRepository();
const service = new ContactService(repository);
const controller = new ContactController(service);

router.post('/', validateContact, asyncHandler(controller.create));
router.get('/', validateContactQuery, asyncHandler(controller.getAll));

module.exports = router;
