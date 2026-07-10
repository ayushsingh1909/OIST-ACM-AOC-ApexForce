# ACIE – Authentication & User Management Module

## 1. Module Overview

This is **Module 1** of the AI Career Intelligence Engine (ACIE) platform. It provides a complete, secure authentication and session management foundation upon which every other ACIE module depends.

**Core capabilities:**
- User registration and login with hashed passwords (bcrypt)
- JWT-based stateless authentication using dual token strategy (short-lived access token + long-lived refresh token via HTTP-only cookies)
- Forgot / Reset password via email token link
- Role-based access control (student / admin)
- Zod-powered request validation
- Axios API client on the frontend with automatic token refresh and auto-logout on session expiry
- Fully responsive React UI with dark-mode glassmorphism design (Tailwind CSS v4)

---

## 2. Folder Structure

### Backend (`backend/`)

```
backend/
├── index.js                        # Entry point – DB connect → HTTP server start
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment variable template
└── src/
    ├── app.js                      # Express app configuration, middleware, routes
    ├── config/
    │   └── db.config.js            # Mongoose connection logic
    ├── models/
    │   └── user.model.js           # Mongoose User schema + bcrypt hooks
    ├── services/
    │   ├── token.service.js        # JWT generation/verification + reset token hashing
    │   ├── email.service.js        # Nodemailer SMTP email sender
    │   └── auth.service.js         # Core business logic (register, login, reset, etc.)
    ├── controllers/
    │   └── auth.controller.js      # HTTP request handlers (thin layer over services)
    ├── middleware/
    │   ├── auth.middleware.js      # protect (JWT guard) + authorizeRoles (RBAC)
    │   └── validation.js           # Zod schema validation middleware
    ├── routes/
    │   └── auth.route.js           # Auth router mapping routes → controllers
    └── utils/
        └── errors.js               # AppError class + catchAsync wrapper
```

### Frontend (`frontend/src/`)

```
src/
├── App.jsx                         # Root app – BrowserRouter, AuthProvider, Toaster, routes
├── index.css                       # Tailwind CSS v4 import + design tokens
├── main.jsx                        # React DOM entry point
├── context/
│   └── AuthContext.jsx             # Auth state, login/register/logout/updateProfile
├── services/
│   └── api.js                      # Axios instance, interceptors, token refresh logic
├── components/
│   └── auth/
│       └── ProtectedRoute.jsx      # Route guard (redirects unauthenticated users)
└── pages/
    ├── auth/
    │   ├── Login.jsx               # Login form
    │   ├── Register.jsx            # Registration form + role selector + strength meter
    │   ├── ForgotPassword.jsx      # Email input + success state
    │   └── ResetPassword.jsx       # Token-from-URL + new password form
    └── ProfileSettings.jsx         # Tabbed profile/password update page
```

---

## 3. API Documentation

All endpoints are prefixed with `/api/auth`. Successful responses follow:

```json
{ "success": true, "message": "...", "data": { ... } }
```

Error responses follow:

```json
{ "success": false, "message": "..." }
```

---

### POST `/api/auth/register`

Registers a new user and returns JWT tokens.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "pass12",
  "role": "student"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | min 2 chars |
| email | string | ✅ | valid email format |
| password | string | ✅ | min 6 chars, 1 letter + 1 number |
| role | enum | ❌ | `student` \| `admin` (default: student) |

**Success Response: `201 Created`**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "student" },
    "accessToken": "<jwt_access_token>"
  }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Validation error (field-level messages) |
| 400 | Email is already registered |

---

### POST `/api/auth/login`

Authenticates a user and issues JWT tokens.

**Request Body:**
```json
{ "email": "jane@example.com", "password": "pass12" }
```

**Success Response: `200 OK`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { ... }, "accessToken": "<jwt_access_token>" }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Validation error |
| 401 | Invalid email or password |
| 403 | Account is deactivated |

> Refresh token is set as an HTTP-only `refreshToken` cookie on both register and login.

---

### POST `/api/auth/logout`

Clears the `accessToken` and `refreshToken` cookies.

**Request:** No body required.

**Success Response: `200 OK`**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### POST `/api/auth/refresh-token`

Issues new access and refresh tokens using the current refresh token (from cookie or request body).

**Request Body (optional if using cookies):**
```json
{ "refreshToken": "<refresh_token>" }
```

**Success Response: `200 OK`**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": { "accessToken": "<new_access_token>" }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Refresh token is required |
| 401 | Invalid or expired refresh token |

---

### POST `/api/auth/forgot-password`

Generates a reset token and emails a recovery link. Always returns 200 to prevent user enumeration.

**Request Body:**
```json
{ "email": "jane@example.com" }
```

**Success Response: `200 OK`**
```json
{
  "success": true,
  "message": "If a user with that email exists, a password reset link has been sent."
}
```

> In development, if SMTP credentials are missing, the reset link is printed to the **Node.js console**.

---

### POST `/api/auth/reset-password`

Resets the user's password using the token from the recovery email link.

**Request Body:**
```json
{ "token": "<clear_reset_token>", "password": "newpass123" }
```

