# Temp Service

Example NestJS service that uses auth-center for authentication.

## Features
- Public endpoints (no auth required)
- Protected endpoints (JWT auth from auth-center)
- Health check endpoint
- Swagger documentation

## Setup

1. Ensure auth-center is running on port 4100
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the service:
   ```bash
   npm run dev
   ```

## Endpoints

### Public Endpoints
- `GET /api/items` - List all items (no auth)
- `GET /api/items/:id` - Get item by ID (no auth)
- `GET /api/items/health/check` - Health check (no auth)

### Protected Endpoints (Requires JWT from auth-center)
- `GET /api/items/protected` - List items with user info (requires auth)
- `POST /api/items` - Create new item (requires auth)

## Testing

1. Register a user in auth-center:
   ```bash
   curl -X POST http://localhost:4100/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User",
       "password": "Password123!"
     }'
   ```

2. Copy the `accessToken` from the response

3. Test public endpoint:
   ```bash
   curl http://localhost:4200/api/items
   ```

4. Test protected endpoint:
   ```bash
   curl http://localhost:4200/api/items/protected \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

5. Test health check:
   ```bash
   curl http://localhost:4200/api/items/health/check
   ```

## Swagger Documentation
Visit `http://localhost:4200/docs` for interactive API documentation.
