# User Details API
Layered Node.js, Express, Sequelize, and MySQL API.

## Setup

1. Copy `.env.example` to `.env` and update the MySQL credentials and allowed production origin.
2. Install dependencies with `npm install`.
3. Create the configured database.
4. Run `npm run db:migrate`.
5. Start with `npm run dev` or `npm start`.

Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of trusted frontend origins.
For local development, the default is `http://localhost:3000`.

Production requires an `ADMIN_API_KEY` containing at least 32 characters. Send it as
`X-API-Key` or `Authorization: Bearer <key>` when calling administrative endpoints.
`/api/v1/posts`, `/api/v1/users`, `GET /api/contact`, and draft post listings are
protected. Published post listings, contact submission, and health checks remain public.

Traffic controls are configured with `RATE_LIMIT_*` and `CONTACT_RATE_LIMIT_*`.
JSON responses larger than 1 KB are compressed, and the MySQL pool is configured with
`DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_ACQUIRE_MS`, and `DB_POOL_IDLE_MS`.

## Endpoints

All endpoints are under `/api/v1/users`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` | Create a user |
| GET | `/?page=0&size=20&sortDir=desc` | List users by creation date |
| GET | `/:id` | Get one user |
| PUT | `/:id` | Update one or more user fields |
| DELETE | `/:id` | Delete a user |

Create request example:

```json
{
  "firstName": "Asha",
  "lastName": "Sharma",
  "email": "asha@example.com",
  "mobile": "+919876543210",
  "status": "active"
}
```

Successful responses use:

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

All route errors are forwarded to the centralized Express error middleware. Process-level
`uncaughtException` and `unhandledRejection` events are handled globally and trigger a
graceful HTTP server and database shutdown.

## Post CRUD

The post module mirrors the fields and business rules of the Java `Post` entity.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/posts` | Create a post |
| GET | `/api/v1/posts` | List posts with bounded pagination |
| GET | `/api/v1/posts/:postId` | Fetch by `POST-YYYY-#####` business ID |
| PUT | `/api/v1/posts/:postId` | Replace an existing post |
| DELETE | `/api/v1/posts/:postId` | Delete a post |

List query parameters are `search`, `postType`, `page` (0-based), `size` (maximum 100),
and `sortDir`. Post listings always sort by `startDate`; `sortDir` accepts `asc` or `desc`.

Post reads use a bounded in-memory TTL cache. Cache TTL, entry count, total bytes, and
maximum value bytes are configured through environment variables. Creating, updating,
or deleting a post invalidates all post-detail and post-listing entries to prevent stale
dependent data. The complete cache is also cleared on the configured interval (30
minutes by default).
Post read responses expose `X-Cache: HIT`, `X-Cache: MISS`, or `X-Cache: COALESCED`.
Concurrent misses for the same key share one database query. API responses use
`Cache-Control: private, no-store` so browsers and intermediary caches cannot retain
draft, user, or contact data; caching is controlled only by the backend.

Post-type listings at `/api/v1/jobs` require `postType` and accept an optional
`status=PUBLISHED` or `status=DRAFT` filter.

## Contact API

The contact module mirrors the Java Contact controller, service, repository, entity,
validation constraints, and response fields.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/contact` | Save a contact submission |
| GET | `/api/contact` | List contact submissions with bounded pagination |

The list accepts `page` (0-based), `size` (maximum 100), and `sortDir`.
User and contact listings always sort by `createdAt`; `sortDir` accepts `asc` or `desc`.
Contact submissions are not cached because they contain personal information, and this
module has no dependency on the application cache.
User listings are also intentionally excluded from the application cache.
