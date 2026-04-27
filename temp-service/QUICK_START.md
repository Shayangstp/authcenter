# Temp Service - Quick Start Guide

## What This Service Does

This is a standalone NestJS microservice that demonstrates how to integrate with auth-center for authentication.

**Features:**
- ✅ Verifies JWT tokens issued by auth-center using the public key
- ✅ Public endpoints (no authentication)
- ✅ Protected endpoints (requires JWT from auth-center)
- ✅ Health check endpoint
- ✅ Swagger documentation at `/docs`

## Project Structure

```
temp-service/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts       # JWT verification setup
│   │   ├── jwt.strategy.ts      # Passport JWT strategy
│   │   └── jwt-auth.guard.ts    # Guard for protected routes
│   ├── items/
│   │   ├── items.controller.ts  # API endpoints
│   │   ├── items.service.ts     # Business logic
│   │   └── items.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── .env
└── README.md
```

## How to Run

### 1. Install Dependencies
```bash
cd temp-service
npm install
```

### 2. Start the Service
```bash
npm run dev
```

The service will start on `http://localhost:4200`

## API Endpoints

### Public Endpoints (No Auth Required)

**1. List all items**
```bash
curl http://localhost:4200/api/items
```

**2. Get item by ID**
```bash
curl http://localhost:4200/api/items/1
```

**3. Health check**
```bash
curl http://localhost:4200/api/items/health/check
```

### Protected Endpoints (Requires JWT)

**1. Get items with user info (Protected)**
```bash
curl http://localhost:4200/api/items/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**2. Create new item (Protected)**
```bash
curl -X POST http://localhost:4200/api/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "description": "Created via API"}'
```

## Complete Testing Flow

### Step 1: Register a user in auth-center
```bash
curl -X POST http://localhost:4100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "firstName": "Demo",
    "lastName": "User",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

### Step 2: Copy the accessToken

### Step 3: Test public endpoint (works without token)
```bash
curl http://localhost:4200/api/items
```

**Response:**
```json
{
  "message": "Public endpoint - no authentication required",
  "items": [
    {"id": 1, "name": "Item 1", "description": "First item"},
    {"id": 2, "name": "Item 2", "description": "Second item"},
    {"id": 3, "name": "Item 3", "description": "Third item"}
  ]
}
```

### Step 4: Test protected endpoint (requires token)
```bash
curl http://localhost:4200/api/items/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "message": "Protected endpoint - authentication required",
  "user": {
    "userId": "uuid-here",
    "email": "demo@example.com",
    "roles": []
  },
  "items": [...]
}
```

### Step 5: Test health check
```bash
curl http://localhost:4200/api/items/health/check
```

**Response:**
```json
{
  "status": "ok",
  "service": "temp-service",
  "timestamp": "2026-04-22T12:00:00.000Z",
  "message": "Service is running correctly"
}
```

## How Authentication Works

1. **User registers/logs in** to auth-center (port 4100)
2. **Auth-center issues JWT** signed with private key
3. **User sends JWT** to temp-service (port 4200) in `Authorization: Bearer TOKEN` header
4. **Temp-service verifies JWT** using auth-center's public key (`../keys/jwt-public.pem`)
5. **If valid**, request proceeds; **if invalid**, returns 401 Unauthorized

## Swagger Documentation

Visit `http://localhost:4200/docs` for interactive API documentation where you can:
- See all endpoints
- Test endpoints directly in the browser
- Add Bearer token for protected endpoints

## Key Files Explained

**`src/auth/jwt.strategy.ts`**
- Configures Passport to verify JWTs using auth-center's public key
- Extracts user info from JWT payload

**`src/auth/jwt-auth.guard.ts`**
- Guard that can be applied to any route with `@UseGuards(JwtAuthGuard)`
- Automatically validates JWT and rejects unauthorized requests

**`src/items/items.controller.ts`**
- Demonstrates both public and protected endpoints
- Shows how to access authenticated user info in protected routes

## Notes

- This service runs on port **4200** (auth-center runs on 4100)
- JWT public key is read from `../keys/jwt-public.pem` (shared with auth-center)
- No database needed - this is a simple demonstration service
- In production, you'd add proper error handling, logging, and business logic
