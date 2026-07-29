# User Details API
Layered Node.js, Express, Sequelize, and MySQL API.

## Setup

1. Copy `.env.example` to `.env` and update the MySQL credentials.
2. Install dependencies with `npm install`.
3. Create the configured database.
4. Run `npm run db:migrate`.
5. Start with `npm run dev` or `npm start`.

Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of trusted frontend origins.
For local development, the default is `http://localhost:3000`.

## Endpoints

All endpoints are under `/api/v1/users`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` | Create a user |
| GET | `/?page=1&limit=20` | List users |
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
`sortBy`, and `sortDir`.

Post reads use a bounded in-memory TTL cache. Cache TTL, entry count, total bytes, and
maximum value bytes are configured through environment variables. Creating, updating,
or deleting a post clears the complete in-memory cache to prevent stale dependent data.
The complete cache is also cleared on the configured interval (30 minutes by default).

## Contact API

The contact module mirrors the Java Contact controller, service, repository, entity,
validation constraints, and response fields.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/contact` | Save a contact submission |
| GET | `/api/contact` | List contact submissions with bounded pagination |

The list accepts `page` (0-based), `size` (maximum 100), `sortBy`, and `sortDir`.
Contact submissions are not cached because they contain personal information, and this
module has no dependency on the application cache.
