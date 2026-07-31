const UserDetails = require('../models/user-details.model');

class UserDetailsRepository {
  async create(payload) {
    return UserDetails.create(payload);
  }

  async findAll({ limit, offset, sortDir }) {
    return UserDetails.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', sortDir]],
    });
  }

  async findById(id) {
    return UserDetails.findByPk(id);
  }

  async findByEmail(email) {
    return UserDetails.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email) {
    return UserDetails.scope(null).findOne({ where: { email } });
  }

  async update(user, payload) {
    return user.update(payload);
  }

  async delete(user) {
    return user.destroy();
  }
}

module.exports = UserDetailsRepository;
