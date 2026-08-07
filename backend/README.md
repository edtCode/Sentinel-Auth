# SentinelAuth

[![npm version](https://img.shields.io/npm/v/sentinelauth)](https://www.npmjs.com/package/sentinelauth)

Production-focused authentication & authorization service built with Node.js, Express, and PostgreSQL. Covers the full auth lifecycle — registration, login, email verification, password management, multi-device sessions, OAuth, RBAC, and audit logging — backed by an integration test suite so every flow is verified, not just implemented.

## Install

```bash
npm i sentinelauth
```

## Tech Stack

- Node.js + Express — API server
- PostgreSQL — user, session, and audit persistence
- JWT — access tokens, with refresh token rotation
- Passport.js — Google & GitHub OAuth
- Zod — request/schema validation
- Pino — structured logging
- Jest + Supertest — integration tests

## How It Works

1. User registers with name, email, and password (or logs in via Google/GitHub OAuth).
2. Login is blocked until the email is verified; a verification token is emailed on register.
3. On successful login, an access token (JWT) and a refresh token are issued; the refresh token is stored per-device.
4. Every refresh rotates the token and assigns a new `jti` — reuse of a revoked token is detected and rejected.
5. Role-aware middleware (`user` / `manager` / `admin`) protects routes based on the JWT's role claim.
6. Every security-relevant action — login, logout, password change, token rotation, OAuth login, lockout — is written to a centralized audit log.

## Auth Flows & Payloads

### Register
```json
{
  "name": "test",
  "email": "test@test.com",
  "password": "StrongPass123!"
}
```

### Login
```json
{
  "email": "test@test.com",
  "password": "StrongPass123!"
}
```

### OAuth (Google / GitHub)
Redirect-based — hit `/api/auth/google` or `/api/auth/github` directly in the browser. Returns `503` if that provider's credentials aren't configured. On success, either creates a new user or links the provider to an existing account with the same email.

## Schema

- **users** — id (UUID), name, email (unique), password (bcrypt, nullable for OAuth-only), role, is_verified, oauth_provider, oauth_provider_id, failed_login_count, locked_until, timestamps
- **refresh_tokens** — id, user_id (FK), jti, device/user-agent, revoked, timestamps
- **email_verification_tokens** — id, user_id (FK), token, expires_at
- **password_reset_tokens** — id, user_id (FK), token, expires_at
- **audit_logs** — id, user_id (FK), event_type, ip_address, user_agent, metadata (JSONB), timestamp

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns access + refresh tokens |
| POST | `/api/auth/logout` | Yes | Revoke current session |
| POST | `/api/auth/logout-all` | Yes | Revoke all sessions |
| POST | `/api/auth/refresh-token` | No | Rotate refresh token |
| POST | `/api/auth/forgot-password` | No | Request reset link |
| POST | `/api/auth/reset-password` | No | Reset via token |
| POST | `/api/auth/change-password` | Yes | Change password |
| POST | `/api/auth/verify-email` | No | Verify email token |
| POST | `/api/auth/resend-verification` | No | Resend verification email |
| GET | `/api/auth/google` | No | Start Google OAuth |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/auth/github` | No | Start GitHub OAuth |
| GET | `/api/auth/github/callback` | No | GitHub OAuth callback |
| GET | `/api/users/me` | Yes | Get own profile |
| GET | `/api/admin/dashboard` | Yes (admin) | Admin-only route |
| GET | `/api/manager/dashboard` | Yes (manager) | Manager-only route |

Interactive docs at `/api-docs` (Swagger UI).

## CURL Examples

```bash
# Register
curl -X POST localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "email": "test@test.com", "password": "StrongPass123!"}'

# Login (save the tokens)
curl -X POST localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "StrongPass123!"}'

# Get own profile
curl -X GET localhost:3000/api/users/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Rotate refresh token
curl -X POST localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<REFRESH_TOKEN>"}'

# Logout everywhere
curl -X POST localhost:3000/api/auth/logout-all \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Setup

```bash
git clone https://github.com/Brijnandan11/Sentinel-Auth.git
cd Sentinel-Auth
npm install
```

### Environment

```bash
cp .env.example .env
# fill in DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
# JWT_SECRET, JWT_REFRESH_SECRET
# (optional) GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET

# then start the server
npm run dev
```

For tests, also copy `.env.test.example` to `.env.test` pointed at a disposable test database, then run:

```bash
npm test
```