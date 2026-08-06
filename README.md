SentinelAuth
A minimal, production-focused authentication and authorization service. Built with Node.js, Express, and PostgreSQL.

What it does

* Full auth lifecycle — register, login, logout (single device or all devices)
* JWT access tokens with refresh token rotation (unique `jti` on every rotation)
* Google & GitHub OAuth login, linkable to existing password accounts
* Role-based access control — `user`, `manager`, `admin`
* Email verification, password reset, and authenticated password change
* Account lockout after repeated failed logins, with rate limiting and Helmet security headers
* Centralized audit log across the entire auth lifecycle (login, logout, password changes, token rotation, OAuth events, etc.)
* Integration tested — 69 tests across 16 suites against a real Express app and test database

Installation

```
git clone https://github.com/Brijnandan11/Sentinel-Auth.git
cd Sentinel-Auth
npm install
cp .env.example .env   # fill in your values
```

Requirements

* Node.js
* PostgreSQL
* (Optional) Google/GitHub OAuth credentials — only needed if you want OAuth login

Running

```
# Dev
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

Visit `http://localhost:3000/api-docs` for interactive Swagger docs.

Frontend (optional)
A React app (Vite + TanStack Start) lives in `frontend/`. It runs on `:5173` and proxies all `/api/*` requests to the backend on `:3000`, so the browser only ever talks to one origin. OAuth callback URLs stay on `:5173` and are forwarded through the same proxy.

```
cd frontend
npm install
npm run dev
```

Security

* Passwords are hashed with bcrypt; strength is validated with Zod.
* OAuth strategies (Google, GitHub) are only registered when their environment variables are present — otherwise those endpoints return `503`.
* OAuth-created accounts get a random password, so password login is disabled for OAuth-only accounts until a password is set.
* Refresh tokens rotate on every use; reuse of a revoked token is detected and rejected.
* Every security-relevant event (login, logout, password change, token rotation, OAuth login, account lockout) is written to a centralized audit log with `userId`, `eventType`, `ipAddress`, `userAgent`, and `timestamp`.

Why OAuth credentials aren't required
The service works fully on email/password auth out of the box. Google and GitHub OAuth are opt-in — set the corresponding environment variables to enable them, or leave them unset and those routes simply stay disabled.

Project structure

```
src/
  routes/       # Auth, user, admin, manager routes
  middleware/   # Auth guards, RBAC, rate limiting
  services/     # Business logic (tokens, OAuth, audit logging)
  db/           # PostgreSQL schema and queries
tests/          # Jest + Supertest integration suite
```

Tech stack

* Node.js + Express.js
* PostgreSQL
* JWT + bcrypt + Passport.js (Google & GitHub OAuth)
* Zod (validation) + Pino (logging)
* Helmet, CORS, express-rate-limit
* Jest + Supertest
* Swagger / OpenAPI