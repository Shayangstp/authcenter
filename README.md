# Auth Center

Centralized authentication and authorization for modern applications.

Auth Center is a NestJS service that gives your apps one place to handle:
- user registration, login, refresh, logout, and session tracking
- JWT token issuing with RS256 public/private keys
- multi-model authorization with RBAC, ABAC, PBAC, ACL, and ReBAC
- service registration so each app can enable only the access models it needs
- Redis caching and RabbitMQ event publishing for integration-friendly workflows

If you are building multiple apps or microservices and want one shared identity + authorization layer, this project is the control plane.

## Why this repo matters

Most teams start with auth inside each app, then end up duplicating:
- user login flows
- JWT signing and validation
- roles and permissions
- resource-level access checks
- per-service policy logic

Auth Center moves that logic into one backend so every application can:
- trust the same JWT issuer
- use the same user identity
- ask the same service for access decisions
- evolve from simple RBAC to fine-grained authorization without rebuilding from scratch

## What Auth Center does today

### Authentication
- register users with email, first name, last name, and password
- log users in and issue access + refresh tokens
- rotate refresh tokens
- revoke sessions on logout
- list active sessions for the logged-in user
- mark email as verified
- trigger a password reset event flow placeholder

### Authorization
- register an application or service and define its supported resources/actions
- enable one or more authorization models per service
- evaluate access through a shared `POST /api/authorize` endpoint
- short-circuit on the first model that allows access

### Infrastructure
- PostgreSQL for durable data
- Redis for caching and token/session helpers
- RabbitMQ for domain events
- Swagger UI for API exploration

## Authorization models supported

Auth Center supports multiple authorization strategies in one project:

| Model | Best for | How it works here |
| --- | --- | --- |
| RBAC | admin/editor/viewer style access | checks user roles against permissions like `blog.post.delete` |
| ABAC | owner-based or attribute-based rules | evaluates JEXL expressions such as `user.id == resource.ownerId` |
| PBAC | ordered policy rules | evaluates stored policies with `ALLOW` or `DENY` effect |
| ACL | resource-by-resource grants | checks explicit user permission entries on a resource |
| ReBAC | graph/relationship-based access | checks direct or organization-linked relationships |

The evaluation order follows the `enabledModels` array stored for each service.

## High-level architecture

```text
Client App / Frontend
        |
        v
 Your API / Service ------------------------------+
        |                                         |
        | verifies JWT with public key            |
        |                                         |
        +-----> Auth Center <---------------------+
                 |     |     |
                 |     |     +--> RabbitMQ events
                 |     +--------> Redis cache/session helpers
                 +--------------> PostgreSQL source of truth
```

Typical flow:
1. A user authenticates through Auth Center.
2. Auth Center returns RS256 JWTs.
3. Your app verifies the access token using Auth Center's public key.
4. Your app can enforce simple role/permission checks locally.
5. For fine-grained decisions, your app calls `POST /api/authorize`.

## Tech stack

- NestJS 10
- TypeORM
- PostgreSQL 16
- Redis 7
- RabbitMQ 3
- JWT with RS256
- Swagger / OpenAPI
- Jest

## Repository structure

```text
.
|-- src/
|   |-- modules/
|   |   |-- identity/          # register/login/refresh/logout/session flows
|   |   |-- authorization/     # shared authorize endpoint
|   |   |-- services/          # downstream app registration
|   |   |-- rbac/abac/pbac/... # access evaluation engines
|   |-- database/entities/     # TypeORM models
|   |-- integration-example/   # sample code for downstream services
|-- temp-service/              # demo service that consumes Auth Center JWTs
|-- docker-compose.yml         # Postgres, Redis, RabbitMQ
|-- .env.example               # local configuration template
```

## Quick start

### Prerequisites

Make sure you have:
- Node.js 20+
- npm
- Docker + Docker Compose
- OpenSSL

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

```bash
cp .env.example .env
```

The defaults are already wired for local Docker containers.

### 3) Start infrastructure

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:55432`
- Redis on `localhost:56379`
- RabbitMQ on `localhost:55672`
- RabbitMQ management UI on `http://localhost:55673`

### 4) Generate JWT keys

```bash
mkdir -p keys
openssl genrsa -out keys/jwt-private.pem 2048
openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
```

Auth Center signs tokens with the private key. Your other services verify tokens with the public key.

### 5) Prepare the database

