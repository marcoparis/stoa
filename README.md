# Book Reviews API

A REST API for an online bookshop built with Node.js and Express. Anyone can browse and search the catalog; registered users can log in and add, edit or delete their own reviews.

- **Live API:** https://expressbookreviews.onrender.com
- **Interactive docs (Swagger UI):** https://expressbookreviews.onrender.com/api-docs

> Hosted on Render's free tier: the first request after a period of inactivity can take ~30–60 s while the service wakes up.

## Features

- Book catalog with lookup by ISBN and **case-insensitive, partial search** by author and title
- User registration with input validation and **bcrypt-hashed passwords**
- Login issuing a **JWT** (HS256, 1 h expiry), accepted either as `Authorization: Bearer <token>` or through an **HTTP-only session cookie**
- Authenticated users can add/update and delete **only their own** reviews
- **OpenAPI 3 documentation** with Swagger UI to try every endpoint from the browser
- Consistent JSON responses, JSON 404s for unknown routes and a central error handler
- **Automated tests** (Jest + Supertest) covering the public endpoints, auth and the review flow

## Tech stack

| Area | Tools |
| --- | --- |
| Runtime / framework | Node.js, Express 4 |
| Authentication | jsonwebtoken (JWT), express-session, bcryptjs |
| API documentation | OpenAPI 3, swagger-ui-express |
| Testing | Jest, Supertest |
| Deployment | Render (`render.yaml` blueprint) |

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | – | List all books |
| GET | `/isbn/:isbn` | – | Get a book by ISBN |
| GET | `/author/:author` | – | Search books by author |
| GET | `/title/:title` | – | Search books by title |
| GET | `/review/:isbn` | – | Get the reviews of a book |
| POST | `/register` | – | Register (`{ "username", "password" }`) |
| POST | `/customer/login` | – | Log in, returns `{ token }` and sets the session cookie |
| POST | `/customer/logout` | – | Destroy the session |
| PUT | `/customer/auth/review/:isbn` | ✔ | Add or update your review (`?review=...` or JSON `{ "review" }`) |
| DELETE | `/customer/auth/review/:isbn` | ✔ | Delete your review |

### Example

```bash
BASE=https://expressbookreviews.onrender.com

curl -X POST $BASE/register -H "Content-Type: application/json" \
     -d '{"username":"mario","password":"secret123"}'

TOKEN=$(curl -s -X POST $BASE/customer/login -H "Content-Type: application/json" \
     -d '{"username":"mario","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -X PUT "$BASE/customer/auth/review/1" -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" -d '{"review":"A timeless classic"}'

curl $BASE/review/1
```

## Project structure

```
final_project/
├── index.js            # starts the HTTP server
├── app.js              # Express app: middleware, routes, docs, error handling
├── config.js           # port and secrets from environment variables
├── router/
│   ├── general.js      # public routes: books, search, reviews, registration
│   ├── auth_users.js   # login/logout, JWT auth middleware, review CRUD
│   └── booksdb.js      # seed data
├── docs/openapi.js     # OpenAPI 3 specification
└── tests/api.test.js   # Jest + Supertest integration tests
```

`app.js` is separated from `index.js` so the tests can exercise the whole app in memory without opening a port.

## Running locally

Requires Node.js 22+.

```bash
cd final_project
npm install
cp .env.example .env   # optional: set JWT_SECRET and SESSION_SECRET
npm run dev            # http://localhost:5000, docs at /api-docs
npm test
```

If the secrets are not set, random ones are generated at startup (tokens then stay valid only until the process restarts). On Render they are generated once by the `render.yaml` blueprint.

## Limitations and next steps

- Users and reviews are kept **in memory**, so they reset when the server restarts. The next step would be a database (e.g. PostgreSQL with an ORM) behind the same route handlers.
- Sessions use the default in-memory store; with a database, a persistent session store (or JWT-only auth) would be used instead.
- Rate limiting on `/customer/login` would be needed before real-world use.
