import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { SessionEntity } from 'src/database/entities/session.entity';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { CacheLayerService } from '../cache/cache.service';
import { EventsService } from '../events/events.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity) private readonly sessionsRepository: Repository<SessionEntity>,
    @InjectRepository(UserRoleEntity) private readonly userRolesRepository: Repository<UserRoleEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheLayerService,
    private readonly eventsService: EventsService,
  ) {}

  async register(payload: RegisterDto, ipAddress?: string): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findOne({ where: { email: payload.email } });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        passwordHash: await argon2.hash(payload.password, { type: argon2.argon2id }),
        lastLoginIp: ipAddress,
      }),
    );

    await this.eventsService.publish('user.created', { userId: user.id, email: user.email });
    return this.issueTokens(user, ipAddress);
  }

  async login(payload: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({ where: { email: payload.email } });
    if (!user || !(await argon2.verify(user.passwordHash, payload.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled && !payload.otpCode) {
      throw new UnauthorizedException('MFA code is required');
    }

    await this.usersRepository.update(user.id, { lastLoginIp: ipAddress });
    return this.issueTokens(user, ipAddress, userAgent);
  }

  async refreshToken(payload: RefreshTokenDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const decoded = await this.jwtService.verifyAsync<{ sub: string; jti: string }>(payload.refreshToken);
    const isBlacklisted = await this.cacheService.get(`blacklist:${decoded.jti}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token is blacklisted');
    }

    const session = await this.sessionsRepository.findOne({ where: { refreshTokenId: decoded.jti }, relations: ['user'] });
    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session is invalid');
    }

    await this.cacheService.set(`blacklist:${session.refreshTokenId}`, true, 60 * 60 * 24 * 30);
    await this.sessionsRepository.update(session.id, { revoked: true });

    return this.issueTokens(session.user, ipAddress, userAgent);
  }

  async logout(refreshToken: string): Promise<void> {
    const decoded = await this.jwtService.verifyAsync<{ jti: string }>(refreshToken);
    await this.cacheService.set(`blacklist:${decoded.jti}`, true, 60 * 60 * 24 * 30);
    await this.sessionsRepository.update({ refreshTokenId: decoded.jti }, { revoked: true });
  }

  async createPasswordResetToken(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      await this.eventsService.publish('user.updated', { userId: user.id, reason: 'password_reset_requested' });
    }
    return { message: 'If the account exists, a reset token will be sent.' };
  }

  async verifyEmail(userId: string): Promise<{ message: string }> {
    await this.usersRepository.update(userId, { emailVerified: true });
    await this.eventsService.publish('user.updated', { userId, reason: 'email_verified' });
    return { message: 'Email verified successfully.' };
  }

  async listSessions(userId: string): Promise<SessionEntity[]> {
    return this.sessionsRepository.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  private async issueTokens(user: UserEntity, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const userRoles = await this.userRolesRepository.find({ where: { user: { id: user.id } }, relations: ['role'] });
    const jti = randomUUID();
    const accessTtl = this.configService.get<number>('auth.accessTtl', 900);
    const refreshTtl = this.configService.get<number>('auth.refreshTtl', 604800);

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      roles: userRoles.map((entry) => entry.role.name),
      org: undefined,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti,
        type: 'refresh',
      },
      { expiresIn: refreshTtl },
    );

    await this.sessionsRepository.save(
      this.sessionsRepository.create({
        user,
        refreshTokenId: jti,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      }),
    );

    await this.cacheService.set(`session:${user.id}:${jti}`, { active: true }, refreshTtl);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };
  }
}
