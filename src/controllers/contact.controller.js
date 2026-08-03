const { successResponse } = require('../utils/api-response');

class ContactController {
  constructor(contactService) {
    this.service = contactService;
  }

  create = async (req, res) => {
    const contact = await this.service.create(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Contact saved successfully',
      data: contact,
    });
  };

  getAll = async (req, res) => {
    const result = await this.service.getAll(req.query);
    res.set('X-Cache', result.status);
    return successResponse(res, {
      message: 'Contacts fetched successfully',
      data: result.value,
    });
  };
}

module.exports = ContactController;
