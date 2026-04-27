import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/modules/guards/permission.guard';
import { RolesGuard } from 'src/modules/guards/roles.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { RequireRole } from 'src/common/decorators/require-role.decorator';

export function ProtectedWithPermission(permission: string) {
  return applyDecorators(ApiBearerAuth(), RequirePermission(permission), UseGuards(JwtAuthGuard, PermissionGuard));
}

export function ProtectedWithRole(role: string) {
  return applyDecorators(ApiBearerAuth(), RequireRole(role), UseGuards(JwtAuthGuard, RolesGuard));
}

/*
Example usage in another NestJS service:

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

The downstream service should:
1. Verify JWTs with the public key from auth-center.
2. Reuse `JwtAuthGuard`, `RolesGuard`, `PermissionGuard`, and decorators.
3. Forward resource context to auth-center when fine-grained authorization is required.
*/
