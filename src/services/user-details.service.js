const ApiError = require('../utils/api-error');
const { hashPassword } = require('../utils/password');

class UserDetailsService {
  constructor(userDetailsRepository) {
    this.repository = userDetailsRepository;
  }

  async create(payload) {
    const normalizedPayload = await this.normalize(payload);
    const existingUser = await this.repository.findByEmail(normalizedPayload.email);

    if (existingUser) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    return this.repository.create(normalizedPayload);
  }

  async getAll({ page, limit }) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.findAll({ limit, offset });

    return {
      users: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getById(id) {
    return this.getExistingUser(id);
  }

  async update(id, payload) {
    const user = await this.getExistingUser(id);
    const normalizedPayload = await this.normalize(payload);

    if (normalizedPayload.email && normalizedPayload.email !== user.email) {
      const userWithEmail = await this.repository.findByEmail(normalizedPayload.email);

      if (userWithEmail) {
        throw new ApiError(409, 'A user with this email already exists');
      }
    }

    return this.repository.update(user, normalizedPayload);
  }

  async delete(id) {
    const user = await this.getExistingUser(id);
    await this.repository.delete(user);
  }

  async getExistingUser(id) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  async normalize(payload) {
    const normalized = { ...payload };

    if (normalized.firstName) normalized.firstName = normalized.firstName.trim();
    if (normalized.lastName) normalized.lastName = normalized.lastName.trim();
    if (normalized.email) normalized.email = normalized.email.trim().toLowerCase();
    if (normalized.mobile) normalized.mobile = normalized.mobile.trim();
    if (normalized.status) normalized.status = normalized.status.trim().toLowerCase();
    if (normalized.password) {
      normalized.passwordHash = await hashPassword(normalized.password);
      delete normalized.password;
    }

    return normalized;
  }
}

module.exports = UserDetailsService;
