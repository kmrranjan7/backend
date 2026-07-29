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
    const contacts = await this.service.getAll(req.query);
    return successResponse(res, {
      message: 'Contacts fetched successfully',
      data: contacts,
    });
  };
}

module.exports = ContactController;
