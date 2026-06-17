<<<<<<< HEAD

=======
<div align="center">

# SentinelAuth

**Production-grade Authentication & Authorization Service**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io)

*JWT · Refresh Token Rotation · RBAC · Audit Logging · Rate Limiting · Swagger Docs*

</div>

---

## What is SentinelAuth?

SentinelAuth is a **production-focused authentication service** built from scratch to demonstrate real-world backend security patterns — not just a tutorial app, but a system designed to handle auth the way production teams actually do it.

It covers the full auth lifecycle: registration, login, email verification, password management, session handling across devices, role-based access, and a centralized audit trail.

---

## Features

### Authentication
- Register, Login, Logout (single device & all devices)
- JWT Access Tokens + Refresh Token Rotation
- Multi-device session management

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
| `LOGOUT` | Session end |
| `PASSWORD_CHANGED` / `PASSWORD_RESET` | Credential updates |
| `EMAIL_VERIFIED` | Verification complete |
| `ACCOUNT_LOCKED` | Too many failed attempts |
| `REFRESH_ROTATED` | Token rotation |

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
| `GET` | `/api/users/me` | Get own profile |
| `GET` | `/api/admin/dashboard` | Admin-only route |
| `GET` | `/api/manager/dashboard` | Manager-only route |

Interactive docs available at `/api/docs` (Swagger UI).

---

## Database Schema

```
users                    — accounts, roles, lockout state
refresh_tokens           — active sessions per device
password_reset_tokens    — one-time reset links
email_verification_tokens — pending verifications
audit_logs               — full security event history
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Logging | Pino |
| Security | Helmet, CORS, express-rate-limit |
| Docs | Swagger / OpenAPI |

---

## Getting Started

```bash
git clone https://github.com/your-username/sentinel-auth.git
cd sentinel-auth
npm install
cp .env.example .env   # fill in your values
npm run dev
```

Visit `http://localhost:5173/api/docs` to explore the API.

---

## Environment Variables

```env
PORT=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
NODE_ENV=
```

---

## What I Learned Building This

- Designing a complete auth architecture end-to-end
- Secure JWT + refresh token rotation strategies
- Role-based middleware design patterns
- Audit logging as a first-class system concern
- Express security hardening in practice
- PostgreSQL schema design for auth systems

---

<div align="center">

Done for now.And more advanced auth features added in future...

</div>
>>>>>>> 553ec11 (New readme)
