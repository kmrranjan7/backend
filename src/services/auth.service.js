const jwt = require('jsonwebtoken');
const ApiError = require('../utils/api-error');
const env = require('../config/env');
const { verifyPassword } = require('../utils/password');

class AuthService {
  constructor(userDetailsRepository) {
    this.repository = userDetailsRepository;
  }

  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.repository.findByEmailWithPassword(normalizedEmail);
    const passwordMatches = user
      ? await verifyPassword(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches || user.status !== 'active') {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { email: user.email, type: 'dashboard' },
      env.adminApiKey,
      {
        algorithm: 'HS256',
        subject: String(user.id),
        issuer: 'sarkari-global-result-api',
        audience: 'sarkari-global-result-dashboard',
        expiresIn: env.auth.tokenTtl,
      },
    );

    return {
      token,
      expiresIn: env.auth.cookieMaxAgeSeconds,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }
}

module.exports = AuthService;
