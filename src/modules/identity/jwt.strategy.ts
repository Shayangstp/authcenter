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
      secretOrKey: readFileSync(configService.get<string>('auth.publicKeyPath', './keys/jwt-public.pem')),
      algorithms: ['RS256'],
      issuer: configService.get<string>('auth.issuer'),
      audience: configService.get<string>('auth.audience'),
    });
  }

  validate(payload: Record<string, unknown>) {
    return payload;
  }
}
