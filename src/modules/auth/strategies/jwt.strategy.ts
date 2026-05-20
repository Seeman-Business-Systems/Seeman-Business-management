import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';

interface JwtPayload {
  sub: number;
  phoneNumber: string;
  email: string | null;
  iat: number;
  exp: number;
  sessionId?: string;
  isImpersonation?: boolean;
}

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private staff: StaffRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_ACCESS_SECRET',
        'a8f5f167f44f4964e6c998dee827110c03e9c5b3a8c9e29e5c7c8a3f4b6d8e1f',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    const staff = await this.staff.findById(payload.sub);

    if (!staff) {
      throw new UnauthorizedException();
    }

    // The initial-password gate belongs at login, not on every request.
    // Re-checking it here breaks impersonation of seeded users (whose initial
    // password was never changed) and would silently invalidate live tokens
    // if an admin ever toggled the flag.

    // Single-session enforcement: a fresh login on another device rotates the
    // user's sessionId, so tokens minted before that login no longer match.
    // Skip for impersonation tokens — those intentionally don't carry the
    // impersonated user's sessionId and must not invalidate their real session.
    if (!payload.isImpersonation) {
      if (!payload.sessionId || payload.sessionId !== staff.getSessionId()) {
        throw new UnauthorizedException();
      }
    }

    return staff; // This becomes req.user
  }
}

export default JwtStrategy;
