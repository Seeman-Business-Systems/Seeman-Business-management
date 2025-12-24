import { IsString, MaxLength, MinLength } from 'class-validator';

class PasswordResetValidator {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}

export default PasswordResetValidator