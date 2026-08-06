<div align="center">

# SentinelAuth

**Production-grade Authentication & Authorization Service**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/sentinelauth?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/sentinelauth)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Jest](https://img.shields.io/badge/Tested_with-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io)

*JWT · Refresh Token Rotation · OAuth (Google & GitHub) · RBAC · Audit Logging · Rate Limiting · Swagger Docs · Integration Tested*

</div>

---

## What is SentinelAuth?

SentinelAuth is a **production-focused authentication service** built from scratch to demonstrate real-world backend security patterns — not just a tutorial app, but a system designed to handle auth the way production teams actually do it.

It covers the full auth lifecycle: registration, login, email verification, password management, session handling across devices, Google & GitHub OAuth, role-based access, and a centralized audit trail — backed by an integration test suite so every flow is verified, not just implemented.

---

## Features

### Authentication
- Register, Login, Logout (single device & all devices)
- JWT Access Tokens + Refresh Token Rotation (unique `jti` on every rotation)
- Multi-device session management
- Google & GitHub OAuth login (linkable to existing password accounts)

### Authorization
- Role-Based Access Control — `user`, `manager`, `admin`
- Protected routes with role-aware middleware

### Password Management
- Forgot Password / Reset via token
- Change Password (authenticated)
- bcrypt hashing + Zod strength validation

### Email Verification
- Verification tokens on register
- Login blocked until email is verified
- Resend verification endpoint

### Security Hardening
- Account lockout after failed login attempts
- Login attempt tracking
- Rate limiting (`express-rate-limit`)
- Helmet security headers
- CORS protection
- Environment variable validation
- Graceful shutdown handling

### Audit Logging
Centralized event tracking across the entire auth lifecycle:

| Event | Trigger |
|---|---|
| `REGISTER` | New user signup |
| `LOGIN` / `LOGIN_FAILED` | Auth attempts |
| `LOGOUT` / `LOGOUT_ALL_DEVICES` | Session end |
| `PASSWORD_CHANGED` | Password changed by user |
| `PASSWORD_RESET_REQUESTED` / `PASSWORD_RESET_COMPLETED` | Password reset flow |
| `EMAIL_VERIFIED` / `VERIFICATION_RESENT` | Email verification flow |
| `ACCOUNT_LOCKED` | Too many failed attempts |
| `REFRESH_TOKEN_ROTATED` | Token rotation |
| `OAUTH_LOGIN` | Google / GitHub login |

Each log captures: `userId · eventType · ipAddress · userAgent · metadata · timestamp`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login & get tokens |
| `POST` | `/api/auth/logout` | Revoke current session |
| `POST` | `/api/auth/logout-all` | Revoke all sessions |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token |
| `POST` | `/api/auth/forgot-password` | Request reset link |
| `POST` | `/api/auth/reset-password` | Reset via token |
| `POST` | `/api/auth/change-password` | Change (authenticated) |
| `POST` | `/api/auth/verify-email` | Verify email token |
| `POST` | `/api/auth/resend-verification` | Resend verification |
| `GET` | `/api/auth/google` | Start Google OAuth login |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `GET` | `/api/auth/github` | Start GitHub OAuth login |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/api/users/me` | Get own profile |
| `GET` | `/api/admin/dashboard` | Admin-only route |
| `GET` | `/api/manager/dashboard` | Manager-only route |

Interactive docs available at `/api-docs` (Swagger UI).

---

## Testing

The auth lifecycle is covered by an integration test suite using **Jest** and **Supertest**, hitting the real Express app and a test PostgreSQL database rather than mocking the auth logic away.

**Coverage includes:**
- Registration — success, duplicate email, weak password rejection
- Login — success, wrong credentials, unverified email block, account lockout after repeated failures
- Token flow — access/refresh issuance, refresh rotation, reuse of a revoked token
- Logout — single session and logout-all
- Password — forgot, reset, change password (valid + invalid/expired token cases)
- Email verification — verify, resend, login-block-until-verified
- OAuth — Google/GitHub redirect start, callback user creation/reuse/linking, unconfigured provider (503)
- RBAC — role-protected routes return 403 for insufficient roles, 200 for authorized roles
- Profile — authenticated user endpoint returns the current user
- Audit logging — key events are written on the corresponding action

Currently **69 tests across 16 suites**, with ~89% statement coverage.

**Running the tests:**

```bash
# run once
npm test

# watch mode
npm run test:watch

# with coverage report
npm run test:coverage
```

**Setup notes:**
- Tests run against a dedicated test database (`saas_auth_test` in `.env.test`) so nothing touches dev/prod data.
- Database state is cleared before every test, keeping tests independent.
- Supertest drives requests directly against the Express `app` instance — no server needs to be running.
- OAuth tests use placeholder credentials: the redirect tests only assert the provider URL, and the callback tests mock the provider strategies entirely.

```env
# .env.test
NODE_ENV=test
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_test_db_password
DB_NAME=saas_auth_test

JWT_SECRET=some-long-random-access-secret
JWT_REFRESH_SECRET=some-long-random-refresh-secret

GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback

GITHUB_CLIENT_ID=test-github-client-id
GITHUB_CLIENT_SECRET=test-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5173/api/auth/github/callback
```

---

## OAuth (Google & GitHub)

OAuth strategies are only registered when the matching environment variables are present.
If a provider's credentials are missing, its endpoints return `503 OAuth is not configured`.

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5173/api/auth/github/callback
```

On a successful OAuth login the service either creates a new user (with a random
password, so password login is not possible for OAuth-only accounts) or links the
provider to an existing account that already uses the same email.

---

## Database Schema

```
users                    — accounts, roles, lockout state, OAuth provider + provider_id
refresh_tokens           — active sessions per device
password_reset_tokens    — one-time reset links
email_verification_tokens — pending verifications
login_logs               — successful logins
failed_login_logs        — rejected login attempts
password_change_logs     — password update history
audit_logs               — full security event history
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt + Passport.js (Google & GitHub OAuth) |
| Validation | Zod |
| Logging | Pino |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Jest, Supertest |
| Docs | Swagger / OpenAPI |

---

## Getting Started

```bash
git clone https://github.com/Brijnandan11/Sentinel-Auth.git
cd Sentinel-Auth
npm install
cp .env.example .env   # fill in your values
npm run dev
```

Visit `http://localhost:3000/api-docs` to explore the API.

### Frontend (optional)

The React app lives in `frontend/` (Vite + TanStack Start). In dev the Vite server runs on `:5173` and proxies every `/api/*` request to the backend on `:3000`, so the browser only ever talks to one origin.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the page shows a live "api" status pill in the hero that hits `GET /api/health` through the proxy. Google/GitHub OAuth callback URLs stay on `:5173` and are forwarded to the backend by the same proxy.

To run the test suite, also copy `.env.test.example` to `.env.test` and point it at a disposable test database, then run `npm test`.

---

## Environment Variables

```env
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_REFRESH_SECRET=

# Optional - only set if you want OAuth login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
```

---

## What I Learned Building This

- Designing a complete auth architecture end-to-end
- Secure JWT + refresh token rotation strategies
- Role-based middleware design patterns
- Audit logging as a first-class system concern
- Express security hardening in practice
- PostgreSQL schema design for auth systems
- Writing integration tests that exercise real HTTP + DB behavior instead of mocking core logic away

---

<div align="center">

Actively maintained — more advanced auth features in progress.....

</div>
