import { Injectable } from '@nestjs/common';
import RefreshToken from 'src/domain/tokens/refresh-token';

@Injectable()
abstract class RefreshTokenRepository {
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract findActiveByStaffId(staffId: number): Promise<RefreshToken[]>;
  abstract revoke(token: string): Promise<void>;
  abstract commit(refreshToken: RefreshToken): Promise<RefreshToken>;
}

export default RefreshTokenRepository;
