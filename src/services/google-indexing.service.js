const { sign } = require('crypto');
const env = require('../config/env');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_INDEXING_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const GOOGLE_INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';
const REQUEST_TIMEOUT_MS = 10000;

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

class GoogleIndexingService {
  constructor(config = env.googleIndexing) {
    this.config = config;
    this.cachedToken = null;
  }

  isEligible(post) {
    if (!this.config.enabled || !post) return false;

    const endDate = String(post.endDate ?? '').slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return post.postStatus === 'PUBLISHED'
      && post.postType === 'JOB'
      && Boolean(String(post.organization || post.department || '').trim())
      && Boolean(String(post.stateName || '').trim())
      && Boolean(endDate)
      && endDate >= today;
  }

  publicUrl(slug) {
    return new URL(`/${encodeURIComponent(slug)}`, `${this.config.siteUrl}/`).toString();
  }

  async notify(post, type = 'URL_UPDATED') {
    if (!this.isEligible(post)) return false;
    await this.publish(this.publicUrl(post.postSlug), type);
    return true;
  }

  async notifyDeleted(post) {
    if (!this.isEligible(post)) return false;
    await this.publish(this.publicUrl(post.postSlug), 'URL_DELETED');
    return true;
  }

  async publish(url, type) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(GOOGLE_INDEXING_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Google Indexing API returned ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      // Publishing content must not fail because an optional crawl notification failed.
      console.error('[google-indexing]', error instanceof Error ? error.message : error);
    }
  }

  async getAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60) {
      return this.cachedToken.value;
    }

    const assertion = this.createAssertion(now);
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Google OAuth returned ${response.status}: ${await response.text()}`);
    }

    const payload = await response.json();
    if (!payload.access_token) throw new Error('Google OAuth response has no access token');

    this.cachedToken = {
      value: payload.access_token,
      expiresAt: now + Number(payload.expires_in || 3600),
    };
    return this.cachedToken.value;
  }

  createAssertion(now) {
    const header = encodeJson({ alg: 'RS256', typ: 'JWT' });
    const claims = encodeJson({
      iss: this.config.clientEmail,
      scope: GOOGLE_INDEXING_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    });
    const unsignedToken = `${header}.${claims}`;
    const signature = sign('RSA-SHA256', Buffer.from(unsignedToken), this.config.privateKey)
      .toString('base64url');
    return `${unsignedToken}.${signature}`;
  }
}

module.exports = new GoogleIndexingService();
module.exports.GoogleIndexingService = GoogleIndexingService;
