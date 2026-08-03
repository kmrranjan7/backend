const { successResponse } = require('../utils/api-response');

class UserDetailsController {
  constructor(userDetailsService) {
    this.service = userDetailsService;
  }

  create = async (req, res) => {
    const user = await this.service.create(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    });
  };

  getAll = async (req, res) => {
    const result = await this.service.getAll(req.query);
    res.set('X-Cache', result.status);
    return successResponse(res, {
      message: 'Users retrieved successfully',
      data: result.value,
    });
  };

  getById = async (req, res) => {
    const result = await this.service.getById(req.params.id);
    res.set('X-Cache', result.status);
    return successResponse(res, {
      message: 'User retrieved successfully',
      data: result.value,
    });
  };

  update = async (req, res) => {
    const user = await this.service.update(req.params.id, req.body);
    return successResponse(res, {
      message: 'User updated successfully',
      data: user,
    });
  };

  delete = async (req, res) => {
    await this.service.delete(req.params.id);
    return successResponse(res, {
      message: 'User deleted successfully',
      data: null,
    });
  };
}

module.exports = UserDetailsController;
