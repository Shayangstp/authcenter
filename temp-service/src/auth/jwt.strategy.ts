import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { readFileSync } from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: readFileSync(configService.get<string>('JWT_PUBLIC_KEY_PATH', '../keys/jwt-public.pem')),
      algorithms: ['RS256'],
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