Important: this repository currently does not ship committed migrations in `src/database/migrations`, while `.env.example` defaults `DB_SYNCHRONIZE=false`.

For a fresh local setup, use one of these approaches:

Option A: easiest for local development
```bash
# edit .env and set:
DB_SYNCHRONIZE=true
```
Then start the app once so TypeORM creates the tables automatically.

Option B: better for long-term team workflows
```bash
npm run migration:generate
npm run migration:run
```

Recommended local-first workflow:
1. set `DB_SYNCHRONIZE=true`
2. start the app once
3. if you want migration-driven development later, switch back to `false` and generate migrations

### 6) Start Auth Center

```bash
npm run dev
```

By default the service runs at:
- API base: `http://localhost:4100/api`
- Swagger docs: `http://localhost:4100/docs`

## Local end-to-end walkthrough

This section shows the full flow from zero to working integration.

### Step 1: Register a user

```bash
curl -X POST http://localhost:4100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "password": "StrongPassword123!"
  }'
```

Expected response shape:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 900
}
```

### Step 2: Log in

```bash
curl -X POST http://localhost:4100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }'
```

Save the returned `accessToken` and `refreshToken`.

### Step 3: Refresh tokens

```bash
curl -X POST http://localhost:4100/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Step 4: View sessions

```bash
curl http://localhost:4100/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 5: Register your application/service

Example: register a blog app that uses RBAC and ABAC.

```bash
curl -X POST http://localhost:4100/api/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "blog-service",
    "enabledModels": ["RBAC", "ABAC"],
    "resources": ["post", "comment"],
    "actions": ["create", "read", "update", "delete"]
  }'
```

### Step 6: Ask Auth Center for an authorization decision

```bash
curl -X POST http://localhost:4100/api/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "service": "blog-service",
    "resource": "post",
    "action": "update",
    "resourceId": "post-123",
    "context": {
      "resource": {
        "ownerId": "USER_ID",
        "status": "draft"
      },
      "user": {
        "plan": "pro"
      },
      "abacRules": [
        "user.id == resource.ownerId"
      ]
    }
  }'
```

Example response:

```json
{
  "allowed": true,
  "reasons": ["RBAC:MISS", "ABAC:ALLOW"],
  "evaluatedModels": ["RBAC", "ABAC"]
}
```

## API overview

### Authentication endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | create a user and immediately issue tokens |
| `POST` | `/api/auth/login` | authenticate and issue tokens |
| `POST` | `/api/auth/refresh` | rotate refresh token and issue a new pair |
| `POST` | `/api/auth/logout` | revoke the refresh token session |
| `POST` | `/api/auth/password-reset` | trigger password reset placeholder flow |
| `POST` | `/api/auth/verify-email/:userId` | mark a user email as verified |
| `GET` | `/api/auth/sessions` | list sessions for the authenticated user |

### Service registry endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/services/register` | create or update a downstream service configuration |
| `GET` | `/api/services` | list registered services |

### Authorization endpoint

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/authorize` | return an allow/deny decision with reasons |

### Documentation endpoint

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/docs` | interactive Swagger UI |

## Using Auth Center in your own app

There are two common integration patterns.

### Pattern 1: centralized authentication, local authorization

Use this when your app only needs to know who the user is and maybe check roles from the JWT.

How it works:
1. your frontend logs in against Auth Center
2. your backend receives the access token
3. your backend verifies the JWT with Auth Center's public key
4. your backend reads claims like `sub`, `email`, and `roles`

This is the simplest pattern for admin dashboards, internal tools, and APIs with coarse-grained access rules.

### Pattern 2: centralized authentication + centralized authorization

Use this when your app needs resource-aware access rules such as:
- only the owner can edit the post
- finance managers can approve invoices under a threshold
- organization members can access records linked to their org
- support agents can read but not mutate specific resource types

How it works:
1. your backend verifies the JWT locally
2. your backend builds an authorization payload
3. your backend calls `POST /api/authorize`
4. Auth Center evaluates the configured models and returns `allowed: true|false`

This is the best fit for multi-service systems.

## Integrating a NestJS app

The repo already includes examples in `src/integration-example/` and a working sample app in `temp-service/`.

### 1) Copy the public key into your app

Your downstream service needs the public key only:

```bash
cp keys/jwt-public.pem ../your-service/keys/jwt-public.pem
```

### 2) Configure JWT verification in your app

