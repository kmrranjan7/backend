const { successResponse } = require('../utils/api-response');

class AuthController {
  constructor(authService) {
    this.service = authService;
  }

  login = async (req, res) => {
    const result = await this.service.login(req.body);
    return successResponse(res, {
      message: 'Login successful',
      data: result,
    });
  };

  session = async (req, res) => successResponse(res, {
    message: 'Session is valid',
    data: {
      id: req.admin.sub,
      email: req.admin.email,
    },
  });
}

module.exports = AuthController;
