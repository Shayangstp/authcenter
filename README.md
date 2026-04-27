# Auth Center

Production-grade centralized authentication and authorization platform built with NestJS, TypeORM, PostgreSQL, Redis, and RabbitMQ.

## Features
- Centralized identity: register, login, refresh, logout, password reset, email verification, sessions, optional MFA hooks
- Multi-tenant accounts: users, organizations, tenants, memberships
- Pluggable authorization per service: RBAC, ABAC, PBAC, ACL, ReBAC
- Dynamic authorization engine that evaluates only enabled models per registered service
- JWT RS256 signing with public key verification support for downstream services
- Redis-backed cache/session/token blacklist primitives
- RabbitMQ event publishing for user, role, permission, policy, and service lifecycle changes
- Swagger docs at `/docs`

## Development
1. Start infrastructure:
   ```bash
   docker compose up -d
   ```
2. Generate RSA keys:
   ```bash
   mkdir -p keys
   openssl genrsa -out keys/jwt-private.pem 2048
   openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
   ```
3. Install dependencies and run migrations:
   ```bash
   npm install
   npm run migration:run
   ```
4. Start NestJS locally:
   ```bash
   npm run dev
   ```

## Main endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/services/register`
- `GET /api/services`
- `POST /api/authorize`
- `GET /docs`

## Example service configuration
```json
{
  "name": "trello-service",
  "enabledModels": ["RBAC", "ABAC"],
  "resources": ["board", "card"],
  "actions": ["create", "read", "update", "delete"]
}
```

## Notes
- Containers use non-default ports to avoid conflicts with local services.
- The NestJS app is intended to run locally with `npm run dev` while Redis/Postgres/RabbitMQ run in Docker Compose.
- The authorization engine is modular so additional authorization strategies can be added later.
