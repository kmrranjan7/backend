# User Details API
npm run db:migrate

POST   http://localhost:3000/api/v1/users
GET    http://localhost:3000/api/v1/users
GET    http://localhost:3000/api/v1/users/1
PUT    http://localhost:3000/api/v1/users/1
DELETE http://localhost:3000/api/v1/users/1

GET http://localhost:3000/api/v1/users?page=1&limit=20
Layered Node.js, Express, Sequelize, and MySQL API.

## Setup

1. Copy `.env.example` to `.env` and update the MySQL credentials.
2. Install dependencies with `npm install`.
3. Create the configured database.
4. Run `npm run db:migrate`.
5. Start with `npm run dev` or `npm start`.

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