Example NestJS config:

```ts
JwtModule.register({
  publicKey: readFileSync('./keys/jwt-public.pem'),
  signOptions: { algorithm: 'RS256' },
  verifyOptions: { algorithms: ['RS256'] },
});
```

### 3) Protect routes with a JWT guard

The sample in `temp-service/src/auth/jwt.strategy.ts` shows the basic strategy shape.

Validated token payloads include:
- `sub` -> user id
- `email` -> user email
- `roles` -> role names assigned to the user

### 4) Call Auth Center for fine-grained checks

Example service-to-service call:

```ts
const result = await this.authService.authorize({
  userId: user.sub,
  service: 'blog-service',
  resource: 'post',
  action: 'update',
  resourceId: postId,
  context: {
    resource: { ownerId: post.ownerId, status: post.status },
    user: { plan: user.plan },
  },
});

if (!result.allowed) {
  throw new ForbiddenException('Access denied');
}
```

## Understanding permissions and naming

For RBAC, the permission naming convention used by the authorization engine is:

```text
{service}.{resource}.{action}
```

Example:

```text
blog-service.post.delete
```

That means if your service is `blog-service`, your resources include `post`, and your action is `delete`, then the RBAC permission that should exist is:

```text
blog-service.post.delete
```

## How each authorization model is evaluated

### RBAC

RBAC checks whether the user has a role for the target service, and whether that role contains the generated permission name.

Example permission strings:
- `blog-service.post.read`
- `blog-service.post.update`
- `billing-service.invoice.approve`

Data involved:
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`

### ABAC

ABAC evaluates one or more JEXL rules.

Default rule fallback in the current implementation:

```text
user.id == resource.ownerId
```

Useful payload example:

```json
{
  "context": {
    "resource": { "ownerId": "123", "status": "draft" },
    "abacRules": [
      "user.id == resource.ownerId",
      "resource.status == 'public'"
    ]
  }
}
```

Data involved:
- `user_attributes`
- `resource_attributes`
- request `context`

### PBAC

PBAC loads policies for a given `service + resource + action`, ordered by priority, and returns the effect of the first matching policy.

Data involved:
- `policies`

Example policy condition ideas:
- `user.department == 'finance' && resource.amount < 10000`
- `environment.ipAddress == '127.0.0.1'`

### ACL

ACL grants explicit permissions on a concrete resource.

Example meaning:
- user `u1` can `blog-service.post.update` on post `post-42`

Data involved:
- `acl_entries`

### ReBAC

ReBAC checks graph-like relationships.

Current implementation supports:
- direct user -> resource relationships
- user -> org -> resource chaining

Data involved:
- `relationships`

## Database model cheat sheet

These are the main tables you will care about when operating Auth Center:

| Table | Purpose |
| --- | --- |
| `users` | identity records |
| `sessions` | refresh-token-backed login sessions |
| `services` | registered downstream applications |
| `roles` | service-scoped roles |
| `permissions` | named permissions like `blog-service.post.update` |
| `role_permissions` | role-to-permission links |
| `user_roles` | user-to-role links |
| `policies` | PBAC rules |
| `acl_entries` | direct resource grants |
| `relationships` | subject/object graph links for ReBAC |
| `user_attributes` | ABAC user attributes |
| `resource_attributes` | ABAC resource attributes |
| `organizations` | tenant/org records |
| `memberships` | user membership in an organization |

## Example bootstrap data strategy

Right now this repo exposes API endpoints for:
- auth flows
- service registration
- authorization evaluation

It does not yet expose admin CRUD endpoints for roles, permissions, policies, ACL entries, relationships, or attributes.

So in the current version, most teams will bootstrap authorization data using one of these methods:
- direct SQL inserts
- a TypeORM seed script
- a small internal admin module added to this project
- migrations that insert baseline roles and permissions

A practical pattern is:
1. register the service through `/api/services/register`
2. create service roles and permissions in the database
3. assign users to roles
4. add PBAC/ACL/ReBAC/ABAC data only where needed

## Events you can build around

Auth Center publishes application events through RabbitMQ via the events module.

Current event usage in the codebase includes:
- `user.created`
- `user.updated`
- `service.registered`

You can use these events to:
- sync users into downstream read models
- trigger onboarding workflows
- invalidate service-side caches
- notify audit pipelines

## Environment variables

The main configuration lives in `.env`.

### App

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | runtime mode |
| `PORT` | `4100` | Auth Center HTTP port |
| `APP_NAME` | `auth-center` | app name |
| `API_PREFIX` | `api` | global API prefix |
| `CORS_ORIGIN` | `http://localhost:3000` | allowed frontend origin |
| `THROTTLE_TTL` | `60` | rate-limit window in seconds |
| `THROTTLE_LIMIT` | `30` | requests allowed per window |
| `COOKIE_DOMAIN` | `localhost` | cookie domain |
| `COOKIE_SECURE` | `false` | secure-cookie toggle |
| `LOG_LEVEL` | `debug` | desired log level |