**Success Response: `200 OK`**
```json
{ "success": true, "message": "Password reset successfully..." }
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Validation error |
| 400 | Password reset token is invalid or has expired |

> Reset tokens expire after **15 minutes**.

---

### GET `/api/auth/me` *(Protected)*

Returns the authenticated user's profile.

**Headers:** `Authorization: Bearer <access_token>`

**Success Response: `200 OK`**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": { "user": { "_id": "...", "name": "...", "email": "...", "role": "..." } }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 401 | You are not logged in |
| 401 | Invalid or expired access token |

---

### PUT `/api/auth/profile` *(Protected)*

Updates the authenticated user's name, email, or password.

**Request Body (all optional):**
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

> `currentPassword` is **required** if `newPassword` is provided.

**Success Response: `200 OK`**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "user": { ... } }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Email is already in use |
| 400 | Current password is incorrect |
| 400 | Current password is required to change password |

---

## 4. Authentication Flow

```
[REGISTER]
User fills form → POST /api/auth/register
→ Zod validates body
→ Check email not taken
→ Hash password (bcrypt, salt=10)
→ Create user in MongoDB
→ Generate Access Token (15m) + Refresh Token (7d)
→ Set HTTP-only cookies (accessToken, refreshToken)
→ Return user + accessToken in JSON

[LOGIN]
User fills form → POST /api/auth/login
→ Find user by email (password selected explicitly)
→ Compare password via bcrypt.compare()
→ Generate new Access + Refresh tokens
→ Set HTTP-only cookies
→ Return user + accessToken in JSON

[PROTECTED REQUEST]
Frontend Axios interceptor adds:
  Authorization: Bearer <accessToken>
→ protect middleware verifies JWT signature + expiry
→ Finds user in DB, attaches to req.user
→ Route handler executes normally

[TOKEN REFRESH]
Frontend receives 401 → Axios interceptor triggers
→ POST /api/auth/refresh-token (with refreshToken cookie)
→ Verify refresh JWT
→ Issue new access + refresh token pair
→ Update cookie + retry all queued requests

[FORGOT PASSWORD]
POST /api/auth/forgot-password
→ Find user by email (no leak if not found)
→ Generate crypto random token (SHA-256 hashed)
→ Store hash + 15min expiry in DB
→ Email plaintext token as URL query: /reset-password?token=<clear>

[RESET PASSWORD]
POST /api/auth/reset-password
→ Hash incoming token
→ Find user where hash matches + expiry > now
→ Set new hashed password, clear reset fields
→ User must log in again

[LOGOUT]
POST /api/auth/logout
→ Clear accessToken + refreshToken cookies
→ Frontend deletes localStorage token, clears user state
→ Redirect to /login
```

---

## 5. Environment Variables

Create a `.env` file in `backend/` with these values (see `.env.example`):

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | HTTP server port | `5000` |
| `MONGO_URL` | MongoDB connection URI | `mongodb://127.0.0.1:27017/acie` |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens | Strong random string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | Strong random string |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `7d` |
| `SMTP_HOST` | SMTP server hostname | `smtp.mailtrap.io` |
| `SMTP_PORT` | SMTP server port | `2525` |
| `SMTP_USER` | SMTP username / API key | Your SMTP username |
| `SMTP_PASS` | SMTP password | Your SMTP password |
| `SMTP_FROM` | Sender email address | `noreply@acie.ai` |
| `FRONTEND_URL` | Frontend URL for reset links | `http://localhost:5173` |

> ⚠️ Never commit `.env` to version control. It is included in `.gitignore`.

---

## 6. Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- (Optional) Mailtrap / Gmail SMTP for email testing

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
# → API running at http://localhost:5000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies (already done)
npm install

# Start dev server
npm run dev
# → UI running at http://localhost:5173
```

---

## 7. Security Notes

### Password Storage
- Passwords are **never stored in plaintext**.
- `bcrypt` with a **salt factor of 10** is used.
- The `password` field has `select: false` in Mongoose — it is never returned in API responses unless explicitly selected.

### Token Strategy
- **Access Token** (JWT, 15m): Short-lived, stored in `localStorage` on the frontend and sent via `Authorization: Bearer` header.
- **Refresh Token** (JWT, 7d): Long-lived, stored in an **HTTP-only, SameSite=lax, Secure (production)** cookie. Cannot be accessed via JavaScript.

### Reset Password Tokens
- Generated using `crypto.randomBytes(32)` — cryptographically secure.
- Only the **SHA-256 hash** of the token is stored in the database.
- The clear-text token is sent via email (or logged to console in dev).
- Tokens expire after **15 minutes**.

### Input Validation
- All request bodies are validated using **Zod schemas** before reaching controllers.
- Email normalization (lowercase + trim) is enforced at the validation layer.

### User Enumeration Protection
- The `forgot-password` endpoint always returns a generic 200 response regardless of whether the email exists in the database. This prevents attackers from discovering registered email addresses.

### CORS
- Configured to allow only `http://localhost:5173` (development frontend) with `credentials: true`.
- Update the `origin` value in `app.js` for production deployment.
