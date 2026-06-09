# 🔐 Sentinel Auth

## Production-Grade Authentication & Authorization Service

A battle-hardened authentication and authorization microservice built with real-world security practices — JWT token pairs, RBAC, brute-force protection, structured logging, and layered input validation.

**Features · Tech Stack · Getting Started · API Reference · Project Structure · Coming Soon**

---

## 🧭 Overview

Sentinel Auth is a production-oriented Auth service designed to serve as the security backbone of modern SaaS applications.

It goes beyond basic login flows — implementing the full authentication lifecycle with refresh token rotation, role-based authorization, account lockout defense, rate limiting, and structured audit logging.

This project demonstrates what a real backend engineer would ship in a professional environment: clean architecture, layered security, and observability from day one.

---

# ✨ Features

## 🔑 Authentication

* User registration & login
* JWT Access Tokens (short-lived) + JWT Refresh Tokens (long-lived)
* Secure password hashing via bcrypt
* Token verification middleware

## 🛡️ Authorization

* Role-Based Access Control (RBAC)
* Protected route middleware
* Admin-only endpoint enforcement

## 🔒 Security

* Account lockout after N failed login attempts (brute-force defense)
* Rate limiting on sensitive endpoints
* Password strength enforcement (uppercase, lowercase, digits, special chars)
* Input sanitization & validation via Zod
* Secure token storage and invalidation

## 🗄️ Database

* PostgreSQL integration with structured schema
* Refresh token persistence and revocation
* Login attempt tracking per user
* User management with role assignments

## 📋 Logging & Observability

* Structured JSON logging via Pino
* Login success/failure events
* Security event tracking (lockouts, invalid tokens)
* Request-level traceability

## 🏗️ Architecture

* Clean separation: Controllers → Routes → Middlewares → Utils
* Centralized schema validation layer
* Config-driven environment management
* Modular, extensible design

---

# 🛠️ Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Runtime    | Node.js 18+                    |
| Framework  | Express.js                     |
| Database   | PostgreSQL 15+                 |
| Auth       | JWT (Access + Refresh), bcrypt |
| Validation | Zod                            |
| Logging    | Pino                           |
| Dev Tools  | Nodemon, Postman, DBeaver      |

---

# 🚀 Getting Started

## Prerequisites

* Node.js >= 18.x
* PostgreSQL >= 15.x
* npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sentinel-auth.git

cd sentinel-auth
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

### 4. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE sentinel_auth;"

npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file in the root directory:

## Server

```env
PORT=3000
NODE_ENV=development
```

## Database

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sentinel_auth
DB_USER=postgres
DB_PASSWORD=your_password
```

## JWT

```env
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

## Security

```env
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ Never commit your `.env` file. Use `.env.example` for documentation.

---

# 📡 API Reference

## Auth Endpoints

| Method | Endpoint           | Description                  | Auth Required |
| ------ | ------------------ | ---------------------------- | ------------- |
| POST   | /api/auth/register | Register a new user          | ❌             |
| POST   | /api/auth/login    | Login and receive token pair | ❌             |
| POST   | /api/auth/refresh  | Refresh access token         | ❌             |

---

## Protected Endpoints

| Method | Endpoint          | Description                    | Role        |
| ------ | ----------------- | ------------------------------ | ----------- |
| GET    | /api/user/profile | Get authenticated user profile | user, admin |
| GET    | /api/admin/users  | List all users                 | admin       |

---

## Sample Request — Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

---

## Sample Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

---

# 📂 Project Structure

```text
sentinel-auth/
├── src/
│   ├── config/          # Environment & app configuration
│   ├── controllers/     # Route handler logic
│   ├── middlewares/     # Auth, RBAC, rate limiting, error handling
│   ├── routes/          # API route definitions
│   ├── schemas/         # Zod validation schemas
│   ├── utils/           # JWT helpers, password utils, logger
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🔐 Authentication Flow

```text
Client                    Server                    Database

  │                          │                           │
  │──── POST /register ─────▶│                           │
  │                          │──── Hash password ──────▶│
  │                          │                           │
  │                          │◀─── User created ────────│
  │◀─── 201 Created ─────────│                           │

  │                          │                           │

  │──── POST /login ─────────▶│                          │
  │                           │──── Verify credentials ─▶│
  │                           │◀─── User record ─────────│
  │                           │──── Generate tokens      │
  │                           │──── Store refresh ──────▶│
  │◀─── Access + Refresh ────│                           │

  │                          │                           │

  │──── GET /protected ─────▶│                           │
  │    [Bearer AccessToken]  │                           │
  │                          │──── Verify JWT           │
  │                          │──── Check RBAC          │
  │◀─── 200 OK ─────────────│                           │
```

---

# 🛡️ Security Architecture

## Account Lockout

After `MAX_LOGIN_ATTEMPTS` consecutive failures, the account is temporarily locked for `LOCKOUT_DURATION_MINUTES` minutes.

All subsequent attempts are rejected with a `423 Locked` response until the lock period expires.

---

## Token Strategy

| Token         | Lifetime   | Storage              | Purpose              |
| ------------- | ---------- | -------------------- | -------------------- |
| Access Token  | 15 minutes | Memory / Header      | API authorization    |
| Refresh Token | 7 days     | DB + HttpOnly Cookie | Access token renewal |

---

## Password Policy

Passwords must contain:

* Minimum 8 characters
* At least one uppercase letter `[A-Z]`
* At least one lowercase letter `[a-z]`
* At least one digit `[0-9]`
* At least one special character `[!@#$%^&*]`

---

# ✅ Completed

* ☒ User Registration & Login
* ☒ JWT Access + Refresh Token System
* ☒ Authentication Middleware
* ☒ RBAC Authorization Middleware
* ☒ Account Lockout Protection
* ☒ Rate Limiting
* ☒ Input Validation (Zod)
* ☒ Structured Logging (Pino)
* ☒ PostgreSQL Integration

---

# 🚧 Coming Soon

## 🔜 Next Up

* Logout & Token Revocation
* Refresh Token Rotation
* Password Reset via Email

## 📬 Upcoming

* Email Verification
* Login History
* Audit Logs

## 📦 Infrastructure

* Swagger / OpenAPI Docs
* Docker Support
* Unit & Integration Tests
* Production Deployment Config

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch:

   ```bash
   git checkout -b feat/your-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push to the branch:

   ```bash
   git push origin feat/your-feature
   ```
5. Open a Pull Request

---

# 📄 License

Distributed under the MIT License.

See LICENSE for more information.

---

Built with 🔐 by a backend engineer serious about security.

⭐ Star this repo if you find it useful!
