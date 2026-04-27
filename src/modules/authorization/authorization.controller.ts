import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizeDto } from './dto/authorize.dto';
import { AuthorizationService } from './authorization.service';

@ApiTags('Authorization')
@ApiBearerAuth()
@Controller()
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Post('authorize')
  @ApiOkResponse({ schema: { example: { allowed: true, reasons: ['RBAC:ALLOW'], evaluatedModels: ['RBAC'] } } })
  authorize(@Body() payload: AuthorizeDto) {
    return this.authorizationService.authorize(payload);
  }
}
