# Stoà – Recensioni di filosofia e psicologia

**Stoà** is a full-stack review site for philosophy and psychology books: Marcus Aurelius, Seneca and the Stoics, Plato and Epicurus, Kant, Schopenhauer, Nietzsche, the existentialists and classics of psychology such as Frankl, Jung, Freud and Kahneman.

It is made of a **REST API** built with Node.js and Express and a **React web app** that consumes it. Anyone can browse the catalog, filter it by school of thought and search by title or author; registered users can log in and add, edit or delete their own reviews.

- **Web app:** https://marcoparis.github.io/stoa/
- **API:** https://expressbookreviews-xlyg.onrender.com
- **Interactive API docs (Swagger UI):** https://expressbookreviews-xlyg.onrender.com/api-docs

> The API is hosted on Render's free tier: the first request after a period of inactivity can take ~30–60 s while the service wakes up (the web app shows a notice meanwhile).

## Architecture

```
┌────────────────────────┐   HTTPS + JSON    ┌────────────────────────┐
│ React app (frontend/)  │ ────────────────▶ │ Express API            │
│ GitHub Pages           │  Bearer JWT, CORS │ (backend/)             │
└────────────────────────┘ ◀──────────────── │ Render                 │
                                             └────────────────────────┘
```

The two parts are deployed independently. The browser app authenticates with the JWT returned at login (sent as `Authorization: Bearer`), and the API only accepts cross-origin requests from the allowed origins (`CORS_ORIGINS`).

## Web app (frontend/)

- Catalog of 18 books with generated covers (coloured by school of thought), year, description and review counts
- Filter by category (Stoicism, ancient philosophy, modern philosophy, existentialism, psychology), kept in the URL
- Search by title or author (the search is kept in the URL, so results can be shared or bookmarked)
- Book page with all reviews; your own review is highlighted and can be written, edited or deleted
- Registration and login, session kept in `localStorage` until the token expires; an expired session logs you out cleanly
- Loading states, a notice while the free server wakes up, error messages from the API, responsive layout

| Area | Tools |
| --- | --- |
| UI | React 19, React Router (HashRouter for GitHub Pages), lucide-react icons, CSS |
| State | React Context for authentication, component state for data fetching |
| Build / lint | Vite, oxlint |
| Testing | Vitest, React Testing Library, jsdom |
| Deployment | GitHub Pages (`gh-pages`) |

```
frontend/src/
├── api.js                 # fetch wrapper: base URL, JSON, Bearer token, ApiError
├── auth/                  # AuthProvider (login/register/logout, token persistence) + useAuth hook
├── components/            # Header with search, BookCover, Loading
├── pages/                 # BookList, BookDetail, AuthForm (login + register)
└── test/                  # API client and UI tests
```

## API features (backend/)

- Book catalog (author, title, category, year, description, sample reviews) with lookup by ISBN and **case-insensitive, partial search** by author and title
- User registration with input validation and **bcrypt-hashed passwords**
- Login issuing a **JWT** (HS256, 1 h expiry), accepted either as `Authorization: Bearer <token>` or through an **HTTP-only session cookie**
- Authenticated users can add/update and delete **only their own** reviews
- **OpenAPI 3 documentation** with Swagger UI to try every endpoint from the browser
- Consistent JSON responses, JSON 404s for unknown routes and a central error handler
- **Automated tests** (Jest + Supertest) covering the public endpoints, auth and the review flow

## Tech stack

| Area | Tools |
| --- | --- |
| Runtime / framework | Node.js, Express 4, cors |
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
BASE=https://expressbookreviews-xlyg.onrender.com

curl -X POST $BASE/register -H "Content-Type: application/json" \
     -d '{"username":"mario","password":"secret123"}'

TOKEN=$(curl -s -X POST $BASE/customer/login -H "Content-Type: application/json" \
     -d '{"username":"mario","password":"secret123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

curl -X PUT "$BASE/customer/auth/review/1" -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" -d '{"review":"A timeless classic"}'

curl $BASE/review/1
```

## API project structure

```
backend/
├── index.js            # starts the HTTP server
├── app.js              # Express app: middleware, routes, docs, error handling
├── config.js           # port and secrets from environment variables
├── router/
│   ├── general.js      # public routes: books, search, reviews, registration
│   ├── auth_users.js   # login/logout, JWT auth middleware, review CRUD
│   └── booksdb.js      # seed data: 18 books and a few sample reviews
├── docs/openapi.js     # OpenAPI 3 specification
└── tests/api.test.js   # Jest + Supertest integration tests
```

`app.js` is separated from `index.js` so the tests can exercise the whole app in memory without opening a port.

## Running locally

Requires Node.js 22+. Start the API and the web app in two terminals:

```bash
cd backend
npm install
cp .env.example .env   # optional: JWT_SECRET, SESSION_SECRET, CORS_ORIGINS
npm run dev            # http://localhost:5000, docs at /api-docs
npm test
```

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (talks to localhost:5000)
npm test
npm run deploy         # build and publish to GitHub Pages
```

The web app uses the Render API in production builds and `http://localhost:5000` in development; set `VITE_API_URL` to point it elsewhere.

If the secrets are not set, random ones are generated at startup (tokens then stay valid only until the process restarts). On Render they are generated once by the `render.yaml` blueprint.

## Limitations and next steps

- Users and reviews are kept **in memory**, so they reset when the server restarts. The next step would be a database (e.g. PostgreSQL with an ORM) behind the same route handlers.
- Sessions use the default in-memory store; with a database, a persistent session store (or JWT-only auth) would be used instead.
- Rate limiting on `/customer/login` would be needed before real-world use.
