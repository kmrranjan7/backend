const Contact = require('../models/contact.model');

class ContactRepository {
  async create(payload) {
    return Contact.create(payload);
  }

  async findAll({ limit, offset, sortBy, sortDir }) {
    return Contact.findAndCountAll({
      limit,
      offset,
      order: [[sortBy, sortDir]],
    });
  }
}

module.exports = ContactRepository;
