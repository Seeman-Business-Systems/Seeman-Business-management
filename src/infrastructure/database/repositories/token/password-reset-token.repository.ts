import { Injectable } from '@nestjs/common';
import PasswordResetToken from 'src/domain/tokens/password-reset-token';

@Injectable()
abstract class PasswordResetTokenRepository {
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;
  abstract findActiveByStaffId(staffId: number): Promise<PasswordResetToken | null>;
  abstract markAsUsed(token: string): Promise<void>;
  abstract invalidateAllForStaff(staffId: number): Promise<void>;
  abstract commit(token: PasswordResetToken): Promise<PasswordResetToken>;
}

export default PasswordResetTokenRepository;
