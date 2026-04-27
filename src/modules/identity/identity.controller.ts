import { Body, Controller, Get, Ip, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { IdentityService } from './identity.service';

@ApiTags('Auth')
@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  @ApiOkResponse({ type: AuthResponseDto })
  register(@Body() payload: RegisterDto, @Ip() ipAddress: string): Promise<AuthResponseDto> {
    return this.identityService.register(payload, ipAddress);
  }

  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  login(
    @Body() payload: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<AuthResponseDto> {
    return this.identityService.login(payload, ipAddress, userAgent);
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(
    @Body() payload: RefreshTokenDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<AuthResponseDto> {
    return this.identityService.refreshToken(payload, ipAddress, userAgent);
  }

  @Post('logout')
  @ApiOkResponse({ schema: { example: { success: true } } })
  async logout(@Body() payload: LogoutDto): Promise<{ success: boolean }> {
    await this.identityService.logout(payload.refreshToken);
    return { success: true };
  }

  @Post('password-reset')
  @ApiBody({ schema: { example: { email: 'jane@example.com' } } })
  requestPasswordReset(@Body('email') email: string): Promise<{ message: string }> {
    return this.identityService.createPasswordResetToken(email);
  }

  @Post('verify-email/:userId')
  verifyEmail(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.identityService.verifyEmail(userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  listSessions(@CurrentUser() user: { sub: string }) {
    return this.identityService.listSessions(user.sub);
  }
}
