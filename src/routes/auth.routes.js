const router = require('express').Router();
const UserDetailsRepository = require('../repositories/user-details.repository');
const AuthService = require('../services/auth.service');
const AuthController = require('../controllers/auth.controller');
const asyncHandler = require('../middleware/async-handler');
const { loginLimiter } = require('../middleware/rate-limit.middleware');
const { validateLogin } = require('../validations/auth.validation');
const { requireAdmin } = require('../middleware/admin-auth.middleware');

const repository = new UserDetailsRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

router.post('/login', loginLimiter, validateLogin, asyncHandler(controller.login));
router.get('/session', requireAdmin, asyncHandler(controller.session));

module.exports = router;