### Database and cache

| Variable | Default |
| --- | --- |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `55432` |
| `DB_USERNAME` | `auth_center` |
| `DB_PASSWORD` | `auth_center` |
| `DB_NAME` | `auth_center` |
| `DB_SYNCHRONIZE` | `false` |
| `DB_LOGGING` | `false` |
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `56379` |
| `REDIS_PASSWORD` | empty |

### Messaging

| Variable | Default |
| --- | --- |
| `RABBITMQ_HOST` | `localhost` |
| `RABBITMQ_PORT` | `55672` |
| `RABBITMQ_USERNAME` | `auth_center` |
| `RABBITMQ_PASSWORD` | `auth_center` |
| `RABBITMQ_VHOST` | `/` |

### JWT

| Variable | Default | Description |
| --- | --- | --- |
| `JWT_PRIVATE_KEY_PATH` | `./keys/jwt-private.pem` | signing key |
| `JWT_PUBLIC_KEY_PATH` | `./keys/jwt-public.pem` | verification key |
| `JWT_ACCESS_TTL` | `900` | access token TTL in seconds |
| `JWT_REFRESH_TTL` | `604800` | refresh token TTL in seconds |
| `JWT_ISSUER` | `auth-center` | token issuer |
| `JWT_AUDIENCE` | `auth-clients` | token audience |

## Running the sample consumer app

A demo downstream service lives in `temp-service/`.

### Start it

```bash
cd temp-service
npm install
npm run dev
```

Default URL:
- API base: `http://localhost:4200/api`
- Swagger docs: `http://localhost:4200/docs`

### Try it

Public endpoint:

```bash
curl http://localhost:4200/api/items
```

Protected endpoint:

```bash
curl http://localhost:4200/api/items/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Create item:

```bash
curl -X POST http://localhost:4200/api/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook",
    "description": "Created through temp-service"
  }'
```

## Development commands

```bash
npm run dev              # start in watch mode
npm run build            # compile TypeScript
npm run start            # run compiled app
npm run lint             # lint source files
npm run test             # unit tests
npm run test:cov         # coverage
npm run migration:run    # run TypeORM migrations
npm run migration:revert # revert last migration
npm run db:drop          # drop schema
```

## Production notes

If you want to put this into a real production environment, these are the first things to tighten:
- protect `POST /api/services/register` with admin or service-to-service auth
- protect `POST /api/authorize` so only trusted services can call it
- move JWT keys into a secret manager
- replace local Docker credentials with managed infrastructure secrets
- use migration-driven schema management instead of `DB_SYNCHRONIZE=true`
- add audit logging and observability around auth decisions
- add admin CRUD APIs or back-office tooling for roles, policies, ACL, and relationships

## Current implementation notes

These details are important when integrating:
- Swagger is served at `/docs`, not `/api/docs`
- the `organizationSlug` field exists on register DTOs, but it is not currently used during user registration logic
- password reset currently publishes an event placeholder rather than completing a full reset-token lifecycle
- service registration and authorization endpoints are documented with bearer auth in Swagger, but they are not guarded in the current controller implementation

## Good fit for this project

Auth Center is a strong fit when you have:
- multiple apps that should trust the same identity system
- multiple APIs that need consistent authorization rules
- a roadmap from simple auth toward richer access control
- internal platforms, SaaS products, B2B admin tools, or microservice ecosystems

## Next evolution ideas

A great next phase for this repo would be:
- admin CRUD for roles, permissions, policies, ACL, relationships, and orgs
- service API keys or mTLS for machine-to-machine auth
- email verification tokens and password reset completion flow
- seed scripts for baseline demo data
- tenant-aware JWT claims
- audit trails for every authorization decision

## License

Add your preferred license before open-sourcing or wider internal distribution.
