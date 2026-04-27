# Integration Example

This directory contains example code showing how downstream services should integrate with Auth Center.

## Files

- `example-auth-client.ts`: Reusable decorators for protecting endpoints with JWT, roles, and permissions
- `downstream-authorization.service.ts`: HTTP client for calling the authorization endpoint

## Usage in Downstream Service

### 1. Copy Public Key
Copy `keys/jwt-public.pem` from Auth Center to your service.

### 2. Configure JWT Verification
```typescript
JwtModule.register({
  publicKey: readFileSync('./keys/jwt-public.pem'),
  signOptions: { algorithm: 'RS256' },
});
```

### 3. Use Guards and Decorators
```typescript
import { ProtectedWithPermission, ProtectedWithRole } from './example-auth-client';

@Controller('posts')
export class PostsController {
  @Delete(':id')
  @ProtectedWithPermission('blog.post.delete')
  removePost() {
    return { ok: true };
  }

  @Post()
  @ProtectedWithRole('admin')
  createPost() {
    return { ok: true };
  }
}
```

### 4. Call Authorization Endpoint for Fine-Grained Checks
```typescript
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

## Authorization Models

- **RBAC**: Role-based. Checks if user has a role with the required permission.
- **ABAC**: Attribute-based. Evaluates dynamic rules like `user.id == resource.ownerId`.
- **PBAC**: Policy-based. Matches stored policies with conditions.
- **ACL**: Access control list. Direct resource-level permissions.
- **ReBAC**: Relationship-based. Checks user-resource relationships (e.g., org membership).

Each service can enable any combination of these models.
