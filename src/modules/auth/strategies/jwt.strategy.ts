import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';

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

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    const staff = await this.staff.findById(payload.sub);

    if (!staff) {
      throw new UnauthorizedException();
    }

    return staff; // This becomes req.user
  }
}

export default JwtStrategy;
